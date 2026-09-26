# QT Analytics: Antigravity Sovereign API Contract & Integration Specification

**Version:** 1.1.0  
**Date:** 2026-09-26  
**Authority:** Antigravity Agent Desk (Sovereign Ingestion & Forensic Core)  
**Status:** SOVEREIGN ANTIGRAVITY CONTROL (Zed Contract Deferred — Zero Subscription Dependency)  

> [!IMPORTANT]
> **Operational Status Update (2026-09-26):**  
> External Zed editor assistant integration is deferred due to third-party subscription requirements. To maintain uninterrupted operational velocity, **all API contracts, Webflow intake hooks, Stripe session bridges, and forensic dispatch are 100% controlled natively within the Antigravity Agent Desk**. The system has zero external editor dependencies.

---

## 1. Executive Summary & File Inventory
This specification defines the boundary between the **Zed Agent Webflow/Stripe Bridge** and the **Antigravity Analytics Core**. All files are live and local in the repository:

| Role | Local File Path | Responsibility |
| :--- | :--- | :--- |
| **Backend Engine** | [`scripts/qt_analytics_core.py`](file:///c:/Users/44790/.gemini/antigravity-ide/scratch/chi-physics-core/scripts/qt_analytics_core.py) | Cryptographic hashing (`QT-QSH-*`), topological graph analysis, multivector risk scoring, 24-hr report queue. |
| **Bridge Service** | [`scripts/qt_webflow_bridge.py`](file:///c:/Users/44790/.gemini/antigravity-ide/scratch/chi-physics-core/scripts/qt_webflow_bridge.py) | Webhook intake on Port `8085` (or Port `3000`), CORS headers, Stripe session handoff. |
| **Webflow Frontend** | [`visuals/qt_whiteout_portal.html`](file:///c:/Users/44790/.gemini/antigravity-ide/scratch/chi-physics-core/visuals/qt_whiteout_portal.html) | Clean Whiteout Mountain Pillars UI, Progressive Disclosure (Layers 1-3), client-side validation. |
| **Test Suite** | [`scripts/test_qt_bridge_headless.py`](file:///c:/Users/44790/.gemini/antigravity-ide/scratch/chi-physics-core/scripts/test_qt_bridge_headless.py) | Headless verification of contract inputs and outputs. |
| **Zed Cockpit** | [`.zed/settings.json`](file:///c:/Users/44790/.gemini/antigravity-ide/scratch/chi-physics-core/.zed/settings.json) | Workspace bridge for Google AI Studio Gemini integration in the Zed editor. |

---

## 2. Flash Trace Commercial Pricing Options

To maximize immediate cash-flow while catering to different incident magnitudes, the Flash Trace (£49 – £499) tier is structured into three concrete product price points:

| Product ID | Display Name | Price | Target Scope & SLA |
| :--- | :--- | :--- | :--- |
| `flash_49` | **Flash Trace: Lite** | **£49** | Single wallet drain / incident triage, 3-hop trace, 24-Hour SLA PDF. |
| `flash_149` | **Flash Trace: Standard** *(Recommended)* | **£149** | Multi-hop peel chain analysis, mixer proximity scan, Sybil cluster detection, 24-Hour SLA PDF + Plain-English Summary. |
| `flash_499` | **Flash Trace: Priority Emergency** | **£499** | Complex cross-chain bridge drain, expedited **6-to-12 Hour SLA**, priority forensic desk routing. |

---

## 3. Required Submission Fields (Webflow $\rightarrow$ Zed Bridge)

Webflow collects these fields and passes them to the Zed backend bridge:

```json
{
  "tier_id": "flash_149",
  "client_email": "victim@domain.com",
  "wallet_address": "0x71C8364f3B8874289C05299E758a0A241Fba43E1",
  "tx_hash": "0x4b726488a04a9e220743712ce6d9bb1b5616b8fc223",
  "chain": "ethereum",
  "incident_notes": "Permit2 drainer signature executed via fake Discord link."
}
```

* **Field Validations:**
  * `client_email`: Must be valid RFC 5322 email string.
  * `wallet_address`: Must match EVM (`^0x[a-fA-F0-9]{40}$`), Solana base58 (32-44 chars), or Bitcoin legacy/SegWit pattern.
  * `tx_hash`: Optional for general wallet health checks; required for single-event drains.
  * `chain`: Allowed enum: `ethereum`, `arbitrum`, `optimism`, `polygon`, `solana`, `bitcoin`. Default is `ethereum`.

---

## 4. Antigravity API Contract

### Endpoint 1: Intake & Queue Dispatch
* **Method:** `POST /api/qt/intake`
* **Port:** `8085` (Bridge) or `3000` (Portal)
* **Headers:**
  ```http
  Content-Type: application/json
  X-QT-Bridge-Key: QT_SECURE_TOKEN_2026_PROD
  ```

#### Request Body from Zed Bridge (Post-Stripe Confirmation):
```json
{
  "order_id": "QT-ORD-88219",
  "tier_id": "flash_149",
  "stripe_session_id": "cs_live_a1b2c3d4e5f6g7",
  "client_email": "victim@domain.com",
  "wallet_address": "0x71C8364f3B8874289C05299E758a0A241Fba43E1",
  "tx_hash": "0x4b726488a04a9e220743712ce6d9bb1b5616b8fc223",
  "chain": "ethereum",
  "incident_notes": "Permit2 signature drain."
}
```

#### Immediate Response (HTTP 200 OK):
```json
{
  "success": true,
  "message": "Order Received & Ingested into 24-Hour Forensic Queue",
  "assessment": {
    "order_id": "QT-ORD-88219",
    "qsh_fingerprint": "QT-QSH-C92B3913EBCE5970",
    "tier": "flash_149",
    "client_email": "victim@domain.com",
    "chain": "ETHEREUM",
    "wallet_target": "0x71C8364f3B8874289C05299E758a0A241Fba43E1",
    "tx_target": "0x4b726488a04a9e220743712ce6d9bb1b5616b8fc223",
    "timestamp_utc": "2026-09-25 21:30:00Z",
    "risk_score": 0.65,
    "severity": "High",
    "status_text": "High Risk — Direct Peel-Chain or Wash Trading",
    "sla_delivery_hours": 12,
    "network_metrics": {
      "chain": "ETHEREUM",
      "hop_velocity_hops_per_min": 5.3,
      "clustering_coefficient": 0.31,
      "peel_chain_detected": true,
      "mixer_hop_distance": 2,
      "detected_network_flags": [
        "HIGH_RISK_MIXER_PROXIMITY_LE_2_HOPS",
        "RAPID_PEEL_CHAIN_DISPERSION"
      ]
    },
    "threat_flags": [
      "HIGH_RISK_MIXER_PROXIMITY_LE_2_HOPS",
      "RAPID_PEEL_CHAIN_DISPERSION"
    ],
    "verification_badge": "Verification: Warning",
    "progressive_disclosure": {
      "layer_1_badge": "Flagged",
      "layer_2_anomalies": [
        "HIGH_RISK_MIXER_PROXIMITY_LE_2_HOPS",
        "RAPID_PEEL_CHAIN_DISPERSION"
      ],
      "layer_3_delivery_window": "12-Hour Turnaround Report Scheduled"
    }
  }
}
```

---

### Endpoint 2: Order Status Lookup
* **Method:** `GET /api/qt/status?order_id=QT-ORD-88219`
* **Response:**
```json
{
  "success": true,
  "record": {
    "order_id": "QT-ORD-88219",
    "qsh_fingerprint": "QT-QSH-C92B3913EBCE5970",
    "status": "QUEUED",
    "delivery_due_utc": "2026-09-26T21:30:00Z",
    "severity": "High"
  }
}
```

---

## 5. Security & Secret Key Boundary
1. **Zero Client-Side Secrets**: Webflow never holds Stripe secret keys or internal processing tokens. It only communicates with the Zed bridge endpoint.
2. **Deterministic Quantum Hashes**: All reports are indexed by the `QuantumSecureHasher` (`QT-QSH-*`), guaranteeing immutable proof that the audit trail was sealed at the exact timestamp of intake.
3. **Hermetic Sandbox Execution**: Antigravity runs local python processes inside isolated environments without open exterior ports.
