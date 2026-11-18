/* Leads: volume, speed to lead, follow-up, booking, outcomes, money, reporting accuracy */
SECTIONS.push({
  id: "leads", name: "Leads",
  subs: [["volume", "Volume & sources"], ["speed", "Speed to lead"], ["followup", "Follow-up"], ["booking", "Booking & shows"], ["outcomes", "Call outcomes"], ["money", "Money"], ["reporting", "Reporting accuracy"]],
  render: (d, sub) => LEADS[sub](d),
});
const srcCols = first => [
  { l: first, k: "key", f: r => `<b>${esc(human(r.key))}</b>` }, { l: "Leads", k: "leads", n: 1 },
  { l: "Contacted", n: 1, f: r => heat(r.contacted_pct, 50, 90), s: r => r.contacted_pct }, { l: "In 5 min", n: 1, f: r => heat(r.in5_pct, 10, 40), s: r => r.in5_pct },
  { l: "Median first touch", n: 1, f: r => mins(r.median_min), s: r => r.median_min }, { l: "Replied", k: "replied", n: 1 },
  { l: "Booked", n: 1, f: r => `${fmt(r.booked)} <span class="muted small">${pctS(r.booked, r.leads)}</span>`, s: r => r.booked / r.leads },
  { l: "Showed", k: "showed", n: 1 }, { l: "Closed", k: "closed", n: 1 }, { l: "Cash", n: 1, f: r => money(r.cash), s: r => r.cash }];

const LEADS = {
  volume(d) {
    const L = d.ops.leads, o = L.overall;
    return section(`${fmt(o.leads)} new leads since ${niceDate(L.since)}`, "Every lead created in Close since September 1, matched by email to Calendly bookings, End-of-Call reports and payments. Closed means paid in full, not a deposit.",
      `<div class="journey">${[["Leads", o.leads], ["Contacted", o.contacted], ["Replied by text", o.replied], ["Booked", o.booked], ["Showed", o.showed], ["Closed", o.closed]].map(([k, v], i, a) => `<div class="jstep"><div class="v">${fmt(v)}</div><div class="l">${k}</div><div class="c">${i ? pctS(v, a[i - 1][1]) + " of prev" : "100%"}</div><div class="bar" style="width:${Math.max(2, 100 * v / o.leads)}%"></div></div>`).join("")}</div>
      <div class="grid g2 mt">${card("Leads per week", cols(L.by_week.map(w => ({ label: niceDate(w.key), short: w.key.slice(5), value: w.leads, tip: `Week of ${niceDate(w.key)}: ${w.leads} leads, ${w.booked} booked, ${w.closed} closed` })), { every: 2 }))}
        ${card("Booked per week", cols(L.by_week.map(w => ({ label: niceDate(w.key), short: w.key.slice(5), value: w.booked, color: "var(--s3)", tip: `Week of ${niceDate(w.key)}: ${w.booked} booked of ${w.leads}` })), { every: 2 }))}</div>`, "Leads")
    + section("By lead source", "Opt Source in Close. The Kajabi freebie opt-ins (quiz, training, blueprint) are grouped.", card("", table(srcCols("Source"), L.by_source, { sort: 1 })), "Leads")
    + section("By the exact form they came through", "Applied Source in Close, before grouping.", card("", table(srcCols("Applied source"), L.by_applied, { sort: 1 })), "Leads")
    + section("By month", "", card("", table(srcCols("Month"), L.by_month), "November is still open, so its booked, showed and closed counts will rise."), "Leads")
    + section("Where leads sit in Close right now", "Lead status today for every lead created since September 1.",
      `<div class="grid g2">${card("", bars(L.by_status.map(s => ({ label: s.key, value: s.leads, text: `${s.leads} (${pct(s.leads, o.leads)}%)` }))))}
      ${callout(`${fmt((L.by_status.find(s => s.key === "New Lead") || {}).leads)} leads are still "New Lead"`, "That's the default status. Most of them were never worked past the first touch, so Close can't tell anyone which leads are dead, cold, or waiting on a callback.", "warn")}</div>`, "Leads");
  },

  speed(d) {
    const L = d.ops.leads, o = L.overall;
    return section("Speed to lead", "Minutes from the lead landing in Close to the first outbound call or text from the team.",
      `<div class="grid g4">${tile(mins(o.median_min), "Median time to first touch", "", "warn")}${tile(o.in5_pct + "%", "Reached inside 5 minutes", fmt(o.in5) + " leads")}${tile(fmt(o.leads - o.contacted), "Never contacted", pctS(o.leads - o.contacted, o.leads) + " of leads", "bad")}${tile(fmt(L.first_channel.call), "First touch was a call", fmt(L.first_channel.sms) + " were a text")}</div>
      <div class="grid g2 mt">${card("How fast leads were reached, and how many booked", bars(L.speed_buckets.map(b => ({ label: b.key, value: b.leads, html: `${b.leads} leads <small>· ${b.booked_pct ?? 0}% booked</small>`, tip: `${b.key}: ${b.leads} leads, ${b.booked} booked (${b.booked_pct}%)` }))),
        "Being fast isn't what separates bookers here. Being contacted at all is: leads never contacted booked 3% of the time.")}
        ${card("Who made first contact", bars(Object.entries(L.first_by).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: k === "none" ? "Nobody" : k, value: v, text: `${v} (${pct(v, o.leads)}%)` }))))}</div>`, "Speed to lead")
    + section("When leads come in vs when they're answered", "Hour the lead was created (US Eastern). Bars show volume. Tooltips show the median wait for that hour.",
      card("Leads by hour created", cols(L.by_hour.map(h => ({ label: hourLbl(h.key), value: h.leads, color: h.median_min > 240 ? "var(--bad-fill)" : h.median_min > 60 ? "var(--warn-fill)" : "var(--good-fill)", tip: `${hourLbl(h.key)}: ${h.leads} leads, median wait ${mins(h.median_min)}, ${h.in5_pct}% inside 5 min` })), { every: 2 }),
        "Green: median wait under 1 hour. Amber: 1 to 4 hours. Red: over 4 hours. Leads from 10pm to 8am wait 6 to 13 hours.")
      + `<div class="card">${table([{ l: "Day", k: "key" }, { l: "Leads", k: "leads", n: 1 }, { l: "In 5 min", n: 1, f: r => heat(r.in5_pct, 5, 35), s: r => r.in5_pct }, { l: "Median wait", n: 1, f: r => mins(r.median_min), s: r => r.median_min }, { l: "Booked", n: 1, f: r => pctS(r.booked, r.leads), s: r => r.booked / r.leads }], L.by_dow)}
        <p class="cap">Weekend leads wait a median of 8 to 14 hours. Nobody covers Saturday or Sunday.</p></div>`, "Speed to lead")
    + section("Leads nobody ever contacted, by source", "", card("", bars(L.untouched_open.filter(x => x.leads).map(x => ({ label: x.key, value: x.leads }))), "Most are Kajabi freebie opt-ins. If those are meant to be worked by the setters, they aren't. If they're email-only, Close should say so with a status."), "Speed to lead");
  },

  followup(d) {
    const L = d.ops.leads, T = L.touches_7d, dl = d.ops.dialer;
    return section("Follow-up persistence", "Calls and texts from the team in each lead's first 7 days.",
      `<div class="grid g4">${tile(fmt(T.median_touches), "Median touches in 7 days")}${tile(fmt(T.median_days), "Median days with a touch")}${tile(fmt(L.dials_before_connect.median), "Median dials before a real conversation", fmt(L.dials_before_connect.connected_leads) + " leads connected")}${tile(fmt(L.days_to_book.median) + " days", "Median lead to booking", `${L.days_to_book.same_day} of ${L.days_to_book.booked_with_date} booked same day`)}</div>
      <div class="grid g2 mt">${card("Touches in the first 7 days", cols(T.dist.map(x => ({ label: String(x.key), value: x.leads, tip: `${x.key} touches: ${x.leads} leads` }))))}
      ${card("Leads who never replied, by how hard we tried", cols(T.never_replied_by_touches.map(x => ({ label: String(x.key), value: x.leads, color: "var(--s2)", tip: `${x.key} touches and no reply: ${x.leads} leads` }))), "Most silent leads got 0 or 1 touch. Very few got the 5 to 7 a standard cadence would give.")}</div>`, "Follow-up")
    + section("The dialer", "Every call in Close, all users, June to today.",
      `<div class="grid g6">${tile(fmt(dl.overall.dials), "Outbound dials")}${tile(fmt(dl.overall.connects_60s), "Conversations over 1 min", dl.overall.connect_pct + "% of dials")}${tile(fmt(dl.overall.convos_5min), "Calls over 5 min")}${tile(fmt(dl.overall.talk_min) + " min", "Talk time")}${tile(fmt(dl.overall.recorded), "Recorded calls")}${tile(fmt(dl.overall.inbound), "Inbound calls")}</div>
      <div class="grid g2 mt">${card("Dials and connect rate by hour", cols(dl.by_hour.filter(h => h.dials).map(h => ({ label: hourLbl(h.key), value: h.dials, tip: `${hourLbl(h.key)}: ${h.dials} dials, ${h.connect_pct}% reached a 1-minute conversation` }))), "Hover for connect rate. Evening calls (7 to 9pm) connect best.")}
       ${card("Call length", bars(dl.duration_buckets.map(b => ({ label: b.key, value: b.calls }))))}</div>
      <div class="card mt">${table([{ l: "User", k: "key" }, { l: "Dials", k: "dials", n: 1 }, { l: "1 min+", k: "connects_60s", n: 1 }, { l: "Connect", n: 1, f: r => heat(r.connect_pct, 10, 30), s: r => r.connect_pct }, { l: "5 min+", k: "convos_5min", n: 1 }, { l: "Talk min", k: "talk_min", n: 1 }, { l: "Leads dialed", k: "leads_dialed", n: 1 }, { l: "Days active", k: "days_active", n: 1 }, { l: "Recorded", k: "recorded", n: 1 }], dl.by_user)}</div>
      ${callout("Close deletes call recordings after 90 days", "Every recording link in Close carries an expiry date. Anything older than three months is already gone unless someone saved it. The AI call review in the automation plan needs a step that copies each recording to storage on the day it's made.", "bad")}`, "Follow-up");
  },

  booking(d) {
    const c = d.ops.calendly, o = c.overall;
    return section("Calendly bookings since September 1", `${fmt(o.bookings)} bookings. Show rate counts held slots that have an End-of-Call report.`,
      `<div class="grid g6">${tile(fmt(o.bookings), "Bookings")}${tile(fmt(o.host_cancel), "Cancelled by the team", pctS(o.host_cancel, o.bookings), "bad")}${tile(fmt(o.lead_cancel), "Cancelled by the lead")}${tile(fmt(o.rescheduled), "Rescheduled")}${tile(o.show_pct + "%", "Show rate", `${o.showed} of ${o.with_eoc} with a report`)}${tile(fmt(c.cancel_reason_missing), "Cancels with no reason", "", "warn")}</div>
      <div class="card mt">${table([{ l: "Booking path", k: "key", f: r => `<b>${esc(r.key)}</b>` }, { l: "Bookings", k: "bookings", n: 1 }, { l: "Team cancelled", n: 1, f: r => `${r.host_cancel} <span class="muted small">${pctS(r.host_cancel, r.bookings)}</span>`, s: r => r.host_cancel / r.bookings }, { l: "Lead cancelled", k: "lead_cancel", n: 1 }, { l: "Rescheduled", k: "rescheduled", n: 1 }, { l: "Show rate", n: 1, f: r => r.with_eoc >= 5 ? heat(r.show_pct, 40, 80) : '<span class="muted">small n</span>', s: r => r.show_pct }], c.by_path)}
      <p class="cap">"Direct, ads" is the DCBA event: people who booked straight from the ad funnel. More than half were cancelled by the team. Setter-booked calls almost never get cancelled and showed at the highest rate.</p></div>`, "Booking")
    + section("Does booking further out hurt shows?", "Time from booking to the call.",
      `<div class="grid g2">${card("", table([{ l: "Booked", k: "key" }, { l: "Bookings", k: "bookings", n: 1 }, { l: "Show rate", n: 1, f: r => r.with_eoc >= 5 ? heat(r.show_pct, 40, 80) : '<span class="muted">–</span>' }], c.by_lead_time), "Almost everything is booked inside 2 days, which is good. There's no long-lead-time problem to fix.")}
      ${card("Bookings by day of the call", table([{ l: "Day", k: "key" }, { l: "Bookings", k: "bookings", n: 1 }, { l: "Team cancelled", k: "host_cancel", n: 1 }, { l: "Show rate", n: 1, f: r => r.with_eoc >= 5 ? heat(r.show_pct, 40, 80) : '<span class="muted">small n</span>' }], c.by_dow))}</div>`, "Booking");
  },

  outcomes(d) {
    const e = d.ops.eoc;
    const outs = ["Closed", "Offer Made", "No Pitch - 2 Call Close", "Lost", "Disqualified", "No Show", "Cancelled", "Reschedule"];
    return section("End-of-Call reports", `${fmt(e.total)} reports in Airtable, ${fmt(e.since_total)} since September 1. Filled in by the closer after each booked call.`,
      `<div class="card">${table([{ l: "Month", f: r => niceMonth(r.key), s: r => r.key }, ...outs.map(k => ({ l: k, n: 1, f: r => fmt(r[k] || 0), s: r => r[k] || 0 }))], e.by_month)}</div>
      <div class="grid g3 mt">${card("Outcomes since Sep 1", bars(e.outcome.map(([k, v]) => ({ label: k, value: v }))))}${card("Cancellations", bars(e.cancellation_type.map(([k, v]) => ({ label: k, value: v }))), "Half the cancels are by the team.")}${card("No-shows", bars(e.no_show_type.map(([k, v]) => ({ label: k, value: v }))))}</div>
      <div class="grid g3 mt">${card("Follow-up set after the call?", bars(e.followup_set.map(([k, v]) => ({ label: k, value: v }))))}${card("Payment type on closes", bars(e.payment_type.map(([k, v]) => ({ label: k, value: v }))))}${card("Data completeness", `<dl class="kv"><dt>Reports with a setter named</dt><dd>${e.setter_named} of ${e.since_total}</dd><dt>Reports with a recording link</dt><dd>${e.recording_link} of ${e.since_total}</dd><dt>DQs with no reason</dt><dd>${e.dq_without_reason} of ${e.dq_count}</dd></dl>`)}</div>`, "Outcomes")
    + section("Why prospects were disqualified", "The closer's own words in the DQ Reason field.", `<div class="grid g2">${e.dq_reasons.map(q => `<div class="card">${quote(q)}</div>`).join("")}</div>`, "Outcomes")
    + section("Why deals didn't close", "The closer's own notes from the No Close field.", `<div class="grid g2">${e.no_close.map(([q]) => `<div class="card">${quote(q)}</div>`).join("")}</div>`, "Outcomes");
  },

  money(d) {
    const p = d.ops.payments, e = d.ops.eoc;
    return section("Cash collected", "Payment Records in Airtable, fed by Fanbasis.",
      `<div class="grid g4">${tile(money(p.total), "Collected since June", p.count + " payments", "good")}${tile(money(e.cash_collected), "Cash on EOCs since Sep 1", money(e.contract_value) + " contract value")}${tile(money(p.refunds.total), "Refunded", p.refunds.count + " refund", p.refunds.count ? "bad" : "")}${tile(pctS(e.cash_collected, e.contract_value), "Cash to contract", "since Sep 1")}</div>
      <div class="grid g2 mt">${card("Cash by month", legend([["var(--s1)", "New"], ["var(--s2)", "Recurring and instalments"]]) + cols(p.by_month.map(m => ({ label: niceMonth(m.key), short: niceMonth(m.key).slice(0, 3), value: m.new, b: m.recurring, tip: `${niceMonth(m.key)}: ${money(m.cash)} (${money(m.new)} new, ${money(m.recurring)} recurring), ${m.payments} payments` }))))}
      ${card("Payment method", bars(p.method.map(([k, v]) => ({ label: k, value: v }))))}</div>
      <div class="card mt"><h3>Every payment amount</h3><div>${p.amounts.map(a => `<span class="chip" style="margin:3px">${money(a)}</span>`).join("")}</div><p class="cap">Odd amounts ($337, $1,000, $2,400, $3,400) match the improvised prices closers quoted on calls.</p></div>`, "Money");
  },

  reporting(d) {
    const R = d.ops.reconciliation, E = d.ops.eod;
    const p = x => x == null ? "–" : Math.round(x * 100) + "%";
    return section("The numbers Mitch sees vs a recount", "The Airtable Sales Metrics Summary compared with a recount from the raw End-of-Call reports, month by month.",
      `<div class="card">${table([{ l: "Month", f: r => niceMonth(r.month) }, { l: "Airtable show rate", n: 1, f: r => p(r.airtable.show_rate) }, { l: "Recount: shows ÷ all reports", n: 1, f: r => p(r.recount.show_rate_all_reports) }, { l: "Recount: shows ÷ (shows + no-shows)", n: 1, f: r => p(r.recount.show_rate) },
        { l: "Airtable close rate", n: 1, f: r => p(r.airtable.close_rate) }, { l: "Recount incl. deposits", n: 1, f: r => p(r.recount.close_rate_incl_deposits) }, { l: "Recount, paid in full", n: 1, f: r => `<b>${p(r.recount.close_rate_full_pay)}</b>` },
        { l: "Airtable closes", n: 1, f: r => fmt(r.airtable.closed) }, { l: "Full-pay closes", n: 1, f: r => fmt(r.recount.closed_full_pay) }], R)}
      <p class="cap">Airtable's show rate counts team cancellations as no-shows, so it understates shows. Its close rate counts deposits and instalment payments as closed deals, so it overstates closes. Both definitions need to be fixed in the Airtable formulas.</p></div>`, "Reporting")
    + section("Setter end-of-day reports vs Close", "What setters typed into the EOD form compared with what Close logged for the same person on the same days.",
      `<div class="card">${table([{ l: "Setter", k: "key" }, { l: "Reports", k: "reports", n: 1 }, { l: "Dials reported", k: "eod_dials", n: 1 }, { l: "Dials in Close", k: "close_dials", n: 1 }, { l: "Conversations reported", k: "eod_convos", n: 1 }, { l: "Close calls 2 min+", k: "close_convos", n: 1 }, { l: "Talk time reported", n: 1, f: r => fmt(r.eod_talk) + " min" }, { l: "Talk time in Close", n: 1, f: r => fmt(r.close_talk) + " min" }, { l: "Days dialing with no report", k: "days_dialing_no_report", n: 1 }], E.by_user)}
      <p class="cap">Reported talk time runs about 25% above what Close logged, and reported conversations run 50% above calls longer than 2 minutes. The EOD form should be replaced by numbers pulled straight from Close.</p></div>
      ${card("Recent setter notes", E.notes.slice(0, 16).map(n => quote(n.note, `${esc(n.user)} · ${esc(niceDate(n.date))}`)).join(""))}`, "Reporting");
  },
};
