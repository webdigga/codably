# Claude Code Instructions

## Blog Posts

### Blog quality guidelines
- **GSC research:** Before writing, check Google Search Console (90-day lookback) for keyword opportunities and content gaps. GSC site URL: `https://codably.dev/`
- **E-E-A-T:** Write with Google's E-E-A-T framework in mind (Experience, Expertise, Authoritativeness, Trustworthiness). Demonstrate first-hand experience where possible, cite credible sources, include author credentials, use accurate and up-to-date information, and avoid vague or unsubstantiated claims
- **Author:** Always include author where the format supports it
- **Schema:** Ensure the article has all correct structured data/schema markup
- **SEO/GEO/AEO:** Write with search, generative, and AI engine optimisation in mind
- **FAQs:** Include FAQ sections where possible (good for featured snippets and AEO)
- **Tables:** Use nicely styled tables for tabular data
- **SVG charts:** Create inline SVG charts/diagrams where applicable to visualise data
- **Internal linking:** Link to other pages/posts on the same site
- **External linking:** Link to authoritative external sources where relevant. External links must open in a new tab (`target="_blank" rel="noopener noreferrer"`) and include a small external link icon (e.g. `↗` or an SVG) so users know they are leaving the site. **Every external URL should be verified with a curl/fetch check (expecting a 200 status) before being added to an article.** If a URL returns a non-200 status, find a working alternative. If you cannot verify URLs (e.g. no network access), still include them but flag which ones were not verified so the user can check them.
- **UK English:** Use UK spelling throughout (colour, organised, centralised, etc.)
- **Heading hierarchy:** Proper H2 -> H3 nesting, never skip levels
- **Meta description:** The `description` frontmatter field is schema-validated with a **hard Zod limit of 160 characters** (`z.string().max(160)`). Exceeding this will fail the build. Always count characters before finalising. Include the primary keyword.
- **Short paragraphs:** Max 3-4 sentences, scannable with subheadings and bullet points
- **Primary keyword focus:** Each post should target a specific keyword/phrase
- **Strong opening:** Hook the reader and summarise the value in the first 2-3 sentences (helps with AI answer extraction for AEO)
- **Image dimensions:** No hero images on this site
- **Alt text:** Descriptive alt text on any SVGs/images for accessibility and SEO
- **Call to action:** Include a relevant call to action where natural
- **Reading time:** Calculate based on ~230 words per minute
- **No en/em dashes:** Never use en dashes (-) or em dashes (--) in blog content. Use commas, colons, semicolons, or rewrite the sentence instead
- **Repo structure:** Always check an existing post in this repo before writing a new one
- **Topic overlap:** Before proposing new article topics, list all existing article filenames and scan for overlap. Never propose a topic that already has a published article
- **Topical content:** Where possible, make blog content topical. If there is a big event or something notable in the calendar in the forthcoming days or weeks, reference it in the blog. This will not always be possible, so only do this when it makes sense. Always confirm the current date before referencing upcoming events — do not assume or guess the date.

## CSS
- **Mobile first:** All CSS must be mobile first. Never use `max-width` media queries. Use `min-width` only.

## Astro + Cloudflare Pages
- ALWAYS set `build: { format: 'file' }` and `trailingSlash: 'never'` in astro.config.mjs

## What You Can Do
- Read and edit code
- Run development servers and tests
- Search and explore the codebase
- Provide guidance and suggestions

---

# Codably

Static editorial site covering developer productivity, tooling, and workflows.
**URL:** https://codably.dev
**Stack:** Astro (static), Cloudflare Pages, Cloudflare Pages Functions + KV (votes/comments API)

## Content
- **Articles:** 53 articles across 12 categories
- **Categories:** AI Tools, Workflows, DevOps, Code Quality, Tools & Tech, Productivity, Collaboration, Architecture, Career, Frontend, Backend, Open Source
- **Authors:** David White (Editor, Codably), Jonny Rowse (Editor, Codably), Gareth Clubb (Editor, Codably), Zubair Hasan (Editor, Codably). Aim for a rough split across articles when writing new batches.
- **publishDate:** Never set `publishDate` to a future date. Articles appear on the live site immediately after deploy, so a future date looks wrong to readers. Always use today's date or earlier.
- **dateModified:** Roughly 25% of articles should have a `dateModified` frontmatter field with a date later than `publishDate`. This displays an "Updated" label in the article meta. When writing a batch of new articles, add `dateModified` to ~1 in 4. Only add it when the date genuinely differs from `publishDate`.

## Key Files
- `astro.config.mjs` - Astro config (static, trailingSlash: never, format: file)
- `src/content.config.ts` - Content collection schema
- `src/data/categories.ts` - 12 category definitions
- `src/data/authors.ts` - Author data
- `src/layouts/ArticleLayout.astro` - Article page layout
- `src/pages/[...page].astro` - Paginated homepage (9 per page)
- `src/pages/[category]/[...page].astro` - Paginated category pages (9 per page)
- `src/pages/[category]/[slug].astro` - Article pages
- `src/pages/tags.astro` - Tag index page
- `src/pages/tag/[tag]/[...page].astro` - Paginated tag pages
- `src/pages/search.astro` - Client-side search page
- `src/pages/articles.json.ts` - Static JSON endpoint (used by homepage popular sections)
- `src/components/Banner.astro` - Implera banner ad
- `src/components/NewsletterButton.astro` - Newsletter signup (Kabooly CRM form iframe, form ID 17)

## Article Generation
Create markdown files with correct frontmatter directly in `src/content/articles/`.

### Internal links
Article URLs follow the pattern `/{category}/{slug}` where slug = filename (minus `.md`) and category = the `category` frontmatter field of the **target** article.

**CRITICAL: Always `grep` or read the target article's frontmatter to confirm its `category` before writing the link. Never guess the category from the article title or topic. Guessing will produce broken links. This is a hard requirement, not a suggestion.**

## Brand
- **Brand colour:** Pink #ec4899 (hover: #db2777)
- **Site name display:** codably.dev (with "bly" in brand pink)
- **Implera banner:** Purple #6366f1 with Implera logo

## Design
- Custom CSS design system (no Tailwind)
- Light/dark mode with system preference detection
- Mobile-first responsive design
- Inter font via Google Fonts
- No hero images

## Features
- Pagination (9 articles per page) on homepage and category pages
- Client-side search with build-time JSON index
- RSS feed at /rss.xml
- JSON-LD schema (Article, FAQPage, BreadcrumbList, WebSite, Organization, SearchAction)
- Sitemap via @astrojs/sitemap (/search excluded)
- Table of contents for articles with 4+ headings
- FAQ accordion sections
- Share buttons (Copy Link, X, LinkedIn)
- Feedback buttons (thumbs up/down) via Cloudflare KV
- Comments system via Cloudflare KV
- Related articles by category and shared tags
- Tags system with paginated tag pages
- Reading progress bar
- Newsletter signup via Kabooly CRM form (form ID 17)

## APIs (Cloudflare Pages Functions + KV)

### Votes
- `functions/api/votes.ts` - GET/POST `/api/votes`
- KV namespace `codably-votes`, bound as `VOTES`

### Comments
- `functions/api/comments.ts` - GET/POST `/api/comments`
- Honeypot + IP rate limiting spam prevention
- Reuses `VOTES` KV binding with `comments:` key prefix

### Stats
- `functions/api/stats.ts` - GET `/api/stats`
- Returns comment counts and vote counts for homepage popular sections

## Important Architecture Notes
- `ArticleCard.astro` uses `<style is:global>` for dynamically created cards. Do NOT change to scoped styles.
- `articles.json.ts` is a static build-time endpoint used by homepage popular sections.

## Status: Live
Ongoing content updates.
