<!-- Reading time: ~10 minutes (2,300 words at 230 wpm) -->
---
title: "The Developer's Guide to Secure Coding Practices"
description: "Learn secure coding practices every developer should know, from input validation and dependency auditing to secrets management and threat modelling."
publishDate: "2026-04-15"
author: "jonny-rowse"
category: "code-quality"
tags: ["security", "secure-coding", "owasp", "input-validation", "code-quality", "application-security"]
featured: false
draft: false
faqs:
  - question: "What are secure coding practices?"
    answer: "Secure coding practices are a set of guidelines and techniques that developers follow to write software resistant to attacks. They include input validation, output encoding, proper authentication and authorisation, secrets management, dependency auditing, and applying the principle of least privilege throughout the codebase."
  - question: "What is the OWASP Top 10?"
    answer: "The OWASP Top 10 is a regularly updated list of the most critical web application security risks, published by the Open Worldwide Application Security Project. The 2025 edition covers risks like injection, broken access control, security misconfiguration, and vulnerable components. It serves as a baseline awareness document for developers."
  - question: "How do I prevent injection attacks in my code?"
    answer: "Use parameterised queries or prepared statements for database access, never concatenate user input into SQL strings, and validate all input against an allowlist of expected formats. Apply output encoding when rendering user-supplied data in HTML, and use ORM libraries that handle escaping automatically."
  - question: "Should every developer learn about security?"
    answer: "Yes. Security is not solely the responsibility of a dedicated security team. Every developer who writes code that handles user input, stores data, or interacts with external systems needs a working knowledge of common vulnerabilities and how to prevent them. Shifting security left into the development process catches issues earlier and reduces remediation costs."
  - question: "What tools can help with secure coding?"
    answer: "Static analysis tools like Semgrep, SonarQube, and CodeQL scan source code for known vulnerability patterns. Dependency scanners like Snyk, Dependabot, and npm audit identify vulnerable packages. Secret scanners like GitLeaks and TruffleHog detect leaked credentials. Integrating these into your CI pipeline automates security checks on every commit."
primaryKeyword: "secure coding practices"
---

Most security breaches do not start with a sophisticated zero-day exploit. They start with a developer who forgot to validate an input, hardcoded an API key, or pulled in a dependency with a known vulnerability. The good news: the majority of common vulnerabilities are preventable with straightforward coding habits.

This guide covers the secure coding practices that matter most in day-to-day development. Whether you are building APIs, frontend applications, or full-stack systems, these techniques will help you write code that is harder to break.

## Why Security Is a Developer Responsibility

There was a time when security was treated as something a dedicated team handled after the code was written. That model does not scale. Modern delivery cycles ship code multiple times a day, and bolting on security reviews at the end creates bottlenecks that teams work around rather than through.

Shifting security left means building it into the development process from the start. Developers who understand common attack vectors write safer code by default. Code reviews catch vulnerabilities before they reach production. Automated scanners in your CI pipeline flag issues on every pull request.

The cost difference is significant. Fixing a vulnerability during development costs a fraction of remediating it after a breach. According to the <a href="https://owasp.org/www-project-top-ten/" target="_blank" rel="noopener noreferrer">OWASP Top 10</a> ↗, the most common web application risks are well understood and preventable.

## The OWASP Top 10: Your Security Baseline

The OWASP Top 10 (2025 edition) provides a widely accepted baseline for web application security. Every developer should know these categories.

| Rank | Risk | What It Means |
|------|------|---------------|
| 1 | Broken Access Control | Users can act outside their intended permissions |
| 2 | Cryptographic Failures | Sensitive data exposed through weak or missing encryption |
| 3 | Injection | Untrusted data sent to an interpreter as part of a command or query |
| 4 | Insecure Design | Missing or ineffective security controls at the design level |
| 5 | Security Misconfiguration | Default configs, open cloud storage, verbose error messages |
| 6 | Vulnerable Components | Using libraries or frameworks with known vulnerabilities |
| 7 | Authentication Failures | Broken authentication mechanisms that allow account compromise |
| 8 | Data Integrity Failures | Code and infrastructure that does not protect against integrity violations |
| 9 | Logging and Monitoring Failures | Insufficient logging that prevents detection of breaches |
| 10 | Server-Side Request Forgery | Application fetches a remote resource without validating the user-supplied URL |

Familiarise yourself with each category. The <a href="https://cheatsheetseries.owasp.org/" target="_blank" rel="noopener noreferrer">OWASP Cheat Sheet Series</a> ↗ provides practical remediation guidance for each one.

## Input Validation: Your First Line of Defence

The single most impactful habit you can adopt is treating all external input as untrusted. Every form field, query parameter, HTTP header, file upload, and API request body is a potential attack vector.

### Validate on the Server

Client-side validation improves user experience, but it is trivially bypassed. An attacker will send requests directly to your API, skipping your frontend entirely. Server-side validation is not optional.

```typescript
// Bad: trusting user input directly
const userId = req.params.id;
const user = await db.query(`SELECT * FROM users WHERE id = ${userId}`);

// Good: parameterised query with validation
const userId = parseInt(req.params.id, 10);
if (isNaN(userId) || userId <= 0) {
  return res.status(400).json({ error: 'Invalid user ID' });
}
const user = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
```

### Use Allowlists Over Denylists

Define what valid input looks like rather than trying to block every possible malicious pattern. Denylists are incomplete by definition because attackers constantly find new bypass techniques.

```typescript
// Denylist approach (fragile)
if (input.includes('<script>') || input.includes('DROP TABLE')) {
  reject();
}

// Allowlist approach (robust)
const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
if (!EMAIL_PATTERN.test(input)) {
  reject();
}
```

### Encode Output

Input validation prevents bad data from entering your system. Output encoding prevents it from being interpreted as code when displayed. Always encode user-supplied data before rendering it in HTML, JavaScript, or SQL contexts.

Most modern frontend frameworks handle this automatically. React escapes JSX expressions by default. But if you are using `dangerouslySetInnerHTML`, template literals in server-rendered HTML, or building raw SQL strings, you are on your own.

## Secrets Management: Stop Hardcoding Credentials

Hardcoded secrets in source code remain one of the most common security issues in real-world applications. API keys, database passwords, and encryption keys end up in version control, CI logs, and error messages with alarming regularity.

### Rules for Secrets

1. **Never commit secrets to version control.** Use `.gitignore` to exclude `.env` files and add a pre-commit hook to scan for accidental leaks.
2. **Use environment variables or a secrets manager.** For more on this, see [environment variables done right](/devops/environment-variables-done-right).
3. **Rotate secrets regularly.** Automate rotation where possible. If a secret is compromised, you need to be able to replace it quickly.
4. **Limit scope.** Each service should only have access to the secrets it needs. A frontend build process does not need your database password.

### Automated Secret Detection

Tools like GitLeaks and TruffleHog scan your repository history for patterns that look like secrets. Run these in your CI pipeline to catch leaks before they reach your main branch.

```yaml
# Example: GitLeaks in a GitHub Actions workflow
- name: Run GitLeaks
  uses: gitleaks/gitleaks-action@v2
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Dependency Security: Know What You Ship

Modern applications rely on hundreds of third-party packages. Each one is a potential entry point. The <a href="https://cwe.mitre.org/top25/" target="_blank" rel="noopener noreferrer">CWE Top 25</a> ↗ lists "use of vulnerable components" as a recurring weakness, and supply chain attacks have become increasingly common.

### Audit Your Dependencies

Run dependency audits as part of your CI pipeline. Every major package manager has a built-in audit command.

```bash
# npm
npm audit

# pip
pip-audit

# Go
govulncheck ./...
```

For a deeper look at managing your dependency tree safely, read [dependency management without the chaos](/devops/dependency-management-without-the-chaos).

### Pin Versions and Review Updates

Lockfiles (`package-lock.json`, `poetry.lock`, `go.sum`) ensure reproducible builds and prevent unexpected version changes. Review dependency updates before merging them. Automated tools like Dependabot and Renovate open pull requests for updates, but a human should review what changed.

### Evaluate Before You Install

Before adding a new dependency, ask: does this library have active maintainers? Are there open security issues? Is the package well tested? A small utility function you write yourself might be safer than a package with a single maintainer and no recent releases.

## Authentication and Authorisation

Getting auth wrong is expensive. Broken access control has been the number one risk in the OWASP Top 10 for several years running, and authentication failures consistently rank in the top ten.

### Authentication Best Practices

- **Use established libraries.** Do not implement your own password hashing, JWT verification, or OAuth flows from scratch. Use well-tested libraries like bcrypt for hashing and established OAuth providers.
- **Enforce strong password policies.** Require a minimum length (12+ characters), check against known breached passwords using the HaveIBeenPwned API, and support multi-factor authentication.
- **Hash passwords correctly.** Use bcrypt, scrypt, or Argon2 with appropriate cost factors. Never use MD5 or SHA-256 for password storage.

For a thorough treatment of authentication patterns, see [authentication patterns every developer should know](/backend/authentication-patterns-every-developer-should-know).

### Authorisation Best Practices

- **Check permissions on every request.** Do not rely on hiding UI elements. An attacker will call your API directly.
- **Use the principle of least privilege.** Grant the minimum permissions needed for each role and operation.
- **Validate ownership.** When a user requests a resource, verify they own it or have explicit access. Never trust a user-supplied ID without checking it against the authenticated session.

```typescript
// Bad: only checks if user is logged in
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  return res.json(order);
});

// Good: checks if the order belongs to the authenticated user
app.get('/api/orders/:id', requireAuth, async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order || order.userId !== req.user.id) {
    return res.status(404).json({ error: 'Order not found' });
  }
  return res.json(order);
});
```

## Secure Your CI/CD Pipeline

Your deployment pipeline is a high-value target. If an attacker compromises your CI system, they can inject malicious code into every build.

### Pipeline Hardening Checklist

- **Pin action versions.** Use full commit SHAs rather than mutable tags for GitHub Actions and other CI plugins.
- **Limit secret access.** Only expose secrets to the steps that need them. Use environment-level scoping where your CI platform supports it.
- **Review third-party actions.** Treat CI plugins with the same scrutiny as application dependencies. A compromised action runs with your repository's permissions.
- **Enable branch protection.** Require pull request reviews and passing status checks before merging to your main branch.
- **Sign your commits.** GPG or SSH commit signing provides an additional layer of verification that code came from trusted contributors.

## Threat Modelling for Developers

Threat modelling sounds heavyweight, but it can be as simple as asking four questions before you build a feature:

1. **What are we building?** Draw a simple data flow diagram showing components, data stores, and trust boundaries.
2. **What could go wrong?** Use STRIDE (Spoofing, Tampering, Repudiation, Information Disclosure, Denial of Service, Elevation of Privilege) as a checklist.
3. **What are we going to do about it?** For each threat, decide whether to mitigate, accept, transfer, or avoid the risk.
4. **Did we do a good job?** Review the model when the feature ships and update it as the system evolves.

You do not need a formal session with a whiteboard. Even a 15-minute conversation during sprint planning, asking "how could someone abuse this feature?", catches issues that would otherwise ship to production.

## Integrate Security Into Your Workflow

Security tooling works best when it runs automatically, not when someone remembers to run it manually.

### A Practical Security Toolchain

| Tool Category | Examples | When It Runs |
|---------------|----------|--------------|
| Static analysis (SAST) | Semgrep, CodeQL, SonarQube | On every PR |
| Dependency scanning | Snyk, Dependabot, npm audit | On every PR and on a schedule |
| Secret detection | GitLeaks, TruffleHog | Pre-commit hook and CI |
| Dynamic testing (DAST) | OWASP ZAP, Burp Suite | Staging environment, scheduled |
| Container scanning | Trivy, Grype | On image build |

The key is making security checks non-blocking during development (so they do not slow you down) but blocking before merge (so nothing ships without review).

### Code Review With Security in Mind

Add security to your code review checklist. When reviewing a pull request, ask:

- Does this handle user input safely?
- Are there new dependencies, and have they been evaluated?
- Are secrets or sensitive data logged anywhere?
- Does this change affect authentication or authorisation logic?
- Are error messages safe to expose to end users?

These questions take seconds to consider and catch vulnerabilities that automated tools miss.

## Common Mistakes to Avoid

Even experienced developers make these mistakes under delivery pressure.

- **Verbose error messages in production.** Stack traces, SQL errors, and internal paths help attackers understand your system. Return generic error messages to clients and log detailed errors server-side.
- **Trusting client-side validation alone.** Always validate on the server. Client-side checks are a UX convenience, not a security measure.
- **Using outdated cryptographic algorithms.** MD5 and SHA-1 are broken for security purposes. Use SHA-256 or higher for hashing and AES-256 for encryption.
- **Ignoring CORS configuration.** A wildcard `Access-Control-Allow-Origin: *` on an API that returns private data is an open invitation. Configure CORS to allow only trusted origins.
- **Logging sensitive data.** Audit your log output regularly. Passwords, tokens, and personal data should never appear in logs.

## Getting Started

You do not need to implement everything at once. Start with the highest-impact changes.

1. **This week:** Add a secret scanner to your pre-commit hooks and run `npm audit` (or equivalent) on your main project.
2. **This sprint:** Review your input validation patterns. Are you using parameterised queries everywhere? Is server-side validation comprehensive?
3. **This quarter:** Integrate SAST and dependency scanning into your CI pipeline. Run a lightweight threat modelling session for your next major feature.

Security is not a feature you ship once. It is a practice you build into every line of code, every review, and every deployment. The habits you adopt now will save your team from incidents later.

Start with one improvement today. Your future self (and your users) will thank you.
