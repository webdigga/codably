---
title: "How to Speed Up Your CI Builds: A Practical Guide"
description: "Learn how to speed up slow CI builds with dependency caching, parallelisation, incremental builds, and Docker layer optimisation. Practical patterns that work."
publishDate: "2026-04-12"
author: "jonny-rowse"
category: "devops"
tags: ["ci-cd", "devops", "continuous-integration", "build-optimisation", "caching", "performance", "automation"]
featured: false
draft: false
faqs:
  - question: "How fast should a CI build be?"
    answer: "A good target is under 10 minutes for the full pipeline, with the core build and unit test feedback arriving in under 5 minutes. Martin Fowler's original continuous integration guidance suggests that if a build takes longer than 10 minutes, developers stop waiting for results and context-switch, which defeats the purpose of fast feedback. Start by measuring your current build time, then target a 50% reduction as your first milestone."
  - question: "What is the most effective way to speed up CI builds?"
    answer: "Dependency caching almost always delivers the biggest improvement for the least effort. Caching your package manager's download directory (node_modules, .m2, pip cache) between runs avoids re-downloading the same packages on every build. Most teams see a 30 to 60 percent reduction in build time from caching alone. After that, test parallelisation and incremental builds provide the next largest gains."
  - question: "Should I cache node_modules or the npm/yarn cache directory?"
    answer: "Cache the package manager's cache directory rather than node_modules directly. The cache directory stores downloaded tarballs, which npm or yarn can install from locally without network requests. Caching node_modules can cause issues with native modules compiled for different platforms or OS versions. Use a hash of your lockfile as the cache key so the cache invalidates automatically when dependencies change."
  - question: "How do I parallelise tests in CI?"
    answer: "Most CI platforms support running jobs in parallel using a matrix strategy or parallel job configuration. Split your test suite across multiple runners based on historical run times, not file count. Tools like Jest, pytest-xdist, and RSpec can split tests automatically. The key is ensuring tests are independent and do not share state, so they produce the same results regardless of execution order."
  - question: "What is remote build caching and when should I use it?"
    answer: "Remote build caching stores build artefacts in a shared cache that any team member or CI runner can access. Tools like Turborepo, Nx, and Gradle support this natively. If one developer builds a module locally, the next CI run can skip rebuilding it entirely. Remote caching is most valuable in monorepos where multiple projects share dependencies, and in teams where the same code paths are built repeatedly across different branches."
primaryKeyword: "speed up CI builds"
---

## Slow CI Builds Cost More Than You Think

A slow CI build does not just waste compute minutes. It breaks the feedback loop that makes continuous integration valuable in the first place. When builds take 20 minutes or longer, developers push multiple changes before seeing results, batch unrelated work into single commits, and lose context while waiting. The compounding effect is significant: slower builds lead to larger changesets, which lead to harder-to-diagnose failures, which lead to even slower builds.

Martin Fowler's <a href="https://martinfowler.com/articles/continuousIntegration.html" target="_blank" rel="noopener noreferrer">original continuous integration guidance ↗</a> emphasises that the build should be fast enough that developers get feedback before they context-switch to another task. In practice, that means under 10 minutes for the full pipeline and under 5 minutes for the critical path.

This article covers the specific techniques that make CI builds faster: dependency caching, build caching, parallelisation, incremental builds, and Docker layer optimisation. If you are looking for broader guidance on pipeline architecture, our article on [how to build a CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) covers that ground.

## Measure Before You Optimise

Before changing anything, establish your baseline. You cannot improve what you do not measure.

Record these numbers for your current pipeline:

| Metric | What to Measure | Why It Matters |
|---|---|---|
| Total pipeline duration | End-to-end wall clock time | The number developers actually feel |
| Longest stage | The single slowest step | Your bottleneck and first optimisation target |
| Queue time | Time waiting for a runner | Indicates infrastructure constraints |
| Cache hit rate | Percentage of builds using cached artefacts | Shows whether your caching strategy is working |
| Flaky failure rate | Percentage of failures not caused by code changes | Erodes trust and wastes reruns |

Most CI platforms provide built-in analytics. GitHub Actions shows workflow run durations in the Actions tab. GitLab CI has pipeline analytics under CI/CD > Analytics. CircleCI provides insights dashboards. Use these to identify your slowest stages.

### Create a Build Time Budget

Once you have your baseline, set a target. A useful framework is a build time budget that allocates minutes to each stage:

<svg viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Horizontal bar chart comparing a typical slow CI pipeline of 25 minutes against an optimised pipeline of 7 minutes, broken down by stage">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <text x="350" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">CI Build Time: Before vs After Optimisation</text>
  <!-- Before label -->
  <text x="10" y="65" font-size="12" font-weight="600" fill="#334155">Before</text>
  <text x="10" y="80" font-size="10" fill="#64748b">(25 min)</text>
  <!-- Before bars -->
  <rect x="80" y="52" width="60" height="28" rx="3" fill="#ef4444" />
  <text x="110" y="71" text-anchor="middle" font-size="9" fill="#ffffff">Install</text>
  <text x="110" y="94" text-anchor="middle" font-size="8" fill="#64748b">5 min</text>
  <rect x="144" y="52" width="84" height="28" rx="3" fill="#ef4444" opacity="0.9" />
  <text x="186" y="71" text-anchor="middle" font-size="9" fill="#ffffff">Build</text>
  <text x="186" y="94" text-anchor="middle" font-size="8" fill="#64748b">7 min</text>
  <rect x="232" y="52" width="24" height="28" rx="3" fill="#ef4444" opacity="0.8" />
  <text x="244" y="71" text-anchor="middle" font-size="9" fill="#ffffff">Lint</text>
  <text x="244" y="94" text-anchor="middle" font-size="8" fill="#64748b">2 min</text>
  <rect x="260" y="52" width="108" height="28" rx="3" fill="#ef4444" opacity="0.7" />
  <text x="314" y="71" text-anchor="middle" font-size="9" fill="#ffffff">Tests (serial)</text>
  <text x="314" y="94" text-anchor="middle" font-size="8" fill="#64748b">9 min</text>
  <rect x="372" y="52" width="24" height="28" rx="3" fill="#ef4444" opacity="0.6" />
  <text x="384" y="71" text-anchor="middle" font-size="9" fill="#ffffff">Pkg</text>
  <text x="384" y="94" text-anchor="middle" font-size="8" fill="#64748b">2 min</text>
  <!-- After label -->
  <text x="10" y="155" font-size="12" font-weight="600" fill="#334155">After</text>
  <text x="10" y="170" font-size="10" fill="#64748b">(7 min)</text>
  <!-- After bars -->
  <rect x="80" y="142" width="12" height="28" rx="3" fill="#22c55e" />
  <text x="86" y="161" text-anchor="middle" font-size="9" fill="#ffffff">I</text>
  <text x="86" y="184" text-anchor="middle" font-size="8" fill="#64748b">1 min</text>
  <rect x="96" y="142" width="36" height="28" rx="3" fill="#22c55e" opacity="0.9" />
  <text x="114" y="161" text-anchor="middle" font-size="9" fill="#ffffff">Build</text>
  <text x="114" y="184" text-anchor="middle" font-size="8" fill="#64748b">3 min</text>
  <rect x="136" y="142" width="12" height="28" rx="3" fill="#22c55e" opacity="0.8" />
  <text x="142" y="161" text-anchor="middle" font-size="9" fill="#ffffff">L</text>
  <text x="142" y="184" text-anchor="middle" font-size="8" fill="#64748b">30s</text>
  <rect x="152" y="142" width="36" height="28" rx="3" fill="#22c55e" opacity="0.7" />
  <text x="170" y="161" text-anchor="middle" font-size="9" fill="#ffffff">Tests</text>
  <text x="170" y="184" text-anchor="middle" font-size="8" fill="#64748b">2 min</text>
  <rect x="192" y="142" width="8" height="28" rx="3" fill="#22c55e" opacity="0.6" />
  <text x="196" y="161" text-anchor="middle" font-size="7" fill="#ffffff">P</text>
  <text x="196" y="184" text-anchor="middle" font-size="8" fill="#64748b">30s</text>
  <!-- Legend -->
  <text x="80" y="230" font-size="10" fill="#64748b">Key savings: cached dependencies (4 min), incremental build (4 min), parallel tests (7 min), cached lint (1.5 min)</text>
  <!-- Scale line -->
  <line x1="80" y1="250" x2="476" y2="250" stroke="#e2e8f0" stroke-width="1" />
  <text x="80" y="268" font-size="9" fill="#94a3b8">0</text>
  <text x="176" y="268" font-size="9" fill="#94a3b8">5 min</text>
  <text x="272" y="268" font-size="9" fill="#94a3b8">10 min</text>
  <text x="368" y="268" font-size="9" fill="#94a3b8">15 min</text>
  <text x="460" y="268" font-size="9" fill="#94a3b8">20+ min</text>
</svg>

The goal is not perfection. It is steady, measurable improvement. A 25-minute pipeline cut to 7 minutes transforms the developer experience.

## Dependency Caching

Dependency installation is often the easiest stage to optimise and the one with the biggest payoff. Without caching, every CI run downloads the same packages from the internet, which is slow and wastes bandwidth.

### How Dependency Caching Works

The principle is straightforward:

1. After installing dependencies, save the package manager's cache directory to a shared store
2. On the next run, restore the cache before running the install command
3. Use a hash of your lockfile as the cache key so the cache invalidates when dependencies change

Every major CI platform supports this natively:

- **GitHub Actions:** The <a href="https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows" target="_blank" rel="noopener noreferrer">actions/cache ↗</a> action or the built-in caching in `actions/setup-node`
- **GitLab CI:** The <a href="https://docs.gitlab.com/ci/caching/" target="_blank" rel="noopener noreferrer">cache keyword ↗</a> in `.gitlab-ci.yml`
- **CircleCI:** The <a href="https://circleci.com/docs/caching/" target="_blank" rel="noopener noreferrer">save_cache and restore_cache ↗</a> steps

### Cache Key Strategy

A good cache key changes when your dependencies change and stays stable otherwise. The standard pattern is:

```
cache-key: deps-{os}-{lockfile-hash}
```

For a Node.js project on GitHub Actions, that looks like:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      npm-${{ runner.os }}-
```

The `restore-keys` fallback is important. If the exact key does not match (because a dependency was added or updated), the runner still restores a partial cache from a previous run. This means `npm install` only downloads the changed packages rather than everything from scratch.

### What to Cache by Language

| Language/Tool | Cache Directory | Cache Key Source |
|---|---|---|
| Node.js (npm) | `~/.npm` | `package-lock.json` |
| Node.js (yarn) | `$(yarn cache dir)` | `yarn.lock` |
| Node.js (pnpm) | `$(pnpm store path)` | `pnpm-lock.yaml` |
| Python (pip) | `~/.cache/pip` | `requirements.txt` or `pyproject.toml` |
| Java (Maven) | `~/.m2/repository` | `pom.xml` |
| Java (Gradle) | `~/.gradle/caches` | `build.gradle` + `gradle.properties` |
| Ruby (Bundler) | `vendor/bundle` | `Gemfile.lock` |
| Go | `~/go/pkg/mod` | `go.sum` |
| Rust (Cargo) | `~/.cargo/registry` + `target/` | `Cargo.lock` |

### Avoid Caching node_modules Directly

It is tempting to cache `node_modules` instead of the npm cache directory. Do not do this. Native modules compiled on one OS or architecture will not work on another. The npm cache stores downloaded tarballs, which get installed correctly for the current platform every time.

## Build Caching and Incremental Builds

Dependency caching handles the install step. Build caching handles the compilation step. If nothing in a module has changed since the last build, there is no reason to rebuild it.

### Local Build Caching

Most modern build tools support incremental builds out of the box:

- **TypeScript:** The `tsc --incremental` flag stores type-checking results in a `.tsbuildinfo` file. Subsequent builds only recheck files that changed.
- **Webpack:** Enabling `cache: { type: 'filesystem' }` persists the build cache to disk.
- **Vite:** Caches pre-bundled dependencies in `node_modules/.vite` automatically.
- **Gradle:** Incremental compilation is on by default. The build cache stores task outputs keyed by inputs.

To use these in CI, you need to persist and restore the relevant cache files between runs. Treat them the same way as dependency caches: save after a successful build, restore at the start of the next one.

### Remote Build Caching

Remote build caching takes this further by sharing cached artefacts across your entire team. If a colleague has already built a module with the same inputs, your CI runner (or your local machine) can download the cached output instead of rebuilding.

Tools that support remote build caching:

- **Turborepo:** Stores task outputs in a remote cache. The <a href="https://turborepo.dev/repo/docs/crafting-your-repository/caching" target="_blank" rel="noopener noreferrer">Turborepo caching documentation ↗</a> explains the mechanism in detail.
- **Nx:** Nx Cloud provides distributed caching across CI runners and developer machines.
- **Gradle:** The build cache can be backed by a remote HTTP cache server.
- **Bazel:** Remote caching and remote execution are core features of the build system.

Remote caching is particularly valuable in monorepos. For teams managing multiple packages in a single repository, our article on [monorepos vs polyrepos](/architecture/monorepos-vs-polyrepos-which-is-right-for-you) covers the broader architectural decisions involved.

### Affected-Only Builds

In a monorepo, you should not rebuild everything on every commit. Instead, detect which packages changed and build only those:

```
# Turborepo example
npx turbo run build --filter=...[origin/main]

# Nx example
npx nx affected --target=build --base=origin/main
```

This combines well with remote caching. Unchanged packages hit the cache. Changed packages rebuild. The result is a pipeline that scales with the size of the change, not the size of the repository.

## Parallelisation

Running steps in parallel is one of the most effective ways to reduce total pipeline duration. If your lint, type check, and test steps each take 3 minutes and run sequentially, that is 9 minutes. Run them in parallel and it is 3 minutes.

### Parallel Jobs

Most CI platforms let you run independent jobs concurrently. Structure your pipeline so that steps without dependencies on each other run at the same time:

<svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram comparing sequential pipeline execution taking 12 minutes versus parallel execution taking 5 minutes">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <text x="350" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Sequential vs Parallel Pipeline Execution</text>
  <!-- Sequential -->
  <text x="10" y="62" font-size="11" font-weight="600" fill="#334155">Sequential</text>
  <text x="10" y="76" font-size="9" fill="#94a3b8">(12 min)</text>
  <rect x="90" y="48" width="80" height="30" rx="4" fill="#6366f1" />
  <text x="130" y="68" text-anchor="middle" font-size="10" fill="#fff">Install</text>
  <rect x="174" y="48" width="60" height="30" rx="4" fill="#8b5cf6" />
  <text x="204" y="68" text-anchor="middle" font-size="10" fill="#fff">Lint</text>
  <rect x="238" y="48" width="60" height="30" rx="4" fill="#a78bfa" />
  <text x="268" y="68" text-anchor="middle" font-size="10" fill="#fff">Types</text>
  <rect x="302" y="48" width="100" height="30" rx="4" fill="#c4b5fd" />
  <text x="352" y="68" text-anchor="middle" font-size="10" fill="#4c1d95">Tests</text>
  <rect x="406" y="48" width="80" height="30" rx="4" fill="#ddd6fe" />
  <text x="446" y="68" text-anchor="middle" font-size="10" fill="#4c1d95">Build</text>
  <!-- Arrow -->
  <text x="350" y="112" text-anchor="middle" font-size="20" fill="#22c55e">&#8595;</text>
  <!-- Parallel -->
  <text x="10" y="148" font-size="11" font-weight="600" fill="#334155">Parallel</text>
  <text x="10" y="162" font-size="9" fill="#94a3b8">(5 min)</text>
  <!-- Install (shared) -->
  <rect x="90" y="130" width="60" height="30" rx="4" fill="#6366f1" />
  <text x="120" y="150" text-anchor="middle" font-size="10" fill="#fff">Install</text>
  <!-- Parallel branches -->
  <rect x="154" y="130" width="50" height="30" rx="4" fill="#22c55e" />
  <text x="179" y="150" text-anchor="middle" font-size="10" fill="#fff">Lint</text>
  <rect x="154" y="164" width="50" height="30" rx="4" fill="#22c55e" opacity="0.9" />
  <text x="179" y="184" text-anchor="middle" font-size="10" fill="#fff">Types</text>
  <rect x="154" y="198" width="100" height="30" rx="4" fill="#22c55e" opacity="0.8" />
  <text x="204" y="218" text-anchor="middle" font-size="10" fill="#fff">Tests</text>
  <!-- Build after parallel -->
  <rect x="258" y="130" width="60" height="30" rx="4" fill="#22c55e" opacity="0.7" />
  <text x="288" y="150" text-anchor="middle" font-size="10" fill="#fff">Build</text>
  <!-- Bracket lines -->
  <line x1="150" y1="135" x2="150" y2="225" stroke="#e2e8f0" stroke-width="1" />
  <line x1="254" y1="135" x2="254" y2="225" stroke="#e2e8f0" stroke-width="1" />
</svg>

On GitHub Actions, the <a href="https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/running-variations-of-jobs-in-a-workflow" target="_blank" rel="noopener noreferrer">matrix strategy ↗</a> makes this straightforward. Define independent jobs that share a dependency installation step, then let them run concurrently.

### Parallel Test Execution

Splitting your test suite across multiple runners is where parallelisation delivers the largest gains. The key decisions are:

1. **How to split:** By file, by test, or by historical timing data. Timing-based splitting produces the most even distribution.
2. **How many runners:** Start with 2 to 4 parallel runners and increase until the overhead of spinning up additional runners outweighs the time saved.
3. **How to aggregate results:** Most CI platforms can collect test results from parallel jobs into a single report.

A common pattern with Jest:

```yaml
strategy:
  matrix:
    shard: [1, 2, 3, 4]
steps:
  - run: npx jest --shard=${{ matrix.shard }}/4
```

For Python projects, `pytest-xdist` provides similar functionality with `-n auto` to automatically detect the number of available CPU cores.

### Watch Out for Shared State

Parallel tests must be independent. If two test shards write to the same database, file, or environment variable, you will get intermittent failures that are painful to debug. Use isolated test databases, unique temporary directories, and avoid global mutable state.

For more on writing tests that work reliably in CI, see [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help).

## Docker Build Optimisation

If your CI pipeline builds Docker images, the build step can easily dominate your total pipeline time. A naive Dockerfile that installs dependencies and copies source code in a single layer will rebuild everything on every commit, even if only one line of application code changed.

### Layer Ordering

Docker caches layers from top to bottom. When a layer changes, every layer below it is rebuilt. The optimisation principle is simple: put things that change rarely at the top and things that change often at the bottom.

```dockerfile
# Good: dependencies cached separately from source code
FROM node:20-alpine
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Bad: source code change invalidates dependency install
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci
RUN npm run build
```

In the good example, `npm ci` only reruns when `package.json` or `package-lock.json` changes. In the bad example, it reruns on every commit because `COPY . .` comes before the install step.

The <a href="https://docs.docker.com/build/cache/" target="_blank" rel="noopener noreferrer">Docker build cache documentation ↗</a> covers the mechanics of layer caching in detail. For a broader look at Docker in development workflows, see our article on [Docker for developers: beyond the basics](/devops/docker-for-developers-beyond-the-basics).

### Multi-Stage Builds

Multi-stage builds keep your final image small and your build fast:

```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

The builder stage handles compilation. The production stage copies only what is needed to run the application. Build tools, source files, and development dependencies stay out of the final image.

### BuildKit Cache Mounts

Docker BuildKit (the default builder in modern Docker) supports cache mounts that persist package manager caches across builds:

```dockerfile
RUN --mount=type=cache,target=/root/.npm npm ci
```

This keeps the npm cache between builds, so only changed packages need to be downloaded. It is the Docker equivalent of CI dependency caching.

## Advanced Techniques

### Selective Step Execution

Not every change needs every check. A documentation-only change does not need to run the full test suite. A change to a frontend component does not need backend integration tests.

Use path filters to skip irrelevant steps:

```yaml
# GitHub Actions path filter example
on:
  push:
    paths:
      - 'src/**'
      - 'tests/**'
      - 'package.json'
```

This reduces unnecessary builds and keeps the feedback loop tight for changes that do not affect application code.

### Build Artefact Reuse

Build once, deploy many times. Instead of rebuilding your application for each deployment environment, build a single artefact and promote it through environments. This is faster and eliminates the risk of environment-specific build differences.

The pattern works naturally with [deployment strategies like blue-green and canary releases](/devops/deployment-strategies-blue-green-canary-rolling-updates), where the same artefact moves from staging to production.

### Self-Hosted Runners

If your builds are CPU or memory intensive, self-hosted runners can be significantly faster than the shared runners provided by CI platforms. They also give you persistent storage for caches, which eliminates the cache download step entirely.

The tradeoff is maintenance. Self-hosted runners need patching, monitoring, and capacity management. For teams with straightforward build requirements, the managed runners are usually sufficient.

### Warming the Cache

A cold cache after a dependency update can slow down an entire team's builds. Some teams run a scheduled "cache warming" job that builds and caches dependencies on a regular schedule, so the first developer to push after a dependency change still gets a warm cache.

## A Practical Optimisation Checklist

If you are looking to speed up your CI builds today, work through this list in order. Each step builds on the previous one.

| Priority | Action | Typical Saving | Effort |
|---|---|---|---|
| 1 | Add dependency caching | 2 to 5 minutes | Low |
| 2 | Enable incremental/cached builds | 1 to 4 minutes | Low |
| 3 | Reorder stages to fail fast | 1 to 3 minutes | Low |
| 4 | Parallelise independent jobs | 30 to 60% of total time | Medium |
| 5 | Split test suite across runners | 50 to 75% of test time | Medium |
| 6 | Optimise Docker layer ordering | 2 to 5 minutes per build | Low |
| 7 | Add path filters for selective execution | Variable | Low |
| 8 | Implement remote build caching | 1 to 5 minutes | Medium |
| 9 | Evaluate self-hosted runners | Variable | High |

Start with items 1 to 3. They are low effort and often cut build times in half. For more on structuring your overall pipeline around these techniques, see our guide on [how to build a CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works).

## Monitoring Build Performance Over Time

Optimising once is not enough. Builds have a natural tendency to slow down as projects grow. New dependencies get added, test suites expand, and build steps accumulate without anyone questioning whether they are still necessary.

Set up monitoring for your build times:

- **Track median and p95 build duration** weekly. A creeping p95 indicates a growing problem before the median moves.
- **Alert on builds that exceed your time budget.** If your target is 10 minutes, alert when builds hit 12 minutes so you can address the regression early.
- **Review build logs quarterly.** Look for steps that have grown significantly, duplicate work, or tests that have become disproportionately slow.
- **Audit your dependencies.** For guidance on keeping your dependency tree lean, see [dependency management without the chaos](/devops/dependency-management-without-the-chaos).

The best engineering teams treat CI build performance the same way they treat application performance: as a metric that matters, with a budget, monitoring, and a plan for when things degrade.

## Start With the Biggest Bottleneck

You do not need to implement every technique in this article at once. Measure your current pipeline, identify the single slowest stage, and fix that one first. In my experience, dependency caching alone typically saves 3 to 5 minutes, and it takes less than 30 minutes to set up on any major CI platform.

Once that is done, move to the next bottleneck. Incremental improvements compound quickly. A team that shaves 2 minutes off their build every month will halve their total build time in a quarter, and the effect on developer productivity and satisfaction is immediate.
