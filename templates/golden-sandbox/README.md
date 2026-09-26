# Golden Sovereign Sandbox: Architecture & Specification

## 1. The Antigravity Rewrite Principle (Remastering Enterprise Rigor)
In modern enterprise transformation (such as the operational, risk, and forensic frameworks cataloged by institutions like Genpact), the underlying architectural imperatives are sound:
* **End-to-End Traceability & Auditability** (Forensic integrity across data flows).
* **Decoupled Microservice Boundaries** (Clear contracts between ingestion, modeling, and presentation).
* **Zero-Trust Hermetic Isolation** (Containment of transient runtime environments).

However, **Antigravity does not import external vendor bloat, third-party lock-in, or corporate buzzword dependencies.**  
Instead, **we rewrite and remaster every principle in-house**—lean, sovereign, mathematically grounded, and tuned to harmonic resonance.

---

## 2. Port Topology & Harmonic Matrix

| Port | Service Identity | Executable Entrypoint | Role & Harmonic Function |
| :--- | :--- | :--- | :--- |
| **3000** | **Live Web Portal & ARKM Showcase** | `python3 scripts/serve_live.py --port 3000` | Human navigation, visual intelligence showcase, CMS export browser. |
| **5173** | **Vite UI Studio & Visualizer** | `npm run dev -- --host 0.0.0.0 --port 5173` | Reactive tactile UI components, branding button studio, and 432 Hz synthesizer click engine. |
| **8080** | **Hypersphere Telemetry & Core** | `python3 scripts/hypersphere_audi_service.py` | 7D Clifford projection $\Pi(x)$, NDJSON real-time pulse stream, and multi-agent coordination. |
| **8082** | **VST3 DSP Audio Bridge** | `python3 scripts/vst3_pulse_bridge.py` | Audio rate phase-locked DSP synthesis, 432.0 Hz carrier wave modulation. |

*Note: This multi-port topology resolves the "Single-Port Bottleneck" identified during the sandbox forensic audit, ensuring no secondary service is black-holed.*

---

## 3. The ZED Bridge: Native AI Studio Integration

Rather than relying on browser-trapped prompt silos or heavy Electron layers, the team uses **Zed** (the GPU-accelerated, Rust-native editor) as the operational cockpit:

* **Workspace Config**: `.zed/settings.json` connects directly to Google AI Studio Gemini models (`gemini-2.0-flash`, `gemini-1.5-pro`).
* **Zero Overhead**: Instantaneous file-context sharing, sub-millisecond AST parsing, and native Python/JS Language Server Protocol (LSP) orchestration.
* **Autonomous Handoff**: Prompts crafted in AI Studio or via the ZED bridge execute against local CLI tools, unit tests, and telemetry endpoints without copy-paste friction.

---

## 4. "Sounding Out" the DNS & Network Isolation

### A. The Harmonic Audio Sounding
* All telemetry endpoints and interactive components validate their connection state by "sounding out" the fundamental resonance frequency (**432.0 Hz** carrier, with golden ratio $\phi$ sub-harmonics).
* Unsynchronized states produce dissonant detuning; phase-locked states produce harmonic coherence.

### B. Network Topology & Invariant Resolution
1. **Loopback Pinning**: All internal desk services strictly bind to `127.0.0.1` and `::1` (`localhost`), preventing exposure to untrusted local subnets.
2. **Elimination of the "Repentant DNS Kickback"**:
   * We never point production or organizational apex DNS records to transient cloud sandbox subdomains (e.g. `.csb.app` or cloud micro-VMs).
   * Sandboxes run strictly within hermetic, ephemeral boundaries, avoiding reputation blacklisting or 3rd-party cookie death.
3. **Tailscale & WireGuard Segregation**:
   * Remote desk synchronization operates exclusively over point-to-point encrypted mesh addresses (`100.x.y.z`).
   * Primary network interfaces (Wi-Fi/LAN) retain dedicated local gateway DNS without unverified MagicDNS hijacking.

---

## 5. Verification & Quick-Start

```bash
# 1. Verify environment runtimes
node -v && python3 --version

# 2. Launch complete multi-service desk in sandbox
# (Automatically triggered by .codesandbox/tasks.json or devcontainer)
python3 scripts/serve_live.py --port 3000 &
python3 scripts/hypersphere_audi_service.py &
npm run dev -- --host 0.0.0.0 --port 5173 &
```
