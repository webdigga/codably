---
title: "Caching Strategies Every Developer Should Know"
description: "Learn the most important caching strategies for web applications, from browser and CDN caching to in-memory stores and cache invalidation patterns."
publishDate: "2026-03-14"
author: "david-white"
category: "backend"
tags: ["caching", "performance", "backend", "redis", "web-performance", "scalability"]
featured: false
draft: false
faqs:
  - question: "What is the best caching strategy for web applications?"
    answer: "There is no single best strategy. The right approach depends on your data access patterns, consistency requirements, and infrastructure. For read-heavy workloads with infrequent updates, cache-aside with a TTL works well. For data that must stay fresh, write-through caching is more appropriate. Most production systems use a combination of strategies at different layers."
  - question: "When should I use Redis vs Memcached for caching?"
    answer: "Redis is generally the better choice for most use cases because it supports richer data structures (lists, sets, sorted sets, hashes), persistence, and replication. Memcached is simpler and can be slightly faster for basic key-value lookups with very high throughput. Choose Memcached if you only need simple string caching at massive scale; choose Redis for everything else."
  - question: "How do I know if my application needs caching?"
    answer: "Look for repeated expensive operations: database queries that run frequently with the same parameters, API calls to slow external services, or computations that produce the same result for the same input. If your application has high read-to-write ratios and you are seeing performance bottlenecks on repeated data access, caching will likely help."
  - question: "What is cache stampede and how do I prevent it?"
    answer: "A cache stampede occurs when a cached item expires and many requests simultaneously try to regenerate it, overwhelming the data source. Prevention techniques include lock-based recomputation (only one request rebuilds the cache while others wait), probabilistic early expiration (randomly refreshing before the TTL expires), and stale-while-revalidate patterns that serve slightly outdated data while refreshing in the background."
  - question: "How long should I set my cache TTL?"
    answer: "TTL depends on how stale your data can be. For static assets like images and fonts, use long TTLs (days or weeks). For user-facing content that changes occasionally, minutes to hours is typical. For data that changes frequently but tolerates brief staleness, seconds to minutes works. Start conservative (shorter TTLs) and increase once you understand your invalidation patterns."
primaryKeyword: "caching strategies"
---

## Why Caching Matters More Than You Think

Caching is one of the most effective ways to improve application performance, reduce infrastructure costs, and deliver a better user experience. A well-placed cache can turn a 500ms database query into a 2ms lookup, cut your server costs in half, and make your application feel instant.

Yet caching is also one of the most common sources of bugs in production systems. Stale data, inconsistent state, and thundering herds have brought down countless applications. Phil Karlton famously noted that the two hardest problems in computer science are cache invalidation and naming things. He was not wrong.

This guide covers the caching strategies you will encounter most often in practice, when to use each one, and how to avoid the pitfalls that catch most teams.

## The Layers of Caching

Before diving into strategies, it helps to understand where caches can sit in a typical web application stack. Each layer has different characteristics, and most production systems use several of them together.

| Layer | Location | Typical TTL | Best For |
|---|---|---|---|
| Browser cache | Client device | Minutes to weeks | Static assets, API responses |
| CDN cache | Edge servers | Minutes to hours | Static content, public API responses |
| Application cache | App server memory | Seconds to minutes | Computed values, session data |
| Distributed cache | Redis, Memcached | Seconds to hours | Shared state, database query results |
| Database cache | Query cache, buffer pool | Automatic | Repeated queries, hot data pages |

### Browser Caching

Browser caching is your first line of defence. By setting appropriate `Cache-Control` headers, you tell the browser to store responses locally and avoid making network requests entirely. This is the fastest cache possible because no network round-trip is needed.

For static assets like JavaScript bundles, CSS files, and images, use content-hashed filenames and set long cache lifetimes: `Cache-Control: public, max-age=31536000, immutable`. When the file changes, the filename changes, and the browser fetches the new version automatically. For tips on optimising frontend asset delivery, see our guide on [web performance quick wins for frontend developers](/frontend/web-performance-quick-wins-for-frontend-developers).

For API responses, be more conservative. Use `Cache-Control: private, max-age=60` for user-specific data, or `Cache-Control: public, s-maxage=300` for shared data that can be cached at the CDN layer.

### CDN Caching

A CDN (Content Delivery Network) caches your content at edge locations close to your users. This reduces latency and offloads traffic from your origin servers. For applications with a global user base, CDN caching can dramatically improve response times.

The key decision with CDN caching is what to cache and for how long. Static HTML pages, public API responses, and media files are good candidates. User-specific or authenticated content typically should not be cached at the CDN level unless you use cache keys that include authentication tokens.

Edge computing takes this further by running application logic at the CDN edge. Our article on [edge computing for web developers](/frontend/edge-computing-what-it-means-for-web-developers) explores this in more detail.

### Distributed Caching

For data that needs to be shared across multiple application servers, distributed caches like Redis or Memcached are the standard solution. They sit between your application and your database, storing frequently accessed data in memory for fast retrieval.

Distributed caches are particularly valuable when your application runs on multiple servers behind a load balancer. An in-process cache on one server does not help requests that land on a different server. A shared Redis instance gives every server access to the same cached data.

## Core Caching Strategies

### Cache-Aside (Lazy Loading)

Cache-aside is the most common caching pattern. The application checks the cache first. If the data is there (a cache hit), it returns immediately. If not (a cache miss), the application fetches the data from the source, stores it in the cache, and then returns it.

```
1. Request arrives
2. Check cache for key
3. Cache hit? → Return cached data
4. Cache miss? → Query database
5. Store result in cache with TTL
6. Return data
```

**Advantages:** Only requested data gets cached, so the cache naturally fills with the most useful data. The application can tolerate cache failures by falling back to the database.

**Disadvantages:** The first request for any piece of data always hits the database (cold start). Data can become stale if the underlying source changes before the cache expires.

Cache-aside works well for read-heavy workloads where data does not change frequently. It is the default choice for most caching needs.

### Write-Through

With write-through caching, every write operation updates both the cache and the data source simultaneously. This guarantees that the cache always contains the latest data.

```
1. Write request arrives
2. Update database
3. Update cache with new value
4. Return success
```

**Advantages:** The cache is always consistent with the database. No stale data problem.

**Disadvantages:** Write operations are slower because they must update two stores. Data that is written but never read still occupies cache space.

Write-through is ideal when data consistency is critical and reads significantly outnumber writes. It pairs well with cache-aside: use write-through to keep the cache fresh, and cache-aside to handle cold starts gracefully.

### Write-Behind (Write-Back)

Write-behind caching writes to the cache immediately but defers the database write to a later time. The cache batches up changes and flushes them to the database periodically or when a threshold is reached.

**Advantages:** Write operations are extremely fast because they only touch the in-memory cache. Batching reduces database load.

**Disadvantages:** There is a risk of data loss if the cache fails before the write is persisted. The implementation is more complex, and debugging consistency issues is harder.

Use write-behind sparingly and only when write performance is a genuine bottleneck. It works well for non-critical data like analytics counters or activity logs where occasional data loss is acceptable.

### Read-Through

Read-through is similar to cache-aside, but the cache itself is responsible for loading data from the source on a miss. The application only ever talks to the cache, never directly to the database.

**Advantages:** Simpler application code because the caching logic is centralised. The application does not need to know about the data source.

**Disadvantages:** Requires a cache implementation that supports data loading. Less flexible than cache-aside for complex loading logic.

## Cache Invalidation Strategies

Getting data into the cache is straightforward. Knowing when to remove it is where things get difficult. Here are the most common invalidation approaches.

### Time-Based Expiration (TTL)

Set a time-to-live on each cached item. After the TTL expires, the cache discards the item and the next request triggers a fresh load. This is the simplest and most widely used invalidation strategy.

Choose your TTL based on how stale the data can be. A product catalogue that updates daily can use a TTL of hours. A stock price feed might need a TTL of seconds. When in doubt, start with shorter TTLs and increase them as you gain confidence in your invalidation patterns.

### Event-Based Invalidation

When the underlying data changes, explicitly invalidate or update the corresponding cache entries. This can be triggered by application events (a user updates their profile), database triggers, or message queue events.

Event-based invalidation gives you fresher data than TTL alone, but it requires more infrastructure. You need reliable event delivery and must track which cache keys correspond to which data changes. For systems that already use event-driven architecture, this fits naturally. For API design patterns that support event-driven invalidation, see our guide on [API design principles every developer should know](/backend/api-design-principles-every-developer-should-know).

### Versioned Keys

Instead of invalidating a cache entry, change the cache key. For example, include a version number in the key: `user:42:v3`. When the data changes, increment the version and all subsequent reads use the new key, effectively bypassing the stale cached value.

The old entries remain in the cache until they expire naturally or are evicted by memory pressure. This approach avoids the complexity of explicit invalidation and works well with immutable data patterns.

<svg viewBox="0 0 600 320" xmlns="http://www.w3.org/2000/svg" aria-label="Flowchart showing a decision tree for choosing the right caching strategy based on data consistency requirements, read-write ratio, and write performance needs.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="300" y="22" text-anchor="middle" font-size="14" font-weight="600" fill="#334155">Choosing the Right Caching Strategy</text>
  <!-- Start node -->
  <rect x="210" y="38" width="180" height="36" rx="18" fill="#ec4899" opacity="0.85" />
  <text x="300" y="61" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Data consistency critical?</text>
  <!-- Yes branch -->
  <line x1="255" y1="74" x2="160" y2="105" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="195" y="88" font-size="10" fill="#22c55e" font-weight="600">Yes</text>
  <rect x="70" y="105" width="180" height="36" rx="18" fill="#6366f1" opacity="0.75" />
  <text x="160" y="128" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Reads >> Writes?</text>
  <!-- Yes-Yes -->
  <line x1="115" y1="141" x2="80" y2="172" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="88" y="155" font-size="10" fill="#22c55e" font-weight="600">Yes</text>
  <rect x="10" y="172" width="140" height="32" rx="8" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-width="1" />
  <text x="80" y="193" text-anchor="middle" font-size="11" fill="#22c55e" font-weight="600">Write-Through</text>
  <!-- Yes-No -->
  <line x1="205" y1="141" x2="230" y2="172" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="222" y="155" font-size="10" fill="#ef4444" font-weight="600">No</text>
  <rect x="170" y="172" width="140" height="32" rx="8" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="1" />
  <text x="240" y="193" text-anchor="middle" font-size="11" fill="#f59e0b" font-weight="600">Event Invalidation</text>
  <!-- No branch -->
  <line x1="345" y1="74" x2="440" y2="105" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="400" y="88" font-size="10" fill="#ef4444" font-weight="600">No</text>
  <rect x="350" y="105" width="180" height="36" rx="18" fill="#6366f1" opacity="0.75" />
  <text x="440" y="128" text-anchor="middle" font-size="12" fill="#ffffff" font-weight="600">Write performance critical?</text>
  <!-- No-Yes -->
  <line x1="395" y1="141" x2="370" y2="172" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="374" y="155" font-size="10" fill="#22c55e" font-weight="600">Yes</text>
  <rect x="300" y="172" width="140" height="32" rx="8" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-width="1" />
  <text x="370" y="193" text-anchor="middle" font-size="11" fill="#ef4444" font-weight="600">Write-Behind</text>
  <!-- No-No -->
  <line x1="485" y1="141" x2="510" y2="172" stroke="#cbd5e1" stroke-width="1.5" />
  <text x="502" y="155" font-size="10" fill="#ef4444" font-weight="600">No</text>
  <rect x="450" y="172" width="140" height="32" rx="8" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-width="1" />
  <text x="520" y="193" text-anchor="middle" font-size="11" fill="#22c55e" font-weight="600">Cache-Aside + TTL</text>
  <!-- Bottom note -->
  <text x="300" y="240" text-anchor="middle" font-size="11" fill="#64748b">Most applications start with Cache-Aside + TTL and add complexity only when needed.</text>
  <!-- Legend -->
  <rect x="140" y="260" width="12" height="12" rx="2" fill="#22c55e" opacity="0.15" stroke="#22c55e" stroke-width="1" />
  <text x="158" y="271" font-size="10" fill="#334155">Simplest option</text>
  <rect x="260" y="260" width="12" height="12" rx="2" fill="#f59e0b" opacity="0.15" stroke="#f59e0b" stroke-width="1" />
  <text x="278" y="271" font-size="10" fill="#334155">Moderate complexity</text>
  <rect x="400" y="260" width="12" height="12" rx="2" fill="#ef4444" opacity="0.15" stroke="#ef4444" stroke-width="1" />
  <text x="418" y="271" font-size="10" fill="#334155">Use with caution</text>
</svg>

## Common Pitfalls and How to Avoid Them

### Cache Stampede

When a popular cache entry expires, hundreds of requests may simultaneously hit the database trying to rebuild it. This "thundering herd" can overwhelm your data source.

**Solutions:**

- **Locking:** Only one request rebuilds the cache while others wait or receive the stale value.
- **Probabilistic early expiration:** Each request has a small chance of refreshing the cache before the TTL expires, spreading the load over time.
- **Stale-while-revalidate:** Serve the expired value immediately while refreshing in the background.

### Cache Penetration

Cache penetration occurs when requests repeatedly query for data that does not exist, bypassing the cache every time because there is nothing to cache. An attacker can exploit this by requesting non-existent IDs.

**Solutions:**

- Cache negative results (with a shorter TTL) so that repeated lookups for missing data still hit the cache.
- Use a bloom filter to quickly check whether a key could possibly exist before querying the database.

### Inconsistent Data

When you cache data from multiple sources or cache denormalised views, updates to one source can leave the cache in an inconsistent state.

**Solutions:**

- Keep cache entries small and focused. Cache individual entities rather than pre-joined views where possible.
- Use event-based invalidation to update related cache entries when the source data changes.
- Accept eventual consistency where it is tolerable, and use shorter TTLs where it is not. For building APIs that handle these consistency tradeoffs gracefully, see [building resilient APIs with retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns).

### Over-Caching

Not everything should be cached. Caching data that changes frequently, is rarely accessed, or is cheap to compute adds complexity without meaningful performance improvement. It also increases memory usage and makes debugging harder.

Before adding a cache, measure the actual performance characteristics. Cache only when the data is expensive to fetch, accessed frequently, and tolerates some staleness. If the data changes on every request, caching will not help.

## Practical Implementation Tips

### Start Simple

Begin with the simplest caching strategy that could work. For most applications, that means cache-aside with a reasonable TTL. Add complexity only when you have evidence that you need it. Premature caching optimisation, like premature optimisation of any kind, creates maintenance burden without proportional benefit.

### Monitor Cache Performance

Track your cache hit rate, miss rate, and eviction rate. A healthy cache hit rate for most applications is above 80%. If your hit rate is low, investigate whether your TTLs are too short, your keys are too specific, or you are caching the wrong data.

Also monitor cache latency. A cache that is slower than the original data source is worse than no cache at all. For a broader look at monitoring and metrics, see our guide on [observability vs monitoring](/devops/observability-vs-monitoring-what-developers-need-to-know).

### Use Appropriate Data Structures

If you are using Redis, take advantage of its rich data structures. Use hashes for objects, sorted sets for leaderboards or time-series data, and sets for membership checks. The right data structure can eliminate the need for complex serialisation and deserialisation, and it lets you update individual fields without rewriting the entire cached object.

### Plan for Cache Failures

Your application should work without the cache, just more slowly. Never let a cache failure cascade into an application outage. Use circuit breakers to detect cache failures quickly and fall back to the data source. Set connection timeouts on your cache client so that a slow cache does not block your entire request.

### Document Your Caching Decisions

For each cache you introduce, document what is cached, why it is cached, the TTL, the invalidation strategy, and what happens when the cache is cold or unavailable. Future you (and your teammates) will thank you. Good documentation practices are worth the investment, as we covered in [writing documentation developers actually read](/collaboration/writing-documentation-developers-actually-read).

## When Not to Cache

Caching is not always the answer. Avoid caching when:

- **Data changes on every request.** Real-time data feeds, live dashboards with per-second updates, and user-specific computed values that change constantly gain nothing from caching.
- **Consistency is non-negotiable.** Financial transactions, inventory counts during checkout, and other scenarios where stale data causes real harm should query the source of truth directly.
- **The data source is already fast.** If your database query returns in 2ms, adding a cache layer adds complexity without meaningful improvement.
- **You have very low traffic.** Caching shines under load. For a low-traffic internal tool, the operational overhead of a cache may not be justified.

## A Practical Caching Checklist

Before implementing caching in your application, work through this checklist:

1. **Identify the bottleneck.** Use profiling and monitoring to confirm that data access is the actual performance problem.
2. **Choose the right layer.** Can browser caching or a CDN solve this without any application changes?
3. **Pick a strategy.** Cache-aside with TTL is the default. Only use more complex patterns when you have a clear reason.
4. **Set appropriate TTLs.** Start conservative and adjust based on monitoring data.
5. **Plan for invalidation.** Know how and when stale data will be refreshed.
6. **Handle failures gracefully.** Ensure the application degrades to working-without-cache, not crashing.
7. **Monitor everything.** Track hit rates, miss rates, latency, and memory usage from day one.
8. **Document your decisions.** Record the why behind each caching choice.

Caching done well is invisible to users: the application simply feels fast. Caching done poorly creates subtle, intermittent bugs that are difficult to reproduce and diagnose. Take the time to choose the right strategy, implement it carefully, and monitor it continuously. Your users, your database, and your on-call team will all benefit.
