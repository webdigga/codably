---
title: "Writing Documentation Developers Actually Read"
description: "Write developer documentation that people actually read and use. Practical strategies for READMEs, API docs, and guides."
publishDate: "2026-03-04"
author: "jonny-rowse"
category: "collaboration"
tags: ["documentation", "developer-experience", "technical-writing", "collaboration", "onboarding"]
featured: false
draft: false
faqs:
  - question: "What is the most important piece of documentation for a project?"
    answer: "The README. It is the first thing anyone encounters when they find your project. A good README should explain what the project does, how to get it running locally, and where to find more detailed documentation. If you only write one piece of documentation, make it the README."
  - question: "How do you keep documentation up to date?"
    answer: "Treat documentation updates as part of the definition of done for any code change. Include documentation changes in pull requests alongside code changes. Use automated checks where possible, such as verifying that API documentation matches the actual endpoints. Place docs as close to the code as possible so they are visible when making changes."
  - question: "Should you use a wiki or keep docs in the code repository?"
    answer: "Keep documentation in the code repository whenever possible. Docs in the repo benefit from version control, pull request reviews, and proximity to the code they describe. Wikis tend to drift out of date because they are not part of the development workflow. Reserve wikis for organisational knowledge that spans multiple repositories."
  - question: "How detailed should code comments be?"
    answer: "Comments should explain why, not what. Well-written code should be self-explanatory in terms of what it does. Comments add value when they explain the reasoning behind a decision, document a non-obvious constraint, or warn about a subtle gotcha. If you find yourself writing extensive comments to explain what code does, the code probably needs refactoring."
  - question: "What tools are best for developer documentation?"
    answer: "For API documentation, OpenAPI/Swagger with auto-generation from code annotations works well. For project docs, Markdown files in the repository are simple and effective. For larger documentation sites, tools like Docusaurus, Starlight, or MkDocs provide good developer experiences with minimal setup overhead."
primaryKeyword: "developer documentation"
---

## Most Documentation Is Written for Nobody

Documentation has a reputation problem. Developers know it is important. They feel guilty about not writing it. So they occasionally produce a wall of text that describes how the system worked six months ago, bury it in a wiki nobody checks, and go back to writing code.

The result is documentation that is technically written but practically useless. It exists to make people feel responsible, not to help anyone accomplish anything.

Good documentation is different. It is concise, accurate, and placed where developers will actually encounter it. Writing it well is a skill, and like any skill, it improves with deliberate practice. In my experience, the teams that produce the best documentation treat it as a product with real users, not as a chore to be completed.

## The Four Types of Documentation

The <a href="https://diataxis.fr/" target="_blank" rel="noopener noreferrer">Diataxis framework ↗</a> identifies four distinct types of documentation, each serving a different purpose. Mixing them up is one of the most common documentation mistakes.

| Type | Orientation | User Need | Example |
|---|---|---|---|
| Tutorial | Learning | "Help me get started" | "Build a REST API with Express in 15 minutes" |
| How-to guide | Task | "Help me do this specific thing" | "How to add authentication to an existing API" |
| Reference | Information | "I need the exact details" | API endpoint docs with parameters and responses |
| Explanation | Understanding | "Help me understand why" | "Why we chose PostgreSQL over MongoDB" |

### Tutorials (Learning-Oriented)

Tutorials guide a learner through a series of steps to complete a project or task. They are about learning by doing.

A good tutorial:
- Has a clear starting point and end goal
- Includes every step, even the "obvious" ones
- Results in something that works
- Does not explain every concept in depth (that is what explanations are for)

### How-To Guides (Task-Oriented)

How-to guides help someone accomplish a specific, real-world task. They assume the reader already has basic knowledge and needs to get something done.

A good how-to guide:
- Addresses a specific, common task
- Is focused and direct
- Lists prerequisites upfront
- Provides the steps without extensive background

### Reference (Information-Oriented)

Reference documentation describes the system factually: API endpoints, configuration options, function signatures, and data structures. It is meant to be consulted, not read from start to finish.

Good reference documentation:
- Is comprehensive and accurate
- Is consistently structured
- Can be auto-generated from code where possible
- Includes examples for every endpoint or function

### Explanation (Understanding-Oriented)

Explanations provide background and context. They help developers understand why the system works the way it does, the tradeoffs involved, and the reasoning behind decisions.

Good explanations:
- Discuss alternatives and why they were not chosen
- Provide context that helps with future decision-making
- Are not tied to specific tasks

## Writing a README That Works

Your README is the front door to your project. Here is what it should contain, in order:

### 1. What This Is

One to three sentences explaining what the project does and who it is for. Do not bury the lead. A developer should know within five seconds whether this project is relevant to them.

### 2. Quick Start

The fastest path from "I just cloned this" to "I have it running locally." This should be a numbered list of commands that works on a fresh checkout.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start the development server
npm run dev
```

If the setup requires more than five steps, simplify your setup process, not your documentation. Our article on [automating your development environment](/workflows/how-to-automate-your-development-environment) covers how to reduce setup to a single command.

### 3. Key Concepts

A brief overview of the major components, architecture, or concepts that a new developer needs to understand. Keep this high-level. Link to detailed documentation for depth.

### 4. Common Tasks

Short sections covering the tasks developers perform most frequently: running tests, creating a database migration, deploying to staging, adding a new API endpoint. These are mini how-to guides.

### 5. Where to Find More

Links to detailed documentation, architectural decision records, and any relevant external resources.

<svg viewBox="0 0 600 330" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the structure of an effective README file, with sections stacked vertically from 'What This Is' at the top through Quick Start, Key Concepts, Common Tasks, to Further Reading at the bottom, with estimated reading times.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="300" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Anatomy of an Effective README</text>
  <!-- Sections stacked -->
  <rect x="100" y="40" width="400" height="44" rx="6" fill="#3b82f6" />
  <text x="300" y="58" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">What This Is</text>
  <text x="300" y="74" text-anchor="middle" font-size="10" fill="#dbeafe">1-3 sentences. 5-second clarity test.</text>
  <rect x="100" y="90" width="400" height="44" rx="6" fill="#3b82f6" opacity="0.85" />
  <text x="300" y="108" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Quick Start</text>
  <text x="300" y="124" text-anchor="middle" font-size="10" fill="#dbeafe">Clone to running in under 5 steps.</text>
  <rect x="100" y="140" width="400" height="44" rx="6" fill="#3b82f6" opacity="0.7" />
  <text x="300" y="158" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Key Concepts</text>
  <text x="300" y="174" text-anchor="middle" font-size="10" fill="#dbeafe">Architecture overview. High-level mental model.</text>
  <rect x="100" y="190" width="400" height="44" rx="6" fill="#3b82f6" opacity="0.55" />
  <text x="300" y="208" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Common Tasks</text>
  <text x="300" y="224" text-anchor="middle" font-size="10" fill="#dbeafe">Mini how-to guides for daily workflows.</text>
  <rect x="100" y="240" width="400" height="44" rx="6" fill="#3b82f6" opacity="0.4" />
  <text x="300" y="258" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Further Reading</text>
  <text x="300" y="274" text-anchor="middle" font-size="10" fill="#dbeafe">Links to ADRs, detailed docs, external resources.</text>
  <!-- Side annotations -->
  <text x="520" y="66" font-size="10" fill="#64748b">~10 sec</text>
  <text x="520" y="116" font-size="10" fill="#64748b">~2 min</text>
  <text x="520" y="166" font-size="10" fill="#64748b">~3 min</text>
  <text x="520" y="216" font-size="10" fill="#64748b">~5 min</text>
  <text x="520" y="266" font-size="10" fill="#64748b">As needed</text>
  <!-- Arrow showing reading flow -->
  <text x="85" y="165" text-anchor="end" font-size="22" fill="#cbd5e1">↓</text>
  <text x="50" y="145" text-anchor="middle" font-size="10" fill="#64748b" transform="rotate(-90, 50, 170)">Reading priority</text>
</svg>

## API Documentation

API documentation deserves special attention because it is one of the most frequently consulted types of documentation. For principles on designing APIs that are easy to document, see our article on [API design principles every developer should know](/backend/api-design-principles-every-developer-should-know).

### Auto-Generate Where Possible

Use tools that generate API documentation from your code. <a href="https://swagger.io/specification/" target="_blank" rel="noopener noreferrer">OpenAPI/Swagger ↗</a> annotations, JSDoc comments, and similar tools ensure the documentation stays in sync with the implementation. When the code changes, the docs update automatically.

### Every Endpoint Needs an Example

A list of parameters with descriptions is useful but insufficient. Developers want to see a complete request and response example they can copy and modify. Include:

- A complete request with all required headers and a realistic body
- The expected response for the success case
- At least one error response example

### Document Error Responses

Most API documentation focuses on the happy path and neglects errors. Developers need to know what happens when things go wrong. Document every error code your API returns, along with the conditions that trigger it and guidance on how to handle it.

## Documentation as Code

The most effective documentation lives alongside the code it describes.

### Inline Documentation

Code comments should explain the "why" behind non-obvious decisions:

```typescript
// We retry up to 3 times with exponential backoff because
// the payment provider's API has intermittent 503 errors
// during their daily maintenance window (02:00-02:15 UTC)
const MAX_RETRIES = 3;
```

This comment is valuable because it explains context that is not apparent from the code. A comment that said "set max retries to 3" would add nothing.

### Architecture Decision Records (ADRs)

ADRs document significant technical decisions: what was decided, why, and what alternatives were considered. They are invaluable when someone joins the team six months later and asks "why did we choose Redis over Memcached?"

Keep ADRs in a `/docs/adr/` directory in your repository. Number them sequentially. Each ADR should include:

- **Title:** A short descriptive title
- **Status:** Proposed, accepted, deprecated, or superseded
- **Context:** The situation and problem that prompted the decision
- **Decision:** What was decided
- **Consequences:** The expected outcomes, both positive and negative

### Keeping Docs in Sync

The biggest documentation problem is staleness. Strategies to combat it:

- **Include docs in PRs:** Make documentation updates part of the [code review](/collaboration/code-reviews-that-dont-waste-time) process. If a PR changes behaviour, it should update the relevant documentation.
- **Automate validation:** Use CI checks to verify that generated documentation is up to date. Some teams use custom linters that check for broken internal links or outdated code examples.
- **Place docs near code:** A README in each major directory is more likely to be updated than a wiki page three clicks away. Proximity creates visibility.

## Common Mistakes

### Writing Too Much

Exhaustive documentation that covers every possible scenario is worse than concise documentation that covers the common ones. Developers will not read a 50-page guide. They will read a one-page quickstart.

Write the minimum documentation that enables someone to be productive. Expand when you see the same questions being asked repeatedly.

### Assuming Knowledge

Documentation that says "configure the database connection" without explaining which file to edit or what format the connection string should take is not helpful. Err on the side of being explicit, especially for setup instructions.

### Writing for Yourself

You understand the system. Your documentation needs to serve someone who does not. Have a new team member follow your docs step by step without any additional help. Where they get stuck reveals where your docs are insufficient.

### Ignoring Search

Developers do not read documentation linearly. They search for specific answers. Structure your docs with clear headings, use consistent terminology, and ensure that the keywords developers are likely to search for appear in the relevant sections.

## The Minimum Viable Documentation

If writing comprehensive documentation feels overwhelming, start with these three things:

1. **A README** that gets someone from clone to running in under five minutes
2. **Architecture overview** that explains the major components and how they connect
3. **Common tasks guide** covering the five things developers do most frequently

This is enough to get a new team member productive. Expand from there based on what questions keep getting asked. The questions that recur are the documentation that is missing.

I have found that the single most effective thing you can do is ask a new joiner to follow your documentation during their first week and note every point where they get stuck. Those pain points are your documentation backlog, prioritised by real user need. For more on effective onboarding practices, our article on [how to mentor junior developers effectively](/career/how-to-mentor-junior-developers-effectively) covers the human side of bringing new people up to speed.
