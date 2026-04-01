---
title: "How to Run a Developer Retrospective That Actually Drives Change"
description: "Learn how to run developer retrospectives that lead to real improvements. Practical formats, facilitation tips, and follow-through strategies for Q2."
publishDate: "2026-04-01"
author: "gareth-clubb"
category: "collaboration"
tags: ["retrospectives", "agile", "team-improvement", "collaboration", "Q2-planning"]
featured: false
draft: false
faqs:
  - question: "How often should we run developer retrospectives?"
    answer: "Most teams benefit from fortnightly or end-of-sprint retrospectives. Running them too infrequently means issues pile up and details get forgotten. Running them weekly can cause fatigue. The sweet spot for most teams is every two to three weeks, aligned with your sprint cadence if you use one."
  - question: "What if team members do not speak up in retrospectives?"
    answer: "Start with silent writing phases so everyone contributes before discussion begins. Use anonymous input tools if needed. Rotate facilitation so one person is not always driving the conversation. Most importantly, demonstrate that feedback leads to real change. People stop contributing when they believe nothing will happen."
  - question: "Should remote teams run retrospectives differently?"
    answer: "The principles are the same, but the mechanics need adjusting. Use collaborative tools like Miro, FigJam, or a shared document for async input. Build in extra silent writing time. Be more deliberate about turn-taking since visual cues are harder to read on video. Consider async pre-work followed by a shorter live discussion."
  - question: "How long should a developer retrospective take?"
    answer: "Sixty to ninety minutes works well for most teams. Shorter than sixty minutes rarely allows enough depth. Longer than ninety minutes leads to fatigue and diminishing returns. If you consistently need more time, your team may be too large for a single retrospective, so consider splitting into smaller groups."
  - question: "What is the difference between a retrospective and a post-mortem?"
    answer: "A retrospective is a regular, recurring reflection on how the team is working. A post-mortem (or incident review) is triggered by a specific event, usually an outage or major bug. Retrospectives focus on continuous improvement of processes and collaboration. Post-mortems focus on understanding what went wrong in a particular incident and preventing recurrence."
primaryKeyword: "developer retrospective"
---

## Q2 Has Arrived. Time to Reflect on Q1

The start of a new quarter is one of the best natural checkpoints for engineering teams. Q1 is done, the work is shipped (or not), and there is a brief window before Q2 priorities take over completely.

If your team ran retrospectives in Q1, now is the time to ask whether they actually changed anything. If your team did not run them at all, this is the perfect moment to start. Either way, the question is the same: how do you run a retrospective that leads to genuine improvement rather than a list of sticky notes that nobody looks at again?

Having facilitated hundreds of retrospectives across teams of all sizes, I have seen what works, what fails, and what separates teams that continuously improve from teams that just go through the motions.

## Why Most Retrospectives Fail

Before diving into formats and techniques, it is worth understanding why so many retrospectives produce nothing useful.

**No follow-through.** This is the biggest killer. Teams surface great insights, agree on action items, and then nothing happens. By the next retrospective, nobody remembers what was agreed. The team learns that retrospectives are performative, and engagement drops.

**Same format every time.** "What went well? What did not go well? What should we change?" is fine for your first few retrospectives. After six months of the same three columns, people disengage. The format becomes a rut rather than a tool.

**Dominated by one or two voices.** Without deliberate facilitation, the most confident or senior people in the room will do most of the talking. Quieter team members, who often have the most valuable observations, stay silent.

**Too abstract.** "We should communicate better" is not an action item. It is a wish. Retrospectives that stay at the level of vague sentiment never produce change because there is nothing concrete to act on.

**Blame culture.** If people feel they will be judged or punished for raising problems, they will not raise them. The retrospective becomes a polite fiction where everyone says things are fine.

## The Three Phases Every Retrospective Needs

Regardless of the specific format you choose, effective retrospectives follow three phases.

### Phase 1: Gather Data

Before anyone starts discussing what should change, the team needs a shared understanding of what actually happened. This sounds obvious, but teams routinely skip it and jump straight to opinions.

Good data gathering includes:

- **Timeline of events.** What shipped? What did not? What surprises came up?
- **Metrics.** Cycle time, deployment frequency, bug counts, PR review times. Numbers ground the conversation in reality rather than feelings
- **Individual reflections.** Silent writing time where everyone captures their own observations before group discussion begins

The silent writing phase is critical. Research consistently shows that groups generate better ideas when individuals think independently before sharing. It also prevents anchoring, where the first person to speak sets the frame for everyone else.

### Phase 2: Generate Insights

This is where the team moves from "what happened" to "why it happened" and "what does it mean." The goal is to find patterns, root causes, and systemic issues rather than surface-level symptoms.

Good facilitation questions for this phase:

- "We have three sticky notes about deployments being slow. What do they have in common?"
- "This is the third sprint in a row where we underestimated backend work. What is driving that?"
- "We keep saying code reviews take too long. Where specifically does the bottleneck sit?"

This is also where [your code review process](/collaboration/how-to-write-code-reviews-that-actually-improve-code) and [standup effectiveness](/collaboration/how-to-run-effective-engineering-standups) often come up. If the same topics surface repeatedly, that is a signal that previous action items were not followed through.

### Phase 3: Decide and Commit

The final phase is about turning insights into a small number of concrete, assignable actions. The key word is small.

**Limit action items to two or three per retrospective.** Teams that leave with ten action items complete none of them. Teams that leave with two complete both. This is counterintuitive because it feels like you are ignoring important issues. You are not. You are choosing to fix two things properly rather than ten things not at all.

Each action item should have:

- **A specific description.** Not "improve testing" but "add integration tests for the payment flow by end of sprint 8"
- **An owner.** One person responsible for making it happen or escalating if they cannot
- **A deadline.** When will this be done, and when will we check on it?

## Four Formats Worth Trying

If your team has been running the same retrospective format for months, switching it up can re-energise participation. Here are four formats I have seen work well.

### Start, Stop, Continue

Simple and direct. Each team member writes items in three columns:

- **Start:** Things the team should begin doing
- **Stop:** Things the team should stop doing
- **Continue:** Things that are working and should keep going

This format works well for teams new to retrospectives because the categories are intuitive. The "Continue" column is particularly valuable because it reinforces good practices rather than only focusing on problems.

### The 4Ls: Liked, Learned, Lacked, Longed For

A broader format that captures positive experiences alongside gaps:

- **Liked:** What did you enjoy or appreciate?
- **Learned:** What did you learn, including from mistakes?
- **Lacked:** What was missing or insufficient?
- **Longed For:** What do you wish you had?

The "Learned" column is powerful because it reframes mistakes as learning opportunities. The "Longed For" column often surfaces systemic issues like tooling gaps or process bottlenecks.

### Sailboat

A visual metaphor that works especially well for teams that respond to spatial thinking:

<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Sailboat retrospective format diagram showing four quadrants: Wind (what propels us), Anchor (what holds us back), Rocks (risks ahead), and Island (our goal)">
  <rect width="700" height="320" fill="#f0f9ff" rx="12"/>
  <line x1="350" y1="20" x2="350" y2="300" stroke="#94a3b8" stroke-width="1" stroke-dasharray="6,4"/>
  <line x1="20" y1="160" x2="680" y2="160" stroke="#94a3b8" stroke-width="1" stroke-dasharray="6,4"/>
  <text x="175" y="50" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0369a1">Wind</text>
  <text x="175" y="72" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">What propels us forward</text>
  <text x="175" y="90" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="24">💨</text>
  <text x="525" y="50" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0369a1">Island</text>
  <text x="525" y="72" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">Where we want to get to</text>
  <text x="525" y="90" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="24">🏝️</text>
  <text x="175" y="200" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0369a1">Anchor</text>
  <text x="175" y="222" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">What holds us back</text>
  <text x="175" y="240" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="24">⚓</text>
  <text x="525" y="200" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="16" font-weight="700" fill="#0369a1">Rocks</text>
  <text x="525" y="222" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="12" fill="#64748b">Risks and obstacles ahead</text>
  <text x="525" y="240" text-anchor="middle" font-family="Inter, system-ui, sans-serif" font-size="24">🪨</text>
</svg>

The sailboat has four elements:

- **Wind:** What is pushing the team forward? What is going well?
- **Anchor:** What is holding the team back? What is slowing progress?
- **Rocks:** What risks or obstacles do you see ahead?
- **Island:** What is the team's goal or ideal destination?

The "Rocks" quadrant is particularly useful at the start of Q2 because it encourages forward-looking thinking rather than only reflecting on the past. This is also a good time to revisit [technical debt decisions](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) and whether any are becoming blockers.

### Mad, Sad, Glad

An emotionally direct format that gives people permission to express frustration:

- **Mad:** What frustrated or angered you?
- **Sad:** What disappointed you or made you feel let down?
- **Glad:** What made you happy or proud?

This format works well when there is tension in the team that needs to be surfaced safely. The emotional framing makes it easier for people to share honestly rather than filtering everything through professional detachment.

## Facilitation Tips That Make the Difference

The format matters far less than how the retrospective is facilitated. Here are the practices that separate good retrospectives from time-wasting ones.

### Rotate the Facilitator

When the same person (usually the tech lead or engineering manager) facilitates every retrospective, the dynamic becomes predictable. Rotating facilitation gives different team members ownership, brings fresh perspectives, and develops [leadership skills across the team](/career/from-developer-to-tech-lead-what-actually-changes).

### Enforce Silent Writing

Start every phase with two to three minutes of silent writing. This is non-negotiable. People who skip this step and go straight to open discussion will always get worse results. Silent writing ensures every voice is captured, not just the loudest ones.

### Dot Vote to Prioritise

When you have twenty sticky notes on the board, the team needs a way to decide what matters most. Give each person three votes (dots, ticks, or emoji reactions in a digital tool) to place on the items they think are most important. This prevents the discussion from being hijacked by the most vocal person's pet issue.

### Time-Box Ruthlessly

Set a timer for each phase and stick to it. Without time-boxing, teams spend forty-five minutes on data gathering and rush through action items in the last five minutes. A typical split for a sixty-minute retrospective:

| Phase | Time | Purpose |
|-------|------|---------|
| Check-in | 5 min | Set the tone, confirm the agenda |
| Gather data | 15 min | Silent writing + brief sharing |
| Generate insights | 20 min | Group discussion, find patterns |
| Decide and commit | 15 min | Define 2-3 action items with owners |
| Close | 5 min | Summarise actions, feedback on the session |

### Create Safety

People will only share honest feedback if they feel safe doing so. This means:

- The retrospective is a blame-free zone. Focus on systems and processes, not individuals
- What is said in the retrospective stays in the retrospective (unless the team agrees otherwise)
- Leaders speak last so they do not anchor the discussion
- Follow through on action items so people see that their input matters

## The Follow-Through System That Actually Works

The single most important thing you can do to make retrospectives effective is to follow through on action items. Here is a simple system that works.

**1. Record action items immediately.** At the end of the retrospective, write action items into your team's task tracker (Jira, Linear, GitHub Issues, wherever your work lives). Do not leave them on a whiteboard or in a Miro board that nobody will reopen.

**2. Review last retrospective's actions first.** Start every retrospective by reviewing the action items from the previous one. Did they get done? If not, why not? This creates accountability and signals that the team takes follow-through seriously.

**3. Make actions visible.** Add retrospective action items to your [standup](/collaboration/how-to-run-effective-engineering-standups) board or sprint backlog. They should be treated as real work, not an afterthought.

**4. Celebrate completed actions.** When an action item leads to a genuine improvement, call it out. "Remember when we said PR reviews were taking too long? We introduced the review rota two sprints ago and average review time has dropped from three days to one." This reinforces the value of the process and encourages future participation.

## A Q2 Retrospective Template

Since we are at the start of Q2, here is a focused template for a quarterly retrospective that looks both backward and forward.

**Part 1: Q1 Review (20 minutes)**

- What were our Q1 goals? Did we hit them?
- What was our biggest win? What made it possible?
- What was our biggest miss? What caused it?
- What did we learn that we did not expect?

**Part 2: Process Health Check (20 minutes)**

Rate each area from 1 (needs urgent attention) to 5 (working brilliantly):

- Code review speed and quality
- Deployment confidence
- Test coverage and reliability
- [Context switching](/productivity/the-real-cost-of-context-switching) and focus time
- Communication within the team
- Communication with stakeholders

Discuss the lowest-rated areas. What specific changes would move them up by one point?

**Part 3: Q2 Forward Look (20 minutes)**

- What are our Q2 goals? Are they clear and realistic?
- What [technical debt](/code-quality/technical-debt-when-to-fix-it-and-when-to-leave-it) needs addressing this quarter?
- What risks do we see? What can we do about them now?
- What do we need from leadership or other teams?

This template ties nicely into any [spring cleaning](/code-quality/spring-cleaning-your-codebase-a-practical-checklist) work your team has planned for Q2.

## Common Mistakes to Avoid

**Skipping the retrospective when things are going well.** Teams that only retrospect after failures miss the chance to understand and reinforce what is making them successful. Run retrospectives regardless of how the sprint went.

**Inviting too many people.** Retrospectives work best with the core team, typically five to eight people. Larger groups require breakout sessions or a different format entirely.

**Letting it become a status update.** The retrospective is not a standup or a sprint review. It is about how the team works, not what the team delivered. If people start listing completed tickets, redirect the conversation.

**Ignoring the elephant in the room.** If everyone knows there is a problem but nobody is saying it, the facilitator needs to create space for it. Techniques like anonymous pre-surveys or the "elephant in the room" exercise can help surface difficult topics.

## Getting Started

If your team has never run a retrospective, start simple:

1. Book sixty minutes with the team
2. Use the Start, Stop, Continue format
3. Enforce silent writing for each column (three minutes each)
4. Dot vote to pick the top three items for discussion
5. Leave the last fifteen minutes for defining two concrete action items
6. Record the actions in your task tracker immediately
7. Review them at the start of the next retrospective

The Atlassian Team Playbook has a solid <a href="https://www.atlassian.com/team-playbook/plays/retrospective" target="_blank" rel="noopener noreferrer">retrospective guide ↗</a> worth reading if you want more structured exercises. For a deeper dive into retrospective facilitation, Esther Derby and Diana Larsen's <a href="https://pragprog.com/titles/dlret/agile-retrospectives/" target="_blank" rel="noopener noreferrer">Agile Retrospectives: Making Good Teams Great ↗</a> remains the definitive reference.

The format you choose matters far less than your commitment to following through. Pick a format, run the session, complete two action items, and review them next time. That simple loop, repeated consistently, is what transforms retrospectives from a calendar obligation into a genuine engine of improvement.
