---
title: "TypeScript Patterns That Make Your Code Safer"
description: "Practical TypeScript patterns that make your code safer, from discriminated unions to branded types, with real-world examples."
publishDate: "2026-02-25"
author: "gareth-clubb"
category: "code-quality"
tags: ["typescript", "type-safety", "patterns", "code-quality"]
featured: false
draft: false
faqs:
  - question: "What is the most impactful TypeScript pattern for safety?"
    answer: "Discriminated unions are arguably the highest-impact pattern. They let the compiler verify that you handle every possible state, eliminating entire categories of runtime errors at compile time."
  - question: "Should I use 'any' in TypeScript?"
    answer: "Avoid 'any' wherever possible. It disables type checking for that value entirely, undermining the purpose of using TypeScript. Use 'unknown' instead when you genuinely do not know the type, as it forces you to validate the value before using it."
  - question: "What are branded types in TypeScript?"
    answer: "Branded types add a compile-time tag to primitive types to prevent them from being mixed up. For example, a UserId and an OrderId might both be strings at runtime, but branded types ensure you cannot accidentally pass one where the other is expected."
  - question: "How strict should my tsconfig be?"
    answer: "Enable 'strict' mode at minimum. Consider also enabling 'noUncheckedIndexedAccess', 'exactOptionalProperties', and 'noPropertyAccessFromIndexSignature'. Stricter settings catch more bugs at compile time."
  - question: "Do these patterns add runtime overhead?"
    answer: "Almost none of these patterns have any runtime cost. Discriminated unions, branded types, template literal types, and most type narrowing patterns are entirely erased at compile time. The safety is free."
primaryKeyword: "TypeScript patterns"
---

TypeScript gives you a type system, but having types and using them effectively are very different things. Too many TypeScript codebases are sprinkled with `any`, littered with type assertions, and provide little more safety than plain JavaScript with autocomplete.

The patterns in this article are ones I reach for repeatedly in production codebases. They catch real bugs at compile time, make impossible states unrepresentable, and cost almost nothing at runtime. Over the years, I have found that adopting even two or three of these patterns dramatically reduces the number of runtime errors that make it to production.

## Pattern Overview

| Pattern | Problem It Solves | Runtime Cost | Difficulty |
|---|---|---|---|
| Discriminated unions | Impossible states in data models | None | Low |
| Branded types | Mixing up primitive IDs/values | None | Medium |
| `unknown` over `any` | Unvalidated data access | Negligible | Low |
| Template literal types | Invalid string formats | None | Medium |
| `satisfies` | Type validation without losing precision | None | Low |
| `noUncheckedIndexedAccess` | Unsafe array/object access | None | Config change |
| Result types | Silent error swallowing | Negligible | Medium |

## Discriminated Unions for State Management

Discriminated unions are the single most powerful pattern in TypeScript for modelling state correctly.

### The problem

Consider an API response. Many developers model it like this:

```typescript
interface ApiResponse {
  loading: boolean;
  error: string | null;
  data: User[] | null;
}
```

This type allows impossible states. You can have `loading: true` with `data` populated. You can have `error` set alongside valid `data`. The type does not reflect reality.

### The solution

```typescript
type ApiResponse =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; error: string }
  | { status: "success"; data: User[] };
```

Now each state is explicit. When the status is `"error"`, `data` does not exist. When it is `"success"`, `error` does not exist. TypeScript will enforce this everywhere you use the type.

### Exhaustive checking

Pair discriminated unions with exhaustive switch statements:

```typescript
function renderResponse(response: ApiResponse) {
  switch (response.status) {
    case "idle":
      return null;
    case "loading":
      return <Spinner />;
    case "error":
      return <ErrorMessage message={response.error} />;
    case "success":
      return <UserList users={response.data} />;
    default:
      const _exhaustive: never = response;
      return _exhaustive;
  }
}
```

The `never` assignment in the default case means that if you add a new status variant and forget to handle it, the compiler will immediately flag it as an error. This pattern has saved me from subtle bugs more times than I can count, particularly when adding new states to existing workflows.

## Branded Types to Prevent Mix-Ups

### The problem

When your functions accept primitive types, it is easy to pass arguments in the wrong order:

```typescript
function assignUserToTeam(userId: string, teamId: string) { ... }

// Compiles fine, but the arguments are swapped
assignUserToTeam(teamId, userId);
```

### The solution

Branded types create nominally distinct types from the same underlying primitive:

```typescript
type UserId = string & { readonly __brand: "UserId" };
type TeamId = string & { readonly __brand: "TeamId" };

function userId(id: string): UserId {
  return id as UserId;
}

function teamId(id: string): TeamId {
  return id as TeamId;
}

function assignUserToTeam(user: UserId, team: TeamId) { ... }

// Now this is a compile error
assignUserToTeam(teamId("t-1"), userId("u-1"));
```

The brand property does not exist at runtime. It is purely a compile-time construct that prevents you from accidentally mixing up IDs. I have seen this pattern prevent real production bugs in payment systems where mixing up a `PaymentId` and an `OrderId` would have had serious financial consequences.

## The `unknown` Type Instead of `any`

### The problem

`any` disables type checking entirely. Once a value is typed as `any`, it can be used as anything without validation:

```typescript
function processInput(input: any) {
  // No error, even if input has no .name property
  console.log(input.name.toUpperCase());
}
```

### The solution

Use `unknown` to represent values whose type you genuinely do not know. Unlike `any`, `unknown` requires you to narrow the type before using it:

```typescript
function processInput(input: unknown) {
  if (typeof input === "object" && input !== null && "name" in input) {
    const name = (input as { name: unknown }).name;
    if (typeof name === "string") {
      console.log(name.toUpperCase());
    }
  }
}
```

This is more verbose, but it is honest. Every assumption about the value's shape is validated. The <a href="https://www.typescriptlang.org/docs/handbook/2/narrowing.html" target="_blank" rel="noopener noreferrer">TypeScript handbook on narrowing ↗</a> covers the full range of type guard techniques you can use with `unknown`.

## Template Literal Types for String Validation

TypeScript's template literal types let you constrain strings to specific patterns at compile time.

```typescript
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";
type ApiRoute = `/${string}`;
type EventName = `on${Capitalize<string>}`;

function registerRoute(method: HttpMethod, path: ApiRoute) { ... }

// Compile error: route must start with /
registerRoute("GET", "users");

// Valid
registerRoute("GET", "/users");
```

This pattern is especially useful for configuration objects, event names, and any domain where strings follow a predictable format. If you are building APIs, these patterns pair well with the [API design principles](/backend/api-design-principles-every-developer-should-know) that keep your endpoints consistent.

## `satisfies` for Type Validation Without Widening

The `satisfies` operator, introduced in TypeScript 4.9, lets you validate that a value conforms to a type without losing its specific literal types.

```typescript
type Colour = "red" | "green" | "blue";
type ColourMap = Record<Colour, string>;

// Using a type annotation widens the values
const colours: ColourMap = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
};
// colours.red is typed as 'string'

// Using satisfies preserves the literal types
const colours2 = {
  red: "#ff0000",
  green: "#00ff00",
  blue: "#0000ff",
} satisfies ColourMap;
// colours2.red is typed as "#ff0000"
```

This is invaluable for configuration objects where you want both validation (does the object match the expected shape?) and precision (what are the exact values?).

## `noUncheckedIndexedAccess` for Safer Array and Object Access

This tsconfig option is not enabled by `strict` mode, but it should be in every project. The <a href="https://www.typescriptlang.org/tsconfig/#noUncheckedIndexedAccess" target="_blank" rel="noopener noreferrer">TypeScript documentation on noUncheckedIndexedAccess ↗</a> explains the rationale in detail.

Without it, accessing an array element or object property by index is assumed to be defined:

```typescript
const items: string[] = [];
const first = items[0]; // typed as string (wrong!)
first.toUpperCase(); // runtime error, but no compile error
```

With `noUncheckedIndexedAccess` enabled:

```typescript
const items: string[] = [];
const first = items[0]; // typed as string | undefined
first.toUpperCase(); // compile error: Object is possibly 'undefined'
```

This catches a genuinely common bug: accessing array elements without checking whether they exist.

<svg viewBox="0 0 700 350" xmlns="http://www.w3.org/2000/svg" aria-label="Chart showing the relative bug prevention impact of different TypeScript patterns">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="700" height="350" fill="#f8fafc" rx="8"/>
  <text x="350" y="32" text-anchor="middle" font-size="16" font-weight="600" fill="#334155">Bug Prevention Impact by Pattern</text>
  <text x="350" y="52" text-anchor="middle" font-size="11" fill="#64748b">Estimated percentage of runtime errors prevented (based on production experience)</text>
  <!-- Axis -->
  <line x1="220" y1="75" x2="220" y2="310" stroke="#94a3b8" stroke-width="1"/>
  <line x1="220" y1="310" x2="660" y2="310" stroke="#94a3b8" stroke-width="1"/>
  <!-- Bars (horizontal) -->
  <text x="210" y="100" text-anchor="end" font-size="11" fill="#334155">Discriminated unions</text>
  <rect x="220" y="86" width="400" height="22" fill="#22c55e" rx="3"/>
  <text x="630" y="101" font-size="11" font-weight="600" fill="#166534">High</text>

  <text x="210" y="138" text-anchor="end" font-size="11" fill="#334155">noUncheckedIndexedAccess</text>
  <rect x="220" y="124" width="340" height="22" fill="#22c55e" rx="3"/>
  <text x="570" y="139" font-size="11" font-weight="600" fill="#166534">High</text>

  <text x="210" y="176" text-anchor="end" font-size="11" fill="#334155">Result types</text>
  <rect x="220" y="162" width="300" height="22" fill="#3b82f6" rx="3"/>
  <text x="530" y="177" font-size="11" font-weight="600" fill="#1e40af">Medium-High</text>

  <text x="210" y="214" text-anchor="end" font-size="11" fill="#334155">unknown over any</text>
  <rect x="220" y="200" width="260" height="22" fill="#3b82f6" rx="3"/>
  <text x="490" y="215" font-size="11" font-weight="600" fill="#1e40af">Medium</text>

  <text x="210" y="252" text-anchor="end" font-size="11" fill="#334155">Branded types</text>
  <rect x="220" y="238" width="200" height="22" fill="#f59e0b" rx="3"/>
  <text x="430" y="253" font-size="11" font-weight="600" fill="#92400e">Medium</text>

  <text x="210" y="290" text-anchor="end" font-size="11" fill="#334155">Template literal types</text>
  <rect x="220" y="276" width="140" height="22" fill="#f59e0b" rx="3"/>
  <text x="370" y="291" font-size="11" font-weight="600" fill="#92400e">Moderate</text>
</svg>

## Result Types Instead of Thrown Errors

### The problem

Thrown errors are invisible in the type system. Nothing in a function signature tells you it might throw:

```typescript
function parseConfig(raw: string): Config {
  // might throw, but the type does not say so
  return JSON.parse(raw);
}
```

### The solution

Return a result type that makes success and failure explicit:

```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function parseConfig(raw: string): Result<Config, string> {
  try {
    const parsed = JSON.parse(raw);
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Invalid JSON" };
  }
}

const result = parseConfig(rawInput);
if (result.ok) {
  // result.value is Config
} else {
  // result.error is string
}
```

The caller is forced to handle both cases. Errors cannot be silently ignored. This pairs naturally with [writing tests that actually help](/code-quality/how-to-write-tests-that-actually-help), because result types make the success and failure paths explicit and testable.

## Putting It All Together

These patterns share a common philosophy: make invalid states unrepresentable and make the compiler do the checking. Each one trades a small amount of upfront typing for a significant reduction in runtime errors.

Start by enabling strict mode and `noUncheckedIndexedAccess` in your tsconfig. Then adopt discriminated unions for your state types and branded types for your identifiers. Replace `any` with `unknown`. Consider result types for operations that can fail.

None of these patterns are theoretical. They are practical tools that work in production codebases today, catching real bugs that would otherwise reach your users. Combined with [automated code quality tools](/code-quality/automating-code-quality-with-linters-and-formatters), they form a safety net that catches issues long before they reach production.
