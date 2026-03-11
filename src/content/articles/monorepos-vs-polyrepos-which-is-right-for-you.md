---
title: "Monorepos vs Polyrepos: Which Is Right for You?"
description: "Monorepos vs polyrepos compared honestly. Learn the trade-offs of each approach and how to choose the right repository strategy for your team."
publishDate: "2026-02-28"
author: "gareth-clubb"
category: "architecture"
tags: ["monorepo", "polyrepo", "repository-strategy", "architecture", "tooling"]
featured: false
draft: false
faqs:
  - question: "What is a monorepo?"
    answer: "A monorepo is a single repository that contains multiple projects, libraries, or services. All code lives together, shares tooling, and is versioned as one unit. Google, Meta, and Microsoft all use monorepos at massive scale."
  - question: "What is a polyrepo?"
    answer: "A polyrepo strategy uses separate repositories for each project, service, or library. Each repo has its own CI pipeline, versioning, and release cycle. This is the default approach most teams start with."
  - question: "Can I use a monorepo with microservices?"
    answer: "Yes. Many teams keep all their microservices in a single monorepo while deploying them independently. The repository structure does not have to mirror the deployment architecture."
  - question: "What tools do I need for a monorepo?"
    answer: "At minimum, you need a build tool that understands project boundaries and can run only affected tasks. Popular options include Nx, Turborepo, Bazel, and Lerna. Without proper tooling, a monorepo quickly becomes unmanageable."
  - question: "Is it possible to migrate from polyrepo to monorepo gradually?"
    answer: "Yes. Many teams migrate incrementally by moving one project at a time into the monorepo while keeping others in separate repositories. Tools like git-subtree can help preserve commit history during migration."
primaryKeyword: "monorepos vs polyrepos"
---

The monorepo versus polyrepo debate generates strong opinions, but rarely useful advice. Advocates on both sides treat their preference as the obvious answer, ignoring the fact that both approaches have real costs and real benefits depending on your context.

Having worked with both at various scales, I can tell you this: the right answer depends on your team structure, your dependency graph, and your willingness to invest in tooling. I have seen a ten-person startup thrive with a monorepo and a fifty-person organisation buckle under one because they underestimated the tooling investment required.

## What We Actually Mean by These Terms

A **monorepo** stores multiple projects in a single repository. Your frontend, backend, shared libraries, and infrastructure code all live under one roof. A single `git clone` gives a developer everything.

A **polyrepo** gives each project its own repository. Your React app, your API, and your shared component library each have separate repos with independent CI pipelines and release cycles.

Neither term implies anything about your deployment architecture. You can have a monorepo of independently deployed microservices, or a polyrepo of tightly coupled components. As I discuss in my piece on [pragmatic microservices](/architecture/the-pragmatic-approach-to-microservices), the repository strategy and the deployment architecture are separate decisions that should be made independently.

## The Case for Monorepos

### Atomic changes across projects

The single biggest advantage of a monorepo is the ability to make a change that spans multiple projects in one commit. Rename an API endpoint and update every consumer in the same pull request. No coordination across repos, no versioning dance, no "update the dependency and hope nothing breaks."

### Shared tooling and standards

When everything lives together, enforcing consistent linting rules, test frameworks, and build configurations is straightforward. A single ESLint config, a single Prettier setup, a single CI pipeline definition. You can take this further with [automated linting and formatting](/code-quality/automating-code-quality-with-linters-and-formatters) that applies uniformly across all projects.

This consistency compounds over time. New projects inherit existing standards automatically, and upgrades happen in one place.

### Simplified dependency management

In a polyrepo world, sharing code between projects means publishing packages, managing versions, and dealing with dependency resolution. In a monorepo, shared code is just another folder. Changes propagate immediately, and you never end up with three services pinned to three different versions of your internal utilities library.

### Discoverability

Developers can see how everything fits together. Searching across all projects is a single operation. Understanding how a shared function is used requires no cross-repo investigation.

## The Case for Polyrepos

### Clear ownership boundaries

Each repository has its own maintainers, its own CI pipeline, and its own deployment. There is no ambiguity about who owns what. Teams can move at their own pace without worrying about stepping on each other.

### Simpler CI/CD

A polyrepo's CI pipeline only needs to build and test one project. There is no need for sophisticated change detection to figure out which subset of a larger codebase was affected. Every push triggers a full, focused build. If you are still setting up your pipeline, the guide on [building a CI/CD pipeline that works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) covers the fundamentals.

### Smaller clone and build times

Developers only clone what they need. A frontend developer working on the marketing site does not need the machine learning pipeline on their laptop. Build times stay proportional to the project size, not the organisation size.

### Independent release cycles

Each project ships on its own schedule. Version bumps, changelogs, and release notes are scoped to a single concern. There is no risk of a broken test in an unrelated project blocking your deployment.

### Access control

Repository-level permissions are straightforward. Contractors working on the frontend cannot see the billing service. Polyrepos make fine-grained access control trivial; monorepos make it painful.

## The Hidden Costs

### Monorepo costs you may not expect

**Tooling investment is non-negotiable.** A monorepo without proper tooling is just a mess. You need a build system that understands project graphs and only rebuilds what changed. <a href="https://nx.dev/" target="_blank" rel="noopener noreferrer">Nx ↗</a>, <a href="https://turbo.build/" target="_blank" rel="noopener noreferrer">Turborepo ↗</a>, or Bazel are not optional extras; they are prerequisites.

**CI gets complicated fast.** Running every test on every commit does not scale. You need affected-project detection, distributed caching, and possibly remote execution. This is solvable, but it is real engineering work.

**Git itself can struggle.** At extreme scale, basic operations like `git status` slow down. Microsoft built an entire virtual filesystem (VFS for Git) to make their monorepo workable. You probably will not hit this, but it is worth knowing the ceiling exists.

### Polyrepo costs you may not expect

**Cross-cutting changes are painful.** Renaming a field that touches five services means five PRs, five review cycles, and careful coordination of deployment order. This friction is not just annoying; it discourages refactoring and lets inconsistencies accumulate.

**Dependency hell is real.** When Service A depends on Library X version 2.3 and Service B depends on version 2.7, you now maintain compatibility across versions or force everything to upgrade in lockstep (which defeats the purpose of separate repos).

**Duplication creeps in.** Without the visibility a monorepo provides, teams independently solve the same problems. You end up with three logging wrappers, two date formatting utilities, and four slightly different approaches to error handling.

## Comparison at a Glance

| Factor | Monorepo | Polyrepo |
|---|---|---|
| Cross-project changes | Single PR, atomic commit | Multiple PRs, coordinated deploys |
| CI/CD complexity | High (needs affected-project detection) | Low (one project per pipeline) |
| Tooling investment | Significant (Nx, Turborepo, Bazel) | Minimal (standard CI tools) |
| Dependency management | Implicit, always latest | Explicit versioning required |
| Code discoverability | Excellent (single search) | Poor (search across repos) |
| Access control | Difficult (directory-level) | Simple (repository-level) |
| Clone/build times | Grows with organisation | Stays proportional to project |
| Team autonomy | Lower (shared standards) | Higher (independent decisions) |

<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the spectrum from polyrepo to monorepo with hybrid approaches in between">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="700" height="380" fill="#f8fafc" rx="8"/>
  <text x="350" y="35" text-anchor="middle" font-size="16" font-weight="600" fill="#334155">Repository Strategy Spectrum</text>
  <!-- Spectrum bar -->
  <defs>
    <linearGradient id="specGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3b82f6"/>
      <stop offset="50%" stop-color="#8b5cf6"/>
      <stop offset="100%" stop-color="#22c55e"/>
    </linearGradient>
  </defs>
  <rect x="80" y="70" width="540" height="16" fill="url(#specGrad)" rx="8"/>
  <!-- Labels on spectrum -->
  <text x="80" y="110" text-anchor="start" font-size="13" font-weight="600" fill="#3b82f6">Full Polyrepo</text>
  <text x="350" y="110" text-anchor="middle" font-size="13" font-weight="600" fill="#8b5cf6">Hybrid</text>
  <text x="620" y="110" text-anchor="end" font-size="13" font-weight="600" fill="#16a34a">Full Monorepo</text>
  <!-- Polyrepo box -->
  <rect x="60" y="135" width="175" height="110" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5" rx="6"/>
  <text x="147" y="157" text-anchor="middle" font-size="12" font-weight="600" fill="#1e40af">Polyrepo Strengths</text>
  <text x="75" y="178" font-size="11" fill="#334155">+ Clear ownership</text>
  <text x="75" y="196" font-size="11" fill="#334155">+ Simple CI/CD</text>
  <text x="75" y="214" font-size="11" fill="#334155">+ Fine-grained access</text>
  <text x="75" y="232" font-size="11" fill="#334155">+ Independent releases</text>
  <!-- Hybrid box -->
  <rect x="262" y="135" width="175" height="110" fill="#f5f3ff" stroke="#8b5cf6" stroke-width="1.5" rx="6"/>
  <text x="350" y="157" text-anchor="middle" font-size="12" font-weight="600" fill="#6d28d9">Hybrid Approach</text>
  <text x="277" y="178" font-size="11" fill="#334155">+ Best of both worlds</text>
  <text x="277" y="196" font-size="11" fill="#334155">+ Pragmatic grouping</text>
  <text x="277" y="214" font-size="11" fill="#334155">+ Incremental migration</text>
  <text x="277" y="232" font-size="11" fill="#334155">+ Context-sensitive</text>
  <!-- Monorepo box -->
  <rect x="465" y="135" width="175" height="110" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5" rx="6"/>
  <text x="552" y="157" text-anchor="middle" font-size="12" font-weight="600" fill="#166534">Monorepo Strengths</text>
  <text x="480" y="178" font-size="11" fill="#334155">+ Atomic changes</text>
  <text x="480" y="196" font-size="11" fill="#334155">+ Shared tooling</text>
  <text x="480" y="214" font-size="11" fill="#334155">+ Full discoverability</text>
  <text x="480" y="232" font-size="11" fill="#334155">+ No version conflicts</text>
  <!-- When to choose note -->
  <rect x="80" y="270" width="540" height="85" fill="#fefce8" stroke="#eab308" stroke-width="1" rx="6"/>
  <text x="350" y="295" text-anchor="middle" font-size="13" font-weight="600" fill="#854d0e">Most teams land somewhere in the middle</text>
  <text x="350" y="316" text-anchor="middle" font-size="11" fill="#713f12">Group tightly coupled projects in a monorepo.</text>
  <text x="350" y="336" text-anchor="middle" font-size="11" fill="#713f12">Keep genuinely independent projects in separate repos.</text>
</svg>

## How to Decide

### Choose a monorepo if

- Your projects share significant code or have tightly coupled interfaces
- You want to enforce consistent standards across the organisation
- You are willing to invest in build tooling (Nx, Turborepo, Bazel)
- Cross-cutting refactors happen regularly
- Your team is small enough that everyone benefits from seeing the full picture

### Choose polyrepos if

- Teams are highly autonomous and rarely need to coordinate
- Projects have genuinely independent lifecycles
- Access control requirements make shared repositories impractical
- You do not want to invest in monorepo-specific tooling
- Your projects use different languages or ecosystems with little overlap

### Consider a hybrid approach

Many organisations land somewhere in between. A monorepo for closely related services and shared libraries, with separate repos for truly independent projects. This is not a cop-out; it is often the most pragmatic answer. In my experience, the hybrid approach is actually the most common in organisations of 20 to 100 engineers, and it often works better than either extreme.

## Practical Migration Advice

If you are considering a move in either direction, start small. Migrate one project at a time. Validate your tooling, CI pipelines, and developer experience before committing the whole organisation.

For monorepo migrations, get your build tool configured and your affected-project detection working before moving a second project in. The tooling must be solid, or developers will fight you on it.

For polyrepo migrations, establish your package publishing pipeline and versioning strategy first. The coordination overhead is front-loaded, and getting it wrong creates long-term friction. Having a solid [git workflow](/workflows/git-workflows-that-scale-with-your-team) in place before you migrate will make the transition significantly smoother.

## The Answer Is Context

There is no universally correct repository strategy. Google's monorepo works for Google because they built the tooling to support it. A five-person startup splitting everything into separate repos may be creating unnecessary overhead. As the <a href="https://trunkbaseddevelopment.com/monorepos/" target="_blank" rel="noopener noreferrer">Trunk Based Development resource on monorepos ↗</a> puts it, the repository strategy should serve the team's delivery goals, not the other way round.

Look at your dependency graph, your team boundaries, and your appetite for tooling investment. The best strategy is the one that minimises friction for the way your team actually works, not the one that looks best in a conference talk.
