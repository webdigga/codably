---
title: "Why Time Zones Break Your Code (and How to Fix It)"
description: "British Summer Time starts today. If your code stores local times, you probably have a bug. Here is how to handle time zones properly."
publishDate: "2026-03-29"
author: "david-white"
category: "backend"
tags: ["time zones", "dates", "UTC", "javascript", "daylight saving", "backend"]
featured: false
draft: false
faqs:
  - question: "Should I store dates as UTC in the database even if all my users are in one time zone?"
    answer: "Yes. Storing UTC is a safe default regardless of your current user base. Business requirements change, and retrofitting UTC storage onto a codebase that assumed a single time zone is painful. UTC also eliminates ambiguity during DST transitions, where the same local time can occur twice. The cost of storing UTC from the start is negligible; the cost of migrating later is not."
  - question: "Is the JavaScript Date object good enough for handling time zones?"
    answer: "For simple use cases like displaying the current time in the user's local zone, the built-in Date object works. For anything involving arithmetic across time zones, recurring events, or DST-aware scheduling, it falls short. Libraries like date-fns, Luxon, or the upcoming Temporal API provide the tools you need. The built-in Date object has no concept of a named time zone, which is a fundamental limitation."
  - question: "How do I test my code for daylight saving time bugs?"
    answer: "Write tests that explicitly set the time zone using environment variables (TZ=Europe/London) or library-level overrides. Create test cases around known DST boundaries: the last Sunday of March and the last Sunday of October for the UK, or the second Sunday of March and the first Sunday of November for the US. Test both the spring forward case (where an hour is skipped) and the fall back case (where an hour repeats)."
  - question: "What is the Temporal API and should I use it now?"
    answer: "Temporal is a proposed addition to JavaScript that replaces the Date object with a modern, time-zone-aware API. It includes types like ZonedDateTime, PlainDate, and Duration that handle the cases where Date falls short. Browser support is still emerging, so for production code you should use a polyfill or stick with a library like Luxon. It is worth learning the API now, as it represents the future of date handling in JavaScript."
primaryKeyword: "time zones in code"
---

British Summer Time begins today, 29 March 2026. At 1:00am, clocks across the UK jump forward to 2:00am. That missing hour is not just an inconvenience for anyone who forgot to update a wall clock. It is a source of real bugs in production systems, from scheduled jobs that fire twice to bookings that land in the wrong slot.

Time zones are one of those problems that seem simple until you actually try to handle them properly. Most developers learn this the hard way. This article covers why time zones break code, which bugs appear most often, and how to write systems that handle dates and times correctly.

## Why Time Zones Are Harder Than You Think

A common misconception is that a time zone is just a fixed offset from UTC. London is UTC+0, New York is UTC-5, Tokyo is UTC+9. If that were the whole story, time zones would be straightforward arithmetic.

The reality is messier. Offsets change throughout the year because of daylight saving time. They also change permanently when governments decide to alter their time zone rules, something that happens more often than you might expect.

| Location | Winter offset | Summer offset | When clocks change |
|----------|--------------|---------------|-------------------|
| London | UTC+0 (GMT) | UTC+1 (BST) | Last Sunday of March and October |
| New York | UTC-5 (EST) | UTC-4 (EDT) | Second Sunday of March, first Sunday of November |
| Sydney | UTC+11 (AEDT) | UTC+10 (AEST) | First Sunday of April and October |
| Tokyo | UTC+9 (JST) | UTC+9 (JST) | No daylight saving |
| Kathmandu | UTC+5:45 | UTC+5:45 | No daylight saving |

Notice that Kathmandu's offset is not even a whole hour. Some zones use 30 or 45 minute offsets. The rules governing when DST starts and ends vary by country, and they change over time. Morocco has altered its DST rules multiple times in the past decade. The <a href="https://www.iana.org/time-zones" target="_blank" rel="noopener noreferrer">IANA Time Zone Database ↗</a>, the authoritative source for these rules, is updated several times a year to keep up.

This is why hard-coding offsets is a mistake. Your code needs to reference named time zones (like `Europe/London` or `America/New_York`) and let a library resolve the correct offset for any given moment.

## The Five Most Common Time Zone Bugs

### 1. Storing Local Time in Your Database

This is the most widespread and most damaging time zone bug. If you store `2026-03-29 09:00:00` without any indication of which time zone that refers to, the value is ambiguous. Is it 9:00am in London? New York? Tokyo?

When BST begins today, a timestamp stored as local UK time becomes one hour ahead of where it was yesterday relative to UTC. Any system that assumed a fixed relationship between stored times and UTC is now producing wrong results.

The fix is to store all timestamps in UTC. Convert to the user's local time only when displaying it. Your [database migrations](/backend/database-migrations-without-the-fear) should enforce this from the start.

### 2. Assuming UTC Offsets Are Fixed

Code like this looks reasonable:

```javascript
const londonOffset = 0; // UTC+0
const userTime = utcTime + londonOffset;
```

It works for six months of the year and silently breaks for the other six. London is UTC+0 only during GMT. From today until October, it is UTC+1. If your code treats offsets as constants, every DST transition introduces an hour of error.

### 3. Ignoring the "Lost Hour" During DST Transitions

When clocks spring forward, one hour of local time does not exist. At 1:00am BST today, the next valid time was 2:00am. If a user tries to schedule something for 1:30am on 29 March 2026 in the `Europe/London` zone, that time is invalid.

<svg viewBox="0 0 600 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Diagram showing the BST clock transition on 29 March 2026, where 1:00am jumps directly to 2:00am, creating a lost hour">
  <style>
    text { font-family: system-ui, sans-serif; font-size: 14px; fill: currentColor; }
    .tz-label { font-size: 11px; opacity: 0.7; }
    .tz-title { font-size: 15px; font-weight: bold; }
    .tz-gap { font-size: 12px; font-weight: 600; }
  </style>
  <text x="300" y="22" text-anchor="middle" class="tz-title">BST Transition: 29 March 2026</text>
  <line x1="60" y1="90" x2="540" y2="90" stroke="currentColor" stroke-width="2"/>
  <line x1="100" y1="80" x2="100" y2="100" stroke="currentColor" stroke-width="2"/>
  <text x="100" y="120" text-anchor="middle">00:00</text>
  <text x="100" y="136" text-anchor="middle" class="tz-label">GMT</text>
  <line x1="200" y1="80" x2="200" y2="100" stroke="currentColor" stroke-width="2"/>
  <text x="200" y="120" text-anchor="middle">01:00</text>
  <text x="200" y="136" text-anchor="middle" class="tz-label">GMT</text>
  <rect x="200" y="75" width="100" height="30" fill="#ec4899" opacity="0.15" rx="4"/>
  <text x="250" y="68" text-anchor="middle" class="tz-gap" fill="#ec4899">Lost hour</text>
  <path d="M 205 60 C 220 30 280 30 295 60" fill="none" stroke="#ec4899" stroke-width="2"/>
  <polygon points="292,53 298,62 290,58" fill="#ec4899"/>
  <line x1="300" y1="80" x2="300" y2="100" stroke="currentColor" stroke-width="2"/>
  <text x="300" y="120" text-anchor="middle">02:00</text>
  <text x="300" y="136" text-anchor="middle" class="tz-label">BST</text>
  <line x1="400" y1="80" x2="400" y2="100" stroke="currentColor" stroke-width="2"/>
  <text x="400" y="120" text-anchor="middle">03:00</text>
  <text x="400" y="136" text-anchor="middle" class="tz-label">BST</text>
  <line x1="500" y1="80" x2="500" y2="100" stroke="currentColor" stroke-width="2"/>
  <text x="500" y="120" text-anchor="middle">04:00</text>
  <text x="500" y="136" text-anchor="middle" class="tz-label">BST</text>
  <text x="100" y="158" text-anchor="middle" class="tz-label">UTC 00:00</text>
  <text x="200" y="158" text-anchor="middle" class="tz-label">UTC 01:00</text>
  <text x="300" y="158" text-anchor="middle" class="tz-label">UTC 01:00</text>
  <text x="400" y="158" text-anchor="middle" class="tz-label">UTC 02:00</text>
  <text x="500" y="158" text-anchor="middle" class="tz-label">UTC 03:00</text>
</svg>

Conversely, when clocks fall back in October, 1:00am to 1:59am happens twice. If you store a local time of 1:30am on that day, you cannot tell which occurrence the user meant without additional context.

Good [error handling](/code-quality/effective-error-handling-patterns-for-cleaner-code) should catch these cases explicitly rather than silently choosing a default.

### 4. Comparing Timestamps Across Different Zones

Comparing two timestamps is only meaningful if they are in the same time zone, or if both are in UTC. Comparing `2026-03-29 14:00 Europe/London` with `2026-03-29 14:00 America/New_York` as if they are the same moment is a five-hour error.

This bug commonly appears in [APIs](/backend/api-design-principles-every-developer-should-know) that accept date parameters from clients without specifying the expected format. If your API accepts `2026-03-29T14:00:00` without a timezone designator, you are relying on the client and server to agree on what that means. They often do not.

Always require ISO 8601 format with an explicit offset or the `Z` suffix for UTC: `2026-03-29T14:00:00Z` or `2026-03-29T14:00:00+01:00`.

### 5. Displaying Times Without Knowing the User's Zone

Showing "Meeting at 14:00" without specifying the time zone assumes everyone reading it is in the same zone. In a distributed team, that assumption breaks immediately.

Use the browser's `Intl.DateTimeFormat` API to format dates in the user's local time zone automatically. If you need to display a specific zone, always show the zone name or abbreviation alongside the time.

## How to Handle Time Zones Properly

### Store UTC, Always

Every timestamp in your database should be UTC. PostgreSQL's `TIMESTAMPTZ` type and MySQL's `TIMESTAMP` type both store UTC internally. Use them. If you are working with a system that stores naive datetimes, convert to UTC before writing and document this convention clearly.

This is the single most important rule. If you get this right, most other time zone problems become manageable.

### Convert at the Boundary

UTC goes in, UTC comes out. The only place you should convert to a local time zone is at the edges of your system: when displaying to a user, or when accepting input from a user who is thinking in local time.

```javascript
// Server: store UTC
const meetingTime = new Date('2026-03-29T14:00:00Z');

// Client: display in user's local zone
const formatted = meetingTime.toLocaleString('en-GB', {
  timeZone: 'Europe/London',
  dateStyle: 'long',
  timeStyle: 'short',
});
// "29 March 2026 at 15:00" (BST = UTC+1)
```

This pattern keeps your backend simple and pushes time zone complexity to the presentation layer, where it belongs. The same principle applies to [building resilient APIs](/backend/building-resilient-apis-with-retry-and-circuit-breaker-patterns): keep the core logic clean and handle edge cases at the boundaries.

### Use a Proper Date Library

The built-in JavaScript `Date` object has no concept of named time zones. It knows about the host machine's local zone and UTC, and that is it. For anything more, you need a library.

<a href="https://date-fns.org/" target="_blank" rel="noopener noreferrer">date-fns ↗</a> is excellent for date arithmetic and formatting with a modular, tree-shakeable API. <a href="https://moment.github.io/luxon/" target="_blank" rel="noopener noreferrer">Luxon ↗</a> provides first-class time zone support through its `DateTime` type. Both are mature and well-maintained.

The <a href="https://tc39.es/proposal-temporal/docs/" target="_blank" rel="noopener noreferrer">Temporal API ↗</a> is a proposed native replacement for `Date` that solves these problems at the language level. It introduces types like `Temporal.ZonedDateTime` and `Temporal.PlainDate` that make time zone handling explicit. Browser support is still landing, but the API is stable enough to learn now.

If you care about [type safety](/code-quality/typescript-patterns-that-make-your-code-safer), Temporal's distinct types for zoned and plain date-times prevent an entire class of bugs at compile time.

### Test with DST Edge Cases

Most time zone bugs only surface twice a year, when clocks change. That makes them easy to miss in testing. Write explicit test cases for:

- The exact moment clocks spring forward (today: `2026-03-29T01:00:00 Europe/London`)
- The exact moment clocks fall back (`2026-10-25T02:00:00 Europe/London`)
- Times that fall in the "lost hour" during spring forward
- Times that fall in the "repeated hour" during fall back
- Dates with no DST change (like Tokyo) to ensure your logic handles both cases

Set the `TZ` environment variable in your test runner to control the zone:

```bash
TZ=Europe/London node --test my-date-tests.js
```

This is the kind of [debugging strategy](/code-quality/debugging-strategies-that-actually-save-you-time) that catches problems before your users do.

## A Practical Checklist

Use this as a reference when reviewing code that handles dates and times.

- All timestamps stored in the database are UTC
- Named time zones (e.g. `Europe/London`) are used instead of fixed offsets
- API date parameters require ISO 8601 with explicit offset or Z suffix
- User-facing times are converted to local time at the display layer only
- DST transitions are tested explicitly in the test suite
- Scheduling logic handles the lost hour (spring) and repeated hour (autumn)
- The IANA time zone database is kept up to date (check your OS and library versions)

Time zones are one of those areas where a small amount of discipline at the start saves a large amount of pain later. Store UTC. Convert at the boundary. Test the edges. The clocks changed today; make sure your code can handle it.
