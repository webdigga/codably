---
title: "Why Developers Should Write More"
description: "Discover why developers should write more and how regular writing improves your code, career, and communication skills."
publishDate: "2026-01-24"
author: "jonny-rowse"
category: "career"
tags: ["writing", "career-development", "communication", "documentation", "developer-skills"]
featured: false
draft: false
faqs:
  - question: "What should developers write about?"
    answer: "Write about problems you have solved, tools you have evaluated, architectural decisions you have made, things you have learned, and topics you want to understand better. The most valuable writing comes from genuine experience, not from trying to be an authority on a trendy topic."
  - question: "Do I need a personal blog to benefit from writing?"
    answer: "No. Internal documentation, design documents, detailed pull request descriptions, thoughtful code reviews, and clear ticket descriptions all count. Public writing has additional career benefits, but the cognitive advantages of writing apply regardless of the audience."
  - question: "How do I find time to write as a busy developer?"
    answer: "Start small. Write for 20 minutes after solving an interesting problem, while the context is still fresh. Keep a running document of potential topics. Writing does not need to be a separate activity; integrate it into your existing workflow through better documentation, commit messages, and design docs."
  - question: "Will writing slow down my development work?"
    answer: "In the short term, writing a design document before coding takes time. In the medium term, it saves time by catching flaws early, reducing misunderstandings, and creating a reference that prevents repeated explanations. Teams that write well consistently deliver faster."
  - question: "How long should a technical blog post be?"
    answer: "Long enough to be genuinely useful, short enough to respect the reader's time. For most technical topics, 800 to 1500 words is sufficient. Focus on clarity and completeness rather than hitting a word count. A concise post that solves a reader's problem is more valuable than a lengthy one that meanders."
primaryKeyword: "developers should write"
---

The best engineers I have worked with share a common trait that has nothing to do with their programming language of choice or their system design skills. They write well. They write clearly, frequently, and with purpose.

This is not a coincidence. Writing is thinking made visible, and developers who write regularly become better thinkers, better communicators, and better engineers. I have seen this pattern repeat across every team I have worked with over the past decade.

## Writing Is Thinking

When an idea exists only in your head, it feels complete. You understand it. It makes sense. Then you try to write it down and discover gaps, contradictions, and assumptions you did not know you were making.

This is exactly what happens when you write a design document before implementing a feature. The act of explaining your approach in prose forces you to confront questions you would otherwise only discover during implementation:

- How does this interact with the existing system?
- What happens when this input is missing?
- What are the failure modes?
- Why this approach instead of the simpler alternative?

Writing a design document is not bureaucracy. It is a debugging tool for your thinking. The document itself is a useful artefact, but the real value is in the clarity you gain by producing it. Research from the <a href="https://hbr.org/2012/01/the-science-behind-the-smile" target="_blank" rel="noopener noreferrer">Harvard Business Review ↗</a> has consistently shown that the act of writing forces deeper cognitive processing than verbal discussion alone.

## Writing Improves Your Code

There is a direct connection between writing skill and code quality. Both require the same core abilities: organising information logically, choosing the right level of abstraction, being precise without being verbose, and empathising with your audience (the reader or the next developer who maintains your code).

### Naming and Abstractions

Good writing requires choosing words carefully. Good code requires choosing names carefully. Developers who practise writing tend to produce code with clearer variable names, better function signatures, and more intuitive APIs. The skill transfers directly.

### Documentation

Every codebase needs documentation, and most codebases have poor documentation because the developers who wrote the code did not practise explaining things in writing. Good documentation is not about verbose comments on every line. It is about well-placed explanations of why, not what: why this design was chosen, why this workaround exists, why this parameter is necessary. For practical techniques, see [writing documentation developers actually read](/collaboration/writing-documentation-developers-actually-read).

### Commit Messages and PR Descriptions

A commit message like "fix bug" helps no one. A message like "Prevent duplicate payment processing when webhook is received during redirect" tells the next developer exactly what happened and why. Writing this kind of message is a skill that improves with practice. Our guide to [the art of writing good commit messages](/workflows/the-art-of-writing-good-commit-messages) covers this in detail.

Similarly, a pull request with a thoughtful description, explaining the context, the approach, and any decisions made, makes [code review faster and more effective](/collaboration/code-reviews-that-dont-waste-time). The reviewer spends less time guessing your intent and more time evaluating your solution.

## The Writing Dividend: Where Time Invested Pays Off

| Type of Writing | Time Investment | Short-term Benefit | Long-term Benefit |
|----------------|----------------|-------------------|-------------------|
| Design documents | 2 to 4 hours | Catches flaws before coding | Permanent architectural reference |
| PR descriptions | 10 to 15 minutes | Faster code reviews | Searchable project history |
| Commit messages | 2 to 5 minutes | Easier blame/bisect | Team understands past decisions |
| Internal blog posts | 1 to 2 hours | Shares knowledge with team | Reduces repeated explanations |
| Public blog posts | 3 to 6 hours | Solidifies your understanding | Career visibility, professional reputation |
| ADRs | 30 to 60 minutes | Documents trade-offs | Prevents relitigating past decisions |

## Writing Advances Your Career

In a profession where technical ability is assumed, communication is what differentiates. The developer who can write a clear proposal, a persuasive case for a technical decision, or a well-structured incident report creates value that goes beyond their code contributions.

### Visibility

Most of your work as a developer is invisible. You write code, it gets merged, it works (hopefully), and life moves on. Writing creates visible artefacts. A blog post about how you solved an interesting problem. A design document that shaped a critical feature. An internal guide that saved the team hours of onboarding time.

These artefacts are evidence of your impact. When promotion discussions happen, "wrote the caching strategy that reduced our infrastructure costs by 40%" is far more compelling than "worked on the backend."

### Influence

Senior engineering roles are about influence, not just implementation. You need to convince stakeholders, align teams, and communicate technical constraints to non-technical colleagues. Every one of these activities requires clear, persuasive writing. The transition [from developer to tech lead](/career/from-developer-to-tech-lead-what-actually-changes) is fundamentally a shift towards more writing and communication.

The engineer who can write a one-page summary of why the team should invest in a platform migration, complete with trade-offs, risks, and a phased plan, will have more influence than the engineer who can only express the same idea verbally in meetings.

### External Reputation

Technical writing builds professional credibility outside your organisation. Blog posts, conference talks (which start as written outlines), and open-source documentation establish you as someone who has solved real problems and can explain their solutions. The <a href="https://survey.stackoverflow.co/2024/" target="_blank" rel="noopener noreferrer">Stack Overflow Developer Survey ↗</a> consistently shows that developers who share knowledge publicly report higher career satisfaction and more job opportunities.

This is not about personal branding or self-promotion. It is about contributing knowledge to the community and, as a side effect, building a body of work that demonstrates your expertise.

<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing how writing creates a compounding cycle of thinking, learning, credibility, and career growth">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="350" y="25" text-anchor="middle" font-size="15" font-weight="bold" fill="#334155">The Writing Flywheel for Developers</text>
  <!-- Circle path indicators -->
  <!-- Top: Write -->
  <rect x="280" y="55" width="140" height="42" rx="21" fill="#3b82f6" opacity="0.9"/>
  <text x="350" y="81" text-anchor="middle" font-size="14" font-weight="600" fill="#fff">Write</text>
  <!-- Right: Clarify thinking -->
  <rect x="485" y="130" width="160" height="42" rx="21" fill="#22c55e" opacity="0.9"/>
  <text x="565" y="156" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">Clarify thinking</text>
  <!-- Bottom: Build credibility -->
  <rect x="280" y="210" width="160" height="42" rx="21" fill="#8b5cf6" opacity="0.9"/>
  <text x="360" y="236" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">Build credibility</text>
  <!-- Left: Attract opportunities -->
  <rect x="55" y="130" width="180" height="42" rx="21" fill="#f97316" opacity="0.9"/>
  <text x="145" y="156" text-anchor="middle" font-size="13" font-weight="600" fill="#fff">Attract opportunities</text>
  <!-- Arrows connecting them clockwise -->
  <path d="M 420 82 Q 470 95 485 135" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#fwArrow)"/>
  <path d="M 545 172 Q 500 205 440 225" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#fwArrow)"/>
  <path d="M 280 235 Q 220 215 205 172" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#fwArrow)"/>
  <path d="M 160 130 Q 210 100 280 80" fill="none" stroke="#64748b" stroke-width="2" marker-end="url(#fwArrow)"/>
  <!-- Centre label -->
  <text x="350" y="155" text-anchor="middle" font-size="12" fill="#64748b">Compounds</text>
  <text x="350" y="170" text-anchor="middle" font-size="12" fill="#64748b">over time</text>
  <!-- Arrow marker -->
  <defs>
    <marker id="fwArrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>

## What to Write

You do not need to write about cutting-edge research or hot new frameworks. The most useful technical writing comes from practical experience.

### Problem-Solution Posts

The most straightforward format: "I had this problem, here is how I solved it." These posts are enormously valuable because someone else will have the same problem. Write the post you wished existed when you were searching for a solution.

### Decision Records

When your team makes a significant technical decision, document the context, the options considered, the trade-offs, and the reasoning behind the choice. Architecture Decision Records (ADRs) are a formalised version of this, but even informal write-ups are valuable.

### Explanations

Take a concept you recently learned and explain it as if you were teaching a colleague. The act of writing the explanation will solidify your own understanding, and the result will be a reference you can point people to in the future.

### Retrospectives and Incident Reports

After a production incident or a project retrospective, write up what happened, what was learned, and what will change. These documents are how organisations learn and improve. They are also excellent practice in clear, structured, objective writing.

## How to Start

The biggest barrier to writing is not skill; it is starting. Here is a practical approach.

**Lower the bar.** Your first posts do not need to be masterpieces. They need to exist. Publish something short and useful, then do it again. Quality improves with practice, just like code.

**Write regularly.** Schedule 30 minutes a week for writing, whether it is a blog post, a design document, or better documentation for a module you own. Consistency matters more than volume.

**Get feedback.** Share drafts with colleagues. Ask them where they got confused, where they lost interest, and what they wished you had explained differently. Writing, like coding, improves fastest with code review.

**Keep a topic list.** When you solve an interesting problem, debug a confusing issue, or learn something new, add it to a running list of potential writing topics. When it is time to write, you will never be stuck staring at a blank page.

Writing is the highest-leverage skill most developers neglect. It makes you a better thinker, a clearer communicator, and a more effective engineer. The tools you need are ones you already have: a text editor and something to say. Start today.
