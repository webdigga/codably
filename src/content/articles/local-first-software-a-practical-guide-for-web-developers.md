---
title: "Local-First Software: A Practical Guide for Web Developers"
description: "Learn how local-first software works, why it matters for web developers, and how to start building offline-capable apps with CRDTs and sync engines."
publishDate: "2026-04-06"
author: "gareth-clubb"
category: "architecture"
tags: ["local-first", "offline", "crdt", "architecture", "sync", "web-development"]
featured: false
draft: false
faqs:
  - question: "What is local-first software?"
    answer: "Local-first software stores data primarily on the user's device and treats the server as a secondary sync layer rather than the source of truth. This means the application works fully offline, responds instantly to user input without waiting for network round trips, and gives users complete ownership of their data. When connectivity is available, changes sync automatically with other devices or collaborators."
  - question: "How is local-first different from offline-first?"
    answer: "Offline-first typically means caching server data locally so the app can function without a connection, but the server remains the source of truth. Local-first goes further: the local copy is the primary copy. The app is designed to work indefinitely without a server. Sync is a feature, not a requirement. This distinction affects everything from data modelling to conflict resolution strategy."
  - question: "What are CRDTs and why do they matter for local-first apps?"
    answer: "CRDTs (Conflict-free Replicated Data Types) are data structures that can be modified independently on multiple devices and merged together without conflicts. They guarantee that all replicas eventually converge to the same state, regardless of the order in which changes arrive. This makes them ideal for local-first apps where multiple users or devices may edit the same data without coordinating through a central server."
  - question: "Do I need to understand CRDTs deeply to build local-first apps?"
    answer: "Not necessarily. Libraries like Yjs and Automerge abstract away the CRDT internals and expose simple APIs for working with shared documents. You can build a fully functional local-first app using these libraries without understanding the mathematical foundations. However, a basic grasp of how CRDTs resolve conflicts will help you design better data models and debug sync issues."
  - question: "Is local-first suitable for every type of application?"
    answer: "No. Local-first works best for applications where users create and edit data collaboratively or across devices, such as note-taking apps, document editors, project management tools, and creative software. Applications that rely heavily on server-side computation, real-time authoritative state (like multiplayer games with anti-cheat), or large datasets that cannot fit on a device are less suited to a purely local-first approach. That said, most apps can benefit from local-first principles, even if they do not adopt the full pattern."
primaryKeyword: "local-first software web developers"
---

The web was built on a client-server model. Your browser sends a request, a server processes it, and a response comes back. This model has served us well for decades, but it comes with trade-offs that we have largely accepted as inevitable: loading spinners, offline errors, and the uncomfortable reality that your data lives on someone else's computer.

Local-first software challenges that assumption. It puts the user's device at the centre, treating the server as a convenient sync layer rather than the single source of truth. The result is software that is faster, more resilient, and gives users genuine ownership of their data. The <a href="https://www.inkandswitch.com/local-first/" target="_blank" rel="noopener noreferrer">Ink & Switch research paper on local-first software ↗</a> first articulated these principles in 2019, and the ecosystem has matured dramatically since then.

## Why Local-First Matters Now

Three developments have made local-first practical for mainstream web development in 2026.

First, browser storage APIs have matured. IndexedDB, the Origin Private File System, and the Storage API now provide reliable, high-capacity local storage. The days of being limited to 5MB in localStorage are long gone. Modern browsers can store gigabytes of structured data locally, making it feasible to keep a full working copy of application data on the device. The <a href="https://developer.mozilla.org/en-US/docs/Web/API/Storage_API" target="_blank" rel="noopener noreferrer">MDN Storage API documentation ↗</a> details the current capabilities and quota management.

Second, the CRDT ecosystem has reached production quality. Libraries like <a href="https://yjs.dev/" target="_blank" rel="noopener noreferrer">Yjs ↗</a> and <a href="https://automerge.org/" target="_blank" rel="noopener noreferrer">Automerge ↗</a> provide battle-tested implementations of conflict-free replicated data types that handle the hardest part of local-first: merging concurrent edits without data loss.

Third, sync engines have emerged as a distinct product category. Tools like <a href="https://electric-sql.com/" target="_blank" rel="noopener noreferrer">ElectricSQL ↗</a> and <a href="https://www.powersync.com/" target="_blank" rel="noopener noreferrer">PowerSync ↗</a> bridge the gap between local databases and server-side PostgreSQL, handling bidirectional sync so you do not have to build it yourself.

## The Core Principles

The <a href="https://www.inkandswitch.com/local-first/" target="_blank" rel="noopener noreferrer">Ink & Switch paper ↗</a> defines seven ideals for local-first software. Understanding these helps you evaluate how far to take the pattern in your own projects.

| Principle | What It Means | Practical Impact |
|-----------|--------------|-----------------|
| No spinners | Data reads are instant from local storage | UI renders immediately, no loading states for cached data |
| Your work is not trapped | Data is stored in open formats on the user's device | Users can export, back up, and migrate freely |
| The network is optional | Full functionality without an internet connection | Works on aeroplanes, in basements, and in rural areas |
| Seamless collaboration | Multiple users can edit simultaneously | Changes merge automatically via CRDTs |
| The Long Now | Data persists for decades, not until a startup shuts down | No vendor lock-in to a specific cloud service |
| Security and privacy by default | End-to-end encryption is natural | Data stays encrypted until it reaches an authorised device |
| User retains ownership | No terms of service can revoke access | Users control their own data completely |

Not every application needs all seven. Most teams adopt local-first principles selectively, focusing on the ones that deliver the most value for their use case.

## How CRDTs Solve the Hard Problem

The fundamental challenge of local-first software is conflict resolution. When two users edit the same document while offline, what happens when they reconnect? Traditional approaches (last-write-wins, manual merge) are either lossy or require user intervention.

CRDTs solve this mathematically. They are data structures designed so that any two replicas can be merged deterministically, regardless of the order in which edits arrived. The result is always consistent across all devices, with no data loss and no user intervention.

<svg viewBox="0 0 600 280" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing how CRDTs enable conflict-free merging between two devices editing the same document offline">
  <style>
    .crdt-label { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 600; fill: #334155; }
    .crdt-sublabel { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
    .crdt-box { rx: 6; ry: 6; }
  </style>
  <!-- Device A -->
  <rect x="20" y="20" width="120" height="50" class="crdt-box" fill="#e0f2fe" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="80" y="42" text-anchor="middle" class="crdt-label">Device A</text>
  <text x="80" y="58" text-anchor="middle" class="crdt-sublabel">Edit: "Hello World"</text>
  <!-- Device B -->
  <rect x="460" y="20" width="120" height="50" class="crdt-box" fill="#dcfce7" stroke="#22c55e" stroke-width="1.5"/>
  <text x="520" y="42" text-anchor="middle" class="crdt-label">Device B</text>
  <text x="520" y="58" text-anchor="middle" class="crdt-sublabel">Edit: "Hello Team"</text>
  <!-- Offline zone -->
  <rect x="20" y="90" width="560" height="80" rx="6" ry="6" fill="#fef3c7" stroke="#f59e0b" stroke-width="1" stroke-dasharray="4"/>
  <text x="300" y="110" text-anchor="middle" class="crdt-sublabel">Both devices offline, editing independently</text>
  <!-- Device A offline edit -->
  <rect x="40" y="120" width="140" height="36" class="crdt-box" fill="#ffffff" stroke="#3b82f6" stroke-width="1"/>
  <text x="110" y="143" text-anchor="middle" class="crdt-sublabel">A adds: "Hello World!"</text>
  <!-- Device B offline edit -->
  <rect x="420" y="120" width="140" height="36" class="crdt-box" fill="#ffffff" stroke="#22c55e" stroke-width="1"/>
  <text x="490" y="143" text-anchor="middle" class="crdt-sublabel">B adds: "Hello Team!"</text>
  <!-- Sync arrows -->
  <line x1="180" y1="195" x2="300" y2="230" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowhead)"/>
  <line x1="420" y1="195" x2="300" y2="230" stroke="#6366f1" stroke-width="2" marker-end="url(#arrowhead)"/>
  <text x="300" y="205" text-anchor="middle" class="crdt-label" fill="#6366f1">CRDT Merge</text>
  <!-- Merged result -->
  <rect x="200" y="220" width="200" height="50" class="crdt-box" fill="#f0e6ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="300" y="242" text-anchor="middle" class="crdt-label">Merged Result</text>
  <text x="300" y="258" text-anchor="middle" class="crdt-sublabel">Both edits preserved, no conflict</text>
  <!-- Arrowhead marker -->
  <defs>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1"/>
    </marker>
  </defs>
</svg>

There are two main families of CRDTs you will encounter:

### Operation-Based CRDTs (CmRDTs)

These transmit individual operations (e.g. "insert character 'a' at position 5") between replicas. They produce smaller messages but require a reliable, ordered delivery channel. Yjs uses this approach.

### State-Based CRDTs (CvRDTs)

These transmit the full state of the data structure and merge it using a defined merge function. They are simpler to implement and tolerant of unreliable networks, but produce larger messages. Automerge uses a hybrid approach that combines the strengths of both.

For most web applications, you do not need to implement CRDTs from scratch. The <a href="https://crdt.tech/" target="_blank" rel="noopener noreferrer">CRDT.tech resource hub ↗</a> provides an excellent overview of the academic foundations, but in practice you will work with a library that handles the details.

## Choosing the Right Tools

The local-first ecosystem has grown rapidly. Here is a comparison of the most mature options for web developers.

| Tool | Approach | Best For | Language | Storage |
|------|----------|----------|----------|---------|
| Yjs | CRDT library | Real-time collaboration, text editing | JavaScript/TypeScript | Pluggable (IndexedDB, etc.) |
| Automerge | CRDT library | Document-based apps, JSON-like data | Rust core, JS bindings | Pluggable |
| ElectricSQL | Sync engine | Apps with existing PostgreSQL databases | TypeScript | SQLite (local), PostgreSQL (server) |
| PowerSync | Sync engine | Mobile and web apps needing SQL locally | TypeScript, Dart | SQLite (local), PostgreSQL (server) |
| RxDB | Reactive database | Apps needing real-time queries and sync | TypeScript | IndexedDB, SQLite, etc. |

### When to Use a CRDT Library

Choose Yjs or Automerge when you need fine-grained collaboration (like Google Docs-style editing), when your data model is document-shaped, or when you want full control over your sync layer. These libraries give you the building blocks and let you assemble them however you like.

### When to Use a Sync Engine

Choose ElectricSQL or PowerSync when you have an existing PostgreSQL database and want to sync subsets of that data to client devices. Sync engines handle the bidirectional replication, conflict resolution, and permission model so you can focus on your application logic. This approach works particularly well when your team already understands relational data modelling, which is something we covered in [how to choose the right database](/backend/how-to-choose-the-right-database-for-your-project).

## Building Your First Local-First Feature

You do not need to rebuild your entire application. A pragmatic starting point is to add local-first behaviour to a single feature. Here is a pattern that works well.

### Step 1: Identify a Feature That Benefits From Offline Support

Look for features where users create or edit data and would benefit from instant feedback. Note-taking, form entry, task management, and drawing tools are all excellent candidates.

### Step 2: Add a Local Database Layer

Use IndexedDB (directly or via a wrapper like <a href="https://rxdb.info/" target="_blank" rel="noopener noreferrer">RxDB ↗</a>) to store data locally. Your application reads from and writes to this local store, not directly to your API. The <a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API" target="_blank" rel="noopener noreferrer">MDN IndexedDB documentation ↗</a> covers the API in detail.

```typescript
// Simplified example: writing to a local store first
async function saveNote(note: Note) {
  // Write to local database immediately
  await localDB.put('notes', note);

  // Queue a sync operation for when connectivity is available
  syncQueue.push({ type: 'upsert', collection: 'notes', data: note });

  // Attempt to sync immediately if online
  if (navigator.onLine) {
    await syncToServer();
  }
}
```

### Step 3: Implement a Sync Queue

Build a background sync process that pushes local changes to your server when connectivity is available. Use the `online` and `offline` events, combined with the Background Sync API where supported, to trigger sync attempts.

```typescript
// Listen for connectivity changes
window.addEventListener('online', async () => {
  await syncToServer();
});

// Process queued operations
async function syncToServer() {
  const pending = await syncQueue.getAll();

  for (const operation of pending) {
    try {
      await api.sync(operation);
      await syncQueue.remove(operation.id);
    } catch (error) {
      // Retry on next connectivity event
      console.warn('Sync failed, will retry:', error);
      break;
    }
  }
}
```

### Step 4: Handle Conflicts

For simple cases, a last-write-wins strategy with timestamps may be sufficient. For more complex scenarios, integrate a CRDT library. The key is to decide on your conflict resolution strategy early, because it affects your data model.

This incremental approach lets you adopt local-first principles without a full rewrite. It pairs naturally with the resilience patterns described in [building resilient APIs](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns), since your sync layer needs the same retry and backoff logic.

## Architecture Patterns for Local-First Web Apps

There are three common architectural patterns, each suited to different levels of complexity.

### Pattern 1: Local Cache with Server Sync

The simplest approach. Your server remains the source of truth, but you cache data locally and write to the cache first. This gives you instant UI updates and basic offline support. Conflicts are resolved server-side, typically with last-write-wins.

This is not truly local-first by the strict definition, but it captures most of the UX benefits and is the easiest to adopt incrementally.

### Pattern 2: CRDT-Backed Documents

Each document (or entity) is backed by a CRDT. Edits are applied to the local CRDT instance and synced to other devices via a relay server. The server does not need to understand the data structure; it simply forwards CRDT operations between clients.

This pattern works brilliantly for collaborative editing and is what powers tools like Figma's multiplayer features. It requires more upfront investment but delivers true conflict-free collaboration.

### Pattern 3: Local SQLite with Server Replication

Your application runs a full SQLite database on the client (via WebAssembly) and syncs it with a server-side PostgreSQL database. ElectricSQL and PowerSync both implement this pattern. It gives you the full power of SQL locally, which is a compelling advantage if your team already thinks in relational terms.

Understanding the trade-offs between these patterns connects directly to broader architectural thinking. For more on evaluating architectural decisions, see [the case for boring technology](/architecture/the-case-for-boring-technology) and [the pragmatic approach to microservices](/architecture/the-pragmatic-approach-to-microservices).

## Common Pitfalls to Avoid

Local-first development introduces challenges that server-centric developers may not have encountered before.

### Storage Quotas

Browsers impose storage limits, and they vary significantly. Safari is historically the most restrictive. Always implement a storage management strategy that monitors usage, cleans up stale data, and degrades gracefully when limits are reached.

### Large Data Sets

Not all data belongs on the client. If your application manages millions of records, you will need a selective sync strategy that only replicates relevant subsets to each device. Sync engines like ElectricSQL handle this with shape-based subscriptions.

### Authentication and Permissions

When data lives on the client, you cannot rely on server-side authorisation to control access. You need a permission model that works at the sync layer, ensuring that clients only receive data they are authorised to see. This is a fundamentally different approach from traditional [authentication patterns](/backend/authentication-patterns-every-developer-should-know), and it deserves careful design.

### Testing

Testing local-first applications is more complex than testing server-rendered apps. You need to simulate offline scenarios, concurrent edits, sync failures, and storage quota exhaustion. Invest in your testing infrastructure early.

## Performance Benefits Are Substantial

The performance argument for local-first is compelling. When your application reads from a local database instead of making network requests, the difference is not incremental; it is transformational.

<svg viewBox="0 0 600 220" xmlns="http://www.w3.org/2000/svg" aria-label="Bar chart comparing response times for server-first versus local-first data reads across different network conditions">
  <style>
    .perf-label { font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; fill: #334155; }
    .perf-value { font-family: 'Inter', sans-serif; font-size: 10px; fill: #64748b; }
    .perf-axis { font-family: 'Inter', sans-serif; font-size: 10px; fill: #94a3b8; }
  </style>
  <!-- Title -->
  <text x="300" y="20" text-anchor="middle" class="perf-label">Data Read Latency: Server-First vs Local-First</text>
  <!-- Y axis labels -->
  <text x="110" y="58" text-anchor="end" class="perf-axis">Fast 4G</text>
  <text x="110" y="98" text-anchor="end" class="perf-axis">Slow 3G</text>
  <text x="110" y="138" text-anchor="end" class="perf-axis">Offline</text>
  <text x="110" y="178" text-anchor="end" class="perf-axis">High latency</text>
  <!-- Server-first bars -->
  <rect x="120" y="42" width="200" height="14" rx="3" fill="#f87171" opacity="0.8"/>
  <text x="325" y="54" class="perf-value">200ms (server-first)</text>
  <rect x="120" y="82" width="360" height="14" rx="3" fill="#f87171" opacity="0.8"/>
  <text x="485" y="94" class="perf-value">1800ms</text>
  <rect x="120" y="122" width="20" height="14" rx="3" fill="#f87171" opacity="0.8"/>
  <text x="148" y="134" class="perf-value" fill="#dc2626">Error</text>
  <rect x="120" y="162" width="300" height="14" rx="3" fill="#f87171" opacity="0.8"/>
  <text x="425" y="174" class="perf-value">1500ms</text>
  <!-- Local-first bars -->
  <rect x="120" y="56" width="10" height="14" rx="3" fill="#34d399" opacity="0.8"/>
  <text x="136" y="68" class="perf-value" fill="#059669">5ms (local-first)</text>
  <rect x="120" y="96" width="10" height="14" rx="3" fill="#34d399" opacity="0.8"/>
  <text x="136" y="108" class="perf-value" fill="#059669">5ms</text>
  <rect x="120" y="136" width="10" height="14" rx="3" fill="#34d399" opacity="0.8"/>
  <text x="136" y="148" class="perf-value" fill="#059669">5ms</text>
  <rect x="120" y="176" width="10" height="14" rx="3" fill="#34d399" opacity="0.8"/>
  <text x="136" y="188" class="perf-value" fill="#059669">5ms</text>
  <!-- Legend -->
  <rect x="180" y="200" width="12" height="12" rx="2" fill="#f87171" opacity="0.8"/>
  <text x="196" y="211" class="perf-value">Server-first</text>
  <rect x="290" y="200" width="12" height="12" rx="2" fill="#34d399" opacity="0.8"/>
  <text x="306" y="211" class="perf-value">Local-first</text>
</svg>

Local reads consistently complete in under 10 milliseconds regardless of network conditions. For users on slow connections, in rural areas, or simply on a train going through a tunnel, this is the difference between a usable application and a broken one. These gains complement [web performance optimisations](/frontend/web-performance-quick-wins-for-frontend-developers) at the network and rendering layer.

## Getting Started Today

You do not need to adopt every local-first principle at once. Here is a practical roadmap.

1. **Start with read caching.** Cache API responses in IndexedDB and serve them instantly on subsequent visits. This alone eliminates loading spinners for returning users.

2. **Add optimistic writes.** Write to the local store first and sync to the server in the background. This makes your UI feel instant, even on slow connections.

3. **Implement a sync queue.** Build a reliable queue that retries failed sync operations with exponential backoff. This handles intermittent connectivity gracefully.

4. **Evaluate CRDTs for collaborative features.** If your application involves multiple users editing the same data, explore Yjs or Automerge. The learning curve is manageable, and the libraries handle the complex merge logic for you.

5. **Consider a sync engine for data-heavy apps.** If you need SQL queries on the client or bidirectional sync with PostgreSQL, evaluate ElectricSQL or PowerSync.

The local-first approach represents a meaningful shift in how we think about web architecture. It is not about abandoning servers; it is about building software that treats the network as an enhancement rather than a requirement. As the tooling continues to mature, the cost of adopting these patterns will only decrease, while the user experience benefits remain compelling. For teams already thinking about [event-driven architecture](/architecture/understanding-event-driven-architecture), local-first adds a natural extension: events that originate on the device and propagate outward, rather than flowing exclusively from server to client.
