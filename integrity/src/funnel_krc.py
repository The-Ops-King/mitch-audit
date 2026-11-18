#!/usr/bin/env python3
"""Full-population funnel for KRC from Close, Calendly, Airtable exports.
Usage: python3 src/funnel_krc.py <export_dir>  -> data/krc/raw/funnel.json"""
import json, sys, os, collections as C, datetime as D
OFFER = __import__("os").environ.get("OFFER", "krc")
X = sys.argv[1]
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), f"data/{OFFER}/raw/funnel.json")
SINCE = "2026-09-01"
P = lambda s: D.datetime.fromisoformat(s.replace("Z", "+00:00")).replace(tzinfo=None)
leads = json.load(open(f"{X}/close/leads.json"))
calls = json.load(open(f"{X}/close/act_call.json")); sms = json.load(open(f"{X}/close/act_sms.json"))
inv = json.load(open(f"{X}/calendly/invitees.json"))
tabs = json.load(open(f"{X}/airtable/tables.json"))["tables"]
T = lambda frag: json.load(open(f"{X}/airtable/rec_{[t for t in tabs if frag in t['name']][0]['id']}.json"))
eoc = [r["fields"] for r in T("EOC Report")]; pay = [r["fields"] for r in T("Payment Records")]
em = lambda l: {e["email"].lower().strip() for c in l.get("contacts", []) for e in c.get("emails", [])}
first = {}
for a in calls + sms:
    if a.get("direction") == "outbound" and a.get("lead_id"):
        first[a["lead_id"]] = min(first.get(a["lead_id"], a["date_created"]), a["date_created"])
rec = [l for l in leads if l["date_created"] >= SINCE]
def src(l):
    s = (l.get("custom") or {}).get("Opt Source") or (l.get("custom") or {}).get("Application Source") or (l.get("custom") or {}).get("First Click Source") or "Unknown"
    return "Kajabi freebie" if s.startswith("Kajabi - ") else s
inv_by = C.defaultdict(list)
for i in inv: inv_by[i["email"]].append(i)
eoc_by = C.defaultdict(list)
for e in eoc: eoc_by[str(e.get("Lead Email", "")).lower().strip()].append(e)
paid_by = C.Counter()
for p in pay: paid_by[str(p.get("Email", "")).lower().strip()] += p.get("Amount", 0) or 0
HELD = lambda e: e.get("Call Outcome") not in ("No Show", "Cancelled", "Reschedule", None)
CLOSED = lambda e: e.get("Call Outcome") == "Closed" and e.get("Payment Type") not in ("Deposit", "Instalment Paid")
rows = []
for l in rec:
    E = em(l); f = first.get(l["id"])
    mins = (P(f) - P(l["date_created"])).total_seconds() / 60 if f else None
    b = [i for e in E for i in inv_by.get(e, [])]; ev = [x for e in E for x in eoc_by.get(e, [])]
    rows.append({"source": src(l), "month": l["date_created"][:7], "contacted": f is not None, "mins": mins,
                 "booked": bool(b) or bool(ev), "showed": any(HELD(x) for x in ev), "closed": any(CLOSED(x) for x in ev),
                 "cash": sum(paid_by[e] for e in E)})
def summ(rs):
    t = sorted(r["mins"] for r in rs if r["mins"] is not None and r["mins"] >= 0)
    n = len(rs)
    return {"leads": n, "contacted": sum(r["contacted"] for r in rs), "contacted_5min": sum(1 for x in t if x <= 5),
            "contacted_60min": sum(1 for x in t if x <= 60), "median_minutes": round(t[len(t) // 2]) if t else None,
            "booked": sum(r["booked"] for r in rs), "showed": sum(r["showed"] for r in rs), "closed": sum(r["closed"] for r in rs),
            "cash": round(sum(r["cash"] for r in rs))}
by_src = {s: summ([r for r in rows if r["source"] == s]) for s in sorted({r["source"] for r in rows})}
by_month = {m: summ([r for r in rows if r["month"] == m]) for m in sorted({r["month"] for r in rows})}
cal = [i for i in inv if i["start"] >= SINCE]
path = lambda e: "Setter booked (SB)" if "(SB)" in e else ("Direct booking (DCB)" if "DCB" in e else e)
cal_sum = {}
for k in sorted({path(i["event"]) for i in cal}):
    x = [i for i in cal if path(i["event"]) == k]
    canc = [i for i in x if i["status"] == "canceled" and not i["rescheduled"]]
    cal_sum[k] = {"bookings": len(x), "canceled_by_host": sum(1 for i in canc if i["canceled_by"] == "host"),
                  "canceled_by_lead": sum(1 for i in canc if i["canceled_by"] == "invitee"),
                  "rescheduled": sum(1 for i in x if i["rescheduled"]),
                  "texting_reminder_number": sum(1 for i in x if i.get("reminders"))}
eo = [e for e in eoc if (e.get("Date of Call") or "") >= SINCE]
eoc_sum = dict(C.Counter(e.get("Call Outcome") for e in eo))
rec_cov = C.Counter("fathom" if "fathom.video" in str(e.get("Fathom Share Link")) else "zoom" if "zoom.us/rec" in str(e.get("Fathom Share Link"))
                    else "drive" if "drive.google" in str(e.get("Fathom Share Link")) else "calendly" if "calendly.com/s/meetings" in str(e.get("Fathom Share Link")) else "none" for e in eoc)
json.dump({"since": SINCE, "overall": summ(rows), "by_source": by_src, "by_month": by_month, "calendly": cal_sum,
           "eoc_outcomes_since": eoc_sum, "recording_coverage_all_eocs": dict(rec_cov), "eoc_total": len(eoc)}, open(OUT, "w"), indent=1)
print(json.dumps(summ(rows)), json.dumps(cal_sum))
