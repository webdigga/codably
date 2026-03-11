---
title: "Docker for Developers: Beyond the Basics"
description: "Go beyond basic Docker usage with multi-stage builds, layer caching, security hardening, and production-ready patterns for developers."
publishDate: "2026-02-24"
author: "david-white"
category: "devops"
tags: ["docker", "containers", "devops", "deployment"]
featured: false
draft: false
faqs:
  - question: "What is a multi-stage Docker build?"
    answer: "A multi-stage build uses multiple FROM statements in a single Dockerfile. Each stage can use a different base image and copy artefacts from previous stages. This lets you compile code in a full development image but ship only the final binary in a minimal runtime image."
  - question: "How do I reduce Docker image size?"
    answer: "Use multi-stage builds to separate build dependencies from runtime dependencies. Choose minimal base images like Alpine or distroless. Remove package manager caches after installing dependencies. Order your layers so that frequently changing content comes last."
  - question: "Should I run containers as root?"
    answer: "No. Running containers as root is a security risk. Always create a non-root user in your Dockerfile and switch to it with the USER instruction. This limits the damage if a container is compromised."
  - question: "Why is my Docker build so slow?"
    answer: "The most common cause is poor layer ordering. Docker caches layers from top to bottom, so put your dependency installation steps before copying your source code. This way, dependencies are only reinstalled when they actually change, not on every code edit."
  - question: "What is the difference between COPY and ADD in a Dockerfile?"
    answer: "COPY simply copies files from the build context into the image. ADD does the same but also supports extracting tar archives and fetching remote URLs. Prefer COPY in most cases for clarity and predictability."
primaryKeyword: "Docker for developers"
---

Most developers learn enough Docker to run `docker build` and `docker compose up`. That gets you surprisingly far. But as your application grows, you start hitting problems: builds that take ten minutes, images that weigh over a gigabyte, containers that run as root, and deployments that feel fragile.

This article covers the patterns that take you from "Docker works" to "Docker works well." Having worked with containerised applications across dozens of projects, I have found that the difference between a team that struggles with Docker and one that thrives often comes down to five or six key practices.

## Quick Reference: Docker Optimisation Techniques

| Technique | Impact on Build Time | Impact on Image Size | Difficulty |
|---|---|---|---|
| Multi-stage builds | Moderate | Very high (60 to 80% reduction) | Low |
| Layer ordering | Very high | None | Low |
| .dockerignore | High | None | Trivial |
| Distroless base images | None | Very high | Medium |
| BuildKit cache mounts | Very high | None | Medium |
| Registry-based caching | Very high (CI only) | None | Medium |
| Non-root user | None | None | Trivial |

## Multi-Stage Builds

Multi-stage builds are the single most impactful improvement you can make to your Dockerfiles. They separate the build environment from the runtime environment, resulting in dramatically smaller and more secure images.

### The problem with single-stage builds

A typical Node.js Dockerfile installs build tools, compiles TypeScript, runs tests, and then serves the application. The final image contains everything: the TypeScript compiler, test frameworks, devDependencies, and build artefacts that are never used at runtime.

### The multi-stage approach

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

The final image contains only production dependencies and compiled output. Build tools, source code, and devDependencies are discarded. For a typical Node.js application, this can reduce image size by 60 to 80 percent.

### Going further with distroless images

Google's <a href="https://github.com/GoogleContainerTools/distroless" target="_blank" rel="noopener noreferrer">distroless images ↗</a> contain only your application and its runtime dependencies. No shell, no package manager, no utilities. This minimises the attack surface dramatically.

```dockerfile
FROM gcr.io/distroless/nodejs20-debian12
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
CMD ["dist/server.js"]
```

The trade-off is that you cannot shell into the container for debugging. For production workloads where security matters, that is an acceptable cost. You will want proper [observability and monitoring](/devops/observability-vs-monitoring-what-developers-need-to-know) in place to compensate for the lack of interactive debugging.

## Layer Caching Done Right

Docker builds images layer by layer, caching each layer. If a layer has not changed, Docker reuses the cached version. Understanding this mechanism is key to fast builds.

### The golden rule

Order your Dockerfile instructions from least frequently changing to most frequently changing.

```dockerfile
# Changes rarely: base image
FROM node:20-alpine

# Changes rarely: system dependencies
RUN apk add --no-cache python3 make g++

# Changes occasionally: application dependencies
COPY package*.json ./
RUN npm ci

# Changes often: application code
COPY . .
RUN npm run build
```

With this ordering, a code change only invalidates the last two layers. Dependency installation (the slowest step) uses the cache unless `package.json` has changed.

### The .dockerignore file

Without a `.dockerignore`, Docker sends your entire project directory to the build daemon, including `node_modules`, `.git`, test fixtures, and local environment files. This wastes time and can leak secrets.

```
node_modules
.git
.env
*.md
dist
coverage
.nyc_output
```

A proper `.dockerignore` reduces build context size and prevents cache invalidation from irrelevant file changes.

<svg viewBox="0 0 700 360" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing Docker layer caching with and without proper layer ordering">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="700" height="360" fill="#f8fafc" rx="8"/>
  <text x="350" y="30" text-anchor="middle" font-size="16" font-weight="600" fill="#334155">Layer Caching: Poor vs Optimised Ordering</text>
  <!-- Poor ordering (left) -->
  <text x="190" y="60" text-anchor="middle" font-size="13" font-weight="600" fill="#991b1b">Poor Ordering</text>
  <rect x="60" y="75" width="260" height="40" fill="#fee2e2" stroke="#ef4444" stroke-width="1" rx="4"/>
  <text x="190" y="100" text-anchor="middle" font-size="11" fill="#991b1b">FROM node:20-alpine</text>
  <rect x="60" y="120" width="260" height="40" fill="#fee2e2" stroke="#ef4444" stroke-width="1" rx="4"/>
  <text x="190" y="145" text-anchor="middle" font-size="11" fill="#991b1b">COPY . . (all files including source)</text>
  <rect x="60" y="165" width="260" height="40" fill="#fee2e2" stroke="#ef4444" stroke-width="1" rx="4"/>
  <text x="190" y="190" text-anchor="middle" font-size="11" fill="#991b1b">RUN npm ci (invalidated every time!)</text>
  <rect x="60" y="210" width="260" height="40" fill="#fee2e2" stroke="#ef4444" stroke-width="1" rx="4"/>
  <text x="190" y="235" text-anchor="middle" font-size="11" fill="#991b1b">RUN npm run build</text>
  <text x="190" y="275" text-anchor="middle" font-size="12" font-weight="600" fill="#ef4444">Every code change rebuilds ALL layers</text>
  <text x="190" y="295" text-anchor="middle" font-size="11" fill="#64748b">Build time: ~120 seconds</text>
  <!-- Optimised ordering (right) -->
  <text x="510" y="60" text-anchor="middle" font-size="13" font-weight="600" fill="#166534">Optimised Ordering</text>
  <rect x="380" y="75" width="260" height="40" fill="#dcfce7" stroke="#22c55e" stroke-width="1" rx="4"/>
  <text x="510" y="100" text-anchor="middle" font-size="11" fill="#166534">FROM node:20-alpine (cached)</text>
  <rect x="380" y="120" width="260" height="40" fill="#dcfce7" stroke="#22c55e" stroke-width="1" rx="4"/>
  <text x="510" y="145" text-anchor="middle" font-size="11" fill="#166534">COPY package*.json (cached if unchanged)</text>
  <rect x="380" y="165" width="260" height="40" fill="#dcfce7" stroke="#22c55e" stroke-width="1" rx="4"/>
  <text x="510" y="190" text-anchor="middle" font-size="11" fill="#166534">RUN npm ci (cached if deps unchanged)</text>
  <rect x="380" y="210" width="260" height="40" fill="#fef9c3" stroke="#eab308" stroke-width="1" rx="4"/>
  <text x="510" y="235" text-anchor="middle" font-size="11" fill="#854d0e">COPY . . + RUN build (rebuilt)</text>
  <text x="510" y="275" text-anchor="middle" font-size="12" font-weight="600" fill="#22c55e">Only source layers rebuild</text>
  <text x="510" y="295" text-anchor="middle" font-size="11" fill="#64748b">Build time: ~15 seconds</text>
  <!-- Divider -->
  <line x1="350" y1="55" x2="350" y2="310" stroke="#cbd5e1" stroke-width="1" stroke-dasharray="4"/>
  <!-- Bottom note -->
  <rect x="100" y="315" width="500" height="35" fill="#eff6ff" stroke="#3b82f6" stroke-width="1" rx="4"/>
  <text x="350" y="337" text-anchor="middle" font-size="11" fill="#1e40af">Proper layer ordering can reduce build times by 80% or more on code-only changes</text>
</svg>

## Security Hardening

Running containers in production without security hardening is like deploying to a server you have not patched. The defaults are convenient but not safe.

### Run as a non-root user

By default, processes inside a container run as root. If an attacker exploits a vulnerability in your application, they have root access inside the container.

```dockerfile
RUN addgroup --system appgroup && \
    adduser --system --ingroup appgroup appuser
USER appuser
```

This simple addition significantly limits the blast radius of a compromise. In my experience, adding a non-root user is the single lowest-effort, highest-impact security improvement you can make to any Dockerfile.

### Pin your base image versions

Using `node:latest` or `node:20` means your build can produce different images on different days. Pin to a specific digest or patch version for reproducible builds.

```dockerfile
FROM node:20.11.1-alpine3.19
```

Pair this with a tool like <a href="https://docs.renovatebot.com/" target="_blank" rel="noopener noreferrer">Renovate ↗</a> or Dependabot to keep base images updated in a controlled, reviewable manner.

### Scan your images

Tools like `docker scout`, Trivy, and Snyk scan your images for known vulnerabilities in OS packages and application dependencies. Integrate these into your [CI/CD pipeline](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) so that vulnerable images never reach production.

```bash
docker scout cves myapp:latest
```

### Do not store secrets in images

Environment variables set with `ENV` are baked into the image and visible to anyone who inspects it. Pass secrets at runtime via environment variables, mounted secret files, or a secrets manager.

## Docker Compose for Local Development

Docker Compose is excellent for local development, but many teams under-use it. If you are looking to [automate your development environment](/workflows/how-to-automate-your-development-environment) more broadly, Docker Compose is often the best place to start.

### Health checks

Add health checks to your services so that dependent containers wait for readiness, not just port availability.

```yaml
services:
  postgres:
    image: postgres:16
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 3s
      retries: 5

  api:
    build: .
    depends_on:
      postgres:
        condition: service_healthy
```

### Development overrides

Use a `docker-compose.override.yml` for development-specific configuration like volume mounts, debug ports, and hot reloading. The override file is loaded automatically alongside the base file.

```yaml
# docker-compose.override.yml
services:
  api:
    volumes:
      - ./src:/app/src
    environment:
      - DEBUG=true
    ports:
      - "9229:9229" # Node.js debugger
```

### Named volumes for persistence

Use named volumes instead of bind mounts for database data. Bind mounts can cause permission issues across operating systems; named volumes are managed by Docker and work consistently.

## Build Optimisation for CI

In CI environments, layer caching behaviour is different from local builds. Each CI run typically starts with a clean Docker cache.

### Registry-based caching

Push your build cache to a container registry and pull it in subsequent builds:

```bash
docker build \
  --cache-from myregistry/myapp:cache \
  --build-arg BUILDKIT_INLINE_CACHE=1 \
  -t myregistry/myapp:latest .
```

### BuildKit

Docker BuildKit (enabled by default in recent versions) offers parallel layer building, better caching, and secret mounting. If you are not using it, set `DOCKER_BUILDKIT=1` in your environment.

BuildKit's `--mount=type=cache` lets you persist package manager caches across builds:

```dockerfile
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

This is particularly effective in CI where dependency installation is often the slowest step. For teams using [infrastructure as code](/devops/infrastructure-as-code-getting-started), these Docker optimisations should be codified in your pipeline definitions alongside your infrastructure configuration.

## Moving Beyond the Basics

Docker mastery is not about memorising Dockerfile syntax. It is about understanding layers, caching, security boundaries, and the difference between a development convenience and a production concern.

Start with multi-stage builds and proper layer ordering. Add security hardening. Optimise your CI caching. Each improvement compounds, resulting in faster builds, smaller images, and more reliable deployments.

The container you build in development should closely resemble what runs in production. The closer those two things are, the fewer surprises you get on deploy day.
