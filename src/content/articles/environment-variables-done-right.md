---
title: "Environment Variables Done Right"
description: "A practical guide to managing environment variables across development, CI/CD, and production without leaking secrets."
publishDate: "2026-03-12"
author: "david-white"
category: "devops"
tags: ["environment-variables", "secrets", "security", "devops", "configuration"]
featured: false
draft: false
faqs:
  - question: "Should I commit a .env file to version control?"
    answer: "Never commit a .env file containing real secrets. Instead, commit a .env.example file that lists every required variable with placeholder values or descriptions. This documents what your application needs without exposing credentials. Add .env to your .gitignore before your first commit, and use a tool like git-secrets or a pre-commit hook to catch accidental commits of secret values."
  - question: "What is the difference between environment variables and feature flags?"
    answer: "Environment variables configure the runtime environment: database URLs, API keys, service endpoints, and debug modes. They change between environments (development, staging, production) but rarely change during a deployment. Feature flags control application behaviour: which features are enabled for which users. They change frequently, often without a deployment. Use environment variables for configuration and a dedicated feature flag service for feature toggles."
  - question: "How do I manage environment variables in a monorepo?"
    answer: "Each service or application in a monorepo should have its own .env.example file in its directory. Avoid a single root-level .env file that every service reads, as this leads to naming collisions and makes it unclear which variables belong to which service. If services share common configuration like a database URL, either duplicate the variable in each service's .env or use a shared secrets manager that each service queries independently."
  - question: "Is it safe to use environment variables for API keys in a frontend application?"
    answer: "No. Environment variables in frontend applications are embedded into the JavaScript bundle at build time and are visible to anyone who inspects your source code. Only use environment variables for values that are safe to be public, such as a publishable Stripe key or an analytics ID. For secrets that must stay private, proxy the requests through your backend so the secret never leaves the server."
  - question: "How do I rotate secrets stored in environment variables without downtime?"
    answer: "The cleanest approach is to have your application accept both the old and new secret simultaneously during a transition period. For API keys, many providers let you create a second key before revoking the first. Update the environment variable to the new value, deploy, verify everything works, then revoke the old key. For database passwords, create a new user with the new password, switch the connection string, verify, then remove the old user. Secrets managers with versioning make this process smoother by supporting gradual rollouts."
primaryKeyword: "environment variables"
---

Environment variables are one of those things that every developer uses daily but few think about carefully until something goes wrong. A leaked database password in a public repository. A production deployment that crashes because a variable was misspelled. A local development setup that takes two hours because nobody documented which variables are needed.

Getting environment variables right is not glamorous work, but it prevents an entire category of bugs, security incidents, and onboarding headaches. This guide covers practical patterns for managing environment variables across development, CI/CD, and production, with a focus on keeping secrets safe and configurations maintainable.

## Why environment variables exist

The <a href="https://12factor.net/config" target="_blank" rel="noopener noreferrer">twelve-factor app methodology ↗</a> established the principle: store configuration in the environment, not in the code. The reasoning is simple. Your application needs different values in different contexts:

| Configuration | Development | Staging | Production |
|---|---|---|---|
| Database URL | localhost:5432 | staging-db.internal | prod-db.internal |
| API key | test_key_xxx | test_key_yyy | live_key_zzz |
| Log level | debug | info | warn |
| Feature X | enabled | enabled | disabled |
| Email service | console (no sending) | sandbox | live |

Hardcoding any of these values means changing code to change configuration. Environment variables decouple the two, letting the same code run correctly in every environment.

## The .env file pattern

Most developers encounter environment variables through `.env` files and libraries like <a href="https://github.com/motdotla/dotenv" target="_blank" rel="noopener noreferrer">dotenv ↗</a> (Node.js), <a href="https://github.com/theskumar/python-dotenv" target="_blank" rel="noopener noreferrer">python-dotenv ↗</a>, or framework-level support in tools like Next.js, Rails, and Laravel.

The pattern is straightforward:

```bash
# .env
DATABASE_URL=postgresql://localhost:5432/myapp_dev
REDIS_URL=redis://localhost:6379
API_KEY=test_key_abc123
LOG_LEVEL=debug
```

Your application reads these at startup and uses them throughout. Simple, widely supported, and dangerous if mishandled.

### The .env.example contract

Every project should include a `.env.example` file that acts as documentation:

```bash
# .env.example
# Copy this file to .env and fill in the values

# Database connection string (PostgreSQL)
DATABASE_URL=postgresql://localhost:5432/myapp_dev

# Redis connection for caching and queues
REDIS_URL=redis://localhost:6379

# API key for the payment provider (use test key for development)
API_KEY=your_api_key_here

# Log level: debug, info, warn, error
LOG_LEVEL=debug
```

This file is committed to version control. It tells every developer exactly what variables the application needs, what format they should be in, and provides sensible defaults for local development where possible. A new team member should be able to copy `.env.example` to `.env`, fill in a handful of values, and have a working setup. For more on reducing onboarding friction, see [how to automate your development environment](/workflows/how-to-automate-your-development-environment).

### Validation at startup

Do not let your application silently fail because a variable is missing. Validate environment variables at startup and fail fast with a clear error message:

```javascript
// config.js
const required = ['DATABASE_URL', 'API_KEY', 'REDIS_URL'];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing required environment variable: ${key}`);
    console.error('See .env.example for the full list of required variables.');
    process.exit(1);
  }
}

export const config = {
  databaseUrl: process.env.DATABASE_URL,
  apiKey: process.env.API_KEY,
  redisUrl: process.env.REDIS_URL,
  logLevel: process.env.LOG_LEVEL || 'info',
};
```

Libraries like <a href="https://github.com/colinhacks/zod" target="_blank" rel="noopener noreferrer">Zod ↗</a> or <a href="https://github.com/af/envalid" target="_blank" rel="noopener noreferrer">envalid ↗</a> take this further with type coercion and format validation. If `PORT` should be a number and `DATABASE_URL` should be a valid URL, validate that at startup rather than discovering it when the first request fails.

## Naming conventions

Consistent naming prevents confusion and conflicts. Follow these rules:

- **UPPER_SNAKE_CASE** for all environment variable names
- **Prefix with your app or service name** in multi-service environments (`MYAPP_DATABASE_URL` rather than `DATABASE_URL`) to avoid collisions
- **Use clear, descriptive names** that indicate what the variable configures (`STRIPE_SECRET_KEY` not `SK`)
- **Group related variables** with a common prefix (`EMAIL_FROM`, `EMAIL_SMTP_HOST`, `EMAIL_SMTP_PORT`)

| Convention | Good | Bad | Why |
|---|---|---|---|
| Casing | `DATABASE_URL` | `databaseUrl` | Standard for env vars |
| Specificity | `STRIPE_SECRET_KEY` | `API_KEY` | Clear which service |
| Boolean naming | `ENABLE_CACHE` | `CACHE` | Obvious it is a toggle |
| Prefix in monorepo | `AUTH_DATABASE_URL` | `DATABASE_URL` | Avoids collision |

## Secrets vs configuration

Not all environment variables are equal. Distinguishing between secrets and plain configuration helps you apply the right level of protection to each.

**Secrets** are values that would cause harm if exposed: database passwords, API keys, encryption keys, OAuth client secrets. These need encryption at rest, restricted access, and audit logging.

**Configuration** is everything else: log levels, feature toggles, service URLs, port numbers. These are sensitive in the sense that they describe your infrastructure, but exposure is inconvenient rather than catastrophic.

<svg viewBox="0 0 600 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram classifying environment variables into secrets requiring encrypted storage and configuration suitable for plain text, with examples of each type">
  <style>
    .ev-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #334155; }
    .ev-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #334155; }
    .ev-sub { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
    .ev-box { rx: 8; ry: 8; }
  </style>
  <text x="300" y="22" text-anchor="middle" class="ev-title">Environment Variable Classification</text>
  <!-- Secrets column -->
  <rect x="30" y="40" width="250" height="200" class="ev-box" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="155" y="65" text-anchor="middle" class="ev-label" style="font-weight:600; fill:#dc2626;">Secrets (encrypted storage)</text>
  <text x="50" y="90" class="ev-sub">DATABASE_PASSWORD</text>
  <text x="50" y="110" class="ev-sub">STRIPE_SECRET_KEY</text>
  <text x="50" y="130" class="ev-sub">JWT_SIGNING_KEY</text>
  <text x="50" y="150" class="ev-sub">OAUTH_CLIENT_SECRET</text>
  <text x="50" y="170" class="ev-sub">ENCRYPTION_KEY</text>
  <text x="50" y="190" class="ev-sub">SMTP_PASSWORD</text>
  <text x="50" y="215" class="ev-label" style="fill:#dc2626;">Store in: Vault, AWS SSM,</text>
  <text x="50" y="230" class="ev-label" style="fill:#dc2626;">GCP Secret Manager</text>
  <!-- Configuration column -->
  <rect x="320" y="40" width="250" height="200" class="ev-box" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="445" y="65" text-anchor="middle" class="ev-label" style="font-weight:600; fill:#16a34a;">Configuration (plain text OK)</text>
  <text x="340" y="90" class="ev-sub">LOG_LEVEL</text>
  <text x="340" y="110" class="ev-sub">PORT</text>
  <text x="340" y="130" class="ev-sub">NODE_ENV</text>
  <text x="340" y="150" class="ev-sub">ENABLE_CACHE</text>
  <text x="340" y="170" class="ev-sub">MAX_UPLOAD_SIZE</text>
  <text x="340" y="190" class="ev-sub">CORS_ORIGIN</text>
  <text x="340" y="215" class="ev-label" style="fill:#16a34a;">Store in: .env files, config</text>
  <text x="340" y="230" class="ev-label" style="fill:#16a34a;">maps, deploy settings</text>
</svg>

The practical implication: do not store your database password in the same place (and with the same access controls) as your log level. Use a secrets manager for secrets and simpler configuration management for everything else.

## Secrets management in practice

### Local development

For local development, `.env` files are fine. Developers need test credentials that work against local or sandbox services. The risk is low because these are not production values.

**Rules for local .env files:**

1. Add `.env` to `.gitignore` before your first commit
2. Never put production secrets in a `.env` file, even temporarily
3. Use test or sandbox API keys that have no access to real data
4. Consider using <a href="https://github.com/awslabs/git-secrets" target="_blank" rel="noopener noreferrer">git-secrets ↗</a> or a pre-commit hook to catch accidental secret commits

### CI/CD pipelines

Your CI/CD system needs access to secrets for running tests against real services, building containers, and deploying. Every major platform provides a secrets mechanism:

- **GitHub Actions:** Repository or organisation secrets, available as environment variables in workflows
- **GitLab CI:** CI/CD variables with "masked" and "protected" options
- **CircleCI:** Project and context environment variables

The key principle: **never echo or log secrets in CI output**. A single `echo $DATABASE_URL` in a debug step can expose credentials in build logs that your entire team (or the public, for open-source projects) can read.

For a broader look at pipeline configuration, see [how to build a CI/CD pipeline that actually works](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works).

### Production

Production secrets should live in a dedicated secrets manager:

| Tool | Provider | Best For |
|---|---|---|
| AWS Secrets Manager | AWS | AWS-native applications |
| AWS Systems Manager Parameter Store | AWS | Simpler config and secrets on AWS |
| Google Secret Manager | GCP | GCP-native applications |
| Azure Key Vault | Azure | Azure-native applications |
| HashiCorp Vault | Self-hosted / cloud | Multi-cloud, advanced policies |
| Doppler | SaaS | Team-friendly, multi-environment |

These tools provide encryption at rest, access control, audit logging, and secret rotation. They are more work to set up than a `.env` file on a server, but the security and operational benefits are significant, especially as your team and infrastructure grow.

## Environment variables in Docker

Docker adds a layer of complexity to environment variable management. There are several ways to pass variables into a container, and choosing the right one matters.

### Build-time vs runtime

**Build-time variables** (`ARG` in a Dockerfile) are baked into the image during `docker build`. They should never contain secrets because they are visible in the image's layer history.

**Runtime variables** (`ENV` in a Dockerfile, `-e` flag, or `env_file` in Docker Compose) are injected when the container starts. These are the right place for configuration and secrets.

```yaml
# docker-compose.yml
services:
  api:
    build: .
    env_file:
      - .env
    environment:
      - NODE_ENV=production
      - LOG_LEVEL=info
```

The `env_file` directive loads variables from a file. The `environment` section sets individual variables and overrides anything from `env_file`. This layering is useful: load your base configuration from a file and override specific values for different contexts.

**Important:** Do not bake secrets into Docker images using `ENV` in your Dockerfile. Those values persist in the image and can be extracted by anyone with access to it. Pass secrets at runtime instead. For more Docker patterns, see [Docker for developers: beyond the basics](/devops/docker-for-developers-beyond-the-basics).

### Docker secrets (Swarm and Compose)

Docker Swarm and newer versions of Docker Compose support a `secrets` mechanism that mounts secrets as files inside the container rather than exposing them as environment variables. This is more secure because the values do not appear in `docker inspect` output or the process environment table:

```yaml
# docker-compose.yml
services:
  api:
    image: myapp
    secrets:
      - db_password
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password

secrets:
  db_password:
    file: ./secrets/db_password.txt
```

Your application reads the secret from the file path rather than from an environment variable. Many database images and frameworks support this `_FILE` suffix convention natively.

## Common mistakes and how to avoid them

### 1. Committing secrets to version control

This is the most common and most damaging mistake. Once a secret is in your git history, it is there permanently unless you rewrite history (which is disruptive and easy to get wrong).

**Prevention:**
- Add `.env` to `.gitignore` in every new project, before the first commit
- Use a pre-commit hook that scans for patterns matching API keys, passwords, and tokens
- Use `.env.example` with placeholder values for documentation

**Recovery:** If you accidentally commit a secret, rotate it immediately. Do not just remove the file and commit again; the secret is still in the git history. Change the password, revoke the API key, or regenerate the token. Then clean the git history if necessary using `git filter-repo`.

### 2. Using different variable names across environments

If your development setup uses `DB_URL` and production uses `DATABASE_URL`, you have a bug waiting to happen. Standardise on a single name for each variable and use it everywhere.

### 3. Not validating variables at startup

Missing or malformed environment variables cause errors at the worst possible time: when a specific code path runs in production, potentially minutes or hours after deployment. Validate everything at startup.

### 4. Hardcoding fallback values for secrets

```javascript
// Dangerous: this "default" might end up in production
const apiKey = process.env.API_KEY || 'sk_test_default_key_12345';
```

Default values are fine for non-secret configuration like `LOG_LEVEL` or `PORT`. They are dangerous for secrets because a missing variable silently falls back to a value that might work (a test key) or might not (an expired key), making the failure mode unpredictable. For secrets, fail loudly if the variable is not set.

### 5. Logging environment variables

Structured logging is valuable, but logging your entire environment on startup is a security risk. If you log configuration for debugging purposes, redact secrets:

```javascript
console.log('Configuration loaded:', {
  databaseUrl: config.databaseUrl.replace(/\/\/.*@/, '//*****@'),
  logLevel: config.logLevel,
  port: config.port,
  apiKey: '***redacted***',
});
```

For more on logging practices, see [the developer's guide to logging](/backend/the-developers-guide-to-logging).

## Environment variables in frontend applications

Frontend environment variables deserve special attention because they are fundamentally different from backend variables. Values embedded at build time end up in the JavaScript bundle and are visible to anyone who opens browser developer tools.

### What is safe to expose

- Publishable API keys (Stripe publishable key, Google Maps API key with domain restrictions)
- Analytics IDs (Google Analytics, Plausible)
- Public API endpoints
- Feature flags for UI behaviour

### What is never safe to expose

- Secret API keys
- Database credentials
- Internal service URLs
- Anything that grants write access to a service

Frameworks like Next.js enforce this distinction with prefixes: variables starting with `NEXT_PUBLIC_` are included in the client bundle; all others are server-only. Vite uses `VITE_` as its prefix. Respect these conventions. If a variable does not have the public prefix, it is server-only for a reason.

## A practical checklist

Use this checklist when setting up environment variables for a new project or auditing an existing one:

- [ ] `.env` is in `.gitignore`
- [ ] `.env.example` exists with every variable documented
- [ ] All required variables are validated at startup with clear error messages
- [ ] Secrets and configuration are stored separately with appropriate access controls
- [ ] No secrets are hardcoded as fallback values
- [ ] No secrets are logged, even at debug level
- [ ] Frontend variables contain only public-safe values
- [ ] CI/CD secrets are masked in build logs
- [ ] Production secrets are in a dedicated secrets manager, not in a `.env` file on a server
- [ ] A secret rotation process exists and has been tested

## The bottom line

Environment variables are a solved problem in the sense that the patterns are well established and the tooling is mature. The challenge is discipline: following the patterns consistently, documenting your variables, validating at startup, and keeping secrets out of places they should not be.

Get this right and you eliminate an entire class of deployment failures, security incidents, and onboarding delays. It is not exciting work, but it is the kind of foundational practice that separates teams who ship confidently from teams who are one misconfigured variable away from an outage. If you are looking to strengthen your overall infrastructure practices, [infrastructure as code: getting started](/devops/infrastructure-as-code-getting-started) covers the next level of environment management.
