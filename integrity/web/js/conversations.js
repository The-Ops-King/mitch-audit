/* Conversations (SMS) and DMs */
SECTIONS.push({
  id: "conversations", name: "Conversations",
  subs: [["summary", "Summary"], ["response", "Response times"], ["flow", "Where they stall"], ["templates", "Templates"], ["setters", "By setter"], ["objections", "Objections"], ["flags", "Flags"], ["library", "Conversation library"]],
  render: (d, sub) => CONV[sub](d),
});
SECTIONS.push({
  id: "dms", name: "DMs",
  render: d => section("Instagram DMs (ManyChat)", "Waiting on ManyChat access. Once it's connected, every DM conversation gets the same treatment as the texts.",
    `<div class="card pending"><h3>What this section will show</h3><p>Conversation types (story reply, keyword trigger, inbound question, setter outreach), how many DMs turn into an application or a booking, where they stall, response times, the opener and follow-up messages that get replies, objections in the lead's own words, and any compliance or conduct issues. The same flag categories and drill-through as the texts.</p></div>
    <div class="grid g4">${tile("–", "DM conversations")}${tile("–", "Replied")}${tile("–", "Moved to an application or call")}${tile("–", "Median response time")}</div>`, "DMs"),
});
const STAGE_ORDER = ["no_reply", "replied", "conversation", "qualified", "call_offered", "booked", "showed", "closed"];

const CONV = {
  summary(d) {
    const t = d.texting, s = t.summary, S = d.ops.sms, X = t.extra;
    return section("Setter texting", `Every SMS in Close for this offer: ${fmt(S.messages)} messages with ${fmt(S.leads)} leads. Threads where the lead replied were read in full and classified. Booking, show and close come from Calendly, End-of-Call reports and payments, never from what the chat says.`,
      `<div class="grid g6">${tile(fmt(s.threads), "Conversations", `${fmt(S.outbound)} sent · ${fmt(S.inbound)} received`, "info")}${tile(pctS(s.lead_replied, s.threads), "Lead replied", fmt(s.lead_replied) + " threads")}${tile(mins(S.response.median_min), "Median reply to a lead", "after the lead's message")}
        ${tile(fmt(S.unanswered_inbound), "Lead messages never answered", "", "bad")}${tile(fmt(s.business_went_silent), "Threads where we went quiet", "lead spoke last", "warn")}${tile(fmt(s.price_discussed), "Price discussed by text", "", "warn")}</div>
      <div class="grid g2 mt">${card("Furthest stage each conversation reached", bars(STAGE_ORDER.map(k => ({ label: human(k), value: t.stages[k] || 0, text: `${t.stages[k] || 0} (${pct(t.stages[k] || 0, s.threads)}%)` }))))}
       ${card("Lead sentiment (replied threads)", bars(Object.entries(X.sentiment).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: human(k), value: v }))))}</div>
      <div class="card mt"><h3>Conversation types and what they led to</h3>${table([{ l: "Type", f: r => `<b>${esc(human(r.type))}</b>` }, { l: "Threads", k: "threads", n: 1 }, { l: "Booked", n: 1, f: r => `${r.booked} <span class="muted small">${pctS(r.booked, r.threads)}</span>`, s: r => r.booked / r.threads }, { l: "Showed", k: "showed", n: 1 }, { l: "Closed", k: "closed", n: 1 }], t.types, { sort: 1 })}
      <p class="cap">"No reply" threads still show bookings when the lead booked another way, like the ad funnel or a phone call.</p></div>`, "Conversations");
  },

  response(d) {
    const S = d.ops.sms, R = S.response;
    return section("How fast the team answers a lead's text", `Time from a lead's message to the next reply from anyone on the team. ${fmt(R.n)} replies measured.`,
      `<div class="grid g4">${tile(mins(R.median_min), "Median reply")}${tile(mins(R.median_business_hours), "During business hours", "8am to 8pm weekdays")}${tile(mins(R.median_after_hours), "Evenings and weekends", "", "warn")}${tile(fmt(S.unanswered_inbound), "Never answered", "lead's last message, 24h+ old", "bad")}</div>
      <div class="grid g2 mt">${card("Reply time buckets", bars(R.buckets.map(b => ({ label: b.key, value: b.n, text: `${b.n} (${pct(b.n, R.n)}%)` }))))}
      ${card("Median reply time by hour the lead texted", cols(R.by_hour.map(h => ({ label: hourLbl(h.key), value: h.median_min || 0, color: (h.median_min || 0) > 120 ? "var(--bad-fill)" : (h.median_min || 0) > 30 ? "var(--warn-fill)" : "var(--good-fill)", tip: `${hourLbl(h.key)}: ${h.n} lead messages, median reply ${mins(h.median_min)}` })), { every: 2 }), "Overnight and early-morning messages wait hours.")}</div>
      <div class="grid g2 mt">${card("Texts sent and received by hour", legend([["var(--s1)", "Sent by the team"], ["var(--s2)", "Received from leads"]]) + cols(S.out_by_hour.map(h => ({ label: hourLbl(h.key), value: h.out, b: h.in, tip: `${hourLbl(h.key)}: ${h.out} sent, ${h.in} received` })), { every: 2 }))}
      ${card("Quiet hours and opt-outs", `<dl class="kv"><dt>Texts sent before 8am or after 9pm Eastern</dt><dd><b>${fmt(S.quiet_hours_sends)}</b> to ${fmt(S.quiet_hours_leads)} leads</dd><dt>Leads who texted STOP or asked to be left alone</dt><dd>${fmt(S.opt_out_leads)}</dd><dt>Texted again after that</dt><dd><b>${fmt(S.texted_after_opt_out)}</b></dd></dl>`, "Texting rules (TCPA and state laws) limit marketing texts to 8am to 9pm in the lead's own time zone. We measured in Eastern, so some of these may be fine for West Coast leads and others may be worse.")}</div>`, "Conversations");
  },

  flow(d) {
    const t = d.texting, fr = Object.entries(t.first_reply_after).sort((a, b) => a[0] - b[0]), frT = sum(fr, x => x[1]);
    return section("Where conversations stall", "The step the business had just taken when the lead stopped replying.",
      `<div class="grid g2">${card("Where the lead went quiet", bars(Object.entries(t.drop_off_after).sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ label: human(k), value: v }))))}
      ${card("How many texts before the lead first replied", bars(fr.map(([k, v]) => ({ label: k + (k == 1 ? " text" : " texts"), value: v, text: `${v} (${pct(v, frT)}%)` }))), "Most leads who reply do it after the first text. A second or third text still adds about a quarter of all replies.")}</div>`, "Conversations")
    + section("Prices said by text", "The setter rule is to give a range by text, not a number. These are the exact words.",
      card("", t.extra.price_quotes.map(p => `${quote(p.quote)}<div class="small" style="margin:-4px 0 10px">${openThread(p.lead_id, "open conversation")}</div>`).join("") || "None"), "Conversations");
  },

  templates(d) {
    const T = d.ops.sms.templates;
    return section("Messages sent again and again, and which ones get replies", "Outbound texts sent 6 or more times, with names, times and links normalised. Reply rate is the share of sends that got any reply within 24 hours.",
      card("", table([{ l: "Message", f: r => `<span class="small">${esc(r.text)}</span>` }, { l: "Sends", k: "sends", n: 1 }, { l: "Leads", k: "leads", n: 1 }, { l: "Reply in 24h", n: 1, f: r => heat(r.reply_24h_pct, 10, 50), s: r => r.reply_24h_pct }, { l: "Sent by", f: r => esc(r.senders.join(", ")) }], T, { sort: 1 }),
        "The best openers reference something specific the lead did (their application, a training they watched). The generic quiz opener gets the fewest replies."), "Conversations");
  },

  setters(d) {
    const S = d.ops.sms, X = d.texting.extra;
    return section("By setter", "Message volume and reply speed come from every text in Close. Quality and outcomes come from the classified threads, credited to the person who sent the most messages.",
      `<div class="card">${table([{ l: "Person", k: "key" }, { l: "Texts sent", k: "sent", n: 1 }, { l: "Leads texted", k: "leads", n: 1 }, { l: "Median reply to a lead", n: 1, f: r => mins(r.median_response_min), s: r => r.median_response_min }], S.by_user)}</div>
       <div class="card mt">${table([{ l: "Owner", k: "rep" }, { l: "Threads", k: "threads", n: 1 }, { l: "Personalised", n: 1, f: r => heat(pct(r.personalised, r.threads), 40, 85) }, { l: "Asked questions", n: 1, f: r => heat(pct(r.asked_questions, r.threads), 40, 85) }, { l: "Followed script", n: 1, f: r => r.script_judged ? heat(pct(r.script_hit, r.script_judged), 30, 75) : "–" },
        { l: "Lead engaged", k: "engaged", n: 1 }, { l: "Booked", k: "booked", n: 1 }, { l: "Showed", k: "showed", n: 1 }, { l: "Closed", k: "closed", n: 1 }, { l: "We went quiet", k: "silent", n: 1 }, { l: "Flags", k: "flags", n: 1 }, { l: "High+", k: "high_flags", n: 1 }], X.reps)}</div>`, "Conversations");
  },

  objections(d) {
    const t = d.texting, Q = t.extra.objection_quotes;
    return section("Objections raised by text", "What leads push back with before they ever get on a call. These are marketing problems as much as sales ones.",
      `<div class="card">${bars(t.objections.map(([k, v]) => ({ label: human(k), value: v })))}</div>
      <div class="grid g2 mt">${Object.entries(Q).map(([k, xs]) => card(human(k), xs.map(x => `${quote(x.quote)}<div class="small" style="margin:-4px 0 8px">${openThread(x.lead_id, "open conversation")}</div>`).join(""))).join("")}</div>`, "Conversations");
  },

  flags(d) {
    const t = d.texting;
    return section("Texting flags", "Missed leads, setters pushing after a no, prices by text, wellbeing disclosures without care, and texting-rule problems. Every flag links to its conversation.",
      `<div class="card">${bars(t.flag_categories.map(([k, v]) => ({ label: human(k), value: v })))}</div><div class="mt">${flagTable(t.flags)}</div>`, "Conversations");
  },

  async library(d) {
    const L = await lib("threads");
    const rows = Object.entries(L).sort((a, b) => (b[1].last || "").localeCompare(a[1].last || ""));
    setTimeout(() => {
      const el = $("#tlib"); if (!el) return;
      const run = () => { const ty = $("#tt").value, st = $("#ts").value, q = $("#tq").value.toLowerCase(); let n = 0;
        el.querySelectorAll("tbody tr").forEach(tr => { const ok = (!ty || tr.dataset.ty === ty) && (!st || tr.dataset.st === st) && (!q || tr.textContent.toLowerCase().includes(q)); tr.hidden = !ok; n += ok; }); $("#tn").textContent = n + " conversations"; };
      document.querySelectorAll("#tt,#ts,#tq").forEach(i => i.addEventListener("input", run)); run();
    });
    return section("Conversation library", "Every text conversation where the lead replied. Click a row for the full breakdown.",
      `<div class="filters"><select id="tt"><option value="">All types</option>${[...new Set(rows.map(r => r[1].thread_type))].map(t => `<option value="${esc(t)}">${esc(human(t))}</option>`).join("")}</select>
       <select id="ts"><option value="">All stages</option>${STAGE_ORDER.map(s => `<option value="${s}">${human(s)}</option>`).join("")}</select><input id="tq" type="search" placeholder="Search notes"><span id="tn" class="small muted"></span></div>
       <div class="card tw" id="tlib"><table><thead><tr><th>Last message</th><th>Lead</th><th>Setter</th><th>Type</th><th>Furthest stage</th><th>Outcome</th><th>Flags</th><th>Note</th></tr></thead><tbody>
       ${rows.map(([id, t]) => `<tr class="lib-row" data-thread="${esc(id)}" data-ty="${esc(t.thread_type)}" data-st="${esc(t.stage_reached)}"><td style="white-space:nowrap">${esc(niceDate(t.last))}</td><td>${esc(t.alias)}</td><td>${esc((t.reps || [])[0] || "–")}</td><td>${esc(human(t.thread_type))}</td><td>${esc(human(t.stage_reached))}</td><td>${outChips(t.outcome)}</td><td>${(t.flags || []).length}</td><td class="small" style="min-width:260px">${esc(t.note || "")}</td></tr>`).join("")}
       </tbody></table></div>`, "Library");
  },
};

async function threadCard(id) {
  const L = await lib("threads"); const t = L[id]; if (!t) return "<p>Not found.</p>";
  const sq = t.setter_quality || {}, dr = t.drop_off || {};
  return `<div class="kicker">Text conversation</div><div class="sc-head"><h2 style="margin:0">${esc(t.alias)}</h2>${chip(human(t.thread_type), "info")}${outChips(t.outcome)}</div>
  <p class="lede">${esc(niceDate(t.first))} to ${esc(niceDate(t.last))} · ${fmt(t.business_messages)} from the team, ${fmt(t.lead_messages)} from the lead · ${esc((t.reps || []).join(", ") || "–")}</p>
  ${t.note ? callout("What a manager should know", esc(t.note), (t.flags || []).some(f => ["high", "critical"].includes(f.severity)) ? "bad" : "") : ""}
  <div class="grid g2"><div class="card"><h3>How it went</h3><dl class="kv"><dt>Furthest stage</dt><dd>${esc(human(t.stage_reached))}</dd><dt>Who went quiet</dt><dd>${esc(human(dr.who_went_silent))}</dd><dt>After</dt><dd>${esc(human(dr.after_step))}${dr.after_message ? `<br><span class="small muted">${esc(dr.after_message)}</span>` : ""}</dd>
    <dt>First reply after</dt><dd>${t.first_reply_after_n_business_messages ? t.first_reply_after_n_business_messages + " texts" : "never"}</dd><dt>Booking link sent</dt><dd>${t.booking_link_sent ? "Yes" : "No"}</dd><dt>Lead sentiment</dt><dd>${esc(human(t.lead_sentiment))}</dd><dt>Source</dt><dd>${esc(t.source || "–")}</dd></dl></div>
  <div class="card"><h3>Setter quality</h3><dl class="kv"><dt>Personalised</dt><dd>${sq.personalised ? "Yes" : "No"}</dd><dt>Asked questions</dt><dd>${sq.asked_questions ? "Yes" : "No"}</dd><dt>Followed script</dt><dd>${esc(human(sq.followed_script))}</dd><dt>First touch</dt><dd>${esc(human(t.first_touch?.by))}${t.first_touch?.template_like ? " · template" : ""}</dd></dl>${sq.note ? `<p class="cap">${esc(sq.note)}</p>` : ""}</div></div>
  ${t.price_quote ? `<div class="card"><h3>Price said by text</h3>${quote(t.price_quote)}</div>` : ""}
  ${(t.objections || []).length ? `<div class="card"><h3>Objections</h3>${t.objections.map(o => `<div class="meta">${chip(human(o.type))}</div>${quote(o.quote)}`).join("")}</div>` : ""}
  ${(t.flags || []).length ? `<div class="card"><h3>Flags</h3>${t.flags.map(f => `<div style="margin:0 0 12px"><div class="meta">${sev(f.severity)} ${chip(human(f.category))}</div><p style="margin:2px 0">${esc(f.summary)}</p>${(f.evidence || []).map(q => quote(q)).join("")}</div>`).join("")}</div>` : ""}`;
}
