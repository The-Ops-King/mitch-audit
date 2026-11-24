// EOC: everything in one Code by Zapier step (JavaScript).
//
// The Zap is two steps:
//   1. Airtable  > New Record > table "📝 EOC Report Responses"
//   2. Code by Zapier > Run JavaScript > this code
// Input Data for step 2 has ONE row:   record_id  =  step 1 "ID"
//
// What it does, in this order:
//   A. Reads the EOC from Airtable and checks it makes sense (no writes yet).
//   B. Close: updates the lead, adds the note, updates or creates the deal, adds the follow-up task.
//   C. Airtable: Lead Base, and for closed deals Customer, Customer Product, Payment Record, Instalment rows.
//   D. Google Sheets: the EOC log row, and the cash row when a payment is logged.
//   E. Slack: the EOC summary, and the two money alerts when a payment is logged.
//
// Safe to replay: every write in B, C and D checks first, so a replay finishes the job without duplicates.
// Slack messages (E) run last because a replay can repeat them.
//
// When something fails, the error says which part failed, why, how to fix it, and what was already done.

// ===================== SETUP: paste the keys here, never into Input Data =====================
const CONFIG = {
  DRY_RUN: true, // true = read everything, write nothing, and list what it WOULD do. Set to false to go live.
  CLOSE_API_KEY: 'PASTE_CLOSE_API_KEY',
  AIRTABLE_TOKEN: 'PASTE_AIRTABLE_TOKEN',
  SLACK_EOC_WEBHOOK: 'PASTE_SLACK_WEBHOOK_FOR_EOC_CHANNEL',
  SLACK_MONEY_WEBHOOK_KIM: 'PASTE_SLACK_WEBHOOK_FOR_KIM_PAYMENTS_CHANNEL',
  SLACK_MONEY_WEBHOOK_INTERNAL: 'PASTE_SLACK_WEBHOOK_FOR_INTERNAL_PAYMENTS_CHANNEL',
  SHEETS_URL: 'PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL',
  SHEETS_SECRET: 'PASTE_THE_SAME_SECRET_AS_IN_THE_APPS_SCRIPT',
};

// ===================== IDs (change only if Close or Airtable changes) =====================
const AIRTABLE_BASE = 'appIlwYJf96ybvwSt';
const TBL = {
  eoc: 'tblUwuIwDACVj4IOs', users: 'tblKOsxGk41XxHNdJ', customers: 'tbl0NGI3OT9G4NlMB', products: 'tblJxCHu4yyqLzTiB',
  leads: 'tblDqn13hcWbeKEy2', payments: 'tblsSwIO7xkkSez10', instalments: 'tblOt5OAnmsmWUZ3R',
};
const CF = { // Close lead custom fields
  activeDeal: 'cf_kZaUcMopRPlMuD4BZ6qz84zHnY918dZELyOXAbCjSmj', closerOwner: 'cf_C8VPhNe0qrezSasWIWaAZ5BKf6prTK3Ga2tn04ZvBdq',
  setterOwner: 'cf_wMrvg3pRYRb9YofHDo3sKU3Bww5A0l4PB3jSAQBAEjw', dateOfCall: 'cf_gfB7e3PvhzQHac2oMs1KGCqD7bJ9YQXueZ5yzG33lnH',
  fathom: 'cf_0vuzpARUyPg9GbQz4OjtvldrcoWZ3uZzbKAqj5nNLN1',
};
const LEAD = {
  NO_SHOW: ['stat_dHSRnFtMSrsGFBtePiNOrKP9XPLGcmvlUUv3dvw95g3', 'No show'],
  CANCELED: ['stat_20aMcF4Q9rT1mFceZx4JmCRKouy1DgR2nwD1FElJlyb', 'Canceled'],
  RESCHEDULE: ['stat_BUn7St3A9gtzdL3TxB8hZRn79VXRLCIu0a5aLIpi4ag', 'New Opportunity - Reschedule'],
  FOLLOW_UP: ['stat_6hDpZwuY1io4FpbpQX6G4SeQzktd4A6IW8PvrdNoH9w', 'Closer Follow Up'],
  DQ: ['stat_I91LwxB5PCUdlID1yHQ4tdnOYd4XTtsNUb6Pf8FvegV', 'DQ'],
  NGMI: ['stat_yJjN5E0POao217QirC8sG5JTOzTa1GMCoepohg0jnT3', 'NGMI'],
  DEPOSIT: ['stat_WmxZRH9xxUvhTAat01QyWRuNxqJ14s5e0wEN2iEDWkX', 'Deposit Paid'],
  SIGNED_BALANCE: ['stat_UEBEBfjgHoWd8zyhgQOG4CpfLJTPZxwHpH3dx7JY2w4', 'Signed Up - Balance Owed'],
  SIGNED_CLOSED: ['stat_s71HtAeLV1kWdJUKnhNVmXsPYrek4behA0iUeIr9he3', 'Signed Up - Closed'],
};
const OPP = {
  BOOKED: 'stat_BzhIsICvsVNy3TBkF1u4GCaZuv2N1XI0lcA1W8HRvXB', // New Deal - Mentorship Interview
  FOLLOW_UP: 'stat_54luUoy1nhtOSlVXVX6kYEz8SlicJMbUYLbK2LlbK11', // New Deal - Pending Close
  DEPOSIT: 'stat_EXBo9DtaKkTG6wc0HPTG2nwuFtWYTpSi27z7lCqXZoI', // Deposit Paid (an open stage)
  WON: 'stat_sLE0JY2OeweB23uzR6wFdeEkB23nwC6Lewi4CTaLWXJ', // New Deal - Closed
  LOST: 'stat_k83Fsib2qZYG7U96miD1nFwmvPisYXtPCr19dssx546', // New Deal - Lost
};

// ===================== error handling =====================
const done = [], skipped = [], warnings = [], planned = [];
const started = Date.now();
function fail(part, what, fix, detail) {
  const lines = [
    `FAILED AT: ${part}`,
    `WHAT HAPPENED: ${what}`,
    `HOW TO FIX: ${fix}`,
    `ALREADY DONE BEFORE THIS ERROR: ${done.length ? done.join(' | ') : 'nothing was written'}`,
    'AFTER FIXING: replay this run in Zap History. Finished parts are skipped, nothing is duplicated (Slack messages can repeat).',
  ];
  if (detail) lines.push(`TECHNICAL DETAIL (send this to Tyler if stuck): ${String(detail).slice(0, 600)}`);
  throw new Error(lines.join('\n'));
}
const HELP = {
  close: { 401: 'The Close API key is wrong or was deleted. Make a new one in Close (Settings > API Keys) and paste it in CONFIG.',
           403: 'The Close API key belongs to a user without permission. Use a key from an admin user.',
           404: 'Close could not find that record. It may have been deleted or merged.',
           400: 'Close rejected the data. The detail below says which field.' },
  airtable: { 401: 'The Airtable token is wrong or expired. Make a new one (airtable.com/create/tokens) with data.records:read and data.records:write on this base.',
              403: 'The Airtable token does not have access to this base or table. Edit the token and add the base.',
              404: 'Airtable could not find that table or record. Check record_id in Input Data is mapped to step 1 "ID".',
              422: 'Airtable rejected the data. The detail below names the field.' },
  slack: { 403: 'The Slack webhook was turned off. Make a new Incoming Webhook for that channel and paste it in CONFIG.',
           404: 'The Slack webhook link is wrong or was deleted. Make a new Incoming Webhook and paste it in CONFIG.' },
  sheets: { 401: 'The Sheets secret does not match. SHEETS_SECRET in CONFIG must be the same text as SECRET in the Apps Script.',
            404: 'The Apps Script link is wrong. In Apps Script use Deploy > Manage deployments and copy the Web app URL.' },
};
const NAMES = { close: 'Close', airtable: 'Airtable', slack: 'Slack', sheets: 'Google Sheets (Apps Script)' };
const LINK = { slack: 'the Slack webhook link', sheets: 'SHEETS_URL' };
async function call(part, service, method, url, { headers = {}, body } = {}) {
  const who = NAMES[service] || service;
  try { new URL(url); } catch (e) {
    fail(part, `The address for ${who} is not a valid web link: "${String(url).slice(0, 60)}".`, `Copy ${LINK[service] || 'the link'} again and paste it into CONFIG. It must start with https://`);
  }
  let res, text;
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      res = await fetch(url, { method, headers: { 'Content-Type': 'application/json', ...headers }, body: body ? JSON.stringify(body) : undefined, redirect: 'follow' });
      text = await res.text();
    } catch (e) {
      if (attempt === 2) fail(part, `Could not reach ${who} (network error).`, `Wait a minute and replay. If it keeps happening, ${who} may be down.`, e.message);
      continue;
    }
    if (res.status === 429 && attempt === 1) { await new Promise((r) => setTimeout(r, 1500)); continue; }
    break;
  }
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch (e) { json = null; }
  if (service === 'sheets' && res.ok && !(json && json.ok)) {
    const why = (json && json.error) || 'the Apps Script did not answer with ok';
    const help = /secret/i.test(why) ? HELP.sheets[401]
      : /sheet|tab/i.test(why) ? 'The Apps Script could not find that sheet or tab. Check the IDs in the Apps Script match the sheets, and that the script owner can edit both sheets.'
      : /json|html|doctype/i.test(text || '') ? 'The link is not the Web app URL, or the web app is not set to "Anyone". In Apps Script: Deploy > Manage deployments, check "Who has access: Anyone", copy the Web app URL.'
      : 'Open the Apps Script, check Executions for the error, and send it to Tyler.';
    fail(part, `Google Sheets did not save the row: ${why}.`, help, text);
  }
  if (!res.ok) {
    const code = res.status;
    const help = (HELP[service] || {})[code] || `Replay once. If it fails again, send the technical detail to Tyler.`;
    fail(part, `${who} returned error ${code}.`, help, text);
  }
  return json;
}

// ===================== small helpers =====================
const has = (v) => v !== undefined && v !== null && String(Array.isArray(v) ? v.join('') : v).trim() !== '';
const str = (v) => (Array.isArray(v) ? v.join(', ') : has(v) ? String(v).trim() : '');
const cents = (v, label) => {
  if (!has(v)) return '';
  const n = Number(String(v).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(n)) fail('A. Check the EOC', `${label} is not a number: "${v}".`, `Fix ${label} on the EOC record in Airtable, then replay.`);
  return Math.round(n * 100);
};
const money = (c) => (c === '' ? '' : (c / 100).toFixed(2));
const q = (s) => String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
const AT = `https://api.airtable.com/v0/${AIRTABLE_BASE}`;
const atH = () => ({ Authorization: `Bearer ${CONFIG.AIRTABLE_TOKEN}` });
const closeH = () => ({ Authorization: 'Basic ' + Buffer.from(CONFIG.CLOSE_API_KEY + ':').toString('base64') });
const closeUrl = (p) => `https://api.close.com/api/v1/${p}`;
async function atFind(part, table, formula) {
  const j = await call(part, 'airtable', 'GET', `${AT}/${table}?maxRecords=2&filterByFormula=${encodeURIComponent(formula)}`, { headers: atH() });
  return j.records || [];
}
async function atWrite(part, table, label, existing, fields) {
  if (CONFIG.DRY_RUN) { planned.push(`${existing ? 'update' : 'create'} ${label}`); return existing ? existing.id : `DRY_RUN_${label}`; }
  const body = { typecast: true, records: [existing ? { id: existing.id, fields } : { fields }] };
  const j = await call(part, 'airtable', existing ? 'PATCH' : 'POST', `${AT}/${table}`, { headers: atH(), body });
  done.push(`${existing ? 'updated' : 'created'} ${label}`);
  return j.records[0].id;
}
async function closeWrite(part, label, method, path, body) {
  if (CONFIG.DRY_RUN) { planned.push(`${label}: ${JSON.stringify(body).slice(0, 160)}`); return { id: `DRY_RUN_${label}` }; }
  const j = await call(part, 'close', method, closeUrl(path), { headers: closeH(), body });
  done.push(label);
  return j;
}

// ===================== A. read and check the EOC (no writes) =====================
const NEEDED = CONFIG.DRY_RUN ? ['CLOSE_API_KEY', 'AIRTABLE_TOKEN'] : Object.keys(CONFIG);
for (const [k, v] of Object.entries(CONFIG)) {
  if (NEEDED.includes(k) && typeof v === 'string' && v.startsWith('PASTE')) fail('Setup', `${k} in CONFIG is still empty.`, `Paste the ${k} value at the top of the code. See the setup guide.`);
}
const recordId = str(inputData.record_id);
if (!/^rec[A-Za-z0-9]{14}$/.test(recordId)) fail('Setup', `Input Data "record_id" is "${recordId}", which is not an Airtable record ID.`, 'In this step, Input Data: name it record_id and map it to step 1 "ID" (it starts with "rec").');

const eocRec = await call('A. Read the EOC', 'airtable', 'GET', `${AT}/${TBL.eoc}/${recordId}`, { headers: atH() });
const F = eocRec.fields || {};
const g = (name) => F[name];
const outcome = str(g('Call Outcome'));
const payType = str(g('Payment Type'));
const email = str(g('Lead Email')).toLowerCase();
const name = str(g('Lead Full Name'));
const closer = str(g('Closer Name'));
const setter = str(g('Setter Name'));
const product = str(g('Product Purchased'));
const method = str(g('Payment Method'));
const dateOfCall = str(g('Date of Call')).slice(0, 10);
const onPlan = str(g('Are They Paying an In-House Payment Plan? (NOT Through a Financing Partner)')).startsWith('Yes');
const finalInst = str(g("Is This The Lead's Final Instalment? Or Do They Still Owe More After This")) === 'Final Instalment';
if (!email) fail('A. Check the EOC', 'The EOC has no Lead Email.', 'Add the lead\'s email to the EOC record in Airtable, then replay.');
if (!outcome) fail('A. Check the EOC', 'The EOC has no Call Outcome.', 'Set Call Outcome on the EOC record, then replay.');
if (!dateOfCall) fail('A. Check the EOC', 'The EOC has no Date of Call.', 'Set Date of Call on the EOC record, then replay.');

let lead, oppStatus = '', showed = '', isNewDeal = false, updateOpp = true, oppValue = '', dateWon = '';
switch (outcome) {
  case 'No Show': lead = LEAD.NO_SHOW; oppStatus = OPP.BOOKED; break;
  case 'Cancelled': lead = LEAD.CANCELED; oppStatus = OPP.BOOKED; break;
  case 'Reschedule': lead = LEAD.RESCHEDULE; oppStatus = OPP.BOOKED; break;
  case 'Disqualified': lead = LEAD.DQ; oppStatus = OPP.LOST; break;
  case 'Lost': lead = LEAD.NGMI; oppStatus = OPP.LOST; break;
  case 'Offer Made':
  case 'No Pitch - 2 Call Close':
    lead = LEAD.FOLLOW_UP; oppStatus = OPP.FOLLOW_UP; oppValue = cents(g('Contract Value'), 'Contract Value'); break;
  case 'Closed':
    if (payType === 'Deposit') { lead = LEAD.DEPOSIT; oppStatus = OPP.DEPOSIT; oppValue = cents(g('Contract Value'), 'Contract Value'); }
    else if (['Closed - Needs Onboarding', 'Setter Takedown', 'Payment Plan - 1st Payment'].includes(payType)) {
      const plan = onPlan || payType === 'Payment Plan - 1st Payment';
      lead = plan ? LEAD.SIGNED_BALANCE : LEAD.SIGNED_CLOSED; oppStatus = OPP.WON; isNewDeal = true;
      dateWon = dateOfCall; oppValue = cents(g('Contract Value'), 'Contract Value');
    } else if (payType === 'Instalment Paid') { lead = finalInst ? LEAD.SIGNED_CLOSED : LEAD.SIGNED_BALANCE; updateOpp = false; }
    else fail('A. Check the EOC', `Call Outcome is Closed but Payment Type is "${payType || 'empty'}".`,
      'Set Payment Type to one of: Deposit, Closed - Needs Onboarding, Payment Plan - 1st Payment, Instalment Paid, Setter Takedown. Then replay.');
    break;
  default:
    fail('A. Check the EOC', `Call Outcome "${outcome}" is not one this code knows.`, 'If this is a new option on the form, ask Tyler to add it to the code. Otherwise fix the EOC record and replay.');
}
const ord = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' };
const inst = [2, 3, 4, 5, 6].map((n) => ({ n, date: str(g(`Date of ${ord[n]} Instalment`)).slice(0, 10), amt: g(`${ord[n]} Instalment Amount`) }))
  .filter((i) => has(i.date) || has(i.amt));
const planStart = isNewDeal && (onPlan || payType === 'Payment Plan - 1st Payment');
for (const i of inst) if (!has(i.date) || !has(i.amt)) fail('A. Check the EOC', `Instalment ${i.n} has ${has(i.date) ? 'a date but no amount' : 'an amount but no date'}.`, `Fill in both "Date of ${ord[i.n]} Instalment" and "${ord[i.n]} Instalment Amount" on the EOC, then replay.`);
if (planStart && !inst.length) fail('A. Check the EOC', 'This is a new payment plan but no instalment dates or amounts were entered.', 'Fill in the instalment dates and amounts on the EOC record, then replay.');
const followDate = str(g('Follow Up Date')).slice(0, 10);
const wantTask = has(followDate) && (str(g('Was a Follow Up Set?')) === 'Yes' || ['Offer Made', 'No Pitch - 2 Call Close'].includes(outcome));
const cashC = cents(g('Cash Collected'), 'Cash Collected');
const logPayment = outcome === 'Closed' && cashC !== '' && cashC > 0 && !/fanbasis/i.test(method);
const [y, m, d] = dateOfCall.split('-');
const dateUS = `${m}/${d}/${y}`;

// Slack / Close note text
const lines = [`*${closer || 'A sales rep'} submitted an EOC*`, ''];
const add = (label, v) => { if (has(v)) lines.push(`*${label}:* ${str(v)}`); };
add('Lead', name); add('Email', email); add('Phone', g('Lead Phone')); add('Date of Call', dateOfCall); add('Call Type', g('Call Type'));
add('Outcome', outcome); add('Reschedule Date', g('Reschedule Date')); add('Cancellation Reason', g('Cancellation Reason'));
add('DQ Reason', g('DQ Reason')); add('Lost Reason', g('Lost Reason')); add('Objections', g('No Close Reason(s) / Objection(s) Faced'));
add('Follow Up Date', followDate); add('Setter', setter); add('Cash Collected', money(cashC)); add('Contract Value', g('Contract Value'));
add('Payment Type', payType); add('Payment Method', method); add('Product', product);
if (inst.length) { lines.push('', '*Payment Plan*'); inst.forEach((i) => lines.push(`- #${i.n}: $${str(i.amt)} on ${i.date}`)); }
if (has(g('Fathom Share Link'))) lines.push('', `*Fathom:* ${str(g('Fathom Share Link'))}`);
if (has(g('Post Call Notes'))) lines.push('', '*Notes*', str(g('Post Call Notes')));
const summary = lines.join('\n');

// ===================== lookups (read only) =====================
const [closerRows, setterRows, closeLeads] = await Promise.all([
  closer ? atFind('A. Find the closer', TBL.users, `{Name}='${q(closer)}'`) : [],
  setter ? atFind('A. Find the setter', TBL.users, `{Name}='${q(setter.split(', ')[0])}'`) : [],
  call('A. Find the lead in Close', 'close', 'GET', closeUrl(`lead/?query=${encodeURIComponent(`email:"${email}"`)}&_fields=id,display_name,status_label,date_created,html_url,custom`), { headers: closeH() }),
]);
const closerUser = closerRows[0], setterUser = setterRows[0];
const closerId = closerUser ? str(closerUser.fields['Close ID']) : '';
const setterId = setterUser ? str(setterUser.fields['Close ID']) : '';
if (closer && !closerId && closer !== 'No Closer - Setter Takedown') warnings.push(`Closer "${closer}" has no Close ID in ℹ️ User ID Lookup, so Closer Owner was not set.`);
if (setter && !setterId) warnings.push(`Setter "${setter}" has no Close ID in ℹ️ User ID Lookup, so Setter Owner was not set.`);
const leads = (closeLeads && closeLeads.data) || [];
if (!leads.length) fail('A. Find the lead in Close', `Close has no lead with the email ${email}.`, 'Check the email on the EOC record matches the lead in Close (look for typos). Fix whichever is wrong, then replay.');
if (leads.length > 1) warnings.push(`Close has ${leads.length} leads with ${email}. Used the first one (${leads[0].display_name}). Merge the duplicates in Close.`);
const L = leads[0];
const activeDeal = str((L.custom || {})['Active Deal ID']);

// ===================== B. Close =====================
const leadUpdate = { status_id: lead[0], [`custom.${CF.dateOfCall}`]: dateOfCall };
if (closerId) leadUpdate[`custom.${CF.closerOwner}`] = closerId;
if (setterId) leadUpdate[`custom.${CF.setterOwner}`] = setterId;
if (has(g('Fathom Share Link'))) leadUpdate[`custom.${CF.fathom}`] = str(g('Fathom Share Link'));
await closeWrite('B. Close: update lead', 'Close lead updated', 'PUT', `lead/${L.id}/`, leadUpdate);

const notes = await call('B. Close: check notes', 'close', 'GET', closeUrl(`activity/note/?lead_id=${L.id}&_fields=note&_limit=50`), { headers: closeH() });
if ((notes.data || []).some((n) => str(n.note) === summary)) skipped.push('Close note (already there)');
else await closeWrite('B. Close: add note', 'Close note added', 'POST', 'activity/note/', { lead_id: L.id, note: summary });

if (updateOpp) {
  const opp = { status_id: oppStatus };
  if (oppValue !== '') { opp.value = oppValue; opp.value_period = 'one_time'; }
  if (dateWon) opp.date_won = dateWon;
  if (closerId) opp.user_id = closerId;
  if (activeDeal) {
    await closeWrite('B. Close: update deal', 'Close deal updated', 'PUT', `opportunity/${activeDeal}/`, opp);
  } else {
    const created = await closeWrite('B. Close: create deal', 'Close deal created (lead had no Active Deal ID)', 'POST', 'opportunity/', { lead_id: L.id, ...opp });
    await closeWrite('B. Close: save deal ID', 'Active Deal ID saved on lead', 'PUT', `lead/${L.id}/`, { [`custom.${CF.activeDeal}`]: created.id });
  }
} else skipped.push('Close deal (Instalment Paid does not change the deal)');

if (wantTask) {
  const text = `Follow up: ${name || email}`;
  const tasks = await call('B. Close: check tasks', 'close', 'GET', closeUrl(`task/?lead_id=${L.id}&is_complete=false&_fields=text,date`), { headers: closeH() });
  if ((tasks.data || []).some((t) => t.text === text && str(t.date).slice(0, 10) === followDate)) skipped.push('Close follow-up task (already there)');
  else {
    const task = { lead_id: L.id, text, date: followDate };
    if (closerId) task.assigned_to = closerId;
    await closeWrite('B. Close: add follow-up task', 'Close follow-up task added', 'POST', 'task/', task);
  }
}

// ===================== C. Airtable =====================
const leadBaseFields = { 'Lead Email': email, 'Lead Status': lead[1], 'Call Outcome': outcome, 'Closer Lead Owner': closer, 'Setter Lead Owner': setter };
if (name) leadBaseFields['Lead Full Name'] = name;
if (has(g('Lead Phone'))) leadBaseFields['Lead Phone'] = str(g('Lead Phone'));
leadBaseFields['Lead Profile URL'] = L.html_url;
const lb = await atFind('C. Airtable: find Lead Base row', TBL.leads, `LOWER({Lead Email})='${q(email)}'`);
await atWrite('C. Airtable: Lead Base', TBL.leads, 'Lead Base row', lb[0], lb[0] ? leadBaseFields : { ...leadBaseFields, 'Date Created': str(L.date_created).slice(0, 10) });

if (outcome === 'Closed') {
  const cust = await atFind('C. Airtable: find customer', TBL.customers, `LOWER({Email})='${q(email)}'`);
  const customerId = await atWrite('C. Airtable: Customer', TBL.customers, 'Customer', cust[0], { Name: name || email, Email: email });
  const key = `${email} | ${product}`;
  const prod = await atFind('C. Airtable: find customer product', TBL.products, `LOWER({Key})='${q(key.toLowerCase())}'`);
  const pf = { Key: key, Email: email, 'Product(s)': product, 'Closer Name': closer, 'Setter Name': setter };
  if (has(g('Contract Value'))) pf.Revenue = Number(g('Contract Value'));
  if (closerUser) pf['Owner (User)'] = [closerUser.id];
  const productId = await atWrite('C. Airtable: Customer Product', TBL.products, 'Customer Product', prod[0], pf);

  if (logPayment) {
    const amount = cashC / 100;
    const dup = await atFind('C. Airtable: check payment', TBL.payments, `AND(LOWER({Email})='${q(email)}', IS_SAME({Date}, '${dateOfCall}', 'day'), {Amount}=${amount})`);
    if (dup.length) skipped.push('Payment Record (already there)');
    else await atWrite('C. Airtable: Payment Record', TBL.payments, 'Payment Record', null, {
      Email: email, Name: name, Date: dateOfCall, Amount: amount, 'Net Amount': amount, Product: product,
      'Payment Method': method.split(', ')[0], 'Customer Table': [customerId], 'Customer Products': [productId],
    });
  }
  if (planStart) {
    for (const i of inst) {
      const ex = await atFind(`C. Airtable: check instalment ${i.n}`, TBL.instalments, `AND(FIND('${q(key)}', ARRAYJOIN({Customer Product})), {Installment #}=${i.n})`);
      if (ex.length) { skipped.push(`Instalment ${i.n} (already there)`); continue; }
      await atWrite(`C. Airtable: instalment ${i.n}`, TBL.instalments, `Instalment ${i.n}`, null, {
        'Installment #': i.n, 'Due Date': i.date, 'Amount Due': Number(String(i.amt).replace(/[$,\s]/g, '')), Customer: [customerId], 'Customer Product': [productId],
      });
    }
  }
}

// ===================== D. Google Sheets (via the Apps Script web app) =====================
async function sheetRow(part, sheet, row, label) {
  if (CONFIG.DRY_RUN) { planned.push(`${label}: ${row.length} columns`); return; }
  const j = await call(part, 'sheets', 'POST', CONFIG.SHEETS_URL, { body: { secret: CONFIG.SHEETS_SECRET, sheet, key: `${recordId}:${sheet}`, row } });
  if (j && j.skipped) skipped.push(`${label} (already there)`); else done.push(label);
}
const v = (n) => str(g(n));
await sheetRow('D. Sheets: EOC log', 'eoc', [
  name, v('Lead Phone'), email, dateUS, closer, v('Call Type'), outcome, v('Reschedule Type'), v('Cancellation Type'), v('No Show Type'),
  v('Reschedule Date'), v('DQ Reason'), v('No Close Reason(s) / Objection(s) Faced'), v('Was a Follow Up Set?'), v('How Come?'), followDate,
  v('Reason For No Pitch & Second Call'), setter, v('Cash Collected'), v('Contract Value'), payType, method, product,
  v('Are They Paying an In-House Payment Plan? (NOT Through a Financing Partner)'),
  ...[2, 3, 4, 5, 6].flatMap((n) => [v(`Date of ${ord[n]} Instalment`), v(`${ord[n]} Instalment Amount`)]),
  v('Cancellation Reason'), v('Post Call Notes'), v('Fathom Share Link'), v('Lost Reason'), v("Is This The Lead's Final Instalment? Or Do They Still Owe More After This"),
], 'EOC log sheet row');
if (logPayment) await sheetRow('D. Sheets: cash row', 'cash', [dateUS, money(cashC), money(cashC), method, email, name, 'Kimberly Rae Coaching'], 'Cash sheet row');

// ===================== E. Slack (last, because a replay can repeat these) =====================
async function slack(part, url, text, label) {
  if (CONFIG.DRY_RUN) { planned.push(label); return; }
  await call(part, 'slack', 'POST', url, { body: { text } });
  done.push(label);
}
await slack('E. Slack: EOC summary', CONFIG.SLACK_EOC_WEBHOOK, summary, 'Slack EOC summary');
if (logPayment) {
  const alert = `A New Payment Has Been Received!\n\nName: ${name}\n\nAmount: $${money(cashC)}\n\nEmail: ${email}`;
  await slack('E. Slack: money alert (Kim)', CONFIG.SLACK_MONEY_WEBHOOK_KIM, alert, 'Slack money alert (Kim)');
  await slack('E. Slack: money alert (internal)', CONFIG.SLACK_MONEY_WEBHOOK_INTERNAL, alert, 'Slack money alert (internal)');
}

output = {
  dry_run: CONFIG.DRY_RUN,
  lead: `${L.display_name} (${L.id})`,
  outcome: `${outcome}${payType ? ' / ' + payType : ''}`,
  close_status: lead[1],
  done: done.join(' | ') || (CONFIG.DRY_RUN ? 'nothing (dry run)' : 'nothing'),
  would_do: planned.join(' | '),
  skipped: skipped.join(' | '),
  warnings: warnings.join(' | '),
  seconds: ((Date.now() - started) / 1000).toFixed(1),
};
