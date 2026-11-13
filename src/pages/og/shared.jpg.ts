import type { APIRoute } from "astro";
import { createSharedOg } from "../../lib/og";

export const prerender = true;

export const GET: APIRoute = async () => {
  const image = await createSharedOg();
  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
