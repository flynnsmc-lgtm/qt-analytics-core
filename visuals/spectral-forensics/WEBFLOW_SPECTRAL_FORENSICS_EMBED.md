# Webflow Deployment Guide: Spectral Forensics Intelligence Desk

**Project**: QT Analytics — Spectral Forensics Intelligence Desk (V2)  
**ID**: `QT-SF-V2-ANTIGRAVITY`  
**Deployment Target**: Webflow Custom Embed / Dedicated Page (`/spectral-forensics`)

---

## 🚀 How to Add to Webflow in 3 Minutes

### Option 1: Dedicated Webflow Page (Recommended)
1. In Webflow Designer, create a new page with slug: `/spectral-forensics` or `/forensics`.
2. Page Settings:
   - **Page Title**: `QT Analytics — Spectral Forensics Intelligence Desk`
   - **Meta Description**: `Single-page interactive, connected, and self-documenting spectral intelligence desk for on-chain entity forensics, risk scoring, and Gödel locking relation physics.`
3. **Custom Code (`<head>` tag)**:
   Add:
   ```html
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
   <style>
     /* Paste contents of visuals/spectral-forensics/style.css here */
   </style>
   ```
4. **Page Body**:
   Add a Webflow **HTML Embed Element** (Full Width), and paste the contents inside the `<body>` of `visuals/spectral-forensics/index.html`.
5. **Before `</body>` Tag**:
   Add:
   ```html
   <script>
     /* Paste contents of visuals/spectral-forensics/spectral_forensics.js here */
   </script>
   ```
6. Hit **Publish**!

---

## 🧭 Key Features Built Into This Desk
- **Universal Hover-Help**: Every element has `data-tooltip-title` and `data-tooltip-desc` that triggers instant explanations without navigation.
- **Unified Dynamic Insight Box**: Automatically updates on hover, click, or focus across Name, Definition, Operational Function, Connection Trail, Why It Matters, and What To Watch For.
- **Visual Connection Layer**: Clicking an address highlights its associated Fraud Risk Tag, Verification Loop, and System Status, and redraws the mempool flow radar.
- **Gödel Locking Relation Foundation**:
  $$\Omega^2 = 4\pi G \rho = -\Lambda$$
  Interactive slider calculator demonstrating how cosmic spin, information density, and inward space-memory vacuum energy stay locked in invariant balance.
- **100% In-Page**: Zero page reloads, zero external dependencies (pure vanilla HTML, CSS, and JS).
