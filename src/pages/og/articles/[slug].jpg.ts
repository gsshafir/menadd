import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import { sections } from "../../../data";
import { createArticleOg } from "../../../lib/og";

export const prerender = true;

export const getStaticPaths = (async () => {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  return articles.map((article) => ({
    params: { slug: article.id },
    props: {
      title: article.data.title,
      section: sections.find((item) => item.key === article.data.section)?.title ?? article.data.section
    }
  }));
}) satisfies GetStaticPaths;

export const GET: APIRoute = async ({ props }) => {
  const image = await createArticleOg(String(props.section), String(props.title));
  return new Response(new Uint8Array(image), {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  });
};
