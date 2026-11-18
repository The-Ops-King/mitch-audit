#!/usr/bin/env python3
"""Build web/data/<offer>.json from per-call and per-thread extractions.

Pure aggregation: no model calls. Everything public is pseudonymised here.
Usage: python3 src/build.py krc
"""
import json, glob, os, re, sys, collections as C
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import build_deep as BD
import hashlib
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFER = sys.argv[1] if len(sys.argv) > 1 else "krc"
D = f"{ROOT}/data/{OFFER}"
MIN_N = 5  # lift below this sample is shown greyed as insufficient

REP_ALIASES = {"Ellie Porter": "Elly Porter", "Mariah Malvezzi": "Mariah Casagrande-Malvezzi", "Jeremy Makena": "Makena Waterhouse", "Sidonie Chechin": "Sidonie C"}
WON = {"closed"}


def load(pattern):
    out = []
    for f in sorted(glob.glob(pattern)):
        try:
            out.append(json.load(open(f)))
        except Exception:
            pass
    return out


def pct(a, b):
    return round(100 * a / b) if b else None


def norm_rep(r):
    return REP_ALIASES.get(r, r) if r else "Unknown"


# ---------------------------------------------------------------- privacy
NAME_TOKENS = set()
STAFF = {"Kimberly", "Kim", "Rae", "Emily", "Wood", "Sidonie", "Sid", "Makena", "Waterhouse", "Brianna", "Patterson", "Elly", "Ellie",
         "Porter", "Mariah", "Casagrande", "Malvezzi", "Mitch", "Leah", "Jeremy", "Alexandra"}
STOP = {"Will", "Hope", "Grace", "Joy", "Faith", "Love", "May", "June", "April", "August", "Mark", "Bill", "Rose", "Summer", "Dawn",
        "Rich", "Art", "Sunny", "Sky", "Star", "King", "Young", "Brown", "White", "Black", "Green", "Gray", "Grey", "Price", "Long",
        "Hill", "Best", "Love", "Man", "Guy", "Lady", "Miss", "Mrs", "Mr", "The", "And", "Not", "You", "Your", "Yes", "Coach",
        "Dear", "Baby", "Honey", "Angel", "Ray", "Don", "Sir", "Lord", "God", "Christian", "Jesus", "Paris", "London", "Texas",
        "Florida", "Georgia", "Virginia", "Carolina", "Dakota", "Jersey", "York", "Austin", "Dallas", "Houston", "Phoenix", "Denver",
        "Chase", "Bank", "Apple", "Hinge", "Bumble", "Tinder", "Zoom", "Close", "Kajabi", "Fathom", "Calendly", "Instagram", "Facebook",
        "English", "Spanish", "French", "German", "Italian", "Mexican", "American", "Canadian", "Single", "Dating", "Coaching", "Program", "Call", "Team", "Lead", "Setter", "Closer", "Booking", "Paid", "Ads", "Unknown", "None"}


def collect_names(calls, threads):
    extra = f"{D}/raw/names.json"
    if os.path.exists(extra):
        NAME_TOKENS.update(n for n in json.load(open(extra)) if n[:1].isupper())
    for c in calls:
        p = c.get("prospect") or {}
        for k in ("first_name", "last_name"):
            v = (p.get(k) or "").strip()
            if len(v) >= 3:
                NAME_TOKENS.add(v)
    for t in threads:
        for v in (t.get("_lead_name") or "").split():
            if len(v) >= 3 and v[0].isupper():
                NAME_TOKENS.add(v)


EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.]+")
PHONE = re.compile(r"(?<![\d-])(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]\d{4}(?![\d-])")
DIGITS = re.compile(r"(?<![\d-])\d{3}-\d{2}-\d{4}(?![\d-])")


def scrub(s):
    if not isinstance(s, str):
        return s
    s = EMAIL.sub("[email]", s)
    s = DIGITS.sub("[number]", s)
    s = PHONE.sub("[phone]", s)
    if NAME_RX[0] is None:
        toks = sorted((n for n in NAME_TOKENS if n not in STAFF and n not in STOP and n[:1].isupper()), key=len, reverse=True)
        NAME_RX[0] = re.compile(r"\b(" + "|".join(map(re.escape, toks)) + r")\b") if toks else re.compile(r"(?!x)x")
    return NAME_RX[0].sub(lambda m: m.group(1)[0] + ".", s)


NAME_RX = [None]


def deep(o):
    if isinstance(o, str):
        return scrub(o)
    if isinstance(o, list):
        return [deep(x) for x in o]
    if isinstance(o, dict):
        return {k: deep(v) for k, v in o.items()}
    return o


# ---------------------------------------------------------------- closer
def crm_outcome(c):
    return (c.get("_crm") or {}).get("Call Outcome")


def closer_won(c):
    crm = c.get("_crm") or {}
    if crm.get("Call Outcome") == "Closed" and crm.get("Payment Type") not in ("Deposit", "Instalment Paid"):
        return True
    return False


def build_closer(calls, playbook):
    sales = [c for c in calls if c.get("type") == "sales"]
    for c in sales:
        c["rep"] = norm_rep(c.get("rep"))
        c["_won"] = closer_won(c)
        c["_period"] = "jun_aug" if (c.get("date") or "") < "2026-09-01" else "sep_nov"
    n = len(sales)
    won = [c for c in sales if c["_won"]]
    pitched = [c for c in sales if (c.get("offer") or {}).get("presented")]

    # adherence
    phases = []
    check_rows = []
    weight = {p["id"]: p["weight"] for p in playbook["phases"]}
    for ph in playbook["phases"]:
        cnt = C.Counter()
        for c in sales:
            sc = (((c.get("adherence") or {}).get("phases") or {}).get(ph["id"]) or {}).get("score")
            cnt[sc or "missing"] += 1
        app = cnt["hit"] + cnt["partial"] + cnt["miss"]
        phases.append({"id": ph["id"], "name": ph["name"], "weight": ph["weight"], "hit": cnt["hit"], "partial": cnt["partial"],
                       "miss": cnt["miss"], "na": cnt["not_applicable"], "adherence_pct": pct(cnt["hit"] + 0.5 * cnt["partial"], app)})
        for ck in ph["checks"]:
            cc = C.Counter()
            for c in sales:
                v = ((((c.get("adherence") or {}).get("phases") or {}).get(ph["id"]) or {}).get("checks") or {}).get(ck["id"])
                cc[v or "missing"] += 1
            a = cc["hit"] + cc["partial"] + cc["miss"]
            check_rows.append({"id": ck["id"], "phase": ph["name"], "text": ck["text"], "hit": cc["hit"], "partial": cc["partial"],
                               "miss": cc["miss"], "applicable": a, "run_pct": pct(cc["hit"] + 0.5 * cc["partial"], a)})

    def call_score(c):
        tot = got = 0
        for pid, ph in ((c.get("adherence") or {}).get("phases") or {}).items():
            s = ph.get("score")
            if s in ("hit", "partial", "miss"):
                tot += weight.get(pid, 0)
                got += weight.get(pid, 0) * {"hit": 1, "partial": 0.5, "miss": 0}[s]
        return round(100 * got / tot) if tot else None

    for c in sales:
        c["_score"] = call_score(c)

    least_run = sorted([r for r in check_rows if r["applicable"] >= 5], key=lambda r: r["run_pct"])[:12]

    # question lift: won vs not won, with call ids
    q_calls = C.defaultdict(set)
    for c in sales:
        for q in c.get("questions_asked") or []:
            q_calls[q.get("key")].add(c["call_id"])
    won_ids = {c["call_id"] for c in won}
    lost_ids = {c["call_id"] for c in sales if not c["_won"] and crm_outcome(c) not in (None,)}
    lift = []
    for k, ids in q_calls.items():
        w = len(ids & won_ids)
        l = len(ids & lost_ids)
        wp = w / len(won_ids) if won_ids else 0
        lp = l / len(lost_ids) if lost_ids else 0
        lift.append({"key": k, "won_pct": round(100 * wp), "not_won_pct": round(100 * lp), "gap": round(100 * (wp - lp)),
                     "n": w + l, "sufficient": (w + l) >= MIN_N and len(won_ids) >= MIN_N, "call_ids": sorted(ids)})
    lift.sort(key=lambda r: -r["gap"])

    # objections
    obj = C.defaultdict(lambda: {"n": 0, "resolved": 0, "when": C.Counter(), "tactics": C.Counter(), "call_ids": set()})
    for c in sales:
        for o in c.get("objections") or []:
            t = o.get("type") or "other"
            obj[t]["n"] += 1
            obj[t]["resolved"] += 1 if o.get("resolved") else 0
            obj[t]["when"][o.get("when_raised") or "unknown"] += 1
            obj[t]["tactics"][o.get("tactic") or "none"] += 1
            obj[t]["call_ids"].add(c["call_id"])
    objections = sorted([{"type": k, "n": v["n"], "resolved": v["resolved"], "resolved_pct": pct(v["resolved"], v["n"]),
                          "when": dict(v["when"]), "top_tactics": v["tactics"].most_common(4), "calls": len(v["call_ids"]),
                          "call_ids": sorted(v["call_ids"])} for k, v in obj.items()], key=lambda r: -r["n"])

    # offer consistency
    sanctioned = {(t["price_usd"], t["months"]) for t in playbook["sanctioned_offer"]}
    sanctioned_prices = {t["price_usd"] for t in playbook["sanctioned_offer"]}
    quoted = C.Counter()
    quoted_calls = C.defaultdict(set)
    off_sheet_calls = set()
    for c in sales:
        for t in (c.get("offer") or {}).get("tiers_quoted") or []:
            p = t.get("price_usd")
            if not p:
                continue
            quoted[p] += 1
            quoted_calls[p].add(c["call_id"])
            if p not in sanctioned_prices:
                off_sheet_calls.add(c["call_id"])
    offer = {
        "sanctioned": playbook["sanctioned_offer"],
        "prices_quoted": [{"price_usd": p, "times": n_, "calls": len(quoted_calls[p]), "sanctioned": p in sanctioned_prices,
                           "call_ids": sorted(quoted_calls[p])} for p, n_ in sorted(quoted.items())],
        "distinct_prices": len(quoted),
        "calls_with_off_sheet_price": len(off_sheet_calls),
        "calls_pitched": len(pitched),
        "price_before_temperature_check": sum(1 for c in pitched if (c.get("offer") or {}).get("price_before_temperature_check")),
        "one_tier_recommended": sum(1 for c in pitched if (c.get("offer") or {}).get("recommended_one_tier")),
        "all_tiers_dumped": sum(1 for c in pitched if (c.get("offer") or {}).get("all_tiers_dumped")),
        "payment_plan_offered": sum(1 for c in pitched if (c.get("offer") or {}).get("payment_plan_offered")),
        "outcome_promises": sum(1 for c in sales if (c.get("offer") or {}).get("outcome_promise_quote")),
        "outcome_promise_examples": [scrub(c["offer"]["outcome_promise_quote"])[:200] for c in sales
                                     if (c.get("offer") or {}).get("outcome_promise_quote")][:8],
    }

    # segments, pains, goals
    def by_outcome(items_key, cat_key="category"):
        rows = C.defaultdict(lambda: {"calls": set(), "won": set()})
        for c in sales:
            for it in c.get(items_key) or []:
                k = it.get(cat_key) or "other"
                rows[k]["calls"].add(c["call_id"])
                if c["_won"]:
                    rows[k]["won"].add(c["call_id"])
        return sorted([{"key": k, "calls": len(v["calls"]), "won": len(v["won"]), "close_pct": pct(len(v["won"]), len(v["calls"])),
                        "call_ids": sorted(v["calls"])} for k, v in rows.items()], key=lambda r: -r["calls"])

    seg = C.defaultdict(lambda: {"calls": [], "won": 0})
    for c in sales:
        k = (c.get("segment") or {}).get("assigned") or "other"
        seg[k]["calls"].append(c["call_id"])
        seg[k]["won"] += 1 if c["_won"] else 0
    segments = sorted([{"key": k, "calls": len(v["calls"]), "won": v["won"], "close_pct": pct(v["won"], len(v["calls"])),
                        "call_ids": v["calls"]} for k, v in seg.items()], key=lambda r: -r["calls"])
    genders = C.Counter((c.get("prospect") or {}).get("gender") or "unknown" for c in sales)

    # flags
    flags = []
    for c in sales:
        for f in c.get("flags") or []:
            flags.append({"call_id": c["call_id"], "rep": c["rep"], "period": c["_period"], "category": f.get("category"),
                          "severity": f.get("severity"), "summary": scrub(f.get("summary") or "")})
    by_cat = C.defaultdict(lambda: {"n": 0, "sev": C.Counter(), "calls": set(), "reps": set()})
    for f in flags:
        b = by_cat[f["category"]]
        b["n"] += 1
        b["sev"][f["severity"]] += 1
        b["calls"].add(f["call_id"])
        b["reps"].add(f["rep"])
    flag_cats = sorted([{"category": k, "n": v["n"], "severity": dict(v["sev"]), "calls": len(v["calls"]), "reps": sorted(v["reps"]),
                         "call_ids": sorted(v["calls"])} for k, v in by_cat.items()], key=lambda r: -r["n"])
    sev_rank = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    top_flags = sorted([f for f in flags if f["severity"] in ("critical", "high")], key=lambda f: sev_rank.get(f["severity"], 9))

    # reps
    reps = []
    for r in sorted({c["rep"] for c in sales}):
        rc = [c for c in sales if c["rep"] == r]
        sc = [c["_score"] for c in rc if c["_score"] is not None]
        reps.append({"rep": r, "calls": len(rc), "won": sum(1 for c in rc if c["_won"]), "close_pct": pct(sum(1 for c in rc if c["_won"]), len(rc)),
                     "avg_score": round(sum(sc) / len(sc)) if sc else None, "flags": sum(len(c.get("flags") or []) for c in rc),
                     "high_flags": sum(1 for c in rc for f in c.get("flags") or [] if f.get("severity") in ("critical", "high")),
                     "outcome_promises": sum(1 for c in rc if (c.get("offer") or {}).get("outcome_promise_quote")),
                     "off_sheet_price_calls": sum(1 for c in rc if c["call_id"] in off_sheet_calls),
                     "periods": sorted({c["_period"] for c in rc}), "call_ids": [c["call_id"] for c in rc]})

    # pillars
    pil = C.defaultdict(C.Counter)
    for c in sales:
        for p in c.get("pillars") or []:
            pil[p.get("pillar")][p.get("reaction")] += 1

    # CRM vs transcript
    mism = [f for f in flags if f["category"] == "data_integrity"]

    # calls layer (pseudonymised, no prospect story)
    calls_layer = []
    for c in sorted(sales, key=lambda c: c.get("date") or ""):
        p = c.get("prospect") or {}
        alias = (p.get("first_name") or "?")[:1].upper() + "." + ((p.get("last_name") or "")[:1].upper() + "." if p.get("last_name") else "")
        calls_layer.append({"call_id": c["call_id"], "date": c.get("date"), "rep": c["rep"], "source": c.get("source"),
                            "prospect": alias, "segment": (c.get("segment") or {}).get("assigned"),
                            "crm_outcome": crm_outcome(c), "won": c["_won"], "score": c["_score"],
                            "duration_min": c.get("duration_min"),
                            "flags": [{"category": f.get("category"), "severity": f.get("severity")} for f in c.get("flags") or []],
                            "coach_note": scrub(((c.get("adherence") or {}).get("coach_note") or ""))[:300]})

    scores = [c["_score"] for c in sales if c["_score"] is not None]
    return {
        "summary": {"calls": n, "won": len(won), "close_pct": pct(len(won), n), "pitched": len(pitched),
                    "avg_score": round(sum(scores) / len(scores)) if scores else None,
                    "by_source": dict(C.Counter(c.get("source") for c in sales)),
                    "by_period": dict(C.Counter(c["_period"] for c in sales)),
                    "won_score": round(sum(c["_score"] for c in won if c["_score"] is not None) / max(1, len(won))),
                    "not_won_score": round(sum(c["_score"] for c in sales if not c["_won"] and c["_score"] is not None) / max(1, n - len(won))),
                    "flags": len(flags), "high_or_critical_flags": len(top_flags)},
        "phases": phases, "least_run": least_run, "question_lift": lift, "objections": objections, "offer": offer,
        "segments": segments, "genders": dict(genders), "pains": by_outcome("pains"), "goals": by_outcome("goals"),
        "pillars": {k: dict(v) for k, v in pil.items()},
        "flag_categories": flag_cats, "top_flags": top_flags[:40], "data_mismatches": len(mism),
        "reps": reps, "calls": calls_layer,
    }


# ---------------------------------------------------------------- threads
STAGES = ["no_reply", "replied", "conversation", "qualified", "call_offered", "booked", "showed", "closed"]


def raw_outcome(r):
    """Outcome from CRM records only. An EOC is proof of a booking even when Calendly has no match
    (Calendly export is email-matched and incomplete), so booked = Calendly OR EOC."""
    eoc = r.get("eoc") or []
    booked = bool(r.get("calendly")) or bool(eoc)
    showed = any(e.get("outcome") not in ("No Show", "Cancelled", "Reschedule", None) for e in eoc)
    # a deposit is not a closed deal, so payments alone never count as a close
    closed = any(e.get("outcome") == "Closed" and e.get("payment_type") not in ("Deposit", "Instalment Paid") for e in eoc)
    return {"booked": booked, "showed": showed, "closed": closed}


def calendly_artifact(f):
    # extraction spec told agents to flag "chat says booked, no Calendly record"; superseded by raw_outcome
    return f.get("category") == "data_integrity" and "calendly" in (f.get("summary") or "").lower() and f.get("severity") in ("low", None)


def build_threads(threads, raw_threads):
    raw = {r["lead_id"]: r for r in raw_threads}
    for t in threads:
        r = raw.get(t["lead_id"])
        if r:
            t["outcome"] = raw_outcome(r)
            o = t["outcome"]; top = "closed" if o["closed"] else "showed" if o["showed"] else "booked" if o["booked"] else None
            if top and STAGES.index(top) > STAGES.index(t.get("stage_reached") or "no_reply"):
                t["stage_reached"] = top
        t["flags"] = [f for f in t.get("flags") or [] if not calendly_artifact(f)]
    have = {t["lead_id"] for t in threads}
    auto = []
    for r in raw_threads:
        if r["lead_id"] in have:
            continue
        outs = [m for m in r["messages"] if m["dir"] == "out"]
        o = raw_outcome(r)
        auto.append({"lead_id": r["lead_id"], "channel": "sms", "thread_type": "no_reply", "business_messages": len(outs),
                     "lead_messages": 0, "stage_reached": "closed" if o["closed"] else "showed" if o["showed"] else "booked" if o["booked"] else "no_reply",
                     "lead_engaged": False,
                     "drop_off": {"who_went_silent": "lead", "after_step": "first_outreach" if len(outs) <= 1 else "follow_up_nudge"},
                     "outcome": o, "flags": []})
    allt = threads + auto
    n = len(allt)
    stage = C.Counter(t.get("stage_reached") for t in allt)
    types = C.Counter(t.get("thread_type") for t in allt)
    drop = C.Counter((t.get("drop_off") or {}).get("after_step") for t in allt if (t.get("drop_off") or {}).get("who_went_silent") == "lead")
    biz_silent = sum(1 for t in allt if (t.get("drop_off") or {}).get("who_went_silent") == "business")
    by_type = []
    for k, v in types.most_common():
        tt = [t for t in allt if t.get("thread_type") == k]
        by_type.append({"type": k, "threads": v, "booked": sum(1 for t in tt if (t.get("outcome") or {}).get("booked")),
                        "showed": sum(1 for t in tt if (t.get("outcome") or {}).get("showed")),
                        "closed": sum(1 for t in tt if (t.get("outcome") or {}).get("closed"))})
    replies_needed = C.Counter(t.get("first_reply_after_n_business_messages") for t in threads if t.get("first_reply_after_n_business_messages"))
    flags = [{"lead_id": t["lead_id"], "category": f.get("category"), "severity": f.get("severity"), "summary": scrub(f.get("summary") or "")}
             for t in threads for f in t.get("flags") or []]
    objs = C.Counter(o.get("type") for t in threads for o in t.get("objections") or [])
    return {
        "summary": {"threads": n, "lead_replied": sum(1 for t in allt if t.get("lead_messages")),
                    "engaged": sum(1 for t in allt if t.get("lead_engaged")),
                    "booked": sum(1 for t in allt if (t.get("outcome") or {}).get("booked")),
                    "showed": sum(1 for t in allt if (t.get("outcome") or {}).get("showed")),
                    "closed": sum(1 for t in allt if (t.get("outcome") or {}).get("closed")),
                    "price_discussed": sum(1 for t in threads if t.get("price_discussed")),
                    "business_went_silent": biz_silent, "extracted": len(threads), "no_reply_auto": len(auto)},
        "stages": dict(stage), "types": by_type, "drop_off_after": dict(drop), "first_reply_after": dict(replies_needed),
        "objections": objs.most_common(), "flags": flags,
        "flag_categories": C.Counter(f["category"] for f in flags).most_common(),
    }


# ---------------------------------------------------------------- closer: deeper cuts + per-call library
def closer_deep(calls, playbook, coaching):
    sales = [c for c in calls if c.get("type") == "sales"]
    won = [c for c in sales if c["_won"]]
    lost = [c for c in sales if not c["_won"]]
    ph_of = {ck["id"]: ph["id"] for ph in playbook["phases"] for ck in ph["checks"]}
    ck_text = {ck["id"]: ck["text"] for ph in playbook["phases"] for ck in ph["checks"]}
    ph_name = {ph["id"]: ph["name"] for ph in playbook["phases"]}
    V = {"hit": 1, "partial": .5, "miss": 0}

    def ph_score(c, pid):
        return ((((c.get("adherence") or {}).get("phases") or {}).get(pid) or {}).get("score"))

    def ck_score(c, cid):
        return (((((c.get("adherence") or {}).get("phases") or {}).get(ph_of[cid]) or {}).get("checks") or {}).get(cid))

    def avg(xs):
        xs = [V[x] for x in xs if x in V]
        return round(100 * sum(xs) / len(xs)) if xs else None

    phase_gap = [{"id": ph["id"], "name": ph["name"], "weight": ph["weight"],
                  "won": avg([ph_score(c, ph["id"]) for c in won]), "not_won": avg([ph_score(c, ph["id"]) for c in lost])}
                 for ph in playbook["phases"]]
    for r in phase_gap:
        r["gap"] = (r["won"] or 0) - (r["not_won"] or 0)
    checks = []
    for cid in ph_of:
        sc = [ck_score(c, cid) for c in sales]
        app = [x for x in sc if x in V]
        miss_ids = [c["call_id"] for c in sales if ck_score(c, cid) == "miss"]
        checks.append({"id": cid, "phase": ph_of[cid], "phase_name": ph_name[ph_of[cid]], "text": ck_text[cid],
                       "applicable": len(app), "run_pct": avg(sc), "won_pct": avg([ck_score(c, cid) for c in won]),
                       "not_won_pct": avg([ck_score(c, cid) for c in lost]),
                       "missed": len(miss_ids), "missed_in_lost": sum(1 for c in lost if ck_score(c, cid) == "miss"),
                       "missed_ids": miss_ids})
    reps = sorted({c["rep"] for c in sales})
    rep_phase = [{"rep": r, "calls": sum(1 for c in sales if c["rep"] == r),
                  "phases": {ph["id"]: avg([ph_score(c, ph["id"]) for c in sales if c["rep"] == r]) for ph in playbook["phases"]}}
                 for r in reps]
    team_phase = {ph["id"]: avg([ph_score(c, ph["id"]) for c in sales]) for ph in playbook["phases"]}

    def bucket(m):
        return None if m is None else "<30 min" if m < 30 else "30–45 min" if m < 45 else "45–60 min" if m < 60 else "60–75 min" if m < 75 else "75+ min"
    length = []
    for b in ["<30 min", "30–45 min", "45–60 min", "60–75 min", "75+ min"]:
        cs = [c for c in sales if bucket(c.get("duration_min")) == b]
        length.append({"key": b, "calls": len(cs), "won": sum(c["_won"] for c in cs), "call_ids": [c["call_id"] for c in cs]})
    by_month = []
    for m in sorted({(c.get("date") or "")[:7] for c in sales if c.get("date")}):
        cs = [c for c in sales if (c.get("date") or "").startswith(m)]
        sc = [c["_score"] for c in cs if c["_score"] is not None]
        by_month.append({"key": m, "calls": len(cs), "won": sum(c["_won"] for c in cs), "avg_score": round(sum(sc) / len(sc)) if sc else None,
                         "flags": sum(len(c.get("flags") or []) for c in cs), "promises": sum(1 for c in cs if (c.get("offer") or {}).get("outcome_promise_quote"))})
    score_dist = [{"key": f"{lo}–{lo + 9}", "won": sum(1 for c in won if c["_score"] is not None and lo <= c["_score"] < lo + 10),
                   "not_won": sum(1 for c in lost if c["_score"] is not None and lo <= c["_score"] < lo + 10)} for lo in range(0, 100, 10)]
    # ICP
    icp = C.Counter((c.get("icp") or {}).get("fit") or "unknown" for c in sales)
    icp_rows = [{"key": k, "calls": v, "won": sum(1 for c in sales if (c.get("icp") or {}).get("fit") == k and c["_won"]),
                 "call_ids": [c["call_id"] for c in sales if (c.get("icp") or {}).get("fit") == k]} for k, v in icp.most_common()]
    crit = C.Counter(m for c in sales for m in (c.get("icp") or {}).get("misses") or [])
    crit_rows = [{"key": k, "missed": v, "won_when_missed": sum(1 for c in won if k in ((c.get("icp") or {}).get("misses") or [])),
                  "call_ids": [c["call_id"] for c in sales if k in ((c.get("icp") or {}).get("misses") or [])]} for k, v in crit.most_common()]
    unmet = [{"want": scrub(u.get("want") or ""), "verdict": u.get("verdict"), "call_id": c["call_id"]} for c in sales for u in c.get("unmet_demand") or []]
    language = [{"quote": scrub(q), "won": c["_won"], "call_id": c["call_id"]} for c in sales for q in (c.get("buyer_language") or [])[:5]]
    dreams = [{"quote": scrub(c["dream_outcome_quote"]), "won": c["_won"], "call_id": c["call_id"],
               "segment": (c.get("segment") or {}).get("assigned")} for c in sales if c.get("dream_outcome_quote")]
    # objections: tactic outcomes and cost
    tac = C.defaultdict(lambda: {"n": 0, "resolved": 0, "won": 0})
    for c in sales:
        for o in c.get("objections") or []:
            t = tac[o.get("tactic") or "none"]
            t["n"] += 1; t["resolved"] += 1 if o.get("resolved") else 0; t["won"] += 1 if c["_won"] else 0
    tactics = sorted([{"tactic": k, **v, "resolved_pct": pct(v["resolved"], v["n"])} for k, v in tac.items() if v["n"] >= 2], key=lambda r: -r["n"])
    cost = []
    for t in sorted({o.get("type") for c in sales for o in c.get("objections") or []}):
        raised = [c for c in sales if any(o.get("type") == t for o in c.get("objections") or [])]
        unres = [c for c in raised if not c["_won"] and any(o.get("type") == t and not o.get("resolved") for o in c.get("objections") or [])]
        cost.append({"type": t, "calls": len(raised), "lost_unresolved": len(unres), "won": sum(c["_won"] for c in raised),
                     "share_of_losses": pct(len(unres), len(lost)), "call_ids": [c["call_id"] for c in unres]})
    cost.sort(key=lambda r: -r["lost_unresolved"])
    timing = C.Counter(o.get("when_raised") or "unknown" for c in sales for o in c.get("objections") or [])
    # transcript vs CRM
    disp = C.Counter()
    for c in sales:
        disp[((c.get("_crm") or {}).get("Call Outcome") or "Blank", (c.get("transcript_outcome") or {}).get("disposition") or "undetermined")] += 1
    crm_vs = [{"crm": a, "transcript": b, "calls": n} for (a, b), n in disp.most_common()]
    # money question before pitch (coaching pass) vs outcome
    mq = [c for c in sales if c["call_id"] in coaching]
    money = {"assessed": len(mq),
             "yes": sum(1 for c in mq if coaching[c["call_id"]].get("money_qualified_before_pitch")),
             "yes_won": sum(1 for c in mq if coaching[c["call_id"]].get("money_qualified_before_pitch") and c["_won"]),
             "no_won": sum(1 for c in mq if not coaching[c["call_id"]].get("money_qualified_before_pitch") and c["_won"])}
    # coaching rollups
    areas = C.Counter(); area_examples = C.defaultdict(list)
    exemplary = []
    verdicts = C.defaultdict(C.Counter); better_obj = C.defaultdict(list)
    for c in sales:
        k = coaching.get(c["call_id"])
        if not k:
            continue
        for it in k.get("coaching") or []:
            a = it.get("area") or "?"
            areas[a] += 1
            if len(area_examples[a]) < 4:
                area_examples[a].append({"issue": scrub(it.get("issue") or ""), "better": scrub(it.get("better") or ""), "call_id": c["call_id"], "rep": c["rep"]})
        for ex in k.get("exemplary") or []:
            exemplary.append({"area": ex.get("area"), "quote": scrub(ex.get("quote") or ""), "why": scrub(ex.get("why") or ""), "rep": c["rep"],
                              "call_id": c["call_id"], "won": c["_won"], "timestamp": ex.get("timestamp")})
        for o in k.get("objection_timeline") or []:
            verdicts[o.get("type") or "other"][o.get("verdict") or "unknown"] += 1
            if o.get("better") and len(better_obj[o.get("type") or "other"]) < 5:
                better_obj[o.get("type") or "other"].append({"prospect": scrub(o.get("prospect_quote") or ""), "rep": scrub(o.get("rep_quote") or ""),
                                                             "better": scrub(o["better"]), "call_id": c["call_id"]})
    def area_label(a):
        a = str(a)
        return ck_text.get(a) or ph_name.get(a) or ph_name.get(a[:3]) or ph_name.get(a[:2]) or a
    coach_themes = [{"area": a, "label": area_label(a), "phase": ph_of.get(a, a[:3] if a[:3] in ph_name else a[:2]), "n": n, "examples": area_examples[a]}
                    for a, n in areas.most_common(25)]
    return {"phase_gap": phase_gap, "checks": checks, "rep_phase": rep_phase, "team_phase": team_phase, "length": length,
            "by_month": by_month, "score_dist": score_dist, "icp": icp_rows, "icp_criteria": crit_rows, "unmet": unmet,
            "language": language, "dreams": dreams, "tactics": tactics, "objection_cost": cost, "objection_timing": dict(timing),
            "crm_vs_transcript": crm_vs, "money_before_pitch": money, "coach_themes": coach_themes, "exemplary": exemplary,
            "objection_verdicts": {k: dict(v) for k, v in verdicts.items()}, "objection_better": dict(better_obj),
            "coached_calls": len([c for c in sales if c["call_id"] in coaching])}


def alias_of(p):
    p = p or {}
    return (p.get("first_name") or "?")[:1].upper() + "." + ((p.get("last_name") or "")[:1].upper() + "." if p.get("last_name") else "")


def closer_library(calls, coaching):
    out = {}
    for c in calls:
        if c.get("type") != "sales":
            continue
        crm = c.get("_crm") or {}
        p = c.get("prospect") or {}
        rec = {
            "call_id": c["call_id"], "date": c.get("date"), "rep": c["rep"], "source": c.get("source"), "kind": c.get("call_kind"),
            "duration_min": c.get("duration_min"), "prospect": alias_of(p), "won": c["_won"], "score": c["_score"],
            "profile": {k: p.get(k) for k in ("gender", "age", "relationship_status", "divorced", "has_kids", "apps_used", "prior_help", "occupation")},
            "segment": c.get("segment"), "goals": c.get("goals"), "pains": c.get("pains"), "dream": c.get("dream_outcome_quote"),
            "language": c.get("buyer_language"), "questions": c.get("questions_asked"), "objections": c.get("objections"),
            "offer": c.get("offer"), "pillars": c.get("pillars"), "adherence": c.get("adherence"), "transcript_outcome": c.get("transcript_outcome"),
            "icp": c.get("icp"), "unmet": c.get("unmet_demand"), "flags": c.get("flags"), "quality": c.get("quality"),
            "crm": {"outcome": crm.get("Call Outcome"), "call_type": crm.get("Call Type"), "payment_type": crm.get("Payment Type"),
                    "cash": crm.get("Cash Collected"), "contract": crm.get("Contract Value"), "product": crm.get("Product Purchased"),
                    "no_close": crm.get("No Close Reason(s) / Objection(s) Faced"), "category": crm.get("No Close Category"),
                    "setter": crm.get("Setter Name"), "source": crm.get("Lead Source")},
            "coaching": coaching.get(c["call_id"]),
        }
        rec["profile"]["location"] = None
        out[c["call_id"]] = deep(rec)
    return out


# ---------------------------------------------------------------- texting library + per rep
def thread_library(threads, raw_threads):
    raw = {r["lead_id"]: r for r in raw_threads}
    lib = {}; rep_stats = C.defaultdict(lambda: C.Counter())
    for t in threads:
        r = raw.get(t["lead_id"]) or {}
        reps = [n for n, _ in C.Counter(norm_rep(m.get("by")) for m in r.get("messages") or [] if m.get("dir") == "out" and m.get("by")).most_common()]
        first = (r.get("messages") or [{}])[0].get("t")
        last = (r.get("messages") or [{}])[-1].get("t")
        name = r.get("lead_name") or ""
        alias = ".".join(w[0].upper() for w in name.split()[:2]) + "." if name.strip() else "Lead"
        lib[t["lead_id"]] = deep({k: t.get(k) for k in ("thread_type", "first_touch", "business_messages", "lead_messages",
                                                         "first_reply_after_n_business_messages", "lead_engaged", "stage_reached", "drop_off",
                                                         "booking_link_sent", "price_discussed", "price_quote", "objections", "lead_sentiment",
                                                         "setter_quality", "outcome", "flags", "note")} | {"reps": reps, "alias": alias,
                                                                                                           "first": first, "last": last,
                                                                                                           "source": r.get("opt_source")})
        if reps:
            s = rep_stats[reps[0]]
            s["threads"] += 1
            sq = t.get("setter_quality") or {}
            s["personalised"] += 1 if sq.get("personalised") else 0
            s["asked_questions"] += 1 if sq.get("asked_questions") else 0
            s["script_hit"] += 1 if sq.get("followed_script") == "hit" else 0
            s["script_judged"] += 1 if sq.get("followed_script") in ("hit", "partial", "miss") else 0
            s["engaged"] += 1 if t.get("lead_engaged") else 0
            s["booked"] += 1 if (t.get("outcome") or {}).get("booked") else 0
            s["showed"] += 1 if (t.get("outcome") or {}).get("showed") else 0
            s["closed"] += 1 if (t.get("outcome") or {}).get("closed") else 0
            s["flags"] += len(t.get("flags") or [])
            s["high_flags"] += sum(1 for f in t.get("flags") or [] if f.get("severity") in ("high", "critical"))
            s["silent"] += 1 if (t.get("drop_off") or {}).get("who_went_silent") == "business" else 0
    reps = [{"rep": k, **dict(v)} for k, v in sorted(rep_stats.items(), key=lambda kv: -kv[1]["threads"])]
    obj_quotes = C.defaultdict(list)
    for t in threads:
        for o in t.get("objections") or []:
            if len(obj_quotes[o.get("type") or "other"]) < 6 and o.get("quote"):
                obj_quotes[o.get("type") or "other"].append({"quote": scrub(o["quote"]), "lead_id": t["lead_id"]})
    sentiment = C.Counter(t.get("lead_sentiment") or "unknown" for t in threads)
    price_quotes = [{"quote": scrub(t["price_quote"]), "lead_id": t["lead_id"]} for t in threads if t.get("price_quote")]
    return lib, {"reps": reps, "objection_quotes": dict(obj_quotes), "sentiment": dict(sentiment), "price_quotes": price_quotes,
                 "booking_link_sent": sum(1 for t in threads if t.get("booking_link_sent")),
                 "first_touch_template": sum(1 for t in threads if (t.get("first_touch") or {}).get("template_like"))}


# ---------------------------------------------------------------- triage (setter) calls
def build_triage(scalls, playbook, raw_threads, call_meta):
    if not scalls:
        return None, {}
    raw = {r["lead_id"]: r for r in raw_threads}
    real = [c for c in scalls if c.get("type") == "setter_call"]
    other = C.Counter(c.get("type") for c in scalls)
    V = {"hit": 1, "partial": .5, "miss": 0}
    ph_of = {ck["id"]: ph["id"] for ph in playbook["phases"] for ck in ph["checks"]}

    def ps(c, pid):
        return ((((c.get("adherence") or {}).get("phases") or {}).get(pid) or {}).get("score"))

    def cs(c, cid):
        return (((((c.get("adherence") or {}).get("phases") or {}).get(ph_of[cid]) or {}).get("checks") or {}).get(cid))

    def avg(xs):
        xs = [V[x] for x in xs if x in V]
        return round(100 * sum(xs) / len(xs)) if xs else None
    weight = {ph["id"]: ph["weight"] for ph in playbook["phases"]}

    def score(c):
        tot = got = 0
        for pid in weight:
            s = ps(c, pid)
            if s in V:
                tot += weight[pid]; got += weight[pid] * V[s]
        return round(100 * got / tot) if tot else None

    for c in real:
        c["_score"] = score(c)
        meta = call_meta.get(c["call_id"]) or {}
        c["_lead"] = meta.get("lead_id")
        r = raw.get(c["_lead"]) or {}
        o = raw_outcome(r) if r else {"booked": None, "showed": None, "closed": None}
        c["_out"] = o
        c["setter"] = norm_rep(c.get("setter") or meta.get("user_name"))
    phases = [{"id": ph["id"], "name": ph["name"], "weight": ph["weight"], "adherence": avg([ps(c, ph["id"]) for c in real]),
               "hit": sum(1 for c in real if ps(c, ph["id"]) == "hit"), "partial": sum(1 for c in real if ps(c, ph["id"]) == "partial"),
               "miss": sum(1 for c in real if ps(c, ph["id"]) == "miss")} for ph in playbook["phases"]]
    checks = [{"id": ck["id"], "phase": ph["name"], "text": ck["text"], "run_pct": avg([cs(c, ck["id"]) for c in real]),
               "applicable": sum(1 for c in real if cs(c, ck["id"]) in V)} for ph in playbook["phases"] for ck in ph["checks"]]
    gates = {g: dict(C.Counter(((c.get("gates") or {}).get(g) or {}).get("verdict") or "unknown" for c in real)) for g in ("problem", "why_now", "means")}
    tie_keys = ["time_locked", "invite_accepted_live", "verbal_show_commitment", "video_or_setting_expectation", "decision_maker_handled", "reminder_or_prep_set"]
    ties = {k: sum(1 for c in real if (c.get("tie_downs") or {}).get(k)) for k in tie_keys}
    results = C.Counter(c.get("result") or "unclear" for c in real)
    booked_calls = [c for c in real if c.get("result") in ("booked_calendar", "live_transferred")]
    verify = {"booked_on_call": len(booked_calls),
              "crm_booked": sum(1 for c in booked_calls if c["_out"].get("booked")),
              "showed": sum(1 for c in booked_calls if c["_out"].get("showed")),
              "closed": sum(1 for c in booked_calls if c["_out"].get("closed"))}
    setq = C.Counter(c.get("set_quality") or "unknown" for c in booked_calls)
    setq_show = {k: {"n": sum(1 for c in booked_calls if c.get("set_quality") == k), "showed": sum(1 for c in booked_calls if c.get("set_quality") == k and c["_out"].get("showed"))}
                 for k in ("high", "medium", "low")}
    themes = C.Counter(); ex = C.defaultdict(list)
    for c in real:
        for it in c.get("coaching") or []:
            a = it.get("area") or "?"
            themes[a] += 1
            if len(ex[a]) < 4:
                ex[a].append({"issue": scrub(it.get("issue") or ""), "better": scrub(it.get("better") or ""), "call_id": c["call_id"]})
    ph_name = {ph["id"]: ph["name"] for ph in playbook["phases"]}
    exemplary = [{"area": e.get("area"), "quote": scrub(e.get("quote") or ""), "why": scrub(e.get("why") or ""), "setter": c["setter"], "call_id": c["call_id"]}
                 for c in real for e in c.get("exemplary") or []]
    flags = [{"call_id": c["call_id"], "rep": c["setter"], "category": f.get("category"), "severity": f.get("severity"), "summary": scrub(f.get("summary") or "")}
             for c in real for f in c.get("flags") or []]
    objs = C.Counter(o.get("type") for c in real for o in c.get("objections") or [])
    setters = []
    for s in sorted({c["setter"] for c in real}):
        sc = [c for c in real if c["setter"] == s]
        scs = [c["_score"] for c in sc if c["_score"] is not None]
        b = [c for c in sc if c.get("result") in ("booked_calendar", "live_transferred")]
        setters.append({"setter": s, "calls": len(sc), "avg_score": round(sum(scs) / len(scs)) if scs else None, "booked": len(b),
                        "book_pct": pct(len(b), len(sc)), "showed": sum(1 for c in b if c["_out"].get("showed")),
                        "flags": sum(len(c.get("flags") or []) for c in sc),
                        "phases": {ph["id"]: avg([ps(c, ph["id"]) for c in sc]) for ph in playbook["phases"]}, "call_ids": [c["call_id"] for c in sc]})
    price = [c for c in real if (c.get("price_mentioned") or {}).get("said")]
    lib = {}
    for c in real:
        p = c.get("prospect") or {}
        lib[c["call_id"]] = deep({"call_id": c["call_id"], "date": c.get("date"), "setter": c["setter"], "duration_min": c.get("duration_min"),
                                  "prospect": alias_of(p), "trigger": c.get("lead_trigger"), "segment": c.get("segment"), "pains": c.get("pains"),
                                  "goals": c.get("goals"), "questions": c.get("questions_asked"), "objections": c.get("objections"),
                                  "price": c.get("price_mentioned"), "credit_check": c.get("credit_or_financing_check"), "result": c.get("result"),
                                  "summary": c.get("summary"), "gates": c.get("gates"), "tie_downs": c.get("tie_downs"), "set_quality": c.get("set_quality"),
                                  "coaching": c.get("coaching"), "exemplary": c.get("exemplary"), "adherence": c.get("adherence"), "flags": c.get("flags"),
                                  "quality": c.get("quality"), "score": c["_score"], "crm": c["_out"],
                                  "profile": {k: p.get(k) for k in ("gender", "relationship_status", "age")}})
    return {
        "summary": {"recorded_2min": len(scalls), "setter_calls": len(real), "other_types": dict(other),
                    "avg_score": round(sum(c["_score"] for c in real if c["_score"] is not None) / max(1, sum(1 for c in real if c["_score"] is not None))),
                    "booked_on_call": len(booked_calls), "price_said": len(price),
                    "price_outside_range": sum(1 for c in price if (c.get("price_mentioned") or {}).get("within_script_range") is False),
                    "credit_checked": sum(1 for c in real if c.get("credit_or_financing_check")), "flags": len(flags)},
        "phases": phases, "checks": sorted(checks, key=lambda r: (r["run_pct"] is None, r["run_pct"] or 0)), "gates": gates, "tie_downs": ties,
        "results": results.most_common(), "verify": verify, "set_quality": dict(setq), "set_quality_show": setq_show,
        "themes": [{"area": a, "label": ph_name.get(a[:2], a), "n": n, "examples": ex[a]} for a, n in themes.most_common(15)],
        "exemplary": exemplary[:30], "flags": flags, "objections": objs.most_common(), "setters": setters,
        "segments": C.Counter((c.get("segment") or {}).get("assigned") or "unknown" for c in real).most_common(),
        "triggers": C.Counter(c.get("lead_trigger") or "unknown" for c in real).most_common(),
        "pains": C.Counter(p.get("category") for c in real for p in c.get("pains") or []).most_common(15),
    }, lib


# ---------------------------------------------------------------- funnel (full population)
def build_funnel():
    path = f"{D}/raw/funnel.json"
    return json.load(open(path)) if os.path.exists(path) else None


def main():
    playbook = json.load(open(f"{D}/playbook_closer.json"))
    pb_setter = json.load(open(f"{D}/playbook_setter.json"))
    calls = load(f"{D}/closer_calls/*.json")
    crm = {}
    for b in glob.glob(f"{D}/raw/batches/closer_*.json"):
        for it in json.load(open(b)):
            crm[it["rec"]] = it["crm"]
    for c in calls:
        c["_crm"] = crm.get(c["call_id"], {})
    coaching = {k["call_id"]: k for k in load(f"{D}/closer_coaching/*.json") if k.get("call_id")}
    raw_threads = load(f"{D}/raw/threads/*.json")
    threads = load(f"{D}/threads/*.json")
    names = {r["lead_id"]: r.get("lead_name") for r in raw_threads}
    for t in threads:
        t["_lead_name"] = names.get(t["lead_id"])
    collect_names(calls, [{"_lead_name": r.get("lead_name")} for r in raw_threads])
    scalls = load(f"{D}/setter_calls/*.json")
    call_meta = {}
    cm = f"{D}/raw/setter_call_meta.json"
    if os.path.exists(cm):
        call_meta = json.load(open(cm))
    ops_p = f"{D}/raw/ops.json"
    ops = deep(json.load(open(ops_p))) if os.path.exists(ops_p) else None

    closer = build_closer(calls, playbook)          # sets _won/_score/rep on calls
    closer["deep"] = closer_deep(calls, playbook, coaching)
    texting = build_threads(threads, raw_threads) if raw_threads else None
    tlib, textra = thread_library(threads, raw_threads)
    if texting:
        texting["extra"] = textra
    triage, slib = build_triage(scalls, pb_setter, raw_threads, call_meta)
    tprog = {"candidates": len(call_meta), "transcribed": sum(1 for m in call_meta.values() if m.get("transcribed")),
             "scored": sum(1 for c in scalls if c.get("type") == "setter_call"), "by_user": dict(C.Counter(m["user_name"] for m in call_meta.values())),
             "minutes": round(sum(m["duration_min"] for m in call_meta.values()))}
    sales = [c for c in calls if c.get("type") == "sales"]
    J = lambda n: json.load(open(f"{D}/raw/{n}")) if os.path.exists(f"{D}/raw/{n}") else {}
    lead_rows, apps, cats = J("lead_rows.json"), J("applications.json"), J("app_categories.json")
    triage_by_lead = C.defaultdict(list)
    for k, m in call_meta.items():
        if m.get("lead_id") and any(sc.get("call_id") == k and sc.get("type") == "setter_call" for sc in scalls):
            triage_by_lead[m["lead_id"]].append(k)
    app = BD.applicants(lead_rows, apps, cats, sales, {t["lead_id"] for t in threads}, triage_by_lead) if lead_rows else None
    sanctioned = {t["price_usd"] for t in playbook["sanctioned_offer"]}
    closer["objection_pages"] = BD.objection_pages(sales, coaching, threads, scrub, None)
    closer["reps_deep"] = BD.reps_deep(sales, coaching, playbook, sanctioned, scrub)
    closer["review"] = BD.calls_to_review(sales, coaching, scrub)
    closer["trends"] = BD.trends(sales, sanctioned)
    wins = BD.easiest_wins(sales, closer["objection_pages"], ops)
    av = BD.avatar_rollup(deep(json.load(open(f"{D}/avatars.json"))) if os.path.exists(f"{D}/avatars.json") else None, sales, app["rows"] if app else [], scrub)
    out = {
        "applicants": app, "avatars": av, "wins": wins,
        "meta": {"offer": OFFER, "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "min_n": MIN_N},
        "funnel": build_funnel(), "ops": ops,
        "closer": closer, "texting": texting, "triage": triage, "triage_progress": tprog,
        "playbook": {"name": playbook["name"], "phases": [{"id": p["id"], "name": p["name"], "weight": p["weight"],
                                                           "checks": [{"id": c["id"], "text": c["text"]} for c in p["checks"]]} for p in playbook["phases"]],
                     "sanctioned": playbook.get("sanctioned_offer")},
        "playbook_setter": {"phases": [{"id": p["id"], "name": p["name"], "weight": p["weight"],
                                        "checks": [{"id": c["id"], "text": c["text"]} for c in p["checks"]]} for p in pb_setter["phases"]]},
        "privacy": {"scheme": "prospects shown as initials; emails, phone numbers and ID numbers removed; no transcripts published"},
    }
    os.makedirs(f"{ROOT}/web/data", exist_ok=True)
    clib = closer_library(calls, coaching)
    if app:
        for r in app["rows"]:
            for cid in r["call_ids"]:
                if cid in clib:
                    clib[cid]["application"] = {k: r.get(k) for k in ("age_band", "since_relationship", "hours", "matchmaking", "invest", "heard", "region", "work_cat", "challenge_cats", "money_signal", "form")}
    if av:
        for a in av.get("avatars", []):
            for cid in a.get("call_ids", []):
                if cid in clib:
                    clib[cid]["avatar"] = a.get("name")
    if app:
        AK = ("age_band", "since_relationship", "hours", "matchmaking", "work_cat")
        hid = {hashlib.sha1(lid.encode()).hexdigest()[:8]: lid for lid in lead_rows}
        for r in app["rows"]:
            lid = hid.get(r["id"])
            if lid in tlib:
                tlib[lid]["application"] = {k: r.get(k) for k in AK}
    files = {f"{OFFER}.json": out, f"{OFFER}_calls.json": clib, f"{OFFER}_threads.json": tlib, f"{OFFER}_triage.json": slib}
    for name, obj in files.items():
        blob = json.dumps(obj, default=str)
        assert not EMAIL.search(blob), f"email leaked in {name}"
        open(f"{ROOT}/web/data/{name}", "w").write(blob)
        print(f"wrote web/data/{name}", len(blob) // 1024, "KB")


if __name__ == "__main__":
    main()
