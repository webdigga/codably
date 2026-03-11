---
title: "Code Reviews That Don't Waste Time"
description: "Run code reviews that catch real issues without becoming a bottleneck. Practical tips for reviewers and authors."
publishDate: "2026-03-06"
author: "gareth-clubb"
category: "collaboration"
tags: ["code-review", "collaboration", "engineering-culture", "pull-requests", "team-productivity"]
featured: false
draft: false
faqs:
  - question: "How long should a code review take?"
    answer: "Most reviews should take under 30 minutes. If a pull request takes longer to review, it is probably too large. Aim for pull requests that can be reviewed in 15 to 20 minutes. Research suggests reviewer effectiveness drops significantly after 60 minutes."
  - question: "How large should a pull request be?"
    answer: "Keep pull requests under 400 lines of meaningful changes. Studies show that reviewer attention drops sharply beyond this threshold. If your change is larger, break it into smaller, logically coherent pull requests that can be reviewed independently."
  - question: "Should code style be part of code review?"
    answer: "No. Automate style enforcement with tools like Prettier, ESLint, or Black. Humans should review logic, architecture, and edge cases. Spending review time on bracket placement or import ordering is a waste of everyone's attention."
  - question: "How quickly should code reviews be completed?"
    answer: "Teams should aim for a median review turnaround of under 4 hours during working hours. Waiting longer than a day for review feedback creates context-switching costs as the author moves on to other work and then has to reload the context."
  - question: "How do you give constructive feedback in code reviews?"
    answer: "Frame feedback as questions or suggestions rather than commands. Explain the reasoning behind your concerns. Distinguish between blocking issues and optional improvements. Use prefixes like 'nit:' for minor style preferences and 'question:' for things you want to understand better."
primaryKeyword: "code reviews"
---

## Code Reviews Should Help, Not Hinder

Code review is one of those practices that everyone agrees is valuable, yet many teams implement in ways that slow them down more than they help. Reviews sit unattended for days. Reviewers bikeshed on formatting while missing logic errors. Authors submit enormous pull requests that nobody can review effectively.

When done well, code review catches bugs, spreads knowledge, and improves code quality. When done poorly, it becomes a bottleneck that frustrates everyone involved. I have worked with teams on both ends of this spectrum, and the difference in delivery speed and morale is stark.

The difference is not about how rigorous you are. It is about where you direct your attention.

## The Real Purpose of Code Review

Before optimising the process, align on what code review is actually for:

1. **Catching defects** that automated tests miss
2. **Sharing knowledge** across the team so no one person is a bottleneck
3. **Maintaining consistency** in design patterns and architectural decisions
4. **Mentoring** less experienced developers through constructive feedback

Notice what is not on this list: enforcing code style. That is a job for automated tools, not humans. Every minute a reviewer spends commenting on bracket placement or import ordering is a minute they are not spending on logic, security, or design. For more on automating this away, see [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters).

## Writing Reviewable Pull Requests

Good reviews start with good pull requests. As the author, your job is to make the reviewer's task as easy as possible.

### Keep Them Small

This is the single most impactful thing you can do. Research from <a href="https://smartbear.com/learn/code-review/best-practices-for-peer-code-review/" target="_blank" rel="noopener noreferrer">SmartBear's study of code review practices ↗</a> found that review effectiveness drops dramatically when pull requests exceed 200 to 400 lines. Beyond 400 lines, reviewers start skimming rather than reading carefully.

| PR Size (lines changed) | Defect Detection Rate | Typical Review Time | Reviewer Attention |
|---|---|---|---|
| Under 200 | High (70-90%) | 15-20 minutes | Full attention |
| 200-400 | Moderate (50-70%) | 20-30 minutes | Good attention |
| 400-800 | Low (30-50%) | 30-60 minutes | Declining |
| Over 800 | Very low (under 30%) | 60+ minutes | Skimming |

If your feature requires 1,500 lines of changes, break it into a sequence of smaller pull requests:

- First PR: data model and migrations
- Second PR: service layer logic
- Third PR: API endpoints
- Fourth PR: frontend integration

Each PR should be independently coherent and, ideally, independently deployable. For a deeper look at why large PRs are problematic, see [why your pull requests take too long](/collaboration/why-your-pull-requests-take-too-long).

### Write a Meaningful Description

Your pull request description should answer three questions:

1. **What** does this change do?
2. **Why** is this change needed?
3. **How** should the reviewer approach it?

Include context that is not obvious from the code. Link to the relevant ticket or design document. If you made a non-obvious decision, explain your reasoning. This saves the reviewer from having to reconstruct your thought process.

### Self-Review Before Requesting Review

Before tagging a reviewer, review your own changes. Read through the diff as if you were seeing it for the first time. You will often catch issues that are obvious in hindsight:

- Debugging code left in by accident
- Commented-out code that should be removed
- Missing error handling
- Inconsistencies with existing patterns

This takes five minutes and saves your reviewer from wasting time on avoidable issues.

### Highlight Areas of Concern

If there are parts of your change you are unsure about, say so explicitly. "I am not confident this handles the concurrent access case correctly. Would appreciate a careful look at lines 45 to 60." This directs the reviewer's attention to where it is most valuable.

<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the code review workflow from PR creation through self-review, automated checks, human review, to merge, with feedback loops at each stage.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="300" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Effective Code Review Workflow</text>
  <!-- Flow boxes -->
  <rect x="30" y="55" width="120" height="50" rx="6" fill="#3b82f6" />
  <text x="90" y="76" text-anchor="middle" font-size="11" fill="#ffffff" font-weight="500">Write Code</text>
  <text x="90" y="92" text-anchor="middle" font-size="10" fill="#dbeafe">Author</text>
  <rect x="180" y="55" width="120" height="50" rx="6" fill="#8b5cf6" />
  <text x="240" y="76" text-anchor="middle" font-size="11" fill="#ffffff" font-weight="500">Self-Review</text>
  <text x="240" y="92" text-anchor="middle" font-size="10" fill="#ede9fe">5 minutes</text>
  <rect x="330" y="55" width="120" height="50" rx="6" fill="#64748b" />
  <text x="390" y="76" text-anchor="middle" font-size="11" fill="#ffffff" font-weight="500">Auto Checks</text>
  <text x="390" y="92" text-anchor="middle" font-size="10" fill="#e2e8f0">CI/Lint/Tests</text>
  <rect x="480" y="55" width="100" height="50" rx="6" fill="#22c55e" />
  <text x="530" y="76" text-anchor="middle" font-size="11" fill="#ffffff" font-weight="500">Human</text>
  <text x="530" y="92" text-anchor="middle" font-size="10" fill="#dcfce7">Review</text>
  <!-- Arrows -->
  <line x1="150" y1="80" x2="178" y2="80" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrow)" />
  <line x1="300" y1="80" x2="328" y2="80" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrow)" />
  <line x1="450" y1="80" x2="478" y2="80" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrow)" />
  <!-- Merge -->
  <rect x="220" y="150" width="160" height="50" rx="6" fill="#22c55e" />
  <text x="300" y="171" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Merge</text>
  <text x="300" y="188" text-anchor="middle" font-size="10" fill="#dcfce7">Approved + Checks Pass</text>
  <line x1="530" y1="105" x2="530" y2="135" stroke="#cbd5e1" stroke-width="1.5" />
  <line x1="530" y1="135" x2="382" y2="150" stroke="#cbd5e1" stroke-width="1.5" marker-end="url(#arrow)" />
  <!-- Feedback loop -->
  <path d="M 530 105 C 530 135 560 145 560 170 C 560 220 350 230 90 220 C 50 218 30 180 30 130 L 30 107" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrowRed)" />
  <text x="310" y="248" text-anchor="middle" font-size="10" fill="#ef4444">Feedback loop (if changes needed)</text>
  <!-- Review focus areas -->
  <text x="300" y="285" text-anchor="middle" font-size="12" font-weight="600" fill="#334155">What Humans Should Review</text>
  <text x="100" y="308" text-anchor="middle" font-size="10" fill="#64748b">Logic errors</text>
  <text x="220" y="308" text-anchor="middle" font-size="10" fill="#64748b">Edge cases</text>
  <text x="330" y="308" text-anchor="middle" font-size="10" fill="#64748b">Security</text>
  <text x="430" y="308" text-anchor="middle" font-size="10" fill="#64748b">Design fit</text>
  <text x="530" y="308" text-anchor="middle" font-size="10" fill="#64748b">Missing tests</text>
  <!-- Arrow markers -->
  <defs>
    <marker id="arrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M 0 0 L 8 3 L 0 6 Z" fill="#cbd5e1" />
    </marker>
    <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M 0 0 L 8 3 L 0 6 Z" fill="#ef4444" />
    </marker>
  </defs>
</svg>

## Reviewing Effectively

### Understand Before Criticising

Start by reading the pull request description and understanding the goal. Then read through the changes with that goal in mind. Many review comments come from misunderstanding the intent, not from genuine issues with the code.

If something confuses you, ask a question before suggesting a change. "I do not understand why this needs to be async. Can you explain?" is more productive than "This should not be async."

### Prioritise Your Feedback

Not all review comments are equal. Use a clear system to distinguish between:

- **Blocking issues:** Bugs, security vulnerabilities, missing error handling, incorrect business logic. These must be fixed before merging.
- **Suggestions:** Better approaches, cleaner patterns, or more idiomatic code. Worth considering but not required.
- **Nitpicks:** Minor style preferences that are not covered by your automated tooling. Prefix these with "nit:" so the author knows they are optional.

When a review has fifteen comments and all are presented with equal weight, the author cannot tell which ones actually matter. Be explicit.

### Focus on What Machines Cannot Catch

Automated tools handle formatting, linting, type checking, and many common bugs. Your value as a human reviewer is in the things automation misses:

- **Logic errors:** Does the code actually do what the description claims?
- **Edge cases:** What happens with empty inputs, null values, or concurrent requests?
- **Security:** Is user input properly validated? Are permissions checked correctly?
- **Design:** Does this change fit well with the existing architecture?
- **Naming:** Are variables and functions named in a way that makes the code self-documenting?
- **Missing tests:** Are the important behaviours covered by tests?

### Time-Box Your Reviews

Set a time limit for each review. If you cannot complete a review in 30 minutes, the pull request is probably too large. Tell the author and suggest splitting it.

If you find yourself going down a rabbit hole trying to understand a complex section, stop and ask the author to add comments or documentation. If it is hard to review, it will be hard to maintain.

## Common Anti-Patterns

### The Gatekeeper

A reviewer who blocks every PR with a long list of style preferences and personal opinions. This creates a bottleneck and demoralises the team. Remember: the goal is not to make the code look exactly how you would have written it. It is to ensure it is correct, secure, and maintainable.

### The Rubber Stamp

A reviewer who approves everything without reading it. This provides no value and gives a false sense of security. If you do not have time to review properly, say so and let someone else review it.

### The Delayed Review

Pull requests sitting for days without review. This forces authors to context-switch when feedback finally arrives and often leads to merge conflicts. Set a team expectation for review turnaround time and hold each other accountable.

### Bikeshedding

Spending twenty comments debating whether a variable should be called `userData` or `userInfo` while a SQL injection vulnerability goes unnoticed. Automate the trivial decisions and save your attention for the important ones. As the <a href="https://en.wikipedia.org/wiki/Law_of_triviality" target="_blank" rel="noopener noreferrer">law of triviality ↗</a> (Parkinson's law of triviality) describes, people give disproportionate weight to trivial issues precisely because they are easy to have opinions about.

## Process Improvements

### Automate Everything You Can

Before a human sees the PR, these checks should have already passed:

- Code formatting (Prettier, Black, gofmt)
- Linting (ESLint, pylint, clippy)
- Type checking (TypeScript, mypy)
- Unit tests
- Build verification
- Security scanning (Snyk, CodeQL)

If any of these fail, the PR should not be eligible for human review. This ensures reviewers spend their time on problems that require human judgement. For guidance on setting this up, see our article on [building a CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works).

### Rotate Reviewers

Avoid having the same person review all pull requests. Rotating reviewers spreads knowledge, prevents bottlenecks, and exposes different parts of the codebase to different perspectives.

### Pair on Complex Changes

For particularly complex or risky changes, consider [pair programming](/collaboration/why-pair-programming-works-and-when-it-doesnt) instead of asynchronous review. A 30-minute pairing session is often more effective than multiple rounds of review comments and revisions.

## Measuring Review Health

Track these metrics to ensure your review process stays healthy:

- **Review turnaround time:** How long from review request to first feedback?
- **PR size:** Are pull requests staying small enough to review effectively?
- **Review rounds:** How many rounds of feedback does a typical PR need? More than two suggests authors and reviewers are misaligned on expectations.
- **Time to merge:** How long from PR creation to merge? This measures the full cost of your review process.

If these metrics trend in the wrong direction, address the root cause before it becomes entrenched. In my experience, the single most effective intervention is enforcing a maximum PR size. Teams that adopt a 400-line limit almost always see their review turnaround time and defect detection rate improve simultaneously.

Google's engineering practices documentation, particularly their <a href="https://google.github.io/eng-practices/review/" target="_blank" rel="noopener noreferrer">code review guidelines ↗</a>, is an excellent reference for building a healthy review culture.
