---
title: "How to Use CRM Tags and Custom Fields Effectively"
description: "A practical guide to organising your CRM data with tags and custom fields so you can find, filter, and act on your contacts quickly."
publishDate: "2026-01-31"
dateModified: "2026-02-20"
author: "david-white"
category: "data-reporting"
tags: ["tags", "custom fields", "data organisation"]
featured: false
draft: false
faqs:
  - question: "What is the difference between a tag and a custom field in a CRM?"
    answer: "A tag is a flexible label you attach to a contact for quick grouping and filtering (e.g. VIP, referral, event-attendee). A custom field is a structured data point with a defined type, like a dropdown or date picker, that captures specific information (e.g. contract renewal date, industry, company size). Tags are best for categorisation; custom fields are best for data you need to report on or use in automations."
  - question: "How many tags should I have in my CRM?"
    answer: "There is no magic number, but most small businesses do well with 20 to 50 active tags. The key is consistency and clear naming conventions. If you have hundreds of tags and many of them overlap or are only used on a handful of contacts, it is time for a cleanup."
  - question: "Can I use tags and custom fields together?"
    answer: "Absolutely. They serve different purposes and work best in combination. For example, you might use a custom dropdown field for industry (a fixed set of options) and tags for more fluid labels like interest areas or event attendance. Together, they give you both structured data and flexible categorisation."
primaryKeyword: "CRM tags custom fields"
---

Every CRM lets you store the basics: name, email, phone number, company. But the real power comes from the data you add on top of those defaults. Tags and custom fields are the two main tools for this, and most small businesses either ignore them completely or use them so inconsistently that they become useless.

Getting tags and custom fields right means you can segment your contacts, trigger automations, build accurate reports, and find exactly who you need in seconds. Getting them wrong means a cluttered mess that nobody trusts.

Here is how to use both effectively.

## Tags vs custom fields: what is the difference?

Before setting anything up, you need to understand what each one does and when to reach for it.

**Tags** are flexible labels you stick on a contact. Think of them like sticky notes. A contact can have as many tags as you like, and you can add or remove them freely. Tags are great for grouping contacts in ways that might change over time or that do not fit neatly into a single category.

**Custom fields** are structured data points. They have a defined type (text, dropdown, date, number, checkbox) and usually a single value per contact. Custom fields are ideal for information that follows a predictable format and that you want to filter, sort, or report on reliably.

The distinction matters because choosing the wrong one leads to problems. If you use a tag where you need a custom field, you lose the ability to sort and report on that data. If you use a custom field where a tag would do, you end up with rigid structures that do not flex with your business.

## When to use tags vs custom fields

| Feature | Tags | Custom Fields |
|---|---|---|
| **Best for** | Flexible categorisation | Structured, reportable data |
| **Data type** | Label (text only) | Text, dropdown, date, number, checkbox |
| **Values per contact** | Multiple | Usually one per field |
| **Examples** | VIP, referral, event-attendee, newsletter-subscriber | Industry (dropdown), contract renewal date (date), company size (number) |
| **Searching** | Filter by tag presence | Filter, sort, and compare by value |
| **Reporting** | Basic counts | Charts, averages, comparisons |
| **Automation use** | Trigger workflows based on tag added/removed | Trigger workflows based on field value or change |
| **Risk of misuse** | Tag sprawl and duplicates | Too many unused fields cluttering forms |

A simple rule of thumb: if the information has a fixed set of possible values or needs a specific format (a date, a number, a yes/no), use a custom field. If it is more of a label that helps you group contacts flexibly, use a tag.

## Common tag categories that actually help

Tags work best when they follow a clear structure. Here are categories that most small businesses find useful:

**Lead source:** Where the contact came from. Examples: `referral`, `google-ads`, `website-form`, `networking-event`, `linkedin`. This helps you understand which channels bring in the best leads. You could also use a custom dropdown field for this if your sources are well defined, but tags work well if sources evolve frequently.

**Service type or interest:** What the contact is interested in or has purchased. Examples: `web-design`, `seo`, `branding`, `consulting`. Useful for sending targeted emails and understanding demand.

**Client status:** Where the contact sits in your relationship. Examples: `active-client`, `past-client`, `prospect`, `partner`. Some CRMs handle this with a built-in status field, but tags give you more flexibility.

**Industry or sector:** The contact's business sector. Examples: `healthcare`, `hospitality`, `construction`, `professional-services`. Helpful for tailoring your messaging and identifying patterns in your client base.

**Engagement level:** How actively the contact interacts with you. Examples: `highly-engaged`, `at-risk`, `dormant`. Pair this with your [lead scoring system](/sales-pipeline/lead-scoring-for-small-businesses) to prioritise follow-ups.

**Event or campaign:** Tags tied to specific events or campaigns. Examples: `webinar-jan-2026`, `spring-campaign`, `trade-show-london`. These are temporary by nature and should be reviewed periodically.

## Custom field types and when to use each

Most CRMs offer several field types. Choosing the right one makes data entry faster and reporting more reliable.

| Field Type | Use When | Example |
|---|---|---|
| **Dropdown** | There is a fixed set of options | Industry, lead source, account manager |
| **Text** | The value is freeform and varies widely | Notes, specific requirements, referral name |
| **Date** | You need to track a specific date | Contract renewal, last meeting, follow-up due |
| **Number** | The value is numeric and you want to calculate with it | Company size, annual revenue, deal count |
| **Checkbox** | It is a simple yes or no | Opted into newsletter, has signed NDA, requires accessibility |

**Dropdowns** are your best friend. They prevent inconsistent data entry (no more "Healthcare" vs "healthcare" vs "Health Care") and make filtering and reporting straightforward. Use them wherever the options are predictable.

**Text fields** should be used sparingly for structured data. They are useful for genuinely freeform information, but if you find yourself filtering or reporting on a text field, it probably should have been a dropdown.

**Date fields** are powerful for automations. Set up reminders when a contract renewal date is approaching, or trigger a re-engagement email when the last meeting date is more than 90 days ago.

## Building a tagging convention that scales

The single biggest problem with tags is inconsistency. Without clear rules, you end up with duplicates like `VIP`, `vip`, `V.I.P.`, and `VIP Client` all meaning the same thing. That makes filtering unreliable and creates a mess that grows worse over time.

Here are rules that keep things tidy:

**Use lowercase with hyphens.** Pick one format and stick to it. `active-client` is better than `Active Client` or `ActiveClient`. Lowercase with hyphens is easy to read and eliminates capitalisation confusion.

**Use a prefix for categories.** Group related tags with a consistent prefix: `source-referral`, `source-google-ads`, `industry-healthcare`, `status-active-client`. This keeps your tag list organised and makes it easy to find all tags in a category.

**Never create a tag without checking first.** Before adding a new tag, search your existing tags. The one you need might already exist under a slightly different name.

**Document your tags.** Keep a simple list (even a spreadsheet) of all approved tags, what they mean, and when to use them. Share this with anyone who has access to your CRM.

**Review quarterly.** Tags accumulate. Set a reminder to review your tag list every quarter. Merge duplicates, remove tags that are no longer relevant, and check that your naming convention is being followed. This ties directly into your broader [CRM data cleanup routine](/data-reporting/cleaning-up-your-crm-data-a-practical-guide).

## How tags and custom fields power your CRM

Setting up tags and fields is only useful if you actually do something with them. Here are practical ways they improve your day-to-day operations.

### Segmentation

The most immediate benefit is the ability to slice your contact list in meaningful ways. Want to see all active clients in the healthcare sector who came through referrals? That is a simple filter combining a status tag, an industry tag, and a lead source tag.

Good segmentation means better communication. Instead of blasting the same email to your entire list, you can send targeted messages that actually resonate. For a deeper look at segmentation strategy, see our guide on [how to segment your client database](/data-reporting/how-to-segment-your-client-database).

### Automations

Tags and custom fields are the triggers and conditions that make automations work. Common examples:

- When the tag `new-enquiry` is added, trigger an onboarding email sequence
- When the custom field "contract renewal date" is 30 days away, create a follow-up task for the account manager
- When the tag `at-risk` is added, notify the team lead
- When the dropdown field "lead source" equals `referral`, add a thank-you task for the referring contact

Without clean, consistent data in your tags and fields, these automations either do not fire or fire on the wrong contacts.

### Reporting

Custom fields in particular make reporting far more useful. With a properly maintained "industry" dropdown, you can instantly see which sectors generate the most revenue. With a "lead source" field, you can calculate your cost per acquisition by channel.

Tags feed into reporting too, but they are better for counts and presence checks ("how many contacts have the VIP tag?") rather than comparative analysis.

### Personalisation

Even basic personalisation improves engagement. Using custom fields in email templates ("Hi {first_name}, your contract with us is up for renewal on {renewal_date}") makes communication feel considered rather than generic.

## What happens when tags get out of control

If you have been using your CRM for a while without a tagging convention, you probably already have a problem. Signs that your tags need attention:

- You have more than 100 tags and half of them are used on fewer than five contacts
- Multiple tags exist for the same concept (duplicates with different spellings or formats)
- Nobody on your team knows what some tags mean
- You avoid using tags because the list is overwhelming
- Tag-based reports give you inconsistent results

### How to clean up messy tags

**Step 1: Export your tag list.** Most CRMs let you export a list of all tags with contact counts. Get this into a spreadsheet.

**Step 2: Group and merge.** Identify tags that mean the same thing and merge them into a single, properly named tag. Delete the duplicates.

**Step 3: Remove dead tags.** Tags with zero or very few contacts that are no longer relevant should be deleted. If a tag is not helping you segment, filter, or automate, it is just noise.

**Step 4: Establish your convention.** Using the guidelines above, define your naming rules and categories. Rename any surviving tags that do not fit the convention.

**Step 5: Communicate and enforce.** Share the new convention with your team. If your CRM allows it, restrict who can create new tags. A single point of control prevents the problem from recurring.

This cleanup is best done as part of a broader [data quality review](/data-reporting/cleaning-up-your-crm-data-a-practical-guide), where you also address duplicates, missing fields, and stale pipeline entries.

## A practical setup to start with

If you are building your tag and custom field structure from scratch, here is a sensible starting point for a small business:

**Custom fields:**
- Industry (dropdown)
- Lead source (dropdown)
- Account manager (dropdown)
- Contract start date (date)
- Contract renewal date (date)
- Company size (number)
- Opted into marketing (checkbox)

**Tags:**
- `status-active-client`
- `status-past-client`
- `status-prospect`
- `status-partner`
- `engagement-high`
- `engagement-at-risk`
- `engagement-dormant`
- `service-[your service names]`

Start small. You can always add more tags and fields as your needs evolve. It is far easier to expand a clean, well-structured system than to untangle a chaotic one.

## Keep it clean, keep it useful

Tags and custom fields are simple tools, but they underpin everything your CRM does beyond basic contact storage. Clean, consistent data in your tags and fields means better segmentation, more reliable automations, accurate reports, and faster day-to-day operations.

The effort you put into setting up a proper convention and maintaining it pays off every time you search for a contact, send a campaign, or pull a report. Treat your tags and fields as infrastructure, not an afterthought, and your CRM will work significantly harder for you.
