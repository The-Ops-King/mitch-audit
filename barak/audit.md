# Barak Van Wyk Coaching: sales automation plan

Version 1.0, November 13, 2026.
For Mitch (overview) and Leah (build guide).
Scope: Barak Van Wyk only. Kimberly Rae and Nelly each have their own document in the same format. Card numbers match the Kimberly Rae document, so the same card number means the same kind of fix in both.
Based on a read-only review of Zapier (18 Zaps), Close (89 leads, 11 deals, activity since Sept 1) and Airtable (15 tables). Calendly was reviewed from screenshots only.

## How to use this document

For Mitch: read "What's wrong today" and "What's needed, stage by stage". Answer the open questions near the end.

For Leah:

1. Do card 8 first. It fixes a security problem.
2. Read "Before you start".
3. Do the other cards in number order. Each card says what to do first.
4. A card is finished only when its "Done when" test passes.
5. Mark each card in the progress checklist.

Words used in this document:

- "Deal" means what Close calls an "Opportunity". The Zapier actions are named "Create Opportunity" and "Update Opportunity".
- "Ask Mitch" means stop and get Mitch's answer before you continue.
- Every name in quotes is the exact name in the tool. The reference sheet lists every name and ID.

### Using this document with an AI

Paste this whole document into the AI, then paste this prompt:

> You are helping Leah, a VA, build automations for Barak Van Wyk Coaching. Use only this document. Leah is working on card [number]. Give her click-by-click steps in Zapier, Close, Airtable or Calendly. Use the exact names and IDs from the reference sheet. Use short sentences. If something in the card says "Ask Mitch", tell her to stop and ask Mitch. Do not invent field names, IDs or steps that are not in this document. When she is done, give her the "Done when" test for that card.

---

# Part 1: overview

## What's wrong today

Barak's setup is a copy of Kimberly Rae's, so most of the same problems are here, plus a few of its own:

- Security. A Zap has a live AI API key typed into its code in plain text. Anyone with access to the Zapier account (or a Zap export) can use it. The key must be replaced today.
- Bookings never create a deal in Close. The "New Deal - Call Booked" stage has 0 deals. Of the 11 deals in Close, 7 are single installment payments. The EOCs record 8 new closes; Close shows 3 closed deals.
- The numbers are wrong. Airtable counts 20 closed deals. Only 8 are new clients: 9 are installment payments and 3 are deposits.
- Follow-up messages were written but never turned on. Close has no-show, cancel, new applicant and three re-engagement workflows. All are in draft or paused, and the message templates still contain placeholders like "[DESIRED OUTCOME]".
- Most leads have no source. 70 of 89 leads have no source recorded, and the booking Zaps overwrite the source with "Setter Booking".
- Speed to lead can't be seen. 48 of 86 leads since September have no call or text logged in Close. Setters may be working them in Instagram DMs, but if so nothing is recorded.

The plan keeps the current setup and changes only what's needed.

## How Close is set up today

Close has one pipeline, "Sales": New Deal - Call Booked, New Deal - Pending Close, New Deal - Instalment Pending, then New Deal - Deposit Paid, New Deal - Instalment Paid, New Deal - Closed (all three counted as won), and Lost. The setter and closer stages are lead statuses (New Lead, New Lead - DCB, New Opportunity, Closer Follow-Up, No Show, Canceled, Reschedule and others). "Setter Lead Owner" and "Closer Lead Owner" are custom fields. The plan keeps this.

## What Calendly shows (from screenshots)

| Event type | What it is | Host |
|---|---|---|
| Coaching Application [SB] | Booked by a setter for the lead (45 min) | Makena |
| Coaching Application [DCB] | Booked directly by the lead (45 min) | Makena |
| Live Interview | Live transfer to Makena (45 min) | Makena |
| Barak Van Wyk - 1:1 (55mins) | Barak's own call (1 hour). Not picked up by any Zap | Barak |

The Kickoff Session Zap looks for an event named "Kickoff Session". It doesn't appear in the screenshots, so check that it exists.

## What's needed, stage by stage

Keep = works now. Fix = change something that exists. Build = make something new. Turn on = it's already built but switched off. The card number shows where the steps are.

### 1. New lead comes in

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Lead created in Close | One Typeform Zap. No lead in Close has the source "Typeform", so it may not be in use. Most leads are created by hand | Fix: check it works. Stop it resetting status and source | 3 |
| Deal created at "Not Booked" | No | Build | 1, 3 |
| Lead source tracked | 70 of 89 leads have no source | Fix | 3, 4 |
| Typeform answers and UTMs tracked | Answers saved as a note. No UTMs | Fix: add UTM tracking | 3 |

### 2. Speed to lead

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Slack alert "ready to be called" | Typeform applications post to Slack | Keep | |
| Instant text to new applicants | The "New Opt In / Application" workflow exists but is paused (4 people ever enrolled) | Turn on | 23 |
| Smart lists for setters | "Fresh Leads 1", "Gold Rush", "DCB Leads 2" | Fix: "Gold Rush" shows leads updated in the last 3 days, which is the opposite of what it's for | 6 |
| Speed to lead measured | No | Build | 24 |

### 3. Call booked

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Deal created or moved to "New Deal - Call Booked" | No deal is created | Fix | 4 |
| Reschedules update the same booking | Reschedules are treated as new bookings | Fix | 4 |
| Assigned to the right closer | Matched from the Calendly host. The setter booking Zap uses a loose match | Fix: make it exact | 4 |
| Booking posted to Slack | Yes | Keep | |
| Booking source tagged | Setter bookings overwrite the source with "Setter Booking". Direct bookings write a blank source | Fix | 4 |
| Setter claims the booking (✅ in Slack) | Works (two Zaps: new lead and booked call) | Keep. Optional fix | 22 |

### 4. Pre-call

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Text and email right after booking, 24 hours and 1 hour before | Nothing in Close. Calendly's own reminders (not visible) | Build in Close, then turn off Calendly's | 9 |
| Qualification (triage) before the closer's call | No triage call | Decision for Mitch | Open questions |

### 5. Post-call

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Call outcome recorded (EOC) | Airtable form plus a 79-step Zap (same as Kimberly Rae's) | Fix | 5 |
| Fathom recording on the lead | In the EOC (39 of 39). Close has no Fathom field | Build | 1, 13 |
| Follow-up task from the follow-up date | No | Fix | 5 |
| Follow-up message after a no-close | A Zap exists but is off, and it holds the exposed API key | Remove (card 8). Rebuild later if Mitch wants it | 8 |

### 6. No-show, cancel, reschedule

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Alerts in Slack | Yes | Keep | |
| No-show messages | "No Show" workflow in draft. Template unfinished | Finish and turn on | 10 |
| Cancellations reach Close | No | Build | 11 |
| Cancel messages | "Canceled Call" workflow in draft. Template unfinished | Finish and turn on | 11 |
| Reschedule messages | None | Build | 12 |
| Smart lists: no-shows, cancels, reschedules | None | Build | 6 |

### 7. Payment

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Payment received alert | Fanbasis to Slack | Keep. Fix: also update Close and link the client and rep | 14 |
| PayPal payments | Entered by hand on the EOC (7 so far). No automation | Keep (ask Mitch) | 14 |
| Stripe | Zap off, not connected | Delete if not used | 8 |
| Deposits and installments not counted as new deals | They are counted | Fix | 1, 2 |
| Failed payment alert | None | Build | 15 |
| Refunds recorded | None | Build | 16 |

### 8. Agreement and onboarding

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Signed agreement recorded | No agreement automation | Ask Mitch | 17 |
| Welcome email, intake form | None | Ask Mitch | 18 |
| Kickoff tracked | Kickoff Session to Slack | Fix: also write to Close | 18 |

### 9. Reporting and team

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Correct numbers | Deposits and installments counted as deals | Fix | 2, 5, 14 |
| Weekly and monthly numbers in Slack | None | Build | 19 |
| Rep scorecards | Show "Festus" (not on the team) and "Emily Wood" with extra spaces. Makena and Barak have no rows | Fix | 2, 24 |
| Re-engagement of old leads | 3 workflows and 3 smart views built, all off | Finish and turn on (optional) | 25 |
| Rep onboarding | Zap is off and copied from another business | Fix or delete | 8, 21 |

---

# Part 2: before you start

## Logins you need

| Tool | Access level | Used in cards |
|---|---|---|
| Zapier | Edit all Zaps | 3, 4, 5, 8, 9 to 25 |
| Close | Admin | 1, 3 to 7, 9 to 18, 23, 25 |
| Airtable | Creator on "Barak Van Wyk - Master Base" | 2, 5, 7, 14 to 16, 19, 24 |
| Calendly | Admin | 9, 11 |
| Typeform | Edit the application form | 3 |
| Anthropic console | Owner of the API key (card 8) | 8 |
| Fathom | Admin | 13 |

## Rules for every change

1. Back up first. Duplicate a Zap before editing it and rename the copy "BACKUP [date] [name]". Take an Airtable snapshot before card 2. Export Close leads and opportunities before card 7.
2. Change one card at a time. Test it. Then move on.
3. To undo a Zap change: turn off the edited Zap and turn on the backup.
4. Never rename or delete an existing Close status, stage or field, or an Airtable field.
5. Test with your own name, email and phone number. Use "TEST" in the name. Delete test leads when the card is done.
6. Write every change in the change log (Part 6).
7. Never type an API key or password into a Zap step or code. Use Zapier's app connections.

## Naming Zaps

New and edited Zaps use this format: `BVW | [trigger] > [main result]`. Keep them in one Zapier folder named "BVW".

---

# Part 3: build cards

## Table of contents

| # | What it is | What it does |
|---|---|---|
| 1 | Close settings | Add a Not Booked stage and new fields. Make Deposit Paid an open stage |
| 2 | Airtable fixes | Fix the closed deals formula and the rep names |
| 3 | Typeform application Zap | Check it works. Stop overwriting leads. Create a deal. Track UTMs. Source rule for leads created by hand |
| 4 | Booking Zaps (2) | Create or update the deal. Handle reschedules. Fix sources and phone |
| 5 | EOC Zap | Fix money, follow-up, Fathom and deal steps |
| 6 | Smart lists | Fix 3 lists, add 3 |
| 7 | Data cleanup | Create missing deals, add sources, link payments |
| 8 | Security and housekeeping | Replace the exposed API key. Remove broken Zaps |
| 9 | Pre-call reminders | Text and email right away, 24 hours before, 1 hour before |
| 10 | No-show follow-up | Finish and turn on the "No Show" workflow |
| 11 | Cancellation handling | Calendly cancels reach Close. Finish and turn on "Canceled Call" |
| 12 | Reschedule follow-up | Messages with the booking link |
| 13 | Fathom to Close and Slack | Recording link and summary on the lead and in Slack |
| 14 | Payment received | Fanbasis updates Close and Airtable, then Slack |
| 15 | Failed payment alert | Slack alert and Close task |
| 16 | Refunds | Refund record, commission clawback, Close note |
| 17 | Agreement signed | Only if Barak uses agreements (ask Mitch) |
| 18 | Client onboarding | Kickoff tracked in Close. Welcome and intake if Mitch wants them |
| 19 | Weekly and monthly numbers | Slack report |
| 20 | Weekly data check (optional) | Slack list of records to fix |
| 21 | Rep onboarding and offboarding | Two checklists |
| 22 | Setter ✅ claim (optional) | Make the two Slack reaction Zaps harder to break |
| 23 | Instant response to new applicants | Finish and turn on "New Opt In / Application" |
| 24 | Speed-to-lead and sales tracking | First-contact time, ad spend, rep scorecards |
| 25 | Re-engagement (optional) | Finish and turn on the three re-engagement workflows |

Every card has the same parts: System, Trigger, Outcome, Do this first, Steps, Done when, Keep in mind.

## 1. Close settings

**System:** Close, Settings.

**Trigger:** None. One-time setup.

**Outcome:** Close can hold a deal from the moment a lead arrives. Deposits stop counting as wins. Automations know which deal to update, when the call is, and where the recording is.

**Do this first:** Card 8.

**Steps:**

1. Settings > Pipelines > "Sales". Add a stage "Not Booked", type Active. Drag it to the top.
2. Same screen. Change "New Deal - Deposit Paid" from Won to Active.
3. Settings > Custom Fields > Lead. Add:
   - "Active Deal ID" (Text)
   - "Call Time" (Date and time)
   - "Meeting Link" (Text)
   - "Fathom URL" (Text)
   - "Traffic Type" (Choices: Paid, Organic)
   - "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content" (Text)

**Done when:** "Not Booked" is at the top of the pipeline, "New Deal - Deposit Paid" is Active, and all 9 new fields exist.

**Keep in mind:** Don't rename or delete anything that already exists.

## 2. Airtable fixes

**System:** Airtable, base "Barak Van Wyk - Master Base".

**Trigger:** None. One-time edits.

**Outcome:** Deposits and installment payments stop counting as new deals. Rep scorecards and EODs match the real team.

**Do this first:** Take an Airtable snapshot.

**Steps:**

1. Table "EOC Report Responses", field "Closed Deals". Replace the formula with:
   `IF(AND({Call Outcome}="Closed",{Payment Type}!="Deposit",{Payment Type}!="Instalment Paid"),1,0)`
2. Table "Lead Base", field "Is Paid". Change every `"Paid Ad"` to `"Paid Ads"` (4 places), so it works once paid traffic starts.
3. Table "Rep Scorecard", field "Rep Name": rename "  Emily Wood" to "Emily Wood" (remove the spaces at the start). Ask Mitch who "Festus" is. If he's not on the team, delete his rows. Add the options "Makena Waterhouse" and "Barak Van Wyk".
4. Table "Setters - EOD Responses", field "Setter Name": rename "  Emily Wood" to "Emily Wood".

**Done when:** Sales Metrics Summary "All Time" shows 8 closed deals, not 20. The rep dropdowns show clean names.

**Keep in mind:** Tell Mitch the closed deal count will go down. That's the correction.

## 3. Typeform application Zap

**System:** Zapier, "Typeform Application -> Close -> Slack -> Airtable".

**Trigger:** Unchanged. Typeform "New Entry", form JgRoASaT.

**Outcome:** Applications reach Close with a source, a deal and UTMs. A returning lead keeps their status and first source. Leads created by hand also get a source.

**Do this first:** Card 1.

**Steps:**

1. Check the Zap runs. Submit a TEST application. If nothing reaches Close, check the Typeform connection and that form JgRoASaT is the live form. Ask Mitch where the application link is used.
2. Back up the Zap.
3. Path "Lead Exists", step "Update Lead in Close": delete the Status and "First Click Source" fields. Keep "Last Click Source" and "Application Source".
4. Both paths, after the Close lead step, add:
   1. Close "Find Opportunity", lead = this lead, status type Active.
   2. Filter: continue only if none found.
   3. Close "Create Opportunity": status "Not Booked", no value.
   4. Close "Update Lead": "Active Deal ID" = the new ID.
5. Path "Lead Does Not Exist": set "Traffic Type" to "Organic" (or "Paid" if the form is used in ads; ask Mitch).
6. In Typeform, add hidden fields `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`, and map them to the UTM fields in Close.
7. Leads created by hand (most of Barak's leads, likely from Instagram DMs): add a rule to the setter SOP. When a setter creates a lead, they fill "First Click Source" (for example "Instagram DM").

**Done when:** A TEST application creates a lead with "Application Source" = Typeform, one deal at "Not Booked", and "Active Deal ID" filled. A second TEST with the same email doesn't change the status or "First Click Source".

**Keep in mind:** No lead in Close currently has the source "Typeform", and the Airtable Lead Base has no application source on any of its 73 leads. Either the form isn't used much, or the Zap isn't firing. Step 1 finds out which.

## 4. Booking Zaps

**System:** Zapier. "Setter Booking -> Close -> Slack -> Airtable" and "New DCB -> Close -> Slack -> Airtable".

**Trigger:** Unchanged. Calendly "Invitee Created". The setter Zap filters on "[SB]" or "Live Interview". The DCB Zap filters on "[DCB]".

**Outcome:** Every booking creates or moves one deal. Reschedules update the same deal. The closer, call time, Zoom link, phone and source are saved correctly.

**Do this first:** Card 1.

**Steps (both Zaps):**

1. Back up the Zap.
2. Delete the filter "rescheduled = False".
3. Add a Paths step after the event name filter:
   - Path "Reschedule" (rule: "Old Invitee" exists): Close "Find Lead" by email, Close "Update Lead" with the new "Call Time" and "Meeting Link", Close "Create Note" "Rescheduled to [new time]". End.
   - Path "New booking" (rule: "Old Invitee" does not exist): all the steps below.
4. "Find Record" in User ID Lookup: set "Exact match" to Yes (the setter Zap has it off).
5. After the Close lead step:
   - If "Active Deal ID" has a value: Close "Update Opportunity", ID = Active Deal ID, status "New Deal - Call Booked", user = the closer's Close ID.
   - If empty: Close "Create Opportunity" with the same status and user. Then Close "Update Lead": "Active Deal ID" = the new ID.
6. Close lead steps:
   - Setter Zap: delete "Application Source" and "First Click Source" (they were overwritten with "Setter Booking"). Keep "Booking Source" = "Setter Booking".
   - DCB Zap: set "Booking Source" = "Direct Booking" (it was blank). Only set "First Click Source" in the "Lead Does Not Exist" path.
   - Both: add "Call Time" = Calendly start time, "Meeting Link" = Calendly location join URL.
   - Both: "Phone" = the answer to the phone question only (it currently joins all answers). Use the same field in the Airtable step.
7. Date formatting step: set the time zone to America/New_York.

**Done when:** A TEST booking creates one deal at "New Deal - Call Booked" with the right closer, "Call Time" and "Meeting Link". Rescheduling it keeps one deal with the new time. A 9pm Eastern booking keeps the same date.

## 5. EOC Zap

**System:** Zapier, "EOC Form -> Close -> Slack -> Airtable" (79 steps).

**Trigger:** Unchanged. Airtable "New Record" in "EOC Report Responses".

**Outcome:** The right deal gets updated. Amounts with cents save correctly. Follow-up dates become tasks. The Fathom link lands on the lead. Installment payments stop creating fake deals.

**Do this first:** Cards 1, 2 and 4.

**Steps:**

1. Back up the Zap.
2. First Code step, "Input Data": change `amt_3` from "Date of 3rd Instalment" to "3rd Instalment Amount".
3. Every Close value ending in `00` (like `{{Cash Collected}}00`): add a Formatter step before it, Numbers > Spreadsheet-Style Formula > `ROUND({{Cash Collected}}*100,0)`, and use its result. Same for each installment amount.
4. Every Close "Update Opportunity" step: set the opportunity ID to the lead's "Active Deal ID", not the "Find Opportunity" result. Add a step before it: if "Active Deal ID" is empty, Close "Create Opportunity" and save its ID. (Most of Barak's leads have no deal today, so this is needed.)
5. Every "Update Lead in Close" step: add "Fathom URL" = "Fathom Share Link".
6. Path "No Close / Follow Up": add a Filter (Follow Up Date has a value), then Close "Create Task" for the closer, due on "Follow Up Date".
7. Path "Payment Plan (Create Opportunities)": delete the 5 Close "Create Opportunity" steps. Keep the Airtable installment steps.
8. Path "Instalment": delete the Close "Create Opportunity" step.
9. "Closer Lookup" and "Setter Lookup": set "Exact match" to Yes (after card 2 cleans the names).

**Done when:** TEST EOCs give: cash 1133.33 saved as $1,133.33; a deposit at "New Deal - Deposit Paid" (not won); a payment plan with one won deal and no installment deals; an Offer Made with a follow-up task; "Fathom URL" filled.

**Keep in mind:** Optional: a code step can replace most of the 79 steps. It's in the repo at `barak/code/eoc-decide.js`, already set up with Barak's Close IDs, with no passwords or keys inside.

## 6. Smart lists

**System:** Close, Smart Views.

**Trigger:** None.

**Outcome:** Setters have accurate call lists.

**Do this first:** Nothing.

**Steps:**

| Smart view | Change |
|---|---|
| "⛏️ Gold Rush" | It shows leads updated in the last 3 days, which is the opposite of what it should show. Change to: created more than 1 day ago, last call more than 24 hours ago or never, status not signed or DQ |
| "☎️ DCB Leads 2" | Replace "lead updated not in last 4 hours" with "last call more than 4 hours ago or never" |
| "Re-Engagement 1", "2", "3" | Replace "lead updated" with "last call more than 14 days ago" (1) and "more than 45 days ago" (2 and 3). 2 and 3 are identical today; ask Mitch how they should differ |
| "No Shows" (new) | Status "No Show", last call more than 6 hours ago or never |
| "Cancellations" (new) | Status "Canceled", last call more than 6 hours ago or never |
| "Reschedules" (new) | Status "Reschedule", last call more than 6 hours ago or never |
| "Leads with no source" (new) | "First Click Source" is empty. Setters fill it in |

**Done when:** "Gold Rush" shows older leads that haven't been called, not the ones just touched.

**Keep in mind:** Never use "lead updated" in a smart view. Zaps change it every time they touch a lead.

## 7. Data cleanup

**System:** Close and Airtable, by hand.

**Trigger:** None.

**Outcome:** Close shows real deals, and Airtable payments are linked.

**Do this first:** Cards 3, 4 and 5.

**Steps:**

1. Close: for each lead with status "Signed Up - Closed", "Signed Up - Balance Owed" or "Deposit Paid" that has no deal, create one at the right stage with the contract value from the EOC.
2. Close: the 7 "New Deal - Instalment Paid" deals are single installment payments. Ask Mitch: merge each into the client's main deal, or leave them.
3. Close: fill "First Click Source" on the 70 leads with no source, where the setter knows it.
4. Close: fill "Active Deal ID" on leads with one open deal.
5. Airtable "Payment Records": link the 5 payments with no "Customer Products", and link the 2 September Fanbasis payments to their month in "Finance Metrics Summary".
6. Close: merge the 1 duplicate lead.

**Done when:** Every client in Close has one deal with the contract value. Every Payment Record has a customer.

## 8. Security and housekeeping

**System:** Anthropic console, Zapier.

**Trigger:** None. Do this first, today.

**Outcome:** The exposed AI key stops working, and broken or copied Zaps don't cause problems.

**Do this first:** Nothing.

**Steps:**

1. Anthropic console: find the API key used in the Zap "No Close EOC -> Follow Up Flow" and delete it. Create a new key only if that Zap will be rebuilt.
2. Zapier: open "No Close EOC -> Follow Up Flow" (off). Delete the Code step that contains the key. If Mitch wants this flow later, rebuild it so the key is never in the code (ask Mitch).
3. Zapier: "New Rep Onboarding (OB Form -> Close -> Google -> Airtable -> Slack)" is off and was copied from another business. Its trigger table was deleted, it creates email addresses at evoxacademy.com, and it holds a shared password. Delete it, or rebuild it for Barak's domain with "Change password at next login" on (ask Mitch).
4. Zapier: "Stripe Payment -> Airtable -> Slack" is off and not connected. Ask Mitch if Barak takes Stripe payments. If not, delete it.
5. Zapier: "EOD Reminder" is off. Ask Mitch whether it should be on.

**Done when:** The old key is deleted in the Anthropic console, and no Zap contains an API key or password.

**Keep in mind:** Treat any key that was ever pasted into a Zap or shared in a file as exposed.

## 9. Pre-call reminders

**System:** Close (texts and emails from the closer's Close number and email). Zapier if Close can't do the timing.

**Trigger:** A new booking (Calendly "Invitee Created").

**Outcome:** Every booked lead gets a text and email right away, 24 hours before and 1 hour before the call.

**Do this first:** Cards 1 and 4.

**Steps:**

1. Check in Close: Workflows > New. Can a step send "X hours before" the "Call Time" field?
2. If yes: create "Pre-Call Reminders" with messages P1 to P3 (Part 4). P1 right away, P2 24 hours before, P3 1 hour before. Enroll from the end of both booking Zaps.
3. If no: new Zap `BVW | Calendly booking > pre-call reminders`. Send P1, then "Delay Until" 24 hours before and 1 hour before. Before each, check the lead is still "New Opportunity" or "New Lead - DCB" and "Call Time" hasn't changed.
4. Turn off Calendly's reminder emails and texts on "Coaching Application [SB]", "Coaching Application [DCB]" and "Live Interview".

**Done when:** A TEST call booked 25 hours ahead gets P1, P2 and P3 on time. One booked 3 hours ahead gets P1 and P3 only.

**Keep in mind:** Follow the texting rules (Part 4).

## 10. No-show follow-up

**System:** Close Workflow "No Show" (exists, in draft).

**Trigger:** The closer sets the lead status to "No Show".

**Outcome:** Every no-show gets a rebook message right away and follow-up for a week.

**Do this first:** Nothing.

**Steps:**

1. Close: Templates. Open the SMS and email templates "No Show". Replace every placeholder in brackets. Send the final wording to Mitch to approve.
2. Workflows > "No Show". It sends the text and email at the same time. Add follow-ups: text on day 1, text and email on day 3, email on day 7 (copy N2 to N5 in Part 4, or Mitch's wording).
3. Stop when the lead replies, books, or changes status.
4. Enroll leads when status becomes "No Show": from the "No Shows" smart view (card 6), or add a step to the Zap "No Show -> Slack".
5. Activate the workflow.

**Done when:** A TEST lead set to "No Show" gets the first text within 5 minutes.

## 11. Cancellation handling

**System:** New Zap plus the Close Workflow "Canceled Call" (exists, in draft).

**Trigger:** Calendly "Invitee Canceled".

**Outcome:** Cancellations reach Close by themselves, and leads who cancel get follow-up.

**Do this first:** Card 4.

**Steps:**

1. New Zap `BVW | Calendly cancel > Close status + follow-up`. Trigger: Calendly "Invitee Canceled". Filter: "Rescheduled" is false.
2. Close "Find Lead" by email.
3. Paths by "Canceler Type":
   - "invitee": Close "Update Lead" status "Canceled" (the existing Slack alert fires), then enroll in "Canceled Call".
   - "host": Close "Update Lead" status "DQ", deal (Active Deal ID) to "Lost", note with the reason. No messages.
4. Finish the "Canceled Call" templates (replace the placeholders, get Mitch's approval) and add follow-ups on day 1, 3 and 7 (C2 to C4 in Part 4).
5. Activate the workflow.

**Done when:** A lead-canceled TEST booking sets "Canceled" and sends the first text. A host-canceled one sets "DQ" and sends nothing.

**Keep in mind:** Ask Mitch whether host cancellations mean "screened out" for Barak too.

## 12. Reschedule follow-up

**System:** Close Workflow (new).

**Trigger:** The closer sets the lead status to "Reschedule".

**Outcome:** A lead who needs to move the call gets the booking link right away and reminders until they book.

**Do this first:** Nothing.

**Steps:** Create "Reschedule Follow-Up" with S1 to S3 (Part 4): right away, day 1, day 3. Stop when they book or reply. Enroll from the "Reschedules" smart view or the Zap "Reschedule -> Slack". Activate it.

**Done when:** A TEST lead set to "Reschedule" gets S1 right away.

## 13. Fathom to Close and Slack

**System:** Fathom's Close integration if available, otherwise a new Zap.

**Trigger:** Fathom "New Recording".

**Outcome:** Every call recording and summary is on the lead and in Slack.

**Do this first:** Card 1.

**Steps:** Same as the Kimberly Rae card 13. Find the lead by guest email, set "Fathom URL", add the summary as a note, and post to the EOC channel (C0BFTKQPWFN). If no lead matches, post "No Close lead found" in Slack.

**Done when:** A TEST recording shows on the lead and in Slack.

## 14. Payment received

**System:** Zapier, "Fanbasis".

**Trigger:** Unchanged. Fanbasis "New Sale".

**Outcome:** Every Fanbasis payment updates Close, links to the client and rep, and is never counted twice.

**Do this first:** Cards 1 and 7.

**Steps:**

1. Back up the Zap.
2. Airtable "Payment Records": add a text field "Transaction ID". First step after the trigger: find by Transaction ID, stop if found.
3. Close "Find Lead" by email. If not found, post "Unmatched payment" in Slack and stop.
4. Airtable: find or create the "Customer Table" and "Customer Products" records by email.
5. Airtable: create the Payment Record with Transaction ID, links, and Net Amount = Fanbasis "creator earnings". (It's currently a fixed 3.065% fee.)
6. Airtable: mark the oldest unpaid installment for that product paid, if one exists.
7. Close: update the lead to "Signed Up - Closed" or "Signed Up - Balance Owed". If the deal is at "New Deal - Deposit Paid" and this covers the rest, move it to "New Deal - Closed".
8. Move the Slack step to the end.
9. Ask Mitch whether renewals happen in Fanbasis for Barak. If yes, add the "Subscription Renewal" trigger as a copy of this Zap.

**Done when:** A TEST sale creates one linked Payment Record and updates Close. Replaying it creates nothing.

**Keep in mind:** PayPal payments are entered on the EOC by hand. That works. Just make sure "PayPal" stays in the EOC payment record path.

## 15. Failed payment alert

**System:** Zapier.

**Trigger:** Fanbasis failed payment if available, otherwise Schedule by Zapier daily at 9am Eastern plus the Airtable "Overdue" installment view.

**Outcome:** No failed or late payment is missed.

**Do this first:** Card 14.

**Steps:** Post name, amount and due date to the payments channel (C0BFTL6P4TW), and create a Close task for the deal owner. Optional: send F1 (Part 4).

**Done when:** A TEST overdue installment posts in Slack and creates a task.

## 16. Refunds

**System:** Zapier.

**Trigger:** Fanbasis refund if available, otherwise an Airtable form on "Refund Records".

**Outcome:** Refunds are recorded and commissions are clawed back.

**Do this first:** Card 14.

**Steps:** Create the Refund Record linked to the payment, customer and product. Add a Close note. Post to Slack.

**Done when:** A TEST refund creates a Refund Record with a clawback amount.

## 17. Agreement signed

**System:** DocuSign or another signing tool, plus Zapier.

**Trigger:** The client signs (for example DocuSign "Recipient Completed").

**Outcome:** A signed agreement shows on the deal and in Slack.

**Do this first:** Ask Mitch whether Barak's clients sign an agreement, and in which tool. If not, skip this card.

**Steps:** Same as the Kimberly Rae card 17. Find the lead by the signer's email, set "Agreement Signed" on the deal (add that Opportunity date field in Close), add a note, post to Slack.

## 18. Client onboarding

**System:** Zapier, "Kickoff Session > Slack Message", plus new Zaps if Mitch wants them.

**Trigger:** Calendly "Invitee Created" (Kickoff Session). New: deal won.

**Outcome:** Close shows whether each client has booked their kickoff.

**Do this first:** Card 14.

**Steps:**

1. Check that a Calendly event named exactly "Kickoff Session" exists. The Zap only fires for that name.
2. "Kickoff Session > Slack Message": add Close "Find Lead" by email and Close "Create Note" "Kickoff booked for [date]".
3. Ask Mitch whether Barak wants a welcome email and an intake form when a deal is won. If yes, build them the way Kimberly Rae's work (welcome email on won, intake form note in Close, reminder K1 if no kickoff in 48 hours).

**Done when:** A TEST kickoff booking adds a note in Close.

## 19. Weekly and monthly numbers

**System:** Zapier, Airtable, Slack.

**Trigger:** Schedule by Zapier: Monday 8am Eastern, and the 1st of the month.

**Outcome:** Mitch gets Barak's numbers every week and month.

**Do this first:** Cards 2, 5 and 14.

**Steps:** Same as the Kimberly Rae card 19. Read "Last Week" and "Last Month" from "Sales Metrics Summary" and "Finance Metrics Summary". Post leads, calls booked, shows, offers, closed deals, close rate, cash and deposits outstanding.

**Done when:** The Slack numbers match the Airtable rows.

## 20. Weekly data check (optional)

**System:** Zapier, Slack.

**Trigger:** Schedule by Zapier, Monday 9am Eastern.

**Outcome:** Problems are caught weekly.

**Steps:** Post counts for: leads with no source, clients with no deal, leads with more than one open deal, payments with no customer.

## 21. Rep onboarding and offboarding

**System:** Two checklists.

**Trigger:** None. Run by hand.

**Outcome:** Reps are set up and removed the same way every time.

**Do this first:** Card 8.

**Steps:** Same checklists as the Kimberly Rae card 21, using Barak's accounts: Close (barakvanwyk.com addresses), Calendly round robin, Slack, the "User ID Lookup" row, and the Rep Scorecard name.

## 22. Setter ✅ claim (optional)

**System:** Zapier, "(New Booked Call) Setter React -> Close -> Airtable" and "(New Lead) Setter React -> Close -> Airtable".

**Trigger:** Unchanged. Slack "New Reaction Added".

**Outcome:** The ✅ habit keeps working even if the Slack messages change.

**Steps:** Same as the Kimberly Rae card 22. Add `Lead ID: [Close lead ID]` to the Slack posts, then pull it with one Formatter "Extract Pattern" step (`lead_[A-Za-z0-9]+`) instead of reading the email from the text.

## 23. Instant response to new applicants

**System:** Close Workflow "New Opt In / Application" (exists, paused).

**Trigger:** A new application from the Typeform Zap (card 3).

**Outcome:** Every applicant gets a text right away, before a setter calls.

**Do this first:** Card 3.

**Steps:**

1. Templates: open "New Opt In/ Application". Replace "[APPLICATION / OPT IN]" and fix "Coachiing". Get Mitch's approval.
2. Workflows > "New Opt In / Application": it sends one text after 2 minutes. Add an email right away and a text on day 1 (A1 to A2 in Part 4).
3. Stop when the lead books or replies.
4. Enroll from the Typeform Zap ("Lead Does Not Exist" path), then resume the workflow.

**Done when:** A TEST application gets the text within 2 minutes.

## 24. Speed-to-lead and sales tracking

**System:** Zapier, Airtable, Close.

**Trigger:** A new outbound call or text in Close. Weekly manual entry for ad spend.

**Outcome:** Mitch can see how fast leads are contacted and how each rep performs.

**Do this first:** Cards 2 and 3.

**Steps:**

1. Same as the Kimberly Rae card 24, part 1: a "First Contacted" field in Lead Base, filled by a Zap on the first Close call or text.
2. Setter SOP: when working a lead in Instagram DMs, log it in Close (a note or call log). Otherwise the lead looks untouched.
3. Ad spend: ask Mitch whether Barak runs ads. If yes, enter weekly spend in "Ad Spend".
4. Rep Scorecard: add rows for Makena and Barak for each reporting period (after card 2).

**Done when:** A TEST lead that gets a call shows "Minutes to First Contact". All active reps have scorecard rows.

## 25. Re-engagement (optional)

**System:** Close Workflows "Re-engagement 1", "2", "3" and the smart views "Re-Engagement 1", "2", "3" (all exist, all off).

**Trigger:** A lead enters one of the re-engagement smart views (no contact for 14 or 45 days).

**Outcome:** Old leads get a planned message instead of being forgotten.

**Do this first:** Card 6.

**Steps:**

1. Templates "Re-Engagement 1", "2", "3": replace the placeholders in brackets, add subjects to the three emails (they're empty), get Mitch's approval.
2. Ask Mitch how "Re-Engagement 2" and "3" should differ. Today both use the same 45-day rule.
3. Set each workflow to enroll from its smart view and stop on reply.
4. Activate them.

**Done when:** A TEST lead with no contact for 15 days receives Re-engagement 1.

---

# Part 4: messages and texting rules

## Texting rules

1. Consent: Typeform and Calendly forms need a texting consent checkbox. Ask Mitch for the wording.
2. The first text in each workflow ends with "Reply STOP to opt out." Test that STOP stops all texts.
3. Follow-up texts go out only between 9am and 7pm in the lead's time zone. Pre-call reminders are the exception.
4. No texts to leads with status "DQ" or "NGMI".
5. Check that every Close phone number is registered for business texting.

## Message copy

Barak already has templates for no-show, cancel, new applicant and re-engagement. Finish those (replace the bracketed placeholders) and get Mitch's approval. For the messages below, use this generic copy unless Mitch provides his own.

| ID | Card | When | Message |
|---|---|---|---|
| P1 | 9 | Right after booking (text and email) | Hi [first name], your call is booked for [call time]. Here's the link: [meeting link]. Reply STOP to opt out. |
| P2 | 9 | 24 hours before | Hi [first name], reminder: your call is tomorrow at [call time]. Link: [meeting link] |
| P3 | 9 | 1 hour before | Hi [first name], your call is in 1 hour. Here's the link: [meeting link] |
| N2 | 10 | Day 1 after no-show | Hi [first name], still want to talk? Pick a time here: [booking link] |
| N3 | 10 | Day 3 (text and email) | Hi [first name], spots are open this week: [booking link] |
| N5 | 10 | Day 7 (email) | Hi [first name], this is our last reminder. If you still want to talk, book here: [booking link] |
| C2 | 11 | Day 1 after cancel | Hi [first name], you can pick a new time here: [booking link] |
| C3 | 11 | Day 3 | Hi [first name], still want to talk? Pick a time here: [booking link] |
| C4 | 11 | Day 7 (email) | Hi [first name], if you still want to talk, book here: [booking link] |
| S1 | 12 | Right away (text and email) | Hi [first name], here's the link to pick a new time: [booking link]. Reply STOP to opt out. |
| S2 | 12 | Day 1 | Hi [first name], did you get a chance to pick a new time? [booking link] |
| S3 | 12 | Day 3 | Hi [first name], reminder to pick a new time: [booking link] |
| A1 | 23 | Right after applying (email) | Hi [first name], thanks for applying. Book your call here: [booking link] |
| A2 | 23 | Day 1, not booked | Hi [first name], did you get a chance to book your call? [booking link] |
| F1 | 15 | Payment failed (optional) | Hi [first name], your payment didn't go through. Please update your card here: [payment link] |
| K1 | 18 | 48 hours after signing, no kickoff | Hi [first name], welcome! Book your kickoff session here: [kickoff link] |

---

# Part 5: reference sheet

These are names and IDs, not passwords.

## Zaps

| Zap name | Status | Card |
|---|---|---|
| Typeform Application -> Close -> Slack -> Airtable | On | 3 |
| Setter Booking -> Close -> Slack -> Airtable | On | 4 |
| New DCB -> Close -> Slack -> Airtable | On | 4 |
| EOC Form -> Close -> Slack -> Airtable | On | 5 |
| (New Booked Call) Setter React -> Close -> Airtable | On | 22 |
| (New Lead) Setter React -> Close -> Airtable | On | 22 |
| No Show -> Slack | On | 10 |
| Canceled Call -> Slack | On | 11 |
| Reschedule -> Slack | On | 12 |
| Fanbasis | On | 14 |
| Kickoff Session > Slack Message | On | 18 |
| Setter EOD -> Slack | On | Keep |
| Lead Created -> Airtable Lead Base | On | Keep |
| New Lead Status -> Airtable Lead Base | On | Keep |
| No Close EOC -> Follow Up Flow | Off. Contains the exposed key | 8 |
| New Rep Onboarding (OB Form -> Close -> Google -> Airtable -> Slack) | Off. Copied from another business | 8 |
| Stripe Payment -> Airtable -> Slack | Off. Not connected | 8 |
| EOD Reminder | Off | 8 |

## Close lead statuses

| Status | ID |
|---|---|
| New Lead | stat_CxayqoXTqnuYmTzFme17n1tgJHUhW5krtmSvPsGpZ0X |
| New Lead - DCB | stat_QLBBDqPeek82vjp3Ye5IqJLPrebY8fyePbOZn7qSbsB |
| Setter Pipeline | stat_UZNYmeyBSTvhlJE5V4YiW5RvYTwOlq57PJJBRYXpc9M |
| New Opportunity | stat_El9o3Pe9Ii2JURPqh200XTTzkSXNqhsFdZ9xWTRiUXB |
| Closer Follow-Up | stat_qeOpip3k22xTTYWMb5P5YY4oc689RxvPKNE4nbJusnc |
| No Show | stat_XXmUwUp70gljmOwE8ySgNYVJtueMCaT7ezFGgrDKI2c |
| Canceled | stat_oDboDJdk7FzJMAeOE1JNhxCF70l2lr7FFXWv8C6hOhO |
| Reschedule | stat_C4ypXRO4F1Horuht7iPsTlGl9RKA6DQNRmpd5e7sJ4F |
| Deposit Paid | stat_SWV1Eoq1L7Mwqq0H1hNy3zQO9Y5OKC36VmF3WtF1dmB |
| Signed Up - Balance Owed | stat_e3zssAGhv6y3LQVsodHosW3dyAcuTgHBvkHFyuWBOJ9 |
| Signed Up - Closed | stat_EmOeC2KeKIdF6XaT13T8mUfGScIaejrynHNSQ6mVV9H |
| DQ | stat_gnuWktowgE5WUwSAI11iJbB7S2JG7LVlvPmpchclCXp |
| NGMI | stat_ZkfOCQalOnwgfy2S7BTivFpwwWJv2ZZhTNKlupzlmQe |

## Close deal stages (pipeline "Sales")

| Stage | Type | ID |
|---|---|---|
| Not Booked | Active | New (card 1). Copy the ID here |
| New Deal - Call Booked | Active | stat_MlGZHh8u0LFetKQIUpr4vdujVorQCpOMyckKGZ7Stji |
| New Deal - Pending Close | Active | stat_nIyEuzM9Cv4NJzvWwqJVy0jEBa6TZY6mU9fYnCOl3BF |
| New Deal - Instalment Pending | Active | stat_MefNPfkW91uHwxhnfZsKdeMyoiEJoZbXLXIYzv4hpB0 |
| New Deal - Deposit Paid | Active after card 1 (Won today) | stat_E0oUfnGZYary83hiCKa8hhnz436zUa6S9TKhOtPufMM |
| New Deal - Instalment Paid | Won | stat_Q7OZZHlf3k6MKUPmZsty22Kus6Gm81nGEHs7q3rCZtW |
| New Deal - Closed | Won | stat_NsGhP1dHMgdOFLM1nSuRkwkGdPtq5B5Z2fYDmnE8HFn |
| Lost | Lost | stat_3ZdHZ2tgnIGYIE8f5GQ5eo9ju1QdiOTfQnsq2WyJ9HQ |

## Close lead fields

| Field | ID |
|---|---|
| Application Source | cf_TjlQhGfTDJ4QozlccKezYAldvhPRnK3YtcXtvYonvSY |
| Booking Source | cf_YPWJ4NbrIYDHcCTg3b1ZUsUePwg0logDPoeD8josyxO |
| First Click Source | cf_QJ2GngKIJAAARvcttT1WGFFN827MHETeHht5TuivLEK |
| Last Click Source | cf_MFlrZKc9jtfiqQscqEZJUjKmmHm1N24jcoL0Z1QbmGd |
| Setter Lead Owner | cf_nfWJ3AyPlW5qIKoNYrfLB6jUg4OdP6NflYCEfBWbmuw |
| Closer Lead Owner | cf_SKGJFSyjYFa5ChLkdpbKxjnz0xWdZ0NjRQj8q7GbzHc |
| Active Deal ID, Call Time, Meeting Link, Fathom URL, Traffic Type, UTM fields | New (card 1) |

## Airtable (base "Barak Van Wyk - Master Base", ID appGZSHQfVJ1447Wf)

The base is a copy of Kimberly Rae's, so table and field IDs are the same as in that document: EOC Report Responses tblUwuIwDACVj4IOs, Setters - EOD Responses tblEAodYteE4wgM96, Lead Base tblDqn13hcWbeKEy2, Sales Metrics Summary tblxDyXVVuw6aYwZH, Rep Scorecard tbl7KhTZTEZTfV6gc, Payment Records tblsSwIO7xkkSez10, Instalment Records tblOt5OAnmsmWUZ3R, Refund Records tblgBQCSY4NmQHjhD, Ad Spend tblgG2B3gUsVVgiI9, Finance Metrics Summary tbl29xRuvquJpmn6j, Customer Table tbl0NGI3OT9G4NlMB, Customer Products tblJxCHu4yyqLzTiB, User ID Lookup tblKOsxGk41XxHNdJ.

## Other IDs

| Item | ID |
|---|---|
| Typeform application form | JgRoASaT |
| Zapier Table that maps EOC answers to Close statuses | 01KXC03Y13STKB5AWM4W5ENA30 |
| Google Sheet the Stripe Zap writes to (shared with Kimberly Rae's payment Zaps) | 1mejS31FABDQN7yCzw61pZA_eqGn6plZvCikbkBp3pUI |

## Slack channels (IDs used by the Zaps)

| Channel ID | Used for |
|---|---|
| C0BGJ8RMZSL | New applications (setters react ✅) |
| C0BF8HMN0GP | New bookings (setters react ✅) |
| C0C15RNG3PX | Call confirmed |
| C0BFTKQPWFN | EOC submissions |
| C0BFTLEQXCL | No-show alerts |
| C0BFHLP7667 | Cancellation alerts |
| C0BFHM79B4K | Reschedule alerts |
| C0BFTL6P4TW | Payments |
| C09DM8FSHPF | Payments (second Slack workspace, Stripe Zap only) |
| C0BFPTYK8HY | Setter EOD |
| C0C126YNK5Z | Kickoff booked |

---

# Part 6: tracking and after launch

Use the same glossary, change log, SOP list and first-week checks as the Kimberly Rae document. The system owner is Mitch's call (open questions).

## Progress checklist

| Card | Status | Date tested | Notes |
|---|---|---|---|
| 8 Security and housekeeping (first) | | | |
| 1 Close settings | | | |
| 2 Airtable fixes | | | |
| 3 Typeform application Zap | | | |
| 4 Booking Zaps | | | |
| 5 EOC Zap | | | |
| 6 Smart lists | | | |
| 7 Data cleanup | | | |
| 9 Pre-call reminders | | | |
| 10 No-show follow-up | | | |
| 11 Cancellation handling | | | |
| 12 Reschedule follow-up | | | |
| 13 Fathom to Close and Slack | | | |
| 14 Payment received | | | |
| 15 Failed payment alert | | | |
| 16 Refunds | | | |
| 17 Agreement signed (if used) | | | |
| 18 Client onboarding | | | |
| 19 Weekly and monthly numbers | | | |
| 20 Weekly data check (optional) | | | |
| 21 Rep onboarding and offboarding | | | |
| 22 Setter ✅ claim (optional) | | | |
| 23 Instant response to new applicants | | | |
| 24 Speed-to-lead and sales tracking | | | |
| 25 Re-engagement (optional) | | | |

---

# Part 7: decisions and suggestions

## Open questions

| Question | Who | Card |
|---|---|---|
| Was the exposed AI key replaced? Should the no-close follow-up Zap be rebuilt? | Mitch | 8 |
| Is the Typeform application in use? Where is the link? | Mitch | 3 |
| Who is "Festus"? | Mitch | 2 |
| Should the 7 installment deals in Close be merged into each client's main deal? | Mitch | 7 |
| Does Barak take Stripe payments? Fanbasis renewals? | Mitch | 8, 14 |
| Should the EOD Reminder be on? | Mitch | 8 |
| Rebuild or delete the rep onboarding Zap? | Mitch | 8, 21 |
| Approve the finished no-show, cancel, applicant and re-engagement messages | Mitch | 10, 11, 23, 25 |
| How should Re-Engagement 2 and 3 differ? | Mitch | 25 |
| Do host cancellations mean "screened out"? | Mitch | 11 |
| Do clients sign an agreement? In which tool? | Mitch | 17 |
| Welcome email and intake form for new clients? | Mitch | 18 |
| Does Barak run ads? | Mitch | 24 |
| Triage step before the closer's call? | Mitch | Part 1 |
| Can Close Workflows send "X hours before" a date field? | Leah | 9 |
| Does Fanbasis have failed payment and refund triggers in Zapier? | Leah | 15, 16 |

## Changes I suggest

### Required

1. Replace the exposed AI key and remove it from the Zap (card 8).
2. Create deals at booking and update the same deal on every step (cards 1, 4, 5).
3. Stop counting deposits and installments as new deals (cards 1, 2).
4. Turn on the no-show, cancel and new applicant workflows after finishing their templates (cards 10, 11, 23).
5. Send Calendly cancellations to Close (card 11).
6. Pre-call reminders from Close (card 9).
7. Record a source on every lead, including leads created by hand (cards 3, 4, 6).
8. Fix the cents bug, follow-up tasks and Fathom link in the EOC Zap (card 5).
9. Fanbasis payments update Close and link to the client and rep (card 14).
10. Fix the smart lists, especially "Gold Rush" (card 6).
11. Fix rep names and scorecards (cards 2, 24).
12. Failed payment alert, refund records and weekly numbers (cards 15, 16, 19).

### Suggested, not required

- Turn on the three re-engagement workflows (card 25).
- Replace most of the 79-step EOC Zap with the code step (card 5).
- Make the ✅ claim harder to break (card 22).
- A Zapier "Zap error" alert to Slack.
- Log Instagram DM conversations in Close, so speed to lead can be measured.

---

# Appendix: what we found and which card fixes it

| Severity | Issue | Evidence | Card |
|---|---|---|---|
| Critical | A live AI API key is typed in plain text in a Zap's code | Zap "No Close EOC -> Follow Up Flow" (off), Code step | 8 |
| Critical | Bookings never create a deal, so Close has no booked pipeline and the EOC has no deal to update | "New Deal - Call Booked" has 0 deals. 8 closes on EOCs, 3 closed deals in Close | 1, 4, 5, 7 |
| Critical | Deposits and installment payments count as new closed deals | Airtable: 20 "Closed" EOCs, of which 9 are installment payments and 3 are deposits. Close: 7 of 11 deals are installment payments; Deposit Paid is a won stage | 1, 2, 5 |
| High | No-show, cancel and re-engagement workflows were built but never turned on. Templates still have placeholders | 5 workflows in draft, 0 enrollments. Templates contain "[DESIRED OUTCOME]", "[GENERAL" and empty email subjects | 10, 11, 25 |
| High | New applicant text workflow is paused | "New Opt In / Application": 4 enrollments ever, paused | 23 |
| High | Most leads have no source, and bookings overwrite the source | 70 of 89 leads have no source. Setter bookings set Application and First Click Source to "Setter Booking". Direct bookings write blank sources | 3, 4, 6 |
| High | Typeform application Zap appears unused | No lead has the source "Typeform". Lead Base has no Application Source on any of 73 records | 3 |
| High | Re-applying resets status to "New Lead" and overwrites First Click Source | Typeform Zap "Lead Exists" path | 3 |
| High | Reschedules come through as new bookings, and Calendly cancels never reach Close | "rescheduled = False" filter. No cancel Zap | 4, 11 |
| High | EOC Zap has the same bugs as Kimberly Rae's: cents built as text, 3rd installment field mapped to the date, follow-up dates create no task, installment deals created | Zap configuration | 5 |
| High | Fanbasis payments don't update Close, have no transaction ID, and net amount uses a fixed fee | Zap "Fanbasis": net = amount x 0.9693533 | 14 |
| High | Speed to lead isn't visible | 48 of 86 leads since Sept 1 have no outbound call or text in Close. Median first contact 47 minutes for the rest. Instagram DMs aren't logged | 23, 24 |
| High | Rep scorecards don't match the team | Options "Festus" and "  Emily Wood" (leading spaces). Makena and Barak have no rows. EOD uses "  Emily Wood" | 2, 24 |
| High | Rep onboarding Zap was copied from another business | Off. Trigger table deleted. Creates evoxacademy.com accounts with a shared password | 8 |
| Medium | "Gold Rush" shows recently updated leads instead of stale ones. Other views filter on "lead updated" | Smart view definitions | 6 |
| Medium | Setter missing on 19 of 39 EOCs | Airtable EOC data | 5 |
| Medium | 5 payments not linked to a customer product. 2 September Fanbasis payments missing from their month | Airtable data | 7, 14 |
| Medium | Phone from setter bookings is all Calendly answers joined together | Setter Booking Zap phone mapping | 4 |
| Medium | 31 of 89 leads have no phone | Close data | 4 |
| Medium | No Fathom field in Close. Recordings only in the EOC (39 of 39) | Close fields | 1, 13 |
| Medium | Call dates converted UTC to UTC, so evening calls can show the next day | Date steps in booking and EOC Zaps | 4 |
| Medium | Paid flag formula looks for "Paid Ad". No paid source exists yet | Lead Base formula | 2 |
| Low | Stripe Zap off and not connected. EOD Reminder off | Zap list | 8 |
| Low | Kickoff Session event not visible in Calendly screenshots | Screenshots | 18 |
| Low | 1 duplicate lead | Close data | 7 |
