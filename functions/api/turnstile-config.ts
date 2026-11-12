export const onRequestGet: PagesFunction<PagesEnv> = async ({ env }) => {
  if (!env.PUBLIC_TURNSTILE_SITE_KEY) {
    return Response.json({ message: "Turnstile is not configured." }, { status: 503 });
  }

  return Response.json(
    { siteKey: env.PUBLIC_TURNSTILE_SITE_KEY },
    { headers: { "Cache-Control": "public, max-age=3600" } }
  );
};
