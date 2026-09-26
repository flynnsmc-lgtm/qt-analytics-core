"""
Quasi-Edge Script: Telemetry Probe
Executes on the edge to measure local latency, query Hypersphere /audi state,
and confirm continuous manifold norm locking.
"""

import sys
import time
import json
import urllib.request

def run(context=None):
    context = context or {}
    start = time.perf_counter()
    endpoint = context.get("endpoint", "http://localhost:8080/audi?format=json")

    status = "OK"
    data = {}
    try:
        req = urllib.request.Request(endpoint, headers={"User-Agent": "QuasiEdgeProbe/1.0", "Accept": "application/json"})
        with urllib.request.urlopen(req, timeout=2.0) as resp:
            data = json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        status = "OFFLINE"
        data = {"error": str(e)}

    latency_ms = round((time.perf_counter() - start) * 1000, 3)
    norm = data.get("norm", 0.0)
    locked = data.get("status") == "LOCKED" and abs(norm - 100.0) < 1e-4

    result = {
        "script": "edge_telemetry_probe",
        "status": status,
        "latency_ms": latency_ms,
        "hypersphere_locked": locked,
        "norm": norm,
        "carrier_anchor": data.get("anchor_freq", "432.000 Hz"),
        "edge_safe": True
    }
    return result

if __name__ == "__main__":
    res = run()
    print(json.dumps(res, indent=2))
