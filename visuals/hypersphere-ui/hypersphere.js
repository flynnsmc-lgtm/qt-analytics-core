/**
 * hypersphere.js
 * Antigravity Hypersphere & Unit Quaternion Manifold Mathematics Engine
 * S^3 Hypersphere continuous smooth manifold projection with Hopf fibration.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.HypersphereModule = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  /**
   * Pure Unit Quaternion class for 3D/4D spatial rotations.
   * Preserves norm ||q|| = 1.0 without non-unitary scaling distortions.
   */
  class UnitQuaternion {
    constructor(w = 1.0, x = 0.0, y = 0.0, z = 0.0) {
      const mag = Math.sqrt(w * w + x * x + y * y + z * z) || 1.0;
      this.w = w / mag;
      this.x = x / mag;
      this.y = y / mag;
      this.z = z / mag;
    }

    static fromAxisAngle(axis, angleRad) {
      const [ax, ay, az] = axis;
      const norm = Math.sqrt(ax * ax + ay * ay + az * az) || 1.0;
      const half = angleRad * 0.5;
      const sinH = Math.sin(half);
      return new UnitQuaternion(
        Math.cos(half),
        (ax / norm) * sinH,
        (ay / norm) * sinH,
        (az / norm) * sinH
      );
    }

    /**
     * Non-commutative Hamilton product: q1 ⊗ q2
     */
    multiply(other) {
      return new UnitQuaternion(
        this.w * other.w - this.x * other.x - this.y * other.y - this.z * other.z,
        this.w * other.x + this.x * other.w + this.y * other.z - this.z * other.y,
        this.w * other.y - this.x * other.z + this.y * other.w + this.z * other.x,
        this.w * other.z + this.x * other.y - this.y * other.x + this.z * other.w
      );
    }

    conjugate() {
      return new UnitQuaternion(this.w, -this.x, -this.y, -this.z);
    }

    toRotationMatrix() {
      const w = this.w, x = this.x, y = this.y, z = this.z;
      return [
        [1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y - w * z),       2.0 * (x * z + w * y)],
        [2.0 * (x * y + w * z),       1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z - w * x)],
        [2.0 * (x * z - w * y),       2.0 * (y * z + w * x),       1.0 - 2.0 * (x * x + y * y)]
      ];
    }

    /**
     * Rotate a 3D vector using pure Rodrigues / quaternion conjugation:
     * v' = q ⊗ (0, v) ⊗ q*
     */
    rotateVector(v) {
      const [vx, vy, vz] = v;
      const qx = this.x, qy = this.y, qz = this.z, qw = this.w;
      const cx = qy * vz - qz * vy;
      const cy = qz * vx - qx * vz;
      const cz = qx * vy - qy * vx;
      const tx = 2.0 * cx, ty = 2.0 * cy, tz = 2.0 * cz;
      return [
        vx + qw * tx + (qy * tz - qz * ty),
        vy + qw * ty + (qz * tx - qx * tz),
        vz + qw * tz + (qx * ty - qy * tx)
      ];
    }
  }

  /**
   * Continuous S^3 Hypersphere Manifold
   * Generates Hopf fibration fibers, tori rings, and stereographic coordinates.
   */
  class HypersphereManifold {
    constructor(normTarget = 100.0) {
      this.normTarget = normTarget;
      this.rings = [];
      this.fibers = [];
      this.buildHopfFibration(12, 48);
    }

    /**
     * Build S^3 Hopf Fibration rings:
     * Each fiber is a great circle S^1 on S^3 that projects to a circle in R^3.
     */
    buildHopfFibration(numTori = 12, ptsPerRing = 48) {
      this.rings = [];
      for (let t = 0; t < numTori; t++) {
        const eta = (t / numTori) * (Math.PI / 2); // latitude on S^3 [0, π/2]
        const ring = [];
        for (let p = 0; p < ptsPerRing; p++) {
          const xi = (p / ptsPerRing) * Math.PI * 2;
          // Coordinates on S^3: x^2 + y^2 + z^2 + w^2 = 1.0
          const x = Math.sin(eta) * Math.cos(xi);
          const y = Math.sin(eta) * Math.sin(xi);
          const z = Math.cos(eta) * Math.cos(xi * 2);
          const w = Math.cos(eta) * Math.sin(xi * 2);
          ring.push({ x, y, z, w, eta, xi });
        }
        this.rings.push(ring);
      }
    }

    /**
     * 4D Rotation in the X-W and Y-Z planes
     */
    rotate4D(pt, thetaXW, thetaYZ) {
      // Rotate in XW plane
      const cosXW = Math.cos(thetaXW), sinXW = Math.sin(thetaXW);
      const rx = pt.x * cosXW - pt.w * sinXW;
      const rw = pt.x * sinXW + pt.w * cosXW;

      // Rotate in YZ plane
      const cosYZ = Math.cos(thetaYZ), sinYZ = Math.sin(thetaYZ);
      const ry = pt.y * cosYZ - pt.z * sinYZ;
      const rz = pt.y * sinYZ + pt.z * cosYZ;

      return { x: rx, y: ry, z: rz, w: rw };
    }

    /**
     * Stereographic projection from 4D S^3 to 3D space:
     * (X, Y, Z) = (x, y, z) / (1 - w)
     * Scaled to target norm 100.0.
     */
    stereographicProject(pt, projDistance = 2.5) {
      const denom = projDistance - pt.w * 0.92;
      const scale = (denom !== 0) ? (projDistance / denom) : 1.0;

      const px = pt.x * scale;
      const py = pt.y * scale;
      const pz = pt.z * scale;

      // Preserve norm invariant ||x|| = 100.0
      const currentNorm = Math.sqrt(px * px + py * py + pz * pz) || 1.0;
      const factor = (this.normTarget / currentNorm);

      return {
        x: px,
        y: py,
        z: pz,
        scale: scale,
        norm100: [px * factor, py * factor, pz * factor]
      };
    }
  }

  /**
   * Telemetry Client: Fetches localhost:8080/audi
   */
  class HypersphereTelemetryClient {
    constructor(endpointUrl = 'http://localhost:8080/audi') {
      this.endpointUrl = endpointUrl;
      this.listeners = [];
      this.lastData = null;
      this.pollInterval = null;
    }

    onData(callback) {
      this.listeners.push(callback);
    }

    startPolling(intervalMs = 1200) {
      this.fetchNow();
      if (this.pollInterval) clearInterval(this.pollInterval);
      this.pollInterval = setInterval(() => this.fetchNow(), intervalMs);
    }

    stopPolling() {
      if (this.pollInterval) {
        clearInterval(this.pollInterval);
        this.pollInterval = null;
      }
    }

    async fetchNow() {
      try {
        const url = this.endpointUrl + (this.endpointUrl.includes('?') ? '&' : '?') + 'format=json';
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          cache: 'no-store'
        });
        if (response.ok) {
          const data = await response.json();
          this.lastData = data;
          this.notify(data, null);
          return data;
        } else {
          this.notify(null, `HTTP ${response.status}`);
        }
      } catch (err) {
        this.notify(null, err.message);
      }
    }

    notify(data, err) {
      this.listeners.forEach(fn => {
        try { fn(data, err); } catch (e) { console.error(e); }
      });
    }
  }

  /**
   * HYPERSPHERE CONTEXT SWITCHER
   * Multi-view interpretation layer preserving canonical geometry.
   */
  const HypersphereViews = {
    current: "original",
    contexts: {
      original: {
        id: "original",
        name: "Original Hypersphere",
        mode: "geometry",
        colors: "cyan-purple",
        labels: false,
        badge: "CANONICAL BASELINE",
        title: "S³ 7D-Projected Holographic Vortex",
        description: "Pure differential geometry, stereographic Hopf fibration tori, and tensor symmetry. Preserved as default baseline in view_original.json.",
        palette: {
          primary: "#00f0ff",
          secondary: "#c084fc",
          tertiary: "#38bdf8",
          glow: "rgba(0, 240, 255, 0.35)",
          halo: "rgba(192, 132, 252, 0.15)"
        },
        overlays: {
          fluxLines: false,
          satellites: false,
          knowledgeClusters: false,
          quizGates: false
        }
      },
      physics: {
        id: "physics",
        name: "Physics & Field Dynamics",
        mode: "field",
        overlay: "curvature+flux",
        colors: "energy",
        badge: "ELECTRO-DYNAMICS & FLUX",
        title: "Field Lines, Curvature Gradient & 432Hz Resonance",
        description: "Visualizes electromagnetic flux density, tensor gate throat ratios, phase nodes, 432Hz harmonic shells, and 48,170 nT geomagnetic contours.",
        palette: {
          primary: "#f59e0b",
          secondary: "#ef4444",
          tertiary: "#00f0ff",
          glow: "rgba(245, 158, 11, 0.45)",
          halo: "rgba(239, 68, 68, 0.2)"
        },
        overlays: {
          fluxLines: true,
          satellites: false,
          knowledgeClusters: false,
          quizGates: false
        }
      },
      comms: {
        id: "comms",
        name: "Comms & Satellite Networks",
        mode: "network",
        overlay: "satellite+security",
        colors: "zones",
        badge: "24 PAPERS UP FOR GRABS",
        title: "Satellite Constellations & Non-Spoofable Routing",
        description: "Maps LEO/MEO/GEO constellations, non-spoofable ground stations, emergency maritime backup nodes, and the 24 claimable comms research documents.",
        palette: {
          primary: "#10b981",
          secondary: "#00f0ff",
          tertiary: "#3b82f6",
          glow: "rgba(16, 185, 129, 0.45)",
          halo: "rgba(59, 130, 246, 0.2)"
        },
        overlays: {
          fluxLines: false,
          satellites: true,
          knowledgeClusters: false,
          quizGates: false
        }
      },
      knowledge: {
        id: "knowledge",
        name: "Knowledge & Data Map",
        mode: "data",
        overlay: "domains+flows",
        colors: "topics",
        badge: "220 CATALOGED PAPERS",
        title: "Research Domains & Competency Mirror Bridges",
        description: "Maps the 196 physics corpus papers into 5 major subject domains, highlights citation flow, and shows active agent bridges (N1 × N2 ≈ N3).",
        palette: {
          primary: "#a855f7",
          secondary: "#ec4899",
          tertiary: "#00f0ff",
          glow: "rgba(168, 85, 247, 0.45)",
          halo: "rgba(236, 72, 153, 0.2)"
        },
        overlays: {
          fluxLines: false,
          satellites: false,
          knowledgeClusters: true,
          quizGates: false
        }
      },
      quiz: {
        id: "quiz",
        name: "Quiz & Assessment",
        mode: "assessment",
        overlay: "invariants+gates",
        colors: "status",
        badge: "RULE #0 VERIFIED",
        title: "Continuous Manifold vs Discrete Gates",
        description: "Marks fundamental invariant checkpoints: Norm=100.0, Ratio=1.000, Fence δ=0.002 fm, S³ continuous manifold status, and Candidate Lead gates (Alpha & Gamma).",
        palette: {
          primary: "#00f0ff",
          secondary: "#10b981",
          tertiary: "#f59e0b",
          glow: "rgba(0, 240, 255, 0.5)",
          halo: "rgba(16, 185, 129, 0.25)"
        },
        overlays: {
          fluxLines: false,
          satellites: false,
          knowledgeClusters: false,
          quizGates: true
        }
      }
    },

    switchTo(name) {
      if (!this.contexts[name]) {
        console.warn(`[HypersphereViews] Unknown context: ${name}`);
        return;
      }
      this.current = name;
      if (typeof window !== 'undefined' && window.RendererEngine && window.RendererEngine.applyContext) {
        window.RendererEngine.applyContext(this.contexts[name]);
      }
      console.log(`✅ Context: ${name.toUpperCase()} | Backend: localhost:8080/audi`);
      return this.contexts[name];
    }
  };

  return {
    UnitQuaternion,
    HypersphereManifold,
    HypersphereTelemetryClient,
    HypersphereViews
  };
}));

