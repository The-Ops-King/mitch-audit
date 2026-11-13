// EOC decision step for Zapier "Code by Zapier" (JavaScript).
// Place it right after the EOC trigger. It makes every decision the EOC Zap
// needs and outputs clean values. Native Close, Airtable and Slack steps do
// the writing, so no API keys live in this code.
//
// Input Data (map each key in the Code step's Input Data section):
//   call_outcome, call_type, payment_type, in_house_plan, final_instalment,
//   follow_up_set, follow_up_date, date_of_call, cash_collected, contract_value,
//   product, payment_method, closer_name, setter_name, lead_full_name,
//   lead_email, lead_phone, fathom_link, post_call_notes, no_close_reasons,
//   dq_reason, lost_reason, reschedule_date, cancellation_reason,
//   date_2, amt_2, date_3, amt_3, date_4, amt_4, date_5, amt_5, date_6, amt_6

// ---- Config: Close IDs. Update here if a status or stage changes. ----
const LEAD = {
  NO_SHOW:        'stat_dHSRnFtMSrsGFBtePiNOrKP9XPLGcmvlUUv3dvw95g3',
  CANCELED:       'stat_20aMcF4Q9rT1mFceZx4JmCRKouy1DgR2nwD1FElJlyb',
  RESCHEDULE:     'stat_BUn7St3A9gtzdL3TxB8hZRn79VXRLCIu0a5aLIpi4ag',
  FOLLOW_UP:      'stat_6hDpZwuY1io4FpbpQX6G4SeQzktd4A6IW8PvrdNoH9w',
  DQ:             'stat_I91LwxB5PCUdlID1yHQ4tdnOYd4XTtsNUb6Pf8FvegV',
  NGMI:           'stat_yJjN5E0POao217QirC8sG5JTOzTa1GMCoepohg0jnT3',
  DEPOSIT:        'stat_WmxZRH9xxUvhTAat01QyWRuNxqJ14s5e0wEN2iEDWkX',
  SIGNED_BALANCE: 'stat_UEBEBfjgHoWd8zyhgQOG4CpfLJTPZxwHpH3dx7JY2w4',
  SIGNED_CLOSED:  'stat_s71HtAeLV1kWdJUKnhNVmXsPYrek4behA0iUeIr9he3',
};
// Opportunity stages. No Show, Canceled and Reschedule keep the deal at the
// booked stage; the lead status carries those outcomes and triggers the drips.
const OPP = {
  BOOKED:     'stat_BzhIsICvsVNy3TBkF1u4GCaZuv2N1XI0lcA1W8HRvXB', // New Deal - Mentorship Interview
  NO_SHOW:    'stat_BzhIsICvsVNy3TBkF1u4GCaZuv2N1XI0lcA1W8HRvXB', // stays at booked stage
  CANCELED:   'stat_BzhIsICvsVNy3TBkF1u4GCaZuv2N1XI0lcA1W8HRvXB', // stays at booked stage
  RESCHEDULE: 'stat_BzhIsICvsVNy3TBkF1u4GCaZuv2N1XI0lcA1W8HRvXB', // stays at booked stage
  FOLLOW_UP:  'stat_54luUoy1nhtOSlVXVX6kYEz8SlicJMbUYLbK2LlbK11', // New Deal - Pending Close
  DEPOSIT:    'stat_EXBo9DtaKkTG6wc0HPTG2nwuFtWYTpSi27z7lCqXZoI', // Deposit Paid (must be set to Active in Close)
  WON:        'stat_sLE0JY2OeweB23uzR6wFdeEkB23nwC6Lewi4CTaLWXJ', // New Deal - Closed
  LOST:       'stat_k83Fsib2qZYG7U96miD1nFwmvPisYXtPCr19dssx546', // New Deal - Lost
};

// ---- Helpers ----
const has = (v) => v !== undefined && v !== null && String(v).trim() !== '';
const str = (v) => (has(v) ? String(v).trim() : '');
// "$1,133.33" -> 113333. Returns '' when blank. Fails loudly on junk.
const cents = (v, label) => {
  if (!has(v)) return '';
  const n = Number(String(v).replace(/[$,\s]/g, ''));
  if (!Number.isFinite(n)) throw new Error(`${label} is not a number: "${v}"`);
  return Math.round(n * 100);
};

const outcome = str(inputData.call_outcome);
const payType = str(inputData.payment_type);
const onPlan = str(inputData.in_house_plan).startsWith('Yes');
const finalInst = str(inputData.final_instalment) === 'Final Instalment';

// ---- Decide statuses ----
let leadStatus, oppStatus, showed, countsAsClosed = 'no', needsOnboarding = 'no';
let updateOpp = 'yes', oppWonDate = '', oppValueCents = '';

switch (outcome) {
  case 'No Show':      leadStatus = LEAD.NO_SHOW;    oppStatus = OPP.NO_SHOW;    showed = 'No';  break;
  case 'Cancelled':    leadStatus = LEAD.CANCELED;   oppStatus = OPP.CANCELED;   showed = '';    break;
  case 'Reschedule':   leadStatus = LEAD.RESCHEDULE; oppStatus = OPP.RESCHEDULE; showed = '';    break;
  case 'Disqualified': leadStatus = LEAD.DQ;         oppStatus = OPP.LOST;       showed = 'Yes'; break;
  case 'Lost':         leadStatus = LEAD.NGMI;       oppStatus = OPP.LOST;       showed = 'Yes'; break;
  case 'Offer Made':
  case 'No Pitch - 2 Call Close':
    leadStatus = LEAD.FOLLOW_UP; oppStatus = OPP.FOLLOW_UP; showed = 'Yes';
    oppValueCents = cents(inputData.contract_value, 'Contract Value');
    break;
  case 'Closed':
    showed = 'Yes';
    if (payType === 'Deposit') {
      leadStatus = LEAD.DEPOSIT; oppStatus = OPP.DEPOSIT;           // a deposit is not a closed deal
      oppValueCents = cents(inputData.contract_value, 'Contract Value');
    } else if (payType === 'Closed - Needs Onboarding' || payType === 'Setter Takedown') {
      leadStatus = onPlan ? LEAD.SIGNED_BALANCE : LEAD.SIGNED_CLOSED;
      oppStatus = OPP.WON; countsAsClosed = 'yes';
      oppWonDate = str(inputData.date_of_call);
      oppValueCents = cents(inputData.contract_value, 'Contract Value'); // deal value = contract, not cash
      needsOnboarding = payType === 'Closed - Needs Onboarding' ? 'yes' : 'no';
    } else if (payType === 'Instalment Paid') {
      leadStatus = finalInst ? LEAD.SIGNED_CLOSED : LEAD.SIGNED_BALANCE;
      oppStatus = ''; updateOpp = 'no';                              // installments never create or move deals
    } else {
      throw new Error(`Closed outcome with unknown Payment Type: "${payType}"`);
    }
    break;
  default:
    throw new Error(`Unknown Call Outcome: "${outcome}"`); // fails the run so it shows in Zap history
}

// ---- Follow-up task ----
const createTask = (str(inputData.follow_up_set) === 'Yes' || ['Offer Made', 'No Pitch - 2 Call Close'].includes(outcome))
  && has(inputData.follow_up_date) ? 'yes' : 'no';

// ---- Payment plan (installments 2 to 6) as line items for Looping by Zapier ----
const inst = [2, 3, 4, 5, 6]
  .map((n) => ({ n, date: str(inputData[`date_${n}`]), amt: str(inputData[`amt_${n}`]) }))
  .filter((i) => has(i.date) || has(i.amt));
const planIncomplete = inst.some((i) => !has(i.date) || !has(i.amt));
if (countsAsClosed === 'yes' && onPlan && (inst.length === 0 || planIncomplete)) {
  throw new Error('Payment plan selected but installment dates/amounts are missing or incomplete');
}

// ---- Slack summary (3rd installment now shows the amount) ----
const lines = [];
const add = (label, v) => { if (has(v)) lines.push(`*${label}:* ${v}`); };
lines.push(`*${str(inputData.closer_name) || 'A sales rep'} submitted an EOC*`, '');
add('Lead', inputData.lead_full_name); add('Email', inputData.lead_email); add('Phone', inputData.lead_phone);
add('Date of Call', inputData.date_of_call); add('Call Type', inputData.call_type); add('Outcome', outcome);
add('Reschedule Date', inputData.reschedule_date); add('Cancellation Reason', inputData.cancellation_reason);
add('DQ Reason', inputData.dq_reason); add('Lost Reason', inputData.lost_reason);
add('Objections', inputData.no_close_reasons); add('Follow Up Date', inputData.follow_up_date);
add('Setter', inputData.setter_name); add('Cash Collected', inputData.cash_collected);
add('Contract Value', inputData.contract_value); add('Payment Type', payType);
add('Payment Method', inputData.payment_method); add('Product', inputData.product);
if (inst.length) {
  lines.push('', '*Payment Plan*');
  inst.forEach((i) => lines.push(`- #${i.n}: ${i.amt || '?'} on ${i.date || '?'}`));
}
if (has(inputData.fathom_link)) lines.push('', `*Fathom:* ${inputData.fathom_link}`);
if (has(inputData.post_call_notes)) lines.push('', '*Notes*', str(inputData.post_call_notes));

output = {
  lead_status_id: leadStatus,
  update_opp: updateOpp,
  opp_status_id: oppStatus,
  opp_value_cents: oppValueCents,
  opp_date_won: oppWonDate,
  showed,
  counts_as_closed_deal: countsAsClosed,
  needs_onboarding: needsOnboarding,
  create_followup_task: createTask,
  followup_due: str(inputData.follow_up_date),
  cash_collected_cents: cents(inputData.cash_collected, 'Cash Collected'),
  has_plan: inst.length ? 'yes' : 'no',
  inst_numbers: inst.map((i) => i.n).join(','),
  inst_dates: inst.map((i) => i.date).join(','),
  inst_amounts: inst.map((i) => (has(i.amt) ? String(i.amt).replace(/[$,\s]/g, '') : '')).join(','),
  slack_message: lines.join('\n'),
};
