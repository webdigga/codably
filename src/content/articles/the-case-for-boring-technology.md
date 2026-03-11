---
title: "The Case for Boring Technology"
description: "Why boring technology choices lead to better software, fewer outages, and happier engineering teams in the long run."
publishDate: "2026-02-17"
author: "jonny-rowse"
category: "architecture"
tags: ["architecture", "decision-making", "technology-choices", "engineering-culture", "pragmatism"]
featured: false
draft: false
faqs:
  - question: "What does boring technology mean?"
    answer: "Boring technology refers to well-established, widely adopted tools and frameworks that have been battle-tested in production for years. Think PostgreSQL, Linux, Python, or React. These are not exciting or new, but they are reliable, well-documented, and understood by most developers."
  - question: "Does choosing boring technology mean never adopting new tools?"
    answer: "No. It means being deliberate about when you adopt new tools. Dan McKinley's innovation tokens concept suggests limiting the number of novel technologies in your stack to a small number, perhaps two or three. Spend those tokens where innovation gives you a genuine competitive advantage."
  - question: "How do I convince my team to choose boring technology?"
    answer: "Focus on outcomes rather than opinions. Present data on operational costs, hiring difficulty, and incident rates. Show examples of successful companies built on boring stacks. Frame it as a strategic choice that frees the team to innovate on the product rather than fighting infrastructure."
  - question: "Will choosing boring technology make it harder to hire developers?"
    answer: "Usually the opposite. More developers know PostgreSQL than CockroachDB, more know React than Solid, and more know Python than Elixir. A boring stack means a larger talent pool and faster onboarding for new hires."
  - question: "Is boring technology always the right choice?"
    answer: "Not always. If your core business problem genuinely requires a specialised tool, use it. A real-time bidding platform might need a custom in-memory data store. A machine learning pipeline might need specialised GPU frameworks. The key is to be honest about whether your problem truly requires novel technology or whether you are choosing it because it is interesting."
primaryKeyword: "boring technology"
---

Every few months, a new framework, database, or language captures the industry's attention. The benchmarks are impressive, the demos are slick, and the Hacker News comments are enthusiastic. It is tempting to reach for the shiny new thing, especially when your current tools feel clunky by comparison.

But the most successful engineering teams I have worked with share a common trait: they are deeply, almost aggressively, boring in their technology choices. And they ship faster because of it.

## The Hidden Cost of Novelty

<a href="https://mcfunley.com/choose-boring-technology" target="_blank" rel="noopener noreferrer">Dan McKinley's influential essay "Choose Boring Technology" ↗</a> introduced the concept of innovation tokens. Every organisation has a limited number of these tokens to spend. Each novel technology you adopt spends one. Choose a cutting-edge database? That is a token. Write your backend in a language nobody on the team knows well? Another token. Use an experimental deployment platform? A third.

The problem is not that any single novel choice is bad. It is that their costs compound. Each unfamiliar technology introduces unknowns: failure modes you have not seen, edge cases the documentation does not cover, and bugs that nobody on Stack Overflow has encountered yet.

When you spend all your innovation tokens on infrastructure, you have none left for the thing that actually matters: your product.

## What Boring Technology Gives You

### Known Failure Modes

PostgreSQL has been around since 1996. In that time, virtually every failure mode has been discovered, documented, and resolved. When something goes wrong at 3 AM, you can search for the error message and find a detailed explanation, usually with a fix.

Compare that to a database that launched two years ago. The documentation is sparse, the community is small, and your specific error might be a genuinely new bug. You are now debugging the tool instead of solving your business problem.

### A Deep Talent Pool

If your stack is Python, PostgreSQL, and Redis, you can hire from a massive pool of developers who already know these tools. Onboarding takes days rather than weeks. New team members can contribute meaningfully from their first week.

With a novel stack, hiring becomes a filtering exercise. You need developers who either already know your obscure tools or are willing to learn them. This shrinks your candidate pool dramatically and increases the time to productivity.

### Mature Tooling and Ecosystem

Boring technologies have years of tooling built around them. Monitoring, profiling, debugging, testing: the ecosystem is rich and battle-tested. You do not need to write custom tooling for basic operational tasks.

Novel technologies often lack this ecosystem. You end up building monitoring dashboards from scratch, writing custom deployment scripts, and creating internal documentation for problems that established tools solved years ago.

## Boring vs Novel Technology: A Comparison

| Factor | Boring Technology | Novel Technology |
|---|---|---|
| Documentation | Extensive, community-maintained | Sparse, often outdated |
| Hiring pool | Large, easy to find experienced developers | Small, requires training or niche recruitment |
| Known failure modes | Well-documented with established fixes | Unknown; you may discover new bugs |
| Tooling ecosystem | Rich (monitoring, debugging, profiling) | Limited; may require custom tooling |
| Community support | Thousands of Stack Overflow answers | Few resources, small community |
| Upgrade path | Stable, well-tested release cycles | Frequent breaking changes, unstable APIs |
| Operational cost | Low; problems are well-understood | High; requires ongoing learning and firefighting |

## When Boring Is Not Enough

There are legitimate reasons to adopt new technology. The key is being honest about whether your situation justifies it.

### Your Problem Genuinely Requires It

If you are building a system that processes millions of events per second with sub-millisecond latency, you might genuinely need a specialised streaming platform rather than polling a PostgreSQL table. If your application requires offline-first capabilities with complex conflict resolution, you might need a CRDT-based database.

The crucial test is this: does your actual, measured workload require this technology, or are you designing for a scale you have not reached and might never reach?

### The Boring Option Has Fundamental Limitations

Sometimes the established tool truly cannot do what you need. PostgreSQL is excellent, but if your data model is genuinely graph-shaped and you need multi-hop traversals on billions of nodes, a graph database might be the right call.

But be rigorous about this. "Fundamental limitation" means you have tried the boring approach, measured its performance, and confirmed it does not meet your requirements. It does not mean you read a blog post about why the boring approach might theoretically struggle at scale.

## The Innovation Token Budget

Here is a practical framework for managing technology choices.

### Give Yourself Two or Three Tokens

For a typical startup or product team, limit yourself to two or three novel technologies across your entire stack. Everything else should be boring and well-understood.

### Spend Tokens on Competitive Advantage

If your product's unique value comes from real-time collaboration, spend a token on a CRDT library or operational transform system. If your competitive advantage is machine learning, spend a token on a specialised ML framework. Do not spend tokens on your deployment pipeline or your task queue. Infrastructure choices are better served by [proven, well-established approaches](/devops/infrastructure-as-code-getting-started).

### Earn More Tokens Over Time

As your team grows and your operational maturity increases, you can afford more novelty. A 50-person engineering team with dedicated SREs can handle more novel technology than a 5-person startup. But even large teams should be deliberate about where they spend.

<svg viewBox="0 0 650 300" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart showing innovation token allocation for a typical product team: 2 to 3 tokens for novel technology vs the rest of the stack using boring, well-established tools.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="650" height="300" fill="#f8fafc" rx="8"/>
  <text x="325" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Innovation Token Budget: Where to Spend</text>
  <!-- Y axis label -->
  <text x="20" y="165" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-90,20,165)">Relative investment</text>
  <!-- Bars -->
  <!-- Boring: tall bar -->
  <rect x="80" y="55" width="120" height="190" rx="4" fill="#64748b" opacity="0.8"/>
  <text x="140" y="150" text-anchor="middle" font-size="13" font-weight="bold" fill="#ffffff">Boring</text>
  <text x="140" y="170" text-anchor="middle" font-size="10" fill="#e2e8f0">PostgreSQL</text>
  <text x="140" y="185" text-anchor="middle" font-size="10" fill="#e2e8f0">Linux, Redis</text>
  <text x="140" y="200" text-anchor="middle" font-size="10" fill="#e2e8f0">React, Python</text>
  <text x="140" y="260" text-anchor="middle" font-size="11" fill="#334155">Infrastructure</text>
  <text x="140" y="275" text-anchor="middle" font-size="10" fill="#64748b">(0 tokens)</text>
  <!-- Token 1 -->
  <rect x="250" y="135" width="100" height="110" rx="4" fill="#3b82f6" opacity="0.85"/>
  <text x="300" y="185" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Token 1</text>
  <text x="300" y="205" text-anchor="middle" font-size="10" fill="#dbeafe">Core product</text>
  <text x="300" y="220" text-anchor="middle" font-size="10" fill="#dbeafe">differentiator</text>
  <text x="300" y="260" text-anchor="middle" font-size="11" fill="#334155">Competitive edge</text>
  <text x="300" y="275" text-anchor="middle" font-size="10" fill="#64748b">(1 token)</text>
  <!-- Token 2 -->
  <rect x="400" y="165" width="100" height="80" rx="4" fill="#22c55e" opacity="0.85"/>
  <text x="450" y="205" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Token 2</text>
  <text x="450" y="220" text-anchor="middle" font-size="10" fill="#dcfce7">Specialised need</text>
  <text x="450" y="260" text-anchor="middle" font-size="11" fill="#334155">Justified novelty</text>
  <text x="450" y="275" text-anchor="middle" font-size="10" fill="#64748b">(1 token)</text>
  <!-- Token 3 (optional) -->
  <rect x="550" y="200" width="70" height="45" rx="4" fill="#f59e0b" opacity="0.6" stroke="#f59e0b" stroke-dasharray="4"/>
  <text x="585" y="228" text-anchor="middle" font-size="10" font-weight="bold" fill="#92400e">Maybe</text>
  <text x="585" y="260" text-anchor="middle" font-size="10" fill="#334155">Reserve</text>
  <text x="585" y="275" text-anchor="middle" font-size="10" fill="#64748b">(spare token)</text>
  <!-- Baseline -->
  <line x1="70" y1="245" x2="630" y2="245" stroke="#cbd5e1" stroke-width="1"/>
</svg>

## How to Evaluate Technology Choices

When someone on your team proposes a new technology, ask these questions:

**What problem does this solve that our current tools cannot?** If the answer is vague ("it is faster" or "it is more modern"), push for specifics. How much faster? Measured against what workload? Does that performance difference matter for your use case?

**What is the operational cost?** Consider monitoring, alerting, backups, upgrades, security patches, and incident response. Who on the team can debug this at 3 AM? Good [observability](/devops/observability-vs-monitoring-what-developers-need-to-know) is harder to achieve with tools your team does not deeply understand.

**What happens if the project is abandoned?** Open-source projects with a single maintainer or a small company behind them carry real risk. PostgreSQL and Linux are not going anywhere. That new Rust framework might be.

**Can we try it in a non-critical path first?** If you do adopt something new, use it for an internal tool or a low-stakes feature before putting it in your critical path.

## Boring Technology in Practice

Some of the most successful technology companies in the world run on remarkably boring stacks. Shopify has built a multi-billion pound business on Ruby on Rails and MySQL. Basecamp, the company behind Rails itself, runs their entire product on a single monolithic application. GitHub ran on Rails for years before incrementally adopting other technologies where they had specific needs.

The <a href="https://survey.stackoverflow.co/2025/" target="_blank" rel="noopener noreferrer">Stack Overflow Developer Survey ↗</a> consistently shows that the most widely used technologies are not the newest ones. PostgreSQL, JavaScript, Python, and React dominate year after year because they work, they scale, and developers know how to use them.

These companies did not succeed because of their technology choices. They succeeded because their boring technology choices freed them to focus on solving customer problems.

## The Cultural Challenge

The hardest part of choosing boring technology is cultural. Developers are naturally curious. We enjoy learning new things, and working with cutting-edge technology is genuinely exciting. Telling a talented engineer to use PostgreSQL instead of the new distributed database feels like you are holding them back.

The reframe is this: boring infrastructure frees you to be creative where it matters. When you are not debugging your message queue at midnight, you have energy to design elegant [APIs](/backend/api-design-principles-every-developer-should-know), build delightful user experiences, and solve genuinely hard product problems.

In my experience, the best engineers I know are not the ones who use the most advanced tools. They are the ones who solve the most important problems with the simplest tools available. That [senior developer mindset](/career/the-senior-developer-mindset) is about impact, not novelty.

## Conclusion

Boring technology is not a compromise. It is a strategy. It is the decision to spend your limited innovation budget on the things that differentiate your product rather than on infrastructure that your competitors are also building.

The next time you are tempted by a shiny new [JavaScript framework](/frontend/choosing-the-right-javascript-framework-in-2026) or database, ask yourself: is this where I want to spend an innovation token? More often than not, the answer is no. And that is perfectly fine.
