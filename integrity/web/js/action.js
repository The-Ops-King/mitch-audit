/* Action plan: money on the table, script fixes, setter time, is coaching sticking, coaching packs, Monday scorecard */
SECTIONS.splice(1, 0, {
  id: "action", name: "Action plan",
  subs: [["money", "Money on the table"], ["scripts", "Script fixes"], ["time", "Setter time"], ["sticking", "Is coaching sticking"], ["packs", "Coaching packs"], ["scorecard", "Monday scorecard"]],
  render: (d, sub) => ACTION[sub](d),
});

const ACTION = {
  money(d) {
    const M = d.action && d.action.money;
    if (!M) return card("", "Not enough data yet.");
    return section("Money on the table", `What each fix is worth, in dollars, using this offer's own numbers since ${niceDate(M.since)}: an average paid-in-full deal of ${money(M.aov_contract)} (${money(M.cash_per_close)} collected at close), a ${M.show_rate}% show rate and ${M.close_rate_of_shows}% of shows closing in full.`,
      `<div class="grid g4">${tile(money(M.total_contract), "Contract value across these fixes", "", "good")}${tile(money(M.total_cash), "Cash at close", "", "good")}${tile(fmt(sum(M.levers, l => l.extra_closes)), "Extra closed deals")}${tile(fmt(M.full_closes), "Full closes this period today", "the baseline")}</div>
      <div class="card mt">${table([{ l: "Fix", f: r => `<b>${esc(r.lever)}</b><div class="small muted">${esc(r.assumption)}</div>`, s: r => r.lever },
        { l: "Owner", f: r => `<span class="owner">${esc(r.owner)}</span>` }, { l: "Effort", f: r => `<span class="small">${esc(r.effort)}</span>` },
        { l: "Extra bookings", n: 1, f: r => r.extra_bookings == null ? "–" : fmt(r.extra_bookings) }, { l: "Extra closes", n: 1, f: r => r.call_ids.length ? drill(fmt(r.extra_closes), r.call_ids, "Calls behind: " + r.lever) : fmt(r.extra_closes), s: r => r.extra_closes },
        { l: "Contract value", n: 1, f: r => `<b>${money(r.contract_value)}</b>`, s: r => r.contract_value }, { l: "Cash at close", n: 1, f: r => money(r.cash_at_close), s: r => r.cash_at_close }], M.levers, { sort: 5 })}</div>
      ${callout("How to read this", "Each row is arithmetic on this offer's own conversion rates, over the same period, not a forecast. The objection rows rest on small samples of recorded calls and assume the calls that get the objection resolved would behave like the ones that already did. Rows don't fully add up in practice: more booked calls also means more of the same objections. Treat the total as the size of the prize and the order as the priority.", "warn")}`, "Money");
  },

  scripts(d) {
    const P = d.action && d.action.patches;
    if (!P) return card("", `<div class="pending"><h3>Script fixes are being written</h3><p>Every script is being compared line by line with what reps actually say and what the won calls do.</p></div>`);
    const pr = { high: 0, medium: 1, low: 2 };
    return section("Script fixes", "For each script: what it says, what reps actually do, what works, and the exact words to change. Sid trains from this; Mitch signs off the decisions at the bottom.",
      P.scripts.map(s => `<div class="card"><h3>${esc(s.script)} <span class="chip">${s.patches.length} fixes</span> ${s.last_edited ? `<span class="chip">edited ${esc(s.last_edited)}</span>` : ""}</h3><p style="margin:0 0 10px">${esc(s.summary)}</p>
        ${s.patches.slice().sort((a, b) => (pr[a.priority] ?? 3) - (pr[b.priority] ?? 3)).map(p => `<details style="border-top:1px solid var(--line);padding:10px 0"><summary><b>${esc(p.id)}</b> ${chip(p.priority + " priority", p.priority === "high" ? "bad" : p.priority === "medium" ? "warn" : "")} ${chip(human(p.type))} <b>${esc(p.section)}</b>: ${esc(p.change)}</summary>
          <div class="grid g2 mt"><div>${p.script_says ? `<h4>The script says</h4>${quote(p.script_says)}` : "<h4>The script says</h4><p class='small muted'>Nothing. This is missing from the script.</p>"}<h4>What actually happens</h4><p class="small">${esc(p.reality)}</p>${p.what_works ? `<h4>What works</h4><p class="small">${esc(p.what_works)}</p>` : ""}</div>
          <div><h4>New lines</h4>${(p.new_lines || []).map(l => better(l)).join("")}<p class="small"><span class="owner">${esc(p.owner)}</span></p>${(p.evidence || []).slice(0, 3).map(e => quote(e.quote, e.call_id ? (e.call_id.startsWith("lead_") ? openThread(e.call_id, "conversation") : e.call_id.startsWith("acti_") ? openTriage(e.call_id, "triage call") : openCall(e.call_id, "call")) : "")).join("")}</div></div></details>`).join("")}</div>`).join("")
      + (P.unhandled_objections?.length ? `<h3 style="margin:22px 0 8px">Objections the scripts don't handle</h3><div class="grid g2">${P.unhandled_objections.map(o => card(`${esc(human(o.type))} <span class="chip">${esc(o.how_often)}</span>`, `${(o.what_prospects_say || []).slice(0, 3).map(q => quote(q)).join("")}<p class="small"><b>What reps try:</b> ${esc(o.what_reps_try)}</p><h4>Recommended handling</h4>${(o.recommended_handling || []).map(l => better(l)).join("")}`)).join("")}</div>` : "")
      + (P.decisions_for_mitch?.length ? callout("Decisions only Mitch can make", `<ol style="margin:4px 0 0;padding-left:18px">${P.decisions_for_mitch.map(x => `<li>${esc(x)}</li>`).join("")}</ol>`, "warn") : ""), "Scripts");
  },

  time(d) {
    const T = d.ops.extra && d.ops.extra.setter_time;
    if (!T) return "";
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const hh = h => h == null ? "–" : `${Math.floor(h) % 12 || 12}:${String(Math.round((h % 1) * 60)).padStart(2, "0")}${h >= 12 ? "pm" : "am"}`;
    return callout("What this can and can't see", `This is every dial, call minute and text logged in Close, per person. Instagram DMs (ManyChat) aren't in Close, so DM work is invisible here except what setters self-report on their end-of-day form. Estimated hours = talk time + ${T.assumptions.minutes_per_text_sent} min per text sent + ${T.assumptions.seconds_per_unanswered_dial} sec per unanswered dial. The DM half fills in when ManyChat access arrives.`, "warn")
      + (() => { const ig = T.users.filter(u => (u.eod["New Inbound IG Leads"] || 0) > 0); const igBook = (d.ops.calendly.by_path.find(p => p.key === "Direct, Instagram") || {}).bookings;
          return ig.length ? callout("The Instagram question", ig.map(u => `${esc(u.key)} reported ${fmt(u.eod["New Inbound IG Leads"])} new Instagram leads and ${fmt(u.eod["Follow Ups / Re-Engagements"])} follow-ups on ${fmt(u.eod.reports)} end-of-day forms, and ${fmt((u.eod["Calendar Calls Booked"] || 0) + (u.eod["Live Calls Booked"] || 0))} calls booked.`).join(" ") + (igBook != null ? ` Calendly shows ${fmt(igBook)} bookings from the Instagram booking link since September 1.` : "") + ` Meanwhile the work Close can see is under an hour a day per setter. Most setter time is going into DMs that leave no record, and the record that does exist shows paid-ad leads booking far more per minute spent. ManyChat access would show exactly how many DM conversations turn into calls.`, "warn") : ""; })()
      + section("Where the time goes, per person", "", `<div class="card">${table([{ l: "Person", k: "key" }, { l: "Days active", k: "days_active", n: 1 }, { l: "Typical start", n: 1, f: r => hh(r.median_start) }, { l: "Typical last activity", n: 1, f: r => hh(r.median_end) },
        { l: "Dials", k: "dials", n: 1 }, { l: "Texts sent", k: "texts", n: 1 }, { l: "Talk min", k: "talk_min", n: 1 }, { l: "Est. hours in Close", n: 1, f: r => `<b>${fmt(r.est_hours)}</b>`, s: r => r.est_hours }, { l: "Per active day", n: 1, f: r => fmt(r.est_hours_per_day) + " h", s: r => r.est_hours_per_day },
        { l: "EOD: new IG leads", n: 1, f: r => fmt(r.eod["New Inbound IG Leads"]) }, { l: "EOD: follow-ups", n: 1, f: r => fmt(r.eod["Follow Ups / Re-Engagements"]) }, { l: "EOD: calls booked", n: 1, f: r => fmt((r.eod["Calendar Calls Booked"] || 0) + (r.eod["Live Calls Booked"] || 0)) }], T.users, { sort: 7 })}</div>`, "Time")
      + T.users.filter(u => u.est_hours >= 3).map(u => section(`${esc(u.key)}: time by lead source vs what it produced`, `${fmt(u.est_hours)} estimated hours visible in Close over ${fmt(u.days_active)} active days (${fmt(u.est_hours_per_day)} h a day).`,
        `<div class="grid g2"><div class="card">${table([{ l: "Lead source", k: "key" }, { l: "Leads touched", k: "leads", n: 1 }, { l: "Est. minutes", k: "est_minutes", n: 1 }, { l: "Booked", k: "booked", n: 1 }, { l: "Showed", k: "showed", n: 1 }, { l: "Closed", k: "closed", n: 1 }, { l: "Cash", n: 1, f: r => money(r.cash), s: r => r.cash },
          { l: "Minutes per booking", n: 1, f: r => r.booked ? fmt(Math.round(r.est_minutes / r.booked)) : "–", s: r => r.booked ? r.est_minutes / r.booked : 1e9 }], u.by_source, { sort: 2 })}</div>
         <div class="card"><h3>When they work (Close activity, Eastern)</h3><div class="tw"><table class="small"><thead><tr><th></th>${Array.from({ length: 24 }, (_, h) => `<th style="padding:2px;font-size:9px">${h % 3 ? "" : hourLbl(h)}</th>`).join("")}</tr></thead><tbody>
           ${u.heat.map((row, i) => { const mx = Math.max(1, ...u.heat.flat()); return `<tr><td style="padding:2px 6px">${days[i]}</td>${row.map(v => `<td style="padding:0"><div data-tip="${days[i]}: ${v} actions" style="height:16px;background:${v ? `color-mix(in srgb, var(--accent) ${Math.round(15 + 85 * v / mx)}%, white)` : "var(--bg)"}"></div></td>`).join("")}</tr>`; }).join("")}
         </tbody></table></div></div></div>`, "Time")).join("");
  },

  sticking(d) {
    const S = d.action && d.action.sticking;
    const block = r => card(`${esc(r.rep)} <span class="chip">${r.calls} calls</span>`, `<div class="tw"><table><thead><tr><th>Behaviour</th>${r.months.map(m => `<th class="n">${esc(niceMonth(m))}</th>`).join("")}<th>Trend</th></tr></thead><tbody>
      ${r.rows.map(x => `<tr><td class="lbl">${esc(x.label)}</td>${x.months.map(v => `<td class="n">${v.pct == null ? "–" : (x.good_direction > 0 ? heat(v.pct, 20, 70) : heat(100 - v.pct, 20, 70).replace(/>\d+%</, `>${v.pct}%<`))}<div class="small muted">${v.n ? "n=" + v.n : ""}</div></td>`).join("")}<td>${x.trend ? chip(x.trend === "better" ? "Getting better" : x.trend === "worse" ? "Getting worse" : "No change", x.trend === "better" ? "good" : x.trend === "worse" ? "bad" : "warn") : '<span class="muted small">one month</span>'}</td></tr>`).join("")}</tbody></table></div>`);
    if (!S) return "";
    const multi = S.closers.filter(r => r.months.length > 1);
    return section("Is the coaching sticking?", "The same behaviours measured month by month for each rep. If reviews and coaching were landing, the bad habits would fall and the good ones would rise. Each cell is the share of that month's calls where it happened.",
      (multi.length ? multi.map(block).join("") : "") + callout("What this says about review time", "The behaviours the closing script and the coaching target most (money before the pitch, no price before the temperature check, no off-sheet prices) don't move from month to month, and some get worse. The one that improved (outcome promises) is the one with a clear, simple rule. Reviews that end in a general note don't change behaviour; a single measured rule per month, checked on every call by the AI review, does.", "warn")
      + (S.closers.filter(r => r.months.length === 1).length ? `<h3 style="margin:18px 0 8px">Reps with only one month of calls</h3><div class="grid g2">${S.closers.filter(r => r.months.length === 1).map(block).join("")}</div>` : "")
      + (S.setters.length ? `<h3 style="margin:18px 0 8px">Setters (triage calls)</h3>${S.setters.map(block).join("")}` : ""), "Sticking");
  },

  packs(d) {
    const P = d.action && d.action.packs || [];
    return section("One-page coaching packs", "One page per rep for Sid's 1:1s: what to focus on, the exact words to use instead, what to keep doing, and three calls to listen to together. Print or share as is.",
      `<div class="grid g2">${P.map(p => `<div class="card" style="break-inside:avoid"><div class="kicker">${esc(p.role)} coaching pack</div><h3 style="font-size:20px">${esc(p.rep)}</h3>
        <p class="small muted" style="margin:-4px 0 10px">${fmt(p.calls)} calls scored${p.won != null ? ` · ${p.won} closed in full` : ""}${p.avg_score != null ? ` · average script score ${p.avg_score}` : ""}</p>
        <h4>Focus on these three</h4><ol style="margin:0 0 6px;padding-left:18px">${p.focus.map(f => `<li><b>${esc(f.area)}</b> ${esc(f.label)} <span class="muted small">(${f.n} calls)</span></li>`).join("")}</ol>
        <h4>Say this instead</h4>${p.fixes.map(x => `<div style="margin:0 0 10px"><p class="issue small">${esc(x.issue)}</p>${better(x.better)}${x.call_id ? `<div class="small">${p.kind === "triage" ? openTriage(x.call_id, "open call") : openCall(x.call_id, "open call")}</div>` : ""}</div>`).join("")}
        ${p.keep_doing.length ? `<h4>Keep doing</h4>${p.keep_doing.map(x => quote(x.quote, esc(x.why || ""))).join("")}` : ""}
        <h4>Listen to together</h4><ul class="small" style="margin:0;padding-left:18px">${p.listen.map(l => `<li>${p.kind === "triage" ? openTriage(l.call_id, l.why) : openCall(l.call_id, l.why)}</li>`).join("")}</ul></div>`).join("")}</div>`, "Packs");
  },

  scorecard(d) {
    const W = (d.ops.extra && d.ops.extra.scorecard) || [];
    const rows = [
      ["leads", "New leads", null, x => fmt(x)], ["in5_pct", "Reached inside 5 minutes", "60%+", x => x == null ? "–" : x + "%"], ["median_first_touch", "Median time to first touch", "Under 15 min", mins],
      ["never_contacted_pct", "Never contacted (so far)", "Under 5%", x => x == null ? "–" : x + "%"], ["booked", "Leads who booked", null, fmt], ["calls_held", "Sales calls held", null, fmt],
      ["show_rate", "Show rate (held ÷ held + no-show)", "70%+", x => x == null ? "–" : x + "%"], ["full_closes", "Deals paid in full", null, fmt], ["deposits", "Deposits (not closes)", null, fmt],
      ["cash", "Cash collected", null, money], ["team_cancels", "Calls cancelled by the team", "With a reason, every time", fmt], ["eoc_with_recording_pct", "EOC reports with a recording link", "100%", x => x == null ? "–" : x + "%"]];
    return section("The Monday scorecard", "The numbers worth looking at every Monday, with definitions that can't be gamed: a deposit is not a close, a team cancellation is not a no-show, and contact time comes from Close, not the end-of-day form. Last 12 weeks, newest on the right. Leah can automate this into Slack every Monday.",
      `<div class="card tw"><table><thead><tr><th>Measure</th><th>Target</th>${W.map(w => `<th class="n">${esc(w.week.slice(5))}</th>`).join("")}</tr></thead><tbody>
        ${rows.map(([k, l, t, f]) => `<tr><td class="lbl">${l}</td><td class="small muted">${t || ""}</td>${W.map(w => `<td class="n">${f(w[k])}</td>`).join("")}</tr>`).join("")}
      </tbody></table></div>
      <div class="grid g3 mt">${card("Reached inside 5 minutes", cols(W.map(w => ({ label: w.week, short: w.week.slice(5), value: w.in5_pct || 0, tip: `Week of ${w.week}: ${w.in5_pct}%` })), { max: 100 }))}${card("Show rate", cols(W.map(w => ({ label: w.week, short: w.week.slice(5), value: w.show_rate || 0, color: "var(--s3)", tip: `Week of ${w.week}: ${w.show_rate ?? "–"}%` })), { max: 100 }))}${card("Cash collected", cols(W.map(w => ({ label: w.week, short: w.week.slice(5), value: w.cash || 0, color: "var(--good-fill)", tip: `Week of ${w.week}: ${money(w.cash)}` }))))}</div>
      ${callout("Targets are proposals", "The targets are common benchmarks for high-ticket call funnels, not this team's history. Mitch should set his own once two or three clean weeks are in.", "")}`, "Scorecard");
  },
};
