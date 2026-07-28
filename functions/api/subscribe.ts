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

  const clientIp = request.headers.get("CF-Connecting-IP")?.trim();
  const rateLimitKey = clientIp ? `ratelimit:${clientIp}` : null;
  let rateLimitCount: number | null = null;

  if (rateLimitKey) {
    try {
      const storedCount = await env.SUBSCRIBERS.get(rateLimitKey);
      rateLimitCount = Number(storedCount || "0");

      if (rateLimitCount >= 5) {
        return json("Too many requests. Please try again later.", 429);
      }
    } catch {
      rateLimitCount = null;
    }
  }

  const timestamp = new Date().toISOString();
  await env.SUBSCRIBERS.put(`subscriber:${email}`, JSON.stringify({ email, timestamp, source_page: sourcePage }));

  if (rateLimitKey && rateLimitCount !== null) {
    try {
      await env.SUBSCRIBERS.put(rateLimitKey, String(rateLimitCount + 1), { expirationTtl: 3600 });
    } catch {
      // Rate limiting fails open so storage issues do not block a valid subscription.
    }
  }

  return json(successMessage, 200);
};

export const onRequestGet: PagesFunction = async () => json("Use the form to subscribe.", 405);
