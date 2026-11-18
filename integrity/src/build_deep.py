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
    return {"base": base, "fields": fields, "combos": combos, "rows": rows,
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
