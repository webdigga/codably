---
title: "How to Run Effective Engineering Standups"
description: "How to run effective engineering standups that surface blockers, improve coordination, and respect your team's time."
publishDate: "2026-02-11"
author: "jonny-rowse"
category: "collaboration"
tags: ["standups", "agile", "team-management", "collaboration", "engineering-culture"]
featured: false
draft: false
faqs:
  - question: "How long should a standup last?"
    answer: "Aim for 10 to 15 minutes maximum, regardless of team size. If your standup regularly exceeds 15 minutes, you are either discussing too much detail or your team is too large for a single standup. Move detailed discussions to follow-up conversations after the standup ends."
  - question: "Should remote teams do synchronous standups?"
    answer: "Not necessarily. Asynchronous standups using Slack, Teams, or tools like Geekbot work well for distributed teams across time zones. Each person posts their update when their day starts. The key information still gets shared, without forcing anyone into an inconvenient meeting time."
  - question: "What if someone has nothing to report?"
    answer: "That is fine. A brief 'continuing with the same work as yesterday, no blockers' is perfectly acceptable. Standups should not pressure people into inventing something interesting to say. The value is in surfacing blockers and coordination needs, not in filling time."
  - question: "Should standups happen every day?"
    answer: "For most teams, daily standups are valuable during active sprints. But if your team is small, works on independent tasks, and communicates well throughout the day, two or three times per week might be sufficient. The right cadence depends on how much coordination your team needs."
  - question: "Who should attend the standup?"
    answer: "The people doing the work. This typically means developers, QA engineers, and designers actively working on the sprint. Product managers and stakeholders are welcome to listen but should save questions and discussions for after the standup. Large audiences make people self-conscious and lengthen the meeting."
primaryKeyword: "engineering standups"
---

The daily standup is the most frequently held meeting in software development, and arguably the most frequently wasted. Fifteen minutes, every day, multiplied by every team member, adds up to a staggering amount of time over a year. If that time is not producing value, you have a serious problem.

In my experience leading and participating in engineering teams, I have seen standups range from genuinely useful coordination tools to demoralising rituals that nobody enjoys. The good news is that effective standups are not complicated. They just require discipline about what belongs in the meeting and what does not.

## Why Most Standups Fail

### The Status Report Problem

The most common failure mode is the standup that becomes a status report to the team lead or product manager. Each person recites what they did yesterday in detail, the lead nods, and the meeting grinds on for 30 minutes.

This format fails because it optimises for upward reporting rather than team coordination. The developer updating their status is talking to one person. Everyone else is waiting for their turn, mentally checked out.

### The Discussion Trap

Someone mentions a technical challenge, and two developers start debating the solution. Five minutes later, the rest of the team is standing around while two people have a conversation that only involves them.

These discussions are valuable, but they do not belong in the standup. The standup should identify that the discussion needs to happen, then move it to a follow-up after the meeting ends.

### The Guilt Performance

In dysfunctional standups, developers feel pressure to demonstrate productivity. They inflate their updates, describe tasks in unnecessary detail, or avoid admitting they are stuck. This turns the standup into a performance rather than a coordination tool.

If your team members feel judged during standup, the format is working against you.

## What a Good Standup Looks Like

A good standup answers one question: does anyone need help or coordination to make progress today?

Everything else is secondary. What you did yesterday is context for that question, not the point of the meeting. What you plan to do today is useful only insofar as it reveals dependencies or coordination needs.

### The Three Questions (Revised)

The traditional standup format asks: what did you do yesterday, what will you do today, and do you have any blockers? This is a reasonable starting point, but it tends to produce long-winded status updates.

A better framing:

1. **Is anything blocking you?** Start here. If the answer is no, you might not need to say anything else.
2. **Do you need anything from anyone on this team?** This surfaces coordination needs: a code review, a design decision, access to a system, or someone's time for a [pairing session](/collaboration/why-pair-programming-works-and-when-it-doesnt).
3. **Is there anything the team should know?** A deployment planned for this afternoon, a breaking change in a shared library, or a meeting that will take you offline for two hours.

Notice that "what did you do yesterday" is not on this list. If yesterday's work is relevant to a blocker or coordination need, it will come up naturally. If it is not, it does not need to be discussed.

### Walk the Board

Instead of going round the room person by person, walk through your task board (Jira, Linear, Trello, or whatever you use) from right to left. Start with tasks closest to done and work backwards.

This shifts the focus from individual people to the flow of work. You naturally discuss the most important items first (things that are almost finished) and identify bottlenecks (things that have been in progress for too long).

Walking the board also prevents the common problem of someone forgetting to mention a blocked task. If it is on the board and not moving, it gets discussed.

## Standup Format Comparison

| Format | How It Works | Best For | Watch Out For |
|---|---|---|---|
| Round robin | Each person speaks in turn | Small teams (3 to 5), simple projects | Long updates, disengagement while waiting |
| Walk the board | Discuss tickets from right to left | Teams with active sprint boards | Skipping people who do not have a ticket in progress |
| Blocker-first | Only discuss items that need help | Experienced, independent teams | Missing coordination needs that are not blockers |
| Async (Slack/bot) | Written updates in a channel | Remote teams, multiple time zones | Updates become stale or ignored |
| Hybrid | Async most days, sync 1 to 2 times per week | Distributed teams with occasional coordination | Requires discipline to post async updates |

## Practical Improvements

### Time-Box Ruthlessly

Set a visible timer for 15 minutes. When it goes off, the standup is over. Any unfinished discussions move to follow-up conversations.

This creates healthy pressure to be concise. After a few days, your team will naturally adjust their updates to fit the time available.

### Park Discussions Immediately

When a discussion starts to develop, interrupt it politely: "This sounds like it needs a deeper conversation. Can you two chat about it right after standup?" Make this a consistent habit, and people will start self-policing.

Keep a "parking lot" list, either on a whiteboard or in a shared document, for topics that come up during standup but need separate discussion. Review the list at the end and confirm who will handle each item.

### Rotate the Facilitator

Having the same person run every standup creates a dynamic where that person is implicitly the authority figure. Rotating the facilitator role weekly distributes ownership and keeps the format fresh.

The facilitator's job is simple: keep the meeting on track, park discussions, and ensure everyone is heard. It does not require any special authority or preparation.

### Make It Optional for Solo Work Phases

If a developer is deep in a multi-day task with no dependencies on the rest of the team, attending standup every day adds little value for them or the team. Let them skip and post an async update instead. Protecting [deep work time](/productivity/the-developers-guide-to-deep-work) is just as important as maintaining team coordination.

This requires trust, but it respects people's time and signals that the standup serves the team, not the other way around.

<svg viewBox="0 0 650 310" xmlns="http://www.w3.org/2000/svg" aria-label="Pie chart showing typical time allocation in a dysfunctional 30-minute standup versus an effective 12-minute standup.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <rect width="650" height="310" fill="#f8fafc" rx="8"/>
  <text x="325" y="28" text-anchor="middle" font-size="16" font-weight="bold" fill="#334155">Standup Time Allocation</text>
  <!-- Left pie: Dysfunctional -->
  <text x="160" y="58" text-anchor="middle" font-size="13" font-weight="bold" fill="#64748b">Dysfunctional (30 min)</text>
  <!-- Status reports: 60% = 216 degrees, starts at top -->
  <circle cx="160" cy="170" r="80" fill="#ef4444" opacity="0.7"/>
  <!-- Off-topic discussion: 25% -->
  <path d="M160,170 L160,90 A80,80 0 0,1 229,210 Z" fill="#ef4444" opacity="0.7"/>
  <path d="M160,170 L229,210 A80,80 0 0,0 91,210 Z" fill="#f59e0b" opacity="0.7"/>
  <path d="M160,170 L91,210 A80,80 0 0,0 114,97 Z" fill="#64748b" opacity="0.5"/>
  <path d="M160,170 L114,97 A80,80 0 0,0 160,90 Z" fill="#22c55e" opacity="0.7"/>
  <!-- Labels for left -->
  <text x="185" y="145" font-size="9" fill="#ffffff" font-weight="bold">Status</text>
  <text x="185" y="157" font-size="9" fill="#ffffff" font-weight="bold">reports</text>
  <text x="185" y="169" font-size="9" fill="#ffffff">(60%)</text>
  <text x="130" y="215" font-size="8" fill="#ffffff">Discussions</text>
  <text x="95" y="155" font-size="8" fill="#ffffff">Wait</text>
  <text x="138" y="108" font-size="8" fill="#ffffff">Useful</text>
  <text x="138" y="118" font-size="8" fill="#ffffff">(10%)</text>
  <!-- Right pie: Effective -->
  <text x="490" y="58" text-anchor="middle" font-size="13" font-weight="bold" fill="#64748b">Effective (12 min)</text>
  <!-- Blockers + coordination: 50% -->
  <circle cx="490" cy="170" r="80" fill="#22c55e" opacity="0.7"/>
  <path d="M490,170 L490,90 A80,80 0 0,1 490,250 Z" fill="#22c55e" opacity="0.7"/>
  <path d="M490,170 L490,250 A80,80 0 0,0 420,108 Z" fill="#3b82f6" opacity="0.7"/>
  <path d="M490,170 L420,108 A80,80 0 0,0 490,90 Z" fill="#64748b" opacity="0.4"/>
  <!-- Labels for right -->
  <text x="520" y="165" font-size="9" fill="#ffffff" font-weight="bold">Blockers +</text>
  <text x="520" y="177" font-size="9" fill="#ffffff" font-weight="bold">coordination</text>
  <text x="520" y="189" font-size="9" fill="#ffffff">(50%)</text>
  <text x="455" y="200" font-size="8" fill="#ffffff">Team</text>
  <text x="455" y="210" font-size="8" fill="#ffffff">awareness</text>
  <text x="460" y="130" font-size="8" fill="#ffffff">Brief</text>
  <text x="460" y="140" font-size="8" fill="#ffffff">context</text>
  <!-- Footer -->
  <text x="325" y="290" text-anchor="middle" font-size="10" fill="#94a3b8">Effective standups spend the majority of time on blockers and coordination, not status updates</text>
</svg>

## Asynchronous Standups

For distributed teams or teams that value [deep work in the morning](/productivity/the-developers-guide-to-deep-work), asynchronous standups can be more effective than synchronous meetings.

### How Async Standups Work

Each team member posts a brief update in a dedicated Slack or Teams channel at the start of their working day. The update follows the same format as a synchronous standup: blockers, coordination needs, and anything the team should know.

Tools like <a href="https://geekbot.com/" target="_blank" rel="noopener noreferrer">Geekbot ↗</a>, Standup.ly, or a simple Slack reminder can automate the prompt.

### When Async Works Better

Async standups work well when your team spans multiple time zones, when most work is independent, or when your team values uninterrupted morning focus time.

They work poorly when your team has high coordination needs, when blockers require real-time discussion, or when team members do not reliably post their updates.

### A Hybrid Approach

Some teams use async standups most days and hold a synchronous standup once or twice a week. The synchronous meetings focus on coordination and planning, while the async updates handle daily status. This balances the benefits of both approaches. The <a href="https://cloud.google.com/devops/state-of-devops" target="_blank" rel="noopener noreferrer">DORA State of DevOps report ↗</a> consistently highlights that high-performing teams prioritise reducing lead time for changes, and eliminating unnecessary synchronous meetings is one way to do this.

## Anti-Patterns to Avoid

### The 30-Minute Standup

If your standup regularly exceeds 15 minutes, something is wrong. Either your team is too large (split into smaller groups), you are discussing too much detail (park those conversations), or your format encourages long updates (switch to walking the board).

### Standups as Micromanagement

If the standup feels like a progress check from management, it will breed resentment. The meeting should be for the team, run by the team, focused on helping each other. If a manager attends, they should listen, not interrogate.

### Solving Problems in the Standup

The standup identifies problems. It does not solve them. If a developer mentions a blocker, acknowledge it, agree on who will help, and move on. The actual problem-solving happens after the meeting with only the relevant people involved.

### Standup Theatre

If people are crafting elaborate updates to impress rather than sharing honestly, the standup culture is broken. Model the behaviour you want: short updates, honest admissions of being stuck, and genuine offers to help.

## Measuring Standup Effectiveness

How do you know if your standups are working? Look for these signals:

**Positive signals**: blockers are surfaced and resolved quickly, team members proactively offer help, the meeting finishes in under 15 minutes, and people arrive on time because they find the meeting valuable.

**Warning signals**: people dread the meeting, updates are long and detailed, the same blockers persist for days without resolution, and team members multitask during others' updates.

If you see warning signals, discuss it with the team. Ask: "Is this standup helping us? What would make it better?" The team knows what is and is not working. Give them the space to say it. This kind of honest reflection is a hallmark of [good engineering leadership](/career/from-developer-to-tech-lead-what-actually-changes).

## Conclusion

An effective standup is short, focused, and genuinely useful. It surfaces blockers quickly, coordinates work across the team, and respects everyone's time. The best standups feel less like a meeting and more like a brief team huddle before everyone gets back to work.

If your current standups are not achieving this, change them. Try walking the board instead of going round the room. Try async updates instead of a meeting. Try making them optional for people with no coordination needs. The format should serve the team, and if it is not serving your team, it is time to adapt.
