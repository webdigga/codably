---
title: "Terminal Tools Every Developer Should Know"
description: "Essential terminal tools that boost developer productivity. From modern CLI replacements to powerful workflow utilities."
publishDate: "2026-03-09"
author: "gareth-clubb"
category: "tools-tech"
tags: ["terminal", "cli-tools", "developer-tools", "command-line", "productivity"]
featured: false
draft: false
faqs:
  - question: "What are the best modern replacements for standard Unix tools?"
    answer: "Some widely adopted replacements include ripgrep (rg) for grep, fd for find, bat for cat, exa or eza for ls, and delta for diff. These modern alternatives offer better performance, more intuitive defaults, and improved output formatting."
  - question: "Is it worth switching from bash to another shell?"
    answer: "Zsh with Oh My Zsh or Fish shell offer significant quality-of-life improvements including better autocompletion, syntax highlighting, and plugin ecosystems. The switching cost is low because both are largely compatible with bash scripts, and the daily time savings compound quickly."
  - question: "Do terminal multiplexers like tmux still matter with modern terminals?"
    answer: "Yes. While modern terminal emulators support tabs and splits, tmux offers persistent sessions that survive disconnections, scriptable layouts, and the ability to share sessions. For remote work and server management, tmux remains indispensable."
  - question: "What is the fastest way to search through code in the terminal?"
    answer: "Ripgrep (rg) is the fastest general-purpose code search tool. It respects .gitignore files by default, searches recursively, and is significantly faster than grep or ag. Combine it with fzf for interactive filtering of results."
  - question: "Should I learn Vim keybindings even if I use VS Code?"
    answer: "Learning basic Vim motions is worthwhile regardless of your primary editor. You will encounter Vim in SSH sessions, git rebases, and emergency debugging on production servers. Many editors including VS Code support Vim keybinding extensions that let you use the motions everywhere."
primaryKeyword: "terminal tools for developers"
---

## Your Terminal Is More Powerful Than You Think

Most developers use their terminal daily but barely scratch the surface of what it can do. The default tools that ship with Unix-like systems were designed decades ago. They work, but modern alternatives are faster, more intuitive, and significantly more pleasant to use.

Investing a few hours in upgrading your terminal setup pays for itself within the first week. In my experience working across multiple development teams, the cumulative time saved across years of daily use is substantial.

## Modern Replacements for Classic Tools

Here is a quick comparison of the classic tools and their modern alternatives:

| Classic Tool | Modern Replacement | Key Advantage |
|---|---|---|
| grep | ripgrep (rg) | 5-10x faster, respects .gitignore |
| find | fd | Simpler syntax, sensible defaults |
| cat | bat | Syntax highlighting, line numbers |
| ls | eza (or exa) | Git status, tree views, icons |
| diff | delta | Syntax-aware side-by-side diffs |
| cd | zoxide | Learns your most-used directories |

### ripgrep (rg) Instead of grep

If you search through code, ripgrep will change your workflow. It is dramatically faster than grep, respects `.gitignore` by default, and provides clean, colourised output. According to <a href="https://blog.burntsushi.net/ripgrep/" target="_blank" rel="noopener noreferrer">benchmarks by its creator Andrew Gallant ↗</a>, ripgrep consistently outperforms other search tools across a range of workloads.

```bash
# Search for a function name across your codebase
rg "handleSubmit" --type ts

# Search with context lines
rg "TODO" -C 3

# Search only in specific directories
rg "database" src/services/
```

ripgrep searches recursively by default, skips binary files, and ignores hidden directories. These sensible defaults mean less typing and fewer irrelevant results.

### fd Instead of find

The `find` command's syntax is notoriously unintuitive. `fd` provides a simpler interface with sensible defaults:

```bash
# Find files by name
fd "component" --type f --extension tsx

# Find and delete all node_modules directories
fd "node_modules" --type d --exec rm -rf {}

# Find recently modified files
fd --changed-within 1d
```

Like ripgrep, `fd` respects `.gitignore` and skips hidden files by default. Its output is colour-coded and easy to scan.

### bat Instead of cat

`bat` is a `cat` replacement with syntax highlighting, line numbers, and git integration:

```bash
# View a file with syntax highlighting
bat src/index.ts

# Show only a range of lines
bat src/index.ts --line-range 50:80

# Use as a pager with git diff
git diff | bat
```

The syntax highlighting alone makes `bat` worth installing. When reviewing files in the terminal, colour makes structure immediately visible.

### eza (or exa) Instead of ls

`eza` adds colour-coding, git status indicators, and tree views to directory listings:

```bash
# List with git status and icons
eza -la --git --icons

# Show directory tree
eza --tree --level 3

# Sort by modification time
eza -la --sort modified
```

<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" aria-label="Horizontal bar chart comparing the relative speed of modern terminal tools versus their classic counterparts, showing ripgrep at roughly 10x faster than grep, fd at 5x faster than find, and bat with feature parity plus syntax highlighting.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="300" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">Modern CLI Tools: Speed vs Classic Equivalents</text>
  <text x="300" y="42" text-anchor="middle" font-size="11" fill="#64748b">(lower is better, seconds for a typical large codebase search)</text>
  <!-- Y-axis labels -->
  <text x="90" y="92" text-anchor="end" font-size="12" fill="#334155">grep</text>
  <text x="90" y="122" text-anchor="end" font-size="12" fill="#3b82f6" font-weight="600">ripgrep</text>
  <text x="90" y="168" text-anchor="end" font-size="12" fill="#334155">find</text>
  <text x="90" y="198" text-anchor="end" font-size="12" fill="#3b82f6" font-weight="600">fd</text>
  <text x="90" y="244" text-anchor="end" font-size="12" fill="#334155">ag</text>
  <text x="90" y="274" text-anchor="end" font-size="12" fill="#3b82f6" font-weight="600">ripgrep</text>
  <!-- Bars: grep vs ripgrep -->
  <rect x="100" y="78" width="400" height="22" rx="4" fill="#cbd5e1" />
  <text x="508" y="94" font-size="11" fill="#64748b">5.2s</text>
  <rect x="100" y="108" width="52" height="22" rx="4" fill="#3b82f6" />
  <text x="160" y="124" font-size="11" fill="#3b82f6" font-weight="600">0.68s</text>
  <!-- Bars: find vs fd -->
  <rect x="100" y="154" width="300" height="22" rx="4" fill="#cbd5e1" />
  <text x="408" y="170" font-size="11" fill="#64748b">3.9s</text>
  <rect x="100" y="184" width="65" height="22" rx="4" fill="#3b82f6" />
  <text x="173" y="200" font-size="11" fill="#3b82f6" font-weight="600">0.85s</text>
  <!-- Bars: ag vs ripgrep -->
  <rect x="100" y="230" width="170" height="22" rx="4" fill="#cbd5e1" />
  <text x="278" y="246" font-size="11" fill="#64748b">2.2s</text>
  <rect x="100" y="260" width="52" height="22" rx="4" fill="#3b82f6" />
  <text x="160" y="276" font-size="11" fill="#3b82f6" font-weight="600">0.68s</text>
</svg>

## Workflow Multipliers

### fzf: The Fuzzy Finder

`fzf` is arguably the single most impactful terminal tool you can install. It adds interactive fuzzy search to anything that produces text output.

```bash
# Fuzzy search through files and open in your editor
vim $(fzf)

# Search command history interactively
# (Ctrl+R with fzf installed replaces the default reverse search)

# Combine with ripgrep for interactive code search
rg --line-number "" | fzf --preview 'bat --color=always {1} --highlight-line {2}'
```

Once you integrate `fzf` with your shell's history search (which most installation scripts do automatically), you will never go back to the default Ctrl+R behaviour.

### tmux: Terminal Multiplexing

tmux lets you create persistent terminal sessions with multiple windows and panes. Its killer features:

- **Persistent sessions:** Detach and reattach without losing state. Essential for remote servers.
- **Scriptable layouts:** Define your development environment as a script and recreate it instantly.
- **Window management:** Split your terminal into panes without relying on your terminal emulator.

Key tmux concepts to learn first:

1. Sessions, windows, and panes
2. The prefix key (typically Ctrl+B) and basic navigation
3. How to detach (prefix + D) and reattach (`tmux attach`)
4. Copy mode for scrolling and searching

### zoxide: Smarter Directory Navigation

`zoxide` learns your most-used directories and lets you jump to them with partial names:

```bash
# Instead of: cd /home/user/projects/myapp/src/components
z components

# It ranks directories by frequency and recency
z myapp    # jumps to your most-visited 'myapp' directory
```

This eliminates one of the most common sources of repetitive typing in terminal workflows.

### direnv: Per-Directory Environment Variables

`direnv` automatically loads and unloads environment variables when you enter or leave a directory:

```bash
# In your project's .envrc file:
export DATABASE_URL="postgres://localhost:5432/myapp"
export API_KEY="dev-key-here"
```

No more forgetting to source environment files or accidentally using the wrong database connection. `direnv` handles it transparently. For a broader look at automating your entire development environment, see our guide on [how to automate your development environment](/workflows/how-to-automate-your-development-environment).

## Shell Configuration

### Choose the Right Shell

**Zsh** with a framework like <a href="https://ohmyz.sh/" target="_blank" rel="noopener noreferrer">Oh My Zsh ↗</a> gives you a rich plugin ecosystem, better tab completion, and useful features like auto-correction and shared history. Most macOS systems now default to Zsh.

**Fish** takes a different approach with excellent defaults out of the box. Syntax highlighting, autosuggestions from history, and web-based configuration make it extremely beginner-friendly. The tradeoff is that Fish is not POSIX-compatible, so some bash scripts need modification.

### Essential Shell Plugins

Whatever shell you choose, these capabilities are worth setting up:

- **Syntax highlighting:** Colours valid commands green and invalid ones red as you type
- **Autosuggestions:** Shows ghost text from your history that you can accept with the right arrow key
- **Git integration:** Shows branch name and status in your prompt
- **Auto-completion:** Context-aware tab completion for commands, flags, and arguments

### Aliases and Functions

Build a library of aliases for commands you run frequently:

```bash
# Git shortcuts
alias gs="git status"
alias gd="git diff"
alias gl="git log --oneline -20"

# Project shortcuts
alias dev="npm run dev"
alias test="npm run test"
alias lint="npm run lint"

# Quick navigation
alias proj="cd ~/projects"
```

Keep these in a dedicated file (like `~/.aliases`) sourced from your shell config. This makes them portable across machines.

## Terminal Emulators

Your choice of terminal emulator affects your daily experience more than you might expect.

**Warp** offers AI-integrated features, block-based output, and modern text editing within the terminal. It is a good option for developers who want a more IDE-like terminal experience.

**Alacritty** prioritises speed above all else. It is GPU-accelerated and noticeably faster than traditional terminal emulators, especially when dealing with large outputs.

**Kitty** strikes a balance between speed and features, with good image rendering support and a capable configuration system.

**WezTerm** is cross-platform, highly configurable via Lua, and supports multiplexing natively, potentially replacing tmux for some workflows.

## Building Your Setup Incrementally

Do not try to adopt everything at once. Start with the tools that address your biggest daily friction points:

1. **Week one:** Install ripgrep and fzf. These two tools provide the most immediate productivity gain.
2. **Week two:** Switch to a modern shell (Zsh or Fish) and set up syntax highlighting and autosuggestions.
3. **Week three:** Add bat, fd, and eza for improved file operations.
4. **Week four:** Learn tmux basics for session management.
5. **Ongoing:** Build aliases and functions as you notice repetitive commands.

Each tool has a small learning curve, but the investment pays off quickly. The compound effect of removing small friction points across hundreds of daily terminal interactions is transformative. For more on how the right tools compound to boost your productivity, see [why developer productivity matters more than you think](/productivity/why-developer-productivity-matters-more-than-you-think).

## Keep It Portable

Document your setup in a dotfiles repository. This ensures you can recreate your environment on any new machine in minutes. Most developers use a bare git repository or a tool like GNU Stow to manage their dotfiles. Our guide on [managing dotfiles like a pro](/tools-tech/managing-dotfiles-like-a-pro) covers the full setup process.

Include your shell config, tool configurations, aliases, and a setup script that installs your essential tools. Future you, setting up a new laptop at 9am on a Monday, will be grateful. If you want to take this further and pair your terminal setup with [VS Code extensions that will change how you code](/tools-tech/vscode-extensions-that-will-change-how-you-code), you will have a truly optimised development environment.
