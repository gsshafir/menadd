import { getCollection } from "astro:content";
import { sections, site } from "../data";

export async function GET() {
  const articles = await getCollection("articles", ({ data }) => !data.draft);
  const paths = [
    "/",
    "/library/",
    ...sections.map((section) => section.href),
    "/assessment/",
    "/about/",
    "/notes/",
    "/privacy/"
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url><loc>${new URL(path, site.url).toString()}</loc></url>`).join("\n")}
${articles
  .map((article) => {
    const path = `/library/${article.data.section}/${article.id}/`;
    const lastmod = (article.data.updated ?? article.data.date).toISOString();
    return `  <url><loc>${new URL(path, site.url).toString()}</loc><lastmod>${lastmod}</lastmod></url>`;
  })
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml"
    }
  });
}
