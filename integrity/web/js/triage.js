/* Triage (setter) calls */
SECTIONS.push({
  id: "triage", name: "Triage calls",
  subs: [["summary", "Summary"], ["script", "Script & gates"], ["show", "Booking & show protection"], ["coaching", "Coaching"], ["flags", "Flags"], ["library", "Call library"]],
  render: (d, sub) => d.triage ? TRIAGE[sub](d) : triagePending(d),
});
const SPH = d => Object.fromEntries(d.playbook_setter.phases.map(p => [p.id, p]));

function triagePending(d) {
  const P = d.triage_progress || {}, dl = d.ops.dialer, E = d.ops.eod;
  return section("Triage calls", `Close holds ${fmt(P.candidates)} recorded calls over 2 minutes (${fmt(P.minutes)} minutes of audio): ${Object.entries(P.by_user || {}).map(([k, v]) => `${esc(k)} ${v}`).join(", ")}. Emily Wood's calls are the triage calls. They're scored against the setter script: open, frame, discovery, why now, sell the call, money, book and lock the show.`,
    `<div class="card pending"><h3>Transcribing: ${fmt(P.transcribed)} of ${fmt(P.candidates)} done</h3><p>Longest calls go first, because those are the real triage conversations. This section fills in as they're scored: script grades per call, the three gates (problem, why now, money), show-protection tie-downs, booking verified against Calendly and the closer's report, coaching with better lines, and flags.</p></div>
    <div class="grid g6">${tile(fmt(dl.overall.dials), "Dials logged in Close")}${tile(dl.overall.connect_pct + "%", "Reached a 1-minute conversation")}${tile(fmt(dl.overall.convos_5min), "Calls over 5 minutes")}${tile(fmt(dl.overall.talk_min), "Talk minutes")}${tile(fmt(E.by_user.reduce((a, u) => a + u.eod_booked, 0)), "Calls booked (setter self-report)")}${tile(fmt(d.ops.calendly.by_path.find(p => p.key === "Setter booked")?.bookings), "Setter-booked in Calendly", "since Sep 1")}</div>`, "Triage")
  + callout("What already stands out", `Setter-booked calls show up at ${d.ops.calendly.by_path.find(p => p.key === "Setter booked")?.show_pct ?? "–"}%, and the team almost never cancels them. Direct ad bookings, which skip the setter, are cancelled by the team more than half the time. The triage step works. It just isn't the path most leads take.`, "good");
}

const TRIAGE = {
  summary(d) {
    const T = d.triage, s = T.summary, v = T.verify;
    return section("Triage calls at a glance", `${fmt(s.setter_calls)} real triage conversations scored against the setter script, out of ${fmt(s.recorded_2min)} recorded calls over 2 minutes. Bookings are checked against Calendly and the closer's report.`,
      `<div class="grid g6">${tile(fmt(s.setter_calls), "Triage calls scored", `${fmt((d.triage_progress || {}).transcribed)} of ${fmt((d.triage_progress || {}).candidates)} transcribed`, "info")}${tile(fmt(s.avg_score), "Average script score")}${tile(pctS(s.booked_on_call, s.setter_calls), "Booked on the call", fmt(s.booked_on_call), "good")}
        ${tile(pctS(v.showed, v.booked_on_call), "Of those, showed", `${v.showed} of ${v.booked_on_call}`)}${tile(fmt(s.price_said), "Price said on the call", `${s.price_outside_range} outside the range`, s.price_outside_range ? "bad" : "")}${tile(fmt(s.flags), "Flags", "", s.flags ? "warn" : "")}</div>
      <div class="grid g3 mt">${card("Call results", bars(T.results.map(([k, n]) => ({ label: human(k), value: n }))))}${card("What triggered the call", bars(T.triggers.map(([k, n]) => ({ label: human(k), value: n }))))}${card("Segment", bars(T.segments.map(([k, n]) => ({ label: human(k), value: n }))))}</div>
      <div class="card mt"><h3>By setter</h3>${table([{ l: "Setter", k: "setter" }, { l: "Calls", n: 1, f: r => drill(fmt(r.calls), r.call_ids, "Triage calls by " + r.setter, "triage"), s: r => r.calls }, { l: "Score", n: 1, f: r => heat(r.avg_score, 35, 70, ""), s: r => r.avg_score }, { l: "Booked", k: "booked", n: 1 }, { l: "Book rate", n: 1, f: r => heat(r.book_pct, 20, 60), s: r => r.book_pct }, { l: "Showed", k: "showed", n: 1 }, { l: "Flags", k: "flags", n: 1 },
        ...d.playbook_setter.phases.map(p => ({ l: p.id, n: 1, tip: p.name, f: r => heat(r.phases[p.id]), s: r => r.phases[p.id] }))], T.setters)}</div>`, "Triage");
  },
  script(d) {
    const T = d.triage, g = T.gates;
    const gate = (k, l) => { const x = g[k] || {}, t = sum(Object.values(x)); return `<div style="display:grid;grid-template-columns:110px 1fr 160px;gap:12px;align-items:center;margin:8px 0"><b>${l}</b><div class="stack"><i class="hit" style="width:${100 * (x.solid || 0) / (t || 1)}%"></i><i class="part" style="width:${100 * (x.partial || 0) / (t || 1)}%"></i><i class="miss" style="width:${100 * ((x.weak || 0) + (x.missed || 0)) / (t || 1)}%"></i></div><span class="small">${x.solid || 0} solid · ${x.partial || 0} partial · ${(x.weak || 0) + (x.missed || 0)} weak or missed</span></div>`; };
    return section("The three gates", "Every triage call has to establish a real problem, a reason to act now, and the means to pay, before it books a call with a closer.",
      card("", gate("problem", "Problem") + gate("why_now", "Why now") + gate("means", "Money") + legend([["var(--good-fill)", "Solid"], ["var(--warn-fill)", "Partial"], ["var(--bad-fill)", "Weak or missed"]])), "Triage")
    + section("Script adherence by step", "", card("", T.phases.map(p => `<div style="display:grid;grid-template-columns:minmax(150px,240px) 1fr 60px;gap:12px;align-items:center;margin:8px 0"><div><b style="font-family:var(--mono);font-size:12px;color:var(--muted)">${p.id}</b> ${esc(p.name)}</div>${stack(p.hit, p.partial, p.miss)}<div class="score" style="text-align:right">${p.adherence ?? "–"}%</div></div>`).join("")), "Triage")
    + section("Every check, worst first", "", card("", table([{ l: "Check", f: r => `<b class="small muted" style="font-family:var(--mono)">${r.id}</b> ${esc(r.text)}` }, { l: "Step", k: "phase" }, { l: "Run", n: 1, f: r => heat(r.run_pct), s: r => r.run_pct }, { l: "Applied", k: "applicable", n: 1 }], T.checks)), "Triage")
    + section("Objections on triage calls", "", card("", bars(T.objections.map(([k, n]) => ({ label: human(k), value: n })))), "Triage");
  },
  show(d) {
    const T = d.triage, ties = T.tie_downs, n = T.summary.booked_on_call || 1, v = T.verify;
    const labels = { time_locked: "Time locked in", invite_accepted_live: "Calendar invite accepted live", verbal_show_commitment: "Said \"I'll be there\"", video_or_setting_expectation: "Video and quiet setting set", decision_maker_handled: "Partner or decision-maker handled", reminder_or_prep_set: "Reminder or prep set" };
    return section("Booking and show protection", `On the ${fmt(T.summary.booked_on_call)} calls that booked, how many of the six show-protection steps the setter ran.`,
      `<div class="grid g2">${card("Tie-downs on booked calls", bars(Object.entries(ties).map(([k, x]) => ({ label: labels[k] || human(k), value: x, text: `${x} of ${n} (${pct(x, n)}%)` })), { max: n }))}
       ${card("Booked on the call vs what the CRM shows", `<div class="journey" style="grid-template-columns:repeat(4,1fr)">${[["Booked on call", v.booked_on_call], ["In Calendly or EOC", v.crm_booked], ["Showed", v.showed], ["Closed", v.closed]].map(([k, x], i, a) => `<div class="jstep"><div class="v">${fmt(x)}</div><div class="l">${k}</div><div class="c">${i ? pctS(x, a[i - 1][1]) : ""}</div></div>`).join("")}</div>`)}</div>
      <div class="card mt"><h3>Set quality and show rate</h3>${table([{ l: "Set quality", f: r => esc(human(r.k)) }, { l: "Booked", n: 1, f: r => fmt(r.n) }, { l: "Showed", n: 1, f: r => fmt(r.showed) }, { l: "Show rate", n: 1, f: r => r.n >= 3 ? pctS(r.showed, r.n) : '<span class="muted">small n</span>' }], Object.entries(T.set_quality_show).map(([k, x]) => ({ k, ...x })))}</div>`, "Triage");
  },
  coaching(d) {
    const T = d.triage;
    return section("Triage coaching themes", "The moments setters get wrong most often, with the exact words to use instead.",
      T.themes.map(t => card(`<span class="small muted" style="font-family:var(--mono)">${esc(t.area)}</span> ${esc(t.label)} <span class="chip">${t.n} calls</span>`, t.examples.map(x => `<div style="margin:0 0 12px"><p class="issue">${esc(x.issue)}</p>${better(x.better)}<div class="small">${openTriage(x.call_id, "open call")}</div></div>`).join(""))).join(""), "Triage")
    + section("Done well", "", `<div class="grid g2">${T.exemplary.map(x => `<div class="card">${quote(x.quote, `${esc(x.setter)} · ${esc(x.area)} · ${openTriage(x.call_id, "open")}`)}<p class="small muted" style="margin:4px 0 0">${esc(x.why)}</p></div>`).join("")}</div>`, "Triage");
  },
  flags(d) { return section("Triage call flags", "", flagTable(d.triage.flags, { who: "Setter", kind: "triage" }), "Triage"); },
  async library(d) {
    const L = await lib("triage"); const rows = Object.values(L).sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    return section("Triage call library", "Click any call for the full scorecard.", `<div class="card tw"><table><thead><tr><th>Date</th><th>Setter</th><th>Lead</th><th>Result</th><th class="n">Score</th><th class="n">Min</th><th>Set quality</th><th>Summary</th></tr></thead><tbody>
      ${rows.map(c => `<tr class="lib-row" data-triage="${esc(c.call_id)}"><td style="white-space:nowrap">${esc(niceDate(c.date))}</td><td>${esc(c.setter)}</td><td>${esc(c.prospect)}</td><td>${esc(human(c.result))}</td><td class="n score">${fmt(c.score)}</td><td class="n">${fmt(c.duration_min)}</td><td>${esc(human(c.set_quality))}</td><td class="small" style="min-width:260px">${esc(c.summary || "")}</td></tr>`).join("")}</tbody></table></div>`, "Library");
  },
};

async function triageCard(id) {
  const [d, L] = await Promise.all([getJSON(offerObj().data + ".json"), lib("triage")]);
  const c = L[id]; if (!c) return "<p>Not found.</p>";
  const A = (c.adherence || {}).phases || {}, G = c.gates || {}, TD = c.tie_downs || {};
  return `<div class="kicker">Triage call scorecard</div><div class="sc-head"><h2 style="margin:0">${esc(c.prospect)} with ${esc(c.setter)}</h2>${chip(human(c.result), ["booked_calendar", "live_transferred"].includes(c.result) ? "good" : "")}${chip(niceDate(c.date))}${chip((c.duration_min || "?") + " min")}</div>
  <div class="grid g4 mt">${tile(`<span class="sc-score">${fmt(c.score)}</span>`, "Script score")}${tile(esc(human(c.set_quality)), "Set quality")}${tile(c.crm?.showed ? "Showed" : c.crm?.booked ? "Booked" : "No booking", "In the CRM")}${tile(esc(human(c.trigger)), "Why we called")}</div>
  ${c.summary ? `<div class="card mt"><h3>What happened</h3><p style="margin:0">${esc(c.summary)}</p></div>` : ""}
  <div class="card"><h3>The three gates</h3>${["problem", "why_now", "means"].map(k => { const g = G[k] || {}; return `<div style="margin:0 0 10px"><div class="meta">${chip(human(k))} ${chip(human(g.verdict), g.verdict === "solid" ? "good" : g.verdict === "partial" ? "warn" : "bad")} <span class="small muted">${esc(g.timestamp || "")}</span></div>${g.evidence ? quote(g.evidence) : ""}</div>`; }).join("")}</div>
  ${(c.coaching || []).length ? `<div class="card"><h3>Coaching</h3>${c.coaching.map(x => `<div style="margin:0 0 12px"><div class="meta">${chip(x.priority + " priority", x.priority === "high" ? "bad" : "warn")} ${chip(x.area)} <span class="small muted">${esc(x.timestamp || "")}</span></div><p class="issue">${esc(x.issue)}</p>${better(x.better)}</div>`).join("")}</div>` : ""}
  <div class="card"><h3>Script steps</h3><div class="phase-grid">${d.playbook_setter.phases.map(p => { const a = A[p.id] || {}; return `<div class="ph ${esc(a.score || "")}"><div class="t"><span>${p.id} ${esc(p.name)}</span><span class="small">${esc(human(a.score || "–"))}</span></div><div class="ck">${p.checks.map(x => `<span class="${esc((a.checks || {})[x.id] || "na")}" data-tip="${esc(x.text)}">${x.id}</span>`).join("")}</div>${a.evidence ? `<div class="ev">${esc(a.evidence)}</div>` : ""}</div>`; }).join("")}</div></div>
  <div class="card"><h3>Show protection</h3>${Object.entries(TD).map(([k, v]) => chip((v ? "✓ " : "✗ ") + human(k), v ? "good" : "bad")).join(" ")}</div>
  ${(c.objections || []).length ? `<div class="card"><h3>Objections</h3>${c.objections.map(o => `<div class="meta">${chip(human(o.type))} ${chip(o.resolved ? "Resolved" : "Not resolved", o.resolved ? "good" : "bad")}</div>${quote(o.raw_quote)}`).join("")}</div>` : ""}
  ${c.price?.said ? `<div class="card"><h3>Price on the call</h3>${quote(c.price.quote || "")}<p class="small">${c.price.within_script_range ? "Within the script range." : "Outside the script range."}</p></div>` : ""}
  ${(c.flags || []).length ? `<div class="card"><h3>Flags</h3>${c.flags.map(f => `<div style="margin:0 0 10px"><div class="meta">${sev(f.severity)} ${chip(human(f.category))}</div><p style="margin:2px 0">${esc(f.summary)}</p>${(f.evidence || []).map(q => quote(q)).join("")}</div>`).join("")}</div>` : ""}
  ${(c.exemplary || []).length ? `<div class="card"><h3>Done well</h3>${c.exemplary.map(x => quote(x.quote, esc(x.why))).join("")}</div>` : ""}`;
}
