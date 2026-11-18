# Text-thread extraction spec (setter SMS and ManyChat DMs)

One input file = one lead's full message history with the business, in time order,
plus what happened next (Calendly bookings, closer EOC outcomes, payments).

Use the controlled vocabularies verbatim. When nothing fits, use `other` and say why in `note`.

## Input (`data/<offer>/raw/threads/<lead_id>.json`)

- `messages[]`: `t` (UTC timestamp), `dir` (`out` = business, `in` = lead), `by` (sender on the business side), `text`.
- `calendly[]`: bookings this lead made (event, start, booked_at, status, canceled_by, rescheduled).
- `eoc[]`: closer End-of-Call reports (outcome, payment type). `paid`: dollars collected.
- `lead_created`, `status`, `opt_source`.

## Output: `data/<offer>/threads/<lead_id>.json`

```jsonc
{
  "lead_id": "...",
  "channel": "sms|manychat",
  "thread_type": "<vocab>",                     // the main purpose of the conversation
  "first_touch": { "by": "business|lead", "minutes_after_lead_created": 12, "template_like": true },
  "business_messages": 7, "lead_messages": 3,
  "first_reply_after_n_business_messages": 2,   // null if the lead never replied
  "lead_engaged": true,                         // lead replied with substance, not just "ok"/"stop"
  "stage_reached": "<stage vocab>",             // furthest stage the conversation got to
  "drop_off": {
    "who_went_silent": "lead|business|none",
    "after_message": "short paraphrase of the last message before silence",
    "after_step": "<step vocab>",
    "hours_unanswered": 72
  },
  "booking_link_sent": true,
  "price_discussed": false,
  "price_quote": "exact words or null",
  "objections": [ { "type": "<objection vocab>", "quote": "lead's words" } ],
  "lead_sentiment": "positive|neutral|negative|mixed",
  "setter_quality": { "personalised": true, "asked_questions": true, "followed_script": "hit|partial|miss|not_applicable", "note": "" },
  "outcome": { "booked": true, "showed": true, "closed": false },   // from calendly/eoc/paid, not guessed
  "flags": [ { "category": "<flag vocab>", "severity": "critical|high|medium|low", "summary": "...", "evidence": ["exact quote"] } ],
  "note": "one sentence a manager could act on"
}
```

## Vocabularies

`thread_type`: `speed_to_lead` (first outreach to a new lead) · `qualification` (setter asking discovery questions by text) · `booking_logistics` (times, links, confirmations) · `reminder` (pre-call reminders) · `no_show_recovery` · `reschedule` · `closer_followup` (closer chasing after a call) · `payment_or_onboarding` · `client_support` (already a client) · `reengagement` (old lead revived) · `opt_out` · `wrong_number_or_spam` · `other`

`stage_reached` (furthest point): `no_reply` · `replied` · `conversation` (real back-and-forth) · `qualified` (problem and fit discussed) · `call_offered` · `booked` · `showed` · `closed`

`after_step` (where silence happened): `first_outreach` · `follow_up_nudge` · `discovery_question` · `call_offer` · `booking_link` · `price_or_investment` · `confirmation_or_reminder` · `post_call_followup` · `payment_link` · `other`

`objections[].type`: `price_budget` · `financing_denied` · `fear_uncertain` · `spouse_partner` · `think_about_it` · `skepticism_trust` · `timing` · `burned_in_past` · `has_solution_or_no_value` · `not_interested` · `other`

`flags[].category`: `pricing_deviation` · `outcome_promise` · `conduct` (pushy, rude, guilt-tripping, impersonation) · `compliance` (texting after STOP, no opt-out respected, sensitive data by text) · `mis_selling` · `missed_lead` (lead asked a question or asked to book and nobody answered) · `data_integrity` · `wellbeing_risk`

## Rules

- `outcome` comes from the `calendly`, `eoc` and `paid` fields only. Never infer a booking from chat text alone; if the chat says booked but there's no Calendly record, set `booked: false` and add a `data_integrity` flag.
- `showed` = an EOC exists whose outcome is not No Show / Cancelled / Reschedule.
- `closed` = an EOC with outcome Closed and payment type other than Deposit, or `paid` > 0.
- Quote exactly in `evidence`, `quote` and `price_quote`.
- Empty flags are normal.

## Output discipline

Write one file per thread and check it parses. Reply with counts only (threads done, flags by severity, anything to escalate). Never paste message text into the reply.
