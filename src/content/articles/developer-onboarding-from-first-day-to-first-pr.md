---
title: "Developer Onboarding: From First Day to First PR in Under a Week"
description: "A practical developer onboarding playbook: get a new engineer from first day to first merged PR in under a week, without skipping the steps that matter."
publishDate: "2026-04-28"
author: "gareth-clubb"
category: "workflows"
tags: ["onboarding", "workflows", "team-building", "developer-experience", "productivity"]
featured: false
draft: false
faqs:
  - question: "How long should developer onboarding realistically take?"
    answer: "Aim for a merged pull request in the first week and meaningful contribution to the team's roadmap by the end of the first month. Full productivity, defined as designing and shipping features without close supervision, usually takes three to six months depending on codebase complexity. The widely cited '90 days to ramp up' figure is a ceiling, not a target. If your average new hire is still pairing on every task at month four, the bottleneck is usually missing documentation or environment setup pain, not the individual."
  - question: "What is the single biggest blocker to a fast first PR?"
    answer: "Local environment setup. In every team I have worked with, the gap between 'laptop arrived' and 'tests pass locally' is the largest variable in time-to-first-PR. Teams that automate this with a single setup script, a devcontainer, or a cloud development environment see new hires open a PR two to three days faster than teams that hand over a wiki page of manual steps."
  - question: "Should a new developer's first PR be a real change or a throwaway?"
    answer: "A real change, but a small one. A typo fix in user-facing copy, a flaky test stabilisation, or a low-risk dependency bump all qualify. The point is that the new hire experiences the full workflow: branch, commit, push, open PR, address review, merge, deploy. A throwaway 'hello world' PR teaches none of that."
  - question: "Who should own developer onboarding, the manager or the team?"
    answer: "Both, with different responsibilities. The manager owns the schedule, expectations, and the first month's growth plan. The team, usually through an assigned onboarding buddy, owns the day-to-day: pairing sessions, codebase walkthroughs, and being the default person to ask questions. If you only assign one of these roles, onboarding fails in predictable ways."
  - question: "How do you measure whether onboarding is working?"
    answer: "Track three metrics per hire: days to first merged PR, days to first independently shipped feature, and a 30-day pulse survey on documentation quality. The first two reveal process bottlenecks; the survey surfaces tribal knowledge gaps. Review these quarterly. If time-to-first-PR is creeping up, your setup automation has probably rotted."
primaryKeyword: "developer onboarding"
---

Six months ago I joined a team where my first pull request was merged on day four. The PR fixed a one-line bug in a date formatter. It was trivial. It was also the most useful onboarding artefact I have ever produced, because it forced the team to expose every gap in their setup, review, and deploy process before I touched anything that mattered.

Most engineering teams talk about developer onboarding in vague terms: "ramp up", "get up to speed", "shadow the team". That language hides the fact that onboarding is a measurable workflow with a clear failure mode. If your new hire cannot open a pull request in the first week, the problem is almost never the new hire.

This is the playbook I now use to get developers from first day to first merged PR in under five working days.

## The Cost of Slow Onboarding

The <a href="https://survey.stackoverflow.co/2024/" target="_blank" rel="noopener noreferrer">2024 Stack Overflow Developer Survey ↗</a> found that 60% of professional developers cite a "bad development environment" as a leading source of daily frustration. That frustration starts on day one and rarely recovers if the first week goes badly.

Slow onboarding is expensive in three ways:

1. **Salary burn while idle.** A developer waiting on AWS access for a fortnight costs the same as one shipping features.
2. **Retention risk.** First impressions of an engineering culture are formed in week one. People who feel set up to fail start updating their CV in month two.
3. **Knowledge tax on the team.** Every unclear setup step becomes a Slack message that interrupts someone else's flow.

The benchmark I use: if time-to-first-PR averages over seven working days across your last five hires, fix the process before you hire the sixth.

## The Five-Day Plan

This is not a script to follow line by line. It is the rough shape of a working week.

| Day | Goal | Owner |
|-----|------|-------|
| Day 1 | Hardware, accounts, repository cloned, build runs | IT + onboarding buddy |
| Day 2 | Tests pass locally, codebase tour, ticket assigned | Onboarding buddy |
| Day 3 | First commit pushed, PR opened (draft) | New hire + buddy |
| Day 4 | PR reviewed, addressed, merged | Reviewer |
| Day 5 | Deployed change observed in production, retrospective | Buddy + manager |

Every day has one clear goal. Miss the goal and you stop and fix the cause before moving on. Slipping a day is a signal, not a failure.

### Day 1: Remove Friction Before They Arrive

The work for day one happens before the new hire walks in. Pre-arrival checklist:

- Laptop imaged and shipped two working days early.
- All accounts (email, source control, CI, monitoring, password manager, chat) provisioned and added to a checklist they receive on arrival.
- A dedicated onboarding buddy assigned and told they will lose roughly six hours of their own work that week.
- A first ticket selected and labelled `good-first-issue`. Real, small, low-risk.

If the new hire spends day one filing IT tickets to get GitHub access, you have already lost the week.

### Day 2: One Command to Rule Them All

The single highest-leverage investment in onboarding is a working setup script. Whether you use a devcontainer, a `Makefile`, a Nix flake, or a cloud development environment like GitHub Codespaces, the contract is the same:

```bash
./scripts/setup.sh
```

After that command exits cleanly, the new hire should have:

- Dependencies installed at the correct versions.
- A working local database with seed data.
- Environment variables populated from a template.
- The full test suite passing.

For a deeper look at making this repeatable, see [how to automate your development environment](/workflows/how-to-automate-your-development-environment) and [managing dotfiles like a pro](/tools-tech/managing-dotfiles-like-a-pro). Both cover the boring tooling work that pays back tenfold during onboarding.

### Day 3: The Draft PR

By mid-morning on day three, the new hire should push a branch and open a draft pull request. Drafts matter. They signal "I want feedback on direction, not approval to merge", which removes the social cost of opening early.

The buddy's job here is not to write the code. It is to:

- Answer questions about repo conventions.
- Point at the right helper or test pattern.
- Resist the urge to take the keyboard.

Pair programming for the first hour helps. The technique of "you drive, I navigate" is well established in mentoring practice; we cover when it works and when it does not in [why pair programming works and when it doesn't](/collaboration/why-pair-programming-works-and-when-it-doesnt).

### Day 4: Review, Address, Merge

A PR that sits in review for three days kills the momentum of the entire week. Set a team-level commitment: a new hire's first PR gets reviewed within four hours of being marked ready.

Reviews should be generous in tone and specific in feedback. "This works" is fine. "Nit: we usually name these helpers with a verb, like `formatDate`, but it is not blocking" teaches a convention without slowing the merge. For more on calibrating tone, see [code reviews that don't waste time](/collaboration/code-reviews-that-dont-waste-time).

Merge before the end of day four. If the PR has uncovered a deeper architectural question, ship the small fix and file a separate issue for the bigger conversation.

### Day 5: Watch It Ship and Reflect

The new hire watches their change move through CI, deploy, and into production. They learn the deploy tool, the dashboards, and the rollback procedure in the context of their own code, which is the only context that sticks.

End the week with a 30-minute retrospective with the buddy and manager. Three questions:

1. What slowed you down that should not have?
2. Where was the documentation wrong, missing, or misleading?
3. What surprised you, good or bad?

Treat the answers as bugs in the onboarding process and fix them before the next hire.

## What This Looks Like in Practice

Across the last four teams I have helped onboard for, the pattern that delivers under-a-week first PRs is not heroic. It is a small set of investments that compound:

- A setup script maintained as carefully as production code, with its own CI job that runs weekly on a clean image.
- An onboarding buddy with explicit time allocation, not a volunteer squeezing it between tasks.
- A `good-first-issue` queue kept stocked at all times, never depleted.
- A documented "first week" Notion or Confluence page updated after every retrospective.

The <a href="https://handbook.gitlab.com/handbook/engineering/development/principles/" target="_blank" rel="noopener noreferrer">GitLab engineering handbook ↗</a> is the canonical public example of this approach. The whole document is open, updated continuously, and treated as the source of truth for new joiners. You do not need to be GitLab to copy the discipline.

## Common Failure Modes

Three patterns kill onboarding more than any others.

**The "throw them at production" approach.** Giving a new hire ownership of an incident in week one is sometimes framed as immersive learning. In practice, it produces panic and bad decisions. New hires should shadow incidents in the first month, not lead them.

**The "let them read the wiki" approach.** Asking a new joiner to spend a week reading documentation produces zero artefacts and tells you nothing about whether they can actually contribute. Documentation is reference material; you only retain what you use.

**The "we're too busy to onboard properly" approach.** Skipping the buddy, the setup script, and the retrospective costs more in lost productivity over the next quarter than the time you "saved" in week one. The compounding interest works against you.

The <a href="https://dora.dev/research/" target="_blank" rel="noopener noreferrer">DORA research programme ↗</a> on high-performing engineering organisations consistently finds that fast feedback loops, including for new hires, predict overall delivery performance. Onboarding is not separate from delivery; it is delivery with a smaller batch size.

## Where to Start if Your Onboarding Is Broken

Pick one thing. Do not try to rebuild the whole process at once.

If your time-to-first-PR is over two weeks, fix the setup script first. Nothing else moves the number as much.

If you have no setup script but a fast review culture, start with `good-first-issue` tagging and a written first-week plan.

If you have all the mechanics but new hires still feel lost, the gap is usually social. Assign a real buddy with real time, not a Slack channel labelled `#new-joiners`.

Onboarding is the part of the engineering workflow you experience least often per person but most often as a team. Investing in it is investing in everyone you will ever hire.

If you are about to make your first hire and want to pressure-test your wider workflow first, start with [git workflows that scale with your team](/workflows/git-workflows-that-scale-with-your-team) and audit whether a brand new joiner could follow it on day one without asking a single question.
