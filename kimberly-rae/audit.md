# Kimberly Rae Coaching: automation audit and build plan

Client: Mitch. Builder: Leah.
Data pulled 2026-11-12, read only: Zapier export (23 Zaps), Close (config, 1,481 leads, 222 opportunities, status history, Sept 1 onward calls, SMS, email and sequence data), and every Airtable table and record in "Kimberly Rae Coaching - Master Base".

This document has three parts:

- Part A is the full workflow catalog: every automation a high-ticket sales team needs from lead to closed deal and beyond, with what Kimberly Rae Coaching (KRC) has today and what has to be built, updated or retired.
- Part B is the issues register: every problem found, the evidence, whether it's verified, and the fix.
- Part C is the build order.
- Part D is the SOP catalog: the written procedures for using and maintaining these systems. Every workflow in Part A lists the SOPs that go with it.

### Legend

Verification status:
- Confirmed: checked directly against the data or the Zap configuration.
- Inferred: the effect is confirmed in the data, but the cause sits somewhere the APIs don't expose (Airtable automations, Calendly settings, Kit content).
- Unverified: not yet checked. The reason is given.

Action:
- Create: doesn't exist.
- Update: exists, needs changes.
- Retire: exists, should be removed.
- Keep: works as is.

### Decisions locked

1. Fanbasis payments update Close.
2. A deposit is not a closed deal. A deal counts as closed when the client signs and pays in full or starts the payment plan.
3. Every follow-up date set on a call creates a Close task.
4. Moving the EOC form into Close (as a Custom Activity) is recommended. Mitch is open to it.
5. Calendly is being repaired on the client side. Calendly-dependent items get verified after that.

### Systems of record (applies to every workflow)

| Data | Owner system | Rule |
|---|---|---|
| People, deals, sales activity, tasks | Close | Every other system stores the Close lead ID |
| Money (payments, renewals, refunds) | Fanbasis (plus any future processor) | Each payment stores the processor transaction ID |
| Reporting, commissions, collections schedule | Airtable | Written by automation only, never hand-edited for core facts |
| Alerts | Slack | Output only; nothing gets read back out of Slack |
| Email nurture | Kit | Gets lead data from Close events |

---

# Part A: workflow catalog

## A1. Summary table

| ID | Stage | Workflow | KRC today | Action | SOPs |
|---|---|---|---|---|---|
| WF-01 | Capture | Lead intake and dedupe | 6 Zaps, inconsistent, regress statuses | Update (consolidate) | 01, 02, 23 |
| WF-02 | Capture | Attribution capture | Hardcoded source labels, overwritten | Update | 01, 23 |
| WF-03 | Capture | Lead routing and owner assignment | None | Create | 03 |
| WF-04 | Speed to lead | Instant response (SMS and email) | None | Create | 03 |
| WF-05 | Speed to lead | Setter call cadence | Slack ping only | Create | 03, 04 |
| WF-06 | Speed to lead | Unworked lead escalation | None | Create | 03 |
| WF-07 | Nurture | Applied but not booked follow-up | Smart view only | Create | 03 |
| WF-08 | Nurture | Freebie opt-in nurture | Kit sequence, but freebies treated as applications | Update | 23 |
| WF-09 | Nurture | Stale lead re-engagement | One failed blast in July | Create | 22 |
| WF-10 | Booking | Booking sync to Close | 2 Zaps, create duplicate deals | Update (consolidate) | 05 |
| WF-11 | Booking | Reschedule handling | Broken (treated as new booking) | Create | 05 |
| WF-12 | Booking | Cancellation and rebook | Slack only, manual status | Create | 10 |
| WF-13 | Pre-call | Confirmation and reminders | Not visible (Kit/Calendly unverified) | Create or verify | 06 |
| WF-14 | Pre-call | Setter confirmation and triage | None | Create | 06 |
| WF-15 | Pre-call | Closer pre-call brief | None | Create | 06 |
| WF-16 | Call | No-show recovery | Slack only | Create | 10 |
| WF-17 | Call | Call outcome capture (EOC) | Airtable form, 88-step Zap | Update (move into Close) | 07, 08 |
| WF-18 | Post-call | Closer follow-up cadence | Status only, no tasks | Create | 09 |
| WF-19 | Post-call | Lost and DQ handling | Status only | Update | 02, 07 |
| WF-20 | Close | Contract send and signed | DocuSign Zap off (outside audit scope) | Keep off; listed for completeness | n/a |
| WF-21 | Payment | Payment received | Fanbasis to Airtable and Slack only | Update | 13 |
| WF-22 | Payment | Deposit handling | Deposit counted as a closed deal | Update | 11 |
| WF-23 | Payment | Payment plan schedule | Duplicated in Close opps and Airtable | Update | 11 |
| WF-24 | Payment | Collections (due, overdue, failed) | Views only, nothing sent | Create | 14 |
| WF-25 | Payment | Refunds and chargebacks | Manual | Create | 15 |
| WF-26 | Payment | Off-platform payment entry | Via EOC free entry | Create | 12 |
| WF-27 | Client | Client onboarding | Email, intake to Slack, kickoff to Slack | Update | 16 |
| WF-28 | Team | Rep onboarding and offboarding | Onboarding only | Update | 17 |
| WF-29 | Team | Setter EOD and reminder | Works | Keep (minor update) | 03 |
| WF-30 | Team | Commissions | Airtable formulas on unlinked data | Update | 18 |
| WF-31 | Reporting | Sales dashboard (daily, weekly, monthly) | Period-link tables, numbers wrong | Update (rebuild) | 25 |
| WF-32 | Reporting | Speed-to-lead and activity report | Measures nothing | Create | 04, 25 |
| WF-33 | Reporting | Finance dashboard | Period totals missing renewals | Update (rebuild) | 25 |
| WF-34 | Reporting | Ad spend ingestion | Table empty | Create | 25 |
| WF-35 | Admin | Weekly data hygiene check | None | Create | 19, 20 |
| WF-36 | Admin | Automation error monitoring | None | Create | 21, 22, 27 |

## A2. Workflow specs

Each spec lists the trigger, the steps in order, what gets written where, the guardrails, and the issues it closes (issue IDs refer to Part B).

### WF-01 Lead intake and dedupe

- Trigger: any lead form (Typeform IG, Typeform Paid Ads, Kajabi application, Kajabi freebies). One Zap per source app, with a lookup table mapping form ID to source and intent, instead of one Zap per form.
- Steps:
  1. Lowercase and trim the email. Normalize the phone to E.164.
  2. Search Close by email. If more than one lead matches, use the oldest and send an alert for a merge.
  3. No match: create the lead with status New Lead, set First Touch, Application Source and Last Touch, and add the answers as a note.
  4. Match: add a note with the answers and set Last Touch. Change status only if the current status is in the recyclable set (NGMI, Lost, DQ older than 90 days). Never touch First Touch.
  5. Write or update the Airtable Lead Base keyed on Close lead ID.
  6. Hand off to WF-03 (applications) or WF-08 (freebies).
  7. Kit tag and sequence last.
- Guardrails: a failed Close write stops the Zap and alerts (WF-36). Kit never runs before Close.
- Closes: ISS-13, ISS-14, ISS-34, ISS-37, ISS-41, ISS-45.

### WF-02 Attribution capture

- Fields in Close, all dropdowns with a fixed value list: First Touch Source (write once), Last Touch Source, Application Source, Booking Source, Traffic Type (Paid or Organic, derived from First Touch).
- Forms pass UTM source, medium and campaign as hidden fields, stored on the lead.
- Airtable reads Traffic Type from Close. No text matching in formulas. The EOC's manual Lead Source dropdown is removed.
- Closes: ISS-01, ISS-02, ISS-14, ISS-15.

### WF-03 Lead routing and owner assignment

- Trigger: WF-01 creates or reactivates an application-intent lead.
- Steps: pick the setter on duty from a rotation in the config table (round robin, skip anyone marked off), set Close lead owner and Setter Owner, create a "Call now" task due immediately.
- Closes: ISS-09.

### WF-04 Instant response

- Trigger: lead assigned (WF-03).
- Steps: within 60 seconds, send an SMS from the setter's Close number plus an email confirming receipt with a booking link. Both are logged in Close.
- Closes: ISS-07.

### WF-05 Setter call cadence

- Built as a Close Workflow (sequence with call and SMS steps), auto-enrolled by WF-03.
- Cadence (starting point, tune later): call plus SMS at 0 minutes, call at 5 minutes, SMS at 1 hour, call plus SMS that evening, call plus SMS on day 2, email on day 3, call plus SMS on day 4, then hand off to WF-07.
- Exits: lead replies, books, or is marked DQ.
- Confirm the Close plan supports Workflows with SMS and call steps. If not, Zapier creates the tasks and sends the SMS through Close.
- Closes: ISS-07, ISS-31.

### WF-06 Unworked lead escalation

- Trigger: scheduled check every 5 minutes during business hours (Zapier schedule plus a Close search), or a Close smart view: application leads created in the last 30 minutes with no outbound call or SMS.
- Steps: at 10 minutes untouched, DM the assigned setter. At 20 minutes, alert the sales manager channel. Log the escalation as a note.
- Closes: ISS-07.

### WF-07 Applied but not booked

- Trigger: application lead, no booking, and the WF-05 cadence finished. The existing "3 Day No Book" smart view becomes the entry condition.
- Steps: a 14-day SMS and email sequence with the booking link. Then move to Kit long-term nurture.

### WF-08 Freebie opt-in nurture

- Trigger: Kajabi freebie forms (Relationship Quiz, Commitment Training, Anxious to Confident Blueprint).
- Steps: Close upsert (WF-01), a Kit tag per freebie, a freebie-specific Kit sequence, and a Close smart view "Freebie, hot" for leads that click or reply. No post to the applications channel.
- Closes: ISS-08.

### WF-09 Stale lead re-engagement

- Trigger: monthly, leads with no activity for 60 days that are in recyclable statuses.
- Steps: a Kit broadcast or sequence sent from a secondary sending domain, not Kimberly's main mailbox. Replies or clicks re-enter WF-03.
- Closes: ISS-28.

### WF-10 Booking sync

- Trigger: Calendly invitee created (one Zap for all sales event types, with an event type to source mapping in config).
- Steps:
  1. If `old_invitee` is present, hand off to WF-11 and stop.
  2. Upsert the lead (WF-01 rules).
  3. Find the lead's open sales opportunity. If one exists, update it with the call date, closer and Calendly event URI. If none exists, create one at stage Mentorship Interview with no placeholder value.
  4. Set lead status to New Opportunity (forward-only rule), Booking Source and Closer Owner (matched by host email, exact match).
  5. Write the call date as a full datetime with timezone, not a date-only string.
  6. Post to the bookings channel.
  7. Start WF-13.
- Closes: ISS-10, ISS-17, ISS-19, ISS-33.

### WF-11 Reschedule handling

- Trigger: Calendly invitee created with `old_invitee` present. (Calendly fires a cancel on the old invitee with `rescheduled = true` and a create on the new invitee carrying `old_invitee`.)
- Steps: find the opp by the old Calendly event URI, update the call date, restart the reminders, and add a note. No new opp.
- Closes: ISS-11.

### WF-12 Cancellation and rebook

- Trigger: Calendly invitee canceled with `rescheduled = false`.
- Steps: lead status Canceled, opp stays open with the call date cleared, start a rebook sequence (SMS and email with the booking link), create a setter task, post to Slack.
- Closes: ISS-12, ISS-31.

### WF-13 Confirmation and reminders

- Trigger: WF-10 or WF-11.
- Steps: confirmation SMS and email immediately, then reminders at 24 hours, 2 hours and 10 minutes, each with the meeting link. Pick one owner for reminders (Close workflow or Calendly) and switch the other off.
- Status: Calendly reminder settings and Kit sequence 2893474 (enrolled on booking) are unverified. Check both before building so leads don't get double reminders.
- Closes: ISS-30.

### WF-14 Setter confirmation and triage

- Trigger: day of call, 3 hours before (Close task).
- Steps: the setter confirms attendance by call or SMS and fills in triage fields on the lead (Confirmed, Qualified, Decision maker on call, Notes). If the lead isn't confirmed 1 hour out, alert the setter and the closer.

### WF-15 Closer pre-call brief

- Trigger: 60 minutes before the call.
- Steps: Slack DM to the closer with the application answers, triage fields, setter notes, source and the Close link.

### WF-16 No-show recovery

- Trigger: the closer logs No Show in the EOC (WF-17).
- Steps: status No show, a rebook sequence (SMS within 5 minutes, then day 1 and day 3), a setter task, a Slack alert. Opp stays open.
- Closes: ISS-31.

### WF-17 Call outcome capture (EOC)

- Recommended form: a Close Custom Activity named "EOC" on the lead, with the same questions as today, required fields and dropdowns. The closer is the logged-in Close user, so no names or emails get typed.
- Trigger: Close webhook on custom activity created, sent to one Zap (replaces the 88-step Zap and the separate Onboarding Email Zap).
- Branches by outcome:
  - Closed (paid in full or plan started): opp to Won with the contract value, Customer and Customer Product upserted in Airtable (keyed on Close lead ID plus product), payment plan schedule created (WF-23), onboarding started (WF-27).
  - Deposit: opp to Deposit Paid (an active stage, not won). Close task to collect the balance (WF-22).
  - Offer Made or 2-call close: Closer Follow Up status plus a Close task on the follow-up date (WF-18).
  - No Show: WF-16. Cancelled: WF-12. Reschedule: note only (the Calendly side handles it).
  - DQ or Lost: WF-19.
- Every outcome: write the Fathom link to the Close field, write the EOC record to Airtable with lead ID and user ID, and post the Slack summary last.
- The EOC never creates payment records. Payments come from processors (WF-21) or the off-platform form (WF-26).
- If the EOC stays in Airtable instead: replace the typed lead email with a linked record to Lead Base (keyed on Close lead ID), and key reps on Close user ID.
- Closes: ISS-05, ISS-06, ISS-16, ISS-17, ISS-29, ISS-32, ISS-34, ISS-36, ISS-40, ISS-42.

### WF-18 Closer follow-up cadence

- Trigger: an EOC with Offer Made or a follow-up set.
- Steps: a Close task for the closer on the follow-up date. An SMS and email touch the day after the call (recap plus next step). If the follow-up date passes with no activity, alert the closer. After 14 days with no movement, Lost with reason "Went cold" and hand to nurture.
- Closes: ISS-29.

### WF-19 Lost and DQ handling

- Trigger: EOC outcome Lost or DQ.
- Steps: opp to Lost with a reason dropdown. Lead to DQ or NGMI. Lost leads with a "timing" or "money" reason go into a 90-day nurture. Pure DQs get a Kit tag and nothing else.
- Closes: ISS-18.

### WF-20 Contract send and signed

- Outside the agreed audit scope. Listed so the catalog is complete. The DocuSign Zap is off today. If contracts matter for revenue recognition, the signed event should set a "Contract signed" date on the opp.

### WF-21 Payment received

- Trigger: Fanbasis new sale, and Fanbasis subscription renewal (two triggers, same steps). Add one per processor if Whop, Stripe or Shopify are ever used.
- Steps:
  1. Dedupe on the Fanbasis transaction ID.
  2. Find the Close lead by normalized email. No match: create an "Unmatched payment" record and alert ops. Never drop it.
  3. Create the Payment Record linked to Customer, Customer Product, Close lead ID, closer and setter. Gross from the amount, net from Fanbasis creator earnings (same field for sales and renewals).
  4. If an installment is open for that customer product, mark the oldest unpaid one paid and link it.
  5. Update Close. First payment on a deal with a closed EOC: opp Won. Payment on a Deposit Paid opp: keep it at Deposit Paid until the balance is covered or the plan starts. Lead status: Signed Up - Closed when nothing is owed, Signed Up - Balance Owed when installments remain.
  6. Slack, both workspaces, last.
- Closes: ISS-21, ISS-22, ISS-23, ISS-24, ISS-25, ISS-26, ISS-27.

### WF-22 Deposit handling

- A deposit holds the spot and is not a deal.
- Close: the "Deposit Paid" stage changes from won to active. Airtable: deposits count as cash, not as closed deals.
- A Close task is created to collect the balance by the agreed date. If the date passes, alert the closer.
- Closes: ISS-05.

### WF-23 Payment plan schedule

- Trigger: an EOC closed with an in-house plan.
- Steps: create installment records in Airtable only (number, due date, amount, Close lead ID, customer product). Close holds one won opp at the contract value. Installment opps are no longer created in Close, and the Installment Pending and Installment Paid stages are removed once old records are migrated.
- Closes: ISS-20.

### WF-24 Collections

- Trigger: daily at 9am Eastern, plus a Fanbasis failed-payment trigger if one is available.
- Steps: installments due today get a reminder to the client (SMS and email). Installments past the grace period: DM the owner, create a Close task, and move the lead to a "Collections" smart view. Failed card: client SMS with an update-card link, plus an owner alert.

### WF-25 Refunds and chargebacks

- Trigger: Fanbasis refund or dispute trigger if available, otherwise an Airtable form.
- Steps: a Refund Record linked to the payment and customer, commission clawback (the formulas already exist), Close note, and status update if the client is fully refunded.

### WF-26 Off-platform payment entry

- An Airtable form for wire, Zelle, crypto and similar payments. The customer product is picked from a list, not typed. Creates the same Payment Record as WF-21 and runs steps 4 to 6.

### WF-27 Client onboarding

- Trigger: deal Won (WF-17 or WF-21).
- Steps: welcome email (exists, move it here), intake form link, kickoff booking link, Kajabi access, and a Slack post. Intake submitted and kickoff booked both write to Close (today they only post to Slack). If the kickoff isn't booked within 48 hours, a reminder goes out.

### WF-28 Rep onboarding and offboarding

- Onboarding exists. Update it to force a password change at first login and to write the Close user ID to the Airtable User table.
- Offboarding (create): deactivate the Close membership, suspend Google Workspace, remove the rep from the rotation in the config table, and reassign their open leads and tasks.

### WF-29 Setter EOD and reminder

- Works. Change the EOD Setter Name dropdown to a link to the User table so names can't drift.

### WF-30 Commissions

- Commission is calculated only on Payment Records linked to a closer and/or setter. Unlinked payments show in an "Unattributed" view and calculate no commission until fixed.
- Closes: ISS-23.

### WF-31 Sales dashboard

- Airtable Interface pages built on raw EOC, Lead Base and Payment records with date filters (today, this week, this month, last month, custom). The period-link tables (Sales Metrics Summary, Finance Metrics Summary, Daily Sales Report, Rep Scorecard) are retired after one month of side-by-side comparison.
- Closes: ISS-04, ISS-35.

### WF-32 Speed-to-lead and activity report

- Daily Zap (or a Close report) that computes time from lead creation to first outbound call or SMS by source and setter, and the share of leads untouched at 5, 60 and 1,440 minutes. Written to Airtable.
- Closes: ISS-39.

### WF-33 Finance dashboard

- Same approach as WF-31, on Payment and Refund records: gross, net, new vs recurring, refunds, commissions, collections due and overdue.
- Closes: ISS-04, ISS-22.

### WF-34 Ad spend ingestion

- A daily Meta Ads spend pull into the Ad Spend table (Zapier Facebook Ads, or a manual weekly entry as a stopgap). Until it's populated, hide ROAS and CPA.
- Closes: ISS-03.

### WF-35 Weekly data hygiene check

- A weekly scheduled run that posts a report to #ops-alerts covering: duplicate leads by email, leads with more than one open opp, open opps on terminal statuses, payments without a customer link, EOCs without a Close lead ID, and leads without a phone.
- Closes: ISS-18, ISS-22, ISS-37.

### WF-36 Automation error monitoring

- A Zapier Manager "New Zap Error" trigger posts to #ops-alerts with the Zap name and a link.
- Every Zap writes to Close first and posts Slack notifications last.
- A dedicated Close API user for automations (if a seat is affordable), so automated changes are distinguishable from Kimberly's own.
- Closes: ISS-42, ISS-43.

---

# Part B: issues register

Severity is about business impact: Critical means reported numbers or revenue are wrong, High means leads or money are being lost or mishandled, Medium means data quality or operational risk, Low means hygiene.

| ID | Sev | Issue | Evidence | Status | Fix |
|---|---|---|---|---|---|
| ISS-01 | Critical | Lead-level paid flag never fires. Lead Base `Is Paid` checks 4 source fields for "Paid Ad"; Zaps write "Paid Ads". | 0 of 825 leads paid. Sales Metrics All Time: Paid Leads 0, Organic Leads 825. Paid set rate, paid CPL and paid cash per lead are all wrong. | Confirmed | WF-02 |
| ISS-02 | High | Two definitions of "paid". Calls and cash use a manual `Lead Source` dropdown on the EOC (85 Paid, 98 Organic); leads use automation tags. The two halves of the paid funnel can't be compared. | EOC formula `Paid: Closed Deals = IF(AND({Lead Source}="Paid",{Closed Deals}=1),1,0)` | Confirmed | WF-02 |
| ISS-03 | Medium | Ad Spend table is empty, so ROAS, CPA and CPL read $0. | 0 records | Confirmed | WF-34 |
| ISS-04 | Critical | Fanbasis renewals and back-dated payments aren't linked to calendar periods, so monthly and yearly finance totals are understated. | All 5 renewals plus 1 back-dated payment are missing from their calendar month: Aug $2,400, Sep $1,200, Oct $4,600. One renewal ($2,400) has no date at all. "October 2026" shows $22,800 vs $27,400 actual. "2026" shows $77,783 vs "YTD" $85,983. | Confirmed (effect). Cause inferred: the Airtable automation that links periods appears to require data the renewal Zap doesn't set (renewals have no Product or Customer link). The Airtable API doesn't expose automations, so this needs a look inside Airtable. | WF-31, WF-33 |
| ISS-05 | Critical | Deposits count as closed deals, against the business rule. | All 6 "Deposit" EOCs have Closed Deals = 1. Close pipeline stage "Deposit Paid" is a won stage (5 opps). | Confirmed | WF-17, WF-22 |
| ISS-06 | High | Duplicate EOC submissions double-count outcomes. | 3 lead/date pairs have two EOCs: Closed + Closed, Closed + Offer Made, No Show + Disqualified. | Confirmed | WF-17 (one EOC per call; dedupe on lead ID and call date) |
| ISS-07 | Critical | Slow speed to lead and many leads never contacted. | Leads created Sept 1 to Nov 12 (421): 27% have no outbound call or SMS in Close, median first touch 100 minutes, 82 reached within 5 minutes. Paid Ads: 6% untouched, median 114 minutes. | Confirmed (measured from Close activity; IG DMs and personal-phone calls aren't captured) | WF-03 to WF-06 |
| ISS-08 | High | Freebie opt-ins post to the applications channel with "Dial ASAP", burying real applications. | 3 freebie Zaps use the same channel as applications. Untouched rates: Anxious to Confident 75%, Commitment Training 67%, Relationship Quiz 42%. | Confirmed | WF-08 |
| ISS-09 | Medium | Lead handoff depends on a Slack ✅ reaction and a regex reading the bot's message text. | Zap "(New Lead) Setter React" | Confirmed | WF-03 |
| ISS-10 | High | Every booking creates a new $7,200 deal, even when one is open. | 7 leads have 2 to 3 open Interview opps created hours or days apart, including a signed client and an NGMI lead. | Confirmed | WF-10 |
| ISS-11 | High | Reschedules come through as new bookings. The Zap filters on `rescheduled = false`, but Calendly sets that flag on the canceled original, and the new booking arrives with `rescheduled = false` and `old_invitee` set. | Zap filter config plus Calendly's reschedule docs | Confirmed | WF-11 |
| ISS-12 | High | Calendly cancellations aren't used. Cancels only register if a rep changes the Close status. | No Zap on invitee canceled | Confirmed | WF-12 |
| ISS-13 | High | Re-opt-ins knock leads back to "New Lead". | 8 leads currently in New Lead that hold Lost, Interview or Pending Close opps. Close history shows moves such as Canceled to New Lead, No show to New Lead, Closer Follow Up to New Lead, and New Opportunity to New Lead. | Confirmed | WF-01 |
| ISS-14 | High | Source fields are overwritten on every touch, so first-touch attribution doesn't exist. | Update steps in 8 Zaps write Opt Source and Applied Source unconditionally. 30 leads now show Opt Source "Setter Booking". | Confirmed | WF-01, WF-02 |
| ISS-15 | Medium | The DCB Zap labels DCBA, DCBIG and DCBE bookings all as "Paid Ads". | Zap config | Confirmed (config). Meaning of the codes unverified. | WF-10 config mapping |
| ISS-16 | High | Payment amounts with cents are corrupted in Close. The Zap builds cents by appending "00" to the dollar text. | EOC cash $1,133.33 became a $11.33 opp. Every amount with decimals is affected. | Confirmed | WF-17 (multiply by 100 and round in a Formatter step) |
| ISS-17 | High | EOC updates whichever opp Close returns first. | Zap config ("first" result). A signed client still holds 2 open Interview opps. | Confirmed | WF-10, WF-17 (target the opp by ID) |
| ISS-18 | High | Pipeline is inflated with dead deals. | $700,800 open across 98 opps. 15 leads in DQ, NGMI, Canceled, No show or signed statuses hold open sales opps worth $136,800. | Confirmed | Cleanup, plus WF-19 and WF-35 |
| ISS-19 | Medium | Opps are created with a $7,200 placeholder value. | All 68 Interview opps = $7,200 | Confirmed | WF-10 (no value until offer or close) |
| ISS-20 | High | Payment plans are tracked in two places, and only one gets updated. Installment payments create new won opps in Close but never mark the Airtable installment paid. | 4 EOCs report an in-house plan. 2 installment records in Airtable. 7 "Installment Paid" opps in Close. | Confirmed | WF-23, WF-21 |
| ISS-21 | High | Fanbasis payments don't update Close. | Fanbasis Zaps write to Airtable and Slack only | Confirmed | WF-21 |
| ISS-22 | High | Payments aren't linked to customers or reps, which misclassifies cash. | 18 of 43 payment records unlinked. 8 first-ever payments ($16,100) are classified "Recurring" because they're unlinked, so New Cash is understated by that amount. | Confirmed | WF-21 |
| ISS-23 | High | Commission is calculated on payments with no rep attached. | 26 payments with no closer carry $4,605 of closer commission and $912.50 of setter commission. | Confirmed | WF-30 |
| ISS-24 | Medium | No processor transaction ID is stored, so a replayed Zap would double-count. | Payment Records schema | Confirmed | WF-21 |
| ISS-25 | Medium (latent) | EOC skips payment records for Whop, Shopify and Stripe, but only Fanbasis has a processor Zap. | Filter config. No loss yet, since every payment to date was Fanbasis. | Confirmed | WF-21, WF-26 |
| ISS-26 | Low | Net amount is calculated two ways (Fanbasis earnings vs a hardcoded 3.9% fee). | Zap config | Confirmed | WF-21 |
| ISS-27 | Medium | Google Sheets act as an incomplete third ledger (Fanbasis new sales are missing). | Zap config | Confirmed | Retire once nobody reads them (confirm with Mitch) |
| ISS-28 | High | No ongoing re-engagement. The only sequence was a one-time blast from Kimberly's main inbox that mostly failed. | 759 leads enrolled in under a minute on Jul 15: 518 `account-failures` (Close couldn't send through the mailbox), 218 finished, 22 replied, 1 booked. 0 sequence emails since Sept 1. | Confirmed | WF-09 |
| ISS-29 | High | Follow-up dates are collected but no task is created. | 33 leads in Closer Follow Up, 19 open tasks org-wide, 9 overdue | Confirmed | WF-17, WF-18 |
| ISS-30 | High | No visible pre-call process (confirmations, reminders, triage, brief). | Nothing in Close or Zapier | Confirmed for Close and Zapier. Calendly reminders and Kit sequence 2893474 unverified. | WF-13 to WF-15 |
| ISS-31 | High | No-shows and cancels get a Slack post only. Nothing goes to the lead and no task is created. | Zap config | Confirmed | WF-12, WF-16 |
| ISS-32 | Low | EOC Slack summary shows the 3rd installment date in place of the amount. | Code step maps `amt_3` to "Date of 3rd Instalment" | Confirmed | WF-17 |
| ISS-33 | Medium | Call dates are converted UTC to UTC and stored date-only, so evening calls can land on the next day. | Comparing first calls: Close's date is exactly 1 day later than the closer's EOC date in 9 cases, 1 day earlier in 3. | Confirmed (pattern consistent with the UTC rollover) | WF-10 |
| ISS-34 | High | Systems join on email or rep name. No Close ID is stored in Airtable. | Schema. Lookups use name text and email. | Confirmed | WF-01, WF-17, Phase 1 backfill |
| ISS-35 | High | One setter is missing from Rep Scorecard. The scorecard dropdown says "Sidonie Claurans"; EODs and EOCs say "Sidonie Chechin". | 0 scorecard rows for Sidonie despite 59 EODs and 18 EOCs | Confirmed | WF-29, WF-31 |
| ISS-36 | Medium | Rep attribution is missing on EOCs. | Setter blank on 157 of 183, closer blank on 54 of 183 | Confirmed | WF-17 (required fields) |
| ISS-37 | Medium | Duplicate leads and missing phones. | 15 emails on more than one lead (33 leads). 508 leads without a phone. | Confirmed | WF-01, WF-35 |
| ISS-38 | Medium | Lead Base is a partial copy of Close. | 825 vs 1,481 | Confirmed | Phase 1 backfill |
| ISS-39 | Medium | Airtable "Minutes to Claim" measures nothing (date-only field, set by the Slack reaction). | Median 0, two negative values | Confirmed | WF-32 |
| ISS-40 | Low | Close fields Fathom URL and Traffic Type are never filled, though every EOC has a Fathom link. | 0 of 1,481 filled | Confirmed | WF-02, WF-17 |
| ISS-41 | Medium | Kit runs before Close in 6 Zaps, so a Kit failure stops the lead reaching Close. | Zap config | Confirmed | WF-01, WF-10 |
| ISS-42 | Medium | No error alerting. The 88-step EOC Zap can write Slack and Sheets, then fail before Close and Airtable. | Zap config. Actual failure rate unknown. | Confirmed (config). Failure rate unverified until the Zap History export is provided. | WF-17, WF-36 |
| ISS-43 | Low | Zapier acts in Close as Kimberly, so the audit trail can't tell automation from owner. | Status history attributes Zap-driven changes to "Kimberly Rae" | Confirmed | WF-36 |
| ISS-44 | Medium | Config is hardcoded and partly hidden. A Zapier Table (`01KS2T7RQ0MGGM5C8645K8RDHP`) maps EOC answers to Close status IDs, and channel, field and status IDs are hardcoded across Zaps. | Zap config | Confirmed | Phase 1 config table |
| ISS-45 | Low | 4 near-identical Kajabi Zaps. | Zap config | Confirmed | WF-01 |
| ISS-46 | Low | New Google Workspace accounts start with one shared hardcoded password, with no forced change. | Zap config | Confirmed | WF-28 |
| ISS-47 | Low | Leftover Zaps: an empty draft, and the DocuSign Zap switched off. | Zap list | Confirmed | Delete the draft |

### Corrections from the first draft

- Retracted: "12 Close seats including duplicates." Only 4 memberships are active (Kimberly, Makena, Sidonie, Emily). The other 8, including the duplicate accounts, are already deactivated.
- Narrowed: paid vs organic. The lead-level split is broken (ISS-01). The call and cash split runs off a manual dropdown and does produce numbers (ISS-02).
- Sharpened: finance periods. The missing records are specifically renewals and back-dated entries (ISS-04).
- Downgraded: the onboarding password, to Low.

---

# Part C: build order

Phases are ordered by risk. Each phase gets verified before the next one starts.

Each phase ships with its SOPs from Part D. A workflow isn't done until its SOP is written and matches how the system actually behaves.

### Phase 0: stop the bleeding (edits to existing Zaps)

1. Cents fix: replace `{{Cash Collected}}00` and every other `...00` value mapping with a Formatter step (multiply by 100, round). Correct the $11.33 opp. (ISS-16)
2. Fix the `amt_3` mapping. (ISS-32)
3. Change `Is Paid` to match "Paid Ads" as a stopgap until WF-02. (ISS-01)
4. Remove the status change and the source overwrite from the "Lead Exists" branch of all 6 form Zaps. (ISS-13, ISS-14)
5. Booking Zaps: find the open opp and update it instead of creating a new one. (ISS-10)
6. Close pipeline: change "Deposit Paid" from won to active. In Airtable, change `Closed Deals` so deposits don't count. (ISS-05)
7. EOC Zap: when a follow-up is set, create a Close task on the follow-up date and write the Fathom link to the Close field. (ISS-29, ISS-40)
8. Move Kit steps after Close in the 6 affected Zaps. (ISS-41)
9. Remove Whop, Shopify and Stripe from the EOC skip-payment filter. (ISS-25)
10. Add Zap error alerting. (ISS-42)
11. Freebie Zaps: post to a separate low-priority channel, not the applications channel. (ISS-08)
12. Fix Sidonie's name in the Rep Scorecard dropdown. (ISS-35)
13. Data cleanup: close the 15 dead opps, merge the duplicate opps on the 7 leads, merge the 15 duplicate-email lead groups, link the 18 orphan payments and the undated renewal. (ISS-18, ISS-22, ISS-37)
14. Onboarding Zap: force a password change at first login. Delete the draft Zap. (ISS-46, ISS-47)

### Phase 1: data foundation

1. Close: source dropdown fields (WF-02), EOC Custom Activity (WF-17), remove the installment stages once data is migrated (WF-23).
2. Airtable: add Close Lead ID to every table, Close User ID to the User table, and Processor Txn ID to Payment Records. Backfill by email and review anything unmatched.
3. Build the config table: status IDs, field IDs, channel IDs, setter rotation, event type to source mapping, product list.

### Phase 2: rebuild the flows

Build and test in this order: WF-01/02/03, WF-04/05/06, WF-10/11/12, WF-13/14/15, WF-17 with WF-16/18/19, WF-21/22/23/26, WF-24/25, WF-27, WF-28/30.

Test every flow against: a new lead, an existing lead, a lead in a closed status, a duplicate email, a missing phone, an amount with cents, a call after 8pm Eastern, a reschedule, a cancel, and a mid-run failure (confirm the alert fires).

### Phase 3: reporting

WF-31 to WF-34, run side by side with the old tables for a full month, then retire the old period tables. Retire Google Sheets once Mitch confirms nobody depends on them.

### Phase 4: make it repeatable for future accounts

1. A Close provisioning script (JavaScript, Close API) that creates statuses, pipeline, fields, the EOC custom activity and smart views from one JSON spec.
2. The Airtable base saved as a template with no client data.
3. Zaps built against the config table, so a new account means: duplicate the base, run the script, fill in config, connect the apps, turn on the Zaps.
4. A one-page runbook covering where to look when a lead, booking or payment is missing.

---

## Open items

| Item | Blocks | Needed from |
|---|---|---|
| Calendly back up: event types, reminder settings, a test reschedule payload | WF-10 to WF-13, ISS-15 | Client |
| Airtable automations (screenshot or list) | ISS-04 root cause | Client or Leah (inside Airtable) |
| Zap History export, last 90 days | ISS-42 failure rate | Client |
| Kit sequences 2893474 and 2893520: what they send | WF-13, WF-08 | Client |
| Fanbasis: are failed-payment, refund and dispute triggers available in Zapier? | WF-24, WF-25 | Leah (check in Zapier) |
| What DCBA, DCBIG and DCBE mean | ISS-15 | Mitch |
| Does anyone, such as an accountant, use the two Google Sheets? | ISS-27 | Mitch |
| Close plan includes Workflows with SMS and call steps? | WF-05 | Leah |

---

# Part D: SOP catalog

These SOPs cover how the systems get used and maintained. They don't cover business rules (pricing, qualification criteria, schedules) or who does the work. Where an SOP needs a business value, such as an escalation time, it points to the config table so Mitch's team sets the value in one place.

Status: none of these exist as written procedures in the systems reviewed. Today the process lives in Zap logic, Slack message wording and people's heads. Every SOP below is marked Create. If any already exist outside these systems (Notion, Google Docs, Loom), mark them Update and send them over for review.

## D1. Summary

| ID | Area | SOP | Supports | Status |
|---|---|---|---|---|
| SOP-01 | Data | Lead record standards (required fields, source fields, ID rules) | WF-01, WF-02 | Create |
| SOP-02 | Data | Status and pipeline stage definitions | WF-01, WF-19, WF-22 | Create |
| SOP-03 | Lead handling | Working a new lead in Close (tasks, smart views, workflow, EOD) | WF-03 to WF-07, WF-29 | Create |
| SOP-04 | Lead handling | Logging activity that happens outside Close | WF-05, WF-32 | Create |
| SOP-05 | Booking | Booking, rebooking and live transfers | WF-10, WF-11 | Create |
| SOP-06 | Pre-call | Confirmation task, triage fields and the closer brief | WF-13 to WF-15 | Create |
| SOP-07 | Call | Submitting the EOC | WF-17, WF-19 | Create |
| SOP-08 | Call | Correcting a wrong EOC | WF-17 | Create |
| SOP-09 | Post-call | Working follow-up tasks | WF-18 | Create |
| SOP-10 | Post-call | No-show and cancel handling in Close | WF-12, WF-16 | Create |
| SOP-11 | Money | Recording deposits and payment plans | WF-22, WF-23 | Create |
| SOP-12 | Money | Entering an off-platform payment | WF-26 | Create |
| SOP-13 | Money | Resolving an unmatched payment | WF-21 | Create |
| SOP-14 | Money | Working the collections queue | WF-24 | Create |
| SOP-15 | Money | Processing a refund or chargeback | WF-25 | Create |
| SOP-16 | Handoff | Won deal to client onboarding | WF-27 | Create |
| SOP-17 | Access | Rep system access: provisioning and removal | WF-28 | Create |
| SOP-18 | Money | Monthly commission run | WF-30 | Create |
| SOP-19 | Systems | Weekly data hygiene review | WF-35 | Create |
| SOP-20 | Systems | Merging duplicate leads and opportunities | WF-35 | Create |
| SOP-21 | Systems | Automation error triage and replay | WF-36 | Create |
| SOP-22 | Systems | Automation change control | WF-36, all | Create |
| SOP-23 | Systems | Adding a lead source, form or event type | WF-01, WF-02, WF-08 | Create |
| SOP-24 | Systems | Adding a product, price or payment processor | WF-21, WF-23 | Create |
| SOP-25 | Reporting | Metric definitions | WF-31 to WF-34 | Create |
| SOP-26 | Systems | Rolling the system out to a new account | Phase 4 | Create |
| SOP-27 | Systems | Connections, API keys and credential rotation | WF-36 | Create |

## D2. SOP outlines

Each outline lists what the finished SOP has to cover. Leah writes the full version once the matching workflow is built, so the SOP describes the system as it actually works.

### SOP-01 Lead record standards

- Required fields on every lead: name, normalized email, phone in E.164 format, First Touch Source, Traffic Type.
- What each source field means and when it gets set. First Touch is write once; Last Touch, Application Source and Booking Source are set by their own events.
- Close lead ID is the key in every other system. Emails are lowercased and trimmed.
- Never create a lead by hand without searching first.
- Fixes: ISS-14, ISS-34, ISS-37.

### SOP-02 Status and pipeline stage definitions

- One line per lead status and per opportunity stage: what it means, what moves a record in, what moves it out, and whether automation or a person sets it.
- The forward-only rule and the recyclable set.
- Deposit Paid is active, not won. Won means signed and paid in full or plan started.
- Opp value is empty until an offer, then the contract value.
- Fixes: ISS-05, ISS-13, ISS-18, ISS-19.

### SOP-03 Working a new lead in Close

- Where new leads show up (task list, smart views) and in what order to work them.
- How the call and SMS workflow runs, and how to pause or exit it (replied, booked, DQ).
- How to mark the outcome of an attempt in Close so reporting picks it up.
- The setter EOD form: when it's submitted and what each number means.
- Fixes: ISS-07, ISS-09.

### SOP-04 Logging activity that happens outside Close

- If contact happens through IG DM or a personal phone, how to log it in Close (note or custom activity) so speed to lead and activity reports count it.
- Why it matters: anything unlogged shows up as an untouched lead.
- Fixes: ISS-07 measurement gap.

### SOP-05 Booking, rebooking and live transfers

- Which Calendly event types to use for which path (setter booking, direct booking, live transfer). The mapping lives in the config table.
- How to reschedule (always through Calendly's reschedule link, never by canceling and booking again) so the existing opp updates.
- How to log a live transfer so it counts as a booking.
- Fixes: ISS-10, ISS-11.

### SOP-06 Confirmation task, triage fields and closer brief

- What the confirmation task asks for and how to fill in the triage fields.
- What happens automatically when a call isn't confirmed by the set time.
- Where the closer brief arrives and what's in it.
- Fixes: ISS-30.

### SOP-07 Submitting the EOC

- One EOC per call, submitted from the lead in Close, before the next call or within the set window.
- Required fields per outcome, and what each outcome triggers (link to WF-17 branches).
- A deposit is logged as Deposit, never as Closed.
- The follow-up date is required for Offer Made and 2-call close, because it creates the task.
- The Fathom link goes in its field.
- Fixes: ISS-05, ISS-06, ISS-29, ISS-36, ISS-40.

### SOP-08 Correcting a wrong EOC

- Edit the existing EOC. Never submit a second one.
- Which corrections the automation picks up on edit, and which need ops to fix downstream (payment links, installment schedule).
- Fixes: ISS-06.

### SOP-09 Working follow-up tasks

- Where follow-up tasks appear, and what to log after each follow-up.
- How to reschedule a follow-up (move the task date and log a note).
- What happens automatically when a follow-up goes overdue or the deal goes cold.
- Fixes: ISS-29.

### SOP-10 No-show and cancel handling in Close

- What the automation already did (rebook messages, task) before anyone touches the lead.
- How to log the rebook attempt and the result.
- When to stop and mark the lead lost (the attempt limit is set in the config table).
- Fixes: ISS-31.

### SOP-11 Recording deposits and payment plans

- How a deposit is logged and how the balance task works.
- How a payment plan schedule is entered on the EOC and where it shows up in Airtable.
- What to do when plan terms change (edit the schedule, never create a second customer product).
- Fixes: ISS-05, ISS-20.

### SOP-12 Entering an off-platform payment

- When to use the form (wire, Zelle, crypto and so on).
- Pick the customer product from the list, enter the amount with cents, attach proof.
- Fixes: ISS-25.

### SOP-13 Resolving an unmatched payment

- Where unmatched payments land (alert plus an Airtable view).
- How to find the right lead (email variants, name, phone), link the payment, and rerun the downstream steps.
- When to create a new lead instead.
- Fixes: ISS-22.

### SOP-14 Working the collections queue

- Where due and overdue installments appear, and what the automation has already sent.
- How to log each contact attempt, and how to record a promise to pay or a new date.
- How to mark an installment paid manually if the payment came in off platform (link it through SOP-12).
- Fixes: ISS-20.

### SOP-15 Processing a refund or chargeback

- How to record it so the refund record, clawback and Close status all update.
- How to handle partial refunds.
- Fixes: refund records are manual today.

### SOP-16 Won deal to client onboarding

- What the automation sends on Won, and what to check (intake received, kickoff booked, course access granted).
- What to do when a step stalls.

### SOP-17 Rep system access: provisioning and removal

- Accounts and records to set up: Google Workspace, Close membership, Close user ID in the Airtable User table, Slack, setter rotation entry in config.
- Removal checklist: deactivate the Close membership, suspend Google Workspace, remove from rotation, reassign open leads and tasks.
- Fixes: ISS-35, ISS-46.

### SOP-18 Monthly commission run

- Run from the Airtable finance views after month end.
- Clear the "Unattributed" view first (payments without a closer or setter).
- Apply refund clawbacks, then export or lock the month.
- Fixes: ISS-23.

### SOP-19 Weekly data hygiene review

- Work through the WF-35 report: duplicate leads, multiple open opps, open opps on dead leads, unlinked payments, EOCs without a lead ID, leads without a phone.
- Each line gets fixed or marked as an exception. Log what was fixed.
- Fixes: ISS-18, ISS-22, ISS-37.

### SOP-20 Merging duplicate leads and opportunities

- How to choose the surviving lead (oldest, or the one with payments), merge in Close, and update the Close lead ID in Airtable.
- How to close duplicate opps without losing history.
- Fixes: ISS-10, ISS-37.

### SOP-21 Automation error triage and replay

- What the #ops-alerts message contains, and how to read the Zap run history.
- Decide: fix the data and replay, or fix the Zap and replay.
- Check for partial writes (Close updated but Airtable not, or the reverse) before replaying so nothing gets doubled.
- Fixes: ISS-42.

### SOP-22 Automation change control

- Every change goes through the config table first when possible (IDs, channels, mappings).
- Naming convention, folders, and a changelog entry (date, Zap, change, reason).
- The test checklist from Part C runs before turning a changed Zap back on.
- Never change a status, field or dropdown value in Close or Airtable without checking which Zaps and formulas reference it.
- Fixes: ISS-01 (that bug is exactly an unchecked value change), ISS-44.

### SOP-23 Adding a lead source, form or event type

- Add the form ID or event type to the config table with its source label and intent (application or freebie).
- Add the label to the Close source dropdowns.
- Test with one submission and confirm it lands in Close, Airtable and the right Slack channel.
- Fixes: ISS-15, ISS-45.

### SOP-24 Adding a product, price or payment processor

- Add the product to the product list in config.
- For a new processor, duplicate the WF-21 Zap with that processor's trigger, store its transaction ID, and map its net amount field.
- Fixes: ISS-25, ISS-26.

### SOP-25 Metric definitions

- One line per reported number: the definition, the source table and field, and what's excluded. Covers leads, set, show, offer, closed deal (excludes deposits), cash collected, new vs recurring cash, speed to lead, ROAS.
- Any dashboard number has to match this definition.
- Fixes: ISS-01, ISS-02, ISS-04, ISS-05.

### SOP-26 Rolling the system out to a new account

- Run the Close provisioning script, duplicate the Airtable template, fill in the config table, connect apps in Zapier, import the Zap set, run the test checklist, then turn the Zaps on.
- Written after the Kimberly Rae build is stable, using it as the reference.

### SOP-27 Connections, API keys and credential rotation

- Inventory of every Zapier connection and API key, with the account it runs as.
- Use a dedicated automation user in Close where possible.
- Rotate keys whenever someone with access leaves, and after any key gets shared (including the keys used for this audit).
- Fixes: ISS-43.
