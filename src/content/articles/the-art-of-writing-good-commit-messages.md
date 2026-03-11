---
title: "The Art of Writing Good Commit Messages"
description: "Master the art of writing good commit messages that improve collaboration, debugging, and long-term code maintainability."
publishDate: "2026-02-04"
author: "gareth-clubb"
category: "workflows"
tags: ["git", "workflows", "collaboration", "best-practices"]
featured: false
draft: false
faqs:
  - question: "How long should a commit message be?"
    answer: "The subject line should be 50 characters or fewer. If you need more detail, add a blank line after the subject and write a body with lines wrapped at 72 characters. Not every commit needs a body, but any commit that is not immediately obvious from its subject line should have one explaining the reasoning behind the change."
  - question: "Should I use Conventional Commits?"
    answer: "Conventional Commits (feat:, fix:, chore:, etc.) are excellent for projects that generate changelogs automatically or use semantic versioning. They add structure that tooling can parse. For smaller projects or teams that do not use automated changelog generation, they are not strictly necessary, but the discipline they enforce is still beneficial."
  - question: "How often should I commit?"
    answer: "Commit each logical change separately. If you fixed a bug and refactored a function, those should be two commits. If you added a feature that required a database migration and a new API endpoint, those could be one commit if they only make sense together, or separate commits if each is independently meaningful. The goal is that each commit represents a coherent, reviewable unit of work."
  - question: "Should I squash commits before merging a pull request?"
    answer: "It depends on your team's workflow. Squashing produces a clean, linear history where each merge commit represents a complete feature or fix. Preserving individual commits keeps the detailed development history. A good middle ground is to squash work-in-progress commits but preserve meaningful intermediate commits that aid understanding."
  - question: "Is it okay to rewrite commit history?"
    answer: "On feature branches that have not been shared with others, yes. Interactive rebase is a useful tool for cleaning up your commit history before opening a pull request. On shared branches (main, develop), never rewrite history, as it will cause problems for everyone else working on the project."
primaryKeyword: "writing good commit messages"
---

Six months from now, you will be staring at a `git blame` output trying to understand why a particular line was changed. The commit message will either give you the answer in seconds or leave you as confused as you were before.

Good commit messages are not about following rules for the sake of rules. They are a communication tool that directly affects how quickly your team can debug issues, review code, and understand the evolution of a codebase. In my experience, teams that invest in commit message quality spend significantly less time investigating regressions and resolving merge conflicts. I have seen a single well-written commit message save a team hours of debugging during a production incident, because it explained exactly why a particular business rule was implemented the way it was.

## Why Commit Messages Matter

Every commit message is a letter to your future self and your teammates. It captures not just what changed, but why it changed. The diff shows the what; the commit message provides the context that makes the diff meaningful.

Consider these two messages for the same change:

```
fix bug
```

```
Fix race condition in payment processing queue

The worker was acknowledging messages before processing completed.
Under high load, this caused duplicate payments when a worker
crashed mid-processing and the message was not redelivered.

Moved the acknowledgement to after successful database commit.
```

The first message tells you nothing. The second tells you the problem, the root cause, the symptoms, and the solution. When someone encounters a related issue in the future, this commit message is a diagnostic goldmine. A <a href="https://cbea.ms/git-commit/" target="_blank" rel="noopener noreferrer">widely cited guide by Chris Beams ↗</a> covers the principles behind effective commit messages in depth.

Research from a <a href="https://dl.acm.org/doi/10.1145/3196398.3196412" target="_blank" rel="noopener noreferrer">study published in the ACM Digital Library ↗</a> found that projects with descriptive commit messages have significantly lower defect density, because better commit hygiene correlates strongly with more disciplined development practices overall.

## The Structure of a Good Commit Message

A well-structured commit message follows a simple format:

```
Subject line (50 chars or less)

Body text wrapped at 72 characters. Explains the motivation
for the change, what the problem was, and why this approach
was chosen over alternatives.

Optional footer with references to issue trackers, breaking
changes, or co-authors.
```

| Element | Max Length | Purpose | Required? |
|---------|-----------|---------|-----------|
| Subject line | 50 characters | Concise summary of the change | Yes |
| Blank line | N/A | Separates subject from body | If body present |
| Body | 72 chars per line | Motivation, context, reasoning | For non-obvious changes |
| Footer | 72 chars per line | Issue refs, breaking changes, co-authors | Optional |

### The Subject Line

The subject line is the most important part. It appears in `git log --oneline`, in pull request commit lists, and in blame annotations. It needs to be clear, concise, and descriptive.

**Use the imperative mood.** Write "Add user authentication" not "Added user authentication" or "Adds user authentication." This matches the convention used by git itself ("Merge branch," "Revert commit") and reads naturally when prefixed with "If applied, this commit will..."

**Be specific.** "Fix bug" tells you nothing. "Fix null pointer when user has no email address" tells you exactly what was fixed and when it manifests.

**Do not end with a full stop.** The subject line is a title, not a sentence.

### The Body

Not every commit needs a body. A commit that adds a missing index to a database table is self-explanatory from the subject line alone. But any commit where the reasoning is not obvious should include a body.

The body answers three questions:

1. **What was the problem?** What bug was occurring, what limitation existed, or what requirement needed to be met?
2. **Why this approach?** If there were multiple ways to solve the problem, why did you choose this one?
3. **What are the implications?** Does this change affect performance, require a migration, or alter existing behaviour?

Separate the body from the subject with a blank line. Wrap lines at 72 characters so they display correctly in terminals and git tools.

| Subject Line Quality | Example | Verdict |
|---------------------|---------|---------|
| Too vague | "Fix bug" | Useless in git log |
| Too broad | "Refactor user module" | Which part? Why? |
| Diff in prose | "Change getName to getFullName" | Diff already shows this |
| Ticket number only | "JIRA-1234" | Lost if tracker goes away |
| Good | "Fix null pointer when user has no email" | Specific, searchable, meaningful |
| Excellent | "Fix race condition in payment queue" + body | Problem, cause, and fix documented |

## Conventional Commits

The <a href="https://www.conventionalcommits.org/" target="_blank" rel="noopener noreferrer">Conventional Commits specification ↗</a> adds machine-readable structure to commit messages:

```
feat: add email notification for failed payments
fix: resolve timeout on large file uploads
docs: update API authentication guide
refactor: extract payment validation into service class
chore: update dependency versions
test: add integration tests for checkout flow
perf: cache user preferences to reduce database queries
```

The prefix categorises the commit at a glance. Tooling can parse these prefixes to generate changelogs automatically, determine semantic version bumps, and filter commit history by type.

If your project uses Conventional Commits, be precise with your prefixes. A change that fixes a bug AND refactors the surrounding code should be two commits, not a `fix:` that also contains a refactor.

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart showing the distribution of commit types in a typical well-maintained project">
  <style>
    .cc-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #334155; }
    .cc-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #334155; }
    .cc-value { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
    .cc-axis { font-family: 'Inter', sans-serif; font-size: 10px; fill: #94a3b8; }
  </style>
  <text x="300" y="25" text-anchor="middle" class="cc-title">Typical Commit Type Distribution (Well-Maintained Project)</text>
  <!-- Y axis labels -->
  <text x="75" y="63" text-anchor="end" class="cc-label">feat:</text>
  <text x="75" y="93" text-anchor="end" class="cc-label">fix:</text>
  <text x="75" y="123" text-anchor="end" class="cc-label">refactor:</text>
  <text x="75" y="153" text-anchor="end" class="cc-label">test:</text>
  <text x="75" y="183" text-anchor="end" class="cc-label">chore:</text>
  <text x="75" y="213" text-anchor="end" class="cc-label">docs:</text>
  <text x="75" y="243" text-anchor="end" class="cc-label">perf:</text>
  <!-- Bars -->
  <rect x="85" y="50" width="260" height="20" fill="#3b82f6" rx="3"/>
  <text x="355" y="64" class="cc-value">35%</text>
  <rect x="85" y="80" width="186" height="20" fill="#ef4444" rx="3"/>
  <text x="280" y="94" class="cc-value">25%</text>
  <rect x="85" y="110" width="112" height="20" fill="#8b5cf6" rx="3"/>
  <text x="206" y="124" class="cc-value">15%</text>
  <rect x="85" y="140" width="75" height="20" fill="#22c55e" rx="3"/>
  <text x="168" y="154" class="cc-value">10%</text>
  <rect x="85" y="170" width="56" height="20" fill="#f59e0b" rx="3"/>
  <text x="150" y="184" class="cc-value">8%</text>
  <rect x="85" y="200" width="37" height="20" fill="#06b6d4" rx="3"/>
  <text x="131" y="214" class="cc-value">5%</text>
  <rect x="85" y="230" width="15" height="20" fill="#ec4899" rx="3"/>
  <text x="109" y="244" class="cc-value">2%</text>
</svg>

## Common Anti-Patterns

### The Meaningless Message

```
update
fix
wip
asdfgh
```

These messages provide zero information. They make `git log` useless and force anyone reviewing the change to read the full diff to understand what happened. Even a brief, imperfect message is better than no message at all.

### The Overly Broad Message

```
Refactor user module
```

Which part of the user module? What was refactored and why? This message covers too much ground to be useful. If the commit touches many files, it probably should have been split into smaller, more focused commits.

### The Diff in Prose

```
Change line 42 in user.js from getName to getFullName
```

The diff already shows this. The commit message should explain why the function was renamed, not restate the change. Perhaps the old name was ambiguous because a `getFirstName` function was added, or perhaps a downstream consumer expected the full name.

### The Ticket Number Alone

```
JIRA-1234
```

Ticket references are valuable, but they should supplement the message, not replace it. If your issue tracker goes down, becomes inaccessible, or the project migrates to a new platform, the commit history should still be self-contained.

```
Fix race condition in payment queue processing

Moved message acknowledgement to after database commit to prevent
duplicate payments under high load.

Resolves: JIRA-1234
```

## Atomic Commits

A good commit message is much easier to write when the commit itself is focused. An atomic commit contains exactly one logical change: one bug fix, one feature addition, one refactor.

If you find yourself writing "Fix login bug and update header styles and add new API endpoint," that is three commits trying to share one message. Split them.

Atomic commits make your history bisectable. If a bug was introduced somewhere in the last 50 commits, `git bisect` can find the exact commit, but only if each commit is a single, coherent change that can be tested independently. This discipline works hand in hand with a solid [git workflow](/workflows/git-workflows-that-scale-with-your-team).

## Practical Tips for Better Messages

**Write the message before you code.** Draft the commit message as a statement of intent before you start making changes. This clarifies your thinking and keeps you focused on one task.

**Review your own diffs before committing.** Run `git diff --staged` and read through every change. This catches accidental inclusions (debug statements, unrelated formatting changes) and helps you write a more accurate message.

**Use `git add -p` for partial staging.** If you have made multiple logical changes in the same file, stage them separately and commit each with its own message.

**Set up a commit template.** Create a `.gitmessage` file with prompts that remind you of your team's conventions. Configure git to use it with `git config commit.template .gitmessage`.

I have found that teams who use commit templates see a marked improvement in message quality within the first week. The small prompt is enough to remind developers of the conventions without being intrusive. Automating this with [development environment setup scripts](/workflows/how-to-automate-your-development-environment) ensures every new team member gets the template from day one.

## Making It a Team Habit

Individual discipline is important, but commit message quality improves most when it becomes a team norm. Include commit message quality in your [code review](/collaboration/code-reviews-that-dont-waste-time) checklist. If a pull request has commits labelled "fix" and "update," ask the author to rewrite them before merging.

Document your team's commit message conventions in your contributing guide. Whether you use Conventional Commits, a custom format, or simply "imperative mood with a body for non-obvious changes," having a written standard eliminates ambiguity. This is part of the broader practice of [writing documentation developers actually read](/collaboration/writing-documentation-developers-actually-read).

The few seconds it takes to write a thoughtful commit message will save hours of debugging and confusion down the line. It is one of the smallest investments in code quality with one of the largest returns. For more on building good team habits around pull requests, see [why your pull requests take too long](/collaboration/why-your-pull-requests-take-too-long).
