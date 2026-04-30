---
title: "GitHub Actions Patterns Every Developer Should Know"
description: "GitHub Actions patterns for faster, safer CI: reusable workflows, matrix builds, OIDC, dependency caching, concurrency control, and secret handling that scales."
publishDate: "2026-04-30"
author: "zubair-hasan"
category: "devops"
tags: ["github-actions", "ci-cd", "devops", "workflows", "automation", "secrets", "oidc"]
featured: false
draft: false
faqs:
  - question: "When should I use a reusable workflow versus a composite action?"
    answer: "Use a reusable workflow when you need to call jobs from another workflow, including their own runners, secrets, and matrix strategies. Use a composite action when you want to bundle a sequence of steps into a single step that runs on the calling job's runner. Reusable workflows are better for cross-cutting pipelines like deploy or release. Composite actions are better for small reusable units like setup-and-cache or notify-on-failure."
  - question: "How do I stop two pipelines from racing on the same branch?"
    answer: "Set a concurrency group on the workflow or job, and pair it with cancel-in-progress: true. A common pattern is concurrency: group: ${{ github.workflow }}-${{ github.ref }}, which queues a single run per workflow per branch and cancels older in-flight runs when a new commit lands. For deploys to a shared environment, use a stable group like deploy-production without cancellation, so jobs queue rather than fight."
  - question: "Is it safe to use third-party actions from the marketplace?"
    answer: "Treat third-party actions as untrusted code that runs with access to your repository token and any secrets you pass. Pin actions to a full commit SHA rather than a tag like @v1, because tags can be moved. Review the action's source before adoption, and prefer actions published by GitHub, your cloud provider, or well-known maintainers. The official GitHub security hardening guide covers the threat model in detail."
  - question: "Should I still use long-lived AWS or cloud credentials in GitHub Actions?"
    answer: "No, not if you can avoid it. OIDC lets GitHub Actions exchange a short-lived workflow token for cloud credentials with no static keys stored in repository secrets. AWS, Google Cloud, and Azure all support this. The pattern is more secure (credentials expire in minutes, not years), easier to rotate (nothing to rotate), and cheaper to audit (every credential is tied to a workflow run)."
  - question: "Why are my matrix jobs running serially instead of in parallel?"
    answer: "Check three things. First, the strategy: matrix block has to be at the job level, not inside a step. Second, max-parallel may be set lower than the matrix size, throttling concurrency. Third, your account or repository may be hitting concurrent job limits on the free runner pool, especially for public repos with large matrices. Larger runners or self-hosted runners give you more headroom."
primaryKeyword: "github actions patterns"
---

A GitHub Actions workflow that worked fine for one developer at five jobs per week tends to fall apart at fifty engineers and five hundred runs a day. The bills get bigger, the failures get weirder, and the YAML grows tendrils into every corner of the repository. The patterns below are the ones that hold up at that scale.

The <a href="https://docs.github.com/en/actions" target="_blank" rel="noopener noreferrer">official GitHub Actions documentation ↗</a> covers the syntax. This article is about the patterns: which features actually save you time, which traps cost teams the most, and how to compose workflows that stay readable as the repo grows.

## Pin Actions to a Commit SHA, Not a Tag

The single highest-impact change you can make is pinning third-party actions. A workflow like this is a security incident waiting to happen:

```yaml
- uses: some-org/some-action@v2
```

Tags are mutable. The maintainer (or an attacker who compromised the maintainer) can move `@v2` to point at malicious code, and your next workflow run pulls it in with full access to your `GITHUB_TOKEN` and every secret your job references.

Pin to a full commit SHA instead:

```yaml
- uses: some-org/some-action@a1b2c3d4e5f67890abcdef1234567890abcdef12 # v2.4.1
```

The SHA is immutable. The trailing comment lets a tool like Dependabot or Renovate update it for you, while still requiring a pull request to change anything. The <a href="https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions" target="_blank" rel="noopener noreferrer">security hardening guide ↗</a> recommends this for every action you do not control, including ones from large vendors.

## Use OIDC Instead of Long-Lived Cloud Credentials

If you are still storing `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` as repository secrets, you are paying a security tax for no benefit. OIDC lets a workflow exchange a short-lived token for cloud credentials, with no static keys involved.

The flow looks like this:

<svg viewBox="0 0 700 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing the OIDC authentication flow between a GitHub Actions runner, GitHub's OIDC issuer, and a cloud provider, where the runner exchanges a workflow token for short-lived credentials">
  <rect x="20" y="40" width="180" height="100" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="110" y="80" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#831843">GitHub Actions</text>
  <text x="110" y="100" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#831843">Runner</text>
  <rect x="260" y="40" width="180" height="100" rx="8" fill="#dbeafe" stroke="#2563eb" stroke-width="2"/>
  <text x="350" y="80" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#1e3a8a">GitHub OIDC</text>
  <text x="350" y="100" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#1e3a8a">Issuer</text>
  <rect x="500" y="40" width="180" height="100" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="2"/>
  <text x="590" y="80" text-anchor="middle" font-family="Inter, sans-serif" font-size="14" font-weight="600" fill="#14532d">Cloud Provider</text>
  <text x="590" y="100" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#14532d">AWS, GCP, Azure</text>
  <line x1="200" y1="80" x2="260" y2="80" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="230" y="70" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#475569">request token</text>
  <line x1="260" y1="100" x2="200" y2="100" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="230" y="120" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#475569">signed JWT</text>
  <line x1="200" y1="180" x2="500" y2="180" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="350" y="170" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#475569">exchange JWT for short-lived credentials</text>
  <line x1="500" y1="220" x2="200" y2="220" stroke="#475569" stroke-width="2" marker-end="url(#arrow)"/>
  <text x="350" y="240" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#475569">temporary access token (15 to 60 min)</text>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0,0 L10,5 L0,10 z" fill="#475569"/>
    </marker>
  </defs>
</svg>

A typical AWS step looks like this:

```yaml
permissions:
  id-token: write
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@SHA_HERE
        with:
          role-to-assume: arn:aws:iam::123456789012:role/github-actions-deploy
          aws-region: eu-west-2
      - run: aws s3 sync ./dist s3://my-bucket
```

The IAM role's trust policy restricts it to a specific repository, branch, or environment, so a fork or a feature branch cannot assume it. Credentials live for the workflow run and then disappear. The <a href="https://docs.github.com/en/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect" target="_blank" rel="noopener noreferrer">OIDC documentation ↗</a> walks through the trust policy syntax for each major cloud.

If you cannot avoid long-lived secrets entirely, at least scope them. Use environment-level secrets with required reviewers for production, and never reuse a deploy key across environments. The <a href="https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions" target="_blank" rel="noopener noreferrer">secrets guide ↗</a> covers the levels: repository, environment, and organisation. For the broader picture on configuration and secret hygiene, see [environment variables done right](/devops/environment-variables-done-right).

## Concurrency: Stop Workflows From Racing Each Other

By default, every push triggers a new workflow run, even if there are five already in flight on the same branch. That wastes runner minutes and produces confusing results when an older run finishes after a newer one.

Two concurrency patterns cover most cases.

### Pattern 1: Cancel older runs on the same branch

For test and lint workflows, you want only the newest commit to matter:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

When a new commit lands on `feature/x`, any in-flight run for that branch is cancelled and the new one starts. Cheap, fast, and stops the queue from backing up.

### Pattern 2: Queue, do not cancel, for deploys

For deploys to a shared environment, you do not want cancellation. You want serialisation:

```yaml
concurrency:
  group: deploy-production
  cancel-in-progress: false
```

If two deploys to production trigger at the same time, the second waits for the first to finish. This prevents two `kubectl apply` calls from fighting over the same cluster state. Use a stable group name so all deploys to the same environment serialise, regardless of which workflow file triggered them.

## Cache Dependencies, Not node_modules

Caching is the single biggest lever on build time. Most teams cache the wrong thing.

Wrong:

```yaml
- uses: actions/cache@SHA
  with:
    path: node_modules
    key: deps-${{ hashFiles('package-lock.json') }}
```

Better:

```yaml
- uses: actions/setup-node@SHA
  with:
    node-version: 20
    cache: npm
- run: npm ci
```

Caching the package manager's cache directory (the npm cache, not `node_modules`) avoids cross-platform issues with native modules and works correctly when your runner OS or Node version changes. The official `setup-` actions for Node, Python, Go, Java, and Ruby all support this directly. The <a href="https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows" target="_blank" rel="noopener noreferrer">caching docs ↗</a> list the right cache paths for each ecosystem.

For monorepos and custom toolchains, use `actions/cache` directly with a key that hashes your lockfile and a `restore-keys` fallback so a partial match is better than no match:

```yaml
- uses: actions/cache@SHA
  with:
    path: |
      ~/.cache/turbo
      ~/.npm
    key: turbo-${{ runner.os }}-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      turbo-${{ runner.os }}-
```

If you want a deeper look at CI performance levers, see [how to speed up your CI builds](/devops/how-to-speed-up-your-ci-builds).

## Matrix Builds: Parallelism Without Copy-Paste

A matrix lets one job definition run multiple variations in parallel. Instead of three near-identical jobs for Node 18, 20, and 22, you write one:

```yaml
strategy:
  fail-fast: false
  matrix:
    node: [18, 20, 22]
    os: [ubuntu-latest, macos-latest]
runs-on: ${{ matrix.os }}
steps:
  - uses: actions/setup-node@SHA
    with:
      node-version: ${{ matrix.node }}
  - run: npm ci && npm test
```

Two matrix flags pay for themselves quickly:

| Flag | What it does | When to use it |
|---|---|---|
| `fail-fast: false` | Lets all matrix legs finish even if one fails | Almost always; you want to see every failure, not just the first |
| `max-parallel: N` | Caps how many legs run at once | When your test suite hammers a shared resource (a staging DB, a flaky API) |
| `include` | Adds extra one-off combinations | Testing one specific Node + OS pair without expanding the full matrix |
| `exclude` | Removes specific combinations from the matrix | Skipping an unsupported pair like Node 18 on a new macOS arch |

Default `fail-fast` is `true`, which cancels every matrix leg the moment one fails. That is rarely what you want for tests, where you would rather see all the failures at once than chase them one at a time. Read more in the <a href="https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs" target="_blank" rel="noopener noreferrer">matrix documentation ↗</a>.

## Reusable Workflows: DRY Without Copy-Paste

A reusable workflow is a workflow that other workflows can call as a job. Use it when the same multi-step process runs in many repos or many places in one repo: deploy, release, security scan, container build.

The reusable workflow file lives anywhere with a `workflow_call` trigger:

```yaml
# .github/workflows/deploy.yml
on:
  workflow_call:
    inputs:
      environment:
        type: string
        required: true
    secrets:
      DEPLOY_TOKEN:
        required: true

jobs:
  deploy:
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - run: ./scripts/deploy.sh ${{ inputs.environment }}
        env:
          DEPLOY_TOKEN: ${{ secrets.DEPLOY_TOKEN }}
```

A caller looks like this:

```yaml
jobs:
  staging:
    uses: ./.github/workflows/deploy.yml
    with:
      environment: staging
    secrets:
      DEPLOY_TOKEN: ${{ secrets.STAGING_DEPLOY_TOKEN }}
```

Reusable workflows are stronger than composite actions when you need their own runners, secrets, and environment protection rules. The <a href="https://docs.github.com/en/actions/using-workflows/reusing-workflows" target="_blank" rel="noopener noreferrer">reusable workflows guide ↗</a> covers calling across repositories, which is how platform teams ship a single golden deploy workflow that every product team consumes.

## Path Filters: Do Not Run Everything Every Time

In a monorepo, you do not need the frontend tests to run for a backend-only commit:

```yaml
on:
  pull_request:
    paths:
      - 'apps/web/**'
      - 'packages/ui/**'
      - '.github/workflows/web.yml'
```

Always include the workflow file itself in the paths list. Otherwise a change to the workflow does not trigger the workflow, which is exactly the moment you want feedback.

For required checks on protected branches, use `paths-ignore` carefully. A required check that does not run because of a path filter blocks the PR forever. The safer pattern is to run a fast skip-job that signals success when the affected paths do not match, so the required check still completes.

## Permissions: Tighten the Default Token

The `GITHUB_TOKEN` defaults to write access on most resources in your repository. That is more than most jobs need. Restrict it at the workflow or job level:

```yaml
permissions:
  contents: read
  pull-requests: write
```

Set repository-wide defaults in **Settings -> Actions -> General -> Workflow permissions** to `Read repository contents and packages permissions`, then opt into write access where needed. A compromised dependency in a job with the default token can push commits, create releases, and merge pull requests. A compromised dependency in a job with `contents: read` can read your code. Both are bad. The second is much less bad.

## Step Outputs and Conditionals: Avoid Bash Hacks

A common smell is a 30-line bash script that builds up a string, exports it, and parses it in a later step. GitHub Actions has first-class support for outputs:

```yaml
- id: meta
  run: |
    echo "version=$(cat package.json | jq -r .version)" >> $GITHUB_OUTPUT
    echo "is_release=$([[ $GITHUB_REF == refs/tags/v* ]] && echo true || echo false)" >> $GITHUB_OUTPUT

- name: Publish
  if: steps.meta.outputs.is_release == 'true'
  run: npm publish
  env:
    VERSION: ${{ steps.meta.outputs.version }}
```

Outputs are typed strings, available in later steps and downstream jobs via `needs.<job>.outputs`. The <a href="https://docs.github.com/en/actions/learn-github-actions/expressions" target="_blank" rel="noopener noreferrer">expressions reference ↗</a> covers the operators you can use in `if:` conditionals, including comparisons, the `contains()` and `startsWith()` functions, and short-circuit evaluation.

## Composite Actions for Repeated Step Sequences

If you find yourself copying the same five steps into ten workflows, wrap them in a composite action. A `setup` action that installs Node, configures the npm cache, and runs `npm ci` becomes one line in every workflow:

```yaml
# .github/actions/setup/action.yml
name: Setup project
runs:
  using: composite
  steps:
    - uses: actions/setup-node@SHA
      with:
        node-version: 20
        cache: npm
    - run: npm ci
      shell: bash
```

```yaml
# any workflow
- uses: ./.github/actions/setup
```

Composite actions live in the same repo and are pinned by path, not SHA. They are the right level for small reusable units. Reusable workflows are the right level for whole jobs.

## Common Failure Modes

Three patterns trip up most teams.

### Secrets logged in plain text

A `run: echo "$DATABASE_URL"` step exposes the secret in build logs. GitHub masks known secrets in output, but only ones registered through the secrets mechanism. A token built up from concatenated env vars will not be masked. Treat any value derived from a secret as a secret.

### Workflow files in pull requests from forks

By default, pull requests from forks cannot read repository secrets. That is the right security default. Workflows that need secrets (deploy preview environments, comment bots) should use `pull_request_target` only with extreme care, because that trigger runs in the context of the base branch with full access to secrets. Read the threat model carefully before using it.

### Cache poisoning

The cache is shared across branches. A malicious or buggy build on a feature branch can write a poisoned cache entry that a later production build picks up. Mitigate this by including the branch or environment in the cache key, and by treating cache entries as untrusted (re-validate critical artefacts after restore).

## A Reasonable Default Workflow

This is what a reasonable starting point looks like for a Node project:

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        node: [20, 22]
    steps:
      - uses: actions/checkout@SHA
      - uses: actions/setup-node@SHA
        with:
          node-version: ${{ matrix.node }}
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage

  build:
    runs-on: ubuntu-latest
    needs: test
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@SHA
      - uses: actions/setup-node@SHA
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@SHA
        with:
          name: dist
          path: dist
```

Replace each `@SHA` with the pinned commit hash. From here you can layer on a deploy job that uses OIDC, a release workflow that publishes to npm, and a composite action that wraps the repeated setup steps. Linters and formatters can live in a separate job that runs in parallel; for that pattern see [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters). For deploy strategies that pair well with these workflows, see [deployment strategies: blue green, canary, and rolling updates](/devops/deployment-strategies-blue-green-canary-rolling-updates).

## What to Build Next

If you only do three things after reading this:

1. Pin every third-party action to a commit SHA, today.
2. Add `concurrency` with `cancel-in-progress: true` to your test workflow.
3. Replace one long-lived cloud credential with OIDC.

Each one takes under an hour, and each one prevents a category of incident that has bitten teams I have worked with. The rest of the patterns above pay back over months and years; these three pay back the same week.

If your tests are still flaky after the workflow is in shape, that is a different problem; see [why your tests are flaky and how to fix them](/code-quality/why-your-tests-are-flaky-and-how-to-fix-them) for the test side of the equation. And if you are still building your first pipeline, [how to build a CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) covers the foundations these patterns build on.
