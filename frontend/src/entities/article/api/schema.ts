import { z } from "zod";

export const articleKindSchema = z.enum(["standard", "code_3d", "til"]);

export const articleListItemSchema = z.object({
  slug: z.string(),
  locale: z.string(),
  kind: articleKindSchema,
  title: z.string(),
  excerpt: z.string(),
  reading_time: z.number(),
  published_at: z.string().nullable(),
  tags: z.array(z.string()),
});

export const articleDetailSchema = articleListItemSchema.extend({
  body_mdx: z.string(),
  scene: z.record(z.unknown()).nullable(),
  series: z.string().nullable(),
});
