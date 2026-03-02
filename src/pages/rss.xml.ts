import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const articles = await getCollection('articles', ({ data }) => !data.draft);
  const sorted = articles.sort(
    (a, b) => new Date(b.data.publishDate).getTime() - new Date(a.data.publishDate).getTime()
  );

  return rss({
    title: 'CRM Beat',
    description: 'Practical CRM strategy for small UK businesses.',
    site: context.site!.href,
    items: sorted.map((article) => ({
      title: article.data.title,
      description: article.data.description,
      pubDate: new Date(article.data.publishDate),
      link: `/${article.data.category}/${article.id}`,
      categories: [article.data.category, ...article.data.tags],
    })),
    customData: '<language>en-gb</language>',
  });
}
