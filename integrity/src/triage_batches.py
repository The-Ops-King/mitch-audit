#!/usr/bin/env python3
"""Make triage-call extraction batches from finished transcripts that aren't scored yet.
Usage: python3 -I src/triage_batches.py <scratch_dir> <batch_size>"""
import json, os, sys, glob
X, N = sys.argv[1], int(sys.argv[2])
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
D = f"{ROOT}/data/krc"
meta = json.load(open(f"{D}/raw/setter_call_meta.json"))
done = {os.path.basename(f)[:-5] for f in glob.glob(f"{D}/setter_calls/*.json")}
queued = set()
for b in glob.glob(f"{D}/raw/batches/triage_*.json"):
    queued |= {x["call_id"] for x in json.load(open(b))}
todo = [k for k, m in meta.items() if os.path.exists(f"{X}/krc_setter/text/{k}.txt") and k not in done and k not in queued]
n0 = len(glob.glob(f"{D}/raw/batches/triage_*.json"))
out = []
for i in range(0, len(todo), N):
    chunk = todo[i:i + N]
    path = f"{D}/raw/batches/triage_{n0 + len(out) + 1:02d}.json"
    json.dump([{"call_id": k, "transcript": f"{X}/krc_setter/text/{k}.txt", **{f: meta[k][f] for f in ("user_name", "date", "duration_min", "lead_id")}} for k in chunk], open(path, "w"), indent=1)
    out.append((path, len(chunk)))
print(out)
