type EnquiryType = "founder" | "investor" | "other";

type Enquiry = {
  type: EnquiryType;
  name: string;
  email: string;
  company: string;
  role: string;
  stage: string;
  capital: string;
  revenue: string;
  situation: string;
  entities: string;
  lookingFor: string;
  introducedBy: string;
  fund: string;
  portfolioNeed: string;
  submittedAt: string;
};

type TurnstileResult = {
  success: boolean;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const enquiryTtl = 60 * 60 * 24 * 30;
const rateLimitTtl = 60 * 60;
const rateLimitMaximum = 5;

function json(body: Record<string, unknown>, status = 200) {
  return Response.json(body, { status });
}

function value(form: FormData, name: string) {
  return String(form.get(name) || "").trim();
}

function validate(form: FormData) {
  const errors: Record<string, string> = {};
  const type = value(form, "type");

  if (!(["founder", "investor", "other"] as string[]).includes(type)) errors.type = "Select one option.";
  if (!value(form, "name")) errors.name = "Name is required.";
  if (!emailPattern.test(value(form, "email"))) errors.email = "Enter a valid email address.";
  if (!value(form, "company")) errors.company = "Company and website is required.";
  if (!value(form, "situation")) errors.situation = "This field is required.";

  if (type === "founder") {
    if (!value(form, "stage")) errors.stage = "Stage is required.";
    if (!value(form, "capital")) errors.capital = "Capital raised to date is required.";
    if (!value(form, "revenue")) errors.revenue = "Revenue is required.";
  }

  if (type === "investor") {
    if (!value(form, "fund")) errors.fund = "Fund or firm is required.";
    if (!value(form, "portfolioNeed")) errors.portfolioNeed = "This field is required.";
  }

  return errors;
}

function makeEnquiry(form: FormData): Enquiry {
  return {
    type: value(form, "type") as EnquiryType,
    name: value(form, "name"),
    email: value(form, "email").toLowerCase(),
    company: value(form, "company"),
    role: value(form, "role"),
    stage: value(form, "stage"),
    capital: value(form, "capital"),
    revenue: value(form, "revenue"),
    situation: value(form, "situation"),
    entities: value(form, "entities"),
    lookingFor: value(form, "lookingFor"),
    introducedBy: value(form, "introducedBy"),
    fund: value(form, "fund"),
    portfolioNeed: value(form, "portfolioNeed"),
    submittedAt: new Date().toISOString()
  };
}

function subjectFor(enquiry: Enquiry) {
  const stage = enquiry.stage || "n/a";
  const capital = enquiry.capital || "n/a";
  const revenue = enquiry.revenue || "n/a";
  const introducedBy = enquiry.introducedBy || "not provided";
  return `[MENADD] ${enquiry.type} · ${enquiry.company} · ${stage} · raised ${capital} · revenue ${revenue} · intro: ${introducedBy}`;
}

function messageFor(enquiry: Enquiry) {
  return [
    `I am: ${enquiry.type}`,
    `Name: ${enquiry.name}`,
    `Email: ${enquiry.email}`,
    `Company and website: ${enquiry.company}`,
    `Your role: ${enquiry.role || "Not provided"}`,
    `Stage: ${enquiry.stage || "Not applicable"}`,
    `Capital raised to date: ${enquiry.capital || "Not applicable"}`,
    `Revenue, last 12 months: ${enquiry.revenue || "Not applicable"}`,
    `Fund or firm: ${enquiry.fund || "Not applicable"}`,
    `The portfolio company and what it needs: ${enquiry.portfolioNeed || "Not applicable"}`,
    `What is in front of you, and by when: ${enquiry.situation}`,
    `Entities and jurisdictions today: ${enquiry.entities || "Not provided"}`,
    `What you are looking for: ${enquiry.lookingFor || "Not provided"}`,
    `Introduced by: ${enquiry.introducedBy || "Not provided"}`,
    `Submitted at: ${enquiry.submittedAt}`
  ].join("\n\n");
}

async function verifyTurnstile(token: string, secret: string, clientIp?: string) {
  const body = new FormData();
  body.set("secret", secret);
  body.set("response", token);
  if (clientIp) body.set("remoteip", clientIp);

  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    body
  });

  if (!response.ok) return false;
  const result = (await response.json()) as TurnstileResult;
  return result.success;
}

async function sendEmail(enquiry: Enquiry, apiKey: string) {
  return fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: "MENADD Enquiries <enquiries@menadd.com>",
      to: ["gennady@menadd.com"],
      reply_to: enquiry.email,
      subject: subjectFor(enquiry),
      text: messageFor(enquiry)
    })
  });
}

export const onRequestPost: PagesFunction<PagesEnv> = async ({ request, env }) => {
  let form: FormData;

  try {
    form = await request.formData();
  } catch {
    return json({ message: "The form could not be read." }, 400);
  }

  if (value(form, "website")) return json({ ok: true });

  const errors = validate(form);
  if (Object.keys(errors).length) return json({ message: "Check the marked fields.", errors }, 400);

  if (!env.ENQUIRIES || !env.TURNSTILE_SECRET_KEY || !env.RESEND_API_KEY) {
    console.error("Enquiry service configuration is incomplete");
    return json({ message: "The form is unavailable. Please try again later." }, 503);
  }

  const clientIp = request.headers.get("CF-Connecting-IP")?.trim();
  const token = value(form, "cf-turnstile-response");
  if (!token || !(await verifyTurnstile(token, env.TURNSTILE_SECRET_KEY, clientIp))) {
    return json({ message: "Please complete the security check." }, 400);
  }

  const rateLimitKey = clientIp ? `ratelimit:${clientIp}` : null;
  if (rateLimitKey) {
    const count = Number((await env.ENQUIRIES.get(rateLimitKey)) || "0");
    if (count >= rateLimitMaximum) {
      return json({ message: "Too many submissions. Please try again later." }, 429);
    }
    await env.ENQUIRIES.put(rateLimitKey, String(count + 1), { expirationTtl: rateLimitTtl });
  }

  const enquiry = makeEnquiry(form);
  const id = crypto.randomUUID();

  try {
    await env.ENQUIRIES.put(`enquiry:${enquiry.submittedAt}:${id}`, JSON.stringify(enquiry), {
      expirationTtl: enquiryTtl
    });
  } catch {
    console.error("Enquiry storage failed");
    return json({ message: "The form could not be sent. Please try again." }, 500);
  }

  try {
    const emailResponse = await sendEmail(enquiry, env.RESEND_API_KEY);
    if (!emailResponse.ok) console.error("Resend delivery failed", emailResponse.status);
  } catch {
    console.error("Resend delivery failed");
  }

  return json({ ok: true });
};

export const onRequestGet: PagesFunction = async () => json({ message: "Use the enquiry form." }, 405);
