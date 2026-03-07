import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import fs from 'node:fs';
import path from 'node:path';

// Build a map of article URLs to their latest date (dateModified or publishDate)
const articlesDir = path.resolve('./src/content/articles');
const articleDates = new Map();

for (const file of fs.readdirSync(articlesDir)) {
  if (!file.endsWith('.md')) continue;
  const content = fs.readFileSync(path.join(articlesDir, file), 'utf-8');
  const fm = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fm) continue;

  const slug = file.replace('.md', '');
  const dateModified = fm[1].match(/dateModified:\s*"([^"]+)"/);
  const publishDate = fm[1].match(/publishDate:\s*"([^"]+)"/);
  const category = fm[1].match(/category:\s*"([^"]+)"/);

  const date = dateModified ? dateModified[1] : publishDate ? publishDate[1] : null;
  if (date && category) {
    articleDates.set(`https://crmbeat.com/${category[1]}/${slug}`, date);
  }
}

const buildDate = new Date().toISOString().split('T')[0];

export default defineConfig({
  site: 'https://crmbeat.com',
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/search'),
      serialize: (item) => {
        const articleDate = articleDates.get(item.url);
        item.lastmod = articleDate ? new Date(articleDate) : new Date(buildDate);
        return item;
      },
    }),
  ],
});
