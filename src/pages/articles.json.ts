import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { categories } from '../data/categories';
import { authors } from '../data/authors';

export const GET: APIRoute = async () => {
  const allArticles = await getCollection('articles', ({ data }) => !data.draft);

  const categoryMap = new Map(categories.map((c) => [c.slug, c.name]));

  const data = allArticles.map((a) => ({
    slug: a.id,
    title: a.data.title,
    description: a.data.description,
    category: a.data.category,
    categoryName: categoryMap.get(a.data.category) || a.data.category,
    author: a.data.author,
    authorName: authors[a.data.author]?.name || a.data.author,
    authorAvatar: authors[a.data.author]?.avatar || '',
    publishDate: a.data.publishDate,
    wordCount: a.body ? a.body.split(/\s+/).length : 0,
  }));

  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
};
