import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishDate: z.string(),
    dateModified: z.string().optional(),
    author: z.string(),
    category: z.enum([
      'ai-tools',
      'workflows',
      'devops',
      'code-quality',
      'tools-tech',
      'productivity',
      'collaboration',
      'architecture',
      'career',
      'frontend',
      'backend',
      'open-source',
    ]),
    tags: z.array(z.string()),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    faqs: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
    primaryKeyword: z.string(),
  }),
});

export const collections = { articles };
