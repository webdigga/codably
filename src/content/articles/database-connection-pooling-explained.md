---
title: "Database Connection Pooling Explained"
description: "A practical guide to database connection pooling for Postgres and Node.js. Pool sizing, timeouts, PgBouncer, serverless pitfalls, and real numbers."
publishDate: "2026-04-27"
author: "david-white"
category: "backend"
tags: ["databases", "postgres", "connection pooling", "node.js", "performance"]
featured: false
draft: false
faqs:
  - question: "What is the right pool size for a Node.js app talking to Postgres?"
    answer: "Start small. For a single Node process, a pool of 10 to 20 is plenty for most CRUD workloads. The HikariCP guidance of (cores * 2) + spindle_count refers to the database server, not the client; pick a per-process pool size that, multiplied by the number of running processes, stays well under your Postgres max_connections."
  - question: "Why does a bigger pool sometimes make the app slower?"
    answer: "More connections mean more context switches, more lock contention, and more memory pressure on Postgres. Past the point where active queries equal CPU cores, extra connections just queue inside the database instead of inside your app. Throughput plateaus and tail latency gets worse."
  - question: "Do I need PgBouncer if I am already using a client-side pool?"
    answer: "If you have one or two app instances, no. If you have dozens of instances or a serverless platform that spawns short-lived workers, yes. PgBouncer multiplexes thousands of client connections onto a small number of real Postgres connections, which is the only way to keep max_connections sane at scale."
  - question: "What is the difference between transaction and session pooling?"
    answer: "Session pooling assigns a backend connection to a client for the entire session. Transaction pooling reassigns the backend after every transaction, which is far more efficient but disallows session-scoped features like prepared statements, LISTEN/NOTIFY, and SET LOCAL outside a transaction."
  - question: "How do I know my pool is too small?"
    answer: "Watch acquire wait times. If clients regularly wait more than a handful of milliseconds for a connection, the pool is the bottleneck. If acquire is fast but query latency is high, the bottleneck is the database itself and adding more pool slots will make things worse, not better."
primaryKeyword: "database connection pooling"
---

A 20-pod Kubernetes deployment, each pod with a pool size of 20, is asking for 400 Postgres connections before a single user shows up. The default `max_connections` on Postgres is 100. The maths does not work, and the pager goes off at 09:00 on Monday when traffic returns. Connection pooling is one of those topics that looks like a tuning detail until it takes a service down.

This is a practical walk through what pools do, how to size them for Postgres and Node.js, and the failure modes that catch teams out: serverless cold starts, leaked connections, and the moment you realise you actually need PgBouncer.

## Why connection pools exist

Opening a TCP connection to Postgres, performing the SSL handshake, and authenticating takes around 25 to 75 milliseconds on a healthy network. For an API that handles a 10 ms query, paying the connection cost on every request is absurd. Pools amortise that cost by keeping a small set of live connections ready to reuse.

There is a second, more important reason: Postgres pays a real price for each connection. Every backend is a separate OS process with its own memory footprint, typically 5 to 10 MB plus whatever work_mem and temp buffers it accumulates. A typical Postgres server can comfortably handle 100 to 300 active connections; past that, throughput drops sharply because the kernel and the database scheduler spend more time context switching than executing queries.

Brandur Leach's well-known experiment on this is worth knowing: with a fixed CPU and a fixed working set, throughput peaks at a number of connections close to the core count, then degrades. More connections is not more parallelism. It is more queue.

## How a pool actually works

Every pool has the same handful of moving parts:

- **min** or **idle**: connections kept open even when nothing is happening
- **max**: the hard ceiling on concurrent connections
- **acquire timeout**: how long a caller will wait for a free connection before erroring
- **idle timeout**: how long an idle connection sits before being closed
- **connection timeout**: how long the pool waits for the database to accept a new connection

A request asks the pool for a client. If a free connection exists, it is handed back immediately. If not, and the pool is below max, a new connection is opened. If the pool is at max, the request waits in a FIFO queue until a connection is released or the acquire timeout fires.

<svg viewBox="0 0 640 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing a connection pool with idle, active, and waiting states between an application and Postgres" style="width:100%;height:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
  <rect x="20" y="40" width="120" height="140" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
  <text x="80" y="30" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#111">App</text>
  <text x="80" y="80" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#374151">request 1</text>
  <text x="80" y="110" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#374151">request 2</text>
  <text x="80" y="140" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">request 3 (queued)</text>
  <rect x="220" y="20" width="200" height="180" rx="8" fill="#f9fafb" stroke="#6b7280" stroke-width="1.5"/>
  <text x="320" y="14" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#111">Pool (max 4)</text>
  <circle cx="260" cy="60" r="14" fill="#ec4899"/>
  <text x="290" y="64" font-family="Inter, sans-serif" font-size="11" fill="#374151">active</text>
  <circle cx="260" cy="100" r="14" fill="#ec4899"/>
  <text x="290" y="104" font-family="Inter, sans-serif" font-size="11" fill="#374151">active</text>
  <circle cx="260" cy="140" r="14" fill="#9ca3af"/>
  <text x="290" y="144" font-family="Inter, sans-serif" font-size="11" fill="#374151">idle</text>
  <circle cx="260" cy="180" r="14" fill="#9ca3af"/>
  <text x="290" y="184" font-family="Inter, sans-serif" font-size="11" fill="#374151">idle</text>
  <rect x="500" y="40" width="120" height="140" rx="8" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="560" y="30" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#111">Postgres</text>
  <text x="560" y="115" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#374151">max_connections</text>
  <line x1="140" y1="80" x2="220" y2="60" stroke="#ec4899" stroke-width="1.5"/>
  <line x1="140" y1="110" x2="220" y2="100" stroke="#ec4899" stroke-width="1.5"/>
  <line x1="420" y1="60" x2="500" y2="80" stroke="#6366f1" stroke-width="1.5"/>
  <line x1="420" y1="100" x2="500" y2="110" stroke="#6366f1" stroke-width="1.5"/>
</svg>

The crucial point: max is a property of the pool, but the database has its own ceiling. If every app instance has its own pool, you have to count totals.

## The pool-sizing formula, and what it actually means

The most cited rule of thumb comes from the <a href="https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing" target="_blank" rel="noopener noreferrer">HikariCP pool sizing wiki ↗</a>:

```
connections = ((core_count * 2) + effective_spindle_count)
```

For a database server with 8 cores and SSD storage (effective spindle count ~1), the sweet spot is around 17 connections. That number is the total active connections the database can usefully handle, not the size of any individual client pool.

So if you have 4 application instances all pointing at the same Postgres, each pool should be roughly 17 / 4 = 4. Not 20. Not 50. Four.

Real-world starting points that work for most CRUD apps:

| Setup | Per-process pool | Notes |
|-------|------------------|-------|
| Single Node app, small Postgres | 10 | Plenty for typical traffic |
| 2 to 4 Node instances, mid-size Postgres | 5 to 10 | Total stays under 50 |
| 10+ instances or autoscaling | use a connection proxy | Client-side pool of 5; PgBouncer in front |
| Serverless (Lambda, Workers) | 1 per instance | Always front with PgBouncer or RDS Proxy |

Always cross-check against the database's `max_connections`. The <a href="https://www.postgresql.org/docs/current/runtime-config-connection.html" target="_blank" rel="noopener noreferrer">Postgres connection settings docs ↗</a> describe the parameter; the default is 100, and most managed services let you raise it but charge in memory for doing so.

## A concrete Node.js example

Using <a href="https://node-postgres.com/apis/pool" target="_blank" rel="noopener noreferrer">node-postgres ↗</a>:

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  // sizing
  max: 10,
  min: 2,
  // timeouts (all in ms)
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  // catch leaks
  allowExitOnIdle: true,
});

pool.on('error', (err) => {
  // background connections that error must not crash the app
  console.error('idle client error', err);
});

export async function getUser(id) {
  const client = await pool.connect();
  try {
    const { rows } = await client.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0];
  } finally {
    client.release();
  }
}
```

The `try / finally` is non-negotiable. Forget the `release()` once and that connection is leaked for the life of the process. Wrap the pattern in a helper if your team keeps tripping over it.

## Common pitfalls

**Too big a pool.** The most expensive misconfiguration. A pool of 100 against a Postgres with `max_connections = 100` means one app instance can monopolise the whole database, locking everyone else out. Throughput also drops because Postgres is now juggling 100 backends across 8 cores.

**Unreleased connections.** A handler that throws before `release()` runs leaks the connection forever. Symptoms: a slow climb in active connections, then sudden timeouts when the pool saturates. Fix with `try / finally`, an automatic-release helper, or your ORM's transaction wrapper.

**Long-running transactions.** A transaction holding a row-level lock for 30 seconds is also holding a pool slot for 30 seconds. Long transactions effectively shrink your pool. Move heavy work outside transactions, and watch `pg_stat_activity` for long-lived `idle in transaction` rows.

**Serverless cold-start storms.** A traffic spike spawns 200 Lambda containers, each opening its own pool, each at min connections. Postgres sees 200 to 1000 simultaneous handshakes and refuses connections. The fix is always the same: put a connection proxy between serverless and the database. Never let serverless functions speak directly to Postgres at scale.

**Mismatched timeouts.** If your acquire timeout is 30 seconds but your HTTP server's request timeout is 10 seconds, the request errors before the pool even gives up trying. Make timeouts step down through the stack: external < HTTP < acquire < query.

## When to add PgBouncer or a proxy

Once the total of (instances * pool_max) approaches a third of `max_connections`, it is time for an external pooler. <a href="https://www.pgbouncer.org/features.html" target="_blank" rel="noopener noreferrer">PgBouncer ↗</a> is the standard choice; on AWS the equivalent is <a href="https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-proxy.html" target="_blank" rel="noopener noreferrer">RDS Proxy ↗</a>.

PgBouncer offers three pooling modes; transaction pooling is the one that matters in practice:

| Mode | Backend reused after | Use when |
|------|----------------------|----------|
| Session | Client disconnect | You need session features and clients are few |
| Transaction | Each transaction completes | Default for web apps; gives 100x+ multiplexing |
| Statement | Each statement | Rarely used; breaks multi-statement transactions |

Transaction pooling has real constraints. Prepared statements, `SET` outside a transaction, advisory locks held across queries, and `LISTEN/NOTIFY` all break because the next query may run on a different backend. Most ORMs need a flag to disable prepared statements when running through PgBouncer in transaction mode. Check your driver's documentation for that.

A typical layout: 30 application pods, each with a pg pool of `max: 5`, all pointing at PgBouncer with `default_pool_size = 25`. The application sees up to 150 connection slots; Postgres only ever sees 25 backends. The numbers are made up but the ratio is the point.

## A sizing checklist before you ship

1. Find your Postgres `max_connections`. Most managed services default to 100 to 200.
2. Subtract 10 percent as headroom for admin tools and superuser slots.
3. Divide by the maximum number of app instances you expect at peak (autoscaling included).
4. Round down. That is your per-instance pool max.
5. Set min to roughly 20 to 30 percent of max so you have warm connections.
6. Set acquire timeout shorter than your HTTP request timeout.
7. Add a metric for pool wait time and alarm on the p95.
8. If you cannot make the maths work, add PgBouncer.

If you are starting from scratch with a database choice, the trade-offs around concurrency, connection cost, and pooling vary a lot by engine. The companion piece [how to choose the right database for your project](/backend/how-to-choose-the-right-database-for-your-project) walks through that decision. Once you are running on Postgres, the next two performance levers worth pulling are usually indexing and schema shape; the [developer's guide to database indexing](/backend/the-developers-guide-to-database-indexing) and [how to design a database schema that scales](/backend/how-to-design-a-database-schema-that-scales) cover the practical side.

## The short version

Pools are not a tuning knob you twist until the dashboard goes green. They are a contract between your app and the database about how many parallel clients each side can tolerate. Get that contract right and Postgres will run boringly. Get it wrong and the failure mode is a slow climb in connection counts, then a sudden cliff. Pick a small pool, keep an eye on acquire latency, and add a proxy before you actually need one.
