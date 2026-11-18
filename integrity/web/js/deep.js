/* v3 depth: applicants, avatars, objection deep-dive, rep head-to-head, calls to review, trends */
(function () {
  const S = id => SECTIONS.find(s => s.id === id);
  S("leads").subs.splice(1, 0, ["applicants", "Applicants"], ["explorer", "Lead explorer"]);
  const sales = S("sales");
  sales.subs.splice(1, 0, ["avatars", "Avatars"]);
  const oi = sales.subs.findIndex(x => x[0] === "objections");
  sales.subs.splice(oi + 1, 0, ["objdeep", "Objection deep-dive"]);
  const ri = sales.subs.findIndex(x => x[0] === "reps");
  sales.subs.splice(ri + 1, 0, ["review", "Calls to review"], ["trends", "Trends"]);
})();

const funCols = (first, kind = "value") => [
  { l: first, f: r => `<b>${esc(human(r[kind]))}</b>`, s: r => r[kind] }, { l: "Leads", k: "leads", n: 1 },
  { l: "Booked", n: 1, f: r => `${fmt(r.booked)} ${heat(r.booked_pct ?? 0, 20, 55)}`, s: r => r.booked_pct },
  { l: "Team cancelled", k: "team_cancelled", n: 1 }, { l: "Showed", n: 1, f: r => `${fmt(r.showed)} <span class="muted small">${r.show_pct ?? "–"}${r.show_pct != null ? "%" : ""}</span>`, s: r => r.showed },
  { l: "DQ'd", k: "dq", n: 1 }, { l: "Closed", n: 1, f: r => r.closed ? `<b style="color:var(--good)">${r.closed}</b>` : "0", s: r => r.closed },
  { l: "Cash", n: 1, f: r => money(r.cash), s: r => r.cash },
  { l: "Sales calls", n: 1, f: r => (r.call_ids || []).length ? drill(fmt(r.call_ids.length), r.call_ids, `Sales calls: ${human(r[kind])}`) : "–", s: r => (r.call_ids || []).length }];

LEADS.applicants = d => {
  const A = d.applicants; if (!A) return card("", "No application data.");
  const b = A.base, F = k => A.fields.find(f => f.field === k);
  return section("Who applies, and who buys", `Application answers are posted to Close as a note on each lead, not as fields, so Close can't filter on them. We parsed every one: ${fmt(A.forms.ad_application || 0)} from the ad application (the men's form) and ${fmt(A.forms.booking_questions || 0)} from the Calendly booking questions, and joined them to bookings, shows, closes and cash.`,
    `<div class="journey">${[["Applicants", b.leads], ["Contacted", b.contacted], ["Booked", b.booked], ["Showed", b.showed], ["DQ'd on the call", b.dq], ["Closed", b.closed]].map(([k, v], i) => `<div class="jstep"><div class="v">${fmt(v)}</div><div class="l">${k}</div><div class="c">${pctS(v, b.leads)} of applicants</div><div class="bar" style="width:${Math.max(2, 100 * v / b.leads)}%"></div></div>`).join("")}</div>
    ${callout("The ad application never asks about money", `Of applicants who answered the hours question, ${fmt(sum(F("hours").rows.filter(r => ["Retired", "Unemployed / Not working"].includes(r.value)), r => r.leads))} are retired or not working. The form has no investment question, so setters and closers find out on the call. The booking-form question "Are you able to invest?" screens people well: everyone who answered no stayed off the calendar.`, "warn")}`, "Applicants")
  + section("Profiles worth knowing about", "Combinations of answers and what happened to those people.", card("", table(funCols("Group", "name"), A.combos)), "Applicants")
  + A.fields.filter(f => f.rows.length > 1 && f.field !== "source").map(f => section(esc(f.label), `${fmt(f.answered)} of ${fmt(b.leads)} applicants answered.`,
      `<div class="card">${table(funCols("Answer"), f.field === "region" ? f.rows.slice(0, 12) : f.rows, { sort: 1 })}</div>`, "Applicants")).join("")
  + callout("Fix for Leah", "Map every application answer to its own Close custom field (age band, time single, hours, matchmaking answer, investment answer, how they heard) instead of a note. Then Close smart views, the setter's queue and the speed-to-lead alerts can all sort by fit. Mitch: add an investment question to the ad application, worded like the booking form's.", "");
};

LEADS.explorer = d => {
  const A = d.applicants; if (!A) return "";
  const keys = ["age_band", "since_relationship", "hours", "matchmaking", "invest", "heard", "work_cat", "money_signal", "source", "form"];
  const opts = k => [...new Set(A.rows.map(r => r[k]).filter(Boolean))].sort();
  setTimeout(() => {
    const run = () => {
      const f = {}; keys.forEach(k => { const v = $("#ex_" + k)?.value; if (v) f[k] = v; });
      const ch = $("#ex_ch").value;
      const rs = A.rows.filter(r => Object.entries(f).every(([k, v]) => r[k] === v) && (!ch || (r.challenge_cats || []).includes(ch)));
      const n = rs.length, c = k => rs.filter(r => r[k]).length;
      $("#ex_out").innerHTML = `<div class="journey">${[["Applicants", n], ["Booked", c("booked")], ["Team cancelled", c("team_cancelled")], ["Showed", c("showed")], ["DQ'd", c("dq")], ["Closed", c("closed")]].map(([k, v]) => `<div class="jstep"><div class="v">${fmt(v)}</div><div class="l">${k}</div><div class="c">${pctS(v, n)}</div></div>`).join("")}</div>
        <div class="card mt tw"><table><thead><tr><th>Applied</th><th>Age</th><th>Single for</th><th>Hours</th><th>Expects</th><th>Work</th><th>Challenge</th><th>Source</th><th class="n">First touch</th><th>Outcome</th><th>Calls</th></tr></thead><tbody>
        ${rs.slice(0, 300).map(r => `<tr><td>${esc(niceMonth(r.month))}</td><td>${esc(r.age_band || "–")}</td><td>${esc(r.since_relationship || "–")}</td><td>${esc(r.hours || "–")}</td><td>${esc(r.matchmaking || "–")}</td><td>${esc(human(r.work_cat || "–"))}</td><td class="small">${esc((r.challenge_cats || []).map(human).join(", "))}</td><td>${esc(r.source)}</td><td class="n">${mins(r.mins)}</td>
          <td>${r.closed ? chip("Closed", "good") : r.dq ? chip("DQ'd", "bad") : r.showed ? chip("Showed", "info") : r.team_cancelled ? chip("Team cancelled", "warn") : r.booked ? chip("Booked", "info") : r.mins == null ? chip("Never contacted", "bad") : chip("Not booked")}</td>
          <td>${(r.call_ids || []).map(id => openCall(id, "sales call")).join(" ")}</td></tr>`).join("")}</tbody></table>${rs.length > 300 ? `<p class="cap">Showing 300 of ${rs.length}.</p>` : ""}</div>`;
    };
    document.querySelectorAll(".exf").forEach(s => s.addEventListener("input", run)); run();
  });
  const label = { age_band: "Age", since_relationship: "Single for", hours: "Hours", matchmaking: "Coaching vs matchmaking", invest: "Can invest", heard: "Heard via", work_cat: "Work", money_signal: "Money signal", source: "Lead source", form: "Form" };
  return section("Lead explorer", "Filter applicants by any answer and see what happened to them. Every row is one person, shown without a name.",
    `<div class="card"><div class="filters">${keys.map(k => `<label class="small muted">${label[k]}<br><select class="exf" id="ex_${k}"><option value="">Any</option>${opts(k).map(v => `<option value="${esc(v)}">${esc(human(v))}</option>`).join("")}</select></label>`).join("")}
      <label class="small muted">Challenge<br><select class="exf" id="ex_ch"><option value="">Any</option>${[...new Set(A.rows.flatMap(r => r.challenge_cats || []))].sort().map(v => `<option value="${esc(v)}">${esc(human(v))}</option>`).join("")}</select></label></div></div>
    <div id="ex_out" class="mt"></div>`, "Explorer");
};

/* ---------- avatars ---------- */
SALES.avatars = d => {
  const AV = d.avatars;
  if (!AV) return card("", `<div class="pending"><h3>Avatars are being built</h3><p>Every sales call is being sorted into named buyer profiles. This tab fills in on the next update.</p></div>`);
  const as = AV.avatars;
  return section("Buyer avatars", `${as.length} avatars built from every scored sales call, the closers' notes and the text conversations. Close rates come from the CRM.`,
    `<div class="card tw"><table><thead><tr><th>Avatar</th><th>Who</th><th class="n">Calls</th><th class="n">Won</th><th class="n">Close rate</th><th class="n">Cash</th><th>Top objection</th></tr></thead><tbody>
      ${as.map(a => `<tr><td><a href="#av_${esc(a.id)}"><b>${esc(a.name)}</b></a><div class="small muted">${esc(a.tagline)}</div></td><td class="small">${esc(a.profile?.gender || "")}${a.profile?.age ? ", " + esc(a.profile.age) : ""}</td><td class="n">${drill(fmt(a.stats.calls), a.call_ids, a.name)}</td><td class="n">${fmt(a.stats.won)}</td><td class="n">${a.stats.calls >= 5 ? heat(a.stats.close_pct, 5, 30) : '<span class="muted">small n</span>'}</td><td class="n">${money(a.stats.cash)}</td><td class="small">${esc(human(a.stats.objections[0]?.[0] || "–"))}</td></tr>`).join("")}</tbody></table></div>
    ${AV.who_buys ? callout("Who buys and who doesn't", esc(AV.who_buys), "good") : ""}${AV.icp_gap ? callout("The script's client vs the real one", esc(AV.icp_gap), "warn") : ""}`, "Avatars")
  + as.map(a => `<div id="av_${esc(a.id)}">` + section(esc(a.name), esc(a.tagline),
    `<div class="grid g6">${tile(fmt(a.stats.calls), "Sales calls")}${tile(a.stats.calls >= 5 ? a.stats.close_pct + "%" : fmt(a.stats.won) + " won", "Close rate", "", "good")}${tile(money(a.stats.cash), "Cash collected")}${tile(fmt(a.stats.avg_score), "Avg script score on their calls")}${tile(`${a.stats.men}/${a.stats.women}`, "Men / women")}${tile(fmt(a.stats.promise_calls), "Calls with an outcome promise", "", a.stats.promise_calls ? "bad" : "")}</div>
    <div class="grid g2 mt">${card("Who they are", `<p style="margin-top:0">${esc(a.who)}</p><dl class="kv">${Object.entries(a.profile || {}).filter(([, v]) => v).map(([k, v]) => `<dt>${esc(human(k))}</dt><dd>${esc(v)}</dd>`).join("")}${a.stats.age_bands.length ? `<dt>Ages on the application</dt><dd>${a.stats.age_bands.map(([k, n]) => `${esc(k)} (${n})`).join(", ")}</dd>` : ""}</dl>`)}
      ${card("In their words", (a.in_their_words || []).map(q => quote(q.quote, openCall(q.call_id, "call"))).join(""))}</div>
    <div class="grid g3 mt">${card("What they want", `<ul>${(a.goals || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}${card("What hurts", `<ul>${(a.pains || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}${card("What they need vs what we sell", `<p style="margin:0">${esc(a.what_they_need_vs_what_we_sell)}</p>`)}</div>
    <div class="grid g2 mt">${card("How a setter spots them", `<ul>${(a.how_to_spot || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}${card("How to sell them", `<ul>${(a.how_to_sell || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}</div>
    <div class="grid g2 mt">${card("Their objections, and what they really mean", (a.objections || []).map(o => `<div style="margin:0 0 12px">${chip(human(o.type))}<p class="small" style="margin:4px 0">${esc(o.what_it_really_means)}</p>${quote(o.quote, openCall(o.call_id, "call"))}</div>`).join(""))}
      <div>${card("What kills the deal", `<ul>${(a.what_kills_the_deal || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}${card("Not a fit right now if…", `<ul>${(a.dq_signals || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}</div></div>
    <div class="grid g2 mt">${card("Marketing hooks in their language", `<ul>${(a.marketing_hooks || []).map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}${card("Listen to these two calls", `${a.best_call_id ? `<p>${chip("Right way", "good")} ${openCall(a.best_call_id, "Open the best call for this avatar")}</p>` : ""}${a.worst_call_id ? `<p>${chip("Wrong way", "bad")} ${openCall(a.worst_call_id, "Open the call that shows what not to do")}</p>` : ""}`)}</div>`, "Avatar") + `</div>`).join("")
  + (AV.universal_objections?.length ? section("Objections every avatar raises", "", card("", AV.universal_objections.map(o => `<div style="margin:0 0 12px">${chip(human(o.type))}<p class="small" style="margin:4px 0">${esc(o.insight)}</p>${quote(o.quote, openCall(o.call_id, "call"))}</div>`).join("")), "Avatars") : "");
};

/* ---------- objection deep-dive ---------- */
SALES.objdeep = d => {
  const P = d.closer.objection_pages;
  const pick = state.objType && P.find(p => p.type === state.objType) ? state.objType : P[0].type;
  setTimeout(() => { const s = $("#objpick"); if (s) s.addEventListener("input", () => { state.objType = s.value; render(); }); });
  const p = P.find(x => x.type === pick);
  const W = (d.wins || []).find(w => w.kind === "objection" && w.type === pick);
  return section("Objection deep-dive", "One objection at a time: when it shows up, what it costs, how each rep handles it, and the exact words that work.",
    `<div class="filters"><select id="objpick">${P.map(x => `<option value="${esc(x.type)}" ${x.type === pick ? "selected" : ""}>${esc(human(x.type))} (${x.times})</option>`).join("")}</select></div>
    <div class="grid g6">${tile(fmt(p.times), "Times raised", `on ${p.calls} calls`)}${tile(p.resolved_pct + "%", "Resolved on the call", "", p.resolved_pct < 25 ? "bad" : "")}${tile(`${p.close_pct_when_raised ?? 0}%`, "Close rate when raised", `vs ${p.base_close_pct}% on all calls`)}${tile(fmt(p.when.after_price || 0), "Raised after the price", pctS(p.when.after_price || 0, p.times))}${tile(fmt(p.text_count), "Also raised by text", "before any call")}${tile(W ? fmt(W.lost_unresolved) : "–", "Lost calls where it was never resolved", "", "warn")}</div>
    <div class="grid g2 mt">${card("When it comes up", bars(["before_pitch", "after_pitch", "after_price"].map(k => ({ label: human(k), value: p.when[k] || 0 }))), "Before the pitch is a marketing and discovery problem. After the price is a sales-process problem.")}
     ${card("How reps handled it", bars(["handled_well", "partially", "poorly", "ignored"].map(k => ({ label: human(k), value: p.verdicts[k] || 0, color: k === "handled_well" ? "var(--good-fill)" : k === "partially" ? "var(--warn-fill)" : "var(--bad-fill)" }))), "From the coaching pass on each call.")}</div>
    <div class="grid g2 mt">${card("By rep", table([{ l: "Rep", k: "rep" }, { l: "Raised", k: "raised", n: 1 }, { l: "Resolved", n: 1, f: r => pctS(r.resolved, r.raised) }, { l: "Handled well", n: 1, f: r => r.judged ? pctS(r.handled_well, r.judged) : "–" }], p.by_rep))}
     ${card("By segment", bars(p.by_segment.map(([k, n]) => ({ label: human(k), value: n }))))}</div>
    ${W && W.resolved_calls ? callout("What it's worth", `${W.lost_unresolved} lost calls had this objection unresolved. When it was resolved, ${W.close_when_resolved}% of those calls closed (${W.resolved_calls} calls, a small sample). Resolving half of the unresolved ones at that rate is about ${W.extra_closes} more closes. That's arithmetic, not a forecast: prospects who let an objection go may have been more ready to buy anyway.`, "warn") : ""}
    ${card("In the prospect's words", `<div class="grid g2">${p.quotes.map(q => quote(q.quote, `${human(q.when)} · ${q.resolved ? "resolved" : "not resolved"} · ${q.won ? "won" : "not won"} · ${openCall(q.call_id, "call")}`)).join("")}</div>`)}
    ${p.handled_well.length ? card("Handled well: copy these", p.handled_well.map(x => `<div style="margin:0 0 14px">${quote(x.prospect, "Prospect")}${quote(x.rep, esc(x.rep_name) + " · " + openCall(x.call_id, "call"))}</div>`).join("")) : ""}
    ${p.handled_badly.length ? card("Handled badly, and what to say instead", p.handled_badly.map(x => `<div style="margin:0 0 16px">${chip(human(x.verdict), "bad")}${quote(x.prospect, "Prospect")}${x.rep ? quote(x.rep, esc(x.rep_name)) : ""}${better(x.better)}<div class="small">${openCall(x.call_id, "open call")}</div></div>`).join("")) : ""}
    <div class="grid g2">${card("Responses reps tried", table([{ l: "Response", f: r => esc(human(r.tactic)) }, { l: "Times", k: "n", n: 1 }, { l: "Resolved", n: 1, f: r => pctS(r.resolved, r.n) }], p.tactics))}
     ${card("The same objection by text", p.text_quotes.map(q => quote(q.quote, openThread(q.lead_id, "conversation"))).join("") || "None")}</div>`, "Objections");
};

/* ---------- reps head-to-head (replaces Reps tab) ---------- */
SALES.reps = d => {
  const R = d.closer.reps_deep;
  const M = [["calls", "Calls scored", 0], ["won", "Closed in full", 1], ["close_pct", "Close rate %", 1], ["cash", "Cash on closed calls", 1, money], ["avg_score", "Avg script score", 1], ["avg_minutes", "Avg call length (min)", 0],
    ["obj_resolved_pct", "Objections resolved %", 1], ["handled_well_pct", "Objections handled well %", 1], ["money_before_pitch_pct", "Money qualified before pitch %", 1], ["price_before_temp_pct", "Price before temperature check %", -1],
    ["promise_pct", "Calls with an outcome promise %", -1], ["off_sheet_pct", "Pitched calls with an off-sheet price %", -1], ["flags_per_call", "Flags per call", -1], ["high_flags", "High or critical flags", -1], ["disclosure_miss_pct", "Calls with a compliance flag %", -1]];
  const best = (k, dir) => { if (!dir) return null; const v = R.map(r => r[k]).filter(x => x != null); return dir > 0 ? Math.max(...v) : Math.min(...v); };
  const worst = (k, dir) => { if (!dir) return null; const v = R.map(r => r[k]).filter(x => x != null); return dir > 0 ? Math.min(...v) : Math.max(...v); };
  return callout("Read the comparison with care", "Brianna, Elly and Mariah are June to August and have since left. Makena is September onward. Different months, different lead flow, 4 to 27 calls each. Green marks the best value in a row and red the worst.", "warn")
  + section("Head to head", "Every closer on every measure.", `<div class="card tw"><table><thead><tr><th>Measure</th>${R.map(r => `<th class="n">${esc(r.rep)}<div class="small muted" style="text-transform:none;letter-spacing:0">${esc(r.period)}</div></th>`).join("")}</tr></thead><tbody>
    ${M.map(([k, l, dir, f]) => `<tr><td class="lbl">${l}</td>${R.map(r => { const v = r[k], b = best(k, dir), w = worst(k, dir), tie = b === w; const st = !tie && dir && R.length > 1 && v === b ? "background:var(--good-soft);color:var(--good);font-weight:700" : !tie && dir && R.length > 1 && v === w ? "background:var(--bad-soft);color:var(--bad);font-weight:700" : ""; return `<td class="n"><span class="heat" style="${st}">${v == null ? "–" : f ? f(v) : fmt(v)}</span></td>`; }).join("")}</tr>`).join("")}
    <tr><td class="lbl">Calls</td>${R.map(r => `<td class="n">${drill("open", r.call_ids, "Calls by " + r.rep)}</td>`).join("")}</tr></tbody></table></div>`, "Reps")
  + section("Step by step against the team", "", card("", table([{ l: "Rep", k: "rep" }, { l: "Calls", k: "calls", n: 1 }, ...d.playbook.phases.map(p => ({ l: p.id, n: 1, tip: p.name, f: r => heat(r.phases[p.id]), s: r => r.phases[p.id] }))], [...d.closer.deep.rep_phase, { rep: "Team", calls: d.closer.summary.calls, phases: d.closer.deep.team_phase }])), "Reps")
  + section("Each closer, up close", "", `<div class="grid g2">${R.map(r => {
      const rp = d.closer.deep.rep_phase.find(x => x.rep === r.rep) || { phases: {} }, T = d.closer.deep.team_phase;
      const diff = d.playbook.phases.map(p => ({ p, v: (rp.phases[p.id] ?? 0) - (T[p.id] ?? 0) })).sort((a, b) => b.v - a.v);
      return card(`${esc(r.rep)} <span class="chip">${r.calls} calls · ${r.period}</span>`,
        `<div class="grid g4">${tile(fmt(r.won), "Won")}${tile(fmt(r.avg_score), "Avg score", `${r.score_min}–${r.score_max}`)}${tile(r.handled_well_pct == null ? "–" : r.handled_well_pct + "%", "Objections handled well")}${tile(fmt(r.high_flags), "High+ flags", "", r.high_flags ? "bad" : "")}</div>
        <dl class="kv mt"><dt>Ahead of the team on</dt><dd>${diff.slice(0, 2).map(x => `${esc(x.p.name)} (+${x.v})`).join(", ")}</dd><dt>Behind the team on</dt><dd>${diff.slice(-2).reverse().map(x => `${esc(x.p.name)} (${x.v})`).join(", ")}</dd></dl>
        <h4>Mistakes that keep coming back</h4><ol class="small" style="margin:0;padding-left:18px">${r.top_mistakes.map(m => `<li><b>${esc(m.area)}</b> ${esc(m.label)} <span class="muted">(${m.n} calls)</span></li>`).join("")}</ol>
        ${r.exemplary.length ? `<h4>At their best</h4>${r.exemplary.slice(0, 2).map(x => quote(x.quote, `${esc(x.area)} · ${openCall(x.call_id, "call")}`)).join("")}` : ""}
        <p class="small">${chip("Best call", "good")} ${openCall(r.best_call, "score " + r.best_score)} &nbsp; ${chip("Worst call", "bad")} ${openCall(r.worst_call, "score " + r.worst_score)}</p>`);
    }).join("")}</div>`, "Reps");
};

SALES.review = d => {
  const R = d.closer.review;
  return section("Calls worth listening to", "The best calls to use in training, the ones that need a manager to listen today, and the weakest by script score. Each opens the full scorecard.",
    ["good", "bad", "warn"].map(t => { const rs = R.filter(x => x.tone === t); return rs.length ? `<h3 style="margin:18px 0 8px">${t === "good" ? "Use these in training" : t === "bad" ? "A manager should listen to these today" : "Weakest by script score"}</h3><div class="grid g2">${rs.map(x => `<div class="card"><div class="meta">${chip(x.reason, x.tone)} ${x.won ? chip("Won", "good") : ""}</div><h3 style="margin:6px 0">${esc(x.rep)} · ${esc(niceDate(x.date))} · score ${fmt(x.score)}</h3><p class="small" style="margin:0 0 8px">${esc(x.summary)}</p>${openCall(x.call_id, "Open scorecard")}</div>`).join("")}</div>` : ""; }).join(""), "Review");
};

SALES.trends = d => {
  const T = d.closer.trends, L = d.ops.leads.by_month, S = d.ops.sms.by_month, P = d.ops.payments.by_month;
  const line = (rows, k, l, f = x => x) => card(l, cols(rows.map(r => ({ label: niceMonth(r.month || r.key), short: niceMonth(r.month || r.key).slice(0, 3), value: r[k] ?? 0, tip: `${niceMonth(r.month || r.key)}: ${f(r[k])}` }))));
  return section("Sales calls month by month", "June to August are the departed reps on Fathom. September onward is Makena.",
    `<div class="card">${table([{ l: "Month", f: r => niceMonth(r.month), s: r => r.month }, { l: "Calls", k: "calls", n: 1 }, { l: "Won", k: "won", n: 1 }, { l: "Close %", n: 1, f: r => pctS(r.won, r.calls) }, { l: "Script score", k: "avg_score", n: 1 }, { l: "Promise %", n: 1, f: r => r.promise_pct == null ? "–" : r.promise_pct + "%" }, { l: "Off-sheet price %", n: 1, f: r => r.off_sheet_pct == null ? "–" : r.off_sheet_pct + "%" }, { l: "Flags per call", k: "flags_per_call", n: 1 }, { l: "Price objections", k: "price_objections", n: 1 }, { l: "Objections resolved", n: 1, f: r => r.obj_resolved_pct == null ? "–" : r.obj_resolved_pct + "%" }, { l: "Reps", f: r => esc(r.reps.join(", ")) }], T)}</div>
    <div class="grid g3 mt">${line(T, "avg_score", "Script score")}${line(T, "promise_pct", "Calls with an outcome promise (% of pitched)")}${line(T, "flags_per_call", "Flags per call")}</div>`, "Trends")
  + section("The rest of the funnel, month by month", "", `<div class="grid g3">${card("New leads", cols(L.map(r => ({ label: niceMonth(r.key), short: niceMonth(r.key).slice(0, 3), value: r.leads }))))}${card("Median time to first touch (min)", cols(L.map(r => ({ label: niceMonth(r.key), short: niceMonth(r.key).slice(0, 3), value: r.median_min || 0, color: "var(--warn-fill)", tip: `${niceMonth(r.key)}: ${mins(r.median_min)}` }))))}${card("Booked %", cols(L.map(r => ({ label: niceMonth(r.key), short: niceMonth(r.key).slice(0, 3), value: r.booked_pct || 0, color: "var(--s3)", tip: `${niceMonth(r.key)}: ${r.booked_pct}%` }))))}
    ${card("Texts sent and received", legend([["var(--s1)", "Sent"], ["var(--s2)", "Received"]]) + cols(S.map(r => ({ label: niceMonth(r.key), short: niceMonth(r.key).slice(0, 3), value: r.out, b: r.in, tip: `${niceMonth(r.key)}: ${r.out} sent, ${r.in} received` }))))}${card("Cash collected", cols(P.map(r => ({ label: niceMonth(r.key), short: niceMonth(r.key).slice(0, 3), value: r.cash, color: "var(--good-fill)", tip: `${niceMonth(r.key)}: ${money(r.cash)}` }))))}${card("Dials", cols(d.ops.dialer.by_month.map(r => ({ label: niceMonth(r.key), short: niceMonth(r.key).slice(0, 3), value: r.dials, tip: `${niceMonth(r.key)}: ${r.dials} dials, ${r.connect_pct}% connect` }))))}</div>`, "Trends");
};
