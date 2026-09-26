"""
quasi_agent_protocol.py — Evaluate → Decide → Execute → Edge‑Safe
Purpose: Lightweight, edge-deployed, evaluator-driven agent mesh;
connects to Hypersphere/Audi backend & Quiz Agent logic.
"""

import os
import sys
import json
import time
import asyncio
import importlib.util

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')

# Ensure workspace root is in sys.path
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

from antigravity.core import AcropolisLibrary, CompetencyMirror
from antigravity.hypersphere import AudiClient

# --------------------------
# 1. CORE DEFINITIONS
# --------------------------
QUASI_EDGE_SCRIPTS = {
    "status": "CREATED",
    "exec_mode": "EDGE_LOCAL_FIRST",
    "trust_boundary": "HYPERSphere_LOCKED",
    "path": "./scripts/quasi_edge/"
}

EVALUATOR_PI = {
    "name": "QUASI_EVALUATOR_PI",
    "logic": "CONTINUOUS_MANIFOLD",
    "metric": "INSIGHT_RATING",
    "backend": "http://localhost:8080/audi",
    "status": "DEFINED"
}

# --------------------------
# 2. INITIALIZE FRAMEWORK
# --------------------------
class QuasiAgentProtocol:
    def __init__(self):
        self.acropolis = AcropolisLibrary(vault="Quasi_Agent_Registry")
        self.hypersphere = AudiClient(endpoint=EVALUATOR_PI["backend"])
        self.mirror = CompetencyMirror()
        self.edge_ready = False
        self.evaluator_active = False

    async def bootstrap(self):
        """Wire edge + evaluator + verify against Hypersphere state"""
        print("🔌 Bootstrapping Quasi‑Agent Framework...")
        # 1. Verify core health
        state = await self.hypersphere.ping()
        if state.get("status") != "LOCKED":
            raise RuntimeError(f"❌ Hypersphere not secure — abort (Status: {state.get('status')})")
        # 2. Load edge scripts
        QUASI_EDGE_SCRIPTS["status"] = "LOADED"
        # 3. Activate evaluator
        EVALUATOR_PI["status"] = "ACTIVE"
        self.evaluator_active = True
        # 4. Register
        self.acropolis.register_protocol("quasi_agent", {
            "edge": QUASI_EDGE_SCRIPTS,
            "evaluator": EVALUATOR_PI,
            "connected": True
        })
        self.edge_ready = True
        print("✅ QUASI‑AGENT PROTOCOL LIVE — Edge + Evaluator + Hypersphere SYNC’D")
        return {
            "status": "LIVE",
            "edge_ready": self.edge_ready,
            "evaluator_active": self.evaluator_active,
            "core_state": state
        }

    # --------------------------
    # 3. EVALUATOR LOGIC (Like Quiz Agent)
    # --------------------------
    def evaluate(self, task_context):
        """Quasi‑Evaluator: Insight + Fit + Competency Mirror"""
        if not self.evaluator_active:
            return {"status": "STANDBY"}
        score = {
            "physics_insight": task_context.get("hypersphere_fit", 0),
            "edge_suitability": task_context.get("local_resource_fit", 0),
            "gap_alignment": self.mirror.score(task_context)
        }
        total = sum(score.values())
        score["total_score"] = round(total, 3)
        score["decision"] = "ASSIGN_EDGE" if total > 1.5 else "REFER_UP"
        return score

    def evaluate_metrics(self, data):
        """Safe evaluation wrapper with zero-denominator protection"""
        return evaluate_quasi_metrics(data)

    # --------------------------
    # 4. EDGE EXECUTION WRAPPER
    # --------------------------
    async def run_edge(self, script_id, context=None):
        """Execute safely on edge — report back to core"""
        if not self.edge_ready:
            raise RuntimeError("⚠️ Edge not ready")
        context = context or {}
        print(f"⚡ Running Edge Script: {script_id}")

        # If a dedicated python script exists in scripts/quasi_edge/, execute its run() method
        edge_dir = os.path.join(BASE_DIR, "scripts", "quasi_edge")
        script_file = script_id if script_id.endswith(".py") else f"{script_id}.py"
        target_path = os.path.join(edge_dir, script_file)

        script_output = {}
        if os.path.exists(target_path):
            try:
                spec = importlib.util.spec_from_file_location(script_id, target_path)
                mod = importlib.util.module_from_spec(spec)
                spec.loader.exec_module(mod)
                if hasattr(mod, "run"):
                    script_output = mod.run(context)
            except Exception as e:
                script_output = {"error": str(e)}

        result = {
            "script": script_id,
            "ran": True,
            "context_ok": True,
            "details": script_output,
            "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        }
        return result

# --------------------------
# SAFE METRICS EVALUATOR (Zero-Denominator Protected)
# --------------------------
def evaluate_quasi_metrics(data):
    """
    Safe evaluation logic for quasi metrics with division-by-zero protection.
    Guards against zero total weights or zero norm denominator.
    """
    weights = data.get("weights", [])
    total = sum(weights)
    # Guard against literal zero
    if not total:
        return {"score": 0.0, "status": "NEUTRAL", "safe": True}
    # Normal calculation
    values = data.get("values", [])
    normalized = [w / total for w in values]
    return {"score": sum(normalized), "status": "CALCULATED", "safe": True}

# --------------------------
# 5. LAUNCH / EXPOSE
# --------------------------
async def main():
    qap = QuasiAgentProtocol()
    bootstrap_info = await qap.bootstrap()
    print(f"📡 Bootstrap Info: Core Norm = {bootstrap_info['core_state'].get('norm')}")

    # Example: Evaluate a candidate/task
    sample = {"hypersphere_fit": 0.9, "local_resource_fit": 0.8}
    eval_res = qap.evaluate(sample)
    print("📊 Evaluator Result:", json.dumps(eval_res, indent=2))

    # Example: Run edge scripts
    probe_res = await qap.run_edge("edge_telemetry_probe", {"endpoint": "http://localhost:8080/audi?format=json"})
    print("⚡ Probe Output:", json.dumps(probe_res["details"], indent=2))

    guard_res = await qap.run_edge("edge_invariant_guard", {"n1": 64, "n2": 64, "n3": 4096})
    print("🛡️ Guard Output:", json.dumps(guard_res["details"], indent=2))

if __name__ == "__main__":
    asyncio.run(main())
