---
title: "How to Design Idempotent API Endpoints"
description: "A practical guide to designing idempotent API endpoints. Covers idempotency keys, HTTP semantics, storage patterns and the edge cases that usually bite first."
publishDate: "2026-04-23"
author: "zubair-hasan"
category: "backend"
tags: ["API design", "idempotency", "HTTP", "distributed systems", "reliability"]
featured: false
draft: false
faqs:
  - question: "What does idempotent actually mean in an API context?"
    answer: "An API endpoint is idempotent if calling it multiple times with the same input has the same observable effect as calling it once. GET and DELETE are idempotent by HTTP definition; POST usually is not unless the server implements it deliberately using an idempotency key."
  - question: "Do I need idempotency keys for GET endpoints?"
    answer: "No. GET is already idempotent by HTTP specification because it does not modify state. Idempotency keys are needed for endpoints that create or modify resources, which in REST is typically POST, and sometimes PATCH if your PATCH semantics allow partial application."
  - question: "How long should I store idempotency keys?"
    answer: "Long enough to cover all realistic retry windows. 24 hours is a common default. Stripe stores them for 24 hours. Systems with longer client-side retry behaviour (offline mobile apps, batch jobs) may need 7 days or more. Storing them forever is unnecessary and expensive."
  - question: "What status code should a replayed idempotent request return?"
    answer: "Return the original response exactly, including the same status code. If the first request created a resource and returned 201, the replay must also return 201 with the same body. Returning a different code like 200 or 409 leaks implementation details and confuses clients."
  - question: "Can I make a delete endpoint more idempotent?"
    answer: "DELETE is already idempotent by HTTP semantics: deleting an already-deleted resource should return 204 or 404, not 500. The common bug is throwing an error when the resource is missing. Treat missing as success for idempotent DELETEs."
primaryKeyword: "idempotent API endpoints"
---

A customer was charged twice for the same order. Not because of a bug in the payment code, but because the mobile app retried a request that had actually succeeded and the server did not notice. Total blast radius: one refund, one apology, about four hours of log-diving, and a new line on the engineering team's backlog labelled "make checkout idempotent".

Idempotency is one of those API design topics that sounds academic until it does not. Every system that accepts payments, creates orders, sends messages, or writes to any external system eventually needs it. Designing for it up front is about 10 times cheaper than retrofitting it.

## What Idempotency Actually Guarantees

A formal definition: an operation is idempotent if performing it N times has the same observable effect as performing it once. In API terms, a client can safely retry a request as many times as needed without worrying about side effects multiplying.

Idempotency is not the same as:

- **Caching.** A cached response can be stale; an idempotent response must reflect the current state.
- **Uniqueness constraints.** A database unique constraint prevents duplicate rows, but the second request will usually fail with an error rather than succeed with the original result. That is not a good client experience.
- **Safe methods.** GET is both safe and idempotent. POST can be made idempotent without being safe, because it still creates state on the first call.

<a href="https://datatracker.ietf.org/doc/html/rfc9110#name-idempotent-methods" target="_blank" rel="noopener noreferrer">RFC 9110 ↗</a> defines idempotent HTTP methods precisely; if you want to ground your API in the standard, this is the reference.

## The HTTP Methods, Sorted by Default Behaviour

| Method | Idempotent by spec | In practice |
|--------|--------------------|-------------|
| GET | Yes | Always, or you have a bug |
| HEAD | Yes | Always |
| OPTIONS | Yes | Always |
| PUT | Yes | If implemented as a full replace |
| DELETE | Yes | If a missing resource returns success |
| PATCH | No | Depends on the semantics of the patch |
| POST | No | Only if you add an idempotency key |

The ones that bite are PATCH and POST. PATCH is dangerous because `{"balance": +10}` applied twice doubles the increment, while `{"balance": 100}` applied twice sets it to the same value. Same HTTP method, opposite behaviour.

The rest of this article focuses on making POST idempotent, because that is where most real-world bugs live.

## The Idempotency Key Pattern

The canonical solution, popularised by <a href="https://docs.stripe.com/api/idempotent_requests" target="_blank" rel="noopener noreferrer">Stripe's API ↗</a> and now standard across payment and e-commerce platforms, is the idempotency key.

The flow is simple:

1. Client generates a unique key (UUID v4 is fine) per logical operation.
2. Client sends the key in a header: `Idempotency-Key: 4fe3b1d2-...`
3. Server checks whether it has seen the key before.
4. If not, process the request, store the key with the response, return the response.
5. If yes, return the stored response exactly as it was returned the first time.

```typescript
// Express / Node example
app.post('/api/orders', async (req, res) => {
  const key = req.get('Idempotency-Key');
  if (!key) {
    return res.status(400).json({ error: 'Idempotency-Key header required' });
  }

  const existing = await idempotencyStore.get(key);
  if (existing) {
    return res.status(existing.status).json(existing.body);
  }

  // Lock the key so concurrent requests wait
  const lock = await idempotencyStore.lock(key);
  try {
    const order = await createOrder(req.body);
    const response = { status: 201, body: order };
    await idempotencyStore.set(key, response, { ttl: '24h' });
    return res.status(response.status).json(response.body);
  } finally {
    await lock.release();
  }
});
```

The locking step matters. Without it, two concurrent retries can both miss the cache and both create orders. A distributed lock keyed on the idempotency key serialises concurrent requests, ensuring only one actually executes.

## Three Things the Pattern Must Handle

### 1. The same key with the same request body

Return the stored response. This is the happy path.

### 2. The same key with a different request body

This is a client bug. The safest response is to reject with a 422 or a specialised 4xx, because processing it silently would hide the bug. Many payment APIs return a specific error code like `idempotency_key_in_use`.

```typescript
const fingerprint = hashRequest(req.body);
const existing = await idempotencyStore.get(key);
if (existing && existing.fingerprint !== fingerprint) {
  return res.status(422).json({
    error: 'Idempotency key reused with a different request body',
    code: 'idempotency_key_mismatch',
  });
}
```

### 3. Concurrent requests with the same key

Block, wait for the first to complete, then return the same response. If you cannot wait (strict latency SLOs), return a 409 Conflict with a Retry-After header. The <a href="https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/" target="_blank" rel="noopener noreferrer">AWS Builders' Library ↗</a> has a good treatment of the edge cases here.

## Storage: Where Keys Actually Live

The idempotency store has to survive the same failures the main application does. A local in-memory map is wrong; a single-node Redis without persistence is usually wrong; a shared, durable store is right.

| Option | Pros | Cons |
|--------|------|------|
| Redis with persistence | Fast, built-in TTL, good primitives for locking | Extra infra; must be HA for production |
| Primary database (Postgres, MySQL) | Single source of truth, transactional with the write | Slower, extra load on the primary |
| Dedicated key-value (DynamoDB, Cloud KV) | Scales well, managed | Additional service to operate |
| Distributed cache with no persistence | Fast | Loses keys on restart; not acceptable |

For most applications under a few thousand requests per minute, storing idempotency records as rows in the same database, inside the same transaction as the operation they guard, is the simplest correct design:

```sql
CREATE TABLE idempotency_records (
  key TEXT PRIMARY KEY,
  request_fingerprint TEXT NOT NULL,
  response_status INTEGER NOT NULL,
  response_body JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_idempotency_records_expires_at
  ON idempotency_records (expires_at);
```

A scheduled job deletes expired rows. The index keeps cleanup cheap. A partial or hash index on `key` is already implied by the primary key. For the deeper mechanics of keeping this table fast under load, see [the developer's guide to database indexing](/backend/the-developers-guide-to-database-indexing).

## The Transaction Boundary That Trips People Up

The most common implementation bug is writing the idempotency record in one transaction and the business record in another. If the business transaction succeeds and the idempotency write fails, the next retry will create a duplicate. If the idempotency write succeeds and the business transaction fails, the next retry will return a success for work that never happened.

Both writes must be in the same transaction:

```typescript
await db.transaction(async (tx) => {
  const order = await tx.orders.insert(orderData);
  await tx.idempotency.insert({
    key,
    fingerprint,
    response_status: 201,
    response_body: order,
    expires_at: addHours(new Date(), 24),
  });
  return order;
});
```

If your business logic spans multiple services (order service + payment service + notification service), you need a different pattern: outbox, saga, or an [event-driven architecture](/architecture/understanding-event-driven-architecture) with idempotent consumers at each hop. Martin Fowler's <a href="https://martinfowler.com/articles/patterns-of-distributed-systems/idempotent-receiver.html" target="_blank" rel="noopener noreferrer">idempotent receiver pattern ↗</a> is the canonical write-up for the consumer side.

## Making Related Patterns Idempotent

### Background jobs

Every job worker will occasionally process the same message twice, either because of network issues or a worker crashing between "work done" and "ack sent". Make every job handler idempotent; treat at-least-once delivery as the default. This is covered in more depth in [the developer's guide to background jobs and task queues](/backend/the-developers-guide-to-background-jobs-and-task-queues).

### Webhooks

Webhooks are retries waiting to happen. Any webhook consumer must dedupe on the event ID. Most providers give you one: Stripe has `event.id`, GitHub has `X-GitHub-Delivery`, Shopify has `X-Shopify-Webhook-Id`. Store received IDs, reject duplicates silently.

### Retries and circuit breakers

Retrying on a non-idempotent endpoint is how you create duplicates at scale. Retries should only be enabled when the target is known to be idempotent, which is why the two patterns are usually discussed together. See [building resilient APIs with retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns) for the retry side of the story.

## Testing Idempotency Properly

A test that calls the endpoint twice and asserts no duplicate resource is a start but not enough. The cases that break in production:

- Concurrent duplicate requests that race on the store
- Same key with a changed body
- Key that has expired between retries
- Database failure after the business insert but before the idempotency write
- Network failure on the response path, so the client retries despite a successful server-side write

A useful property-based test: generate a random sequence of requests where some are retries of previous ones, some are new, some are concurrent. Assert that the number of side-effects matches the number of unique logical operations, regardless of retry pattern. If you cannot run this test reliably, your idempotency is probably not as strong as you think. Related reading: [why your tests are flaky and how to fix them](/code-quality/why-your-tests-are-flaky-and-how-to-fix-them).

## Error Handling Around the Pattern

There is a subtle case: what if the first request failed with a 500 and the client retries? Do you return the stored 500, or do you re-execute?

Best practice is to store and return 4xx responses (they are deterministic client errors), but not store 5xx responses (they are transient server errors that may not repeat). If a client retries after a 500, let them re-execute. This matches the behaviour of most payment APIs and is consistent with the principle that idempotency should not mask transient failures. For the broader picture, see [effective error handling patterns for cleaner code](/code-quality/effective-error-handling-patterns-for-cleaner-code).

## Practical Checklist

1. Decide which endpoints need idempotency. All state-changing POSTs and non-PUT mutations are candidates.
2. Document the idempotency key header (`Idempotency-Key`) and the expected format.
3. Build a shared middleware or library so every endpoint uses the same implementation.
4. Store records in the same transaction as the business write.
5. Lock on the key during the first request to serialise concurrent retries.
6. Fingerprint the body and reject mismatches.
7. Set a sensible TTL (24 hours is a good default).
8. Store successes and 4xx responses; re-execute on 5xx.
9. Document behaviour in your [API docs alongside the design principles](/backend/api-design-principles-every-developer-should-know) so clients know how to use keys correctly.
10. Test with concurrent retries, expired keys, and mismatched bodies.

Done well, idempotency is invisible to the client and boring to operate. That is the goal. The APIs your users trust are the ones where retrying is a neutral action rather than a roll of the dice.

## When It Is Fine to Skip All This

Not every endpoint needs idempotency keys. A read-only analytics query does not. An internal debug endpoint called twice a day does not. A non-critical "log this event" endpoint probably does not, as long as the downstream system dedupes.

The cost of the pattern is real: an extra header, an extra table, an extra lock, and discipline from every client. Apply it where retrying is a foreseeable part of the protocol (payments, orders, messaging, provisioning), and leave simpler endpoints alone. A system where every endpoint is idempotent is over-engineered; a system where the wrong endpoints are not is broken.
