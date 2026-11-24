// EOC follow-on records, run by an Airtable automation (Run script action).
// Trigger: "When a record matches conditions" in 📝 EOC Report Responses, condition "Zap Done" is checked.
// The Zap's code step makes every decision and writes it to the EOC row ("Zap Lead Status",
// "Zap Record Payment", "Zap Plan Start"). This script only copies data, so the rules live in one place.
//
// Input variables (left side of the Run script action): recordId = the trigger record's Airtable record ID.
//
// It is safe to run twice: every write checks first and updates instead of duplicating.

const { recordId } = input.config();

const T = {
  eoc: base.getTable('📝 EOC Report Responses'),
  users: base.getTable('ℹ️ User ID Lookup'),
  customers: base.getTable('👥 Customer Table'),
  products: base.getTable('🔖 Customer Products'),
  leads: base.getTable('👤 Lead Base'),
  payments: base.getTable('🏦 Payment Records'),
  instalments: base.getTable('📁 Instalment Records'),
};

const eoc = await T.eoc.selectRecordAsync(recordId);
if (!eoc) throw new Error(`EOC record ${recordId} not found`);

const txt = (f) => {
  const v = eoc.getCellValue(f);
  if (v == null) return '';
  if (Array.isArray(v)) return v.map((x) => (x && x.name) || String(x)).join(', ');
  if (typeof v === 'object' && v.name) return v.name;
  return String(v).trim();
};
const num = (f) => {
  const v = eoc.getCellValue(f);
  return typeof v === 'number' ? v : (v ? Number(String(v).replace(/[$,\s]/g, '')) : null);
};
const checked = (f) => eoc.getCellValue(f) === true;

const email = txt('Lead Email').toLowerCase();
if (!email) throw new Error('EOC has no Lead Email');
const name = txt('Lead Full Name');
const outcome = txt('Call Outcome');
const product = txt('Product Purchased');
const closer = txt('Closer Name');
const setter = txt('Setter Name');
const dateOfCall = eoc.getCellValue('Date of Call');
const done = [];

// Find the first record whose field equals the value (case-insensitive for text).
async function findBy(table, field, value) {
  const q = await table.selectRecordsAsync({ fields: [field] });
  const want = String(value).toLowerCase().trim();
  return q.records.find((r) => String(r.getCellValueAsString(field)).toLowerCase().trim() === want) || null;
}
async function upsert(table, field, value, fields) {
  const r = await findBy(table, field, value);
  if (r) { await table.updateRecordAsync(r.id, fields); return r.id; }
  return await table.createRecordAsync({ [field]: value, ...fields });
}

// ---- 1. Lead Base: outcome, Close status and owners, on every EOC ----
const leadFields = { 'Call Outcome': outcome, 'Closer Lead Owner': closer, 'Setter Lead Owner': setter };
if (txt('Zap Lead Status')) leadFields['Lead Status'] = txt('Zap Lead Status');
if (txt('Lead Phone')) leadFields['Lead Phone'] = txt('Lead Phone');
if (name) leadFields['Lead Full Name'] = name;
await upsert(T.leads, 'Lead Email', email, leadFields);
done.push('Lead Base');

let customerId = null, productId = null;
if (outcome === 'Closed') {
  // ---- 2. Customer and Customer Product ----
  customerId = await upsert(T.customers, 'Email', email, { Name: name || email });
  const owner = closer ? await findBy(T.users, 'Name', closer) : null;
  const pf = { Email: email, 'Product(s)': product, 'Closer Name': closer, 'Setter Name': setter };
  if (num('Contract Value')) pf['Revenue'] = num('Contract Value');
  if (owner) pf['Owner (User)'] = [{ id: owner.id }];
  productId = await upsert(T.products, 'Key', `${email} | ${product}`, pf);
  done.push('Customer', 'Customer Product');

  // ---- 3. Payment record (the Zap decided: Closed, cash over 0, not Fanbasis) ----
  if (checked('Zap Record Payment')) {
    const amount = num('Cash Collected');
    const all = await T.payments.selectRecordsAsync({ fields: ['Email', 'Date', 'Amount'] });
    const dup = all.records.find((r) => r.getCellValueAsString('Email').toLowerCase() === email
      && r.getCellValue('Date') === dateOfCall && r.getCellValue('Amount') === amount);
    if (!dup) {
      const method = txt('Payment Method');
      const choices = T.payments.getField('Payment Method').options.choices.map((c) => c.name);
      const pm = choices.find((c) => c.toLowerCase() === method.toLowerCase())
        || choices.find((c) => method.toLowerCase().startsWith(c.toLowerCase()));
      const fields = { Email: email, Name: name, Date: dateOfCall, Amount: amount, 'Net Amount': amount, Product: product,
                       'Customer Table': [{ id: customerId }], 'Customer Products': [{ id: productId }] };
      if (pm) fields['Payment Method'] = { name: pm };
      await T.payments.createRecordAsync(fields);
      done.push(pm ? 'Payment Record' : `Payment Record (method "${method}" not in the Payment Records list, left blank)`);
    } else done.push('Payment Record already existed');
  }

  // ---- 4. Instalment schedule (the Zap decided: first payment of a new plan) ----
  if (checked('Zap Plan Start')) {
    const ord = { 2: '2nd', 3: '3rd', 4: '4th', 5: '5th', 6: '6th' };
    const existing = await T.instalments.selectRecordsAsync({ fields: ['Customer Product', 'Installment #'] });
    for (const n of [2, 3, 4, 5, 6]) {
      const due = eoc.getCellValue(`Date of ${ord[n]} Instalment`);
      const amt = num(`${ord[n]} Instalment Amount`);
      if (!due && !amt) continue;
      if (!due || !amt) throw new Error(`Instalment ${n} has a date or an amount, but not both`);
      const dup = existing.records.find((r) => (r.getCellValue('Customer Product') || []).some((l) => l.id === productId)
        && r.getCellValue('Installment #') === n);
      if (dup) continue;
      await T.instalments.createRecordAsync({ 'Installment #': n, 'Due Date': due, 'Amount Due': amt,
        Customer: [{ id: customerId }], 'Customer Product': [{ id: productId }] });
      done.push(`Instalment ${n}`);
    }
  }
}

output.set('done', done.join(', '));
