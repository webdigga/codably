---
title: "How to Review AI-Generated Code: A Practical Checklist"
description: "A practical checklist for reviewing AI-generated code: what to check first, common failure modes, and how to combine AI with human review safely."
publishDate: "2026-04-24"
author: "jonny-rowse"
category: "ai-tools"
tags: ["ai-coding", "code-review", "code-quality", "developer-tools", "security", "productivity"]
featured: false
draft: false
faqs:
  - question: "Do I need to review AI-generated code if it compiles and the tests pass?"
    answer: "Yes. Compiling and passing tests only proves the code satisfies the cases you thought to check. AI-generated code frequently uses plausible but wrong APIs, invents library functions, and silently swaps units or types. A 2022 Stanford study found that developers using AI assistants wrote less secure code and were more confident in its correctness. Treat every AI diff the way you would treat a pull request from a new contributor on their first week."
  - question: "What should I check first in AI-generated code?"
    answer: "Start with the imports and the function signatures it calls. Hallucinated library functions and made-up APIs are the most common failure mode, and they are easy to spot before you read a single line of logic. After that, check inputs at trust boundaries: any call to a database, shell, HTTP client, or template engine that takes user input. Security bugs concentrate there."
  - question: "How do I review code I did not write and do not fully understand?"
    answer: "Do not review it in the chat window. Paste it into your editor, run the linter, run the type checker, and run the tests. Read each change as a diff against main, not as a fresh file. If you cannot explain a line to a colleague, you are not ready to merge it. Ask the assistant to explain the non-obvious parts, then verify the explanation against the docs rather than trusting it."
  - question: "Is it safe to accept AI suggestions for security-sensitive code?"
    answer: "Only with extra scrutiny. Authentication, authorisation, cryptography, input validation, and anything that touches user data should get a full human read-through and a second reviewer. The OWASP Top 10 is a good checklist. AI assistants do not know your threat model, your session handling, or which fields in your schema are PII, so they default to patterns that look correct in isolation but fail in your context."
  - question: "Should I use AI to review the AI-generated code?"
    answer: "It helps catch some issues but does not replace a human read. A second model with a different system prompt will flag things the first missed, particularly style inconsistencies and obvious bug patterns. But both will miss the same category of mistakes: anything that requires knowing your codebase conventions, your domain, or your production constraints. Use it as a first pass, not the final word."
primaryKeyword: "reviewing AI code"
---

Last month a teammate merged a 300 line pull request generated in a single Claude session. It passed review, passed CI, passed a week in staging. On day eight it took the payments service down because a retry loop the model wrote did not honour the idempotency key we had told it to use. The key was in the prompt. The code imported it. The retry loop ignored it.

Nothing in that review caught the bug because nobody read the retry loop. The diff looked reasonable, the function names matched the ticket, the tests passed. We reviewed the surface and trusted the rest.

This is how AI-generated code fails in practice. Not with obvious nonsense you can spot in a glance, but with plausible code that does almost the right thing. Reviewing it needs a different discipline from reviewing code your colleague wrote, because the failure modes are different.

If you are using AI the other way round, as a reviewer rather than an author, our guide to [using AI for code review](/ai-tools/how-to-use-ai-for-code-review) covers that side. This article is about the reverse: a model wrote the code, and now someone, probably you, has to review it.

## Why AI-Generated Code Needs Its Own Review Discipline

A human colleague and an AI assistant produce different kinds of wrong code.

A human usually makes a mistake because they misunderstood the requirement or forgot an edge case. Their mistakes cluster around intent. You can often reason about what they meant and ask them directly.

An AI makes a mistake because it produced the most statistically likely next token given what came before. Its mistakes cluster around confident pattern-matching. It will invent a library function that sounds right. It will use an API signature that was correct three versions ago. It will write error handling that looks textbook but silently swallows the specific exception you care about.

A <a href="https://arxiv.org/abs/2211.03622" target="_blank" rel="noopener noreferrer">2022 Stanford study ↗</a> measured this directly: developers using AI assistants wrote less secure code and rated their own output as more secure than the group without assistants. The false confidence is not a marketing problem, it is a review problem.

The <a href="https://github.blog/news-insights/research/survey-reveals-ais-impact-on-the-developer-experience/" target="_blank" rel="noopener noreferrer">2024 GitHub developer survey ↗</a> found that 97% of developers use AI coding tools at work. That means most code review today is already partly AI-review, whether the reviewer knows it or not. Pretending otherwise produces the kind of incident I opened with.

## The Checklist

Run this in order. Each step takes seconds. Skipping one is how bugs ship.

### 1. Check Every Import and External Call

AI models hallucinate library functions more often than any other category of mistake. A function like `crypto.createSecureToken()` looks plausible, has a sensible name, and does not exist.

Before you read the logic:

- Open the imports. Every single one. Check that the module exists and the version matches your lockfile.
- Read the external call signatures. Look up each one in the official docs, not in the assistant's explanation.
- For any native API (`fetch`, `crypto`, `URL`), check that the shape of the call matches the current spec, not a version from two years ago.

This takes 90 seconds and catches the bugs that no amount of downstream testing will.

### 2. Read the Diff, Not the File

AI assistants often rewrite code they did not need to change. Sometimes it is cosmetic, sometimes it quietly alters behaviour. You cannot spot this by reading the new file; you have to read the diff.

- Run `git diff` against main, not against the previous commit.
- Scan for changes outside the scope of the ticket. Any deletion, any signature change, any renamed variable that was not part of the task.
- If the diff is longer than the ticket justifies, ask why before you read further.

### 3. Check Inputs at Every Trust Boundary

Security bugs concentrate at trust boundaries: anywhere user input meets a database, a shell, an HTTP client, a template, a file system, or another service.

For each boundary, verify:

| Boundary | What to check |
|---|---|
| Database query | Parameterised, never string-concatenated |
| Shell command | No `exec` of user-controlled strings |
| HTTP call | URL scheme and host validated, not just the path |
| Template render | Auto-escaping on, or explicit sanitisation |
| File path | No `..` traversal, path resolved against a safe root |
| Deserialisation | Type-checked, no arbitrary constructor calls |

The <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer">OWASP Top 10 ↗</a> is the short list of what to check and why.

### 4. Run It, Don't Just Read It

Static review catches some things. Running it catches others.

- Run the linter and type checker on the exact diff. Not on main, not on the whole repo, on the diff.
- Run the existing test suite.
- Add a failing test for the case you think is weakest, then run it. If it passes, your mental model was wrong.

If the code is a web handler, hit it with `curl` including a malformed request. If it parses a file, throw a zero byte file at it. The AI did not think about your zero byte file.

### 5. Ask the Model to Explain the Parts You Do Not Understand

If a block of code is doing something non-obvious, ask the assistant why. Then verify the explanation against the actual docs or a reference implementation.

The assistant is often right about what the code does. It is less often right about whether that is the best approach or whether it aligns with your codebase. Treat its explanations as a starting hypothesis, not a source of truth.

### 6. Check Against Your Codebase Conventions

The assistant does not know your team's conventions unless you tell it. It will write code that is idiomatic for the wider ecosystem but inconsistent with what is already in your repo.

- Error handling: does it match how the rest of the codebase handles errors?
- Logging: right logger, right levels, right structured fields?
- Configuration: fetched the same way as the rest of the code, or is this one hardcoded?
- Naming: same conventions as the adjacent module?

Inconsistency is not just a style problem. Inconsistent code accumulates into technical debt faster than any other category. Our piece on [when to fix technical debt](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) covers how to avoid that trap.

## Common AI Failure Modes to Watch For

Four specific patterns cause the majority of the bugs I see.

### Plausible but Wrong APIs

The model writes a call to a function that does not exist, or to one that exists with different semantics. Example: `array.removeDuplicates()` in a language where that is not a standard method, or `JSON.parse(input, { strict: true })` where the second argument does something different from what the model thinks.

Catch it in step 1 of the checklist. Always.

### Silently Swapped Semantics

The code looks like the function it replaces, but a small behaviour has changed. A `map` became a `forEach` that mutates. A `const` became a `let`. A zero-based index became one-based. The shape of the output object gained or lost a field.

Catch it in step 2: read the diff, not the file.

### Overconfident Error Handling

The AI wraps the whole thing in `try { } catch { }` and returns a generic fallback. The test passes because the test does not simulate the error. Production hits the error, the fallback fires, and nobody notices until the numbers stop adding up.

Look for empty catch blocks, catches that only log, and catches that return a default. Each one is a place the system can silently fail.

### Invented Configuration

The code references an environment variable or config key that does not exist yet. It will not crash in development because the fallback path runs. It will behave differently in production once the config is added, or worse, once someone adds a similarly named key.

Grep your config for every key the new code references. If it is not there, either add it deliberately or remove the reference.

## Where AI Review Tools Help, and Where They Do Not

A second model reviewing the first model's output catches a useful class of problems. It flags obvious bugs, style issues, and common security patterns. Tools like Copilot's PR review and CodeRabbit sit in this space and save real time on surface-level issues.

They miss the things that matter most:

- Anything that requires knowing your codebase conventions
- Anything that requires knowing your threat model
- Anything that requires knowing your production constraints (quotas, latency budgets, data volumes)
- Anything the first model also missed because of shared training distribution

Use them as a first pass. Do not mistake them for the last line of defence.

Martin Fowler's ongoing <a href="https://martinfowler.com/articles/exploring-gen-ai.html" target="_blank" rel="noopener noreferrer">Exploring Gen AI notes ↗</a> track where this tooling is actually helping and where it is quietly adding risk. They are worth a recurring read.

## A Simple Reviewer's Workflow

When a teammate (or you) opens a PR that is mostly AI-generated, the review takes about the same time as a human-authored PR of the same size, but the attention goes in different places.

<svg viewBox="0 0 720 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="A five step reviewer workflow for AI-generated code: scan imports and call signatures, read the diff against main, check trust boundaries, run the diff locally, then verify conventions and config.">
  <style>text { font-family: 'Inter', system-ui, sans-serif; }</style>
  <text x="360" y="28" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Reviewing AI-Generated Code: The Five Step Pass</text>
  <rect x="20" y="90" width="120" height="70" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
  <text x="80" y="118" text-anchor="middle" font-size="12" fill="#92400e" font-weight="600">1. Imports</text>
  <text x="80" y="136" text-anchor="middle" font-size="10" fill="#92400e">verify every</text>
  <text x="80" y="150" text-anchor="middle" font-size="10" fill="#92400e">function exists</text>
  <line x1="140" y1="125" x2="170" y2="125" stroke="#94a3b8" stroke-width="1.5" />
  <polygon points="170,125 164,121 164,129" fill="#94a3b8" />
  <rect x="170" y="90" width="120" height="70" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="230" y="118" text-anchor="middle" font-size="12" fill="#3730a3" font-weight="600">2. Diff</text>
  <text x="230" y="136" text-anchor="middle" font-size="10" fill="#3730a3">read against</text>
  <text x="230" y="150" text-anchor="middle" font-size="10" fill="#3730a3">main, not file</text>
  <line x1="290" y1="125" x2="320" y2="125" stroke="#94a3b8" stroke-width="1.5" />
  <polygon points="320,125 314,121 314,129" fill="#94a3b8" />
  <rect x="320" y="90" width="120" height="70" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="1.5" />
  <text x="380" y="118" text-anchor="middle" font-size="12" fill="#9d174d" font-weight="600">3. Trust</text>
  <text x="380" y="136" text-anchor="middle" font-size="10" fill="#9d174d">every input</text>
  <text x="380" y="150" text-anchor="middle" font-size="10" fill="#9d174d">boundary</text>
  <line x1="440" y1="125" x2="470" y2="125" stroke="#94a3b8" stroke-width="1.5" />
  <polygon points="470,125 464,121 464,129" fill="#94a3b8" />
  <rect x="470" y="90" width="120" height="70" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="530" y="118" text-anchor="middle" font-size="12" fill="#3730a3" font-weight="600">4. Run</text>
  <text x="530" y="136" text-anchor="middle" font-size="10" fill="#3730a3">linter, types,</text>
  <text x="530" y="150" text-anchor="middle" font-size="10" fill="#3730a3">tests, curl</text>
  <line x1="590" y1="125" x2="620" y2="125" stroke="#94a3b8" stroke-width="1.5" />
  <polygon points="620,125 614,121 614,129" fill="#94a3b8" />
  <rect x="600" y="90" width="100" height="70" rx="8" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5" />
  <text x="650" y="118" text-anchor="middle" font-size="12" fill="#14532d" font-weight="600">5. Fit</text>
  <text x="650" y="136" text-anchor="middle" font-size="10" fill="#14532d">conventions,</text>
  <text x="650" y="150" text-anchor="middle" font-size="10" fill="#14532d">config, naming</text>
  <text x="360" y="210" text-anchor="middle" font-size="11" fill="#64748b">Each step is seconds. Skipping one is how production bugs ship.</text>
  <text x="360" y="230" text-anchor="middle" font-size="10" fill="#94a3b8">Same pass applies to your own AI-assisted work before you open the PR.</text>
</svg>

The workflow is the same whether the author is a colleague or yourself. If you wrote the code with a model, run the checklist on it before you open the PR. Self-review with the model's output in front of you is the cheapest bug-catching pass you can do.

## Keep the Loop Tight

The teams that ship AI-assisted work reliably have one thing in common: a short feedback loop between "the model wrote this" and "a human understood this". A PR that sits open for three days with 500 lines of AI-generated code is a PR that gets rubber-stamped. A PR that is small, scoped, and reviewed within an hour of opening gets genuine scrutiny.

That is also the core argument in our piece on [code reviews that do not waste time](/collaboration/code-reviews-that-dont-waste-time). Fast review is not in tension with careful review. Fast review is what makes careful review possible, because reviewers actually have the context loaded.

Combine that with the checklist above, and AI-generated code becomes what it should be: a force multiplier for your team, not a faster way to ship the bug you would otherwise have spotted in a human pull request.

## Subscribe for More Practical Developer Guides

If you found this useful, our newsletter covers practical workflows, tooling, and code quality topics every week. No hype, no filler. Sign up from any page on the site.
