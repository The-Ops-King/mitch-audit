/* Routing, nav, event delegation, panels. */
function renderNav() {
  $("#offerTabs").innerHTML = OFFERS.map(o => `<button role="tab" aria-selected="${o.id === state.offer}" data-o="${o.id}">${esc(o.name)}${o.data ? "" : '<span class="soon">next</span>'}</button>`).join("");
  $("#secNav").innerHTML = SECTIONS.map((s, i) => `<button data-s="${s.id}" aria-current="${s.id === state.sec}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${esc(s.name)}</button>`).join("");
  const S = SECTIONS.find(s => s.id === state.sec);
  $("#subNav").innerHTML = S && S.subs ? S.subs.map(([k, v]) => `<button data-sub="${k}" aria-current="${k === state.sub}">${esc(v)}</button>`).join("") : "";
}
async function render() {
  renderNav();
  const o = offerObj(), main = $("#main");
  if (!o.data) { main.innerHTML = `<div class="card pending"><h3>${esc(o.name)}</h3><p>This offer's audit runs next, with the same sections and method.</p></div>`; return; }
  let d;
  try { d = await getJSON(o.data + ".json"); } catch (e) { main.innerHTML = `<div class="card pending">Couldn't load the data (${esc(e.message)}).</div>`; return; }
  REG = []; SECN = 0;
  const S = SECTIONS.find(s => s.id === state.sec) || SECTIONS[0];
  if (S.subs && !S.subs.some(x => x[0] === state.sub)) state.sub = S.subs[0][0];
  try {
    main.innerHTML = await S.render(d, state.sub) + `<p class="foot">Data pulled ${esc(niceDate(d.meta.generated_at))}. Prospects shown as initials. Times in US Eastern.</p>`;
  } catch (e) { console.error(e); main.innerHTML = `<div class="card pending">This section failed to render: ${esc(e.message)}</div>`; }
  renderNav();
}
function go(patch, push = true) {
  Object.assign(state, patch);
  const h = `#${state.offer}/${state.sec}${state.sub ? "/" + state.sub : ""}`;
  if (push && location.hash !== h) history.pushState(null, "", h);
  render(); window.scrollTo({ top: 0 });
}
function fromHash() {
  const [o, s, sub] = location.hash.slice(1).split("/");
  state.offer = OFFERS.some(x => x.id === o) ? o : "krc";
  state.sec = SECTIONS.some(x => x.id === s) ? s : "overview";
  state.sub = sub || null;
}

async function showList(r) {
  const kind = r.kind;
  const L = await lib(kind === "threads" ? "threads" : kind === "triage" ? "triage" : "calls");
  const items = r.ids.map(id => [id, L[id]]).filter(x => x[1]);
  let rows;
  if (kind === "threads") rows = items.map(([id, t]) => `<tr class="lib-row" data-thread="${esc(id)}"><td>${esc(t.alias)}</td><td>${esc(human(t.thread_type))}</td><td>${esc(human(t.stage_reached))}</td><td>${outChips(t.outcome)}</td><td>${(t.flags || []).length}</td></tr>`);
  else if (kind === "triage") rows = items.map(([id, c]) => `<tr class="lib-row" data-triage="${esc(id)}"><td>${esc(niceDate(c.date))}</td><td>${esc(c.setter)}</td><td>${esc(c.prospect)}</td><td>${esc(human(c.result))}</td><td class="n score">${fmt(c.score)}</td></tr>`);
  else rows = items.map(([id, c]) => `<tr class="lib-row" data-call="${esc(id)}"><td>${esc(niceDate(c.date))}</td><td>${esc(c.rep)}</td><td>${esc(c.prospect)}</td><td>${c.won ? chip(c.crm.outcome, "good") : esc(c.crm.outcome || "–")}</td><td class="n score">${fmt(c.score)}</td></tr>`);
  const head = kind === "threads" ? "<th>Lead</th><th>Type</th><th>Furthest stage</th><th>Outcome</th><th>Flags</th>" : kind === "triage" ? "<th>Date</th><th>Setter</th><th>Lead</th><th>Result</th><th class='n'>Score</th>" : "<th>Date</th><th>Rep</th><th>Prospect</th><th>CRM outcome</th><th class='n'>Score</th>";
  openPanel(`<div class="kicker">Evidence</div><h2>${esc(r.label)}</h2><p class="lede">${items.length} ${kind === "threads" ? "conversations" : "calls"}. Click one to open it.</p><div class="card tw"><table><thead><tr>${head}</tr></thead><tbody>${rows.join("")}</tbody></table></div>`);
}
const outChips = o => o ? [o.booked ? chip("Booked", "info") : chip("Not booked"), o.showed ? chip("Showed", "info") : "", o.closed ? chip("Closed", "good") : ""].join(" ") : "–";

document.addEventListener("click", async e => {
  const th = e.target.closest("th.sortable");
  if (th) { const T = TABLES[th.dataset.t], i = +th.dataset.i; T.dir = T.sort === i ? -T.dir : -1; T.sort = i; $("#" + th.dataset.t).innerHTML = tableHTML(th.dataset.t); return; }
  const t = e.target.closest("button, tr.lib-row"); if (!t) return;
  if (t.id === "panelX") return closePanel();
  if (t.dataset.o) return go({ offer: t.dataset.o, sec: "overview", sub: null });
  if (t.dataset.s) return go({ sec: t.dataset.s, sub: null });
  if (t.dataset.sub) return go({ sub: t.dataset.sub });
  if (t.dataset.goto) { const [s, sub] = t.dataset.goto.split("/"); return go({ sec: s, sub: sub || null }); }
  if (t.dataset.reg != null) return showList(REG[+t.dataset.reg]);
  if (t.dataset.call) return openPanel(await callScorecard(t.dataset.call));
  if (t.dataset.thread) return openPanel(await threadCard(t.dataset.thread));
  if (t.dataset.triage) return openPanel(await triageCard(t.dataset.triage));
});
$("#scrim").addEventListener("click", closePanel);
document.addEventListener("keydown", e => { if (e.key === "Escape") closePanel(); });
window.addEventListener("popstate", () => { fromHash(); render(); });
fromHash(); render();
