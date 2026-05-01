---
title: "Service Level Objectives: A Developer's Guide to SLOs and Error Budgets"
description: "A practical guide to setting and tracking SLOs: pick meaningful SLIs, calculate error budgets, alert on burn rate, and avoid the metrics that mislead teams."
publishDate: "2026-05-01"
author: "jonny-rowse"
category: "devops"
tags: ["slo", "sli", "error-budget", "reliability", "observability", "devops", "sre"]
featured: false
draft: false
faqs:
  - question: "What is the difference between an SLI, an SLO, and an SLA?"
    answer: "An SLI (Service Level Indicator) is a measurement, for example the percentage of requests that returned 200 in under 300 ms. An SLO (Service Level Objective) is a target on that indicator, for example 99.9% over 28 days. An SLA (Service Level Agreement) is a commercial contract with consequences if the SLO is missed. Most internal teams only need SLIs and SLOs; SLAs become relevant when money or contracts are on the line."
  - question: "How many nines should I aim for?"
    answer: "Pick the lowest number of nines your users will tolerate, then add a small buffer. 99.9% (43 minutes of downtime per month) is a sensible default for a typical web product. 99.99% is rarely worth the engineering cost unless you are running infrastructure other companies depend on. Going from 99.9% to 99.99% usually means roughly ten times the operational effort for a tenth of the failure budget."
  - question: "What is an error budget and how do I use it?"
    answer: "An error budget is the amount of unreliability your SLO permits, expressed as time or as a percentage of requests. A 99.9% SLO over 30 days gives you 43 minutes 12 seconds of error budget. While you have budget, ship features. When the budget is exhausted, freeze risky work until reliability recovers. The budget is the bridge between product velocity and engineering reliability."
  - question: "Should I alert on every SLO breach?"
    answer: "No. Alert on burn rate, not on absolute breaches. A page should fire when the error budget is being consumed fast enough that you will run out before the next review window. Google's SRE workbook recommends multi-window, multi-burn-rate alerts: a fast burn (2% of monthly budget in an hour) wakes you up; a slow burn (10% of monthly budget in six hours) opens a ticket."
  - question: "Where should I host SLO calculations?"
    answer: "Wherever your time-series metrics already live. Prometheus with recording rules works well for self-hosted stacks. Grafana Cloud, Datadog, Honeycomb, and New Relic all ship native SLO products. The OpenSLO spec lets you define SLOs in YAML and translate them to whichever backend you use. Avoid spreadsheets; SLOs that are not automatically calculated will quietly drift out of date."
primaryKeyword: "service level objectives"
---

Your status page says 99.95% uptime for the quarter. Customer support says checkout has been intermittently broken for a week. Both statements are true at once, and that is the gap an SLO closes.

Service Level Objectives turn "the site feels reliable" into a number that engineers, product managers, and the on-call rotation can argue about with shared evidence. They are not glamorous, and they are easy to get wrong. This is the practical version of the practice: what to measure, what to ignore, and how to keep an SLO programme alive past the launch all-hands.

## SLI, SLO, SLA: The Three Words That Are Not Interchangeable

The vocabulary trips up nearly every team starting out. Get this straight first.

| Term | What it is | Example |
|------|-----------|---------|
| SLI | A measurement of one specific aspect of service quality | Percentage of homepage requests that returned 200 in under 300 ms |
| SLO | A target on an SLI, evaluated over a window | 99.9% of those requests, measured over a rolling 28 days |
| SLA | A contract with consequences if the SLO is missed | 10% credit if monthly availability drops below 99.5% |

Most internal teams only need the first two. SLAs are a commercial concern; SLOs are an engineering one. The <a href="https://sre.google/sre-book/service-level-objectives/" target="_blank" rel="noopener noreferrer">Google SRE book chapter on SLOs ↗</a> remains the cleanest treatment of the distinction, and it is worth a read before you write your first one.

This is the layer that sits underneath the broader question of [observability vs monitoring](/devops/observability-vs-monitoring-what-developers-need-to-know): observability gives you the raw signals, SLOs give you the agreement on which signals matter.

## Pick SLIs That Reflect User Pain

A bad SLI measures the system. A good SLI measures the user's experience of the system.

Bad SLI: "CPU usage stays under 80%."
Good SLI: "99% of checkout submissions return a 2xx response within 800 ms."

The second is harder to wire up because it requires you to define what counts as a checkout, what the latency budget is, and which response codes count as success. That difficulty is the point. The conversation forces a team to agree on what the product is supposed to do.

A few principles that tend to hold:

- **Measure at the edge users feel.** A 50 ms backend response is no consolation if the CDN takes another 4 seconds.
- **Use ratios, not raw counts.** "99.9% of requests succeed" survives a traffic spike. "Fewer than 100 errors per minute" does not.
- **Favour latency percentiles over averages.** P99 latency tells you what your slowest users experience. The mean tells you almost nothing.
- **Keep the list short.** Three to five SLIs per service is plenty. More than that and nobody remembers what each one means.

## How Error Budgets Actually Work

The error budget is the SLO's product-management twin. If your SLO is 99.9% availability over 30 days, your budget is 0.1%, which converts to:

<svg viewBox="0 0 720 220" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing error budget conversion: 99.9% SLO over 30 days equals 43 minutes 12 seconds of allowed downtime, broken down by request volume" style="width:100%;height:auto;background:#fff;border:1px solid #e5e7eb;border-radius:8px;">
  <rect x="20" y="40" width="200" height="140" rx="8" fill="#fdf2f8" stroke="#ec4899" stroke-width="1.5"/>
  <text x="120" y="70" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#111">SLO</text>
  <text x="120" y="110" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#ec4899">99.9%</text>
  <text x="120" y="140" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#475569">over 30 days</text>
  <line x1="220" y1="110" x2="290" y2="110" stroke="#475569" stroke-width="2" marker-end="url(#arrow1)"/>
  <rect x="290" y="40" width="200" height="140" rx="8" fill="#eef2ff" stroke="#6366f1" stroke-width="1.5"/>
  <text x="390" y="70" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#111">Error budget</text>
  <text x="390" y="110" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#6366f1">43 min 12 s</text>
  <text x="390" y="140" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#475569">of allowed badness</text>
  <line x1="490" y1="110" x2="560" y2="110" stroke="#475569" stroke-width="2" marker-end="url(#arrow1)"/>
  <rect x="560" y="40" width="140" height="140" rx="8" fill="#dcfce7" stroke="#16a34a" stroke-width="1.5"/>
  <text x="630" y="70" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="600" fill="#111">At 10M req/mo</text>
  <text x="630" y="110" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="700" fill="#16a34a">10,000</text>
  <text x="630" y="140" text-anchor="middle" font-family="Inter, sans-serif" font-size="12" fill="#475569">failed requests</text>
  <defs><marker id="arrow1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#475569"/></marker></defs>
</svg>

The contract is simple: while the budget is intact, ship features. When it runs out, stop shipping anything risky and pay down the reliability debt that consumed the budget. That trade-off is what turns reliability from a vague aspiration into an operating policy that product managers can plan around.

The mistake I see most often is treating the budget as a goal of zero. If you are not consuming any error budget, you are over-engineering. A team that lands a quarter at 99.999% on a 99.9% SLO has spent engineering time on reliability that nobody asked for. Spend the budget on velocity, then refill it when it is gone.

## A Worked Example: Defining an SLO for a Checkout API

Take a checkout endpoint that processes 50 requests per second at peak. The product team agrees that:

1. A failed checkout costs roughly 30 GBP in abandoned baskets.
2. Latency over 1 second causes a measurable abandonment spike.
3. The team can absorb 30 minutes of complete outage per month before customer support escalates.

Translate that into SLIs and SLOs:

```yaml
# OpenSLO-style definition
- sli: checkout-availability
  metric_source: prometheus
  good_query: |
    sum(rate(http_requests_total{
      service="checkout",
      status=~"2.."
    }[5m]))
  total_query: |
    sum(rate(http_requests_total{
      service="checkout"
    }[5m]))
  objective: 99.95          # ~22 min budget per 30 days
  window: 30d

- sli: checkout-latency
  metric_source: prometheus
  good_query: |
    sum(rate(http_request_duration_seconds_bucket{
      service="checkout",
      le="1.0"
    }[5m]))
  total_query: |
    sum(rate(http_request_duration_seconds_count{
      service="checkout"
    }[5m]))
  objective: 99.0
  window: 30d
```

Two SLIs, two SLOs, one service. The availability target is tight because failed checkouts cost real money; the latency target is looser because slow checkouts merely annoy users. The numbers reflect a product judgement, not an engineering preference. <a href="https://www.openslo.com/" target="_blank" rel="noopener noreferrer">OpenSLO ↗</a> gives you a vendor-neutral way to express this in YAML, and tools like the <a href="https://github.com/google/slo-generator" target="_blank" rel="noopener noreferrer">slo-generator project ↗</a> can translate it into Prometheus rules, Datadog monitors, or whatever your stack uses.

## Burn Rate Alerting Beats Threshold Alerting

A naive alert fires when "error rate is above 0.1%". That alert wakes you up at 02:00 for a transient blip and stays silent through a slow degradation that consumes 80% of your monthly budget over a fortnight.

Burn rate is the rate at which you are consuming the budget. A burn rate of 1 means you will exhaust the budget exactly at the end of the window. A burn rate of 14.4 means you will exhaust a 30-day budget in 50 hours.

The pattern from the <a href="https://sre.google/workbook/implementing-slos/" target="_blank" rel="noopener noreferrer">Google SRE Workbook chapter on implementing SLOs ↗</a> is multi-window, multi-burn-rate alerting:

| Severity | Burn rate | Short window | Long window | Budget consumed when fired |
|----------|-----------|--------------|-------------|----------------------------|
| Page | 14.4 | 5 min | 1 h | 2% in 1 hour |
| Page | 6 | 30 min | 6 h | 5% in 6 hours |
| Ticket | 1 | 6 h | 3 days | 10% over 3 days |

This catches both the dramatic outage and the slow leak. It also stops your pager from screaming at every transient spike. <a href="https://prometheus.io/docs/practices/alerting/" target="_blank" rel="noopener noreferrer">Prometheus has good guidance ↗</a> on encoding these as alert rules, and <a href="https://docs.honeycomb.io/notify/alert/slos/" target="_blank" rel="noopener noreferrer">Honeycomb's SLO docs ↗</a> show how the same idea looks in a managed product.

## The SLOs That Quietly Mislead

Five anti-patterns I have seen consume more time than they save:

**Aggregate SLOs that hide tenant pain.** A 99.9% SLO across all customers can disguise a single enterprise tenant getting 95% availability. Slice by tenant or by region for any service with meaningfully different traffic patterns.

**SLOs measured from inside the cluster.** If your synthetic check runs in the same VPC as the service, you are not measuring what users see. Run probes from outside the network, the way <a href="https://opentelemetry.io/" target="_blank" rel="noopener noreferrer">OpenTelemetry ↗</a> collectors deployed at the edge are designed to do.

**SLOs on dependencies you do not control.** "99.99% checkout availability" sounds great until you realise Stripe's posted SLA is 99.95%. Your SLO cannot exceed the floor set by your dependencies. List them out and pick a target that respects the chain.

**SLOs without owners.** An SLO with no named owner is a metric, not a commitment. The owner approves changes to the target, runs the monthly review, and signs off when reliability work is needed.

**Set-and-forget SLOs.** A target set on launch day rarely matches reality six months later. Review SLOs every quarter and adjust based on what the data is showing, what users have complained about, and what the team can actually sustain.

This last point connects to a broader pattern in [pragmatic microservices work](/architecture/the-pragmatic-approach-to-microservices): the discipline is not in the initial design, it is in the upkeep. SLOs that are not maintained drift into theatre.

## How SLOs Plug Into the Wider Stack

SLOs do not exist in isolation. They lean on:

- **Solid logging and metrics.** Without trustworthy time-series data, your SLI is a guess. The basics of [structured logging](/backend/the-developers-guide-to-logging) come first.
- **A deployment pipeline that can roll back.** When the budget burns, you need to revert quickly. The patterns in [deployment strategies like blue-green and canary](/devops/deployment-strategies-blue-green-canary-rolling-updates) keep blast radius small.
- **Feature flags for risky launches.** A [feature flag system](/devops/feature-flags-a-practical-introduction) lets you turn off the cause of a burn without a deploy.
- **Resilience patterns at the API layer.** Retries, timeouts, and circuit breakers reduce how often a downstream blip becomes an SLO breach. See the [retry and circuit breaker patterns post](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns) for the implementation detail.

If your team is missing any of these, write them down as the prerequisites and tackle them before you formalise SLOs. An SLO sitting on top of broken telemetry is a liability.

## A Realistic First-Quarter Plan

The smallest defensible SLO programme:

1. **Week 1.** Pick one service. Pick two SLIs (availability and latency). Pick objectives based on a quick look at the last 90 days of data, rounded down.
2. **Week 2.** Wire up the recording rules in Prometheus or the equivalent in your provider. Verify the SLI calculation is right by spot-checking a handful of incidents.
3. **Week 3.** Add a single multi-burn-rate alert per SLO. Page on the fast burn, ticket on the slow burn. Resist the urge to add five more alerts.
4. **Week 4.** Hold a 30-minute review with product and engineering. Agree what happens when the budget burns and who decides.
5. **Month 2.** Repeat for the second service. Do not try to roll out SLOs across twelve services in a single sprint; the review discipline is the bottleneck, not the YAML.
6. **Month 3.** First quarterly review. Adjust objectives based on actual data. Retire any SLI that has not influenced a decision.

If the programme survives the first quarterly review, it will survive most things. If it does not, the issue is almost always that the SLOs were not used to make decisions, so nobody owned them.

## What Good Looks Like a Year In

A team running SLOs well looks boring from the outside. Pages are rare and almost always actionable. Product planning explicitly accounts for reliability budget. Postmortems reference the budget consumed alongside the customer impact. Nobody argues about whether the system is "reliable enough"; they argue about whether the right number is 99.9 or 99.95, which is a much better argument to be having.

The <a href="https://www.atlassian.com/incident-management/kpis/sla-vs-slo-vs-sli" target="_blank" rel="noopener noreferrer">Atlassian incident management guide ↗</a> is a reasonable second read once you have the basics. <a href="https://grafana.com/docs/grafana-cloud/alerting-and-irm/slo/" target="_blank" rel="noopener noreferrer">Grafana Cloud's SLO documentation ↗</a> is worth skimming even if you do not use Grafana, because the product UI shows what a mature SLO workflow looks like in practice.

Start small. Pick one service, two SLIs, and one alert. Run it for a quarter. Most of the value is not in the dashboard, it is in the conversation the dashboard forces between the people who build the service and the people who depend on it.
