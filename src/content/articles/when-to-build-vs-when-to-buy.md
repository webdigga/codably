---
title: "When to Build vs When to Buy"
description: "Learn when to build custom software vs when to buy existing solutions, with a practical framework for making the right decision."
publishDate: "2026-02-03"
author: "david-white"
category: "architecture"
tags: ["architecture", "decision-making", "strategy", "engineering-leadership"]
featured: false
draft: false
faqs:
  - question: "How do I calculate the true cost of building a custom solution?"
    answer: "Start with the initial development cost (developer salaries multiplied by estimated months). Then add the ongoing costs that most teams underestimate: maintenance, bug fixes, security patches, infrastructure, on-call support, documentation, and onboarding new team members. A common rule of thumb is that maintenance costs 15-20% of the initial build cost per year. Over five years, the total cost of ownership is typically three to four times the initial development investment."
  - question: "What if we build it and it does not work out?"
    answer: "This is one of the key risks of building. Unlike a SaaS subscription you can cancel, a custom system represents sunk cost in development time and creates ongoing obligations. Before committing to build, define clear success criteria and a timeline. If the system has not met those criteria by the deadline, have a plan to migrate to a purchased solution. The ability to walk away is important."
  - question: "Should startups ever build instead of buying?"
    answer: "Yes, but only for their core differentiator. A startup should buy everything that is not directly related to what makes their product unique. Use Stripe for payments, Auth0 for authentication, SendGrid for email, and a managed database. Build the thing that only you can build. Every hour spent building commodity infrastructure is an hour not spent on your competitive advantage."
  - question: "How do I evaluate a third-party vendor before committing?"
    answer: "Assess their financial stability (are they profitable or well-funded?), their track record (how long have they been operating?), their customer base (do companies similar to yours use them?), their API quality (is it well-documented and stable?), their data portability (can you export your data if you leave?), and their support responsiveness (test this before signing). Request references from existing customers in your industry."
  - question: "What about open-source alternatives?"
    answer: "Open source occupies a middle ground. You get the software for free but take on the cost of hosting, maintaining, upgrading, and supporting it yourself. For well-maintained projects with large communities (PostgreSQL, Redis, Kubernetes), this is often an excellent trade-off. For niche projects with a single maintainer, the risk of abandonment makes managed services a safer choice."
primaryKeyword: "build vs buy software"
---

Every engineering team eventually faces the same question: should we build this ourselves or use an existing solution? Get the answer right and you accelerate your roadmap. Get it wrong and you either waste months building something that already exists or lock yourself into a vendor that cannot meet your needs.

This is not a question with a universal answer. It depends on your team, your product, and your specific situation. But there is a framework for thinking about it that leads to better decisions more consistently. Having been on both sides of this decision many times, I have seen the cost of getting it wrong firsthand, and it is almost always more expensive than teams expect. On one project, we spent four months building a custom notification system that a 50-pound-per-month SaaS product would have covered entirely. On another, we correctly chose to build a bespoke pricing engine because it was central to our competitive advantage. The difference came down to honestly answering one question: is this our core business?

## The Default Should Be Buy

This is the first principle that many engineering teams resist. Developers like building things. The idea of writing a custom solution is inherently more appealing than integrating a third-party service. But that instinct leads to poor decisions.

Unless you have a specific, compelling reason to build, you should buy. The reasoning is simple: a third-party solution that covers 80% of your needs is available today, maintained by a dedicated team, and costs a fraction of what custom development would require. Your custom solution will take months to reach the same level of maturity, and every hour your team spends building it is an hour not spent on features that differentiate your product.

The burden of proof should always be on building, not on buying. As <a href="https://boringtechnology.club/" target="_blank" rel="noopener noreferrer">Dan McKinley's "Choose Boring Technology" talk ↗</a> argues, every new custom system you introduce costs innovation tokens that could be better spent elsewhere. Our article on [the case for boring technology](/architecture/the-case-for-boring-technology) explores this principle further. A <a href="https://www.mckinsey.com/capabilities/mckinsey-digital/our-insights/tech-forward/buy-vs-build" target="_blank" rel="noopener noreferrer">McKinsey analysis on buy vs build decisions ↗</a> found that organisations that default to buying for non-core capabilities deliver new products to market 30 to 40% faster than those that build most things in-house.

## When Building Makes Sense

There are legitimate reasons to build. Recognising them is just as important as recognising when to buy.

### Core Differentiator

If the functionality is central to what makes your product valuable, you should own it. Spotify built their own recommendation engine. Stripe built their own payment processing infrastructure. These companies built because the quality and customisation of these systems is their competitive advantage.

Ask yourself: would a customer choose us over a competitor because of how well this specific feature works? If the answer is yes, building is likely the right choice.

### Unique Requirements

Sometimes your requirements are genuinely unusual. Your data model does not fit standard tooling. Your scale exceeds what off-the-shelf solutions can handle. Your regulatory environment demands specific controls that no vendor provides.

Be honest about whether your requirements are truly unique. Most teams overestimate how special their needs are. "We need it to work slightly differently" is usually not a strong enough reason to build from scratch.

### Integration Complexity

Occasionally, the cost of integrating and maintaining a third-party solution exceeds the cost of building a simpler version yourself. This is particularly true when you need a small subset of a large platform's functionality and the platform's integration surface area is complex.

A simple, focused custom tool that does exactly what you need can be easier to maintain than a sprawling integration with an enterprise platform you are using at 10% capacity.

### Strategic Control

If a third-party dependency creates an existential risk for your business, owning the technology is a strategic necessity. If your entire product depends on a single vendor's API and that vendor could become a competitor, raise prices dramatically, or shut down, building an alternative is risk mitigation.

| Signal | Leans Towards Build | Leans Towards Buy |
|--------|-------------------|------------------|
| Core to your product's value | Yes | No |
| Off-the-shelf covers 80%+ of needs | No | Yes |
| Team has spare capacity | Maybe | Regardless |
| Need it within weeks | No (build takes months) | Yes |
| Vendor lock-in risk is high | Yes | Less relevant |
| Many comparable SaaS options exist | No | Yes |
| Regulatory/compliance constraints | Possibly | If vendor is certified |

## When Buying Makes Sense

### Commodity Infrastructure

Authentication, email delivery, payment processing, monitoring, log aggregation, CI/CD, and error tracking are all solved problems. Unless you are in the business of solving these problems, buy them.

Every week your team spends building a custom authentication system is a week they are not building features that generate revenue. Auth0, Clerk, or Firebase Auth will handle your authentication better than your custom solution, and they will do it from day one.

### Speed to Market

If time is a constraint, and it nearly always is, buying gives you immediate access to tested, production-ready functionality. Building a feature from scratch takes weeks or months. Integrating a SaaS product takes days.

For early-stage products testing market fit, speed is everything. You need to learn whether customers want your product before you optimise how it is built.

### Maintenance Burden

Custom software requires ongoing maintenance: security patches, dependency updates, bug fixes, performance tuning, and documentation. Every custom system you build adds to your maintenance load permanently. This is a form of [technical debt](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) that many teams fail to account for upfront.

A team maintaining ten custom internal tools has significantly less capacity for product development than a team using ten managed services. The maintenance cost is invisible in the initial build decision but dominates the total cost of ownership over time.

## A Framework for Deciding

When the build-vs-buy question arises, work through these five questions:

| Question | If Yes | If No |
|----------|--------|-------|
| Is this our core business? | Lean towards build | Buy |
| Do existing solutions cover our must-haves? | Buy | Evaluate build cost |
| Is the total build cost (5yr) lower than buy? | Build | Buy |
| Is switching cost from vendor acceptable? | Buy is lower risk | Consider build |
| Can our team absorb the opportunity cost? | Build is feasible | Buy |

### 1. Is This Our Core Business?

If the answer is no, buy. You do not need a custom email service. You do not need a custom monitoring platform. You do not need a custom project management tool.

### 2. Do Existing Solutions Cover Our Requirements?

Evaluate three to five existing options honestly. Score them against your requirements, distinguishing between must-haves and nice-to-haves. If an existing solution covers all must-haves and most nice-to-haves, buy.

### 3. What Is the Total Cost of Building?

Calculate the full cost: initial development (team size multiplied by duration multiplied by fully loaded salary), plus five years of maintenance at 15-20% of the build cost annually, plus opportunity cost of what your team could have built instead.

Compare this to the five-year cost of the SaaS subscription. Include integration costs, per-seat pricing at your projected team size, and any usage-based charges.

### 4. What Is the Switching Cost?

If you buy and it does not work out, how hard is it to switch? Solutions with strong data portability and standard APIs are lower risk. Solutions with proprietary data formats and deep integration hooks are higher risk.

Similarly, if you build and it does not work out, what is the cost of migrating to a purchased solution?

### 5. What Is the Opportunity Cost?

This is the question most teams skip and the one that matters most. If your team spends three months building a custom analytics dashboard, what features will they not build during that time? What revenue will those missing features cost you?

The opportunity cost is nearly always the decisive factor. Engineering time is your scarcest resource. Spend it where it creates the most value. Understanding this trade-off is a key part of [the senior developer mindset](/career/the-senior-developer-mindset).

<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" aria-label="Stacked area chart comparing total cost of ownership over 5 years for build vs buy decisions">
  <style>
    .tco-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #334155; }
    .tco-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #334155; }
    .tco-axis { font-family: 'Inter', sans-serif; font-size: 10px; fill: #94a3b8; }
    .tco-value { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
  </style>
  <text x="300" y="25" text-anchor="middle" class="tco-title">Total Cost of Ownership: Build vs Buy (5 Years)</text>
  <!-- Axes -->
  <line x1="80" y1="50" x2="80" y2="250" stroke="#e2e8f0" stroke-width="1"/>
  <line x1="80" y1="250" x2="560" y2="250" stroke="#e2e8f0" stroke-width="1"/>
  <!-- Y axis labels -->
  <text x="75" y="254" text-anchor="end" class="tco-axis">£0</text>
  <text x="75" y="204" text-anchor="end" class="tco-axis">£100k</text>
  <text x="75" y="154" text-anchor="end" class="tco-axis">£200k</text>
  <text x="75" y="104" text-anchor="end" class="tco-axis">£300k</text>
  <text x="75" y="54" text-anchor="end" class="tco-axis">£400k</text>
  <!-- Grid lines -->
  <line x1="80" y1="200" x2="560" y2="200" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="80" y1="150" x2="560" y2="150" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="80" y1="100" x2="560" y2="100" stroke="#f1f5f9" stroke-width="1"/>
  <!-- X axis labels -->
  <text x="176" y="268" text-anchor="middle" class="tco-axis">Year 1</text>
  <text x="272" y="268" text-anchor="middle" class="tco-axis">Year 2</text>
  <text x="368" y="268" text-anchor="middle" class="tco-axis">Year 3</text>
  <text x="464" y="268" text-anchor="middle" class="tco-axis">Year 4</text>
  <text x="545" y="268" text-anchor="middle" class="tco-axis">Year 5</text>
  <!-- Build line (red) - starts high, grows steadily -->
  <polyline points="80,250 176,140 272,120 368,100 464,80 545,60" fill="none" stroke="#ef4444" stroke-width="2.5"/>
  <circle cx="176" cy="140" r="3" fill="#ef4444"/>
  <circle cx="272" cy="120" r="3" fill="#ef4444"/>
  <circle cx="368" cy="100" r="3" fill="#ef4444"/>
  <circle cx="464" cy="80" r="3" fill="#ef4444"/>
  <circle cx="545" cy="60" r="3" fill="#ef4444"/>
  <!-- Buy line (green) - starts lower, grows slowly -->
  <polyline points="80,250 176,210 272,190 368,170 464,155 545,140" fill="none" stroke="#22c55e" stroke-width="2.5"/>
  <circle cx="176" cy="210" r="3" fill="#22c55e"/>
  <circle cx="272" cy="190" r="3" fill="#22c55e"/>
  <circle cx="368" cy="170" r="3" fill="#22c55e"/>
  <circle cx="464" cy="155" r="3" fill="#22c55e"/>
  <circle cx="545" cy="140" r="3" fill="#22c55e"/>
  <!-- Labels -->
  <text x="548" y="55" class="tco-label" fill="#ef4444">Build</text>
  <text x="548" y="135" class="tco-label" fill="#22c55e">Buy</text>
  <text x="300" y="300" text-anchor="middle" class="tco-value">Build costs include: dev salaries, maintenance (15-20%/yr), opportunity cost</text>
  <text x="300" y="314" text-anchor="middle" class="tco-value">Buy costs include: licence fees, integration, per-seat pricing</text>
</svg>

## Hybrid Approaches

The decision is not always purely build or buy. Common hybrid patterns include:

- **Buy the platform, build the integration layer.** Use a third-party service but build a custom abstraction layer that isolates your codebase from the vendor's API. This makes switching vendors easier in the future. Good [API design principles](/backend/api-design-principles-every-developer-should-know) are essential here.
- **Buy now, build later.** Start with a purchased solution to move quickly. If your requirements outgrow it, you will have learned exactly what you need from a custom solution through real-world usage.
- **Build the core, buy the periphery.** Build the unique, differentiating parts of your system. Buy everything else.

## Making the Decision Stick

Once you have decided, commit to it. The worst outcome is building 60% of a custom solution, deciding it is too expensive, switching to a purchased product, and then discovering it does not meet your needs either.

Document the decision, the reasoning, and the criteria for revisiting it. Technology decisions age, and a "buy" decision today might become a "build" decision in two years as your requirements evolve. Having the original rationale recorded makes future reassessment much easier. For more on making lasting architecture decisions, see [the pragmatic approach to microservices](/architecture/the-pragmatic-approach-to-microservices) and [monorepos vs polyrepos](/architecture/monorepos-vs-polyrepos-which-is-right-for-you).

For further reading, <a href="https://martinfowler.com/articles/is-quality-worth-cost.html" target="_blank" rel="noopener noreferrer">Martin Fowler's writing on software quality and cost ↗</a> provides excellent context on why the true cost of building is almost always higher than the initial estimate.
