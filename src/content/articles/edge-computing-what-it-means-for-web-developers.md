---
title: "Edge Computing: What It Means for Web Developers"
description: "Understand what edge computing means for web developers and how to use edge functions for faster, globally distributed apps."
publishDate: "2026-01-23"
author: "gareth-clubb"
category: "frontend"
tags: ["edge-computing", "performance", "cloudflare-workers", "serverless", "web-development"]
featured: false
draft: false
faqs:
  - question: "What is edge computing in simple terms?"
    answer: "Edge computing runs your server-side code on servers located close to your users, rather than in a single centralised data centre. Instead of a request travelling from Tokyo to a server in Virginia, it is handled by a server in Tokyo. This reduces latency and improves performance."
  - question: "What is the difference between edge functions and serverless functions?"
    answer: "Traditional serverless functions (like AWS Lambda) run in one or a few regions. Edge functions run on a global network of servers, typically hundreds of locations worldwide. Edge functions start faster (often under 5ms cold start) and are closer to users, but they have more constraints on runtime, memory, and available APIs."
  - question: "Which platforms support edge computing?"
    answer: "Major platforms include Cloudflare Workers, Vercel Edge Functions, Deno Deploy, Netlify Edge Functions, and AWS CloudFront Functions. Each has different runtime constraints, pricing models, and supported APIs. Cloudflare Workers is one of the most mature and widely adopted."
  - question: "What are the limitations of edge computing?"
    answer: "Key limitations include restricted runtime environments (no full Node.js API), limited execution time (typically 10-50ms for free tiers), constrained memory, no persistent filesystem, and the complexity of data access since your database is usually in a single region. These constraints are improving rapidly."
  - question: "Should I move my entire application to the edge?"
    answer: "Probably not. Move the parts that benefit most from low latency and global distribution: authentication checks, content personalisation, A/B testing, geolocation-based routing, and static asset transformation. Keep compute-heavy operations and database-intensive work in your origin server."
primaryKeyword: "edge computing web developers"
---

Your server is in Virginia. Your user is in Sydney. Every request travels 15,000 kilometres each way, adding at least 200ms of latency before your code even starts executing. No amount of code optimisation can fix the speed of light.

Edge computing solves this by running your code where your users are. It is not a theoretical concept any more; it is a practical tool that web developers can use today, and it changes how you think about server-side logic. Having deployed edge functions across several production projects, I can confirm the performance gains are real and often dramatic.

## What Edge Computing Actually Is

The "edge" refers to the edge of the network, the servers closest to end users. Major providers operate hundreds of data centres worldwide. When you deploy code to the edge, it runs in whichever data centre is nearest to the user making the request.

For web developers, this typically means edge functions: small pieces of server-side logic that execute on this global network. Think of them as serverless functions, but instead of running in one region, they run everywhere.

### The Latency Impact

The difference is measurable and significant. A traditional serverless function in `us-east-1` serving a user in London adds roughly 80ms of network latency per round trip. An edge function serving the same user from a London data centre adds less than 5ms.

For a single request, 75ms might seem trivial. But modern web applications make multiple server requests during page load: authentication checks, data fetching, personalisation logic, and API calls. Multiply 75ms across four or five requests, and you are looking at 300ms or more of avoidable latency. That is the difference between a site that feels instant and one that feels sluggish. For more on improving load times, see [web performance quick wins for frontend developers](/frontend/web-performance-quick-wins-for-frontend-developers).

## Edge vs Origin: Latency Comparison

| User Location | Origin (us-east-1) | Edge (nearest PoP) | Latency Saved |
|--------------|--------------------|--------------------|---------------|
| New York | ~10ms | ~5ms | 5ms |
| London | ~80ms | ~5ms | 75ms |
| Sydney | ~200ms | ~5ms | 195ms |
| Tokyo | ~170ms | ~5ms | 165ms |
| Sao Paulo | ~130ms | ~5ms | 125ms |
| Mumbai | ~190ms | ~5ms | 185ms |

*Approximate round-trip latency per request. Multiply by the number of server requests during page load for total impact.*

<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart comparing response latency from a centralised origin server versus edge functions for users in different global locations">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="350" y="25" text-anchor="middle" font-size="15" font-weight="bold" fill="#334155">Response Latency: Origin vs Edge (per request)</text>
  <!-- Legend -->
  <rect x="220" y="38" width="14" height="14" rx="2" fill="#ef4444" opacity="0.8"/>
  <text x="240" y="50" font-size="11" fill="#334155">Origin (us-east-1)</text>
  <rect x="380" y="38" width="14" height="14" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="400" y="50" font-size="11" fill="#334155">Edge (nearest PoP)</text>
  <!-- Y axis -->
  <line x1="100" y1="70" x2="100" y2="260" stroke="#cbd5e1" stroke-width="1"/>
  <text x="90" y="75" text-anchor="end" font-size="10" fill="#64748b">200ms</text>
  <text x="90" y="122" text-anchor="end" font-size="10" fill="#64748b">150ms</text>
  <text x="90" y="170" text-anchor="end" font-size="10" fill="#64748b">100ms</text>
  <text x="90" y="217" text-anchor="end" font-size="10" fill="#64748b">50ms</text>
  <text x="90" y="264" text-anchor="end" font-size="10" fill="#64748b">0ms</text>
  <!-- Grid lines -->
  <line x1="100" y1="70" x2="660" y2="70" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="100" y1="118" x2="660" y2="118" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="100" y1="165" x2="660" y2="165" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="100" y1="213" x2="660" y2="213" stroke="#f1f5f9" stroke-width="1"/>
  <line x1="100" y1="260" x2="660" y2="260" stroke="#cbd5e1" stroke-width="1"/>
  <!-- New York -->
  <rect x="115" y="251" width="30" height="9" rx="2" fill="#ef4444" opacity="0.8"/>
  <rect x="148" y="256" width="30" height="4" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="146" y="285" text-anchor="middle" font-size="10" fill="#334155">New York</text>
  <!-- London -->
  <rect x="205" y="184" width="30" height="76" rx="2" fill="#ef4444" opacity="0.8"/>
  <rect x="238" y="256" width="30" height="4" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="236" y="285" text-anchor="middle" font-size="10" fill="#334155">London</text>
  <!-- Sydney -->
  <rect x="295" y="70" width="30" height="190" rx="2" fill="#ef4444" opacity="0.8"/>
  <rect x="328" y="256" width="30" height="4" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="326" y="285" text-anchor="middle" font-size="10" fill="#334155">Sydney</text>
  <!-- Tokyo -->
  <rect x="385" y="98" width="30" height="162" rx="2" fill="#ef4444" opacity="0.8"/>
  <rect x="418" y="256" width="30" height="4" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="416" y="285" text-anchor="middle" font-size="10" fill="#334155">Tokyo</text>
  <!-- Sao Paulo -->
  <rect x="475" y="136" width="30" height="124" rx="2" fill="#ef4444" opacity="0.8"/>
  <rect x="508" y="256" width="30" height="4" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="506" y="285" text-anchor="middle" font-size="10" fill="#334155">Sao Paulo</text>
  <!-- Mumbai -->
  <rect x="565" y="79" width="30" height="181" rx="2" fill="#ef4444" opacity="0.8"/>
  <rect x="598" y="256" width="30" height="4" rx="2" fill="#22c55e" opacity="0.8"/>
  <text x="596" y="285" text-anchor="middle" font-size="10" fill="#334155">Mumbai</text>
</svg>

## What You Can Do at the Edge

Edge functions are not a replacement for your application server. They are a complement to it, handling specific tasks where proximity to the user matters most.

### Authentication and Authorisation

Validating a JWT or session token at the edge means unauthenticated requests never reach your origin server. This reduces load on your backend and provides faster responses for both authenticated and unauthenticated users.

```javascript
export default {
  async fetch(request) {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return new Response('Unauthorised', { status: 401 });
    }

    const isValid = await verifyJWT(token);
    if (!isValid) {
      return new Response('Forbidden', { status: 403 });
    }

    // Forward to origin with user context
    const headers = new Headers(request.headers);
    headers.set('X-User-Id', extractUserId(token));

    return fetch(request.url, { headers });
  }
};
```

### Content Personalisation

Geolocation data is available at the edge without any API calls. You can personalise content based on the user's country, region, or city instantly:

- Display prices in the local currency
- Show region-specific content or promotions
- Redirect to localised versions of your site
- Comply with regional data regulations by routing requests appropriately

### A/B Testing

Traditional A/B testing either flickers (client-side) or adds latency (server-side in a distant region). At the edge, you can assign users to experiment groups and serve the appropriate variant with negligible overhead. The user never sees a content flash, and there is no latency penalty. This pairs well with [feature flags](/devops/feature-flags-a-practical-introduction) for progressive rollouts.

### API Response Transformation

The edge is an excellent place to transform, filter, or aggregate API responses before they reach the client. You can merge responses from multiple origin endpoints into a single response, strip unnecessary fields to reduce payload size, or add caching headers based on content type.

### Security and Rate Limiting

Bot detection, rate limiting, and DDoS mitigation at the edge protect your origin server from abusive traffic. Requests that should be blocked never reach your infrastructure, saving both compute resources and bandwidth.

## The Data Problem

The biggest challenge with edge computing is data access. Your code runs globally, but your database almost certainly does not. A function running in Tokyo that needs to query a PostgreSQL database in Frankfurt faces the same latency problem edge computing was supposed to solve.

### Solutions That Exist Today

**Edge-native databases.** Services like <a href="https://developers.cloudflare.com/d1/" target="_blank" rel="noopener noreferrer">Cloudflare D1 ↗</a>, Turso (libSQL), and PlanetScale offer globally distributed databases designed for edge access. They replicate data to multiple regions, providing low-latency reads from anywhere.

**Key-value stores.** Cloudflare KV, Vercel Edge Config, and similar services provide globally distributed key-value storage with fast reads. They are eventually consistent, so they are best for data that does not change frequently: configuration, feature flags, cached content.

**Edge caching.** Cache frequently accessed data at the edge using the Cache API. Compute the response once at your origin, cache it globally, and serve subsequent requests from the edge with zero origin latency.

**Read replicas.** Some managed database providers offer read replicas in multiple regions. Your edge function queries the nearest replica for reads and routes writes to the primary.

### The Consistency Trade-off

Global data distribution involves a fundamental trade-off: consistency versus latency. Strong consistency requires coordination across regions, which adds latency. Eventual consistency is fast but means different users might briefly see different data.

For many use cases, eventual consistency is perfectly acceptable. A product listing that takes 30 seconds to propagate globally is fine. A bank balance that shows stale data is not. Choose your consistency model based on what your users actually need.

## Runtime Constraints

Edge functions run in lightweight runtimes, typically V8 isolates rather than full Node.js environments. This means:

**No full Node.js API.** File system access, child processes, and some Node.js modules are unavailable. Most Web Standard APIs are supported, however: `fetch`, `Request`, `Response`, `URL`, `crypto`, `TextEncoder`, and similar.

**Limited execution time.** Free tiers typically allow 10 to 50ms of CPU time. Paid tiers offer more, but edge functions are not designed for long-running computations.

**Memory constraints.** Edge functions have significantly less memory than traditional serverless functions. Complex data processing or large JSON parsing may not be feasible.

**Cold start advantages.** V8 isolates start in under 5ms, compared to 100ms or more for traditional serverless. This makes edge functions feel consistently fast, even for infrequent requests.

## Edge Platform Comparison

| Platform | Runtime | Free Tier | Global PoPs | Database Integration | Best For |
|----------|---------|-----------|-------------|---------------------|----------|
| Cloudflare Workers | V8 isolates | 100k requests/day | 300+ | D1, KV, R2, Durable Objects | Full-stack edge apps |
| Vercel Edge Functions | V8 isolates | Included with Vercel plan | 100+ | Vercel KV, Edge Config | Next.js/framework projects |
| Deno Deploy | Deno runtime | 100k requests/day | 35+ | Deno KV | TypeScript-first projects |
| Netlify Edge Functions | Deno runtime | 50k invocations/month | CDN-based | Limited | JAMstack sites |
| AWS CloudFront Functions | Lightweight JS | 2M invocations/month | 400+ | None (viewer-facing only) | Simple request manipulation |

## Frameworks and Tooling

The developer experience for edge computing has matured significantly. Modern frameworks make it straightforward to deploy to the edge.

**Astro, Next.js, Nuxt, and SvelteKit** all support edge rendering, letting you deploy specific routes or your entire application to edge runtimes. You write standard framework code and configure which routes run at the edge. If you are [choosing a JavaScript framework](/frontend/choosing-the-right-javascript-framework-in-2026), edge support is now a meaningful differentiator.

**<a href="https://developers.cloudflare.com/workers/" target="_blank" rel="noopener noreferrer">Cloudflare Workers ↗</a>** provides the most mature standalone edge platform, with a comprehensive set of companion services: D1 for SQL, KV for key-value storage, R2 for object storage, Durable Objects for stateful coordination, and Queues for asynchronous processing.

**Wrangler, Vercel CLI, and Netlify CLI** provide local development environments that simulate edge behaviour, so you can develop and test locally before deploying globally.

## When to Use Edge Computing

Edge computing is not appropriate for everything. Use it when latency to end users matters, the computation is lightweight, and the data access patterns can accommodate a distributed architecture.

Start with one use case that clearly benefits from edge execution: authentication, personalisation, or response caching. Deploy it, measure the latency improvement, and expand from there. The tools are ready. The performance gains are real. The question is not whether edge computing is useful; it is which parts of your application should run there first.
