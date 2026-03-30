---
title: "How to Choose the Right Database for Your Project"
description: "A practical guide to choosing the right database for your project, comparing relational, document, key-value and graph options with clear criteria."
publishDate: "2026-03-30"
author: "david-white"
category: "backend"
tags: ["database", "sql", "nosql", "postgresql", "mongodb", "architecture", "backend"]
featured: false
draft: false
faqs:
  - question: "Should I always use PostgreSQL?"
    answer: "PostgreSQL is an excellent default for most web applications because it handles relational data well, supports JSON columns for semi-structured data, and scales vertically to impressive levels. However, it is not the best fit for every workload. If your data is primarily key-value pairs with extreme throughput requirements, a dedicated key-value store like Redis or DynamoDB may serve you better. If your data is deeply nested and document-oriented with no relational needs, MongoDB can simplify your data layer. Choose based on your actual access patterns, not habit."
  - question: "When should I use a NoSQL database instead of SQL?"
    answer: "Consider NoSQL when your data has no fixed schema and changes frequently, when you need horizontal scaling across multiple nodes, when your access patterns are simple key-value or document lookups, or when you are dealing with time-series or event data at very high write volumes. If you need complex joins, transactions across multiple tables, or strict data integrity, a relational database is almost always the better choice."
  - question: "Can I use multiple databases in one project?"
    answer: "Yes, and many production systems do exactly this. A common pattern is to use PostgreSQL as the primary data store for transactional data, Redis for caching and session storage, and Elasticsearch for full-text search. This is sometimes called polyglot persistence. The trade-off is increased operational complexity, so only add a second database when a single one genuinely cannot meet your requirements."
  - question: "Is SQLite suitable for production use?"
    answer: "Yes, in the right context. SQLite works well for embedded applications, edge computing, mobile apps, and read-heavy web applications with modest write concurrency. Projects like Litestream and LiteFS have made SQLite viable for server-side use by adding replication. It is not suitable for applications with high concurrent write loads or distributed deployments that need a shared data layer."
  - question: "How important is database choice for a new project?"
    answer: "More important than many developers think, but less important than getting started. For most web applications, PostgreSQL or MySQL will serve you well for years. The bigger risk is over-engineering your database layer early on rather than picking the wrong engine. Start with a proven relational database, design a clean schema, and introduce specialised databases only when you hit a concrete limitation."
primaryKeyword: "choose the right database"
---

## The Database Decision Matters More Than You Think

Choosing a database is one of those decisions that feels straightforward until you are two years into a project and realise your data layer is fighting against you. The wrong choice does not usually announce itself with a dramatic failure. It shows up as increasingly complex queries, awkward workarounds, and a growing sense that everything would be simpler if the data lived somewhere else.

Having worked on projects that got this decision right (and a few that got it spectacularly wrong), I can tell you that the key is understanding your data and access patterns before reaching for a familiar tool. This guide walks through the major database categories, when each one shines, and how to make a decision you will not regret.

## The Major Database Categories

Before comparing specific products, it helps to understand the broad categories and what each is designed to do well.

### Relational Databases (SQL)

Relational databases store data in tables with defined schemas, enforcing relationships through foreign keys and constraints. They use SQL for querying and support ACID transactions, meaning your data stays consistent even when things go wrong.

**Best for:** applications with structured data, complex relationships between entities, and a need for strong consistency. Think e-commerce platforms, CRM systems, financial applications, and most web applications.

**Examples:** <a href="https://www.postgresql.org/" target="_blank" rel="noopener noreferrer">PostgreSQL ↗</a>, <a href="https://www.mysql.com/" target="_blank" rel="noopener noreferrer">MySQL ↗</a>, <a href="https://sqlite.org/" target="_blank" rel="noopener noreferrer">SQLite ↗</a>, MariaDB

### Document Databases

Document databases store data as flexible JSON-like documents. Each document can have a different structure, making them well suited to data that does not fit neatly into rows and columns.

**Best for:** content management systems, product catalogues with varying attributes, user profiles with optional fields, and applications where the schema changes frequently.

**Examples:** <a href="https://www.mongodb.com/" target="_blank" rel="noopener noreferrer">MongoDB ↗</a>, CouchDB, Amazon DocumentDB

### Key-Value Stores

Key-value stores are the simplest database type. You store a value against a key, and you retrieve it by that key. They are extremely fast for simple lookups but offer limited querying capabilities.

**Best for:** caching, session storage, feature flags, rate limiting, and any scenario where you are reading and writing individual records by a known key.

**Examples:** <a href="https://redis.io/" target="_blank" rel="noopener noreferrer">Redis ↗</a>, Amazon DynamoDB, Cloudflare KV

### Graph Databases

Graph databases model data as nodes (entities) and edges (relationships). They excel at traversing complex relationships that would require expensive joins in a relational database.

**Best for:** social networks, recommendation engines, fraud detection, knowledge graphs, and any domain where relationships between entities are the primary concern.

**Examples:** Neo4j, Amazon Neptune, ArangoDB

### Time-Series Databases

Time-series databases are optimised for data that arrives in chronological order, like metrics, logs, and IoT sensor readings. They handle high-volume writes and time-based queries efficiently.

**Best for:** application monitoring, IoT data collection, financial market data, and analytics dashboards.

**Examples:** InfluxDB, TimescaleDB (built on PostgreSQL), QuestDB

## How to Evaluate Your Requirements

Picking the right database starts with understanding your own project. Before comparing products, answer these five questions.

### 1. What Does Your Data Look Like?

Is your data highly structured with clear relationships? A relational database is the natural fit. Is it semi-structured or schema-less? Document databases handle that well. Is it a stream of timestamped events? Time-series databases exist for exactly that reason.

If you are building an e-commerce platform with users, orders, products, and payments, you have relational data. If you are building a CMS where each content type has different fields, documents may be a better fit.

### 2. What Are Your Access Patterns?

How you read and write data matters more than how you store it. Consider:

- **Read-heavy vs write-heavy:** most web applications are read-heavy, which suits relational databases with proper indexing. Write-heavy workloads (like logging or analytics ingestion) may need a database optimised for sequential writes.
- **Simple lookups vs complex queries:** if you are mostly fetching records by ID, a key-value store is fastest. If you need joins, aggregations, and filtering across multiple fields, SQL is hard to beat.
- **Real-time vs batch:** some databases excel at real-time queries on live data. Others are better suited to batch processing and analytical workloads.

For a deeper look at optimising data retrieval, see our [guide to database indexing](/backend/the-developers-guide-to-database-indexing).

### 3. How Much Data Will You Handle?

Be realistic about scale. Many developers choose distributed databases because they "might need to scale" when a single PostgreSQL instance can comfortably handle millions of rows and thousands of concurrent connections.

| Data Volume | Suitable Options |
|---|---|
| Under 1 GB | SQLite, PostgreSQL, MySQL, MongoDB |
| 1 GB to 100 GB | PostgreSQL, MySQL, MongoDB |
| 100 GB to 1 TB | PostgreSQL, MySQL (with read replicas), MongoDB |
| Over 1 TB | Distributed options: CockroachDB, Cassandra, DynamoDB, or sharded PostgreSQL |

### 4. What Are Your Consistency Requirements?

Not all applications need the same consistency guarantees:

- **Strong consistency:** every read returns the most recent write. Essential for financial transactions, inventory management, and anything where stale data causes real problems. Relational databases provide this by default.
- **Eventual consistency:** reads may temporarily return stale data, but the system converges over time. Acceptable for social media feeds, analytics, and non-critical data. Many distributed NoSQL databases default to this model.

If you are handling payments or inventory, choose strong consistency. If you are displaying a social feed or analytics dashboard, eventual consistency is usually fine and unlocks better performance at scale.

### 5. What Is Your Team's Experience?

This factor is underrated. A team experienced with PostgreSQL will be more productive and make fewer mistakes than one learning MongoDB from scratch, even if MongoDB is theoretically a better fit. The <a href="https://db-engines.com/en/ranking" target="_blank" rel="noopener noreferrer">DB-Engines ranking ↗</a> shows that relational databases dominate for good reason: they are well understood, well documented, and have mature tooling.

As we discussed in [the case for boring technology](/architecture/the-case-for-boring-technology), there is real value in choosing tools your team already knows.

## A Practical Comparison

Here is a side-by-side comparison of the most popular options for web applications.

<div class="table-responsive">

| Feature | PostgreSQL | MySQL | MongoDB | Redis | SQLite |
|---|---|---|---|---|---|
| Data model | Relational | Relational | Document | Key-value | Relational |
| Query language | SQL | SQL | MQL | Commands | SQL |
| ACID transactions | Full | Full | Multi-document | Limited | Full |
| JSON support | Excellent (JSONB) | Good | Native | JSON module | JSON functions |
| Horizontal scaling | Via extensions | Via replication | Built-in sharding | Redis Cluster | Single node |
| Best use case | General purpose | Web applications | Flexible schemas | Caching, sessions | Embedded, edge |
| Managed options | Neon, Supabase, RDS | PlanetScale, RDS | Atlas | Upstash, ElastiCache | Turso, LiteFS |
| Learning curve | Moderate | Low | Low | Low | Very low |

</div>

## The PostgreSQL Default

If you are unsure which database to choose, PostgreSQL is the safest default for most web applications. Here is why:

- **JSON support** means you can store semi-structured data alongside relational data, reducing the need for a separate document database
- **Full-text search** covers most search requirements without needing Elasticsearch
- **Extensions** like PostGIS (geospatial), pgvector (AI embeddings), and TimescaleDB (time-series) extend its capabilities into specialist domains
- **Managed hosting** from providers like Neon and Supabase makes operations straightforward
- **Mature ecosystem** with excellent ORMs, migration tools, and monitoring in every language

PostgreSQL is not always the right answer. But it is rarely the wrong one. If you choose PostgreSQL and later discover you need a specialised database for a specific workload, you can add one alongside it.

When your schema starts growing in complexity, our guide on [designing a database schema that scales](/backend/how-to-design-a-database-schema-that-scales) covers the patterns that keep things manageable.

## When to Choose Something Other Than SQL

There are genuine scenarios where a non-relational database is the better choice:

### Choose MongoDB When

- Your data has a highly variable schema (e.g. product catalogues where each product type has different attributes)
- You are building a content platform where documents are the natural unit
- You want built-in horizontal sharding from day one
- Your team already has MongoDB expertise

### Choose Redis When

- You need sub-millisecond read latency for caching, sessions, or rate limiting
- You are implementing pub/sub messaging or real-time features
- You need a fast secondary data store alongside a primary database

For caching patterns specifically, see our [guide to caching strategies](/backend/caching-strategies-every-developer-should-know).

### Choose DynamoDB When

- You are running on AWS and want a fully managed, serverless database
- Your access patterns are simple (single-table design with known partition and sort keys)
- You need consistent performance at any scale with minimal operations overhead

### Choose a Graph Database When

- Relationships between entities are the core of your domain
- You need to traverse complex relationship paths (e.g. "friends of friends who also like X")
- Relational joins for your use case would require three or more levels of nesting

## Common Mistakes to Avoid

### Choosing Based on Hype

Every few years, a new database paradigm gains momentum and developers rush to adopt it without evaluating whether it fits their use case. MongoDB rode this wave in the early 2010s, and many teams ended up restructuring their data layer a few years later when they realised they needed relational integrity.

Evaluate databases against your specific requirements, not industry trends.

### Over-Engineering for Scale

Designing for millions of users when you have hundreds is a common trap. Distributed databases add complexity: more failure modes, harder debugging, eventual consistency trade-offs, and higher operational costs. Start with the simplest option that meets your current needs and scale up when the data tells you to.

### Ignoring Operational Costs

The cheapest database to run is the one your team already knows how to operate. Factor in monitoring, backups, upgrades, and on-call burden when comparing options. A managed database service often makes more sense than self-hosting, even at a higher per-unit cost.

### Using One Database for Everything

The opposite mistake is trying to force one database to handle workloads it was not designed for. Using PostgreSQL as a message queue, Redis as a primary data store, or MongoDB for heavily relational data creates friction. Recognise when a workload needs its own data store.

For more on making pragmatic architectural decisions, see [the pragmatic approach to microservices](/architecture/the-pragmatic-approach-to-microservices).

## Making Your Decision

Here is a simple decision framework:

1. **Start with your data model.** If your data is relational, start with PostgreSQL or MySQL. If it is documents, consider MongoDB. If it is key-value, consider Redis or DynamoDB.
2. **Validate against access patterns.** Make sure your database can handle your most common queries efficiently. If you need complex joins, stick with SQL. If you only need point lookups, simpler is better.
3. **Check your scale requirements honestly.** A single PostgreSQL instance handles more than most people think. Do not introduce distributed complexity until you have evidence you need it.
4. **Consider your team.** The best database is one your team can operate confidently. Factor in expertise, hiring, and on-call reality.
5. **Prototype with real data.** Load a representative dataset and test your critical queries. Benchmarks in blog posts (including this one) are never a substitute for testing with your own workload.

## The Bottom Line

Database selection is a consequential decision, but it does not need to be agonising. For most web applications, a relational database (particularly PostgreSQL) is the right starting point. Add specialised databases only when you hit a concrete limitation that your primary database cannot handle efficiently.

The teams that get this right are the ones that base their decision on actual requirements, not hypothetical scale, industry trends, or resume-driven development. Understand your data, know your access patterns, and choose the simplest tool that does the job well.
