---
title: "CSS Architecture for Large Projects"
description: "Learn CSS architecture strategies for large projects, including BEM, utility-first approaches, and scalable file organisation."
publishDate: "2026-02-07"
author: "gareth-clubb"
category: "frontend"
tags: ["css", "frontend", "architecture", "scalability"]
featured: false
draft: false
faqs:
  - question: "Is BEM still relevant in 2026?"
    answer: "Yes, BEM remains one of the most widely used CSS naming conventions, particularly for projects that use traditional stylesheets or CSS modules. Its explicit naming makes stylesheets predictable and easy to navigate. While utility-first frameworks like Tailwind have gained popularity, BEM is still an excellent choice for teams that prefer semantic class names and component-scoped styles."
  - question: "Should I use Tailwind CSS or write custom CSS for a large project?"
    answer: "Both approaches work at scale, but they require different disciplines. Tailwind excels when your team is large and you want to eliminate naming debates and reduce CSS file growth. Custom CSS (with a methodology like BEM or ITCSS) gives you more control and can produce smaller bundles for design-heavy sites. Many teams use a hybrid approach: Tailwind for layout and spacing utilities, custom CSS for complex component styles."
  - question: "How do I prevent CSS from growing out of control?"
    answer: "Enforce a clear architecture from day one. Use a methodology (BEM, ITCSS, or utility-first) and document it. Scope styles to components so that changes are local rather than global. Audit your CSS regularly using tools like PurgeCSS to remove unused styles. Most importantly, resist the temptation to add one-off overrides; instead, extend your design system."
  - question: "What is CSS specificity and why does it cause problems at scale?"
    answer: "Specificity determines which CSS rule wins when multiple rules target the same element. IDs have higher specificity than classes, which have higher specificity than element selectors. In large projects, developers often increase specificity to override existing styles, creating a specificity arms race where rules become increasingly difficult to override or remove. Keeping specificity low and consistent (e.g., using only classes) prevents this."
  - question: "Should I use CSS-in-JS for a large project?"
    answer: "CSS-in-JS solutions like styled-components or Emotion provide strong component scoping and work well with React-based architectures. They add runtime overhead, which is a consideration for performance-critical applications. Newer zero-runtime alternatives like Vanilla Extract and Panda CSS compile to static CSS at build time, giving you the developer experience of CSS-in-JS without the performance cost."
primaryKeyword: "CSS architecture large projects"
---

A 500-line CSS file is manageable. A 50,000-line CSS file is a liability. Every large frontend project eventually reaches a point where adding a new style breaks something unexpected, where nobody dares delete old rules, and where the cascade feels more like chaos than a feature.

CSS architecture is about preventing that outcome. It is the set of conventions, file structures, and methodologies that keep your styles predictable, maintainable, and performant as your project grows. Having worked on projects where CSS grew from a few hundred lines to tens of thousands, I can say with confidence that the teams who invest in architecture early save themselves months of pain later. On one project I inherited, the CSS bundle had reached 380KB uncompressed, with a specificity graph that looked like a heartbeat monitor. It took the team three months of dedicated refactoring to bring it back under control.

## Why CSS Needs Architecture

CSS is global by default. Every rule you write can potentially affect every element on the page. In a small project, this is fine. In a project with dozens of developers and hundreds of components, it becomes a serious problem.

Without architecture, teams fall into predictable patterns. New styles are added at the bottom of the file. Specificity increases over time as developers use more targeted selectors to override existing rules. Dead CSS accumulates because nobody can confidently determine which rules are still in use. Eventually, the team agrees that the CSS "needs a rewrite," and the cycle begins again.

According to research from <a href="https://httparchive.org/reports/state-of-css" target="_blank" rel="noopener noreferrer">HTTP Archive's State of CSS report ↗</a>, the median CSS weight on the web has grown steadily year on year, with the top 10% of sites shipping over 800KB of CSS. Architecture breaks this cycle by providing structure, naming conventions, and clear ownership of styles. Enforcing these conventions with [automated linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters) is what makes them stick long-term.

## Naming Conventions: BEM

BEM (Block, Element, Modifier) is the most widely adopted CSS naming convention, and for good reason. It creates a direct, readable relationship between your HTML and your CSS.

```css
/* Block */
.card { }

/* Element (part of the block) */
.card__title { }
.card__body { }
.card__footer { }

/* Modifier (variation of a block or element) */
.card--featured { }
.card__title--large { }
```

BEM's double underscore and double hyphen syntax looks unusual at first, but it solves a critical problem: you can look at any class name and immediately understand what it relates to and where it fits in the component hierarchy.

The key discipline with BEM is avoiding nesting. A BEM class should always be a single class selector, never nested inside another. This keeps specificity flat and predictable across your entire stylesheet.

```css
/* Good: flat specificity */
.card__title { font-size: 1.25rem; }

/* Bad: increased specificity, harder to override */
.card .card__title { font-size: 1.25rem; }
```

## File Organisation: ITCSS

Inverted Triangle CSS (ITCSS) is a file organisation methodology created by <a href="https://csswizardry.com/2018/11/itcss-and-skillshare/" target="_blank" rel="noopener noreferrer">Harry Roberts ↗</a>. It structures your CSS from the broadest, most generic styles at the top to the most specific, localised styles at the bottom.

The layers, from top to bottom, are:

| Layer | Purpose | Outputs CSS? | Specificity |
|-------|---------|-------------|-------------|
| Settings | Variables, design tokens, configuration | No | None |
| Tools | Mixins and functions | No | None |
| Generic | Resets, normalisation, box-sizing | Yes | Very low |
| Elements | Bare HTML element styles (h1, p, a) | Yes | Low |
| Objects | Layout primitives (containers, grids) | Yes | Low |
| Components | Specific UI components | Yes | Medium |
| Utilities | Helper classes, overrides | Yes | High |

ITCSS works because it mirrors the natural specificity curve. Generic styles have low specificity and sit at the top. Utilities have high specificity and sit at the bottom. This means you rarely need to fight the cascade.

```
styles/
  settings/
    _colours.scss
    _typography.scss
    _spacing.scss
  tools/
    _mixins.scss
    _functions.scss
  generic/
    _reset.scss
    _box-sizing.scss
  elements/
    _headings.scss
    _links.scss
  objects/
    _container.scss
    _grid.scss
  components/
    _card.scss
    _header.scss
    _navigation.scss
  utilities/
    _visually-hidden.scss
    _text-align.scss
```

## Utility-First CSS

Tailwind CSS popularised the utility-first approach, where you compose styles directly in your HTML using single-purpose utility classes.

```html
<div class="flex items-center gap-4 rounded-lg bg-white p-6 shadow-md">
  <h2 class="text-lg font-semibold text-grey-900">Card Title</h2>
  <p class="text-sm text-grey-600">Card description text.</p>
</div>
```

The advantages at scale are significant. Your CSS file size plateaus because utilities are reused rather than duplicated. Naming debates disappear. Deleting a component means deleting its HTML; there are no orphaned style rules to clean up.

The trade-off is that your HTML becomes more verbose, and design consistency depends on your Tailwind configuration (spacing scale, colour palette, typography) being well-defined. Without a strong configuration, utility-first CSS can lead to inconsistent designs just as easily as poorly organised custom CSS.

| Criteria | BEM/ITCSS | Utility-First (Tailwind) | CSS-in-JS | CSS Modules |
|----------|-----------|--------------------------|-----------|-------------|
| Scoping | Convention-based | Atomic classes | Automatic | Build-time |
| Bundle growth | Linear with features | Plateaus | Linear | Linear |
| Learning curve | Moderate | Low to moderate | Moderate | Low |
| Runtime cost | None | None | Possible (styled-components) | None |
| Refactoring safety | Moderate | High | High | High |
| Framework agnostic | Yes | Yes | No (React/Vue) | Yes |

<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart comparing CSS bundle size growth over time for unstructured CSS, BEM, and utility-first approaches">
  <style>
    .chart-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #334155; }
    .chart-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #64748b; }
    .chart-value { font-family: 'Inter', sans-serif; font-size: 10px; fill: #334155; font-weight: 500; }
    .axis-label { font-family: 'Inter', sans-serif; font-size: 10px; fill: #94a3b8; }
  </style>
  <text x="300" y="25" text-anchor="middle" class="chart-title">CSS Bundle Size Growth Over 18 Months</text>
  <!-- Y axis -->
  <line x1="80" y1="45" x2="80" y2="250" stroke="#e2e8f0" stroke-width="1"/>
  <text x="20" y="250" class="axis-label">0 KB</text>
  <text x="20" y="200" class="axis-label">100 KB</text>
  <text x="20" y="150" class="axis-label">200 KB</text>
  <text x="20" y="100" class="axis-label">300 KB</text>
  <text x="20" y="55" class="axis-label">400 KB</text>
  <line x1="75" y1="200" x2="570" y2="200" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="75" y1="150" x2="570" y2="150" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="75" y1="100" x2="570" y2="100" stroke="#f1f5f9" stroke-width="1"/>
  <!-- X axis -->
  <line x1="80" y1="250" x2="570" y2="250" stroke="#e2e8f0" stroke-width="1"/>
  <text x="160" y="270" text-anchor="middle" class="axis-label">3 months</text>
  <text x="270" y="270" text-anchor="middle" class="axis-label">6 months</text>
  <text x="380" y="270" text-anchor="middle" class="axis-label">12 months</text>
  <text x="500" y="270" text-anchor="middle" class="axis-label">18 months</text>
  <!-- Unstructured CSS bars (red) -->
  <rect x="120" y="215" width="25" height="35" fill="#ef4444" rx="2"/>
  <rect x="230" y="170" width="25" height="80" fill="#ef4444" rx="2"/>
  <rect x="340" y="100" width="25" height="150" fill="#ef4444" rx="2"/>
  <rect x="460" y="55" width="25" height="195" fill="#ef4444" rx="2"/>
  <!-- BEM/ITCSS bars (blue) -->
  <rect x="148" y="225" width="25" height="25" fill="#3b82f6" rx="2"/>
  <rect x="258" y="195" width="25" height="55" fill="#3b82f6" rx="2"/>
  <rect x="368" y="160" width="25" height="90" fill="#3b82f6" rx="2"/>
  <rect x="488" y="140" width="25" height="110" fill="#3b82f6" rx="2"/>
  <!-- Utility-first bars (green) -->
  <rect x="176" y="230" width="25" height="20" fill="#22c55e" rx="2"/>
  <rect x="286" y="215" width="25" height="35" fill="#22c55e" rx="2"/>
  <rect x="396" y="205" width="25" height="45" fill="#22c55e" rx="2"/>
  <rect x="516" y="200" width="25" height="50" fill="#22c55e" rx="2"/>
  <!-- Legend -->
  <rect x="160" y="282" width="12" height="12" fill="#ef4444" rx="2"/>
  <text x="176" y="293" class="chart-label">Unstructured</text>
  <rect x="270" y="282" width="12" height="12" fill="#3b82f6" rx="2"/>
  <text x="286" y="293" class="chart-label">BEM/ITCSS</text>
  <rect x="370" y="282" width="12" height="12" fill="#22c55e" rx="2"/>
  <text x="386" y="293" class="chart-label">Utility-first</text>
</svg>

## Component Scoping

Modern frameworks offer built-in style scoping that solves many of CSS's global-scope problems.

**CSS Modules** generate unique class names at build time, ensuring that `.title` in one component never conflicts with `.title` in another. They work with any bundler and require no runtime overhead.

**Vue's scoped styles** and **Svelte's component styles** achieve the same isolation using attribute selectors added at compile time.

**Shadow DOM** provides the strongest encapsulation through the browser's built-in scoping mechanism, though styling across the shadow boundary can be challenging.

Whichever approach you use, the principle is the same: styles should be owned by the component they belong to. When you delete a component, its styles should disappear with it. This aligns closely with the broader principle of [choosing the right framework](/frontend/choosing-the-right-javascript-framework-in-2026) for your project's needs.

## Design Tokens

Design tokens are the foundation of a scalable design system. They are named values that represent your design decisions: colours, spacing, typography, shadows, and breakpoints.

```css
:root {
  --colour-primary: #2563eb;
  --colour-text: #1f2937;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --font-size-body: 1rem;
  --font-size-heading: 1.5rem;
  --radius-md: 0.5rem;
}
```

Using tokens instead of raw values ensures consistency and makes sweeping design changes trivial. Updating your primary colour means changing one variable, not searching through hundreds of files. The <a href="https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties" target="_blank" rel="noopener noreferrer">MDN documentation on CSS custom properties ↗</a> is an excellent starting point for understanding how native CSS variables work.

## Auditing and Maintenance

CSS architecture is not a one-time setup. It requires ongoing maintenance to remain effective.

**PurgeCSS** or Tailwind's built-in tree-shaking removes unused styles from your production bundle. Run it as part of your build pipeline.

**Stylelint** enforces your naming conventions, property ordering, and architecture rules automatically. Configure it to reject patterns that violate your chosen methodology.

**CSS Stats** and **Wallace** are audit tools that analyse your stylesheet and report on file size, specificity distribution, colour usage, and redundant declarations. Run them periodically to catch drift.

In my experience, scheduling a quarterly CSS audit catches specificity creep and dead code before they become serious problems. On one team, we found that 40% of our CSS declarations were unused after a year of rapid feature development. Combining these audits with [automated code quality tools](/code-quality/automating-code-quality-with-linters-and-formatters) creates a strong feedback loop. A well-maintained CSS architecture also has a direct impact on [web performance](/frontend/web-performance-quick-wins-for-frontend-developers), since CSS is render-blocking by default.

## Choosing Your Approach

There is no single correct CSS architecture. The best choice depends on your team, your framework, and your project's needs.

For **new projects with a component framework** (React, Vue, Svelte), CSS Modules or the framework's built-in scoping combined with design tokens is a strong default. Add Tailwind if your team prefers utility-first development.

For **large legacy projects** that need incremental improvement, introduce ITCSS to organise existing styles and BEM for new components. Gradually migrate old styles into the new structure.

For **design-system-heavy projects** where pixel-perfect consistency matters, design tokens with component-scoped custom CSS gives you the most control.

Whatever you choose, document it, enforce it with tooling, and treat it as a team agreement rather than a personal preference. CSS architecture only works when everyone follows it. For practical tips on getting that level of team alignment, have a look at [writing documentation developers actually read](/collaboration/writing-documentation-developers-actually-read). If you are also working on [accessibility fundamentals](/frontend/accessibility-fundamentals-for-frontend-developers), a well-structured CSS architecture makes accessible styling considerably easier to maintain.
