# Avatar synthesis (Kimberly Rae Coaching)

Goal: buyer avatars good enough that a setter can spot one in the first five minutes, a closer knows how to sell them,
and marketing can write ads in their words. Modelled on the TLL avatar page and Primal's avatar section.

Inputs (read all of them; these are already-extracted call records, not transcripts):
- data/krc/closer_calls/*.json (type "sales" only): prospect profile, segment + signals, pains, goals, dream_outcome_quote,
  buyer_language, objections with raw quotes, icp, unmet_demand, offer, flags. The CRM outcome is in
  data/krc/raw/batches/closer_*.json under each entry's "crm" (keyed by "rec" = call_id). Won = Call Outcome "Closed" and
  Payment Type not "Deposit"/"Instalment Paid".
- data/krc/closer_coaching/*.json: summaries, turning points, objection timelines.
- data/krc/threads/*.json: text conversations (objections with quotes, notes) for pre-call language.
- data/krc/playbook_closer.json: the four segments Kim's closing doc defines (overlooked_novice, achiever, rebuilder, returner).

Build 4 to 7 avatars from what the calls actually show. Start from the playbook's four segments, but split, merge or add
where the evidence says so (the "other" bucket holds 14+ calls and must be resolved into real avatars). Every call_id should
belong to exactly one avatar. Name avatars memorably and plainly (e.g. "The Late Starter", not marketing fluff).

Output data/krc/avatars.json:
```jsonc
{
  "avatars": [{
    "id": "late_starter", "name": "The Late Starter", "tagline": "one line",
    "playbook_segment": "overlooked_novice|achiever|rebuilder|returner|new",
    "call_ids": ["rec..."],
    "who": "3-4 sentences: life stage, situation, what's going on in their dating life, why they're on the call now",
    "profile": { "gender": "mostly men|mostly women|mixed", "age": "typical range or null if unknown", "relationship_history": "...",
                 "work_and_money": "...", "kids": "...", "apps_and_tried": "..." },
    "goals": ["4-6 items, plain"],
    "pains": ["4-6 items, plain"],
    "in_their_words": [ { "quote": "verbatim, from buyer_language/dream/raw quotes", "call_id": "rec..." } ],   // 6-10
    "objections": [ { "type": "<objection vocab>", "what_it_really_means": "...", "quote": "verbatim", "call_id": "rec..." } ],
    "what_they_need_vs_what_we_sell": "2-3 sentences",
    "how_to_spot": ["3-5 tells a setter can hear in the first five minutes"],
    "how_to_sell": ["4-6 concrete moves for the closer: which pain to press, which pillar lands, which tier fits, what to avoid"],
    "what_kills_the_deal": ["2-4 patterns seen in their lost calls"],
    "marketing_hooks": ["4-6 ad/email angles written in their language"],
    "dq_signals": ["signals that this person is not a fit right now"],
    "best_call_id": "the call that shows the right way to sell this avatar (or null)",
    "worst_call_id": "the call that shows what not to do (or null)"
  }],
  "universal_objections": [ { "type": "...", "insight": "...", "quote": "verbatim", "call_id": "..." } ],
  "who_buys": "one paragraph comparing buyers and non-buyers across all calls",
  "icp_gap": "one paragraph: who the script says the client is vs who actually shows up and who actually buys"
}
```
Rules: quotes must be copied exactly from the input files. No invented numbers (the build computes counts and close rates
from call_ids). Plain language, no em dashes. Validate the JSON parses.
