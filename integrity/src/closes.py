"""One definition of a new closed deal, shared by every script.

An EOC counts as a new close when the outcome is Closed, the payment type is not a deposit, and it is the
lead's first such EOC. Closers mark the first payment of a new payment-plan deal "Instalment Paid", so that
payment type alone does not mean a repeat payment; only later EOCs for the same lead are repeat payments.
EOCs with no email fall back to: Instalment Paid counts only on a first call."""
import collections as C


def _key(e):
    return str(e.get("Lead Email") or "").lower().strip()


def mark_new_closes(eocs):
    by = C.defaultdict(list)
    for e in eocs:
        e["_new_close"] = False
        if e.get("Call Outcome") == "Closed" and e.get("Payment Type") != "Deposit":
            k = _key(e)
            if k:
                by[k].append(e)
            else:
                e["_new_close"] = e.get("Payment Type") != "Instalment Paid" or "First Call" in str(e.get("Call Type") or "")
    for es in by.values():
        min(es, key=lambda e: str(e.get("Date of Call") or "9999"))["_new_close"] = True
    return eocs


def is_new_close(e):
    return bool(e.get("_new_close"))
