import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(160),
    publishDate: z.string(),
    author: z.string(),
    category: z.enum([
      'getting-started',
      'sales-pipeline',
      'client-retention',
      'marketing-automation',
      'business-growth',
      'industry-tips',
      'data-reporting',
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
