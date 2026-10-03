import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Migrated WordPress posts keep their original HTML body (format: html).
// New posts are written in Markdown (format omitted or "markdown") and must set `path`.
const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    path: z.string().regex(/^\/\d{4}\/\d{2}\/\d{2}\/[^/]+\/$/, 'path must look like /YYYY/MM/DD/slug/'),
    wpId: z.number().optional(),
    categories: z.array(z.string()).default([]),
    tags: z.array(z.string()).default([]),
    featuredImage: z.string().optional(),
    excerpt: z.string().optional(),
    format: z.enum(['html', 'markdown']).default('markdown'),
    draft: z.boolean().default(false),
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    modified: z.coerce.date().optional(),
    path: z.string(),
    wpId: z.number().optional(),
    format: z.enum(['html', 'markdown']).default('markdown'),
  }),
});

export const collections = { posts, pages };
