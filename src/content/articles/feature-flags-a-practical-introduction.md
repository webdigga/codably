---
title: "Feature Flags: A Practical Introduction"
description: "A practical introduction to feature flags covering implementation patterns, rollout strategies, and common pitfalls to avoid."
publishDate: "2026-02-15"
author: "david-white"
category: "devops"
tags: ["feature-flags", "devops", "deployment", "continuous-delivery", "release-management"]
featured: false
draft: false
faqs:
  - question: "What is a feature flag?"
    answer: "A feature flag is a conditional check in your code that controls whether a feature is active or inactive. This lets you deploy code to production without exposing it to users, then enable it separately when you are ready. Feature flags decouple deployment from release."
  - question: "Should I build my own feature flag system or use a service?"
    answer: "For simple on/off flags, a basic implementation with a configuration file or database table works fine. For percentage rollouts, A/B testing, user targeting, and audit trails, a dedicated service like LaunchDarkly, Unleash, or Flagsmith saves significant development and operational effort."
  - question: "How do feature flags affect performance?"
    answer: "The overhead of evaluating a feature flag is negligible, typically a few microseconds for a local evaluation. If you are using a remote service, cache flag values locally and evaluate against the cache. Avoid making a network call for every flag evaluation in a hot path."
  - question: "When should I remove a feature flag?"
    answer: "Remove a feature flag as soon as the feature is fully rolled out and stable. Most flags should be temporary, lasting days to weeks. Set a review date when you create the flag, and treat flag removal as part of the feature's definition of done."
  - question: "Can feature flags be used for A/B testing?"
    answer: "Yes. Feature flags are the mechanism behind most A/B testing systems. You can assign users to different variants based on a consistent hashing algorithm, then measure the impact of each variant on your key metrics."
primaryKeyword: "feature flags"
---

You have finished a feature. The tests pass, the code review is done, and it is ready to ship. But the marketing team is not ready to announce it yet. Or the feature depends on a partner integration that is not live. Or you just want to test it with a small group before opening it up to everyone.

Feature flags solve all of these problems. They let you deploy code to production without exposing it to users, giving you fine-grained control over who sees what and when. In my experience, once a team starts using feature flags, they fundamentally change how that team thinks about deployments and risk.

## The Simplest Feature Flag

At its core, a feature flag is just a conditional:

```javascript
if (featureFlags.isEnabled('new-checkout-flow')) {
  return renderNewCheckout();
} else {
  return renderLegacyCheckout();
}
```

The flag value can come from an environment variable, a database table, a configuration file, or a dedicated feature flag service. The implementation can be as simple or as sophisticated as your needs require.

For a basic setup, a JSON configuration file works well:

```json
{
  "new-checkout-flow": false,
  "dark-mode": true,
  "beta-search": false
}
```

Read this file at application startup, and you have a working feature flag system. To enable a feature, change the value and restart the application (or use a file watcher for hot reloading).

## Beyond Simple Toggles

Simple on/off flags are useful, but the real power of feature flags comes from more advanced patterns.

### Percentage Rollouts

Instead of enabling a feature for everyone at once, roll it out to a percentage of users. Start at 1%, monitor your error rates and performance metrics, then gradually increase to 5%, 25%, 50%, and finally 100%.

```javascript
function isEnabledForUser(flagName, userId) {
  const flag = getFlag(flagName);
  if (!flag.percentageRollout) return flag.enabled;

  // Consistent hashing ensures the same user always
  // gets the same result
  const hash = consistentHash(flagName + userId);
  return hash % 100 < flag.percentageRollout;
}
```

The consistent hashing is important. You want the same user to always see the same variant. If user 42 sees the new checkout flow on Monday, they should see it on Tuesday as well. Random evaluation per request creates a confusing, inconsistent experience.

### User Targeting

Target specific users or groups for early access. This is useful for beta testing with internal users, enabling features for specific customers, or giving your QA team access to features before they are released.

```javascript
const flags = {
  'new-dashboard': {
    enabled: false,
    allowedUsers: ['user-123', 'user-456'],
    allowedGroups: ['beta-testers', 'internal'],
  },
};
```

### Environment-Based Flags

Some flags should be on in staging but off in production, or enabled in certain regions but not others. Environment-based flags let you test features in non-production environments without risk.

## Feature Flag Types and Use Cases

| Flag Type | Lifespan | Use Case | Removal Priority |
|---|---|---|---|
| Release flag | Days to weeks | Decouple deployment from release | High, remove after full rollout |
| Experiment flag | Weeks to months | A/B testing and data collection | Medium, remove after experiment concludes |
| Ops flag | Indefinite (with review) | Kill switches, load shedding | Low, keep but audit regularly |
| Permission flag | Long-lived | Premium features, entitlements | N/A, part of business logic |

## Implementation Patterns

### The Flag Provider Pattern

Centralise your flag evaluation logic behind a clean interface:

```typescript
interface FlagProvider {
  isEnabled(flagName: string, context?: FlagContext): boolean;
}

interface FlagContext {
  userId?: string;
  userGroups?: string[];
  environment?: string;
}
```

This lets you swap implementations easily. Start with a simple JSON file provider for development, then switch to a database-backed provider or a third-party service as your needs grow. This follows the same principle of [choosing boring, simple approaches first](/architecture/the-case-for-boring-technology) and only adding complexity when you genuinely need it.

### Server-Side vs Client-Side Evaluation

For web applications, you have a choice: evaluate flags on the server and send the result to the client, or send flag configurations to the client and evaluate them in the browser.

Server-side evaluation is simpler and more secure. The client never sees your flag configuration, and you do not need to worry about users inspecting flag values in their browser's developer tools.

Client-side evaluation is useful for single-page applications where you need to toggle features without a page reload. Most feature flag services provide client SDKs that cache flag values and update them in real time.

### Feature Flags in Infrastructure

Feature flags are not just for application code. You can use them for infrastructure changes too:

- Route a percentage of traffic to a new service version
- Enable a new caching layer for specific endpoints
- Switch between database read replicas
- Toggle between different CDN configurations

This lets you test infrastructure changes incrementally, with the same safety nets you use for application features. This approach complements your [CI/CD pipeline](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) by adding an extra layer of control beyond what deployment automation alone provides.

<svg viewBox="0 0 650 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the feature flag rollout lifecycle from 0% to 100% with monitoring checkpoints at each stage.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="650" height="320" fill="#f8fafc" rx="8"/>
  <text x="325" y="30" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Feature Flag Rollout Lifecycle</text>
  <!-- Timeline -->
  <line x1="50" y1="150" x2="600" y2="150" stroke="#cbd5e1" stroke-width="2"/>
  <!-- Stage 1: Deploy (0%) -->
  <circle cx="80" cy="150" r="18" fill="#64748b"/>
  <text x="80" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">0%</text>
  <text x="80" y="125" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Deploy</text>
  <text x="80" y="185" text-anchor="middle" font-size="9" fill="#64748b">Code in prod,</text>
  <text x="80" y="197" text-anchor="middle" font-size="9" fill="#64748b">flag off</text>
  <!-- Stage 2: Internal (1%) -->
  <circle cx="185" cy="150" r="18" fill="#3b82f6"/>
  <text x="185" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">1%</text>
  <text x="185" y="125" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Internal</text>
  <text x="185" y="185" text-anchor="middle" font-size="9" fill="#64748b">Team only,</text>
  <text x="185" y="197" text-anchor="middle" font-size="9" fill="#64748b">catch obvious bugs</text>
  <!-- Stage 3: Canary (5%) -->
  <circle cx="290" cy="150" r="18" fill="#22c55e"/>
  <text x="290" y="155" text-anchor="middle" font-size="11" font-weight="bold" fill="#ffffff">5%</text>
  <text x="290" y="125" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Canary</text>
  <text x="290" y="185" text-anchor="middle" font-size="9" fill="#64748b">Small user group,</text>
  <text x="290" y="197" text-anchor="middle" font-size="9" fill="#64748b">monitor metrics</text>
  <!-- Stage 4: Expand (25-50%) -->
  <circle cx="395" cy="150" r="18" fill="#f59e0b"/>
  <text x="395" y="155" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">50%</text>
  <text x="395" y="125" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Expand</text>
  <text x="395" y="185" text-anchor="middle" font-size="9" fill="#64748b">Half of users,</text>
  <text x="395" y="197" text-anchor="middle" font-size="9" fill="#64748b">validate at scale</text>
  <!-- Stage 5: Full (100%) -->
  <circle cx="500" cy="150" r="18" fill="#22c55e"/>
  <text x="500" y="155" text-anchor="middle" font-size="10" font-weight="bold" fill="#ffffff">100%</text>
  <text x="500" y="125" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Full</text>
  <text x="500" y="185" text-anchor="middle" font-size="9" fill="#64748b">All users,</text>
  <text x="500" y="197" text-anchor="middle" font-size="9" fill="#64748b">feature is live</text>
  <!-- Stage 6: Clean up -->
  <circle cx="590" cy="150" r="18" fill="#ef4444"/>
  <text x="590" y="155" text-anchor="middle" font-size="9" font-weight="bold" fill="#ffffff">Rm</text>
  <text x="590" y="125" text-anchor="middle" font-size="10" font-weight="bold" fill="#334155">Clean up</text>
  <text x="590" y="185" text-anchor="middle" font-size="9" fill="#64748b">Remove flag,</text>
  <text x="590" y="197" text-anchor="middle" font-size="9" fill="#64748b">delete old path</text>
  <!-- Monitoring checkpoints -->
  <text x="135" y="240" text-anchor="middle" font-size="9" fill="#3b82f6">Check errors</text>
  <line x1="135" y1="225" x2="135" y2="168" stroke="#3b82f6" stroke-width="1" stroke-dasharray="3"/>
  <text x="345" y="255" text-anchor="middle" font-size="9" fill="#f59e0b">Check latency + errors</text>
  <line x1="345" y1="240" x2="345" y2="168" stroke="#f59e0b" stroke-width="1" stroke-dasharray="3"/>
  <text x="545" y="270" text-anchor="middle" font-size="9" fill="#22c55e">Confirm stable</text>
  <line x1="545" y1="255" x2="545" y2="168" stroke="#22c55e" stroke-width="1" stroke-dasharray="3"/>
  <!-- Footer -->
  <text x="325" y="305" text-anchor="middle" font-size="10" fill="#94a3b8">At every stage, disabling the flag is an instant rollback</text>
</svg>

## Common Pitfalls

### Flag Debt

The biggest risk with feature flags is accumulating too many of them. Every flag adds a conditional branch to your code. Left unchecked, you end up with a codebase riddled with old flags that nobody remembers the purpose of. This is a form of [technical debt](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) that grows silently.

**Set an expiry date when you create a flag.** Most flags should be temporary. Once a feature is fully rolled out and stable, remove the flag and the old code path. Treat flag cleanup as a first-class task, not something you will get to eventually.

### Testing Combinatorial Explosion

If you have 10 feature flags, you theoretically have 1,024 possible combinations. You cannot test them all. Instead, test each flag independently in its on and off states, and identify any flags that interact with each other for targeted combination testing.

### Inconsistent Flag Evaluation

If your application evaluates flags at multiple points (middleware, service layer, frontend), ensure they all agree on the same values. A user who sees the new feature in the UI but hits the old API endpoint will have a broken experience.

Use a single flag evaluation point and pass the results through your application context.

### Using Flags as Configuration

Feature flags should be temporary. If you need permanent configuration options (per-tenant settings, pricing tiers, regional variations), use a proper configuration system. Mixing long-lived configuration with short-lived feature flags makes your flag system harder to manage.

## Choosing a Feature Flag Tool

### Build Your Own

For small teams with simple needs, a basic flag system is straightforward to build. A database table with flag names, enabled states, and optional user lists covers most use cases. You can build a simple admin UI in a few days.

The downside is that you own the maintenance. As your needs grow to include percentage rollouts, audit trails, and real-time updates, the maintenance burden grows with them. I have found that teams tend to outgrow home-built solutions faster than they expect.

### Use a Service

Dedicated feature flag services like <a href="https://launchdarkly.com/" target="_blank" rel="noopener noreferrer">LaunchDarkly ↗</a>, <a href="https://www.getunleash.io/" target="_blank" rel="noopener noreferrer">Unleash (open source) ↗</a>, and Flagsmith provide all of the advanced features out of the box. They handle real-time flag updates, audit trails, percentage rollouts, user targeting, and analytics.

The trade-off is cost and an external dependency. For most teams, the time saved on building and maintaining a custom system outweighs the subscription cost.

## A Practical Rollout Strategy

Here is a straightforward approach for rolling out a new feature with flags:

1. **Wrap the feature in a flag.** Keep the old code path intact.
2. **Deploy to production with the flag off.** The code is in production but inactive.
3. **Enable for internal users.** Your team uses the feature first and catches obvious issues.
4. **Roll out to 5% of users.** Monitor error rates, latency, and user feedback.
5. **Increase to 25%, then 50%, then 100%.** At each stage, check your metrics before proceeding. Having proper [observability](/devops/observability-vs-monitoring-what-developers-need-to-know) is essential here.
6. **Remove the flag.** Delete the conditional, the old code path, and the flag definition.

This process might take a day for a simple feature or a few weeks for a critical flow. The point is that at every stage, you can roll back instantly by disabling the flag.

## Conclusion

Feature flags are one of the most practical tools for shipping software safely. They decouple deployment from release, enable gradual rollouts, and give you an instant rollback mechanism. Start simple with a basic flag implementation, and grow your approach as your needs evolve. Just remember to clean up your flags. The only thing worse than shipping a bug is shipping a bug because a forgotten flag enabled a half-finished feature.
