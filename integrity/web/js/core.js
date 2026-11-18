/* Core helpers shared by every section. Plain JS, no build step. */
const OFFERS = [
  { id: "krc", name: "Kimberly Rae", data: "data/krc" },
  { id: "bvw", name: "Barak Van Wyk", data: null },
  { id: "offer3", name: "Offer 3", data: null },
];
const SECTIONS = [];            // filled by section files: {id, name, subs:[[id,name]], render(d, sub)}
const state = { offer: "krc", sec: "overview", sub: null, drill: null };
const cache = {};

const $ = (s, el = document) => el.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = n => n == null || n === "" || Number.isNaN(n) ? "–" : Number(n).toLocaleString("en-US", { maximumFractionDigits: 1 });
const money = n => n == null ? "–" : "$" + Math.round(n).toLocaleString("en-US");
const pct = (a, b) => b ? Math.round(100 * a / b) : 0;
const pctS = (a, b) => b ? pct(a, b) + "%" : "–";
const human = k => String(k ?? "").replace(/_/g, " ").replace(/^\w/, c => c.toUpperCase());
const sum = (a, f = x => x) => a.reduce((s, x) => s + (+f(x) || 0), 0);
const mins = m => m == null ? "–" : m < 60 ? Math.round(m) + " min" : m < 1440 ? (m / 60).toFixed(m < 600 ? 1 : 0) + " hrs" : (m / 1440).toFixed(1) + " days";
const niceDate = s => s ? new Date(String(s).slice(0, 10) + "T12:00:00Z").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "–";
const niceMonth = s => s ? new Date(s + "-01T12:00:00Z").toLocaleDateString("en-US", { month: "short", year: "numeric", timeZone: "UTC" }) : "–";
const hourLbl = h => h === 0 ? "12a" : h < 12 ? h + "a" : h === 12 ? "12p" : (h - 12) + "p";

/* ---------- drill registry: any number can open the calls or threads behind it ---------- */
let REG = [];
function drill(text, ids, label, kind = "calls") {
  if (!ids || !ids.length) return esc(text);
  REG.push({ ids, label, kind });
  return `<button class="drill" data-reg="${REG.length - 1}" title="Open the ${kind === "threads" ? "conversations" : "calls"} behind this number">${esc(text)}</button>`;
}
const openCall = (id, text) => `<button class="drill" data-call="${esc(id)}">${esc(text ?? "Open")}</button>`;
const openThread = (id, text) => `<button class="drill" data-thread="${esc(id)}">${esc(text ?? "Open")}</button>`;
const openTriage = (id, text) => `<button class="drill" data-triage="${esc(id)}">${esc(text ?? "Open")}</button>`;

/* ---------- building blocks ---------- */
let SECN = 0;
function section(title, lede, body, kick) {
  SECN++;
  return `<section class="sec"><div class="kicker"><b>${String(SECN).padStart(2, "0")}</b> / ${esc(kick || "")}</div><h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ""}${body}</section>`;
}
const card = (title, body, cap) => `<div class="card">${title ? `<h3>${title}</h3>` : ""}${body}${cap ? `<p class="cap">${cap}</p>` : ""}</div>`;
const tile = (v, l, x = "", tone = "") => `<div class="tile ${tone}"><div class="v">${v}</div><div class="l">${l}</div>${x ? `<div class="x">${x}</div>` : ""}</div>`;
const callout = (title, body, tone = "") => `<div class="callout ${tone}"><b class="t">${title}</b><p>${body}</p></div>`;
const chip = (t, tone = "") => `<span class="chip ${tone}">${esc(t)}</span>`;
const sev = s => `<span class="sev ${esc(s)}"><i></i>${esc(human(s))}</span>`;
const quote = (t, meta) => `<div class="quote">"${esc(t)}"${meta ? `<span class="m">${meta}</span>` : ""}</div>`;
const better = t => `<div class="better"><b>Better</b>"${esc(t)}"</div>`;
const legend = items => `<div class="legend">${items.map(([c, l]) => `<span><i style="background:${c}"></i>${esc(l)}</span>`).join("")}</div>`;

function bars(rows, o = {}) {
  const max = o.max ?? Math.max(1, ...rows.map(r => Math.max(+r.value || 0, +r.b || 0)));
  return `<div class="bars">${rows.map(r => {
    const w = 100 * (+r.value || 0) / max, wb = r.b != null ? 100 * (+r.b || 0) / max : null;
    return `<div class="row" data-tip="${esc(r.tip ?? "")}"><div class="lbl" title="${esc(r.label)}">${esc(r.label)}</div>
      <div class="track">${wb != null ? `<div class="fill a" style="width:${w}%;${r.color ? "background:" + r.color : ""}"></div><div class="fill b" style="width:${wb}%"></div>` : `<div class="fill" style="width:${w}%;${r.color ? "background:" + r.color : ""}"></div>`}</div>
      <div class="val">${r.html ?? esc(r.text ?? fmt(r.value))}</div></div>`;
  }).join("")}</div>`;
}
function cols(rows, o = {}) {
  const max = o.max ?? Math.max(1, ...rows.map(r => (+r.value || 0) + (+r.b || 0)));
  return `<div class="cols" style="height:${o.h || 150}px">${rows.map(r => `<div class="c" data-tip="${esc(r.tip ?? r.label + ": " + fmt(r.value))}">
    ${r.b != null ? `<div class="f b" style="height:${100 * (+r.b || 0) / max}%"></div>` : ""}<div class="f" style="height:${100 * (+r.value || 0) / max}%;${r.color ? "background:" + r.color : ""}"></div></div>`).join("")}</div>
    <div class="colx">${rows.map((r, i) => `<span>${o.every && i % o.every ? "" : esc(r.short ?? r.label)}</span>`).join("")}</div>`;
}
function stack(h, p, m, n = 0) {
  const t = h + p + m + n || 1;
  return `<div class="stack" data-tip="${h} hit, ${p} partial, ${m} miss${n ? ", " + n + " not applicable" : ""}"><i class="hit" style="width:${100 * h / t}%"></i><i class="part" style="width:${100 * p / t}%"></i><i class="miss" style="width:${100 * m / t}%"></i><i class="na" style="width:${100 * n / t}%"></i></div>`;
}
function heat(v, lo = 30, hi = 75, suffix = "%") {
  if (v == null) return `<span class="muted">–</span>`;
  const t = Math.max(0, Math.min(1, (v - lo) / (hi - lo)));
  const bg = t > .66 ? "var(--good-soft)" : t > .33 ? "var(--warn-soft)" : "var(--bad-soft)";
  const fg = t > .66 ? "var(--good)" : t > .33 ? "var(--warn)" : "var(--bad)";
  return `<span class="heat" style="background:${bg};color:${fg}">${fmt(v)}${suffix}</span>`;
}
/* sortable table: cols = [{k, l, n(bool numeric), f(row)=>html, s(row)=>sortValue}] */
let TBL = 0;
function table(colsDef, rows, o = {}) {
  const id = "t" + (++TBL);
  TABLES[id] = { colsDef, rows, o, sort: o.sort || null, dir: o.dir || -1 };
  return `<div class="tw" id="${id}">${tableHTML(id)}</div>`;
}
const TABLES = {};
function tableHTML(id) {
  const T = TABLES[id];
  let rows = T.rows.slice();
  if (T.sort != null) {
    const c = T.colsDef[T.sort], sv = c.s || (r => r[c.k]);
    rows.sort((a, b) => { const x = sv(a), y = sv(b); return (x == null) - (y == null) || (x > y ? 1 : x < y ? -1 : 0) * T.dir; });
  }
  if (T.o.limit) rows = rows.slice(0, T.o.limit);
  return `<table><thead><tr>${T.colsDef.map((c, i) => `<th class="${c.n ? "n " : ""}${c.nosort ? "" : "sortable"}" data-t="${id}" data-i="${i}" ${c.tip ? `data-tip="${esc(c.tip)}"` : ""}>${esc(c.l)}${T.sort === i ? (T.dir > 0 ? " ▲" : " ▼") : ""}</th>`).join("")}</tr></thead>
  <tbody>${rows.map(r => `<tr ${T.o.rowAttr ? T.o.rowAttr(r) : ""}>${T.colsDef.map(c => `<td class="${c.n ? "n" : ""} ${c.cls || ""}">${c.f ? c.f(r) : esc(r[c.k] ?? "–")}</td>`).join("")}</tr>`).join("")}</tbody></table>`;
}
function flagTable(rows, opts = {}) {
  const cats = [...new Set(rows.map(r => r.category))].filter(Boolean).sort();
  const id = "ft" + (++TBL);
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  const sorted = rows.slice().sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  setTimeout(() => {
    const el = document.getElementById(id); if (!el) return;
    const run = () => {
      const c = el.querySelector(".fc").value, s = el.querySelector(".fs").value, q = el.querySelector(".fq").value.toLowerCase();
      let n = 0;
      el.querySelectorAll("tbody tr").forEach(tr => { const ok = (!c || tr.dataset.c === c) && (!s || tr.dataset.s === s) && (!q || tr.textContent.toLowerCase().includes(q)); tr.hidden = !ok; n += ok; });
      el.querySelector(".fn").textContent = n + " shown";
    };
    el.querySelectorAll("select,input").forEach(i => i.addEventListener("input", run));
  });
  return `<div class="card" id="${id}"><div class="filters">
    <select class="fc" aria-label="Category"><option value="">All categories</option>${cats.map(c => `<option value="${esc(c)}">${esc(human(c))}</option>`).join("")}</select>
    <select class="fs" aria-label="Severity"><option value="">All severities</option>${["critical", "high", "medium", "low"].map(s => `<option value="${s}">${human(s)}</option>`).join("")}</select>
    <input class="fq" type="search" placeholder="Search" aria-label="Search"><span class="small muted fn">${rows.length} shown</span></div>
    <div class="tw" style="max-height:${opts.h || 620}px;overflow-y:auto"><table><thead><tr><th>Severity</th><th>Category</th>${opts.who ? `<th>${opts.who}</th>` : ""}<th>What happened</th><th></th></tr></thead><tbody>
    ${sorted.map(r => `<tr data-c="${esc(r.category)}" data-s="${esc(r.severity)}"><td>${sev(r.severity)}</td><td>${esc(human(r.category))}</td>${opts.who ? `<td>${esc(r.rep || "–")}</td>` : ""}<td>${esc(r.summary)}</td><td>${r.call_id ? (opts.kind === "triage" ? openTriage(r.call_id) : openCall(r.call_id)) : r.lead_id ? openThread(r.lead_id) : ""}</td></tr>`).join("")}
    </tbody></table></div></div>`;
}

/* ---------- data ---------- */
async function getJSON(path) {
  if (!cache[path]) cache[path] = fetch(path, { cache: "no-store" }).then(r => { if (!r.ok) throw new Error(r.status + " " + path); return r.json(); });
  return cache[path];
}
const offerObj = () => OFFERS.find(o => o.id === state.offer) || OFFERS[0];
const lib = kind => getJSON(`${offerObj().data}_${kind}.json`);

/* ---------- panel ---------- */
function openPanel(html) {
  $("#panelBody").innerHTML = html;
  $("#panel").classList.add("open"); $("#panel").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on");
  $("#panel").scrollTop = 0;
}
function closePanel() { $("#panel").classList.remove("open"); $("#panel").setAttribute("aria-hidden", "true"); $("#scrim").classList.remove("on"); }

/* ---------- tooltip ---------- */
document.addEventListener("pointermove", e => {
  const tip = $("#tip"); const r = e.target.closest("[data-tip]");
  if (!r || !r.dataset.tip) { tip.style.opacity = 0; return; }
  tip.textContent = r.dataset.tip; tip.style.opacity = 1;
  const x = Math.min(e.clientX + 14, innerWidth - tip.offsetWidth - 8), y = e.clientY + 16;
  tip.style.left = Math.max(8, x) + "px"; tip.style.top = (y + tip.offsetHeight > innerHeight ? e.clientY - tip.offsetHeight - 10 : y) + "px";
});
