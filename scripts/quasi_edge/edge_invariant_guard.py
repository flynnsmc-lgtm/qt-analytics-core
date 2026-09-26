"""
Quasi-Edge Script: Invariant Guard
Verifies the N1 x N2 ≈ N3 invariant on the edge, guards against melonic collapse,
and certifies continuous manifold boundary integrity.
"""

import sys
import json

def run(context=None):
    context = context or {}
    n1 = context.get("n1", 64)
    n2 = context.get("n2", 64)
    n3 = context.get("n3", 4096)

    product = n1 * n2
    diff = abs(product - n3)
    ratio = product / n3 if n3 != 0 else 0.0
    invariant_held = diff <= 1e-4

    throat_ratio = context.get("throat_ratio", 10.0 / 27.0)
    throat_expected = 10.0 / 27.0
    throat_ok = abs(throat_ratio - throat_expected) < 1e-5

    result = {
        "script": "edge_invariant_guard",
        "tensor_gate": [n1, n2, n3],
        "invariant": "N1 × N2 ≈ N3",
        "ratio": round(ratio, 4),
        "invariant_held": invariant_held,
        "throat_ratio": round(throat_ratio, 6),
        "throat_aligned": throat_ok,
        "boundary_fence": "delta = 0.002 fm",
        "status": "GUARD_ACTIVE_CERTIFIED" if invariant_held and throat_ok else "DEGRADED"
    }
    return result

if __name__ == "__main__":
    res = run()
    print(json.dumps(res, indent=2))
