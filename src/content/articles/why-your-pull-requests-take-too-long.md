---
title: "Why Your Pull Requests Take Too Long"
description: "Learn why your pull requests take too long to merge and how to fix your code review process with smaller PRs, better descriptions, and clearer norms."
publishDate: "2026-02-23"
author: "jonny-rowse"
category: "collaboration"
tags: ["code-review", "pull-requests", "team-productivity", "collaboration"]
featured: false
draft: false
faqs:
  - question: "How big should a pull request be?"
    answer: "Research from Google and SmartBear suggests that pull requests should be under 400 lines of changes. Beyond that, reviewer attention drops significantly and the quality of feedback declines. Aim for the smallest PR that delivers a coherent, reviewable unit of work."
  - question: "How long should a code review take?"
    answer: "A well-scoped pull request (under 400 lines) should take 15 to 30 minutes to review. If reviews routinely take longer, the PRs are likely too large or the context provided in the description is insufficient."
  - question: "Should I review code even if I am not a domain expert?"
    answer: "Yes. Non-expert reviews catch different things: unclear naming, missing documentation, confusing logic flow. You do not need to understand the business domain deeply to spot code quality issues."
  - question: "How do I handle disagreements in code review?"
    answer: "Distinguish between blocking issues (bugs, security problems, broken contracts) and preferences (style choices, alternative approaches). Block on the former, comment without blocking on the latter. If a disagreement persists, discuss it synchronously rather than going back and forth in comments."
  - question: "What is the ideal turnaround time for a code review?"
    answer: "Most high-performing teams aim for a first review within four working hours. This balances the reviewer's need for uninterrupted focus with the author's need to avoid context-switching back to stale work."
primaryKeyword: "pull requests take too long"
---

A developer opens a pull request on Monday morning. By Wednesday afternoon, it still has no reviews. By Thursday, the base branch has drifted so far that merge conflicts have appeared. By Friday, the developer has forgotten half the context and the reviewer is looking at a diff that no longer tells a clear story.

This is not an edge case. In many teams, slow pull requests are the single biggest bottleneck in the delivery pipeline. The code is written, tested, and ready, but it sits in a queue, ageing like milk. Having worked with engineering teams across multiple organisations, I have found that fixing the PR process is consistently one of the highest-leverage improvements a team can make.

## The Measurable Cost

Slow code reviews do not just frustrate developers. They have quantifiable impacts on delivery speed.

The <a href="https://dora.dev/research/" target="_blank" rel="noopener noreferrer">DORA (DevOps Research and Assessment) ↗</a> metrics identify lead time for changes as a key predictor of engineering performance. Pull request review time is a major component of lead time. When PRs sit unreviewed for days, your deployment frequency drops, your batch sizes grow, and your feedback loops lengthen.

There is also a human cost. Developers waiting for reviews [context-switch](/productivity/the-real-cost-of-context-switching) to other work. When the review finally arrives, they have to reload the mental model of what they built and why. This is expensive, often costing 20 to 30 minutes of recovery time per context switch.

## Why PRs Stall: The Root Causes

| Root Cause | Frequency | Impact | Fix Difficulty |
|---|---|---|---|
| PR too large (400+ lines) | Very common | High | Low (discipline) |
| Poor or missing description | Common | Medium | Low (templates) |
| No review turnaround norm | Common | Very high | Medium (cultural) |
| Too few reviewers | Moderate | High | Medium (process) |
| Slow CI pipeline | Moderate | High | High (infrastructure) |
| Unclear ownership (CODEOWNERS) | Moderate | Medium | Low (config) |

### The PR is too big

This is the most common cause by a wide margin. A 1,500-line pull request is intimidating. Reviewers see it in their queue, decide they do not have time right now, and come back to it later. That "later" often means tomorrow, or the day after.

Research from <a href="https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/" target="_blank" rel="noopener noreferrer">SmartBear ↗</a> found that review quality drops sharply after 400 lines of changes and collapses after 600. Large PRs do not just take longer to review; they get worse reviews.

### The description is inadequate

A pull request with a title like "Update stuff" and no description forces the reviewer to reverse-engineer the intent from the diff. This takes far longer than reading a clear explanation of what changed and why.

Reviewers are human. If understanding your PR requires significant effort, they will defer it in favour of something easier to review.

### There is no team norm around review turnaround

Without an explicit agreement about how quickly reviews should happen, everyone optimises for their own schedule. Some developers review within the hour; others check the review queue once a day, at best.

### The wrong people are reviewing

If every PR needs a senior developer's approval and there are only two seniors on the team, you have created an artificial bottleneck. Review capacity needs to scale with PR volume.

### The CI pipeline is slow

A 30-minute CI pipeline means the reviewer has to either wait or come back later to check if their feedback was addressed. Slow pipelines add latency to every round trip in the review cycle. Investing in a [CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) pays dividends across the entire review process.

## How to Fix It

### Write smaller pull requests

This is the single most effective change you can make. Smaller PRs are reviewed faster, reviewed more thoroughly, and merged with fewer conflicts.

Break your work into logical increments. A common pattern is to split a feature into:

1. Data model changes (migrations, types)
2. Backend logic (API endpoints, business rules)
3. Frontend implementation (UI components, state management)
4. Integration and cleanup (wiring everything together, removing feature flags)

Each PR is independently reviewable and deployable. If any one of them has problems, the blast radius is limited.

### Write better PR descriptions

A good PR description answers three questions:

- **What** changed? A brief summary of the modifications.
- **Why** did it change? The motivation, whether it is a bug fix, a new feature, or a refactor.
- **How** should the reviewer approach it? Where to start reading, what to focus on, what was intentionally left out of scope.

Include screenshots for visual changes. Link to the relevant issue or ticket. Call out any decisions you are unsure about and want specific feedback on. Good PR descriptions are a form of [documentation that developers actually read](/collaboration/writing-documentation-developers-actually-read).

### Set team norms explicitly

Agree as a team on review turnaround expectations. A common and effective standard is: first review within four working hours. Write it down. Make it part of your team agreement.

This does not mean reviews take priority over [deep work](/productivity/the-developers-guide-to-deep-work). It means developers check the review queue at least twice during a working day.

### Distribute review responsibility

Use CODEOWNERS files to route reviews automatically, but also rotate reviewers to spread knowledge and prevent bottlenecks. Every developer on the team should be reviewing code regularly, not just the senior members.

Consider a "review buddy" system where each PR is automatically assigned to a specific reviewer based on a rotation, ensuring even distribution.

### Differentiate blocking from non-blocking feedback

Not every comment needs to block a merge. Establish conventions like prefixing comments with "nit:" for stylistic suggestions or "suggestion:" for non-blocking alternatives.

This lets authors merge once blocking issues are resolved without waiting for another round of review over cosmetic feedback. For more on making reviews productive rather than frustrating, see [code reviews that do not waste time](/collaboration/code-reviews-that-dont-waste-time).

### Speed up your CI pipeline

If CI takes 30 minutes, every round of review feedback adds at least 30 minutes of latency. Invest in parallelisation, test splitting, build caching, and flaky test elimination.

A CI pipeline under ten minutes transforms the review experience. Feedback cycles tighten, and reviewers can check fixes in near real time.

<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" aria-label="Chart showing how PR size correlates with review time and defect detection rate">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="700" height="340" fill="#f8fafc" rx="8"/>
  <text x="350" y="30" text-anchor="middle" font-size="16" font-weight="600" fill="#334155">PR Size vs Review Quality</text>
  <!-- Axes -->
  <line x1="100" y1="60" x2="100" y2="280" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="100" y1="280" x2="650" y2="280" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Y axis label -->
  <text x="30" y="170" text-anchor="middle" font-size="12" fill="#64748b" transform="rotate(-90, 30, 170)">Defect Detection Rate (%)</text>
  <!-- X axis label -->
  <text x="375" y="310" text-anchor="middle" font-size="12" fill="#64748b">Lines Changed in PR</text>
  <!-- X axis ticks -->
  <text x="175" y="296" text-anchor="middle" font-size="11" fill="#64748b">100</text>
  <text x="275" y="296" text-anchor="middle" font-size="11" fill="#64748b">200</text>
  <text x="375" y="296" text-anchor="middle" font-size="11" fill="#64748b">400</text>
  <text x="475" y="296" text-anchor="middle" font-size="11" fill="#64748b">800</text>
  <text x="575" y="296" text-anchor="middle" font-size="11" fill="#64748b">1500</text>
  <!-- Y axis ticks -->
  <text x="90" y="270" text-anchor="end" font-size="11" fill="#64748b">20%</text>
  <text x="90" y="225" text-anchor="end" font-size="11" fill="#64748b">40%</text>
  <text x="90" y="180" text-anchor="end" font-size="11" fill="#64748b">60%</text>
  <text x="90" y="135" text-anchor="end" font-size="11" fill="#64748b">80%</text>
  <text x="90" y="90" text-anchor="end" font-size="11" fill="#64748b">100%</text>
  <!-- Data points and line (showing declining detection rate) -->
  <polyline points="175,85 275,110 375,160 475,220 575,260" fill="none" stroke="#3b82f6" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="175" cy="85" r="5" fill="#22c55e"/>
  <circle cx="275" cy="110" r="5" fill="#22c55e"/>
  <circle cx="375" cy="160" r="5" fill="#f59e0b"/>
  <circle cx="475" cy="220" r="5" fill="#ef4444"/>
  <circle cx="575" cy="260" r="5" fill="#ef4444"/>
  <!-- Annotation -->
  <rect x="380" y="80" width="230" height="50" fill="#fef2f2" stroke="#ef4444" stroke-width="1" rx="4"/>
  <text x="495" y="100" text-anchor="middle" font-size="11" font-weight="600" fill="#991b1b">Quality drops sharply</text>
  <text x="495" y="118" text-anchor="middle" font-size="11" fill="#991b1b">after 400 lines changed</text>
  <line x1="380" y1="105" x2="375" y2="160" stroke="#ef4444" stroke-width="1" stroke-dasharray="4"/>
</svg>

## Measuring Improvement

Track these metrics to understand whether your review process is getting better:

- **Time to first review**: how long a PR waits before receiving its first review
- **Review rounds**: how many back-and-forth cycles before merge
- **PR size**: the median number of changed lines per PR
- **Time to merge**: from PR creation to merge

Many tools (GitHub's built-in insights, LinearB, Sleuth, and Haystack) can surface these metrics automatically.

## The Cultural Shift

Fast code review is ultimately a cultural choice. It requires the team to agree that unblocking colleagues is a high-priority activity, that small PRs are better than comprehensive ones, and that review quality matters more than review thoroughness.

The teams that ship the fastest are not the ones that write the most code. They are the ones that get code through review and into production with the least friction. Fixing your PR process is one of the highest-leverage improvements you can make.
