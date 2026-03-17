---
title: "Dependency Management Without the Chaos"
description: "A practical guide to managing dependencies so your projects stay secure, up to date, and free from unexpected breakage."
publishDate: "2026-03-17"
author: "gareth-clubb"
category: "devops"
tags: ["dependencies", "package-management", "security", "npm", "devops", "maintenance"]
featured: false
draft: false
faqs:
  - question: "How often should I update dependencies?"
    answer: "There is no single right cadence, but a monthly review works well for most teams. Security patches should be applied as soon as possible, ideally within days. Minor and major version bumps can wait for your regular review cycle. The worst approach is ignoring updates entirely and then trying to upgrade everything at once after a year of drift."
  - question: "Should I pin exact dependency versions?"
    answer: "Pinning exact versions in your package.json or equivalent gives you the most control, but it means you miss automatic patch updates. A good middle ground is to use ranges for patches (the default tilde or caret behaviour in npm) and rely on your lockfile to pin the exact resolved versions. The lockfile is what guarantees reproducibility, not the version ranges in your manifest."
  - question: "What is the difference between a lockfile and a manifest?"
    answer: "The manifest (package.json, Gemfile, requirements.txt) describes what you want: the packages and acceptable version ranges. The lockfile (package-lock.json, Gemfile.lock, requirements.txt with pinned versions) records exactly what you got: the specific resolved versions of every package, including transitive dependencies. Always commit your lockfile to version control."
  - question: "How do I handle a dependency with a known vulnerability but no fix available?"
    answer: "First, assess the actual risk. Not every vulnerability is exploitable in your specific context. If the vulnerability is in a dev dependency or a code path you do not use, the risk may be low. If it is a genuine concern, look for alternative packages, check if you can patch the vulnerable code yourself, or add compensating controls like input validation. Document your decision so the team understands the trade-off."
  - question: "Are automated dependency update tools like Dependabot worth using?"
    answer: "Yes, for most teams. Automated tools surface updates you would otherwise miss and create pull requests you can review on your own schedule. The key is to pair them with a good test suite so you can merge updates with confidence. Without tests, automated PRs just pile up and create noise."
primaryKeyword: "dependency management"
---

Every project starts with a handful of dependencies. A framework here, a utility library there, a testing tool, a linter. Before long, your dependency tree has hundreds of packages, and the `node_modules` folder weighs more than the code you actually wrote.

Dependencies are a trade-off. They save you from reinventing the wheel, but they introduce risk: security vulnerabilities, breaking changes, abandoned packages, and version conflicts. Managing them well is not glamorous work, but it is the difference between a project that ages gracefully and one that becomes painful to maintain.

## Start with your lockfile

If you take one thing from this article, let it be this: commit your lockfile to version control. Always.

Your lockfile (whether that is `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `Gemfile.lock`, `poetry.lock`, or `Cargo.lock`) is the single source of truth for what your project actually runs. Without it, two developers running `npm install` on the same day can end up with different versions of the same package.

The npm documentation on <a href="https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json" target="_blank" rel="noopener noreferrer">package-lock.json <span class="external-link-icon">↗</span></a> explains the mechanics in detail, but the principle is universal across ecosystems: the lockfile guarantees that every environment, from your laptop to your CI server to production, runs exactly the same dependency tree.

```bash
# Always commit your lockfile
git add package-lock.json
git commit -m "Update lockfile"

# Never add lockfiles to .gitignore
# (yes, people do this — don't be one of them)
```

If your CI pipeline does not use the lockfile for installs, fix that first. In npm, that means using `npm ci` instead of `npm install` in your build step. The difference matters: `npm ci` installs exactly what the lockfile specifies, while `npm install` can silently resolve to newer versions.

## Understand semantic versioning

Most package ecosystems use <a href="https://semver.org/" target="_blank" rel="noopener noreferrer">semantic versioning <span class="external-link-icon">↗</span></a> (semver), which encodes the type of change in the version number:

| Version part | Meaning | Example |
|-------------|---------|---------|
| Major (X.0.0) | Breaking changes | 2.0.0 to 3.0.0 |
| Minor (0.X.0) | New features, backwards compatible | 2.1.0 to 2.2.0 |
| Patch (0.0.X) | Bug fixes, backwards compatible | 2.1.0 to 2.1.1 |

In theory, you can safely update patch and minor versions without breaking anything. In practice, semver is a social contract, not a guarantee. Packages sometimes introduce breaking changes in minor versions, either by accident or because the maintainer has a different definition of "breaking".

This is why you need tests. Without a test suite that exercises the functionality you rely on, any update is a gamble. Our guide to [writing tests that actually help](/code-quality/how-to-write-tests-that-actually-help) covers how to build the kind of coverage that catches dependency regressions.

## The update strategy that works

Updating dependencies is not something you should do all at once, once a year, when something forces your hand. By that point, you are facing dozens of major version bumps, breaking changes stacked on top of each other, and deprecation warnings you have never seen before.

Instead, build dependency updates into your regular workflow:

### Weekly: security patches

Run your ecosystem's audit command at least weekly:

```bash
# npm
npm audit

# pip
pip-audit

# Ruby
bundle audit

# Go
govulncheck ./...
```

Security patches are the one category of update that should never wait. If a vulnerability is discovered in a package you use, the fix needs to go out as soon as possible. Your [CI/CD pipeline](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) should include an audit step that fails the build on critical vulnerabilities.

### Monthly: minor updates

Once a month, update your dependencies to the latest minor and patch versions. This keeps you close to the current state of your dependency tree and makes each update small enough to debug if something breaks.

```bash
# Check what's outdated
npm outdated

# Update within semver ranges
npm update

# Run your tests
npm test
```

If your tests pass, commit the updated lockfile and move on. If something breaks, you know it was caused by a specific set of small updates, which makes it much easier to identify the culprit than debugging a year's worth of changes.

### Quarterly: major updates

Major version bumps deserve dedicated time. Set aside a few hours each quarter to review which of your dependencies have released major versions and evaluate whether to upgrade.

For each major update, check:

- The changelog for breaking changes that affect your code
- Whether your other dependencies are compatible with the new version
- Community feedback on stability (give new majors a few weeks before adopting)

Not every major update is worth doing immediately. If a major version drops support for a feature you do not use or adds a capability you do not need, it is fine to stay on the current version for a while. The goal is awareness, not blind upgrading.

## Automated update tools

Tools like GitHub's Dependabot and Renovate automate the process of detecting outdated dependencies and creating pull requests. They are worth setting up for any project that lives in a hosted repository.

The <a href="https://docs.github.com/en/code-security/dependabot" target="_blank" rel="noopener noreferrer">Dependabot documentation <span class="external-link-icon">↗</span></a> covers configuration in detail, but the basics are straightforward. You add a configuration file to your repository, specify which ecosystems to monitor and how often, and the tool handles the rest.

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
```

**Tips for making automated updates manageable:**

- Group related updates into a single PR where possible (Renovate is better at this than Dependabot)
- Set a limit on open PRs to avoid drowning in notifications
- Label automated PRs so you can filter them in your review queue
- Only merge when your test suite passes; if you do not have tests, automated PRs will just pile up

Automated tools handle the tedious part of dependency management: knowing that an update exists. The judgement call on whether to merge it is still yours.

## Evaluating new dependencies

The best time to manage a dependency is before you add it. Every package you bring into your project is a commitment to maintain that relationship, so it pays to be selective.

Before adding a new dependency, ask:

- **Is it actively maintained?** Check the last commit date, open issue count, and release frequency. A package with no activity in two years is a risk.
- **How large is it?** If you need one utility function, do you really need a library with 200 exports? Sometimes writing a small helper yourself is the better choice. This aligns with the philosophy behind [the case for boring technology](/architecture/the-case-for-boring-technology): do not add complexity you do not need.
- **What is its dependency tree?** A single package can pull in dozens of transitive dependencies. Run `npm explain <package>` or check the dependency tree before installing.
- **Does it have a licence you can use?** MIT and Apache 2.0 are generally safe. GPL and AGPL have implications you need to understand.
- **Is there a simpler alternative?** The most popular package is not always the best fit. A smaller, more focused library with fewer dependencies is often preferable.

```bash
# Check a package before installing
npm info <package> --json | jq '{name, version, license, dependencies}'

# See what it would add to your tree
npm install <package> --dry-run
```

## Handling transitive dependencies

The dependencies you choose directly are only part of the picture. Each of those packages has its own dependencies, and those have dependencies too. This is your transitive dependency tree, and it is where most security vulnerabilities and version conflicts hide.

You cannot review every transitive dependency individually, but you can take steps to manage the risk:

- **Use a lockfile** (yes, this point again) to ensure the same transitive versions resolve everywhere
- **Run audits** that cover the full tree, not just your direct dependencies
- **Override vulnerable transitive dependencies** when the direct dependency has not updated yet

```json
// package.json overrides (npm 8.3+)
{
  "overrides": {
    "vulnerable-package": ">=2.1.1"
  }
}
```

Overrides should be temporary. If you find yourself maintaining a growing list of overrides, that is a signal to re-evaluate whether the parent dependency is still the right choice.

## When to remove a dependency

Adding dependencies gets all the attention, but removing them is just as important. Over time, projects accumulate packages that are no longer needed: a polyfill for a browser you no longer support, a utility you replaced with native language features, a library you tried and then worked around.

Dead dependencies increase your attack surface, slow down installs, and add noise to your audit reports. Make dependency pruning part of your quarterly review.

```bash
# Find unused dependencies (JavaScript)
npx depcheck

# Check for packages imported nowhere in your code
npx unimported
```

The [spring cleaning your codebase](/code-quality/spring-cleaning-your-codebase-a-practical-checklist) checklist includes dependency pruning as one of its key steps. If you have not audited your dependency list recently, now is a good time.

## Monorepo considerations

If you are working in a monorepo, dependency management has extra dimensions. Shared dependencies need to be compatible across all packages, and version conflicts between workspace members can cause subtle bugs.

Tools like npm workspaces, pnpm workspaces, and Yarn Berry handle this by hoisting shared dependencies to the root while allowing individual packages to specify their own version constraints.

The key rules for monorepo dependency management:

- Keep shared dependencies at the root level with a single version
- Use workspace protocols for internal package references
- Run a single lockfile for the entire monorepo
- Ensure your CI tests all affected packages when a shared dependency updates

## Building a dependency policy

For teams, it helps to have a lightweight policy that answers common questions before they come up:

- **Who can add new dependencies?** Does it need a PR review, or can anyone add what they need?
- **What criteria must a new dependency meet?** Active maintenance, compatible licence, acceptable size?
- **How are updates handled?** Who is responsible for reviewing and merging automated update PRs?
- **What is the process for security vulnerabilities?** How quickly must critical patches be applied?

You do not need a formal document. A few bullet points in your project's contributing guide or a short section in your engineering handbook is enough. The point is that the team shares a common understanding rather than each developer making ad hoc decisions.

If your team's [git workflow](/workflows/git-workflows-that-scale-with-your-team) includes code review, dependency changes should be part of what reviewers look at. A new dependency is a long-term commitment, not a throwaway line in a diff.

## The dependency audit checklist

Run through this checklist quarterly, or whenever you are preparing a release:

- **Lockfile committed and up to date.** No uncommitted lockfile changes sitting on anyone's machine.
- **No known vulnerabilities.** `npm audit` (or equivalent) returns clean, or known issues are documented with justification.
- **No unused dependencies.** Everything in your manifest is actually imported somewhere in the codebase.
- **Major versions reviewed.** You are aware of any major updates available and have made a conscious decision about each one.
- **Overrides are temporary.** Any dependency overrides have a linked issue or comment explaining when they can be removed.
- **Licences checked.** No new dependencies with incompatible licences have crept in.

Dependency management is not exciting, but it is essential. The teams that treat it as ongoing maintenance rather than a crisis response are the ones whose projects stay healthy, secure, and pleasant to work on for years rather than months.
