# Kimberly Rae Coaching: automation audit and build plan

Client: Mitch. Builder: Leah.
Data pulled 2026-11-12, read only: Zapier export (23 Zaps), Close (config, 1,481 leads, 222 opportunities, status history, Sept 1 onward calls, SMS, email and sequence data), and every Airtable table and record in "Kimberly Rae Coaching - Master Base".

## How to use this document

- Mitch: read the summary, Part 1 (how Close is set up) and Part 2 (the sales system, stage by stage). Part 5 has the evidence behind every issue.
- Leah: Part 3 is the list of small fixes. Part 4 has the architecture for every bigger fix and new build. Part 7 is the order to do them in. Part 6 lists the SOPs to write.

Every item has one of four verdicts:

- Keep: works, leave it.
- Fix small: change a step, a field or a setting. One-line instruction in Part 3.
- Fix big: rework something that exists. Full architecture in Part 4.
- Build new: doesn't exist today. Full architecture in Part 4.

### Assumptions

Calendly, Kit and DocuSign couldn't be accessed. The plan assumes:

- Calendly runs basic event types and sends its standard confirmation and reminder emails. Once the Close pre-call sequence (P1) is live, those Calendly reminders get switched off.
- Kit is used for email blasts only, not pre-call.
- DocuSign is used to send agreements by hand.

If any of these turn out to be wrong, only the matching item in Part 4 changes.

## Summary for Mitch

The day-to-day machinery runs: leads reach Close, the team gets pinged in Slack, closers file EOCs. The gaps fall into three groups.

1. The numbers are wrong. Paid vs organic never fires at lead level (0 of 825 leads count as paid). Monthly finance totals leave out renewals ($22,800 shown for October against $27,400 collected). Deposits and installment payments count as new closed deals.
2. The pipeline is inflated. Every booking and reschedule creates a new $7,200 deal. Close shows $700,800 of open pipeline, $136,800 of it on leads that are DQ'd, canceled or already signed.
3. Follow-through is missing. No pre-call reminders run from Close. There's no no-show, cancel or reschedule drip. Follow-up dates don't create tasks. Fathom recordings never reach Close. Signed agreements update nothing.

The plan:

- 19 small fixes
- 10 bigger fixes
- 11 new builds
- 17 SOPs to write
- Everything else stays as it is
- 54 issues logged: 4 critical, 24 high, 19 medium, 7 low

Decisions already made:

1. Fanbasis payments update Close.
2. A deposit is not a closed deal.
3. Every follow-up date creates a Close task.
4. Pre-call texts and emails run from Close. Calendly reminders get switched off once they're live.
5. Signed agreements update both Slack and Close.

---

# Part 1: how Close is set up today

Close has one pipeline, "Sales". It isn't split into setter and closer pipelines.

| Deal stage | Type | Deals now |
|---|---|---|
| New Deal - Mentorship Interview | Open | 68 |
| New Deal - Pending Close | Open | 29 |
| Installment Pending | Open | 1 |
| Deposit Paid | Won | 5 |
| New Deal - Closed | Won | 8 |
| Installment Paid | Won | 7 |
| New Deal - Lost | Lost | 104 |

Deals only start when a call is booked. There's no "Not Booked" stage.

The setter and closer split lives in lead statuses instead:

| Group | Lead statuses (current count) |
|---|---|
| Setter side | New Lead (1,258), New Lead - DCB (20), Setter Pipeline (0) |
| Closer side | New Opportunity (21), New Opportunity - Reschedule (1), Closer Follow Up (33), No show (15), Canceled (30) |
| Outcomes | Deposit Paid (3), Signed Up - Balance Owed (2), Signed Up - Closed (11), DQ (69), NGMI (18) |

Who owns a lead is tracked in two custom fields, Setter Owner and Closer Owner.

The problem: the same process is tracked twice. The lead status says where the person is, the deal stage says where the money is, and nothing keeps them in sync. That's how 15 dead or signed leads still hold open deals.

Recommendation (X1 in Part 4): the deal pipeline carries the sales process, from Not Booked through Won or Lost, including No Show, Canceled and Reschedule stages that the closer moves deals into. Lead status gets simplified to the lead's lifecycle. Drips trigger off deal stages.

---

# Part 2: the sales system, stage by stage

## 1. New lead comes in

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Lead created in Close | 6 form Zaps: IG Typeform, Paid Ads Typeform, Kajabi application, 3 Kajabi freebies | Fix small: stop resetting status and overwriting source on existing leads | FS-08 |
| Deal created at "Not Booked" | No. Deals only start at booking | Build new | N1 |
| Webinar exception | No webinar source exists | Not needed today | |
| New lead posted to Slack | Yes, the NEW APPLICATION channel ("Dial ASAP") | Keep. Fix small: freebies get their own channel | FS-10 |
| Sources tracked | Opt, Applied and Book Source fields | Fix big: overwritten on every new form, free text, Traffic Type never filled | N2 |
| Typeform data tracked | Answers saved as a note. Name, email and phone go into fields | Fix big: add UTM tracking and map key answers to fields | N2 |

## 2. Call booked

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Deal moves Not Booked to Booked | Creates a new $7,200 deal on every booking and reschedule | Fix big | B1 |
| Triage vs closing call | Event names with "(SB)", "Live", "DCBA", "DCBIG", "DCBE" are picked up. Which ones are triage is unknown until Calendly is visible | Fix big (part of B1) | B1 |
| Assigned to the right person | Closer matched from the Calendly host into Closer Owner | Keep. Fix small: make the match exact | FS-14 |
| Booking posted to Slack | Yes, the bookings channel | Keep | |
| Booking source tagged | Book Source field. The direct-booking Zap labels every booking "Paid Ads" | Fix small | FS-15 |
| Setter claims the booking (✅ reaction) | Works, but reads the lead's email out of the Slack message text | Fix big | B2 |

## 3. Pre-call

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Instant text and email on booking | Nothing in Close. Assumed: Calendly confirmation email only | Build new | P1 |
| Reminder texts and emails before the call | Nothing in Close. Assumed: Calendly reminder emails only | Build new | P1 |
| Kit enrollment on booking | Booking Zaps add every booked lead to a Kit sequence and tag | Fix small: run after Close. Confirm it's a blast list, not a pre-call sequence | FS-09 |

## 4. What happened on the call

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Call outcome (EOC) | Airtable form plus an 88-step Zap | Fix big: code step plus a short set of writes. Small fixes in the meantime | C1, FS-01 to FS-06 |
| Showed / no-show tag | Not stored on the lead or deal | Fix big (part of C1) | C1 |
| Fathom recording on every call | Closers paste the link into the EOC (183 of 183). Never reaches Close | Build new | C2 |
| Fathom summary to Slack | No. Slack gets the typed EOC summary | Build new | C2 |
| EOC summary to Slack | Yes | Keep | |
| Follow-up task from follow-up date | No | Fix small now, then part of C1 | FS-03 |

## 5. No-show, cancel, reschedule

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Closer moves lead to No Show | Lead status "No show" | Keep until X1 moves it to a deal stage | X1 |
| No-show alert to Slack | Yes | Keep | |
| No-show drip ("you missed your call, book here") | None | Build new | R1 |
| Cancel alert to Slack | Yes, but only when someone changes the status by hand | Keep. Calendly cancel trigger added in R2 | R2 |
| Cancel drip | None | Build new | R2 |
| Reschedule alert to Slack | Yes | Keep | |
| Reschedule handling and drip | Reschedules create a duplicate deal. No drip | Build new | R3 |

## 6. Smart lists for setters

| List | Today | Verdict | Ref |
|---|---|---|---|
| Day-old leads | "Gold Rush" and "Gold Rush (Paid Ads)" | Fix small: both filter on "last updated", which Zaps reset. Paid Ads view shows 94 of 223 paid leads | FS-19 |
| 3 to 7 day leads | "3 Day No Book" covers 0 to 3 days | Fix small | FS-19 |
| No-shows | "No Shows" | Fix small: same "last updated" problem | FS-19 |
| Cancellations | None | Build new (small) | FS-19 |
| Reschedules | None | Build new (small) | FS-19 |
| New applications | "New Apps" | Keep | |

## 7. Money

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Payment received alert | Fanbasis new sale and renewal Zaps post to Slack | Fix big: also update Close, link to client and rep, store transaction ID | M1 |
| Deposit counted as closed deal | Yes, in Close and Airtable. Installment payments also count as closed deals | Fix small | FS-05, FS-06 |
| Payment plans | Tracked as extra deals in Close and as records in Airtable. Only Close gets updated | Fix big | M4 |
| Failed payment alert | None | Build new | M2 |
| Refund automation | None. Refunds entered by hand | Build new | M3 |
| Off-platform payments (Whop, Stripe, Shopify) | EOC skips them, and nothing else records them | Fix small | FS-11 |

## 8. Agreement and handoff

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Agreement signed alert | "New Contract > Slack" Zap exists but is off. Should update Slack and Close | Fix big | A1 |
| Welcome email | Yes, fires from the EOC | Keep (moves into A2) | A2 |
| Intake form to Slack | Yes | Fix big: also write to Close | A2 |
| Kickoff booked to Slack | Yes | Fix big: also write to Close, remind if not booked | A2 |

## 9. Reporting

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Sales and finance tables in Airtable | Exist. Paid flag, renewals and deposits make the numbers wrong | Fix big | D1 |
| Weekly/monthly update (leads, show rate, close rate, cash) | None | Build new | D2 |
| Weekly data check | None | Build new, optional | D3 |

## 10. Team

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Rep onboarding Zap | Exists. Every new account gets the same password | Fix small | FS-13 |
| Rep onboarding SOP | None | Build new | T1 |
| Rep offboarding SOP | None | Build new | T1 |
| Setter EOD and EOD reminder | Work | Keep | |

## 11. Close structure

| Item | Today | Verdict | Ref |
|---|---|---|---|
| Pipeline and lead statuses | Process tracked twice, out of sync | Fix big | X1 |
| Close users, phone numbers, SMS | 4 active users, SMS working | Keep | |

---

# Part 3: small fixes

Each is a single change to an existing Zap, field or setting. Do them first.

| ID | Where | Change |
|---|---|---|
| FS-01 | EOC Zap, Code step | In Input Data, `amt_3` is mapped to "Date of 3rd Instalment". Map it to "3rd Instalment Amount". |
| FS-02 | EOC Zap, every "Update Lead in Close" step | Add the field Fathom URL = EOC "Fathom Share Link". |
| FS-03 | EOC Zap, "No Close / Follow Up" path | Add "Create Task in Close": lead = found lead, assigned to the closer's Close ID, due date = "Follow Up Date", text = "Follow up: {{Lead Full Name}}". Only runs when Follow Up Date has a value. |
| FS-04 | EOC Zap, every Close step with value `{{...}}00` | Add a Formatter step (Numbers, Spreadsheet-style formula, `ROUND({{Cash Collected}}*100,0)`) and map its output instead. Same for each installment amount. Then fix the $11.33 deal by hand. |
| FS-05 | Close settings, Sales pipeline | Change "Deposit Paid" from Won to Active. |
| FS-06 | Airtable, EOC table, `Closed Deals` formula | `IF(AND({Call Outcome}="Closed",{Payment Type}!="Deposit",{Payment Type}!="Instalment Paid"),1,0)` |
| FS-07 | Airtable, Lead Base, `Is Paid` formula | Replace "Paid Ad" with "Paid Ads" in all four comparisons. |
| FS-08 | IG, Paid Ads, Kajabi application and 3 Kajabi freebie Zaps, "Lead Exists" path, "Update Lead" step | Remove the Status field and the Opt Source and Applied Source fields. Keep the note. |
| FS-09 | Setter Booking, DCB Booking, Kajabi application and 3 freebie Zaps | Drag the two Kit steps to after the last Close step. |
| FS-10 | 3 Kajabi freebie Zaps, Slack step | Change the channel from NEW APPLICATION to a new low-priority freebie channel. Remove "Dial ASAP" from the message. |
| FS-11 | EOC Zap, 4 Payment Method filters | Remove the Whop, Shopify and Stripe conditions. Keep Fanbasis. |
| FS-12 | Airtable, Rep Scorecard, Rep Name dropdown | Rename "Sidonie Claurans" to "Sidonie Chechin" (the name used everywhere else). |
| FS-13 | New Rep Onboarding Zap, Google Workspace step | Turn on "Change password at next login". |
| FS-14 | Setter Booking and DCB Booking Zaps, "Find Record" in User ID Lookup | Set "Exact match" to Yes. |
| FS-15 | DCB Booking Zap, Close and Airtable steps | Replace the hardcoded "Paid Ads" with a lookup: DCBA = Paid Ads, DCBIG = Instagram, DCBE = Email (confirm the codes with Mitch). |
| FS-16 | Fanbasis Renewal Zap, Airtable step | Map the Date field (one renewal currently has no date). |
| FS-17 | Zapier | Delete "Untitled Zap" (empty draft). |
| FS-18 | Close and Airtable data | Close the 15 dead deals. Merge duplicate deals on 7 leads. Merge the 15 duplicate-email lead groups. Link the 18 orphan payments to customer and product. Fix the $11.33 deal. |
| FS-19 | Close smart views | See the table below. |

FS-19 smart views:

| View | Change |
|---|---|
| Gold Rush (day-old leads) | Replace "lead updated not in last 24 hours" with "lead created in the last 1 day" and "last call not within last 24 hours". |
| Gold Rush (Paid Ads) | Change the three source conditions from AND to OR, then apply the same date fix. |
| 3 Day No Book | Rename to "3 to 7 Day Leads". Created between 3 and 7 days ago, status New Lead, no booking. |
| No Shows | Replace "lead updated" with "last call not within last 6 hours". |
| Cancellations (new) | Status Canceled (deal stage Canceled after X1), last call not within last 6 hours. |
| Reschedules (new) | Status New Opportunity - Reschedule (deal stage Reschedule after X1), last call not within last 6 hours. |

---

# Part 4: architectures for bigger fixes and new builds

Each spec covers what it does, the trigger, the steps in order, and how to test it. IDs in `code` are the real Close IDs.

## X1. Pipeline restructure (Fix big)

- Goal: the deal pipeline carries the sales process. Lead status only tracks the lead's lifecycle.
- New "Sales" pipeline stages, in order:

| Stage | Type | Set by |
|---|---|---|
| Not Booked | Active | N1, on new lead |
| Booked - Triage | Active | B1 (only if triage calls exist) |
| Booked - Closing Call | Active | B1 |
| No Show | Active | Closer, or C1 |
| Canceled | Active | R2, or C1 |
| Reschedule Needed | Active | Closer, or C1 |
| Follow Up | Active | C1 (offer made, 2-call close) |
| Deposit Paid | Active | C1 |
| Won | Won | C1, M1 |
| Lost | Lost | C1 |

- Lead statuses after the change: New Lead, Working, Opportunity, Customer, Not Qualified. Keep the old statuses until every Zap and smart view has moved over, then archive them.
- Migration: map each open deal and lead status to a new stage. Remove Installment Pending and Installment Paid once M4 moves payment plans to Airtable.
- Zaps that trigger on lead status (No Show, Canceled and Reschedule to Slack) switch their trigger to "Opportunity status changed" in Close.
- Test: move a test deal through every stage and confirm each Slack alert and drip fires once.

## N1. Deal created at Not Booked (Build new)

- Added to the 6 form Zaps, after the Close lead step, in both the "Lead Exists" and "Lead Does Not Exist" paths.
- Steps:
  1. Close "Find Opportunity" on the lead, status type Active.
  2. Filter: continue only if no active deal was found.
  3. Close "Create Opportunity": stage Not Booked, no value, note = source.
  4. Close "Update Lead": write the new deal's ID to a lead field "Active Deal ID". B1, C1 and M1 use this field so they always update the right deal.
- Test: new lead creates one deal. A second form from the same lead creates nothing new.

## N2. Sources and Typeform tracking (Fix big)

- Close fields, all dropdowns with the same value list (Paid Ads, Instagram, Kajabi, Kajabi - Relationship Quiz, Kajabi - Commitment Training, Kajabi - Anxious to Confident, Email, Referral, Other):
  - First Touch Source: set only if empty
  - Last Touch Source: set on every form or booking
  - Application Source: set by the application Zaps
  - Booking Source: set by B1
  - Traffic Type (Paid, Organic): set from First Touch
  - Showed (Yes, No): set by C1
- Map the existing Opt Source values into First Touch once, then retire Opt Source.
- Typeform: add hidden fields `utm_source`, `utm_medium`, `utm_campaign`, `utm_content` to both forms and pass them from the ad and landing page links. Write them to matching Close fields. Map any answers Mitch wants to report on to their own Close fields. All answers stay in the note as well.
- Airtable `Is Paid` reads Traffic Type from Close instead of matching text. The EOC's manual Lead Source dropdown is removed.
- Zap logic for write-once: in each form Zap, a Formatter or Code step outputs First Touch = existing value if set, else this form's source.

## B1. Booking sync (Fix big)

Applies to the Setter Booking and DCB Booking Zaps. They can stay separate.

- Trigger: Calendly invitee created (unchanged).
- Steps:
  1. Filter: event type is one of the mapped sales events.
  2. Branch on `old_invitee`. If present, it's a reschedule: go to R3 steps and stop.
  3. Find the lead in Close by email (lowercased). Create the lead if missing (N1 rules).
  4. Find the deal using the lead's Active Deal ID. If there is none, create one.
  5. Update the deal: stage Booked - Closing Call (or Booked - Triage by event type), owner = closer (exact match on host email), call date and time as a full datetime with timezone, Calendly event URI stored on the deal. No $7,200 placeholder value.
  6. Update the lead: status Opportunity, Booking Source, Last Touch, Closer Owner, Date Of Call.
  7. Slack booking post (unchanged), including the Close lead ID for B2.
  8. Airtable Lead Base update.
  9. Kit steps last (FS-09).
- Remove the `rescheduled = False` filter. Calendly sends reschedules as new bookings with `old_invitee` set, so step 2 handles them.
- Test: new booking, second booking by the same lead, reschedule, booking at 9pm Eastern (date must stay correct).

## B2. Setter claim via ✅ (Fix big)

- Keep the habit: setter reacts ✅ on the booking post.
- Change: the B1 Slack post ends with a line `Lead ID: lead_xxx`. The Zap pulls that ID with one Formatter "Extract pattern" step (`lead_[A-Za-z0-9]+`) and updates the lead directly.
- Remove the email, date and rep text-matching steps.
- Setter is identified by Slack user ID through the User ID Lookup table (exact match).
- Test: react on a booking post. Then edit the message wording and react again; it must still work.

## P1. Pre-call sequence in Close (Build new)

- Built as a Close Workflow with email and SMS steps, sent from the closer's Close number.
- Enrollment: either Close's own trigger (enroll leads when they enter a smart view of deals in Booked), or a step at the end of B1 that enrolls the contact. Use whichever the Close plan supports.
- Steps (times relative to booking and call):
  1. Immediately: text and email confirming the time, the meeting link, and what to prepare.
  2. 24 hours before: text and email reminder.
  3. 2 hours before: text.
  4. 10 minutes before: text with the meeting link.
- Exits: the deal moves out of Booked (No Show, Canceled, Won, Lost), or the call time passes.
- Reschedules: R3 restarts the workflow with the new time.
- Once live: switch off Calendly's reminder emails so leads don't get doubles. Keep Calendly's booking confirmation if Mitch wants it.
- Close Workflows schedule steps by delay from enrollment, not from the call time. If the plan can't schedule relative to the call, use a Zapier "Delay Until" chain from B1 instead (one Zap, four delayed Close "Send SMS" and "Send Email" steps).
- Test: book a call 25 hours out and watch all four messages arrive on time.

## C1. EOC Zap rebuild (Fix big)

The current Zap has 88 steps because the same Close and Airtable steps are copied into every outcome path. The rebuild keeps the Airtable EOC form and moves every decision into one Code step.

- Code: `kimberly-rae/code/eoc-decide.js` in the repo. It's tested against the real outcome and payment type values. It outputs the lead status, deal stage, deal value in cents (fixes the $11.33 bug), whether it counts as a closed deal (deposits and installment payments don't), whether to create a follow-up task, the installment list, and the Slack summary. Unknown outcomes or an incomplete payment plan stop the run with an error instead of writing bad data.
- Steps:
  1. Trigger: Airtable new EOC record (unchanged).
  2. Code by Zapier: `eoc-decide.js`.
  3. Close: find lead by email (lowercased).
  4. Close: update lead (status, Closer Owner, Setter Owner, Fathom URL, Showed).
  5. Filter for the next step: `update_opp` = yes.
  6. Close: update the deal found by the lead's Active Deal ID (stage, value, date won).
  7. Close: add the Slack summary as a note.
  8. Paths:
     - Path A, follow-up (`create_followup_task` = yes): Close create task due on `followup_due`, assigned to the closer.
     - Path B, closed deal (`counts_as_closed_deal` = yes): Airtable upsert Customer and Customer Product (keyed on Close lead ID plus product). If `has_plan` = yes, Looping by Zapier over the installment line items creates the installment records. If `needs_onboarding` = yes, hand off to A2.
     - Path C, off-platform payment (payment method isn't Fanbasis, Whop, Shopify or Stripe): Airtable create Payment Record.
  9. Airtable Lead Base update.
  10. Slack: post `slack_message`.
- Roughly 15 steps instead of 88. Status IDs live in one config block at the top of the code.
- Test every outcome: No Show, Cancelled, Reschedule, Disqualified, Lost, Offer Made, 2-call close, Closed PIF, Closed on a plan, Deposit, Instalment Paid, Setter Takedown, cash with cents, missing follow-up date.

## C2. Fathom to Close and Slack (Build new)

- Check first whether Fathom's built-in Close integration is available on their Fathom plan. If it is, turn it on and skip the Zap's Close steps.
- Otherwise, a Zap:
  1. Trigger: Fathom "New Recording" (sales call meeting types only).
  2. Close: find the lead by the external attendee's email.
  3. Close: update lead Fathom URL, and add a note with the Fathom summary and action items.
  4. Slack: post the summary and link to the calls channel.
- If no lead matches, post to Slack with "No Close lead found" so someone links it by hand.
- Zoom recordings: Fathom records the Zoom call. Separate Zoom cloud recording only matters if Mitch wants a backup; it isn't required for this flow.
- Test: one recorded test call with a known lead.

## R1. No-show drip (Build new)

- Trigger: the closer moves the deal to No Show (until X1, the lead status "No show").
- Close Workflow, from the closer's number and email:
  1. Within 5 minutes: text "Looks like we missed you. Grab a new time here: [booking link]".
  2. Same time: email with the same link.
  3. Day 1: text.
  4. Day 3: text and email.
  5. Day 7: final email.
- Exits: they book again (B1 moves the deal to Booked), reply, or the deal is marked Lost.
- Existing No Show to Slack Zap stays.
- Test: move a test deal to No Show and confirm the first text arrives within 5 minutes.

## R2. Cancellations (Build new)

- New Zap: Calendly "Invitee Canceled", filtered to `rescheduled` = false (real cancellations only).
  1. Close: find the lead, move the deal to Canceled, lead status Canceled.
  2. Existing Canceled to Slack alert then fires from the status change (keep it).
- Close Workflow, same shape as R1, with cancel wording and the booking link.
- Exits: rebooked, replied, or Lost.
- Test: cancel a test booking in Calendly. The deal must move and the drip must start without anyone touching Close.

## R3. Reschedules (Build new)

- Calendly reschedules arrive in B1 with `old_invitee` set. Steps:
  1. Find the deal by the old Calendly event URI.
  2. Update the call date and time.
  3. Restart P1 for the new time.
  4. Post to Slack (the existing reschedule alert).
- No new deal.
- "Reschedule Needed" stage, for a lead who asks to move the call but hasn't picked a new time: the closer moves the deal there. A Close Workflow sends a text and email with the reschedule link right away, then again on day 1 and day 3.
- Test: reschedule a test booking. Exactly one deal with the new time, reminders follow the new time.

## M1. Payment received (Fix big)

Applies to the Fanbasis New Sale and Fanbasis Renewal Zaps.

- Steps:
  1. Airtable: search Payment Records for this Fanbasis transaction ID. Stop if found (no doubles).
  2. Close: find the lead by email (lowercased). If none, post "Unmatched payment" to Slack with the details and stop. Never drop it silently.
  3. Airtable: create the Payment Record with transaction ID, Close lead ID, links to Customer and Customer Product, gross amount, and net from Fanbasis creator earnings (same field for sales and renewals, no hardcoded 3.9%).
  4. Airtable: if an installment is open for that customer product, mark the oldest unpaid one paid and link the payment.
  5. Close: if the deal is at Deposit Paid or Follow Up and the EOC marked it closed, move it to Won. Set lead status Customer (Signed Up - Closed or Balance Owed until X1).
  6. Slack: both payment alerts, last.
- Commission formulas then work, because every payment has a closer and setter through the customer product.
- Test: new sale, renewal, the same webhook twice, a payment from an email not in Close.

## M2. Failed payment alert (Build new)

- Trigger: Fanbasis failed or declined payment, if available in Zapier. If not, a daily check of Instalment Records past due with no payment.
- Steps: Slack alert to the payments channel with name, amount and product. Close task for the deal owner. Note on the lead.
- Optional: a text to the client with the update-card link.

## M3. Refunds (Build new)

- Trigger: Fanbasis refund or dispute, if available. If not, an Airtable refund form.
- Steps: create the Refund Record linked to the payment, customer and product. The clawback formulas already exist. Add a note in Close. If fully refunded, move the lead out of Customer. Slack alert.

## M4. Payment plans live in Airtable only (Fix big)

- C1 creates installment records in Airtable when a deal closes on a plan. Close keeps one won deal at the contract value.
- Stop creating "Installment Pending" deals in Close. Migrate the existing ones into Airtable records, then remove the two installment stages (X1).
- M1 marks installments paid automatically.

## A1. Agreement signed (Fix big)

- Turn the "New Contract > Slack" Zap back on and add:
  1. Close: find the lead by the signer's email.
  2. Close: set "Agreement Signed" date on the deal and add a note with the document name.
  3. Slack post (existing step).
- If DocuSign sends from a template, later improvement: C1 sends the agreement automatically when a deal closes.

## A2. Onboarding and fulfillment handoff (Fix big)

- Trigger: deal Won (from C1 or M1). The welcome email moves here from the separate Onboarding Email Zap.
- Steps:
  1. Welcome email (existing copy).
  2. Slack post to the fulfillment channel with client, product and Close link.
  3. Intake form submitted (existing Zap): also add a note on the Close lead.
  4. Kickoff booked (existing Zap): also add a note and a "Kickoff Booked" date on the Close lead.
  5. If no kickoff is booked within 48 hours of Won: reminder email and text to the client, plus a Slack nudge to fulfillment.

## D1. Reporting data fixes (Fix big)

- Renewals missing from monthly totals: inside Airtable, check the automation that links payments to reporting periods. Renewals have no product or customer link (fixed by M1), which is the likely reason they're skipped. After M1, relink the 6 missing payments by hand.
- Add a Close lead ID field to Lead Base, Customer, Customer Products, Payment Records and EOC, and backfill by email so tables join on IDs instead of emails or names.
- Backfill Lead Base with all Close leads (825 today vs 1,481 in Close).

## D2. Weekly and monthly sales update (Build new)

- Trigger: Zapier Schedule, Monday 8am Eastern (weekly) and the 1st of the month (monthly).
- Steps: Airtable "Find Records" (or a Code step totaling a filtered view) for the period, then a Slack post:
  - New leads, by source
  - Calls booked
  - Shows and show rate
  - Offers
  - Closed deals (excluding deposits) and close rate
  - Cash collected (new vs recurring)
  - Deposits outstanding
- Depends on FS-06, FS-07, M1 and D1. Without those, the numbers will be wrong.

## D3. Weekly data check (Build new, optional)

- Monday Slack post to an ops channel listing:
  - duplicate leads by email
  - leads with more than one open deal
  - open deals on DQ or Lost leads
  - payments without a customer link
  - EOCs without a Close lead ID

## T1. Rep onboarding and offboarding (Build new SOPs, Fix small on the Zap)

- Onboarding Zap: keep it and apply FS-13. Also write the new rep's Slack ID and Close user ID into the User ID Lookup table.
- SOPs: see SOP-12 and SOP-13 in Part 6.

---

# Part 5: issues register

Severity: Critical means reported numbers or revenue are wrong. High means leads or money are being mishandled. Medium means data quality or operational risk. Low means hygiene.

Status: Confirmed means checked against the data or Zap config. Inferred means the effect is confirmed but the cause sits where the APIs can't see (Airtable automations, Calendly, Kit). Unverified means not yet checked.

| ID | Sev | Issue | Evidence | Status | Fix |
|---|---|---|---|---|---|
| ISS-01 | Critical | Lead-level paid flag never fires. Lead Base `Is Paid` checks 4 source fields for "Paid Ad"; Zaps write "Paid Ads". | 0 of 825 leads paid. Sales Metrics All Time: Paid Leads 0, Organic Leads 825. Paid set rate, paid CPL and paid cash per lead are all wrong. | Confirmed | FS-07, N2 |
| ISS-02 | High | Two definitions of "paid". Calls and cash use a manual `Lead Source` dropdown on the EOC (85 Paid, 98 Organic); leads use automation tags. The two halves of the paid funnel can't be compared. | EOC formula `Paid: Closed Deals = IF(AND({Lead Source}="Paid",{Closed Deals}=1),1,0)` | Confirmed | N2 |
| ISS-03 | Medium | Ad Spend table is empty, so ROAS, CPA and CPL read $0. | 0 records | Confirmed | Not planned. ROAS stays blank until ad spend is entered. |
| ISS-04 | Critical | Fanbasis renewals and back-dated payments aren't linked to calendar periods, so monthly and yearly finance totals are understated. | All 5 renewals plus 1 back-dated payment are missing from their calendar month: Aug $2,400, Sep $1,200, Oct $4,600. One renewal ($2,400) has no date at all. "October 2026" shows $22,800 vs $27,400 actual. "2026" shows $77,783 vs "YTD" $85,983. | Confirmed (effect). Cause inferred: the Airtable automation that links periods appears to require data the renewal Zap doesn't set (renewals have no Product or Customer link). The Airtable API doesn't expose automations, so this needs a look inside Airtable. | D1, D1 |
| ISS-05 | Critical | Deposits and installment payments count as closed deals, against the business rule. | Airtable `Closed Deals` = 1 whenever Call Outcome is "Closed", so all 6 Deposit EOCs and all 6 Instalment Paid EOCs count as new closed deals. Close pipeline stage "Deposit Paid" is a won stage (5 opps). | Confirmed | FS-05, FS-06, C1 |
| ISS-06 | High | Duplicate EOC submissions double-count outcomes. | 3 lead/date pairs have two EOCs: Closed + Closed, Closed + Offer Made, No Show + Disqualified. | Confirmed | C1 (one EOC per call; dedupe on lead ID and call date) |
| ISS-07 | Critical | Slow speed to lead and many leads never contacted. | Leads created Sept 1 to Nov 12 (421): 27% have no outbound call or SMS in Close, median first touch 100 minutes, 82 reached within 5 minutes. Paid Ads: 6% untouched, median 114 minutes. | Confirmed (measured from Close activity; IG DMs and personal-phone calls aren't captured) | N1 (Slack alert), L1 (smart lists), P1 |
| ISS-08 | High | Freebie opt-ins post to the applications channel with "Dial ASAP", burying real applications. | 3 freebie Zaps use the same channel as applications. Untouched rates: Anxious to Confident 75%, Commitment Training 67%, Relationship Quiz 42%. | Confirmed | FS-10 |
| ISS-09 | Medium | Lead handoff depends on a Slack ✅ reaction and a regex reading the bot's message text. | Zap "(New Lead) Setter React" | Confirmed | B2 |
| ISS-10 | High | Every booking creates a new $7,200 deal, even when one is open. | 7 leads have 2 to 3 open Interview opps created hours or days apart, including a signed client and an NGMI lead. | Confirmed | B1 |
| ISS-11 | High | Reschedules come through as new bookings. The Zap filters on `rescheduled = false`, but Calendly sets that flag on the canceled original, and the new booking arrives with `rescheduled = false` and `old_invitee` set. | Zap filter config plus Calendly's reschedule docs | Confirmed | R3 |
| ISS-12 | High | Calendly cancellations aren't used. Cancels only register if a rep changes the Close status. | No Zap on invitee canceled | Confirmed | R2 |
| ISS-13 | High | Re-opt-ins knock leads back to "New Lead". | 8 leads currently in New Lead that hold Lost, Interview or Pending Close opps. Close history shows moves such as Canceled to New Lead, No show to New Lead, Closer Follow Up to New Lead, and New Opportunity to New Lead. | Confirmed | FS-08 |
| ISS-14 | High | Source fields are overwritten on every touch, so first-touch attribution doesn't exist. | Update steps in 8 Zaps write Opt Source and Applied Source unconditionally. 30 leads now show Opt Source "Setter Booking". | Confirmed | FS-08, N2 |
| ISS-15 | Medium | The DCB Zap labels DCBA, DCBIG and DCBE bookings all as "Paid Ads". | Zap config | Confirmed (config). Meaning of the codes unverified. | FS-15 |
| ISS-16 | High | Payment amounts with cents are corrupted in Close. The Zap builds cents by appending "00" to the dollar text. | EOC cash $1,133.33 became a $11.33 opp. Every amount with decimals is affected. | Confirmed | FS-04, C1 |
| ISS-17 | High | EOC updates whichever opp Close returns first. | Zap config ("first" result). A signed client still holds 2 open Interview opps. | Confirmed | B1, C1 (target the opp by ID) |
| ISS-18 | High | Pipeline is inflated with dead deals. | $700,800 open across 98 opps. 15 leads in DQ, NGMI, Canceled, No show or signed statuses hold open sales opps worth $136,800. | Confirmed | FS-18, X1 |
| ISS-19 | Medium | Opps are created with a $7,200 placeholder value. | All 68 Interview opps = $7,200 | Confirmed | B1 (no value until offer or close) |
| ISS-20 | High | Payment plans are tracked in two places, and only one gets updated. Installment payments create new won opps in Close but never mark the Airtable installment paid. | 4 EOCs report an in-house plan. 2 installment records in Airtable. 7 "Installment Paid" opps in Close. | Confirmed | M4, M1 |
| ISS-21 | High | Fanbasis payments don't update Close. | Fanbasis Zaps write to Airtable and Slack only | Confirmed | M1 |
| ISS-22 | High | Payments aren't linked to customers or reps, which misclassifies cash. | 18 of 43 payment records unlinked. 8 first-ever payments ($16,100) are classified "Recurring" because they're unlinked, so New Cash is understated by that amount. | Confirmed | M1 |
| ISS-23 | High | Commission is calculated on payments with no rep attached. | 26 payments with no closer carry $4,605 of closer commission and $912.50 of setter commission. | Confirmed | M1 |
| ISS-24 | Medium | No processor transaction ID is stored, so a replayed Zap would double-count. | Payment Records schema | Confirmed | M1 |
| ISS-25 | Medium (latent) | EOC skips payment records for Whop, Shopify and Stripe, but only Fanbasis has a processor Zap. | Filter config. No loss yet, since every payment to date was Fanbasis. | Confirmed | FS-11 |
| ISS-26 | Low | Net amount is calculated two ways (Fanbasis earnings vs a hardcoded 3.9% fee). | Zap config | Confirmed | M1 |
| ISS-27 | Medium | Google Sheets act as an incomplete third ledger (Fanbasis new sales are missing). | Zap config | Confirmed | Retire once nobody reads them (confirm with Mitch) |
| ISS-28 | High | No ongoing re-engagement. The only sequence was a one-time blast from Kimberly's main inbox that mostly failed. | 759 leads enrolled in under a minute on Jul 15: 518 `account-failures` (Close couldn't send through the mailbox), 218 finished, 22 replied, 1 booked. 0 sequence emails since Sept 1. | Confirmed | Retire the Close sequence. Re-engagement runs as Kit blasts (outside scope). |
| ISS-29 | High | Follow-up dates are collected but no task is created. | 33 leads in Closer Follow Up, 19 open tasks org-wide, 9 overdue | Confirmed | FS-03, C1 |
| ISS-30 | High | No visible pre-call process (confirmations, reminders, triage, brief). | Nothing in Close or Zapier | Confirmed for Close and Zapier. Calendly reminders and Kit sequence 2893474 unverified. | P1 to P1 |
| ISS-31 | High | No-shows and cancels get a Slack post only. Nothing goes to the lead and no task is created. | Zap config | Confirmed | R2, R1 |
| ISS-32 | Low | EOC Slack summary shows the 3rd installment date in place of the amount. | Code step maps `amt_3` to "Date of 3rd Instalment" | Confirmed | FS-01, C1 |
| ISS-33 | Medium | Call dates are converted UTC to UTC and stored date-only, so evening calls can land on the next day. | Comparing first calls: Close's date is exactly 1 day later than the closer's EOC date in 9 cases, 1 day earlier in 3. | Confirmed (pattern consistent with the UTC rollover) | B1 |
| ISS-34 | High | Systems join on email or rep name. No Close ID is stored in Airtable. | Schema. Lookups use name text and email. | Confirmed | N1, C1, Phase 1 backfill |
| ISS-35 | High | One setter is missing from Rep Scorecard. The scorecard dropdown says "Sidonie Claurans"; EODs and EOCs say "Sidonie Chechin". | 0 scorecard rows for Sidonie despite 59 EODs and 18 EOCs | Confirmed | FS-12 |
| ISS-36 | Medium | Rep attribution is missing on EOCs. | Setter blank on 157 of 183, closer blank on 54 of 183 | Confirmed | C1 (required fields) |
| ISS-37 | Medium | Duplicate leads and missing phones. | 15 emails on more than one lead (33 leads). 508 leads without a phone. | Confirmed | FS-18, N1 |
| ISS-38 | Medium | Lead Base is a partial copy of Close. | 825 vs 1,481 | Confirmed | Phase 1 backfill |
| ISS-39 | Medium | Airtable "Minutes to Claim" measures nothing (date-only field, set by the Slack reaction). | Median 0, two negative values | Confirmed | D2 |
| ISS-40 | Low | Close fields Fathom URL and Traffic Type are never filled, though every EOC has a Fathom link. | 0 of 1,481 filled | Confirmed | FS-02, N2 |
| ISS-41 | Medium | Kit runs before Close in 6 Zaps, so a Kit failure stops the lead reaching Close. | Zap config | Confirmed | FS-09 |
| ISS-42 | Medium | No error alerting. The 88-step EOC Zap can write Slack and Sheets, then fail before Close and Airtable. | Zap config. Actual failure rate unknown. | Confirmed (config). Failure rate unverified until the Zap History export is provided. | C1. Optional: one Zap error alert Zap. |
| ISS-43 | Low | Zapier acts in Close as Kimberly, so the audit trail can't tell automation from owner. | Status history attributes Zap-driven changes to "Kimberly Rae" | Confirmed | Optional: dedicated Close automation user |
| ISS-44 | Medium | Config is hardcoded and partly hidden. A Zapier Table (`01KS2T7RQ0MGGM5C8645K8RDHP`) maps EOC answers to Close status IDs, and channel, field and status IDs are hardcoded across Zaps. | Zap config | Confirmed | C1 (IDs live in one config block), SOP-15 |
| ISS-45 | Low | 4 near-identical Kajabi Zaps. | Zap config | Confirmed | N1 |
| ISS-46 | Low | New Google Workspace accounts start with one shared hardcoded password, with no forced change. | Zap config | Confirmed | FS-13 |
| ISS-47 | Low | Leftover Zaps: an empty draft, and the DocuSign Zap switched off. | Zap list | Confirmed | FS-17 |
| ISS-48 | Medium | Smart views filter on "lead updated", and every automation update resets that time, so leads drop out of working views. | Smart view definitions (Gold Rush, 3 Day No Book, No Shows, Re-Engagement) | Confirmed (config). Effect on specific leads not measured. | FS-19 (L1) |
| ISS-49 | High | The sales process is tracked twice: lead statuses (setter and closer stages) and one deal pipeline. They disagree. | 15 leads in DQ, Canceled, No show or signed statuses still hold open deals. Deals only start at booking, so there is no "Not Booked" stage. | Confirmed | X1 |
| ISS-50 | High | Agreements: the "New Contract > Slack" Zap is off, so a signed agreement updates nothing (not Slack, not Close). | Zap status off | Confirmed | A1 |
| ISS-51 | High | The "Gold Rush (Paid Ads)" smart view requires all three source fields to say "paid", so it hides paid applicants who never booked. | Shows 94 of 223 paid leads | Confirmed | FS-19 (L1) |
| ISS-52 | Medium | No smart lists for 3 to 7 day leads, cancellations or reschedules. "3 Day No Book" covers 0 to 3 days. | Smart view definitions | Confirmed | FS-19 (L1) |
| ISS-53 | Medium | No show/no-show field on the lead or deal, so show rate can only come from Airtable. | Close field list | Confirmed | C1, N2 |
| ISS-54 | Medium | Fathom recordings never reach Close, and Slack gets the typed EOC summary, not the recording summary. | Close Fathom URL field empty on all 1,481 leads | Confirmed | C2 |

### Corrections from earlier drafts

- Retracted: "12 Close seats including duplicates." Only 4 memberships are active. The other 8 are already deactivated.
- Narrowed: paid vs organic. The lead-level split is broken (ISS-01). The call and cash split runs off a manual dropdown (ISS-02).
- Sharpened: finance periods. The missing records are specifically renewals and back-dated entries (ISS-04).
- Widened: deposits. Installment payments are also counted as closed deals (ISS-05).
- Downgraded: the onboarding password, to Low.

---

# Part 6: SOPs to write

None of these exist as written procedures in the systems reviewed. Leah writes each one after the matching build, so it describes how the system actually behaves.

| ID | SOP | Covers | Linked items |
|---|---|---|---|
| SOP-01 | Lead and source standards | Required fields, what each source field means, never create a lead without searching first | N1, N2 |
| SOP-02 | Pipeline stages and statuses | What each deal stage and lead status means, who moves it, what it triggers | X1 |
| SOP-03 | Working the smart lists | Which list to work in which order, how to log attempts so lists stay accurate | FS-19 |
| SOP-04 | Booking and rescheduling | Which Calendly event to use, always reschedule through the reschedule link, never cancel and rebook | B1, R3 |
| SOP-05 | Submitting the EOC | One per call, required fields per outcome, deposits logged as Deposit, follow-up date required for Offer Made | C1 |
| SOP-06 | Correcting an EOC | Edit, never resubmit. What to fix by hand downstream | C1 |
| SOP-07 | No-show, cancel, reschedule | Moving the deal to the right stage, what the drip already sent, when to mark Lost | R1, R2, R3 |
| SOP-08 | Deposits and payment plans | Logging a deposit, entering a plan, changing plan terms | C1, M4 |
| SOP-09 | Unmatched and failed payments | Where alerts land, how to link a payment, how to follow up a failed card | M1, M2 |
| SOP-10 | Refunds and chargebacks | Recording a refund so clawback and Close update | M3 |
| SOP-11 | Agreement and client handoff | Sending the agreement, what happens on signing, checking the onboarding steps | A1, A2 |
| SOP-12 | Rep onboarding | Google account, Close seat, User ID Lookup row (Close ID, Slack ID), Calendly, Slack channels | T1 |
| SOP-13 | Rep offboarding | Deactivate Close, suspend Google, remove from Calendly round robin, reassign open leads and deals, remove from Slack | T1 |
| SOP-14 | Weekly report and data check | Reading the weekly numbers, working the data check list | D2, D3 |
| SOP-15 | Changing automations safely | Change IDs in one place (the code config block), test checklist, change log, never rename a status or dropdown value without checking which Zaps use it | All |
| SOP-16 | Adding a lead source, form or event type | Add it to the source dropdowns and the Zap lookup, test one submission end to end | N2, B1 |
| SOP-17 | Connections and API keys | Which account each Zapier connection runs as, rotating keys when someone leaves or a key is shared | All |

---

# Part 7: build order

Each step gets tested before the next one starts.

1. Small fixes: FS-01 to FS-19. Most of the data damage stops here.
2. Close structure: X1 (new stages and the Active Deal ID field), N2 (source fields), N1 (Not Booked deals).
3. Booking: B1, B2, R3.
4. Pre-call: P1, then switch off Calendly reminders.
5. Call outcome: C1, C2.
6. Recovery drips: R1, R2.
7. Money: M1, M4, M2, M3.
8. Handoff: A1, A2.
9. Reporting: D1, then D2 and D3.
10. SOPs alongside each step. T1 can go any time.

Test every flow against:
- a new lead
- an existing lead
- a lead in a closed status
- a duplicate email
- a missing phone
- an amount with cents
- a call after 8pm Eastern
- a reschedule
- a cancel

## Open items

| Item | Affects | Needed from |
|---|---|---|
| Calendly access: event types (which are triage), reminder settings | B1, P1, R2, R3 | Client |
| Airtable automation that links payments to periods | D1 | Leah, inside Airtable |
| What DCBA, DCBIG and DCBE stand for | FS-15 | Mitch |
| Does Fanbasis offer failed payment and refund triggers in Zapier | M2, M3 | Leah |
| Does the Close plan support Workflows with SMS and Zapier enrollment | P1, R1, R2, R3 | Leah |
| Does the Fathom plan include the Close integration | C2 | Leah |
| Does anyone use the two Google Sheets the EOC and renewal Zaps write to | Retire or keep | Mitch |
