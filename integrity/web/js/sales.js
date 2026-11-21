/* Sales (closer) calls */
SECTIONS.push({
  id: "sales", name: "Sales calls",
  subs: [["summary", "Summary"], ["script", "Script adherence"], ["wonlost", "Won vs not won"], ["objections", "Objections"], ["offer", "Offer & pricing"],
         ["buyers", "Buyers & ICP"], ["integrity", "Integrity flags"], ["reps", "Reps"], ["coaching", "Coaching playbook"], ["library", "Call library"]],
  render: (d, sub) => SALES[sub](d),
});
const PH = d => Object.fromEntries(d.playbook.phases.map(p => [p.id, p]));
const CK = d => Object.fromEntries(d.playbook.phases.flatMap(p => p.checks.map(c => [c.id, { ...c, phase: p.id, phaseName: p.name }])));

const SALES = {
  summary(d) {
    const c = d.closer, s = c.summary, D = c.deep, o = c.offer;
    const wonIds = c.calls.filter(x => x.won).map(x => x.call_id);
    return section("Sales calls at a glance", `${fmt(s.calls)} recorded closer calls scored step by step against ${esc(d.playbook.name)}. Outcomes come from the closer's own End-of-Call report, checked against what actually happened on the recording.`,
      `<div class="grid g6">
        ${tile(fmt(s.calls), "Calls analysed", `${fmt(s.by_source.fathom || 0)} Fathom · ${fmt(s.by_source.zoom || 0)} Zoom · ${fmt(s.by_source.drive || 0)} Drive`, "info")}
        ${tile(drill(fmt(s.won), wonIds, "Won calls"), "New deals", `${s.close_pct}% of analysed calls`, "good")}
        ${tile(fmt(s.avg_score), "Average script score", `Won ${s.won_score} · not won ${s.not_won_score}`)}
        ${tile(fmt(o.calls_with_off_sheet_price), "Calls with an off-sheet price", `of ${o.calls_pitched} pitched`, "bad")}
        ${tile(fmt(o.outcome_promises), "Calls with an outcome promise", `of ${o.calls_pitched} pitched`, "bad")}
        ${tile(fmt(s.high_or_critical_flags), "High or critical flags", `${fmt(s.flags)} flags in total`, "warn")}
      </div>
      <div class="grid g2 mt">
        ${card("Script score by month", cols(D.by_month.map(m => ({ label: niceMonth(m.key), short: niceMonth(m.key).slice(0, 3), value: m.avg_score || 0, tip: `${niceMonth(m.key)}: ${m.calls} calls, avg score ${m.avg_score}, ${m.won} won, ${m.flags} flags` })), { max: 100 }), K("June to August are the departed reps on Fathom. September onward is Makena on Zoom and Drive."))}
        ${card("Score distribution", legend([["var(--s1)", "Won"], ["var(--s2)", "Not won"]]) + cols(D.score_dist.map(b => ({ label: b.key, value: b.won, b: b.not_won, tip: `Score ${b.key}: ${b.won} won, ${b.not_won} not won` }))), "Each column stacks won (blue) on top of not won (orange).")}
      </div>
      <div class="grid g2 mt">
        ${card("Call length and outcome", table([{ l: "Length", k: "key", nosort: 1 }, { l: "Calls", n: 1, f: r => drill(fmt(r.calls), r.call_ids, "Calls " + r.key) }, { l: "Won", k: "won", n: 1 }, { l: "Close rate", n: 1, f: r => r.calls >= d.meta.min_n ? pctS(r.won, r.calls) : '<span class="muted">small n</span>' }], D.length), "Length is a symptom, not a lever. Short calls are usually cut-offs, DQs and reschedules.")}
        ${card("What the CRM says vs what the recording shows", table([{ l: "CRM outcome", k: "crm" }, { l: "Recording shows", f: r => esc(human(r.transcript)) }, { l: "Calls", k: "calls", n: 1 }], D.crm_vs_transcript, { limit: 14 }), `${fmt(c.data_mismatches)} calls carry a data-integrity flag where the logged outcome or terms don't match the recording.`)}
      </div>`, "Sales calls");
  },

  script(d) {
    const c = d.closer, D = c.deep, ph = PH(d);
    const least = D.checks.filter(x => x.applicable >= 5).sort((a, b) => a.run_pct - b.run_pct);
    return section("Script adherence, step by step", "Each call was graded on every step of the closing script. Hit means clearly done, partial means attempted or a weaker version, miss means it applied and didn't happen. Adherence counts a partial as half.",
      `<div class="card">${c.phases.map(p => `<div style="display:grid;grid-template-columns:minmax(150px,240px) 1fr 60px;gap:12px;align-items:center;margin:8px 0" data-tip="${esc(p.name)}: ${p.hit} hit, ${p.partial} partial, ${p.miss} miss, ${p.na} n/a. Weight ${p.weight}.">
        <div><b style="font-family:var(--mono);font-size:12px;color:var(--muted)">${p.id}</b> ${esc(p.name)}</div>${stack(p.hit, p.partial, p.miss, p.na)}<div class="n score" style="text-align:right">${p.adherence_pct}%</div></div>`).join("")}
        ${legend([["var(--good-fill)", "Hit"], ["var(--warn-fill)", "Partial"], ["var(--bad-fill)", "Miss"], ["#d9d6ce", "Not applicable"]])}</div>`, "Sales calls")
    + section("Every check in the script", "All 51 checks, worst first. Click a miss count to open the calls where the rep skipped it.",
      card("", table([{ l: "Check", f: r => `<b class="small muted" style="font-family:var(--mono)">${r.id}</b> ${esc(r.text)}`, s: r => r.id },
        { l: "Step", f: r => esc(r.phase_name), s: r => r.phase }, { l: "Run", n: 1, f: r => heat(r.run_pct), s: r => r.run_pct },
        { l: "Won calls", n: 1, f: r => heat(r.won_pct), s: r => r.won_pct }, { l: "Not won", n: 1, f: r => heat(r.not_won_pct), s: r => r.not_won_pct },
        { l: "Missed", n: 1, f: r => drill(fmt(r.missed), r.missed_ids, `Calls that missed ${r.id}: ${r.text}`), s: r => r.missed },
        { l: "Applied", k: "applicable", n: 1 }], least, { sort: 2, dir: 1 })), "Sales calls")
    + section("Rep by step", "Each closer's adherence on each step, against the team.", card("", table([{ l: "Rep", k: "rep" }, { l: "Calls", k: "calls", n: 1 },
      ...d.playbook.phases.map(p => ({ l: p.id, n: 1, tip: p.name, f: r => heat(r.phases[p.id]), s: r => r.phases[p.id] }))],
      [...D.rep_phase, { rep: "Team", calls: c.summary.calls, phases: D.team_phase }])), "Sales calls");
  },

  wonlost(d) {
    const c = d.closer, D = c.deep;
    const pred = D.checks.filter(x => x.applicable >= 8 && x.won_pct != null && x.not_won_pct != null).map(x => ({ ...x, gap: x.won_pct - x.not_won_pct })).sort((a, b) => b.gap - a.gap);
    const ok = c.question_lift.filter(q => q.sufficient);
    return callout(`Only ${c.summary.won} calls became new deals`, `Every comparison on this page sets ${c.summary.won} won calls against ${c.summary.calls - c.summary.won} that didn't close. One call moves a won percentage by ${Math.round(100 / Math.max(1, c.summary.won))} points. Read these as places to look, not proof of cause. Things "appeared in" won calls; nothing here says they caused the win.`, "warn")
    + section("Step by step: won vs not won", "Adherence on each script step in won calls compared with calls that didn't close.",
      card("", legend([["var(--s1)", "Won"], ["var(--s2)", "Not won"]]) + bars(D.phase_gap.map(p => ({ label: `${p.id} ${p.name}`, value: p.won || 0, b: p.not_won || 0, text: `${p.won ?? "–"} vs ${p.not_won ?? "–"} (${p.gap > 0 ? "+" : ""}${p.gap})`, tip: `${p.name}: won ${p.won}%, not won ${p.not_won}%` })), { max: 100 })), "Won vs not won")
    + section("Checks that separate wins from the rest", "Checks run far more often in won calls sit at the top. Checks run more in lost calls sit at the bottom.",
      `<div class="grid g2">${card("Run more in won calls", table([{ l: "Check", f: r => `<b class="small muted" style="font-family:var(--mono)">${r.id}</b> ${esc(r.text)}` }, { l: "Won", n: 1, f: r => heat(r.won_pct) }, { l: "Not won", n: 1, f: r => heat(r.not_won_pct) }, { l: "Gap", n: 1, f: r => `<b>+${r.gap}</b>` }], pred.slice(0, 10)))}
       ${card("Run more in calls that didn't close", table([{ l: "Check", f: r => `<b class="small muted" style="font-family:var(--mono)">${r.id}</b> ${esc(r.text)}` }, { l: "Won", n: 1, f: r => heat(r.won_pct) }, { l: "Not won", n: 1, f: r => heat(r.not_won_pct) }, { l: "Gap", n: 1, f: r => `<b>${r.gap}</b>` }], pred.slice(-6).reverse()))}</div>`, "Won vs not won")
    + section("Discovery questions in won vs other calls", `How often each question was asked. Questions asked on fewer than ${d.meta.min_n} calls are left out.`,
      card("", legend([["var(--s1)", "Won"], ["var(--s2)", "Not won"]]) + bars(ok.map(q => ({ label: human(q.key), value: q.won_pct, b: q.not_won_pct, html: drill(`${q.won_pct}% vs ${q.not_won_pct}%`, q.call_ids, "Calls where the rep asked: " + human(q.key)), tip: `Asked on ${q.n} calls` })), { max: 100 })), "Won vs not won")
    + section("The money question", "Did the rep find out what the prospect could invest before pitching?",
      `<div class="grid g4">${tile(fmt(D.money_before_pitch.assessed), "Calls checked")}${tile(fmt(D.money_before_pitch.yes), "Money qualified before the pitch", "", D.money_before_pitch.yes ? "" : "bad")}${tile(pctS(D.money_before_pitch.assessed - D.money_before_pitch.yes, D.money_before_pitch.assessed), "Pitched without knowing the budget", "", "bad")}</div>`, "Won vs not won");
  },

  objections(d) {
    const c = d.closer, D = c.deep;
    const tm = D.objection_timing, tot = sum(Object.values(tm));
    return section("Objections on sales calls", "Types match the categories closers already pick in the End-of-Call form. Resolved is strict: the prospect visibly moved past it.",
      `<div class="grid g4">${tile(fmt(tot), "Objections raised")}${tile(pctS(tm.after_price || 0, tot), "Raised after the price", fmt(tm.after_price || 0), "bad")}${tile(pctS(tm.before_pitch || 0, tot), "Raised before the pitch", fmt(tm.before_pitch || 0))}${tile(pctS(sum(c.objections, o => o.resolved), tot), "Resolved on the call", "", "warn")}</div>
      <div class="card mt">${table([{ l: "Objection", f: r => esc(human(r.type)) }, { l: "Times", k: "n", n: 1 }, { l: "Calls", n: 1, f: r => drill(fmt(r.calls), r.call_ids, "Calls with objection: " + human(r.type)), s: r => r.calls },
        { l: "Before pitch", n: 1, f: r => fmt(r.when.before_pitch || 0) }, { l: "After pitch", n: 1, f: r => fmt(r.when.after_pitch || 0) }, { l: "After price", n: 1, f: r => fmt(r.when.after_price || 0) },
        { l: "Resolved", n: 1, f: r => heat(r.resolved_pct, 10, 50), s: r => r.resolved_pct },
        { l: "How reps handled it", nosort: 1, f: r => { const v = D.objection_verdicts[r.type] || {}; const t = sum(Object.values(v)); return t ? `<span class="small">${["handled_well", "partially", "poorly", "ignored"].map(k => v[k] ? `${human(k)} ${v[k]}` : "").filter(Boolean).join(" · ")}</span>` : "–"; } }], c.objections)}</div>`, "Objections")
    + section("What each objection costs", "Calls that didn't close where this objection was raised and never resolved. Arithmetic, not a forecast.",
      card("", bars(D.objection_cost.filter(r => r.lost_unresolved).map(r => ({ label: human(r.type), value: r.lost_unresolved, html: `${drill(r.lost_unresolved + " calls", r.call_ids, "Lost with unresolved " + human(r.type))} <small>${r.share_of_losses}% of losses</small>` })))), "Objections")
    + section("How reps answered, and what to say instead", "Real exchanges from the calls. The prospect's words, the rep's reply, and a better line written to the script.",
      Object.entries(D.objection_better).map(([k, xs]) => card(human(k), xs.map(x => `<div style="margin:0 0 16px">${quote(x.prospect, "Prospect")}${quote(x.rep, "Rep")}${better(x.better)}<div class="small">${openCall(x.call_id, "Open call")}</div></div>`).join(""))).join(""), "Objections")
    + section("Responses used most", "Tactics reps reached for, and how often the objection was resolved afterwards.",
      card("", table([{ l: "Tactic", f: r => esc(human(r.tactic)) }, { l: "Times", k: "n", n: 1 }, { l: "Resolved", n: 1, f: r => heat(r.resolved_pct, 10, 50), s: r => r.resolved_pct }], D.tactics, { limit: 25, sort: 1 })), "Objections");
  },

  offer(d) {
    const c = d.closer, o = c.offer, pq = o.prices_quoted.slice().sort((a, b) => b.calls - a.calls);
    return section("Prices quoted vs the price sheet", `The sanctioned offer is ${o.sanctioned.map(s => `${money(s.price_usd)} for ${s.months} months (${esc(s.cadence)})`).join(", ")}. Anything else said on a call is off-sheet.`,
      `<div class="grid g4">${tile(fmt(o.distinct_prices), "Different prices quoted", "The sheet has " + o.sanctioned.length, "bad")}${tile(fmt(o.calls_with_off_sheet_price), "Calls with an off-sheet price", "of " + o.calls_pitched + " pitched", "bad")}${tile(fmt(o.price_before_temperature_check), "Price before the temperature check", "", "warn")}${tile(fmt(o.payment_plan_offered), "Payment plan offered", "of " + o.calls_pitched + " pitched")}</div>
      <div class="card mt">${legend([["var(--s1)", "On the price sheet"], ["var(--s2)", "Not on the sheet"]])}${bars(pq.map(p => ({ label: money(p.price_usd), value: p.calls, color: p.sanctioned ? "var(--s1)" : "var(--s2)", html: drill(p.calls + (p.calls === 1 ? " call" : " calls"), p.call_ids, "Calls quoting " + money(p.price_usd)), tip: `${money(p.price_usd)} said ${p.times} times on ${p.calls} calls` })))}</div>`, "Offer")
    + section("Outcome promises, in the reps' words", "The closing script forbids promising a relationship outcome. These are direct quotes.",
      card("", o.outcome_promise_examples.map(q => quote(q)).join("")) + callout("Why this matters", "A success-rate claim on a recorded sales call is the first thing a chargeback dispute or a regulator asks about." + K(" None of the figures quoted (50%, 78%, 80%) appear in the script, and they don't agree with each other."), "bad"), "Offer")
    + section("The four pillars", "How prospects reacted when the rep presented each pillar of the program.",
      card("", table([{ l: "Pillar", f: r => esc(human(r.k)) }, ...["enthusiastic", "accepted", "clarifying", "confused", "objected", "not_presented"].map(x => ({ l: human(x), n: 1, f: r => fmt(r.v[x] || 0) }))],
        Object.entries(c.pillars).map(([k, v]) => ({ k, v })))), "Offer")
    + section("How the offer was presented", "", `<div class="grid g4">${tile(fmt(o.one_tier_recommended), "Recommended one option")}${tile(fmt(o.all_tiers_dumped), "Listed every tier")}${tile(fmt(o.calls_pitched), "Calls that reached a pitch")}</div>`, "Offer")
    + section("What prospects asked for that the offer doesn't cover", "", card("", table([{ l: "They wanted", k: "want" }, { l: "Verdict", f: r => esc(human(r.verdict)) }, { l: "", nosort: 1, f: r => openCall(r.call_id) }], c.deep.unmet)), "Offer");
  },

  buyers(d) {
    const c = d.closer, D = c.deep;
    const t = (rows, title) => card(title, table([{ l: "", f: r => esc(human(r.key)) }, { l: "Calls", n: 1, f: r => drill(fmt(r.calls), r.call_ids, title + ": " + human(r.key)), s: r => r.calls }, { l: "Won", k: "won", n: 1 }, { l: "Close rate", n: 1, f: r => r.calls >= d.meta.min_n ? pctS(r.won, r.calls) : '<span class="muted">small n</span>', s: r => r.won / r.calls }], rows.filter(r => r.calls >= 2)));
    return section("Who gets on the calls", `Read from what prospects said on the sales calls: ${fmt(c.genders.man || 0)} men and ${fmt(c.genders.woman || 0)} women across ${fmt(c.summary.calls)} calls.`,
      `<div class="grid g2">${t(c.segments, "Segment")}${t(D.icp, "ICP fit")}</div><div class="grid g2 mt">${t(c.pains, "Pains they described")}${t(c.goals, "What they want")}</div>`, "Buyers")
    + section("Which ICP criteria fail", "When a prospect falls outside the ideal client profile, this is the reason.",
      card("", table([{ l: "Criterion", f: r => esc(human(r.key)) }, { l: "Missed on", n: 1, f: r => drill(fmt(r.missed), r.call_ids, "Calls missing: " + human(r.key)), s: r => r.missed }, { l: "Still won", k: "won_when_missed", n: 1 }], D.icp_criteria)), "Buyers")
    + section("Their dream outcome, in their words", "Use these in ads, emails and on the sales page. Prospect language converts better than ours.",
      `<div class="grid g2">${D.dreams.map(x => `<div class="card">${quote(x.quote, `${x.won ? "Bought" : "Didn't buy"} · ${human(x.segment)} · ${openCall(x.call_id, "call")}`)}</div>`).join("")}</div>`, "Buyers")
    + section("Buyer language", "Phrases prospects used to describe their problem.",
      card("", D.language.slice(0, 60).map(x => `<span class="chip ${x.won ? "good" : ""}" style="margin:3px">${esc(x.quote)}</span>`).join(""), "Green chips came from calls that closed."), "Buyers");
  },

  integrity(d) {
    const c = d.closer, sevs = ["critical", "high", "medium", "low"];
    return section("Integrity flags on sales calls", "Things that create legal, refund or reputation risk, or break the script's own rules. Critical means harm or legal exposure. High means a real money or trust consequence.",
      `<div class="grid g4">${tile(fmt(c.summary.flags), "Flags")}${tile(fmt(sum(c.flag_categories, f => f.severity.critical || 0)), "Critical", "", "bad")}${tile(fmt(sum(c.flag_categories, f => f.severity.high || 0)), "High", "", "warn")}${tile(fmt(new Set(c.top_flags.map(f => f.call_id)).size), "Calls with a high or critical flag")}</div>
      <div class="card mt">${table([{ l: "Category", f: r => esc(human(r.category)) }, { l: "Flags", k: "n", n: 1 }, { l: "Calls", n: 1, f: r => drill(fmt(r.calls), r.call_ids, "Calls flagged: " + human(r.category)), s: r => r.calls }, ...sevs.map(s => ({ l: human(s), n: 1, f: r => fmt(r.severity[s] || 0) })), { l: "Reps", f: r => esc(r.reps.join(", ")) }], c.flag_categories)}</div>`, "Integrity")
    + section("Every high and critical flag", "Filter by category or search. Each one links to the call.", flagTable(c.top_flags, { who: "Rep" }), "Integrity");
  },

  reps(d) {
    const c = d.closer, D = c.deep;
    return callout("Compare with care", isKRC() ? "Brianna, Elly and Mariah were June to August and have since left. Makena is September onward. Different months, different lead flow, small numbers per rep." : "Small numbers per rep. Read differences as places to look.", "warn")
    + section("Closers", "", card("", table([{ l: "Rep", k: "rep" }, { l: "Calls", n: 1, f: r => drill(fmt(r.calls), r.call_ids, "Calls by " + r.rep), s: r => r.calls }, { l: "Won", k: "won", n: 1 },
      { l: "Script score", n: 1, f: r => heat(r.avg_score, 35, 70, ""), s: r => r.avg_score }, { l: "Flags", k: "flags", n: 1 }, { l: "High+", k: "high_flags", n: 1 },
      { l: "Promises", k: "outcome_promises", n: 1 }, { l: "Off-sheet price", k: "off_sheet_price_calls", n: 1 }], c.reps)), "Reps")
    + `<div class="grid g2">${c.reps.map(r => {
      const rp = D.rep_phase.find(x => x.rep === r.rep) || { phases: {} };
      const best = d.playbook.phases.map(p => ({ p, v: (rp.phases[p.id] ?? 0) - (D.team_phase[p.id] ?? 0) })).sort((a, b) => b.v - a.v);
      return card(`${esc(r.rep)} <span class="chip">${r.calls} calls</span>`, `<dl class="kv"><dt>Ahead of the team on</dt><dd>${best.slice(0, 2).map(x => `${esc(x.p.name)} (${x.v > 0 ? "+" : ""}${x.v})`).join(", ")}</dd>
        <dt>Behind the team on</dt><dd>${best.slice(-2).reverse().map(x => `${esc(x.p.name)} (${x.v})`).join(", ")}</dd></dl>
        <div class="mt">${bars(d.playbook.phases.map(p => ({ label: p.name, value: rp.phases[p.id] || 0, b: D.team_phase[p.id] || 0, text: `${rp.phases[p.id] ?? "–"} vs ${D.team_phase[p.id] ?? "–"}` })), { max: 100 })}</div>`, "Blue is this rep, orange is the team.");
    }).join("")}</div>`;
  },

  coaching(d) {
    const D = d.closer.deep;
    return section("The coaching playbook", `Built from ${fmt(D.coached_calls)} calls. Each theme is a moment reps get wrong again and again, with real examples and the exact words to use instead. This is the training material for Sid and the AI call review.`,
      D.coach_themes.map(t => card(`<span class="small muted" style="font-family:var(--mono)">${esc(t.area)}</span> ${esc(t.label)} <span class="chip">${t.n} calls</span>`,
        t.examples.map(x => `<div style="margin:0 0 14px"><p class="issue">${esc(x.issue)}</p>${better(x.better)}<div class="small muted">${esc(x.rep)} · ${openCall(x.call_id, "open call")}</div></div>`).join(""))).join(""), "Coaching")
    + section("Moments worth copying", "Real lines from the calls where the rep did it well. Use them in training.",
      `<div class="grid g2">${D.exemplary.slice(0, 40).map(x => `<div class="card">${quote(x.quote, `${esc(x.rep)} · ${esc(x.area)} · ${x.won ? "won call" : "not won"} · ${openCall(x.call_id, "open")}`)}<p class="small muted" style="margin:6px 0 0">${esc(x.why)}</p></div>`).join("")}</div>`, "Coaching");
  },

  async library(d) {
    const c = d.closer, L = await lib("calls");
    const ids = state.drill ? new Set(state.drill) : null;
    const rows = c.calls.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    setTimeout(() => {
      const el = $("#calllib"); if (!el) return;
      const run = () => { const rep = $("#lr").value, o = $("#lo").value, q = $("#lq").value.toLowerCase(), ag = $("#la").value, av = $("#lv").value; let n = 0;
        el.querySelectorAll("tbody tr").forEach(tr => { const ok = (!rep || tr.dataset.rep === rep) && (!o || tr.dataset.won === o) && (!ag || tr.dataset.age === ag) && (!av || tr.dataset.av === av) && (!q || tr.textContent.toLowerCase().includes(q)); tr.hidden = !ok; n += ok; }); $("#ln").textContent = n + " calls"; };
      document.querySelectorAll("#lr,#lo,#lq,#la,#lv").forEach(i => i.addEventListener("input", run)); run();
    });
    return section("Call library", "Every analysed sales call. Click any row for the full scorecard: step grades with evidence, coaching with better lines, the objection timeline, flags and the prospect's profile.",
      `<div class="filters"><select id="lr"><option value="">All reps</option>${[...new Set(rows.map(r => r.rep))].map(r => `<option>${esc(r)}</option>`).join("")}</select>
       <select id="lo"><option value="">All outcomes</option><option value="1">Won</option><option value="0">Not won</option></select>
       <select id="la"><option value="">Any age</option>${[...new Set(Object.values(L).map(x => x.application?.age_band).filter(Boolean))].sort().map(v => `<option>${esc(v)}</option>`).join("")}</select>
       <select id="lv"><option value="">Any avatar</option>${[...new Set(Object.values(L).map(x => x.avatar).filter(Boolean))].sort().map(v => `<option>${esc(v)}</option>`).join("")}</select><input id="lq" type="search" placeholder="Search notes"><span id="ln" class="small muted"></span></div>
       <div class="card tw" id="calllib"><table><thead><tr><th>Date</th><th>Rep</th><th>Prospect</th><th>Avatar</th><th>Age</th><th>CRM outcome</th><th class="n">Score</th><th class="n">Min</th><th>Flags</th><th>Summary</th></tr></thead><tbody>
       ${rows.map(x => { const k = (L[x.call_id] || {}).coaching || {}; const hi = (x.flags || []).filter(f => ["high", "critical"].includes(f.severity)).length;
         return `<tr class="lib-row" data-call="${esc(x.call_id)}" data-rep="${esc(x.rep)}" data-won="${x.won ? 1 : 0}" data-age="${esc((L[x.call_id] || {}).application?.age_band || "")}" data-av="${esc((L[x.call_id] || {}).avatar || "")}"><td style="white-space:nowrap">${esc(niceDate(x.date))}</td><td>${esc(x.rep)}</td><td>${esc(x.prospect)}</td><td>${esc((L[x.call_id] || {}).avatar || human(x.segment))}</td><td>${esc((L[x.call_id] || {}).application?.age_band || "–")}</td><td>${x.won ? chip(x.crm_outcome, "good") : esc(x.crm_outcome || "–")}</td><td class="n score">${fmt(x.score)}</td><td class="n">${fmt(x.duration_min)}</td><td>${(x.flags || []).length}${hi ? " " + chip(hi + " high", "bad") : ""}</td><td class="small" style="min-width:280px">${esc(k.summary || x.coach_note || "")}</td></tr>`; }).join("")}
       </tbody></table></div>`, "Library");
  },
};

/* ---------- full scorecard ---------- */
async function callScorecard(id) {
  const [d, L] = await Promise.all([getJSON(offerObj().data + ".json"), lib("calls")]);
  const c = L[id]; if (!c) return `<p>Call not found.</p>`;
  const ph = PH(d), ck = CK(d), k = c.coaching || {}, A = (c.adherence || {}).phases || {};
  const out = c.won ? chip("Closed", "good") : chip(c.crm.outcome || "Unknown");
  const prof = c.profile || {};
  return `<div class="kicker">Sales call scorecard</div>
  <div class="sc-head"><h2 style="margin:0">${esc(c.prospect)} with ${esc(c.rep)}</h2>${out}${chip(niceDate(c.date))}${chip((c.duration_min || "?") + " min")}${chip(human(c.source))}</div>
  <div class="grid g4 mt">${tile(`<span class="sc-score">${fmt(c.score)}</span>`, "Script score", "weighted, out of 100", c.score >= 60 ? "good" : c.score >= 45 ? "warn" : "bad")}${tile(esc(human(c.segment?.assigned)), "Segment", esc((c.segment?.signals || []).slice(0, 2).join("; ")))}${tile(esc(human(c.icp?.fit)), "ICP fit", esc(c.icp?.note || ""))}${tile(c.crm.cash ? money(c.crm.cash) : "–", "Cash collected", esc([c.crm.payment_type, c.crm.product].filter(Boolean).join(" · ")))}</div>
  ${k.summary ? `<div class="card mt"><h3>What happened</h3><p style="margin:0">${esc(k.summary)}</p>${k.turning_point ? `<h4>Turning point</h4><p style="margin:0">${esc(k.turning_point.what)}</p>${quote(k.turning_point.quote, k.turning_point.timestamp)}` : ""}</div>` : ""}
  ${(k.coaching || []).length ? `<div class="card"><h3>Coaching</h3>${k.coaching.map(x => `<div style="margin:0 0 14px"><div class="meta">${chip(x.priority + " priority", x.priority === "high" ? "bad" : x.priority === "medium" ? "warn" : "")} ${chip((x.area || "") + " " + ((ck[x.area] || ph[x.area] || {}).text || (ph[x.area] || {}).name || ""))} <span class="small muted">${esc(x.timestamp || "")}</span></div><p class="issue">${esc(x.issue)}</p>${better(x.better)}</div>`).join("")}</div>` : ""}
  <div class="card"><h3>Every step of the script</h3><div class="phase-grid">${d.playbook.phases.map(p => { const a = A[p.id] || {}; return `<div class="ph ${esc(a.score || "")}"><div class="t"><span>${p.id} ${esc(p.name)}</span><span class="small">${esc(human(a.score || "–"))}</span></div>
    <div class="ck">${p.checks.map(x => `<span class="${esc((a.checks || {})[x.id] || "na")}" data-tip="${esc(x.text)}: ${esc(human((a.checks || {})[x.id] || "not scored"))}">${x.id}</span>`).join("")}</div>${a.evidence ? `<div class="ev">${esc(a.evidence)}</div>` : ""}</div>`; }).join("")}</div>
    ${c.adherence?.coach_note ? `<p class="cap">${esc(c.adherence.coach_note)}</p>` : ""}</div>
  ${(k.objection_timeline || c.objections || []).length ? `<div class="card"><h3>Objection timeline</h3><div class="tl">${(k.objection_timeline || []).length ? k.objection_timeline.map(o => `<div class="it"><div class="meta">${chip(human(o.type))} ${chip(human(o.verdict), o.verdict === "handled_well" ? "good" : o.verdict === "partially" ? "warn" : "bad")} <span class="small muted">${esc(o.timestamp || "")}</span></div>${quote(o.prospect_quote, "Prospect")}${o.rep_quote ? quote(o.rep_quote, "Rep") : ""}${o.better ? better(o.better) : ""}</div>`).join("")
      : c.objections.map(o => `<div class="it"><div class="meta">${chip(human(o.type))} ${chip(human(o.when_raised))} ${chip(o.resolved ? "Resolved" : "Not resolved", o.resolved ? "good" : "bad")}</div>${quote(o.raw_quote, "Prospect")}<p class="small">${esc(o.rep_response || "")}</p></div>`).join("")}</div></div>` : ""}
  ${c.offer?.presented ? `<div class="card"><h3>The offer as presented</h3><div class="kv"><dt>Prices quoted</dt><dd>${(c.offer.tiers_quoted || []).map(t => `${money(t.price_usd)} ${esc(t.label || "")} ${t.months ? "· " + t.months + " months" : ""}`).join("<br>") || "–"}</dd>
    <dt>Price before temperature check</dt><dd>${c.offer.price_before_temperature_check ? "Yes" : "No"}</dd><dt>Payment plan offered</dt><dd>${c.offer.payment_plan_offered ? "Yes" : "No"}</dd><dt>Financing offered</dt><dd>${c.offer.financing_partner_offered ? "Yes" : "No"}</dd>
    ${k.price_moment?.quote ? `<dt>Price moment</dt><dd>${quote(k.price_moment.quote, k.price_moment.timestamp)}${k.price_moment.prospect_reaction ? quote(k.price_moment.prospect_reaction, "Prospect reaction") : ""}</dd>` : ""}
    ${c.offer.outcome_promise_quote ? `<dt>Outcome promise</dt><dd>${quote(c.offer.outcome_promise_quote)}</dd>` : ""}</div></div>` : ""}
  ${(c.flags || []).length ? `<div class="card"><h3>Integrity flags</h3>${c.flags.map(f => `<div style="margin:0 0 12px"><div class="meta">${sev(f.severity)} ${chip(human(f.category))} <span class="small muted">${esc(f.timestamp || "")}</span></div><p style="margin:2px 0">${esc(f.summary)}</p>${(f.evidence || []).map(q => quote(q)).join("")}</div>`).join("")}</div>` : ""}
  ${(k.exemplary || []).length ? `<div class="card"><h3>Done well</h3>${k.exemplary.map(x => `${quote(x.quote, `${esc(x.area)} · ${esc(x.timestamp || "")}`)}<p class="small muted" style="margin:0 0 10px">${esc(x.why)}</p>`).join("")}</div>` : ""}
  ${c.application ? `<div class="card"><h3>What they said on the application</h3><dl class="kv">${[["Age", c.application.age_band], ["Single for", c.application.since_relationship], ["Hours worked", c.application.hours], ["Coaching vs matchmaking", c.application.matchmaking], ["Able to invest", c.application.invest], ["Heard via", c.application.heard], ["Location", c.application.region], ["Work", human(c.application.work_cat)], ["#1 challenge", (c.application.challenge_cats || []).map(human).join(", ")], ["Money signal", human(c.application.money_signal)]].filter(x => x[1]).map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join("")}</dl></div>` : ""}
  ${c.avatar ? `<p class="small">Avatar: <b>${esc(c.avatar)}</b></p>` : ""}
  <div class="grid g2"><div class="card"><h3>The prospect</h3><dl class="kv">${[["Gender", prof.gender], ["Age", prof.age], ["Status", human(prof.relationship_status)], ["Divorced", prof.divorced == null ? null : prof.divorced ? "Yes" : "No"], ["Kids", prof.has_kids == null ? null : prof.has_kids ? "Yes" : "No"], ["Occupation", prof.occupation], ["Apps", (prof.apps_used || []).join(", ")], ["Tried before", (prof.prior_help || []).join(", ")]].filter(x => x[1]).map(([a, b]) => `<dt>${a}</dt><dd>${esc(b)}</dd>`).join("")}</dl>
    ${c.dream ? `<h4>Dream outcome</h4>${quote(c.dream)}` : ""}</div>
    <div class="card"><h3>Pains and goals</h3>${(c.pains || []).map(p => `<div class="small" style="margin:3px 0">${chip(human(p.category), p.severity === "critical" || p.severity === "high" ? "bad" : "")} ${esc(p.text)}</div>`).join("")}<h4>Goals</h4>${(c.goals || []).map(p => `<div class="small" style="margin:3px 0">${chip(human(p.category), "info")} ${esc(p.text)}</div>`).join("")}</div></div>
  <div class="grid g2"><div class="card"><h3>Questions the rep asked</h3><ol class="small" style="margin:0;padding-left:18px">${(c.questions || []).map(q => `<li><b>${esc(human(q.key))}</b>: ${esc(q.quote)}</li>`).join("")}</ol></div>
    <div class="card"><h3>CRM record vs recording</h3><dl class="kv"><dt>CRM outcome</dt><dd>${esc(c.crm.outcome || "–")}</dd><dt>Recording shows</dt><dd>${esc(human(c.transcript_outcome?.disposition))} (${Math.round(100 * (c.transcript_outcome?.confidence || 0))}% confidence)</dd><dt>Call type</dt><dd>${esc(c.crm.call_type || "–")}</dd><dt>Contract value</dt><dd>${c.crm.contract ? money(c.crm.contract) : "–"}</dd><dt>Closer's note</dt><dd>${esc(c.crm.no_close || "–")}</dd></dl>
    ${(c.transcript_outcome?.evidence || []).map(q => quote(q)).join("")}</div></div>
  ${(k.talk_track_deviations || []).length ? `<div class="card"><h3>Off-script statements</h3><ul class="small">${k.talk_track_deviations.map(x => `<li>${esc(x)}</li>`).join("")}</ul></div>` : ""}
  <p class="small muted">Transcript quality: ${esc(c.quality?.diarization || "?")}. ${esc(c.quality?.notes || "")}</p>`;
}
