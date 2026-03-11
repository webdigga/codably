---
title: "Technical Debt: When to Fix It and When to Leave It"
description: "Learn when to fix technical debt and when to leave it alone. A practical framework for making smart tradeoff decisions."
publishDate: "2026-03-05"
author: "david-white"
category: "code-quality"
tags: ["technical-debt", "code-quality", "refactoring", "engineering-management", "software-design"]
featured: false
draft: false
faqs:
  - question: "What is technical debt?"
    answer: "Technical debt is the accumulated cost of shortcuts, workarounds, and suboptimal decisions in a codebase. Like financial debt, it incurs ongoing interest in the form of slower development, more bugs, and higher maintenance costs. Some technical debt is deliberate and strategic; some is accidental."
  - question: "Is all technical debt bad?"
    answer: "No. Deliberate, well-understood technical debt can be a rational business decision. Shipping a simpler solution now to capture a market opportunity and planning to improve it later is a valid strategy. The problems arise when debt is taken on unknowingly, is not tracked, or accumulates beyond the team's ability to manage it."
  - question: "How do you convince management to invest in fixing technical debt?"
    answer: "Frame it in business terms, not technical ones. Instead of saying 'we need to refactor the authentication module,' say 'our login-related bug rate has tripled in six months, and fixing each one takes three times longer than it should because of accumulated complexity. Investing two sprints now will reduce our bug fix time by 60%.'"
  - question: "How much time should a team spend on technical debt?"
    answer: "A common guideline is 15 to 20 percent of engineering capacity dedicated to debt reduction and maintenance. Some teams use a rotating 'tech debt champion' who focuses on improvements each sprint. The right amount depends on the severity of your debt and the pace of new feature work."
  - question: "What is the difference between technical debt and bad code?"
    answer: "Technical debt implies a deliberate or at least conscious tradeoff where speed was prioritised over quality. Bad code is simply poorly written with no strategic rationale. The distinction matters because debt can be managed strategically, while bad code should be fixed as soon as it is identified."
primaryKeyword: "technical debt"
---

## Every Codebase Has Debt. The Question Is What to Do About It.

Technical debt is one of the most misused terms in software engineering. It gets applied to everything from a missing null check to an entire legacy system that should have been retired years ago. This vagueness makes it hard to have productive conversations about it.

<a href="https://wiki.c2.com/?WardExplainsDebtMetaphor" target="_blank" rel="noopener noreferrer">Ward Cunningham, who coined the term ↗</a>, was specific about what he meant. Technical debt is the gap between your current understanding of the problem and what the code reflects. As your understanding grows, the code falls behind. That gap has a cost.

The challenge is not eliminating all debt. That is neither possible nor desirable. The challenge is knowing which debt to fix, which to leave alone, and which to take on deliberately. Working with teams over the years, I have found that the most effective engineering organisations are not debt-free; they are debt-aware.

## A Taxonomy of Technical Debt

Not all debt is equal. Understanding the different types helps you make better decisions about what to address. Martin Fowler's <a href="https://martinfowler.com/bliki/TechnicalDebtQuadrant.html" target="_blank" rel="noopener noreferrer">Technical Debt Quadrant ↗</a> provides a useful framework:

| | Prudent | Reckless |
|---|---|---|
| **Deliberate** | "We know this is not ideal, but shipping now lets us validate the idea." | "We do not have time for proper design. Just ship it." |
| **Accidental** | "Now that we have shipped, we see a better approach we did not know before." | "What is dependency injection?" |

### Deliberate, Prudent Debt

"We know this is not ideal, but shipping now with this simpler approach lets us validate the feature before investing in the robust solution."

This is healthy debt. It is taken on consciously with a plan to address it. The key is that "plan to address it" part. Deliberate debt without a repayment plan is just procrastination.

### Deliberate, Reckless Debt

"We do not have time for proper design. Just ship it."

This type of debt is taken on knowingly but without care for the consequences. It tends to compound quickly because the shortcuts often interact in unexpected ways.

### Accidental, Prudent Debt

"Now that we have shipped, we realise there is a better approach we did not see before."

This is inevitable. You learn from building. The code you wrote six months ago reflects your understanding at the time. Now you know more. The debt exists because your knowledge grew, not because you were careless.

### Accidental, Reckless Debt

"What is dependency injection?"

This is debt created by a lack of knowledge or skill. It is the most dangerous type because the team may not even recognise it as debt. It requires either education or more experienced engineers to identify and address.

## The Cost of Carrying Debt

Technical debt has a compound interest rate. The longer you carry it, the more it costs.

<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" aria-label="Line chart showing how the cost of carrying technical debt compounds over time, with three lines representing low, medium, and high debt levels, demonstrating exponential growth in the cost of feature delivery.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="300" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">How Technical Debt Compounds Over Time</text>
  <!-- Axes -->
  <line x1="60" y1="40" x2="60" y2="260" stroke="#cbd5e1" stroke-width="1" />
  <line x1="60" y1="260" x2="570" y2="260" stroke="#cbd5e1" stroke-width="1" />
  <!-- Y-axis label -->
  <text x="16" y="150" text-anchor="middle" font-size="11" fill="#64748b" transform="rotate(-90, 16, 150)">Cost per Feature</text>
  <!-- X-axis label -->
  <text x="315" y="290" text-anchor="middle" font-size="11" fill="#64748b">Time</text>
  <!-- Y-axis ticks -->
  <text x="50" y="260" text-anchor="end" font-size="10" fill="#64748b">Low</text>
  <text x="50" y="150" text-anchor="end" font-size="10" fill="#64748b">Med</text>
  <text x="50" y="48" text-anchor="end" font-size="10" fill="#64748b">High</text>
  <!-- X-axis ticks -->
  <text x="60" y="278" font-size="10" fill="#64748b">Month 1</text>
  <text x="230" y="278" font-size="10" fill="#64748b">Month 6</text>
  <text x="400" y="278" font-size="10" fill="#64748b">Month 12</text>
  <text x="530" y="278" font-size="10" fill="#64748b">Month 18</text>
  <!-- Grid lines -->
  <line x1="60" y1="150" x2="570" y2="150" stroke="#f1f5f9" stroke-width="1" />
  <!-- Low debt line (green, gradual) -->
  <polyline points="60,240 145,235 230,228 315,220 400,210 485,200 570,188" fill="none" stroke="#22c55e" stroke-width="2.5" />
  <!-- Medium debt line (amber, moderate growth) -->
  <polyline points="60,240 145,225 230,200 315,170 400,135 485,100 570,70" fill="none" stroke="#f59e0b" stroke-width="2.5" />
  <!-- High debt line (red, steep) -->
  <polyline points="60,240 145,210 230,165 315,110 400,65 485,48 570,42" fill="none" stroke="#ef4444" stroke-width="2.5" />
  <!-- Legend -->
  <line x1="160" y1="42" x2="185" y2="42" stroke="#22c55e" stroke-width="2.5" />
  <text x="190" y="46" font-size="11" fill="#334155">Managed debt</text>
  <line x1="310" y1="42" x2="335" y2="42" stroke="#f59e0b" stroke-width="2.5" />
  <text x="340" y="46" font-size="11" fill="#334155">Moderate debt</text>
  <line x1="460" y1="42" x2="485" y2="42" stroke="#ef4444" stroke-width="2.5" />
  <text x="490" y="46" font-size="11" fill="#334155">High debt</text>
</svg>

### Slower Feature Development

When a codebase is tangled with shortcuts and workarounds, every new feature takes longer to implement. Developers spend more time understanding the existing code, working around its limitations, and testing for regressions caused by the fragile structure.

### Higher Bug Rates

Poorly structured code has more hiding places for bugs. When a module has unclear boundaries, implicit dependencies, and missing tests, changes in one area create unexpected failures in others. Our article on [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help) covers strategies for building the safety net that makes debt manageable.

### Onboarding Friction

New team members ramp up slowly in a codebase full of debt. Undocumented workarounds, inconsistent patterns, and code that does not match the team's current practices all create confusion that takes time to resolve. Good [documentation](/collaboration/writing-documentation-developers-actually-read) helps, but it cannot fully compensate for a codebase that is difficult to reason about.

### Developer Attrition

Talented engineers leave teams where they spend most of their time fighting the codebase. The frustration of working with poorly maintained systems is a significant factor in developer turnover, and the cost of replacing experienced engineers is substantial.

## When to Fix Technical Debt

### When You Are Already Working in the Area

The most efficient time to address debt is when you are already making changes in the affected code. If you need to add a feature to a module with known debt, take the time to clean up the immediate area. This "boy scout rule" approach (leave the code better than you found it) addresses debt incrementally without requiring dedicated refactoring sprints.

### When Debt Is Actively Blocking Progress

If a piece of technical debt is consistently slowing down feature work, causing bugs, or creating incidents, it has crossed the threshold from manageable to blocking. At this point, the cost of not fixing it exceeds the cost of fixing it.

Signs that debt has become blocking:

- Multiple developers mention the same pain point independently
- Bug rates in a particular area are significantly higher than elsewhere
- Simple changes in the affected area regularly take days instead of hours
- New team members consistently struggle with the same codebase sections

### When Debt Creates Risk

Security vulnerabilities, data integrity issues, and reliability problems deserve immediate attention regardless of feature priorities. Debt in these areas is not a productivity problem; it is a business risk problem.

### When You Need to Scale

Code that works fine for ten users may collapse at ten thousand. If you know growth is coming, addressing performance-related debt before it becomes a crisis is far cheaper than addressing it during one.

## When to Leave Debt Alone

### When the Code Is Stable and Rarely Changed

A module that works correctly, has no known bugs, and rarely needs modification does not need to be refactored. The fact that it does not follow your current coding standards is not a reason to rewrite it. If nobody needs to read or change it, the debt is not accruing interest. This is a case where [boring technology](/architecture/the-case-for-boring-technology) serves you well.

### When the Code Is Being Replaced

If a system is scheduled for replacement, investing in cleaning up the old codebase is wasted effort. Focus your energy on building the replacement well rather than polishing something that will be decommissioned.

### When the Cost of Fixing Exceeds the Cost of Carrying

Some debt is expensive to fix relative to the ongoing cost of carrying it. A poorly designed database schema that would require a complex data migration might be cheaper to work around at the application layer than to fix properly, especially if the workaround is well-documented and contained. Our article on [database migrations without the fear](/backend/database-migrations-without-the-fear) covers how to approach these situations when you do decide to fix them.

### When You Lack Context

Refactoring code you do not fully understand often creates new problems. If you cannot explain why the code is the way it is, there may be edge cases or historical reasons you are not aware of. Gather context before making changes.

## A Practical Framework

When evaluating whether to address a specific piece of debt, score it on these dimensions:

| Dimension | Low | Medium | High |
|---|---|---|---|
| **Impact** | Minor inconvenience | Noticeable slowdown | Major blocker |
| **Frequency** | Rarely encountered | Monthly | Weekly or daily |
| **Risk** | Cosmetic | Moderate failure | Severe outage or data loss |
| **Cost to fix** | Hours | Days | Weeks or months |
| **Urgency** | Stable | Slowly worsening | Rapidly worsening |

High-impact, frequently encountered, risky, cheap-to-fix, worsening debt should be addressed immediately. Low-impact, rarely encountered, stable, expensive-to-fix debt can wait indefinitely.

## Making the Case for Debt Reduction

Engineers often struggle to get buy-in for debt reduction because they frame it in technical terms. "We need to refactor the service layer" means nothing to a product manager or business stakeholder.

Instead, frame it in terms of outcomes:

- "If we clean this up, we can ship the next three features 40% faster."
- "This area causes two production incidents per month. Fixing it will reduce that to near zero."
- "New developers currently take three weeks to become productive in this area. After the cleanup, it should take three days."

Quantify where possible. Track the time spent on workarounds, the frequency of related bugs, and the velocity difference between clean and messy areas of the codebase. Numbers make the argument far more compelling than technical explanations. I have found that when you present the data, even the most feature-focused product managers understand the investment case.

## Living With Debt Responsibly

Debt is not a failure; it is a tool. Used wisely, it lets you move fast when speed matters. The goal is not a debt-free codebase. It is a codebase where the debt is known, tracked, and deliberately managed.

Document your known debt. Track it alongside your feature work. Allocate time for it consistently rather than in occasional "cleanup sprints" that never seem to happen. And most importantly, make conscious decisions about when to take it on and when to pay it down.

For a broader perspective on making pragmatic engineering decisions, our article on [the senior developer mindset](/career/the-senior-developer-mindset) explores the kind of tradeoff thinking that effective debt management requires. The <a href="https://martinfowler.com/bliki/TechnicalDebt.html" target="_blank" rel="noopener noreferrer">collected writing on technical debt at martinfowler.com ↗</a> is also an excellent resource for deepening your understanding of the concept.
