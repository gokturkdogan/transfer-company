import { z } from "zod";

export const blogSectionSchema = z.object({
  title: z.string().trim().min(1).max(200),
  paragraphs: z.array(z.string().trim().min(1).max(4000)).min(1),
});

export const blogFaqItemSchema = z.object({
  question: z.string().trim().min(1).max(300),
  answer: z.string().trim().min(1).max(4000),
});

export const blogLocaleContentSchema = z.object({
  title: z.string().trim().min(1).max(200),
  metaDescription: z.string().trim().min(1).max(320),
  excerpt: z.string().trim().min(1).max(500),
  readingMinutes: z.number().int().min(1).max(120),
  intro: z.string().trim().min(1).max(4000),
  pullQuote: z.string().trim().max(1000).optional(),
  coverImageAlt: z.string().trim().min(1).max(255),
  sections: z.array(blogSectionSchema).min(1),
  tips: z.array(z.string().trim().min(1).max(500)).optional(),
  faq: z.array(blogFaqItemSchema).optional(),
});

export type BlogSectionInput = z.infer<typeof blogSectionSchema>;
export type BlogFaqItemInput = z.infer<typeof blogFaqItemSchema>;
export type BlogLocaleContentInput = z.infer<typeof blogLocaleContentSchema>;
