---
title: "How to Write Tests That Actually Help"
description: "Practical guide to writing tests that actually help you ship with confidence, catch real bugs, and make refactoring safer."
publishDate: "2026-02-18"
author: "david-white"
category: "code-quality"
tags: ["testing", "unit-tests", "tdd", "code-quality", "best-practices"]
featured: false
draft: false
faqs:
  - question: "How many tests should I write?"
    answer: "There is no magic number. Focus on testing behaviour that matters to your users and business logic that would be costly to get wrong. A small number of well-targeted tests is more valuable than hundreds of shallow ones that test implementation details."
  - question: "Should I aim for 100% code coverage?"
    answer: "No. Code coverage measures which lines were executed during tests, not whether your tests are meaningful. Chasing 100% coverage leads to brittle tests that verify implementation details rather than behaviour. Aim for high coverage of critical paths and business logic instead."
  - question: "What is the difference between unit tests and integration tests?"
    answer: "Unit tests verify a single function or module in isolation, usually with dependencies mocked out. Integration tests verify that multiple components work together correctly, often hitting real databases or APIs. Both are valuable, and you need a mix of each."
  - question: "When should I use mocks?"
    answer: "Use mocks for external dependencies you do not control, such as third-party APIs, email services, or payment processors. Avoid mocking your own code excessively, as it couples your tests to implementation details and makes refactoring harder."
  - question: "Is TDD worth it?"
    answer: "TDD works well for well-understood problems with clear inputs and outputs, such as business logic and data transformations. It is less useful for exploratory work or UI development where requirements are still being discovered. Try it for a few weeks and see if it improves your workflow."
primaryKeyword: "how to write tests"
---

Most developers know they should write tests. Fewer know how to write tests that genuinely help. The difference between a useful test suite and a burdensome one is not the number of tests; it is whether those tests give you confidence to ship and refactor without fear.

If your tests break every time you change an implementation detail, if they pass even when real bugs slip through, or if they take so long to run that nobody bothers, something has gone wrong. In my experience working across dozens of codebases, the root cause is almost always the same: tests that verify how code works rather than what it does. Here is how to write tests that actually earn their keep.

## Test Behaviour, Not Implementation

This is the single most important principle in testing, and the one most frequently violated.

A good test describes what your code should do, not how it does it internally. Consider this example:

```javascript
// Bad: tests implementation details
test('adds item to internal array', () => {
  const cart = new ShoppingCart();
  cart.addItem({ id: 1, price: 10 });
  expect(cart._items).toHaveLength(1);
  expect(cart._items[0].id).toBe(1);
});

// Good: tests observable behaviour
test('added item appears in cart summary', () => {
  const cart = new ShoppingCart();
  cart.addItem({ id: 1, name: 'Widget', price: 10 });
  const summary = cart.getSummary();
  expect(summary.items).toContainEqual({ name: 'Widget', price: 10 });
  expect(summary.total).toBe(10);
});
```

The first test breaks if you rename the internal array or change the data structure. The second test only breaks if the actual behaviour changes. You can refactor the internals freely without touching a single test.

## The Testing Trophy

You have probably heard of the testing pyramid: lots of unit tests at the base, fewer integration tests in the middle, and a handful of end-to-end tests at the top. It is a decent starting point, but many teams take it too literally and end up with thousands of unit tests that mock everything and test nothing meaningful.

A more practical approach is the testing trophy, popularised by <a href="https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications" target="_blank" rel="noopener noreferrer">Kent C. Dodds ↗</a>. The bulk of your tests should be integration tests that verify real behaviour across multiple modules. Unit tests cover pure functions and complex logic. End-to-end tests cover critical user journeys. Static analysis (TypeScript, ESLint) catches an entire category of bugs before any test runs.

The key insight is that integration tests give you the most confidence per test. A single integration test that hits your API endpoint, processes the request through your middleware, service layer, and database, and verifies the response catches far more bugs than a dozen unit tests with mocked dependencies.

<svg viewBox="0 0 600 380" xmlns="http://www.w3.org/2000/svg" aria-label="The testing trophy diagram showing static analysis at the base, unit tests above, integration tests as the largest section, and end-to-end tests at the top.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="600" height="380" fill="#f8fafc" rx="8"/>
  <text x="300" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">The Testing Trophy</text>
  <!-- Trophy shape -->
  <!-- E2E (top, small) -->
  <polygon points="260,55 340,55 335,100 265,100" fill="#ef4444" opacity="0.85"/>
  <text x="300" y="83" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">E2E</text>
  <!-- Integration (middle, largest) -->
  <polygon points="265,105 335,105 370,230 230,230" fill="#3b82f6" opacity="0.85"/>
  <text x="300" y="165" text-anchor="middle" font-size="14" font-weight="bold" fill="#ffffff">Integration</text>
  <text x="300" y="185" text-anchor="middle" font-size="11" fill="#dbeafe">Most confidence per test</text>
  <!-- Unit (below integration) -->
  <polygon points="230,235 370,235 355,285 245,285" fill="#22c55e" opacity="0.85"/>
  <text x="300" y="265" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Unit</text>
  <!-- Static (base) -->
  <rect x="240" y="290" width="120" height="35" rx="4" fill="#64748b" opacity="0.85"/>
  <text x="300" y="312" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">Static Analysis</text>
  <!-- Labels on right -->
  <line x1="342" y1="78" x2="420" y2="78" stroke="#94a3b8" stroke-dasharray="4"/>
  <text x="425" y="82" font-size="10" fill="#64748b">Few, critical user journeys</text>
  <line x1="372" y1="168" x2="420" y2="168" stroke="#94a3b8" stroke-dasharray="4"/>
  <text x="425" y="172" font-size="10" fill="#64748b">Bulk of your tests live here</text>
  <line x1="357" y1="260" x2="420" y2="260" stroke="#94a3b8" stroke-dasharray="4"/>
  <text x="425" y="264" font-size="10" fill="#64748b">Pure functions, complex logic</text>
  <line x1="362" y1="307" x2="420" y2="307" stroke="#94a3b8" stroke-dasharray="4"/>
  <text x="425" y="311" font-size="10" fill="#64748b">TypeScript, ESLint, linters</text>
  <!-- Footer -->
  <text x="300" y="360" text-anchor="middle" font-size="11" fill="#64748b">Source: Kent C. Dodds, "The Testing Trophy"</text>
</svg>

## Write Tests That Read Like Specifications

A well-written test serves as documentation. Someone reading your test file should understand what the code does without looking at the implementation. This is something I have found teams consistently underestimate: a good test suite is often the best [documentation developers actually read](/collaboration/writing-documentation-developers-actually-read).

### Use Descriptive Test Names

```javascript
// Vague
test('handles error', () => { ... });

// Clear
test('returns 404 when user does not exist', () => { ... });
test('retries failed payment up to 3 times before giving up', () => { ... });
```

### Follow the Arrange, Act, Assert Pattern

Structure every test into three clear sections:

```javascript
test('applies percentage discount to order total', () => {
  // Arrange
  const order = createOrder([
    { name: 'Laptop', price: 1000 },
    { name: 'Mouse', price: 25 },
  ]);
  const discount = percentageDiscount(10);

  // Act
  const discountedOrder = applyDiscount(order, discount);

  // Assert
  expect(discountedOrder.total).toBe(922.50);
  expect(discountedOrder.discountApplied).toBe('10%');
});
```

This structure makes tests easy to scan. You immediately see the setup, the action being tested, and the expected outcome.

## Avoid These Common Testing Mistakes

### Testing Framework Features Instead of Your Code

If your test is verifying that `jest.mock` works correctly, you are testing the framework, not your application. This happens when you mock so extensively that the test is just checking that your mocks return what you told them to.

### Duplicating Production Logic in Tests

```javascript
// Bad: duplicates the production logic
test('calculates tax correctly', () => {
  const price = 100;
  const taxRate = 0.20;
  const expected = price * taxRate; // This IS the logic you're testing
  expect(calculateTax(price, taxRate)).toBe(expected);
});

// Good: uses a known expected value
test('calculates 20% tax on £100', () => {
  expect(calculateTax(100, 0.20)).toBe(20);
});
```

When you duplicate the logic, your test will pass even if both the production code and the test have the same bug.

### Writing Tests After the Bug Is Fixed Without Reproducing It First

When fixing a bug, write a failing test first that reproduces the exact scenario. Then fix the code and watch the test pass. This confirms your fix actually addresses the problem and prevents the bug from reappearing.

## What to Test and What to Skip

| Category | Test? | Reasoning | Examples |
|---|---|---|---|
| Business logic | Always | Core of your application, most costly to get wrong | Calculations, validation rules, state transitions |
| Edge cases | Always | Where bugs hide | Empty inputs, boundary values, error conditions |
| Integration points | Always | Where components meet and misunderstandings cause failures | API endpoints, database queries, message handlers |
| Trivial getters/setters | Skip | Adds noise without value | Methods that just return a property |
| Third-party libraries | Skip | Trust your dependencies; test how you use them | Library internal behaviour |
| UI layout details | Skip | Brittle and low value | Asserting specific CSS classes |

### Always Test

- **Business logic**: calculations, validation rules, state transitions. These are the core of your application and the most costly to get wrong.
- **Edge cases**: empty inputs, boundary values, error conditions. These are where bugs hide.
- **Integration points**: API endpoints, database queries, message handlers. These are where components meet and misunderstandings between them cause failures.

### Probably Skip

- **Trivial getters and setters**: if a method just returns a property, testing it adds noise without value.
- **Third-party library behaviour**: trust that your dependencies work. Test how you use them, not that they function correctly.
- **UI layout details**: asserting that a button has a specific CSS class is brittle and low value. Test user interactions and outcomes instead.

## Make Your Tests Fast

Slow tests are tests that do not get run. If your test suite takes 20 minutes, developers will push code without running it locally and rely on CI to catch problems. By then, the context has switched and fixing failures is more expensive. Research from the <a href="https://cloud.google.com/devops/state-of-devops" target="_blank" rel="noopener noreferrer">DORA State of DevOps report ↗</a> consistently shows that fast feedback loops are one of the strongest predictors of software delivery performance.

### Use an In-Memory Database for Unit Tests

If your tests need a database, consider using SQLite in-memory mode for fast unit tests and reserving your production database engine (PostgreSQL, MySQL) for integration tests.

### Parallelise Test Execution

Most test runners support parallel execution. Jest runs test files in parallel by default. Ensure your tests do not share mutable state, and you can cut your test time significantly. This is directly related to the broader principle of [reducing context switching costs](/productivity/the-real-cost-of-context-switching); the faster your tests run, the shorter the feedback loop.

### Isolate Slow Tests

Mark slow tests (network calls, browser tests) and run them separately. Your fast tests should complete in under 30 seconds for a tight feedback loop.

## Testing in Practice: A Pragmatic Approach

Start with the code that scares you most. Which module would you be most nervous to change? That is where tests will provide the most value. Working with teams over the years, I have found that identifying the "scariest" module is a surprisingly effective prioritisation exercise.

For greenfield code, write tests alongside your implementation. You do not have to follow strict TDD, but writing the test within minutes of writing the code keeps both fresh in your mind.

For legacy code, add tests before making changes. <a href="https://www.goodreads.com/book/show/44919.Working_Effectively_with_Legacy_Code" target="_blank" rel="noopener noreferrer">Michael Feathers ↗</a> calls this "characterisation testing": write tests that describe what the code currently does, then refactor with confidence that you have not changed the behaviour. Tackling [technical debt](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) becomes far less daunting when you have characterisation tests in place.

## Conclusion

Good tests are not about quantity or coverage percentages. They are about confidence. Every test you write should answer the question: "Will this test tell me if I have broken something important?"

If a test does not give you confidence, it is not helping. Delete it, rewrite it, or replace it with one that does. Your test suite should be an asset that makes you faster, not a liability that slows you down. Pair strong tests with [automated code quality tooling](/code-quality/automating-code-quality-with-linters-and-formatters) and you will have a safety net that lets you ship with confidence every time.
