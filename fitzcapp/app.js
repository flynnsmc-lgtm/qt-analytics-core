// ========================================================
// FITZCAPP — TOPOLOGICAL KSOM NEURAL LATTICE ENGINE
// 1,510 Autonomous Nodes • 432 Hz Cymatic Spin Waves
// ========================================================

// --- ROUTING SYSTEM ---
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function showPage(pageId) {
  pages.forEach(p => p.classList.remove('active'));
  navLinks.forEach(l => {
    if (!l.classList.contains('nav-link-external')) {
      l.classList.remove('active');
    }
  });
  const target = document.getElementById(`page-${pageId}`);
  if (target) target.classList.add('active');
  const activeLink = document.querySelector(`a[href="#${pageId}"]`);
  if (activeLink) activeLink.classList.add('active');

  // Trigger canvas resize if switching to dashboard
  if (pageId === 'dashboard' && window.resizeKsomCanvas) {
    setTimeout(window.resizeKsomCanvas, 50);
  }
}

function routeFromHash() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  showPage(hash);
}
window.addEventListener('hashchange', routeFromHash);
window.addEventListener('load', routeFromHash);

navLinks.forEach(link => {
  if (!link.classList.contains('nav-link-external')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.location.hash = link.getAttribute('href');
    });
  }
});

// --- BACKEND PARAMETER SYNC HELPER ---
async function syncParamWithBackend(key, value) {
  try {
    const res = await fetch('/api/set-param', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value, timestamp: Date.now() })
    });
    if (res.ok) {
      const data = await res.json();
      console.log('[Backend Sync OK]', key, value, data);
    }
  } catch (err) {
    console.debug('[Backend Sync Notice] Local/standalone mode:', err.message);
  }
}

// --- DROPDOWN EVENT HANDLERS ---
document.getElementById('topology-select')?.addEventListener('change', e => {
  updateInstrument('topology', e.target.value);
  syncParamWithBackend('topology', e.target.value);
  if (window.onTopologyChanged) window.onTopologyChanged(e.target.value);
});

document.getElementById('init-select')?.addEventListener('change', e => {
  updateInstrument('initMode', e.target.value);
  syncParamWithBackend('initMode', e.target.value);
  if (window.onInitModeChanged) window.onInitModeChanged(e.target.value);
});

document.getElementById('neighborhood-select')?.addEventListener('change', e => {
  updateInstrument('neighborhood', e.target.value);
  syncParamWithBackend('neighborhood', e.target.value);
});

document.getElementById('metric-select')?.addEventListener('change', e => {
  syncParamWithBackend('metricView', e.target.value);
});

document.getElementById('route-select')?.addEventListener('change', e => {
  instrumentState.routeSource = e.target.value;
  syncParamWithBackend('routeSource', e.target.value);
});

document.getElementById('security-select')?.addEventListener('change', e => {
  syncParamWithBackend('securityMode', e.target.value);
});

// --- INSTRUMENT READOUTS STATE ---
const instrumentState = {
  topology: 'ksom',
  initMode: 'random',
  neighborhood: 'bubble',
  routeSource: 'local',
  qError: 0.014,
  topoError: 0.124,
  nodes: 1510,
  status: 'Converged / Ready'
};

function updateInstrument(key, value) {
  instrumentState[key] = value;
  instrumentState.status = `Loaded: ${value.toUpperCase()}`;
  renderInstrument();
}

function renderInstrument() {
  const q = document.getElementById('val-qerr');
  const t = document.getElementById('val-topo');
  const s = document.getElementById('val-status');
  const n = document.getElementById('val-nodes');
  if (q) q.textContent = instrumentState.qError.toFixed(3);
  if (t) t.textContent = instrumentState.topoError.toFixed(3);
  if (s) s.textContent = instrumentState.status;
  if (n) n.textContent = instrumentState.nodes;
}

// ========================================================
// 🌌 2D INTERACTIVE KSOM CANVAS & GEOMETRIC WAVE ENGINE
// ========================================================
(function() {
  const canvas = document.getElementById('ksom-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('canvas-stage');
  const tooltip = document.getElementById('floating-info-card');
  const hudFps = document.getElementById('hud-fps');
  const hudCoherence = document.getElementById('hud-coherence');

  const TOTAL_NODES = 1510;
  let nodes = [];
  let width = canvas.width;
  let height = canvas.height;

  // Active Layers (Toggled via Menu)
  const layers = {
    nodes: true,
    lattice: true,
    waves: true,
    cymatics: true,
    vortex: false
  };

  // Mouse & Hover State
  const mouse = { x: -1000, y: -1000, vx: 0, vy: 0, down: false };
  let hoveredNode = null;
  let pulseWave = null; // Wave shockwave on click

  // Cluster Profiles (Forensic & Harmonic Classification)
  const CLUSTER_TYPES = [
    { name: "Core Fitzcapp Authority", tag: "AUTHORITY #0", color: "#6ee7b7", baseWeight: [0.95, 0.98, 0.92] },
    { name: "Clean CEX Exchange Anchor", tag: "CEX GATEWAY", color: "#00f0ff", baseWeight: [0.82, 0.74, 0.91] },
    { name: "Peel-Chain Ingress Flow", tag: "PEEL-CHAIN", color: "#f59e0b", baseWeight: [0.45, 0.62, 0.38] },
    { name: "High-Entropy Mixer Vector", tag: "MIXER ALERT", color: "#f472b6", baseWeight: [0.12, 0.33, 0.88] },
    { name: "432 Hz Harmonic Bridge", tag: "HARMONIC S3", color: "#c084fc", baseWeight: [0.77, 0.88, 0.65] }
  ];

  // 1. Initialize 1,510 Nodes in Organic Golden Spiral & Hex Lattice
  function initNodes(mode = 'random') {
    nodes = [];
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

    for (let i = 0; i < TOTAL_NODES; i++) {
      let nx, ny;
      const clusterIdx = Math.floor(Math.sin(i * 3.7) * 2.5 + 2.5) % CLUSTER_TYPES.length;
      const cluster = CLUSTER_TYPES[clusterIdx];

      if (mode === 'linear') {
        // Linear grid spread with jitter
        const cols = 45;
        const col = i % cols;
        const row = Math.floor(i / cols);
        nx = 0.08 + (col / cols) * 0.84 + (Math.random() - 0.5) * 0.015;
        ny = 0.08 + (row / 34) * 0.84 + (Math.random() - 0.5) * 0.015;
      } else {
        // Golden ratio phyllotaxis disc distribution
        const rNorm = Math.sqrt((i + 1) / TOTAL_NODES);
        const theta = i * goldenAngle;
        nx = 0.5 + Math.cos(theta) * rNorm * 0.44;
        ny = 0.5 + Math.sin(theta) * rNorm * 0.44;
      }

      const phase = (i * 432.0 / TOTAL_NODES * 360) % 360;
      const qerr = 0.003 + Math.random() * 0.015;

      nodes.push({
        id: i + 1,
        code: `#KSOM-${String(i + 1).padStart(4, '0')}`,
        baseX: nx,
        baseY: ny,
        x: nx * width,
        y: ny * height,
        vx: 0,
        vy: 0,
        cluster: cluster,
        phase: phase,
        qError: qerr,
        weights: [
          +(cluster.baseWeight[0] + (Math.random() - 0.5) * 0.1).toFixed(2),
          +(cluster.baseWeight[1] + (Math.random() - 0.5) * 0.1).toFixed(2),
          +(cluster.baseWeight[2] + (Math.random() - 0.5) * 0.1).toFixed(2)
        ],
        radius: 2.2 + (i % 3) * 0.6,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // 2. Responsive Canvas Sizing
  function resizeCanvas() {
    if (!stage || !canvas) return;
    const rect = stage.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    // Re-scale positions
    nodes.forEach(n => {
      n.x = n.baseX * width;
      n.y = n.baseY * height;
    });
  }
  window.resizeKsomCanvas = resizeCanvas;
  window.addEventListener('resize', resizeCanvas);

  // 3. Animation State & Performance Counters
  let lastTime = performance.now();
  let frameCount = 0;
  let fpsTimer = performance.now();
  let currentFps = 60;
  let globalTime = 0;

  // 4. Main 60 FPS Render Loop
  function animate(now) {
    requestAnimationFrame(animate);
    const dt = (now - lastTime) / 1000;
    lastTime = now;
    globalTime += dt;

    // FPS Meter
    frameCount++;
    if (now - fpsTimer >= 500) {
      currentFps = Math.round((frameCount * 1000) / (now - fpsTimer));
      frameCount = 0;
      fpsTimer = now;
      if (hudFps) hudFps.textContent = currentFps;
      if (hudCoherence) {
        const coh = (99.2 + Math.sin(globalTime * 2) * 0.5).toFixed(1);
        hudCoherence.textContent = `${coh}%`;
      }
    }

    // Clear background with soft motion trail
    ctx.fillStyle = 'rgba(6, 9, 19, 0.45)';
    ctx.fillRect(0, 0, width, height);

    const centerX = width * 0.5;
    const centerY = height * 0.5;

    // --- LAYER 1: 432 Hz Concentric Cymatic Rings ---
    if (layers.cymatics) {
      drawCymaticRings(centerX, centerY, globalTime);
    }

    // --- LAYER 2: Spinning Geometric Waves ---
    if (layers.waves) {
      drawSpinningGeometricWaves(centerX, centerY, globalTime);
    }

    // --- Dynamic Physics Update for 1,510 Nodes ---
    updateNodePhysics(centerX, centerY, globalTime);

    // --- LAYER 3: Interlocking Mesh Lattice Links ---
    if (layers.lattice) {
      drawInterlockingLattice();
    }

    // --- LAYER 4: 1,510 Node Particles & Coronals ---
    if (layers.nodes) {
      drawNodes(globalTime);
    }

    // --- LAYER 5: Hover Target Reticle & Ripple Effect ---
    drawInteractiveReticle(globalTime);

    // --- Click Shockwave Decay ---
    if (pulseWave) {
      drawShockwave(pulseWave);
      pulseWave.radius += 350 * dt;
      pulseWave.alpha -= 1.4 * dt;
      if (pulseWave.alpha <= 0) pulseWave = null;
    }
  }

  // --- CYMATIC RINGS (Harmonic 432 Hz Carrier Waves) ---
  function drawCymaticRings(cx, cy, t) {
    const ringCount = 6;
    ctx.save();
    for (let r = 1; r <= ringCount; r++) {
      const baseRadius = (width * 0.45 / ringCount) * r;
      const ripple = Math.sin(t * 3.5 - r * 0.8) * 8;
      const radius = baseRadius + ripple;

      ctx.beginPath();
      ctx.arc(cx, cy, Math.max(0, radius), 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 240, 255, ${0.035 + (r % 2) * 0.02})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 8]);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- SPINNING GEOMETRIC WAVES (Logarithmic Spirals) ---
  function drawSpinningGeometricWaves(cx, cy, t) {
    const spiralArms = 4;
    const spinSpeed = t * 0.85;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(spinSpeed);

    for (let a = 0; a < spiralArms; a++) {
      const angleOffset = (a * Math.PI * 2) / spiralArms;
      ctx.beginPath();

      for (let step = 0; step < 70; step++) {
        const theta = step * 0.15 + angleOffset;
        const rad = Math.pow(1.055, step * 1.8) * 4.5;
        const wx = Math.cos(theta) * rad;
        const wy = Math.sin(theta) * rad;

        if (step === 0) ctx.moveTo(wx, wy);
        else ctx.lineTo(wx, wy);
      }

      ctx.strokeStyle = (a % 2 === 0) 
        ? 'rgba(110, 231, 183, 0.07)' 
        : 'rgba(245, 158, 11, 0.06)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- UPDATE NODE PHYSICS (Harmonics, Waves, Mouse Elasticity) ---
  function updateNodePhysics(cx, cy, t) {
    const isVortex = layers.vortex;

    nodes.forEach(n => {
      // 1. Base geometric wave displacement
      const dxCenter = n.x - cx;
      const dyCenter = n.y - cy;
      const distCenter = Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter) || 1;
      const waveFreq = 432.0 / 100.0; // ~4.32 rad/s
      const waveMod = Math.sin(distCenter * 0.035 - t * waveFreq + n.pulseOffset);

      // Target position
      let targetX = n.baseX * width;
      let targetY = n.baseY * height;

      // Vortex flow rotation
      if (isVortex) {
        const angle = Math.atan2(dyCenter, dxCenter) + 0.35 * Math.PI * (t * 0.1);
        targetX = cx + Math.cos(angle) * distCenter;
        targetY = cy + Math.sin(angle) * distCenter;
      }

      // Add radial wave breathing
      targetX += (dxCenter / distCenter) * waveMod * 4.5;
      targetY += (dyCenter / distCenter) * waveMod * 4.5;

      // 2. Mouse interaction (Repel / Attract Wave)
      const dxMouse = n.x - mouse.x;
      const dyMouse = n.y - mouse.y;
      const distMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
      const mouseRadius = 140;

      if (distMouse < mouseRadius && distMouse > 1) {
        const force = (1 - distMouse / mouseRadius) * 22;
        targetX += (dxMouse / distMouse) * force;
        targetY += (dyMouse / distMouse) * force;
      }

      // 3. Elastic Spring Lerp towards target
      n.vx = (targetX - n.x) * 0.12;
      n.vy = (targetY - n.y) * 0.12;
      n.x += n.vx;
      n.y += n.vy;
    });
  }

  // --- INTERLOCKING LATTICE LINKS (Hex/Triangulation) ---
  function drawInterlockingLattice() {
    ctx.save();
    ctx.lineWidth = 0.75;

    // Check neighbors in chunks for 60fps performance
    const step = 2; // sample density
    for (let i = 0; i < TOTAL_NODES - 1; i += step) {
      const a = nodes[i];
      // Connect to subsequent nodes in vicinity
      for (let j = i + 1; j < Math.min(i + 14, TOTAL_NODES); j++) {
        const b = nodes[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distSq = dx * dx + dy * dy;

        // Connect if close enough (under ~45px)
        if (distSq < 2025) {
          const alpha = (1 - distSq / 2025) * 0.18;
          ctx.strokeStyle = `rgba(110, 231, 183, ${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  // --- DRAW 1,510 NODES ---
  function drawNodes(t) {
    nodes.forEach(n => {
      const isHover = (hoveredNode && hoveredNode.id === n.id);
      const pulse = 1 + Math.sin(t * 4 + n.pulseOffset) * 0.25;
      const r = isHover ? n.radius * 2.2 : n.radius * pulse;

      // Draw particle core
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = isHover ? '#ffffff' : n.cluster.color;
      ctx.fill();

      // Soft glow halo on cluster key nodes
      if (n.id % 5 === 0 || isHover) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, r * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = isHover 
          ? 'rgba(0, 240, 255, 0.4)' 
          : `${n.cluster.color}22`;
        ctx.fill();
      }
    });
  }

  // --- HOVER TARGET RETICLE ---
  function drawInteractiveReticle(t) {
    if (!hoveredNode) return;
    const n = hoveredNode;
    ctx.save();
    ctx.translate(n.x, n.y);
    ctx.rotate(t * 2);

    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, 14, 0, Math.PI * 2);
    ctx.setLineDash([4, 4]);
    ctx.stroke();

    // Crosshairs
    ctx.beginPath();
    ctx.moveTo(-18, 0); ctx.lineTo(-12, 0);
    ctx.moveTo(12, 0); ctx.lineTo(18, 0);
    ctx.moveTo(0, -18); ctx.lineTo(0, -12);
    ctx.moveTo(0, 12); ctx.lineTo(0, 18);
    ctx.stroke();

    ctx.restore();
  }

  // --- SHOCKWAVE VISUAL (Click Ripple) ---
  function drawShockwave(w) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 240, 255, ${w.alpha})`;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius * 0.75, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(110, 231, 183, ${w.alpha * 0.6})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.restore();
  }

  // 5. Mouse Interaction & Floating Info Card Controller
  function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;

    // Detect closest node within 26px
    let closest = null;
    let minDist = 26;

    for (let i = 0; i < TOTAL_NODES; i++) {
      const n = nodes[i];
      const dx = n.x - mouse.x;
      const dy = n.y - mouse.y;
      const d = Math.sqrt(dx * dx + dy * dy);
      if (d < minDist) {
        minDist = d;
        closest = n;
      }
    }

    hoveredNode = closest;

    // Show/Update Floating Info Tooltip
    if (closest && tooltip) {
      tooltip.style.display = 'block';
      tooltip.style.left = `${mouse.x}px`;
      tooltip.style.top = `${mouse.y}px`;

      document.getElementById('info-node-id').textContent = closest.code;
      document.getElementById('info-cluster-name').textContent = closest.cluster.name;
      document.getElementById('info-cluster-tag').textContent = closest.cluster.tag;
      document.getElementById('info-cluster-tag').style.color = closest.cluster.color;
      document.getElementById('info-pos').textContent = `x: ${(closest.x / width).toFixed(3)}, y: ${(closest.y / height).toFixed(3)}`;
      document.getElementById('info-phase').textContent = `${closest.phase.toFixed(1)}° (Lock: 1.0000)`;
      document.getElementById('info-weights').textContent = `[${closest.weights.join(', ')}]`;
      document.getElementById('info-qerr').textContent = closest.qError.toFixed(4);

      const coh = (97.5 + (1 - closest.qError * 20) * 2.5).toFixed(1);
      document.getElementById('info-coherence-val').textContent = `${coh}%`;
      document.getElementById('info-coherence-bar').style.width = `${coh}%`;
    } else if (tooltip) {
      tooltip.style.display = 'none';
    }
  }

  function handleMouseLeave() {
    mouse.x = -1000;
    mouse.y = -1000;
    hoveredNode = null;
    if (tooltip) tooltip.style.display = 'none';
  }

  // Click = Inject Learning Vector (Pull nearby nodes towards click)
  function handleCanvasClick(e) {
    const rect = canvas.getBoundingClientRect();
    const cx = e.clientX - rect.left;
    const cy = e.clientY - rect.top;

    // Create visual shockwave
    pulseWave = { x: cx, y: cy, radius: 10, alpha: 0.85 };

    // Simulated Kohonen training step: pull nodes toward click
    const learnRadius = 180;
    nodes.forEach(n => {
      const dx = cx - n.x;
      const dy = cy - n.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < learnRadius) {
        const influence = Math.exp(-Math.pow(dist / (learnRadius * 0.6), 2)) * 0.35;
        n.baseX += (dx / width) * influence * 0.2;
        n.baseY += (dy / height) * influence * 0.2;
        n.qError = Math.max(0.001, n.qError - 0.0015);
      }
    });

    // Update global quantization error readout
    instrumentState.qError = Math.max(0.004, instrumentState.qError - 0.001);
    renderInstrument();
  }

  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseleave', handleMouseLeave);
  canvas.addEventListener('click', handleCanvasClick);

  // 6. Toolbar Toggle Buttons
  const toggleButtons = document.querySelectorAll('.btn-toggle');
  toggleButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const layer = btn.getAttribute('data-layer');
      if (layer && layers.hasOwnProperty(layer)) {
        layers[layer] = !layers[layer];
        btn.classList.toggle('active', layers[layer]);
      }
    });
  });

  // Action: Pulse Epoch
  document.getElementById('btn-train-pulse')?.addEventListener('click', () => {
    pulseWave = { x: width * 0.5, y: height * 0.5, radius: 20, alpha: 1.0 };
    nodes.forEach(n => {
      n.pulseOffset += Math.PI * 0.5;
      n.qError = Math.max(0.002, n.qError * 0.88);
    });
    instrumentState.qError = Math.max(0.003, instrumentState.qError * 0.85);
    instrumentState.status = 'Training Epoch Completed (1510 Nodes)';
    renderInstrument();
  });

  // Action: Reseed Lattice
  document.getElementById('btn-reseed')?.addEventListener('click', () => {
    initNodes(instrumentState.initMode || 'random');
    pulseWave = { x: width * 0.5, y: height * 0.5, radius: 10, alpha: 0.9 };
    instrumentState.qError = 0.018;
    instrumentState.status = 'Lattice Reseeded / Randomized';
    renderInstrument();
  });

  // Mode change callbacks
  window.onInitModeChanged = function(mode) {
    initNodes(mode);
  };
  window.onTopologyChanged = function(top) {
    instrumentState.status = `Topology: ${top.toUpperCase()}`;
    renderInstrument();
  };

  // Initial Boot
  initNodes();
  resizeCanvas();
  requestAnimationFrame(animate);
})();

// ========================================================
// 2.0 Hz API BLINK BEACON
// ========================================================
const blinkDot = document.getElementById('fitzcapp-blink-dot') || document.getElementById('fitz-blink-dot');
const blinkLatency = document.getElementById('fitzcapp-blink-latency') || document.getElementById('fitz-blink-latency');
const blinkLabel = document.getElementById('fitzcapp-blink-label') || document.getElementById('fitz-blink-label');

async function triggerApiBlink() {
  const t0 = performance.now();
  try {
    const res = await fetch('/api/ksom/metrics');
    const dt = Math.round(performance.now() - t0);
    if (res.ok) {
      const data = await res.json();
      if (blinkDot) {
        blinkDot.classList.add('blink-flash');
        setTimeout(() => blinkDot.classList.remove('blink-flash'), 160);
      }
      if (blinkLatency) {
        blinkLatency.textContent = `${dt}ms`;
      }
      if (blinkLabel && data.api_blink) {
        blinkLabel.textContent = `API BLINK ${data.api_blink.frequency_hz} Hz`;
      }
      if (instrumentState.routeSource === 'api' || instrumentState.routeSource === 'stream') {
        if (data.quantizationError !== undefined) instrumentState.qError = data.quantizationError;
        if (data.topographicError !== undefined) instrumentState.topoError = data.topographicError;
        if (data.nodes !== undefined) instrumentState.nodes = data.nodes;
        if (data.status) instrumentState.status = data.status;
        renderInstrument();
      }
      return;
    }
  } catch (_) {
    // Local fallback pulse
    if (blinkDot) {
      blinkDot.classList.toggle('blink-flash');
      setTimeout(() => blinkDot.classList.remove('blink-flash'), 120);
    }
    if (blinkLatency) {
      blinkLatency.textContent = 'local';
    }
  }

  if (instrumentState.routeSource === 'local') {
    instrumentState.qError = Math.max(0.005, instrumentState.qError + (Math.random() - 0.5) * 0.0005);
    renderInstrument();
  }
}

// 2.0 Hz Heartbeat = 500ms
setInterval(triggerApiBlink, 500);

// Initial render
renderInstrument();
triggerApiBlink();
