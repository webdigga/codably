---
title: "MCP Servers: A Practical Guide for Developers"
description: "Learn what MCP servers are, how they connect AI tools to your codebase, and how to build your own. A practical guide to the Model Context Protocol."
publishDate: "2026-03-28"
author: "david-white"
category: "ai-tools"
tags: ["mcp", "model context protocol", "ai tools", "developer tools", "api", "integrations"]
featured: false
draft: false
faqs:
  - question: "What is an MCP server?"
    answer: "An MCP server is a program that exposes tools, resources, and prompts to AI applications through the Model Context Protocol. It acts as a bridge between an AI assistant and an external system such as a database, API, file system, or third-party service. MCP servers can run locally on your machine or remotely on a hosted platform."
  - question: "Do I need to learn a new language to build MCP servers?"
    answer: "No. Official MCP SDKs exist for TypeScript, Python, Go, Rust, C#, Java, and Kotlin. You build servers in whichever language your team already uses. The protocol itself is JSON-RPC 2.0 over standard I/O or HTTP, so you could implement one from scratch in any language if needed."
  - question: "Which AI tools support MCP?"
    answer: "As of early 2026, MCP is supported by Claude Desktop, Claude Code, VS Code (GitHub Copilot), Cursor, Windsurf, ChatGPT, and many other clients. The ecosystem is growing rapidly, which means a server you build today will work across multiple AI tools without changes."
  - question: "Is MCP only useful for AI coding assistants?"
    answer: "No. While developer tooling is the most visible use case, MCP servers can connect AI applications to any external system. Examples include CRM platforms, project management tools, monitoring dashboards, calendar services, and enterprise databases. Any system with an API can be wrapped in an MCP server."
  - question: "What is the difference between local and remote MCP servers?"
    answer: "Local MCP servers run on your machine and communicate via standard I/O (stdio transport). They are fast, require no network, and are ideal for file system access or local databases. Remote MCP servers run on a hosted platform and communicate via HTTP (Streamable HTTP transport). They can serve multiple clients and are better suited for shared services or third-party integrations."
primaryKeyword: "MCP servers for developers"
---

If you have used an AI coding assistant in the past six months, you have almost certainly benefited from MCP without realising it. The Model Context Protocol has quietly become the standard way AI tools connect to external systems, and understanding how it works is now a practical skill rather than a curiosity.

This guide covers what MCP is, why it matters for your day-to-day workflow, and how to build your own server from scratch.

## What Is the Model Context Protocol?

MCP is an open protocol that standardises how AI applications connect to external data sources, tools, and services. The analogy the creators use is USB-C: just as USB-C gives you a single connector for charging, data transfer, and display output across devices, MCP gives AI tools a single interface for accessing databases, APIs, file systems, and anything else a developer might need.

Before MCP, every AI tool built its own integrations. If you wanted your coding assistant to query a database, read a Jira ticket, or check a deployment status, each tool needed a bespoke plugin or extension. MCP replaces that fragmentation with a shared standard.

The protocol is maintained as an <a href="https://github.com/modelcontextprotocol" target="_blank" rel="noopener noreferrer">open-source project on GitHub ↗</a> with SDKs for TypeScript, Python, Go, Rust, C#, Java, and Kotlin.

## Why MCP Matters Right Now

Three things have converged to make MCP essential knowledge for developers in 2026.

**AI tools have moved from autocomplete to agents.** The shift from simple code completion to [agentic workflows](/ai-tools/how-ai-agents-are-changing-software-development) means AI assistants need to read files, run commands, query APIs, and take actions. MCP is the protocol that makes this possible in a standardised way.

**Ecosystem adoption has reached critical mass.** Claude, ChatGPT, VS Code, Cursor, Windsurf, and dozens of other clients now support MCP. A server you build once works across all of them. That was not true a year ago.

**The server catalogue is exploding.** The <a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noopener noreferrer">official MCP servers repository ↗</a> lists hundreds of community and vendor-built servers covering everything from AWS to Sentry to Figma. If your stack has an API, someone has probably already built an MCP server for it.

## How MCP Works: Architecture in 60 Seconds

MCP follows a client-server architecture with three participants:

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing MCP architecture with host, clients, and servers">
  <style>
    .box { rx: 8; ry: 8; }
    .label { font-family: Inter, system-ui, sans-serif; font-size: 13px; fill: #1e293b; }
    .label-bold { font-family: Inter, system-ui, sans-serif; font-size: 13px; font-weight: 600; fill: #1e293b; }
    .sublabel { font-family: Inter, system-ui, sans-serif; font-size: 11px; fill: #64748b; }
    .line { stroke: #94a3b8; stroke-width: 1.5; stroke-dasharray: 6 3; }
  </style>
  <rect class="box" x="180" y="10" width="340" height="130" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5"/>
  <text class="label-bold" x="350" y="35" text-anchor="middle">MCP Host (AI Application)</text>
  <rect class="box" x="200" y="50" width="140" height="40" fill="#e0e7ff" stroke="#818cf8" stroke-width="1.5"/>
  <text class="label" x="270" y="75" text-anchor="middle">MCP Client 1</text>
  <rect class="box" x="360" y="50" width="140" height="40" fill="#e0e7ff" stroke="#818cf8" stroke-width="1.5"/>
  <text class="label" x="430" y="75" text-anchor="middle">MCP Client 2</text>
  <rect class="box" x="200" y="100" width="140" height="30" fill="#e0e7ff" stroke="#818cf8" stroke-width="1.5"/>
  <text class="sublabel" x="270" y="120" text-anchor="middle">e.g. VS Code, Claude Code</text>
  <rect class="box" x="30" y="220" width="180" height="60" fill="#dcfce7" stroke="#4ade80" stroke-width="1.5"/>
  <text class="label-bold" x="120" y="248" text-anchor="middle">MCP Server A</text>
  <text class="sublabel" x="120" y="265" text-anchor="middle">Local (Filesystem)</text>
  <rect class="box" x="260" y="220" width="180" height="60" fill="#dcfce7" stroke="#4ade80" stroke-width="1.5"/>
  <text class="label-bold" x="350" y="248" text-anchor="middle">MCP Server B</text>
  <text class="sublabel" x="350" y="265" text-anchor="middle">Local (Database)</text>
  <rect class="box" x="490" y="220" width="180" height="60" fill="#fef3c7" stroke="#fbbf24" stroke-width="1.5"/>
  <text class="label-bold" x="580" y="248" text-anchor="middle">MCP Server C</text>
  <text class="sublabel" x="580" y="265" text-anchor="middle">Remote (Sentry)</text>
  <line class="line" x1="270" y1="90" x2="120" y2="220"/>
  <line class="line" x1="270" y1="90" x2="350" y2="220"/>
  <line class="line" x1="430" y1="90" x2="580" y2="220"/>
  <text class="sublabel" x="175" y="170" text-anchor="middle">stdio</text>
  <text class="sublabel" x="325" y="170" text-anchor="middle">stdio</text>
  <text class="sublabel" x="525" y="170" text-anchor="middle">HTTP</text>
</svg>

- **MCP Host**: The AI application you interact with (VS Code, Claude Code, Cursor). It manages one or more MCP clients.
- **MCP Client**: A component inside the host that maintains a dedicated connection to a single MCP server.
- **MCP Server**: A program that exposes tools, resources, and prompts to the client.

The host creates one client per server. Each client talks to exactly one server. This keeps connections isolated and predictable.

### Transport: How They Communicate

MCP supports two transport mechanisms:

| Transport | How it works | Best for |
|-----------|-------------|----------|
| **stdio** | Standard input/output between local processes | Local servers (file system, databases, CLI tools) |
| **Streamable HTTP** | HTTP POST with optional Server-Sent Events | Remote servers (SaaS APIs, shared services) |

The protocol layer uses JSON-RPC 2.0 for all messages regardless of transport. This means the same server logic works whether it runs locally or remotely.

## The Three Primitives: Tools, Resources, and Prompts

MCP servers expose functionality through three core primitives. Understanding these is the key to both using and building servers effectively.

### Tools

Tools are executable functions the AI can invoke. They are the most commonly used primitive and the one you will interact with most often.

Examples:
- Query a database and return results
- Create a Jira ticket
- Run a shell command
- Send a Slack message

Tools have a name, description, and a JSON Schema defining their input parameters. The AI reads the description to decide when and how to call the tool.

### Resources

Resources provide read-only contextual data. Think of them as files or documents the AI can reference without executing anything.

Examples:
- The schema of a database
- Configuration files
- API documentation
- Log output

Resources are useful for giving the AI background knowledge it needs to use tools effectively.

### Prompts

Prompts are reusable interaction templates. They help structure how the AI approaches a particular task.

Examples:
- A system prompt for code review with specific criteria
- A few-shot template for SQL query generation
- A structured debugging workflow

Prompts are the least commonly used primitive but powerful for teams that want consistent AI behaviour across developers.

## Using Existing MCP Servers

Before building your own, it is worth knowing how to use the servers that already exist. The ecosystem is large and growing.

### Setting Up in VS Code

VS Code supports MCP servers natively through its <a href="https://code.visualstudio.com/docs/copilot/chat/mcp-servers" target="_blank" rel="noopener noreferrer">Copilot Chat integration ↗</a>. Configuration lives in a `.vscode/mcp.json` file in your project root:

```json
{
  "servers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./src"]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-github"],
      "env": {
        "GITHUB_TOKEN": "${env:GITHUB_TOKEN}"
      }
    }
  }
}
```

This configuration tells VS Code to launch two local MCP servers: one for file system access scoped to your `src` directory, and one for GitHub operations using your existing token.

### Setting Up in Claude Code

Claude Code reads MCP configuration from its settings. You can add servers via the CLI:

```bash
claude mcp add filesystem npx -y @modelcontextprotocol/server-filesystem ./src
```

Or configure them in your project's `.claude/settings.json` for team-wide consistency.

### Useful Servers to Start With

If you are new to MCP, these are worth setting up first:

- **Filesystem**: Read and search files in specified directories
- **GitHub**: Create issues, read PRs, search repositories
- **Postgres/SQLite**: Query databases directly from your AI assistant
- **Fetch**: Make HTTP requests to APIs
- **Memory**: Give your AI persistent memory across sessions

All of these are available in the <a href="https://github.com/modelcontextprotocol/servers" target="_blank" rel="noopener noreferrer">official servers repository ↗</a>.

## Building Your Own MCP Server

The real power of MCP becomes clear when you build a server tailored to your own workflow. If you have ever wished your AI assistant could check your deployment status, query your internal API, or look up customer data, an MCP server is how you make that happen.

### A Minimal TypeScript Example

Here is a complete MCP server that exposes a single tool for looking up HTTP status codes. It is deliberately simple to show the structure without drowning in business logic.

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const STATUS_CODES: Record<number, string> = {
  200: "OK",
  201: "Created",
  204: "No Content",
  301: "Moved Permanently",
  400: "Bad Request",
  401: "Unauthorised",
  403: "Forbidden",
  404: "Not Found",
  500: "Internal Server Error",
  502: "Bad Gateway",
  503: "Service Unavailable",
};

const server = new McpServer({
  name: "http-status",
  version: "1.0.0",
});

server.tool(
  "lookup_status_code",
  "Look up the meaning of an HTTP status code",
  { code: z.number().int().min(100).max(599) },
  async ({ code }) => {
    const meaning = STATUS_CODES[code] || "Unknown status code";
    return {
      content: [
        {
          type: "text",
          text: `HTTP ${code}: ${meaning}`,
        },
      ],
    };
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
```

The pattern is consistent across every MCP server:

1. Create a server instance with a name and version
2. Register tools (and optionally resources and prompts)
3. Connect a transport

### Testing With the MCP Inspector

Before connecting your server to a real AI client, use the <a href="https://github.com/modelcontextprotocol/inspector" target="_blank" rel="noopener noreferrer">MCP Inspector ↗</a> to test it interactively. The inspector lets you list tools, call them with sample inputs, and inspect the JSON-RPC messages flowing back and forth.

```bash
npx @modelcontextprotocol/inspector node server.js
```

This is the fastest feedback loop for server development. Get your tools working in the inspector before worrying about client configuration.

### A More Realistic Example: Internal API Wrapper

Most teams will want to wrap an internal API. Here is the pattern for a server that queries a deployment status endpoint:

```typescript
server.tool(
  "get_deployment_status",
  "Check the current deployment status for a service",
  {
    service: z.string().describe("The service name, e.g. api, web, worker"),
    environment: z.enum(["staging", "production"]).default("production"),
  },
  async ({ service, environment }) => {
    const response = await fetch(
      `https://deploy.internal.example.com/status/${environment}/${service}`
    );

    if (!response.ok) {
      return {
        content: [{ type: "text", text: `Failed to fetch status: ${response.status}` }],
        isError: true,
      };
    }

    const data = await response.json();
    return {
      content: [
        {
          type: "text",
          text: [
            `Service: ${data.service}`,
            `Environment: ${data.environment}`,
            `Version: ${data.version}`,
            `Status: ${data.status}`,
            `Last deployed: ${data.deployedAt}`,
          ].join("\n"),
        },
      ],
    };
  }
);
```

The key insight is that you are not building a UI. You are exposing structured capabilities that the AI decides when and how to use. Good tool descriptions and clear parameter schemas are more important than clever code. This is where [prompt engineering skills](/ai-tools/prompt-engineering-for-developers) pay off: the description you write for each tool is effectively a prompt that tells the AI when to use it.

## Design Principles for Good MCP Servers

After building and using dozens of MCP servers, a few patterns consistently produce better results.

**Keep tools focused.** One tool should do one thing. A `query_database` tool that accepts arbitrary SQL is less useful than separate `get_customer`, `list_orders`, and `check_inventory` tools with clear parameters. The AI makes better decisions when tools have narrow, well-described purposes.

**Write descriptions for the AI, not for humans.** The tool description is what the language model reads to decide whether to call your tool. Be specific about what the tool does, what it returns, and when it should (and should not) be used. Vague descriptions like "manages data" produce unreliable tool selection.

**Return structured, readable text.** The AI processes your tool's output as context. Format results clearly with labels and line breaks. Avoid dumping raw JSON unless the consumer specifically needs it.

**Handle errors gracefully.** Return `isError: true` with a helpful message when something goes wrong. The AI can then explain the failure to the user or try an alternative approach.

**Validate inputs with schemas.** The `inputSchema` (or Zod schema in the TypeScript SDK) is not just documentation. Clients use it for validation and the AI uses it to construct correct arguments. Be precise about types, constraints, and defaults.

These principles align closely with general [API design best practices](/backend/api-design-principles-every-developer-should-know). If you have designed good REST APIs, you already have the instincts for good MCP servers.

## Where MCP Fits in Your Workflow

MCP is not a replacement for your existing tools. It is a layer that makes your existing tools accessible to AI assistants. Think of it as the integration layer between your [development environment](/workflows/how-to-automate-your-development-environment) and your AI workflow.

Practical examples of how teams are using MCP servers today:

- **On-call engineers** connect monitoring servers (Datadog, Sentry, PagerDuty) so the AI can pull recent errors, check dashboards, and suggest root causes during incidents
- **Backend developers** wrap internal APIs so the AI can query staging environments, check migration status, or look up feature flag states
- **Frontend developers** connect design tools (Figma) so the AI can reference component specs while generating code
- **Team leads** connect project management tools (Linear, Jira) so the AI can check ticket status, update estimates, or create subtasks during planning

The pattern is always the same: identify a context switch that slows you down, wrap the data source in an MCP server, and let the AI fetch the information as part of its normal workflow. If you are already using [AI coding assistants](/ai-tools/ai-coding-assistants-a-practical-guide), MCP servers are the natural next step for making them genuinely useful for your specific codebase and workflow.

## Getting Started This Weekend

If you want to try MCP hands-on, here is a realistic plan:

1. **Install two or three existing servers** in your editor (filesystem, GitHub, and one relevant to your stack). Use them for a day to understand how tool calling feels in practice.
2. **Read the <a href="https://modelcontextprotocol.io/docs/learn/architecture" target="_blank" rel="noopener noreferrer">architecture overview ↗</a>** on the official site. It is well written and covers the protocol in more depth than this article.
3. **Build a simple server** that wraps something you already use. Your team's deployment API, a database you query often, or an internal tool you check multiple times a day. Keep it to one or two tools.
4. **Test with the Inspector** before connecting to your editor. Get the tool descriptions and schemas right first.
5. **Share it with your team.** A `.vscode/mcp.json` committed to your repo means everyone gets the same AI capabilities without individual setup.

MCP servers are [CLI tools](/tools-tech/building-your-first-cli-tool) at heart. If you can build a script that calls an API and prints output, you can build an MCP server. The SDK handles the protocol; you just write the logic.
