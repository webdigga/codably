---
title: "From Developer to Tech Lead: What Actually Changes"
description: "Transitioning from developer to tech lead changes more than your title. Learn what shifts in responsibility, mindset, and daily work."
publishDate: "2026-03-02"
author: "david-white"
category: "career"
tags: ["tech-lead", "career-growth", "engineering-leadership", "management", "team-leadership"]
featured: false
draft: false
faqs:
  - question: "What does a tech lead actually do?"
    answer: "A tech lead is responsible for the technical direction of a team or project. This includes making architectural decisions, unblocking team members, setting technical standards, coordinating with product and other teams, and ensuring the team delivers quality software. The balance between coding and leading varies by organisation, but the focus shifts from individual output to team output."
  - question: "Should a tech lead still write code?"
    answer: "Yes, but less than before and with different priorities. Tech leads should stay hands-on enough to understand the codebase and make informed decisions, but should avoid being on the critical path for feature delivery. Good tasks for a tech lead include prototyping solutions, tackling complex bugs, writing foundational code, and reviewing pull requests."
  - question: "How do you manage former peers as a tech lead?"
    answer: "Be transparent about the transition and acknowledge it is awkward. Continue to treat former peers with respect and seek their input on decisions. Avoid suddenly becoming directive or pulling rank. Build authority through competence and good judgement rather than positional power. The relationship changes, but it does not need to become adversarial."
  - question: "What is the biggest mistake new tech leads make?"
    answer: "Trying to write all the important code themselves. New tech leads often struggle to delegate because they feel responsible for code quality and are faster than their team members at certain tasks. This creates a bottleneck, prevents others from growing, and leaves no time for the leadership work that is now their primary responsibility."
  - question: "Is tech lead a step toward engineering management?"
    answer: "It can be, but it does not have to be. Some tech leads move into engineering management. Others return to individual contributor roles. Many organisations have a staff engineer or principal engineer track that provides career progression without people management. The tech lead role is valuable in its own right, not just as a stepping stone."
primaryKeyword: "developer to tech lead"
---

## The Promotion Nobody Prepares You For

You have been writing great code for years. You solve hard problems. Your pull requests are clean. Your system designs are solid. Then someone taps you on the shoulder and says, "We would like you to be the tech lead."

You say yes, because it feels like the natural next step. And then you discover that most of what made you effective as an individual contributor is not what makes you effective in this new role.

The transition from developer to tech lead is one of the most difficult career shifts in software engineering, not because it requires learning new technologies, but because it requires unlearning habits that served you well as a developer. I have made this transition myself and coached others through it, and the pattern is remarkably consistent.

## What Actually Changes

### Your Definition of Productivity

As a developer, you measure a good day by what you shipped: features built, bugs fixed, pull requests merged. The feedback loop is tight and satisfying.

As a tech lead, your most productive days often have no tangible output you can point to. You spent an hour helping a junior developer debug a problem they would have spent a day on alone. You had three conversations that aligned the team on an approach, preventing a week of wasted work. You reviewed a design document and caught an issue that would have caused a production incident.

None of these produce a commit. All of them produce more value than any code you could have written in the same time. Internalising this takes longer than you expect.

| Activity | Developer Perspective | Tech Lead Perspective |
|---|---|---|
| Helping a teammate debug | Taking time away from my work | Multiplying team output |
| Alignment meetings | Interrupting my flow | Preventing wasted effort |
| Design reviews | Someone else's problem | Catching expensive mistakes early |
| One-to-one conversations | Nice but not "real" work | Core leadership responsibility |
| Writing documentation | Boring chore | Scaling knowledge across the team |

### Your Relationship With Code

You will write less code. This is not optional; it is necessary. If you try to maintain your previous coding velocity while taking on leadership responsibilities, both will suffer.

More importantly, the code you write should change character. Avoid taking on critical-path feature work that will block the team if you get pulled into meetings or leadership tasks. Instead, focus on:

- **Prototypes and spikes** that explore solutions for the team to build on
- **Foundational work** like setting up frameworks, defining patterns, or creating shared utilities
- **Complex debugging** where your system-level understanding adds unique value
- **Code reviews** where you can teach and ensure quality simultaneously

Some tech leads find it helpful to think of themselves as having "interruptible" coding time. You work on things that can be paused without consequence. For guidance on making your code review practice effective in this new role, see [code reviews that don't waste time](/collaboration/code-reviews-that-dont-waste-time).

### Your Communication Volume

As a developer, you could spend most of the day in focused work with occasional collaboration. As a tech lead, communication is the work. You are the conduit between your team and the rest of the organisation.

On any given day, you might:

- Discuss requirements with a product manager to clarify edge cases
- Align with another team's tech lead on an API contract
- Explain a technical constraint to a stakeholder who wants a feature delivered faster
- Help a team member think through a design problem
- Provide a status update to your engineering manager
- Facilitate a technical discussion where the team disagrees on an approach

This communication load is why protecting some coding time is so difficult. The demands on your attention are constant and often urgent. Our article on [the developer's guide to deep work](/productivity/the-developers-guide-to-deep-work) has practical strategies for carving out focus time, which becomes even more critical in a leadership role.

<svg viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" aria-label="Stacked bar chart comparing how a developer and a tech lead typically spend their working day, showing that tech leads spend significantly more time on communication, mentoring, and coordination, and less time writing code.">
  <style>
    text { font-family: 'Inter', system-ui, sans-serif; }
  </style>
  <!-- Title -->
  <text x="300" y="22" text-anchor="middle" font-size="15" font-weight="600" fill="#334155">How the Day Changes: Developer vs Tech Lead</text>
  <!-- Y-axis labels -->
  <text x="115" y="95" text-anchor="end" font-size="13" fill="#334155" font-weight="500">Developer</text>
  <text x="115" y="175" text-anchor="end" font-size="13" fill="#334155" font-weight="500">Tech Lead</text>
  <!-- Developer bar -->
  <!-- Coding: 55% -->
  <rect x="125" y="72" width="231" height="36" rx="4" fill="#3b82f6" />
  <text x="240" y="95" text-anchor="middle" font-size="11" fill="#ffffff">Coding (55%)</text>
  <!-- Reviews: 15% -->
  <rect x="356" y="72" width="63" height="36" rx="0" fill="#8b5cf6" />
  <text x="387" y="95" text-anchor="middle" font-size="9" fill="#ffffff">Reviews</text>
  <!-- Meetings: 15% -->
  <rect x="419" y="72" width="63" height="36" rx="0" fill="#f59e0b" />
  <text x="450" y="95" text-anchor="middle" font-size="9" fill="#ffffff">Meetings</text>
  <!-- Other: 15% -->
  <rect x="482" y="72" width="63" height="36" rx="4" fill="#64748b" />
  <text x="513" y="95" text-anchor="middle" font-size="9" fill="#ffffff">Other</text>
  <!-- Tech Lead bar -->
  <!-- Coding: 20% -->
  <rect x="125" y="152" width="84" height="36" rx="4" fill="#3b82f6" />
  <text x="167" y="175" text-anchor="middle" font-size="10" fill="#ffffff">Code (20%)</text>
  <!-- Reviews: 15% -->
  <rect x="209" y="152" width="63" height="36" rx="0" fill="#8b5cf6" />
  <text x="240" y="175" text-anchor="middle" font-size="9" fill="#ffffff">Reviews</text>
  <!-- Communication: 30% -->
  <rect x="272" y="152" width="126" height="36" rx="0" fill="#f59e0b" />
  <text x="335" y="175" text-anchor="middle" font-size="10" fill="#ffffff">Communication (30%)</text>
  <!-- Mentoring: 15% -->
  <rect x="398" y="152" width="63" height="36" rx="0" fill="#22c55e" />
  <text x="429" y="175" text-anchor="middle" font-size="9" fill="#ffffff">Mentoring</text>
  <!-- Planning: 20% -->
  <rect x="461" y="152" width="84" height="36" rx="4" fill="#ef4444" />
  <text x="503" y="175" text-anchor="middle" font-size="10" fill="#ffffff">Planning (20%)</text>
  <!-- Legend -->
  <rect x="125" y="220" width="12" height="12" rx="2" fill="#3b82f6" />
  <text x="143" y="231" font-size="10" fill="#334155">Coding</text>
  <rect x="200" y="220" width="12" height="12" rx="2" fill="#8b5cf6" />
  <text x="218" y="231" font-size="10" fill="#334155">Reviews</text>
  <rect x="275" y="220" width="12" height="12" rx="2" fill="#f59e0b" />
  <text x="293" y="231" font-size="10" fill="#334155">Communication</text>
  <rect x="390" y="220" width="12" height="12" rx="2" fill="#22c55e" />
  <text x="408" y="231" font-size="10" fill="#334155">Mentoring</text>
  <rect x="475" y="220" width="12" height="12" rx="2" fill="#ef4444" />
  <text x="493" y="231" font-size="10" fill="#334155">Planning</text>
</svg>

## The Hardest Lessons

### Letting Go of Perfectionism

When you were an individual contributor, you could ensure the code met your standards because you wrote it yourself. As a tech lead, you need to accept that others will make different decisions than you would. Sometimes worse decisions. Sometimes better ones.

Your job is not to make every line of code perfect. It is to set standards, provide guidance, and trust your team to execute. If someone's approach is different from yours but equally valid, let it go. Save your influence for the decisions that genuinely matter: architectural choices, security practices, and patterns that will affect the team for months or years.

Correcting every minor style choice or design preference is micromanagement, even if it comes from a place of caring about quality. Automating style enforcement through [linters and formatters](/code-quality/automating-code-quality-with-linters-and-formatters) removes this source of friction entirely.

### Delegation Is Not Laziness

New tech leads often struggle to delegate, especially tasks they could complete faster themselves. "It would take me two hours, but it will take them a full day. I should just do it."

This logic is self-defeating for three reasons:

1. **You do not have two hours.** Your time is now split across many responsibilities. The two hours you spend coding are two hours you are not spending on leadership work.
2. **They need to learn.** If you always take the hard tasks, your team never grows. The day it takes them now becomes two hours next time. But only if you let them do it.
3. **It does not scale.** There is one of you and many of them. Even if you are faster at individual tasks, the team's total output is higher when everyone is working at their level.

Delegate deliberately. Give people tasks that stretch them. Provide enough context for them to succeed and enough autonomy for them to learn. Our article on [how to mentor junior developers effectively](/career/how-to-mentor-junior-developers-effectively) covers the practical techniques for doing this well.

### Your Emotions Affect the Team

As an individual contributor, having a bad day meant you were less productive. As a tech lead, having a bad day can affect the entire team's morale and output.

If you express frustration about a decision, your team will absorb that frustration. If you seem stressed about a deadline, your team will feel that stress amplified. If you dismiss someone's idea carelessly, they may stop contributing ideas.

This does not mean suppressing all emotion. It means being deliberate about what you project. Calm confidence during a crisis, genuine enthusiasm about good work, and measured concern (rather than panic) about problems all create an environment where the team can do their best work.

### You Will Make Mistakes

As a developer, your mistakes are usually contained. A bug in your code affects a feature. As a tech lead, your mistakes can affect the whole team. A poor architectural decision can cost weeks. A badly handled conflict can damage relationships. An unclear communication can send people in the wrong direction.

Accept that you will make mistakes. The question is not how to avoid them entirely, but how to catch them early, learn from them, and build the trust that survives them. The <a href="https://lethain.com/elegant-puzzle/" target="_blank" rel="noopener noreferrer">"An Elegant Puzzle" by Will Larson ↗</a> is an excellent resource for navigating these leadership challenges.

## Practical Advice for the First 90 Days

### Week One: Listen

Resist the urge to change things immediately. Even if you were on the team before, the view is different from this seat. Talk to each team member individually. Understand what they find frustrating, what they think is working well, and what they would change.

### Weeks Two to Four: Establish Your Rhythms

Set up the recurring interactions that will form the backbone of your leadership:

- **Regular one-to-ones** with each team member (even if you are not their manager, these conversations are valuable)
- **A weekly team sync** that is useful, not performative. For ideas on making this effective, see [how to run effective engineering standups](/collaboration/how-to-run-effective-engineering-standups)
- **Recurring check-ins** with your product counterpart and your manager
- **A block of protected time** for your own deep work

### Weeks Four to Eight: Make Small Improvements

Based on what you learned, make two or three small improvements to the team's processes or tooling. Quick wins build credibility and demonstrate that you are listening. Avoid large-scale changes until you have deeper context.

### Weeks Eight to Twelve: Define the Technical Vision

Work with your team to articulate where the system should be heading. This does not need to be a grand strategy document. A clear, shared understanding of the next two or three major technical goals is enough. This gives the team direction and helps prioritise the inevitable tradeoff decisions.

| Phase | Focus | Key Actions |
|---|---|---|
| Week 1 | Listen and observe | One-to-ones with every team member |
| Weeks 2-4 | Establish rhythms | Set up recurring meetings and check-ins |
| Weeks 4-8 | Quick wins | 2-3 small process or tooling improvements |
| Weeks 8-12 | Technical vision | Define the next 2-3 major technical goals with the team |

## Taking Care of Yourself

The tech lead role can be draining. You are responsible for outcomes but often lack direct control. You absorb stress from both your team and your management. You may feel guilty about not coding enough or not leading enough, never quite satisfying either role fully.

Build support networks. Talk to other tech leads who understand the challenges. <a href="https://leaddev.com/" target="_blank" rel="noopener noreferrer">LeadDev ↗</a> is an excellent community and resource for engineering leaders at all levels. Be honest with your manager about what you need. Protect your non-work time fiercely, because the demands of the role will expand to fill every available hour if you let them.

The transition is hard. But the ability to amplify a team's effectiveness, to help people grow, and to shape the technical direction of a product is deeply rewarding work. It just takes time to feel that way. For context on the mindset shifts that prepare you for this role, our article on [the senior developer mindset](/career/the-senior-developer-mindset) covers the foundational thinking that underpins effective technical leadership.
