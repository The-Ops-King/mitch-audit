# Closer coaching pass (adds to an existing closer-call extraction)

Input per call: the transcript path and the existing extraction `data/krc/closer_calls/<call_id>.json`
(already scored against `data/krc/playbook_closer.json`). Read all three. Do not change the existing file.

Write `data/krc/closer_coaching/<call_id>.json`:

```jsonc
{
  "call_id": "rec...",
  "summary": "two or three sentences: who the prospect is, what they want, how the call went and ended",
  "turning_point": { "what": "the moment the call was won or lost, one sentence", "quote": "exact words", "timestamp": "@MM:SS" },
  "coaching": [                       // 2-5 items, most important first; tie each to a playbook check id
    { "area": "C6b", "priority": "high|medium|low",
      "issue": "what the rep did or skipped, specific to this call",
      "better": "the exact words the rep could have said at that moment, in the script's voice",
      "timestamp": "@MM:SS" }
  ],
  "exemplary": [                      // 0-3 moments worth copying into training; empty if none
    { "area": "C2a", "quote": "rep's exact words", "why": "short", "timestamp": "@MM:SS" }
  ],
  "objection_timeline": [             // every objection in order, with what happened next
    { "order": 1, "type": "<closer objection vocab>", "prospect_quote": "exact", "rep_quote": "exact rep reply, short",
      "verdict": "handled_well|partially|poorly|ignored", "better": "exact words that would have handled it better, or null", "timestamp": "@MM:SS" }
  ],
  "price_moment": { "quote": "rep's exact words when price was first said, or null", "timestamp": "@MM:SS", "prospect_reaction": "exact words or null" },
  "money_qualified_before_pitch": true,
  "talk_track_deviations": [ "short description of anything said that is not in the script and should not be (promises, improvised offers, claims)" ]
}
```

Rules: quote exactly from the transcript; "better" lines are concrete words, not advice ("Ask about X" is not acceptable;
"What would it mean for you to be in a relationship by next summer?" is). Score what the rep did, not the outcome.
Never invent. Validate the JSON parses. Reply with one compact line per call, never transcript text.
