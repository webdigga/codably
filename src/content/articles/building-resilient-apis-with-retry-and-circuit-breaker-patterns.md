---
title: "Building Resilient APIs with Retry and Circuit Breaker Patterns"
description: "Learn how to build resilient APIs using retry logic and circuit breaker patterns to handle failures gracefully and prevent cascading outages."
publishDate: "2026-02-12"
author: "david-white"
category: "backend"
tags: ["api-design", "resilience", "circuit-breaker", "retry-patterns", "backend"]
featured: false
draft: false
faqs:
  - question: "What is the difference between a retry and a circuit breaker?"
    answer: "A retry attempts the same operation again after a failure, hoping the issue was transient. A circuit breaker stops attempts entirely when failures exceed a threshold, preventing your application from overwhelming a struggling service. They work together: retries handle occasional failures, and the circuit breaker kicks in when failures become persistent."
  - question: "How many times should I retry a failed request?"
    answer: "Two to three retries is typical for most use cases. More retries increase the chance of success for transient failures but also increase latency and load on the downstream service. Always use exponential backoff between retries to avoid hammering the failing service."
  - question: "When should I not retry a request?"
    answer: "Do not retry requests that failed due to client errors (4xx status codes), as these indicate a problem with the request itself that will not be fixed by retrying. Also avoid retrying non-idempotent operations unless you have mechanisms to prevent duplicate side effects, such as idempotency keys."
  - question: "What is exponential backoff?"
    answer: "Exponential backoff is a strategy where the wait time between retries increases exponentially. For example, wait 1 second before the first retry, 2 seconds before the second, and 4 seconds before the third. Adding random jitter prevents multiple clients from retrying at exactly the same time and creating a thundering herd."
  - question: "How do I test circuit breaker behaviour?"
    answer: "Use fault injection to simulate failures in your test environment. Tools like Toxiproxy or Chaos Monkey can introduce latency, connection errors, and service unavailability. Test that your circuit breaker opens after the expected number of failures, that it rejects requests while open, and that it transitions to half-open after the timeout period."
primaryKeyword: "resilient APIs"
---

In distributed systems, failure is not a possibility; it is a certainty. The database will have a slow moment. The third-party API will time out. The network will drop packets. The question is not whether these failures will happen, but how your system behaves when they do.

Working with distributed systems over the years, I have learned that the difference between a reliable service and a fragile one almost always comes down to how it handles failure. Retry logic and circuit breakers are two foundational patterns for building APIs that handle failure gracefully. Used together, they prevent transient errors from becoming user-facing outages and stop cascading failures from taking down your entire system.

## Why Naive Error Handling Falls Short

The simplest approach to handling a failed downstream request is to return an error to the caller. Service B is down, so your API returns a 500 to the user. This is honest, but it is also brittle. Many failures are transient: a momentary network blip, a service restarting, or a connection pool briefly exhausted. A second attempt would succeed.

The next level up is adding a simple retry:

```javascript
async function fetchUserProfile(userId) {
  try {
    return await httpClient.get(`/users/${userId}`);
  } catch (error) {
    // Retry once
    return await httpClient.get(`/users/${userId}`);
  }
}
```

This is better, but it has problems. If the downstream service is genuinely down, you are doubling the number of failed requests hitting it. If every client does this, the struggling service receives a flood of retry traffic that makes recovery harder. This is the retry storm problem, and it can turn a minor outage into a major one.

## Retry Logic Done Right

Effective retry logic needs three components: a retry limit, backoff between attempts, and the wisdom to know which errors are worth retrying.

### Exponential Backoff with Jitter

Instead of retrying immediately, wait before each attempt. Increase the wait time exponentially to give the downstream service breathing room:

```javascript
async function retryWithBackoff(fn, maxRetries = 3) {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries || !isRetryable(error)) {
        throw error;
      }

      const baseDelay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
      const jitter = Math.random() * 1000;           // 0-1s random
      const delay = baseDelay + jitter;

      await sleep(delay);
    }
  }
}

function isRetryable(error) {
  if (error.response) {
    // Don't retry client errors (4xx), except 429 (rate limited)
    const status = error.response.status;
    return status === 429 || status >= 500;
  }
  // Network errors and timeouts are retryable
  return true;
}
```

The jitter is critical. Without it, if a hundred clients all experience the same failure at the same time, they will all retry at the same time, creating a thundering herd that hammers the recovering service. The <a href="https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" target="_blank" rel="noopener noreferrer">AWS Builders' Library ↗</a> has an excellent deep dive into this problem and the mathematics behind effective backoff strategies.

### Idempotency: The Prerequisite for Safe Retries

Retrying a GET request is always safe. Retrying a POST that creates a payment is dangerous: you might charge the customer twice.

For non-idempotent operations, use idempotency keys. The client generates a unique key for each logical operation and includes it with every attempt:

```javascript
async function createPayment(amount, idempotencyKey) {
  return retryWithBackoff(() =>
    httpClient.post('/payments', {
      amount,
      idempotency_key: idempotencyKey,
    })
  );
}

// Usage
const key = generateUUID();
await createPayment(49.99, key);
```

The server checks whether it has already processed a request with that key. If it has, it returns the original response rather than processing the payment again. This is a fundamental principle of good [API design](/backend/api-design-principles-every-developer-should-know).

### Setting Timeouts

Every outgoing request needs a timeout. Without one, a hanging downstream service ties up your connection pool, threads, or event loop handlers indefinitely. Eventually, your service runs out of resources and fails too.

```javascript
const httpClient = axios.create({
  timeout: 5000, // 5 second timeout
});
```

Set timeouts aggressively. If a service typically responds in 200 milliseconds, a 5-second timeout is generous. A 30-second timeout means your service will degrade for 30 seconds before it even begins to handle the failure.

## Retry Strategy Comparison

| Strategy | Delay Pattern | Best For | Drawback |
|---|---|---|---|
| No backoff | Immediate retry | Never recommended | Creates retry storms |
| Fixed delay | Same wait each time (e.g. 2s, 2s, 2s) | Simple scripts, batch jobs | Does not reduce contention |
| Exponential backoff | Doubling wait (e.g. 1s, 2s, 4s) | Most API integrations | Clients can still synchronise |
| Exponential + jitter | Doubling wait + random offset | Production services | Slightly more complex to implement |
| Decorrelated jitter | Random within a growing range | High-concurrency systems | Harder to predict behaviour |

## The Circuit Breaker Pattern

Retries handle transient failures. But when a downstream service is genuinely down, retrying just adds latency and load. You wait for each retry, accumulating seconds of delay, only to return an error anyway.

A circuit breaker recognises when a service is persistently failing and stops sending requests to it entirely. This is faster for the caller (instant failure instead of waiting for timeouts) and kinder to the downstream service (no retry traffic while it is trying to recover).

### How It Works

A circuit breaker has three states:

**Closed (normal operation)**: requests pass through to the downstream service. The circuit breaker tracks failures. If the failure rate exceeds a threshold (for example, 50% of requests failing within a 30-second window), the circuit opens.

**Open (failing fast)**: all requests are immediately rejected without contacting the downstream service. The caller gets an instant error response. After a timeout period (for example, 30 seconds), the circuit transitions to half-open.

**Half-open (testing recovery)**: a limited number of requests are allowed through to test whether the downstream service has recovered. If they succeed, the circuit closes and normal operation resumes. If they fail, the circuit opens again.

<svg viewBox="0 0 680 320" xmlns="http://www.w3.org/2000/svg" aria-label="State diagram showing the three states of a circuit breaker: Closed, Open, and Half-Open, with transitions between them.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="680" height="320" fill="#f8fafc" rx="8"/>
  <text x="340" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Circuit Breaker State Machine</text>
  <!-- Closed state -->
  <circle cx="130" cy="170" r="60" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-width="3"/>
  <text x="130" y="165" text-anchor="middle" font-size="14" font-weight="bold" fill="#15803d">CLOSED</text>
  <text x="130" y="185" text-anchor="middle" font-size="10" fill="#334155">Normal operation</text>
  <!-- Open state -->
  <circle cx="540" cy="170" r="60" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-width="3"/>
  <text x="540" y="165" text-anchor="middle" font-size="14" font-weight="bold" fill="#dc2626">OPEN</text>
  <text x="540" y="185" text-anchor="middle" font-size="10" fill="#334155">Failing fast</text>
  <!-- Half-open state -->
  <circle cx="335" cy="170" r="60" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="3"/>
  <text x="335" y="155" text-anchor="middle" font-size="14" font-weight="bold" fill="#d97706">HALF-</text>
  <text x="335" y="175" text-anchor="middle" font-size="14" font-weight="bold" fill="#d97706">OPEN</text>
  <text x="335" y="195" text-anchor="middle" font-size="10" fill="#334155">Testing recovery</text>
  <!-- Closed to Open arrow (top) -->
  <path d="M190,140 Q335,55 480,140" fill="none" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowRed)"/>
  <text x="335" y="82" text-anchor="middle" font-size="10" fill="#ef4444">Failure threshold exceeded</text>
  <!-- Open to Half-Open arrow (bottom) -->
  <path d="M480,200 Q410,250 395,200" fill="none" stroke="#f59e0b" stroke-width="2" marker-end="url(#arrowAmber)"/>
  <text x="455" y="260" text-anchor="middle" font-size="10" fill="#d97706">Timeout elapsed</text>
  <!-- Half-Open to Closed arrow (bottom) -->
  <path d="M275,200 Q200,250 190,200" fill="none" stroke="#22c55e" stroke-width="2" marker-end="url(#arrowGreen)"/>
  <text x="215" y="260" text-anchor="middle" font-size="10" fill="#15803d">Probe succeeds</text>
  <!-- Half-Open to Open arrow (top, back) -->
  <path d="M395,145 Q460,110 480,145" fill="none" stroke="#ef4444" stroke-width="2" marker-end="url(#arrowRed)"/>
  <text x="445" y="110" text-anchor="middle" font-size="10" fill="#ef4444">Probe fails</text>
  <!-- Arrow markers -->
  <defs>
    <marker id="arrowRed" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#ef4444"/></marker>
    <marker id="arrowGreen" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#22c55e"/></marker>
    <marker id="arrowAmber" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto"><path d="M0,0 L8,3 L0,6" fill="#f59e0b"/></marker>
  </defs>
  <!-- Footer -->
  <text x="340" y="305" text-anchor="middle" font-size="10" fill="#94a3b8">The circuit breaker protects both caller and downstream service during persistent failures</text>
</svg>

### Implementation

Here is a practical circuit breaker implementation:

```javascript
class CircuitBreaker {
  constructor(options = {}) {
    this.failureThreshold = options.failureThreshold || 5;
    this.resetTimeout = options.resetTimeout || 30000;
    this.monitorWindow = options.monitorWindow || 60000;

    this.state = 'CLOSED';
    this.failures = [];
    this.lastFailureTime = null;
  }

  async execute(fn) {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new CircuitOpenError('Circuit breaker is open');
      }
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  onSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
    }
    this.failures = [];
  }

  onFailure() {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;

    // Only count failures within the monitoring window
    this.failures = this.failures.filter(
      (time) => now - time < this.monitorWindow
    );

    if (this.failures.length >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}
```

### Using It

```javascript
const paymentCircuit = new CircuitBreaker({
  failureThreshold: 5,   // Open after 5 failures
  resetTimeout: 30000,   // Try again after 30 seconds
});

async function processPayment(order) {
  try {
    return await paymentCircuit.execute(() =>
      paymentService.charge(order.amount, order.paymentMethod)
    );
  } catch (error) {
    if (error instanceof CircuitOpenError) {
      // Fast failure: queue the payment for later processing
      await paymentQueue.enqueue(order);
      return { status: 'queued', message: 'Payment will be processed shortly' };
    }
    throw error;
  }
}
```

Notice the fallback behaviour. When the circuit is open, instead of returning an error, we queue the payment for later processing. This is the key to a good user experience during failures: degrade gracefully rather than failing entirely.

## Combining Retries and Circuit Breakers

These patterns complement each other. Retries handle individual transient failures. The circuit breaker handles sustained failures. Layer them together:

```javascript
async function callDownstreamService(request) {
  return circuitBreaker.execute(() =>
    retryWithBackoff(() => httpClient.post('/api/process', request))
  );
}
```

The circuit breaker wraps the retry logic. If retries succeed, great. If they exhaust all attempts and the circuit breaker's failure threshold is reached, the circuit opens and subsequent requests fail immediately.

## Fallback Strategies

What happens when both retries and the circuit breaker indicate failure? Your fallback strategy determines the user experience during outages.

### Cached Responses

If the data does not change frequently, serve a cached version:

```javascript
async function getProductCatalogue() {
  try {
    const fresh = await catalogueCircuit.execute(() =>
      catalogueService.getAll()
    );
    cache.set('catalogue', fresh);
    return fresh;
  } catch (error) {
    const cached = cache.get('catalogue');
    if (cached) return { ...cached, stale: true };
    throw error;
  }
}
```

### Degraded Functionality

Disable the failing feature rather than the entire page. If the recommendation engine is down, show the product page without recommendations. If the review service is unavailable, show the product without reviews.

### Queue for Later

For write operations, accept the request and process it asynchronously once the downstream service recovers. This works well for payments, notifications, and data synchronisation.

## Monitoring and Alerting

Resilience patterns are only as good as your visibility into them. Good [observability](/devops/observability-vs-monitoring-what-developers-need-to-know) is essential. Proper [logging](/backend/the-developers-guide-to-logging) gives you the detail you need when investigating incidents. Monitor:

- **Circuit breaker state changes**: alert when a circuit opens, as it means a downstream service is failing persistently
- **Retry rates**: a spike in retries indicates a downstream service is struggling
- **Fallback activations**: track how often you serve cached or degraded responses
- **Request latency**: retries add latency; track the total time including retries

## Conclusion

Retry logic and circuit breakers are foundational patterns for any system that depends on external services. Retries handle the inevitable transient failures of distributed systems. Circuit breakers prevent those failures from cascading. Together with timeouts, fallbacks, and idempotency keys, they form a resilience toolkit that keeps your API reliable even when the services it depends on are not.

Start with timeouts and basic retries. Add a circuit breaker to your most critical downstream dependencies. Build out fallback strategies for the scenarios where failure is most impactful. As <a href="https://www.martinfowler.com/bliki/CircuitBreaker.html" target="_blank" rel="noopener noreferrer">Martin Fowler notes ↗</a>, the circuit breaker pattern is valuable precisely because it gives you control over how your system responds to the failures that will inevitably occur. Your users may never notice the difference, and that is exactly the point.
