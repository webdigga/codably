---
title: "The Developer's Guide to Database Indexing"
description: "Learn how database indexes work, when to add them and how to avoid the most common indexing mistakes that slow your queries down."
publishDate: "2026-03-23"
author: "jonny-rowse"
category: "backend"
tags: ["database", "sql", "performance", "indexing", "optimisation"]
featured: false
draft: false
faqs:
  - question: "How many indexes should a table have?"
    answer: "There is no fixed number. Index the columns you query against most frequently, but keep in mind that each index adds overhead to writes. A table with heavy read traffic and light writes can support more indexes than one with constant inserts and updates."
  - question: "Do indexes slow down writes?"
    answer: "Yes. Every INSERT, UPDATE or DELETE must also update each relevant index. For read-heavy workloads this trade-off is almost always worth it. For write-heavy tables, be selective about which columns you index."
  - question: "Should I index foreign key columns?"
    answer: "Almost always. Foreign keys are frequently used in JOIN conditions and WHERE clauses. Without an index, the database has to scan the entire table to find matching rows, which gets expensive fast."
  - question: "What is a covering index?"
    answer: "A covering index includes all the columns a query needs, so the database can return results directly from the index without touching the table at all. This can dramatically speed up queries that only need a few columns."
  - question: "How do I know if my indexes are actually being used?"
    answer: "Use your database's query analysis tools. In PostgreSQL, prefix your query with EXPLAIN ANALYSE. In MySQL, use EXPLAIN. Both will show you whether the query is using an index or falling back to a full table scan."
  - question: "Can I have too many indexes?"
    answer: "Yes. Unused indexes waste storage, slow down writes and add maintenance overhead. Review your index usage periodically and drop any that your queries no longer need."
primaryKeyword: "database indexing"
---

Every developer has had the moment. A query that ran in 20 milliseconds during development suddenly takes 12 seconds in production. The dataset grew, and what worked fine with a thousand rows falls apart at a million.

The fix, more often than not, is an index. But indexing is one of those topics that sits in an awkward middle ground: too practical for a computer science course, too theoretical for a tutorial. Most developers learn it reactively, adding indexes when something breaks rather than understanding why they work.

This guide covers what indexes actually do under the hood, when to use them, when to avoid them and how to diagnose the most common mistakes.

## What an index actually is

An index is a separate data structure that the database maintains alongside your table. It stores a sorted copy of one or more columns, along with pointers back to the full rows. When you run a query with a WHERE clause, the database checks whether an index exists that matches your filter. If it does, it can jump straight to the relevant rows instead of scanning every row in the table.

The analogy everyone uses is a book index, and it holds up well. If you want to find every mention of "normalisation" in a 500-page textbook, you have two options: read every page, or check the index at the back. The index gives you page numbers. A database index gives you row pointers.

Without an index, the database performs a sequential scan: it reads every row in the table and checks whether each one matches your query. This is fine for small tables. It is catastrophic for large ones.

## How B-tree indexes work

The most common index type in relational databases is the B-tree (balanced tree). PostgreSQL, MySQL and SQL Server all use B-trees as their default index structure.

A B-tree organises data into a sorted, hierarchical structure. At the top is a root node. Below that are branch nodes. At the bottom are leaf nodes, which contain the actual indexed values and pointers to the table rows.

<svg role="img" aria-label="Diagram showing the structure of a B-tree index with root, branch and leaf nodes" viewBox="0 0 520 300" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:520px;margin:1.5rem auto;display:block;">
  <style>
    .node { fill: #f1f5f9; stroke: #6366f1; stroke-width: 1.5; rx: 6; }
    .leaf { fill: #f0fdf4; stroke: #22c55e; stroke-width: 1.5; rx: 6; }
    .node-text { font-family: Inter, system-ui, sans-serif; font-size: 12px; fill: #333; text-anchor: middle; }
    .label-text { font-family: Inter, system-ui, sans-serif; font-size: 11px; fill: #888; text-anchor: middle; }
    .edge { stroke: #94a3b8; stroke-width: 1.2; }
    @media (prefers-color-scheme: dark) {
      .node { fill: #1e293b; stroke: #818cf8; }
      .leaf { fill: #14532d; stroke: #4ade80; }
      .node-text { fill: #e2e8f0; }
      .label-text { fill: #94a3b8; }
      .edge { stroke: #64748b; }
    }
  </style>
  <!-- Root -->
  <rect x="200" y="20" width="120" height="36" class="node"/>
  <text x="260" y="43" class="node-text">50</text>
  <text x="260" y="12" class="label-text">Root</text>
  <!-- Branch nodes -->
  <rect x="80" y="110" width="120" height="36" class="node"/>
  <text x="140" y="133" class="node-text">20 | 35</text>
  <rect x="320" y="110" width="120" height="36" class="node"/>
  <text x="380" y="133" class="node-text">65 | 80</text>
  <text x="30" y="133" class="label-text">Branch</text>
  <!-- Leaf nodes -->
  <rect x="10" y="210" width="80" height="36" class="leaf"/>
  <text x="50" y="233" class="node-text">5, 12, 18</text>
  <rect x="110" y="210" width="80" height="36" class="leaf"/>
  <text x="150" y="233" class="node-text">22, 28, 33</text>
  <rect x="220" y="210" width="80" height="36" class="leaf"/>
  <text x="260" y="233" class="node-text">37, 42, 48</text>
  <rect x="330" y="210" width="80" height="36" class="leaf"/>
  <text x="370" y="233" class="node-text">52, 58, 63</text>
  <rect x="430" y="210" width="80" height="36" class="leaf"/>
  <text x="470" y="233" class="node-text">70, 75, 85</text>
  <text x="510" y="270" class="label-text">Leaf</text>
  <!-- Edges -->
  <line x1="230" y1="56" x2="170" y2="110" class="edge"/>
  <line x1="290" y1="56" x2="350" y2="110" class="edge"/>
  <line x1="110" y1="146" x2="50" y2="210" class="edge"/>
  <line x1="140" y1="146" x2="150" y2="210" class="edge"/>
  <line x1="170" y1="146" x2="260" y2="210" class="edge"/>
  <line x1="350" y1="146" x2="370" y2="210" class="edge"/>
  <line x1="410" y1="146" x2="470" y2="210" class="edge"/>
  <!-- Row pointers label -->
  <text x="260" y="290" class="label-text">Leaf nodes point to actual table rows</text>
</svg>

When the database looks up a value, it starts at the root and follows the tree downward. At each level, it compares the search value against the node's keys to decide which branch to follow. The number of comparisons is logarithmic: in a table with a million rows, a B-tree index typically finds the right row in about 20 comparisons rather than a million.

This is why indexes make such a dramatic difference. The performance improvement is not linear; it is logarithmic. Going from 1,000 rows to 1,000,000 rows without an index means 1,000 times more work. With an index, it means roughly twice as many comparisons.

## Types of index

B-trees are the default, but they are not the only option. Different index types suit different query patterns.

| Index type | Best for | Available in | Limitations |
|---|---|---|---|
| B-tree | Equality and range queries (`=`, `<`, `>`, `BETWEEN`) | All major databases | General-purpose; not optimal for specialised patterns |
| Hash | Exact equality lookups only | PostgreSQL, MySQL (Memory engine) | Cannot handle range queries or sorting |
| GIN (Generalised Inverted) | Full-text search, JSONB, arrays | PostgreSQL | Slower to update than B-tree |
| GiST (Generalised Search Tree) | Geospatial, range types, nearest-neighbour | PostgreSQL | More complex to configure |
| BRIN (Block Range) | Very large tables with naturally ordered data | PostgreSQL | Only useful if data is physically sorted |

For most application development work, B-tree indexes cover 90% of use cases. The others are worth knowing about for specific scenarios, but you do not need them every day.

## When to add an index

Not every column needs an index. Here are the situations where adding one makes the biggest difference.

### Columns in WHERE clauses

If you frequently filter on a column, index it. This is the most common and most impactful use case.

```sql
-- This query benefits from an index on the email column
SELECT * FROM users WHERE email = 'jane@example.com';
```

Without an index on `email`, the database scans every row. With one, it jumps straight to the matching row.

### Columns used in JOIN conditions

JOINs match rows between tables. If the join column is not indexed, the database has to compare every row in one table against every row in the other. This gets expensive quickly.

```sql
-- An index on orders.customer_id makes this join fast
SELECT u.name, o.total
FROM users u
JOIN orders o ON u.id = o.customer_id
WHERE o.created_at > '2026-01-01';
```

Foreign key columns should almost always be indexed. Some databases create this index automatically; others, like PostgreSQL, do not. Check yours.

### Columns used in ORDER BY

If you regularly sort results by a column, an index on that column lets the database return rows in the right order without a separate sorting step.

### Columns with high cardinality

Cardinality refers to how many distinct values a column contains. A column like `email` has high cardinality (every value is unique). A column like `status` with three possible values has low cardinality.

Indexes work best on high-cardinality columns. An index on a boolean column that is `true` for 99% of rows will rarely help, because the database still has to read most of the table.

## Composite indexes and column order

A composite index covers multiple columns. The order of those columns matters significantly.

```sql
CREATE INDEX idx_orders_customer_date ON orders (customer_id, created_at);
```

This index is useful for queries that filter on `customer_id` alone, or on `customer_id` and `created_at` together. It is not useful for queries that filter only on `created_at`.

The reason is that a B-tree sorts data by the first column, then by the second column within each group of the first. Think of it like a phone book sorted by surname then first name. You can look up everyone named "Smith", or "Smith, Jane" specifically. But you cannot efficiently look up everyone named "Jane" across all surnames.

This is known as the leftmost prefix rule. A composite index can be used for any query that includes a contiguous prefix of its columns, starting from the left.

| Query filters on | Uses the index? |
|---|---|
| `customer_id` | Yes |
| `customer_id` AND `created_at` | Yes |
| `created_at` only | No |
| `created_at` AND `customer_id` | Yes (optimiser reorders) |

Most modern query optimisers will reorder your WHERE clause to match the index, so `WHERE created_at > X AND customer_id = Y` will still use the index. But the index itself must be defined in the right order.

## Reading query execution plans

Adding indexes blindly is almost as bad as having none. The way to make informed decisions is to read your database's execution plan.

In PostgreSQL:

```sql
EXPLAIN ANALYSE SELECT * FROM orders WHERE customer_id = 42;
```

In MySQL:

```sql
EXPLAIN SELECT * FROM orders WHERE customer_id = 42;
```

The key things to look for:

**Seq Scan (sequential scan).** The database is reading every row. If the table is large and this query runs frequently, you probably need an index.

**Index Scan.** The database is using an index to find matching rows, then fetching the full rows from the table. This is good.

**Index Only Scan.** The database is answering the query entirely from the index without touching the table. This is the best case scenario and happens when you have a [covering index](/backend/caching-strategies-every-developer-should-know).

**Bitmap Index Scan.** The database is using the index to build a bitmap of matching rows, then fetching them in bulk. This is common when multiple indexes are combined or when a significant portion of the table matches.

The execution plan also shows estimated and actual row counts, which helps you understand whether the query optimiser's assumptions match reality. If they diverge significantly, your table statistics may be out of date. Running `ANALYSE` (PostgreSQL) or `ANALYZE TABLE` (MySQL) refreshes them.

## Common indexing mistakes

### Indexing everything

More indexes means more work on every write. Each INSERT must update every index. Each UPDATE to an indexed column must update the relevant indexes. Each DELETE must remove entries from every index.

For read-heavy applications this trade-off is usually fine. For write-heavy tables, like logging tables, event streams or high-volume transaction records, unnecessary indexes can seriously degrade performance.

### Ignoring index usage statistics

Databases track how often each index is used. In PostgreSQL, you can check this with:

```sql
SELECT indexrelname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan ASC;
```

Indexes with zero or very few scans are candidates for removal. They are consuming storage and slowing down writes without providing any query benefit.

### Forgetting about partial indexes

A partial index only covers rows that match a condition. This is useful when you frequently query a subset of a table.

```sql
-- Only index active orders, not the millions of completed ones
CREATE INDEX idx_active_orders ON orders (customer_id)
WHERE status = 'active';
```

This index is smaller, faster to update and faster to scan than a full index. If 95% of your orders are completed and you almost never query them by customer, a partial index makes much more sense.

### Not indexing foreign keys in PostgreSQL

PostgreSQL does not automatically create indexes on foreign key columns. This is a common source of slow queries, especially on DELETE operations. When you delete a parent row, PostgreSQL checks all child tables for references. Without an index on the foreign key column, this check requires a sequential scan of the child table.

If your deletes are unexpectedly slow, check whether your foreign key columns are indexed.

### Using functions on indexed columns

An index on `created_at` will not help if your query wraps the column in a function:

```sql
-- This cannot use a standard index on created_at
SELECT * FROM orders WHERE DATE(created_at) = '2026-03-23';

-- This can
SELECT * FROM orders
WHERE created_at >= '2026-03-23'
  AND created_at < '2026-03-24';
```

If you must use a function, create an expression index:

```sql
CREATE INDEX idx_orders_date ON orders (DATE(created_at));
```

But rewriting the query to avoid the function is usually the better option.

## Index maintenance

Indexes are not "set and forget". Over time, they can become bloated or fragmented, especially in tables with heavy update activity.

In PostgreSQL, the `REINDEX` command rebuilds an index from scratch. In MySQL, `OPTIMIZE TABLE` achieves a similar result. Both operations take a lock on the table, so plan them during maintenance windows.

PostgreSQL also offers `REINDEX CONCURRENTLY`, which rebuilds the index without blocking reads or writes. This is the preferred approach for production systems.

Regularly review your indexes against your actual query patterns. As your application evolves, the queries you run change, and indexes that were once essential may become dead weight. Build a habit of checking [your logs](/backend/the-developers-guide-to-logging) and query plans periodically to keep your indexing strategy aligned with how your application actually uses the database.

## Getting started

1. **Pick your slowest query.** Check your application's slow query log or [monitoring dashboard](/devops/observability-vs-monitoring-what-developers-need-to-know). Find the query that runs most frequently and takes the longest.

2. **Run EXPLAIN ANALYSE on it.** Look for sequential scans on large tables. Identify which columns are being filtered, joined or sorted.

3. **Add the most impactful index.** Start with the column in your WHERE clause that filters the most rows. If you are joining tables, make sure the join column is indexed.

4. **Measure the difference.** Run EXPLAIN ANALYSE again after adding the index. Compare the execution time and the plan. You should see an index scan replacing the sequential scan.

5. **Review existing indexes.** Check your index usage statistics. Drop any indexes that are not being used. They are costing you write performance for no benefit.

Indexing is one of the highest-leverage skills a developer can build. A single well-placed index can turn a query from unusable to instant. But like most performance work, it is most effective when driven by measurement rather than intuition. Read the execution plan, understand what the database is doing and let the data guide your decisions.
