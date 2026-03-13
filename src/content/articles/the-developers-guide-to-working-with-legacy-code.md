---
title: "The Developer's Guide to Working with Legacy Code"
description: "Practical strategies for working with legacy code, from adding tests to safe refactoring and the strangler fig pattern."
publishDate: "2026-03-13"
author: "gareth-clubb"
category: "workflows"
tags: ["legacy-code", "refactoring", "code-quality", "maintenance"]
featured: false
draft: false
faqs:
  - question: "What is legacy code?"
    answer: "Legacy code is any code that is difficult to change with confidence. Michael Feathers defines it as code without tests, because without tests you cannot verify that your changes have not broken anything. In practice, legacy code is code you have inherited, do not fully understand, and are afraid to modify. It is not inherently bad; it is code that has been delivering value, often for years."
  - question: "Should you ever rewrite legacy code from scratch?"
    answer: "Rarely. Full rewrites are expensive, risky, and often take far longer than estimated. The original code contains years of accumulated business logic and edge case handling that is easy to overlook. In most cases, incremental modernisation using patterns like the strangler fig is safer and delivers value sooner. Reserve full rewrites for systems that are genuinely beyond repair or built on technology that is no longer supported."
  - question: "How do you add tests to code that was never designed to be testable?"
    answer: "Start with characterisation tests. These capture what the code actually does right now, not what it should do. Run the code, observe the output, and write a test that asserts that exact behaviour. This gives you a safety net before you start making changes. Michael Feathers' book Working Effectively with Legacy Code describes detailed techniques for breaking dependencies and getting untestable code under test."
  - question: "How long does it take to modernise a legacy codebase?"
    answer: "It depends on the size and complexity of the system, but expect months to years for significant codebases. The key is to deliver value incrementally rather than treating modernisation as one large project. Each step should leave the system in a better state while continuing to serve its users. Teams that try to modernise everything at once typically run out of time, budget, or patience before finishing."
primaryKeyword: "working with legacy code"
---

## Legacy Code Is Not a Dirty Word

Every successful software product eventually becomes legacy code. That system you are dreading to open? It has been keeping the business running, processing transactions, and serving users for years. The fact that it is still around means it worked.

Michael Feathers, in his influential book <a href="https://www.oreilly.com/library/view/working-effectively-with/0131177052/" target="_blank" rel="noopener noreferrer">Working Effectively with Legacy Code ↗</a>, offers a precise definition: legacy code is code without tests. Without tests, you cannot change the code with confidence. Without confidence, changes become slow, risky, and stressful.

But working with legacy code is not a punishment. It is one of the most valuable skills a developer can build. In over a decade of professional development, I have spent more time working within existing codebases than building greenfield projects. The ability to navigate, understand, and safely improve unfamiliar code is what separates productive engineers from frustrated ones.

## First Steps When You Inherit an Unfamiliar Codebase

Resist the urge to start rewriting things on day one. The code may look strange, but it has survived production for a reason. Your first job is to understand, not to judge.

### Read Before You Write

Start by getting the application running locally. Then trace a single request or user flow from end to end. Follow the code path from the entry point through the layers. This gives you a mental model of the architecture far faster than reading every file sequentially.

Pay attention to the patterns the original authors used, even if they are not patterns you would choose. Understanding the existing conventions helps you make changes that fit the codebase rather than fighting against it.

### Map the Landscape

Identify the high-traffic areas of the code. Version control history is your best friend here. Run `git log --format='%H' --since='6 months ago' | xargs -I{} git diff-tree --no-commit-id --name-only -r {} | sort | uniq -c | sort -rn | head -20` to find the files that change most often. These are the files that matter most, and the ones most likely to benefit from improvement.

Look for documentation, even if it is outdated. Old architecture decision records, README files, and wiki pages reveal the reasoning behind design choices. The code tells you what the system does; documentation tells you why.

### Talk to People

If anyone who worked on the original system is still available, talk to them. Ask about the known pain points, the areas they would not touch, and the business rules that are baked into the code. This kind of institutional knowledge is impossible to extract from the code alone, and it can save you from breaking things that look redundant but are actually critical.

## The Strangler Fig Pattern

When you need to modernise a legacy system, the <a href="https://martinfowler.com/bliki/StranglerFigApplication.html" target="_blank" rel="noopener noreferrer">strangler fig pattern ↗</a> is one of the most reliable approaches. Named after the tropical fig that gradually grows around a host tree, the idea is to incrementally replace parts of the old system with new implementations while keeping everything running.

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the strangler fig pattern in three stages: requests initially go entirely to the legacy system, then a facade routes some requests to new code and some to legacy, and finally all requests go through the new system while legacy is decommissioned.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="350" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">The Strangler Fig Pattern</text>
  <!-- Stage 1 -->
  <text x="117" y="52" text-anchor="middle" font-size="12" font-weight="600" fill="#64748b">Stage 1: All Legacy</text>
  <rect x="30" y="65" width="175" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
  <text x="117" y="90" text-anchor="middle" font-size="12" fill="#92400e">Requests</text>
  <line x1="117" y1="105" x2="117" y2="130" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGrey)" />
  <rect x="30" y="130" width="175" height="50" rx="6" fill="#fecaca" stroke="#ef4444" stroke-width="1.5" />
  <text x="117" y="160" text-anchor="middle" font-size="12" fill="#991b1b">Legacy System</text>
  <!-- Stage 2 -->
  <text x="350" y="52" text-anchor="middle" font-size="12" font-weight="600" fill="#64748b">Stage 2: Gradual Migration</text>
  <rect x="263" y="65" width="175" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
  <text x="350" y="90" text-anchor="middle" font-size="12" fill="#92400e">Requests</text>
  <line x1="350" y1="105" x2="350" y2="130" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGrey)" />
  <rect x="263" y="130" width="175" height="40" rx="6" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="350" y="155" text-anchor="middle" font-size="12" fill="#3730a3">Facade / Router</text>
  <line x1="310" y1="170" x2="290" y2="200" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGrey)" />
  <line x1="390" y1="170" x2="410" y2="200" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGrey)" />
  <rect x="250" y="200" width="85" height="50" rx="6" fill="#fecaca" stroke="#ef4444" stroke-width="1.5" />
  <text x="292" y="222" text-anchor="middle" font-size="11" fill="#991b1b">Legacy</text>
  <text x="292" y="238" text-anchor="middle" font-size="10" fill="#991b1b">(shrinking)</text>
  <rect x="365" y="200" width="85" height="50" rx="6" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5" />
  <text x="407" y="222" text-anchor="middle" font-size="11" fill="#166534">New Code</text>
  <text x="407" y="238" text-anchor="middle" font-size="10" fill="#166534">(growing)</text>
  <!-- Stage 3 -->
  <text x="583" y="52" text-anchor="middle" font-size="12" font-weight="600" fill="#64748b">Stage 3: Complete</text>
  <rect x="496" y="65" width="175" height="40" rx="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
  <text x="583" y="90" text-anchor="middle" font-size="12" fill="#92400e">Requests</text>
  <line x1="583" y1="105" x2="583" y2="130" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowGrey)" />
  <rect x="496" y="130" width="175" height="50" rx="6" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5" />
  <text x="583" y="160" text-anchor="middle" font-size="12" fill="#166534">New System</text>
  <rect x="530" y="220" width="107" height="40" rx="6" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4 3" />
  <text x="583" y="244" text-anchor="middle" font-size="11" fill="#94a3b8">Legacy (retired)</text>
  <!-- Arrow markers -->
  <defs>
    <marker id="arrowGrey" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
    </marker>
  </defs>
  <!-- Stage arrows -->
  <text x="222" y="160" font-size="18" fill="#cbd5e1">&#x2192;</text>
  <text x="455" y="160" font-size="18" fill="#cbd5e1">&#x2192;</text>
</svg>

### How It Works

1. Place a facade or routing layer in front of the legacy system
2. Build new functionality behind the facade using modern patterns
3. Gradually redirect traffic from the old implementation to the new one
4. Once a component is fully replaced, remove the legacy version
5. Repeat until the entire system has been migrated

The beauty of this approach is that you are always in a deployable state. There is no "big bang" cutover where everything changes at once. Each migration step is small, testable, and reversible. This aligns well with the philosophy behind [boring technology choices](/architecture/the-case-for-boring-technology), where reducing risk matters more than adopting the latest tools.

## Adding Tests to Untested Code

Before you can safely change legacy code, you need a safety net. That means tests. But how do you test code that was never designed to be testable?

### Characterisation Tests

A <a href="https://en.wikipedia.org/wiki/Characterization_test" target="_blank" rel="noopener noreferrer">characterisation test ↗</a> captures what the code currently does, regardless of whether that behaviour is correct. The goal is not to verify intent; it is to detect unintended changes.

The process is straightforward:

1. Call the function or endpoint with a specific input
2. Observe the actual output
3. Write a test that asserts that exact output
4. If the test passes, you have captured the current behaviour
5. Now any future change that alters the behaviour will break the test

This approach is invaluable because it does not require you to understand the business logic before you start. You build understanding incrementally as you write more tests and explore more code paths. For a deeper look at writing tests that provide genuine value, see our guide on [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help).

### Breaking Dependencies

Legacy code often has tightly coupled dependencies that make it impossible to test in isolation. A class might create its own database connection, call external APIs directly, or depend on global state.

The key techniques for breaking these dependencies include:

- **Extract interface:** Create an interface for the dependency so you can substitute a test double
- **Inject dependencies:** Pass dependencies in rather than constructing them internally
- **Wrap and delegate:** Create a thin wrapper around the legacy class that you can control in tests
- **Sprout method/class:** Write new functionality in a separate, testable method or class, then call it from the legacy code

Each of these techniques is designed to be the smallest possible change that gets the code under test. You are not refactoring for beauty; you are refactoring for testability.

## Safe Refactoring Strategies

Once you have tests in place, you can begin improving the code. The key principle is to make changes in small, verified steps.

### The Boy Scout Rule

Leave the code better than you found it, but only in the area you are already working in. If you are fixing a bug in a module, clean up the immediate surroundings. Rename a confusing variable. Extract a duplicated block into a function. Remove dead code you can verify is unused.

This approach addresses [technical debt](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) incrementally without requiring dedicated cleanup sprints that are difficult to justify to stakeholders.

### Refactor in Committed Steps

Make one small change, run the tests, commit. Then make the next small change. If something goes wrong, you can revert to the last known good state without losing hours of work. Martin Fowler's <a href="https://martinfowler.com/books/refactoring.html" target="_blank" rel="noopener noreferrer">Refactoring catalogue ↗</a> provides a comprehensive set of named, mechanical transformations you can apply safely.

### Use Automated Tools

Linting and formatting tools catch entire categories of issues automatically. If the legacy codebase has no linter configuration, introducing one is a high-value first step. Our article on [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters) covers how to adopt these tools incrementally without overwhelming the team with thousands of violations on day one.

## When to Rewrite vs When to Wrap

The temptation to rewrite is strong. The existing code is messy, hard to understand, and uses outdated patterns. Surely starting fresh would be faster?

Almost always, no.

### Why Rewrites Fail

Joel Spolsky famously called full rewrites "the single worst strategic mistake that any software company can make." The original code, however ugly, contains years of accumulated business logic, bug fixes, and edge case handling. A rewrite throws all of that away and forces you to rediscover it, usually under pressure.

Rewrites also create a period where two systems need to be maintained simultaneously: the old one that is still serving users and the new one that is not yet ready. This splits the team's attention and slows progress on both.

### When Wrapping Works Better

Instead of rewriting, consider wrapping. Place a clean API in front of the messy implementation. Consumers interact with the new interface while the old code continues to do the heavy lifting behind the scenes.

This gives you:

- A stable contract for new code to depend on
- The freedom to replace the internals gradually
- No disruption to existing functionality

Wrapping is essentially the strangler fig pattern applied at the component level. It is less dramatic than a rewrite but far more likely to succeed.

### When a Rewrite Is Justified

There are rare cases where a rewrite makes sense:

- The technology stack is genuinely end-of-life with no security patches available
- The system is small enough that a rewrite takes weeks, not months
- The original code is so tangled that even adding characterisation tests is impractical
- The business requirements have changed so fundamentally that the old architecture cannot support them

Even in these cases, consider whether a phased migration using the strangler fig pattern could achieve the same result with less risk.

## Working with the Team

Legacy code is a team problem, not an individual one. The most effective modernisation efforts treat knowledge sharing and documentation as first-class activities.

### Document as You Go

Every time you understand something about the legacy system, write it down. Architecture decision records, inline comments explaining non-obvious behaviour, and updated README files all help the next person who encounters the same code.

Good documentation does not need to be comprehensive from day one. A short note explaining "this function handles the edge case where X happens because of Y" is worth more than a polished architectural overview that nobody writes.

### Share Context in Code Reviews

[Code reviews](/collaboration/code-reviews-that-dont-waste-time) become especially important when working with legacy code. Use review comments to explain the context behind your changes. Why did you choose to wrap rather than rewrite? What did you learn about the legacy behaviour? What risks remain?

This turns each pull request into a knowledge transfer opportunity. Over time, the team builds a shared understanding of the system that no single person could develop alone.

### Create a Living Map

Maintain a document or diagram that maps the legacy system's components, their responsibilities, and their current state (untouched, partially modernised, fully migrated). This gives the team a shared view of progress and helps prioritise what to work on next.

## A Practical Checklist

When you sit down to work with legacy code, follow this sequence:

1. **Get it running locally.** If you cannot run it, you cannot understand it.
2. **Trace a user flow.** Follow one request from start to finish.
3. **Check version control history.** Find the hot spots and recent changes.
4. **Add characterisation tests.** Capture current behaviour before changing anything.
5. **Make small, tested changes.** One refactoring step at a time, committed individually.
6. **Document what you learn.** Future you (and your colleagues) will thank you.
7. **Communicate with the team.** Share context, flag risks, and celebrate progress.

Legacy code is not a problem to be solved once. It is an ongoing practice of careful, incremental improvement. The developers who do it well are patient, methodical, and respectful of the code that came before them, even when that code makes them wince.

The [senior developer mindset](/career/the-senior-developer-mindset) is largely about this kind of judgement: knowing when to push for change, when to hold back, and how to bring the team along with you. Working with legacy code is where that mindset matters most.
