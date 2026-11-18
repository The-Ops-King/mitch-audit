# Script fixes (redlines) spec

Goal: for each sales script the team uses, show what the script says, what reps actually do, what works, and the exact
change to make. Mitch and Sid use this to update the scripts and train. Every recommendation must rest on evidence from
the calls or texts, cited by call_id / lead_id.

Inputs (per offer `<o>`):
- The scripts themselves (Google Drive docs; ids given in the task). Save each script's text to data/<o>/sources/<name>.md.
- web/data/<o>.json: closer.deep.checks (every check: run %, won vs not-won %, misses), closer.objection_pages
  (per objection: quotes, handled well / badly with better lines, tactics), closer.deep.coach_themes, closer.deep.exemplary,
  triage (setter calls: gates, checks, themes), texting (objections by text, flags), offer (prices quoted).
- web/data/<o>_calls.json and <o>_triage.json for exact quotes and coaching per call.

Output data/<o>/script_patches.json:
```jsonc
{
  "scripts": [{
    "script": "Master Closing Doc", "doc_id": "...", "last_edited": "YYYY-MM-DD",
    "summary": "2-3 sentences: how closely reps follow it, where it breaks, the 3 changes that matter most",
    "patches": [{
      "id": "MC-01", "section": "the script's own section name", "priority": "high|medium|low",
      "type": "missing_from_script|reps_skip_it|script_is_wrong|reps_improvise|needs_branch",
      "script_says": "exact quote from the script, or null if missing",
      "reality": "what reps actually do, with numbers from the data (e.g. run on 22% of calls; 0 of 51 asked money before the pitch)",
      "what_works": "what the won or best calls do instead, if anything",
      "change": "the instruction, plain",
      "new_lines": ["the exact words to add or replace, in the script's voice"],
      "evidence": [ { "call_id": "rec... or acti_... or lead_...", "quote": "exact quote" } ],
      "owner": "Sid (training) | Mitch (decision) | Leah (automation)"
    }]
  }],
  "unhandled_objections": [{
    "type": "<objection vocab>", "how_often": "N times on M calls, resolved X%", "what_prospects_say": ["exact quotes"],
    "what_reps_try": "short", "recommended_handling": ["the exact lines, in order, as a mini-script"], "evidence": [{ "call_id": "...", "quote": "..." }]
  }],
  "decisions_for_mitch": ["things the script can't settle without a business decision (e.g. approved downsell, proof line)"]
}
```
Rules: quote the script and the calls exactly. Numbers come from the data files, not estimates. new_lines must be words a rep
can say tomorrow. Don't recommend more than the data supports. Plain language, no em dashes. Validate the JSON parses.
