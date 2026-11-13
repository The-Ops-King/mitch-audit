# Kimberly Rae Coaching: sales automation plan

Version 1.0, November 13, 2026.
For Mitch (overview) and Leah (build guide).
Scope: Kimberly Rae Coaching only. Nelly and Barak each get their own document in the same format. A shared template for all three accounts comes after all three audits.
Based on a read-only review of Zapier (23 Zaps), Close (1,481 leads, 222 deals), Airtable (15 tables) and Calendly (every booking since Sept 1).

## How to use this document

For Mitch: read "What's wrong today" and "What's needed, stage by stage". Answer the open questions near the end.

For Leah:

1. Read "Before you start".
2. Do the build cards in number order. Each card says what to do first.
3. A card is finished only when its "Done when" test passes.
4. Mark each card in the progress checklist.

Words used in this document:

- "Deal" means what Close calls an "Opportunity". The Zapier actions are named "Create Opportunity" and "Update Opportunity".
- "Ask Mitch" means stop and get Mitch's answer before you continue.
- Every name in quotes ("New Lead", "Active Deal ID") is the exact name in the tool. The reference sheet near the end lists every name and ID.

### Using this document with an AI

Paste this whole document into the AI, then paste this prompt:

> You are helping Leah, a VA, build automations for Kimberly Rae Coaching. Use only this document. Leah is working on card [number]. Give her click-by-click steps in Zapier, Close, Airtable or Calendly. Use the exact names and IDs from the reference sheet. Use short sentences. If something in the card says "Ask Mitch", tell her to stop and ask Mitch. Do not invent field names, IDs or steps that are not in this document. When she is done, give her the "Done when" test for that card.

---

# Part 1: overview

## What's wrong today

The system works day to day. Leads reach Close, Slack gets alerts, closers fill in EOCs. But the data and the follow-up have gaps:

- The numbers are wrong. In Airtable, 0 of 825 leads count as paid because of a one-word typo. October's finance total shows $22,800, but $27,400 was collected (renewals are missing). Deposits and installment payments count as new closed deals.
- The pipeline is too big. Every booking and every reschedule creates a new $7,200 deal. Calendly cancellations never reach Close. Close shows $700,800 of open deals, and $136,800 of that is on leads that are dead or already clients.
- Payments don't reach Close. Fanbasis payments never update Close. A $1,133.33 payment shows in Close as $11.33.
- Follow-up is missing. New applicants get no instant text. Close sends no reminder texts. No-shows and cancellations get no follow-up messages. Follow-up dates don't create tasks. Fathom recordings never reach Close. Signed agreements update nothing.

The plan keeps the current setup and changes only what's needed.

## How Close is set up today

Close has one pipeline, "Sales". Deals start only when a call is booked. The setter and closer stages are lead statuses, not pipeline stages (New Lead, New Opportunity, Closer Follow Up, No show, Canceled and others). "Setter Owner" and "Closer Owner" are custom fields. The plan keeps this. It only adds a "Not Booked" stage and a few fields (card 1).

## What's needed, stage by stage

Keep = works now. Fix = change something that exists. Build = make something new. The card number shows where the steps are.

### 1. New lead comes in

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Lead created in Close | 6 form Zaps (IG, Paid Ads, Kajabi application, 3 Kajabi freebies) | Fix: they reset the status and overwrite the source on existing leads | 3 |
| Deal created at "Not Booked" | No. Deals start only at booking | Build | 1, 3 |
| Webinar exception | No webinar source exists | Not needed | |
| Lead source tracked | Opt Source, Applied Source and Book Source fields | Fix: overwritten on every form. Traffic Type never filled | 3, 4 |
| Typeform answers and UTMs tracked | Answers saved as a note. No UTMs | Fix: add UTM tracking | 3 |

### 2. Speed to lead

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Slack alert "ready to be called" | NEW APPLICATION channel, "Dial ASAP" | Keep. Fix: freebie opt-ins get their own channel | 3 |
| Smart list: new applications | "New Apps" | Keep | |
| Smart list: day-old leads | "Gold Rush" and "Gold Rush (Paid Ads)" | Fix: leads drop off the lists. The Paid Ads list shows 94 of 223 paid leads | 6 |
| Smart list: 3 to 7 day leads | "3 Day No Book" shows 0 to 3 days | Fix | 6 |
| Instant text and email to new applicants (before they book) | None. 27% of leads since September had no call or text in Close; median first contact 100 minutes | Build | 23 |
| Speed-to-lead measured | No working measure (Airtable "Minutes to Claim" shows 0) | Build | 24 |

### 3. Call booked

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Deal moves from Not Booked to Booked | A new $7,200 deal on every booking and reschedule | Fix | 4 |
| Triage call vs closing call | No triage call exists. Every booking is the same 45-minute call with Makena, or a live transfer | Keep | |
| Assigned to the right closer | Matched from the Calendly host | Keep. Fix: make the match exact | 4 |
| Booking posted to Slack | Yes | Keep | |
| Booking source tagged | Every direct booking is labeled "Paid Ads", even Instagram and email links | Fix | 4 |
| Setter claims the booking (✅ in Slack) | Works | Keep. Optional fix | 22 |

### 4. Pre-call

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Text and email right after booking | Nothing in Close. Calendly sends its own | Build in Close, then turn off Calendly's | 9 |
| Reminders 24 hours and 1 hour before | Nothing in Close. Calendly texts only the 40% who give a number | Build in Close, then turn off Calendly's | 9 |
| Qualification (triage) before the closer's call | No triage call. Closers screen by canceling direct bookings (55 of 97 since September) | Decision for Mitch (see open questions) | 11 |

### 5. Post-call

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Call outcome recorded (EOC) | Airtable form plus an 88-step Zap | Fix: money, follow-up, Fathom and deal steps | 5 |
| Showed or no-show tracked | Only in the lead status and the EOC | Fix (in card 5) | 5 |
| Fathom recording on the lead | Closers paste the link into the EOC. It never reaches Close | Build | 13 |
| Fathom summary in Slack | No. Slack gets the typed EOC summary | Build | 13 |
| EOC summary in Slack | Yes | Keep | |
| Follow-up task from the follow-up date | No | Fix | 5 |

### 6. No-show, cancel, reschedule

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Closer marks No Show | Lead status "No show" | Keep | |
| No-show, cancel and reschedule alerts in Slack | Yes | Keep | |
| No-show follow-up messages | None | Build | 10 |
| Cancellations reach Close | No. 55 of 97 direct bookings were canceled by the host and Close never knew | Build | 11 |
| Cancel follow-up messages | None | Build | 11 |
| Reschedule link messages | None. Reschedules also create duplicate deals | Build | 12 (messages), 4 (duplicates) |
| Smart lists: no-shows, cancels, reschedules | "No Shows" only, and leads drop off it | Fix and build | 6 |

### 7. Payment

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Payment received alert | Fanbasis to Slack | Keep. Fix: also update Close and link the client and rep | 14 |
| Deposits not counted as closed deals | They are counted, in Close and Airtable. Installment payments too | Fix | 1, 2 |
| Payment plans tracked in one place | In Close deals and in Airtable | Fix | 5 |
| Failed payment alert | None | Build | 15 |
| Refunds recorded automatically | None | Build | 16 |

### 8. Agreement and onboarding

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Signed agreement updates Slack and Close | The Zap exists but is off, and only posts to Slack | Fix | 17 |
| Welcome email | Yes | Keep | |
| Intake form and kickoff tracked | Posted to Slack only | Fix: also write to Close, remind if no kickoff | 18 |

### 9. Reporting

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Correct sales and finance numbers | Wrong: paid flag, missing renewals, deposits counted as deals | Fix | 2, 5, 14 |
| Weekly and monthly numbers in Slack | None | Build | 19 |
| Weekly data check | None | Build (optional) | 20 |
| Ad spend entered (for cost per lead and return on ad spend) | Ad Spend table is empty | Build | 24 |
| Rep scorecards complete | Sidonie has no scorecard rows | Fix | 2, 24 |

### 10. Team

| What's needed | Today | Verdict | Card |
|---|---|---|---|
| Rep onboarding Zap | Works. Every new rep gets the same password | Fix | 8 |
| Rep onboarding and offboarding checklists | None | Build | 21 |
| Setter EOD and EOD reminder | Works | Keep | |

---

# Part 2: before you start

## Logins you need

| Tool | Access level | Used in cards |
|---|---|---|
| Zapier | Edit all Zaps | 3, 4, 5, 8, 9 to 22 |
| Close | Admin (to change pipelines, fields, smart views, workflows) | 1, 3 to 7, 9 to 18 |
| Airtable | Creator on "Kimberly Rae Coaching - Master Base" | 2, 5, 7, 14 to 16, 19 |
| Calendly | Admin (to change event types and reminders) | 9, 11 |
| Typeform | Edit both application forms | 3 |
| Slack | Create channels in the main workspace | 3, 20 |
| Fathom | Admin (integrations) | 13 |
| DocuSign | Connected in Zapier (already is) | 17 |
| Fanbasis | Connected in Zapier (already is) | 14 to 16 |

## Rules for every change

1. Back up first.
   - Zapier: before you edit a Zap, open it, click the Zap name menu, choose "Duplicate", and rename the copy "BACKUP [date] [name]". Leave the backup off.
   - Airtable: before card 2, take a base snapshot (base menu, "Snapshots", "Take snapshot").
   - Close: before card 7, export all leads and opportunities (Settings, Export).
2. Change one card at a time. Test it. Then move on.
3. To undo a Zap change: turn off the edited Zap and turn on the backup.
4. Never rename or delete an existing Close status, stage or field, or an Airtable field. Zaps and formulas use them and break without warning.
5. Test with your own name, email and phone number. Use "TEST" in the name. Delete test leads when the card is done.
6. Write every change in the change log (Part 6).

## Naming Zaps

New and edited Zaps use this format: `KRC | [trigger] > [main result]`.
Example: `KRC | Calendly cancel > Close status + follow-up`.
Keep all Kimberly Rae Coaching Zaps in one Zapier folder named "KRC".

---

# Part 3: build cards

## Table of contents

Part A: quick fixes to things that already exist.

| # | What it is | What it does |
|---|---|---|
| 1 | Close settings | Add one pipeline stage and new fields. Change one stage setting |
| 2 | Airtable formulas | Fix three formulas and one dropdown |
| 3 | Lead form Zaps (6) | Stop overwriting leads. Create a deal for every new lead. Track UTMs |
| 4 | Booking Zaps (2) | Update the existing deal. Handle reschedules. Label sources correctly |
| 5 | EOC Zap | Fix money, follow-up, Fathom and deal steps |
| 6 | Smart lists | Fix 4 lists, add 2 |
| 7 | Data cleanup | Close dead deals, merge duplicates, link loose payments |
| 8 | Housekeeping | Delete a draft Zap. Fix the new rep password |

Part B: new and bigger automations.

| # | What it is | What it does |
|---|---|---|
| 9 | Pre-call reminders | Text and email right away, 24 hours before, 1 hour before |
| 10 | No-show follow-up | Messages after a no-show, with the booking link |
| 11 | Cancellation handling | Calendly cancels reach Close. Leads who cancel get follow-up |
| 12 | Reschedule follow-up | Messages with the booking link |
| 13 | Fathom to Close and Slack | Recording link and summary on the lead and in Slack |
| 14 | Payment received | Fanbasis updates Close and Airtable, then Slack |
| 15 | Failed payment alert | Slack alert and Close task |
| 16 | Refunds | Refund record, commission clawback, Close note |
| 17 | Agreement signed | DocuSign updates Close and Slack |
| 18 | Client onboarding | Intake and kickoff tracked in Close, kickoff reminder |
| 19 | Weekly and monthly numbers | Slack report: leads, show rate, close rate, cash |
| 20 | Weekly data check (optional) | Slack list of records to fix |
| 21 | Rep onboarding and offboarding | Two checklists |
| 22 | Setter ✅ claim (optional) | Make the Slack reaction Zap harder to break |
| 23 | Instant response to new applicants | Text and email with the booking link right after someone applies |
| 24 | Speed-to-lead and sales tracking | First-contact time, ad spend entry, complete rep scorecards |

Every card has the same parts:

- System: where you work.
- Trigger: what starts the automation.
- Outcome: what changes for the business.
- Do this first: cards that must be finished before this one.
- Steps: what to do.
- Done when: the test that proves it works.
- Keep in mind: warnings.

# Part A: quick fixes

## 1. Close settings

**System:** Close, Settings.

**Trigger:** None. One-time setup.

**Outcome:** Close can hold a deal from the moment a lead arrives. Deposits stop counting as wins. Every automation knows which deal to update and when the call is.

**Do this first:** Nothing.

**Steps:**

1. Settings > Pipelines > "Sales". Add a stage "Not Booked", type Active. Drag it to the top.
2. Same screen. Change "Deposit Paid" from Won to Active.
3. Settings > Custom Fields > Lead. Add these fields:
   - "Active Deal ID" (Text)
   - "Call Time" (Date and time)
   - "Meeting Link" (Text)
   - "UTM Source", "UTM Medium", "UTM Campaign", "UTM Content" (Text)
4. Settings > Custom Fields > Opportunity. Add "Agreement Signed" (Date).

**Done when:** The Sales pipeline shows "Not Booked" at the top and "Deposit Paid" as Active. All 8 new fields exist.

**Keep in mind:**

- Do not rename or delete anything that already exists.
- After step 2, the 5 existing deposit deals leave the "won" reports. That is correct.

## 2. Airtable formulas

**System:** Airtable, base "Kimberly Rae Coaching - Master Base".

**Trigger:** None. One-time edits.

**Outcome:** Paid vs organic works. Deposits and installment payments stop counting as new deals. Sidonie shows on the scorecard.

**Do this first:** Take an Airtable snapshot (Part 2).

**Steps:**

1. Table "Lead Base", field "Is Paid". In the formula, change every `"Paid Ad"` to `"Paid Ads"`. There are 4.
2. Table "EOC Report Responses", field "Closed Deals". Replace the formula with:
   `IF(AND({Call Outcome}="Closed",{Payment Type}!="Deposit",{Payment Type}!="Instalment Paid"),1,0)`
3. Table "Rep Scorecard", field "Rep Name". Rename the option "Sidonie Claurans" to "Sidonie Chechin".

**Done when:** Sales Metrics Summary, row "All Time": "Paid: Total Leads" is about 230 (it was 0). Deposit EOCs show 0 in "Closed Deals".

**Keep in mind:** Closed deal counts for past months will go down. That is the correction. Tell Mitch.

## 3. Lead form Zaps

**System:** Zapier. Six Zaps:

- "IG Application -> Close -> Slack -> Airtable"
- "Paid Ads Application -> Close -> Slack -> Airtable"
- "Kajabi Application -> Close -> Slack -> Airtable"
- "Kajabi - Relationship Quiz -> Close -> Slack -> Airtable"
- "Kajabi - Commitment Training -> Close -> Slack -> Airtable"
- "Kajabi - Anxious to Confident Blueprint -> Close -> Slack -> Airtable"

**Trigger:** Unchanged. Typeform "New Entry" (IG and Paid Ads forms). Kajabi "New Form Submission" (the other four).

**Outcome:** A lead or client who fills in another form keeps their status and first source. Every new lead gets a deal at Not Booked. Freebie opt-ins go to their own Slack channel. UTMs are saved.

**Do this first:** Card 1.

**Steps (do these in each of the 6 Zaps):**

1. Back up the Zap.
2. Path "Lead Exists", step "Update Lead in Close". Delete the fields Status, Opt Source and Applied Source. Keep the note step.
3. Move the two Kit steps (tag and sequence) so they come after the last Close step.
4. Path "Lead Does Not Exist", step "Create Lead". Set Traffic Type to "Paid" in the Paid Ads Zap. Set it to "Organic" in the other five.
5. In both paths, after the Close lead step, add four steps:
   1. Close "Find Opportunity". Lead = this lead. Status type = Active.
   2. Filter. Continue only if no opportunity was found.
   3. Close "Create Opportunity". Status = "Not Booked". Value = empty.
   4. Close "Update Lead". "Active Deal ID" = the ID from the step above.
6. Only in the 3 freebie Zaps: in Slack, create a channel #freebie-optins. Change the Slack step to post there. Delete "Dial ASAP" from the message.
7. Only in the IG and Paid Ads Zaps: in Typeform, add hidden fields `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`. In the Zap's Close steps, map them to the UTM fields from card 1.

**Done when:**

- Submit a form as a new TEST lead. Close shows the lead with 1 deal at "Not Booked", and "Active Deal ID" is filled.
- Submit the same form again with the same email. The status, Opt Source and deal count do not change.
- A freebie test posts in #freebie-optins, not NEW APPLICATION.

**Keep in mind:**

- Ask Mitch to add the UTM tags to the ad and landing page links. The fields stay empty until the links include them.
- "Opt Source" now means "where they first came from", because nothing overwrites it anymore.

## 4. Booking Zaps

**System:** Zapier. Two Zaps:

- "Setter Booking -> Close -> Slack -> Airtable"
- "DCB Booking -> Close -> Slack -> Airtable"

**Trigger:** Unchanged. Calendly "Invitee Created". The Setter Booking Zap filters on event names containing "(SB)" or "Live". The DCB Zap filters on "DCBA", "DCBIG" or "DCBE".

**Outcome:** One booking makes one deal. A reschedule updates the same deal. The right closer is assigned. Close knows the exact call time and Zoom link. Direct bookings show their real source.

**Do this first:** Card 1.

**Steps (in both Zaps unless it says "DCB Zap only"):**

1. Back up the Zap.
2. Delete the filter "rescheduled = False".
3. Add a Paths step right after the event name filter:
   - Path "Reschedule". Rule: "Old Invitee" exists. Steps:
     1. Close "Find Lead" by email.
     2. Close "Update Lead": "Call Time" = new start time, "Meeting Link" = new Zoom link.
     3. Close "Create Note": "Rescheduled to [new start time]".
     4. End of path.
   - Path "New booking". Rule: "Old Invitee" does not exist. Move all the old steps into this path.
4. Step "Find Record" in User ID Lookup. Set "Exact match" to Yes.
5. Delete the "Create Opportunity" step. Add instead:
   1. Close "Find Lead" (if not already found).
   2. Paths:
      - If "Active Deal ID" has a value: Close "Update Opportunity". ID = Active Deal ID. Status = "New Deal - Mentorship Interview". User = the closer's Close ID.
      - If "Active Deal ID" is empty: Close "Create Opportunity" with the same status and user. Then Close "Update Lead": "Active Deal ID" = the new ID.
   3. Do not set a value. (The old step set $7,200. Leave it empty.)
6. Steps "Update Lead" and "Create Lead":
   - Delete Opt Source and Applied Source. Keep Book Source.
   - Add "Call Time" = Calendly start time (full date and time).
   - Add "Meeting Link" = Calendly location join URL.
7. Date formatting step: keep it for "Date Of Call", but set the time zone to America/New_York.
8. Move the two Kit steps so they come after the last Close step.
9. DCB Zap only: add a Formatter "Lookup Table" step on the event name: "DCBA" = "Paid Ads", "DCBIG" = "Instagram", "DCBE" = "Email". Use its result for Book Source and Traffic Type instead of the typed "Paid Ads".

**Done when:**

- Book a TEST call. Close shows 1 deal at "New Deal - Mentorship Interview", the right closer, and "Call Time" and "Meeting Link" filled.
- Reschedule that booking in Calendly. Close still shows 1 deal. "Call Time" shows the new time and there's a "Rescheduled" note.
- Book a TEST call for 9pm Eastern. "Date Of Call" shows the same day, not the next day.

**Keep in mind:** Ask Mitch to confirm what DCBA, DCBIG and DCBE mean before step 9.

## 5. EOC Zap

**System:** Zapier, "EOC Form -> Close -> Slack -> Airtable" (88 steps).

**Trigger:** Unchanged. Airtable "New Record" in "EOC Report Responses" (a closer submits the EOC form).

**Outcome:** Amounts with cents save correctly. Every follow-up date becomes a Close task. The Fathom link lands on the lead. Installment payments stop creating fake deals. The right deal gets updated.

**Do this first:** Cards 1 and 2.

**Steps:**

1. Back up the Zap.
2. First Code step, "Input Data" section: `amt_3` points to "Date of 3rd Instalment". Change it to "3rd Instalment Amount".
3. Find every Close step where a value ends in `00`, like `{{Cash Collected}}00`. Before each one, add a Formatter step: Numbers > Spreadsheet-Style Formula > `ROUND({{Cash Collected}}*100,0)`. Use the Formatter result instead. Do the same for each installment amount.
4. In every "Update Lead in Close" step, add "Fathom URL" = "Fathom Share Link".
5. Path "No Close / Follow Up": add a Filter (continue only if "Follow Up Date" has a value), then Close "Create Task": assigned to the closer's Close ID, due on "Follow Up Date", text "Follow up: [Lead Full Name]".
6. In every Close "Update Opportunity" step, set the opportunity ID to the lead's "Active Deal ID" instead of the "Find Opportunity" result.
7. The four "Payment Method" filters: delete the Whop, Shopify and Stripe rules. Keep Fanbasis.
8. Path "Payment Plan (Create Opportunities)": delete the 5 Close "Create Opportunity" steps (Instalment 2 to 6). Keep the Airtable installment steps.
9. Path "Instalment": delete the Close "Create Opportunity" step.

**Done when:** Submit TEST EOCs for these cases and check Close:

- Closed, paid in full, cash 1133.33: deal value is $1,133.33 (not $11.33).
- Deposit: deal at "Deposit Paid", not won.
- Payment plan: 1 won deal, no extra installment deals. Installment rows appear in Airtable.
- Offer Made with a follow-up date: a task on that date for the closer.
- Any outcome: "Fathom URL" is filled on the lead.

**Keep in mind:**

- After step 3, fix the $11.33 deal in Close by hand to $1,133.33.
- Optional: the 88 steps can be replaced by one Code step plus about 12 normal steps. The code is in the repo at `kimberly-rae/code/eoc-decide.js`. It's tested on every outcome in the form and contains no passwords or keys. Build it as a new Zap, test it, then turn the old one off. This is easier to change later; it's not required.

## 6. Smart lists

**System:** Close, Smart Views.

**Trigger:** None. Smart views update on their own.

**Outcome:** Setters have accurate call lists.

**Do this first:** Nothing.

**Steps:**

| Smart view | Change |
|---|---|
| "🏆 Gold Rush" (day-old leads) | Remove "lead updated not in the last 24 hours". Add "created in the last 1 day" and "last call more than 24 hours ago or never" |
| "🪎 Gold Rush (Paid Ads)" | Change the three source rules from AND to OR. Then make the same date change |
| "3️⃣ 3 Day No Book" | Rename to "3 to 7 Day Leads". Rules: created 3 to 7 days ago, status "New Lead" |
| "👻 No Shows" | Remove "lead updated". Add "last call more than 6 hours ago or never" |
| "Cancellations" (new) | Status "Canceled", last call more than 6 hours ago or never |
| "Reschedules" (new) | Status "New Opportunity - Reschedule", last call more than 6 hours ago or never |

**Done when:** "Gold Rush (Paid Ads)" shows about 220 leads (it showed 94). Each new list opens without errors.

**Keep in mind:** "Lead updated" changes every time a Zap touches a lead. That's why leads were disappearing. Never use "lead updated" in a smart view.

## 7. Data cleanup

**System:** Close and Airtable, by hand.

**Trigger:** None. One-time cleanup.

**Outcome:** Pipeline and finance numbers start clean.

**Do this first:** Cards 3, 4 and 5 (so new bad data stops). Export Close data (Part 2).

**Steps:**

1. Close: move the 15 open deals on DQ, NGMI, Canceled, No show or signed leads to "New Deal - Lost" (or to won, if the lead is a client).
2. Close: 7 leads have more than one open interview deal. Keep the newest. Move the others to "New Deal - Lost".
3. Close: 20 open deals and 10 "New Lead - DCB" leads come from bookings the host canceled. Ask Mitch if they are DQs. Update them.
4. Close: merge the 15 groups of duplicate leads (same email). Keep the oldest lead.
5. Airtable "Payment Records": link the 18 payments that have no "Customer Table" or "Customer Products". Add the date to the renewal with no date.
6. Close: fill "Active Deal ID" on every lead that has one open deal.

**Done when:** Close open pipeline drops by about $136,800. No lead has two open deals. Every Payment Record has a customer.

**Keep in mind:** Ask for the exact lists of leads and deals for each step. They can be pulled from the data.

## 8. Housekeeping

**System:** Zapier.

**Trigger:** Unchanged. "New Rep Onboarding" runs on Airtable "New Record" in "New OB Form Responses".

**Outcome:** No leftover drafts. New reps don't keep a shared password.

**Do this first:** Nothing.

**Steps:**

1. Delete the Zap "Untitled Zap" (an empty draft).
2. Zap "New Rep Onboarding (OB Form -> Close -> Google -> Airtable -> Slack)", Google Workspace step: turn on "Change password at next login".

**Done when:** The draft is gone. The Google step shows "Change password at next login: Yes".

**Keep in mind:** Leave "New Contract > Slack" off for now. Card 17 turns it on.

# Part B: new and bigger automations

## 9. Pre-call reminders

**System:** Close (texts and emails from the closer's Close number and email). Zapier if Close can't do the timing.

**Trigger:** A new booking (Calendly "Invitee Created", the same event as card 4).

**Outcome:** Every booked lead gets a text and email right away, 24 hours before and 1 hour before the call. More people show up.

**Do this first:** Cards 1 and 4.

**Steps:**

1. Check in Close: Workflows > New. Can a step be set to send "X hours before" the "Call Time" field?
2. If yes (option A):
   1. Create the workflow "Pre-Call Reminders" with messages P1 to P3 from the message copy (Part 4).
   2. P1 sends right away. P2 sends 24 hours before "Call Time". P3 sends 1 hour before "Call Time".
   3. Stop the workflow when the lead status changes away from "New Opportunity".
   4. At the end of both booking Zaps (card 4, path "New booking"), enroll the lead in this workflow.
3. If no (option B, Zapier):
   1. New Zap `KRC | Calendly booking > pre-call reminders`. Trigger: Calendly "Invitee Created", same event names as card 4.
   2. Close: find the lead by email. Send P1 (text and email).
   3. Delay Until: 24 hours before the start time. Then Close find lead again. Filter: status is still "New Opportunity" and "Call Time" still equals this booking's start time. Send P2.
   4. Delay Until: 1 hour before the start time. Same check. Send P3.
4. Turn off Calendly's reminder emails and texts on the 4 "KRC Consultation Call" event types and "Live Interview".

**Done when:** Book a TEST call 25 hours ahead with your phone and email. You get P1 right away, P2 about 24 hours before, P3 about 1 hour before. Then book one 3 hours ahead: you get P1 and P3, not P2.

**Keep in mind:**

- Skip P2 if the call is less than 24 hours away. A quarter of calls are booked less than 16 hours ahead.
- The check in option B stops reminders for canceled or rescheduled calls.
- If neither option works, keep the reminders in Calendly (right away, 24 hours, 1 hour) and skip step 4.
- Follow the texting rules (Part 4).
- Check that Kit sequence 2893474 (started by the booking Zaps) doesn't also send reminders. If it does, ask Mitch which one to keep.

## 10. No-show follow-up

**System:** Close Workflow.

**Trigger:** The closer changes the lead status to "No show" (they already do this).

**Outcome:** Every no-show gets a booking link within 5 minutes and follow-up for a week, automatically.

**Do this first:** Nothing.

**Steps:**

1. Close: Workflows > New > "No-Show Follow-Up".
2. Add messages N1 to N5 from Part 4 with these delays: N1 after 5 minutes, N2 on day 1, N3 on day 3, N4 on day 3, N5 on day 7.
3. Stop when the lead replies, books again, or the status changes.
4. Enrollment: if Close can enroll leads when they enter a smart view, use the "👻 No Shows" view. If not, add a step to the Zap "No Show -> Slack": enroll the lead in this workflow.

**Done when:** Set a TEST lead to "No show". You get N1 within 5 minutes. Book again: no more messages.

**Keep in mind:**

- Keep the Zap "No Show -> Slack" on.
- Follow the texting rules (Part 4).

## 11. Cancellation handling

**System:** New Zap. Close Workflow for the follow-up.

**Trigger:** Calendly "Invitee Canceled".

**Outcome:** Cancellations reach Close automatically. Leads who cancel get follow-up. Bookings the closer cancels (screened out) are marked DQ, not left as open deals.

**Do this first:** Card 4.

**Steps:**

1. New Zap `KRC | Calendly cancel > Close status + follow-up`. Trigger: Calendly "Invitee Canceled".
2. Filter: "Rescheduled" is false. (Reschedules are handled in card 4.)
3. Close "Find Lead" by email.
4. Paths by "Canceler Type":
   - "invitee" (the lead canceled):
     1. Close "Update Lead": status "Canceled". (The Zap "Canceled Call -> Slack" then posts the alert.)
     2. Enroll in the workflow "Cancel Follow-Up" (messages C1 to C4 in Part 4).
   - "host" (the closer canceled):
     1. Close "Update Lead": status "DQ".
     2. Close "Update Opportunity": ID = "Active Deal ID", status "New Deal - Lost".
     3. Close "Create Note": "Canceled by host. Reason: [cancellation reason]".
5. Calendly: make a cancel reason required for hosts on the consultation call event types.

**Done when:** Cancel a TEST booking as the lead: status "Canceled" and C1 arrives. Cancel another TEST booking as the host: status "DQ", deal lost, no messages.

**Keep in mind:**

- 55 of 97 direct bookings since September were canceled by the host with no reason. Ask Mitch to confirm these are on purpose (screening) before you build the "host" path.
- Follow the texting rules (Part 4).

## 12. Reschedule follow-up

**System:** Close Workflow.

**Trigger:** The closer changes the lead status to "New Opportunity - Reschedule".

**Outcome:** A lead who asks to move the call but hasn't picked a new time gets the booking link right away and reminders until they book.

**Do this first:** Nothing.

**Steps:**

1. Close: Workflows > New > "Reschedule Follow-Up".
2. Add messages S1 to S3 from Part 4: S1 right away, S2 on day 1, S3 on day 3.
3. Stop when the lead books (the booking Zap changes the status), replies, or the status changes.
4. Enrollment: same method as card 10, using the "Reschedules" smart view.

**Done when:** Set a TEST lead to "New Opportunity - Reschedule". S1 arrives right away.

**Keep in mind:** Reschedules made with Calendly's reschedule link are already handled in card 4. This card is only for people who haven't picked a new time.

## 13. Fathom to Close and Slack

**System:** Fathom's Close integration if available. Otherwise a new Zap.

**Trigger:** Fathom "New Recording".

**Outcome:** Every sales call recording and summary is on the lead in Close and posted in Slack. Closers don't paste links.

**Do this first:** Card 1.

**Steps:**

1. Fathom: Settings > Integrations. If Close is listed, connect it and go to step 4.
2. Otherwise, new Zap `KRC | Fathom recording > Close + Slack`. Trigger: Fathom "New Recording". Add a filter so only sales calls continue.
3. Close "Find Lead" by the guest's email. Close "Update Lead": "Fathom URL" = recording link. Close "Create Note": summary and action items.
4. Slack: post the lead name, summary and link to the EOC channel.
5. If no lead is found, post in Slack: "No Close lead found for this recording: [guest email]".

**Done when:** Record a short TEST call with a TEST lead's email. The link and summary appear on the lead and in Slack.

**Keep in mind:** Fathom records the Zoom call. You don't need a separate Zoom recording.

## 14. Payment received

**System:** Zapier. Two Zaps:

- "Fanbasis Payment -> Airtable -> Slack"
- "Fanbasis - Renewal -> Airtable -> Slack"

**Trigger:** Unchanged. Fanbasis "New Sale" and Fanbasis "Subscription Renewal".

**Outcome:** Every payment updates Close, links to the client and rep (so commissions are right), marks installments paid, and is never counted twice.

**Do this first:** Cards 1 and 7.

**Steps (in both Zaps):**

1. Back up the Zap.
2. Airtable "Payment Records": add a text field "Transaction ID".
3. First step after the trigger: Airtable "Find Record" in "Payment Records" where "Transaction ID" = the Fanbasis transaction ID. Add a filter: continue only if not found.
4. Close "Find Lead" by email. If not found: Slack post "Unmatched payment: [name], [email], [amount]" and stop.
5. Airtable "Find or Create Record" in "Customer Table" by email. Same in "Customer Products".
6. Airtable "Create Record" in "Payment Records": Transaction ID, Date, Amount, Net Amount = Fanbasis "creator earnings", Customer Table, Customer Products.
7. Airtable: find the oldest unpaid "Instalment Records" row for that customer product. If one exists, set "Paid Date", "Paid Amount" and link this payment.
8. Close "Update Lead": status "Signed Up - Closed" if nothing more is owed, or "Signed Up - Balance Owed" if installments remain. If the deal ("Active Deal ID") is at "Deposit Paid" and this payment covers the rest, move it to "New Deal - Closed".
9. Move both Slack steps to the end.

**Done when:**

- A TEST sale creates one Payment Record linked to a customer and product, and updates the Close lead.
- Replaying the same sale in Zapier creates nothing (stopped at step 3).
- A payment from an unknown email posts "Unmatched payment" in Slack.

**Keep in mind:**

- The renewal Zap used a fixed 3.9% fee. Use Fanbasis "creator earnings" in both Zaps instead.
- After this card, the October total in Finance Metrics should show $27,400. If it doesn't, check the Airtable automation that links payments to months.

## 15. Failed payment alert

**System:** Zapier.

**Trigger:** Fanbasis failed payment, if Zapier offers it. Otherwise Schedule by Zapier, every day at 9am Eastern.

**Outcome:** No failed or late payment is missed.

**Do this first:** Card 14.

**Steps:**

1. New Zap `KRC | Failed payment > Slack + Close task`.
2. Trigger: Fanbasis failed payment. Or: Schedule (daily, 9am Eastern), then Airtable "Find Records" in the "🚨 Overdue" view of "Instalment Records".
3. Slack: post name, amount, product and due date to the payments channel.
4. Close "Create Task" for the deal owner: "Collect failed payment from [name]".
5. Optional: send the client message F1 (Part 4).

**Done when:** A TEST overdue installment (or a failed test payment) posts in Slack and creates a Close task.

## 16. Refunds

**System:** Zapier.

**Trigger:** Fanbasis refund, if Zapier offers it. Otherwise a new submission of an Airtable form "Refund" on the "Refund Records" table.

**Outcome:** Refunds are recorded the same way every time, and commissions are clawed back automatically.

**Do this first:** Card 14.

**Steps:**

1. New Zap `KRC | Refund > Airtable + Close + Slack`.
2. Airtable "Create Record" in "Refund Records", linked to the payment, customer and product. The clawback formulas already exist.
3. Close "Create Note" on the lead: "Refund [amount] on [date]". If fully refunded, change the status (ask Mitch which one).
4. Slack: post the refund.

**Done when:** A TEST refund creates a Refund Record with a clawback amount and a Close note.

## 17. Agreement signed

**System:** Zapier, "New Contract > Slack" (exists, currently off).

**Trigger:** Unchanged. DocuSign "Recipient Completed" (the client signs).

**Outcome:** A signed agreement shows in Slack and on the deal in Close.

**Do this first:** Card 1.

**Steps:**

1. After the trigger, add Close "Find Lead" by the signer's email.
2. Close "Update Opportunity": ID = "Active Deal ID", "Agreement Signed" = today.
3. Close "Create Note": "Agreement signed: [document name]".
4. Keep the Slack step last.
5. Turn the Zap on.

**Done when:** Sign a TEST agreement. Close shows the date on the deal and a note. Slack shows the alert.

## 18. Client onboarding

**System:** Zapier. Existing Zaps "Onboarding Email", "New Client Intake Form > Slack", "Kickoff Session > Slack", plus one new Zap.

**Trigger:** Unchanged for the existing Zaps: Airtable new EOC, Google Forms "New Response", Calendly "Invitee Created" (Kickoff Session). New Zap: Schedule by Zapier, every day.

**Outcome:** Every new client gets the welcome email, and Close shows whether intake and kickoff are done. No paid client is forgotten.

**Do this first:** Card 14.

**Steps:**

1. "New Client Intake Form > Slack": add Close "Find Lead" by email, then Close "Create Note": "Intake submitted".
2. "Kickoff Session > Slack": add Close "Find Lead" by email, then Close "Create Note": "Kickoff booked for [date]".
3. New Zap `KRC | Daily > kickoff reminder`:
   1. Schedule: every day at 10am Eastern.
   2. Find clients who signed more than 48 hours ago with no kickoff note. (Easiest: a Close smart view "Signed, no kickoff". Leah can update it by hand until Close search in Zapier supports it.)
   3. Send message K1 (Part 4) to each.
   4. Slack: post the list to the onboarding channel.

**Done when:** A TEST intake and kickoff each add a note in Close. A TEST client with no kickoff after 48 hours gets K1.

**Keep in mind:** The "Onboarding Email" Zap works. Don't change it.

## 19. Weekly and monthly numbers

**System:** Zapier and Airtable, posting to Slack.

**Trigger:** Schedule by Zapier: every Monday at 8am Eastern, and the 1st of each month at 8am Eastern.

**Outcome:** Mitch gets the main numbers every week and month without opening anything.

**Do this first:** Cards 2, 5 and 14. Before these, the numbers are wrong.

**Steps:**

1. New Zap `KRC | Weekly numbers > Slack`. Trigger: Schedule, Monday 8am.
2. Airtable "Find Record" in "Sales Metrics Summary" where "Reporting Period" = "Last Week". Same in "Finance Metrics Summary".
3. Slack: post:
   - New leads
   - Calls booked
   - Shows and show rate
   - Offers
   - Closed deals and close rate
   - Cash collected (new and recurring)
   - Deposits not yet paid in full
4. Duplicate the Zap for monthly: trigger on the 1st, "Reporting Period" = "Last Month".

**Done when:** Run the Zap by hand. The numbers in Slack match the Airtable row.

## 20. Weekly data check (optional)

**System:** Zapier, posting to an ops Slack channel.

**Trigger:** Schedule by Zapier, every Monday at 9am Eastern.

**Outcome:** Problems are found every week instead of piling up.

**Do this first:** Card 7.

**Steps:** Each Monday, post counts and links for:

- duplicate leads (same email)
- leads with more than one open deal
- open deals on DQ or lost leads
- Payment Records without a customer

**Done when:** The post appears and every count is 0 right after card 7.

## 21. Rep onboarding and offboarding

**System:** Two written checklists. The onboarding Zap stays (with card 8's fix).

**Trigger:** None. Run by hand when a rep joins or leaves.

**Outcome:** New reps are set up the same way every time. Reps who leave lose access the same day.

**Do this first:** Card 8.

**Steps:**

1. Write the onboarding checklist:
   - Google account (the Zap does this)
   - Close seat (the Zap does this)
   - "User ID Lookup" row with Close ID and Slack ID
   - Calendly seat, added to the consultation call round robin if a closer
   - Slack channels
   - walk through the smart lists and the EOC form
2. Write the offboarding checklist:
   - deactivate in Close
   - suspend in Google
   - remove from the Calendly round robin
   - reassign open leads and deals in Close
   - remove from Slack
   - mark the "User ID Lookup" row inactive

**Done when:** Both checklists are saved where the team keeps SOPs, and Mitch has approved them.

## 22. Setter ✅ claim (optional)

**System:** Zapier, "(New Lead) Setter React". A setter adds ✅ to a booking post in Slack, and the Zap records them as the setter in Close.

**Trigger:** Unchanged. Slack "New Reaction Added", ✅, in the bookings channel.

**Outcome:** The ✅ habit keeps working even if someone edits the Slack message.

**Do this first:** Card 4.

**Steps:**

1. In both booking Zaps (card 4), add a last line to the Slack post: `Lead ID: [Close lead ID]`.
2. In "(New Lead) Setter React", replace the steps that pull the email, date and rep from the message with one Formatter "Extract Pattern" step: `lead_[A-Za-z0-9]+`.
3. Use that ID in the Close "Update Lead" step.

**Done when:** React ✅ on a TEST booking post. Setter Owner is set in Close.

**Keep in mind:** It works today. Do this last.

## 23. Instant response to new applicants

**System:** Close Workflow (texts and emails from the setter's Close number and email).

**Trigger:** A new application: the IG, Paid Ads or Kajabi Application Zap creates a new lead (card 3, path "Lead Does Not Exist"). Freebie opt-ins are not included.

**Outcome:** Every applicant gets a text and email with the booking link within a minute, even before a setter calls. Fewer applicants go cold.

**Do this first:** Card 3.

**Steps:**

1. Close: Workflows > New > "New Applicant".
2. Add messages A1 to A3 from Part 4: A1 right away (text and email), A2 after 1 day (text), A3 after 2 days (email).
3. Stop when the lead books (status changes to "New Opportunity"), replies, or is marked DQ.
4. In the IG, Paid Ads and Kajabi Application Zaps, path "Lead Does Not Exist": add a last step that enrolls the lead in this workflow (or use a smart view of status "New Lead" created in the last 1 hour, if Close can enroll from smart views).

**Done when:** Submit a TEST application. A1 arrives within 1 minute. Book a call: A2 and A3 never arrive.

**Keep in mind:**

- Setters still call new applicants. This makes sure the lead hears from the business right away.
- Ask Mitch which booking link goes in A1 to A3 (probably the direct booking link).
- Follow the texting rules (Part 4).

## 24. Speed-to-lead and sales tracking

**System:** Zapier, Airtable and Close.

**Trigger:** Part 1: a new call or text logged in Close. Part 2: none (weekly manual entry). Part 3: none (one-time check).

**Outcome:** Mitch can see how fast leads are contacted, what leads cost, and how each rep performs.

**Do this first:** Cards 2, 3 and 7.

**Steps:**

Part 1, speed to lead:

1. Airtable "Lead Base": add a field "First Contacted" (date and time) and a formula field "Minutes to First Contact": `DATETIME_DIFF({First Contacted},{Date Created},'minutes')`.
2. New Zap `KRC | First call or text > Airtable`. Trigger: Close "New Call" or "New SMS" (outbound). Use whichever activity trigger the Close app offers in Zapier.
3. Airtable "Find Record" in "Lead Base" by the lead's email. Filter: continue only if "First Contacted" is empty.
4. Airtable "Update Record": "First Contacted" = the activity time.
5. Add to the weekly Slack report (card 19): average minutes to first contact, and the percent of new leads contacted within 5 minutes.

Part 2, ad spend:

1. Every Monday, enter last week's ad spend in Airtable "Ad Spend": date, platform, amount. Ask Mitch who does this and where the numbers come from.
2. Optional later: a Zapier Facebook Ads step that fills this automatically.

Part 3, rep scorecards:

1. Airtable "Rep Scorecard": check that each active rep (Makena, Sidonie, Emily, and Kimberly if she closes) has a row for every reporting period.
2. Add missing rows. Copy an existing rep's rows and change the name.

**Done when:** A TEST lead that gets a call shows "Minutes to First Contact" in Airtable. The Ad Spend table has last week's row. Every active rep has scorecard rows.

**Keep in mind:**

- Calls from personal phones and Instagram DMs are not logged in Close, so they don't count as contact. Setters should call from Close.
- Without ad spend, cost per lead and return on ad spend stay at $0.

---

# Part 4: messages and texting rules

## Texting rules (cards 9 to 12, 15, 18, 23)

1. Consent. Typeform and Calendly forms need a checkbox: "I agree to receive text messages about my call. Reply STOP to opt out." Ask Mitch for the final wording.
2. Opt-out. The first text in each workflow ends with "Reply STOP to opt out." Test that replying STOP stops all texts from Close.
3. Hours. Follow-up texts send only between 9am and 7pm in the lead's time zone. Set this in each Close workflow's schedule. Reminders before a call (P2, P3) are the exception.
4. No texts to leads with status "DQ" or "NGMI".
5. Check that every Close phone number is registered for business texting (Settings > Phone Numbers). If not, texts may be blocked.

## Message copy

Generic placeholder copy. Ask Mitch to approve or rewrite all of it before going live. Use Close's "insert variable" button for the parts in brackets. [booking link]: ask Mitch which Calendly link to use.

| ID | Card | When | Channel | Message |
|---|---|---|---|---|
| P1 | 9 | Right after booking | Text | Hi [first name], your call is booked for [call time]. Here's the link: [meeting link]. Reply STOP to opt out. |
| P1 | 9 | Right after booking | Email | Subject: Your call is booked. Body: Hi [first name], your call is booked for [call time]. Join here: [meeting link]. |
| P2 | 9 | 24 hours before | Text and email | Hi [first name], reminder: your call is tomorrow at [call time]. Link: [meeting link] |
| P3 | 9 | 1 hour before | Text and email | Hi [first name], your call is in 1 hour. Here's the link: [meeting link] |
| N1 | 10 | 5 minutes after no-show | Text | Hi [first name], we missed you on the call. Book a new time here: [booking link]. Reply STOP to opt out. |
| N2 | 10 | Day 1 | Text | Hi [first name], still want to talk? Pick a time here: [booking link] |
| N3 | 10 | Day 3 | Text | Hi [first name], spots are open this week: [booking link] |
| N4 | 10 | Day 3 | Email | Subject: Book a new time. Body: Hi [first name], we missed you. Pick a new time here: [booking link] |
| N5 | 10 | Day 7 | Email | Subject: Last reminder. Body: Hi [first name], this is our last reminder. If you still want to talk, book here: [booking link] |
| C1 | 11 | 5 minutes after cancel | Text | Hi [first name], your call was canceled. Book a new time here: [booking link]. Reply STOP to opt out. |
| C2 | 11 | Day 1 | Email | Subject: Book a new time. Body: Hi [first name], you can pick a new time here: [booking link] |
| C3 | 11 | Day 3 | Text | Hi [first name], still want to talk? Pick a time here: [booking link] |
| C4 | 11 | Day 7 | Email | Subject: Last reminder. Body: Hi [first name], if you still want to talk, book here: [booking link] |
| S1 | 12 | Right away | Text and email | Hi [first name], here's the link to pick a new time: [booking link]. Reply STOP to opt out. |
| S2 | 12 | Day 1 | Text | Hi [first name], did you get a chance to pick a new time? [booking link] |
| S3 | 12 | Day 3 | Text and email | Hi [first name], reminder to pick a new time: [booking link] |
| F1 | 15 | Payment failed (optional) | Text and email | Hi [first name], your payment didn't go through. Please update your card here: [payment link] |
| K1 | 18 | 48 hours after signing, no kickoff | Text and email | Hi [first name], welcome! Book your kickoff session here: [kickoff link] |
| A1 | 23 | Right after applying | Text | Hi [first name], thanks for applying. Book your call here: [booking link]. Reply STOP to opt out. |
| A1 | 23 | Right after applying | Email | Subject: Thanks for applying. Body: Hi [first name], thanks for applying. Book your call here: [booking link] |
| A2 | 23 | Day 1, not booked | Text | Hi [first name], did you get a chance to book your call? [booking link] |
| A3 | 23 | Day 2, not booked | Email | Subject: Book your call. Body: Hi [first name], you can still book your call here: [booking link] |

---

# Part 5: reference sheet

Use these exact names and IDs. They are not passwords. Never put API keys or passwords in a Zap's text or code.

## Zaps

| Zap name | Status | Card |
|---|---|---|
| IG Application -> Close -> Slack -> Airtable | On | 3 |
| Paid Ads Application -> Close -> Slack -> Airtable | On | 3 |
| Kajabi Application -> Close -> Slack -> Airtable | On | 3 |
| Kajabi - Relationship Quiz -> Close -> Slack -> Airtable | On | 3 |
| Kajabi - Commitment Training -> Close -> Slack -> Airtable | On | 3 |
| Kajabi - Anxious to Confident Blueprint -> Close -> Slack -> Airtable | On | 3 |
| Setter Booking -> Close -> Slack -> Airtable | On | 4 |
| DCB Booking -> Close -> Slack -> Airtable | On | 4 |
| EOC Form -> Close -> Slack -> Airtable | On | 5 |
| (New Lead) Setter React -> Close -> Airtable | On | 22 |
| No Show -> Slack | On | 10 |
| Canceled Call -> Slack | On | 11 |
| Reschedule -> Slack | On | 12 |
| Fanbasis Payment -> Airtable -> Slack | On | 14 |
| Fanbasis - Renewal -> Airtable -> Slack | On | 14 |
| Onboarding Email | On | 18 |
| New Client Intake Form > Slack | On | 18 |
| Kickoff Session > Slack | On | 18 |
| New Contract > Slack | Off | 17 |
| New Rep Onboarding (OB Form -> Close -> Google -> Airtable -> Slack) | On | 8 |
| Setter EOD -> Slack | On | Keep |
| EOD Reminder | On | Keep |
| Untitled Zap | Off | 8 (delete) |

## Close lead statuses

| Status | ID |
|---|---|
| New Lead - DCB | stat_J74vYy7Wweikaa3RB2405XMzkECgocFU1CtlXNzA1Gy |
| New Lead | stat_91KuSF8HGn7tTXtM1NntMkC3RBZuZ727dxgBffsCc9b |
| Setter Pipeline | stat_y20nJ0Xz2WUsmozaXpKQUxXGLZcETLrdtFPbtfuGUY6 |
| New Opportunity | stat_17swhxeqvZK3xe7Q8qqxwaDbUxNvVgDR7XstHF2LvjB |
| Closer Follow Up | stat_6hDpZwuY1io4FpbpQX6G4SeQzktd4A6IW8PvrdNoH9w |
| No show | stat_dHSRnFtMSrsGFBtePiNOrKP9XPLGcmvlUUv3dvw95g3 |
| Canceled | stat_20aMcF4Q9rT1mFceZx4JmCRKouy1DgR2nwD1FElJlyb |
| New Opportunity - Reschedule | stat_BUn7St3A9gtzdL3TxB8hZRn79VXRLCIu0a5aLIpi4ag |
| Deposit Paid | stat_WmxZRH9xxUvhTAat01QyWRuNxqJ14s5e0wEN2iEDWkX |
| Signed Up - Balance Owed | stat_UEBEBfjgHoWd8zyhgQOG4CpfLJTPZxwHpH3dx7JY2w4 |
| Signed Up - Closed | stat_s71HtAeLV1kWdJUKnhNVmXsPYrek4behA0iUeIr9he3 |
| NGMI | stat_yJjN5E0POao217QirC8sG5JTOzTa1GMCoepohg0jnT3 |
| DQ | stat_I91LwxB5PCUdlID1yHQ4tdnOYd4XTtsNUb6Pf8FvegV |

## Close deal stages (pipeline "Sales")

| Stage | Type | ID |
|---|---|---|
| Not Booked | Active | New (card 1). Copy the ID here after creating it |
| New Deal - Mentorship Interview | Active | stat_BzhIsICvsVNy3TBkF1u4GCaZuv2N1XI0lcA1W8HRvXB |
| New Deal - Pending Close | Active | stat_54luUoy1nhtOSlVXVX6kYEz8SlicJMbUYLbK2LlbK11 |
| Installment Pending | Active | stat_OWYBnxhU5uQIqoMH5qGX1NdB39L53mcmga1IiqkFRLB |
| Deposit Paid | Active after card 1 (Won today) | stat_EXBo9DtaKkTG6wc0HPTG2nwuFtWYTpSi27z7lCqXZoI |
| New Deal - Closed | Won | stat_sLE0JY2OeweB23uzR6wFdeEkB23nwC6Lewi4CTaLWXJ |
| Installment Paid | Won | stat_QJsHwhgsr7tqZf7z3gF595EvxXYhQb6wlcXPFevpW8x |
| New Deal - Lost | Lost | stat_k83Fsib2qZYG7U96miD1nFwmvPisYXtPCr19dssx546 |

## Close lead fields

| Field | ID | Meaning after the fixes |
|---|---|---|
| Opt Source | cf_dZ9WbrIrwiS9857LemfpELqLEa4A0u1httihZKjA8Wp | Where the lead first came from. Set once |
| Applied Source | cf_5eks6wCSWu1d5hnWKN7CVrSCk32OTWGA2l2bbDCV1eA | The latest application form |
| Book Source | cf_Hc2lvPr2rongtOXn1E87qVeP97uQJYj74glu3iaiUUd | Where the call was booked from |
| Traffic Type | cf_KshHYNFhXkQPsM3gqror2EWJp79rj8ZD4CHWVvtwfiP | Paid or Organic |
| Setter Owner | cf_wMrvg3pRYRb9YofHDo3sKU3Bww5A0l4PB3jSAQBAEjw | Setter (Close user) |
| Closer Owner | cf_C8VPhNe0qrezSasWIWaAZ5BKf6prTK3Ga2tn04ZvBdq | Closer (Close user) |
| Date Of Call | cf_gfB7e3PvhzQHac2oMs1KGCqD7bJ9YQXueZ5yzG33lnH | Call date (Eastern) |
| Fathom URL | cf_0vuzpARUyPg9GbQz4OjtvldrcoWZ3uZzbKAqj5nNLN1 | Call recording link |
| Active Deal ID, Call Time, Meeting Link, UTM Source, UTM Medium, UTM Campaign, UTM Content | New (card 1) | See card 1 |

## Airtable (base "Kimberly Rae Coaching - Master Base", ID appIlwYJf96ybvwSt)

| Table | ID | Used in cards |
|---|---|---|
| 📝 EOC Report Responses | tblUwuIwDACVj4IOs | 2, 5 |
| ☎️ Setters - EOD Responses | tblEAodYteE4wgM96 | Keep |
| 👤 Lead Base | tblDqn13hcWbeKEy2 | 2, 3, 4 |
| 🔢 Sales Metrics Summary | tblxDyXVVuw6aYwZH | 19 |
| 👨‍💻 Rep Scorecard | tbl7KhTZTEZTfV6gc | 2 |
| 📊 Daily Sales Report | tbllF15i6ZcfTpiZn | Keep |
| 🏦 Payment Records | tblsSwIO7xkkSez10 | 7, 14 |
| 📁 Instalment Records | tblOt5OAnmsmWUZ3R | 5, 14, 15 |
| 🧾 Refund Records | tblgBQCSY4NmQHjhD | 16 |
| 💰Finance Metrics Summary | tbl29xRuvquJpmn6j | 19 |
| 👥 Customer Table | tbl0NGI3OT9G4NlMB | 14 |
| 🔖 Customer Products | tblJxCHu4yyqLzTiB | 14 |
| ℹ️ User ID Lookup | tblKOsxGk41XxHNdJ | 4, 21 |
| New OB Form Responses | tblbfXzArQaZfAX2N | 8 |

## Calendly event types

| Event name | What it is | Host |
|---|---|---|
| KRC Consultation Call - (SB) | Booked by a setter | Makena (round robin) |
| KRC Consultation Call - (DCBA) | Booked directly by the lead (probably from ads) | Makena (round robin) |
| KRC Consultation Call - (DCBIG) | Booked directly by the lead (probably from Instagram) | Makena (round robin) |
| KRC Consultation Call - (DCBE) | Booked directly by the lead (probably from email) | Makena (round robin) |
| Live Interview | Live transfer from a setter | Makena |
| Live Interview with Kim | Live transfer (no bookings since September) | Kimberly |
| Kickoff Session | Client kickoff | Kimberly |

## Forms

| Form | Tool | ID |
|---|---|---|
| IG application | Typeform | LxWp7wuV |
| Paid Ads application | Typeform | yFW8rDUJ |
| Kajabi application | Kajabi | 2148386250 |
| Kajabi Relationship Quiz | Kajabi | 2148468633 |
| Kajabi Commitment Training | Kajabi | 2148866977 |
| Kajabi Anxious to Confident Blueprint | Kajabi | 2149653404 |
| Client intake | Google Forms | 1RryUstANy5LZnCUk8JVvIzYIkYvS1_SPmdbcrjyzkqw |

## Slack channels (IDs used by the Zaps)

| Channel ID | Used for |
|---|---|
| C0B505UMYGY | New applications ("Dial ASAP") |
| C0B43QV0MPG | New bookings (setters react ✅ here) |
| C0B42F73D7F | Call confirmed |
| C0B3QDN3MEK | EOC submissions |
| C0B505YAFNU | No-show alerts |
| C0B49FP2VQC | Cancellation alerts |
| C0B3QDFE755 | Reschedule alerts |
| C0B3QDNV06T | Payments (main workspace) |
| C09DM8FSHPF | Payments (second Slack workspace) |
| C0B3QCW2TSB | Setter EOD |
| C0B49EZ6P0C | New rep onboarded |
| C0B879RL8BX | Client intake |
| C0B93QEAH1B | Kickoff booked |
| C0B93PE2FNH | Contract signed |

## Other IDs

| Item | ID |
|---|---|
| Kit tag and sequence added on booking | Tag 23400691, sequence 2893474 |
| Kit tag and sequence added on Kajabi forms | Tag 23400418, sequence 2893520 |
| Zapier Table that maps EOC answers to Close statuses | 01KS2T7RQ0MGGM5C8645K8RDHP |
| Google Sheet written by the EOC Zap | 1EcZSAea0qqa6cEqBKXSohCpCx_DwA8SAbbxOLqESoyA |
| Google Sheet written by the payment Zaps | 1mejS31FABDQN7yCzw61pZA_eqGn6plZvCikbkBp3pUI |

---

# Part 6: tracking and after launch

## Glossary

| Word | Meaning |
|---|---|
| Zap | One automation in Zapier |
| Trigger | The event that starts a Zap or workflow |
| Path | A split in a Zap. Each path runs only if its rule is true |
| Filter | A Zap step that stops the Zap unless a rule is true |
| Formatter | A Zapier step that changes text, numbers or dates |
| Smart view | A saved, auto-updating list of leads in Close |
| Workflow | A series of texts, emails or tasks Close sends on a schedule (Close used to call these Sequences) |
| Lead status | Where a lead is in the process (New Lead, No show, DQ and so on) |
| Deal | A sale in the pipeline. Close calls it "Opportunity" |
| Active Deal ID | A hidden field on the lead that stores the ID of its current deal, so Zaps update the right one |
| EOC | End of Call report. The form a closer fills in after each call |
| DCB | Direct call booking. A lead books a call without a setter |
| Round robin | Calendly gives bookings to hosts in turn |
| Opt-out | When a lead replies STOP and must not get more texts |

## Progress checklist

| Card | Status (Not started / In progress / Done) | Date tested | Notes |
|---|---|---|---|
| 1 Close settings | | | |
| 2 Airtable formulas | | | |
| 3 Lead form Zaps | | | |
| 4 Booking Zaps | | | |
| 5 EOC Zap | | | |
| 6 Smart lists | | | |
| 7 Data cleanup | | | |
| 8 Housekeeping | | | |
| 9 Pre-call reminders | | | |
| 10 No-show follow-up | | | |
| 11 Cancellation handling | | | |
| 12 Reschedule follow-up | | | |
| 13 Fathom to Close and Slack | | | |
| 14 Payment received | | | |
| 15 Failed payment alert | | | |
| 16 Refunds | | | |
| 17 Agreement signed | | | |
| 18 Client onboarding | | | |
| 19 Weekly and monthly numbers | | | |
| 20 Weekly data check (optional) | | | |
| 21 Rep onboarding and offboarding | | | |
| 22 Setter ✅ claim (optional) | | | |
| 23 Instant response to new applicants | | | |
| 24 Speed-to-lead and sales tracking | | | |

## First week after launch

Check these every day for 7 days. Write problems in the change log.

1. Close: no lead has two open deals.
2. Close: every booking from yesterday has "Call Time" and "Meeting Link".
3. Close: yesterday's no-shows and cancels each got their first message.
4. Close: no opt-out complaints, and STOP replies stopped texts.
5. Airtable: every new Payment Record has a customer and a Transaction ID.
6. Slack: no "Unmatched payment" or "No Close lead found" alerts left unanswered.
7. Zapier: Zap History shows no errors. Fix and replay any that failed.

## Change log

Keep one shared table (Airtable or Google Sheet) with these columns:

| Date | Card | Zap or setting changed | What changed | Why | Tested by |
|---|---|---|---|---|---|

The system has one owner after launch. Ask Mitch who owns it. Only the owner changes Zaps, or approves changes.

## SOPs to write

One page each. Write each after its card is built, so it matches what the system really does.

| SOP | Covers | Card |
|---|---|---|
| Lead statuses and stages | What each status and stage means, who sets it, what it starts | 1 |
| Working the smart lists | Which list to call in which order | 6 |
| Submitting the EOC | One per call. Required fields. Deposits logged as Deposit. Follow-up date required | 5 |
| No-show, cancel, reschedule | Which status to set and what happens next | 10, 11, 12 |
| Payments | Unmatched payments, failed payments, refunds | 14, 15, 16 |
| Client handoff | Agreement, welcome, intake, kickoff | 17, 18 |
| Rep onboarding and offboarding | The two checklists | 21 |
| Changing automations safely | The rules in Part 2 and the change log | All |

---

# Part 7: decisions and suggestions

## Open questions

| Question | Who | Card |
|---|---|---|
| Do DCBA, DCBIG and DCBE mean ads, Instagram and email? | Mitch | 4 |
| Are host cancels on direct bookings on purpose (screening)? | Mitch | 11 |
| Approve or rewrite the message copy. Which booking link goes in [booking link]? | Mitch | 9 to 12, 15, 18, 23 |
| Texting consent wording on Typeform and Calendly | Mitch | Part 4 |
| Does anyone use the two Google Sheets the EOC and payment Zaps write to? If not, delete those steps | Mitch | 5, 14 |
| Lead status after a full refund | Mitch | 16 |
| Who owns the system after launch? | Mitch | Part 6 |
| Do you want a triage step before the closer's call (for example a setter qualifying call, or a qualifying form before the booking page)? Today closers screen by canceling direct bookings | Mitch | 11 |
| Who enters ad spend each week, and from where? | Mitch | 24 |
| Can Close Workflows send "X hours before" a date field, and enroll leads from a smart view or Zapier? | Leah | 9 to 12 |
| Does Fanbasis have failed payment and refund triggers in Zapier? | Leah | 15, 16 |
| Does Fathom connect to Close directly? | Leah | 13 |

Before handing this over: rotate the Close, Airtable and Calendly API keys used for this review.

## Changes I suggest

### Required (the build cards)

1. Close: add a Not Booked stage and new fields. Make Deposit Paid an open stage.
2. Airtable: fix the paid flag. Stop counting deposits and installment payments as closed deals. Fix Sidonie's name.
3. Lead form Zaps: stop overwriting existing leads. Create a Not Booked deal for every new lead. Move freebies to their own channel. Track UTMs.
4. Booking Zaps: update the existing deal instead of creating a new one. Handle reschedules. Match the closer exactly. Label direct bookings by real source. Save call time and Zoom link.
5. EOC Zap: fix the cents bug and the 3rd installment field. Create follow-up tasks. Save the Fathom link. Stop creating installment deals.
6. Smart lists: fix the day-old, Paid Ads, 3 to 7 day and no-show lists. Add cancel and reschedule lists.
7. Clean up dead deals, duplicate deals and leads, and unlinked payments.
8. Delete the draft Zap. Force a password change for new reps.
9. Pre-call texts and emails (right away, 24 hours, 1 hour). Then turn off Calendly's.
10. No-show follow-up messages.
11. Calendly cancellations into Close, with follow-up for lead cancels.
12. Reschedule follow-up messages.
13. Fathom recordings and summaries into Close and Slack.
14. Fanbasis payments update Close and link to the client and rep.
15. Failed payment alert.
16. Refund automation.
17. Signed agreements update Close and Slack.
18. Intake and kickoff tracked in Close, with a kickoff reminder.
19. Weekly and monthly numbers posted to Slack.
20. Rep onboarding and offboarding checklists.
21. Instant text and email to new applicants with the booking link.
22. Speed-to-lead tracking, weekly ad spend entry, and complete rep scorecards.

### Suggested, not required

- Replace the 88-step EOC Zap with the code step (card 5). Same result, much easier to change later.
- Make the setter ✅ claim harder to break (card 22).
- Weekly data check in Slack (card 20).
- Add the Close lead ID to every Airtable table, so reports match on IDs instead of emails and names.
- Require a cancel reason in Calendly when a closer cancels.
- One Zapier "Zap error" alert to Slack, so failed runs are seen.
- A separate Close user for automations, so changes made by Zaps don't show as Kimberly's.
- Retire the two Google Sheets if nobody uses them.

## Copying this system to a new client (optional)

When the build is stable, the same plan works for the next account:

1. Close: create the same statuses, stages and fields (card 1 plus the reference sheet). Copy the smart views and workflows.
2. Airtable: duplicate the base without records ("Duplicate base", untick "Duplicate records").
3. Zapier: copy the KRC folder, rename to the new client's code, and reconnect each app to the new client's accounts.
4. Update every ID in the new client's copy of the reference sheet.
5. Run every card's "Done when" test before turning anything on.

---

# Appendix: what we found and which card fixes it

For reference. Each item was checked against the live data or the Zap settings unless it says otherwise.

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
