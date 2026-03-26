---
title: "How to Design a Database Schema That Scales"
description: "Practical guide to designing database schemas that scale cleanly, covering normalisation, denormalisation, naming and common mistakes."
publishDate: "2026-03-26"
author: "gareth-clubb"
category: "backend"
tags: ["database", "schema-design", "sql", "postgresql", "scalability"]
featured: false
draft: false
faqs:
  - question: "Should I always normalise my database schema?"
    answer: "Not always. Normalisation reduces redundancy and keeps data consistent, which is the right default for most applications. But when specific queries are slow because of excessive joins, controlled denormalisation can be the right trade-off. Normalise first, then denormalise deliberately where you have evidence of a performance problem."
  - question: "How do I know when my schema needs to change?"
    answer: "Common signs include queries that require many joins to answer simple questions, tables with dozens of nullable columns, or application code that works around the schema rather than with it. If your team regularly says the data model does not match how the application actually works, it is time for a rethink."
  - question: "Is it better to use UUIDs or auto-incrementing integers for primary keys?"
    answer: "Both work. Auto-incrementing integers are smaller, faster to index and human-readable. UUIDs avoid exposing record counts, work well in distributed systems and prevent ID conflicts during data merges. For most single-database applications, integers are simpler. For distributed systems or public-facing APIs, UUIDs are usually the better choice."
  - question: "How many columns is too many for a single table?"
    answer: "There is no strict limit, but tables with more than 20 to 30 columns often signal that the table is doing too much. If a group of columns always appears together and relates to a distinct concept, consider extracting them into a separate table."
primaryKeyword: "database schema design"
---

A good database schema is invisible. Queries are straightforward, joins make sense, and adding new features does not require reworking half the data model. A bad schema, on the other hand, makes everything harder: queries become convoluted, performance degrades unpredictably, and every new requirement feels like it fights the existing structure.

The difference between the two usually comes down to decisions made early in a project. Schema design is one of the highest leverage activities in software development, because those early choices compound over time. This guide covers the principles, patterns and common pitfalls of designing schemas that hold up as your application grows.

## Start with the domain, not the tables

The most common schema design mistake is jumping straight to CREATE TABLE statements. Before writing any SQL, you need a clear picture of what your application actually does and what relationships exist between the things it manages.

Start by listing the core entities. For an e-commerce application, that might be customers, orders, products and payments. For a project management tool, it could be users, teams, projects and tasks.

Then map the relationships between them:

- A customer places many orders (one-to-many)
- An order contains many products, and a product appears in many orders (many-to-many)
- A task belongs to one project (many-to-one)

This is not about drawing formal ER diagrams (though those can help). It is about understanding the shape of your data before committing to a structure. Getting this wrong means restructuring later, and [migrations](/backend/database-migrations-without-the-fear) on production data are always harder than getting it right the first time.

## Normalisation: the right default

Normalisation is the process of organising your schema to reduce redundancy and prevent inconsistencies. The first three normal forms cover the vast majority of practical cases.

### First normal form (1NF)

Every column holds a single value. No arrays, no comma-separated lists, no JSON blobs where structured columns should be.

```sql
-- Bad: multiple values in one column
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_name TEXT,
  product_names TEXT  -- "Widget, Gadget, Thingamajig"
);

-- Good: separate table for order items
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id)
);

CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders(id),
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1
);
```

Storing multiple values in a single column makes it nearly impossible to query, filter or aggregate that data reliably.

### Second normal form (2NF)

Every non-key column depends on the entire primary key, not just part of it. This mainly applies to tables with composite primary keys.

If you have a table with a composite key of `(order_id, product_id)` and a column for `product_name`, that column depends only on `product_id`, not on the full key. It belongs in the products table instead.

### Third normal form (3NF)

Every non-key column depends directly on the primary key, not on another non-key column. If your orders table has `customer_id`, `customer_name` and `customer_email`, the name and email depend on the customer, not on the order. They belong in a customers table.

| Normal form | Rule | Practical meaning |
|---|---|---|
| 1NF | Atomic values only | No comma-separated lists or embedded arrays |
| 2NF | Full key dependency | No partial dependencies on composite keys |
| 3NF | Direct key dependency | No transitive dependencies through non-key columns |

For most application databases, third normal form is the sweet spot. Higher normal forms exist but rarely justify the additional complexity.

## When to denormalise

Normalisation is the right starting point, but it is not an absolute rule. There are legitimate reasons to denormalise, provided you do it deliberately.

### Read performance

Highly normalised schemas can require many joins to answer common queries. If your application's most frequent query joins five tables and runs thousands of times per second, denormalising some of that data into fewer tables can make a significant difference.

The key is measurement. Do not denormalise because you think a query might be slow. Denormalise when you have [evidence from query plans and monitoring](/backend/the-developers-guide-to-database-indexing) that joins are the bottleneck.

### Calculated values

Storing a calculated value (like an order total) alongside the source data avoids recalculating it on every read. This is a form of denormalisation, and it is usually fine as long as you keep the calculated value in sync with the source data.

```sql
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers(id),
  total_amount DECIMAL(10,2),  -- denormalised: sum of order_items
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Reporting and analytics

Reporting queries often need wide, flat data. Rather than forcing your reporting to join across a normalised schema, consider creating materialised views or dedicated reporting tables that aggregate the data your reports need.

## Naming conventions that save you later

Naming seems trivial until you inherit a schema where tables are called `tbl_usr_dat` and columns are `fld1`, `fld2`, `fld3`. Consistent naming makes a schema self-documenting.

**Tables:** use plural nouns in snake_case. `customers`, `order_items`, `project_members`. Plural because a table holds many rows.

**Columns:** use snake_case with descriptive names. `first_name`, `created_at`, `is_active`. Avoid abbreviations unless they are universally understood (like `id`).

**Foreign keys:** name them after the referenced table. `customer_id` in the orders table, `project_id` in the tasks table. This makes joins read naturally: `JOIN customers ON orders.customer_id = customers.id`.

**Indexes:** use a consistent pattern like `idx_tablename_columnname`. This makes it easy to identify what an index covers without looking it up.

**Boolean columns:** prefix with `is_` or `has_`. `is_active`, `has_verified_email`. This makes queries read like English: `WHERE is_active = true`.

## Designing for common patterns

### One-to-many relationships

The most common relationship type. The "many" side holds a foreign key to the "one" side.

```sql
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE tasks (
  id SERIAL PRIMARY KEY,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo'
);
```

Always add `NOT NULL` to foreign keys unless a row genuinely can exist without the relationship. A task without a project is probably a bug, not a feature.

### Many-to-many relationships

Use a junction table (also called a join table or associative table) with foreign keys to both sides.

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE product_tags (
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  tag_id INTEGER REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (product_id, tag_id)
);
```

If the relationship itself has attributes (like a quantity or a role), add those columns to the junction table.

### Soft deletes vs hard deletes

Soft deletes add an `is_deleted` or `deleted_at` column instead of removing rows. This preserves data for auditing and allows recovery, but it complicates every query because you need to filter out deleted rows.

Hard deletes remove the row entirely. This is simpler but irreversible.

For most applications, soft deletes on important business data (customers, orders) and hard deletes on ephemeral data (sessions, temporary tokens) is a reasonable approach. If you use soft deletes, add a partial index to keep queries fast:

```sql
CREATE INDEX idx_customers_active ON customers (id)
WHERE deleted_at IS NULL;
```

### Timestamps

Always include `created_at` on every table. Add `updated_at` if your application modifies records. Use `TIMESTAMPTZ` (timestamp with time zone) rather than `TIMESTAMP` to avoid timezone ambiguity.

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

## Common schema design mistakes

### The mega-table

A single table that tries to hold everything: `users` with columns for personal details, billing information, preferences, notification settings, and activity logs. This leads to rows that are mostly NULL, queries that scan unnecessary data, and a table that is painful to modify.

Split it into focused tables: `users`, `billing_profiles`, `user_preferences`, `notification_settings`. Each table has a clear purpose and only the columns it needs.

### Premature use of JSON columns

JSON columns are useful for genuinely unstructured data, like storing arbitrary metadata from an external API. But using them to avoid designing a proper schema is a trap.

```sql
-- Tempting but problematic
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  data JSONB  -- everything goes in here
);
```

You lose type safety, foreign key constraints, indexing efficiency, and the ability to query the data without JSON-specific operators. If you know the structure of your data, use proper columns.

### Missing constraints

Constraints are documentation that the database enforces. Without them, your application code becomes the only thing preventing bad data.

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
  sku TEXT NOT NULL UNIQUE,
  category_id INTEGER NOT NULL REFERENCES categories(id)
);
```

`NOT NULL`, `UNIQUE`, `CHECK`, and foreign key constraints catch bugs that application-level validation misses. They are especially valuable when multiple services or scripts write to the same database.

### Ignoring data growth

A schema that works with 10,000 rows might not work with 10 million. Think about which tables will grow fastest and plan accordingly:

- Will you need to [partition large tables](/backend/caching-strategies-every-developer-should-know) by date or tenant?
- Are your indexes on the right columns for your most frequent queries?
- Will you need to archive old data?

You do not need to solve all of these on day one, but keeping them in mind prevents designs that make them impossible later.

## A practical workflow

1. **Map your entities and relationships.** Sketch the core concepts and how they connect. Focus on the domain, not the implementation.

2. **Normalise to 3NF.** Start with a clean, normalised structure. This gives you a solid foundation.

3. **Name everything consistently.** Pick a naming convention and stick to it across the entire schema.

4. **Add constraints.** NOT NULL, UNIQUE, CHECK, and foreign keys. Let the database protect your data.

5. **Add timestamps.** `created_at` on everything, `updated_at` where records change.

6. **Design your [API](/backend/api-design-principles-every-developer-should-know) alongside your schema.** The two should support each other. If your API needs data that requires five joins to assemble, either the API or the schema needs rethinking.

7. **Write your most important queries.** Before finalising the schema, write the ten most common queries your application will run. If any of them are awkward or slow, adjust the schema.

8. **Review and iterate.** Schema design is not a one-shot activity. As your understanding of the domain deepens, your schema should evolve with it.

The best schemas are the ones that make the right thing easy and the wrong thing hard. Invest the time upfront to understand your data, normalise properly, name things clearly, and add constraints that protect your data's integrity. Your future self, and every developer who works on the project after you, will thank you for it.
