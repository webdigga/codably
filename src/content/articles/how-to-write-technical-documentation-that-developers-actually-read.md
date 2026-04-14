---
title: "How to Write Technical Documentation That Developers Actually Read"
description: "Learn how to write technical documentation developers actually read, from READMEs and API docs to architecture decision records."
publishDate: "2026-04-14"
author: "gareth-clubb"
category: "collaboration"
tags: ["documentation", "technical writing", "developer experience", "collaboration", "READMEs"]
featured: false
draft: false
faqs:
  - question: "What is the most important type of technical documentation?"
    answer: "The README is the most important piece of documentation for any project. It is the first thing developers encounter when they discover your repository. A good README should explain what the project does, how to get started, and where to find more detailed documentation. Without a solid README, most developers will move on without exploring further."
  - question: "How often should technical documentation be updated?"
    answer: "Documentation should be updated whenever the code it describes changes. The most effective approach is to treat documentation updates as part of the definition of done for any task. If a pull request changes behaviour, it should also update the relevant docs. Stale documentation is often worse than no documentation because it actively misleads developers."
  - question: "What are Architecture Decision Records?"
    answer: "Architecture Decision Records (ADRs) are short documents that capture important architectural decisions along with their context and consequences. Each ADR describes a single decision, the options that were considered, and the reasoning behind the chosen approach. They create a searchable history of why your system is built the way it is."
  - question: "Should inline code comments explain what the code does?"
    answer: "No. Inline comments should explain why the code does something, not what it does. If you need a comment to explain what the code is doing, the code itself is probably too complex and should be refactored. Reserve comments for non-obvious business logic, workarounds for known bugs, and performance decisions that might look wrong at first glance."
  - question: "How do you keep documentation from becoming outdated?"
    answer: "Treat documentation like code by storing it alongside the source in version control, reviewing doc changes in pull requests, and running automated checks for broken links or outdated references. Adopt a docs-as-code workflow where documentation goes through the same review and CI process as your application code."
primaryKeyword: "technical documentation developers"
---

## Most Documentation Fails Because Nobody Reads It

Every team has a wiki full of pages that nobody has touched in two years. There are Confluence spaces with outdated architecture diagrams, README files that describe a setup process three versions old, and API docs that are missing half the endpoints. The documentation exists, but it might as well not.

The problem is rarely that teams do not write documentation. The problem is that they write documentation nobody wants to read. Walls of text with no structure. Reference material with no context. Getting-started guides that assume you already understand the system.

I have spent years writing and maintaining documentation across teams of various sizes. The patterns that work are surprisingly consistent, and they have less to do with writing skill than with understanding what developers actually need when they reach for documentation.

## Understanding the Four Types of Documentation

Before writing anything, it helps to understand that "documentation" is not a single category. The <a href="https://docs.divio.com/documentation-system/" target="_blank" rel="noopener noreferrer">Divio documentation system ↗</a> identifies four distinct types, each serving a different purpose.

| Type | Purpose | Written for | Example |
|---|---|---|---|
| Tutorials | Learning by doing | Newcomers | "Build your first API endpoint" |
| How-to guides | Solving specific problems | Practitioners | "How to add authentication" |
| Reference | Describing the system | Anyone looking up details | API endpoint specifications |
| Explanation | Understanding context | Anyone wanting deeper knowledge | "Why we chose event sourcing" |

Most teams dump everything into one category and wonder why nobody can find what they need. A tutorial should not read like a reference guide. A how-to guide should not explain architectural philosophy. Keeping these types separate makes each one more useful.

## READMEs: Your Project's Front Door

The README is the single most impactful piece of documentation you can write. It is the first thing a developer sees when they open your repository, and it determines whether they dig deeper or move on.

### What Every README Needs

A good README answers five questions within the first thirty seconds of reading:

1. **What is this?** A one-sentence description of what the project does.
2. **Why does it exist?** The problem it solves and who it is for.
3. **How do I get started?** Prerequisites, installation, and a minimal working example.
4. **How do I contribute?** Links to contribution guidelines and development setup.
5. **Where do I get help?** Links to further documentation, issue trackers, or communication channels.

The <a href="https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes" target="_blank" rel="noopener noreferrer">GitHub documentation on READMEs ↗</a> recommends placing your README at the repository root so it renders automatically when someone visits the repo page.

### Keep the Getting Started Section Ruthlessly Short

The biggest mistake in README files is a getting-started section that runs to fifty lines. Developers want to go from zero to "it works" in under five minutes. If your setup process is genuinely complex, put the detailed steps in a separate `CONTRIBUTING.md` file and link to it from the README.

Here is a good pattern:

```bash
# Clone and install
git clone https://github.com/your-org/your-project.git
cd your-project
npm install

# Run locally
npm run dev
```

Three commands. If it takes more than that, document the additional steps separately and link to them.

## API Documentation That Developers Trust

API documentation has a unique challenge: it must be both comprehensive and accurate. A single incorrect parameter type or missing field can cost a developer hours of debugging.

### Specification-Driven Documentation

The most reliable approach is to generate API docs from a specification file. The <a href="https://swagger.io/specification/" target="_blank" rel="noopener noreferrer">OpenAPI Specification ↗</a> (formerly Swagger) is the industry standard for describing REST APIs. By defining your API in an OpenAPI file and generating documentation from it, you guarantee that the docs match the actual API contract.

The advantages are significant:

- **Accuracy:** The specification is the source of truth, not a manually written page.
- **Consistency:** Every endpoint follows the same documentation format.
- **Tooling:** You get interactive documentation, client generation, and validation for free.
- **Versioning:** The spec lives in version control alongside your code.

### Include Real Examples

Every endpoint should include a complete request and response example. Not a schema definition with abstract types, but an actual JSON payload a developer can copy, paste, and modify. Compare these two approaches:

**Unhelpful:**
```
POST /users
Body: UserCreateRequest
Response: UserResponse
```

**Helpful:**
```bash
curl -X POST https://api.example.com/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer your-token" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "role": "developer"
  }'
```

```json
{
  "id": "usr_abc123",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "role": "developer",
  "createdAt": "2026-04-14T10:30:00Z"
}
```

The second version lets a developer test the endpoint immediately. That is the difference between documentation that gets read and documentation that gets ignored.

## Architecture Decision Records

One of the most undervalued forms of documentation is the Architecture Decision Record (ADR). ADRs capture the "why" behind significant technical decisions, something that commit messages and code comments rarely preserve.

### Why ADRs Matter

Six months from now, a new team member will look at your system and ask, "Why did we use PostgreSQL instead of MongoDB?" or "Why is this service deployed separately instead of being part of the monolith?" Without ADRs, the answer lives only in the heads of people who might have already left the team.

This connects directly to the mindset shift described in [The Senior Developer Mindset](/career/the-senior-developer-mindset). Senior developers think beyond the immediate implementation and consider how decisions will be understood by future team members.

### ADR Structure

The <a href="https://adr.github.io/" target="_blank" rel="noopener noreferrer">ADR GitHub organisation ↗</a> recommends a simple format. Each ADR is a short markdown file with four sections:

```markdown
# ADR-001: Use PostgreSQL for the primary datastore

## Status
Accepted

## Context
We need a primary datastore for user and transaction data.
The application requires ACID compliance for financial
transactions and complex querying for reporting.

## Decision
We will use PostgreSQL as our primary datastore.

## Consequences
- We gain strong ACID compliance and mature tooling.
- We need team members with SQL and relational modelling skills.
- We accept the operational overhead of managing a relational
  database versus a managed NoSQL service.
```

Each ADR should be a single page. If you are writing more than a page, you are probably bundling multiple decisions together. Keep them focused.

### Where to Store ADRs

Store ADRs in a `docs/adr/` directory within your repository. Number them sequentially. This makes them easy to reference in pull requests and discussions ("see ADR-012 for why we chose this approach").

<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the docs-as-code workflow: write docs in markdown, store in version control, review in pull requests, build with CI, deploy to documentation site.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <text x="300" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Docs-as-Code Workflow</text>
  <!-- Step 1: Write -->
  <rect x="30" y="50" width="130" height="60" rx="8" fill="#3b82f6" />
  <text x="95" y="75" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Write</text>
  <text x="95" y="93" text-anchor="middle" font-size="10" fill="#dbeafe">Markdown / MDX</text>
  <!-- Step 2: Version Control -->
  <rect x="190" y="50" width="130" height="60" rx="8" fill="#8b5cf6" />
  <text x="255" y="75" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Commit</text>
  <text x="255" y="93" text-anchor="middle" font-size="10" fill="#ede9fe">Git repository</text>
  <!-- Step 3: Review -->
  <rect x="350" y="50" width="130" height="60" rx="8" fill="#f59e0b" />
  <text x="415" y="75" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Review</text>
  <text x="415" y="93" text-anchor="middle" font-size="10" fill="#fef3c7">Pull request</text>
  <!-- Step 4: Build -->
  <rect x="190" y="160" width="130" height="60" rx="8" fill="#64748b" />
  <text x="255" y="185" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Build</text>
  <text x="255" y="203" text-anchor="middle" font-size="10" fill="#e2e8f0">CI pipeline</text>
  <!-- Step 5: Deploy -->
  <rect x="350" y="160" width="130" height="60" rx="8" fill="#22c55e" />
  <text x="415" y="185" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Deploy</text>
  <text x="415" y="203" text-anchor="middle" font-size="10" fill="#dcfce7">Documentation site</text>
  <!-- Arrows -->
  <defs>
    <marker id="arrowDoc" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M 0 0 L 8 3 L 0 6 Z" fill="#cbd5e1" />
    </marker>
    <marker id="arrowFeedback" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <path d="M 0 0 L 8 3 L 0 6 Z" fill="#ef4444" />
    </marker>
  </defs>
  <line x1="160" y1="80" x2="188" y2="80" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrowDoc)" />
  <line x1="320" y1="80" x2="348" y2="80" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrowDoc)" />
  <line x1="415" y1="112" x2="415" y2="158" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrowDoc)" />
  <line x1="348" y1="190" x2="322" y2="190" stroke="#cbd5e1" stroke-width="2" marker-end="url(#arrowDoc)" />
  <!-- Feedback loop from Review back to Write -->
  <path d="M 350 95 C 300 130 100 130 60 112" fill="none" stroke="#ef4444" stroke-width="1.5" stroke-dasharray="6,3" marker-end="url(#arrowFeedback)" />
  <text x="190" y="140" text-anchor="middle" font-size="10" fill="#ef4444">Feedback (if changes needed)</text>
  <!-- Benefits list -->
  <text x="300" y="260" text-anchor="middle" font-size="13" font-weight="600" fill="#334155">Benefits of Docs-as-Code</text>
  <rect x="30" y="275" width="160" height="40" rx="6" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
  <text x="110" y="299" text-anchor="middle" font-size="10" fill="#475569">Version history for docs</text>
  <rect x="220" y="275" width="160" height="40" rx="6" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
  <text x="300" y="299" text-anchor="middle" font-size="10" fill="#475569">Peer review catches errors</text>
  <rect x="410" y="275" width="160" height="40" rx="6" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
  <text x="490" y="299" text-anchor="middle" font-size="10" fill="#475569">Automated link checking</text>
  <rect x="120" y="330" width="160" height="40" rx="6" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
  <text x="200" y="354" text-anchor="middle" font-size="10" fill="#475569">Docs ship with code changes</text>
  <rect x="320" y="330" width="160" height="40" rx="6" fill="#f1f5f9" stroke="#e2e8f0" stroke-width="1" />
  <text x="400" y="354" text-anchor="middle" font-size="10" fill="#475569">Single source of truth</text>
</svg>

## Inline Documentation: Comments That Add Value

Inline comments are the most common and most misused form of documentation. The rule is simple: comments should explain **why**, never **what**.

### Comments That Help

```javascript
// Retry with exponential backoff because the payment
// gateway rate-limits at 100 requests per minute and
// returns 429 without a Retry-After header.
await retry(processPayment, { maxAttempts: 3, backoff: 'exponential' });
```

```javascript
// We sort by createdAt descending here instead of in the
// database query because the query already uses an index
// on (userId, status) and adding createdAt to the ORDER BY
// causes a filesort on tables over 1M rows.
results.sort((a, b) => b.createdAt - a.createdAt);
```

These comments save future developers from "optimising" the code back into a broken state. Without them, someone will inevitably move the sort into the query and create a performance regression.

### Comments That Waste Space

```javascript
// Increment the counter
counter++;

// Check if the user is logged in
if (user.isLoggedIn) {

// Return the result
return result;
```

These comments add no information. They restate what the code already says in plain English. Every unnecessary comment is noise that makes the useful comments harder to spot.

### When to Use JSDoc and Type Annotations

For public APIs and shared libraries, structured documentation tools like <a href="https://jsdoc.app/" target="_blank" rel="noopener noreferrer">JSDoc ↗</a> or TypeDoc add significant value. They provide IDE integration, generate reference documentation, and enforce consistency.

```typescript
/**
 * Calculates the compound interest on a principal amount.
 *
 * Uses the standard compound interest formula. Returns the
 * total amount including the original principal.
 *
 * @param principal - The initial investment amount in pence
 * @param rate - Annual interest rate as a decimal (e.g. 0.05 for 5%)
 * @param years - Number of years to compound
 * @returns Total amount after compounding, in pence
 * @throws {RangeError} If rate is negative or years is less than zero
 */
function calculateCompoundInterest(
  principal: number,
  rate: number,
  years: number
): number {
  if (rate < 0 || years < 0) {
    throw new RangeError('Rate and years must be non-negative');
  }
  return Math.round(principal * Math.pow(1 + rate, years));
}
```

The key is to document the contract, not the implementation. What does the function accept? What does it return? What are the edge cases? The implementation details belong in the code itself.

## Making Documentation a Team Habit

Writing good documentation is one thing. Keeping it current is another. The teams I have seen succeed with documentation share a few common practices.

### Include Docs in the Definition of Done

If a pull request changes user-facing behaviour, it must include a documentation update. This is not optional. Treat it exactly like you would treat a missing test. As discussed in [Code Reviews That Don't Waste Time](/collaboration/code-reviews-that-dont-waste-time), reviewers should check for documentation updates just as they check for test coverage.

### Use Templates

Provide templates for common documentation types. A blank page is intimidating. A template with sections to fill in is approachable. Create templates for:

- README files
- ADRs
- API endpoint documentation
- Runbook entries
- Post-incident reviews

### Write for Your Future Self

The best motivation for writing good documentation is selfish. You will be the person debugging this system at 11pm on a Friday. You will be the one who cannot remember why the retry logic uses a specific backoff interval. Write the documentation you wish you had last time you were stuck.

This principle applies to [writing good commit messages](/workflows/the-art-of-writing-good-commit-messages) as well. A commit message like "fix bug" tells you nothing six months later. A message like "fix race condition in payment processing when two requests arrive within the same millisecond" tells you exactly what happened and why.

### Review Documentation Like Code

Documentation should go through pull request review just like application code. This catches errors, improves clarity, and ensures more than one person knows where things are documented. It also normalises documentation as a first-class engineering activity, not an afterthought. If your team already follows good [code review practices](/collaboration/how-to-write-code-reviews-that-actually-improve-code), extend those same habits to documentation changes.

## Documentation Checklist

Use this checklist when evaluating your project's documentation health:

| Area | Question | Status |
|---|---|---|
| README | Does it explain what the project does in one sentence? | |
| README | Can a new developer run the project in under 5 minutes? | |
| API docs | Is every endpoint documented with request and response examples? | |
| API docs | Are error responses documented? | |
| ADRs | Are significant architectural decisions recorded? | |
| Inline comments | Do comments explain "why" rather than "what"? | |
| Freshness | Was documentation updated in the last pull request that changed behaviour? | |
| Discoverability | Can developers find docs from the README within two clicks? | |

## Start Small, Stay Consistent

You do not need to document everything at once. Start with the README. Make it genuinely useful. Then add API documentation for your most-used endpoints. Write your first ADR the next time you make an architectural decision. Add a "why" comment the next time you write code that looks counterintuitive.

The compounding effect of consistent, small documentation efforts is remarkable. After six months, you will have a body of documentation that genuinely helps your team move faster, onboard new members more quickly, and make better decisions with full context.

If you are contributing to open source projects, good documentation is especially critical. As covered in [How to Contribute to Open Source for the First Time](/open-source/how-to-contribute-to-open-source-for-the-first-time), clear documentation lowers the barrier for new contributors and makes your project more welcoming.

The next time you finish a feature, take ten minutes to write the documentation you wish had existed when you started. Your future teammates will thank you for it.
