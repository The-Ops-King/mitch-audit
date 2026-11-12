# Kimberly Rae Coaching: sales automation audit

Prepared for Mitch. Build instructions for Leah are in section 6.

Data pulled 2026-11-12 (read only): the Zapier export (23 Zaps), the Close org config plus all 1,481 leads, 222 opportunities and Sept 1 onward call/SMS/email activity, and every table and record in the Airtable base "Kimberly Rae Coaching - Master Base". Calendly was down (504), so its settings are unverified.

---

## 1. Summary

The stack works day to day. Leads land in Close, Slack gets pinged, EOCs get filed. The data underneath is unreliable, though, and most of the reporting built on top of it is wrong in ways nobody would notice from the dashboards.

The ten problems that matter most, worst first:

| # | Problem | Evidence | Severity |
|---|---|---|---|
| 1 | Paid vs organic reporting is completely broken. Airtable's `Is Paid` formula looks for "Paid Ad"; every Zap writes "Paid Ads". | 0 of 825 Lead Base records count as paid. Every Paid/Organic metric, ROAS, CPA and CPL in Sales Metrics Summary is wrong. | Critical |
| 2 | Monthly finance numbers don't add up. Payments get linked to reporting periods inconsistently. | October 2026 shows $22,800, but October payments total $27,400 ("Last Month" shows the right figure). "2026" shows $77,783 while "YTD" shows $85,983. | Critical |
| 3 | Speed to lead is slow, and a quarter of leads never get touched. | Leads created since Sept 1: 27% have no outbound call or SMS in Close. Median first touch is 100 minutes. Only 82 of 421 were reached within 5 minutes. | Critical |
| 4 | The Close pipeline is inflated with dead and duplicate deals. | $700,800 of open pipeline across 98 opps, mostly $7,200 placeholders. 15 leads that are DQ'd, canceled, no-showed or already signed still hold open sales opps worth $136,800. 7 leads have more than one open "Mentorship Interview" opp. | High |
| 5 | Money values get corrupted on the way into Close. The EOC Zap builds cents by typing "00" after the dollar amount. | One "Installment Paid" opp is worth $11.33. Almost certainly a $1,133.33 payment that became `1133.3300`. Any amount with cents breaks this way. | High |
| 6 | Re-opt-ins push leads back to "New Lead" and overwrite attribution. | 8 leads sit in "New Lead" while holding Lost, Interview or Pending Close opps. Every form Zap overwrites Opt Source / Applied Source, so first-touch attribution doesn't exist. | High |
| 7 | Payments and commissions aren't tied to the deal. Fanbasis payments never touch Close, and 18 of 43 payment records aren't linked to a customer or rep. | Unlinked payments default to "Recurring" (26 Recurring vs 17 New, even though most payments are first sales), so New Cash is understated. 26 payments have no closer, yet closer commission still calculates on them. | High |
| 8 | The re-engagement sequence is mostly failing. | 759 leads enrolled in one batch on Jul 15. 518 ended in `error` (sampled reason: sender account failures). It isn't used for anything ongoing. | High |
| 9 | Follow-ups live in people's heads. The EOC collects a follow-up date but never creates a task. | 33 leads in "Closer Follow Up", 19 open tasks in the whole org, 9 of them overdue. | High |
| 10 | A plaintext password is stored in a Zap. New rep onboarding creates every Google Workspace account with the same hardcoded password. | Zap "New Rep Onboarding". | High (security) |

On top of that, setter attribution is missing on 157 of 183 EOCs, three different revenue totals can't be reconciled (Close won $48,778, EOC closes $56,983, Airtable payments $88,383), and Google Sheets is quietly acting as a third ledger.

---

## 2. Inventory

### Zapier (23 Zaps, 21 on)

| Zap | Trigger | Writes to | Notes |
|---|---|---|---|
| Setter Booking -> Close -> Slack -> Airtable | Calendly invitee created, name has "(SB)" or "Live" | Kit, Close lead + new opp, Slack, Airtable Lead Base | Always creates a new opp |
| DCB Booking -> Close -> Slack -> Airtable | Calendly, name has DCBA / DCBIG / DCBE | Same as above | Labels every DCB booking "Paid Ads" |
| IG Application | Typeform LxWp7wuV | Close, note, Slack, Lead Base | |
| Paid Ads Application | Typeform yFW8rDUJ | Close, note, Slack, Lead Base | |
| Kajabi Application | Kajabi form | Kit, Close, Slack, Lead Base | |
| Kajabi - Relationship Quiz / Commitment Training / Anxious to Confident Blueprint | Kajabi forms | Kit, Close, Slack, Lead Base | 3 near-identical copies of the Kajabi Application Zap |
| (New Lead) Setter React | ✅ reaction in the booking Slack channel | Close (status, setter), Slack, Lead Base | Regex-parses the bot's Slack message |
| No Show / Canceled / Reschedule -> Slack | Close lead status change | Slack only | |
| EOC Form (88 steps) | New Airtable EOC record | Google Sheet, Slack, Close lead/opp/note, Customer, Customer Products, Payment Records, Instalments, 2nd Google Sheet | The core of the system |
| Fanbasis Payment | Fanbasis new sale | 2 Slack workspaces, Payment Records | Nothing in Close |
| Fanbasis Renewal | Fanbasis renewal | 2 Slack, Google Sheet, Payment Records | Fee hardcoded at 3.9% |
| Onboarding Email | New EOC record, "Closed - Needs Onboarding" | Gmail | |
| Kickoff Session > Slack | Calendly "Kickoff Session" | Slack | |
| New Client Intake Form > Slack | Google Form | Slack | |
| Setter EOD -> Slack / EOD Reminder | Airtable EOD / daily schedule | Slack | |
| New Rep Onboarding | Airtable OB form | Google Workspace user, Close invite, User ID Lookup, Slack | Hardcoded password |
| New Contract > Slack | DocuSign | Slack | Off |
| Untitled Zap | Fanbasis | none | Empty draft, delete |

Zaps write to 2 Slack workspaces (internal and client), 2 Google Sheets, Airtable, Close and Kit.

### Close

- Lead statuses (13): New Lead - DCB, New Lead, Setter Pipeline, New Opportunity, Closer Follow Up, No show, Canceled, New Opportunity - Reschedule, Deposit Paid, Signed Up - Balance Owed, Signed Up - Closed, NGMI, DQ.
- Pipeline "Sales": Mentorship Interview, Pending Close, Installment Pending (active); Deposit Paid, Closed, Installment Paid (won); Lost.
- 8 lead custom fields. Traffic Type and Fathom URL are filled on 0 leads, even though all 183 EOCs include a Fathom link.
- No custom activities, no SMS templates, 1 email sequence, 6 smart views.
- 12 users, including duplicate accounts for Alexandra and Makena and one with no name. Only 4 users made calls since Sept 1.
- 3 webhooks to Zapier (lead.updated), feeding the status-change Zaps.

### Airtable

15 tables: EOC Responses (183), Setter EODs (100), Lead Base (825, versus 1,481 leads in Close), Sales Metrics Summary, Rep Scorecard, Daily Sales Report, Payment Records (43), Instalment Records (2), Refund Records (1), Ad Spend (0 rows), Finance Metrics Summary, Customer (23), Customer Products (25), User ID Lookup (9), New OB Form (0).

The reporting tables work by linking records to "period" rows (October 2026, MTD, YTD and so on). No Zap creates those links, so Airtable automations must be doing it. The API doesn't expose automations, and that linking step is where finding #2 comes from.

---

## 3. Findings by area

### 3.1 Data integrity

1. **There's no shared ID across systems.** Records join on email, or worse, on a person's name. Close lead ID isn't stored in Airtable. Reps are matched by name text in the EOC (`Closer Name`, `Setter Name`), so a typo or a name change breaks the match. Example: the User table says "Sidonie Chechin", the Rep Scorecard dropdown says "Sidonie Claurans", and Close says "Sidonie C".
2. **Lead search takes the first match.** Every Zap runs Close "Find Lead" by email and takes the first result. 15 emails already exist on more than one lead (33 leads total), so updates can land on the wrong record.
3. **Opp updates take the first opp.** The EOC finds "the first opportunity on the lead" and updates it. After a payment plan creates installment opps, or after a rebook creates a second interview opp, the EOC updates whichever opp Close returns first. That explains 3 signed-up leads that still hold an open Interview opp.
4. **Bookings always create a new opp.** Both booking Zaps create a $7,200 "Mentorship Interview" opp on every booking, even if the lead already has an open one. Rebooks and reschedules duplicate the deal.
5. **Reschedule handling is wrong either way.** The booking Zaps filter on `rescheduled = False`. In Calendly the rescheduled flag sits on the canceled original, and the new booking arrives as a fresh invitee. So reschedules come through as brand-new bookings and duplicate the opp, and nothing ever records the cancellation of the original slot. Needs confirming against Calendly once it's back up.
6. **Statuses regress.** All six application/opt-in Zaps set an existing lead back to "New Lead". A past DQ, a lost deal or a current client who opts into a freebie gets reset.
7. **Attribution gets overwritten.** Opt Source and Applied Source are overwritten on every touch. Booking Zaps write "Setter Booking" over the real source. The DCB Zap labels DCBIG and DCBE bookings "Paid Ads" (if IG and E mean Instagram and Email, those are mislabeled). Lead Base "First Click Source" is overwritten too.
8. **Free-text sources break formulas.** Sources go in as typed text ("Paid Ads", "Kajabi - Relationship Quiz"), and Airtable formulas compare against different text ("Paid Ad"). That's finding #1.
9. **Dates are converted from UTC to UTC.** Every date formatter does this and drops the time. A call at 8pm Eastern or later is stored as the next day. Date Of Call and Payment Date can be off by one.
10. **Cents are built as text** (`{{Cash Collected}}00`). Any amount with decimals ends up 100x wrong in Close. This is confirmed by the $11.33 opp.
11. **The EOC Slack message shows the 3rd installment date where the amount should be.** In the code step, `amt_3` is mapped to "Date of 3rd Instalment".
12. **Required data is missing.** Setter Name is blank on 157 of 183 EOCs and Closer Name on 54. 508 Close leads have no phone number.
13. **Lead Base is a partial copy of Close** (825 vs 1,481) and has no Close ID, so anything computed from it is a sample, not the population.
14. **The speed-to-lead metric in Airtable measures nothing.** `Minutes to Claim` uses `Date Claimed`, a date-only field set by the Slack ✅ reaction. Median 0 minutes, some negative values. The real numbers, pulled from Close activity, are in 3.2.

### 3.2 Speed to lead

Measured from Close lead creation to the first outbound call or SMS logged in Close, for leads created Sept 1 to Nov 12. IG DMs and calls from personal phones aren't captured, so treat "never touched" as "never touched in Close".

| Source | Leads | Never touched | Median first touch | Reached in 5 min |
|---|---|---|---|---|
| All | 421 | 27% | 100 min | 82 |
| Paid Ads | 193 | 6% | 114 min | 48 |
| Kajabi - Relationship Quiz | 71 | 42% | 50 min | 10 |
| Kajabi - Commitment Training | 55 | 67% | 99 min | 2 |
| Kajabi Application | 42 | 30% | 525 min | 6 |
| Kajabi - Anxious to Confident | 32 | 75% | 943 min | 0 |
| Setter Booking | 23 | 0% | 17 min | 11 |

Why it's slow:

- Speed to lead depends on someone reading a Slack channel. Close doesn't assign an owner, create a task, send an instant SMS, or escalate when nobody acts.
- Freebie opt-ins post to the same "NEW APPLICATION" channel as real applications and get the same "Dial ASAP" message. Setters are flooded with low-intent leads and the high-intent ones wait. The 67 to 75% untouched rates on two freebies suggest setters have learned to ignore that channel.
- The "handoff" depends on a ✅ emoji and a regex that parses the bot's own message text. If someone edits the message format, the Zap silently stops matching.

### 3.3 Pre-call

Nothing pre-call is visible in Close or Zapier. There's no confirmation SMS, no reminder cadence, no setter confirmation task, no triage checklist and no closer brief. The booking Zaps enroll the lead in Kit sequence 2893474. If that sequence holds the reminders, they're email only. Kit wasn't in scope, so check what that sequence sends. Calendly's own reminders couldn't be checked (504).

### 3.4 No-show, cancel, reschedule

- These are detected only when a rep manually changes the Close status. Calendly cancel events aren't used.
- The response is a Slack post. Nothing reaches the lead (no rebook SMS or email), no task gets created, and there's no follow-up cadence.

### 3.5 Post-call (EOC)

- The EOC is an Airtable form keyed on typed email and typed names, separate from the Close lead. That's the root of most of the integrity problems in 3.1.
- The Fathom link is captured but never written to the Close `Fathom URL` field.
- The follow-up date is captured, but no Close task is created (finding #9).
- One 88-step Zap handles every outcome. If any step fails partway (say the email search misses), the Google Sheet and Slack have already been written while Close and Airtable haven't. You end up with partial writes and no alert.
- The Onboarding Email Zap fires on the same EOC record as a separate Zap, so it sends even when the EOC Zap fails.

### 3.6 Payments and collections

- **Fanbasis payments never update Close.** A deal is marked won only if the closer files an EOC.
- **Payment records are orphans.** The Fanbasis Zap creates Payment Records without links to Customer, Customer Product or rep. 18 of 43 are unlinked. Someone or something links the rest after the fact.
- **No dedupe key.** No Fanbasis transaction ID is stored, so a replayed Zap would double-count.
- **Latent revenue gap.** The EOC Zap deliberately skips creating a payment record when the method contains Fanbasis, Whop, Shopify or Stripe, on the assumption that a processor Zap will create it. Only Fanbasis has a processor Zap. Today every EOC payment is Fanbasis, so nothing has been lost yet. The day a deal closes on Whop, Shopify or Stripe, it disappears from finance.
- **Net amounts are calculated two ways.** New sales use Fanbasis `creator_earnings`. Renewals use a hardcoded 3.9% fee.
- **Google Sheets are an incomplete ledger.** Fanbasis new sales aren't written to the cash Sheet, but renewals and EOC payments are.
- **Installments are modeled twice and maintained once.** The EOC creates future "Installment Pending" opps in Close plus Instalment Records in Airtable. When an installment is paid, the EOC creates another new won opp and never marks the Airtable instalment paid. Result: 2 Instalment Records in total, 4 EOCs that report an in-house payment plan, and 7 "Installment Paid" opps in Close. Collections tracking isn't reliable.
- **No automation for failed payments, overdue installments or refunds.** Airtable has "Overdue" and "Due This Week" views, but nothing pushes them to anyone.

### 3.7 Reporting

- Paid/Organic splits are all wrong (finding #1).
- Period totals are wrong (finding #2).
- Ad Spend has 0 rows, so every ROAS, CPA and CPL formula divides by nothing.
- Rep Scorecard joins on rep names that don't match across tables.
- Commissions: closer commission is 10% of every payment, including payments with no closer attached. Setter commission depends on the Setter Name lookup, which is mostly blank.
- Close won revenue ($48,778, 20 opps) counts deposits and individual installments as separate wins. It isn't a deal count or a revenue figure you can use.

### 3.8 Security and hygiene

- Plaintext shared password in the onboarding Zap. Every new rep gets the same known password.
- 12 Close seats, of which 2 are duplicates and 1 is unnamed. Check what you're paying for, and confirm departed reps are deactivated.
- No error alerting on any Zap.
- Non-critical steps run before critical ones. Kit runs before the Close write in 6 Zaps, and Slack runs before the Airtable write in the payment Zaps. A Kit outage stops leads from reaching Close.
- 4 copies of the Kajabi Zap and hardcoded status, field, channel and table IDs everywhere. Config lives in a hidden Zapier Table (`01KS2T7RQ0MGGM5C8645K8RDHP`) that maps EOC answers to Close status IDs. Nobody would find it without being told.
- One empty draft Zap and one disabled DocuSign Zap.

---

## 4. Target architecture

Rules every automation follows. These matter more than any single Zap.

1. **One system owns each kind of data.** Close owns people, deals and sales activity. Fanbasis (or whichever processor) owns money. Airtable is the reporting and collections layer, written to by automations and never hand-edited for core facts. Slack carries alerts only; nothing is ever read back out of Slack. Retire the Google Sheets ledgers once anyone who reads them has a replacement view.
2. **Join on IDs, never names.** Close `lead_id` goes on every Airtable record. Close `user_id` identifies reps (the User table is keyed on it, and names are display only). The processor transaction ID goes on every payment and is used to dedupe. Emails are lowercased and trimmed before any search.
3. **The EOC lives in Close.** It becomes a Close Custom Activity on the lead, with the same questions, required fields and dropdowns. The closer is the logged-in user, and the lead is the lead they're on, so typed emails and names disappear. A Close webhook (`activity.custom_activity created`) triggers the downstream Zap.
4. **One opp per sales cycle.** A booking finds the lead's open sales opp and updates it, creating one only if none exists. The opp value is the contract value, set at Offer/Closed, not a $7,200 placeholder. Won means signed. Installments don't live in Close as opps. They live in Airtable, linked to the deal.
5. **Statuses only move forward.** A status map defines which transitions are allowed. Re-opt-ins add a note and update Last Touch, but never reset status unless the lead is in a recyclable state (NGMI, Lost, aged DQ).
6. **Attribution is write-once plus last-touch.** First Touch Source is set only when empty. Last Touch, Application Source and Booking Source are set by their own events. All source fields become Close dropdowns with a fixed value list, so "Paid Ad" vs "Paid Ads" can't happen. Traffic Type (Paid/Organic) is derived from First Touch.
7. **Critical writes first, alerts last.** Order is Close, then Airtable, then Kit, then Slack. Every Zap gets an error path, and a Zapier Manager "Zap error" alert goes to an #ops-alerts channel.
8. **Reporting reads raw records by date.** Drop the period-link tables. Build Airtable Interface dashboards that aggregate Payment, EOC and Lead records with date filters (this month, last month, custom range). Nothing has to be linked correctly for a number to be right.
9. **Config lives in one place.** One Zapier Table (or Airtable table) per client holds status IDs, field IDs, Slack channel IDs, user mappings and product names. Zaps look values up there, so cloning the system for a new account means filling in one table.

---

## 5. Target workflows

### Speed to lead (application or opt-in)

1. Form submitted. Normalize the email, then find the lead in Close. Create it if missing; if it exists, apply status rules (no regression).
2. Set Application Source and Last Touch. Set First Touch only if empty.
3. Route by intent. Applications and bookings get the full speed-to-lead flow. Freebie opt-ins go to Kit nurture plus a lower-priority Close smart view, and they stay out of the applications channel.
4. Assign the setter on duty (round robin from the config table) as lead owner and create a "Call now" task.
5. Enroll in a Close workflow: instant SMS from the setter's Close number, a call task, and follow-up SMS/calls through day 1, day 2 and day 4. The workflow stops on reply or booking.
6. Slack alert to the setter, with application answers and the Close link.
7. Escalation: if no outbound call or SMS has been logged within 10 minutes, alert the sales manager.
8. Measure speed to lead from Close activity timestamps, not Slack.

Confirm the Close plan includes Workflows with SMS and call steps plus auto-enroll triggers. If not, Zapier enrolls leads into the sequence instead.

### Booking and pre-call

1. Calendly invitee created. Detect a reschedule (`old_invitee` present) vs a new booking.
2. Find the open opp. Update the call date and closer, or create the opp if none exists.
3. Confirmation SMS and email, then reminders at 24h, 2h and 10 minutes. Pick one channel owner (Close workflow or Calendly), not both.
4. Setter confirmation task on the day of the call. A triage checklist (dropdown custom fields: confirmed attending, qualified, decision maker present) is filled before the call.
5. Closer brief 60 minutes before the call: a Slack DM with the application answers, setter notes and the Close link.

### No-show, cancel, reschedule

1. A Calendly cancel (not part of a reschedule) sets status to Canceled and starts the rebook workflow (SMS plus email with the booking link, plus a setter task).
2. A no-show is recorded by the closer in the Close EOC. That sets status to No show, starts the rebook workflow, and posts a Slack alert.
3. A reschedule updates the existing opp's date. No new opp, no Slack noise.

### Post-call (Close EOC custom activity)

One Zap triggered by the Close webhook, with branches by outcome:

- **Closed:** opp set to Won with the contract value. Customer and Customer Product upserted in Airtable, keyed on lead_id plus product. Installment schedule created in Airtable if it's a payment plan. Onboarding email sent. Slack.
- **Offer Made / Follow-up set:** Close task assigned to the closer on the follow-up date. Status set to Closer Follow Up.
- **DQ / Lost / No show / Cancel:** status and opp updated (Lost with reason), plus the matching workflow.
- **All outcomes:** Fathom URL written to the Close field, plus an EOC record in Airtable that carries lead_id and user_id.

The EOC never creates payment records. Payments come only from processors (next section).

### Payments and collections

One Zap per processor, each feeding the same steps:

1. Dedupe on transaction ID.
2. Find the Close lead by normalized email. If there's no match, create a flagged "unmatched payment" record and alert ops. Never drop it silently.
3. Create the Payment Record, linked to Customer, Customer Product, lead_id and owning reps. Net amount comes from the processor's net field.
4. If an installment is open for that customer product, mark the oldest unpaid one paid and link the payment.
5. Update the Close lead status: Signed Up - Closed if nothing is owed, otherwise Signed Up - Balance Owed.
6. Slack (both workspaces) last.

Off-platform payments (wire, Zelle, crypto and so on) go through a small Airtable form that requires selecting the existing Customer Product, so they're never typed free.

Collections: a daily scheduled run finds installments due today and overdue ones past grace. It DMs the owner and creates a Close task. If Fanbasis exposes failed-payment or refund triggers, route them the same way (refunds create a Refund Record and trigger clawback).

---

## 6. Build plan for Leah

Phases are ordered by risk. Don't start a phase until the previous one is verified.

### Phase 0: stop the bleeding (small edits, no rebuild)

1. Remove the hardcoded password from New Rep Onboarding. Generate a random temp password and set "change password at next login".
2. Fix the `amt_3` mapping in the EOC code step.
3. Replace `{{Cash Collected}}00` in every Close value field with a Formatter step that multiplies by 100 and rounds to an integer. Then fix the $11.33 opp by hand.
4. Change the Airtable `Is Paid` formula to match "Paid Ads". Better: match on a dropdown (see Phase 1).
5. Remove "New Lead" from the "Lead Exists" update in all 6 form Zaps. Stop overwriting Opt Source on existing leads.
6. Remove Whop, Shopify and Stripe from the EOC "skip payment record" filter until those processors have their own Zaps.
7. Move Kit steps after the Close write in the 6 affected Zaps.
8. Add a Zapier Manager "New Zap Error" Zap posting to an #ops-alerts channel.
9. Close out the 15 phantom open opps on terminal leads and merge the 7 duplicate-opp leads. Merge or de-dupe the 15 duplicate-email lead groups.
10. Delete the Untitled draft Zap. Deactivate unused or duplicate Close users after confirming with Mitch.

### Phase 1: data foundation

1. Close fields: convert the source fields to dropdowns (First Touch, Last Touch, Application Source, Booking Source, Traffic Type), with one fixed value list kept in the config table.
2. Close: build the EOC Custom Activity, mirroring the Airtable form. Use Close user fields for setter and closer.
3. Close: simplify the pipeline. Remove the Installment Pending and Installment Paid stages once installments move to Airtable. Mitch decides whether Deposit Paid is won or active (recommendation: active, so won means signed).
4. Airtable: add `Close Lead ID` to Lead Base, Customer, Customer Products, Payment Records, EOC and Instalments. Re-key the User table on `Close User ID`. Add `Processor Txn ID` to Payment Records.
5. Backfill Close Lead IDs onto existing Airtable records by email match, and list anything unmatched for manual review.
6. Build the config table (status IDs, field IDs, channel IDs, setter rotation, product list).

### Phase 2: rebuild the flows

Build them in this order, each one in its own folder with the naming convention `[KRC] <Trigger> -> <Primary system>`:

1. Lead intake: one Zap per source system (Typeform, Kajabi), with a lookup that replaces the 4 Kajabi copies. Intent routing as described in section 5.
2. Speed-to-lead Close workflow plus the escalation alert.
3. Booking (one Zap handles both Setter Booking and DCB, with event-type to source mapping in config), plus a Calendly cancel Zap.
4. Pre-call reminders and the closer brief.
5. EOC from the Close Custom Activity (replaces the 88-step Zap and the separate Onboarding Email Zap).
6. Payments: Fanbasis new sale and renewal through the shared payment steps, plus the manual payment form and daily collections.
7. Retire: Setter React (✅ handoff), the Google Sheets steps, and the Airtable EOC form.

Test checklist for every flow: new lead, existing lead, existing lead in a closed status, duplicate email, missing phone, amount with cents, evening-Eastern call time, reschedule, and a failure partway through (confirm the alert fires).

### Phase 3: reporting

1. Build Interface dashboards on raw records with date filters: Sales (leads, set rate, show rate, close rate, cash, by source and rep), Finance (cash, net, new vs recurring, refunds, commissions), Collections (due, overdue).
2. Speed-to-lead report from Close activity.
3. Retire the period-link tables after both versions have matched for a full month.
4. Populate Ad Spend (manual weekly entry, or a Meta Ads Zap), or remove the ROAS metrics until it's populated.

### Phase 4: make it a template

1. Write a Close provisioning script that creates statuses, pipeline, fields, the EOC custom activity and smart views from a JSON spec through the Close API. (I can write this in JavaScript.)
2. Turn the Airtable base into a template with no client data.
3. Document the Zap set and config table so a new account means: duplicate the base, run the script, fill in config, then turn on Zaps.
4. Write a one-page runbook: where to look when a lead or payment is missing.

---

## 7. Not verified yet

- **Calendly:** event types, reminder settings, and the reschedule payload. The API returned 504. This affects findings 3.1.5 and 3.3.
- **Zap History export (last 90 days):** needed for real error and halt rates per Zap.
- **Airtable automations:** the API doesn't expose them. Screenshots or a list are needed to confirm how period links and payment-to-customer links get made.
- **Kit sequences 2893474 (bookings) and 2893520 (Kajabi):** what they actually send.
- **Fanbasis:** whether failed-payment and refund triggers exist in Zapier.
- **DCB event naming:** what DCBA, DCBIG and DCBE stand for.
- **Google Sheets:** who reads the two Sheets, and whether an accountant depends on them.
