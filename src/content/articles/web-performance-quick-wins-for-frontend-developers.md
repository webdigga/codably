---
title: "Web Performance Quick Wins for Frontend Developers"
description: "Practical web performance quick wins for frontend developers, covering images, fonts, JavaScript, CSS, and Core Web Vitals."
publishDate: "2026-02-13"
author: "gareth-clubb"
category: "frontend"
tags: ["web-performance", "frontend", "core-web-vitals", "optimisation", "javascript"]
featured: false
draft: false
faqs:
  - question: "What are Core Web Vitals?"
    answer: "Core Web Vitals are Google's metrics for measuring real-world user experience. They include Largest Contentful Paint (LCP), which measures loading performance; Interaction to Next Paint (INP), which measures responsiveness; and Cumulative Layout Shift (CLS), which measures visual stability."
  - question: "How do I measure my site's performance?"
    answer: "Use a combination of lab tools and field data. Lighthouse and Chrome DevTools provide lab measurements. Google's CrUX report, PageSpeed Insights, and real user monitoring (RUM) tools like SpeedCurve or Vercel Analytics provide field data from actual users. Field data is more representative of real performance."
  - question: "Does page speed actually affect SEO?"
    answer: "Yes. Google uses Core Web Vitals as a ranking signal. While content relevance remains the primary factor, two pages with similar content quality will see the faster page rank higher. Performance also affects bounce rate and engagement, which indirectly influence rankings."
  - question: "Should I lazy load all images?"
    answer: "No. Lazy load images that are below the fold (not visible when the page first loads). Images above the fold, especially your LCP image, should load eagerly with high fetch priority to avoid delaying the largest contentful paint."
  - question: "How much JavaScript is too much?"
    answer: "There is no universal threshold, but as a guideline, aim for under 200KB of compressed JavaScript for initial page load. Use bundle analysis tools to identify large dependencies. Every kilobyte of JavaScript must be downloaded, parsed, and executed, making it the most expensive resource type per byte."
primaryKeyword: "web performance quick wins"
---

A slow website is a leaking bucket. Every 100 milliseconds of additional load time costs you conversions, engagement, and search rankings. <a href="https://web.dev/performance/" target="_blank" rel="noopener noreferrer">Google's own research ↗</a> shows that as page load time goes from 1 to 3 seconds, the probability of bounce increases by 32%.

The good news is that the biggest performance gains often come from the simplest changes. You do not need a complete rewrite or a new framework. In my experience, the quick wins outlined here can deliver a 40 to 60% improvement in load times for most sites. These are practical, high-impact improvements you can ship this week.

## Images: The Biggest Opportunity

Images account for the majority of page weight on most websites. Optimising them is almost always the single highest-impact change you can make.

### Use Modern Formats

WebP and AVIF offer significantly better compression than JPEG and PNG. A typical image converted from JPEG to WebP is 25 to 35% smaller with no visible quality loss. AVIF pushes this further, often achieving 50% savings over JPEG.

Use the `<picture>` element to serve modern formats with fallbacks:

```html
<picture>
  <source srcset="hero.avif" type="image/avif">
  <source srcset="hero.webp" type="image/webp">
  <img src="hero.jpg" alt="Hero image" width="1200" height="600">
</picture>
```

### Specify Dimensions

Always include `width` and `height` attributes on your `<img>` tags. Without them, the browser does not know how much space to reserve, causing layout shifts when the image loads. This directly impacts your CLS (Cumulative Layout Shift) score.

```html
<!-- Bad: causes layout shift -->
<img src="photo.webp" alt="Team photo">

<!-- Good: browser reserves space -->
<img src="photo.webp" alt="Team photo" width="800" height="400">
```

### Responsive Images with srcset

Serve appropriately sized images for each device. A mobile user on a 375px-wide screen should not download a 2000px-wide hero image.

```html
<img
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 600px) 400px, (max-width: 1000px) 800px, 1200px"
  src="hero-800.webp"
  alt="Product showcase"
  width="1200"
  height="600"
>
```

### Prioritise Your LCP Image

Your Largest Contentful Paint element is often a hero image. Give it loading priority:

```html
<img src="hero.webp" alt="Hero banner" fetchpriority="high" loading="eager">
```

Use `loading="lazy"` for images below the fold, but never on your LCP image.

## Image Format Comparison

| Format | Compression | Browser Support | Best For | Typical Size Saving vs JPEG |
|---|---|---|---|---|
| JPEG | Lossy | Universal | Photographs, complex images | Baseline |
| PNG | Lossless | Universal | Transparency, icons, screenshots | N/A (larger for photos) |
| WebP | Lossy + lossless | 97%+ browsers | General purpose replacement | 25 to 35% smaller |
| AVIF | Lossy + lossless | 92%+ browsers | Maximum compression | 40 to 50% smaller |
| SVG | Vector | Universal | Icons, logos, illustrations | N/A (resolution-independent) |

## Fonts: The Silent Performance Killer

Custom fonts can silently add seconds to your page load if not handled carefully.

### Use font-display: swap

This tells the browser to show text immediately using a system font, then swap in the custom font once it has loaded. Without this, users may see invisible text (FOIT) while the font downloads.

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap;
}
```

### Preload Critical Fonts

If you know which font file the page needs, preload it so the browser starts downloading it before it encounters the CSS rule:

```html
<link rel="preload" href="/fonts/custom.woff2" as="font" type="font/woff2" crossorigin>
```

Only preload fonts that are used above the fold. Preloading too many fonts defeats the purpose.

### Subset Your Fonts

If you only use Latin characters, there is no reason to download glyphs for Cyrillic, Greek, and CJK scripts. Font subsetting tools like `glyphhanger` or `pyftsubset` can reduce font file sizes by 70% or more.

### Consider System Fonts

For body text, system font stacks are nearly invisible to users and eliminate font loading entirely:

```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
    Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;
}
```

## JavaScript: Less Is More

JavaScript is the most expensive resource per byte. Unlike images, which only need to be decoded, JavaScript must be downloaded, parsed, compiled, and executed. Each step takes time and blocks the main thread. I have found that JavaScript is the number one cause of poor INP scores on the sites I audit.

### Audit Your Bundle

Run a bundle analysis to see what is actually in your JavaScript. You might find:

- A date library adding 70KB when you only need date formatting
- A utility library where you use three functions out of 300
- Polyfills for browsers you no longer support

```bash
# For webpack
npx webpack-bundle-analyzer stats.json

# For Vite
npx vite-bundle-visualizer
```

Replace heavy dependencies with lighter alternatives. `date-fns` or `dayjs` instead of Moment.js. Native `fetch` instead of Axios for simple requests. Native `structuredClone` instead of Lodash's `cloneDeep`.

### Code Split by Route

Do not load JavaScript for pages the user has not visited. Every major [JavaScript framework](/frontend/choosing-the-right-javascript-framework-in-2026) supports route-based code splitting:

```javascript
// React with lazy loading
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Settings = React.lazy(() => import('./pages/Settings'));
```

This means the settings page JavaScript is only downloaded when the user navigates to settings, not on initial load.

### Defer Non-Critical Scripts

Analytics, chat widgets, and social media embeds do not need to load before your page is interactive. Use `defer` or `async` attributes, or load them after the page has finished rendering:

```html
<!-- Deferred: executes after HTML is parsed -->
<script src="analytics.js" defer></script>

<!-- Or load dynamically after page load -->
<script>
  window.addEventListener('load', () => {
    const script = document.createElement('script');
    script.src = 'chat-widget.js';
    document.body.appendChild(script);
  });
</script>
```

## CSS: Render-Blocking by Default

CSS blocks rendering. The browser will not paint anything until it has downloaded and parsed all CSS linked in the `<head>`. This makes CSS optimisation critical for perceived performance. For larger projects, a solid [CSS architecture](/frontend/css-architecture-for-large-projects) can help keep stylesheets lean and maintainable.

### Inline Critical CSS

Extract the CSS needed to render above-the-fold content and inline it directly in your HTML. This eliminates the render-blocking request for your stylesheet:

```html
<head>
  <style>
    /* Only the CSS needed for initial render */
    body { margin: 0; font-family: system-ui; }
    .hero { padding: 2rem; background: #f5f5f5; }
    .nav { display: flex; gap: 1rem; }
  </style>
  <link rel="stylesheet" href="full-styles.css" media="print" onload="this.media='all'">
</head>
```

The `media="print"` trick loads the full stylesheet asynchronously without blocking render.

### Remove Unused CSS

Most projects accumulate CSS over time. Tools like PurgeCSS scan your HTML and JavaScript to identify which CSS selectors are actually used, then remove the rest. This can reduce CSS file sizes by 80% or more on projects using utility frameworks like Tailwind (though Tailwind v3+ handles this automatically).

<svg viewBox="0 0 650 340" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart comparing the performance cost per byte of different resource types: JavaScript, CSS, images, and fonts.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="650" height="340" fill="#f8fafc" rx="8"/>
  <text x="325" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Performance Cost per Byte by Resource Type</text>
  <text x="325" y="50" text-anchor="middle" font-size="11" fill="#64748b">Higher bars indicate more processing work required by the browser</text>
  <!-- Y axis -->
  <line x1="120" y1="70" x2="120" y2="270" stroke="#cbd5e1" stroke-width="1"/>
  <text x="115" y="85" text-anchor="end" font-size="10" fill="#64748b">High</text>
  <text x="115" y="270" text-anchor="end" font-size="10" fill="#64748b">Low</text>
  <!-- JavaScript bar -->
  <rect x="155" y="85" width="90" height="185" rx="4" fill="#ef4444" opacity="0.85"/>
  <text x="200" y="135" text-anchor="middle" font-size="11" fill="#ffffff">Download</text>
  <text x="200" y="155" text-anchor="middle" font-size="11" fill="#ffffff">Parse</text>
  <text x="200" y="175" text-anchor="middle" font-size="11" fill="#ffffff">Compile</text>
  <text x="200" y="195" text-anchor="middle" font-size="11" fill="#ffffff">Execute</text>
  <text x="200" y="290" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">JavaScript</text>
  <!-- CSS bar -->
  <rect x="275" y="145" width="90" height="125" rx="4" fill="#f59e0b" opacity="0.85"/>
  <text x="320" y="195" text-anchor="middle" font-size="11" fill="#ffffff">Download</text>
  <text x="320" y="215" text-anchor="middle" font-size="11" fill="#ffffff">Parse</text>
  <text x="320" y="235" text-anchor="middle" font-size="11" fill="#ffffff">Blocks render</text>
  <text x="320" y="290" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">CSS</text>
  <!-- Images bar -->
  <rect x="395" y="195" width="90" height="75" rx="4" fill="#22c55e" opacity="0.85"/>
  <text x="440" y="225" text-anchor="middle" font-size="11" fill="#ffffff">Download</text>
  <text x="440" y="245" text-anchor="middle" font-size="11" fill="#ffffff">Decode</text>
  <text x="440" y="290" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Images</text>
  <!-- Fonts bar -->
  <rect x="515" y="175" width="90" height="95" rx="4" fill="#3b82f6" opacity="0.85"/>
  <text x="560" y="210" text-anchor="middle" font-size="11" fill="#ffffff">Download</text>
  <text x="560" y="230" text-anchor="middle" font-size="11" fill="#ffffff">Parse</text>
  <text x="560" y="250" text-anchor="middle" font-size="11" fill="#ffffff">Can block text</text>
  <text x="560" y="290" text-anchor="middle" font-size="12" font-weight="bold" fill="#334155">Fonts</text>
  <!-- Baseline -->
  <line x1="120" y1="270" x2="620" y2="270" stroke="#cbd5e1" stroke-width="1"/>
  <!-- Footer -->
  <text x="325" y="325" text-anchor="middle" font-size="10" fill="#94a3b8">JavaScript is the most expensive resource type: every byte must be downloaded, parsed, compiled, and executed</text>
</svg>

## Quick Wins Checklist

Here is a prioritised list you can work through. Each item is independent, so tackle them in whatever order suits your project:

- Convert images to WebP or AVIF format
- Add width and height attributes to all images
- Set `fetchpriority="high"` on your LCP image
- Add `loading="lazy"` to below-the-fold images
- Preload your primary font file
- Add `font-display: swap` to all @font-face rules
- Audit your JavaScript bundle and remove unused dependencies
- Implement route-based code splitting
- Defer non-critical third-party scripts
- Inline critical CSS
- Enable text compression (gzip or Brotli) on your server
- Set appropriate cache headers for static assets

## Measuring Your Progress

Before and after each change, measure with both lab and field tools. <a href="https://pagespeed.web.dev/" target="_blank" rel="noopener noreferrer">PageSpeed Insights ↗</a> gives you a quick lab score alongside real-user field data, but field data from real users is what ultimately matters.

Track these Core Web Vitals:

- **LCP (Largest Contentful Paint)**: target under 2.5 seconds
- **INP (Interaction to Next Paint)**: target under 200 milliseconds
- **CLS (Cumulative Layout Shift)**: target under 0.1

Set up monitoring so you catch regressions. A single unoptimised image or a new third-party script can undo weeks of performance work. This kind of vigilance ties into a broader commitment to [automating quality checks](/code-quality/automating-code-quality-with-linters-and-formatters) across your development workflow.

## Conclusion

Web performance is not a one-off project. It is an ongoing practice. But the quick wins outlined here can make a dramatic difference with relatively little effort. Start with images (they are almost always the biggest opportunity), then work through fonts, JavaScript, and CSS. Measure before and after each change, and you will have the data to prove the impact.
