# AI call review rubric: Kimberly Rae Coaching: Master Closing Doc

Use on every recorded sales call and triage call. Score each check hit / partial / miss / not applicable, quote the evidence, and post the summary to Slack within an hour of the call.

## Hard flags (any one sends the call to a manager the same day)

- **Outcome promise**: Any guarantee or implied promise that the prospect will find a partner or save the relationship, including success-rate figures not in the script.
- **Off-sheet price**: Any price, discount, trial or payment structure not on the sanctioned price sheet: $3,600 bi-weekly 1:1 with Kim; $7,200 weekly 1:1 with Kim; $14,000 weekly 1:1 with Kim.
- **Credit or ID handling**: Rep asks for, hears read aloud, or types an SSN, date of birth or income figure, or suggests what to enter on a financing application.
- **Crisis not handled**: Prospect discloses self-harm, suicidal thoughts, abuse, violence or acute crisis and the rep keeps selling without care, a crisis line or a manager note.
- **No recording disclosure**: The rep doesn't say the call is recorded in the first minutes.
- **Pressure after a clear no**: The rep keeps pushing, shames, or invents urgency after the prospect clearly declines.
- **Therapy or credential claims**: Rep implies therapy, treatment, insurance coverage or a licence, or leaves the prospect believing so.

## Sales call: Kimberly Rae Coaching: Master Closing Doc

Score = weighted share of applicable steps (hit 1, partial 0.5, miss 0).

### C1 Intro & frame (weight 10)
- C1a: States the call is confidential
- C1b: Discloses the call is recorded
- C1c: Credibility: has taken hundreds of these calls
- C1d: Invites full transparency
- C1e: Frames the goal of the call and gets agreement
- C1f: References setter notes (or Kim's DM notes) so they feel seen
- C1g: Opens with why they took an hour out of their day

### C2 Isolate the problem (weight 15)
- C2a: Asks the biggest thing not working in dating/relationships
- C2b: Asks what they mean, in their own words
- C2c: Asks if anything else is getting in the way
- C2d: Probes duration (how long, always been this way)
- C2e: Probes spillover into other areas of life

### C3 Background & segment read (weight 10)
- C3a: Relationship status (single, seeing someone, undefined)
- C3b: Apps usage
- C3c: Work and meeting people organically
- C3d: How long actively dating
- C3e: Flexes the call to the segment (novice, achiever, rebuilder, returner)

### C4 Current situation & what they've tried (weight 10)
- C4a: Gets weekly mechanics (apps time, conversations, dates)
- C4b: Asks where it usually falls apart
- C4c: Asks what they have tried (apps, coaching, books, therapy)
- C4d: Asks how that went

### C5 Doubt question (weight 10)
- C5a: Asks what they think has been getting in the way
- C5b: Does not correct the belief yet (saves it for the pitch)

### C6 Why now & cost (weight 20)
- C6a: Asks why now vs six months ago
- C6b: Asks what it has been costing them, beyond dating
- C6c: Goes deeper with a segment-aware cost question
- C6d: Magic wand: what changes if this were solved
- C6e: Lets silence breathe instead of rushing

### C7 Desired situation (weight 10)
- C7a: Asks them to paint the picture a year from now
- C7b: Asks why that is important to them
- C7c: Asks what part they most look forward to

### C8 Tie-down & transition (weight 5)
- C8a: Asks if there is anything else they should know
- C8b: Reflects their situation back and gets permission to walk through how Kim helps

### C9 Pitch: promise, 4 pillars, delivery (weight 15)
- C9a: High-level promise of process and visible change, no outcome guarantee
- C9b: Pillar 1, The Honest Read, tied to what they've tried
- C9c: Pillar 2, The Reset (profile, photos, messaging)
- C9d: Pillar 3, The Inner Game
- C9e: Pillar 4, Read & Lead
- C9f: Delivery: group calls twice weekly, library, community, 1:1 for paid tiers
- C9g: Checks for questions or understanding

### C10 Temperature check (weight 10)
- C10a: Asks how they feel about the process
- C10b: Uses the 1 to 10 scale when the answer is uncertain
- C10c: Handles what keeps them from 9 or 10 before price

### C11 Next steps before price (weight 5)
- C11a: Paints getting started before revealing the investment

### C12 Investment (weight 15)
- C12a: Recommends one tier based on discovery
- C12b: Ties the recommendation to what they said
- C12c: States the price and stays silent
- C12d: Does not dump all tiers

### C13 Objection pacing (weight 10)
- C13a: Takes money off the table and checks belief in the process first
- C13b: Tie-down: 'not should I, but how do I make this work'
- C13c: Does not hand out payment plans to an uncertainty objection


## Triage / setter call: Kimberly Rae Coaching: setter phone call

Score = weighted share of applicable steps (hit 1, partial 0.5, miss 0).

### S1 Open & anchor (weight 10)
- S1a: Confirms who they're speaking to and introduces self as Kimberly's team
- S1b: Anchors to what the lead did (application, quiz, training, DM)

### S2 Frame & permission (weight 10)
- S2a: Explains the purpose (point them in the right direction)
- S2b: Gets permission to ask a few questions

### S3 Discovery (weight 25)
- S3a: Biggest thing not working in dating/relationships
- S3b: Digs in: what does that look like, how long
- S3c: Relationship status / background
- S3d: What they've tried and how it went
- S3e: Doubt: what's getting in the way

### S4 Why now, cost & desire (weight 15)
- S4a: Why now
- S4b: Cost of the problem, spillover into life
- S4c: Desired picture if solved

### S5 Sell the call (weight 10)
- S5a: Reflects their situation back in one line
- S5b: Sells the consultation call (worst case clarity, best case changes it)

### S6 Financial qualification (weight 15)
- S6a: Asks if they can invest if it's the right fit
- S6b: Uses only the range anchor (low to mid four figures); no specific prices or plans
- S6c: Handles hesitation with the resourcefulness reframe or financing/credit check

### S7 Book & confirm (weight 10)
- S7a: Offers a live transfer or two specific times
- S7b: Confirms timezone and email
- S7c: Has them accept the calendar invite while on the phone

### S8 Lock the show (weight 5)
- S8a: Gets their word to reschedule rather than no-show
- S8b: Quiet place, present, not driving
- S8c: Connects them to the closer (intro text) and/or sends the pre-call video

## Output per call

```json
{"call_id": "...", "rep": "...", "score": 0, "hard_flags": [{"flag": "...", "quote": "...", "timestamp": "..."}],
 "phases": {"C1": {"score": "hit|partial|miss|n/a", "evidence": "quote"}}, "top_3_coaching": [{"issue": "...", "better": "exact words"}],
 "objections": [{"type": "...", "quote": "...", "handled": "well|partly|poorly|ignored"}], "crm_check": "does the logged outcome match the call?"}
```

## Slack summary format

`[Rep] · [Prospect initials] · Score 62 · ⚑ Off-sheet price` then the three coaching items, each with its better line, then a link to the recording.