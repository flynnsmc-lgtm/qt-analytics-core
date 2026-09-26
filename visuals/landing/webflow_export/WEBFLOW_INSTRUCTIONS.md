# Webflow Deployment & Custom Code Package

This package allows the Webflow Agent to deploy the exact, approved landing page design to your Webflow Project with zero guesswork.

---

## 📋 Steps for Webflow Agent / Team:

### 1. Layout & Composition (Side-by-Side 2-Column Split)
- **Desktop**: Clean 2-column layout:
  - **Left Column (45–50% width)**: Content (Badge, Heading, Subhead, Primary/Secondary CTAs, Sweep-Locked Telemetry Pill).
  - **Right Column (50–55% width)**: Dedicated Radar Visual (`#radar-canvas` in `.radar-visual-frame` with HUD corner brackets).
  - **Zero Overlap**: Radar visual and text never obscure one another.
- **Mobile (< 992px)**: Automatically stacks vertically (Text & CTAs first &rarr; Radar visual below).

### 2. Radar Motion & Telemetry Throttling Rules
- **Continuous 60fps Glide**: Time-delta integration with constant angular velocity mid-sweep. Zero discrete steps, zero ticking, zero 0.5s pauses.
- **Telemetry Sync**: Periodic updates locked to the sweep cycle boundary (updates computed once per 360° sweep).
- **Smooth Interpolation**: Hermite/lerp smoothing between orbit positions for continuous glide.
- **DOM Rate Cap**: Live DOM telemetry readouts throttled to 24 Hz to eliminate layout reflow and GPU thrashing.

### 3. Page Custom Code (Webflow Page Settings > Custom Code)
- **Inside `<head>` tag**:
  Paste the CSS from `visuals/landing/style.css` wrapped in `<style> ... </style>` (or link to your hosted CSS).
- **Before `</body>` tag**:
  Paste `radar.js` inside `<script> ... </script>` to enable the native 60fps canvas radar and satellite orbit animation.

### 2. Media Library Assets:
- Upload all files from `assets/images/webflow/`:
  - `logo-main-light.svg`
  - `icon-geosatnav.svg`
  - `icon-securecomms.svg`
  - `icon-physics-core.svg`
  - `icon-analytics.svg`
- Update asset paths in Webflow Designer to point to the uploaded media library assets.

### 3. Structure Mapping:
- **Hero Section**: Canvas container `#radar-canvas`, headline, subhead, primary CTA `[EXPLORE CAPABILITIES]`.
- **Products Section**: 4-card grid for GeoSatNav, Secure Comms, Physics Core, Analytics.
- **Paywalls Section**: Arkham (Free / Pro) & Bounty (Free / Unlock).
- **Final CTA**: Large buttons `[Get Started]`, `[Contact Us]`, `[Documentation]`.
- **Strict Rule**: Zero military/maritime public copy. All framed under GeoSatNav, Resilient Positioning, and Secure Comms.
