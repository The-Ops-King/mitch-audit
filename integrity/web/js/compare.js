/* Kim vs Barak: same team, two offers, side by side */
SECTIONS.splice(SECTIONS.findIndex(s => s.id === "method"), 0, {
  id: "compare", name: "Kim vs Barak",
  render: async () => {
    let K, B;
    try { [K, B] = await Promise.all([getJSON("data/krc.json"), getJSON("data/bvw.json")]); } catch (e) { return callout("Comparison not ready", "Both offers need to be built first.", "warn"); }
    const avg = (R, k) => R && R.length ? Math.round(100 * R.reduce((a, r) => a + (r.airtable[k] || 0), 0) / R.length) : null;
    const full = R => R && R.length ? Math.round(100 * R.reduce((a, r) => a + (r.recount.close_rate_full_pay || 0), 0) / R.length) : null;
    const m = (d) => {
      const o = d.ops.leads.overall, c = d.closer, s = c && c.summary.calls ? c : null, X = d.ops.extra || {}, M = d.action && d.action.money;
      const D = s ? s.deep : null, cov = X.coverage || {};
      return {
        leads: o.leads, contacted: pct(o.contacted, o.leads), in5: o.in5_pct, first: o.median_min, booked: pct(o.booked, o.leads), show: pct(o.showed, o.booked), close: pct(o.closed, o.showed), cash: o.cash,
        aov: M && M.aov_contract, reply: d.ops.sms.response.median_min, unanswered: d.ops.sms.unanswered_inbound, coverage: pct(cov.leads_in_uncovered, cov.leads_total),
        at_close: avg(d.ops.reconciliation, "close_rate"), real_close: full(d.ops.reconciliation),
        calls: s ? s.summary.calls : 0, score: s ? s.summary.avg_score : null, promise: s ? pct(s.offer.outcome_promises, s.offer.calls_pitched) : null, offsheet: s ? pct(s.offer.calls_with_off_sheet_price, s.offer.calls_pitched) : null,
        money: D && D.money_before_pitch.assessed ? pct(D.money_before_pitch.yes, D.money_before_pitch.assessed) : null, flags: s ? (s.summary.flags / s.summary.calls).toFixed(1) : null,
        stuck: (X.stuck || []).filter(x => !x.paid_later).length, threads: d.texting.summary.threads, textflags: d.texting.flags.length,
        setter_hours: ((X.setter_time || {}).users || []).filter(u => u.key === "Emily Wood").map(u => u.est_hours_per_day)[0] ?? null,
        script: d.playbook.name,
      };
    };
    const a = m(K), b = m(B);
    const rows = [
      ["Funnel since Sep 1", null], ["New leads", "leads", fmt], ["Contacted at all (in Close)", "contacted", x => x + "%"], ["Reached inside 5 minutes", "in5", x => x + "%"], ["Median time to first touch", "first", mins],
      ["Leads that booked", "booked", x => x + "%"], ["Booked who showed", "show", x => x + "%"], ["Showed who paid in full", "close", x => x + "%"], ["Cash from these leads", "cash", money], ["Average paid-in-full deal", "aov", money],
      ["Leads landing when nobody's working", "coverage", x => x + "%"], ["Pitched prospects who never paid", "stuck", fmt],
      ["Texting", null], ["Conversations", "threads", fmt], ["Median reply to a lead's text", "reply", mins], ["Lead messages never answered", "unanswered", fmt], ["Text flags", "textflags", fmt], ["Emily's hours a day visible in Close", "setter_hours", x => x == null ? "–" : x + " h"],
      ["Sales calls", null], ["Calls scored", "calls", fmt], ["Average script score", "score", fmt], ["Money asked before the pitch", "money", x => x == null ? "–" : x + "%"], ["Pitches with an outcome promise", "promise", x => x == null ? "–" : x + "%"], ["Pitches with an off-sheet price", "offsheet", x => x == null ? "–" : x + "%"], ["Flags per call", "flags", x => x ?? "–"],
      ["Reporting", null], ["Airtable close rate (3-month average)", "at_close", x => x == null ? "–" : x + "%"], ["Real close rate, paid in full", "real_close", x => x == null ? "–" : x + "%"], ["Closing script", "script", x => esc(x)]];
    return section("Kim vs Barak", "Same closer, same setters, same Close and Airtable build, two different offers. Where both show the same problem, it's a team or system problem, and one fix covers both.",
      `<div class="card tw"><table><thead><tr><th></th><th class="n">Kimberly Rae</th><th class="n">Barak Van Wyk</th></tr></thead><tbody>
        ${rows.map(([l, k, f]) => k == null ? `<tr><td colspan="3" style="padding-top:16px"><b class="small" style="text-transform:uppercase;letter-spacing:.06em;color:var(--muted)">${l}</b></td></tr>` : `<tr><td class="lbl">${l}</td><td class="n">${a[k] == null ? "–" : f(a[k])}</td><td class="n">${b[k] == null ? "–" : f(b[k])}</td></tr>`).join("")}
      </tbody></table></div>`, "Compare")
    + section("Problems both offers share, fixed once", "", `<div class="card"><ol style="margin:0;padding-left:20px;line-height:1.8">
        <li><b>Airtable counts deposits and instalments as closes</b> on both: the dashboards show ${a.at_close ?? "–"}% and ${b.at_close ?? "–"}%, the real rates are about ${a.real_close ?? "–"}% and ${b.real_close ?? "–"}%. One formula fix in the shared base.</li>
        <li><b>Money is never qualified before the pitch</b>, and prices get improvised, by the same closer on both offers. One training rule, one price sheet per offer written into the script.</li>
        <li><b>Recording disclosure is missing</b> on almost every call on both offers, although Barak's script includes it.</li>
        <li><b>Leads land when nobody's working</b> on both (${a.coverage ?? "–"}% and ${b.coverage ?? "–"}%). One instant-text automation covers both.</li>
        <li><b>Setter time is mostly invisible</b> on both: under an hour a day of Emily's work shows in Close. ManyChat-to-Close logging fixes both.</li>
        <li><b>Pitched prospects go cold</b> on both (${a.stuck} and ${b.stuck} never paid). One smart view and a weekly follow-up block.</li>
      </ol></div>`, "Compare")
    + section("Where they differ", "", `<div class="grid g2">${callout("Kimberly Rae", "A complete closing script that reps don't follow at the money steps. More leads, a big untouched pool of freebie opt-ins, and a lower show rate. The fixes are adherence and lead handling.", "")}${callout("Barak Van Wyk", "Fewer leads but a higher show and close rate when a call happens. Half the closing script is blank, most leads have no source or contact recorded, and there's no Calendly tracking. The fixes are finishing the script and making the funnel visible.", "")}</div>`, "Compare");
  },
});
