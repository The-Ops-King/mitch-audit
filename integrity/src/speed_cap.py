#!/usr/bin/env python3
"""Speed-to-lead and closer capacity, in dollars. Usage: OFFER=krc python3 src/speed_cap.py <scratch_dir>"""
import json, os, sys, glob, collections as C, datetime as DT
from zoneinfo import ZoneInfo
OFFER = os.environ.get("OFFER", "krc"); X = sys.argv[1]
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); D = f"{ROOT}/data/{OFFER}"
ET = ZoneInfo("America/New_York")
ops = json.load(open(f"{D}/raw/ops.json")); rec = json.load(open(f"{D}/raw/recover.json"))
L = ops["leads"]; B = {b["key"]: b for b in L["speed_buckets"]}
aov = rec.get("aov") or 0
never = B.get("Never") or {}
contacted = [b for k, b in B.items() if k != "Never"]
c_leads = sum(b["leads"] for b in contacted); c_book = sum(b["booked"] for b in contacted); c_show = sum(b["showed"] for b in contacted); c_close = sum(b["closed"] for b in contacted)
deal_rate_contacted = c_close / c_leads if c_leads else 0
lift_deals = max(0, deal_rate_contacted - (never.get("closed", 0) / never["leads"] if never.get("leads") else 0)) * never.get("leads", 0)
weeks = max(1, (DT.date.fromisoformat(ops["generated"][:10]) - DT.date(2026, 9, 1)).days / 7)
speed = {"buckets": L["speed_buckets"], "aov": aov, "weeks": round(weeks, 1),
         "contacted": {"leads": c_leads, "booked": c_book, "showed": c_show, "new_deals": c_close},
         "never": {"leads": never.get("leads", 0), "booked": never.get("booked", 0), "showed": never.get("showed", 0), "new_deals": never.get("closed", 0)},
         "lift_deals": round(lift_deals, 1), "lift_value": round(lift_deals * aov), "lift_value_per_month": round(lift_deals * aov / weeks * 4.33)}
cap = None
ev_p = f"{X}/calendly/events.json"
if os.path.exists(ev_p) and json.load(open(ev_p)):
    ev = json.load(open(ev_p)); snap = ops["generated"]
    act = [e for e in ev if e["status"] == "active" and e["start_time"] < snap and "Kickoff" not in e["name"]]
    ALIAS = {"Jeremy Makena": "Makena Waterhouse"}
    host = lambda e: ALIAS.get((e.get("event_memberships") or [{}])[0].get("user_name") or "Unknown", (e.get("event_memberships") or [{}])[0].get("user_name") or "Unknown")
    loc = lambda e: DT.datetime.fromisoformat(e["start_time"].replace("Z", "+00:00")).astimezone(ET)
    wk = C.Counter((host(e), loc(e).strftime("%G-W%V")) for e in act); day = C.Counter((host(e), loc(e).date()) for e in act)
    hosts = []
    for h in sorted({k[0] for k in wk}):
        w = [n for (hh, _), n in wk.items() if hh == h]; d = [n for (hh, _), n in day.items() if hh == h]
        hosts.append({"host": h, "weeks_active": len(w), "avg_per_week": round(sum(w) / len(w), 1), "max_week": max(w), "max_day": max(d)})
    inv = json.load(open(f"{X}/calendly/invitees.json"))
    leads = json.load(open(f"{X}/close/leads.json")); leads = leads.get("data", leads) if isinstance(leads, dict) else leads
    em = lambda l: {e["email"].lower().strip() for c in l.get("contacts", []) for e in c.get("emails", [])}
    e2l = {e: l for l in leads for e in em(l)}
    meta = json.load(open(f"{D}/raw/setter_call_meta.json")) if os.path.exists(f"{D}/raw/setter_call_meta.json") else {}
    had_call = {meta.get(json.load(open(f))["call_id"], {}).get("lead_id") for f in glob.glob(f"{D}/setter_calls/*.json")}
    hc = [i for i in inv if "DCB" in str(i.get("event")) and i.get("status") != "active" and i.get("canceled_by") == "host"]
    st = C.Counter(); no_conv = 0; bought = 0; reasons = 0
    for i in hc:
        l = e2l.get((i.get("email") or "").lower()) or {}
        s = l.get("status_label") or "Not in Close"; st[s] += 1
        no_conv += l.get("id") not in had_call
        bought += bool(s.startswith("Signed Up") or s == "Deposit Paid")
        reasons += bool((i.get("reason") or "").strip())
    cap = {"hosts": hosts, "direct_bookings": sum(1 for i in inv if "DCB" in str(i.get("event"))), "host_cancelled": len(hc),
           "cancel_status_now": st.most_common(), "cancelled_without_recorded_call": no_conv, "cancelled_then_bought": bought, "cancel_with_reason": reasons}
json.dump({"speed": speed, "capacity": cap}, open(f"{D}/raw/speed_cap.json", "w"))
print(OFFER, json.dumps(speed)[-260:], "\n", json.dumps(cap)[:700])
