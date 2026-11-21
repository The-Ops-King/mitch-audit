#!/usr/bin/env python3
"""Deterministic lead / ops / texting / dialer analytics for KRC.

Reads the raw exports (Close, Calendly, Airtable) and writes aggregates only to
data/krc/raw/ops.json. No LLM judgement here: every number is countable.

Usage: python3 -I src/ops_krc.py <export_dir>
Times are bucketed in US Eastern (America/New_York).
"""
import json, os, re, sys, statistics as st, collections as C
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from closes import mark_new_closes, is_new_close
OFFER = __import__("os").environ.get("OFFER", "krc")
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

X = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, f"data/{OFFER}/raw/ops.json")
SINCE = "2026-09-01"
ET = ZoneInfo("America/New_York")
# "Now" is when the exports were taken, not when this script runs, so ages and overdue flags stay true to the data.
_snap = [os.path.realpath(f"{X}/close/leads.json"), os.path.realpath(f"{X}/close/act_call.json")]
_snap += [os.path.realpath(f"{X}/airtable/rec_{t['id']}.json") for t in json.load(open(f"{X}/airtable/tables.json"))["tables"] if "EOC Report" in t["name"]]
NOW = datetime.fromtimestamp(min(os.path.getmtime(f) for f in _snap if os.path.exists(f)), timezone.utc)


def P(s):
    if not s:
        return None
    d = datetime.fromisoformat(str(s).replace("Z", "+00:00"))
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def med(xs):
    xs = [x for x in xs if x is not None]
    return round(st.median(xs), 1) if xs else None


def pct(a, b):
    return round(100 * a / b) if b else None


def jl(p):
    d = json.load(open(p))
    return d["data"] if isinstance(d, dict) and "data" in d else d


# ---------------------------------------------------------------- load
leads = jl(f"{X}/close/leads.json")
calls = jl(f"{X}/krc_setter/calls_all.json")          # every Close call, with user_name + recording flags
sms = jl(f"{X}/krc_msgs/sms.json")                     # every Close SMS, with text + user_name
inv = jl(f"{X}/calendly/invitees.json")
tabs = json.load(open(f"{X}/airtable/tables.json"))["tables"]


def AT(frag):
    t = [t for t in tabs if frag in t["name"]][0]
    return [r["fields"] for r in json.load(open(f"{X}/airtable/rec_{t['id']}.json"))]


eoc, pay, eod, metrics, refunds, lead_base = AT("EOC Report"), AT("Payment Records"), AT("EOD"), AT("Sales Metrics Summary"), AT("Refund Records"), AT("Lead Base")
REP = {"Sidonie Chechin": "Sidonie C", "Jeremy Makena": "Makena Waterhouse", "Mariah Malvezzi": "Mariah Casagrande-Malvezzi",
       "Ellie Porter": "Elly Porter"}
rep = lambda n: REP.get(n.strip(), n.strip()) if n and n.strip() else "Unknown"

em = lambda l: {e["email"].lower().strip() for c in l.get("contacts", []) for e in c.get("emails", [])}
lead_by_id = {l["id"]: l for l in leads}
email_to_lead = {}
for l in leads:
    for e in em(l):
        email_to_lead.setdefault(e, l["id"])

acts_by_lead = C.defaultdict(list)
for c in calls:
    if c.get("lead_id"):
        acts_by_lead[c["lead_id"]].append(("call", P(c["date_created"]), c))
for m in sms:
    if m.get("lead_id"):
        acts_by_lead[m["lead_id"]].append(("sms", P(m["date_created"]), m))
for v in acts_by_lead.values():
    v.sort(key=lambda a: a[1])

inv_by_lead = C.defaultdict(list)
for i in inv:
    lid = email_to_lead.get((i.get("email") or "").lower().strip())
    if lid:
        inv_by_lead[lid].append(i)
eoc_by_lead = C.defaultdict(list)
for e in eoc:
    lid = email_to_lead.get(str(e.get("Lead Email", "")).lower().strip())
    if lid:
        eoc_by_lead[lid].append(e)
paid_by_lead = C.Counter()
for p in pay:
    lid = email_to_lead.get(str(p.get("Email", "")).lower().strip())
    if lid:
        paid_by_lead[lid] += p.get("Amount") or 0

HELD = lambda e: e.get("Call Outcome") not in ("No Show", "Cancelled", "Reschedule", None)
mark_new_closes(eoc)
CLOSED = is_new_close


def src(l):
    s = (l.get("custom") or {}).get("Opt Source") or (l.get("custom") or {}).get("Application Source") or (l.get("custom") or {}).get("First Click Source") or "Unknown"
    return "Kajabi freebie" if s.startswith("Kajabi - ") else s


def applied(l):
    return (l.get("custom") or {}).get("Applied Source") or (l.get("custom") or {}).get("Booking Source") or "Unknown"


# ---------------------------------------------------------------- per-lead facts
SPEED = [("≤5 min", 5), ("5–15 min", 15), ("15–60 min", 60), ("1–4 hrs", 240), ("4–24 hrs", 1440), ("1–3 days", 4320), ("3+ days", 10 ** 9)]


def speed_bucket(m):
    if m is None:
        return "Never"
    for k, lim in SPEED:
        if m <= lim:
            return k


def lead_row(l):
    created = P(l["date_created"])
    A = acts_by_lead.get(l["id"], [])
    outs = [a for a in A if (a[2].get("direction") == "outbound") and a[1] >= created - timedelta(minutes=1)]
    first = outs[0] if outs else None
    mins = max(0, (first[1] - created).total_seconds() / 60) if first else None
    wk = [a for a in outs if a[1] <= created + timedelta(days=7)]
    conn = [a for a in A if a[0] == "call" and a[2].get("disposition") == "answered" and (a[2].get("duration") or 0) >= 60]
    dials_before_conn = None
    if conn:
        dials_before_conn = sum(1 for a in A if a[0] == "call" and a[2].get("direction") == "outbound" and a[1] <= conn[0][1])
    inb = [a for a in A if a[2].get("direction") == "inbound"]
    I = inv_by_lead.get(l["id"], [])
    E = eoc_by_lead.get(l["id"], [])
    first_book = min((P(i["created"]) for i in I if i.get("created")), default=None)
    loc = created.astimezone(ET)
    return ({
        "id": l["id"], "source": src(l), "applied": applied(l), "status": l.get("status_label") or "Unknown",
        "month": loc.strftime("%Y-%m"), "week": (loc - timedelta(days=loc.weekday())).strftime("%Y-%m-%d"),
        "hour": loc.hour, "dow": loc.strftime("%a"),
        "mins": mins, "first_channel": first[0] if first else None,
        "first_by": rep(first[2].get("user_name")) if first else None,
        "touches_7d": len(wk), "touch_days_7d": len({a[1].astimezone(ET).date() for a in wk}),
        "calls_7d": sum(1 for a in wk if a[0] == "call"), "sms_7d": sum(1 for a in wk if a[0] == "sms"),
        "connected": bool(conn), "dials_before_connect": dials_before_conn,
        "replied": bool(inb),
        "booked": bool(I) or bool(E), "showed": any(HELD(e) for e in E), "closed": any(CLOSED(e) for e in E),
        "cash": paid_by_lead[l["id"]],
        "days_to_book": round((first_book - created).total_seconds() / 86400, 1) if first_book else None,
        "age_days": (NOW - created).days,
    })

rows = [lead_row(l) for l in leads if l["date_created"] >= SINCE]

N = len(rows)


def summ(rs):
    n = len(rs)
    t = [r["mins"] for r in rs if r["mins"] is not None]
    return {"leads": n, "contacted": len(t), "contacted_pct": pct(len(t), n),
            "in5": sum(1 for x in t if x <= 5), "in5_pct": pct(sum(1 for x in t if x <= 5), n),
            "median_min": med(t), "replied": sum(r["replied"] for r in rs), "connected": sum(r["connected"] for r in rs),
            "booked": sum(r["booked"] for r in rs), "booked_pct": pct(sum(r["booked"] for r in rs), n),
            "showed": sum(r["showed"] for r in rs), "closed": sum(r["closed"] for r in rs), "cash": round(sum(r["cash"] for r in rs))}


def group(key, order=None):
    ks = order or sorted({r[key] for r in rows}, key=lambda k: (-sum(1 for r in rows if r[key] == k), str(k)))
    return [{"key": k, **summ([r for r in rows if r[key] == k])} for k in ks if any(r[key] == k for r in rows)]


leads_out = {
    "since": SINCE, "overall": summ(rows),
    "by_source": group("source"), "by_applied": group("applied"), "by_month": group("month", sorted({r["month"] for r in rows})),
    "by_week": group("week", sorted({r["week"] for r in rows})),
    "by_status": [{"key": k, "leads": v} for k, v in C.Counter(r["status"] for r in rows).most_common()],
    "speed_buckets": [{"key": k, **summ([r for r in rows if speed_bucket(r["mins"]) == k])} for k in [s[0] for s in SPEED] + ["Never"]],
    "by_hour": [{"key": h, **summ([r for r in rows if r["hour"] == h])} for h in range(24)],
    "by_dow": [{"key": d, **summ([r for r in rows if r["dow"] == d])} for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]],
    "first_channel": dict(C.Counter(r["first_channel"] or "none" for r in rows)),
    "first_by": dict(C.Counter(r["first_by"] or "none" for r in rows)),
    "touches_7d": {
        "median_touches": med([r["touches_7d"] for r in rows]), "median_days": med([r["touch_days_7d"] for r in rows]),
        "dist": [{"key": k, "leads": sum(1 for r in rows if (r["touches_7d"] if k != "10+" else 10) == (k if k != "10+" else 10) or (k == "10+" and r["touches_7d"] >= 10)),
                  } for k in [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"]],
        "never_replied_by_touches": [{"key": k, "leads": sum(1 for r in rows if not r["replied"] and r["touches_7d"] == k)} for k in range(0, 8)],
    },
    "dials_before_connect": {"median": med([r["dials_before_connect"] for r in rows]), "connected_leads": sum(1 for r in rows if r["connected"])},
    "days_to_book": {"median": med([r["days_to_book"] for r in rows if r["days_to_book"] is not None and r["days_to_book"] >= 0]),
                     "same_day": sum(1 for r in rows if r["days_to_book"] is not None and 0 <= r["days_to_book"] < 1),
                     "booked_with_date": sum(1 for r in rows if r["days_to_book"] is not None)},
    "untouched_open": [{"key": s, "leads": sum(1 for r in rows if r["mins"] is None and r["source"] == s)} for s in sorted({r["source"] for r in rows})],
}
# fix touches dist (simple)
d = C.Counter(min(r["touches_7d"], 10) for r in rows)
leads_out["touches_7d"]["dist"] = [{"key": ("10+" if k == 10 else k), "leads": d.get(k, 0)} for k in range(0, 11)]

# ---------------------------------------------------------------- Calendly
cal = [i for i in inv if (i.get("start") or "") >= SINCE]


def path(e):
    m = re.search(r"\((\w+)\)", e or "")
    code = m.group(1) if m else None
    return {"SB": "Setter booked", "DCBA": "Direct, ads", "DCBIG": "Direct, Instagram", "DCBE": "Direct, email"}.get(code, e)


def lead_time_bucket(i):
    if not i.get("created") or not i.get("start"):
        return "Unknown"
    h = (P(i["start"]) - P(i["created"])).total_seconds() / 3600
    return "Same day" if h < 24 else "1–2 days" if h < 72 else "3–6 days" if h < 168 else "7+ days"


def inv_showed(i):
    lid = email_to_lead.get((i.get("email") or "").lower().strip())
    if not lid:
        return None
    s = P(i["start"]).date()
    for e in eoc_by_lead.get(lid, []):
        dc = e.get("Date of Call")
        if dc and abs((datetime.fromisoformat(dc).date() - s).days) <= 2:
            return HELD(e)
    return None


cal_rows = []
for i in cal:
    canc = i["status"] == "canceled" and not i.get("rescheduled")
    cal_rows.append({"path": path(i["event"]), "lt": lead_time_bucket(i), "canc_host": canc and i.get("canceled_by") == "host",
                     "canc_lead": canc and i.get("canceled_by") == "invitee", "resched": bool(i.get("rescheduled")),
                     "active": i["status"] == "active", "showed": inv_showed(i) if i["status"] == "active" else None,
                     "reason": (i.get("reason") or "").strip(), "hour": P(i["start"]).astimezone(ET).hour,
                     "dow": P(i["start"]).astimezone(ET).strftime("%a"), "past": P(i["start"]) < NOW})


def csum(rs):
    act = [r for r in rs if r["active"] and r["past"]]
    known = [r for r in act if r["showed"] is not None]
    return {"bookings": len(rs), "host_cancel": sum(r["canc_host"] for r in rs), "lead_cancel": sum(r["canc_lead"] for r in rs),
            "rescheduled": sum(r["resched"] for r in rs), "held_slots": len(act), "with_eoc": len(known),
            "showed": sum(1 for r in known if r["showed"]), "show_pct": pct(sum(1 for r in known if r["showed"]), len(known))}


calendly_out = {
    "overall": csum(cal_rows),
    "by_path": [{"key": k, **csum([r for r in cal_rows if r["path"] == k])} for k in sorted({r["path"] for r in cal_rows}, key=lambda k: -sum(1 for r in cal_rows if r["path"] == k))],
    "by_lead_time": [{"key": k, **csum([r for r in cal_rows if r["lt"] == k])} for k in ["Same day", "1–2 days", "3–6 days", "7+ days"]],
    "by_dow": [{"key": d, **csum([r for r in cal_rows if r["dow"] == d])} for d in ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]],
    "cancel_reasons": [{"reason": r["reason"][:200], "by": "host" if r["canc_host"] else "lead"} for r in cal_rows if r["reason"] and (r["canc_host"] or r["canc_lead"])],
    "cancel_reason_missing": sum(1 for r in cal_rows if (r["canc_host"] or r["canc_lead"]) and not r["reason"]),
}

# ---------------------------------------------------------------- EOC + payments
E2 = [e for e in eoc if (e.get("Date of Call") or "") >= SINCE]


def ecount(field, rs=E2):
    c = C.Counter()
    for e in rs:
        v = e.get(field)
        for x in (v if isinstance(v, list) else [v]):
            if x not in (None, "", "N/A"):
                c[str(x).strip()] += 1
    return c.most_common()


eoc_months = sorted({(e.get("Date of Call") or "")[:7] for e in eoc if e.get("Date of Call")})
eoc_out = {
    "total": len(eoc), "since_total": len(E2),
    "by_month": [{"key": m, **dict(C.Counter(e.get("Call Outcome") or "Blank" for e in eoc if (e.get("Date of Call") or "").startswith(m)))} for m in eoc_months],
    "by_closer": [{"key": rep(k), "reports": v, "closed": sum(1 for e in E2 if e.get("Closer Name") == k and CLOSED(e)),
                   "held": sum(1 for e in E2 if e.get("Closer Name") == k and HELD(e)),
                   "cash": round(sum(e.get("Cash Collected") or 0 for e in E2 if e.get("Closer Name") == k))}
                  for k, v in C.Counter(e.get("Closer Name") for e in E2).most_common()],
    "call_type": ecount("Call Type"), "outcome": ecount("Call Outcome"), "payment_type": ecount("Payment Type"),
    "payment_method": ecount("Payment Method"), "product": ecount("Product Purchased"), "no_close": ecount("No Close Reason(s) / Objection(s) Faced"),
    "cancellation_type": ecount("Cancellation Type"), "no_show_type": ecount("No Show Type"), "reschedule_type": ecount("Reschedule Type"),
    "followup_set": ecount("Was a Follow Up Set?"), "lead_source": ecount("Lead Source"),
    "setter_named": sum(1 for e in E2 if e.get("Setter Name")),
    "recording_link": sum(1 for e in E2 if re.search(r"fathom|zoom|drive|calendly", str(e.get("Fathom Share Link") or ""))),
    "dq_reasons": [str(e.get("DQ Reason")).strip()[:240] for e in E2 if e.get("DQ Reason")],
    "lost_reasons": [str(e.get("Lost Reason")).strip()[:240] for e in E2 if e.get("Lost Reason")],
    "dq_count": sum(1 for e in E2 if e.get("Call Outcome") == "Disqualified"),
    "dq_without_reason": sum(1 for e in E2 if e.get("Call Outcome") == "Disqualified" and not e.get("DQ Reason")),
    "full_closes": [{"contract": e.get("Contract Value"), "cash": e.get("Cash Collected"), "product": e.get("Product Purchased")} for e in E2 if CLOSED(e)],
    "cash_collected": round(sum(e.get("Cash Collected") or 0 for e in E2)), "contract_value": round(sum(e.get("Contract Value") or 0 for e in E2)),
}

pay_months = sorted({(p.get("Date") or "")[:7] for p in pay if p.get("Date")})
payments_out = {
    "count": len(pay), "total": round(sum(p.get("Amount") or 0 for p in pay)), "net": round(sum(p.get("Net Amount") or 0 for p in pay)),
    "fees": round(sum(p.get("Processing Fees") or 0 for p in pay)),
    "by_month": [{"key": m, "cash": round(sum(p.get("Amount") or 0 for p in pay if (p.get("Date") or "").startswith(m))),
                  "payments": sum(1 for p in pay if (p.get("Date") or "").startswith(m)),
                  "new": round(sum(p.get("New Cash") or 0 for p in pay if (p.get("Date") or "").startswith(m))),
                  "recurring": round(sum(p.get("Recurring Cash") or 0 for p in pay if (p.get("Date") or "").startswith(m)))} for m in pay_months],
    "method": [[k, v] for k, v in C.Counter(p.get("Payment Method") or "Unknown" for p in pay).most_common()],
    "type": [[k, v] for k, v in C.Counter(p.get("Payment Type") or "Unknown" for p in pay).most_common()],
    "amounts": sorted(round(p.get("Amount") or 0) for p in pay),
    "refunds": {"count": len(refunds), "total": round(sum(r.get("Amount") or 0 for r in refunds))},
}

# ---------------------------------------------------------------- Airtable dashboard vs recount
mlookup = {m.get("Reporting Period"): m for m in metrics}
recon = []
for m in ["2026-09", "2026-10", "2026-11"]:
    label = datetime.fromisoformat(m + "-01").strftime("%B %Y")
    a = mlookup.get(label) or {}
    em_ = [e for e in eoc if (e.get("Date of Call") or "").startswith(m)]
    sched = [e for e in em_ if e.get("Call Outcome") not in ("Cancelled", "Reschedule")]
    shows = [e for e in em_ if HELD(e)]
    closes_any = [e for e in em_ if e.get("Call Outcome") == "Closed"]
    closes_full = [e for e in em_ if CLOSED(e)]
    recon.append({"month": m, "airtable": {"show_rate": a.get("Show Rate"), "close_rate": a.get("Close Rate"), "closed": a.get("Total Closed Deals"),
                                            "cash": a.get("Total Cash Collected"), "leads": a.get("Total New Leads"), "shows": a.get("Total Shows")},
                  "recount": {"show_rate": round(len(shows) / len(sched), 3) if sched else None, "show_rate_all_reports": round(len(shows) / len(em_), 3) if em_ else None, "reports": len(em_),
                              "close_rate_incl_deposits": round(len(closes_any) / len(shows), 3) if shows else None,
                              "close_rate_full_pay": round(len(closes_full) / len(shows), 3) if shows else None,
                              "closed_incl_deposits": len(closes_any), "closed_full_pay": len(closes_full), "shows": len(shows),
                              "close_leads": sum(1 for r in rows if r["month"] == m)}})

# ---------------------------------------------------------------- Dialer (Close calls)
call_rows = []
for c in calls:
    t = P(c["date_created"]).astimezone(ET)
    call_rows.append({"user": rep(c.get("user_name")), "dir": c.get("direction"), "disp": c.get("disposition"), "dur": c.get("duration") or 0,
                      "rec": bool(c.get("recording_url")), "date": t.date().isoformat(), "month": t.strftime("%Y-%m"),
                      "week": (t - timedelta(days=t.weekday())).strftime("%Y-%m-%d"), "hour": t.hour, "lead": c.get("lead_id")})
CONN = lambda r: r["disp"] == "answered" and r["dur"] >= 60


def dsum(rs):
    ob = [r for r in rs if r["dir"] == "outbound"]
    return {"dials": len(ob), "answered": sum(1 for r in ob if r["disp"] == "answered"), "connects_60s": sum(1 for r in ob if CONN(r)),
            "connect_pct": pct(sum(1 for r in ob if CONN(r)), len(ob)), "convos_5min": sum(1 for r in rs if r["dur"] >= 300),
            "talk_min": round(sum(r["dur"] for r in rs) / 60), "recorded": sum(1 for r in rs if r["rec"]), "inbound": sum(1 for r in rs if r["dir"] == "inbound"),
            "leads_dialed": len({r["lead"] for r in ob}), "days_active": len({r["date"] for r in ob})}


dialer_out = {
    "overall": dsum(call_rows),
    "by_user": [{"key": u, **dsum([r for r in call_rows if r["user"] == u])} for u, _ in C.Counter(r["user"] for r in call_rows).most_common()],
    "by_month": [{"key": m, **dsum([r for r in call_rows if r["month"] == m])} for m in sorted({r["month"] for r in call_rows})],
    "by_hour": [{"key": h, **dsum([r for r in call_rows if r["hour"] == h])} for h in range(24)],
    "duration_buckets": [{"key": k, "calls": sum(1 for r in call_rows if lo <= r["dur"] < hi)} for k, lo, hi in
                         [("No answer / 0s", 0, 1), ("1–59s", 1, 60), ("1–2 min", 60, 120), ("2–5 min", 120, 300), ("5–10 min", 300, 600), ("10–20 min", 600, 1200), ("20+ min", 1200, 10 ** 9)]],
    "dispositions": C.Counter(r["disp"] for r in call_rows).most_common(),
    "recordings_expire_days": 90,
}

# EOD self-report vs Close log
eod_rows = []
for e in eod:
    u = rep(e.get("Setter Name")); dte = e.get("Reporting Date")
    if not dte:
        continue
    cr = [r for r in call_rows if r["user"] == u and r["date"] == dte and r["dir"] == "outbound"]
    eod_rows.append({"user": u, "date": dte, "eod_dials": e.get("Outbound Dials") or 0, "close_dials": len(cr),
                     "eod_pickups": e.get("Pickups") or 0, "close_answered": sum(1 for r in cr if r["disp"] == "answered"),
                     "eod_convos": e.get("Conversations") or 0, "close_convos": sum(1 for r in cr if r["dur"] >= 120),
                     "eod_talk": e.get("Talk Time (Minutes)") or 0, "close_talk": round(sum(r["dur"] for r in cr) / 60),
                     "eod_booked": (e.get("Calendar Calls Booked") or 0) + (e.get("Live Calls Booked") or 0),
                     "quality": e.get("Avg Lead Quality 1-5"), "note": (e.get("Notes / Feedback From Today") or "").strip()[:300]})
eod_out = {"reports": len(eod_rows), "by_user": []}
for u in sorted({r["user"] for r in eod_rows}):
    rs = [r for r in eod_rows if r["user"] == u]
    ud = {r["date"] for r in call_rows if r["user"] == u and r["dir"] == "outbound"}
    eod_out["by_user"].append({"key": u, "reports": len(rs), **{k: sum(r[k] for r in rs) for k in ["eod_dials", "close_dials", "eod_pickups", "close_answered", "eod_convos", "close_convos", "eod_talk", "close_talk", "eod_booked"]},
                               "days_dialing_in_close": len(ud), "days_dialing_no_report": len(ud - {r["date"] for r in rs}),
                               "avg_quality": med([r["quality"] for r in rs if r["quality"]]),
                               "first": min(r["date"] for r in rs), "last": max(r["date"] for r in rs)})
eod_out["notes"] = [{"user": r["user"], "date": r["date"], "note": r["note"]} for r in sorted(eod_rows, key=lambda r: r["date"], reverse=True) if r["note"]][:40]
eod_out["daily"] = sorted(eod_rows, key=lambda r: r["date"])
for r in eod_out["daily"]:
    r.pop("note", None)

# ---------------------------------------------------------------- SMS deterministic
msgs = sorted([{**m, "t": P(m["date_created"])} for m in sms if m.get("lead_id")], key=lambda m: m["t"])
by_lead = C.defaultdict(list)
for m in msgs:
    by_lead[m["lead_id"]].append(m)
resp = []          # business response time to each inbound burst
unanswered = 0
unanswered_leads = set()
for lid, ms in by_lead.items():
    for i, m in enumerate(ms):
        if m["direction"] != "inbound" or (i + 1 < len(ms) and ms[i + 1]["direction"] == "inbound"):
            continue                      # only the last message of an inbound burst
        nxt = next((x for x in ms[i + 1:] if x["direction"] == "outbound"), None)
        loc = m["t"].astimezone(ET)
        if nxt:
            resp.append({"min": (nxt["t"] - m["t"]).total_seconds() / 60, "rep": rep(nxt.get("user_name")), "hour": loc.hour,
                         "after_hours": loc.hour < 8 or loc.hour >= 20 or loc.weekday() >= 5})
        elif (NOW - m["t"]).days >= 1:
            unanswered += 1; unanswered_leads.add(lid)
RB = [("≤5 min", 5), ("5–30 min", 30), ("30–60 min", 60), ("1–4 hrs", 240), ("4–24 hrs", 1440), ("1+ day", 10 ** 9)]
rb = lambda x: next(k for k, lim in RB if x <= lim)
STOPRX = re.compile(r"^\s*(stop|unsubscribe|cancel|end|quit)\s*\.?\s*$|\b(unsubscribe|remove me|leave me alone|don'?t text|do not text|stop texting|stop messaging|stop contacting|lose my number)\b", re.I)
optout_leads, texted_after = set(), set()
for lid, ms in by_lead.items():
    s = next((m for m in ms if m["direction"] == "inbound" and STOPRX.search(m.get("text") or "")), None)
    if s:
        optout_leads.add(lid)
        if any(m["direction"] == "outbound" and m["t"] > s["t"] + timedelta(minutes=2) for m in ms):
            texted_after.add(lid)
ob = [m for m in msgs if m["direction"] == "outbound"]
quiet = [m for m in ob if (lambda h: h < 8 or h >= 21)(m["t"].astimezone(ET).hour)]


def norm_tpl(t):
    t = (t or "").strip()
    t = re.sub(r"https?://\S+", "{link}", t)
    t = re.sub(r"^(hi|hey|hello|hiya|good (morning|afternoon|evening))[ ,!]+[A-Z][a-z'’-]+", lambda m: m.group(1) + " {name}", t, flags=re.I)
    t = re.sub(r"\b\d{1,2}(:\d{2})?\s?(am|pm|AM|PM)\b", "{time}", t)
    t = re.sub(r"\d", "#", t)
    return re.sub(r"\s+", " ", t)[:160]


tp = C.defaultdict(list)
for lid, ms in by_lead.items():
    for i, m in enumerate(ms):
        if m["direction"] != "outbound":
            continue
        reply = any(x["direction"] == "inbound" and x["t"] - m["t"] <= timedelta(hours=24) for x in ms[i + 1:i + 6])
        tp[norm_tpl(m.get("text"))].append((lid, reply, rep(m.get("user_name"))))
templates = []
for k, v in tp.items():
    if len(v) >= 6 and len(k) > 25:
        templates.append({"text": k, "sends": len(v), "leads": len({x[0] for x in v}), "reply_24h_pct": pct(sum(x[1] for x in v), len(v)),
                          "senders": [s for s, _ in C.Counter(x[2] for x in v).most_common(3)]})
templates.sort(key=lambda t: -t["sends"])

sms_out = {
    "messages": len(msgs), "outbound": len(ob), "inbound": len(msgs) - len(ob), "leads": len(by_lead),
    "by_user": [{"key": u, "sent": sum(1 for m in ob if rep(m.get("user_name")) == u),
                 "leads": len({m["lead_id"] for m in ob if rep(m.get("user_name")) == u}),
                 "median_response_min": med([r["min"] for r in resp if r["rep"] == u]),
                 "responses": sum(1 for r in resp if r["rep"] == u)} for u, _ in C.Counter(rep(m.get("user_name")) for m in ob).most_common()],
    "by_month": [{"key": mo, "out": sum(1 for m in ob if m["t"].astimezone(ET).strftime("%Y-%m") == mo),
                  "in": sum(1 for m in msgs if m["direction"] == "inbound" and m["t"].astimezone(ET).strftime("%Y-%m") == mo)}
                 for mo in sorted({m["t"].astimezone(ET).strftime("%Y-%m") for m in msgs})],
    "response": {"n": len(resp), "median_min": med([r["min"] for r in resp]),
                 "median_business_hours": med([r["min"] for r in resp if not r["after_hours"]]),
                 "median_after_hours": med([r["min"] for r in resp if r["after_hours"]]),
                 "buckets": [{"key": k, "n": sum(1 for r in resp if rb(r["min"]) == k)} for k, _ in RB],
                 "by_hour": [{"key": h, "n": sum(1 for r in resp if r["hour"] == h), "median_min": med([r["min"] for r in resp if r["hour"] == h])} for h in range(24)]},
    "unanswered_inbound": unanswered, "unanswered_leads": len(unanswered_leads),
    "opt_out_leads": len(optout_leads), "texted_after_opt_out": len(texted_after),
    "quiet_hours_sends": len(quiet), "quiet_hours_leads": len({m["lead_id"] for m in quiet}),
    "out_by_hour": [{"key": h, "out": sum(1 for m in ob if m["t"].astimezone(ET).hour == h),
                     "in": sum(1 for m in msgs if m["direction"] == "inbound" and m["t"].astimezone(ET).hour == h)} for h in range(24)],
    "templates": templates[:25],
}

json.dump({"generated": NOW.isoformat(timespec="seconds"), "timezone": "America/New_York", "leads": leads_out, "calendly": calendly_out,
           "eoc": eoc_out, "payments": payments_out, "reconciliation": recon, "dialer": dialer_out, "eod": eod_out, "sms": sms_out},
          open(OUT, "w"), indent=1, default=str)
print("wrote", OUT, os.path.getsize(OUT) // 1024, "KB")
print(json.dumps(leads_out["overall"]), json.dumps(calendly_out["overall"]))
print("sms", {k: v for k, v in sms_out.items() if k in ("messages", "unanswered_inbound", "opt_out_leads", "texted_after_opt_out", "quiet_hours_sends")}, sms_out["response"]["median_min"])
print("dialer", dialer_out["overall"]); print("eod", [(u["key"], u["eod_dials"], u["close_dials"], u["eod_talk"], u["close_talk"]) for u in eod_out["by_user"]])
print("recon", json.dumps(recon)[:800])

# ---------------------------------------------------------------- name tokens for pseudonymisation (never published)
names = set()
for l in leads:
    for n in [l.get("display_name") or ""] + [c.get("name") or "" for c in l.get("contacts", [])]:
        names.update(w.strip(".,()'\"") for w in n.split())
for e in eoc:
    names.update(w.strip(".,()'\"") for w in str(e.get("Lead Full Name") or "").split())
for p in pay:
    names.update(w.strip(".,()'\"") for w in str(p.get("Name") or "").split())
names = sorted(n for n in names if len(n) >= 3 and n[:1].isalpha())
json.dump(names, open(os.path.join(ROOT, f"data/{OFFER}/raw/names.json"), "w"))
json.dump(sorted([str(e.get("Lead Email") or "").lower().strip(), str(e.get("Date of Call") or "")] for e in eoc if is_new_close(e)),
          open(os.path.join(ROOT, f"data/{OFFER}/raw/new_closes.json"), "w"))
print("name tokens", len(names))

# ---------------------------------------------------------------- triage call candidates (metadata only)
cand = [c for c in calls if c.get("recording_url") and (c.get("duration") or 0) >= 120]
meta = {c["id"]: {"lead_id": c.get("lead_id"), "user_name": rep(c.get("user_name")), "duration_min": round((c.get("duration") or 0) / 60, 1),
                  "date": P(c["date_created"]).astimezone(ET).date().isoformat(),
                  "transcribed": os.path.exists(f"{X}/krc_setter/text/{c['id']}.txt")} for c in cand}
json.dump(meta, open(os.path.join(ROOT, f"data/{OFFER}/raw/setter_call_meta.json"), "w"))
print("triage candidates", len(meta), "transcribed", sum(m["transcribed"] for m in meta.values()))

# ---------------------------------------------------------------- application answers (posted to Close as notes)
notes = jl(f"{X}/krc_msgs/notes.json")


def parse_typeform(t):
    d = {}
    for p in re.split(r"^###\s*", t, flags=re.M)[1:]:
        lines = [l.strip() for l in p.strip().split("\n") if l.strip()]
        if len(lines) < 2:
            continue
        q, a = lines[0], lines[-1]
        if q.startswith("This is *not*"):
            q = "matchmaking"
            d["form_gender_target"] = "men" if "right woman" in p else "women" if "right man" in p else None
        d[q] = a
    return {"form": "ad_application", "age_band": d.get("How old are you?"), "since_relationship": d.get("How long has it been since your last serious relationship?"),
            "challenge": d.get("What is the #1 challenge you have right now when it comes to dating?"), "work": d.get("What do you do for work?"),
            "hours": d.get("How many hours per week do you work?"), "matchmaking": d.get("matchmaking"), "form_gender_target": d.get("form_gender_target")}


def parse_calendly(t):
    g = lambda q: (re.search(re.escape(q) + r"[^:\n]*:\s*(.*)", t) or [None, None])[1]
    inv = (g("Are you able to invest") or "").lower()
    age = g("How old are you?")
    try:
        a = int(re.sub(r"\D", "", age or "")[:2])
        band = "60+" if a >= 60 else f"{a // 5 * 5}–{a // 5 * 5 + 4}" if a >= 30 else "Under 30"
    except ValueError:
        band = None
    loc = g("Where do you live?") or ""
    STATES = {"alabama": "AL", "alaska": "AK", "arizona": "AZ", "arkansas": "AR", "california": "CA", "colorado": "CO", "connecticut": "CT", "delaware": "DE", "florida": "FL", "georgia": "GA", "hawaii": "HI", "idaho": "ID", "illinois": "IL", "indiana": "IN", "iowa": "IA", "kansas": "KS", "kentucky": "KY", "louisiana": "LA", "maine": "ME", "maryland": "MD", "massachusetts": "MA", "michigan": "MI", "minnesota": "MN", "mississippi": "MS", "missouri": "MO", "montana": "MT", "nebraska": "NE", "nevada": "NV", "new hampshire": "NH", "new jersey": "NJ", "new mexico": "NM", "new york": "NY", "north carolina": "NC", "north dakota": "ND", "ohio": "OH", "oklahoma": "OK", "oregon": "OR", "pennsylvania": "PA", "rhode island": "RI", "south carolina": "SC", "south dakota": "SD", "tennessee": "TN", "texas": "TX", "utah": "UT", "vermont": "VT", "virginia": "VA", "washington": "WA", "west virginia": "WV", "wisconsin": "WI", "wyoming": "WY"}
    st_ = next((v for k, v in STATES.items() if k in loc.lower()), None) or (re.search(r"\b([A-Z]{2})\b", loc) or [None, None])[1]
    if not st_ and re.search(r"canada|ontario|alberta|british columbia|toronto|vancouver|calgary", loc, re.I):
        st_ = "Canada"
    if not st_ and re.search(r"uk|england|london|australia|ireland|germany|netherlands", loc, re.I):
        st_ = "Outside US/Canada"
    return {"form": "booking_questions", "age_band": band, "work": g("What do you do for work?"), "challenge": g("What are your top dating challenges"),
            "goals": g("What would you like to get out of coaching"), "invest": "yes" if inv.startswith("yes") else "no" if inv.startswith("no") else None,
            "heard": (g("How did you hear") or "").strip().lower() or None, "start": (g("how soon are you willing") or "").strip().lower() or None, "region": st_,
            "anything_else": g("What else should I know about you?")}


apps = {}
for x in sorted(notes, key=lambda x: x["date_created"]):
    t = x.get("note") or ""
    if "### How old are you?" in t:
        rec = parse_typeform(t)
    elif "Where do you live?" in t and "Are you able to invest" in t:
        rec = parse_calendly(t)
    else:
        continue
    rec["date"] = x["date_created"][:10]
    a = apps.setdefault(x["lead_id"], {})
    for k, v in rec.items():                      # keep both forms' answers, first non-empty wins
        if v and not a.get(k):
            a[k] = v
    a.setdefault("forms", set()).add(rec["form"])
for a in apps.values():
    a["forms"] = sorted(a["forms"])
json.dump(apps, open(os.path.join(ROOT, f"data/{OFFER}/raw/applications.json"), "w"), indent=0)
print("applications", len(apps), C.Counter(f for a in apps.values() for f in a["forms"]))

# ---------------------------------------------------------------- per-lead rows for applicants (joined with outcomes)
DQ = lambda lid: any(e.get("Call Outcome") == "Disqualified" for e in eoc_by_lead.get(lid, []))
lr = {}
for lid in apps:
    l = lead_by_id.get(lid)
    if not l:
        continue
    r = lead_row(l)
    I = inv_by_lead.get(lid, [])
    r.update({"dq": DQ(lid), "team_cancelled": any(i["status"] == "canceled" and i.get("canceled_by") == "host" and not i.get("rescheduled") for i in I),
              "emails": sorted(em(l))})
    lr[lid] = r
json.dump(lr, open(os.path.join(ROOT, f"data/{OFFER}/raw/lead_rows.json"), "w"))
print("lead rows", len(lr))

# ---------------------------------------------------------------- setter time audit (what Close can see) + weekly scorecard
lead_src = {l["id"]: src(l) for l in leads}
lead_outcome = {}
for l in leads:
    E = eoc_by_lead.get(l["id"], [])
    lead_outcome[l["id"]] = {"booked": bool(inv_by_lead.get(l["id"])) or bool(E), "showed": any(HELD(e) for e in E), "closed": any(CLOSED(e) for e in E), "cash": paid_by_lead[l["id"]]}
acts = []
for c in calls:
    t = P(c["date_created"]).astimezone(ET)
    acts.append({"user": rep(c.get("user_name")), "kind": "call", "dir": c.get("direction"), "dur": c.get("duration") or 0, "t": t, "lead": c.get("lead_id")})
for m in sms:
    t = P(m["date_created"]).astimezone(ET)
    acts.append({"user": rep(m.get("user_name")), "kind": "sms", "dir": m.get("direction"), "dur": 0, "t": t, "lead": m.get("lead_id")})
SEC_PER_SMS, SEC_PER_DIAL = 60, 30   # stated assumptions for time not captured as talk time
time_out = {"assumptions": {"minutes_per_text_sent": SEC_PER_SMS / 60, "seconds_per_unanswered_dial": SEC_PER_DIAL}, "users": []}
for u in sorted({a["user"] for a in acts if a["dir"] == "outbound"}):
    A = [a for a in acts if a["user"] == u and a["dir"] == "outbound"]
    if len(A) < 30:
        continue
    days = C.defaultdict(list)
    for a in A:
        days[a["t"].date()].append(a["t"])
    spans = [(max(v) - min(v)).total_seconds() / 3600 for v in days.values() if len(v) > 1]
    starts = [min(v).hour + min(v).minute / 60 for v in days.values()]
    ends = [max(v).hour + max(v).minute / 60 for v in days.values()]
    talk = sum(a["dur"] for a in A if a["kind"] == "call") / 60
    est = talk + sum(1 for a in A if a["kind"] == "sms") * SEC_PER_SMS / 60 + sum(1 for a in A if a["kind"] == "call" and a["dur"] < 10) * SEC_PER_DIAL / 60
    by_src = []
    for s in sorted({lead_src.get(a["lead"], "Unknown") for a in A}):
        As = [a for a in A if lead_src.get(a["lead"], "Unknown") == s]
        ls = {a["lead"] for a in As if a["lead"]}
        o = [lead_outcome[x] for x in ls if x in lead_outcome]
        mins_ = sum(a["dur"] for a in As if a["kind"] == "call") / 60 + sum(1 for a in As if a["kind"] == "sms") * SEC_PER_SMS / 60 + sum(1 for a in As if a["kind"] == "call" and a["dur"] < 10) * SEC_PER_DIAL / 60
        by_src.append({"key": s, "touches": len(As), "leads": len(ls), "est_minutes": round(mins_), "booked": sum(x["booked"] for x in o), "showed": sum(x["showed"] for x in o),
                       "closed": sum(x["closed"] for x in o), "cash": round(sum(x["cash"] for x in o))})
    heat_ = [[sum(1 for a in A if a["t"].weekday() == d and a["t"].hour == h) for h in range(24)] for d in range(7)]
    by_month = []
    for mo in sorted({a["t"].strftime("%Y-%m") for a in A}):
        Am = [a for a in A if a["t"].strftime("%Y-%m") == mo]
        by_month.append({"key": mo, "days": len({a["t"].date() for a in Am}), "dials": sum(1 for a in Am if a["kind"] == "call"), "texts": sum(1 for a in Am if a["kind"] == "sms"),
                         "talk_min": round(sum(a["dur"] for a in Am if a["kind"] == "call") / 60)})
    e = [r for r in eod if rep(r.get("Setter Name")) == u]
    eodsum = {k: sum((r.get(k) or 0) for r in e) for k in ["New Inbound IG Leads", "Follow Ups / Re-Engagements", "Follow Up / Re-Engagement Replies", "Meetings Asked", "Calendar Calls Booked", "Live Calls Booked", "Outbound Dials", "Talk Time (Minutes)"]}
    time_out["users"].append({"key": u, "days_active": len(days), "median_span_hrs": med(spans), "median_start": med(starts), "median_end": med(ends),
                              "dials": sum(1 for a in A if a["kind"] == "call"), "texts": sum(1 for a in A if a["kind"] == "sms"), "talk_min": round(talk),
                              "est_hours": round(est / 60, 1), "est_hours_per_day": round(est / 60 / max(1, len(days)), 1), "by_source": by_src, "heat": heat_,
                              "by_month": by_month, "eod": {"reports": len(e), **eodsum}})

def wk(d):
    return (d - timedelta(days=d.weekday())).strftime("%Y-%m-%d")
weeks = sorted({wk(P(l["date_created"]).astimezone(ET)) for l in leads if l["date_created"] >= SINCE})[-12:]
sc = []
for w in weeks:
    R = [r for r in rows if r["week"] == w]
    t = sorted(r["mins"] for r in R if r["mins"] is not None)
    Ew = [e for e in eoc if e.get("Date of Call") and wk(datetime.fromisoformat(e["Date of Call"])) == w]
    held = sum(1 for e in Ew if HELD(e)); ns = sum(1 for e in Ew if e.get("Call Outcome") == "No Show")
    Iw = [i for i in inv if i.get("start") and wk(P(i["start"]).astimezone(ET)) == w]
    Pw = [p for p in pay if p.get("Date") and wk(datetime.fromisoformat(p["Date"])) == w]
    inb = [m for m in msgs if m["direction"] == "inbound" and wk(m["t"].astimezone(ET)) == w]
    sc.append({"week": w, "leads": len(R), "in5_pct": pct(sum(1 for x in t if x <= 5), len(R)), "median_first_touch": med(t),
               "never_contacted_pct": pct(sum(1 for r in R if r["mins"] is None), len(R)), "booked": sum(r["booked"] for r in R),
               "calls_held": held, "show_rate": pct(held, held + ns), "full_closes": sum(1 for e in Ew if CLOSED(e)),
               "deposits": sum(1 for e in Ew if e.get("Payment Type") == "Deposit"), "cash": round(sum(p.get("Amount") or 0 for p in Pw)),
               "team_cancels": sum(1 for i in Iw if i["status"] == "canceled" and i.get("canceled_by") == "host" and not i.get("rescheduled")),
               "eoc_with_recording_pct": pct(sum(1 for e in Ew if re.search(r"fathom|zoom|drive", str(e.get("Fathom Share Link") or ""))), len(Ew)),
               "eoc_reports": len(Ew), "lead_texts_in": len(inb)})
ops_extra = {"setter_time": time_out, "scorecard": sc}
json.dump(ops_extra, open(os.path.join(ROOT, f"data/{OFFER}/raw/ops_extra.json"), "w"), default=str)
print("setter time users", [(u["key"], u["est_hours"], u["days_active"]) for u in time_out["users"]], "weeks", len(sc))

# ---------------------------------------------------------------- opportunities: stuck deals, no-show/cancel recovery, coverage, commission
def alias(n):
    w = [x for x in str(n or "").split() if x[:1].isalpha()]
    return ".".join(x[0].upper() for x in w[:2]) + "." if w else "?"
def touches_after(lid, t0, days):
    return [a for a in acts_by_lead.get(lid, []) if a[2].get("direction") == "outbound" and t0 <= a[1] <= t0 + timedelta(days=days)]
def later_eocs(lid, d0):
    return [e for e in eoc_by_lead.get(lid, []) if (e.get("Date of Call") or "") > d0]
stuck = []
for e in eoc:
    if e.get("Call Outcome") not in ("Offer Made", "No Pitch - 2 Call Close", "Lost") or not e.get("Date of Call"):
        continue
    lid = email_to_lead.get(str(e.get("Lead Email") or "").lower().strip())
    d0 = e["Date of Call"]; t0 = datetime.fromisoformat(d0).replace(tzinfo=ET)
    later = later_eocs(lid, d0) if lid else []
    closed_later = any(CLOSED(x) or x.get("Payment Type") in ("Deposit", "Instalment Paid") for x in later) or (lid and paid_by_lead[lid] > 0)
    A = [a for a in acts_by_lead.get(lid, []) if a[1] > t0] if lid else []
    last_out = max((a[1] for a in A if a[2].get("direction") == "outbound"), default=None)
    last_in = max((a[1] for a in A if a[2].get("direction") == "inbound"), default=None)
    fu = e.get("Follow Up Date")
    stuck.append({"alias": alias(e.get("Lead Full Name")), "date": d0, "closer": rep(e.get("Closer Name")), "outcome": e.get("Call Outcome"),
                  "followup_set": e.get("Was a Follow Up Set?"), "followup_date": fu, "followup_overdue": bool(fu and fu < NOW.date().isoformat() and not later),
                  "later_calls": len(later), "paid_later": bool(closed_later), "touches_7d": len(touches_after(lid, t0, 7)) if lid else 0,
                  "days_since": (NOW.date() - datetime.fromisoformat(d0).date()).days,
                  "last_touch_days": (NOW - last_out).days if last_out else None, "lead_replied_after": bool(last_in),
                  "reason": (str(e.get("No Close Reason(s) / Objection(s) Faced") or e.get("Lost Reason") or "")[:220]), "lead_id": lid})
recov = []
for e in eoc:
    if e.get("Call Outcome") not in ("No Show", "Cancelled") or (e.get("Date of Call") or "") < SINCE:
        continue
    lid = email_to_lead.get(str(e.get("Lead Email") or "").lower().strip())
    d0 = e["Date of Call"]; t0 = datetime.fromisoformat(d0).replace(tzinfo=ET)
    later = later_eocs(lid, d0) if lid else []
    recov.append({"outcome": e.get("Call Outcome"), "type": e.get("No Show Type") or e.get("Cancellation Type"), "date": d0, "closer": rep(e.get("Closer Name")),
                  "touched_24h": bool(lid and touches_after(lid, t0, 1)), "touched_72h": bool(lid and touches_after(lid, t0, 3)), "touches_7d": len(touches_after(lid, t0, 7)) if lid else 0,
                  "rebooked": bool(later), "held_later": any(HELD(x) for x in later), "closed_later": any(CLOSED(x) for x in later),
                  "reason": str(e.get("Cancellation Reason") or e.get("Post Call Notes") or "")[:200], "matched": bool(lid)})
# coverage: lead arrivals vs any outbound team activity, hour x weekday (Eastern), since SINCE
arr = [[0] * 24 for _ in range(7)]; act = [[0] * 24 for _ in range(7)]
for l in leads:
    if l["date_created"] >= SINCE:
        t = P(l["date_created"]).astimezone(ET); arr[t.weekday()][t.hour] += 1
for a in acts:
    if a["dir"] == "outbound" and a["t"].date().isoformat() >= SINCE:
        act[a["t"].weekday()][a["t"].hour] += 1
ndays = max(1, (NOW.date() - datetime.fromisoformat(SINCE).date()).days / 7)
uncovered = [(d, h) for d in range(7) for h in range(24) if act[d][h] / ndays < 1]
cov = {"arrivals": arr, "activity": act, "weeks": round(ndays, 1),
       "leads_in_uncovered": sum(arr[d][h] for d, h in uncovered), "leads_total": sum(map(sum, arr)),
       "uncovered_windows": [{"day": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][d], "hour": h, "leads": arr[d][h]} for d, h in uncovered if arr[d][h]]}
# commission check
refunds_ = refunds
deps = [e for e in eoc if e.get("Payment Type") == "Deposit"]
dep_rows = []
for e in deps:
    lid = email_to_lead.get(str(e.get("Lead Email") or "").lower().strip())
    later = later_eocs(lid, e.get("Date of Call") or "") if lid else []
    dep_rows.append({"alias": alias(e.get("Lead Full Name")), "date": e.get("Date of Call"), "closer": rep(e.get("Closer Name")), "cash": e.get("Cash Collected"),
                     "commission": e.get("Closer Comms"), "became_deal": any(CLOSED(x) or x.get("Payment Type") == "Instalment Paid" for x in later) or (lid and paid_by_lead[lid] > (e.get("Cash Collected") or 0))})
rs = AT("Rep Scorecard")
counted = [{"rep": rep(r.get("Rep Name")), "deals_counted": r.get("Closer: Deals Closed"), "cash": r.get("Closer: Cash Collected")} for r in rs if r.get("Reporting Period") == "All Time" and r.get("Closer: Deals Closed")]
for c in counted:
    full = [e for e in eoc if rep(e.get("Closer Name")) == c["rep"] and CLOSED(e)]
    c["full_closes"] = len(full); c["deposits"] = sum(1 for e in eoc if rep(e.get("Closer Name")) == c["rep"] and e.get("Payment Type") == "Deposit")
    c["instalments"] = sum(1 for e in eoc if rep(e.get("Closer Name")) == c["rep"] and e.get("Payment Type") == "Instalment Paid")
comm = {"payments": len(pay), "closer_rate": med([(p.get("Closer Commission") or 0) / p["Amount"] for p in pay if p.get("Amount")]),
        "setter_rate": med([(p.get("Setter Commission") or 0) / p["Amount"] for p in pay if p.get("Amount") and p.get("Setter Commission")]),
        "closer_total": round(sum(p.get("Closer Commission") or 0 for p in pay)), "setter_total": round(sum(p.get("Setter Commission") or 0 for p in pay)),
        "on_recurring": round(sum(p.get("Closer Commission") or 0 for p in pay if p.get("Payment Type") == "Recurring")),
        "deposits": dep_rows, "deposit_commission_no_deal": round(sum(float(r["commission"] or 0) for r in dep_rows if not r["became_deal"])),
        "refunds": [{"amount": r.get("Amount"), "closer_clawback": r.get("Closer Clawback"), "setter_clawback": r.get("Setter Clawback")} for r in refunds_],
        "deals_counted": counted}
ops_extra.update({"stuck": sorted(stuck, key=lambda r: r["date"], reverse=True), "recovery": recov, "coverage": cov, "commission": comm})
json.dump(ops_extra, open(os.path.join(ROOT, f"data/{OFFER}/raw/ops_extra.json"), "w"), default=str)
print("stuck", len(stuck), sum(1 for s in stuck if not s["paid_later"]), "recovery", len(recov), "uncovered leads", cov["leads_in_uncovered"], "/", cov["leads_total"], "deals counted", counted)

# ---------------------------------------------------------------- recoverable money: overdue instalments + ranked call list
def short_name(n):
    w = [x for x in str(n or "").replace(",", " ").split() if x[:1].isalpha()]
    return (w[0].capitalize() + (" " + w[-1][0].upper() + "." if len(w) > 1 else "")) if w else "Unknown"
GRACE = 3
sched = []
for e in eoc:
    if not CLOSED(e):
        continue
    em_ = str(e.get("Lead Email") or "").lower().strip()
    d0 = e.get("Date of Call") or ""
    plan = [(n, e.get(f"Date of {n} Instalment"), float(e.get(f"{n} Instalment Amount") or 0)) for n in ("2nd", "3rd", "4th", "5th", "6th")]
    plan = [p for p in plan if p[1] and p[2]]
    if not plan:
        continue
    pays = sorted((p.get("Date") or "", float(p.get("Amount") or 0)) for p in pay if str(p.get("Email") or "").lower().strip() == em_ and (p.get("Date") or "") > d0)
    received = sum(a for _, a in pays)
    due = [p for p in plan if (datetime.fromisoformat(p[1]).date() + timedelta(days=GRACE)) <= NOW.date()]
    expected = sum(a for _, _, a in due)
    upcoming = [p for p in plan if p not in due]
    lid = email_to_lead.get(em_)
    sched.append({"name": short_name(e.get("Lead Full Name")), "closer": rep(e.get("Closer Name")), "sold": d0, "contract": e.get("Contract Value"),
                  "cash_at_close": e.get("Cash Collected"), "plan": [{"n": n, "due": d, "amount": a} for n, d, a in plan],
                  "due_so_far": round(expected), "received_after_close": round(received), "payments_after_close": len(pays),
                  "short": round(max(0, expected - received)), "next_due": upcoming[0][1] if upcoming else None,
                  "next_amount": upcoming[0][2] if upcoming else None, "lead_status": (lead_by_id.get(lid) or {}).get("status_label") if lid else None})
overdue = sorted([s for s in sched if s["short"] > 0], key=lambda s: -s["short"])
# every new deal sold for more than it collected on the day: balance still owed, from contract value vs all money logged
balances = []
for e in eoc:
    if not CLOSED(e):
        continue
    cv, c0 = float(e.get("Contract Value") or 0), float(e.get("Cash Collected") or 0)
    if cv <= c0 + 1:
        continue
    em_ = str(e.get("Lead Email") or "").lower().strip(); d0 = e.get("Date of Call") or ""
    pays = sorted((p.get("Date") or "", float(p.get("Amount") or 0)) for p in pay if str(p.get("Email") or "").lower().strip() == em_ and (p.get("Date") or "") > d0)
    later_eoc_cash = sum(float(x.get("Cash Collected") or 0) for x in eoc if str(x.get("Lead Email") or "").lower().strip() == em_ and (x.get("Date of Call") or "") > d0 and x.get("Call Outcome") == "Closed")
    got = c0 + max(sum(a for _, a in pays), later_eoc_cash)
    last = max([d0] + [d for d, _ in pays] + [x.get("Date of Call") or "" for x in eoc if str(x.get("Lead Email") or "").lower().strip() == em_ and x.get("Call Outcome") == "Closed"])
    days_quiet = (NOW.date() - datetime.fromisoformat(last).date()).days if last else None
    lid = email_to_lead.get(em_)
    balances.append({"name": short_name(e.get("Lead Full Name")), "closer": rep(e.get("Closer Name")), "sold": d0, "contract": round(cv), "collected": round(got),
                     "balance": round(max(0, cv - got)), "last_payment": last, "days_since_payment": days_quiet,
                     "late": bool(days_quiet is not None and days_quiet > 35 and cv - got > 1),
                     "dated_schedule": any(e.get(f"Date of {n} Instalment") for n in ("2nd", "3rd")),
                     "lead_status": (lead_by_id.get(lid) or {}).get("status_label") if lid else None})
balances.sort(key=lambda b: (not b["late"], -b["balance"]))
inst_tbl = [t for t in tabs if "Instalment Records" in t["name"]]
inst_rows = len(json.load(open(f"{X}/airtable/rec_{inst_tbl[0]['id']}.json"))) if inst_tbl else None

# empirical chance that a lead in each situation later becomes a new deal (all EOC history, not just since SINCE)
def later_new_close(e):
    lid = email_to_lead.get(str(e.get("Lead Email") or "").lower().strip())
    return bool(lid) and any(CLOSED(x) for x in later_eocs(lid, e.get("Date of Call") or ""))
def kind(e):
    o = e.get("Call Outcome")
    return o + (" (" + str(e.get("Cancellation Type") or e.get("No Show Type") or "") + ")" if o in ("Cancelled", "No Show") and (e.get("Cancellation Type") or e.get("No Show Type")) else "")
pool = [e for e in eoc if e.get("Call Outcome") in ("Offer Made", "No Pitch - 2 Call Close", "Lost", "No Show", "Cancelled") and (e.get("Date of Call") or "") < (NOW - timedelta(days=21)).date().isoformat()]
base = C.defaultdict(lambda: [0, 0])
for e in pool:
    k = e.get("Call Outcome"); base[k][0] += 1; base[k][1] += later_new_close(e)
prob = {k: (v[1] / v[0] if v[0] >= 5 else None) for k, v in base.items()}
new_deals = [e for e in eoc if CLOSED(e)]
aov = round(st.mean([float(e.get("Contract Value") or e.get("Cash Collected") or 0) for e in new_deals])) if new_deals else 0
calls_list = []
for e in eoc:
    o = e.get("Call Outcome"); d0 = e.get("Date of Call") or ""
    if o not in ("Offer Made", "No Pitch - 2 Call Close", "Lost", "No Show", "Cancelled") or d0 < SINCE:
        continue
    lid = email_to_lead.get(str(e.get("Lead Email") or "").lower().strip())
    later = later_eocs(lid, d0) if lid else []
    if any(CLOSED(x) or x.get("Payment Type") == "Deposit" for x in later) or any(x.get("Call Outcome") not in ("No Show", "Cancelled") for x in later):
        continue                                                       # already rebooked and seen, or already bought
    if lid and paid_by_lead[lid] > 0:
        continue
    st_ = (lead_by_id.get(lid) or {}).get("status_label") if lid else None
    if st_ and re.search(r"\b(DQ|NGMI|Disqual|Client|Signed|Do Not)\b", st_, re.I):
        continue
    t0 = datetime.fromisoformat(d0).replace(tzinfo=ET)
    A = [a for a in acts_by_lead.get(lid, []) if a[1] > t0] if lid else []
    last_out = max((a[1] for a in A if a[2].get("direction") == "outbound"), default=None)
    last_in = max((a[1] for a in A if a[2].get("direction") == "inbound"), default=None)
    days = (NOW.date() - datetime.fromisoformat(d0).date()).days
    p = prob.get(o)
    pts = {"Offer Made": 40, "No Pitch - 2 Call Close": 35, "No Show": 20, "Cancelled": 20, "Lost": 10}[o]
    pts += 25 if days <= 14 else 15 if days <= 30 else 5 if days <= 60 else 0
    pts += 15 if last_in else 0
    pts += 10 if (last_out is None or (NOW - last_out).days >= 7) else 0
    pts += 10 if (e.get("Follow Up Date") and e["Follow Up Date"] < NOW.date().isoformat()) else 0
    calls_list.append({"name": short_name(e.get("Lead Full Name")), "outcome": kind(e), "date": d0, "days_ago": days, "closer": rep(e.get("Closer Name")),
                       "setter": rep(e.get("Setter Name")) if e.get("Setter Name") else None, "lead_status": st_,
                       "last_touch_days": max(0, (NOW - last_out).days) if last_out else None, "replied_since": bool(last_in),
                       "followup_date": e.get("Follow Up Date"), "objection": str(e.get("No Close Reason(s) / Objection(s) Faced") or e.get("Cancellation Reason") or e.get("Lost Reason") or e.get("Post Call Notes") or "")[:240],
                       "offer_value": float(e.get("Contract Value") or 0) or None, "value_at_stake": round(float(e.get("Contract Value") or 0) or aov) if o in ("Offer Made", "No Pitch - 2 Call Close") else 0, "chance": round(p, 3) if p is not None else None,
                       "expected": round((p or 0) * float(e.get("Contract Value") or aov)), "points": pts})
calls_list.sort(key=lambda r: (-r["points"], -r["value_at_stake"], r["days_ago"]))
for i, r in enumerate(calls_list):
    r["rank"] = i + 1
recover = {"as_of": NOW.date().isoformat(), "grace_days": GRACE, "overdue": overdue, "balances": balances,
           "balance_total": sum(b["balance"] for b in balances), "late_total": sum(b["balance"] for b in balances if b["late"]),
           "plans_with_dates": sum(1 for b in balances if b["dated_schedule"]), "open_offer_value": round(sum(r["value_at_stake"] for r in calls_list)), "schedule": sched, "instalment_records_rows": inst_rows,
           "overdue_total": sum(s["short"] for s in overdue), "upcoming_30d": round(sum(s["next_amount"] or 0 for s in sched if s["next_due"] and s["next_due"] <= (NOW + timedelta(days=30)).date().isoformat())),
           "call_list": calls_list, "chance_by_outcome": {k: {"n": v[0], "later_new_deal": v[1], "rate": prob[k]} for k, v in base.items()},
           "aov": aov, "expected_total": sum(r["expected"] for r in calls_list)}
json.dump(recover, open(os.path.join(ROOT, f"data/{OFFER}/raw/recover.json"), "w"), default=str)
print("recover: balances", len(balances), recover["balance_total"], "late", recover["late_total"], "dated", recover["plans_with_dates"], "open offers $", recover["open_offer_value"], "| overdue", len(overdue), recover["overdue_total"], "plans", len(sched), "call list", len(calls_list), "expected", recover["expected_total"], "chance", recover["chance_by_outcome"])
