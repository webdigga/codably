---
title: "Message Queues for Developers: RabbitMQ vs Kafka vs SQS"
description: "A practical comparison of message queues for developers: when to reach for RabbitMQ, Kafka, or SQS, plus delivery guarantees, ordering, and real costs."
publishDate: "2026-04-21"
author: "gareth-clubb"
category: "architecture"
tags: ["message queues", "rabbitmq", "kafka", "sqs", "distributed systems", "backend", "architecture"]
featured: false
draft: false
faqs:
  - question: "What is a message queue?"
    answer: "A message queue is a piece of infrastructure that stores messages produced by one service so another service can consume them later. It decouples producers from consumers in time, so a slow or offline consumer does not block the producer, and bursts of work can be smoothed out over time."
  - question: "Is Kafka a message queue?"
    answer: "Strictly, Kafka is a distributed log rather than a queue. Messages are appended to partitioned topics and retained for a configurable period. Consumers track their own offset, so multiple consumers can read the same events independently and replay history. In practice, people use Kafka for many of the same jobs as a queue, but the semantics differ."
  - question: "When should I choose RabbitMQ over Kafka?"
    answer: "Choose RabbitMQ when you need flexible routing, per-message acknowledgement, priority queues, or low-to-moderate throughput with strong delivery guarantees. Task queues, job dispatch, and request-response patterns fit RabbitMQ well. Choose Kafka when you need very high throughput, long retention, replay, or event sourcing across many consumers."
  - question: "When is AWS SQS the right choice?"
    answer: "SQS is the right choice when you are already on AWS and want a fully managed queue with no operational overhead. It handles most task-queue use cases, supports FIFO and standard modes, and integrates cleanly with Lambda, ECS, and EventBridge. Trade-off: less flexibility than RabbitMQ and lower raw throughput than Kafka."
  - question: "How do I handle duplicate messages?"
    answer: "Every message queue delivers at-least-once under failure conditions, so consumers must be idempotent. Store a processed-message ID (usually the message ID or an application-level key) and skip duplicates. For database writes, use conditional upserts. SQS FIFO and Kafka exactly-once semantics reduce duplicates but do not eliminate them at the application boundary."
primaryKeyword: "message queues"
---

A team I worked with spent six weeks debugging "random" order failures in production. The root cause was a retry loop in an HTTP client that was firing `POST /orders` three times under load, creating duplicate orders. The fix was not a better retry policy. It was a message queue between the web tier and the order service, with idempotent consumers.

Message queues solve a specific class of problems. They are not a general upgrade over HTTP. This guide covers the three options most teams actually pick between, what each is good at, and where each will bite you.

## What a Message Queue Actually Does

A message queue sits between a producer and one or more consumers. The producer writes a message. The broker stores it. A consumer reads it, does some work, and acknowledges the message so the broker can remove it.

Three things fall out of that:

- **Decoupling in time.** The consumer does not need to be online when the producer writes. Restart a worker, deploy a new version, absorb a spike: the queue holds messages until someone processes them.
- **Load smoothing.** A 10x traffic burst does not translate into a 10x resource burst on the consumer. The queue absorbs the spike; the consumer drains at its own pace.
- **Retries without duplicates everywhere.** If a consumer crashes mid-process, the message goes back on the queue. One retry loop, in one place, rather than every HTTP client inventing its own.

Not every async problem needs a queue. If you are building CRUD on a single database, HTTP is simpler. Queues pay for themselves once you have multiple services, unreliable downstream dependencies, or genuine throughput needs. They pair naturally with [event-driven architecture](/architecture/understanding-event-driven-architecture) but they are also useful on their own.

## The Three Options

This comparison covers the three systems most teams end up choosing between: RabbitMQ, Apache Kafka, and AWS SQS. There are others (<a href="https://pulsar.apache.org/" target="_blank" rel="noopener noreferrer">Apache Pulsar ↗</a>, <a href="https://cloud.google.com/pubsub" target="_blank" rel="noopener noreferrer">Google Pub/Sub ↗</a>, NATS, Redis Streams), but the three below cover 90% of real decisions.

### RabbitMQ: flexible routing, per-message acks

<a href="https://www.rabbitmq.com/" target="_blank" rel="noopener noreferrer">RabbitMQ ↗</a> is a traditional message broker built on AMQP. It thinks in exchanges, queues, and bindings. A producer publishes to an exchange; the exchange routes to one or more queues based on routing keys or headers; consumers read from queues.

What makes RabbitMQ shine:

- **Routing flexibility.** Topic exchanges, header exchanges, and fanout give you fine-grained control over which consumers see which messages.
- **Per-message acknowledgement.** Consumers ack individual messages. If processing fails, the message returns to the queue for another worker.
- **Priority queues.** You can promote urgent messages ahead of routine ones.
- **Dead-letter exchanges.** Messages that repeatedly fail get routed to a DLX for inspection.

Where it hurts:

- **Throughput ceiling.** A single RabbitMQ node handles tens of thousands of messages per second. A cluster pushes that higher, but not to Kafka levels.
- **Once consumed, gone.** Messages are deleted after ack. No replay. If you need the past, you need to store it yourself.
- **Operational weight.** Clustering, quorum queues, and upgrades require thought. Managed options (CloudAMQP, Amazon MQ) offload most of that.

Best fit: task queues, job dispatch, request-response over async channels, workflows with complex routing, moderate throughput with strong per-message semantics.

### Apache Kafka: a durable log, not a queue

<a href="https://kafka.apache.org/" target="_blank" rel="noopener noreferrer">Apache Kafka ↗</a> is a different beast. Messages go into partitioned topics and are retained for a configurable period (days, weeks, indefinitely). Consumers track their own offset, so multiple independent consumers can read the same events.

What Kafka does that nothing else does at the same scale:

- **Very high throughput.** Millions of messages per second on a properly sized cluster.
- **Replay.** Reset a consumer's offset and reprocess from any point in retention.
- **Multiple independent consumers.** Analytics, fraud detection, and cache warming can all read the same event stream without interfering with each other.
- **Ordered within a partition.** Messages with the same key land in the same partition, preserving order per-entity.

Where it hurts:

- **No per-message ack.** Consumers commit offsets, not individual messages. If message 99 fails but 100 succeeds, your retry model needs work.
- **Operational complexity.** Running Kafka yourself is non-trivial. Managed Kafka (Confluent Cloud, MSK, Redpanda Cloud) is the usual escape hatch.
- **Overkill for small systems.** If you are doing 500 messages/sec, Kafka's capabilities are wasted and the operational cost is real.

Best fit: event sourcing, log aggregation, stream processing, fan-out to many consumers, anything that benefits from replay.

### AWS SQS: the managed default

<a href="https://aws.amazon.com/sqs/" target="_blank" rel="noopener noreferrer">Amazon SQS ↗</a> is the fully managed option. No clusters, no brokers, no upgrades. You create a queue, get an HTTP endpoint, send and receive messages.

Two flavours:

- **Standard queues.** Virtually unlimited throughput, at-least-once delivery, best-effort ordering.
- **FIFO queues.** Strict ordering, exactly-once processing within a message group, up to 3,000 messages/sec per API action with high throughput mode.

What you get for free:

- **Zero operational overhead.** It just works. Patching, scaling, availability: AWS's problem, not yours.
- **Tight AWS integration.** Lambda triggers, SNS fan-out, EventBridge pipes, IAM for access control.
- **Visibility timeouts and DLQs built in.** The patterns you would implement manually elsewhere come out of the box.

Where it hurts:

- **Less flexibility.** No topic exchanges, no per-message priorities, no replay after consumption.
- **Vendor lock-in.** Migrating away from SQS means redesigning around whichever successor you pick.
- **Cost at very high volume.** Pennies per million requests add up; at Kafka-scale throughput, self-hosted options beat SQS on unit cost.

Best fit: any AWS-native workload where a queue is useful and you do not want to run infrastructure.

## Side-by-side Comparison

| Dimension | RabbitMQ | Kafka | SQS |
|---|---|---|---|
| Model | Broker with exchanges and queues | Distributed log with partitioned topics | Managed queue |
| Throughput (single node / single queue) | ~50k msg/sec | Millions/sec across cluster | Near-unlimited (standard), 3k+/sec (FIFO) |
| Message retention | Until ack'd | Configurable (days to forever) | Up to 14 days |
| Replay | No | Yes | No |
| Per-message ack | Yes | No (offset commit) | Yes |
| Ordering | Per-queue | Per-partition | Best-effort (standard), strict (FIFO) |
| Delivery guarantees | At-least-once; exactly-once with careful use | At-least-once; exactly-once with transactions | At-least-once (standard), exactly-once (FIFO) |
| Operational overhead | Moderate (self-hosted) / Low (managed) | High (self-hosted) / Moderate (managed) | None |
| Pricing model | Server cost | Server or per-throughput | Per-request + data transfer |

## Throughput and Latency: What the Numbers Look Like

<svg viewBox="0 0 720 280" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Chart comparing approximate throughput and latency ranges for RabbitMQ, Kafka, and SQS. Kafka leads on throughput at millions of messages per second; RabbitMQ offers the lowest latency at single-digit milliseconds; SQS sits between on both axes.">
  <defs>
    <marker id="qarrow" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#6b7280"/>
    </marker>
  </defs>
  <text x="360" y="24" text-anchor="middle" font-family="Inter, sans-serif" font-size="15" font-weight="700" fill="#1f2937">Throughput vs latency: where each broker lives</text>
  <line x1="60" y1="240" x2="680" y2="240" stroke="#6b7280" stroke-width="1.5" marker-end="url(#qarrow)"/>
  <line x1="60" y1="240" x2="60" y2="50" stroke="#6b7280" stroke-width="1.5" marker-end="url(#qarrow)"/>
  <text x="680" y="262" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#6b7280">Throughput</text>
  <text x="30" y="56" text-anchor="start" font-family="Inter, sans-serif" font-size="12" fill="#6b7280">Latency</text>
  <text x="110" y="258" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">10k/sec</text>
  <text x="310" y="258" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">100k/sec</text>
  <text x="540" y="258" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">1M+/sec</text>
  <text x="54" y="230" text-anchor="end" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">1ms</text>
  <text x="54" y="160" text-anchor="end" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">10ms</text>
  <text x="54" y="90" text-anchor="end" font-family="Inter, sans-serif" font-size="11" fill="#9ca3af">100ms</text>
  <ellipse cx="140" cy="210" rx="70" ry="34" fill="#fce7f3" stroke="#ec4899" stroke-width="2" opacity="0.85"/>
  <text x="140" y="208" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#831843">RabbitMQ</text>
  <text x="140" y="224" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#831843">Low latency, moderate throughput</text>
  <ellipse cx="540" cy="140" rx="95" ry="44" fill="#ede9fe" stroke="#6366f1" stroke-width="2" opacity="0.85"/>
  <text x="540" y="138" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#3730a3">Kafka</text>
  <text x="540" y="156" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#3730a3">Massive throughput, replay</text>
  <ellipse cx="340" cy="170" rx="80" ry="40" fill="#ecfdf5" stroke="#10b981" stroke-width="2" opacity="0.85"/>
  <text x="340" y="168" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="700" fill="#065f46">SQS</text>
  <text x="340" y="186" text-anchor="middle" font-family="Inter, sans-serif" font-size="10" fill="#065f46">Zero ops, elastic scale</text>
</svg>

The numbers above are order-of-magnitude, not benchmarks. Your workload, payload size, network, and durability settings all move the bar. Treat the chart as "where does each sit" rather than "which is fastest".

## Decision Framework: Which Should You Pick?

A quick way to decide, based on what I have seen ship and survive:

1. **You are on AWS, the volume is moderate, and you do not want to run infrastructure.** Use SQS. Add SNS for fan-out if needed. Move on.
2. **You need complex routing, priorities, or per-message acknowledgement, and throughput is under 100k/sec.** Use RabbitMQ. Use a managed provider unless you have a platform team.
3. **You need replay, multiple independent consumers of the same stream, or event sourcing.** Use Kafka. Use managed Kafka unless you have a real reason not to.
4. **You are doing high-throughput streaming analytics.** Use Kafka. SQS and RabbitMQ will hit ceilings.
5. **You want a task queue for background work in a new project.** Any of the three works. SQS wins on time-to-value; RabbitMQ wins on flexibility; Kafka is overkill.

For most teams building [background jobs and task queues](/backend/the-developers-guide-to-background-jobs-and-task-queues), a managed queue is the right starting point. Picking Kafka because "we might need replay one day" is a classic over-engineering move.

## Pitfalls You Will Hit Anyway

### Assuming exactly-once

Every queue claims some version of exactly-once. In practice, you get at-least-once at the application boundary. Networks drop packets, workers crash after doing work but before acking, retries deliver duplicates. Write idempotent consumers. Store processed message IDs. Use conditional database operations.

### Ignoring the poison message problem

A message that always fails will be retried forever, block a queue, or consume workers in a loop. Every real system needs a dead-letter queue and an alerting rule on DLQ depth. Without one, a single bad message can take down a worker fleet for hours.

### Treating ordering as free

Ordering costs throughput. RabbitMQ orders within a queue but loses order across queues. Kafka orders within a partition, so single-partition ordering throttles you to one consumer. SQS FIFO rations throughput per message group. If your design needs strict global ordering, you are probably solving the wrong problem.

### Skimping on observability

Queues are where bugs hide. A failed consumer, a slow downstream, a growing backlog: all invisible without metrics. Track publish rate, consume rate, age of oldest message, and DLQ depth. Pair this with [solid observability practices](/devops/observability-vs-monitoring-what-developers-need-to-know) and [structured logging](/backend/the-developers-guide-to-logging) so you can correlate messages from producer to consumer.

### Forgetting about message size

Most queues cap messages at 256KB to 1MB. If you want to send a 50MB file, you send a pointer. Write the payload to S3 or a blob store, and put the key on the queue. Teams that discover this in production have a bad week.

## A Concrete Example

Here is the before/after from a real project (names changed). A fintech API had a synchronous flow:

```
POST /transfers → validate → debit → call ledger API → respond
```

When the ledger API was slow or down, transfers failed. Retries from the client produced duplicate debits. The fix:

```
POST /transfers → validate → debit → enqueue "transfer_requested" → respond 202

[consumer]
consume "transfer_requested" → call ledger API → on success, publish "transfer_posted"
                                             → on failure, retry with backoff, DLQ after N attempts
```

They used SQS FIFO keyed on account ID so transfers for the same account stayed ordered. The ledger API could now be slow or down without breaking the user-facing API. Duplicate messages were handled by storing `transfer_id` in a unique index at the ledger. Total effort: about two weeks. Ongoing cost: a few dollars a month.

This pattern, an async queue behind a synchronous API, is the single most common use of message queues in production. It pairs well with [retry and circuit breaker patterns](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns) when the downstream is flaky. If the same system grew into fan-out to many independent consumers, Kafka would be the natural next step, exactly as [microservices architectures](/architecture/the-pragmatic-approach-to-microservices) tend to evolve.

## The Short Version

RabbitMQ is the flexible broker. Kafka is the durable log. SQS is the managed default. Each fits different shapes of problem, and the wrong choice will make your life harder for a long time.

Start simple. Pick the managed option unless you have a specific reason to run infrastructure. Write idempotent consumers from day one. Put observability in before you need it. Most of the pain in message-queue systems comes from skipping these basics, not from picking the "wrong" broker.

Want to learn more about the patterns that pair well with message queues? The <a href="https://www.confluent.io/learn/event-driven-architecture/" target="_blank" rel="noopener noreferrer">Confluent EDA guide ↗</a> covers Kafka-centric designs in depth, and our own [event-driven architecture primer](/architecture/understanding-event-driven-architecture) is a good next read if you are designing an async system from scratch.
