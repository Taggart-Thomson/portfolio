// Site copy for project pages (first person). The assistant's knowledge base lives in content/kb (third person).
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const projects = defineCollection({
  loader: glob({ pattern: "*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    kicker: z.string(),          // short label, e.g. "Operations tool"
    summary: z.string(),         // one line for the work list
    order: z.number(),
    where: z.string(),           // where it was built
    stack: z.array(z.string()),
    demo: z.enum(["guided", "diagram", "live", "none"]),
    demoNote: z.string(),
    status: z.string(),
  }),
});

export const collections = { projects };
