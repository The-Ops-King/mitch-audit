# Setter-call extraction spec (Kimberly Rae Coaching)

Same rules as `CLOSER_SPEC.md` (vocabularies verbatim, quote don't paraphrase, never invent, score what the rep did). Read `data/krc/playbook_setter.json` first.

Transcripts are machine transcriptions of phone audio (Whisper): no speaker labels, `[MM:SS] text` lines. Work out who is the setter from content. Expect transcription errors in names and numbers.

## Output: `data/krc/setter_calls/<call_id>.json`

```jsonc
{
  "call_id": "acti_...",
  "type": "setter_call|voicemail_or_no_answer|closer_or_other|not_sales",   // only setter_call gets the full record
  "setter": "name from the input",
  "date": "...", "duration_min": 8,
  "lead_trigger": "application|quiz|free_training|dm_handoff|followup|no_show_recovery|confirmation|unknown",
  "connected_conversation": true,
  "prospect": { "first_name": null, "gender": "woman|man|unknown", "relationship_status": "<closer vocab>", "age": null },
  "segment": { "assigned": "<closer vocab>", "confidence": 0.6 },
  "pains": [ { "text": "...", "category": "<closer vocab>" } ],
  "goals": [ { "text": "...", "category": "<closer vocab>" } ],
  "questions_asked": [ { "key": "<closer vocab>", "quote": "...", "order_index": 1 } ],
  "objections": [ { "type": "<closer vocab, plus not_interested>", "raw_quote": "...", "resolved": false } ],
  "price_mentioned": { "said": false, "quote": null, "within_script_range": true },
  "credit_or_financing_check": false,
  "result": "booked_calendar|live_transferred|callback_scheduled|not_qualified|not_interested|no_decision|unclear",
  "invite_accepted_on_call": null,
  "adherence": { "phases": { "S1": { "score": "hit|partial|miss|not_applicable", "checks": { "S1a": "hit" }, "evidence": "..." } }, "coach_note": "..." },
  "summary": "one or two sentences: who the lead is, what happened, how it ended",
  "gates": {                                    // the three things a triage call must establish before booking
    "problem":  { "verdict": "solid|partial|weak|missed", "evidence": "exact quote", "timestamp": "[MM:SS]" },
    "why_now":  { "verdict": "solid|partial|weak|missed", "evidence": "exact quote", "timestamp": "[MM:SS]" },
    "means":    { "verdict": "solid|partial|weak|missed", "evidence": "exact quote", "timestamp": "[MM:SS]" }
  },
  "tie_downs": {                                // show protection; true only if clearly done on the call
    "time_locked": false, "invite_accepted_live": false, "verbal_show_commitment": false,
    "video_or_setting_expectation": false, "decision_maker_handled": false, "reminder_or_prep_set": false
  },
  "set_quality": "high|medium|low|not_set",     // how likely this booking is to show and be qualified
  "coaching": [                                 // 1-4 items, most important first
    { "area": "<phase id, e.g. S6>", "priority": "high|medium|low", "issue": "what went wrong, specific", "better": "the exact words she could have said instead", "timestamp": "[MM:SS]" }
  ],
  "exemplary": [ { "area": "<phase id>", "quote": "exact words where she did it well", "why": "short", "timestamp": "[MM:SS]" } ],
  "flags": [ { "category": "<closer flag vocab>", "severity": "...", "summary": "...", "evidence": ["exact quote"], "timestamp": "[MM:SS]" } ],
  "quality": { "transcript_quality": "good|fair|poor", "notes": "" }
}
```

Return one compact line per call (call_id, setter, type, result, flag counts). Never paste transcript text.
