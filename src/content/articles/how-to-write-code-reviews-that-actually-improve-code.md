---
title: "How to Write Code Reviews That Actually Improve Code"
description: "Code review best practices that help you give feedback developers want to act on, not argue about."
publishDate: "2026-03-18"
author: "david-white"
category: "collaboration"
tags: ["code-review", "collaboration", "best-practices", "team-culture", "pull-requests"]
featured: false
draft: false
faqs:
  - question: "What are the most important code review best practices?"
    answer: "Focus on logic, readability, and security rather than style preferences. Automate formatting with tools like Prettier or ESLint. Give feedback as questions or suggestions, not commands. Distinguish between blocking issues and optional improvements. Keep comments specific with concrete alternatives, and always explain the reasoning behind your feedback."
  - question: "How do you give constructive feedback in a code review?"
    answer: "Frame comments as questions or suggestions rather than directives. Instead of saying 'this is wrong,' explain why a change would improve the code and offer a specific alternative. Use prefixes like 'nit:' for minor points and 'suggestion:' for optional improvements. Focus on the code, not the person, and acknowledge good decisions alongside areas for improvement."
  - question: "What should reviewers focus on during code review?"
    answer: "Prioritise logic errors, security vulnerabilities, missing edge case handling, and architectural fit. These are areas where human judgement adds the most value. Leave style enforcement to automated tools. Also consider whether tests cover the important behaviours and whether the code is readable to someone encountering it for the first time."
  - question: "How do you handle large pull requests in code review?"
    answer: "Ask the author to split the PR into smaller, logically coherent pieces if possible. If that is not an option, review the PR in passes: first scan for structural and architectural issues, then do a detailed line-by-line review of the critical paths. Focus your detailed attention on the business logic rather than boilerplate."
  - question: "How do you build a healthy code review culture on a team?"
    answer: "Establish shared review guidelines that everyone agrees on. Rotate reviewers to spread knowledge. Normalise asking questions and receiving feedback by reviewing your own code publicly. Celebrate good reviews, not just good code. Make review turnaround time a team metric, and treat reviews as a collaborative conversation rather than a gatekeeping exercise."
primaryKeyword: "code review best practices"
---

## Most Code Reviews Miss the Point

Every development team does code reviews. Very few do them in a way that meaningfully improves the codebase. The typical review consists of a senior developer leaving a trail of style nitpicks while a logic bug slips through untouched. The author fixes the bracket placement, merges the PR, and the bug ships to production.

I have reviewed thousands of pull requests across different teams and codebases. The pattern is consistent: teams that write better review comments ship fewer bugs, onboard new developers faster, and spend less time arguing about code. The difference is not in how much time they spend reviewing. It is in what they choose to focus on.

## Why Most Reviews Fail

### Style Over Substance

The most common failure mode is spending review energy on things that should be automated. If your team is debating whether to use single or double quotes in a code review, you have a tooling problem, not a review problem.

Set up a formatter like Prettier or Black. Configure your linter. Run these checks in CI before a human ever sees the PR. Every comment about indentation or import ordering is a comment that could have been spent catching a race condition or a missing null check. For a deeper look at setting this up, see [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters).

### Vague Feedback

"This could be better" is not useful feedback. Neither is "I don't like this approach." The author has no idea what to change or why. Vague comments create frustration and often lead to back-and-forth conversations that waste everyone's time.

Every review comment should answer two questions: what specifically is the concern, and why does it matter? If you cannot articulate both, the comment probably is not worth leaving.

### Ego-Driven Reviews

Some reviewers treat code review as an opportunity to demonstrate their superiority. They rewrite working code in their preferred style, demand changes that reflect personal taste rather than genuine improvements, and block merges over subjective disagreements. This behaviour destroys team trust and makes developers dread submitting PRs.

## What to Actually Focus On

Your value as a human reviewer lies in the areas where automation falls short. Concentrate your attention here:

### Logic and Correctness

Does the code do what the PR description says it does? Trace through the logic manually, especially for edge cases. Consider what happens with empty inputs, null values, boundary conditions, and concurrent access.

```python
# What happens if the user has no orders?
def get_average_order_value(user):
    orders = get_orders(user.id)
    total = sum(order.amount for order in orders)
    return total / len(orders)  # ZeroDivisionError when orders is empty
```

A comment like "What happens when `orders` is empty? This will raise a ZeroDivisionError" is specific, actionable, and catches a real bug. That is the kind of feedback that improves code.

### Security

Check that user input is validated and sanitised. Look for SQL injection, cross-site scripting, insecure direct object references, and missing authorisation checks. These are the kinds of issues that automated scanners sometimes miss and that have serious consequences.

```javascript
// Review comment: This endpoint accepts a user-provided ID without
// checking that the authenticated user has permission to access it.
// An attacker could enumerate other users' data.
app.get('/api/documents/:id', async (req, res) => {
  const doc = await db.documents.findById(req.params.id);
  res.json(doc);
});
```

### Readability and Maintainability

Ask yourself: if I encountered this code six months from now with no context, would I understand what it does and why? Variable names, function decomposition, and the overall structure of the change all affect long-term maintainability.

This is not about style. It is about whether future developers (including the author) can understand and safely modify the code. A function called `processData` tells you nothing. A function called `validateAndNormaliseShippingAddress` tells you exactly what it does.

### Missing Tests

If the PR introduces new logic or fixes a bug, there should be tests covering those changes. Look for whether the tests actually verify the important behaviours, not just that they exist. A test that only checks the happy path and ignores edge cases provides a false sense of security. Our guide on [writing tests that actually help](/code-quality/how-to-write-tests-that-actually-help) covers this in more detail.

## How to Structure Your Comments

### Use Clear Prefixes

Adopting a consistent prefix system removes ambiguity about the severity of each comment:

| Prefix | Meaning | Author Action |
|---|---|---|
| **blocker:** | Bug, security issue, or incorrect logic | Must fix before merging |
| **suggestion:** | A better approach worth considering | Discuss and decide |
| **nit:** | Minor preference, take it or leave it | Optional |
| **question:** | Something you want to understand | Respond with explanation |
| **praise:** | Something done well | No action needed |

This system ensures the author can quickly triage comments and focus on what matters. Without it, every comment feels equally urgent, which is exhausting.

### Show, Don't Just Tell

When suggesting a change, provide a concrete alternative. Comparing the current approach with a proposed one is far more effective than describing the change in prose:

```typescript
// Instead of: "This function is too complex"
// Try:

// blocker: This function handles validation, transformation,
// and persistence in a single block. If the transformation
// fails partway through, we have no way to tell which
// records were already saved.
//
// Consider splitting it:

async function importUsers(rawData: RawUser[]): ImportResult {
  const validated = validateUsers(rawData);
  const transformed = transformUsers(validated);
  return await persistUsers(transformed);
}
```

The reviewer has explained the problem (partial failure is undetectable), given a reason it matters (data integrity), and offered a specific solution. The author can immediately act on this.

### Ask Questions Before Making Demands

If you do not understand why the author made a particular decision, ask before assuming it is wrong. The author may have context you lack:

- "question: I notice this uses polling instead of WebSockets. Was there a specific reason for that choice?"
- "question: This skips validation for admin users. Is that intentional?"

Questions invite conversation. Demands invite defensiveness. The difference in tone dramatically affects how feedback is received.

## Dealing with Large Pull Requests

Large PRs are a reality, even on teams that try to keep them small. When you are faced with a 1,000-line PR, a structured approach prevents you from either rubber-stamping it or drowning in details.

### Review in Passes

Do not try to catch everything in a single read-through. Instead, make multiple passes with different focuses:

1. **First pass (5 minutes):** Read the PR description and scan the file list. Understand the shape of the change. Are the right files being modified? Does the scope match the description?
2. **Second pass (10 minutes):** Review the architecture. Are new abstractions introduced? Do they fit the existing patterns? Is the change in the right layer of the application?
3. **Third pass (15 minutes):** Line-by-line review of the core logic. Skip auto-generated files, test fixtures, and boilerplate. Focus on business logic, data handling, and integration points.

If the PR is genuinely too large to review effectively, say so. "This PR covers three separate concerns. Could we split the database migration, the API changes, and the frontend updates into separate PRs?" is a valid and helpful piece of feedback. For more on why this matters, see [why your pull requests take too long](/collaboration/why-your-pull-requests-take-too-long).

### Focus on the Critical Path

Not every file in a large PR deserves equal scrutiny. Configuration changes, dependency updates, and generated code can usually be scanned quickly. Direct your detailed attention to the files that contain business logic, handle user input, or modify shared infrastructure.

## Building a Healthy Review Culture

Code review best practices only work if the team genuinely buys into them. Culture matters more than process.

### Make It a Conversation, Not an Inspection

The best review cultures treat PRs as collaborative discussions. Both the author and reviewer are working towards the same goal: shipping good code. When feedback is framed as "how can we make this better together" rather than "here is everything you did wrong," people engage differently.

### Normalise Receiving Feedback

Senior developers should actively seek review feedback on their own code. When the most experienced person on the team responds to critique with "good point, I will fix that," it signals that feedback is a normal part of the process, not a judgement of competence. For more on creating this kind of team dynamic, see [how to run effective engineering standups](/collaboration/how-to-run-effective-engineering-standups).

### Acknowledge Good Work

Reviews should not be entirely about finding problems. When you see a well-structured function, a clever optimisation, or thorough test coverage, say so. A simple "praise: really clean separation of concerns here" takes two seconds and reinforces the behaviours you want to see more of.

### Track and Improve

Periodically review your review process itself. Are reviews happening promptly? Are the same types of bugs repeatedly slipping through? Are certain categories of feedback coming up so often that they should be automated? For a broader look at optimising your review workflow, see [code reviews that don't waste time](/collaboration/code-reviews-that-dont-waste-time).

## Write Reviews You Would Want to Receive

The simplest code review best practices guideline is this: before you submit your review, re-read your comments and ask whether you would find them helpful if you were the author. If a comment would make you defensive, confused, or frustrated, rewrite it.

Good code reviews are specific, constructive, and focused on what matters. They catch the bugs that tests miss, spread knowledge across the team, and raise the quality of every line of code that passes through them. They are also one of the most effective ways to build trust within an engineering team.

The next time you open a pull request to review, skip the nitpicks. Find the logic error. Ask the clarifying question. Suggest the better abstraction. That is how you write reviews that actually improve code.
