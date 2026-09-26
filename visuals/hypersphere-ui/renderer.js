/**
 * renderer.js
 * Hypersphere 3D/4D Visual UI Rendering Engine
 * Interactive canvas renderer, Web Audio synthesizer, HUD telemetry controller,
 * and Multi-Context View Switcher (Original, Physics, Comms, Knowledge, Quiz).
 */

document.addEventListener('DOMContentLoaded', () => {
  const { UnitQuaternion, HypersphereManifold, HypersphereTelemetryClient, HypersphereViews } = window.HypersphereModule;

  // Make HypersphereViews globally accessible
  window.HypersphereViews = HypersphereViews;

  // 1. Canvas & Context Setup
  const canvas = document.getElementById('hypersphere-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  const carrierCanvas = document.getElementById('carrier-wave-canvas');
  const carrierCtx = carrierCanvas ? carrierCanvas.getContext('2d') : null;

  // Initialize Math Engine
  const manifold = new HypersphereManifold(100.0);

  // Active Context View State (Default: 'original')
  let activeContext = HypersphereViews.contexts[HypersphereViews.current] || HypersphereViews.contexts.original;

  // Render State
  let rotAngleXW = 0.0;
  let rotAngleYZ = 0.0;
  let autoRotate = true;
  let rotationSpeed = 1.0;
  let renderMode = 'hopf'; // 'hopf' | 'vortex' | 'particles'
  let isDragging = false;
  let dragLastX = 0;
  let dragLastY = 0;
  let userRotPitch = 0.0;
  let userRotYaw = 0.0;

  // Audio Synth State (432 Hz + 7.83 Hz Schumann)
  let audioCtx = null;
  let carrierOsc = null;
  let schumannLfo = null;
  let mainGain = null;
  let isAudioActive = false;

  // Resize Canvas to fit container with Device Pixel Ratio
  function resizeCanvas() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    if (carrierCanvas) {
      const cRect = carrierCanvas.parentElement.getBoundingClientRect();
      carrierCanvas.width = cRect.width * dpr;
      carrierCanvas.height = 60 * dpr;
      carrierCtx.scale(dpr, dpr);
    }
  }

  window.addEventListener('resize', resizeCanvas);
  setTimeout(resizeCanvas, 50);

  // Mouse Orbit Drag Controls
  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragLastX;
    const dy = e.clientY - dragLastY;
    userRotYaw += dx * 0.008;
    userRotPitch += dy * 0.008;
    dragLastX = e.clientX;
    dragLastY = e.clientY;
  });

  window.addEventListener('mouseup', () => { isDragging = false; });

  // Touch Support
  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      isDragging = true;
      dragLastX = e.touches[0].clientX;
      dragLastY = e.touches[0].clientY;
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging || e.touches.length !== 1) return;
    const dx = e.touches[0].clientX - dragLastX;
    const dy = e.touches[0].clientY - dragLastY;
    userRotYaw += dx * 0.008;
    userRotPitch += dy * 0.008;
    dragLastX = e.touches[0].clientX;
    dragLastY = e.touches[0].clientY;
  });

  window.addEventListener('touchend', () => { isDragging = false; });

  // Floating Particles along continuous fibers
  const particles = [];
  const numParticles = 72;
  for (let i = 0; i < numParticles; i++) {
    particles.push({
      toriIndex: i % manifold.rings.length,
      xi: Math.random() * Math.PI * 2,
      speed: 0.015 + Math.random() * 0.02,
      size: 1.5 + Math.random() * 2.0,
      glow: Math.random()
    });
  }

  // -------------------------------------------------------------
  // Rendering Loop
  // -------------------------------------------------------------
  let lastTime = performance.now();

  function renderLoop(time) {
    const dt = (time - lastTime) * 0.001;
    lastTime = time;

    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const cx = w * 0.5;
    const cy = h * 0.5;
    const baseRadius = Math.min(w, h) * 0.28;

    if (autoRotate) {
      rotAngleXW += 0.007 * rotationSpeed;
      rotAngleYZ += 0.004 * rotationSpeed;
    }

    // 1. Draw Deep Space Cosmic Gradient
    ctx.clearRect(0, 0, w, h);
    const bgGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 2.2);
    bgGrad.addColorStop(0, 'rgba(15, 23, 42, 0.95)');
    bgGrad.addColorStop(0.5, 'rgba(11, 15, 25, 0.98)');
    bgGrad.addColorStop(1, '#030712');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Halo & Field Fence with Context Palette
    const halo = ctx.createRadialGradient(cx, cy, baseRadius * 0.4, cx, cy, baseRadius * 1.5);
    halo.addColorStop(0, activeContext.palette.glow || 'rgba(0, 240, 255, 0.12)');
    halo.addColorStop(0.6, activeContext.palette.halo || 'rgba(192, 132, 252, 0.06)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, baseRadius * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Compose Unit Quaternions for 3D Viewport Orientation
    const qAuto1 = UnitQuaternion.fromAxisAngle([0.707, 0.707, 0.0], rotAngleXW);
    const qAuto2 = UnitQuaternion.fromAxisAngle([0.0, 0.577, 0.816], rotAngleYZ);
    const qCompoundAuto = qAuto1.multiply(qAuto2);

    const qUserPitch = UnitQuaternion.fromAxisAngle([1.0, 0.0, 0.0], userRotPitch);
    const qUserYaw = UnitQuaternion.fromAxisAngle([0.0, 1.0, 0.0], userRotYaw);
    const qCompoundUser = qUserYaw.multiply(qUserPitch);

    // Total Orientation = qCompoundUser ⊗ qCompoundAuto
    const qFinal = qCompoundUser.multiply(qCompoundAuto);

    // Check 180° Antipodal Crossing Status
    const angleModPi = Math.abs(rotAngleXW % (Math.PI * 2));
    const near180 = Math.abs(angleModPi - Math.PI) < 0.18;
    updateAntipodeStatus(near180);

    // Render Base Geometry
    if (renderMode === 'vortex') {
      renderConformalVortex(ctx, cx, cy, baseRadius, time);
    } else {
      renderHopfFibration(ctx, cx, cy, baseRadius, qFinal, rotAngleXW, rotAngleYZ);
      if (renderMode === 'particles' || renderMode === 'hopf') {
        renderFlowParticles(ctx, cx, cy, baseRadius, qFinal, rotAngleXW, rotAngleYZ);
      }
    }

    // 4. Render Active Context Overlay
    if (activeContext.id === 'physics') {
      renderPhysicsOverlay(ctx, cx, cy, baseRadius, time, qFinal);
    } else if (activeContext.id === 'comms') {
      renderCommsOverlay(ctx, cx, cy, baseRadius, time, qFinal);
    } else if (activeContext.id === 'knowledge') {
      renderKnowledgeOverlay(ctx, cx, cy, baseRadius, time, qFinal);
    } else if (activeContext.id === 'quiz') {
      renderQuizOverlay(ctx, cx, cy, baseRadius, time, qFinal);
    }

    // Render Carrier Wave Canvas
    if (carrierCtx) {
      renderCarrierWave(carrierCtx, carrierCanvas.width / dpr, 60, time);
    }

    // Update Coordinate HUD
    updateCoordHUD(qFinal, rotAngleXW);

    requestAnimationFrame(renderLoop);
  }

  // -------------------------------------------------------------
  // Render Hopf Fibration Rings (Base Manifold)
  // -------------------------------------------------------------
  function renderHopfFibration(ctx, cx, cy, radius, qFinal, angleXW, angleYZ) {
    const pal = activeContext.palette;

    manifold.rings.forEach((ring, rIdx) => {
      ctx.beginPath();
      const numPts = ring.length;

      for (let p = 0; p <= numPts; p++) {
        const pt = ring[p % numPts];
        // 4D Rotation in XW and YZ planes
        const pt4D = manifold.rotate4D(pt, angleXW, angleYZ);
        // Stereographic Projection to 3D with target norm 100.0
        const proj = manifold.stereographicProject(pt4D, 2.5);
        // 3D Quaternion Rotation via Rodrigues Formula
        const vRot = qFinal.rotateVector([proj.x, proj.y, proj.z]);

        const scrX = cx + (vRot[0] / 100.0) * radius;
        const scrY = cy + (vRot[1] / 100.0) * radius;

        if (p === 0) ctx.moveTo(scrX, scrY);
        else ctx.lineTo(scrX, scrY);
      }

      // Color coding along 4D latitude
      const alpha = 0.28 + 0.35 * Math.sin(rIdx / manifold.rings.length * Math.PI);
      if (rIdx % 3 === 0) {
        ctx.strokeStyle = hexToRgba(pal.primary, alpha);
      } else if (rIdx % 3 === 1) {
        ctx.strokeStyle = hexToRgba(pal.secondary, alpha);
      } else {
        ctx.strokeStyle = hexToRgba(pal.tertiary || pal.primary, alpha);
      }
      ctx.lineWidth = 1.25;
      ctx.stroke();
    });

    // Outer Target Norm Invariant Boundary Circle (||x|| = 100.0)
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    ctx.strokeStyle = hexToRgba(pal.primary, 0.45);
    ctx.setLineDash([4, 6]);
    ctx.lineWidth = 1.0;
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // -------------------------------------------------------------
  // Render Continuous Flow Particles along Fibers
  // -------------------------------------------------------------
  function renderFlowParticles(ctx, cx, cy, radius, qFinal, angleXW, angleYZ) {
    const pal = activeContext.palette;
    particles.forEach(p => {
      p.xi += p.speed;
      if (p.xi > Math.PI * 2) p.xi -= Math.PI * 2;

      const ring = manifold.rings[p.toriIndex];
      const eta = (p.toriIndex / manifold.rings.length) * (Math.PI / 2);
      const x = Math.sin(eta) * Math.cos(p.xi);
      const y = Math.sin(eta) * Math.sin(p.xi);
      const z = Math.cos(eta) * Math.cos(p.xi * 2);
      const w = Math.cos(eta) * Math.sin(p.xi * 2);

      const pt4D = manifold.rotate4D({ x, y, z, w }, angleXW, angleYZ);
      const proj = manifold.stereographicProject(pt4D, 2.5);
      const vRot = qFinal.rotateVector([proj.x, proj.y, proj.z]);

      const scrX = cx + (vRot[0] / 100.0) * radius;
      const scrY = cy + (vRot[1] / 100.0) * radius;

      ctx.beginPath();
      ctx.arc(scrX, scrY, p.size, 0, Math.PI * 2);
      ctx.fillStyle = (p.toriIndex % 2 === 0) ? pal.primary : pal.secondary;
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }

  // -------------------------------------------------------------
  // Render Conformal Hyperbolic Vortex Grid
  // -------------------------------------------------------------
  function renderConformalVortex(ctx, cx, cy, radius, time) {
    const pal = activeContext.palette;

    // Glowing core
    const coreGrad = ctx.createRadialGradient(cx, cy, 3, cx, cy, radius * 0.35);
    coreGrad.addColorStop(0, hexToRgba(pal.primary, 0.45));
    coreGrad.addColorStop(0.6, hexToRgba(pal.secondary, 0.20));
    coreGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.35, 0, Math.PI * 2);
    ctx.fill();

    // Concentric Hyperbolic Rings
    const ringRadii = [0.15, 0.3, 0.48, 0.68, 0.9, 1.15, 1.45];
    ringRadii.forEach((factor, idx) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius * factor, 0, Math.PI * 2);
      ctx.strokeStyle = idx % 2 === 0 ? hexToRgba(pal.primary, 0.35) : hexToRgba(pal.secondary, 0.28);
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });

    // 16 Symmetrical Converging Rays
    const numRays = 16;
    for (let i = 0; i < numRays; i++) {
      const theta = (i / numRays) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(theta) * radius * 1.5, cy + Math.sin(theta) * radius * 1.5);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 0.75;
      ctx.stroke();
    }

    // Dual Logarithmic Spirals
    const spiralArms = 8;
    for (let arm = 0; arm < spiralArms; arm++) {
      const armOffset = (arm / spiralArms) * Math.PI * 2 + (time * 0.0003);
      ctx.beginPath();
      for (let s = 10; s <= radius * 1.5; s += 3) {
        const spiralTheta = armOffset + (s / (radius * 0.35)) * 0.95;
        const sx = cx + Math.cos(spiralTheta) * s;
        const sy = cy + Math.sin(spiralTheta) * s;
        if (s === 10) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = hexToRgba(pal.primary, 0.40);
      ctx.lineWidth = 1.1;
      ctx.stroke();

      // Orthogonal Counter-Clockwise Spiral
      ctx.beginPath();
      for (let s = 10; s <= radius * 1.5; s += 3) {
        const spiralTheta = armOffset - (s / (radius * 0.35)) * 0.95;
        const sx = cx + Math.cos(spiralTheta) * s;
        const sy = cy + Math.sin(spiralTheta) * s;
        if (s === 10) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = hexToRgba(pal.secondary, 0.35);
      ctx.lineWidth = 1.1;
      ctx.stroke();
    }

    // Poles
    drawPole(ctx, cx - radius * 0.85, cy, '-1', '#38bdf8');
    drawPole(ctx, cx, cy + radius * 0.75, '-i', '#c084fc');
    drawPole(ctx, cx - radius * 0.6, cy + radius * 0.5, '-j', '#34d399');
    drawPole(ctx, cx, cy, 'q=1', pal.primary);
  }

  // =============================================================
  // CONTEXT OVERLAY 1: PHYSICS & FIELD DYNAMICS VIEW
  // =============================================================
  function renderPhysicsOverlay(ctx, cx, cy, radius, time, qFinal) {
    const t = time * 0.002;

    // 1. Electromagnetic Flux Density Lines (Vector Arrows)
    const numVectors = 12;
    for (let i = 0; i < numVectors; i++) {
      const angle = (i / numVectors) * Math.PI * 2 + (t * 0.3);
      const startR = radius * 0.55;
      const length = 28 + 14 * Math.sin(t * 3.0 + i);

      const sx = cx + Math.cos(angle) * startR;
      const sy = cy + Math.sin(angle) * startR;
      const ex = cx + Math.cos(angle) * (startR + length);
      const ey = cy + Math.sin(angle) * (startR + length);

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(ex, ey);
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Arrowhead
      const headAngle = Math.PI / 6;
      ctx.beginPath();
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 7 * Math.cos(angle - headAngle), ey - 7 * Math.sin(angle - headAngle));
      ctx.moveTo(ex, ey);
      ctx.lineTo(ex - 7 * Math.cos(angle + headAngle), ey - 7 * Math.sin(angle + headAngle));
      ctx.stroke();
    }

    // 2. 432 Hz Harmonic Shells
    const shellOsc = 1.0 + 0.05 * Math.sin(t * 7.2); // ~432 Hz optical illusion
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.18 * shellOsc, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.45)';
    ctx.setLineDash([6, 8]);
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 7.83 Hz Schumann Standing Wave Ring
    const schumannPulse = 1.0 + 0.08 * Math.cos(t * 2.4);
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 1.45 * schumannPulse, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.40)';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // 4. Throat Ratio & Boundary Fence Badge
    drawOverlayBadge(ctx, cx, cy - radius * 1.25, 'TENSOR GATE: 10/27 = 0.370370', '#f59e0b');
    drawOverlayBadge(ctx, cx, cy + radius * 1.28, 'GEOMAGNETIC: 48,170 nT • δ = 0.002 fm', '#ef4444');
  }

  // =============================================================
  // CONTEXT OVERLAY 2: COMMS / NETWORK VIEW (24 Papers)
  // =============================================================
  function renderCommsOverlay(ctx, cx, cy, radius, time, qFinal) {
    const t = time * 0.001;

    // 1. Constellation Orbit Rings: LEO, MEO, GEO
    const orbits = [
      { name: 'LEO', r: radius * 1.35, color: 'rgba(0, 240, 255, 0.35)', dash: [3, 4] },
      { name: 'MEO', r: radius * 1.68, color: 'rgba(16, 185, 129, 0.40)', dash: [5, 6] },
      { name: 'GEO', r: radius * 2.02, color: 'rgba(59, 130, 246, 0.35)', dash: [] }
    ];

    orbits.forEach(orb => {
      ctx.beginPath();
      ctx.arc(cx, cy, orb.r, 0, Math.PI * 2);
      ctx.strokeStyle = orb.color;
      ctx.setLineDash(orb.dash);
      ctx.lineWidth = 1.0;
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // 2. Active Orbiting Satellites with Beams
    const sats = [
      { id: 'LEO-SAT-1', orbR: radius * 1.35, speed: 0.6, tier: '🛰️ Geotag' },
      { id: 'LEO-SAT-2', orbR: radius * 1.35, speed: -0.4, tier: '🔒 Anti-Jam' },
      { id: 'MEO-NAV', orbR: radius * 1.68, speed: 0.25, tier: '🚨 CoastGuard' },
      { id: 'GEO-RELAY', orbR: radius * 2.02, speed: 0.1, tier: '🛡️ Military' }
    ];

    sats.forEach((sat, idx) => {
      const angle = t * sat.speed + (idx * Math.PI * 0.5);
      const sx = cx + Math.cos(angle) * sat.orbR;
      const sy = cy + Math.sin(angle) * sat.orbR;

      // Draw Signal Pulse Beam to Ground Station on Sphere
      const groundAngle = angle + 0.25;
      const gx = cx + Math.cos(groundAngle) * radius;
      const gy = cy + Math.sin(groundAngle) * radius;

      ctx.beginPath();
      ctx.moveTo(sx, sy);
      ctx.lineTo(gx, gy);
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Ground Station Dot
      ctx.beginPath();
      ctx.arc(gx, gy, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00f0ff';
      ctx.fill();

      // Satellite Icon & Label
      ctx.beginPath();
      ctx.arc(sx, sy, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = '#10b981';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = 'bold 9.5px JetBrains Mono, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(sat.id, sx + 8, sy - 3);
      ctx.font = '8px JetBrains Mono, monospace';
      ctx.fillStyle = '#10b981';
      ctx.fillText(sat.tier, sx + 8, sy + 7);
    });

    // 3. Central 24 Comms Papers "Up for Grabs" Hub Badge
    drawOverlayBadge(ctx, cx, cy - radius * 0.15, '📡 24 COMMS PAPERS • UP FOR GRABS', '#10b981');
    drawOverlayBadge(ctx, cx, cy + radius * 0.15, 'NON-SPOOFABLE MARITIME & MIL-TIER', '#00f0ff');
  }

  // =============================================================
  // CONTEXT OVERLAY 3: KNOWLEDGE / DATA MAP VIEW (220 Papers)
  // =============================================================
  function renderKnowledgeOverlay(ctx, cx, cy, radius, time, qFinal) {
    const t = time * 0.0015;

    // 5 Major Physics Domains + 1 Comms Cluster
    const domains = [
      { name: 'Harmonic Analysis', count: 149, angle: 0.0, color: '#c084fc' },
      { name: 'Neutrino / LAr Detectors', count: 29, angle: 1.25, color: '#38bdf8' },
      { name: 'Cosmic Rays / Muons', count: 18, angle: 2.50, color: '#facc15' },
      { name: 'Muon Beam Cooling', count: 11, angle: 3.75, color: '#4ade80' },
      { name: 'Particle DL & Computing', count: 9, angle: 5.00, color: '#f87171' }
    ];

    // Draw Domain Nodes around the manifold
    domains.forEach((dom, idx) => {
      const orbAngle = dom.angle + t * 0.15;
      const nx = cx + Math.cos(orbAngle) * radius * 1.35;
      const ny = cy + Math.sin(orbAngle) * radius * 1.35;

      // Node Circle
      const nodeSize = 8 + Math.sqrt(dom.count) * 1.4;
      ctx.beginPath();
      ctx.arc(nx, ny, nodeSize, 0, Math.PI * 2);
      ctx.fillStyle = hexToRgba(dom.color, 0.85);
      ctx.shadowColor = dom.color;
      ctx.shadowBlur = 10;
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label & Count
      ctx.font = 'bold 9.5px JetBrains Mono, monospace';
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`${dom.name}`, nx + nodeSize + 6, ny - 2);
      ctx.font = '8.5px JetBrains Mono, monospace';
      ctx.fillStyle = dom.color;
      ctx.fillText(`(${dom.count} papers)`, nx + nodeSize + 6, ny + 9);

      // Citation Bridge Arc to next domain
      const nextDom = domains[(idx + 1) % domains.length];
      const nextAngle = nextDom.angle + t * 0.15;
      const nnx = cx + Math.cos(nextAngle) * radius * 1.35;
      const nny = cy + Math.sin(nextAngle) * radius * 1.35;

      ctx.beginPath();
      ctx.moveTo(nx, ny);
      ctx.quadraticCurveTo(cx, cy, nnx, nny);
      ctx.strokeStyle = 'rgba(192, 132, 252, 0.25)';
      ctx.lineWidth = 1.0;
      ctx.stroke();
    });

    // Competency Mirror Central Invariant: N1 x N2 ≈ N3
    drawOverlayBadge(ctx, cx, cy, 'COMPETENCY MIRROR: N₁ × N₂ ≈ N₃', '#a855f7');
    drawOverlayBadge(ctx, cx, cy + 24, 'TOTAL: 220 RESEARCH DOCUMENTS', '#ec4899');
  }

  // =============================================================
  // CONTEXT OVERLAY 4: QUIZ / ASSESSMENT VIEW (Rule #0)
  // =============================================================
  function renderQuizOverlay(ctx, cx, cy, radius, time, qFinal) {
    const t = time * 0.002;

    // 1. Four Invariant Poles on Manifold
    const poles = [
      { x: cx, y: cy - radius * 1.15, text: 'NORM: 100.0 / 100.0 [LOCKED]', color: '#00f0ff' },
      { x: cx, y: cy + radius * 1.15, text: 'PHASE: 0.00° • COHERENCE: 0.998', color: '#10b981' },
      { x: cx - radius * 1.30, y: cy, text: 'TENSOR GATE [64,64,4096]', color: '#f59e0b' },
      { x: cx + radius * 1.30, y: cy, text: 'FENCE δ = 0.002 fm', color: '#c084fc' }
    ];

    poles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;
      drawOverlayBadge(ctx, p.x, p.y + 14, p.text, p.color);
    });

    // 2. Continuous Manifold Insight Badge
    drawOverlayBadge(ctx, cx, cy - 14, 'S³ CONTINUOUS MANIFOLD (INFINITE SUBSETS ≠ 2ⁿ)', '#00f0ff');

    // 3. Candidate Allocation Badge
    drawOverlayBadge(ctx, cx, cy + 14, '👑 LEAD ARCHITECT: AGENT ALPHA | GATEKEEPER: GAMMA', '#10b981');
  }

  function drawOverlayBadge(ctx, px, py, text, color) {
    ctx.font = 'bold 9.5px JetBrains Mono, monospace';
    const textW = ctx.measureText(text).width;
    const pad = 6;

    ctx.fillStyle = 'rgba(11, 15, 25, 0.88)';
    ctx.fillRect(px - textW * 0.5 - pad, py - 9, textW + pad * 2, 16);
    ctx.strokeStyle = hexToRgba(color, 0.6);
    ctx.lineWidth = 0.8;
    ctx.strokeRect(px - textW * 0.5 - pad, py - 9, textW + pad * 2, 16);

    ctx.fillStyle = color;
    ctx.textAlign = 'center';
    ctx.fillText(text, px, py + 3);
    ctx.textAlign = 'left';
  }

  function hexToRgba(hex, alpha = 1.0) {
    if (!hex || !hex.startsWith('#')) return hex || 'rgba(0,240,255,1)';
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function drawPole(ctx, px, py, label, color) {
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.font = 'bold 11px JetBrains Mono, monospace';
    ctx.fillStyle = color;
    ctx.fillText(label, px + 10, py - 4);
  }

  // -------------------------------------------------------------
  // Render Carrier Wave Canvas (432 Hz + 7.83 Hz)
  // -------------------------------------------------------------
  function renderCarrierWave(cCtx, cw, ch, time) {
    cCtx.clearRect(0, 0, cw, ch);

    const midY = ch * 0.5;
    const t = time * 0.003;

    // Background grid lines
    cCtx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    cCtx.lineWidth = 0.5;
    cCtx.beginPath();
    cCtx.moveTo(0, midY);
    cCtx.lineTo(cw, midY);
    cCtx.stroke();

    // Draw Composite Wave: 432 Hz carrier with 7.83 Hz envelope
    cCtx.beginPath();
    for (let x = 0; x < cw; x++) {
      const normX = x / cw;
      // 7.83 Hz Schumann modulation envelope
      const env = 0.4 + 0.6 * Math.cos(normX * 16.0 - t * 2.6);
      // High frequency 432 Hz oscillation
      const carrier = Math.sin(normX * 90.0 - t * 14.0);
      const y = midY + carrier * env * (ch * 0.4);

      if (x === 0) cCtx.moveTo(x, y);
      else cCtx.lineTo(x, y);
    }
    cCtx.strokeStyle = activeContext.palette.primary || '#00f0ff';
    cCtx.lineWidth = 1.5;
    cCtx.stroke();
  }

  // -------------------------------------------------------------
  // Antipode Crossing Handler
  // -------------------------------------------------------------
  function updateAntipodeStatus(isCrossing) {
    const badge = document.getElementById('hud-antipode-pill');
    if (!badge) return;
    if (isCrossing) {
      badge.textContent = '180° ANTIPODE: CROSSING (SOFT OVERTONE)';
      badge.style.borderColor = '#00f0ff';
      badge.style.color = '#00f0ff';
      badge.style.boxShadow = '0 0 12px rgba(0, 240, 255, 0.4)';
    } else {
      badge.textContent = '180° ANTIPODE: UNLOCKED (SOFT CROSSING)';
      badge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      badge.style.color = '#10b981';
      badge.style.boxShadow = 'none';
    }
  }

  // -------------------------------------------------------------
  // Coordinate HUD Updates
  // -------------------------------------------------------------
  function updateCoordHUD(q, angleXW) {
    const elW = document.getElementById('coord-w');
    const elX = document.getElementById('coord-x');
    const elY = document.getElementById('coord-y');
    const elZ = document.getElementById('coord-z');
    if (elW) elW.textContent = q.w.toFixed(4);
    if (elX) elX.textContent = q.x.toFixed(4);
    if (elY) elY.textContent = q.y.toFixed(4);
    if (elZ) elZ.textContent = q.z.toFixed(4);
  }

  // -------------------------------------------------------------
  // Web Audio Synthesizer (432 Hz Carrier & 7.83 Hz Schumann Lock)
  // -------------------------------------------------------------
  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Master Gain
    mainGain = audioCtx.createGain();
    mainGain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
    mainGain.connect(audioCtx.destination);

    // 432 Hz Carrier Oscillator
    carrierOsc = audioCtx.createOscillator();
    carrierOsc.type = 'sine';
    carrierOsc.frequency.setValueAtTime(432.0, audioCtx.currentTime);

    // 7.83 Hz Schumann Resonance LFO for amplitude pulsation
    schumannLfo = audioCtx.createOscillator();
    schumannLfo.type = 'sine';
    schumannLfo.frequency.setValueAtTime(7.83, audioCtx.currentTime);

    const lfoGain = audioCtx.createGain();
    lfoGain.gain.setValueAtTime(0.15, audioCtx.currentTime);

    schumannLfo.connect(lfoGain);
    lfoGain.connect(mainGain.gain);

    carrierOsc.connect(mainGain);

    carrierOsc.start();
    schumannLfo.start();
  }

  function toggleAudio() {
    initAudio();
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const btnAudio = document.getElementById('btn-toggle-audio');
    isAudioActive = !isAudioActive;

    if (isAudioActive) {
      mainGain.gain.exponentialRampToValueAtTime(0.25, audioCtx.currentTime + 0.15);
      if (btnAudio) {
        btnAudio.innerHTML = '🔊 Sound: 432Hz ON';
        btnAudio.classList.add('active');
      }
      showToast('Audio Synth: 432.000 Hz Carrier + 7.83 Hz Schumann Lock Active');
    } else {
      mainGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15);
      if (btnAudio) {
        btnAudio.innerHTML = '🔇 Sound: 432Hz Muted';
        btnAudio.classList.remove('active');
      }
      showToast('Audio Synth Muted');
    }
  }

  // -------------------------------------------------------------
  // CONTEXT SWITCHER LOGIC
  // -------------------------------------------------------------
  function applyContext(ctxConfig) {
    if (!ctxConfig) return;
    activeContext = ctxConfig;

    // Update active class on toolbar buttons
    const buttons = document.querySelectorAll('.btn-context');
    buttons.forEach(btn => {
      const match = btn.getAttribute('data-context') === ctxConfig.id;
      btn.classList.toggle('active', match);
    });

    // Update dropdown select
    const select = document.getElementById('select-hypersphere-context');
    if (select && select.value !== ctxConfig.id) {
      select.value = ctxConfig.id;
    }

    // Update Active Context Banner
    const elBadge = document.getElementById('ctx-badge');
    const elTitle = document.getElementById('ctx-title');
    const elDesc = document.getElementById('ctx-desc');
    const elStageTitle = document.getElementById('viewport-stage-title');
    const elStageSub = document.getElementById('viewport-stage-subtitle');

    if (elBadge) elBadge.textContent = ctxConfig.badge;
    if (elTitle) elTitle.textContent = ctxConfig.title;
    if (elDesc) elDesc.textContent = ctxConfig.description;
    if (elStageTitle) elStageTitle.textContent = `${ctxConfig.name} Viewport`;
    if (elStageSub) elStageSub.textContent = ctxConfig.badge;

    // Update Canvas Overlay Legend
    updateCanvasOverlayLegend(ctxConfig);

    // Sync dropdown widgets if present
    const contextSelector = document.getElementById('contextSelector');
    if (contextSelector && contextSelector.value !== ctxConfig.id) {
      contextSelector.value = ctxConfig.id;
    }
    const viewStatus = document.getElementById('viewStatus');
    if (viewStatus) {
      const labels = {
        original: "Original Geometry View",
        physics: "Physics / Field Dynamics",
        comms: "Comms / Satellite Network",
        knowledge: "Knowledge / Data Map",
        quiz: "Quiz / Assessment Mode"
      };
      viewStatus.textContent = `Current: ${labels[ctxConfig.id] || ctxConfig.name}`;
      viewStatus.style.color = "#a0e0ff";
    }

    showToast(`Context Switched: ${ctxConfig.name}`);
  }

  function updateCanvasOverlayLegend(ctxConfig) {
    const titleEl = document.getElementById('overlay-title');
    const listEl = document.getElementById('overlay-items-list');
    if (!titleEl || !listEl) return;

    if (ctxConfig.id === 'original') {
      titleEl.innerHTML = `<span>🌐</span> <span>ORIGINAL GEOMETRY</span>`;
      listEl.innerHTML = `
        <div class="overlay-item"><div class="overlay-dot" style="background:#00f0ff;"></div><span>Hopf Fibration S³ Fibers</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#c084fc;"></div><span>Concentric Tori Projections</span></div>
      `;
    } else if (ctxConfig.id === 'physics') {
      titleEl.innerHTML = `<span>⚡</span> <span>FIELD DYNAMICS</span>`;
      listEl.innerHTML = `
        <div class="overlay-item"><div class="overlay-dot" style="background:#f59e0b;"></div><span>Curvature Flux Vectors</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#ef4444;"></div><span>432Hz Harmonic Shell</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#00f0ff;"></div><span>7.83Hz Schumann Ripple</span></div>
      `;
    } else if (ctxConfig.id === 'comms') {
      titleEl.innerHTML = `<span>📡</span> <span>SATELLITE & COMMS</span>`;
      listEl.innerHTML = `
        <div class="overlay-item"><div class="overlay-dot" style="background:#10b981;"></div><span>LEO/MEO/GEO Constellations</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#00f0ff;"></div><span>24 Papers Up For Grabs</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#3b82f6;"></div><span>Anti-Jam & Maritime Tier</span></div>
      `;
    } else if (ctxConfig.id === 'knowledge') {
      titleEl.innerHTML = `<span>📚</span> <span>KNOWLEDGE HUBS</span>`;
      listEl.innerHTML = `
        <div class="overlay-item"><div class="overlay-dot" style="background:#a855f7;"></div><span>196 Physics Corpus Papers</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#ec4899;"></div><span>N₁ × N₂ ≈ N₃ Bridge Lines</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#facc15;"></div><span>DUNE, Muon & Semigroups</span></div>
      `;
    } else if (ctxConfig.id === 'quiz') {
      titleEl.innerHTML = `<span>🧠</span> <span>RULE #0 ASSESSMENT</span>`;
      listEl.innerHTML = `
        <div class="overlay-item"><div class="overlay-dot" style="background:#00f0ff;"></div><span>S³ Continuous Manifold</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#10b981;"></div><span>Candidate Lead: Alpha & Gamma</span></div>
        <div class="overlay-item"><div class="overlay-dot" style="background:#f59e0b;"></div><span>Invariants: Norm 100, Ratio 1.0</span></div>
      `;
    }
  }

  // Attach RendererEngine & __hypersphereRenderer to window
  window.RendererEngine = {
    applyContext,
    getActiveContext: () => activeContext
  };

  window.__hypersphereRenderer = {
    currentMode: 'geometry',
    currentTheme: 'cyan-lavender',
    currentOverlays: [],

    setMode(mode) {
      this.currentMode = mode;
      const modeToCtx = {
        'geometry': 'original',
        'field': 'physics',
        'network': 'comms',
        'data': 'knowledge',
        'evaluation': 'quiz',
        'assessment': 'quiz'
      };
      const ctxId = modeToCtx[mode] || 'original';
      if (activeContext.id !== ctxId && HypersphereViews.contexts[ctxId]) {
        applyContext(HypersphereViews.contexts[ctxId]);
      }
    },

    setTheme(theme) {
      this.currentTheme = theme;
      const themePalettes = {
        'cyan-lavender': { primary: '#00f0ff', secondary: '#c084fc', tertiary: '#38bdf8' },
        'energy-heatmap': { primary: '#f59e0b', secondary: '#ef4444', tertiary: '#00f0ff' },
        'signal-security': { primary: '#10b981', secondary: '#00f0ff', tertiary: '#3b82f6' },
        'domain-colors': { primary: '#a855f7', secondary: '#ec4899', tertiary: '#00f0ff' },
        'status-highlight': { primary: '#00f0ff', secondary: '#10b981', tertiary: '#f59e0b' }
      };
      if (themePalettes[theme]) {
        activeContext.palette = { ...activeContext.palette, ...themePalettes[theme] };
      }
    },

    setOverlays(overlays) {
      this.currentOverlays = overlays || [];
    },

    applyContext(ctxConfig) {
      applyContext(ctxConfig);
    }
  };

  // Wire up Toolbar Buttons
  const contextButtons = document.querySelectorAll('.btn-context');
  contextButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const ctxId = btn.getAttribute('data-context');
      HypersphereViews.switchTo(ctxId);
    });
  });

  // Wire up Dropdown Select
  const selectContext = document.getElementById('select-hypersphere-context');
  if (selectContext) {
    selectContext.addEventListener('change', (e) => {
      HypersphereViews.switchTo(e.target.value);
    });
  }

  // -------------------------------------------------------------
  // UI Controls Wire-up
  // -------------------------------------------------------------
  const btnToggleMode = document.getElementById('btn-toggle-mode');
  if (btnToggleMode) {
    btnToggleMode.addEventListener('click', () => {
      if (renderMode === 'hopf') {
        renderMode = 'vortex';
        btnToggleMode.textContent = '🌀 View: Conformal Vortex';
        showToast('Mode: Conformal Hyperbolic Vortex Grid');
      } else if (renderMode === 'vortex') {
        renderMode = 'particles';
        btnToggleMode.textContent = '✨ View: Fiber Particle Flow';
        showToast('Mode: Continuous S³ Manifold Fiber Flow');
      } else {
        renderMode = 'hopf';
        btnToggleMode.textContent = '🌐 View: 4D Hopf Rings';
        showToast('Mode: 4D Hopf Fibration Tori Projection');
      }
    });
  }

  const btnToggleRot = document.getElementById('btn-toggle-rotation');
  if (btnToggleRot) {
    btnToggleRot.addEventListener('click', () => {
      autoRotate = !autoRotate;
      btnToggleRot.textContent = autoRotate ? '⏸️ Pause Orbit' : '▶️ Resume Orbit';
      btnToggleRot.classList.toggle('active', autoRotate);
    });
  }

  const btnReset = document.getElementById('btn-reset-view');
  if (btnReset) {
    btnReset.addEventListener('click', () => {
      userRotPitch = 0.0;
      userRotYaw = 0.0;
      rotAngleXW = 0.0;
      rotAngleYZ = 0.0;
      showToast('Viewport & Quaternion Orientation Reset to Identity q=(1,0,0,0)');
    });
  }

  const sliderSpeed = document.getElementById('slider-rotation-speed');
  if (sliderSpeed) {
    sliderSpeed.addEventListener('input', (e) => {
      rotationSpeed = parseFloat(e.target.value);
    });
  }

  const btnAudio = document.getElementById('btn-toggle-audio');
  if (btnAudio) {
    btnAudio.addEventListener('click', toggleAudio);
  }

  const btnToggleJson = document.getElementById('btn-toggle-json');
  const rawJsonCard = document.getElementById('raw-json-card');
  if (btnToggleJson && rawJsonCard) {
    btnToggleJson.addEventListener('click', () => {
      const isHidden = rawJsonCard.style.display === 'none';
      rawJsonCard.style.display = isHidden ? 'block' : 'none';
      btnToggleJson.textContent = isHidden ? '📊 Hide Raw JSON' : '📊 Show Raw JSON';
    });
  }

  // -------------------------------------------------------------
  // Live Telemetry Sync with localhost:8080/audi
  // -------------------------------------------------------------
  const backendUrl = window.location.port === '8080' ? '/audi' : 'http://localhost:8080/audi';
  const client = new HypersphereTelemetryClient(backendUrl);

  client.onData((data, err) => {
    const statusDot = document.getElementById('hud-status-dot');
    const statusText = document.getElementById('hud-status-text');
    const telNorm = document.getElementById('tel-norm');
    const telPhase = document.getElementById('tel-phase');
    const telCoherence = document.getElementById('tel-coherence');
    const telCarrier = document.getElementById('tel-carrier');
    const telSchumann = document.getElementById('tel-schumann');
    const telField = document.getElementById('tel-field');
    const telGate = document.getElementById('tel-gate');
    const telPolicy = document.getElementById('tel-policy');
    const jsonOutput = document.getElementById('json-stream-output');

    if (data) {
      if (statusDot) statusDot.style.backgroundColor = 'var(--accent-green)';
      if (statusText) statusText.textContent = `${data.status} • ONLINE`;
      if (telNorm) telNorm.textContent = `${data.norm.toFixed(1)} / ${data.target_norm.toFixed(1)}`;
      if (telPhase) telPhase.textContent = `${data.phase.toFixed(2)}° (0.00 Drift)`;
      if (telCoherence) telCoherence.textContent = data.coherence.toFixed(3);
      if (telCarrier) telCarrier.textContent = data.anchor_freq;
      if (telSchumann) telSchumann.textContent = data.schumann_lock;
      if (telField) telField.textContent = data.geomagnetic_field;
      if (telGate) telGate.textContent = `[${data.tensor_gate.join(', ')}]`;
      if (telPolicy) telPolicy.textContent = data.access_policy;
      if (jsonOutput) jsonOutput.textContent = JSON.stringify(data, null, 2);
    } else {
      if (statusDot) statusDot.style.backgroundColor = 'var(--accent-red)';
      if (statusText) statusText.textContent = `RECONNECTING... (${err || 'offline'})`;
    }
  });

  client.startPolling(1000);

  // Toast Helper
  function showToast(msg) {
    let toast = document.getElementById('toast-notice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast-notice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.innerHTML = `<span>🛡️</span> <span>${msg}</span>`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3200);
  }

  // Start with default context
  applyContext(activeContext);

  // Start Animation Loop
  requestAnimationFrame(renderLoop);
});
