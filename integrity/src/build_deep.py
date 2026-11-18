"""Deeper rollups for the integrity page: applicants, objection pages, rep head-to-head, trends, easiest wins, avatars.
Imported by build.py. Pure aggregation; every number is countable from the inputs."""
import collections as C
import hashlib

APP_FIELDS = [
    ("age_band", "Age", ["Under 30", "30–34", "35–39", "40–44", "45–49", "50–54", "55–59", "60+"]),
    ("since_relationship", "Time since last serious relationship", ["Less than 3 months", "3-6 months", "6-12 months", "1-5 years", "5+ years"]),
    ("hours", "Hours worked per week", ["15-30 hours", "30-40 hours", "50+ hours", "Retired", "Unemployed / Not working"]),
    ("matchmaking", "Coaching vs matchmaking", None),
    ("invest", "Able to invest (booking form)", ["yes", "no"]),
    ("heard", "How they heard (booking form)", None),
    ("region", "Location (booking form)", None),
    ("work_cat", "Work", None),
    ("money_signal", "Money signal in their answers", None),
    ("challenge_cats", "Their #1 challenge", None),
    ("goal_cats", "What they want", None),
    ("form", "Which form", None),
    ("source", "Lead source", None),
]


def pct(a, b):
    return round(100 * a / b) if b else None


def _fun(rs):
    n = len(rs)
    return {"leads": n, "contacted": sum(1 for r in rs if r["mins"] is not None), "booked": sum(r["booked"] for r in rs),
            "showed": sum(r["showed"] for r in rs), "closed": sum(r["closed"] for r in rs), "dq": sum(r["dq"] for r in rs),
            "team_cancelled": sum(r["team_cancelled"] for r in rs), "cash": round(sum(r["cash"] for r in rs)),
            "booked_pct": pct(sum(r["booked"] for r in rs), n), "show_pct": pct(sum(r["showed"] for r in rs), sum(r["booked"] for r in rs)),
            "close_pct_of_shows": pct(sum(r["closed"] for r in rs), sum(r["showed"] for r in rs)),
            "median_mins": (lambda t: round(t[len(t) // 2]) if t else None)(sorted(r["mins"] for r in rs if r["mins"] is not None))}


def applicants(lead_rows, apps, cats, calls, threads_ids, triage_by_lead):
    email_to_lid = {e: lid for lid, r in lead_rows.items() for e in r.get("emails", [])}
    call_by_lid = C.defaultdict(list)
    for c in calls:
        e = str((c.get("_crm") or {}).get("Lead Email") or "").lower().strip()
        if e in email_to_lid:
            call_by_lid[email_to_lid[e]].append(c["call_id"])
    rows = []
    for lid, r in lead_rows.items():
        a = dict(apps.get(lid) or {}); a.update(cats.get(lid) or {})
        if a.get("matchmaking"):
            a["matchmaking"] = "Wants to build the skills" if a["matchmaking"].startswith("Yes") else "Hoping to be introduced" if a["matchmaking"].startswith("No") else a["matchmaking"]
        if a.get("heard"):
            h = a["heard"]
            a["heard"] = "instagram" if "insta" in h or h == "ig" else "facebook" if "face" in h or h == "fb" else "youtube" if "you" in h else "friend" if "friend" in h or "refer" in h else "tiktok" if "tik" in h else "other"
        rows.append({"id": hashlib.sha1(lid.encode()).hexdigest()[:8], "lid": lid,
                     **{k: a.get(k) for k, _, _ in APP_FIELDS if k not in ("source",)}, "source": r["source"], "month": r["month"],
                     "mins": r["mins"], "touches": r["touches_7d"], "replied": r["replied"], "booked": r["booked"], "showed": r["showed"],
                     "closed": r["closed"], "cash": r["cash"], "dq": r["dq"], "team_cancelled": r["team_cancelled"],
                     "call_ids": call_by_lid.get(lid, []), "thread": lid in threads_ids, "triage_ids": triage_by_lead.get(lid, [])})
    fields = []
    for k, label, order in APP_FIELDS:
        vals = C.Counter()
        for r in rows:
            for v in (r[k] if isinstance(r[k], list) else [r[k]]):
                if v:
                    vals[v] += 1
        keys = [v for v in (order or []) if v in vals] + [v for v, _ in vals.most_common() if not order or v not in order]
        out = []
        for v in keys:
            rs = [r for r in rows if (v in r[k] if isinstance(r[k], list) else r[k] == v)]
            out.append({"value": v, **_fun(rs), "call_ids": sorted({c for r in rs for c in r["call_ids"]})})
        answered = sum(1 for r in rows if r[k])
        fields.append({"field": k, "label": label, "answered": answered, "rows": out})
    base = _fun(rows)
    # the two combinations people ask about most
    combos = []
    for name, f in [("60+ and retired or not working", lambda r: r["age_band"] == "60+" and r["hours"] in ("Retired", "Unemployed / Not working")),
                    ("Under 50 and working 30+ hours", lambda r: r["age_band"] in ("30–34", "35–39", "40–44", "45–49") and r["hours"] in ("30-40 hours", "50+ hours")),
                    ("Hoping to be introduced (matchmaking)", lambda r: r["matchmaking"] == "Hoping to be introduced"),
                    ("Says they can't afford it", lambda r: r.get("money_signal") == "stated_cant_afford" or r.get("invest") == "no"),
                    ("Single 5+ years", lambda r: r["since_relationship"] == "5+ years"),
                    ("Recent breakup (under 6 months)", lambda r: r["since_relationship"] in ("Less than 3 months", "3-6 months"))]:
        rs = [r for r in rows if f(r)]
        combos.append({"name": name, **_fun(rs), "call_ids": sorted({c for r in rs for c in r["call_ids"]})})
    for r in rows:
        r.pop("lid", None)
    crisis = sum(1 for lid in lead_rows if (cats.get(lid) or {}).get("crisis_signal"))
    return {"base": base, "fields": fields, "combos": combos, "rows": rows, "crisis_signals": crisis,
            "forms": dict(C.Counter(f for lid in lead_rows for f in (apps.get(lid) or {}).get("forms", [])))}


def objection_pages(sales, coaching, threads, scrub, rep_of):
    types = sorted({o.get("type") or "other" for c in sales for o in c.get("objections") or []})
    base_won = sum(c["_won"] for c in sales) / max(1, len(sales))
    out = []
    for t in types:
        cs = [c for c in sales if any((o.get("type") or "other") == t for o in c.get("objections") or [])]
        os_ = [(c, o) for c in sales for o in c.get("objections") or [] if (o.get("type") or "other") == t]
        tl = [(c, o) for c in sales for o in (coaching.get(c["call_id"]) or {}).get("objection_timeline") or [] if (o.get("type") or "other") == t]
        by_rep = []
        for r in sorted({c["rep"] for c, _ in os_}):
            ro = [o for c, o in os_ if c["rep"] == r]
            rt = [o for c, o in tl if c["rep"] == r]
            by_rep.append({"rep": r, "raised": len(ro), "resolved": sum(1 for o in ro if o.get("resolved")),
                           "handled_well": sum(1 for o in rt if o.get("verdict") == "handled_well"), "judged": len(rt)})
        seg = C.Counter((c.get("segment") or {}).get("assigned") or "other" for c in cs)
        tac = C.defaultdict(lambda: [0, 0])
        for c, o in os_:
            tac[o.get("tactic") or "none"][0] += 1
            tac[o.get("tactic") or "none"][1] += 1 if o.get("resolved") else 0
        verdict = C.Counter(o.get("verdict") or "unknown" for _, o in tl)
        good = [{"prospect": scrub(o.get("prospect_quote") or ""), "rep": scrub(o.get("rep_quote") or ""), "call_id": c["call_id"], "rep_name": c["rep"]}
                for c, o in tl if o.get("verdict") == "handled_well" and o.get("rep_quote")][:6]
        bad = [{"prospect": scrub(o.get("prospect_quote") or ""), "rep": scrub(o.get("rep_quote") or ""), "better": scrub(o.get("better") or ""),
                "call_id": c["call_id"], "rep_name": c["rep"], "verdict": o.get("verdict")}
               for c, o in tl if o.get("verdict") in ("poorly", "ignored", "partially") and o.get("better")][:8]
        quotes = []
        seen = set()
        for c, o in os_:
            q = scrub(o.get("raw_quote") or "")
            if q and q not in seen:
                seen.add(q); quotes.append({"quote": q, "call_id": c["call_id"], "when": o.get("when_raised"), "resolved": o.get("resolved"), "won": c["_won"]})
        text_q = [{"quote": scrub(o.get("quote") or ""), "lead_id": th["lead_id"]} for th in threads for o in th.get("objections") or [] if (o.get("type") or "other") == t and o.get("quote")]
        out.append({"type": t, "times": len(os_), "calls": len(cs), "call_ids": [c["call_id"] for c in cs],
                    "won_when_raised": sum(c["_won"] for c in cs), "close_pct_when_raised": pct(sum(c["_won"] for c in cs), len(cs)),
                    "base_close_pct": round(100 * base_won),
                    "resolved": sum(1 for _, o in os_ if o.get("resolved")), "resolved_pct": pct(sum(1 for _, o in os_ if o.get("resolved")), len(os_)),
                    "when": dict(C.Counter(o.get("when_raised") or "unknown" for _, o in os_)),
                    "verdicts": dict(verdict), "by_rep": by_rep, "by_segment": seg.most_common(),
                    "tactics": sorted([{"tactic": k, "n": v[0], "resolved": v[1]} for k, v in tac.items()], key=lambda x: -x["n"])[:10],
                    "quotes": quotes[:14], "handled_well": good, "handled_badly": bad, "text_count": len(text_q), "text_quotes": text_q[:6]})
    return sorted(out, key=lambda x: -x["times"])


def reps_deep(sales, coaching, playbook, sanctioned_prices, scrub):
    ck_text = {ck["id"]: ck["text"] for ph in playbook["phases"] for ck in ph["checks"]}
    ph_name = {ph["id"]: ph["name"] for ph in playbook["phases"]}
    out = []
    for r in sorted({c["rep"] for c in sales}):
        rc = [c for c in sales if c["rep"] == r]
        sc = [c["_score"] for c in rc if c["_score"] is not None]
        objs = [o for c in rc for o in c.get("objections") or []]
        tl = [o for c in rc for o in (coaching.get(c["call_id"]) or {}).get("objection_timeline") or []]
        pitched = [c for c in rc if (c.get("offer") or {}).get("presented")]
        coached = [c for c in rc if c["call_id"] in coaching]
        areas = C.Counter(it.get("area") for c in coached for it in coaching[c["call_id"]].get("coaching") or [])
        ex = [{"quote": scrub(x.get("quote") or ""), "why": scrub(x.get("why") or ""), "area": x.get("area"), "call_id": c["call_id"]}
              for c in coached for x in coaching[c["call_id"]].get("exemplary") or []]
        off = sum(1 for c in rc if any(t.get("price_usd") and t["price_usd"] not in sanctioned_prices for t in (c.get("offer") or {}).get("tiers_quoted") or []))
        ranked = sorted([c for c in rc if c["_score"] is not None], key=lambda c: c["_score"])
        cash = sum(float((c.get("_crm") or {}).get("Cash Collected") or 0) for c in rc if c["_won"] or (c.get("_crm") or {}).get("Call Outcome") == "Closed")
        dur = [c.get("duration_min") for c in rc if c.get("duration_min")]
        out.append({
            "rep": r, "calls": len(rc), "won": sum(c["_won"] for c in rc), "close_pct": pct(sum(c["_won"] for c in rc), len(rc)), "cash": round(cash),
            "avg_score": round(sum(sc) / len(sc)) if sc else None, "score_min": min(sc) if sc else None, "score_max": max(sc) if sc else None,
            "avg_minutes": round(sum(dur) / len(dur)) if dur else None, "pitched": len(pitched),
            "objections": len(objs), "obj_resolved_pct": pct(sum(1 for o in objs if o.get("resolved")), len(objs)),
            "handled_well_pct": pct(sum(1 for o in tl if o.get("verdict") == "handled_well"), len(tl)),
            "money_before_pitch_pct": pct(sum(1 for c in coached if coaching[c["call_id"]].get("money_qualified_before_pitch")), len(coached)),
            "price_before_temp_pct": pct(sum(1 for c in pitched if (c.get("offer") or {}).get("price_before_temperature_check")), len(pitched)),
            "promise_pct": pct(sum(1 for c in rc if (c.get("offer") or {}).get("outcome_promise_quote")), len(rc)),
            "off_sheet_pct": pct(off, len(pitched)), "flags_per_call": round(sum(len(c.get("flags") or []) for c in rc) / len(rc), 1),
            "high_flags": sum(1 for c in rc for f in c.get("flags") or [] if f.get("severity") in ("high", "critical")),
            "disclosure_miss_pct": pct(sum(1 for c in rc if any(f.get("category") == "compliance" for f in c.get("flags") or [])), len(rc)),
            "top_mistakes": [{"area": a, "label": ck_text.get(a) or ph_name.get(str(a)[:3]) or ph_name.get(str(a)[:2]) or a, "n": n} for a, n in areas.most_common(4)],
            "exemplary": ex[:4], "best_call": ranked[-1]["call_id"] if ranked else None, "best_score": ranked[-1]["_score"] if ranked else None,
            "worst_call": ranked[0]["call_id"] if ranked else None, "worst_score": ranked[0]["_score"] if ranked else None,
            "call_ids": [c["call_id"] for c in rc], "period": "Jun to Aug" if all((c.get("date") or "") < "2026-09-01" for c in rc) else "Sep onward",
        })
    return out


def calls_to_review(sales, coaching, scrub):
    good = sorted([c for c in sales if c["_score"] is not None], key=lambda c: -c["_score"])[:6]
    crit = [c for c in sales if any(f.get("severity") == "critical" for f in c.get("flags") or [])]
    worst = sorted([c for c in sales if c["_score"] is not None and c not in crit], key=lambda c: c["_score"])[:4]
    def row(c, reason, tone):
        k = coaching.get(c["call_id"]) or {}
        return {"call_id": c["call_id"], "rep": c["rep"], "date": c.get("date"), "score": c["_score"], "won": c["_won"], "tone": tone,
                "reason": reason, "summary": scrub(k.get("summary") or (c.get("adherence") or {}).get("coach_note") or "")}
    return ([row(c, "Highest script score: use it in training", "good") for c in good]
            + [row(c, "Critical flag: needs a manager to listen", "bad") for c in crit]
            + [row(c, "Lowest script score", "warn") for c in worst])


def trends(sales, sanctioned_prices):
    out = []
    for m in sorted({(c.get("date") or "")[:7] for c in sales if c.get("date")}):
        cs = [c for c in sales if (c.get("date") or "").startswith(m)]
        pitched = [c for c in cs if (c.get("offer") or {}).get("presented")]
        sc = [c["_score"] for c in cs if c["_score"] is not None]
        objs = [o for c in cs for o in c.get("objections") or []]
        out.append({"month": m, "calls": len(cs), "won": sum(c["_won"] for c in cs), "close_pct": pct(sum(c["_won"] for c in cs), len(cs)),
                    "avg_score": round(sum(sc) / len(sc)) if sc else None,
                    "promise_pct": pct(sum(1 for c in cs if (c.get("offer") or {}).get("outcome_promise_quote")), len(pitched)),
                    "off_sheet_pct": pct(sum(1 for c in pitched if any(t.get("price_usd") and t["price_usd"] not in sanctioned_prices for t in (c.get("offer") or {}).get("tiers_quoted") or [])), len(pitched)),
                    "flags_per_call": round(sum(len(c.get("flags") or []) for c in cs) / len(cs), 1),
                    "price_objections": sum(1 for o in objs if o.get("type") == "price_budget"),
                    "obj_resolved_pct": pct(sum(1 for o in objs if o.get("resolved")), len(objs)),
                    "reps": sorted({c["rep"] for c in cs})})
    return out


def easiest_wins(sales, obj_pages, ops):
    wins = []
    lost = [c for c in sales if not c["_won"]]
    for p in obj_pages[:6]:
        unres_lost = [c for c in lost if any((o.get("type") or "other") == p["type"] and not o.get("resolved") for o in c.get("objections") or [])]
        resolved_calls = [c for c in sales if any((o.get("type") or "other") == p["type"] and o.get("resolved") for o in c.get("objections") or [])]
        rate = sum(c["_won"] for c in resolved_calls) / len(resolved_calls) if resolved_calls else 0
        extra = len(unres_lost) * 0.5 * rate
        wins.append({"kind": "objection", "type": p["type"], "lost_unresolved": len(unres_lost), "resolved_calls": len(resolved_calls),
                     "close_when_resolved": round(100 * rate), "extra_closes": round(extra, 1), "call_ids": [c["call_id"] for c in unres_lost]})
    L = ops["leads"]["overall"] if ops else None
    if L:
        never = L["leads"] - L["contacted"]
        contacted_book = (L["booked"] - next((b["booked"] for b in ops["leads"]["speed_buckets"] if b["key"] == "Never"), 0)) / max(1, L["contacted"])
        show = L["showed"] / max(1, L["booked"]); close = L["closed"] / max(1, L["showed"])
        wins.append({"kind": "contact", "never": never, "book_rate": round(100 * contacted_book), "show_rate": round(100 * show), "close_rate": round(100 * close),
                     "extra_bookings": round(never * contacted_book), "extra_closes": round(never * contacted_book * show * close, 1)})
    return wins


def avatar_rollup(av, sales, app_rows, scrub):
    if not av:
        return None
    by = {c["call_id"]: c for c in sales}
    call_app = {cid: r for r in app_rows for cid in r["call_ids"]}
    for a in av.get("avatars", []):
        cs = [by[i] for i in a.get("call_ids", []) if i in by]
        sc = [c["_score"] for c in cs if c["_score"] is not None]
        a["stats"] = {"calls": len(cs), "won": sum(c["_won"] for c in cs), "close_pct": pct(sum(c["_won"] for c in cs), len(cs)),
                      "avg_score": round(sum(sc) / len(sc)) if sc else None,
                      "cash": round(sum(float((c.get("_crm") or {}).get("Cash Collected") or 0) for c in cs if (c.get("_crm") or {}).get("Call Outcome") == "Closed")),
                      "men": sum(1 for c in cs if (c.get("prospect") or {}).get("gender") == "man"),
                      "women": sum(1 for c in cs if (c.get("prospect") or {}).get("gender") == "woman"),
                      "objections": C.Counter(o.get("type") for c in cs for o in c.get("objections") or []).most_common(4),
                      "age_bands": C.Counter(call_app[c["call_id"]].get("age_band") for c in cs if c["call_id"] in call_app and call_app[c["call_id"]].get("age_band")).most_common(4),
                      "promise_calls": sum(1 for c in cs if (c.get("offer") or {}).get("outcome_promise_quote"))}
    return av


# ---------------------------------------------------------------- money on the table
def money_model(ops, sales, obj_pages, threads):
    if not ops:
        return None
    E = ops["eoc"]
    L = ops["leads"]; o = L["overall"]
    full = E.get("full_closes") or []
    contract = [float(r["contract"]) for r in full if r.get("contract")]
    cash = [float(r["cash"]) for r in full if r.get("cash") is not None]
    aov = round(sum(contract) / len(contract)) if contract else None
    cash_per = round(sum(cash) / len(cash)) if cash else None
    show = o["showed"] / max(1, o["booked"]); close = o["closed"] / max(1, o["showed"])
    levers = []
    def add(name, owner, effort, assumption, extra_book=None, extra_close=None, call_ids=None, lead_note=None):
        if extra_close is None and extra_book is not None:
            extra_close = extra_book * show * close
        levers.append({"lever": name, "owner": owner, "effort": effort, "assumption": assumption, "extra_bookings": None if extra_book is None else round(extra_book, 1),
                       "extra_closes": round(extra_close or 0, 1), "contract_value": round((extra_close or 0) * (aov or 0)), "cash_at_close": round((extra_close or 0) * (cash_per or 0)),
                       "call_ids": call_ids or [], "note": lead_note})
    never = o["leads"] - o["contacted"]
    cb = next((b for b in L["speed_buckets"] if b["key"] == "Never"), {"booked": 0})
    book_contacted = (o["booked"] - cb["booked"]) / max(1, o["contacted"])
    add("Contact every new lead within the hour", "Leah", "Low: instant text + alert + smart view", f"The {never} leads nobody contacted book at the rate contacted leads do ({round(100 * book_contacted)}%), then show and close at today's rates.", never * book_contacted)
    dist = {str(x["key"]): x["leads"] for x in L["touches_7d"]["dist"]}
    # follow-up depth: leads with 1-2 touches vs 3-7
    rows_t = L.get("touch_book") or None
    if ops.get("sms"):
        un = ops["sms"]["unanswered_leads"]
        eng = [t for t in threads if t.get("lead_engaged")]
        rate = sum(1 for t in eng if (t.get("outcome") or {}).get("booked")) / max(1, len(eng))
        add("Answer every lead who texts back", "Leah + setters", "Low: 30-minute unanswered-reply alert", f"Half of the {un} leads left without a reply would book at the rate engaged text leads do ({round(100 * rate)}%).", un * 0.5 * rate)
    for w in obj_pages[:3]:
        lost = [c for c in sales if not c["_won"]]
        un = [c for c in lost if any((o_.get("type") or "other") == w["type"] and not o_.get("resolved") for o_ in c.get("objections") or [])]
        res = [c for c in sales if any((o_.get("type") or "other") == w["type"] and o_.get("resolved") for o_ in c.get("objections") or [])]
        r = sum(c["_won"] for c in res) / len(res) if res else 0
        if r and len(res) >= 2:
            add(f"Handle the {w['type'].replace('_', ' ')} objection better", "Sid", "Medium: script fix + training + AI review", f"Half of {len(un)} lost calls with it unresolved close at the rate calls close when it is resolved ({round(100 * r)}%, {len(res)} calls, small sample). Sample of recorded calls only.", None, len(un) * 0.5 * r, [c["call_id"] for c in un])
    cal = ops.get("calendly") or {}
    dcb = next((p for p in cal.get("by_path", []) if p["key"].startswith("Direct, ads")), None)
    sb = next((p for p in cal.get("by_path", []) if p["key"] == "Setter booked"), None)
    if dcb and sb and sb.get("show_pct"):
        add("Route ad bookings through a quick setter call", "Mitch + Leah", "Medium: booking flow change", f"Half of the {dcb['host_cancel']} ad bookings the team cancelled become real calls and show at the setter-booked rate ({sb['show_pct']}%), then close at today's rate.", None, dcb["host_cancel"] * 0.5 * sb["show_pct"] / 100 * close)
    return {"aov_contract": aov, "cash_per_close": cash_per, "show_rate": round(100 * show), "close_rate_of_shows": round(100 * close), "full_closes": len(full),
            "since": ops["leads"]["since"], "levers": sorted(levers, key=lambda x: -x["contract_value"]),
            "total_contract": sum(x["contract_value"] for x in levers), "total_cash": sum(x["cash_at_close"] for x in levers)}


# ---------------------------------------------------------------- is coaching sticking: same behaviours, month by month, per rep
def coaching_sticking(sales, coaching, triage_calls):
    def m(c):
        return (c.get("date") or "")[:7]
    def has_flag(c, cat):
        return any(f.get("category") == cat for f in c.get("flags") or [])
    def chk(c, pid, cid):
        return ((((c.get("adherence") or {}).get("phases") or {}).get(pid) or {}).get("checks") or {}).get(cid)
    metrics = [("money_before_pitch", "Asked about money before the pitch", lambda c: (coaching.get(c["call_id"]) or {}).get("money_qualified_before_pitch") if c["call_id"] in coaching else None, 1),
               ("price_before_temp", "Said the price before the temperature check", lambda c: (c.get("offer") or {}).get("price_before_temperature_check") if (c.get("offer") or {}).get("presented") else None, -1),
               ("promise", "Made an outcome promise", lambda c: bool((c.get("offer") or {}).get("outcome_promise_quote")), -1),
               ("off_sheet", "Quoted a price that isn't on the sheet", lambda c: has_flag(c, "pricing_deviation") if (c.get("offer") or {}).get("presented") else None, -1),
               ("disclosure", "Missed the recording disclosure", lambda c: (chk(c, "C1", "C1b") in ("miss", None)) if chk(c, "C1", "C1b") is not None else None, -1),
               ("obj_resolved", "Objections resolved", None, 1)]
    out = []
    for r in sorted({c["rep"] for c in sales}):
        rc = [c for c in sales if c["rep"] == r]
        months = sorted({m(c) for c in rc if m(c)})
        if len(rc) < 6:
            continue
        rows = []
        for key, label, f, good in metrics:
            vals = []
            for mo in months:
                cs = [c for c in rc if m(c) == mo]
                if key == "obj_resolved":
                    ob = [o for c in cs for o in c.get("objections") or []]
                    vals.append({"month": mo, "n": len(ob), "pct": pct(sum(1 for o in ob if o.get("resolved")), len(ob))})
                    continue
                v = [f(c) for c in cs]; v = [x for x in v if x is not None]
                vals.append({"month": mo, "n": len(v), "pct": pct(sum(1 for x in v if x), len(v))})
            pts = [x["pct"] for x in vals if x["pct"] is not None and x["n"] >= 2]
            trend = None if len(pts) < 2 else ("better" if (pts[-1] - pts[0]) * good > 5 else "worse" if (pts[-1] - pts[0]) * good < -5 else "flat")
            rows.append({"key": key, "label": label, "good_direction": good, "months": vals, "trend": trend})
        out.append({"rep": r, "calls": len(rc), "months": months, "rows": rows})
    # setters: triage calls by month
    set_rows = []
    for s in sorted({c.get("setter") for c in triage_calls if c.get("setter")}):
        sc = [c for c in triage_calls if c.get("setter") == s]
        months = sorted({(c.get("date") or "")[:7] for c in sc})
        def per(fn):
            res = []
            for mo in months:
                cs = [c for c in sc if (c.get("date") or "").startswith(mo)]
                v = [fn(c) for c in cs]; v = [x for x in v if x is not None]
                res.append({"month": mo, "n": len(v), "pct": pct(sum(1 for x in v if x), len(v))})
            return res
        set_rows.append({"rep": s, "calls": len(sc), "months": months, "rows": [
            {"key": "price_out", "label": "Price said outside the script range", "good_direction": -1, "months": per(lambda c: (c.get("price_mentioned") or {}).get("within_script_range") is False if (c.get("price_mentioned") or {}).get("said") else None)},
            {"key": "means", "label": "Money gate solid", "good_direction": 1, "months": per(lambda c: ((c.get("gates") or {}).get("means") or {}).get("verdict") == "solid")},
            {"key": "invite", "label": "Invite accepted live (booked calls)", "good_direction": 1, "months": per(lambda c: (c.get("tie_downs") or {}).get("invite_accepted_live") if c.get("result") in ("booked_calendar", "live_transferred") else None)}]})
    return {"closers": out, "setters": set_rows}


# ---------------------------------------------------------------- one-page coaching packs
def coaching_packs(reps_deep, sales, coaching, triage_calls, threads_flags, scrub, ck_label):
    packs = []
    for r in reps_deep:
        rc = [c for c in sales if c["rep"] == r["rep"]]
        ex = []
        for c in sorted(rc, key=lambda c: c.get("date") or "", reverse=True):
            for it in (coaching.get(c["call_id"]) or {}).get("coaching") or []:
                if it.get("priority") == "high" and len(ex) < 6:
                    ex.append({"area": it.get("area"), "label": ck_label(it.get("area")), "issue": scrub(it.get("issue") or ""), "better": scrub(it.get("better") or ""), "call_id": c["call_id"]})
        areas = {}
        for e in ex:
            areas.setdefault(e["area"], e)
        recent = sorted(rc, key=lambda c: c.get("date") or "", reverse=True)[:1]
        packs.append({"rep": r["rep"], "role": "Closer", "calls": r["calls"], "won": r["won"], "avg_score": r["avg_score"],
                      "focus": [{"area": m["area"], "label": m["label"], "n": m["n"]} for m in r["top_mistakes"][:3]],
                      "fixes": list(areas.values())[:3], "keep_doing": r["exemplary"][:2],
                      "listen": [x for x in [{"call_id": r["best_call"], "why": "Best score: what good sounds like"}, {"call_id": r["worst_call"], "why": "Lowest score: hear the misses"},
                                             *[{"call_id": c["call_id"], "why": "Most recent call"} for c in recent]] if x["call_id"]],
                      "numbers": {k: r.get(k) for k in ("close_pct", "obj_resolved_pct", "money_before_pitch_pct", "promise_pct", "off_sheet_pct", "high_flags")}})
    for s in sorted({c.get("setter") for c in triage_calls if c.get("setter")}):
        sc = [c for c in triage_calls if c.get("setter") == s]
        th = C.Counter(it.get("area") for c in sc for it in c.get("coaching") or [])
        fixes = []
        for a, n in th.most_common(3):
            it = next((it for c in sc for it in c.get("coaching") or [] if it.get("area") == a), None)
            c0 = next((c for c in sc for it2 in c.get("coaching") or [] if it2 is it), None)
            if it:
                fixes.append({"area": a, "label": ck_label(a), "issue": scrub(it.get("issue") or ""), "better": scrub(it.get("better") or ""), "call_id": c0["call_id"] if c0 else None, "n": n})
        ex = [{"quote": scrub(e.get("quote") or ""), "why": scrub(e.get("why") or ""), "area": e.get("area"), "call_id": c["call_id"]} for c in sc for e in c.get("exemplary") or []][:2]
        ranked = sorted([c for c in sc if c.get("_score") is not None], key=lambda c: c["_score"])
        tf = [f for f in threads_flags if f.get("rep") == s]
        packs.append({"rep": s, "role": "Setter", "calls": len(sc), "won": None, "avg_score": round(sum(c["_score"] for c in ranked) / len(ranked)) if ranked else None,
                      "focus": [{"area": f["area"], "label": f["label"], "n": f["n"]} for f in fixes], "fixes": fixes, "keep_doing": ex, "kind": "triage",
                      "listen": [x for x in [{"call_id": ranked[-1]["call_id"], "why": "Best score"} if ranked else None, {"call_id": ranked[0]["call_id"], "why": "Lowest score"} if ranked else None] if x],
                      "numbers": {"booked": sum(1 for c in sc if c.get("result") in ("booked_calendar", "live_transferred")), "text_flags": len(tf)}})
    return packs


# ---------------------------------------------------------------- lead priority score from application answers
def lead_score(app):
    if not app or app["base"]["leads"] < 30:
        return None
    rows = app["rows"]; base_b = sum(r["booked"] for r in rows) / len(rows); base_s = sum(r["showed"] for r in rows) / len(rows)
    rules = []
    for f in app["fields"]:
        if f["field"] in ("source", "form", "region", "goal_cats"):
            continue
        for r in f["rows"]:
            if r["leads"] < 8:
                continue
            sr = r["showed"] / r["leads"]
            lift = sr - base_s
            pts = max(-3, min(3, round(lift / max(0.04, base_s) * 2)))
            if pts:
                rules.append({"field": f["label"], "answer": r["value"], "leads": r["leads"], "show_pct": round(100 * sr), "booked_pct": r["booked_pct"], "closed": r["closed"], "points": pts})
    key = {(x["field"], x["answer"]): x["points"] for x in rules}
    lab = {f["field"]: f["label"] for f in app["fields"]}
    def score(r):
        s = 0
        for f, label in lab.items():
            v = r.get(f)
            for vv in (v if isinstance(v, list) else [v]):
                s += key.get((label, vv), 0)
        return s
    for r in rows:
        r["score"] = score(r)
    tiers = []
    for name, lo, hi in [("A: call first", 3, 99), ("B", 1, 2), ("C", -1, 0), ("D: email nurture", -99, -2)]:
        rs = [r for r in rows if lo <= r["score"] <= hi]
        tiers.append({"tier": name, "leads": len(rs), "booked": sum(r["booked"] for r in rs), "showed": sum(r["showed"] for r in rs), "closed": sum(r["closed"] for r in rs),
                      "cash": round(sum(r["cash"] for r in rs)), "show_pct": pct(sum(r["showed"] for r in rs), len(rs))})
    return {"base_show_pct": round(100 * base_s), "base_book_pct": round(100 * base_b), "rules": sorted(rules, key=lambda x: -x["points"]), "tiers": tiers}


# ---------------------------------------------------------------- compliance risk register
def compliance_register(sales, triage_calls, threads, ops):
    def fl(src, items, kind):
        out = []
        for it in items:
            for f in it.get("flags") or []:
                out.append({"src": kind, "id": it.get("call_id") or it.get("lead_id"), "cat": f.get("category"), "sev": f.get("severity"),
                            "text": (f.get("summary") or "") + " " + " ".join(f.get("evidence") or [])})
        return out
    F = fl("closer", sales, "call") + fl("triage", triage_calls, "triage") + fl("text", threads, "thread")
    import re as _re
    topics = [
        ("Credit and loan applications", "Reps collecting SSNs, dates of birth or income for financing, or suggesting what to enter", r"social security|\bssn\b|date of birth|loan app|income|credit (score|check|application)|clarity ?pay|financ"),
        ("Outcome promises and success claims", "Guaranteeing or implying the prospect will find a partner or fix the relationship", r"promis|guarantee|80%|78%|50%|success rate|find (their|a) partner|will find"),
        ("Recording disclosure", "Calls recorded without telling the prospect", r"record(ed|ing)? (disclos|without)|not (told|disclos).*record|recording disclosure|no recording"),
        ("Therapy, licensing and credentials", "Implying therapy, treatment or a licence the coach doesn't hold, or dodging the question", r"therap|licens|counsel|clinical|insurance|credential|certif"),
        ("Crisis and wellbeing disclosures", "Prospects disclosing self-harm, abuse, violence or crisis without care or referral", r"suicid|self-harm|overdose|abuse|assault|violen|crisis|kill"),
        ("Confidentiality", "Sharing another client's details or breaking a confidentiality promise", r"confidential|another client|other client"),
        ("Texting rules and opt-outs", "Texting after a stop request or outside allowed hours", r"opt.?out|\bstop\b|left alone|leave (me|her|him) alone|unsubscribe|quiet hours"),
        ("Refunds and terms", "Refund, cancellation or payment terms promised outside policy", r"refund|cancel(lation)? (option|policy)|30-day|money back|charged"),
        ("Pressure and conduct", "Pressure after a no, false urgency, shaming", r"pressur|urgenc|guilt|shame|push(ed|ing)? (after|past)|mock")]
    reg = []
    for name, desc, rx in topics:
        hits = [f for f in F if _re.search(rx, f["text"], _re.I) or (name.startswith("Pressure") and f["cat"] == "conduct") or (name.startswith("Outcome") and f["cat"] == "outcome_promise") or (name.startswith("Crisis") and f["cat"] == "wellbeing_risk")]
        seen = {}
        for h in hits:
            seen.setdefault((h["src"], h["id"]), h)
        hs = list(seen.values())
        sev = C.Counter(h["sev"] for h in hs)
        reg.append({"risk": name, "what": desc, "cases": len(hs), "critical": sev.get("critical", 0), "high": sev.get("high", 0),
                    "calls": sorted({h["id"] for h in hs if h["src"] == "call"}), "triage": sorted({h["id"] for h in hs if h["src"] == "triage"}), "threads": sorted({h["id"] for h in hs if h["src"] == "thread"})})
    S = (ops or {}).get("sms") or {}
    for r in reg:
        if r["risk"].startswith("Texting"):
            r["measured"] = f"{S.get('quiet_hours_sends', 0)} texts sent before 8am or after 9pm Eastern to {S.get('quiet_hours_leads', 0)} leads; {S.get('texted_after_opt_out', 0)} lead(s) texted again after asking to stop."
    return sorted(reg, key=lambda r: -(r["critical"] * 100 + r["high"] * 10 + r["cases"]))


# ---------------------------------------------------------------- what leads need to hear before the call
def precall_topics(threads, triage_calls, sales, scrub):
    import re as _re
    topics = [
        ("Price expectations", r"\$|price|cost|how much|expensive|afford|invest|thousand|budget", "Price range and payment options before the call, so the closer isn't the first to say a number."),
        ("Is this therapy? Is the coach licensed?", r"therap|licens|counsel|insurance|qualified|certif", "A plain explanation of coaching vs therapy, Kim's/Barak's background, and when we refer out."),
        ("What actually happens on the call", r"what (is|happens)|what('s| is) the call|how long|zoom|video|link|camera", "What the call is, how long it takes, Zoom and video basics, and how to join."),
        ("Is it a matchmaking service?", r"match|introduce|set (me )?up|find (me )?(someone|a)", "What the program is and isn't: coaching, not introductions."),
        ("Does it work for someone like me?", r"too old|my age|work for me|someone like me|different|tried everything|nothing works|skeptic|scam|legit", "Stories from clients like them (age, situation), without outcome promises."),
        ("Timing and commitment", r"busy|schedule|not ready|later|next month|after the holidays|time commitment", "How much time it takes per week and why starting now matters, told honestly.")]
    pool = []
    for t in threads:
        for o in t.get("objections") or []:
            pool.append(("text", t["lead_id"], o.get("quote") or ""))
    for c in triage_calls:
        for o in c.get("objections") or []:
            pool.append(("triage", c["call_id"], o.get("raw_quote") or ""))
    for c in sales:
        for o in c.get("objections") or []:
            if o.get("when_raised") == "before_pitch":
                pool.append(("call", c["call_id"], o.get("raw_quote") or ""))
        for u in c.get("unmet_demand") or []:
            pool.append(("call", c["call_id"], u.get("want") or ""))
    out = []
    for name, rx, asset in topics:
        hits = [p for p in pool if _re.search(rx, p[2], _re.I)]
        out.append({"topic": name, "asset": asset, "mentions": len(hits), "by_source": dict(C.Counter(h[0] for h in hits)),
                    "quotes": [{"src": h[0], "id": h[1], "quote": scrub(h[2])[:220]} for h in hits[:6]]})
    return sorted(out, key=lambda x: -x["mentions"])


# ---------------------------------------------------------------- marketing brief from avatars + applicants
def marketing_brief(av, app, sales, scrub):
    if not av:
        return None
    A = av.get("avatars", [])
    best = sorted([a for a in A if a.get("stats", {}).get("calls")], key=lambda a: (-(a["stats"]["won"] or 0), -(a["stats"]["calls"] or 0)))
    who = []
    if app:
        for f in app["fields"]:
            if f["field"] in ("age_band", "since_relationship", "hours", "matchmaking", "work_cat", "heard"):
                rs = [r for r in f["rows"] if r["leads"] >= 8]
                if rs:
                    top = max(rs, key=lambda r: (r["showed"] / r["leads"]))
                    low = min(rs, key=lambda r: (r["showed"] / r["leads"]))
                    who.append({"field": f["label"], "best": top["value"], "best_show": pct(top["showed"], top["leads"]), "worst": low["value"], "worst_show": pct(low["showed"], low["leads"]), "biggest": max(rs, key=lambda r: r["leads"])["value"]})
    return {"target": [{"name": a["name"], "tagline": a.get("tagline"), "calls": a["stats"]["calls"], "won": a["stats"]["won"], "cash": a["stats"]["cash"],
                        "hooks": a.get("marketing_hooks", []), "words": [q.get("quote") for q in a.get("in_their_words", [])[:4]], "spot": a.get("how_to_spot", [])[:2],
                        "dq": a.get("dq_signals", [])[:2]} for a in best], "who": who, "who_buys": av.get("who_buys"), "icp_gap": av.get("icp_gap")}


# ---------------------------------------------------------------- AI call-review rubric (for Leah's call-review automation)
def review_rubric(playbook, pb_setter, offer_name):
    hard = [("Outcome promise", "Any guarantee or implied promise that the prospect will find a partner or save the relationship, including success-rate figures not in the script."),
            ("Off-sheet price", "Any price, discount, trial or payment structure not on the sanctioned price sheet: " + "; ".join(f"${t['price_usd']:,} {t.get('cadence') or t.get('tier') or ''}".strip() for t in playbook.get("sanctioned_offer", []) if t.get("price_usd")) + "."),
            ("Credit or ID handling", "Rep asks for, hears read aloud, or types an SSN, date of birth or income figure, or suggests what to enter on a financing application."),
            ("Crisis not handled", "Prospect discloses self-harm, suicidal thoughts, abuse, violence or acute crisis and the rep keeps selling without care, a crisis line or a manager note."),
            ("No recording disclosure", "The rep doesn't say the call is recorded in the first minutes."),
            ("Pressure after a clear no", "The rep keeps pushing, shames, or invents urgency after the prospect clearly declines."),
            ("Therapy or credential claims", "Rep implies therapy, treatment, insurance coverage or a licence, or leaves the prospect believing so.")]
    def phases(pb):
        return [{"id": p["id"], "name": p["name"], "weight": p["weight"], "checks": [{"id": c["id"], "text": c["text"]} for c in p["checks"]]} for p in pb["phases"]]
    md = [f"# AI call review rubric: {offer_name}", "", "Use on every recorded sales call and triage call. Score each check hit / partial / miss / not applicable, quote the evidence, and post the summary to Slack within an hour of the call.", "",
          "## Hard flags (any one sends the call to a manager the same day)", ""]
    md += [f"- **{a}**: {b}" for a, b in hard]
    for title, pb in [("Sales call", playbook), ("Triage / setter call", pb_setter)]:
        md += ["", f"## {title}: {pb.get('name', '')}", "", "Score = weighted share of applicable steps (hit 1, partial 0.5, miss 0).", ""]
        for p in phases(pb):
            md.append(f"### {p['id']} {p['name']} (weight {p['weight']})")
            md += [f"- {c['id']}: {c['text']}" for c in p["checks"]]
            md.append("")
    md += ["## Output per call", "", "```json", '{"call_id": "...", "rep": "...", "score": 0, "hard_flags": [{"flag": "...", "quote": "...", "timestamp": "..."}],',
           ' "phases": {"C1": {"score": "hit|partial|miss|n/a", "evidence": "quote"}}, "top_3_coaching": [{"issue": "...", "better": "exact words"}],',
           ' "objections": [{"type": "...", "quote": "...", "handled": "well|partly|poorly|ignored"}], "crm_check": "does the logged outcome match the call?"}', "```", "",
           "## Slack summary format", "", "`[Rep] · [Prospect initials] · Score 62 · ⚑ Off-sheet price` then the three coaching items, each with its better line, then a link to the recording."]
    return {"hard_flags": [{"flag": a, "rule": b} for a, b in hard], "closer": phases(playbook), "setter": phases(pb_setter), "markdown": "\n".join(md)}
