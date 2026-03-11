---
title: "Database Migrations Without the Fear"
description: "Learn how to run database migrations safely with zero-downtime strategies, rollback plans, and practical tips for confident schema changes."
publishDate: "2026-02-19"
author: "gareth-clubb"
category: "backend"
tags: ["database", "migrations", "devops", "postgresql", "backend"]
featured: false
draft: false
faqs:
  - question: "What is a database migration?"
    answer: "A database migration is a versioned, incremental change to your database schema. Migrations let you evolve your database structure over time in a controlled, repeatable way, typically tracked alongside your application code in version control."
  - question: "Should I run migrations automatically during deployment?"
    answer: "For small teams and low-risk changes, automated migrations during deployment can work well. For larger systems, it is safer to run migrations as a separate step before deploying new application code, giving you time to verify the migration succeeded before cutting over."
  - question: "How do I roll back a failed migration?"
    answer: "Always write a corresponding down migration that reverses your changes. Test your rollback in staging before running it in production. For data migrations, consider taking a snapshot or backup before running the migration so you have a recovery point."
  - question: "Can I rename a column without downtime?"
    answer: "Not directly. Renaming a column requires a multi-step migration: add the new column, backfill data, update application code to use the new column, then drop the old column in a later release. This expand-and-contract pattern avoids breaking running application instances."
  - question: "What tools are commonly used for database migrations?"
    answer: "Popular migration tools include Flyway and Liquibase for Java, Alembic for Python, Knex and Prisma for Node.js, ActiveRecord Migrations for Ruby on Rails, and golang-migrate for Go. Most ORMs also include built-in migration support."
primaryKeyword: "database migrations"
---

Database migrations are one of those things that should be straightforward but somehow always feel risky. You have written the SQL, tested it locally, and it works perfectly. Then you run it against production and your palms start sweating.

In my experience, the fear is usually justified when teams lack a repeatable process. The good news is that with the right approach, database migrations can become routine. Not exciting, not terrifying; just another part of shipping software. Here is how to get there.

## Why Migrations Go Wrong

Most migration failures fall into a handful of categories. Understanding them is the first step to avoiding them.

**Locking issues** are the most common culprit. Running an `ALTER TABLE` on a large table can acquire a lock that blocks all reads and writes. Your application grinds to a halt while the migration runs, and if it takes minutes instead of seconds, you have an outage.

**Data assumptions** cause subtle problems. Your migration assumes a column has no null values, but production data tells a different story. The migration fails halfway through, leaving your schema in an inconsistent state.

**Ordering mistakes** happen when two developers create migrations that conflict. Migration A adds a foreign key to a table that Migration B is restructuring. Whichever runs second will fail. This is one reason why [good code review practices](/collaboration/code-reviews-that-dont-waste-time) matter for migrations just as much as for application code.

## The Expand and Contract Pattern

The single most useful pattern for safe migrations is expand and contract. Instead of making breaking changes in one step, you split them into phases.

### Phase 1: Expand

Add the new structure alongside the old one. If you are renaming a column, add the new column. If you are splitting a table, create the new table. Your application code continues using the old structure.

### Phase 2: Migrate

Backfill data from the old structure to the new one. Update your application code to write to both the old and new structures, but read from the new one.

### Phase 3: Contract

Once you are confident the new structure is correct and your application is using it exclusively, remove the old structure in a subsequent release.

This pattern is more work than a single migration, but it eliminates downtime and gives you a rollback path at every stage. It is the same principle behind [feature flags](/devops/feature-flags-a-practical-introduction), where you decouple the deployment of code from the activation of functionality.

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" aria-label="Diagram showing the three phases of expand and contract migration: Expand, Migrate, and Contract, with risk level decreasing at each stage.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="700" height="320" fill="#f8fafc" rx="8"/>
  <!-- Title -->
  <text x="350" y="35" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Expand and Contract Migration Pattern</text>
  <!-- Phase 1 -->
  <rect x="40" y="60" width="180" height="200" rx="8" fill="#dbeafe" stroke="#3b82f6" stroke-width="2"/>
  <text x="130" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#1e40af">Phase 1: Expand</text>
  <text x="130" y="115" text-anchor="middle" font-size="11" fill="#334155">Add new column/table</text>
  <text x="130" y="135" text-anchor="middle" font-size="11" fill="#334155">Old structure intact</text>
  <text x="130" y="155" text-anchor="middle" font-size="11" fill="#334155">No app changes yet</text>
  <rect x="65" y="175" width="130" height="30" rx="4" fill="#22c55e"/>
  <text x="130" y="195" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Low Risk</text>
  <text x="130" y="230" text-anchor="middle" font-size="10" fill="#64748b">Rollback: drop new</text>
  <text x="130" y="245" text-anchor="middle" font-size="10" fill="#64748b">column/table</text>
  <!-- Arrow 1 -->
  <polygon points="228,160 248,150 248,170" fill="#64748b"/>
  <!-- Phase 2 -->
  <rect x="260" y="60" width="180" height="200" rx="8" fill="#fef3c7" stroke="#f59e0b" stroke-width="2"/>
  <text x="350" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#92400e">Phase 2: Migrate</text>
  <text x="350" y="115" text-anchor="middle" font-size="11" fill="#334155">Backfill data</text>
  <text x="350" y="135" text-anchor="middle" font-size="11" fill="#334155">Write to both structures</text>
  <text x="350" y="155" text-anchor="middle" font-size="11" fill="#334155">Read from new</text>
  <rect x="285" y="175" width="130" height="30" rx="4" fill="#f59e0b"/>
  <text x="350" y="195" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Medium Risk</text>
  <text x="350" y="230" text-anchor="middle" font-size="10" fill="#64748b">Rollback: revert app</text>
  <text x="350" y="245" text-anchor="middle" font-size="10" fill="#64748b">to read old structure</text>
  <!-- Arrow 2 -->
  <polygon points="448,160 468,150 468,170" fill="#64748b"/>
  <!-- Phase 3 -->
  <rect x="480" y="60" width="180" height="200" rx="8" fill="#fce7f3" stroke="#ec4899" stroke-width="2"/>
  <text x="570" y="90" text-anchor="middle" font-size="14" font-weight="bold" fill="#9d174d">Phase 3: Contract</text>
  <text x="570" y="115" text-anchor="middle" font-size="11" fill="#334155">Remove old structure</text>
  <text x="570" y="135" text-anchor="middle" font-size="11" fill="#334155">Clean up dual writes</text>
  <text x="570" y="155" text-anchor="middle" font-size="11" fill="#334155">Final state reached</text>
  <rect x="505" y="175" width="130" height="30" rx="4" fill="#ef4444"/>
  <text x="570" y="195" text-anchor="middle" font-size="12" font-weight="bold" fill="#ffffff">Irreversible</text>
  <text x="570" y="230" text-anchor="middle" font-size="10" fill="#64748b">Rollback: restore</text>
  <text x="570" y="245" text-anchor="middle" font-size="10" fill="#64748b">from backup only</text>
  <!-- Footer -->
  <text x="350" y="295" text-anchor="middle" font-size="11" fill="#64748b">Each phase is a separate deployment. Verify before moving to the next.</text>
</svg>

## Practical Tips for Safe Migrations

### Always Use Transactions Where Possible

Wrap your migration in a transaction so that if any part fails, the entire change is rolled back. Most migration tools do this by default, but verify it for your setup.

```sql
BEGIN;
ALTER TABLE users ADD COLUMN display_name VARCHAR(255);
UPDATE users SET display_name = username WHERE display_name IS NULL;
COMMIT;
```

Note that some operations in PostgreSQL cannot run inside a transaction, such as `CREATE INDEX CONCURRENTLY`. Plan accordingly.

### Use Non-Blocking Index Creation

Creating an index on a large table can lock it for minutes. In PostgreSQL, use `CREATE INDEX CONCURRENTLY` to build the index without blocking writes.

```sql
CREATE INDEX CONCURRENTLY idx_users_email ON users (email);
```

This takes longer to complete but does not lock the table. Your application continues serving requests normally while the index builds in the background.

### Set Statement Timeouts

Add a statement timeout to your migration connection. If a migration takes longer than expected, it will be cancelled automatically rather than holding locks indefinitely.

```sql
SET statement_timeout = '5s';
ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100);
```

If the `ALTER TABLE` cannot acquire a lock within five seconds, it will fail rather than queue behind long-running queries.

### Test Against Production-Sized Data

A migration that runs instantly on your local database with 100 rows might take 20 minutes on a production table with 50 million rows. I have seen teams confidently merge a migration that ran in under a second locally, only to watch it lock a table for 12 minutes in production. Always test migrations against a copy of production data, or at least against a dataset of similar size.

### Write Down Migrations

Every up migration should have a corresponding down migration. Even if you never use it, writing the rollback forces you to think about reversibility. If your migration is not reversible, document why and what the recovery plan is.

## Migration Strategies by Risk Level

The table below summarises how to approach migrations depending on the level of risk involved.

| Risk Level | Examples | Strategy | Deployment Approach |
|---|---|---|---|
| Low | Add column with default, create new table, add index on small table | Run automatically during deployment | Single step, automated |
| Medium | Data backfills, adding NOT NULL constraints | Test against production-sized data, batch updates | Separate migration step before deploy |
| High | Drop column, rename column, change column type | Expand and contract pattern | Split across multiple deployments |
| Critical | Table restructuring, splitting/merging tables | Expand and contract with shadow writes | Multiple deployments over days/weeks |

### Low Risk: Additive Changes

Adding a new column with a default value, creating a new table, or adding a new index on a small table. These are generally safe to run automatically during deployment.

### Medium Risk: Data Backfills

Populating a new column with data derived from existing columns. These should be tested against production-sized data and may need to be batched to avoid locking issues.

```sql
-- Batch update to avoid long-running transactions
UPDATE users SET normalised_email = LOWER(email)
WHERE normalised_email IS NULL
LIMIT 10000;
```

Run this in a loop until all rows are updated, with a short pause between batches to let other queries through.

### High Risk: Destructive Changes

Dropping columns, renaming columns, changing column types, or dropping tables. These should always use the expand and contract pattern and be split across multiple deployments.

## Handling Migration Failures

Despite your best efforts, migrations will occasionally fail. Having a plan makes all the difference.

**Before running the migration**, take a snapshot or backup. For managed database services, this is usually a single API call. For self-hosted databases, use `pg_dump` or your database's equivalent. The <a href="https://www.postgresql.org/docs/current/backup.html" target="_blank" rel="noopener noreferrer">PostgreSQL backup documentation ↗</a> covers the various backup methods in detail.

**If the migration fails partway through**, check whether it ran inside a transaction. If it did, the database should have rolled back automatically. If it did not, you need to assess the current state of the schema and either complete the migration manually or roll back the partial changes.

**After a successful migration**, verify the schema matches your expectations. Run your application's test suite against the migrated database. Monitor application logs and error rates for the next hour. This is where good [observability practices](/devops/observability-vs-monitoring-what-developers-need-to-know) pay for themselves.

## Team Practices That Help

### Review Migrations Like Code

Migrations deserve the same scrutiny as application code. During code review, ask: Could this lock a table? Does it handle null values? Is there a rollback path? Has it been tested against realistic data? I have found that adding a dedicated "migration checklist" section to pull request templates dramatically reduces the number of migration incidents.

### One Migration Per Pull Request

Avoid bundling multiple schema changes into a single migration. If one change needs to be rolled back, you do not want to undo unrelated changes as well. This pairs well with a disciplined [pull request process](/collaboration/why-your-pull-requests-take-too-long) that keeps changes small and focused.

### Use a Migration Linter

Tools like <a href="https://squawkhq.com/" target="_blank" rel="noopener noreferrer">Squawk ↗</a> for PostgreSQL can catch common mistakes in your migrations before they reach production. They will flag issues like missing concurrent index creation, risky column type changes, and missing `NOT NULL` constraints without defaults. Integrating a linter into your [CI/CD pipeline](/devops/how-to-build-a-ci-cd-pipeline-that-actually-works) means dangerous migrations are caught automatically.

### Keep a Migration Runbook

Document the steps for running migrations in production. Include how to check the current migration state, how to run a migration manually, how to roll back, and who to contact if something goes wrong. When it is 2 AM and a migration has failed, you do not want to be figuring this out from scratch. This is exactly the kind of operational knowledge that belongs in your team's [documentation](/collaboration/writing-documentation-developers-actually-read).

## Schema Changes in a Microservices World

When multiple services share a database (which they probably should not, but often do), migrations become more complicated. You need to coordinate changes across teams and ensure that all services can handle both the old and new schema during the transition. Working with teams over the years, I have seen shared databases cause more cross-team friction than almost any other architectural decision.

The expand and contract pattern is even more important here. Each service can be updated independently to use the new schema, and the old structure is only removed once all services have migrated.

If you are building new services, give each one its own database. The operational overhead of multiple databases is far less painful than coordinating schema changes across teams.

## Conclusion

Database migrations do not have to be scary. Use the expand and contract pattern for breaking changes, test against production-sized data, set statement timeouts, and always have a rollback plan. Treat migrations as first-class artefacts that deserve code review and testing.

The goal is not to eliminate all risk. It is to make migrations so routine and well-understood that they become boring. And in software engineering, [boring is almost always a good thing](/architecture/the-case-for-boring-technology).
