---
title: "The Developer's Guide to API Versioning"
description: "A practical guide to API versioning strategies, from URL paths and headers to semantic versioning, with real-world examples and trade-offs."
publishDate: "2026-04-16"
author: "david-white"
category: "backend"
tags: ["api-versioning", "api-design", "backend", "rest-api", "breaking-changes"]
featured: false
draft: false
faqs:
  - question: "When should I create a new API version?"
    answer: "Create a new version when you need to make a breaking change that would break existing clients. This includes removing fields, changing response structures, renaming endpoints, or altering authentication mechanisms. Additive changes like new optional fields or new endpoints do not require a new version."
  - question: "What is the most common API versioning strategy?"
    answer: "URL path versioning (e.g. /v1/users) is the most widely adopted approach. It is simple to implement, easy to understand, and visible in every request. Most public APIs including GitHub, Stripe, and Google use some form of path or date-based versioning."
  - question: "How many API versions should I support at once?"
    answer: "Two is the practical minimum for any production API: the current version and the previous one. Supporting more than three concurrently creates significant maintenance overhead. Publish a clear deprecation timeline so consumers know when older versions will be retired."
  - question: "Should I version my internal APIs?"
    answer: "It depends on your team structure. If separate teams own the client and server, versioning helps prevent deployment coordination problems. If the same team owns both sides and deploys them together, versioning adds overhead without much benefit. A reasonable middle ground is to version internal APIs only at major boundaries."
  - question: "What is the difference between API versioning and semantic versioning?"
    answer: "API versioning determines how consumers select which version of your API to call (via URL path, header, or query parameter). Semantic versioning (semver) is a numbering convention (MAJOR.MINOR.PATCH) that communicates the nature of changes. They complement each other: your API might be at v2, and v2 might follow semver internally as 2.3.1."
primaryKeyword: "API versioning"
---

Every API that serves more than one consumer will eventually face the same question: how do you change your API without breaking the applications that already depend on it?

The answer is versioning. But choosing the right versioning strategy is not straightforward. Get it wrong and you end up maintaining parallel codebases, confusing your consumers, or painting yourself into a corner where every change requires a major version bump.

This guide walks through the most common API versioning strategies, their trade-offs, and practical guidance on when to use each one. If you are building or maintaining an API, this will help you make a decision you can live with for years rather than months.

## Why You Need API Versioning

APIs are contracts. When a consumer integrates with your API, they write code that depends on specific endpoints, request formats, and response structures. Change any of those without warning and their application breaks.

Without versioning, you have two bad options:

- **Never make breaking changes.** This limits your ability to improve the API and leads to awkward workarounds that accumulate over time.
- **Break consumers whenever you need to.** This destroys trust and makes your API painful to integrate with.

Versioning gives you a third option: evolve the API while giving consumers a stable target. They choose when to migrate, and you set a timeline for retiring old versions.

This sits alongside other [API design principles](/backend/api-design-principles-every-developer-should-know) like consistent naming and predictable error handling. Versioning is not an afterthought. It is a foundational design decision.

## Common API Versioning Strategies

### URL Path Versioning

The most popular approach. The version number appears directly in the URL path.

```
GET /v1/users/123
GET /v2/users/123
```

**Advantages:**

- Immediately visible in every request, log entry, and documentation page.
- Simple to route at the infrastructure level (load balancers, API gateways).
- Easy for consumers to understand and adopt.

**Disadvantages:**

- Changing the version changes the URL, which can complicate caching and bookmarking.
- Encourages large, infrequent version bumps rather than gradual evolution.

URL path versioning is the right default for most public APIs. It is the approach used by GitHub, Twitch, and many others.

### Header Versioning

The version is specified in a custom request header, keeping the URL clean.

```
GET /users/123
Accept-Version: v2
```

Or using content negotiation:

```
GET /users/123
Accept: application/vnd.myapi.v2+json
```

**Advantages:**

- URLs remain stable across versions.
- Separates the resource identifier from the version, which is more RESTful in theory.

**Disadvantages:**

- Invisible in browser address bars and most log aggregators.
- Harder for consumers to test manually (requires setting headers rather than just changing a URL).
- More complex to route at the infrastructure level.

Header versioning suits internal APIs where consumers are sophisticated and URL stability matters.

### Query Parameter Versioning

The version is passed as a query parameter.

```
GET /users/123?version=2
```

**Advantages:**

- Easy to add to existing APIs without restructuring URLs.
- Optional: you can default to the latest version if no parameter is provided.

**Disadvantages:**

- Query parameters are typically associated with filtering and pagination, not versioning. This can confuse consumers.
- Caching behaviour varies because the query string is part of the cache key.

This approach works as a quick solution but is generally less clean than path or header versioning for long-lived APIs.

## Comparing Versioning Strategies

| Strategy | Visibility | Implementation Complexity | URL Stability | Best For |
|----------|-----------|--------------------------|---------------|----------|
| URL path | High | Low | Changes per version | Public APIs |
| Header | Low | Medium | Stable | Internal APIs |
| Query parameter | Medium | Low | Stable (with caveats) | Quick additions |
| Content negotiation | Low | High | Stable | Hypermedia APIs |

There is no universally correct answer. The best strategy depends on your consumers, your infrastructure, and how frequently you expect breaking changes.

## Semantic Versioning for APIs

<a href="https://semver.org/" target="_blank" rel="noopener noreferrer">Semantic versioning (semver) ↗</a> provides a structured way to communicate the nature of changes through version numbers.

The format is **MAJOR.MINOR.PATCH**:

- **MAJOR** (v1 to v2): Breaking changes that require consumer updates.
- **MINOR** (v2.1 to v2.2): New features that are backwards compatible.
- **PATCH** (v2.2.0 to v2.2.1): Bug fixes with no API surface changes.

For public APIs, the major version is typically what consumers see (v1, v2). Minor and patch versions are tracked internally and communicated through changelogs.

The key discipline is defining what constitutes a breaking change. Removing a field is clearly breaking. Adding an optional field is not. Changing the type of an existing field is breaking. Adding a new endpoint is not.

Document your definition explicitly so your team applies it consistently.

## When to Create a New Version

Not every change warrants a new version. Here is a practical framework:

**Requires a new major version:**
- Removing or renaming a field in the response
- Changing the type or structure of an existing field
- Removing or renaming an endpoint
- Changing authentication or authorisation mechanisms
- Altering error response formats

**Does not require a new version:**
- Adding a new optional field to a response
- Adding a new endpoint
- Adding a new optional query parameter
- Improving performance without changing the contract
- Fixing a bug where the previous behaviour did not match the documentation

When in doubt, ask yourself: will this change cause an existing, correctly written client to fail? If yes, it is a breaking change.

## Deprecation and Sunset Policies

Creating new versions is only half the problem. You also need a plan for retiring old ones. Supporting multiple versions indefinitely is not sustainable. Each version you maintain doubles the surface area for bugs, security patches, and testing.

A good deprecation policy includes:

1. **Advance notice.** Give consumers at least 6 to 12 months between the deprecation announcement and the shutdown date.
2. **Deprecation headers.** Include a `Sunset` or `Deprecation` header in responses from deprecated versions so automated tools can detect it.
3. **Migration guides.** Document exactly what changed and how to update. Generic "see the new docs" messages are not sufficient.
4. **Usage monitoring.** Track how many consumers are still calling deprecated versions. Reach out to high-volume users directly.

This ties into broader API resilience practices. Our guide to [retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns) covers the consumer side of handling API changes gracefully.

## Real-World Versioning: Lessons from Stripe

<a href="https://docs.stripe.com/api/versioning" target="_blank" rel="noopener noreferrer">Stripe's API versioning ↗</a> is one of the most cited examples in the industry, and for good reason. Rather than numbered versions, Stripe uses date-based versioning.

Each API key is pinned to the version that was current when the key was created. Stripe can ship breaking changes continuously because each change is associated with a date, and older keys continue to receive the behaviour they expect.

When a consumer is ready to upgrade, they update their API version in the dashboard and work through any breaking changes documented in Stripe's changelog.

This approach works because Stripe invests heavily in backwards compatibility layers. Each breaking change is implemented as a version transform that converts between the old and new format. It is elegant but requires significant engineering investment.

For most teams, date-based versioning is overkill. But the principle of pinning consumers to a specific version and letting them upgrade on their own timeline is worth adopting regardless of your versioning strategy.

## Practical Tips for Getting Versioning Right

**Start with v1, not v0.** Launching at v0 signals instability and makes it awkward when you want to mark the API as production-ready.

**Do not version too eagerly.** If you are releasing v5 within your first year, your API design process needs attention. Frequent major versions erode consumer confidence.

**Use additive changes wherever possible.** Adding optional fields, new endpoints, and new query parameters lets you evolve without breaking anyone. This reduces the pressure to create new versions.

**Version the contract, not the implementation.** Internal refactoring, database migrations, and performance improvements should not change the API version. Consumers care about the interface, not what happens behind it.

**Test backwards compatibility.** Maintain a suite of integration tests that call your API as a consumer from each supported version. This catches accidental breaking changes before they reach production. Our guide to [API rate limiting](/backend/the-developers-guide-to-api-rate-limiting) is another aspect worth testing across versions.

**Document your versioning strategy publicly.** Whether you use URL paths, headers, or date-based versioning, make it easy for consumers to understand how versions work, how long each version will be supported, and where to find migration guides.

## Choosing Your Strategy

If you are building a new API and need to pick a versioning strategy today, here is a decision framework:

- **Building a public API** with external consumers? Use URL path versioning. It is the most widely understood and the easiest to get right.
- **Building an internal API** where both sides are under your control? Consider header versioning or skip formal versioning entirely if you can coordinate deployments.
- **Building a platform API** with thousands of consumers and frequent changes? Look at date-based versioning, but be prepared for the engineering investment.

Whatever you choose, the most important thing is to choose deliberately. Bolting on versioning after your API is in production is significantly harder than designing it in from the start.

API versioning is one of those decisions that feels small early on and becomes load-bearing as your system grows. Choosing the right approach for your API, and understanding how to [choose between REST and GraphQL](/backend/graphql-vs-rest-choosing-the-right-api-style) in the first place, sets you up for an API that can evolve without breaking the trust of the people who depend on it.
