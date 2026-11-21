#!/usr/bin/env python3
"""Build one raw thread file per lead (all SMS + Calendly + EOC + payments) for the thread extractors.
Usage: OFFER=<offer> python3 -I src/prep_threads.py <export_dir>   -> data/<offer>/raw/threads/<lead_id>.json"""
import json, os, sys, collections as C
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from closes import mark_new_closes
OFFER = os.environ.get("OFFER", "krc")
X = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = f"{ROOT}/data/{OFFER}/raw/threads"
os.makedirs(OUT, exist_ok=True)
jl = lambda p: (lambda d: d["data"] if isinstance(d, dict) and "data" in d else d)(json.load(open(p)))
leads = {l["id"]: l for l in jl(f"{X}/close/leads.json")}
sms = jl(f"{X}/krc_msgs/sms.json")
inv = jl(f"{X}/calendly/invitees.json")
tabs = json.load(open(f"{X}/airtable/tables.json"))["tables"]
AT = lambda f: [r["fields"] for r in json.load(open(f"{X}/airtable/rec_{[t for t in tabs if f in t['name']][0]['id']}.json"))]
eoc, pay = AT("EOC Report"), AT("Payment Records")
mark_new_closes(eoc)
em = lambda l: {e["email"].lower().strip() for c in l.get("contacts", []) for e in c.get("emails", [])}
e2l = {e: lid for lid, l in leads.items() for e in em(l)}
by = C.defaultdict(list)
for m in sms:
    if m.get("lead_id"):
        by[m["lead_id"]].append(m)
n = 0
for lid, ms in by.items():
    l = leads.get(lid) or {}
    E = em(l)
    rec = {"lead_id": lid, "lead_name": l.get("display_name"), "lead_created": l.get("date_created"), "status": l.get("status_label"),
           "opt_source": (l.get("custom") or {}).get("Opt Source") or (l.get("custom") or {}).get("Application Source"),
           "calendly": [{k: i.get(k) for k in ("event", "start", "created", "status", "canceled_by", "rescheduled")} for i in inv if (i.get("email") or "").lower() in E],
           "eoc": [{"date": e.get("Date of Call"), "outcome": e.get("Call Outcome"), "payment_type": e.get("Payment Type"), "new_close": e.get("_new_close")} for e in eoc if str(e.get("Lead Email") or "").lower().strip() in E],
           "paid": sum(p.get("Amount") or 0 for p in pay if str(p.get("Email") or "").lower().strip() in E),
           "messages": [{"t": m["date_created"][:16], "dir": "out" if m["direction"] == "outbound" else "in", "by": m.get("user_name") if m["direction"] == "outbound" else None, "text": m.get("text") or ""}
                        for m in sorted(ms, key=lambda m: m["date_created"])]}
    json.dump(rec, open(f"{OUT}/{lid}.json", "w"))
    n += 1
print("threads", n, "with lead reply", sum(1 for ms in by.values() if any(m["direction"] == "inbound" for m in ms)))
