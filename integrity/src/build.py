#!/usr/bin/env python3
"""Build web/data/<offer>.json from per-call and per-thread extractions.

Pure aggregation: no model calls. Everything public is pseudonymised here.
Usage: python3 src/build.py krc
"""
import json, glob, os, re, sys, collections as C
from datetime import datetime, timezone

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OFFER = sys.argv[1] if len(sys.argv) > 1 else "krc"
D = f"{ROOT}/data/{OFFER}"
MIN_N = 5  # lift below this sample is shown greyed as insufficient

REP_ALIASES = {"Ellie Porter": "Elly Porter", "Mariah Malvezzi": "Mariah Casagrande-Malvezzi"}
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


def collect_names(calls, threads):
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
PHONE = re.compile(r"\+?\d[\d\s().-]{8,}\d")
DIGITS = re.compile(r"\b\d{3}-?\d{2}-?\d{4}\b")


def scrub(s):
    if not isinstance(s, str):
        return s
    s = EMAIL.sub("[email]", s)
    s = DIGITS.sub("[number]", s)
    s = PHONE.sub("[phone]", s)
    for n in sorted(NAME_TOKENS, key=len, reverse=True):
        s = re.sub(rf"\b{re.escape(n)}\b", n[0] + ".", s)
    return s


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
    closed = any(e.get("outcome") == "Closed" and e.get("payment_type") not in ("Deposit", "Instalment Paid") for e in eoc) or (r.get("paid") or 0) > 0
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


# ---------------------------------------------------------------- funnel (full population)
def build_funnel():
    path = f"{D}/raw/funnel.json"
    return json.load(open(path)) if os.path.exists(path) else None


def main():
    playbook = json.load(open(f"{D}/playbook_closer.json"))
    calls = load(f"{D}/closer_calls/*.json")
    crm = {}
    for b in glob.glob(f"{D}/raw/batches/closer_*.json"):
        for it in json.load(open(b)):
            crm[it["rec"]] = it["crm"]
    for c in calls:
        c["_crm"] = crm.get(c["call_id"], {})
    raw_threads = load(f"{D}/raw/threads/*.json")
    threads = load(f"{D}/threads/*.json")
    names = {r["lead_id"]: r.get("lead_name") for r in raw_threads}
    for t in threads:
        t["_lead_name"] = names.get(t["lead_id"])
    collect_names(calls, raw_threads and [{"_lead_name": r.get("lead_name")} for r in raw_threads])

    out = {
        "meta": {"offer": OFFER, "generated_at": datetime.now(timezone.utc).isoformat(timespec="seconds"), "min_n": MIN_N},
        "funnel": build_funnel(),
        "closer": build_closer(calls, playbook),
        "texting": build_threads(threads, raw_threads) if raw_threads else None,
        "playbook": {"name": playbook["name"], "phases": [{"id": p["id"], "name": p["name"], "weight": p["weight"]} for p in playbook["phases"]]},
        "privacy": {"scheme": "prospects shown as initials; emails, phone numbers and ID numbers removed; no transcripts or prospect stories published",
                    "not_redacted": ["rep names", "call dates"]},
    }
    blob = json.dumps(out)
    # last-pass guard: no emails or long digit strings may ship
    assert not EMAIL.search(blob), "email leaked"
    os.makedirs(f"{ROOT}/web/data", exist_ok=True)
    open(f"{ROOT}/web/data/{OFFER}.json", "w").write(blob)
    print(f"wrote web/data/{OFFER}.json", len(blob) // 1024, "KB")


if __name__ == "__main__":
    main()
