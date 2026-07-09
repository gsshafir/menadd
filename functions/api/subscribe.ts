type Env = {
  SUBSCRIBERS?: KVNamespace;
};

const successMessage = "You are in. Notes arrive when there is something worth sending.";
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function json(message: string, status: number) {
  return Response.json({ message }, { status });
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const form = await request.formData();
  const email = String(form.get("email") || "").trim().toLowerCase();
  const sourcePage = String(form.get("source_page") || "").trim() || "/";
  const honeypot = String(form.get("company") || "").trim();

  if (honeypot) {
    return json(successMessage, 200);
  }

  if (!emailPattern.test(email)) {
    return json("Please enter a valid email address.", 400);
  }

  if (!env.SUBSCRIBERS) {
    return json("Subscription storage is not configured yet.", 500);
  }

  const timestamp = new Date().toISOString();
  await env.SUBSCRIBERS.put(`subscriber:${email}`, JSON.stringify({ email, timestamp, source_page: sourcePage }));

  return json(successMessage, 200);
};

export const onRequestGet: PagesFunction = async () => json("Use the form to subscribe.", 405);
