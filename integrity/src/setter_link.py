#!/usr/bin/env python3
"""Link each scored triage call to what happened next for that lead (booking, show, new deal, DQ),
then compare outcomes by setter behaviour. Usage: OFFER=krc python3 src/setter_link.py <scratch_dir>"""
import json, os, sys, glob, collections as C
from datetime import datetime, timedelta, timezone
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from closes import mark_new_closes, is_new_close
OFFER = os.environ.get("OFFER", "krc"); X = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); D = f"{ROOT}/data/{OFFER}"
tabs = json.load(open(f"{X}/airtable/tables.json"))["tables"]
AT = lambda f: [r["fields"] for r in json.load(open(f"{X}/airtable/rec_{[t for t in tabs if f in t['name']][0]['id']}.json"))]
eoc = mark_new_closes(AT("EOC Report"))
leads = json.load(open(f"{X}/close/leads.json")); leads = leads.get("data", leads) if isinstance(leads, dict) else leads
L = {l["id"]: l for l in leads}
em = lambda l: {e["email"].lower().strip() for c in l.get("contacts", []) for e in c.get("emails", [])}
inv = json.load(open(f"{X}/calendly/invitees.json")) if os.path.exists(f"{X}/calendly/invitees.json") else []
eoc_snap = max(e.get("Date of Call") or "" for e in eoc)
CUTOFF = (datetime.fromisoformat(eoc_snap) - timedelta(days=10)).date().isoformat()   # calls after this haven't had time to reach a sales call
HELD = lambda e: e.get("Call Outcome") not in ("No Show", "Cancelled", "Reschedule", None)
rows = []
for f in glob.glob(f"{D}/setter_calls/*.json"):
    c = json.load(open(f))
    if c.get("type") != "setter_call":
        continue
    meta = json.load(open(f"{D}/raw/setter_call_meta.json")).get(c["call_id"], {})
    lid = meta.get("lead_id"); E = em(L.get(lid, {})); d0 = c.get("date") or meta.get("date") or ""
    if not E or not d0 or d0 > CUTOFF:
        continue
    after = sorted([e for e in eoc if str(e.get("Lead Email") or "").lower().strip() in E and (e.get("Date of Call") or "") >= d0], key=lambda e: e.get("Date of Call"))
    books = [i for i in inv if (i.get("email") or "").lower() in E and (i.get("created") or "")[:10] >= d0]
    g = c.get("gates") or {}; t = c.get("tie_downs") or {}; pm = c.get("price_mentioned") or {}
    rows.append({"call_id": c["call_id"], "setter": c.get("setter"), "date": d0, "result": c.get("result"), "set_quality": c.get("set_quality"),
                 "booked_on_call": c.get("result") == "booked_calendar",
                 "means": (g.get("means") or {}).get("verdict"), "why_now": (g.get("why_now") or {}).get("verdict"), "problem": (g.get("problem") or {}).get("verdict"),
                 "invite_live": bool(t.get("invite_accepted_live") or c.get("invite_accepted_on_call")), "time_locked": bool(t.get("time_locked")),
                 "show_commit": bool(t.get("verbal_show_commitment")), "price_said": bool(pm.get("said")), "price_in_range": pm.get("within_script_range"),
                 "credit_check": bool(c.get("credit_or_financing_check")),
                 "booked": bool(after or books), "sales_call": bool(after), "showed": any(HELD(e) for e in after),
                 "dq": any(e.get("Call Outcome") == "Disqualified" for e in after), "new_deal": any(is_new_close(e) for e in after),
                 "no_show": any(e.get("Call Outcome") == "No Show" for e in after) and not any(HELD(e) for e in after),
                 "team_cancel": any(e.get("Call Outcome") == "Cancelled" and e.get("Cancellation Type") == "By Rep" for e in after)})

def grp(name, key, label_of):
    out = []
    for lab in label_of:
        rs = [r for r in rows if key(r) == lab[0]]
        if not rs:
            continue
        sc = [r for r in rs if r["sales_call"]]
        out.append({"factor": name, "group": lab[1], "n": len(rs), "reached_sales_call": len(sc), "showed": sum(r["showed"] for r in sc),
                    "no_show": sum(r["no_show"] for r in sc), "dq": sum(r["dq"] for r in sc), "new_deal": sum(r["new_deal"] for r in rs)})
    return out
B = [r for r in rows if r["booked_on_call"]]
def on(rs): return rs
cmp_ = []
cmp_ += grp("Money question (means gate)", lambda r: "asked" if r["means"] in ("solid", "partial") else "not", [("asked", "Asked and answered"), ("not", "Weak or never asked")])
cmp_ += grp("Price on the triage call", lambda r: "none" if not r["price_said"] else ("in" if r["price_in_range"] else "over"), [("none", "No price said"), ("in", "Within 'low to mid four figures'"), ("over", "Above the script range")])
cmp_ += grp("Why-now question", lambda r: "asked" if r["why_now"] in ("solid", "partial") else "not", [("asked", "Asked and answered"), ("not", "Weak or never asked")])
cmp_ += grp("Set quality (setter's own call)", lambda r: r["set_quality"], [("high", "High"), ("medium", "Medium"), ("low", "Low"), ("not_set", "Not set")])
bk = []
for name, key, labs in [("Calendar invite accepted live", lambda r: r["invite_live"], [(True, "Yes"), (False, "No")]),
                        ("Time locked with the lead", lambda r: r["time_locked"], [(True, "Yes"), (False, "No")]),
                        ("Verbal show commitment", lambda r: r["show_commit"], [(True, "Yes"), (False, "No")])]:
    for lab in labs:
        rs = [r for r in B if key(r) == lab[0]]; sc = [r for r in rs if r["sales_call"]]
        if rs:
            bk.append({"factor": name, "group": lab[1], "n": len(rs), "reached_sales_call": len(sc), "showed": sum(r["showed"] for r in sc), "no_show": sum(r["no_show"] for r in sc)})
out = {"calls_linked": len(rows), "cutoff": CUTOFF, "eoc_through": eoc_snap,
       "totals": {"reached_sales_call": sum(r["sales_call"] for r in rows), "showed": sum(r["showed"] for r in rows), "new_deal": sum(r["new_deal"] for r in rows),
                  "dq": sum(r["dq"] for r in rows), "booked_on_call": len(B)},
       "by_factor": cmp_, "bookings_by_tiedown": bk, "rows": rows}
json.dump(out, open(f"{D}/raw/setter_link.json", "w"))
print(OFFER, "linked", len(rows), "cutoff", CUTOFF, out["totals"])
for x in cmp_ + bk: print("  ", x)
