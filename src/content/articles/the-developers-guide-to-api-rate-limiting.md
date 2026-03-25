---
title: "The Developer's Guide to API Rate Limiting"
description: "A practical guide to API rate limiting. Covers algorithms, implementation patterns, response headers, and best practices for resilient APIs."
publishDate: "2026-03-25"
author: "david-white"
category: "backend"
tags: ["api-design", "rate-limiting", "backend", "security", "scalability", "redis"]
featured: false
draft: false
faqs:
  - question: "What is API rate limiting?"
    answer: "Rate limiting controls how many requests a client can make to your API within a given time window. When a client exceeds the limit, the API returns a 429 Too Many Requests response instead of processing the request. It protects your infrastructure from abuse, ensures fair usage across clients, and prevents a single user from degrading the experience for everyone else."
  - question: "What HTTP status code should I return when a client is rate limited?"
    answer: "Return 429 Too Many Requests. Include a Retry-After header with the number of seconds the client should wait before retrying. Avoid returning 403 Forbidden or 503 Service Unavailable for rate limiting, as those codes have different semantic meanings and will confuse API consumers."
  - question: "Should I rate limit by IP address or by API key?"
    answer: "API key is generally better for authenticated APIs because it ties limits to a specific consumer regardless of their IP. IP-based limiting works well as a first line of defence for public endpoints or login pages. Many production systems use both: IP limiting at the edge to block abuse, and API key limiting at the application layer for fair usage."
  - question: "How do I choose the right rate limit for my API?"
    answer: "Start by measuring actual usage. Look at the 95th percentile of requests per client over a reasonable window. Set your limit above that to avoid blocking legitimate traffic, but low enough to protect your infrastructure. Common starting points are 60 to 120 requests per minute for standard APIs and 10 to 30 per minute for expensive operations like search or file uploads. Monitor and adjust based on real data."
  - question: "What is the difference between rate limiting and throttling?"
    answer: "Rate limiting rejects requests that exceed the limit, typically with a 429 response. Throttling slows requests down by queuing them or adding artificial delay rather than rejecting them outright. Rate limiting is simpler and more common for public APIs. Throttling is sometimes used internally to smooth traffic spikes without dropping requests."
primaryKeyword: "API rate limiting"
---

Every API that faces the internet needs rate limiting. Without it, a single misbehaving client, a runaway script, or a deliberate attack can bring your entire service down. Rate limiting is not a nice-to-have. It is a fundamental part of building APIs that are reliable, fair, and secure.

Despite this, rate limiting is often bolted on as an afterthought, implemented inconsistently, or skipped entirely because "we will add it later." This guide covers the core algorithms, implementation patterns, and best practices you need to build rate limiting properly from the start.

## Why rate limiting matters

Rate limiting solves three problems at once:

1. **Protection.** It prevents abuse, whether that is a DDoS attack, a scraper pulling your entire dataset, or a bug in a client application that fires thousands of requests in a loop.
2. **Fairness.** Without limits, a single heavy user can consume all your capacity, degrading the experience for everyone else.
3. **Stability.** Rate limiting acts as a pressure valve. Even well-intentioned traffic spikes (a product launch, a viral post) can overwhelm your infrastructure if there is no mechanism to shed excess load.

If you have read our guide on [building resilient APIs with retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns), rate limiting is the server-side counterpart to those client-side patterns. Retries and circuit breakers help your client cope with failures. Rate limiting helps your server prevent them.

## Rate limiting algorithms

There are four main algorithms, each with different trade-offs. Understanding them helps you pick the right one for your use case.

### Fixed window

The simplest approach. Divide time into fixed windows (say, one minute), count requests per client in each window, and reject any that exceed the limit.

**How it works:**
- Window: 12:00:00 to 12:00:59
- Limit: 100 requests per minute
- Client sends request #101 at 12:00:45: rejected with 429

**Pros:** Simple to implement, low memory usage (one counter per client per window).

**Cons:** Vulnerable to burst traffic at window boundaries. A client could send 100 requests at 12:00:59 and another 100 at 12:01:00, effectively getting 200 requests in two seconds.

### Sliding window log

Tracks the exact timestamp of every request and counts how many fall within a rolling window.

**How it works:**
- Store timestamps: [12:00:01, 12:00:15, 12:00:42, ...]
- For each new request, discard timestamps older than one minute, then count

**Pros:** Precise. No boundary burst problem.

**Cons:** High memory usage. Storing every timestamp per client does not scale well with high traffic volumes.

### Sliding window counter

A hybrid that approximates the sliding window using two fixed window counters. This is the approach <a href="https://blog.cloudflare.com/counting-things-a-lot-of-different-things/" target="_blank" rel="noopener noreferrer">Cloudflare uses at scale ↗</a>, processing billions of requests daily with minimal memory overhead.

**How it works:**
- Track counts for the current and previous fixed window
- Weight the previous window's count by how much of it overlaps with the sliding window
- If you are 30 seconds into the current minute: estimate = (current count) + (previous count × 0.5)

**Pros:** Near-accurate with very low memory usage (two counters per client). No boundary burst problem.

**Cons:** It is an approximation. In practice, the error rate is negligible (Cloudflare reports just 0.003% of requests incorrectly classified).

### Token bucket

Each client has a "bucket" that holds tokens. Tokens are added at a fixed rate. Each request consumes one token. If the bucket is empty, the request is rejected.

**How it works:**
- Bucket capacity: 10 tokens
- Refill rate: 1 token per second
- Client sends a burst of 10 requests: all allowed (bucket drains to 0)
- Client waits 5 seconds: bucket refills to 5, allowing another burst

**Pros:** Naturally allows short bursts while enforcing an average rate. Very flexible.

**Cons:** Slightly more complex to implement. Requires tracking both the token count and the last refill time.

### Choosing the right algorithm

| Algorithm | Memory | Accuracy | Burst handling | Complexity | Best for |
|---|---|---|---|---|---|
| Fixed window | Very low | Low (boundary bursts) | Poor | Simple | Internal APIs, prototyping |
| Sliding window log | High | Exact | Good | Moderate | Low-traffic APIs needing precision |
| Sliding window counter | Very low | Near-exact | Good | Moderate | High-traffic production APIs |
| Token bucket | Low | Good | Excellent | Moderate | Public APIs with burst allowances |

## Implementation patterns

### Where to enforce limits

You have three main options for where rate limiting logic lives.

**At the edge (CDN/reverse proxy).** Tools like Cloudflare, AWS WAF, or Nginx can enforce IP-based limits before traffic reaches your application. This is your first line of defence against volumetric attacks.

**At the API gateway.** If you use a gateway like Kong, AWS API Gateway, or Traefik, rate limiting is typically a built-in plugin. This is a good place for API key-based limits across all your services.

**In the application.** Application-level limiting gives you the most flexibility. You can set different limits per endpoint, per user tier, or per operation cost. This is where business logic-aware limiting lives.

Most production systems use at least two of these layers. Edge limiting catches the worst abuse; application limiting enforces the nuanced rules.

### Using Redis for distributed rate limiting

If your API runs on more than one server, you need a shared counter. Redis is the standard choice for this because it is fast, supports atomic operations, and is designed for exactly this kind of workload.

Here is a simplified fixed window implementation using Redis:

```
# Pseudocode for fixed window rate limiting with Redis

key = "rate:{client_id}:{current_minute}"

count = Redis.INCR(key)

if count == 1:
    Redis.EXPIRE(key, 60)  # Set TTL on first request

if count > LIMIT:
    return 429 Too Many Requests

# Process request normally
```

For a more robust approach, wrap the `INCR` and `EXPIRE` in a <a href="https://redis.io/glossary/rate-limiting/" target="_blank" rel="noopener noreferrer">Redis transaction ↗</a> to ensure they execute atomically. This prevents a race condition where the key gets incremented but the expiry is never set.

If you are already using Redis for caching, you can reuse the same instance. Our guide on [caching strategies every developer should know](/backend/caching-strategies-every-developer-should-know) covers Redis setup and best practices.

### Rate limiting by operation cost

Not all API requests are equal. A simple GET that reads from cache is far cheaper than a POST that triggers a complex workflow, sends emails, or writes to multiple databases.

Rather than giving every endpoint the same limit, assign a cost to each operation:

| Operation | Cost (tokens) | Example |
|---|---|---|
| Read from cache | 1 | GET /users/:id |
| Read from database | 2 | GET /users?search=query |
| Simple write | 5 | POST /comments |
| Complex write | 10 | POST /orders |
| File upload | 20 | POST /uploads |

A client with a budget of 100 tokens per minute could make 100 cached reads, or 10 complex writes, or any combination that totals 100. This is fairer and more aligned with actual infrastructure cost than a flat request count.

## Response headers and the 429 status code

Good rate limiting is not just about blocking requests. It is about communicating clearly so clients can adapt their behaviour.

### Standard headers

The <a href="https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/" target="_blank" rel="noopener noreferrer">IETF RateLimit header fields draft ↗</a> defines a standard that is gaining adoption. The two key headers are:

- **RateLimit-Policy**: describes your quota rules (e.g., `100;w=60` means 100 requests per 60-second window)
- **RateLimit**: reports the remaining quota (e.g., `remaining=42, reset=28` means 42 requests left, window resets in 28 seconds)

Include these headers on every response, not just 429s. This lets well-behaved clients self-regulate before they hit the limit.

### The Retry-After header

When you do return a 429, always include a `Retry-After` header. This tells the client exactly how long to wait before trying again.

```
HTTP/1.1 429 Too Many Requests
Retry-After: 30
Content-Type: application/json

{
  "error": "rate_limit_exceeded",
  "message": "You have exceeded the rate limit. Please retry after 30 seconds.",
  "retry_after": 30
}
```

Include the retry delay in both the header and the response body. Some HTTP clients read headers automatically; others parse the body. Covering both makes your API easier to consume.

### What good API consumers look like

<a href="https://docs.stripe.com/rate-limits" target="_blank" rel="noopener noreferrer">Stripe's rate limiting documentation ↗</a> is an excellent example of how to communicate limits clearly. They publish their limits, explain the response headers, and recommend exponential backoff for retries. If you are designing a public API, Stripe's approach is a good model to follow.

## Rate limiting across tiers

If your API serves different user tiers (free, paid, enterprise), your rate limits should reflect the difference. This is both a technical and a business decision.

| Tier | Requests per minute | Burst allowance | Cost-weighted budget |
|---|---|---|---|
| Free | 30 | 10 | 50 tokens/min |
| Standard | 120 | 30 | 200 tokens/min |
| Pro | 500 | 100 | 1,000 tokens/min |
| Enterprise | Custom | Custom | Custom |

Store the client's tier alongside their API key and look it up when evaluating the rate limit. If you use JWTs for authentication, you can embed the tier in the token claims to avoid an extra lookup. Our guide on [authentication patterns every developer should know](/backend/authentication-patterns-every-developer-should-know) covers JWT design in detail.

## Monitoring and observability

Rate limiting generates valuable signals. Track these metrics:

- **429 response rate.** A sudden spike means something has changed: a client bug, an attack, or limits that are too tight.
- **Requests near the limit.** Clients consistently hitting 90%+ of their quota may need a higher tier or a conversation about their usage patterns.
- **Top consumers.** Know who your heaviest users are. They are either your best customers or your biggest risk.
- **Limit utilisation by endpoint.** If one endpoint accounts for most 429s, it may need a dedicated limit or performance optimisation.

Feed these metrics into your observability stack. If you are not sure where to start, our guide on [observability vs monitoring](/devops/observability-vs-monitoring-what-developers-need-to-know) explains the foundations, and [the developer's guide to logging](/backend/the-developers-guide-to-logging) covers how to log rate limiting events effectively.

## Common mistakes

### Setting limits too low

Overly aggressive limits frustrate legitimate users and generate support tickets. Start generous, monitor usage, and tighten gradually based on real data.

### No limits on internal APIs

"It is only called by our own services" is not a reason to skip rate limiting. A bug in one internal service can take down another. Internal limits are typically higher but should still exist.

### Inconsistent behaviour across endpoints

If `/users` allows 100 requests per minute and `/orders` allows 10, but your documentation does not mention this, clients will be confused and frustrated. Document every limit clearly.

### Ignoring the response body

A bare 429 with no message, no retry-after, and no explanation is hostile. Always tell the client what happened, why, and when they can try again.

### Rate limiting after expensive work

If your endpoint validates input, queries the database, processes the result, and then checks the rate limit, you have already done all the work before rejecting the request. Rate limiting should be one of the first checks in your request pipeline, not the last.

## A practical checklist

Before shipping rate limiting on your API:

1. Choose an algorithm that matches your traffic profile (sliding window counter or token bucket for most cases)
2. Decide where to enforce: edge, gateway, application, or a combination
3. Set initial limits based on measured usage, not guesswork
4. Implement per-endpoint or cost-weighted limits for expensive operations
5. Return proper 429 responses with Retry-After headers
6. Include RateLimit headers on all responses so clients can self-regulate
7. Log every rate-limited request with the client identifier and endpoint
8. Set up monitoring dashboards for 429 rates and limit utilisation
9. Document your limits clearly in your API reference
10. Test your limits under load before going live

Rate limiting is one of those things that feels tedious until the day it saves your production environment. Build it in early, communicate it clearly, and treat it as a feature your API consumers will thank you for.
