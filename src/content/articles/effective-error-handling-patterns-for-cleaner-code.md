---
title: "Effective Error Handling Patterns for Cleaner Code"
description: "Practical error handling patterns that make your code more reliable, debuggable, and easier to maintain across any language."
publishDate: "2026-03-16"
author: "jonny-rowse"
category: "code-quality"
tags: ["error-handling", "code-quality", "best-practices", "patterns", "reliability"]
featured: false
draft: false
faqs:
  - question: "Should I use exceptions or return values for error handling?"
    answer: "It depends on the language and the situation. In languages like Python and Java, exceptions are idiomatic for unexpected failures. In Go and Rust, explicit return values are the convention. The important thing is to be consistent within your codebase. Mixing styles creates confusion. If your language supports both, use exceptions for truly exceptional situations and return values for expected failure cases like validation errors or missing records."
  - question: "How do I handle errors in async code?"
    answer: "Always use try/catch with async/await rather than relying on .catch() chains, as it keeps the control flow readable. In Node.js, unhandled promise rejections can crash your process, so make sure every async call path has error handling. For parallel operations with Promise.all, consider using Promise.allSettled if you need to handle partial failures rather than failing everything when one promise rejects."
  - question: "When should I create custom error classes?"
    answer: "Create custom error classes when you need to distinguish between different failure modes in your catch blocks. If you are catching an error just to log it, a standard error with a good message is fine. But if your code needs to behave differently depending on the type of failure, such as retrying on a network error but aborting on a validation error, custom error classes make that branching clean and explicit."
  - question: "Is it bad practice to catch all errors with a generic catch block?"
    answer: "A broad catch at the top level of your application is fine as a safety net to prevent crashes and log unexpected failures. But catching all errors deep inside business logic is usually a mistake. It hides bugs and makes debugging harder. Catch specific errors you can handle meaningfully, and let unexpected errors propagate to a handler that can log them properly."
  - question: "How do I test error handling code?"
    answer: "Test both the happy path and the failure paths. Use your testing framework to simulate errors, such as mocking a database call to throw an exception, and verify that your code responds correctly. Check that the right error type is thrown, that error messages are useful, and that cleanup or rollback logic runs. Error paths are often the least tested and most likely to fail in production."
primaryKeyword: "error handling patterns"
---

Error handling is one of those things that separates code that works in development from code that survives production. Most developers learn the basics early, a try/catch here, a null check there, but rarely develop a deliberate strategy for how errors should flow through a system.

The result is codebases where errors are swallowed silently in one place, logged three times in another, and wrapped in so many layers of generic catches that the original failure is impossible to trace. Getting error handling right is not about writing more catch blocks. It is about writing fewer, better ones in the right places.

## The cost of poor error handling

Before diving into patterns, it is worth understanding what bad error handling actually costs you.

- **Silent failures.** The worst kind of bug is the one that does not look like a bug. Swallowed errors let your application continue in an invalid state, producing wrong results that might not surface for hours or days.
- **Impossible debugging.** When an error is caught, wrapped, re-thrown, and caught again without preserving context, the stack trace becomes useless. You end up adding temporary logging to track down problems that a clean error chain would have made obvious.
- **Fragile systems.** Code that catches too broadly tends to mask unexpected failures. That `catch (Exception e)` block might handle the network timeout you expected, but it also silently swallows the null pointer exception you did not.

Good error handling is an investment in your future debugging self. In our guide to [logging best practices](/backend/the-developers-guide-to-logging), we cover the observability side of this equation. This article focuses on the code patterns themselves.

## Pattern 1: fail fast and fail loud

The most important error handling pattern is also the simplest: when something is wrong, stop immediately and say so clearly.

```python
def process_order(order):
    if not order.items:
        raise ValueError("Cannot process an order with no items")
    if order.total <= 0:
        raise ValueError(f"Invalid order total: {order.total}")
    # proceed with valid order
```

Fail-fast code validates assumptions at the boundary, before any real work begins. This prevents half-completed operations and makes the source of the problem obvious.

**When to use it:**

- Function entry points where you receive external input
- Before expensive or irreversible operations
- At system boundaries (API handlers, message consumers, file processors)

**The anti-pattern:** checking for the error deep inside nested logic after you have already done half the work, then trying to undo it.

## Pattern 2: use typed errors to encode failure modes

Generic error messages tell you something went wrong. Typed errors tell you what went wrong and let your code respond appropriately.

```typescript
class NotFoundError extends Error {
  constructor(public resource: string, public id: string) {
    super(`${resource} not found: ${id}`);
    this.name = 'NotFoundError';
  }
}

class ValidationError extends Error {
  constructor(public field: string, public reason: string) {
    super(`Validation failed on ${field}: ${reason}`);
    this.name = 'ValidationError';
  }
}

// In your handler
try {
  const user = await getUser(id);
} catch (error) {
  if (error instanceof NotFoundError) {
    return res.status(404).json({ error: error.message });
  }
  if (error instanceof ValidationError) {
    return res.status(400).json({ error: error.message });
  }
  throw error; // unexpected error, let it propagate
}
```

The key detail in this pattern is the final `throw error`. If you do not recognise the error, do not swallow it. Let it propagate to a handler that can deal with it properly.

For more on building type-safe patterns in TypeScript, see [TypeScript patterns that make your code safer](/code-quality/typescript-patterns-that-make-your-code-safer).

## Pattern 3: the result type (errors as values)

Languages like Rust and Go treat errors as return values rather than exceptions. Even in languages that support exceptions, this pattern can be valuable for operations where failure is a normal, expected outcome.

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseConfig(raw: string): Result<Config, string> {
  try {
    const parsed = JSON.parse(raw);
    if (!parsed.host || !parsed.port) {
      return { ok: false, error: "Missing required fields: host, port" };
    }
    return { ok: true, value: parsed as Config };
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}

// Caller must handle both cases
const result = parseConfig(rawInput);
if (!result.ok) {
  logger.warn(`Config parse failed: ${result.error}`);
  return defaults;
}
const config = result.value;
```

Rust's official documentation on error handling <a href="https://doc.rust-lang.org/book/ch09-00-error-handling.html" target="_blank" rel="noopener noreferrer">↗</a> explains this philosophy in depth. The core idea is that making errors part of the type signature forces callers to deal with them explicitly.

**When to use it:**

- Parsing and validation logic
- Operations where failure is expected (file lookups, cache hits, external API calls)
- When you want the compiler or type checker to enforce error handling

**When not to use it:**

- Truly exceptional situations (out of memory, corrupted state) where throwing is appropriate
- When the pattern adds ceremony without adding clarity

## Pattern 4: error boundaries

An error boundary is a layer in your application that catches errors from everything below it, handles them consistently, and prevents them from crashing the system.

In a web API, this is typically global error-handling middleware:

```javascript
// Express error boundary
app.use((err, req, res, next) => {
  if (err instanceof ValidationError) {
    return res.status(400).json({
      error: err.message,
      field: err.field
    });
  }

  // Log unexpected errors with full context
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  res.status(500).json({ error: 'Internal server error' });
});
```

The error boundary pattern means your individual route handlers do not need to worry about catching every possible error. They handle the errors they understand and let everything else bubble up to the boundary.

This is the same principle behind React's `ErrorBoundary` component for frontend code and Rust's `?` operator for propagating errors up the call stack.

**Rules for error boundaries:**

- Log the full error context (message, stack, request details)
- Return a safe, generic response to the client (never leak stack traces or internal details)
- Have exactly one boundary per entry point (one for your API, one for your message consumer, etc.)
- Alert on unexpected errors so they get investigated

## Pattern 5: preserve the error chain

When you catch an error and throw a new one, preserve the original cause. Losing the original error is one of the most common debugging headaches.

```python
try:
    data = fetch_from_api(url)
except ConnectionError as e:
    raise ServiceUnavailableError(
        f"Failed to fetch data from {url}"
    ) from e  # preserves the original error
```

```javascript
try {
  await database.query(sql);
} catch (error) {
  throw new DatabaseError(
    `Query failed: ${sql.substring(0, 100)}`,
    { cause: error }  // ES2022 error cause
  );
}
```

The `from` keyword in Python and the `cause` option in JavaScript (ES2022) both preserve the original error in the chain. When you inspect the error later, you can see exactly what happened at each layer.

**Why this matters:** without the chain, you see "DatabaseError: Query failed" in your logs. With the chain, you see that plus "ConnectionRefusedError: port 5432" underneath, which tells you the database is down rather than the query being wrong.

## Pattern 6: centralised error mapping

As your application grows, mapping internal errors to external responses can get scattered across dozens of handlers. Centralise it:

```typescript
const ERROR_MAP: Record<string, { status: number; public: boolean }> = {
  NotFoundError:    { status: 404, public: true },
  ValidationError:  { status: 400, public: true },
  AuthError:        { status: 401, public: true },
  ForbiddenError:   { status: 403, public: true },
  RateLimitError:   { status: 429, public: true },
  ConflictError:    { status: 409, public: true },
};

function errorToResponse(error: Error) {
  const mapping = ERROR_MAP[error.constructor.name];
  if (mapping) {
    return {
      status: mapping.status,
      body: { error: mapping.public ? error.message : 'Internal server error' },
    };
  }
  return { status: 500, body: { error: 'Internal server error' } };
}
```

This gives you a single place to define how each error type maps to an HTTP response. Adding a new error type means adding one line to the map rather than updating every handler.

## What not to do

Knowing the anti-patterns is just as important as knowing the patterns.

### Swallowing errors silently

```javascript
// Never do this
try {
  await saveToDatabase(data);
} catch (error) {
  // TODO: handle this later
}
```

This is the single most common error handling mistake. The operation fails, nobody knows, and the application continues in a state that no one designed for.

### Logging and re-throwing without adding context

```python
# Pointless - adds noise without value
try:
    process(data)
except Exception as e:
    logger.error(f"Error: {e}")
    raise
```

If you are going to re-throw the same error unchanged, the boundary layer will log it. Logging it at every level creates duplicate noise. Only log if you are adding context that the boundary will not have.

### Catching too broadly, too deep

```java
// Dangerous - masks unexpected errors
try {
    complexBusinessLogic();
} catch (Exception e) {
    return defaultValue;
}
```

This catches everything, including null pointers, class cast errors, and out-of-bounds exceptions that indicate genuine bugs. Catch specific exceptions, and only the ones you can handle meaningfully.

## A practical checklist

Before you ship, review your error handling against this checklist:

- **Inputs validated at boundaries.** Bad data is rejected before it enters your business logic.
- **Expected errors handled explicitly.** Network failures, missing records, and validation errors have specific handling.
- **Unexpected errors propagate.** Unknown failures reach the error boundary, where they are logged and produce a safe response.
- **Error chains preserved.** When you wrap an error, the original cause is still accessible.
- **No silent catches.** Every catch block either handles the error meaningfully, logs it with context, or re-throws it.
- **Error types are meaningful.** You can tell what went wrong from the error type, not just the message string.

If your codebase has test coverage for error paths, you are in better shape than most. Our guide to [writing tests that actually help](/code-quality/how-to-write-tests-that-actually-help) covers how to test failure cases effectively.

## Error handling across the stack

Error handling does not exist in isolation. It connects to how you [write and structure your logs](/backend/the-developers-guide-to-logging), how you [handle failures in API calls](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns), and how you [monitor your systems in production](/devops/observability-vs-monitoring-what-developers-need-to-know).

The MDN Web Docs <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch" target="_blank" rel="noopener noreferrer">↗</a> provide a solid reference for JavaScript's try/catch mechanics. Python's official tutorial on errors and exceptions <a href="https://docs.python.org/3/tutorial/errors.html" target="_blank" rel="noopener noreferrer">↗</a> covers the fundamentals for Python developers. Go's approach to error handling <a href="https://go.dev/blog/error-handling-and-go" target="_blank" rel="noopener noreferrer">↗</a> is worth reading even if you do not write Go, as it offers a different perspective on why explicit error returns can lead to more robust code.

The best error handling is the kind you barely notice when things go right, and that tells you exactly what happened when things go wrong. Invest in it once, and every production incident you debug afterwards will be easier to resolve.
