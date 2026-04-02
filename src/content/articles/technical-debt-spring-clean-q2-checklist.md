---
title: "Technical Debt Spring Clean: A Developer's Q2 Checklist"
description: "A practical Q2 checklist for tackling technical debt. Audit dependencies, clean dead code, fix linter warnings, and prioritise what to refactor first."
publishDate: "2026-04-02"
author: "jonny-rowse"
category: "code-quality"
tags: ["technical-debt", "refactoring", "code-quality", "Q2", "spring-clean"]
featured: false
draft: false
faqs:
  - question: "How much time should a team spend on technical debt?"
    answer: "A common guideline is 15 to 20 percent of each sprint or development cycle. This is enough to make steady progress without derailing feature work. Some teams dedicate one full sprint per quarter to debt reduction, which can work well if the debt is concentrated in specific areas."
  - question: "What is the difference between technical debt and bad code?"
    answer: "Technical debt is a deliberate or incidental shortcut that made sense at the time but now carries a maintenance cost. Bad code is code that was poorly written from the start. The distinction matters because debt implies a rational trade-off (speed over quality), while bad code implies a skill or process gap. Both need addressing, but the approach differs."
  - question: "Should we fix technical debt before adding new features?"
    answer: "Not necessarily. The best approach is to address debt that directly blocks or slows the features you are building. If a module is stable, untouched, and not causing issues, leaving its debt alone is a valid choice. Fix debt where it has the highest impact on your current and near-future work."
  - question: "How do I convince my manager that technical debt matters?"
    answer: "Frame it in business terms. Measure the time lost to workarounds, bugs caused by brittle code, or onboarding delays due to confusing architecture. A statement like 'we spend four hours per week working around this problem, which costs us X per year' is more persuasive than 'the code is messy.'"
  - question: "Is it worth updating dependencies that are not causing problems?"
    answer: "Yes, within reason. Dependencies that fall too far behind become progressively harder and riskier to update. A quarterly update cycle keeps you close enough to the latest versions that each update is small and manageable, rather than a major migration that nobody wants to tackle."
primaryKeyword: "technical debt spring clean"
---

Q2 has arrived. If your codebase survived Q1 intact, congratulations. If it survived with a growing list of TODOs, ignored linter warnings, and dependencies that nobody has touched since last summer, you are not alone. That is the reality for most teams.

The start of a new quarter is a natural point to step back and deal with the mess. Not all of it, but enough to stop it compounding. This checklist gives you a practical, prioritised approach to cleaning up technical debt without losing momentum on feature work.

## Why Q2 Is the Right Time for This

Every quarter could be the right time, but Q2 has a few things going for it.

You have just finished Q1 planning and delivery. The team has context on what slowed them down, what broke, and where the pain points are. That context fades quickly, so capturing it now while the frustrations are fresh gives you a better sense of what to prioritise.

For UK businesses, the new financial year started on 6 April. If your team works in sprints or cycles aligned to the financial year, this is your reset point. It is also far enough from the end of the year that any improvements you make will pay dividends for months.

## 1. Audit Your Dependencies

Outdated dependencies are one of the most common and most ignored forms of technical debt. They quietly accumulate security vulnerabilities, miss performance improvements, and eventually reach a point where upgrading becomes a major project rather than a routine task.

### What to do this week

- Run your package manager's audit command (`npm audit`, `pip-audit`, `bundle audit`, or equivalent) and note the number and severity of vulnerabilities
- Check how far behind your major dependencies are. If your framework is three or more major versions behind, that is a red flag
- Update patch and minor versions first; these are lowest risk and highest reward
- For major version updates, create a separate branch and run your test suite before merging

### What to skip

Do not update a dependency just because a new version exists. If the changelog does not include security fixes, performance improvements, or features you need, the update can wait. Focus on dependencies that pose a genuine risk or that block other work.

## 2. Review Your TODO Comments

TODO comments are promises to your future self. By Q2, many of those promises are months old and have lost their original context.

Search your codebase for `TODO`, `FIXME`, `HACK`, and `XXX`. For each one:

- **If the context is gone and nobody knows why it was added:** delete it. A TODO with no actionable context is just noise.
- **If it describes a real problem that should be fixed:** create a ticket in your issue tracker. A TODO in code is invisible to product owners and project managers. A ticket is visible and can be prioritised.
- **If the TODO has been fixed but the comment was never removed:** delete it.

Most codebases have dozens of stale TODOs. Clearing them out takes surprisingly little time and makes the codebase feel noticeably cleaner.

## 3. Clean Up Dead Code

Dead code is code that is no longer called, referenced, or reachable. It sits there taking up space, appearing in search results, confusing new developers, and occasionally triggering false positives in static analysis.

### How to find it

- Use your IDE's "find usages" feature on functions, classes, and exports that look suspicious
- Run a dead code detection tool. For JavaScript/TypeScript projects, `ts-prune` or `knip` can identify unused exports. For Python, `vulture` does similar work
- Check for feature flags that were enabled months ago and never removed. The flag is dead; the code behind the other branch of the conditional is dead too
- Look for commented-out code blocks. If code has been commented out for more than a sprint, delete it. Version control exists for a reason

### What to be careful about

Do not delete code you are not sure about without checking. Some code may be called dynamically, through reflection, or via routes that are not statically analysable. When in doubt, grep for the function name across the entire repo before removing it.

Our article on [TypeScript patterns that make your code safer](/code-quality/typescript-patterns-that-make-your-code-safer) covers how strong typing can help identify dead code more reliably.

## 4. Address Linter Warnings

If your CI pipeline has been accumulating linter warnings that nobody fixes, Q2 is the time to draw a line. Warnings are not errors, but they erode code quality gradually. A codebase with 200 unresolved warnings creates a culture where new warnings go unnoticed.

### A practical approach

1. Run your linter and count the total warnings
2. Categorise them: are most of them stylistic, complexity-related, or potential bugs?
3. Fix the potential bugs first (unused variables that shadow outer scope, missing error handling, unreachable code)
4. For stylistic warnings, consider whether the rule is worth enforcing. If the team consistently ignores a rule, either fix all violations and enforce it, or disable the rule. Half-enforced rules help nobody
5. Set a CI threshold: new PRs must not increase the warning count. This prevents the total from growing while you chip away at the backlog

## 5. Update Your Documentation

Documentation debt is real debt. Outdated README files, incorrect API docs, and stale architecture diagrams cost real time when new team members join or when someone revisits a system after months away.

### What to check

- **README files:** Does the setup guide still work? Can a new developer follow it and get a running local environment?
- **API documentation:** Do the documented endpoints, parameters, and response formats match the current implementation?
- **Architecture diagrams:** If you have system diagrams, do they reflect the current architecture or the architecture from 18 months ago?
- **Runbooks and deployment guides:** Can someone who has never deployed the system follow your guide and succeed?

You do not need to rewrite everything. Spend 30 minutes on each document, fix what is obviously wrong, and flag anything that needs a deeper rewrite. If you want guidance on writing docs that developers actually use, our article on [writing documentation developers actually read](/collaboration/writing-documentation-developers-actually-read) is worth a look.

## 6. Identify and Address Refactoring Hotspots

Not all technical debt is equally harmful. Some debt sits in code that is rarely touched and causes no problems. Other debt sits in code that the team modifies weekly, causing friction, bugs, and slow reviews every time.

### How to find hotspots

The most effective approach combines two metrics:

- **Change frequency:** Which files are modified most often? Your version control history tells you this. Run `git log --format=format: --name-only | sort | uniq -c | sort -rn | head -20` to see the 20 most-changed files.
- **Complexity:** Which files are the most complex? Use a tool like `scc` (lines of code) or a cyclomatic complexity analyser for your language.

Files that are both frequently changed and highly complex are your refactoring hotspots. These are the files where debt has the highest cost, because every change to them is slower, riskier, and harder to review. Investing time in simplifying these files pays for itself quickly.

If you are looking at your [pull request review process](/collaboration/why-your-pull-requests-take-too-long) and finding that certain files always cause delays, those are likely your hotspots.

## 7. Prioritise What to Tackle First

You will not fix everything in Q2, and you should not try. The goal is to make targeted improvements that reduce the cost of future work. Here is a framework for prioritising:

| Priority | Criteria | Action |
|----------|----------|--------|
| High | Blocks current feature work or causes production incidents | Fix this sprint |
| Medium | Slows the team down regularly (slow tests, confusing code, flaky CI) | Schedule for Q2 |
| Low | Annoying but not actively harmful (style inconsistencies, old TODOs) | Batch and fix during downtime |
| Skip | Stable, rarely touched, not causing problems | Leave it alone |

The hardest discipline in technical debt management is leaving stable, working debt alone. Not everything needs to be clean. Refactoring code that nobody touches is satisfying but does not improve your team's velocity or your product's reliability.

## A Practical Q2 Schedule

Here is how to fit this checklist into a normal Q2 without disrupting feature delivery:

| Week | Focus | Time needed |
|------|-------|-------------|
| Week 1 (first week of April) | Dependency audit and security updates | 2 to 4 hours |
| Week 2 | TODO cleanup and dead code removal | 2 to 3 hours |
| Week 3 | Linter warning triage and CI threshold | 2 to 3 hours |
| Week 4 | Documentation review | 1 to 2 hours |
| Ongoing | Refactoring hotspots (one per sprint) | 1 to 2 hours per sprint |

Spread across a month, this is roughly one to two hours per week. That is a small investment for a meaningfully cleaner codebase heading into summer.

## The Compound Effect

Technical debt compounds. A small shortcut in January makes a February feature slightly harder. By April, three shortcuts have stacked on top of each other and now every change to that area takes twice as long as it should.

The good news is that cleaning up debt compounds too. Each improvement makes the next change slightly easier, slightly faster, slightly less risky. Over a quarter, those small gains add up to a noticeably better development experience.

You do not need a perfect codebase. You need one that is clean enough to work in productively. This checklist gets you there.
