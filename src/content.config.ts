import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "zod";

const articles = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/articles" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    section: z.enum(["ownership", "control", "structure", "cash", "process"]),
    date: z.coerce.date(),
    draft: z.boolean().default(false)
  })
});

export const collections = { articles };
