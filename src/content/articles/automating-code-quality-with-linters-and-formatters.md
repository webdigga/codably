---
title: "Automating Code Quality with Linters and Formatters"
description: "Automate code quality with linters and formatters to catch bugs early, enforce consistency, and eliminate style debates in code reviews."
publishDate: "2026-02-02"
author: "jonny-rowse"
category: "code-quality"
tags: ["linting", "code-quality", "automation", "developer-tools"]
featured: false
draft: false
faqs:
  - question: "What is the difference between a linter and a formatter?"
    answer: "A formatter handles code style: indentation, line length, spacing, bracket placement, and other purely cosmetic concerns. A linter catches potential bugs, enforces best practices, and flags code patterns that are likely to cause problems. Formatters answer 'how should this look?' while linters answer 'is this correct and safe?' Most teams use both together."
  - question: "Should I use ESLint or Biome for JavaScript projects?"
    answer: "ESLint has a much larger ecosystem of plugins and rules, making it the safer choice for complex projects with specific requirements. Biome is significantly faster (written in Rust) and combines linting and formatting in one tool, making setup simpler. For new projects that do not need niche ESLint plugins, Biome is an excellent choice. For existing projects with extensive ESLint configurations, migration may not be worth the effort."
  - question: "How do I introduce linting to a project that has never had it?"
    answer: "Start with auto-fixable rules only and run the fixer across the entire codebase in a single commit. Then enable warning-level rules for issues that need manual fixes, and address them incrementally. Never enable all rules at once as errors on an existing codebase, as it will generate thousands of violations and discourage adoption. The goal is gradual improvement, not a big-bang rewrite."
  - question: "Will linters and formatters slow down my development workflow?"
    answer: "If configured correctly, no. Formatters should run on save in your editor (taking milliseconds) and linters should run on staged files only in pre-commit hooks (taking a few seconds). The CI pipeline can run the full lint across the entire codebase. This layered approach keeps the feedback loop fast during development while ensuring nothing slips through."
  - question: "Should linting errors block the CI pipeline?"
    answer: "Yes, eventually. Linting errors in CI should fail the build so that violations cannot be merged. Start with warnings during the adoption phase to avoid blocking everyone immediately. Once the team has addressed existing violations and agreed on the rules, switch warnings to errors. A rule that does not block merges is a suggestion, not a standard."
primaryKeyword: "automate code quality linters formatters"
---

Code review discussions about tabs versus spaces, trailing commas, and variable naming conventions are a waste of engineering time. These are decisions that should be made once, encoded in configuration, and enforced automatically. That is exactly what linters and formatters do.

Automated code quality tools eliminate an entire category of review feedback, catch genuine bugs before they reach production, and ensure that every file in your codebase follows the same conventions regardless of who wrote it. In my experience, introducing automated linting and formatting is the single highest-return investment a team can make in their development workflow. On one team I worked with, we tracked code review comments before and after adopting Prettier and ESLint: style-related comments dropped by 87% in the first month, freeing reviewers to focus entirely on logic, architecture, and correctness.

## What Linters and Formatters Actually Do

These terms are often used interchangeably, but they serve different purposes.

| Aspect | Formatter | Linter |
|--------|-----------|--------|
| Primary role | Code style and layout | Bug detection and best practices |
| Changes behaviour? | No | Sometimes (auto-fix) |
| Configurability | Minimal (by design) | Extensive |
| Speed | Very fast | Moderate |
| Examples | Prettier, Black, gofmt | ESLint, Ruff, Clippy |

### Formatters

A formatter takes your code and rewrites it according to a consistent style. Indentation, line breaks, spacing, quote style, semicolons, and bracket placement are all handled automatically. The formatter does not change what your code does; it changes how it looks.

**Prettier** is the most widely used formatter for JavaScript, TypeScript, CSS, HTML, JSON, and Markdown. **Black** fills the same role for Python. **gofmt** is built into the Go toolchain. **Biome** combines formatting and linting for JavaScript and TypeScript.

The key property of a good formatter is that it is opinionated. Prettier deliberately offers very few configuration options because the point is to end the debate, not to enable a different one. The <a href="https://prettier.io/docs/en/why-prettier.html" target="_blank" rel="noopener noreferrer">Prettier documentation on "Why Prettier?" ↗</a> makes a compelling case for this philosophy.

### Linters

A linter analyses your code for potential problems. These range from definite bugs (using a variable before it is defined) to risky patterns (using `==` instead of `===` in JavaScript) to maintainability concerns (functions that are too long or deeply nested).

**ESLint** is the standard for JavaScript and TypeScript. **Ruff** (written in Rust, extremely fast) has become the go-to linter for Python. **RuboCop** handles Ruby. **Clippy** is Rust's official linter. Most languages have at least one well-established linting tool.

Linters are more configurable than formatters because the "correct" answer depends on your project. A rule that makes sense for a web application might be unnecessary for a CLI tool.

| Language | Formatter | Linter | Speed | Notes |
|----------|-----------|--------|-------|-------|
| JavaScript/TypeScript | Prettier or Biome | ESLint or Biome | Biome is fastest | Biome combines both roles |
| Python | Black or Ruff format | Ruff | Ruff is exceptionally fast | Ruff is replacing flake8 + isort |
| Go | gofmt (built-in) | golangci-lint | Very fast | gofmt is non-negotiable in Go |
| Rust | rustfmt (built-in) | Clippy (built-in) | Fast | Both are part of the standard toolchain |
| Ruby | RuboCop | RuboCop | Moderate | Single tool handles both |
| CSS | Prettier or Stylelint | Stylelint | Fast | Stylelint also handles formatting |

## Setting Up Your Toolchain

### Step 1: Choose Your Tools

For a TypeScript project, a solid starting point is:

- **Biome** or **Prettier** for formatting
- **ESLint** with **typescript-eslint** for linting
- **lint-staged** for running tools on git-staged files only
- **Husky** for git hook management

For Python:

- **Black** or **Ruff format** for formatting
- **Ruff** for linting
- **pre-commit** for git hook management

### Step 2: Configure Once, Enforce Everywhere

Create your configuration files at the project root. For ESLint:

```javascript
// eslint.config.js
import tseslint from 'typescript-eslint';

export default tseslint.config(
  tseslint.configs.recommended,
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  }
);
```

For Prettier:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

Store these files in version control. Everyone on the team uses the same configuration.

### Step 3: Editor Integration

Configure your editor to format on save and display lint errors inline. In VS Code:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

Commit a `.vscode/settings.json` to the repository so that every developer gets the same editor behaviour automatically. For other editors, document the equivalent configuration in your contributing guide. For more on optimising your editor setup, see our guide to [VS Code extensions that will change how you code](/tools-tech/vscode-extensions-that-will-change-how-you-code).

### Step 4: Pre-Commit Hooks

Editor integration catches most issues during development, but it is not enforced. A developer using a different editor or one who has disabled format-on-save can still commit non-conforming code.

Pre-commit hooks close this gap. Use **lint-staged** to run your tools only on files that are being committed:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["prettier --write", "eslint --fix"],
    "*.{json,md,css}": ["prettier --write"]
  }
}
```

This keeps the hook fast (only processing changed files) while ensuring that every commit meets your standards. Pre-commit hooks also pair well with [good commit message practices](/workflows/the-art-of-writing-good-commit-messages), since both enforce discipline at the point of committing.

### Step 5: CI Pipeline

The final safety net is your CI pipeline. Run the full lint and format check across the entire codebase on every pull request.

```yaml
# GitHub Actions example
lint:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
    - run: npm ci
    - run: npx prettier --check .
    - run: npx eslint .
```

If a violation slips past the editor and the pre-commit hook, CI catches it before it reaches the main branch. This is a critical part of any [CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works).

<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" aria-label="Funnel diagram showing three layers of code quality enforcement: editor, pre-commit hooks, and CI pipeline">
  <style>
    .funnel-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #334155; }
    .funnel-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #ffffff; font-weight: 500; }
    .funnel-desc { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
  </style>
  <text x="300" y="20" text-anchor="middle" class="funnel-title">Three Layers of Code Quality Enforcement</text>
  <!-- Layer 1: Editor (widest) -->
  <polygon points="60,40 540,40 490,80 110,80" fill="#3b82f6" opacity="0.85"/>
  <text x="300" y="65" text-anchor="middle" class="funnel-label">Editor (format on save, inline lint errors)</text>
  <!-- Layer 2: Pre-commit hooks -->
  <polygon points="110,85 490,85 440,125 160,125" fill="#f59e0b" opacity="0.85"/>
  <text x="300" y="110" text-anchor="middle" class="funnel-label">Pre-Commit Hooks (lint-staged, Husky)</text>
  <!-- Layer 3: CI Pipeline (narrowest) -->
  <polygon points="160,130 440,130 390,165 210,165" fill="#22c55e" opacity="0.85"/>
  <text x="300" y="153" text-anchor="middle" class="funnel-label">CI Pipeline (full codebase check)</text>
  <text x="300" y="178" text-anchor="middle" class="funnel-desc">Issues caught earlier are cheaper to fix</text>
</svg>

## Rules Worth Enabling

Not all lint rules are equally valuable. Here are categories that consistently catch real problems.

### Bug Prevention

- **no-unused-vars**: Unused variables often indicate incomplete refactoring or copy-paste errors.
- **no-undef**: Referencing undefined variables is almost always a bug.
- **eqeqeq**: Requiring strict equality (`===`) prevents type coercion surprises in JavaScript.
- **no-floating-promises**: Unhandled promises silently swallow errors, one of the most common sources of hard-to-debug issues in async code.

### Security

- **no-eval**: `eval` is a security risk and almost never necessary.
- **no-implied-eval**: Catches `setTimeout("code()", 100)` patterns that behave like eval.
- Security-focused plugins like **eslint-plugin-security** flag patterns like SQL string concatenation and path traversal vulnerabilities.

### Maintainability

- **complexity**: Flags functions with too many code paths, encouraging decomposition.
- **max-depth**: Limits nesting depth, which improves readability.
- **no-duplicate-imports**: Keeps import statements clean and mergeable.

If you are working with TypeScript, pairing these rules with [TypeScript patterns that make your code safer](/code-quality/typescript-patterns-that-make-your-code-safer) creates an exceptionally strong safety net.

## Adopting Linting in an Existing Project

Introducing linting to a codebase that has never had it requires a gradual approach. Turning on strict rules across 100,000 lines of code will produce thousands of violations and demoralise the team. I have seen this attempted as a "big bang" rollout; it failed within a week because developers started disabling rules wholesale.

**Phase 1: Format everything.** Run your formatter across the entire codebase in a single commit. This is a low-risk, high-impact change that immediately improves consistency. Do this on a quiet day and communicate it clearly so teammates are not surprised by the large diff.

**Phase 2: Enable safe auto-fix rules.** Many lint rules have automatic fixers. Enable these rules and run the fixer across the codebase. Review the changes to ensure nothing was broken, then commit.

**Phase 3: Warn on remaining issues.** Enable additional rules at the warning level. These appear in the editor but do not block commits or CI. Address them gradually as you work in each area of the codebase.

**Phase 4: Enforce.** Once the warning count is manageable, promote warnings to errors and enable CI enforcement. From this point forward, the codebase only gets cleaner.

The <a href="https://eslint.org/docs/latest/use/getting-started" target="_blank" rel="noopener noreferrer">ESLint getting started guide ↗</a> walks through the initial configuration in detail. For Python projects, the <a href="https://docs.astral.sh/ruff/" target="_blank" rel="noopener noreferrer">Ruff documentation ↗</a> covers the equivalent setup with a focus on speed and simplicity.

## Measuring Impact

After adoption, you should see measurable improvements:

- **Fewer style comments in [code reviews](/collaboration/code-reviews-that-dont-waste-time)**, freeing reviewers to focus on logic and architecture.
- **Fewer bugs in categories covered by lint rules**, particularly around null handling, async errors, and type safety.
- **Faster onboarding** for new team members, who get immediate feedback on conventions without needing to memorise a style guide.
- **More consistent code** across the entire codebase, regardless of when it was written or who wrote it.

These tools pay for their setup cost within weeks. The ongoing return is a codebase that maintains its quality automatically, even as the team grows and changes. For further reading on maintaining code quality over time, see our guide to [technical debt: when to fix it and when to leave it](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it).
