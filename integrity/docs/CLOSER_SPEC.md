# Closer-call extraction spec (Kimberly Rae Coaching)

Every worker follows this exactly. Most important rule: **use the controlled
vocabularies verbatim.** If something genuinely doesn't fit, use `other` and put
your proposed label in the free-text field. Clustering happens centrally later.

Read `data/krc/playbook_closer.json` once before your first call.

## 1. Input

Each assignment gives you, per call:

- `rec`: the Airtable EOC record id. This is the `call_id`.
- `transcript`: path to a text transcript. Fathom format is `@M:SS - Speaker` lines; Zoom format is `@HH:MM:SS - Speaker`.
- `crm`: the closer's own End-of-Call (EOC) report for that call: outcome, payment type, cash, contract value, product, objections, lost and DQ reasons, setter, lead source. **The CRM outcome is the verified outcome.** You still record what the transcript shows, independently.

## 2. Reading the transcript

- The rep is the speaker labelled `(Kimberly Rae Coaching)` (Fathom) or the known closer name (Zoom: Makena Waterhouse). Everyone else is the prospect.
- Diarization swaps lines. **Read role from content, never from the label.** A discovery question is the rep, whatever the label says.
- Never record talk ratio, word counts or who spoke first.
- If the call is not a sales call (internal, onboarding, a test), write only `{"call_id": "...", "type": "not_sales", "reason": "..."}`.

## 3. Output: ONE file per call

Write `data/krc/closer_calls/<call_id>.json`. Use full real names here; pseudonymisation happens in the build.

```jsonc
{
  "call_id": "rec...",
  "type": "sales",
  "source": "fathom|zoom",
  "date": "2026-10-14",
  "rep": "Makena Waterhouse",
  "call_kind": "first_call|follow_up|live_transfer|second_call",
  "duration_min": 52,
  "setter_mentioned": "name or null",           // only if said on the call

  "prospect": {
    "first_name": "Jane", "last_name": "Doe or null",
    "gender": "woman|man|unknown",
    "age": null,                                  // only if said
    "location": "city/state/country or null",
    "occupation": null,
    "relationship_status": "single|situationship|dating|separated|divorced|widowed|in_relationship|unknown",
    "divorced": null, "has_kids": null,
    "apps_used": ["hinge"],
    "prior_help": ["therapy"]                     // what they've tried
  },

  "segment": { "assigned": "<vocab>", "confidence": 0.7, "signals": ["..."] },

  "goals":  [ { "text": "short paraphrase", "category": "<vocab>" } ],
  "pains":  [ { "text": "short paraphrase", "category": "<vocab>", "severity": "low|medium|high|critical" } ],
  "dream_outcome_quote": "prospect's own words, or null",
  "buyer_language": ["verbatim phrases marketing could use, max 5"],

  "questions_asked": [                            // in call order
    { "key": "<question vocab>", "quote": "rep's words, short", "order_index": 1, "answered": true }
  ],

  "objections": [                                 // in call order
    {
      "type": "<objection vocab>",
      "raw_quote": "exact prospect words",
      "when_raised": "before_pitch|after_pitch|after_price",
      "order_index": 1,
      "rep_response": "what the rep did",
      "tactic": "snake_case_label",
      "resolved": false                           // strict: true only if they visibly moved on
    }
  ],

  "offer": {
    "presented": true,
    "price_before_temperature_check": false,
    "tiers_quoted": [ { "label": "as said", "price_usd": 7200, "months": 3, "cadence": "weekly 1:1" } ],
    "recommended_one_tier": true,
    "all_tiers_dumped": false,
    "payment_plan_offered": false,
    "financing_partner_offered": false,
    "outcome_promise_quote": "quote if the rep guaranteed or strongly implied a relationship outcome, else null"
  },

  "pillars": [                                    // the 4 pillars in C9
    { "pillar": "honest_read|reset|inner_game|read_and_lead", "reaction": "enthusiastic|accepted|clarifying|confused|objected|not_presented" }
  ],

  "adherence": {
    "phases": {
      "C1": { "score": "hit|partial|miss|not_applicable", "checks": { "C1a": "hit" }, "evidence": "short quote or description" }
      // ... C2 through C13, every check id from the playbook
    },
    "coach_note": "one or two sentences a manager could act on"
  },

  "transcript_outcome": {
    "disposition": "closed|deposit|follow_up|lost|disqualified|no_show_or_cut|undetermined",
    "confidence": 0.8,
    "evidence": ["quote", "counter-evidence if any"]
  },

  "icp": { "fit": "core|edge|outside", "matches": ["<icp vocab>"], "misses": ["<icp vocab>"], "note": "why" },

  "unmet_demand": [ { "want": "what they asked for", "verdict": "product_gap|positioning_gap|out_of_icp|unvalidated" } ],

  "flags": [
    { "category": "<flag vocab>", "severity": "critical|high|medium|low", "summary": "one sentence, what happened", "evidence": ["direct quote"], "timestamp": "@MM:SS" }
  ],

  "quality": { "diarization": "high|medium|low", "truncated": false, "notes": "" }
}
```

## 4. Controlled vocabularies

### `segment.assigned`
`overlooked_novice` · `achiever` · `rebuilder` · `returner` · `other` (definitions in the playbook)

### `pains[].category`
`situationships` · `no_matches` · `ghosted_or_fizzles` · `freezing_or_anxiety` · `low_confidence` · `attracting_wrong_people` · `repeating_patterns` · `divorce_recovery` · `breakup_grief` · `loneliness` · `running_out_of_time` · `app_fatigue` · `no_social_circle` · `communication_skills` · `attachment_anxiety` · `self_worth` · `trust_issues` · `past_trauma` · `age_concern` · `body_image` · `mental_health` · `other`

### `goals[].category`
`committed_relationship` · `marriage` · `start_family` · `more_dates` · `better_matches` · `confidence` · `understand_opposite_sex` · `break_patterns` · `heal_past` · `profile_improvement` · `communication` · `self_worth` · `companionship` · `other`

### `questions_asked[].key`
One key per distinct question asked. Same question asked twice → one entry (first occurrence).

`why_today` · `biggest_problem` · `what_do_you_mean` · `anything_else_in_way` · `how_long` · `always_struggled` · `spillover_into_life` · `realization_event` · `relationship_status` · `apps_usage` · `occupation` · `how_long_dating` · `weekly_mechanics` · `where_it_falls_apart` · `what_tried` · `how_that_went` · `doubt_whats_in_the_way` · `why_now` · `cost_of_inaction` · `segment_cost_deeper` · `magic_wand` · `desired_picture` · `why_important` · `most_looking_forward` · `anything_missed` · `permission_to_walk_through` · `process_feel` · `scale_1_10` · `what_keeps_from_10` · `financial_capacity` · `decision_maker` · `credit_or_financing` · `age` · `location` · `kids_or_family` · `past_relationship_history` · `other`

### `objections[].type`
These match the EOC "No Close Category" list.
`price_budget` · `financing_denied` · `fear_uncertain` · `spouse_partner` · `think_about_it` · `skepticism_trust` · `timing` · `burned_in_past` · `has_solution_or_no_value` · `other`

### `icp` criteria
`real_dating_problem` · `can_invest_four_figures` · `committed_now` · `own_decision_maker` · `fits_a_segment`

### `flags[].category`
- `pricing_deviation`: any price or tier not in the sanctioned offer, discounts, improvised plans. Record the exact figure.
- `outcome_promise`: guaranteeing or strongly implying a relationship, marriage or partner outcome. The script forbids this.
- `mis_selling`: the prospect leaves believing something untrue about price, terms or what they get.
- `conduct`: pressure, shaming, misrepresenting identity, dismissing the prospect.
- `wellbeing_risk`: the prospect discloses abuse, self-harm, severe depression or a crisis, and the rep sells through it without care or a referral. Do not soften this.
- `compliance`: no recording disclosure, confidentiality breaches, claims that read as therapy or mental-health treatment.
- `policy_contradiction`: a rep states a policy (refunds, guarantees, plans) that contradicts the script or another call.
- `data_integrity`: the CRM outcome contradicts the transcript, truncated recording, wrong call linked.

Severity: `critical` = harm or legal exposure · `high` = material money or trust consequence · `medium` = should be corrected · `low` = worth noting at scale.

## 5. Judgement rules

- Quote, don't paraphrase, in `raw_quote`, `evidence` and `outcome_promise_quote`.
- Score adherence on what the rep did, not on how the call ended. A sloppy close still scores badly.
- `hit` = clearly done · `partial` = attempted or weaker variant · `miss` = applicable and not done (if the prospect volunteered it unprompted, that's still a miss) · `not_applicable` = the call couldn't reach it.
- Never invent. Absent → `null` or an empty list.
- If the CRM outcome and the transcript disagree, add a `data_integrity` flag saying how.
- Empty flag lists are normal. Don't manufacture findings.

## 6. Output discipline

Write the JSON file and validate it parses (`python3 -c "import json;json.load(open(PATH))"`). Return ONLY a compact line per call: call_id, rep, CRM outcome, transcript disposition, count of flags by severity, and any anomaly worth escalating. **Never paste transcript text or the JSON into your final message.**
