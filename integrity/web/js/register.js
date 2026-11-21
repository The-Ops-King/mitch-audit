/* Issues to watch: every finding as a register row (severity, $ at stake, confidence, owner, the number to watch and its threshold),
   plus the list of things this audit could not verify and what would unlock each. Numbers are read live from the data. */
ACTION.watch = function (d) {
  const P = (a, b) => (b ? Math.round((100 * a) / b) : null);
  const pc = x => (x == null ? "–" : x + "%");
  const C = d.closer || {}, O = C.offer || {}, Dp = C.deep || {}, T = (d.triage || {}).summary || {};
  const L = ((d.ops || {}).leads || {}).overall || {}, cal = (d.ops || {}).calendly || {}, sms = (d.ops || {}).sms || {};
  const X = (d.ops || {}).extra || {}, R = d.recover || {}, SC = d.speed_cap || {}, M = (d.action || {}).money || {};
  const cat = k => ((C.flag_categories || []).find(f => f.category === k) || {}).calls || 0;
  const lever = re => ((M.levers || []).find(l => re.test(l.lever)) || {}).cash_at_close || null;
  const recon = (d.ops || {}).reconciliation || [];
  const gap = recon.length ? Math.round(100 * recon.reduce((a, r) => a + ((r.airtable.close_rate || 0) - (r.recount.close_rate_full_pay || 0)), 0) / recon.length) : null;
  const mb = Dp.money_before_pitch || {};
  const offer = (R.chance_by_outcome || {})["Offer Made"] || {};
  const capx = SC.capacity || {};

  const shared = [
    { sev: "high", area: "Sales calls", issue: "Money isn't qualified before the pitch", owner: "Sid", conf: "High (every recorded call)",
      usd: lever(/price budget/), now: `${fmt(mb.yes || 0)} of ${fmt(mb.assessed || 0)} calls asked`, watch: "Calls where money is asked before the price", target: "90%+ of calls", tab: "Sales calls" },
    { sev: "high", area: "Sales calls", issue: "Prices said that aren't on the price sheet", owner: "Mitch, Sid", conf: "High",
      usd: null, now: `${pc(P(O.calls_with_off_sheet_price, O.calls_pitched))} of pitches`, watch: "Pitches with an off-sheet price or plan", target: "0", tab: "Sales calls" },
    { sev: "high", area: "Compliance", issue: "Outcome promises on sales calls", owner: "Sid", conf: "High",
      usd: null, now: `${pc(P(O.outcome_promises, O.calls_pitched))} of pitches`, watch: "Pitches with a promise of a relationship result", target: "0", tab: "Sales calls" },
    { sev: "high", area: "Compliance", issue: "No recording disclosure at the start of calls", owner: "Sid, Leah", conf: "High",
      usd: null, now: `${fmt(cat("compliance"))} of ${fmt(C.summary ? C.summary.calls : 0)} calls flagged`, watch: "Calls with the disclosure line in the first minute", target: "100%", tab: "Sales calls" },
    { sev: "critical", area: "Wellbeing", issue: "Crisis, violence or self-harm disclosures with no safety step", owner: "Mitch", conf: "High (quoted on recordings)",
      usd: null, now: `${fmt(cat("wellbeing_risk"))} calls`, watch: "Disclosures escalated to a manager the same day", target: "100%, within 1 hour", tab: "Sales calls" },
    { sev: "high", area: "Reporting", issue: "Airtable close rate counts deposits and repeat instalments as new deals", owner: "Leah", conf: "High (recounted from the EOC table)",
      usd: null, now: gap == null ? "–" : `Airtable ${gap} points too high on average`, watch: "Airtable close rate minus recount", target: "Within 2 points", tab: "Leads" },
    { sev: "high", area: "Collections", issue: "Payment-plan balances aren't scheduled or chased", owner: "Leah, Mitch", conf: "Medium (payments may be logged elsewhere)",
      usd: R.balance_total || null, now: `${money(R.balance_total || 0)} owed · ${fmt(R.plans_with_dates || 0)} of ${fmt((R.balances || []).length)} plans dated`, watch: "Plans with due dates recorded; balances 35+ days quiet", target: "100% dated; $0 quiet", tab: "Opportunities" },
    { sev: "high", area: "Follow-up", issue: "Pitched prospects and no-shows almost never come back", owner: "Sid", conf: "High (all EOC history)",
      usd: R.open_offer_value || null, now: `${fmt(offer.later_new_deal || 0)} of ${fmt(offer.n || 0)} offers later closed`, watch: "Offer Made leads that become a deal within 30 days", target: "15%+", tab: "Opportunities" },
    { sev: "medium", area: "Texting", issue: "Leads and clients text back and nobody answers", owner: "Leah", conf: "High (Close message log)",
      usd: lever(/texts back/), now: `${fmt(sms.unanswered_inbound || 0)} last messages unanswered`, watch: "Inbound texts with no reply in 30 minutes", target: "0", tab: "Conversations" },
    { sev: "medium", area: "Commission", issue: "Commission paid on deposits that never became deals", owner: "Mitch", conf: "Medium",
      usd: (X.commission || {}).deposit_commission_no_deal || null, now: money((X.commission || {}).deposit_commission_no_deal || 0), watch: "Commission on unconverted deposits", target: "$0 (clawback rule)", tab: "Opportunities" },
  ];

  const krc = [
    { sev: "critical", area: "Compliance", issue: "Reps help prospects fill in loan applications, including income and SSNs", owner: "Mitch", conf: "High (quoted on recordings)",
      usd: null, now: "On recorded calls", watch: "Calls where a rep handles a financing application", target: "0", tab: "Overview" },
    { sev: "high", area: "Wellbeing", issue: "Vulnerable leads booked without a clear word on cost", owner: "Mitch, Sid", conf: "Medium (judgement on transcripts)",
      usd: null, now: "Several triage calls", watch: "Bookings where the lead asked if it's free or can't work", target: "0 without a stated price", tab: "Triage calls" },
    { sev: "high", area: "Leads", issue: "Leads never contacted in Close", owner: "Leah", conf: "Medium (some DM work isn't in Close)",
      usd: SC.speed ? SC.speed.lift_value : null, now: `${pc(P(L.leads - L.contacted, L.leads))} of new leads`, watch: "New leads with no call or text in 24 hours", target: "Under 5%", tab: "Leads" },
    { sev: "medium", area: "Triage", issue: "Setter quotes prices above the script range", owner: "Sid", conf: "High",
      usd: null, now: `${fmt(T.price_outside_range || 0)} of ${fmt(T.price_said || 0)} calls with a price`, watch: "Triage calls with a price above 'low to mid four figures'", target: "Under 10%", tab: "Triage calls" },
    { sev: "medium", area: "Triage", issue: "Money question skipped on triage calls", owner: "Sid", conf: "High",
      usd: null, now: `${fmt(((d.triage || {}).gates || {}).means ? (d.triage.gates.means.weak || 0) + (d.triage.gates.means.missed || 0) : 0)} of ${fmt(T.setter_calls || 0)} weak or missed`, watch: "Triage calls with the money gate answered", target: "80%+", tab: "Triage calls" },
    { sev: "medium", area: "Booking", issue: "Team cancels direct bookings with no reason, often without a conversation", owner: "Mitch, Leah", conf: "High (Calendly + Close)",
      usd: lever(/setter call/), now: `${fmt(capx.host_cancelled || 0)} of ${fmt(capx.direct_bookings || 0)} cancelled · ${fmt(capx.cancel_with_reason || 0)} with a reason`, watch: "Team cancellations with a reason recorded", target: "100%", tab: "Leads" },
    { sev: "medium", area: "Reporting", issue: "Setter end-of-day reports don't match Close", owner: "Leah", conf: "High", usd: null, now: "Self-reported totals above Close", watch: "EOD talk time vs Close talk time", target: "Within 10%", tab: "Leads" },
    { sev: "medium", area: "Recordings", issue: "Sales-call recordings expire after 90 days", owner: "Leah", conf: "High", usd: null, now: "Calendly-hosted recordings not archived", watch: "Recordings copied to Drive within 7 days", target: "100%", tab: "Method" },
  ];

  const bvw = [
    { sev: "critical", area: "Script", issue: "Half the closing script is still placeholders", owner: "Mitch", conf: "High", usd: null, now: "Pitch, delivery and price sections blank", watch: "Script sections finished and signed off", target: "All", tab: "Action plan" },
    { sev: "high", area: "Compliance", issue: "Licensing questions answered loosely (\"psych background\", \"counselor\")", owner: "Mitch", conf: "High (recordings and texts)", usd: null, now: "On calls and in texts", watch: "Use of the one approved credentials answer", target: "100%", tab: "Overview" },
    { sev: "high", area: "Refunds", issue: "Website buyers' refund and cancel requests have no owner", owner: "Mitch, Leah", conf: "Medium (2 recorded cases)", usd: null, now: "2 open requests seen", watch: "Refund/cancel requests logged in Close with an owner", target: "100% within 1 business day", tab: "Overview" },
    { sev: "high", area: "Leads", issue: "Half of new leads have no call or text in Close", owner: "Leah", conf: "Low (many are worked in DMs Close can't see)",
      usd: SC.speed ? SC.speed.lift_value : null, now: `${pc(P(L.leads - L.contacted, L.leads))} of new leads`, watch: "New leads with any logged touch in 24 hours", target: "Under 10%", tab: "Leads" },
    { sev: "medium", area: "Tracking", issue: "No Calendly data and no source on most leads", owner: "Leah", conf: "High", usd: null, now: "Bookings invisible to Close", watch: "Bookings creating a Close deal; leads with a source", target: "100%", tab: "Leads" },
  ];

  const rows = (isKRC() ? krc : bvw).concat(shared).map((r, i) => ({ ...r, i }));
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  rows.sort((a, b) => order[a.sev] - order[b.sev] || (b.usd || 0) - (a.usd || 0));
  rows.forEach((r, i) => (r.rank = i + 1));
  const sevChip = s => chip(s[0].toUpperCase() + s.slice(1), s === "critical" ? "bad" : s === "high" ? "warn" : "info");
  const totalUsd = rows.reduce((a, r) => a + (r.usd || 0), 0);

  const gaps = [
    ["Instagram DMs (ManyChat)", "Setter conversations before the text or call, and most of the setter's working time", "Kim or the setter shares a ManyChat API key (rotated after)", "Mitch"],
    isKRC() ? ["Kim's data after Nov 12", "Close, Calendly and Airtable since the exports were taken", "An Airtable token with access to Kim's base (the Close and Calendly keys still work)", "Tyler"] : ["Barak's Calendly", "Bookings, show rate and cancellations", "A Calendly API token for Barak's account", "Mitch"],
    ["Ad spend", "Cost per lead, cost per booked call, return by ad source", "The Airtable Ad Spend table filled in weekly (it's empty)", "Mitch"],
    ["Sid's review time", "How long Sid spends reviewing calls, and on which reps", "Fathom doesn't share who watched or commented on a recording. Sid logs reviews in a sheet, or reviews move to a tool that records them", "Sid"],
    ["Payment processor", "Whether late plan balances were actually paid outside Payment Records", "A Fanbasis export of payments since June", "Mitch"],
    ["Leah's new Zap builds", "Whether cards 3 to 5 now write the right data", "Zap exports or screenshots of each step", "Leah"],
    ["Unrecorded sales calls", "What was said on calls with no recording", "Every sales call recorded and copied to Drive", "Leah"],
  ];

  return section("Issues to watch", `Every finding as one register: how serious it is, the money at stake, how sure we are, who owns it, and the single number to watch with the level that means it's fixed. ${money(totalUsd)} in identified dollars across the rows that have one (some overlap, so don't add them to the money-on-the-table total).`,
    `<div class="grid g4">${tile(fmt(rows.filter(r => r.sev === "critical").length), "Critical", "fix this week", "bad")}${tile(fmt(rows.filter(r => r.sev === "high").length), "High", "", "warn")}${tile(fmt(rows.filter(r => r.sev === "medium").length), "Medium", "")}${tile(fmt(gaps.length), "Things we couldn't verify", "and what unlocks each", "info")}</div>
    <div class="card mt">${table([{ l: "#", k: "rank", n: 1 }, { l: "Severity", f: r => sevChip(r.sev), s: r => order[r.sev] }, { l: "Area", k: "area" }, { l: "Issue", f: r => `<b>${esc(r.issue)}</b>` },
      { l: "$ at stake", n: 1, f: r => (r.usd ? money(r.usd) : "–"), s: r => r.usd || 0 }, { l: "Now", f: r => `<span class="small">${esc(r.now)}</span>` },
      { l: "Watch this number", f: r => `<span class="small">${esc(r.watch)}</span>` }, { l: "Fixed when", f: r => `<span class="small">${esc(r.target)}</span>` },
      { l: "Owner", k: "owner" }, { l: "Confidence", f: r => `<span class="small">${esc(r.conf)}</span>` }, { l: "Details in", k: "tab" }], rows, { sort: 0, dir: 1 })}
      <p class="cap">Severity: critical means harm to a person or legal exposure; high means money or trust at risk now; medium means it makes the numbers or the process worse. Dollar figures come from Money on the table, Recoverable money and Speed & capacity, and use this offer's own conversion rates.</p></div>
    <div class="card mt"><h3>What this audit couldn't verify</h3>${table([{ l: "Gap", f: r => `<b>${esc(r[0])}</b>` }, { l: "What it would show", f: r => esc(r[1]) }, { l: "What unlocks it", f: r => esc(r[2]) }, { l: "Who", f: r => esc(r[3]) }], gaps)}</div>`, "Action plan");
};
