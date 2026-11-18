/* Overview: the story, the journey, what we found and what to do */
SECTIONS.push({ id: "overview", name: "Overview", render: d => OVERVIEW(d) });

function findingsKRC(d) {
  const L = d.ops.leads, o = L.overall, cal = d.ops.calendly, S = d.ops.sms, c = d.closer, D = c.deep, t = d.texting, E = d.ops.eod, R = d.ops.reconciliation;
  const path = k => cal.by_path.find(p => p.key === k) || {};
  const dcb = path("Direct, ads"), sb = path("Setter booked");
  const cat = k => c.flag_categories.find(x => x.category === k) || { n: 0, calls: 0, call_ids: [] };
  const tcat = k => ((t.flag_categories.find(x => x[0] === k) || [])[1]) || 0;
  const tids = k => t.flags.filter(f => f.category === k).map(f => f.lead_id);
  const fin = c.top_flags.filter(f => /social security|ssn|income|loan|financ|credit/i.test(f.summary) && /compliance|conduct|mis_selling/.test(f.category));
  const finIds = [...new Set(fin.map(f => f.call_id))];
  const price = c.objections.find(x => x.type === "price_budget") || { when: {} };
  const off = c.offer.prices_quoted.filter(p => !p.sanctioned).sort((a, b) => b.calls - a.calls);
  const promIds = c.calls.filter(x => x.call_id && (d._promise || []).includes(x.call_id)).map(x => x.call_id);
  const oct = R.find(r => r.month === "2026-10") || { airtable: {}, recount: {} };
  const eodE = E.by_user.find(u => u.key === "Emily Wood") || {};
  const wk = L.by_dow.filter(x => ["Sat", "Sun"].includes(x.key));
  const night = L.by_hour.filter(h => h.key >= 22 || h.key < 8);
  const mq = D.money_before_pitch;
  return [
    { g: "risk", h: "Reps are helping prospects fill in loan applications, including income figures and Social Security numbers", own: ["Mitch", "Sid"],
      p: `On ${drill(finIds.length + " recorded calls", finIds, "Calls with financing-application flags")}, a rep collected a prospect's SSN, date of birth or income on the call to fill in a financing application. On at least two, the rep suggested putting a higher income than the prospect had just said. One prospect said he earned $18,000 and was told to enter at least $30,000.`,
      fix: "Written rule, effective now: reps never ask for, read out, or type an SSN, date of birth or income figure. The prospect applies alone through the lender's own link. Any rep who suggests a number for an application is off the phones.", why: "Encouraging someone to overstate income on a credit application is the kind of thing that ends a payment-processor relationship or worse, and it's on tape." },
    { g: "risk", h: "Reps promise relationship outcomes the script forbids", own: ["Mitch", "Sid", "Leah"],
      p: `${drill(fmt(c.offer.outcome_promises) + " of " + fmt(c.offer.calls_pitched) + " pitched calls", cat("outcome_promise").call_ids, "Calls with an outcome promise")} included a promise or strong implication that the prospect will find a partner. The numbers change from rep to rep: "50% in six months", "78% in twelve", "over 80% in the first year". None of them are in the script.`,
      fix: "Ban success-rate claims that can't be backed up with a source. Give reps one approved proof line. The AI call review flags any promise within an hour of the call.", why: "Every promise on a recording is evidence in a refund dispute or chargeback." },
    { g: "risk", h: "No protocol when a prospect discloses a crisis", own: ["Mitch", "Leah"],
      p: `${drill(fmt(cat("wellbeing_risk").calls) + " sales calls", cat("wellbeing_risk").call_ids, "Calls with a wellbeing flag")} and ${drill(fmt(tcat("wellbeing_risk")) + " text conversations", tids("wellbeing_risk"), "Threads with a wellbeing flag", "threads")} include a prospect disclosing suicidal thoughts, an overdose, abuse or severe distress while the rep kept selling or nobody followed up.`,
      fix: "One-page crisis protocol: stop the sale, give a crisis line, tell a manager the same day, never pitch on that call. Keyword alert on inbound texts that pings Slack.", why: "This is a duty-of-care issue first and a reputation issue second." },
    { g: "risk", h: "Recording consent and texting rules aren't being followed", own: ["Sid", "Leah"],
      p: `${drill(fmt(cat("compliance").calls) + " of " + fmt(c.summary.calls) + " sales calls", cat("compliance").call_ids, "Calls with a compliance flag")} have a compliance flag, mostly no recording disclosure. ${fmt(S.quiet_hours_sends)} texts went out before 8am or after 9pm Eastern, to ${fmt(S.quiet_hours_leads)} leads. ${fmt(S.texted_after_opt_out)} lead who texted STOP was texted again.`,
      fix: "Disclosure line at the start of every call, scored by the AI review. Close SMS sending window set to 8am to 9pm in the lead's time zone. STOP replies automatically unsubscribe the lead.", why: "Several states require two-party consent to record, and texting-rule violations carry per-message fines." },

    { g: "money", h: "Nobody finds out what the prospect can invest before the pitch", own: ["Sid"],
      p: `On ${fmt(mq.assessed - mq.yes)} of ${fmt(mq.assessed)} sales calls, the rep pitched without asking what the prospect could invest. The step that sets up money before the price (C11) ran on ${fmt((c.phases.find(p => p.id === "C11") || {}).adherence_pct)}% of calls. Price objections came up ${fmt(price.n)} times, ${fmt(price.when.after_price)} of them after the price was said, and ${fmt(price.resolved_pct)}% were resolved.`,
      fix: "Train one money question in discovery and the next-steps frame before the price. Both get scored on every call by the AI review. Use the Coaching playbook tab as the training script.", why: "Price is the most common objection and the least resolved. It's being created by the order of the call, not by the price." },
    { g: "money", h: "Closers make up prices", own: ["Mitch", "Sid", "Leah"],
      p: `The offer has 3 prices. Reps quoted ${fmt(c.offer.distinct_prices)} different ones, and ${drill(fmt(c.offer.calls_with_off_sheet_price) + " calls", [...new Set(off.flatMap(p => p.call_ids))], "Calls with an off-sheet price")} had at least one that isn't on the sheet. The most common were ${off.slice(0, 3).map(p => drill(money(p.price_usd) + " on " + p.calls + " calls", p.call_ids, "Calls quoting " + money(p.price_usd))).join(", ")}. Payment records show the same odd amounts.`,
      fix: "One price sheet with any approved downsell written on it. Anything else needs Mitch's sign-off before it's said. The EOC form only accepts sheet prices, and the AI review flags any other number.", why: "Improvised prices train prospects to negotiate and make revenue impossible to forecast." },
    { g: "money", h: `${pctS(o.leads - o.contacted, o.leads)} of new leads are never contacted, and nights and weekends wait half a day`, own: ["Leah", "Mitch"],
      p: `Of ${fmt(o.leads)} leads since September 1, ${fmt(o.leads - o.contacted)} never got a call or text, and they booked 3% of the time. Leads that come in after 10pm or before 8am wait a median of 6 to 13 hours. Weekend leads wait ${mins(Math.min(...wk.map(x => x.median_min)))} to ${mins(Math.max(...wk.map(x => x.median_min)))}. Most of the untouched leads are Kajabi freebie opt-ins.`,
      fix: "An instant text from Close on every new lead, any hour. A Slack alert and Close task for the setter. A smart view of leads untouched after 15 minutes. Mitch decides whether freebie leads get worked or go to email only.", why: "The contacted-vs-never gap is the biggest booking gap in the data." },
    { g: "money", h: "Most ad-funnel bookings get cancelled by the team, with no reason recorded", own: ["Leah", "Mitch"],
      p: `${fmt(dcb.host_cancel)} of ${fmt(dcb.bookings)} direct bookings from the ads (${pctS(dcb.host_cancel, dcb.bookings)}) were cancelled by the team. Setter-booked calls: ${fmt(sb.host_cancel)} cancelled out of ${fmt(sb.bookings)}, and ${fmt(sb.show_pct)}% showed. ${fmt(cal.cancel_reason_missing)} cancellations have no reason in Calendly.`,
      fix: "Require a cancel reason and write it to Close. If these are triage disqualifications, route ad bookings through a short setter call first, since that path shows up at the highest rate.", why: "Nobody can tell a bad lead from a scheduling problem, so nobody can fix either." },
    { g: "money", h: "Leads text back and nobody answers", own: ["Leah", "Sid"],
      p: `${fmt(S.unanswered_inbound)} leads' last messages were never answered. The business was the one that went quiet on ${drill(fmt(t.summary.business_went_silent) + " conversations", [], "")}. There are ${drill(fmt(tcat("missed_lead")) + " missed-lead flags", tids("missed_lead"), "Missed-lead conversations", "threads")}, where a lead asked a question or asked to book and got nothing. Evening and weekend replies take a median of ${mins(S.response.median_after_hours)}.`,
      fix: "Close smart view and Slack ping: lead replied, no answer in 30 minutes. Weekend coverage, even one check a day.", why: "These are leads who already raised their hand." },
    { g: "money", h: "Setters push past a no, and quote prices by text", own: ["Sid"],
      p: `${drill(fmt(tcat("conduct")) + " conduct flags", tids("conduct"), "Conversations with conduct flags", "threads")} in the texts, mostly setters arguing after a lead declined or using a lead's personal situation to re-open. ${drill(fmt(tcat("pricing_deviation")) + " pricing flags", tids("pricing_deviation"), "Conversations with pricing flags", "threads")} where a setter gave an exact price or a range above the approved anchor.`,
      fix: "Two rules: after a clear no, one polite close-out and stop. Price by text stays the approved range. Both in the setter SOP and spot-checked weekly.", why: "Every pushy thread is a screenshot waiting to be posted." },
    { g: "money", h: "Follow-up stops after one or two touches", own: ["Leah"],
      p: `The median lead gets ${fmt(L.touches_7d.median_touches)} touches in its first 7 days. Of the leads who never replied, most got 0 or 1 touch. Openers that mention the lead's application get replies 86% of the time. The generic quiz opener gets 7%.`,
      fix: "A 7-day Close sequence: call and text day 0, text day 1, call day 2, text day 4, call day 6, break-up text day 7. Use the openers with the best reply rates (Conversations, Templates tab).", why: "Most silent leads were barely tried." },

    { g: "data", h: "The dashboard overstates the close rate", own: ["Leah"],
      p: `Airtable shows a ${Math.round(100 * (oct.airtable.close_rate || 0))}% close rate for October. Counting only deals paid in full, it's ${Math.round(100 * (oct.recount.close_rate_full_pay || 0))}%. The formula counts deposits and instalment payments as closed deals. The show rate goes the other way: it counts the team's own cancellations as no-shows.`,
      fix: "Fix the two Airtable formulas so a deposit isn't a close and a team cancel isn't a no-show.", why: "Decisions about ad spend and hiring are being made on the wrong number." },
    { g: "data", h: "Setter end-of-day reports don't match Close", own: ["Leah"],
      p: `Emily reported ${fmt(eodE.eod_talk)} minutes of talk time. Close logged ${fmt(eodE.close_talk)}. She reported ${fmt(eodE.eod_convos)} conversations, and Close shows ${fmt(eodE.close_convos)} calls longer than 2 minutes. Sid dialed on ${fmt((E.by_user.find(u => u.key === "Sidonie C") || {}).days_dialing_no_report)} days without filing a report.`,
      fix: "Drop the manual EOD numbers. A nightly Zapier step pulls dials, connects and talk time from Close into Airtable. Setters only type notes.", why: "Self-reported numbers drift. Pulled numbers don't." },
    { g: "data", h: "Recordings disappear and the CRM disagrees with the tape", own: ["Leah"],
      p: `Close deletes call recordings after 90 days. ${fmt(d.funnel.recording_coverage_all_eocs.none)} of ${fmt(d.funnel.eoc_total)} End-of-Call reports have no recording link at all. On ${fmt(c.data_mismatches)} calls, the outcome or terms the rep logged don't match the recording. ${fmt((L.by_status.find(s => s.key === "New Lead") || {}).leads)} leads still sit at "New Lead".`,
      fix: "Recording link required on the EOC form. A Zap copies every recording to Drive the day it's made. The AI review compares the logged outcome with the transcript.", why: "Without the tapes there's no coaching, no dispute defence and no audit." },
  ];
}

function OVERVIEW(d) {
  const L = d.ops.leads, o = L.overall, c = d.closer, t = d.texting, S = d.ops.sms, P = d.triage_progress || {}, cal = d.ops.calendly;
  const sb = cal.by_path.find(p => p.key === "Setter booked") || {};
  const F = findingsKRC(d);
  const groups = [["risk", "Fix this week: legal and compliance risk", "bad"], ["money", "Where the money leaks", "warn"], ["data", "Numbers you can't trust yet", ""]];
  let n = 0;
  const findHTML = g => F.filter(f => f.g === g).map(f => `<div class="find"><div class="k">${String(++n).padStart(2, "0")}</div><div>
    <h3>${esc(f.h)}</h3><div class="meta">${f.own.map(x => `<span class="owner">${esc(x)}</span>`).join("")}</div><p class="p">${f.p}</p>
    <div class="fx"><b>Fix</b><span>${esc(f.fix)}</span><b>Why</b><span class="muted">${esc(f.why)}</span></div></div></div>`).join("");
  const phase = id => (c.phases.find(p => p.id === id) || {}).adherence_pct;
  const best = S.templates.slice().sort((a, b) => b.reply_24h_pct - a.reply_24h_pct)[0] || {};
  return `<div class="hero">
      <p><b>Kimberly Rae's funnel is losing most of its money before and around the price, not in discovery.</b> Leads that get contacted book. Prospects who reach a closer open up. Then the call reaches money with nothing set up, the rep improvises a price or a promise, and the deal stalls.</p>
      <p>On top of that are a few things that need a decision this week because they carry legal risk: help with loan applications, outcome promises, crisis disclosures, and recording consent.</p>
    </div>
    <div class="strip"><span><b>${fmt(o.leads)}</b> leads since Sep 1</span><span><b>${fmt(S.messages)}</b> texts read</span><span><b>${fmt(t.summary.threads)}</b> conversations</span><span><b>${fmt(c.summary.calls)}</b> sales calls scored</span><span><b>${fmt(d.closer.deep.coached_calls)}</b> calls with coaching</span><span class="pend">Triage calls: <b>${fmt(P.scored || 0)} of ${fmt(P.candidates)}</b> scored</span><span class="pend">DMs: <b>waiting on ManyChat</b></span></div>
    ${section("The journey, lead to cash", "New leads since September 1, followed through Close, Calendly, the closers' reports and payments. Closed means paid in full.",
      `<div class="journey">${[["New leads", o.leads], ["Contacted", o.contacted], ["Replied by text", o.replied], ["Booked a call", o.booked], ["Showed", o.showed], ["Closed", o.closed]].map(([k, v], i, a) => `<div class="jstep"><div class="v">${fmt(v)}</div><div class="l">${k}</div><div class="c">${i ? pctS(v, a[i - 1][1]) + " of prev" : ""}</div><div class="bar" style="width:${Math.max(2, 100 * v / o.leads)}%"></div></div>`).join("")}</div>
      <div class="grid g6 mt">${tile(mins(o.median_min), "Median time to first touch", "", "warn")}${tile(pctS(o.leads - o.contacted, o.leads), "Never contacted", "", "bad")}${tile(mins(S.response.median_min), "Median reply to a lead's text")}${tile(fmt(sb.show_pct) + "%", "Show rate, setter-booked", "", "good")}${tile(c.summary.close_pct + "%", "Close rate on scored calls", `${c.summary.won} of ${c.summary.calls}`)}${tile(money(o.cash), "Cash from these leads", "", "good")}</div>`, "Overview")}
    ${section("What we found and what to do", "Each finding has the problem, the fix and who owns it. Leah builds the automated fixes. Mitch and Sid handle decisions and training. Underlined numbers open the calls or conversations behind them.",
      groups.map(([g, title, tone]) => `<h3 style="margin:22px 0 8px" class="${tone}">${title}</h3><div class="card">${findHTML(g)}</div>`).join(""), "Findings")}
    ${section("What's working", "Worth protecting while the rest gets fixed.",
      `<div class="grid g2">
        ${callout("The setter path works", `Calls booked by a setter showed up ${fmt(sb.show_pct)}% of the time, and the team cancelled ${fmt(sb.host_cancel)} of ${fmt(sb.bookings)}.`, "good")}
        ${callout("Contacted leads book", `Leads that got any touch booked at ${pctS(o.booked - (L.speed_buckets.find(b => b.key === "Never") || {}).booked, o.contacted)}. Leads nobody touched booked at 3%.`, "good")}
        ${callout("Fast replies in business hours", `When a lead texts on a weekday between 8am and 8pm, the median reply is ${mins(S.response.median_business_hours)}.`, "good")}
        ${callout("Specific openers get answered", `The best opener (${esc((best.text || "").slice(0, 70))}…) gets a reply ${fmt(best.reply_24h_pct)}% of the time.`, "good")}
        ${callout("Discovery is the strongest part of the call", `Current situation (${phase("C4")}%), doubt (${phase("C5")}%) and desired situation (${phase("C7")}%) are the best-run steps. Prospects open up. The breakdown comes later.`, "good")}
        ${callout("Bookings land close to the lead", `${L.days_to_book.same_day} of ${L.days_to_book.booked_with_date} bookings happen the same day the lead comes in, and almost every call is booked inside 2 days.`, "good")}
      </div>`, "Working")}
    ${section("Decisions needed from Mitch", "",
      `<div class="card"><ol style="margin:0;padding-left:20px;line-height:1.8">
        <li>Are Kajabi freebie opt-ins supposed to be called and texted, or email only? ${fmt((L.untouched_open.find(x => x.key === "Kajabi freebie") || {}).leads)} were never contacted.</li>
        <li>Are team cancellations of ad bookings an intended triage step? If yes, they need a reason code. If no, someone is cancelling calls that should happen.</li>
        <li>Is there any approved price besides $3,600, $7,200 and $14,000? The $1,000 first session and $2,400 starter come up on ${fmt((c.offer.prices_quoted.find(p => p.price_usd === 1000) || {}).calls || 0)} and ${fmt((c.offer.prices_quoted.find(p => p.price_usd === 2400) || {}).calls || 0)} calls.</li>
        <li>What's the one proof line reps are allowed to use in place of success-rate claims?</li>
      </ol></div>`, "Decisions")}`;
}
