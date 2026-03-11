---
title: "How to Build a CI/CD Pipeline That Actually Works"
description: "Build a CI/CD pipeline that is fast, reliable, and maintainable. Practical patterns from real-world engineering teams."
publishDate: "2026-03-08"
author: "david-white"
category: "devops"
tags: ["ci-cd", "devops", "continuous-integration", "continuous-deployment", "automation"]
featured: false
draft: false
faqs:
  - question: "What is the difference between continuous integration and continuous deployment?"
    answer: "Continuous integration (CI) automatically builds and tests code whenever changes are pushed. Continuous deployment (CD) takes it further by automatically deploying tested changes to production. Many teams use continuous delivery instead, where deployments are automated but require a manual approval step."
  - question: "How fast should a CI pipeline be?"
    answer: "A good target is under 10 minutes for the full pipeline. The critical path from push to feedback should ideally be under 5 minutes. If your pipeline takes longer than 15 minutes, developers will stop waiting for results and context-switch to other tasks, defeating the purpose of fast feedback."
  - question: "Should you run all tests in CI?"
    answer: "Run all unit tests and critical integration tests on every push. Heavy end-to-end tests and performance tests can run on a scheduled basis or only on merge to the main branch. The key is balancing thoroughness with speed."
  - question: "What CI/CD platform should I choose?"
    answer: "GitHub Actions is the most popular choice for GitHub-hosted projects due to its tight integration. GitLab CI/CD is excellent if you use GitLab. For more complex needs, platforms like Buildkite or CircleCI offer greater flexibility and performance. Choose based on where your code lives and your scaling needs."
  - question: "How do you handle secrets in CI/CD pipelines?"
    answer: "Never store secrets in your pipeline configuration files. Use your CI platform's built-in secrets management, or integrate with a dedicated secrets manager like HashiCorp Vault or AWS Secrets Manager. Rotate secrets regularly and audit access."
primaryKeyword: "CI/CD pipeline"
---

## Most CI/CD Pipelines Are Worse Than They Need to Be

A well-built CI/CD pipeline is one of the highest-leverage investments an engineering team can make. It catches bugs before they reach production, enforces quality standards automatically, and gives developers the confidence to ship frequently.

Yet most pipelines are slow, fragile, and poorly maintained. They started as a simple "run the tests" step and grew into an untested, undocumented mess of YAML that nobody fully understands. When the pipeline breaks, it blocks the entire team. When it is slow, developers work around it.

I have seen this pattern at companies of every size: a pipeline that began as a five-minute check gradually balloons to 30 minutes or more, and nobody notices until it is already a major bottleneck. Here is how to build one that actually serves your team well.

## Design Principles

### Speed Is Non-Negotiable

A slow pipeline is a broken pipeline. If developers have to wait 30 minutes for feedback, they will push multiple changes before seeing results, making failures harder to diagnose. They will also context-switch to other tasks, losing focus on the work at hand.

Target these benchmarks:

| Pipeline Stage | Target Duration | Why It Matters |
|---|---|---|
| Lint and type checks | Under 2 minutes | Fastest feedback on basic errors |
| Unit tests | Under 5 minutes | Core quality gate |
| Full pipeline (including integration tests) | Under 10 minutes | Total feedback loop |
| Deployment to staging | Under 5 minutes after pipeline passes | Enables quick verification |

### Fail Fast

Order your pipeline stages so that the cheapest, fastest checks run first. If the code does not compile, there is no point running the test suite. If linting fails, there is no point running the build.

A typical stage order:

1. Lint and format checks
2. Type checking
3. Unit tests
4. Build
5. Integration tests
6. Deploy to staging
7. End-to-end tests (against staging)
8. Deploy to production

Each stage acts as a gate. Failures in early stages prevent wasted compute on later ones.

<svg viewBox="0 0 620 300" xmlns="http://www.w3.org/2000/svg" aria-label="Funnel diagram showing CI/CD pipeline stages from lint checks at the top to production deployment at the bottom, with each stage filtering out issues and narrowing the pipeline.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="310" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">CI/CD Pipeline: Fail Fast Funnel</text>
  <!-- Funnel stages -->
  <rect x="60" y="44" width="500" height="28" rx="4" fill="#3b82f6" />
  <text x="310" y="63" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Lint + Format (fastest, cheapest)</text>
  <rect x="90" y="78" width="440" height="28" rx="4" fill="#3b82f6" opacity="0.9" />
  <text x="310" y="97" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Type Checking</text>
  <rect x="120" y="112" width="380" height="28" rx="4" fill="#3b82f6" opacity="0.8" />
  <text x="310" y="131" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Unit Tests</text>
  <rect x="150" y="146" width="320" height="28" rx="4" fill="#3b82f6" opacity="0.7" />
  <text x="310" y="165" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Build</text>
  <rect x="180" y="180" width="260" height="28" rx="4" fill="#3b82f6" opacity="0.6" />
  <text x="310" y="199" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Integration Tests</text>
  <rect x="210" y="214" width="200" height="28" rx="4" fill="#22c55e" opacity="0.8" />
  <text x="310" y="233" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Deploy to Staging</text>
  <rect x="240" y="248" width="140" height="28" rx="4" fill="#22c55e" opacity="0.9" />
  <text x="310" y="267" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">E2E Tests</text>
  <rect x="260" y="282" width="100" height="28" rx="4" fill="#22c55e" />
  <text x="310" y="301" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="500">Production</text>
  <!-- Side annotations -->
  <text x="575" y="63" font-size="10" fill="#64748b">~1 min</text>
  <text x="545" y="97" font-size="10" fill="#64748b">~2 min</text>
  <text x="515" y="131" font-size="10" fill="#64748b">~4 min</text>
  <text x="485" y="165" font-size="10" fill="#64748b">~3 min</text>
  <text x="455" y="199" font-size="10" fill="#64748b">~5 min</text>
  <text x="425" y="233" font-size="10" fill="#64748b">~3 min</text>
  <text x="395" y="267" font-size="10" fill="#64748b">~5 min</text>
</svg>

### Make It Deterministic

Flaky pipelines erode trust. When a pipeline fails, developers should be confident that the failure reflects a genuine problem with their code, not a random infrastructure hiccup.

Common sources of flakiness and their fixes:

- **Flaky tests:** Quarantine them. Fix or delete them. Never ignore them.
- **Network dependencies:** Mock external services in tests. Pin dependency versions.
- **Timing issues:** Avoid sleeps in tests. Use proper wait conditions and retries.
- **Resource contention:** Ensure tests do not share state. Use isolated databases or namespaces.

For more on writing reliable tests that support your pipeline, see [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help).

## Pipeline Architecture

### The Trunk-Based Model

For teams practising trunk-based development, the pipeline runs on every push to the main branch and on every pull request:

**Pull request pipeline:**
- Runs linting, type checking, unit tests, and build
- Provides fast feedback (under 10 minutes)
- Gates merging via required status checks

**Main branch pipeline:**
- Runs the full suite including integration and end-to-end tests
- Deploys to staging automatically
- Deploys to production after staging verification (automatically or with approval)

### The Feature Branch Model

For teams using longer-lived feature branches:

- Run the fast checks on every push to any branch
- Run the full pipeline on pull request creation and updates
- Run deployment steps only from the main branch

For guidance on choosing the right branching approach, see our article on [git workflows that scale with your team](/workflows/git-workflows-that-scale-with-your-team).

### Monorepo Considerations

In a monorepo, running the full pipeline for every change is wasteful. Use affected-target analysis to run only the relevant checks:

- Detect which packages or services changed
- Run only the tests and builds for affected projects
- Deploy only the services that have changed

Tools like Nx, Turborepo, and Bazel provide this functionality out of the box. For a wider discussion on this topic, our article on [monorepos vs polyrepos](/architecture/monorepos-vs-polyrepos-which-is-right-for-you) explores the tradeoffs in depth.

## Caching Strategies

Caching is the most effective way to speed up your pipeline. The <a href="https://docs.github.com/en/actions/writing-workflows/choosing-what-your-workflow-does/caching-dependencies-to-speed-up-workflows" target="_blank" rel="noopener noreferrer">GitHub Actions caching documentation ↗</a> is an excellent starting point if you are on that platform.

### Dependency Caching

Cache your package manager's download directory (node_modules, .m2, pip cache) between runs. Use a hash of your lockfile as the cache key so the cache invalidates when dependencies change.

### Build Caching

If your build tool supports it, cache build artefacts between runs. Tools like Turborepo, Nx, and Gradle have sophisticated remote caching that shares build results across the entire team.

### Docker Layer Caching

For Docker-based builds, structure your Dockerfiles to maximise layer cache hits. Put rarely-changing layers (base image, system dependencies) at the top and frequently-changing layers (application code) at the bottom. Our article on [Docker for developers: beyond the basics](/devops/docker-for-developers-beyond-the-basics) covers this in more detail.

## Testing Strategy in CI

### The Testing Pyramid in Practice

Your CI pipeline should reflect the testing pyramid:

- **Many unit tests:** Fast, isolated, run on every push. These form the base of your quality assurance.
- **Fewer integration tests:** Test interactions between components. Run on every PR or merge to main.
- **Few end-to-end tests:** Test critical user journeys. Run on merge to main or on a schedule.

### Parallelise Test Execution

Split your test suite across multiple runners. Most CI platforms support parallel job execution. Distribute tests evenly based on historical run times, not just file count.

### Test Impact Analysis

Advanced teams use test impact analysis to run only the tests affected by a given change. This provides the confidence of a full test run with the speed of running a subset. Tools like Launchable and Jest's `--changedSince` flag support this approach.

## Deployment Practices

### Blue-Green Deployments

Maintain two identical production environments. Deploy to the inactive one, verify it works, then switch traffic. This gives you instant rollback capability.

### Canary Releases

Route a small percentage of traffic to the new version. Monitor error rates and performance metrics. If everything looks good, gradually increase traffic. If not, roll back instantly.

### Feature Flags

Decouple deployment from release. Ship code to production behind feature flags, then enable features independently of deployments. This reduces deployment risk and gives product teams control over feature rollout. For a deeper look, read our [practical introduction to feature flags](/devops/feature-flags-a-practical-introduction).

## Monitoring Your Pipeline

Track these metrics over time:

- **Pipeline duration:** Is it getting slower? Investigate before it becomes a problem.
- **Success rate:** A rate below 90% suggests systemic issues (flaky tests, infrastructure problems).
- **Queue time:** How long do jobs wait before a runner picks them up? This indicates whether you need more compute capacity.
- **Recovery time:** How quickly can you fix a broken pipeline?

The <a href="https://dora.dev/research/" target="_blank" rel="noopener noreferrer">DORA research programme ↗</a> has consistently found that teams with faster, more reliable pipelines deliver better business outcomes. Measuring and improving your pipeline is not just an engineering exercise; it is a business investment.

## Common Mistakes

**Treating the pipeline as an afterthought.** Your CI/CD configuration is code. Review it. Test it. Document it. Apply the same engineering standards you apply to your application code. The practice of [writing good commit messages](/workflows/the-art-of-writing-good-commit-messages) applies just as much to pipeline configuration changes.

**Not caching aggressively enough.** Every minute of CI time costs money and developer attention. Cache everything that can be cached safely.

**Running too much in sequence.** If two stages have no dependency on each other, run them in parallel. A pipeline with five 2-minute stages running sequentially takes 10 minutes. Running them in parallel takes 2 minutes.

**Ignoring flaky tests.** A test that fails 5% of the time will fail almost every day on a busy team. Quarantine flaky tests immediately and fix them as a priority.

## Start Where You Are

If your current pipeline is slow or unreliable, you do not need to rebuild it from scratch. Start with the highest-impact improvement:

1. Measure your current pipeline duration and identify the slowest stages
2. Add caching for dependencies and build artefacts
3. Parallelise your test suite
4. Reorder stages to fail fast
5. Fix or quarantine flaky tests

Each of these steps independently improves the situation. Together, they can transform a 30-minute pipeline into a 5-minute one. I have seen teams achieve exactly this, and the effect on morale and delivery speed is remarkable.
