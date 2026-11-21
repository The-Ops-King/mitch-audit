/* Opportunities: stuck deals, no-show recovery, coverage, lead score, commission, compliance, pre-call content, marketing brief, AI review rubric */
SECTIONS.splice(2, 0, {
  id: "opps", name: "Opportunities",
  subs: [["stuck", "Deals stuck after the call"], ["recovery", "No-shows & cancels"], ["coverage", "Coverage gaps"], ["score", "Lead priority score"], ["commission", "Commission check"],
         ["compliance", "Compliance register"], ["precall", "Pre-call content"], ["marketing", "Marketing brief"], ["rubric", "AI review rubric"]],
  render: (d, sub) => OPPS[sub](d),
});
const X = d => (d.ops && d.ops.extra) || {};
const yes = b => b ? chip("Yes", "good") : chip("No", "bad");

const OPPS = {
  stuck(d) {
    const S = (X(d).stuck || []), open = S.filter(s => !s.paid_later), M = d.action && d.action.money;
    const fresh = open.filter(s => s.days_since <= 60), cold = open.filter(s => s.days_since > 60);
    const quiet = open.filter(s => s.last_touch_days == null || s.last_touch_days > 14);
    return section("Deals stuck after the call", "Everyone who heard the offer (or was set up for a second call) and never paid. These people already sat through a full call, so they're the cheapest revenue in the business.",
      `<div class="grid g6">${tile(fmt(open.length), "Pitched or second-call, never paid", `of ${S.length} since June`, "warn")}${tile(fmt(fresh.length), "From the last 60 days", "still warm")}${tile(fmt(quiet.length), "No outbound touch in 14+ days", "", "bad")}
        ${tile(fmt(open.filter(s => s.followup_overdue).length), "Follow-up date passed, no later call", "", "bad")}${tile(fmt(open.filter(s => s.lead_replied_after).length), "Lead replied after the call")}${tile(M ? money(Math.round(fresh.length * 0.1) * M.aov_contract) : "–", "If 1 in 10 warm ones closes", M ? `${Math.round(fresh.length * 0.1)} deals × ${money(M.aov_contract)}` : "", "good")}</div>
      <div class="card mt">${table([{ l: "Call", f: r => esc(niceDate(r.date)), s: r => r.date }, { l: "Prospect", k: "alias" }, { l: "Closer", k: "closer" }, { l: "Outcome", k: "outcome" },
        { l: "Follow-up set", f: r => esc(r.followup_set || "–") }, { l: "Follow-up date", f: r => r.followup_date ? (r.followup_overdue ? chip(niceDate(r.followup_date) + " · passed", "bad") : esc(niceDate(r.followup_date))) : "–", s: r => r.followup_date },
        { l: "Touches in 7 days", k: "touches_7d", n: 1 }, { l: "Last touch", n: 1, f: r => r.last_touch_days == null ? chip("never", "bad") : r.last_touch_days + "d ago", s: r => r.last_touch_days ?? 999 },
        { l: "Replied after", f: r => r.lead_replied_after ? chip("Yes", "info") : "–" }, { l: "Why it stalled (closer's note)", f: r => `<span class="small">${esc(r.reason)}</span>` }], open, { sort: 0 })}</div>
      ${callout("Fix", "Leah: a Close smart view of every Offer Made or two-call lead with no payment, sorted by call date, and a task on the follow-up date the closer entered. Sid: a weekly 30-minute block where the closer works this list with a written re-open message. Mitch: decide whether an approved follow-up offer exists (a dated first-month option, for example) so closers stop improvising one.", "")}`, "Stuck deals");
  },

  recovery(d) {
    const R = X(d).recovery || [], n = R.length, ns = R.filter(r => r.outcome === "No Show"), cn = R.filter(r => r.outcome === "Cancelled");
    const row = (lab, rs) => `<tr><td class="lbl">${lab}</td><td class="n">${rs.length}</td><td class="n">${pctS(rs.filter(r => r.touched_24h).length, rs.length)}</td><td class="n">${pctS(rs.filter(r => r.touched_72h).length, rs.length)}</td><td class="n">${pctS(rs.filter(r => r.rebooked).length, rs.length)}</td><td class="n">${pctS(rs.filter(r => r.held_later).length, rs.length)}</td><td class="n">${rs.filter(r => r.closed_later).length}</td></tr>`;
    return section("No-shows and cancellations: what happened next", `Every No Show or Cancelled report since September 1 (${n}), and whether anyone followed up, rebooked and held a call.`,
      `<div class="card tw"><table><thead><tr><th></th><th class="n">Reports</th><th class="n">Touched in 24h</th><th class="n">Touched in 72h</th><th class="n">Rebooked</th><th class="n">Held a later call</th><th class="n">Closed later</th></tr></thead><tbody>
        ${row("No-shows", ns)}${row("Cancelled", cn)}${row("All", R)}</tbody></table></div>
      <div class="card mt">${table([{ l: "Date", f: r => esc(niceDate(r.date)), s: r => r.date }, { l: "Outcome", k: "outcome" }, { l: "Type", f: r => esc(r.type || "–") }, { l: "Closer", k: "closer" }, { l: "24h", f: r => yes(r.touched_24h) }, { l: "Touches 7d", k: "touches_7d", n: 1 }, { l: "Rebooked", f: r => yes(r.rebooked) }, { l: "Held later", f: r => yes(r.held_later) }, { l: "Note", f: r => `<span class="small">${esc(r.reason)}</span>` }], R, { sort: 0 })}</div>
      ${callout("Fix", "The no-show and cancel drips are written but switched off in Close. Turn them on (no-show and cancellation cards in the automation plan) and give the setter a task to call within 15 minutes of a no-show. Track rebooked % on the Monday scorecard.", "")}`, "Recovery");
  },

  coverage(d) {
    const V = X(d).coverage; if (!V) return "";
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], mx = Math.max(1, ...V.arrivals.flat()), ax = Math.max(1, ...V.activity.flat());
    const grid = (M, max, col, tip) => `<div class="tw"><table class="small"><thead><tr><th></th>${Array.from({ length: 24 }, (_, h) => `<th style="padding:2px;font-size:9px">${h % 3 ? "" : hourLbl(h)}</th>`).join("")}</tr></thead><tbody>${M.map((r, i) => `<tr><td style="padding:2px 6px">${days[i]}</td>${r.map((v, h) => `<td style="padding:0"><div data-tip="${days[i]} ${hourLbl(h)}: ${tip(v, i, h)}" style="height:18px;background:${v ? `color-mix(in srgb, ${col} ${Math.round(12 + 88 * v / max)}%, white)` : "var(--bg)"}"></div></td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
    const gap = V.arrivals.map((r, i) => r.map((v, h) => (V.activity[i][h] / V.weeks) < 1 ? v : 0));
    return section("Coverage gaps: when leads arrive vs when anyone is working", `Since September 1 (${V.weeks} weeks). ${fmt(V.leads_in_uncovered)} of ${fmt(V.leads_total)} new leads (${pctS(V.leads_in_uncovered, V.leads_total)}) arrived in an hour when the team averages less than one outbound call or text a week.`,
      `<div class="grid g2">${card("When leads arrive", grid(V.arrivals, mx, "var(--s2)", v => v + " leads"))}${card("When the team calls and texts", grid(V.activity, ax, "var(--accent)", v => v + " outbound actions"))}</div>
      ${card("Leads that landed when nobody was working", grid(gap, mx, "var(--bad-fill)", v => v + " leads with no coverage"), "These are the hours to staff, or to cover with an instant automated text and a morning call task.")}
      ${callout("Fix", "Leah: an instant text from Close on every new lead, day or night, and a first-thing call task for anything that lands overnight or on a weekend. Mitch: decide whether one setter shift moves to cover evenings and Saturday, which is where most uncovered leads land.", "")}`, "Coverage");
  },

  score(d) {
    const S = d.action && d.action.lead_score;
    if (!S) return callout("Not enough application data", "This account doesn't carry application answers into Close, so there's nothing to score yet. Fix the form-to-Close mapping first.", "warn");
    return section("Lead priority score", `A simple points score from the application answers, built from which answers showed up for calls more or less often than average (${S.base_show_pct}% of applicants showed). Setters work A leads first; D leads go to email nurture. Leah can add it as a Close field and smart view.`,
      `<div class="card">${table([{ l: "Tier", k: "tier" }, { l: "Applicants", k: "leads", n: 1 }, { l: "Booked", k: "booked", n: 1 }, { l: "Showed", k: "showed", n: 1 }, { l: "Show rate", n: 1, f: r => heat(r.show_pct, 8, 35) }, { l: "Closed", k: "closed", n: 1 }, { l: "Cash", n: 1, f: r => money(r.cash) }], S.tiers)}</div>
      <div class="card mt"><h3>The scoring rules</h3>${table([{ l: "Question", k: "field" }, { l: "Answer", f: r => esc(human(r.answer)) }, { l: "Applicants", k: "leads", n: 1 }, { l: "Show rate", n: 1, f: r => r.show_pct + "%" }, { l: "Closed", k: "closed", n: 1 }, { l: "Points", n: 1, f: r => `<b style="color:${r.points > 0 ? "var(--good)" : "var(--bad)"}">${r.points > 0 ? "+" : ""}${r.points}</b>`, s: r => r.points }], S.rules, { sort: 5 })}</div>
      ${callout("Read with care", "The score is built and tested on the same few hundred applicants, so it will look better here than it will on new leads. Use it to order the queue, not to turn people away, and re-check it every month as new data comes in.", "warn")}`, "Lead score");
  },

  commission(d) {
    const C2 = X(d).commission; if (!C2) return "";
    const nodeal = C2.deposits.filter(x => !x.became_deal);
    return section("Commission check", "How commission is calculated in Airtable, and where the deal counts or payouts don't line up with real closed deals.",
      `<div class="grid g4">${tile(Math.round((C2.closer_rate || 0) * 100) + "%", "Closer commission per payment", "applied to every payment", "info")}${tile(C2.setter_rate ? Math.round(C2.setter_rate * 100) + "%" : "–", "Setter commission per payment")}${tile(money(C2.closer_total + C2.setter_total), "Commission recorded", `${C2.payments} payments`)}${tile(money(C2.on_recurring), "Of it, on instalments and renewals")}</div>
      <div class="card mt"><h3>Deals credited vs deals actually closed</h3>${table([{ l: "Rep", k: "rep" }, { l: "Deals credited (Rep Scorecard, all time)", k: "deals_counted", n: 1 }, { l: "New deals", k: "full_closes", n: 1 }, { l: "Deposits", k: "deposits", n: 1 }, { l: "Instalments", k: "instalments", n: 1 }, { l: "Cash credited", n: 1, f: r => money(r.cash) }], C2.deals_counted)}
        <p class="cap">Many June End-of-Call reports have no closer name, so reps from June show fewer new deals here than they closed. The scorecard counts deposits and later instalment payments as closed deals. If any bonus, quota or ranking uses "deals closed", it's rewarding deposits that may never become clients.</p></div>
      <div class="card"><h3>Deposits and whether they became a deal</h3>${table([{ l: "Date", f: r => esc(niceDate(r.date)) }, { l: "Prospect", k: "alias" }, { l: "Closer", k: "closer" }, { l: "Deposit", n: 1, f: r => money(r.cash) }, { l: "Commission", n: 1, f: r => r.commission ? money(r.commission) : "–" }, { l: "Became a deal", f: r => yes(r.became_deal) }], C2.deposits)}
        <p class="cap">${nodeal.length} deposit(s) never turned into a deal; ${money(C2.deposit_commission_no_deal)} of commission was recorded on them.</p></div>
      ${C2.refunds.length ? card("Refunds and clawbacks", table([{ l: "Refund", n: 1, f: r => money(r.amount) }, { l: "Closer clawback", n: 1, f: r => r.closer_clawback ? money(r.closer_clawback) : chip("none recorded", "bad") }, { l: "Setter clawback", n: 1, f: r => r.setter_clawback ? money(r.setter_clawback) : "–" }], C2.refunds)) : ""}
      ${callout("Fix", "Mitch: write the commission rule down (on cash collected, with clawback on refunds and on deposits that never convert). Leah: change the Rep Scorecard to count a deal only when it's paid in full or the first instalment of a plan clears, and add the clawback formula.", "")}`, "Commission");
  },

  compliance(d) {
    const R = (d.action && d.action.compliance) || [];
    return section("Compliance risk register", "One page Mitch can hand to a lawyer or use to set rules. Every case links to the call or conversation behind it. Counts are cases flagged in the calls and texts we reviewed, not all calls ever made.",
      `<div class="card tw"><table><thead><tr><th>Risk</th><th>What it looks like</th><th class="n">Cases</th><th class="n">Critical</th><th class="n">High</th><th>Evidence</th></tr></thead><tbody>
        ${R.map(r => `<tr><td class="lbl">${esc(r.risk)}</td><td class="small">${esc(r.what)}${r.measured ? `<div class="muted">${esc(r.measured)}</div>` : ""}</td><td class="n">${fmt(r.cases)}</td><td class="n">${r.critical ? `<b style="color:var(--crit)">${r.critical}</b>` : 0}</td><td class="n">${r.high ? `<b style="color:var(--bad)">${r.high}</b>` : 0}</td>
          <td class="small">${r.calls.length ? drill(r.calls.length + " calls", r.calls, r.risk) + " " : ""}${r.triage.length ? drill(r.triage.length + " triage", r.triage, r.risk, "triage") + " " : ""}${r.threads.length ? drill(r.threads.length + " texts", r.threads, r.risk, "threads") : ""}</td></tr>`).join("")}</tbody></table></div>
      ${callout("Rules to write down this week", "1) Reps never ask for or enter ID numbers or income for financing; prospects apply through the lender's link alone. 2) No success rates or outcome promises; one approved proof line. 3) Every call opens with the recording disclosure. 4) A crisis disclosure stops the sale: crisis line, manager note the same day. 5) We're coaches, not therapists: one approved answer to \"are you licensed?\". 6) After a clear no, one polite close-out and stop. 7) Texts only 8am to 9pm in the lead's time zone; STOP means stop.", "bad")}`, "Compliance");
  },

  precall(d) {
    const P = (d.action && d.action.precall) || [];
    return section("What leads need to hear before the call", "What prospects ask or push back on before the closer ever pitches, from the texts, triage calls and early in sales calls. Each topic is a pre-call email, video or FAQ that takes the friction out before the call.",
      P.map(t => card(`${esc(t.topic)} <span class="chip">${t.mentions} mentions</span> ${Object.entries(t.by_source).map(([k, v]) => chip(`${k}: ${v}`)).join(" ")}`, `<p style="margin:0 0 8px"><b>Make:</b> ${esc(t.asset)}</p>${t.quotes.map(q => quote(q.quote, q.src === "text" ? openThread(q.id, "conversation") : q.src === "triage" ? openTriage(q.id, "triage call") : openCall(q.id, "call"))).join("")}`)).join(""), "Pre-call");
  },

  marketing(d) {
    const M = d.action && d.action.marketing;
    if (!M) return callout("Marketing brief comes with the avatars", "This offer's avatars aren't built yet.", "warn");
    return section("Marketing brief", "For the media buyer and whoever writes the ads and emails: who to aim at, who to avoid, and their exact words.",
      `${M.who_buys ? callout("Who buys", esc(M.who_buys), "good") : ""}${M.icp_gap ? callout("Who the ads attract vs who buys", esc(M.icp_gap), "warn") : ""}
      ${M.who.length ? card("What the applications say", table([{ l: "Question", k: "field" }, { l: "Most applicants", f: r => esc(human(r.biggest)) }, { l: "Shows up best", f: r => `${esc(human(r.best))} <span class="muted small">${r.best_show}%</span>` }, { l: "Shows up worst", f: r => `${esc(human(r.worst))} <span class="muted small">${r.worst_show}%</span>` }], M.who)) : ""}
      <div class="grid g2 mt">${M.target.map(a => card(`${esc(a.name)} <span class="chip">${a.calls} calls · ${a.won} won · ${money(a.cash)}</span>`, `<p class="small muted" style="margin:0 0 8px">${esc(a.tagline || "")}</p><h4>Hooks</h4><ul class="small">${a.hooks.map(h => `<li>${esc(h)}</li>`).join("")}</ul><h4>Their words</h4>${a.words.map(w => quote(w)).join("")}${a.dq.length ? `<h4>Don't target</h4><ul class="small">${a.dq.map(x => `<li>${esc(x)}</li>`).join("")}</ul>` : ""}`)).join("")}</div>`, "Marketing");
  },

  rubric(d) {
    const R = d.action && d.action.rubric; if (!R) return "";
    return section("AI call review rubric", "The rubric for the automated call review (card 26 in the automation plan). It's generated from the same playbooks this audit scored against, so the review keeps measuring exactly what this page measures. Leah can paste it into the review prompt as is.",
      `<p><a class="drill" href="data/${esc(state.offer)}_review_rubric.md" download>Download the rubric (.md)</a></p>
      ${callout("Hard flags: any one goes to a manager the same day", `<ul style="margin:4px 0 0;padding-left:18px">${R.hard_flags.map(h => `<li><b>${esc(h.flag)}</b>: ${esc(h.rule)}</li>`).join("")}</ul>`, "bad")}
      <div class="grid g2">${[["Sales call", R.closer], ["Triage / setter call", R.setter]].map(([t, P]) => card(t, P.map(p => `<h4>${esc(p.id)} ${esc(p.name)} <span class="muted">· weight ${p.weight}</span></h4><ul class="small" style="margin:0 0 6px;padding-left:18px">${p.checks.map(c => `<li><b>${esc(c.id)}</b> ${esc(c.text)}</li>`).join("")}</ul>`).join(""))).join("")}</div>`, "Rubric");
  },
};
