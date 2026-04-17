---
title: "How to Audit a Legacy Codebase: A Step by Step Guide"
description: "A practical guide to legacy code analysis: how to audit an unfamiliar codebase, identify risks, map dependencies, and plan a safe path forward."
publishDate: "2026-04-17"
author: "zubair-hasan"
category: "code-quality"
tags: ["legacy-code", "code-analysis", "code-quality", "refactoring", "technical-debt", "maintenance"]
featured: false
draft: false
faqs:
  - question: "What is legacy code analysis?"
    answer: "Legacy code analysis is the practice of systematically examining an existing codebase to understand its structure, dependencies, risks, and areas of change. It combines static analysis tools, version control history, dependency audits, and manual reading of hot spots. The goal is not to judge the code but to build an accurate map before making decisions about maintenance, refactoring, or replacement."
  - question: "How long does a legacy codebase audit take?"
    answer: "A focused audit of a medium sized service can usually be completed in one to two weeks by a single engineer. Larger monoliths may need several weeks and multiple people. Time box the exercise so it produces an actionable report rather than a never ending research project. You do not need to understand every line; you need to understand the risks, the hot spots, and the safest places to start making changes."
  - question: "What tools help with legacy code analysis?"
    answer: "Start with the tooling you already have. Git log, cloc, and your IDE's call hierarchy view cover most of what you need. Add a static analysis tool like SonarQube, Semgrep, or CodeScene for automated findings. Use npm audit, pip-audit, or govulncheck for dependency risk, and a dead code detector like Knip or deadcode for unused exports. Most of these are free and take minutes to run."
  - question: "What should a legacy code audit report contain?"
    answer: "A good audit report covers: a high level architecture diagram, a list of hot spots from version control history, a dependency risk summary, a test coverage snapshot, known security issues, and a prioritised list of recommended actions. Keep it short enough that stakeholders will actually read it. Five to ten pages is usually plenty. Include a clear recommendation on where to start."
  - question: "Should I audit before refactoring or rewriting?"
    answer: "Yes, always. Jumping into refactoring or rewriting without an audit is how teams end up months behind schedule. The audit tells you which parts of the system are load bearing, which are safe to change, and which are best left alone. A one to two week audit up front typically saves many weeks of rework later."
primaryKeyword: "legacy code analysis"
---

Every engineer inherits a legacy codebase eventually. A new job, a team handover, an acquisition, or simply a product you wrote three years ago that no longer feels familiar. The instinct is usually to open the files and start reading, but that is the slowest way to build understanding.

A structured audit is faster, safer, and produces an artefact you can share with the rest of the team. This guide walks through how to analyse a legacy codebase step by step, using the same approach that platform engineers apply to complex systems in production.

If you are looking for broader guidance on how to make changes to legacy code once you understand it, our article on [working with legacy code](/workflows/the-developers-guide-to-working-with-legacy-code) covers the refactoring side. This piece is about the diagnostic work that comes first.

## Why Legacy Code Analysis Matters

The hardest part of working with an unfamiliar codebase is not writing new code. It is knowing where it is safe to write new code. Without an audit, every change carries hidden risk: a shared utility you did not realise was called by 40 other modules, a database migration that has never been tested, a third party dependency with a known vulnerability quietly sitting in production.

A proper analysis gives you:

- A map of what exists and how it fits together
- A ranked list of risks, from security issues to fragile components
- Evidence you can use to justify time for improvements
- A starting point that is unlikely to cause regressions

Skipping this step is how teams end up rewriting the same module twice, or shipping a refactor that breaks a feature nobody remembered was there.

## Before You Start

Set expectations with your team or manager. An audit is not a rewrite and it is not a full documentation pass. It is a time boxed exercise that produces a clear report.

Agree on three things up front:

1. **Scope.** Which repositories, services, or modules are in scope? A focused audit on a single service is far more useful than a vague attempt at the whole estate.
2. **Time box.** One to two weeks for a medium service is realistic. Large monoliths may need three to four weeks and more than one engineer.
3. **Output.** A short written report with findings, risks, and recommendations. No one reads a 60 page document.

With those agreed, you can start.

## Step 1: Get the Code Running Locally

You cannot audit what you cannot run. The first task is to stand up the application on your own machine with a realistic dataset.

Note everything that goes wrong. Missing environment variables, outdated Docker images, database seeds that no longer work, and undocumented setup steps are all findings. If it takes you a day to get it running, it takes every new joiner a day too. That is a cost worth surfacing.

As you go, capture the setup steps in a draft document. By the end of the audit you will have a working local environment guide, which is often the single most valuable artefact for the team.

For more on handling environment configuration in legacy projects, see our guide to [environment variables done right](/devops/environment-variables-done-right).

## Step 2: Run the Basics

Before reading any source code, run a set of standard tools. These take minutes and give you a baseline picture of the codebase.

### Count the Code

Use <a href="https://github.com/AlDanial/cloc" target="_blank" rel="noopener noreferrer">cloc ↗</a> or <a href="https://github.com/XAMPPRocky/tokei" target="_blank" rel="noopener noreferrer">tokei ↗</a> to count lines of code by language.

```bash
cloc .
```

This tells you the shape of the codebase at a glance. A 40,000 line Python service with a 5,000 line JavaScript frontend is a very different system from a 200,000 line Java monolith with three generations of templating.

### Check Test Coverage

Run the existing test suite and record the coverage number, even if it is low or zero. Make a note of which parts of the code are covered and which are not. Coverage is an imperfect metric, but the shape of the coverage map tells you which modules are well tested and which are effectively untested.

### Audit Dependencies

Run the dependency audit command for your language of choice.

```bash
# Node
npm audit

# Python
pip-audit

# Go
govulncheck ./...

# Ruby
bundle audit
```

Record the count of critical, high, and medium vulnerabilities. For deeper context on how to manage the dependency tree safely, read [dependency management without the chaos](/devops/dependency-management-without-the-chaos).

### Scan for Secrets

Run a secret scanner against the repository history.

```bash
gitleaks detect --source . --redact
```

Hardcoded secrets in git history are one of the most common findings in a legacy audit. If you find any, flag them for immediate rotation regardless of whether the audit is complete.

## Step 3: Read Version Control History

The git history is the single richest source of information about a legacy codebase. It records every change, every author, and every file that has changed together.

### Find the Hot Spots

Hot spots are the files that change most often. They are where the business logic lives and where risk concentrates.

```bash
git log --format='%H' --since='12 months ago' \
  | xargs -I{} git diff-tree --no-commit-id --name-only -r {} \
  | sort | uniq -c | sort -rn | head -30
```

This gives you the top 30 files by change frequency over the last year. Expect a Pareto distribution: a small number of files account for the majority of changes. Those files deserve the deepest reading.

### Identify Knowledge Silos

```bash
git shortlog -sne --since='12 months ago'
```

This lists contributors by commit count. If one person accounts for 80 percent of recent commits, you have a knowledge silo. That is a bus factor risk worth flagging.

### Find Orphaned Code

Look for files that have not been touched in a long time.

```bash
git ls-tree -r HEAD --name-only \
  | while read f; do
      echo "$(git log -1 --format='%ai' -- "$f") $f"
    done \
  | sort
```

Files untouched for three or more years are either extremely stable or dead code. Both are worth investigating.

## Step 4: Map the Architecture

You need a mental model of how the system hangs together. Build it by tracing a single request end to end.

Pick a common user journey, ideally one that touches multiple layers. Start at the entry point (HTTP handler, queue consumer, CLI command) and follow the code all the way to the database or external API. Note every component the request passes through.

<svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing a single request traced through a legacy system from entry point through controller, service, repository, and database, with side effects to an external API and a message queue.">
  <style>text { font-family: 'Inter', system-ui, sans-serif; }</style>
  <text x="360" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Tracing a Single Request</text>
  <rect x="20" y="110" width="110" height="50" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
  <text x="75" y="135" text-anchor="middle" font-size="12" fill="#92400e">HTTP Request</text>
  <text x="75" y="150" text-anchor="middle" font-size="10" fill="#92400e">entry point</text>
  <line x1="130" y1="135" x2="160" y2="135" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)" />
  <rect x="160" y="110" width="110" height="50" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="215" y="135" text-anchor="middle" font-size="12" fill="#3730a3">Controller</text>
  <text x="215" y="150" text-anchor="middle" font-size="10" fill="#3730a3">validation, auth</text>
  <line x1="270" y1="135" x2="300" y2="135" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)" />
  <rect x="300" y="110" width="110" height="50" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="355" y="135" text-anchor="middle" font-size="12" fill="#3730a3">Service</text>
  <text x="355" y="150" text-anchor="middle" font-size="10" fill="#3730a3">business logic</text>
  <line x1="410" y1="135" x2="440" y2="135" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)" />
  <rect x="440" y="110" width="110" height="50" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="495" y="135" text-anchor="middle" font-size="12" fill="#3730a3">Repository</text>
  <text x="495" y="150" text-anchor="middle" font-size="10" fill="#3730a3">data access</text>
  <line x1="550" y1="135" x2="580" y2="135" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr)" />
  <rect x="580" y="110" width="110" height="50" rx="6" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5" />
  <text x="635" y="135" text-anchor="middle" font-size="12" fill="#166534">Database</text>
  <text x="635" y="150" text-anchor="middle" font-size="10" fill="#166534">primary store</text>
  <line x1="355" y1="160" x2="355" y2="200" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arr)" />
  <rect x="260" y="200" width="100" height="40" rx="6" fill="#fecaca" stroke="#ef4444" stroke-width="1.5" />
  <text x="310" y="224" text-anchor="middle" font-size="11" fill="#991b1b">External API</text>
  <line x1="400" y1="160" x2="430" y2="200" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3" marker-end="url(#arr)" />
  <rect x="380" y="200" width="100" height="40" rx="6" fill="#fecaca" stroke="#ef4444" stroke-width="1.5" />
  <text x="430" y="224" text-anchor="middle" font-size="11" fill="#991b1b">Message Queue</text>
  <defs>
    <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
    </marker>
  </defs>
</svg>

Repeat this exercise for two or three different journeys. You will quickly spot patterns: which layers exist, how data flows, where side effects happen, and which components are shared across flows.

Sketch the result as a simple box and arrow diagram. It does not need to be exhaustive. The goal is a picture you can put in front of a teammate and have them nod.

## Step 5: Run Static Analysis

Static analysis tools scan source code for known problems without executing it. They catch entire categories of issues that manual reading misses.

| Tool | What It Covers |
|------|----------------|
| <a href="https://www.sonarsource.com/products/sonarqube/" target="_blank" rel="noopener noreferrer">SonarQube ↗</a> | Bugs, code smells, duplication, security hotspots |
| <a href="https://semgrep.dev/" target="_blank" rel="noopener noreferrer">Semgrep ↗</a> | Pattern based linting, custom rules, security scanning |
| <a href="https://codescene.com/" target="_blank" rel="noopener noreferrer">CodeScene ↗</a> | Hot spots, complexity, technical debt scoring |
| <a href="https://codeql.github.com/" target="_blank" rel="noopener noreferrer">CodeQL ↗</a> | Deep semantic analysis, security vulnerabilities |

Pick one or two and run them against the codebase. Do not try to fix the findings during the audit. Record the totals and note any critical issues that need urgent attention.

For more on automating these kinds of checks as part of your normal workflow, read [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters).

## Step 6: Assess Test Coverage and Quality

Coverage numbers on their own are misleading. A module with 90 percent coverage can still be poorly tested if the tests only cover happy paths or assert on shallow outputs.

Spend an hour reading the existing tests. Ask:

- Are tests isolated or do they share state?
- Do they assert on behaviour or implementation details?
- How fast is the suite? A 45 minute test run discourages people from running it locally.
- What happens if a test fails? Is the failure clear?

If you find large sections of code without any tests, that is a priority area to flag. As a starting point, consider adding characterisation tests before anyone tries to change those modules. Our article on [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help) covers the patterns that work best for retroactively adding tests.

## Step 7: Interview the Humans

Code tells you what the system does. People tell you why.

Schedule short conversations (30 minutes is plenty) with anyone who has historical context:

- Previous maintainers, even if they are on another team
- Support engineers who have debugged incidents
- Product managers who remember why certain features exist
- Customers or internal users who depend on the system

Ask open questions. What do you wish you could change? What breaks most often? Which part would you not touch? What feature looks redundant but is actually critical?

This kind of institutional knowledge is invisible in the code and impossible to recover once the people leave. Capture it in the audit report while you can.

## Step 8: Write the Report

The audit is only useful if someone reads it. Keep the report short, scannable, and focused on actions.

A structure that works well:

1. **Scope and method.** What you audited, what you did not, how long it took.
2. **System overview.** A short description and the architecture diagram from Step 4.
3. **Risk summary.** Top five to ten risks in priority order. Include security issues, fragile components, knowledge silos, and outdated dependencies.
4. **Hot spots.** The files and modules that change most often and deserve the most attention.
5. **Quick wins.** Changes that are low risk and high value, typically completable in a few days.
6. **Strategic recommendations.** Longer term suggestions, such as breaking apart a module, replacing a library, or running a dedicated upgrade project.
7. **Open questions.** Things you could not answer within the time box.

Aim for five to ten pages. If you cannot summarise a codebase in that space, the report will not be read.

## Step 9: Agree the Next Steps

The audit itself is not the outcome. The decisions that come out of it are. Walk through the report with your team or manager and agree on:

- Which quick wins to start on immediately
- Whether any critical issues need an incident response (security vulnerabilities, hardcoded production secrets)
- What longer term work to propose
- Who owns each action

This is also the moment to decide on approach. Are you going to maintain and gradually improve the existing system, apply the strangler fig pattern to replace it piece by piece, or accept it as it is and invest elsewhere? The right answer depends on the risks you surfaced and the value the system delivers. Our article on [technical debt, when to fix it and when to leave it](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) is a useful companion when making that call.

## Common Pitfalls to Avoid

Audits go wrong in predictable ways. Watch out for these.

- **Analysis paralysis.** If you cannot finish the audit in your time box, cut scope. A done audit with gaps is infinitely more useful than a perfect one that never ships.
- **Starting with judgement.** The code may look terrible, but it has been serving users for years. Understand before you criticise.
- **Skipping the humans.** Tools show you patterns. People tell you causes. You need both.
- **Producing a wishlist.** A good audit recommends a small number of prioritised actions, not 50 ideas with no ranking.
- **Ignoring the audit afterwards.** If the report sits in a folder unread, the work was wasted. Make sure someone owns the follow up.

## A Minimal Audit Checklist

If you only have a week, here is the shortest useful audit you can run.

1. Get the application running locally and document the setup steps.
2. Run `cloc`, your language's dependency audit, and a secret scanner.
3. Pull out the top 20 hot spot files from git history.
4. Trace one user journey end to end and sketch the architecture.
5. Run one static analysis tool and record the headline findings.
6. Review test coverage and read a sample of existing tests.
7. Interview two or three people with historical context.
8. Write a five page report with risks, quick wins, and recommendations.
9. Walk the team through it and agree on next steps.

That is enough to turn an unfamiliar codebase into a known one, with a clear plan for what to do next.

## Final Thoughts

Legacy code analysis is a skill that pays compounding returns. Every codebase you audit teaches you something you can apply to the next one. The engineers who do it well are methodical, patient, and more interested in understanding the system than in rewriting it.

Before you touch a single line, spend a week mapping the terrain. You will find problems earlier, ship changes more safely, and build the kind of reputation that gets you trusted with the harder systems next time. Combine the audit discipline here with the refactoring patterns in our [working with legacy code guide](/workflows/the-developers-guide-to-working-with-legacy-code), and you have a complete playbook for turning inherited chaos into a system you can confidently improve.
