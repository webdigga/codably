---
title: "Refactoring Legacy Code Without Breaking It"
description: "Refactoring legacy code safely: a practical playbook with characterisation tests, seams, strangler fig, and small changes that keep production up."
publishDate: "2026-04-22"
author: "gareth-clubb"
category: "code-quality"
tags: ["legacy-code", "refactoring", "code-quality", "testing", "technical-debt", "characterisation-tests"]
featured: false
draft: false
faqs:
  - question: "What is the safest way to refactor legacy code?"
    answer: "Write characterisation tests first, then change behaviour in the smallest increments you can commit. Do not rename, move, and rewrite in the same change. Rename in one commit, move in another, rewrite in a third. Each step is separately reviewable, separately revertible, and leaves the build green. The risk is not the size of the end state, it is the size of the step that gets you there."
  - question: "What is a characterisation test?"
    answer: "A characterisation test pins the current behaviour of a piece of code, even if that behaviour is wrong. The point is not to describe what the code should do; it is to give you a safety net that fails loudly if a refactor accidentally changes behaviour. Michael Feathers coined the term in Working Effectively with Legacy Code. In practice you run the code with representative inputs, capture the output, and commit the captured output as the assertion."
  - question: "Should you refactor and add features at the same time?"
    answer: "No. Refactoring changes structure without changing behaviour. Adding a feature changes behaviour. If you interleave them, a bug in the new feature looks like a regression in the refactor, and you waste hours bisecting. Refactor first, commit, then add the feature on the cleaner base. The two mental modes are different, and switching between them inside a single commit is how mistakes ship."
  - question: "What is the strangler fig pattern?"
    answer: "The strangler fig is a technique for replacing a legacy system incrementally. You put a facade in front of the old system, route a small subset of traffic to a new implementation, and grow the new implementation's surface area over time until the old one is unused. Martin Fowler named the pattern after the strangler fig tree. It works because you never need a big-bang switchover, which is usually where legacy replacements die."
  - question: "How small should a refactoring commit be?"
    answer: "Small enough that a reviewer can read it in under five minutes and a bisect will point at something useful. For a rename, one commit per renamed symbol is often right. For an extraction, one commit for the extraction and one for the first caller to use it. Large refactoring PRs hide bugs and scare reviewers into rubber-stamping. Nine small commits beat one huge one every time."
primaryKeyword: "refactoring legacy code"
---

The phrase "we just need a refactor" has cost me more weekends than any outage. Not because refactoring is bad, but because the team that said it usually meant "we will rewrite this for two months and hope it still works". That is not refactoring. That is a rewrite dressed up in safer language, and rewrites are where production goes to die.

Refactoring, done properly, is the opposite of that. It is dozens of small, safe, reversible changes that leave behaviour untouched. The codebase improves on every commit and nothing breaks. The craft is in keeping each step small enough that it cannot break anything, even when the end state looks radically different from where you started.

This piece is about how to do that on code you did not write, probably do not fully understand, and cannot afford to break. If you have not already mapped the terrain, start with our guide to [auditing a legacy codebase](/code-quality/how-to-audit-a-legacy-codebase) before you touch any code.

## Why Refactoring Usually Goes Wrong

The standard legacy refactor fails in one of four ways.

- **No tests.** The team assumes they can "just be careful". Careful does not detect the behaviour that nobody knew about until a customer complained.
- **Too much at once.** One pull request renames, moves, and rewrites. Reviewers cannot tell what changed, and bisect cannot isolate the regression.
- **Mixing refactor with feature work.** Every change is either behaviour-preserving or behaviour-changing. Do one at a time.
- **Refactoring the wrong thing.** The prettiest module is rewritten while the gnarly one that actually causes incidents is left alone.

Every one of these is avoidable with discipline, not cleverness.

## The Core Loop

Refactoring legacy code is a tight loop you run hundreds of times.

<svg viewBox="0 0 720 200" xmlns="http://www.w3.org/2000/svg" aria-label="Refactor loop showing five steps: pin behaviour with tests, find a seam, make a small change, keep the build green, commit, and repeat.">
  <style>text { font-family: 'Inter', system-ui, sans-serif; }</style>
  <text x="360" y="24" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">The Safe Refactor Loop</text>
  <rect x="20" y="70" width="120" height="60" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.5" />
  <text x="80" y="98" text-anchor="middle" font-size="12" fill="#92400e">Pin behaviour</text>
  <text x="80" y="114" text-anchor="middle" font-size="10" fill="#92400e">characterisation tests</text>
  <line x1="140" y1="100" x2="170" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)" />
  <rect x="170" y="70" width="120" height="60" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="230" y="98" text-anchor="middle" font-size="12" fill="#3730a3">Find a seam</text>
  <text x="230" y="114" text-anchor="middle" font-size="10" fill="#3730a3">decouple from the world</text>
  <line x1="290" y1="100" x2="320" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)" />
  <rect x="320" y="70" width="120" height="60" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="380" y="98" text-anchor="middle" font-size="12" fill="#3730a3">Small change</text>
  <text x="380" y="114" text-anchor="middle" font-size="10" fill="#3730a3">one refactor, no features</text>
  <line x1="440" y1="100" x2="470" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)" />
  <rect x="470" y="70" width="120" height="60" rx="8" fill="#e0e7ff" stroke="#6366f1" stroke-width="1.5" />
  <text x="530" y="98" text-anchor="middle" font-size="12" fill="#3730a3">Build green</text>
  <text x="530" y="114" text-anchor="middle" font-size="10" fill="#3730a3">tests pass, commit</text>
  <line x1="590" y1="100" x2="620" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)" />
  <rect x="620" y="70" width="80" height="60" rx="8" fill="#bbf7d0" stroke="#22c55e" stroke-width="1.5" />
  <text x="660" y="98" text-anchor="middle" font-size="12" fill="#166534">Repeat</text>
  <text x="660" y="114" text-anchor="middle" font-size="10" fill="#166534">every few minutes</text>
  <defs>
    <marker id="arr2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
    </marker>
  </defs>
</svg>

Every orbit of that loop leaves you with a codebase that is slightly better than it was, a green build, and a commit you can revert if anything surprising happens later. The loop takes five to fifteen minutes. If you are going an hour without committing, the loop is too big.

## Step 1: Pin the Behaviour Before You Change It

You cannot preserve behaviour you cannot observe. Legacy code almost never has enough tests, so your first job is not refactoring, it is testing.

### Characterisation Tests

A characterisation test does not describe what the code should do. It describes what it actually does. You call the function with realistic inputs, record the output, and pin the recording as the assertion. Michael Feathers introduced the term in <em>Working Effectively with Legacy Code</em>, and it remains the single most useful technique for taming an unknown codebase.

```python
def test_price_quote_uk_basic():
    quote = calculate_quote(
        base_price=100.0,
        country="UK",
        customer_type="retail",
        promo_code=None,
    )
    # captured from running against production-like inputs
    assert quote.subtotal == 100.0
    assert quote.vat == 20.0
    assert quote.total == 120.0
    assert quote.breakdown == ["base", "vat"]
```

If the assertion looks odd, resist the urge to "fix" it during the refactor. The characterisation test documents reality. If reality is wrong, that is a separate ticket, for a separate commit, done with a different mindset.

### Approval Tests for Complex Outputs

When the output is a large structure (a JSON response, a generated file, a rendered email), hand-asserting every field is tedious and misses regressions. Approval tests capture the whole output to a file, and future runs diff against it. <a href="https://www.approvaltests.com/" target="_blank" rel="noopener noreferrer">ApprovalTests ↗</a> has libraries for most major languages. The first run creates the snapshot, subsequent runs fail on any difference, and a diff tool gives you a clear picture of what changed.

For the patterns that work best when adding tests to untested code, see [how to write tests that actually help](/code-quality/how-to-write-tests-that-actually-help).

## Step 2: Find a Seam

A seam is a place where you can change behaviour without editing the code there. Dependency injection points are seams. Function parameters are seams. Subclass overrides are seams. Global singletons and direct database calls are not seams; they are hard couplings, and they are why the test suite takes six minutes per run.

The refactor pattern: introduce a seam, then use it.

Before:

```javascript
function processOrder(orderId) {
  const order = db.query("SELECT * FROM orders WHERE id = ?", orderId);
  const customer = db.query("SELECT * FROM customers WHERE id = ?", order.customer_id);
  // 80 more lines...
  mailer.send(customer.email, "Order confirmed", body);
}
```

After introducing seams (without changing behaviour):

```javascript
function processOrder(orderId, deps = { db, mailer }) {
  const order = deps.db.query("SELECT * FROM orders WHERE id = ?", orderId);
  const customer = deps.db.query("SELECT * FROM customers WHERE id = ?", order.customer_id);
  // 80 more lines unchanged...
  deps.mailer.send(customer.email, "Order confirmed", body);
}
```

Existing callers pass nothing and get the default, so behaviour is identical. New tests inject fakes. That one change, committed on its own, is enough to unlock real unit tests without touching any business logic.

## Step 3: Use the Refactor Catalog, Not Your Instincts

The common refactors have names, and they have names for a reason. Each one has known preconditions and known mechanics. Following the mechanics gets you there safely; improvising does not. <a href="https://refactoring.com/catalog/" target="_blank" rel="noopener noreferrer">Martin Fowler's refactoring catalog ↗</a> is the reference.

A minimal set worth knowing cold:

| Refactor | When to Reach For It |
|---|---|
| Extract Function | A block of code has a coherent purpose and benefits from a name |
| Inline Function | A tiny function is only called once and hides what is happening |
| Rename | The current name is misleading, not just short |
| Move Function | A function uses another class's data more than its own |
| Replace Conditional with Polymorphism | A type switch is repeated in three or more places |
| Introduce Parameter Object | A function signature has five or more primitive parameters |
| Split Phase | A function does two unrelated things in sequence |

Pick the smallest refactor that improves the code in front of you. Do not reach for the biggest one because it feels more productive. Ten applications of Extract Function beat one application of "rewrite everything".

## Step 4: Keep Changes Behaviour-Preserving

Every commit is one of three things: a characterisation test, a refactor, or a behaviour change. Never combine two in one commit. If you realise halfway through a refactor that you also need to fix a bug, stash the bug fix, finish the refactor commit, and come back to the bug.

This is the single piece of discipline that separates refactors that succeed from refactors that leak regressions. When something breaks three weeks later and you bisect, the commit that caused it should either say "refactor: extract validation" (and the fix is obvious) or "fix: handle empty string in quote" (and the refactor was fine). If it says "refactor and fix bug", you will spend an hour untangling both.

If you need to fix bugs while refactoring, read [technical debt, when to fix it and when to leave it](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) first. Not every bug in the legacy module is your problem to solve in this PR.

## Step 5: Use the Strangler Fig for the Big Stuff

Some code cannot be refactored in place. The design is so wrong that local improvements make things worse. For those cases, the <a href="https://martinfowler.com/bliki/StranglerFigApplication.html" target="_blank" rel="noopener noreferrer">strangler fig pattern ↗</a> lets you replace the module incrementally without a big-bang cutover.

The mechanics:

1. Put a thin facade in front of the legacy module. No behaviour change yet.
2. Build the new implementation behind the facade, for one small path only.
3. Route that one path to the new implementation via a feature flag.
4. Watch metrics and errors. Roll back by flipping the flag, not by redeploying.
5. Expand to the next path. Repeat until the legacy module is unreachable.
6. Delete the old code.

The critical part is step 3. If you cannot toggle back to the old path in seconds, you are doing a rewrite with extra steps, not a strangler fig.

## A Worked Example

Take a function that has grown for three years and now does too much.

```python
def handle_signup(email, password, plan, promo_code, referrer_id):
    # 12 lines of validation
    if not email or "@" not in email:
        raise ValueError("Invalid email")
    if len(password) < 8:
        raise ValueError("Password too short")
    # ... more validation

    # 8 lines of user creation
    user_id = db.insert("users", {"email": email, "password": bcrypt.hash(password)})

    # 15 lines of promo code handling
    discount = 0
    if promo_code:
        promo = db.query_one("SELECT * FROM promos WHERE code = ?", promo_code)
        if promo and promo["expires_at"] > now():
            discount = promo["discount"]
            db.insert("promo_uses", {"user_id": user_id, "promo_id": promo["id"]})

    # 10 lines of billing setup
    # ... stripe calls

    # 6 lines of email
    # ... welcome email
```

The instinct is to rewrite it. Do not. Run the loop.

**Commit 1:** Add characterisation tests covering the happy path, each validation error, the promo code cases, and a signup with no promo code. Do not touch the function.

**Commit 2:** Extract `validate_signup(email, password, plan)` with no behaviour change. The tests still pass.

**Commit 3:** Extract `create_user(email, password)`. Tests still pass.

**Commit 4:** Extract `apply_promo_code(user_id, promo_code)`. Tests still pass.

**Commit 5:** Extract `setup_billing(user_id, plan, discount)`. Tests still pass.

**Commit 6:** Extract `send_welcome_email(user_id)`. Tests still pass.

After six commits, `handle_signup` is a six-line orchestrator. Each piece is independently testable, and the test suite is stronger than before. No behaviour has changed. If anything breaks in production a month later, bisect points at one extraction, not a two-hundred-line rewrite.

## Measuring That You Are Actually Making Things Better

Refactoring without a measurable outcome is how teams end up rearranging deckchairs. Pick a metric before you start and watch it.

Useful metrics:

- **Time to run the relevant test suite.** If your refactor does not reduce this, think about why.
- **Number of files changed to add a new field / feature / route in the module.** Legacy code tends to require edits in eight places. A good refactor should cut that.
- **Cyclomatic complexity of the hottest files.** A drop here correlates with fewer bugs landing on the module.
- **Number of lines changed per bug fix in the module over the next three months.** The real test of a refactor is whether the next person who touches the module has an easier time than you did.

If none of those numbers move, you refactored for taste, not value. That is not necessarily wrong, but be honest about it.

## Common Traps

I have watched every one of these land a refactor back in "rewrite" territory.

- **Renaming in the same commit as extracting.** Commit the rename, then commit the extraction, so reviewers can see what actually happened.
- **Changing default behaviour for "consistency".** A function that silently accepts null and returns an empty list might be load-bearing for three callers. Check before you change.
- **Deleting "dead" code without `git log`ing it.** Code that has not been touched in three years might be the once-a-year annual report generator. The VCS tells you.
- **Refactoring in a long-lived branch.** Every day the branch exists, main moves, and merging gets worse. Small PRs against main beat a two-week refactor branch.
- **Optimising before measuring.** A "refactor" that adds a cache layer is a feature, not a refactor. If it matters, it deserves its own PR with its own benchmarks.

## When To Refactor, and When Not To

Not every legacy module deserves attention. The answer is where the work is, not where the ugliness is.

Refactor when:

- You have a real feature to add to the module in the next two weeks.
- The module is on the critical path of an incident that recurs.
- New joiners consistently get stuck on it.
- The test suite for it is slow enough that nobody runs it locally.

Do not refactor when:

- Nothing in the module is changing and nothing is breaking.
- The team is under a deadline and the refactor is not on the critical path.
- You do not have deployable, reversible changes, meaning no feature flags and no quick rollback.

Refactoring legacy code well is a patience game. It rewards engineers who are comfortable making a codebase one percent better on each commit, for weeks, rather than planning a clean sweep that arrives in three months and never actually lands. Pair the discipline here with the diagnostic work in our [auditing a legacy codebase guide](/code-quality/how-to-audit-a-legacy-codebase) and the troubleshooting patterns in [debugging strategies that actually save you time](/code-quality/debugging-strategies-that-actually-save-you-time), and you have a complete set of tools for turning a feared module into one you are confident to work on.

The codebase did not become legacy in a week, and it will not become pleasant in a week either. But it will become pleasant, one safe commit at a time.
