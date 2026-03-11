---
title: "API Design Principles Every Developer Should Know"
description: "Essential API design principles every developer should know, covering naming, versioning, error handling, pagination, and real-world best practices."
publishDate: "2026-02-21"
author: "david-white"
category: "backend"
tags: ["api-design", "rest", "backend", "best-practices"]
featured: false
draft: false
faqs:
  - question: "Should I use REST or GraphQL for my API?"
    answer: "REST is the better default for most APIs. It is simpler, better understood, more cacheable, and has mature tooling. GraphQL shines when clients need flexible queries across complex, interconnected data, or when you serve multiple clients with very different data requirements."
  - question: "How should I version my API?"
    answer: "URL path versioning (e.g., /v1/users) is the most common and most practical approach. It is visible, easy to route, and simple to understand. Header-based versioning is technically cleaner but harder for consumers to discover and test."
  - question: "What HTTP status codes should I use for errors?"
    answer: "Use 400 for invalid client input, 401 for missing authentication, 403 for insufficient permissions, 404 for resources that do not exist, 409 for conflicts, 422 for valid syntax with semantic errors, and 500 for unexpected server errors. Be consistent across your entire API."
  - question: "Should I use plural or singular nouns for resource names?"
    answer: "Use plural nouns consistently. Collections are /users, and a specific resource is /users/123. Mixing singular and plural creates confusion and inconsistency."
  - question: "How do I handle pagination in a REST API?"
    answer: "Cursor-based pagination is preferred for most use cases. It handles data that changes between requests and scales better than offset-based pagination. Return a next cursor with each response and let the client pass it back to fetch the next page."
primaryKeyword: "API design principles"
---

A well-designed API is invisible. Developers integrate with it, build on top of it, and rarely think about the design decisions behind it because everything just works. A poorly designed API generates support tickets, lengthy documentation, and a constant stream of questions in your Slack channels.

The difference between the two is not talent or luck. It is a set of principles applied consistently from the start. In my experience designing and maintaining APIs consumed by both internal teams and external partners, the principles below are the ones that have the greatest impact on developer satisfaction and long-term maintainability.

## Name Things for Humans

API naming is communication. Every endpoint, parameter, and field name is a contract with the developer consuming your API.

### Use nouns for resources, not verbs

REST endpoints represent resources, not actions. The HTTP method conveys the action.

```
Good:
GET    /users
POST   /users
GET    /users/123
PUT    /users/123
DELETE /users/123

Bad:
GET    /getUsers
POST   /createUser
POST   /deleteUser/123
```

### Be consistent with naming conventions

Pick one convention and apply it everywhere. Most JSON APIs use camelCase for field names. Some use snake_case. Either is fine; mixing them is not.

```json
{
  "firstName": "Alice",
  "lastName": "Smith",
  "createdAt": "2026-02-21T10:30:00Z"
}
```

### Use clear, unambiguous names

A field called `status` could mean anything. `orderStatus`, `paymentStatus`, or `accountStatus` communicates intent. `type` is similarly vague without context. Be specific enough that a developer reading the response can understand the field without checking documentation.

## Design Your Error Responses Carefully

Error handling is where most APIs fall apart. A generic 500 response with no body tells the consumer nothing. A well-structured error response tells them exactly what went wrong and how to fix it.

### Use a consistent error format

Every error response from your API should follow the same structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request body contains invalid fields.",
    "details": [
      {
        "field": "email",
        "message": "Must be a valid email address."
      },
      {
        "field": "age",
        "message": "Must be a positive integer."
      }
    ]
  }
}
```

The machine-readable `code` lets clients handle errors programmatically. The human-readable `message` helps developers during integration. The `details` array pinpoints exactly which fields failed validation.

### Choose status codes deliberately

Use the narrowest applicable HTTP status code. The table below covers the codes you will use most frequently.

| Status Code | Name | When to Use |
|---|---|---|
| 400 | Bad Request | Malformed syntax, missing required fields |
| 401 | Unauthorised | No valid authentication provided |
| 403 | Forbidden | Authenticated but not permitted |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Request conflicts with current state (e.g., duplicate email) |
| 422 | Unprocessable Entity | Valid syntax but semantic errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Something unexpected went wrong on the server |

Do not return 200 for errors. Do not return 500 for validation failures. The status code is the first thing a consumer checks; make it meaningful.

## Pagination That Scales

Any endpoint that returns a list should support pagination from day one. Retrofitting pagination onto an existing endpoint is a breaking change.

### Cursor-based pagination

Cursor-based pagination uses an opaque token to mark the position in the result set:

```
GET /users?limit=20&cursor=eyJpZCI6MTAwfQ
```

```json
{
  "data": [...],
  "pagination": {
    "nextCursor": "eyJpZCI6MTIwfQ",
    "hasMore": true
  }
}
```

The cursor is typically a base64-encoded representation of the last item's sort key. The consumer does not need to understand what is inside it; they just pass it back.

### Why cursors over offsets

Offset-based pagination (`?page=5&limit=20`) breaks when data changes between requests. If items are inserted or deleted, the consumer can see duplicates or miss items entirely. Cursors are stable regardless of data mutations.

Cursor pagination also performs better at scale. `OFFSET 10000` requires the database to scan and discard 10,000 rows. A cursor translates to a `WHERE id > 100` clause, which uses an index efficiently. If you are working with databases at scale, understanding [SQL fundamentals](/backend/why-every-developer-should-learn-sql) makes these performance differences much clearer.

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram comparing offset-based and cursor-based pagination performance at scale">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="700" height="320" fill="#f8fafc" rx="8"/>
  <text x="350" y="30" text-anchor="middle" font-size="16" font-weight="600" fill="#334155">Pagination Performance: Offset vs Cursor</text>
  <!-- Axes -->
  <line x1="100" y1="55" x2="100" y2="260" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="100" y1="260" x2="640" y2="260" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Y axis label -->
  <text x="35" y="157" text-anchor="middle" font-size="12" fill="#64748b" transform="rotate(-90, 35, 157)">Response Time (ms)</text>
  <!-- X axis label -->
  <text x="370" y="290" text-anchor="middle" font-size="12" fill="#64748b">Number of Records in Table</text>
  <!-- X axis ticks -->
  <text x="170" y="278" text-anchor="middle" font-size="10" fill="#64748b">1K</text>
  <text x="280" y="278" text-anchor="middle" font-size="10" fill="#64748b">10K</text>
  <text x="390" y="278" text-anchor="middle" font-size="10" fill="#64748b">100K</text>
  <text x="500" y="278" text-anchor="middle" font-size="10" fill="#64748b">1M</text>
  <text x="610" y="278" text-anchor="middle" font-size="10" fill="#64748b">10M</text>
  <!-- Y axis ticks -->
  <text x="90" y="255" text-anchor="end" font-size="10" fill="#64748b">0</text>
  <text x="90" y="205" text-anchor="end" font-size="10" fill="#64748b">50</text>
  <text x="90" y="155" text-anchor="end" font-size="10" fill="#64748b">100</text>
  <text x="90" y="105" text-anchor="end" font-size="10" fill="#64748b">200</text>
  <text x="90" y="70" text-anchor="end" font-size="10" fill="#64748b">500</text>
  <!-- Offset line (curves up steeply) -->
  <polyline points="170,248 280,235 390,200 500,130 610,72" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Cursor line (stays flat) -->
  <polyline points="170,250 280,249 390,248 500,247 610,245" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
  <!-- Legend -->
  <line x1="420" y1="55" x2="450" y2="55" stroke="#ef4444" stroke-width="2.5"/>
  <text x="458" y="59" font-size="11" fill="#334155">Offset-based (OFFSET n)</text>
  <line x1="420" y1="75" x2="450" y2="75" stroke="#22c55e" stroke-width="2.5"/>
  <text x="458" y="79" font-size="11" fill="#334155">Cursor-based (WHERE id > n)</text>
  <!-- Annotation -->
  <text x="350" y="305" text-anchor="middle" font-size="11" fill="#64748b">Cursor pagination maintains constant performance regardless of dataset size</text>
</svg>

## Versioning Without Pain

APIs evolve. Fields get added, behaviour changes, and occasionally endpoints need to be restructured. Versioning is how you make these changes without breaking existing consumers.

### URL path versioning

```
GET /v1/users
GET /v2/users
```

This is the most common approach and for good reason. It is visible in logs, easy to route at the infrastructure level, and obvious to consumers. The <a href="https://learn.microsoft.com/en-us/azure/architecture/best-practices/api-design" target="_blank" rel="noopener noreferrer">Microsoft Azure API design guidelines ↗</a> recommend this approach for its clarity and simplicity.

### When to bump the version

Only create a new version for breaking changes: removing fields, changing response structure, altering the meaning of existing fields, or modifying authentication flows.

Additive changes (new fields, new endpoints) should not require a version bump. Design your consumers to ignore unknown fields, and your API becomes forward-compatible.

### Sunset old versions gracefully

When deprecating a version, communicate the timeline clearly. Return deprecation headers, update documentation, and give consumers at least six months to migrate.

```
Sunset: Sat, 01 Mar 2027 00:00:00 GMT
Deprecation: true
```

## Idempotency for Safe Retries

Network failures happen. If a client sends a POST request and the connection drops before the response arrives, did the server process it? Without idempotency, the client cannot safely retry.

### Idempotency keys

Let clients provide an idempotency key with requests that create or modify resources:

```
POST /payments
Idempotency-Key: abc-123-def-456
```

If the server has already processed a request with that key, it returns the original response instead of creating a duplicate. This makes retries safe and prevents double-charges, duplicate orders, and similar issues. For APIs that handle financial transactions or critical workflows, I have found idempotency keys to be non-negotiable. Building [resilient API patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns) like retry logic and circuit breakers on the client side works best when the server supports idempotent operations.

## Rate Limiting and Fair Usage

Protect your API and its consumers by implementing rate limiting from the start.

### Communicate limits clearly

Return rate limit headers with every response:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 847
X-RateLimit-Reset: 1708531200
```

When a client exceeds the limit, return 429 with a `Retry-After` header telling them when they can try again.

### Differentiate by endpoint

Not all endpoints are equally expensive. A search endpoint that queries a full-text index should have a lower rate limit than a simple resource lookup. Apply limits proportionally to the computational cost.

## Documentation Is Part of the API

An undocumented API is an unusable API. Treat documentation as a first-class deliverable, not an afterthought. As I explore in my piece on [writing documentation developers actually read](/collaboration/writing-documentation-developers-actually-read), the format and accessibility of your docs matter as much as their content.

### Generate from your code

Use <a href="https://swagger.io/specification/" target="_blank" rel="noopener noreferrer">OpenAPI (Swagger) specifications ↗</a> to define your API and generate documentation automatically. This keeps the documentation synchronised with the implementation and provides consumers with interactive exploration tools.

### Include realistic examples

Every endpoint should include a complete request and response example using realistic data. Do not use placeholder values like "string" or "0." Show what an actual response looks like.

### Document error scenarios

Consumers need to know what can go wrong, not just what the happy path looks like. Document every error code, the conditions that trigger it, and how to resolve it.

## Principles Over Dogma

These principles are not rules to follow blindly. They are guidelines that reduce friction for the developers consuming your API. The underlying goal is always the same: make the API predictable, consistent, and hard to misuse.

An API that follows these principles will not just work today. It will be maintainable, extendable, and pleasant to integrate with for years to come.
