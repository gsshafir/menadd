# MENADD

Static Astro site for MENADD.com, hosted on Cloudflare Pages.

## Add a new article

Drop one markdown file into `src/content/articles/`.

The filename becomes the URL slug. For example:

```txt
src/content/articles/new-diligence-note.md
```

Required frontmatter:

```md
---
title: "Article Title"
description: "Meta description shown on library pages and in SEO tags."
section: ownership
date: 2026-07-09
draft: false
---
```

Allowed `section` values are `ownership`, `control`, `structure`, `cash`, and `process`.

The article will automatically appear in the library and at:

```txt
/library/[section]/[filename-slug]/
```

## Run locally

```bash
pnpm install
pnpm run dev
```

## Build

```bash
pnpm run build
```

## Deploy

Cloudflare Pages is connected to the GitHub repository and deploys automatically on every push to `main`.

```bash
git add .
git commit -m "Update MENADD site"
git push origin main
```

## Subscribe form

The subscribe form posts to `/api/subscribe`, a Cloudflare Pages Function. It expects a KV binding named `SUBSCRIBERS` and stores:

```json
{
  "email": "reader@example.com",
  "timestamp": "2026-07-09T00:00:00.000Z",
  "source_page": "/notes/"
}
```

Replace the KV namespace IDs and Cloudflare Web Analytics token before production launch.
