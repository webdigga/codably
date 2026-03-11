---
title: "VS Code Extensions That Will Change How You Code"
description: "Discover the best VS Code extensions for developer productivity, from AI assistants to Git tools, linters, and debuggers."
publishDate: "2026-02-16"
author: "gareth-clubb"
category: "tools-tech"
tags: ["vscode", "developer-tools", "productivity", "extensions", "ide"]
featured: false
draft: false
faqs:
  - question: "How many VS Code extensions should I install?"
    answer: "Keep it lean. Each extension adds to startup time and memory usage. Aim for 15 to 25 carefully chosen extensions rather than installing everything that looks useful. Regularly audit your extensions and disable or uninstall ones you are not actively using."
  - question: "Do VS Code extensions slow down the editor?"
    answer: "They can. Extensions that run continuously, such as linters and formatters, have the most impact. VS Code's built-in Extension Bisect feature helps identify which extension is causing performance issues. You can also check the startup time contribution of each extension in the developer tools."
  - question: "Are VS Code extensions safe to install?"
    answer: "Most extensions from the official marketplace are safe, but exercise caution. Check the publisher, download count, and recent reviews before installing. Extensions have access to your filesystem, so avoid installing obscure extensions with very low download counts or no verified publisher."
  - question: "Can I sync my VS Code extensions across machines?"
    answer: "Yes. VS Code's built-in Settings Sync feature synchronises your extensions, settings, keybindings, and snippets across all your machines using your GitHub or Microsoft account. Enable it from the accounts menu in the bottom-left corner."
  - question: "What is the difference between VS Code and VS Code Insiders?"
    answer: "VS Code Insiders is the pre-release version that gets new features and bug fixes before the stable release. It can run alongside the stable version. Use it if you want early access to new features, but be aware that it may occasionally have bugs."
primaryKeyword: "VS Code extensions"
---

VS Code dominates the editor landscape for good reason. It is fast, extensible, and free. According to the <a href="https://survey.stackoverflow.co/2025/" target="_blank" rel="noopener noreferrer">Stack Overflow Developer Survey ↗</a>, VS Code remains the most popular development environment by a significant margin. But the real power of VS Code lies in its extension ecosystem. The right set of extensions can transform it from a competent text editor into a development environment that rivals any full IDE.

After years of experimenting with hundreds of extensions, here are the ones that have genuinely changed how I work. No novelty picks or gimmicks; just tools that save meaningful time every day.

## Extension Categories at a Glance

| Category | Top Picks | Primary Benefit |
|---|---|---|
| Productivity | Error Lens, GitLens, Todo Tree, Project Manager | Faster feedback loops and navigation |
| Code Quality | ESLint + Prettier, SonarLint | Consistent style and fewer bugs |
| Navigation | Bookmarks, Path Intellisense | Quicker movement through large codebases |
| API Development | Thunder Client, REST Client | Test APIs without leaving the editor |
| Frontend | Tailwind CSS IntelliSense | Framework-aware autocomplete |
| Testing | Test Explorer UI | Unified test discovery and execution |
| Misc | Code Spell Checker | Catches typos before code review |

## Essential Productivity Extensions

### Error Lens

Error Lens displays diagnostic messages inline, right next to the code that triggered them. Instead of hovering over a red squiggly line or checking the Problems panel, you see the error message immediately as you type.

This sounds like a small improvement, but it changes your workflow significantly. You catch typos, type errors, and lint violations the moment they happen. The feedback loop between writing code and fixing mistakes shrinks to nearly zero. In my experience, this single extension has saved me more time than any other.

### GitLens

GitLens supercharges VS Code's built-in Git support. The most useful feature is inline blame annotations: you can see who last modified each line, when they changed it, and the commit message, all without leaving your editor.

Beyond blame, GitLens provides a rich commit history viewer, file history, comparison tools, and the ability to browse any point in your repository's history. When you need to understand why a piece of code exists or who to ask about it, GitLens answers those questions instantly. It pairs brilliantly with a disciplined [Git workflow](/workflows/git-workflows-that-scale-with-your-team).

### Todo Tree

Todo Tree scans your codebase for `TODO`, `FIXME`, `HACK`, and other comment tags, then displays them in a tree view in the sidebar. You can customise the tags, colours, and icons to match your workflow.

This turns scattered code comments into an actionable list. During a refactoring session, I will tag things I want to come back to with `TODO` and use Todo Tree to work through them systematically.

### Project Manager

If you work across multiple projects, Project Manager lets you save and switch between them instantly. No more using File > Open Folder and navigating to the right directory. Define your projects once, and switch with a single keyboard shortcut.

## Code Quality Extensions

### ESLint and Prettier (Working Together)

Most JavaScript and TypeScript developers already have these installed, but configuring them to work together properly is where many go wrong.

Install both extensions, then configure Prettier as your default formatter and ESLint for code quality rules only. In your VS Code settings, enable format on save:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

This setup formats your code with Prettier and fixes ESLint issues every time you save. You never think about formatting again. For a deeper look at automated code quality, see [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters).

### SonarLint

SonarLint analyses your code for bugs, vulnerabilities, and code smells as you write. It covers JavaScript, TypeScript, Python, Java, and several other languages. Think of it as a more opinionated linter that catches issues traditional linters miss, such as cognitive complexity, security vulnerabilities, and potential null pointer exceptions.

The findings are sometimes noisy, but the security and bug detection rules alone make it worth installing.

## Navigation and Search

### Bookmarks

Bookmarks lets you mark lines of code and jump between them quickly. When you are exploring an unfamiliar codebase or tracking a complex flow across multiple files, drop bookmarks at key points and navigate between them with keyboard shortcuts.

This is simpler than most code navigation tools, and that simplicity is its strength. No configuration, no learning curve; just mark a line and jump to it later.

### Path Intellisense

Path Intellisense autocompletes file paths as you type them in import statements, require calls, and HTML attributes. It sounds basic, but getting instant path completion eliminates a surprising number of import errors and saves constant trips to the file explorer.

## Language-Specific Extensions

### Thunder Client

Thunder Client is a REST API client built into VS Code. If you are tired of switching between your editor and Postman or Insomnia, Thunder Client keeps your API testing in the same window as your code.

It supports collections, environment variables, authentication, and request chaining. For most API development workflows, it replaces a standalone tool entirely. I have found it particularly useful when working on [API design](/backend/api-design-principles-every-developer-should-know), as testing endpoints becomes seamless.

### REST Client

An alternative to Thunder Client, REST Client lets you write HTTP requests directly in `.http` files and execute them from the editor. The appeal is that your API requests become version-controlled files that live alongside your code.

```http
### Get all users
GET http://localhost:3000/api/users
Content-Type: application/json

### Create a user
POST http://localhost:3000/api/users
Content-Type: application/json

{
  "name": "Alice",
  "email": "alice@example.com"
}
```

Click "Send Request" above any block, and the response appears in a split panel. Simple and effective.

### Tailwind CSS IntelliSense

If you use Tailwind CSS, this extension is essential. It provides autocomplete for Tailwind classes, shows the actual CSS each class generates on hover, and highlights invalid class names. It also supports custom Tailwind configurations, so your autocomplete matches your project's setup.

## Debugging and Testing

### Test Explorer UI

Test Explorer UI provides a unified interface for discovering and running tests across different frameworks. It integrates with adapters for Jest, Mocha, Pytest, and many others. You can run individual tests, view results inline, and debug failing tests directly from the sidebar. If you are looking to improve your testing practices, it complements the ideas in [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help).

### Code Spell Checker

Typos in variable names, comments, and strings are embarrassing in code reviews and occasionally cause real bugs. Code Spell Checker catches them as you type, with support for camelCase, snake_case, and other programming conventions.

You can add project-specific dictionaries for domain terms, and it is smart enough to handle most programming terminology without false positives.

<svg viewBox="0 0 650 280" xmlns="http://www.w3.org/2000/svg" aria-label="Horizontal bar chart showing estimated daily time saved by category of VS Code extension, based on the author's experience.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="650" height="280" fill="#f8fafc" rx="8"/>
  <text x="325" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Estimated Daily Time Saved by Extension Category</text>
  <!-- Axis -->
  <line x1="200" y1="50" x2="200" y2="235" stroke="#cbd5e1" stroke-width="1"/>
  <!-- Bars -->
  <!-- Code Quality -->
  <text x="190" y="75" text-anchor="end" font-size="12" fill="#334155">Code Quality</text>
  <rect x="205" y="60" width="340" height="24" rx="4" fill="#3b82f6" opacity="0.85"/>
  <text x="555" y="77" font-size="11" fill="#64748b">~30 min</text>
  <!-- Git/VCS -->
  <text x="190" y="110" text-anchor="end" font-size="12" fill="#334155">Git / VCS</text>
  <rect x="205" y="95" width="280" height="24" rx="4" fill="#22c55e" opacity="0.85"/>
  <text x="495" y="112" font-size="11" fill="#64748b">~25 min</text>
  <!-- Navigation -->
  <text x="190" y="145" text-anchor="end" font-size="12" fill="#334155">Navigation</text>
  <rect x="205" y="130" width="220" height="24" rx="4" fill="#f59e0b" opacity="0.85"/>
  <text x="435" y="147" font-size="11" fill="#64748b">~20 min</text>
  <!-- API Testing -->
  <text x="190" y="180" text-anchor="end" font-size="12" fill="#334155">API Testing</text>
  <rect x="205" y="165" width="170" height="24" rx="4" fill="#8b5cf6" opacity="0.85"/>
  <text x="385" y="182" font-size="11" fill="#64748b">~15 min</text>
  <!-- Debugging -->
  <text x="190" y="215" text-anchor="end" font-size="12" fill="#334155">Debugging</text>
  <rect x="205" y="200" width="115" height="24" rx="4" fill="#ef4444" opacity="0.85"/>
  <text x="330" y="217" font-size="11" fill="#64748b">~10 min</text>
  <!-- Footer -->
  <text x="325" y="260" text-anchor="middle" font-size="10" fill="#94a3b8">Based on author's estimates across typical development workflows</text>
</svg>

## Configuring Your Setup

### Workspace-Specific Settings

VS Code supports workspace-level settings that override your global preferences. Create a `.vscode/settings.json` file in your project root to define project-specific formatter configurations, linter rules, and editor preferences.

This is particularly useful when you work across projects with different coding standards. Your React project can use Prettier with single quotes while your Python project uses Black with its own conventions.

### Recommended Extensions File

Create a `.vscode/extensions.json` file in your repository to recommend extensions to your team:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "eamodio.gitlens",
    "usernamehw.errorlens"
  ]
}
```

When a team member opens the project, VS Code will suggest installing these extensions. This standardises tooling across the team without forcing anyone to use a specific setup.

### Keyboard Shortcuts That Complement Extensions

Extensions become truly powerful when paired with keyboard shortcuts. A few worth memorising:

- `Ctrl+Shift+P` (Command Palette): access any extension's commands
- `Ctrl+P` (Quick Open): navigate to any file instantly
- `Ctrl+Shift+F`: search across all files
- `Ctrl+\``: toggle the integrated terminal
- `Ctrl+B`: toggle the sidebar

For more on optimising your terminal workflow, see [terminal tools every developer should know](/tools-tech/terminal-tools-every-developer-should-know).

## Conclusion

The best VS Code setup is the one you actively maintain. Install extensions deliberately, configure them properly, and remove the ones you are not using. A lean, well-configured editor is faster and more productive than one bloated with extensions you installed six months ago and forgot about.

Start with the essentials listed here, then add more as your workflow demands. The goal is not to have the most extensions; it is to have the right ones. Paired with a well-managed <a href="https://code.visualstudio.com/docs/getstarted/settings" target="_blank" rel="noopener noreferrer">VS Code settings configuration ↗</a>, these extensions will make a measurable difference to your daily output.
