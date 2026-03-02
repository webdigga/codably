#!/usr/bin/env node

import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ARTICLES_DIR = join(__dirname, '..', 'src', 'content', 'articles');

const CATEGORIES = [
  'getting-started',
  'sales-pipeline',
  'client-retention',
  'marketing-automation',
  'business-growth',
  'industry-tips',
  'data-reporting',
];

const apiKey = process.env.ANTHROPIC_API_KEY;
if (!apiKey) {
  console.error('Error: ANTHROPIC_API_KEY environment variable is required.');
  process.exit(1);
}

const topic = process.argv.slice(2).join(' ').trim();
if (!topic) {
  console.error('Usage: node scripts/generate-article.mjs "Your article topic here"');
  console.error('Example: node scripts/generate-article.mjs "How to Use CRM Tags Effectively"');
  process.exit(1);
}

const client = new Anthropic();

const systemPrompt = `You are a content writer for CRM Beat (crmbeat.com), an editorial site about CRM strategy for small UK businesses. The editor is David White, founder of Kabooly CRM.

STRICT RULES:
- Write in UK English (colour, organised, centralised, etc.)
- NEVER use en dashes or em dashes. Use commas, colons, semicolons, or rewrite sentences instead.
- Write 800-1200 words (body only, excluding frontmatter)
- Use proper heading hierarchy: H2 then H3, never skip levels
- Short paragraphs: max 3-4 sentences
- Include 2-4 FAQs at the end in the frontmatter format
- Include tables where they add value
- Write with Google E-E-A-T in mind: demonstrate experience, expertise, authority, trustworthiness
- Strong opening: hook the reader and summarise value in the first 2-3 sentences
- Target a specific primary keyword
- Meta description under 160 characters including the primary keyword
- No fluff, no jargon, no filler content
- Practical, actionable advice grounded in real experience
- Address the reader as "you" (small UK business owner)

OUTPUT FORMAT:
Return ONLY the complete markdown file with frontmatter. The frontmatter must include:
- title (string)
- description (max 160 chars)
- publishDate (today's date in YYYY-MM-DD format)
- author: "david-white"
- category (one of: ${CATEGORIES.join(', ')})
- tags (array of 2-4 relevant tags)
- featured: false
- draft: false
- faqs (array of 2-4 objects with question and answer fields)
- primaryKeyword (string)

Choose the most appropriate category based on the topic.`;

console.log(`Generating article: "${topic}"...`);

try {
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Write an article about: ${topic}

Today's date is ${new Date().toISOString().split('T')[0]}.

Return the complete markdown file with frontmatter. Do not wrap in code fences.`,
      },
    ],
  });

  const content = message.content[0].text;

  // Extract title for filename
  const titleMatch = content.match(/^title:\s*"(.+)"/m);
  const title = titleMatch ? titleMatch[1] : topic;

  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const filePath = join(ARTICLES_DIR, `${slug}.md`);
  writeFileSync(filePath, content, 'utf-8');

  // Calculate reading time
  const bodyText = content.replace(/^---[\s\S]*?---/, '').trim();
  const wordCount = bodyText.split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 230));

  console.log(`Article saved: ${filePath}`);
  console.log(`Words: ~${wordCount} | Reading time: ~${readingTime} min`);
  console.log(`Slug: ${slug}`);
} catch (error) {
  console.error('Error generating article:', error.message);
  process.exit(1);
}
