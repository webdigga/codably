---
title: "Why Your Tests Are Flaky and How to Fix Them"
description: "A practical guide to identifying and fixing flaky tests. Root causes from timing and async bugs to test pollution, with strategies to stabilise CI."
publishDate: "2026-04-20"
author: "david-white"
category: "code-quality"
tags: ["testing", "flaky tests", "ci", "debugging", "reliability"]
featured: false
draft: false
faqs:
  - question: "What counts as a flaky test?"
    answer: "Any test that produces different results (pass or fail) given the same code and the same inputs is flaky. If you can re-run the exact same commit and get a red build followed by a green one without changing anything, the test is flaky. One-off flakes rarely stay one-off; they tend to be the first visible symptom of a real race condition or hidden dependency."
  - question: "Should I just retry failing tests in CI?"
    answer: "Retries hide the symptom without fixing the cause. They are acceptable as a short-term buffer while you diagnose, but a test that needs 3 retries to pass is not giving you confidence that the code works. It is giving you a 1 in 2 chance of catching real regressions and a 1 in 2 chance of missing them. Fix the flake; do not auto-retry it into production."
  - question: "How many flaky tests is too many?"
    answer: "Google considers a 1 in 100 pass rate failure acceptable in isolation and anything beyond that as a bug. For a typical suite of 2,000 tests, that already means roughly 20 flakes per full run. Set a hard ceiling (we use a 0.5 percent flake rate per suite), alert on breaches, and quarantine offenders until they are fixed."
  - question: "Should I delete flaky tests?"
    answer: "Only as a last resort, and only after you understand what the test was trying to verify. Most flaky tests started as legitimate coverage that was written against a non-deterministic system. Either rewrite the test deterministically or fix the underlying code. Deleting without replacing moves the flake from the test suite into production."
  - question: "How do I stop new flaky tests entering the codebase?"
    answer: "Run new tests 20 times in a loop in CI before merging. Any test that passes 20 out of 20 is probably safe; any that fails even once is flagged for review. This catches the most common classes of flakes (timing, ordering, pollution) before they become the next team member's problem."
primaryKeyword: "flaky tests"
---

We had a CI pipeline that failed 14 percent of runs. Same commit, same environment, different result. The team stopped trusting red builds, which meant they also stopped trusting green ones. Deploys slowed down, and one bug slipped through that a reliable suite would have caught. The fix took two engineers three weeks and paid for itself inside a month.

Flaky tests are not a minor irritation. They are a direct tax on delivery speed, on team morale, and on the credibility of the entire test suite. This is a guide to the actual causes of flakiness, how to diagnose each one, and what to do about it.

## The four classes of flake

Almost every flaky test falls into one of four categories. Knowing which category you are looking at shortens diagnosis from hours to minutes.

### 1. Timing and async flakes

The test expects something to happen within a time window. Sometimes it does not. CI runners are noisier than local machines; a test that waits 100 ms for a promise to resolve will pass on your laptop and fail on an overloaded runner.

**Common symptoms:**

- `setTimeout` with fixed delays
- Polling without proper backoff
- Assertions that fire before an async operation completes
- Fake timers not advanced far enough

**Example:**

```javascript
// Flaky
test('sends notification after 100ms debounce', async () => {
  debouncedSend('hello');
  await sleep(150);
  expect(sent).toBe('hello');
});

// Fixed with fake timers
test('sends notification after 100ms debounce', () => {
  jest.useFakeTimers();
  debouncedSend('hello');
  jest.advanceTimersByTime(100);
  expect(sent).toBe('hello');
});
```

Real sleeps in tests are a code smell. If the thing you are testing has a delay, use your framework's fake timer API. The <a href="https://jestjs.io/docs/timer-mocks" target="_blank" rel="noopener noreferrer">Jest timer mocks docs ↗</a> cover the patterns for most async situations.

### 2. Order dependence and test pollution

Tests that pass in isolation but fail when run alongside other tests. One test mutates shared state (a global, a module-level variable, a database row) and another test depends on that state being clean.

**How to diagnose:**

```bash
# Run suspected tests in a randomised order
jest --testSequencer=./random-sequencer.js

# Run a single suspect in isolation
jest path/to/suspect.test.js

# Run suspect twice in a row
jest --testNamePattern='my test' --runInBand
```

If a test only fails in a specific order, the cause is shared state. Hunt down:

- Module-level variables set by one test and read by another
- Database seed data that is not reset
- File system state left behind from previous tests
- Global fetch mocks that leak across tests

The fix is almost always to make setup and teardown symmetric. Everything a test creates, it should destroy. For a broader look at disciplined test writing, see [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help).

### 3. Resource and environment flakes

The test relies on something external: a port, a file, a network call, a specific clock. When that resource behaves unpredictably, the test flakes.

**Common culprits:**

- Tests that bind to a fixed port (use port 0 and read the assigned port)
- Tests that hit a real external API (mock it)
- Tests that depend on the current date (inject a clock)
- Tests that rely on a specific file path (use a temp directory per test)
- Tests that rely on locale-specific behaviour (pin the locale)

The clock one is endemic. A test written on 2025-12-15 that asserts "next invoice date is 2026-01-15" will fail on 2026-01-15 when "next" means February. Inject a clock into your code and your tests gain a stability they would otherwise never have. This is the same class of bug covered in [why time zones break your code and how to fix it](/backend/why-time-zones-break-your-code-and-how-to-fix-it).

### 4. Concurrency flakes

Two operations racing for the same resource. The test sometimes wins, sometimes loses.

**Symptoms:**

- Parallel tests hitting the same database row
- Shared cache between test processes
- Event loop ordering assumptions
- Message queue ordering assumptions

The fix depends on the flavour. For database races, give each test a transaction it rolls back at the end, or a unique schema. For message ordering, assert on the final state, not the ordering itself. For concurrent HTTP calls, do not assume response order.

## A diagnostic playbook

When a test first fails intermittently, resist the urge to re-run CI and hope. Work through this sequence:

```
1. Can you reproduce it locally?
   Run: jest path/to/test.js --runInBand --repeat 50

   YES → go to step 2
   NO  → run on a slower machine or in a container with CPU limits

2. Does it fail in isolation?
   Run: jest path/to/test.js

   YES → it is timing, resource, or code under test
   NO  → it is order dependence or test pollution

3. If order dependent: what test pollutes state?
   Run: jest --testSequencer=<random>

   Bisect the failing order until you find the smallest pair
   that reproduces the flake. That pair contains the polluter.

4. Fix the root cause. Do not add retries.

5. Add a guard: new tests must pass 20-in-a-row before merge.
```

This playbook solves roughly 90 percent of flakes without heroics.

## The economics of fixing flakes

A flake that fires once a month gets ignored. A flake that fires once a day gets retried. A flake that fires once a run breaks the team.

| Flake rate | Team behaviour | Cost |
|---|---|---|
| < 0.1% | Ignored, occasionally annoying | Low |
| 0.1% to 1% | Re-run becomes reflex, red builds lose meaning | Medium, compounding |
| 1% to 5% | Team stops trusting CI, local runs diverge from CI | High |
| > 5% | Deploys slow, real regressions slip through | Severe |

The tipping point is around 1 percent. Below it, most teams cope. Above it, the suite is actively working against you. <a href="https://testing.googleblog.com/2016/05/flaky-tests-at-google-and-how-we.html" target="_blank" rel="noopener noreferrer">Google's flaky test post ↗</a> reports that 1.5 percent of their test runs were flaky at one point, and describes the enormous organisational effort needed to get that back under control.

## Structural fixes that prevent new flakes

### 1. No real time in tests

Your code should accept a clock as a dependency. Your tests inject a frozen clock. No production code calls `Date.now()` or `new Date()` directly; it calls a clock interface.

```typescript
interface Clock {
  now(): Date;
}

class SystemClock implements Clock {
  now(): Date { return new Date(); }
}

class FixedClock implements Clock {
  constructor(private fixed: Date) {}
  now(): Date { return this.fixed; }
}
```

### 2. No real network in unit tests

Mock the HTTP client at its boundary. Use a fixture server (WireMock, MSW) for integration tests. Never let a unit test touch the open internet.

### 3. Unique resource names per test

Ports, file paths, database schemas, Redis keys: each should be unique per test run. A UUID prefix solves this cleanly.

### 4. Deterministic ordering

If your tests depend on ordering, make it explicit. Sort results before asserting. Do not trust Map iteration order, database query order without ORDER BY, or event handler registration order.

### 5. Fake timers everywhere there is a timer

If your code debounces, throttles, or schedules, your tests should never wait real time. Fake timers let you advance by exactly the amount you need. This also makes the tests hundreds of times faster.

For practical guidance on test boundaries generally, <a href="https://martinfowler.com/articles/nonDeterminism.html" target="_blank" rel="noopener noreferrer">Martin Fowler's essay on eradicating non-determinism in tests ↗</a> is still the best piece written on the subject and is worth reading in full.

## What about flaky end-to-end tests?

E2E tests flake for extra reasons: browser rendering, network latency to real services, session state, and CAPTCHA and rate limit triggers. The mitigations differ:

- **Retry selectors, not whole tests.** Playwright's auto-waiting and `expect` polling handle most UI flakiness natively; see the <a href="https://playwright.dev/docs/test-retries" target="_blank" rel="noopener noreferrer">Playwright retries docs ↗</a>.
- **Seed deterministically.** A fresh database per test run, not "let us hope yesterday's data is still there".
- **One environment, one data set.** Shared staging environments that many pipelines hit will always flake. Give each pipeline its own.
- **Test IDs, not CSS selectors.** `[data-testid="submit"]` is stable. `.css-7xk2j1 > button:nth-child(2)` will break the moment someone touches the stylesheet.

## Quarantine, do not ignore

When a flaky test is found and cannot be fixed immediately, quarantine it. Move it to a quarantine suite that runs but does not block merges. Give it an owner and a deadline. After two weeks in quarantine, either fix it or delete it. This is the only way to prevent quarantine becoming a graveyard.

Track the metrics. A flake-rate dashboard per test file tells you where the worst offenders live. This fits well into the broader discipline covered in [automating code quality with linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters): the same mindset of making good quality the default applies to test reliability.

## The payoff

Reliable tests are not a luxury. They are what lets a team deploy 10 times a day with confidence instead of 10 times a week with prayer. The difference between a 99.9 percent reliable suite and a 99 percent reliable one is not 0.9 percentage points; it is the difference between trusting a red build and ignoring it. Trust, once lost, is expensive to rebuild.

Pick the worst offender in your suite. Diagnose it using the playbook above. Fix it without retries. Then do the next one. Inside a month you will know every flake in your codebase by name, which is exactly how it should be.
