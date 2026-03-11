---
title: "Managing Dotfiles Like a Pro"
description: "Learn how to manage dotfiles like a pro with version control, symlinks, and automation for a portable dev environment."
publishDate: "2026-01-25"
author: "david-white"
category: "tools-tech"
tags: ["dotfiles", "developer-tools", "terminal", "configuration", "productivity"]
featured: false
draft: false
faqs:
  - question: "What are dotfiles?"
    answer: "Dotfiles are configuration files on Unix-like systems that start with a dot (period), such as .bashrc, .gitconfig, and .vimrc. The dot prefix makes them hidden by default in file managers and directory listings. They control the behaviour of your shell, editor, git, and other developer tools."
  - question: "Should I store dotfiles in a public GitHub repository?"
    answer: "Public repositories are fine for most dotfiles, but never commit secrets, API keys, SSH private keys, or tokens. Use a separate mechanism for sensitive values, such as environment variables loaded from a file excluded via .gitignore, or a secrets manager."
  - question: "What is the best way to manage dotfiles?"
    answer: "The most common approach is a dedicated Git repository with a bootstrap script that creates symbolic links from the repo to the expected locations in your home directory. Tools like GNU Stow, chezmoi, and yadm simplify this process."
  - question: "How do I handle dotfiles that differ between machines?"
    answer: "Use conditional logic in your shell configuration to detect the OS or hostname and apply machine-specific settings. Alternatively, tools like chezmoi support templates that generate different configurations based on the machine's properties."
  - question: "What dotfiles should every developer manage?"
    answer: "At minimum, manage your shell configuration (.bashrc or .zshrc), Git configuration (.gitconfig), editor configuration (VS Code settings.json, .vimrc, etc.), and SSH configuration (.ssh/config). These are the files that have the biggest impact on your daily workflow."
primaryKeyword: "managing dotfiles"
---

Every developer I know has spent an afternoon setting up a new machine, only to realise they cannot remember how they configured their shell, what Git aliases they relied on, or which Vim plugins made their editor actually usable. Then they do it again six months later when they get a new laptop.

Managing your dotfiles properly solves this problem permanently. I have maintained my own dotfiles repository for over eight years now, and a well-maintained dotfiles repository means you can go from a fresh machine to a fully configured development environment in minutes, not hours.

## What Makes Dotfiles Worth Managing

Your dotfiles represent years of accumulated preferences, shortcuts, and optimisations. They are the difference between a generic terminal and one that feels like yours. Here are the files that matter most:

**Shell configuration** (`.bashrc`, `.zshrc`, `.bash_profile`): Your aliases, functions, PATH modifications, prompt customisation, and shell options. This is where most of your productivity shortcuts live.

**Git configuration** (`.gitconfig`): Your identity, aliases, diff and merge tool preferences, default branch name, and signing configuration. A well-configured `.gitconfig` saves minutes every day. Good [commit message habits](/workflows/the-art-of-writing-good-commit-messages) pair well with the right Git aliases.

**Editor configuration** (`.vimrc`, VS Code `settings.json`): Keybindings, formatting rules, plugin lists, and theme preferences. If you use VS Code, our guide to [VS Code extensions that will change how you code](/tools-tech/vscode-extensions-that-will-change-how-you-code) covers some essentials worth including in your configuration.

**SSH configuration** (`.ssh/config`): Host aliases, jump hosts, key specifications, and connection options that save you from typing long SSH commands.

**Terminal emulator configuration** (`.tmux.conf`, `.alacritty.yml`): Window management, keybindings, colours, and fonts.

## Dotfiles Management Tools Compared

| Tool | Approach | Templates | Secrets Management | Learning Curve | Best For |
|------|----------|-----------|-------------------|----------------|----------|
| GNU Stow | Symlink farm manager | No | No | Low | Simple setups, Unix purists |
| chezmoi | Dedicated dotfiles manager | Yes | Yes (1Password, Bitwarden) | Medium | Complex, multi-machine setups |
| yadm | Git wrapper | Yes (Jinja2) | Yes (GPG encryption) | Low | Git-comfortable developers |
| Bare Git repo | Raw Git in home directory | No | No | Medium | Minimalists, no extra tools |
| Ansible | Full config management | Yes (Jinja2) | Yes (Ansible Vault) | High | System-wide provisioning |

## Setting Up a Dotfiles Repository

The core idea is simple: store your dotfiles in a Git repository and create symbolic links from the repository to the locations where your tools expect them.

### The Basic Approach

Create a repository and move your dotfiles into it:

```bash
mkdir ~/dotfiles
cd ~/dotfiles
git init

# Move files into the repo
mv ~/.gitconfig ~/dotfiles/gitconfig
mv ~/.zshrc ~/dotfiles/zshrc

# Create symlinks back to the expected locations
ln -sf ~/dotfiles/gitconfig ~/.gitconfig
ln -sf ~/dotfiles/zshrc ~/.zshrc
```

This works, but managing symlinks manually becomes tedious as your collection grows.

### Using GNU Stow

<a href="https://www.gnu.org/software/stow/" target="_blank" rel="noopener noreferrer">GNU Stow ↗</a> automates symlink management elegantly. It treats each subdirectory in your dotfiles repo as a "package" and creates symlinks that mirror the directory structure.

```
~/dotfiles/
  git/
    .gitconfig
  zsh/
    .zshrc
    .zprofile
  vim/
    .vimrc
    .vim/
      colors/
      plugin/
  tmux/
    .tmux.conf
```

To install all your git dotfiles:

```bash
cd ~/dotfiles
stow git    # Creates ~/.gitconfig → ~/dotfiles/git/.gitconfig
stow zsh    # Creates ~/.zshrc → ~/dotfiles/zsh/.zshrc
stow vim    # Creates ~/.vimrc → ~/dotfiles/vim/.vimrc (and subdirectories)
```

Stow handles nested directories correctly and can unstow (remove symlinks) just as easily.

### Using Chezmoi

For more complex setups, <a href="https://www.chezmoi.io/" target="_blank" rel="noopener noreferrer">chezmoi ↗</a> is purpose-built for dotfiles management. It supports templates, secrets management, and machine-specific configuration out of the box.

```bash
chezmoi init
chezmoi add ~/.zshrc
chezmoi add ~/.gitconfig

# Edit a managed file
chezmoi edit ~/.zshrc

# Apply changes
chezmoi apply
```

Chezmoi's templating is particularly useful for files that need to differ between machines:

```
[user]
  name = Gareth Clubb
  email = {{ if eq .chezmoi.hostname "work-laptop" }}gareth@company.com{{ else }}gareth@personal.com{{ end }}
```

## Writing a Bootstrap Script

A bootstrap script automates the entire setup process. When you get a new machine, you clone your repo and run one command. In my experience, the time you invest writing a solid bootstrap script pays for itself many times over.

```bash
#!/bin/bash
set -euo pipefail

DOTFILES_DIR="$HOME/dotfiles"

# Install essential packages
if [[ "$(uname)" == "Darwin" ]]; then
  # macOS
  if ! command -v brew &>/dev/null; then
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
  fi
  brew bundle --file="$DOTFILES_DIR/Brewfile"
elif [[ -f /etc/debian_version ]]; then
  # Debian/Ubuntu
  sudo apt update
  sudo apt install -y git stow tmux neovim ripgrep fzf
fi

# Create symlinks
cd "$DOTFILES_DIR"
for dir in git zsh vim tmux; do
  stow -R "$dir"
done

echo "Dotfiles installed successfully."
```

### Brewfile for macOS

If you use macOS, a `Brewfile` declaratively lists all your packages:

```ruby
# CLI tools
brew "git"
brew "tmux"
brew "neovim"
brew "ripgrep"
brew "fzf"
brew "jq"
brew "gh"

# Applications
cask "alacritty"
cask "visual-studio-code"
cask "firefox"
```

Run `brew bundle` to install everything. Run `brew bundle dump` to generate a Brewfile from your currently installed packages.

## Organising Your Shell Configuration

As your shell configuration grows, a single `.zshrc` file becomes unwieldy. Split it into focused, sourced files:

```
zsh/
  .zshrc           # Main file that sources everything else
  .zsh/
    aliases.zsh    # All aliases
    functions.zsh  # Custom functions
    exports.zsh    # Environment variables
    path.zsh       # PATH modifications
    prompt.zsh     # Prompt configuration
    local.zsh      # Machine-specific (gitignored)
```

Your `.zshrc` simply sources each file:

```bash
for config_file in ~/.zsh/*.zsh; do
  source "$config_file"
done
```

This structure makes it easy to find and modify specific configurations without scrolling through a massive file. For more [terminal tools that boost your productivity](/tools-tech/terminal-tools-every-developer-should-know), a well-organised shell configuration is the foundation.

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing a dotfiles repository structure with symlinks pointing from the repository to home directory locations">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="350" y="25" text-anchor="middle" font-size="15" font-weight="bold" fill="#334155">Dotfiles Repository: Symlink Architecture</text>
  <!-- Repository box -->
  <rect x="40" y="50" width="260" height="240" rx="8" fill="#f8fafc" stroke="#3b82f6" stroke-width="2"/>
  <text x="170" y="75" text-anchor="middle" font-size="13" font-weight="600" fill="#3b82f6">~/dotfiles/ (Git repo)</text>
  <!-- Files in repo -->
  <rect x="60" y="90" width="220" height="28" rx="4" fill="#dbeafe"/>
  <text x="70" y="109" font-size="12" fill="#334155">git/.gitconfig</text>
  <rect x="60" y="125" width="220" height="28" rx="4" fill="#dbeafe"/>
  <text x="70" y="144" font-size="12" fill="#334155">zsh/.zshrc</text>
  <rect x="60" y="160" width="220" height="28" rx="4" fill="#dbeafe"/>
  <text x="70" y="179" font-size="12" fill="#334155">vim/.vimrc</text>
  <rect x="60" y="195" width="220" height="28" rx="4" fill="#dbeafe"/>
  <text x="70" y="214" font-size="12" fill="#334155">tmux/.tmux.conf</text>
  <rect x="60" y="230" width="220" height="28" rx="4" fill="#fef9c3" stroke="#eab308" stroke-width="1"/>
  <text x="70" y="249" font-size="12" fill="#92400e">bootstrap.sh</text>
  <!-- Home directory box -->
  <rect x="420" y="50" width="240" height="240" rx="8" fill="#f8fafc" stroke="#22c55e" stroke-width="2"/>
  <text x="540" y="75" text-anchor="middle" font-size="13" font-weight="600" fill="#22c55e">~/ (Home directory)</text>
  <!-- Symlinks in home -->
  <rect x="440" y="90" width="200" height="28" rx="4" fill="#dcfce7"/>
  <text x="450" y="109" font-size="12" fill="#334155">~/.gitconfig →</text>
  <rect x="440" y="125" width="200" height="28" rx="4" fill="#dcfce7"/>
  <text x="450" y="144" font-size="12" fill="#334155">~/.zshrc →</text>
  <rect x="440" y="160" width="200" height="28" rx="4" fill="#dcfce7"/>
  <text x="450" y="179" font-size="12" fill="#334155">~/.vimrc →</text>
  <rect x="440" y="195" width="200" height="28" rx="4" fill="#dcfce7"/>
  <text x="450" y="214" font-size="12" fill="#334155">~/.tmux.conf →</text>
  <!-- Arrows (symlinks) -->
  <line x1="440" y1="104" x2="280" y2="104" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5" marker-end="url(#arrowLeft)"/>
  <line x1="440" y1="139" x2="280" y2="139" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5" marker-end="url(#arrowLeft)"/>
  <line x1="440" y1="174" x2="280" y2="174" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5" marker-end="url(#arrowLeft)"/>
  <line x1="440" y1="209" x2="280" y2="209" stroke="#64748b" stroke-width="1.5" stroke-dasharray="5" marker-end="url(#arrowLeft)"/>
  <!-- Label -->
  <text x="360" y="145" text-anchor="middle" font-size="10" fill="#64748b">symlinks</text>
  <!-- Arrow marker -->
  <defs>
    <marker id="arrowLeft" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-auto">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b"/>
    </marker>
  </defs>
</svg>

## Handling Secrets Safely

Never commit secrets to your dotfiles repository. This includes API keys, tokens, passwords, and SSH private keys.

**Environment variables.** Store secrets in a file like `~/.env.local` that is excluded from your repository via `.gitignore`. Source it from your shell configuration:

```bash
[[ -f ~/.env.local ]] && source ~/.env.local
```

**SSH keys.** Keep your `.ssh/config` in the repository (it contains no secrets), but never commit private keys. Document which keys need to be generated or transferred as part of your bootstrap process.

**Git credential helpers.** Use your OS's credential manager (`osxkeychain` on macOS, `libsecret` on Linux) rather than storing credentials in your `.gitconfig`.

## Essential Git Configuration

A few `.gitconfig` entries that pay for themselves daily:

```ini
[alias]
  s = status --short
  lg = log --oneline --graph --decorate -20
  amend = commit --amend --no-edit
  undo = reset HEAD~1 --mixed

[pull]
  rebase = true

[init]
  defaultBranch = main

[diff]
  algorithm = histogram
  colorMoved = default

[merge]
  conflictstyle = zdiff3

[rerere]
  enabled = true
```

The `rerere` setting is especially valuable: it records how you resolved merge conflicts and automatically applies the same resolution if the same conflict appears again. If you are working with a team, this pairs well with a solid Git workflow for smoother collaboration.

## Keeping Dotfiles in Sync

If you use multiple machines, keep your dotfiles synchronised:

1. Push changes from your primary machine regularly
2. Pull on other machines before starting work
3. Use the bootstrap script's symlink step (`stow -R`) to apply any structural changes

Consider adding a shell function that automates the sync:

```bash
dotfiles-sync() {
  cd ~/dotfiles
  git pull --rebase
  stow -R git zsh vim tmux
  echo "Dotfiles synced."
  cd -
}
```

## Getting Started Today

You do not need to do everything at once. Start with the files that matter most to you, likely your shell configuration and `.gitconfig`. Move them into a repository, create symlinks, and push to GitHub.

Over time, add more files as you customise your environment. The investment compounds: every configuration change you make is preserved, documented, and portable. If you enjoy [automating your development environment](/workflows/how-to-automate-your-development-environment), dotfiles management is the natural starting point. Six months from now, when you get a new machine, you will be productive in minutes instead of spending another afternoon trying to remember how you had things set up.
