---
title: "The Pragmatic Approach to Microservices"
description: "A pragmatic approach to microservices that helps teams avoid common pitfalls and adopt the pattern where it genuinely adds value."
publishDate: "2026-01-26"
author: "gareth-clubb"
category: "architecture"
tags: ["microservices", "architecture", "system-design", "monolith", "distributed-systems"]
featured: false
draft: false
faqs:
  - question: "When should I use microservices instead of a monolith?"
    answer: "Consider microservices when your monolith has become a bottleneck for team autonomy, when different parts of your system have genuinely different scaling requirements, or when you need independent deployability for business reasons. If your team is small or your domain is not well understood, a monolith is almost certainly the better choice."
  - question: "How small should a microservice be?"
    answer: "The 'micro' in microservices is misleading. A service should be large enough to represent a meaningful business capability and small enough that a single team can own it fully. Think in terms of bounded contexts from domain-driven design, not lines of code."
  - question: "What is a modular monolith?"
    answer: "A modular monolith is a single deployable application with well-defined internal module boundaries. Each module encapsulates a business domain with clear interfaces and minimal coupling. It provides many of the organisational benefits of microservices without the operational complexity of distributed systems."
  - question: "What are the hidden costs of microservices?"
    answer: "Hidden costs include distributed tracing and observability tooling, service mesh or API gateway infrastructure, more complex deployment pipelines, data consistency challenges, network latency between services, and the cognitive overhead of understanding a distributed system."
  - question: "Can I migrate from a monolith to microservices gradually?"
    answer: "Yes, and you should. The strangler fig pattern lets you extract services incrementally, routing traffic to the new service while keeping the monolith functional. This reduces risk and lets you learn from each extraction before committing to the next."
primaryKeyword: "pragmatic microservices"
---

Microservices are not a goal. They are a tool for solving specific problems, and like any tool, they come with trade-offs that too many teams discover only after committing to the architecture.

I have watched teams adopt microservices because it felt like the modern thing to do, only to spend the next two years solving distributed systems problems that their monolith never had. I have also seen microservices dramatically improve delivery speed for organisations that genuinely needed them. The difference comes down to understanding when the pattern adds value and when it adds complexity.

## The Case Against Starting With Microservices

If you are building a new product, you probably should not start with microservices. This is not a controversial take; it is practical experience speaking.

In the early stages of a product, your domain model is unstable. You are still discovering what your boundaries should be. Drawing service boundaries incorrectly is enormously expensive to fix because it involves data migration, API changes, and cross-service refactoring, all of which are harder than moving code between modules in a monolith.

<a href="https://martinfowler.com/bliki/MonolithFirst.html" target="_blank" rel="noopener noreferrer">Martin Fowler's "monolith first" advice ↗</a> remains sound. Build a well-structured monolith, understand your domain, and then extract services when you have evidence that they are needed. This aligns with the broader principle of [choosing boring technology](/architecture/the-case-for-boring-technology) when you can.

### What a Well-Structured Monolith Looks Like

A monolith does not have to be a tangled mess. A **modular monolith** organises code into distinct modules, each representing a bounded context:

- Each module has a clear public interface
- Modules communicate through defined APIs, not by reaching into each other's internals
- Database tables are owned by specific modules; other modules access that data through the module's interface
- Modules can be developed and tested independently

This structure gives you most of the organisational benefits of microservices (team autonomy, clear ownership, independent development) without the operational complexity of a distributed system.

## When Microservices Actually Make Sense

Microservices solve specific problems. If you have these problems, the pattern is worth considering.

### Independent Scaling

If one part of your system handles 10,000 requests per second while another handles 10, running them as a single process means you are scaling (and paying for) the entire system to meet the demands of the busiest component. Separate services let you scale each component independently.

### Team Autonomy at Scale

When you have multiple teams working on the same codebase, coordination costs grow. Merge conflicts, shared deployments, and coupled release schedules slow everyone down. Microservices let teams own their service end-to-end: development, deployment, operations. For organisations with 50+ engineers working on the same product, this autonomy can be transformative.

### Technology Heterogeneity

Different problems sometimes require different tools. A machine learning pipeline might benefit from Python, while a high-throughput API might be better served by Go. Microservices let each team choose the technology that best fits their problem, though this benefit is often overstated and the operational cost of supporting multiple technology stacks is significant.

### Independent Deployability

If a bug in the billing module should not block deployment of a new feature in the search module, independent services give you isolated deployment pipelines. This reduces risk and increases deployment frequency for each team.

## Monolith vs Microservices: A Comparison

| Factor | Modular Monolith | Microservices |
|--------|-----------------|---------------|
| Deployment complexity | Single deployable unit | Multiple independent deployments |
| Data consistency | ACID transactions available | Eventual consistency, sagas required |
| Team coordination | Shared codebase, merge coordination | Independent repos, API contracts |
| Debugging | Single process, simple stack traces | Distributed tracing required |
| Scaling | Scale entire application | Scale individual services |
| Latency | In-process function calls | Network calls between services |
| Initial setup cost | Low | High (infrastructure, tooling, CI/CD) |
| Best for team size | Under 30 engineers | Over 50 engineers |
| Domain understanding | Can evolve boundaries easily | Costly to change service boundaries |

## The Hidden Costs

Before committing to microservices, ensure your team understands the costs. Working with teams over the years, I have found that most underestimate the operational burden by a factor of two or three.

### Distributed Systems Are Hard

Once your code crosses a network boundary, you face a new class of problems. Network calls can fail, time out, or return stale data. You need retry logic, circuit breakers, and timeout configuration. You need to handle partial failures gracefully. These problems do not exist in a monolith. For more on resilience patterns, see [building resilient APIs with retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns).

### Data Consistency

In a monolith, a database transaction can guarantee consistency across your entire domain. In microservices, each service typically owns its own data store. Maintaining consistency across services requires patterns like sagas, event sourcing, or eventual consistency, all of which are significantly more complex than a simple transaction. Database migrations also become more complex when each service owns its own schema.

### Operational Overhead

Each service needs its own CI/CD pipeline, its own monitoring, its own logs, its own alerts, and its own deployment configuration. Five services means five times the operational infrastructure. At scale, you need service discovery, load balancing, and potentially a service mesh. This is where a solid understanding of [observability](/devops/observability-vs-monitoring-what-developers-need-to-know) becomes non-negotiable.

### Testing Complexity

Unit testing individual services is straightforward. Testing the interactions between services is not. Integration tests become slower, more brittle, and harder to maintain. Contract testing helps but adds another layer of tooling.

### Debugging

When a user reports a problem, you need to trace the request across multiple services, each with its own logs and metrics. Distributed tracing is essential, and setting it up properly is a significant investment.

<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the operational complexity growth as you move from a monolith to multiple microservices">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="350" y="25" text-anchor="middle" font-size="15" font-weight="bold" fill="#334155">Operational Complexity Growth</text>
  <!-- X axis -->
  <line x1="80" y1="275" x2="660" y2="275" stroke="#cbd5e1" stroke-width="1"/>
  <text x="370" y="310" text-anchor="middle" font-size="12" fill="#64748b">Number of Services</text>
  <!-- Y axis -->
  <line x1="80" y1="275" x2="80" y2="50" stroke="#cbd5e1" stroke-width="1"/>
  <text x="25" y="165" font-size="12" fill="#64748b" text-anchor="middle" transform="rotate(-90 25 165)">Operational Effort</text>
  <!-- X labels -->
  <text x="130" y="295" text-anchor="middle" font-size="11" fill="#64748b">1 (monolith)</text>
  <text x="250" y="295" text-anchor="middle" font-size="11" fill="#64748b">3</text>
  <text x="370" y="295" text-anchor="middle" font-size="11" fill="#64748b">5</text>
  <text x="490" y="295" text-anchor="middle" font-size="11" fill="#64748b">10</text>
  <text x="610" y="295" text-anchor="middle" font-size="11" fill="#64748b">20+</text>
  <!-- Curve: operational effort grows super-linearly -->
  <path d="M 130 255 Q 250 240 250 220 Q 320 195 370 165 Q 430 120 490 90 Q 550 68 610 60" fill="none" stroke="#ef4444" stroke-width="2.5"/>
  <!-- Data points -->
  <circle cx="130" cy="255" r="5" fill="#ef4444"/>
  <circle cx="250" cy="220" r="5" fill="#ef4444"/>
  <circle cx="370" cy="165" r="5" fill="#ef4444"/>
  <circle cx="490" cy="90" r="5" fill="#ef4444"/>
  <circle cx="610" cy="60" r="5" fill="#ef4444"/>
  <!-- Annotations -->
  <text x="150" y="250" font-size="10" fill="#64748b">Simple</text>
  <text x="380" y="158" font-size="10" fill="#64748b">CI/CD, tracing, service mesh</text>
  <text x="510" y="55" font-size="10" fill="#ef4444" font-weight="600">Dedicated platform team needed</text>
  <!-- Linear reference line -->
  <line x1="130" y1="255" x2="610" y2="175" stroke="#3b82f6" stroke-width="1" stroke-dasharray="6"/>
  <text x="560" y="192" font-size="10" fill="#3b82f6">Linear growth (ideal)</text>
  <text x="550" y="75" font-size="10" fill="#ef4444">Actual growth</text>
</svg>

## Pragmatic Principles

If you decide that microservices are right for your situation, these principles will help you avoid common pitfalls.

### Start With the Domain

Use domain-driven design to identify your bounded contexts before drawing service boundaries. A microservice should align with a business capability, not a technical layer. "User Service, Order Service, Payment Service" is far better than "Database Service, API Service, Queue Service."

### One Team, One Service

A service should be owned by a single team that is responsible for its development, deployment, and operation. If two teams need to coordinate to make a change to a service, your boundaries are wrong.

### Smart Endpoints, Dumb Pipes

Keep your communication infrastructure simple. HTTP/REST or lightweight messaging (like NATS or RabbitMQ) is usually sufficient. Avoid the temptation to put business logic in your message broker or API gateway. For guidance on designing those inter-service APIs, the <a href="https://martinfowler.com/articles/microservices.html" target="_blank" rel="noopener noreferrer">original microservices article by Martin Fowler and James Lewis ↗</a> remains an excellent reference.

### Design for Failure

Assume every network call will eventually fail. Implement retries with exponential backoff, circuit breakers to prevent cascade failures, timeouts on every external call, and graceful degradation when a downstream service is unavailable.

### Prefer Choreography Over Orchestration

Event-driven communication, where services react to events published by other services, is generally more resilient and less coupled than orchestrated workflows where a central coordinator directs the process. Services that publish events do not need to know who consumes them.

## The Extraction Pattern

If you are migrating from a monolith, the <a href="https://martinfowler.com/bliki/StranglerFigApplication.html" target="_blank" rel="noopener noreferrer">strangler fig pattern ↗</a> is your friend.

Identify a bounded context in your monolith that is a good candidate for extraction: well-defined boundaries, minimal coupling, and a team that wants to own it. Build the new service alongside the monolith. Route traffic to the new service gradually, keeping the monolith as a fallback. Once the new service is proven, remove the old code from the monolith.

Repeat this process, one service at a time. Each extraction teaches you something about your domain boundaries and your operational readiness. After two or three extractions, your team will have developed the skills and infrastructure to continue confidently. You might also want to consider [whether a monorepo or polyrepo structure](/architecture/monorepos-vs-polyrepos-which-is-right-for-you) best suits your evolving architecture.

## The Bottom Line

Microservices are a powerful architectural pattern for organisations that have outgrown their monolith. They are a poor starting point for new projects and a dangerous choice for teams that are not prepared for the operational complexity.

Be honest about your situation. If your monolith is slowing you down because of team coordination problems, scaling limitations, or deployment coupling, microservices might be the answer. If your monolith is slowing you down because the code is poorly structured, the answer is refactoring, not redistribution.

The pragmatic approach is to earn your complexity. Start simple, structure your code well, and adopt microservices when the evidence says you need them, not a moment sooner.
