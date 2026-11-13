# Kimberly Rae Coaching: sales automation plan

For Mitch (overview) and Leah (build guide).
Based on a read-only review on Nov 12 and 13, 2026 of Zapier (23 Zaps), Close (1,481 leads, 222 deals), Airtable (15 tables) and Calendly (every booking since Sept 1).

## What's wrong today

The system runs day to day. Leads reach Close, Slack gets pinged, closers fill in EOCs. Underneath, the data and follow-through have gaps:

- The numbers are wrong. 0 of 825 leads count as paid in Airtable because of a one-word typo. October's finance total shows $22,800 against $27,400 actually collected (renewals are missing). Deposits and installment payments are counted as new closed deals.
- The pipeline is inflated. Every booking and reschedule creates a new $7,200 deal, and Calendly cancellations never reach Close. Close shows $700,800 of open pipeline, $136,800 of it on leads that are dead or already signed.
- Money doesn't flow back. Fanbasis payments never update Close. A $1,133.33 payment shows in Close as $11.33.
- No follow-through. There are no reminder texts from Close, no no-show or cancel follow-up, follow-up dates don't create tasks, Fathom recordings never reach Close, and signed agreements update nothing.

The fix keeps the current setup and changes only what's needed. The overview below shows what a high-ticket sales team needs at each stage and where Kimberly Rae Coaching stands. After that, each fix is one build card: the system, what starts it (trigger), what it achieves, the steps, and what to watch out for.

---

## How Close is set up today

Close has one pipeline, "Sales", and deals only start when a call is booked. The setter and closer stages live in lead statuses instead (New Lead, New Opportunity, Closer Follow Up, No show, Canceled and so on). Setter Owner and Closer Owner are custom fields. The plan keeps this setup and only adds a "Not Booked" stage and a hidden "Active Deal ID" field (card 1).

## What's needed, stage by stage

Verdicts: Keep (works as is), Fix (change something that exists), Build (doesn't exist yet). The card number points to the build steps further down.

### 1. New lead comes in

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Lead created in Close | 6 form Zaps (IG, Paid Ads, Kajabi application, 3 Kajabi freebies) | Fix: they reset status and overwrite the source on existing leads | 3 |
| Deal created at "Not Booked" | No. Deals only start at booking | Build | 1, 3 |
| Webinar exception | No webinar source exists | Not needed | |
| Sources tracked | Opt, Applied and Book Source fields | Fix: overwritten on every form; Traffic Type never filled | 3, 4 |
| Typeform answers and UTMs tracked | Answers saved as a note. No UTMs | Fix: add UTM tracking | 3 |

### 2. Speed to lead

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Slack alert "ready to be called" | NEW APPLICATION channel, "Dial ASAP" | Keep. Fix: freebies get their own channel so they don't bury applications | 3 |
| Smart list: new applications | "New Apps" | Keep | |
| Smart list: day-old leads | "Gold Rush" and "Gold Rush (Paid Ads)" | Fix: leads drop off the lists; Paid Ads list shows 94 of 223 paid leads | 6 |
| Smart list: 3 to 7 day leads | "3 Day No Book" covers 0 to 3 days | Fix | 6 |

### 3. Call booked

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Deal moves from Not Booked to Booked | A new $7,200 deal on every booking and reschedule | Fix | 4 |
| Triage vs closing call | No triage call type. Every booking is the same 45-minute call with Makena (setter-booked or direct) or a live transfer | Keep | |
| Assigned to the right closer | Matched from the Calendly host | Keep. Fix: make the match exact | 4 |
| Booking posted to Slack | Yes | Keep | |
| Booking source tagged | All direct bookings labeled "Paid Ads", including Instagram and email links | Fix | 4 |
| Setter claims the booking (✅ in Slack) | Works | Keep. Optional hardening | 22 |

### 4. Pre-call

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Instant text and email | Nothing in Close. Calendly sends its own | Build in Close, switch Calendly's off | 9 |
| Reminders 24 hours and 1 hour before | Nothing in Close. Calendly texts only the 40% who give a number | Build in Close, switch Calendly's off | 9 |

### 5. Post-call

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Call outcome recorded (EOC) | Airtable form plus an 88-step Zap | Fix: money, follow-up, Fathom and deal steps | 5 |
| Showed / no-show tracked | Only in lead status and the EOC | Fix (part of the EOC fix) | 5 |
| Fathom recording on the lead | Closers paste the link into the EOC; it never reaches Close | Build | 13 |
| Fathom summary in Slack | No. Slack gets the typed EOC summary | Build | 13 |
| EOC summary in Slack | Yes | Keep | |
| Follow-up task from the follow-up date | No | Fix | 5 |

### 6. No-show, cancel, reschedule

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Closer marks No Show | Lead status "No show" | Keep | |
| No-show, cancel and reschedule alerts in Slack | Yes | Keep | |
| No-show drip | None | Build | 10 |
| Cancels reach Close automatically | No. 55 of 97 direct bookings were canceled by the host and Close never knew | Build | 11 |
| Cancel win-back drip | None | Build | 11 |
| Reschedule link drip | None. Reschedules also create duplicate deals | Build | 12 (drip), 4 (duplicates) |
| Smart lists: no-shows, cancels, reschedules | "No Shows" only, and leads drop off it | Fix and build | 6 |

### 7. Payment

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Payment received alert | Fanbasis to Slack | Keep. Fix: also update Close and link to the client and rep | 14 |
| Deposits not counted as closed deals | They are, in Close and Airtable. Installment payments too | Fix | 1, 2 |
| Payment plans tracked once | Duplicated in Close deals and Airtable | Fix | 5 |
| Failed payment alert | None | Build | 15 |
| Refund automation | None | Build | 16 |

### 8. Agreement and onboarding

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Agreement signed updates Slack and Close | Zap exists but is off, and only posts to Slack | Fix | 17 |
| Welcome email | Yes | Keep | |
| Intake and kickoff tracked | Posted to Slack only | Fix: also write to Close, remind if no kickoff | 18 |

### 9. Reporting

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Correct sales and finance numbers | Wrong: paid flag, missing renewals, deposits counted as deals | Fix | 2, 5, 14 |
| Weekly and monthly update in Slack | None | Build | 19 |
| Weekly data check | None | Build, optional | 20 |

### 10. Team

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Rep onboarding Zap | Works, shared starting password | Fix | 8 |
| Rep onboarding and offboarding SOPs | None | Build | 21 |
| Setter EOD and reminder | Works | Keep | |

---

## Build cards: table of contents

Do them in this order. Part A is quick fixes to things that already exist. Part B is new automations.

### Part A: quick fixes

| # | What it is | How to make it happen |
|---|---|---|
| 1 | Close settings | Add one pipeline stage and three fields, change one stage setting |
| 2 | Airtable formulas | Fix three formulas and one dropdown |
| 3 | Lead form Zaps (6) | Stop overwriting leads, create a deal for every new lead, track UTMs |
| 4 | Booking Zaps (2) | Update the existing deal instead of creating a new one, handle reschedules, label sources correctly |
| 5 | EOC Zap | Fix the money, follow-up and Fathom steps. Optional: replace with a code step |
| 6 | Setter smart lists | Fix 4 lists, add 2 |
| 7 | Data cleanup | Close dead deals, merge duplicates, link loose payments |
| 8 | Housekeeping | Delete a draft Zap, fix the new rep password |

### Part B: new and bigger automations

| # | What it is | How to make it happen |
|---|---|---|
| 9 | Pre-call reminders | Close text and email: right away, 24 hours before, 1 hour before |
| 10 | No-show follow-up | Close drip that starts when a lead is marked No show |
| 11 | Cancellation handling | Calendly cancel goes to Close; lead cancels get a win-back drip |
| 12 | Reschedule follow-up | Close drip with the reschedule link |
| 13 | Fathom to Close and Slack | Recording link and summary land on the lead and in Slack |
| 14 | Payment received | Fanbasis updates Close and Airtable, then Slack |
| 15 | Failed payment alert | Slack alert and Close task when a payment fails |
| 16 | Refunds | Refund record, commission clawback, Close note |
| 17 | Agreement signed | DocuSign updates Close and Slack |
| 18 | Client onboarding handoff | Welcome, intake and kickoff tracked in Close |
| 19 | Weekly and monthly numbers | Slack report: leads, show rate, close rate, cash |
| 20 | Weekly data check (optional) | Slack list of records that need fixing |
| 21 | Rep onboarding and offboarding | Two checklists |
| 22 | Setter ✅ claim (optional) | Make the Slack reaction Zap harder to break |

After the cards: the SOPs to write, open questions, the full list of changes I suggest, and an appendix with the evidence behind every fix.

---

# Part A: quick fixes

## 1. Close settings

**System:** Close, Settings.

**Trigger:** None. One-time setup in Close settings.

**Outcome:** Close can hold a deal from the moment a lead arrives, deposits stop counting as wins, and every automation knows which deal to update.

**Steps:**
1. Settings, Pipelines, Sales: add a stage "Not Booked" (type Active) and drag it to the top.
2. Same screen: change "Deposit Paid" from Won to Active.
3. Settings, Custom Fields, Lead: add a text field "Active Deal ID". Hide it from the lead page if you like; only Zaps use it.
4. Same screen: add four text fields "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content".

**Keep in mind:**
- Don't rename or delete any existing status, stage or field. Zaps reference them by ID and will break silently.
- Changing Deposit Paid to Active moves the 5 existing deposit deals out of "won" reports. That's intended.

## 2. Airtable formulas

**System:** Airtable, "Kimberly Rae Coaching - Master Base".

**Trigger:** None. One-time formula edits.

**Outcome:** Paid vs organic works, deposits and installment payments stop counting as new deals, and Sidonie shows up on the scorecard.

**Steps:**
1. Lead Base, field "Is Paid": in the formula, replace every `"Paid Ad"` with `"Paid Ads"` (four places).
2. EOC Report Responses, field "Closed Deals": replace the formula with
   `IF(AND({Call Outcome}="Closed",{Payment Type}!="Deposit",{Payment Type}!="Instalment Paid"),1,0)`
3. Rep Scorecard, field "Rep Name": rename the option "Sidonie Claurans" to "Sidonie Chechin".

**Keep in mind:**
- Check Sales Metrics "All Time" after step 1. Paid Leads should jump from 0 to about 230.
- Past months recalculate automatically. Tell Mitch the closed-deal counts will drop; that's the correction.

## 3. Lead form Zaps

**System:** Zapier. Six Zaps: IG Application, Paid Ads Application, Kajabi Application, Kajabi Relationship Quiz, Kajabi Commitment Training, Kajabi Anxious to Confident Blueprint.

**Trigger:** Unchanged. Typeform "New Entry" (IG form and Paid Ads form) and Kajabi "New Form Submission" (application and 3 freebie forms).

**Outcome:** An existing lead or client who fills in another form keeps their status and original source. Every new lead gets a deal at Not Booked. Freebie opt-ins stop burying real applications. UTMs are tracked.

**Steps (in each of the six Zaps):**
1. "Lead Exists" path, "Update Lead in Close" step: delete the Status, Opt Source and Applied Source fields. Keep the note step.
2. Drag the two Kit steps (tag and sequence) so they run after the last Close step.
3. "Lead Does Not Exist" path, "Create Lead" step: set Traffic Type to Paid for the Paid Ads Zap, Organic for the others.
4. After the Close lead step in both paths, add:
   - Close "Find Opportunity" on that lead, status Active.
   - Filter: only continue if no opportunity was found.
   - Close "Create Opportunity": stage Not Booked, no value.
   - Close "Update Lead": Active Deal ID = the new opportunity's ID.
5. Three freebie Zaps only: change the Slack channel to a new low-priority channel (for example #freebie-optins) and remove "Dial ASAP" from the message.
6. IG and Paid Ads Zaps only: in Typeform, add hidden fields `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. Make sure the ad and landing page links pass them. Map them to the new UTM fields in Close.

**Keep in mind:**
- Test each Zap twice with the same email. The second run must not change the status or Opt Source and must not create a second deal.
- Opt Source now means "where they first came from", because nothing overwrites it anymore.

## 4. Booking Zaps

**System:** Zapier. "Setter Booking -> Close -> Slack -> Airtable" and "DCB Booking -> Close -> Slack -> Airtable".

**Trigger:** Unchanged. Calendly "Invitee Created". Setter Booking Zap filters on event names containing "(SB)" or "Live"; DCB Zap on "DCBA", "DCBIG" or "DCBE".

**Outcome:** One booking = one deal. Reschedules update the same deal. The right closer is assigned. Direct bookings are labeled with their real source.

**Steps (in both Zaps unless noted):**
1. Delete the filter "rescheduled = False". It doesn't do anything useful: Calendly sends reschedules as new bookings.
2. Add a Paths step right after the trigger:
   - Path "Reschedule": continue if `old_invitee` exists. Find the lead in Close by email, update Date Of Call with the new time, add a note "Rescheduled to [time]", and stop. (Card 9's reminders then follow the new time.)
   - Path "New booking": everything below.
3. User ID Lookup "Find Record" step: set "Exact match" to Yes.
4. Replace the "Create Opportunity" step with:
   - If the lead's Active Deal ID has a value, Close "Update Opportunity" on that ID: stage "New Deal - Mentorship Interview", user = the closer.
   - If it's empty, Close "Create Opportunity" at that stage, then save its ID to Active Deal ID.
   - Remove the 720000 value. Leave value empty until the EOC sets it.
5. "Update Lead" and "Create Lead" steps: delete Opt Source and Applied Source. Keep Book Source.
6. Date formatting step: format as date and time in America/New_York, not date only in UTC.
7. Drag the two Kit steps to after the last Close step.
8. DCB Zap only: replace the hardcoded "Paid Ads" with a Formatter Lookup Table on the Calendly event name: DCBA = Paid Ads, DCBIG = Instagram, DCBE = Email.

**Keep in mind:**
- Confirm the DCBA, DCBIG and DCBE meanings with Mitch before step 8.
- Test: book, then reschedule the same booking. Close must show one deal with the new time.
- Test a booking for 9pm Eastern. The call date must not jump to the next day.

## 5. EOC Zap

**System:** Zapier, "EOC Form -> Close -> Slack -> Airtable" (88 steps, triggered by the Airtable EOC form).

**Trigger:** Unchanged. Airtable "New Record" in EOC Report Responses (a closer submits the EOC form).

**Outcome:** Amounts with cents save correctly, every follow-up date becomes a Close task, the Fathom link lands on the lead, installment payments stop creating fake deals, and the right deal gets updated.

**Steps:**
1. Code step at the top, Input Data: `amt_3` is mapped to "Date of 3rd Instalment". Change it to "3rd Instalment Amount".
2. Every Close step where a value ends in `00` (for example `{{Cash Collected}}00`): add a Formatter step before it, Numbers, Spreadsheet-Style Formula, `ROUND({{Cash Collected}}*100,0)`, and map that output instead. Do the same for each installment amount.
3. Every "Update Lead in Close" step: add Fathom URL = "Fathom Share Link".
4. "No Close / Follow Up" path: add Close "Create Task", assigned to the closer's Close ID, due on "Follow Up Date", text "Follow up: {{Lead Full Name}}". Put a filter before it so it only runs when Follow Up Date has a value.
5. Every Close "Update Opportunity" step: set the opportunity ID to the lead's Active Deal ID (from card 1) instead of the "Find Opportunity" result.
6. The four Payment Method filters: remove the Whop, Shopify and Stripe conditions. Keep Fanbasis.
7. "Payment Plan (Create Opportunities)" path: delete the five Close "Create Opportunity" steps (Instalment 2 to 6). Keep the Airtable installment steps.
8. "Instalment" path: delete the Close "Create Opportunity" step.

**Optional: replace the 88 steps with a code step.** The same Close and Airtable steps are copied into every path, which is why it's 88 steps. The file `kimberly-rae/code/eoc-decide.js` (in the repo) makes every decision in one Code by Zapier step: lead status, deal stage, value in cents, whether it's a real closed deal, whether to create a task, the installment list and the Slack message. Then about 12 normal steps do the writing. It's tested on every outcome in the form. Build it as a new Zap, test it on copies of real EOCs, then switch the old one off.

**Keep in mind:**
- After step 2, fix the $11.33 deal in Close by hand (it should be $1,133.33).
- Test with an amount that has cents, a deposit, a payment plan and an Offer Made with a follow-up date.
- The code needs no API keys. Don't add any to it.

## 6. Setter smart lists

**System:** Close, Smart Views.

**Trigger:** None. Smart views update on their own.

**Outcome:** Setters have accurate call lists: day-old leads, 3 to 7 day leads, no-shows, cancels and reschedules.

**Steps:**

| List | Change |
|---|---|
| Gold Rush (day-old leads) | Replace "lead updated not in last 24 hours" with "created in the last 1 day" and "last call more than 24 hours ago or never" |
| Gold Rush (Paid Ads) | Change the three source conditions from AND to OR, then apply the same date change |
| 3 Day No Book | Rename "3 to 7 Day Leads". Created 3 to 7 days ago, status New Lead |
| No Shows | Replace "lead updated" with "last call more than 6 hours ago or never" |
| Cancellations (new) | Status Canceled, last call more than 6 hours ago or never |
| Reschedules (new) | Status New Opportunity - Reschedule, last call more than 6 hours ago or never |

**Keep in mind:**
- "Lead updated" changes every time a Zap touches the lead, which is why leads were disappearing from these lists. Always filter on calls or creation date instead.
- The Paid Ads list currently shows 94 of 223 paid leads. After the fix it should show all of them.

## 7. Data cleanup

**System:** Close and Airtable, by hand.

**Trigger:** None. One-time manual cleanup.

**Outcome:** Pipeline and finance numbers start from a clean base.

**Steps:**
1. Close: move the 15 open deals on DQ, NGMI, Canceled, No show or signed leads to Lost (or Won where the lead is a client).
2. Close: on the 7 leads with more than one open interview deal, keep the newest and mark the others Lost.
3. Close: deal with the 20 open deals and 10 "New Lead - DCB" leads whose Calendly booking was canceled by the host. Ask Mitch whether they're DQs.
4. Close: merge the 15 groups of duplicate leads (same email). Keep the oldest lead.
5. Airtable, Payment Records: link the 18 payments with no Customer or Customer Product. Add the missing date on the renewal with no date.
6. Fill in Active Deal ID on leads that have one open deal (a CSV export and re-import works).

**Keep in mind:**
- Do cards 3, 4 and 5 first so new bad data stops arriving.
- I can produce the exact lists of leads and deals for each step.

## 8. Housekeeping

**System:** Zapier.

**Trigger:** Unchanged. Airtable "New Record" in New OB Form Responses (onboarding Zap).

**Outcome:** No leftover drafts, and new rep accounts aren't left on a shared password.

**Steps:**
1. Delete "Untitled Zap" (empty draft).
2. "New Rep Onboarding" Zap, Google Workspace step: turn on "Change password at next login".
3. Same Zap: add the new rep's Slack ID to the User ID Lookup record.

**Keep in mind:** leave "New Contract > Slack" alone; card 17 turns it back on.

---

# Part B: new and bigger automations

## 9. Pre-call reminders

**System:** Close Workflow (texts and emails from the closer's Close number and inbox). Started by the booking Zaps.

**Trigger:** A new booking. The booking Zaps (card 4) enroll the lead at the end of their run, or a Close smart view of status "New Opportunity" enrolls them automatically.

**Outcome:** Every booked lead gets a text and email right away, 24 hours before and 1 hour before the call, so more people show up.

**Steps:**
1. Close, Workflows, New: "Pre-Call Reminders".
2. Step 1, immediately: text and email confirming the time and Zoom link.
3. Step 2, 24 hours before the call: text and email reminder.
4. Step 3, 1 hour before the call: text and email with the Zoom link.
5. Stop the workflow when the lead status changes to No show, Canceled or a signed status.
6. Enroll: add a final step to both booking Zaps (card 4) that enrolls the lead in this workflow. Or, if the Close plan supports it, have the workflow enroll anyone who enters a smart view of status "New Opportunity".
7. Once it's working, switch off Calendly's reminder emails and texts on the consultation call event types.

**Keep in mind:**
- A quarter of calls are booked less than 16 hours ahead. Skip the 24-hour message when the call is less than 24 hours away.
- If Close can't time messages from the call time, keep these three reminders in Calendly instead and skip step 7.
- Calendly only texts the 40% of people who give a number. Close texts everyone with a phone number, so this is a real improvement.

## 10. No-show follow-up

**System:** Close Workflow. Starts when a closer sets the lead status to "No show" (as they do today).

**Trigger:** Lead status changes to "No show" in Close (set by the closer).

**Outcome:** Every no-show gets a rebook message within 5 minutes and follow-ups for a week, without anyone having to remember.

**Steps:**
1. Close, Workflows, New: "No-Show Rebook".
2. Within 5 minutes: text "Looks like we missed you. Grab a new time here: [booking link]".
3. Same time: email with the same link.
4. Day 1: text. Day 3: text and email. Day 7: final email.
5. Stop when the lead replies, books again, or is marked Lost.
6. Enroll anyone whose status changes to "No show" (smart view trigger, or a step in the existing No Show > Slack Zap).

**Keep in mind:**
- Keep the existing No Show > Slack Zap on.
- Test with your own phone number first.

## 11. Cancellation handling

**System:** New Zap, Calendly "Invitee Canceled". Close Workflow for the win-back.

**Trigger:** New Zap. Calendly "Invitee Canceled", filtered to real cancellations (rescheduled = false).

**Outcome:** Cancellations show up in Close automatically. Leads who cancel get won back. Bookings that the closer cancels (screened out) are marked DQ, not left as open deals.

**Steps:**
1. New Zap, trigger Calendly "Invitee Canceled".
2. Filter: `rescheduled` is false (reschedules are handled in card 4).
3. Close: find the lead by email.
4. Paths:
   - Canceled by the invitee (the lead): status Canceled. The existing Canceled > Slack alert fires. Enroll in a "Cancel Win-Back" workflow (same shape as card 10, with cancel wording).
   - Canceled by the host (the closer): status DQ, deal (Active Deal ID) to Lost, note with the cancel reason. No messages.
5. In Calendly, make a cancellation reason required for hosts.

**Keep in mind:**
- 55 of 97 direct bookings since September were canceled by the host with no reason. Confirm with Mitch that these are deliberate screen-outs before building the host path.
- Test both: cancel a test booking as the lead and as the host.

## 12. Reschedule follow-up

**System:** Close Workflow. Starts when a closer sets the status to "New Opportunity - Reschedule".

**Trigger:** Lead status changes to "New Opportunity - Reschedule" in Close (set by the closer).

**Outcome:** A lead who asks to move the call but hasn't picked a time gets the reschedule link right away and reminders until they book.

**Steps:**
1. Close, Workflows, New: "Reschedule Link".
2. Immediately: text and email with the booking link.
3. Day 1: text. Day 3: text and email.
4. Stop when they book (the booking Zap moves the status), reply, or are marked Lost.

**Keep in mind:** reschedules done through Calendly's own reschedule link are already handled by card 4. This card is only for people who haven't picked a new time.

## 13. Fathom to Close and Slack

**System:** Fathom's Close integration if available, otherwise a Zap triggered by Fathom "New Recording".

**Trigger:** Fathom "New Recording" (or Fathom's built-in Close integration).

**Outcome:** Every sales call recording and its summary sit on the lead in Close and get posted to Slack, without the closer pasting links.

**Steps:**
1. In Fathom, check Settings, Integrations for Close. If it's there, connect it and skip to step 4.
2. Otherwise, new Zap: trigger Fathom "New Recording" (sales calls only).
3. Close: find the lead by the guest's email. Update Fathom URL and add a note with the summary and action items.
4. Slack: post the summary and link to the calls channel.
5. If no lead matches, post "No Close lead found for this recording" in Slack so someone links it.

**Keep in mind:** Fathom records the Zoom call, so a separate Zoom recording isn't needed for this.

## 14. Payment received

**System:** Zapier. Rework "Fanbasis Payment -> Airtable -> Slack" and "Fanbasis - Renewal -> Airtable -> Slack".

**Trigger:** Unchanged. Fanbasis "New Sale" and Fanbasis "Subscription Renewal".

**Outcome:** Every payment updates Close, links to the client and rep (so commissions are right), marks installments paid, and can't be counted twice.

**Steps (both Zaps):**
1. First step after the trigger: Airtable "Find Record" in Payment Records by the Fanbasis transaction ID (add a "Transaction ID" field). Stop if it's found.
2. Close: find the lead by email. If none, post "Unmatched payment" to Slack with name, email and amount, and stop.
3. Airtable: find the Customer and Customer Product by email (create if missing).
4. Airtable: create the Payment Record with Transaction ID, date, amount, net amount from Fanbasis "creator earnings", and links to Customer and Customer Product.
5. Airtable: if the customer product has an unpaid installment, mark the oldest one paid and link this payment.
6. Close: update the lead status to Signed Up - Closed (nothing owed) or Signed Up - Balance Owed (installments left). If the deal is still at Deposit Paid and this payment covers the balance, move it to Won.
7. Move the two Slack steps to the end.

**Keep in mind:**
- The renewal Zap currently subtracts a flat 3.9% fee. Use Fanbasis "creator earnings" in both Zaps instead.
- Once payments are linked, the Airtable automation that adds payments to monthly reports should start including renewals. Check October afterwards: it should show $27,400.
- Test: a new sale, a renewal, and the same payment sent twice (the second must stop at step 1).

## 15. Failed payment alert

**System:** Zap triggered by a Fanbasis failed payment (check it exists in Zapier). If it doesn't, a daily Zap that checks Airtable for installments past due.

**Trigger:** Fanbasis failed payment, if Zapier offers it. Otherwise Schedule by Zapier, daily at 9am Eastern.

**Outcome:** Nobody misses a failed or late payment.

**Steps:**
1. Trigger: Fanbasis failed payment (or Schedule, daily at 9am, plus Airtable "Find Records" in the "Overdue" view).
2. Slack: post name, amount, product and due date to the payments channel.
3. Close: create a task for the deal owner, "Collect failed payment".

**Keep in mind:** optional later, send the client a text with a card update link.

## 16. Refunds

**System:** Zap triggered by a Fanbasis refund (if available), otherwise an Airtable form.

**Trigger:** Fanbasis refund, if Zapier offers it. Otherwise a new submission of an Airtable refund form.

**Outcome:** Refunds are recorded the same way every time and commissions get clawed back automatically.

**Steps:**
1. Trigger: Fanbasis refund (or Airtable form submission).
2. Airtable: create the Refund Record linked to the payment, customer and product. The clawback formulas already exist.
3. Close: add a note. If fully refunded, change the lead status.
4. Slack: post the refund.

## 17. Agreement signed

**System:** Zapier, "New Contract > Slack" (exists, currently off).

**Trigger:** Unchanged. DocuSign "Recipient Completed" (the client signs).

**Outcome:** A signed agreement shows up in Slack and on the deal in Close.

**Steps:**
1. Add a Close date field "Agreement Signed" (Opportunity).
2. In the Zap, after the trigger: Close find lead by the signer's email, update the deal (Active Deal ID) with the signed date, add a note with the document name.
3. Keep the Slack step last.
4. Turn the Zap on.

## 18. Client onboarding handoff

**System:** Existing Zaps: "Onboarding Email", "New Client Intake Form > Slack", "Kickoff Session > Slack".

**Trigger:** Unchanged: Google Forms "New Response" (intake) and Calendly "Invitee Created" filtered to Kickoff Session. New: Schedule by Zapier, daily, for the kickoff reminder.

**Outcome:** Every new client gets the welcome, and Close shows whether intake and kickoff are done. Nobody falls through after paying.

**Steps:**
1. Intake Zap: add Close find lead by email, then add a note "Intake submitted".
2. Kickoff Zap: add Close find lead by email, then add a note "Kickoff booked for [date]".
3. New Zap: Schedule daily. Airtable or Close search for clients won more than 48 hours ago with no kickoff note. Send them the kickoff link by text and email, and post a nudge in the fulfillment Slack channel.

**Keep in mind:** the welcome email Zap works. Leave it as is.

## 19. Weekly and monthly numbers

**System:** Zapier Schedule plus Airtable, posting to Slack.

**Trigger:** Schedule by Zapier: every Monday at 8am Eastern (weekly) and the 1st of each month (monthly).

**Outcome:** Mitch gets the key numbers every Monday and on the 1st of each month without opening anything.

**Steps:**
1. Zap 1: Schedule, every Monday at 8am Eastern. Zap 2: Schedule, 1st of the month.
2. Airtable: read the Sales Metrics and Finance Metrics rows for "Last Week" (or "Last Month").
3. Slack: post new leads, calls booked, shows and show rate, offers, closed deals and close rate, cash collected (new and recurring), deposits outstanding.

**Keep in mind:**
- Do cards 2, 5 and 14 first. Before that, these numbers are wrong.
- Optional later: add the Close lead ID to every Airtable table so reports join on IDs, not emails.

## 20. Weekly data check (optional)

**System:** Zapier Schedule, posting to an ops Slack channel.

**Trigger:** Schedule by Zapier, every Monday morning.

**Outcome:** Problems get caught weekly instead of piling up.

**Steps:** every Monday, post counts and links for: duplicate leads by email, leads with more than one open deal, open deals on DQ or Lost leads, payments with no customer link.

## 21. Rep onboarding and offboarding

**System:** Two written checklists (SOPs). The onboarding Zap stays as it is, with card 8's fixes.

**Trigger:** None. Checklists are run by hand when a rep joins or leaves.

**Outcome:** New reps are set up the same way every time, and departing reps lose access the same day.

**Steps:**
1. Onboarding checklist: Google account (Zap), Close seat (Zap), User ID Lookup row with Close ID and Slack ID, Calendly seat and round robin, Slack channels, smart lists walkthrough.
2. Offboarding checklist: deactivate Close, suspend Google, remove from Calendly round robin, reassign open leads and deals in Close, remove from Slack, mark the User ID Lookup row inactive.

## 22. Setter ✅ claim (optional)

**System:** Zapier, "(New Lead) Setter React". A setter adds ✅ to a booking post in Slack, and the Zap records them as the setter in Close.

**Trigger:** Unchanged. Slack "New Reaction Added", ✅ in the bookings channel.

**Outcome:** The same ✅ habit keeps working even if someone edits the Slack message wording.

**Steps:**
1. Booking Zaps (card 4): add a last line to the Slack post: `Lead ID: {{Close lead ID}}`.
2. Setter React Zap: replace the email, date and rep extraction steps with one Formatter "Extract Pattern" step, pattern `lead_[A-Za-z0-9]+`.
3. Update the lead directly by that ID.

**Keep in mind:** it works today. Do this last.

---

# SOPs to write

Short, one page each. Write each after its card is built so it matches what the system actually does.

| SOP | Covers | Card |
|---|---|---|
| Lead statuses and stages | What each status and stage means, who sets it, what it triggers | 1 |
| Working the smart lists | Which list to work in which order | 6 |
| Submitting the EOC | One per call, required fields, deposits logged as Deposit, follow-up date required | 5 |
| No-show, cancel, reschedule | Which status to set and what happens next | 10, 11, 12 |
| Payments | Unmatched payments, failed payments, refunds | 14, 15, 16 |
| Client handoff | Agreement, welcome, intake, kickoff | 17, 18 |
| Rep onboarding and offboarding | The two checklists | 21 |
| Changing automations safely | Never rename statuses, stages or fields without checking the Zaps; test before turning on; keep a change log | All |

# Open questions

| Question | For | Card |
|---|---|---|
| Do DCBA, DCBIG and DCBE mean ads, Instagram and email? | Mitch | 4 |
| Are host cancels on direct bookings deliberate screen-outs? | Mitch | 11 |
| Does anyone use the two Google Sheets the EOC and renewal Zaps write to? If not, delete those steps | Mitch | 5, 14 |
| Can Close Workflows time messages from the call time and enroll from Zapier? | Leah | 9, 10, 11, 12 |
| Does Fanbasis have failed payment and refund triggers in Zapier? | Leah | 15, 16 |
| Does the Fathom plan include the Close integration? | Leah | 13 |
| Calendly reminder timing (only visible inside Calendly) | Leah | 9 |

Before handing this over: rotate the Close, Airtable and Calendly API keys used for this review.

---

# Changes I suggest

## Required (the build cards)

1. Close: add a Not Booked stage, an Active Deal ID field and UTM fields. Make Deposit Paid an open stage.
2. Airtable: fix the paid flag, stop counting deposits and installment payments as closed deals, fix Sidonie's name.
3. Lead form Zaps: stop overwriting existing leads, create a Not Booked deal for every new lead, move freebies to their own channel, track UTMs.
4. Booking Zaps: update the existing deal instead of creating a new one, handle reschedules, exact closer match, label direct bookings by their real source.
5. EOC Zap: fix the cents bug and the 3rd installment field, create follow-up tasks, save the Fathom link, stop creating installment deals.
6. Smart lists: fix day-old, Paid Ads, 3 to 7 day and no-show lists; add cancel and reschedule lists.
7. Clean up dead deals, duplicate deals and leads, and unlinked payments.
8. Delete the draft Zap and force a password change for new reps.
9. Pre-call texts and emails from Close (right away, 24 hours, 1 hour), then switch off Calendly's.
10. No-show drip in Close.
11. Calendly cancellations into Close, with a win-back drip for lead cancels.
12. Reschedule link drip in Close.
13. Fathom recordings and summaries into Close and Slack.
14. Fanbasis payments update Close and link to the client and rep.
15. Failed payment alert.
16. Refund automation.
17. Signed agreements update Close and Slack.
18. Intake and kickoff tracked in Close, with a kickoff reminder.
19. Weekly and monthly numbers posted to Slack.
20. Rep onboarding and offboarding checklists.

## Suggested, not required

- Replace the 88-step EOC Zap with the code step (card 5). Same result, far easier to change later.
- Harden the setter ✅ claim so it can't break when the Slack message wording changes (card 22).
- Weekly data check in Slack (card 20).
- Add the Close lead ID to every Airtable table so reports match on IDs instead of emails and names.
- Require a cancellation reason in Calendly when a closer cancels a booking.
- One Zapier "Zap error" alert to Slack, so a failed run doesn't go unnoticed.
- A separate Close user for automations, so changes made by Zaps don't show as Kimberly's.
- Enter ad spend weekly so cost per lead and return on ad spend can be reported.
- Retire the two Google Sheets the Zaps still write to, if nobody uses them.

---

# Appendix: what we found and which card fixes it

For reference. Every item was checked against the live data or the Zap settings unless it says otherwise.

| Severity | Issue | Evidence | Card |
|---|---|---|---|
| Critical | Lead-level paid flag never fires. Lead Base `Is Paid` checks 4 source fields for "Paid Ad"; Zaps write "Paid Ads". | 0 of 825 leads paid. Sales Metrics All Time: Paid Leads 0, Organic Leads 825. Paid set rate, paid CPL and paid cash per lead are all wrong. | 2, 3 |
| Critical | Fanbasis renewals and back-dated payments aren't linked to calendar periods, so monthly and yearly finance totals are understated. | All 5 renewals plus 1 back-dated payment are missing from their calendar month: Aug $2,400, Sep $1,200, Oct $4,600. One renewal ($2,400) has no date at all. "October 2026" shows $22,800 vs $27,400 actual. "2026" shows $77,783 vs "YTD" $85,983. | 19 |
| Critical | Deposits and installment payments count as closed deals, against the business rule. | Airtable `Closed Deals` = 1 whenever Call Outcome is "Closed", so all 6 Deposit EOCs and all 6 Instalment Paid EOCs count as new closed deals. Close pipeline stage "Deposit Paid" is a won stage (5 opps). | 1, 2, 5 |
| Critical | Slow speed to lead and many leads never contacted. | Leads created Sept 1 to Nov 12 (421): 27% have no outbound call or SMS in Close, median first touch 100 minutes, 82 reached within 5 minutes. Paid Ads: 6% untouched, median 114 minutes. | 3, 6, 9 |
| High | Two definitions of "paid". Calls and cash use a manual `Lead Source` dropdown on the EOC (85 Paid, 98 Organic); leads use automation tags. The two halves of the paid funnel can't be compared. | EOC formula `Paid: Closed Deals = IF(AND({Lead Source}="Paid",{Closed Deals}=1),1,0)` | 3 |
| High | Duplicate EOC submissions double-count outcomes. | 3 lead/date pairs have two EOCs: Closed + Closed, Closed + Offer Made, No Show + Disqualified. | 5 |
| High | Freebie opt-ins post to the applications channel with "Dial ASAP", burying real applications. | 3 freebie Zaps use the same channel as applications. Untouched rates: Anxious to Confident 75%, Commitment Training 67%, Relationship Quiz 42%. | 3 |
| High | Every booking creates a new $7,200 deal, even when one is open. | 7 leads have 2 to 3 open Interview opps created hours or days apart, including a signed client and an NGMI lead. | 4 |
| High | Reschedules come through as new bookings. The Zap filters on `rescheduled = false`, but Calendly sets that flag on the canceled original, and the new booking arrives with `rescheduled = false` and `old_invitee` set. | Zap filter config plus Calendly's reschedule docs | 12 |
| High | Calendly cancellations never reach Close. Cancels only register if a rep changes the Close status by hand. | Calendly has three "new booking" webhooks to Zapier and none for cancellations. 55 of 97 direct bookings since Sept 1 were canceled by the host; 10 of those leads still show "New Lead - DCB" and 20 still hold an open $7,200 deal. | 11 |
| High | Re-opt-ins knock leads back to "New Lead". | 8 leads currently in New Lead that hold Lost, Interview or Pending Close opps. Close history shows moves such as Canceled to New Lead, No show to New Lead, Closer Follow Up to New Lead, and New Opportunity to New Lead. | 3 |
| High | Source fields are overwritten on every touch, so first-touch attribution doesn't exist. | Update steps in 8 Zaps write Opt Source and Applied Source unconditionally. 30 leads now show Opt Source "Setter Booking". | 3 |
| High | Payment amounts with cents are corrupted in Close. The Zap builds cents by appending "00" to the dollar text. | EOC cash $1,133.33 became a $11.33 opp. Every amount with decimals is affected. | 5 |
| High | EOC updates whichever opp Close returns first. | Zap config ("first" result). A signed client still holds 2 open Interview opps. | 4, 5 |
| High | Pipeline is inflated with dead deals. | $700,800 open across 98 opps. 15 leads in DQ, NGMI, Canceled, No show or signed statuses hold open sales opps worth $136,800. | 1, 4, 7 |
| High | Payment plans are tracked in two places, and only one gets updated. Installment payments create new won opps in Close but never mark the Airtable installment paid. | 4 EOCs report an in-house plan. 2 installment records in Airtable. 7 "Installment Paid" opps in Close. | 5, 14 |
| High | Fanbasis payments don't update Close. | Fanbasis Zaps write to Airtable and Slack only | 14 |
| High | Payments aren't linked to customers or reps, which misclassifies cash. | 18 of 43 payment records unlinked. 8 first-ever payments ($16,100) are classified "Recurring" because they're unlinked, so New Cash is understated by that amount. | 14 |
| High | Commission is calculated on payments with no rep attached. | 26 payments with no closer carry $4,605 of closer commission and $912.50 of setter commission. | 14 |
| High | No ongoing re-engagement. The only sequence was a one-time blast from Kimberly's main inbox that mostly failed. | 759 leads enrolled in under a minute on Jul 15: 518 `account-failures` (Close couldn't send through the mailbox), 218 finished, 22 replied, 1 booked. 0 sequence emails since Sept 1. | Retire the Close sequence. Re-engagement runs as Kit blasts (outside scope). |
| High | Follow-up dates are collected but no task is created. | 33 leads in Closer Follow Up, 19 open tasks org-wide, 9 overdue | 5 |
| High | No pre-call process in Close. Calendly sends its own confirmations and reminders, but texts only reach people who type in a number (39 of 97 direct bookings, 1 of 28 setter bookings). | Close and Zapier have nothing. Calendly event data. | 9 |
| High | No-shows and cancels get a Slack post only. Nothing goes to the lead and no task is created. | Zap config | 10, 11 |
| High | Systems join on email or rep name. No Close ID is stored in Airtable. | Schema. Lookups use name text and email. | 3, 5 |
| High | One setter is missing from Rep Scorecard. The scorecard dropdown says "Sidonie Claurans"; EODs and EOCs say "Sidonie Chechin". | 0 scorecard rows for Sidonie despite 59 EODs and 18 EOCs | 2 |
| High | The sales process is tracked twice: lead statuses (setter and closer stages) and one deal pipeline. They disagree. | 15 leads in DQ, Canceled, No show or signed statuses still hold open deals. Deals only start at booking, so there is no "Not Booked" stage. | 1, 4 |
| High | Agreements: the "New Contract > Slack" Zap is off, so a signed agreement updates nothing (not Slack, not Close). | Zap status off | 17 |
| High | The "Gold Rush (Paid Ads)" smart view requires all three source fields to say "paid", so it hides paid applicants who never booked. | Shows 94 of 223 paid leads | 6 |
| High | Host cancellations on direct bookings carry no reason and leave no trace in Close, so screened-out leads look like open pipeline and canceled leads get no follow-up. | 55 of 97 direct bookings canceled by the host since Sept 1, 0 with a reason | 11 |
| Medium | Ad Spend table is empty, so ROAS, CPA and CPL read $0. | 0 records | Not planned. ROAS stays blank until ad spend is entered. |
| Medium | Lead handoff depends on a Slack ✅ reaction and a regex reading the bot's message text. | Zap "(New Lead) Setter React" | 22 |
| Medium | The DCB Zap labels every direct booking "Paid Ads", including the Instagram (DCBIG) and email (DCBE) links. | Calendly: 81 DCBA, 12 DCBIG and 4 DCBE bookings since Sept 1, all written to Close as Paid Ads | 4 |
| Medium | Opps are created with a $7,200 placeholder value. | All 68 Interview opps = $7,200 | 4 |
| Medium | No processor transaction ID is stored, so a replayed Zap would double-count. | Payment Records schema | 14 |
| Medium | EOC skips payment records for Whop, Shopify and Stripe, but only Fanbasis has a processor Zap. | Filter config. No loss yet, since every payment to date was Fanbasis. | 5 |
| Medium | Google Sheets act as an incomplete third ledger (Fanbasis new sales are missing). | Zap config | Ask Mitch, then retire |
| Medium | Call dates are converted UTC to UTC and stored date-only, so evening calls can land on the next day. | Comparing first calls: Close's date is exactly 1 day later than the closer's EOC date in 9 cases, 1 day earlier in 3. | 4 |
| Medium | Rep attribution is missing on EOCs. | Setter blank on 157 of 183, closer blank on 54 of 183 | 5 |
| Medium | Duplicate leads and missing phones. | 15 emails on more than one lead (33 leads). 508 leads without a phone. | 3, 7 |
| Medium | Lead Base is a partial copy of Close. | 825 vs 1,481 | 19 (optional) |
| Medium | Airtable "Minutes to Claim" measures nothing (date-only field, set by the Slack reaction). | Median 0, two negative values | 19 |
| Medium | Kit runs before Close in 6 Zaps, so a Kit failure stops the lead reaching Close. | Zap config | 3 |
| Medium | No error alerting. The 88-step EOC Zap can write Slack and Sheets, then fail before Close and Airtable. | Zap config. Actual failure rate unknown. | 5 |
| Medium | Config is hardcoded and partly hidden. A Zapier Table (`01KS2T7RQ0MGGM5C8645K8RDHP`) maps EOC answers to Close status IDs, and channel, field and status IDs are hardcoded across Zaps. | Zap config | 5 |
| Medium | Smart views filter on "lead updated", and every automation update resets that time, so leads drop out of working views. | Smart view definitions (Gold Rush, 3 Day No Book, No Shows, Re-Engagement) | 6 |
| Medium | No smart lists for 3 to 7 day leads, cancellations or reschedules. "3 Day No Book" covers 0 to 3 days. | Smart view definitions | 6 |
| Medium | No show/no-show field on the lead or deal, so show rate can only come from Airtable. | Close field list | 3, 5 |
| Medium | Fathom recordings never reach Close, and Slack gets the typed EOC summary, not the recording summary. | Close Fathom URL field empty on all 1,481 leads | 13 |
| Low | Net amount is calculated two ways (Fanbasis earnings vs a hardcoded 3.9% fee). | Zap config | 14 |
| Low | EOC Slack summary shows the 3rd installment date in place of the amount. | Code step maps `amt_3` to "Date of 3rd Instalment" | 5 |
| Low | Close fields Fathom URL and Traffic Type are never filled, though every EOC has a Fathom link. | 0 of 1,481 filled | 3, 5 |
| Low | Zapier acts in Close as Kimberly, so the audit trail can't tell automation from owner. | Status history attributes Zap-driven changes to "Kimberly Rae" | Optional: dedicated Close automation user |
| Low | 4 near-identical Kajabi Zaps. | Zap config | 3 |
| Low | New Google Workspace accounts start with one shared hardcoded password, with no forced change. | Zap config | 8 |
| Low | Leftover Zaps: an empty draft, and the DocuSign Zap switched off. | Zap list | 8 |
