---
title: "The Developer's Guide to Logging"
description: "Learn developer logging best practices to debug faster, monitor production systems, and build more reliable software."
publishDate: "2026-02-09"
author: "david-white"
category: "backend"
tags: ["logging", "debugging", "observability", "backend"]
featured: false
draft: false
faqs:
  - question: "What are the standard logging levels and when should I use each one?"
    answer: "The standard levels are TRACE (granular detail), DEBUG (diagnostic info for development), INFO (routine operations like startup and shutdown), WARN (unexpected but recoverable situations), ERROR (failures that need attention), and FATAL (unrecoverable errors). In production, you typically set the minimum level to INFO or WARN to avoid excessive noise."
  - question: "Should I use structured logging or plain text logging?"
    answer: "Structured logging (outputting JSON or key-value pairs) is almost always the better choice for production systems. It makes logs machine-parseable, which is essential for log aggregation tools like the ELK stack, Datadog, or Grafana Loki. Plain text is fine for local development, but structured logs pay for themselves the moment you need to search or filter across thousands of entries."
  - question: "How much logging is too much logging?"
    answer: "If your logs are generating so much volume that they become expensive to store or impossible to search, you have too much. A good rule of thumb is to log at INFO level for business-significant events, WARN for things that might need human attention, and ERROR for actual failures. Reserve DEBUG and TRACE for development. You can always increase verbosity temporarily when diagnosing an issue."
  - question: "What should I never log?"
    answer: "Never log passwords, API keys, authentication tokens, credit card numbers, or any personally identifiable information (PII) such as email addresses or national insurance numbers. Beyond the security risk, logging PII can put you in breach of GDPR and other data protection regulations. Use redaction or masking if you need to reference sensitive values."
  - question: "How do I correlate logs across microservices?"
    answer: "Use a correlation ID (also called a trace ID or request ID). Generate a unique identifier when a request enters your system and pass it through every service call via HTTP headers. Include this ID in every log entry so you can trace a single request across all services using your log aggregation tool."
primaryKeyword: "developer logging best practices"
---

Most developers only think about logging when something has already gone wrong. A production incident hits, you open the logs, and you find either a wall of noise or, worse, nothing useful at all. Good logging is a skill that separates reactive debugging from proactive observability.

In my experience working across multiple production systems over the past decade, the teams that invest in logging early are the ones that sleep through the night. I have personally spent countless hours sifting through poorly structured logs at 3am, and those experiences shaped every recommendation in this guide. What follows are practical logging strategies that will help you debug faster, monitor your systems effectively, and avoid the common pitfalls that make logs useless when you need them most.

## Why Logging Matters More Than You Think

Logging is your primary window into what your application is doing in production. Unlike local development, you cannot attach a debugger to a live server serving thousands of requests. Your logs are often the only evidence you have when diagnosing a 3am incident.

Beyond debugging, well-structured logs enable capacity planning, security auditing, and business analytics. They feed into alerting systems that catch problems before your users do. According to the <a href="https://www.splunk.com/en_us/form/state-of-observability.html" target="_blank" rel="noopener noreferrer">Splunk State of Observability report ↗</a>, organisations with mature observability practices resolve incidents 69% faster than those without. A separate <a href="https://newrelic.com/resources/report/observability-forecast/2025" target="_blank" rel="noopener noreferrer">New Relic Observability Forecast ↗</a> found that teams practising full-stack observability experience 60% fewer outages annually. Investing in logging early saves you from expensive firefighting later.

## Choosing the Right Log Levels

Every logging framework supports severity levels, but surprisingly few teams use them consistently. Here is how to think about each level.

| Level | Purpose | Production Default | Example |
|-------|---------|-------------------|---------|
| TRACE | Extremely granular detail | Off | Variable contents inside a loop |
| DEBUG | Diagnostic information | Off | Method entry/exit, intermediate calculations |
| INFO | Routine operations | On | Server startup, job completed, user authenticated |
| WARN | Unexpected but handled | On | Retry succeeded, cache miss, deprecated endpoint hit |
| ERROR | Failures needing investigation | On | Database timeout, API error, file write failure |
| FATAL | Unrecoverable, app shutting down | On | Out of memory, critical config missing |

### TRACE and DEBUG

These are for development and deep diagnostics. TRACE captures extremely granular detail, such as the contents of every variable in a loop. DEBUG records diagnostic information like method entry and exit points or intermediate calculation results.

Keep these turned off in production by default. The volume they generate can overwhelm your storage and make it harder to find the signals that matter. I have seen teams generate over 500GB of logs per day simply because DEBUG was left on in production after a debugging session. One team I worked with discovered their monthly logging bill had ballooned to over 4,000 pounds before they realised the root cause.

### INFO

INFO is your workhorse level. Use it for events that confirm your application is behaving normally: server startup, configuration loaded, scheduled job completed, user authenticated. These entries form a timeline of your application's life.

A good INFO log tells you what happened and when, without requiring you to read surrounding context.

### WARN

WARN signals something unexpected that your application handled gracefully. A retry that succeeded, a cache miss that fell back to the database, or a deprecated API endpoint that is still receiving traffic. These are not emergencies, but they deserve attention during regular review.

### ERROR and FATAL

ERROR means something failed and needs investigation. A database query timed out, an external API returned an unexpected response, or a file could not be written. FATAL means the application cannot continue and is shutting down.

Always include the exception or error message, a stack trace where available, and enough context to reproduce the problem. Working with teams over the years, I have found that the single biggest logging mistake is logging an error without the context needed to reproduce it.

| Common Logging Mistake | Impact | Fix |
|------------------------|--------|-----|
| Logging errors without context | Cannot reproduce bugs | Always include request ID, user ID, input parameters |
| Leaving DEBUG on in production | Storage costs, signal buried in noise | Use runtime-configurable log levels |
| Logging PII in plain text | GDPR violations, security risk | Redact or hash sensitive fields |
| Inconsistent log formats | Breaks aggregation and search | Adopt structured logging with a shared schema |
| No correlation IDs | Cannot trace requests across services | Generate and propagate request IDs |

## Structured Logging: Stop Writing Plain Text

If you are still logging strings like `"User 12345 placed order for £50.00"`, you are making your future self's job harder. Structured logging outputs each entry as a set of key-value pairs, typically in JSON format.

```json
{
  "timestamp": "2026-02-09T14:23:01Z",
  "level": "INFO",
  "message": "Order placed",
  "userId": 12345,
  "orderId": "ORD-98765",
  "amount": 50.00,
  "currency": "GBP"
}
```

This format lets you filter, aggregate, and search across millions of log entries. Want to find all errors for a specific user? That is a simple query. Want to calculate average order value from your logs? Also straightforward. With plain text, both of those tasks require fragile regex parsing.

### Structured Logging Libraries by Language

| Language | Recommended Library | Notes |
|----------|-------------------|-------|
| Node.js | pino, winston | pino is faster; winston has more transports |
| Python | structlog, built-in logging | structlog offers cleaner API |
| Java | SLF4J + Logback (JSON encoder) | Industry standard |
| Go | zerolog, zap | Both offer high-performance structured output |
| Ruby | Semantic Logger | Integrates well with Rails |
| .NET | Serilog | Excellent structured logging with enrichers |

The <a href="https://github.com/pinojs/pino" target="_blank" rel="noopener noreferrer">pino documentation ↗</a> provides excellent examples of structured logging patterns in Node.js if you want to see this in practice.

## What to Log (and What Not To)

### Always Log

- **Request and response metadata**: HTTP method, path, status code, response time, and correlation ID.
- **Business events**: User registration, payment processed, subscription cancelled. These are invaluable for both debugging and analytics.
- **State transitions**: Order status changes, deployment events, feature flag toggles.
- **Errors with context**: The error message alone is rarely enough. Include the input that caused the failure, the state of the system, and any relevant identifiers.

### Never Log

- **Secrets**: Passwords, API keys, tokens, and connection strings. Even in DEBUG mode, these should be redacted.
- **PII without justification**: Email addresses, phone numbers, and other personal data create GDPR liability. If you must log an identifier, use a hashed or tokenised version.
- **High-frequency noise**: Logging every iteration of a tight loop or every healthcheck response will bury the useful information.

## Correlation IDs: Tracing Requests Across Services

In a distributed system, a single user action might trigger calls across five or ten services. Without a way to link those calls together, debugging becomes guesswork. If you are working with [microservices](/architecture/the-pragmatic-approach-to-microservices), correlation IDs are not optional; they are essential.

The solution is a correlation ID. Generate a UUID when a request enters your system at the API gateway or load balancer. Pass it downstream via an HTTP header (commonly `X-Request-ID` or `X-Correlation-ID`). Every service includes this ID in its log entries.

```javascript
// Express middleware example
app.use((req, res, next) => {
  req.correlationId = req.headers['x-correlation-id'] || crypto.randomUUID();
  res.setHeader('x-correlation-id', req.correlationId);
  next();
});
```

When an incident occurs, you search for that single ID and get the complete picture across every service. This practice ties closely into the broader discipline of [observability](/devops/observability-vs-monitoring-what-developers-need-to-know). Building robust, traceable [APIs](/backend/api-design-principles-every-developer-should-know) depends on getting this right from the start.

## Log Aggregation and Centralisation

Logs sitting on individual servers are useful only if you know which server to check. For any system with more than one instance, centralise your logs using a dedicated platform.

Popular options include the **ELK stack** (Elasticsearch, Logstash, Kibana), **Grafana Loki** (lightweight and cost-effective), **Datadog**, and **AWS CloudWatch**. The choice depends on your budget, scale, and existing infrastructure.

Whichever tool you choose, ensure your logs are searchable within seconds of being emitted. A log aggregation system with a 15-minute delay is significantly less useful during an active incident.

<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the flow of logs from application instances through a log shipper to a centralised aggregation platform and then to dashboards and alerts">
  <style>
    .log-title { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; fill: #334155; }
    .log-label { font-family: 'Inter', sans-serif; font-size: 11px; fill: #64748b; }
    .log-box { rx: 8; ry: 8; }
  </style>
  <rect x="10" y="60" width="110" height="50" class="log-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="65" y="88" text-anchor="middle" class="log-label">App Instance 1</text>
  <rect x="10" y="130" width="110" height="50" class="log-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="65" y="158" text-anchor="middle" class="log-label">App Instance 2</text>
  <rect x="10" y="200" width="110" height="50" class="log-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="65" y="228" text-anchor="middle" class="log-label">App Instance 3</text>
  <line x1="120" y1="85" x2="200" y2="155" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowhead)"/>
  <line x1="120" y1="155" x2="200" y2="155" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowhead)"/>
  <line x1="120" y1="225" x2="200" y2="155" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowhead)"/>
  <rect x="200" y="120" width="120" height="70" class="log-box" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5"/>
  <text x="260" y="150" text-anchor="middle" class="log-label">Log Shipper</text>
  <text x="260" y="168" text-anchor="middle" class="log-label">(Fluentd/Vector)</text>
  <line x1="320" y1="155" x2="380" y2="155" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowhead)"/>
  <rect x="380" y="110" width="130" height="90" class="log-box" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
  <text x="445" y="145" text-anchor="middle" class="log-label">Aggregation</text>
  <text x="445" y="163" text-anchor="middle" class="log-label">(ELK / Loki /</text>
  <text x="445" y="181" text-anchor="middle" class="log-label">Datadog)</text>
  <line x1="510" y1="135" x2="540" y2="85" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowhead)"/>
  <line x1="510" y1="175" x2="540" y2="225" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arrowhead)"/>
  <rect x="540" y="55" width="55" height="50" class="log-box" fill="#f0fdf4" stroke="#22c55e" stroke-width="1.5"/>
  <text x="567" y="83" text-anchor="middle" class="log-label">Dashboards</text>
  <rect x="540" y="200" width="55" height="50" class="log-box" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
  <text x="567" y="228" text-anchor="middle" class="log-label">Alerts</text>
  <text x="300" y="30" text-anchor="middle" class="log-title">Centralised Log Aggregation Flow</text>
  <defs>
    <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>

## Alerting on Log Patterns

Centralised logs become even more powerful when you build alerts on top of them. Configure your monitoring tool to notify you when specific patterns emerge.

- Error rate exceeds a threshold (for example, more than 5% of requests returning 500 errors)
- A specific error message appears for the first time
- A critical business event stops occurring (for example, zero orders processed in the last 30 minutes)

Alerting turns your logs from a passive record into an active early warning system. If you are running a mature [CI/CD pipeline](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works), your alerting should be as well-tested as your deployment process.

## Performance Considerations

Logging is not free. Every log statement involves string formatting, I/O operations, and potentially network calls if you are shipping logs to a remote service. At high throughput, careless logging can measurably impact your application's latency.

Write logs asynchronously wherever possible. Buffer entries and flush them in batches rather than writing each one individually. Use sampling for extremely high-volume events, logging one in every hundred healthcheck responses rather than all of them.

Most importantly, make your log levels configurable at runtime. The ability to temporarily increase verbosity on a single service without redeploying is invaluable for diagnosing production issues. [Feature flags](/devops/feature-flags-a-practical-introduction) can be an effective mechanism for toggling log verbosity in production.

## Getting Started

If your current logging is inconsistent or minimal, start with three changes. First, adopt structured logging with a consistent schema across all your services. Second, add correlation IDs to every request that crosses a service boundary. Third, centralise your logs into a searchable platform with basic alerting.

These three steps will transform your ability to understand and debug your systems. For guidance on the broader monitoring picture, see our guide to [observability vs monitoring](/devops/observability-vs-monitoring-what-developers-need-to-know). If you want to strengthen how your applications handle failures gracefully before they become log entries, our guide to [building resilient APIs](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns) is a natural next step. Everything else is refinement.
