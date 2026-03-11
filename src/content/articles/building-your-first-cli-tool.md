---
title: "Building Your First CLI Tool"
description: "Learn how to build your first CLI tool with practical guidance on argument parsing, user experience, and distribution."
publishDate: "2026-02-01"
author: "gareth-clubb"
category: "tools-tech"
tags: ["cli", "tools", "node", "developer-experience"]
featured: false
draft: false
faqs:
  - question: "What language should I use to build a CLI tool?"
    answer: "It depends on your audience and distribution needs. Node.js is excellent for tools aimed at web developers (npm distribution is simple). Go produces single static binaries with no runtime dependencies, making it ideal for tools that need to work everywhere. Python is great for data-oriented tools and scripts. Rust is the best choice when performance matters. For your first CLI tool, use whatever language you are most comfortable with."
  - question: "How do I distribute a CLI tool built with Node.js?"
    answer: "Publish it to npm with a bin field in your package.json. Users install it globally with npm install -g your-tool or run it without installing using npx your-tool. For broader distribution beyond the Node.js ecosystem, consider packaging it as a standalone binary using pkg or building it with a compiled language instead."
  - question: "What is the difference between arguments, options, and flags in a CLI?"
    answer: "Arguments are positional values (e.g., mytool filename.txt). Options are named parameters that take a value (e.g., --output json or -o json). Flags are boolean options that are either present or absent (e.g., --verbose or -v). Following these conventions makes your tool intuitive to anyone who has used a command line before."
  - question: "Should my CLI tool have coloured output?"
    answer: "Colour improves readability for interactive use (highlighting errors in red, success in green). However, always respect the NO_COLOR environment variable and disable colour when output is piped to another program (i.e., when stdout is not a TTY). Libraries like chalk (Node.js) and colorama (Python) handle these edge cases for you."
  - question: "How do I handle errors gracefully in a CLI tool?"
    answer: "Print error messages to stderr (not stdout) so they do not interfere with piped output. Use meaningful exit codes: 0 for success, 1 for general errors, 2 for usage errors. Include enough context in error messages for the user to fix the problem themselves, such as which file failed and what was expected. Never print a raw stack trace to end users."
primaryKeyword: "build CLI tool"
---

There is a special satisfaction in building a command-line tool. You type a command, it does something useful, and there is no UI framework, no build step for stylesheets, and no layout to debug. Just input, logic, and output.

CLI tools are also genuinely useful. That repetitive task you do ten times a day? Automate it. That data transformation you keep doing manually? Script it. That deployment process with twelve steps? Turn it into a single command. Building CLI tools is one of the most practical skills a developer can have, and in my experience, developers who build their own tools are consistently more productive than those who do not. I built my first CLI tool to automate a tedious file-renaming workflow, and it saved me roughly 20 minutes every day for over a year.

## Anatomy of a Good CLI Tool

Before writing code, understand what makes a CLI tool pleasant to use.

### Predictable Interface

Users expect certain conventions. Long options use double hyphens (`--output`), short options use single hyphens (`-o`), and `--help` prints usage information. Following these conventions means users can start using your tool without reading the documentation.

```bash
mytool process --input data.csv --output results.json --verbose
mytool process -i data.csv -o results.json -v
```

Both invocations should do the same thing.

| Convention | Format | Example | Purpose |
|------------|--------|---------|---------|
| Long option | `--name value` | `--output json` | Self-documenting, readable |
| Short option | `-n value` | `-o json` | Quick to type |
| Flag | `--verbose` / `-v` | `--verbose` | Boolean toggle |
| Argument | positional | `mytool file.txt` | Primary input |
| Subcommand | `tool action` | `mytool process` | Groups related operations |

### Helpful Output

Good CLI tools communicate clearly. Success messages confirm what was done. Error messages explain what went wrong and suggest how to fix it. Progress indicators show that long-running operations have not stalled.

```bash
# Bad error message
Error: ENOENT

# Good error message
Error: Could not find input file "data.csv"
  Check that the file exists and the path is correct.
  Run "mytool process --help" for usage information.
```

### Composability

Unix philosophy says each tool should do one thing well and work with other tools through pipes and redirects. Your CLI tool should write normal output to stdout and errors to stderr. This allows users to chain your tool with others:

```bash
mytool list --format json | jq '.[] | .name' | sort > names.txt
```

## Choosing the Right Language

The language you choose affects distribution, performance, and your available ecosystem. Here is a practical comparison:

| Language | Binary Size | Startup Time | Distribution | Best For |
|----------|-----------|-------------|-------------|----------|
| Node.js | Requires runtime | ~100ms | npm (simple) | Web developer tools |
| Go | ~5-15MB static binary | ~5ms | Single binary download | Cross-platform tools |
| Rust | ~2-10MB static binary | ~2ms | Single binary download | Performance-critical tools |
| Python | Requires runtime | ~50ms | pip or pipx | Data tools, scripting |
| Bash | N/A (interpreted) | Instant | Copy the script | Simple automation |

For your first tool, use whatever language you know best. You can always rewrite in a compiled language later if distribution or performance becomes a concern.

## Building a CLI Tool with Node.js

Node.js is an excellent choice for CLI tools, especially if your audience is web developers. npm provides built-in distribution, and the ecosystem has mature libraries for every CLI need.

### Project Setup

Start with a new directory and initialise it:

```bash
mkdir my-cli-tool && cd my-cli-tool
npm init -y
```

Add a `bin` field to your `package.json`:

```json
{
  "name": "my-cli-tool",
  "version": "1.0.0",
  "bin": {
    "mytool": "./src/index.js"
  },
  "type": "module"
}
```

Create your entry point with the shebang line that tells the OS to use Node.js:

```javascript
#!/usr/bin/env node
// src/index.js

console.log('Hello from mytool!');
```

Make it executable and test it:

```bash
chmod +x src/index.js
npm link
mytool
```

### Argument Parsing

Do not parse `process.argv` manually. Use a library that handles the complexity for you.

**Commander** is the most popular choice, with a clean API for defining commands, options, and arguments. The <a href="https://github.com/tj/commander.js" target="_blank" rel="noopener noreferrer">Commander.js documentation ↗</a> is thorough and includes examples for every feature:

```javascript
#!/usr/bin/env node
import { program } from 'commander';

program
  .name('mytool')
  .description('A tool for processing data files')
  .version('1.0.0');

program
  .command('process')
  .description('Process a data file')
  .argument('<input>', 'Input file path')
  .option('-o, --output <path>', 'Output file path', 'output.json')
  .option('-f, --format <type>', 'Output format', 'json')
  .option('-v, --verbose', 'Enable verbose output')
  .action((input, options) => {
    if (options.verbose) {
      console.error(`Processing ${input}...`);
    }
    // Your logic here
  });

program.parse();
```

This gives you `--help` output, validation, default values, and type coercion for free.

### Interactive Prompts

For operations that need user input, **@inquirer/prompts** provides a clean interface:

```javascript
import { input, select, confirm } from '@inquirer/prompts';

const name = await input({ message: 'Project name:' });
const template = await select({
  message: 'Choose a template:',
  choices: [
    { name: 'Basic', value: 'basic' },
    { name: 'Full', value: 'full' },
  ],
});
const proceed = await confirm({ message: 'Create project?' });
```

Use prompts sparingly. If your tool is used in automation or CI pipelines, every prompt is a blocker. Always provide flag equivalents so the tool can run non-interactively. This is especially important if you plan to integrate your tool into [automated development environments](/workflows/how-to-automate-your-development-environment).

### Coloured Output

Colour makes CLI output easier to scan. **chalk** is the standard library:

```javascript
import chalk from 'chalk';

console.log(chalk.green('✓ File processed successfully'));
console.error(chalk.red('✗ Could not read input file'));
console.log(chalk.yellow('⚠ No output path specified, using default'));
```

Always respect the `NO_COLOR` environment variable. chalk does this automatically, but verify your output is legible without colour, as some users pipe output to files or use terminals that do not support ANSI colour codes. The <a href="https://no-color.org/" target="_blank" rel="noopener noreferrer">NO_COLOR standard ↗</a> explains the convention and lists tools that support it.

### Progress Indicators

For operations that take more than a second or two, show progress. **ora** provides clean spinners:

```javascript
import ora from 'ora';

const spinner = ora('Processing files...').start();

try {
  await processFiles();
  spinner.succeed('Processed 42 files');
} catch (error) {
  spinner.fail('Processing failed');
  console.error(error.message);
  process.exit(1);
}
```

For batch operations where you know the total count, a progress bar (using **cli-progress**) is more informative than a spinner.

## Error Handling and Exit Codes

Proper error handling separates a professional CLI tool from a script.

**Exit codes** communicate status to the calling environment. `0` means success. `1` means a general error. `2` means incorrect usage (wrong arguments or options). Other codes can represent specific failure modes relevant to your tool.

```javascript
process.on('uncaughtException', (error) => {
  console.error(chalk.red(`Error: ${error.message}`));
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error(chalk.red(`Error: ${reason}`));
  process.exit(1);
});
```

**Error messages** should go to stderr, not stdout. This ensures that piped output is not contaminated with error text:

```javascript
// Good: errors on stderr
console.error('Error: file not found');

// Bad: errors on stdout (breaks piping)
console.log('Error: file not found');
```

<svg viewBox="0 0 600 200" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the flow of stdout and stderr in a CLI tool, with stdout going to pipes or files and stderr going to the terminal">
  <style>
    .cli-title { font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; fill: #334155; }
    .cli-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #334155; }
    .cli-sublabel { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
    .cli-box { rx: 8; ry: 8; }
  </style>
  <text x="300" y="20" text-anchor="middle" class="cli-title">CLI Output Streams</text>
  <!-- CLI Tool box -->
  <rect x="30" y="60" width="120" height="80" class="cli-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="90" y="95" text-anchor="middle" class="cli-label">CLI Tool</text>
  <text x="90" y="115" text-anchor="middle" class="cli-sublabel">mytool process</text>
  <!-- stdout path -->
  <line x1="150" y1="80" x2="250" y2="60" stroke="#22c55e" stroke-width="2" marker-end="url(#cli-arrow-green)"/>
  <text x="200" y="55" text-anchor="middle" class="cli-sublabel" fill="#22c55e">stdout</text>
  <rect x="250" y="35" width="130" height="50" class="cli-box" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
  <text x="315" y="55" text-anchor="middle" class="cli-label">Pipe / File</text>
  <text x="315" y="72" text-anchor="middle" class="cli-sublabel">| jq, > output.txt</text>
  <!-- stderr path -->
  <line x1="150" y1="120" x2="250" y2="140" stroke="#ef4444" stroke-width="2" marker-end="url(#cli-arrow-red)"/>
  <text x="200" y="148" text-anchor="middle" class="cli-sublabel" fill="#ef4444">stderr</text>
  <rect x="250" y="115" width="130" height="50" class="cli-box" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="315" y="135" text-anchor="middle" class="cli-label">Terminal</text>
  <text x="315" y="152" text-anchor="middle" class="cli-sublabel">User sees errors</text>
  <!-- Arrows to results -->
  <line x1="380" y1="60" x2="440" y2="60" stroke="#22c55e" stroke-width="1.5" marker-end="url(#cli-arrow-green)"/>
  <rect x="440" y="35" width="130" height="50" class="cli-box" fill="#f0fdf4" stroke="#22c55e" stroke-width="1"/>
  <text x="505" y="55" text-anchor="middle" class="cli-label">Clean data</text>
  <text x="505" y="72" text-anchor="middle" class="cli-sublabel">No error noise</text>
  <defs>
    <marker id="cli-arrow-green" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#22c55e"/>
    </marker>
    <marker id="cli-arrow-red" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#ef4444"/>
    </marker>
  </defs>
</svg>

## Testing Your CLI Tool

CLI tools are surprisingly easy to test. Your core logic should be separated from the CLI interface so it can be tested as regular functions. For the CLI interface itself, test it by invoking the tool as a child process:

```javascript
import { execSync } from 'node:child_process';

const output = execSync('node src/index.js process test.csv --format json', {
  encoding: 'utf-8',
});

assert(output.includes('Processed successfully'));
```

Test your error paths too. Verify that missing required arguments produce helpful error messages and appropriate exit codes. For more on writing effective tests, see [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help). If you want to enforce quality standards in your CLI tool's codebase from the start, [setting up linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters) is a worthwhile investment.

## Distribution

### npm

Publishing to npm is the simplest distribution method for Node.js tools. Ensure your `package.json` has the correct `bin`, `name`, and `version` fields, then run `npm publish`. Users install with `npm install -g your-tool`.

### Standalone Binaries

If you want your tool to work without Node.js installed, tools like **pkg** or **vercel/pkg** can compile your Node.js application into a standalone binary for Linux, macOS, and Windows.

For truly portable distribution, consider building your tool in Go or Rust, which produce native binaries with no runtime dependencies.

### Open Source Distribution

If you plan to open-source your CLI tool, our guide on [how to contribute to open source for the first time](/open-source/how-to-contribute-to-open-source-for-the-first-time) covers setting up a project that welcomes contributions, including CI, documentation, and issue templates.

## What to Build

If you are looking for a first project, start with something you actually need. A tool that scaffolds your project's boilerplate files. A tool that checks your project for common configuration mistakes. A tool that formats and validates data files you work with regularly.

The best CLI tools solve small, specific problems that you encounter frequently. Once you have built one, you will start seeing opportunities to build more everywhere. For more on the tools and techniques that make terminal life more productive, see [terminal tools every developer should know](/tools-tech/terminal-tools-every-developer-should-know). You might also enjoy [managing dotfiles like a pro](/tools-tech/managing-dotfiles-like-a-pro), which covers how to version-control and share the configuration that makes your terminal environment truly personal.

For inspiration and best practices, the <a href="https://clig.dev/" target="_blank" rel="noopener noreferrer">Command Line Interface Guidelines ↗</a> is a comprehensive resource covering everything from argument conventions to output formatting.
