---
title: "Architecture Decision Records: A Practical Guide for Engineering Teams"
description: "How architecture decision records help engineering teams capture context, avoid repeated debates, and ship better systems. A practical guide with examples."
publishDate: "2026-04-29"
author: "david-white"
category: "architecture"
tags: ["architecture decision records", "adr", "documentation", "system design", "engineering culture"]
featured: false
draft: false
faqs:
  - question: "What is an architecture decision record?"
    answer: "An architecture decision record (ADR) is a short document that captures a single significant technical decision, its context, the options that were considered, and the consequences. ADRs live in version control alongside the code, so the reasoning behind a system is recorded where engineers can find it. Most ADRs are between 200 and 500 words."
  - question: "What should I include in an ADR?"
    answer: "A useful ADR has at least four sections: context (what forced the decision), decision (what you chose), alternatives (what you rejected and why), and consequences (the trade-offs you accepted). Many teams add a status field (proposed, accepted, superseded) and links to related ADRs. Skip implementation detail, that belongs in code or runbooks."
  - question: "How are ADRs different from RFCs or design docs?"
    answer: "RFCs and design docs propose work and gather feedback before a decision. ADRs record the decision after it has been made. The two complement each other: a long RFC can produce a short ADR that captures the agreed outcome. Design docs describe how something will be built; ADRs explain why a particular approach won."
  - question: "How do I introduce ADRs to a team that does not use them?"
    answer: "Start by writing one ADR for the next significant decision the team makes, store it in the repo under docs/adr/, and link to it from the pull request. Do not retrofit ADRs for every past decision. Once the team sees the value of having context attached to decisions, ADRs will spread naturally."
  - question: "Should ADRs ever be deleted?"
    answer: "No. An ADR is an immutable record of what the team thought and chose at a point in time. When a decision changes, write a new ADR with status accepted that references the old one and mark the old one as superseded. Deleting ADRs erases the history that makes the format useful."
primaryKeyword: "architecture decision records"
---

Six months into a project, an engineer asks why the codebase uses Postgres instead of MySQL. Nobody on the call knows. The original team has moved on, the Slack thread is lost, and the ticket that triggered the choice has been archived. So the team relitigates the decision from scratch, badly, because the original constraints are gone.

This is the gap that architecture decision records (ADRs) fill. They are short, dated, immutable documents that capture a single significant decision and the context around it. Ten minutes to write, indefinitely useful to read.

## What an ADR Actually Is

An ADR is not a design doc. It is not an RFC. It is the small, durable artefact that sits between an engineering choice and the code that resulted from it.

The format was popularised by <a href="https://www.cognitect.com/blog/2011/11/15/documenting-architecture-decisions" target="_blank" rel="noopener noreferrer">Michael Nygard's 2011 post on documenting architecture decisions ↗</a>. He proposed five sections: title, status, context, decision, and consequences. That core has barely changed in fifteen years because it works.

The point is the trade-off, not the choice. A future engineer reading an ADR should walk away knowing what was on the table and why one option won. If your ADR reads like a press release, you are doing it wrong.

### The Minimum Viable ADR

Here is the structure I use on every project:

```markdown
# 0007. Use Postgres for the primary data store

Date: 2026-04-29
Status: Accepted

## Context
We need a relational database for the core domain. The team has
operational experience with Postgres and MySQL. We expect heavy use
of JSONB for the audit log feature.

## Decision
Use Postgres 16, hosted on AWS RDS, single-region to start.

## Alternatives considered
- MySQL 8: weaker JSONB support, team less experienced with it
- DynamoDB: rejected, query patterns are too relational
- SQLite: fine for development, will not scale for production load

## Consequences
+ Strong JSONB support for the audit log
+ Familiar operational story for the on-call team
- Vendor lock to AWS RDS in the short term
- Cross-region replication is a future cost we have accepted
```

That is roughly 150 words. Anyone joining the team in 2027 can read it in 90 seconds and understand why the system looks the way it does.

## Why Teams Skip ADRs (And Why That Costs Them)

Most teams I have worked with either do not write ADRs or wrote a few once and stopped. The reasons are predictable.

**"We do not have time."** The full ADR template above takes ten minutes to write. The Slack debate that produced the decision took two hours. The cost is rounding error.

**"We will remember why we did it."** You will not. <a href="https://martinfowler.com/articles/scaling-architecture-conversationally.html" target="_blank" rel="noopener noreferrer">Andrew Harmel-Law's writing on conversational architecture ↗</a> is sharp on this point: organisational memory is fragile, and ADRs are one of the cheapest ways to preserve it.

**"It feels like bureaucracy."** It feels like bureaucracy when you mandate ADRs for every code change. It does not when you reserve them for decisions that would be expensive to reverse.

The real cost of skipping ADRs shows up later, when an engineer spends a day excavating a choice that could have been read in a minute, or when a team accidentally rebuilds a system around constraints that no longer exist.

## When to Write One

Not every decision deserves an ADR. The rough heuristic: if undoing this would take more than a week of engineering time, write one.

Concrete triggers:

- Choosing a database, message broker, or cache
- Picking an authentication or authorisation model
- Adopting (or replacing) a framework
- Defining service boundaries in a [microservices migration](/architecture/the-pragmatic-approach-to-microservices)
- Committing to a deployment topology (single-region vs multi-region, blue-green vs canary)
- Introducing a new language or runtime to the stack
- Deliberately accepting a [build-or-buy](/architecture/when-to-build-vs-when-to-buy) trade-off

If the decision will not survive the next sprint, skip the ADR. Notes in the PR description are enough.

## The ADR Lifecycle

ADRs are immutable, but decisions are not. The way you reconcile this is with status transitions and links between records.

<svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing the ADR lifecycle from proposed through accepted to superseded, with deprecated as an alternate end state" style="width:100%;height:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
  <rect x="20" y="80" width="140" height="60" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
  <text x="90" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#111">Proposed</text>
  <rect x="220" y="80" width="140" height="60" rx="8" fill="#ec4899" stroke="#db2777" stroke-width="1.5"/>
  <text x="290" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#fff">Accepted</text>
  <rect x="420" y="20" width="140" height="60" rx="8" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="490" y="55" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#111">Superseded</text>
  <rect x="420" y="140" width="140" height="60" rx="8" fill="#f9fafb" stroke="#6b7280" stroke-width="1.5"/>
  <text x="490" y="175" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#111">Deprecated</text>
  <line x1="160" y1="110" x2="220" y2="110" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="360" y1="100" x2="420" y2="60" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arrow)"/>
  <line x1="360" y1="120" x2="420" y2="160" stroke="#6b7280" stroke-width="1.5" marker-end="url(#arrow)"/>
  <text x="180" y="100" font-family="Inter, sans-serif" font-size="11" fill="#6b7280">review</text>
  <text x="370" y="80" font-family="Inter, sans-serif" font-size="11" fill="#6b7280">replaced by</text>
  <text x="370" y="155" font-family="Inter, sans-serif" font-size="11" fill="#6b7280">no longer relevant</text>
  <defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#6b7280"/></marker></defs>
</svg>

When a new decision overrides an old one, you write a new ADR (status: accepted) that references the old one, then update the old ADR's status to superseded with a link to the replacement. The old file stays in the repo. The history is the point.

### Status Values Worth Using

- **Proposed.** Drafted, under review, not yet committed to.
- **Accepted.** The team is acting on this.
- **Superseded.** A later ADR replaces this one.
- **Deprecated.** No replacement, the decision simply no longer applies.

That is enough. Some teams add "rejected" for ADRs that lost a vote, which is useful when you want a paper trail of options that were seriously considered.

## Storing ADRs and Tooling

Keep ADRs in the repo, under `docs/adr/`, numbered sequentially. Plain markdown. No special build pipeline.

If you want a small amount of automation, <a href="https://github.com/npryce/adr-tools" target="_blank" rel="noopener noreferrer">npryce/adr-tools ↗</a> is a tiny shell utility that scaffolds new ADRs and manages supersedes links. <a href="https://adr.github.io/madr/" target="_blank" rel="noopener noreferrer">MADR ↗</a> (Markdown Any Decision Records) offers a slightly richer template if you want fields for the decision drivers and pros/cons table.

Whichever flavour you pick, the rules are the same:

| Rule | Why it matters |
|------|----------------|
| One decision per record | A record that covers three decisions is a design doc in disguise |
| Numbered, never renumbered | Stable IDs let other ADRs and tickets link reliably |
| Immutable once accepted | If the decision changes, write a new ADR |
| Plain markdown in the repo | Discoverable through grep, reviewable in pull requests |
| Linked from related code | A code comment with the ADR number pays for itself the first time someone asks why |

## Common Failure Modes

A few patterns that turn ADRs into noise:

**Writing them after the fact, in bulk.** Backfilling ADRs for decisions made years ago tends to produce sanitised history. Start with the next decision, not the last fifty.

**Treating them as approval gates.** ADRs document decisions, they do not authorise them. If your process needs review and sign-off, do that in an RFC or pull request and let the ADR record the outcome.

**Padding them.** A 2,000-word ADR is a design doc. Cut it back. The sections are titles, not invitations to write essays.

**Letting them rot.** ADRs whose status was never updated when the decision changed are worse than no ADRs, because they actively mislead. A quarterly sweep to mark superseded records is enough.

This connects to a wider point about engineering maturity. Senior engineers, in the [sense I have written about before](/career/the-senior-developer-mindset), are the ones who reach for tools like ADRs because they have felt the cost of not having them. The same instinct that drives a careful approach to [legacy code archaeology](/workflows/the-developers-guide-to-working-with-legacy-code) drives the desire to leave a record for whoever comes next.

The <a href="https://www.thoughtworks.com/en-gb/radar/techniques/lightweight-architecture-decision-records" target="_blank" rel="noopener noreferrer">ThoughtWorks Tech Radar has recommended lightweight ADRs since 2017 ↗</a>, and the reasoning is unchanged: the cost of writing one is trivial, the value of having one is durable, and the cost of not having one compounds quietly.

## Start With the Next Decision

If your team does not write ADRs today, do not draft a policy. Pick the next significant choice the team makes, write a 200-word record, drop it in `docs/adr/0001-something.md`, and link to it from the pull request. That single example will do more to spread the practice than any document you could write about why ADRs matter.

The first one is the only one that needs effort. After that, the format does the work.
