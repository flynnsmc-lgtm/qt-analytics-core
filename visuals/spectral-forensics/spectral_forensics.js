/**
 * spectral_forensics.js
 * 
 * QT Analytics — Spectral Forensics Intelligence Desk (V2)
 * ID: QT-SF-V2-ANTIGRAVITY
 * 
 * Capabilities:
 * 1. In-place Universal Hover-Help Tooltip Engine.
 * 2. Unified Dynamic Insight & Explanation Box (instant update on hover/click).
 * 3. Visual Connection Layer (Address ↔ Risk Tag ↔ Loop Verification ↔ Status).
 * 4. Contextual Smart Dropdowns (smooth inline expand/collapse).
 * 5. Dynamic Cluster Mempool Radar / Connection Canvas.
 * 6. Interactive Gödel Locking Relation Calculator (Ω² = 4πGρ = -Λ).
 * 7. Fast Loop Action & Network Refresh simulation.
 */

// -----------------------------------------------------------------------------
// 1. KNOWLEDGE DICTIONARY: COMPLETE DOCUMENTATION FOR ALL CONTROLS & ENTITIES
// -----------------------------------------------------------------------------
const FORENSICS_DICTIONARY = {
  // Global Controls
  'fast-loop-action': {
    name: 'Fast Loop Action',
    category: 'Verification Control',
    def: 'High-frequency verification cycle prioritizing latency over deep-block confirmation.',
    fn: 'Executes rapid 50ms heuristic matching against real-time mempool transfers before block inclusion.',
    chain: ['Mempool Feed', 'Fraud Risk Engine', 'Liaison Desk Alert'],
    why: 'Prevents front-running, sandwich attacks, and rapid flash-loan drains before final consensus settlement.',
    watch: 'Increases local compute load by 3.2x. Watch for temporary false-positive spikes during gas re-pricings.',
    extra: 'Switching to Deep Audit mode reduces CPU usage but introduces a 1.2-second verification latency window.'
  },
  'network-refresh': {
    name: 'Network Refresh',
    category: 'State Reconciliation',
    def: 'Synchronous global state reconciliation and cache invalidation engine.',
    fn: 'Re-queries primary RPC nodes, re-indexes cluster address balances, and resets temporal sliding windows.',
    chain: ['RPC Provider', 'Entity Cache', 'Risk Model Baselines'],
    why: 'Eliminates state drift between the local intelligence desk and decentralized blockchain tip consensus.',
    watch: 'Triggers a 120ms freeze on active websocket buffers while state trees are harmonized.',
    extra: 'Automatic refresh fires every 60 seconds, or manually when latency indicators exceed 150ms.'
  },
  'active-liaison': {
    name: 'Active Liaison Desk',
    category: 'Operator Hub',
    def: 'Real-time human-in-the-loop correlation and incident mitigation command bridge.',
    fn: 'Maintains open telemetry channels with node validators, exchange compliance desks, and security agents.',
    chain: ['Agent Epsilon', 'Risk Tag Scorer', 'Security Intervention'],
    why: 'Ensures algorithmic anomalies exceeding risk score 0.60 are reviewed before irreversible fund movement.',
    watch: 'Check status badge: Green indicates synchronized peer quorum; Amber indicates temporary node lag.',
    extra: 'Directly linked to Antigravity Agent Desk for automated ticket generation and key revocation.'
  },
  'fraud-risk-tag': {
    name: 'Fraud Risk Tag (Composite Metric)',
    category: 'Heuristic Engine',
    def: 'Multi-factor Bayesian risk score normalized between 0.00 (Verified) and 1.00 (Malicious).',
    fn: 'Computes weighted sum: Address Provenance (35%) + Loop Latency Variance (25%) + Graph Clustering (25%) + Sybil Entropy (15%).',
    chain: ['Address History', 'Loop Consistency', 'Cluster Heuristics', 'Status Pill'],
    why: 'Allows operators to instantly identify predatory contract interactions and anomalous transaction bursts.',
    watch: 'Values > 0.65 trigger automatic Fast Loop throttling; values > 0.85 initiate quarantine holds.',
    extra: 'Updated synchronously on every block arrival; unaffected by superficial balance splitting.'
  },
  'godel-locking-relation': {
    name: 'Gödel Locking Relation (Ω² = 4πGρ = -Λ)',
    category: 'Foundational Physics',
    def: 'Exact mathematical solution from Kurt Gödel’s rotating universe model uniting rotation, density, and cosmological constant.',
    fn: 'Locks universal angular velocity (Ω), information mass density (ρ), and negative binding vacuum energy (-Λ) into strict equilibrium.',
    chain: ['Vortex Geometry', 'Space-Memory Imprint', 'Closed Timelike Curves'],
    why: 'Proves that rotation, matter, and the geometry of space are a single chained system, supporting non-local time and space-memory.',
    watch: 'Inward binding force (-Λ) prevents entropy dispersion in high-density coherent informational fields.',
    extra: 'Foundational cornerstone of the Chi Key Unified Physics Platform and QT Analytics intelligence models.'
  },

  // Clusters / Entities
  'entity-cluster-a': {
    name: 'Genesis Liquidity Root (Cluster A)',
    category: 'Treasury & Base Liquidity',
    def: '0x7a3F9e12...b6A4 — Foundation liquidity treasury and protocol reserve anchor.',
    fn: 'Supplies foundational liquidity across verified automated market maker pairs with multi-sig authorization.',
    chain: ['Address: 0x7a3F...', 'Risk: VERIFIED (0.03)', 'Loop: Fast Loop (42ms)', 'Status: LIVE'],
    why: 'Represents the zero-risk baseline anchor against which all local network flow velocities are calibrated.',
    watch: 'Deviation in standard withdrawal interval or unrecognized signer addresses.',
    extra: 'Historical provenance traces back 1,420 days with 100% compliance record.'
  },
  'entity-cluster-b': {
    name: 'Flash-Loan Arbitrageur (Cluster B)',
    category: 'High-Frequency Bot',
    def: '0x19B8a24C...81E3 — Sub-second arbitrage execution contract utilizing uncollateralized flash loans.',
    fn: 'Extracts cross-pool price discrepancies within atomic block bundles and repays capital within the same block.',
    chain: ['Address: 0x19B8...', 'Risk: LOW (0.14)', 'Loop: Stable Loop (58ms)', 'Status: SYNCING'],
    why: 'Generates high transaction frequency that can mimic attack traffic; requires continuous loop verification.',
    watch: 'Ensure net transaction value closes to near zero within single block boundaries.',
    extra: 'Verified MEV searcher contract operating under authorized protocol whitelist.'
  },
  'entity-cluster-c': {
    name: 'Cross-Chain Escrow Vault (Cluster C)',
    category: 'Bridge Custody',
    def: '0x94E2c710...F05d — Multi-chain lock-and-mint bridge custody address holding wrapped assets.',
    fn: 'Locks native L1 assets upon cryptographic proof remittance and verifies L2 minting attestations.',
    chain: ['Address: 0x94E2...', 'Risk: ELEVATED (0.68)', 'Loop: Fast Loop (18ms)', 'Status: ATTENTION'],
    why: 'High-value target for cross-chain re-entrancy and message-relay spoofing attacks.',
    watch: 'Outflow velocity has spiked 480% in the last 15 minutes; relay verification lag detected.',
    extra: 'Recommended Action: Fast Loop rate increased to 18ms; Liaison Desk monitoring relay signatures.'
  },
  'entity-cluster-d': {
    name: 'Dark-Pool Mixer / Sybil Node (Cluster D)',
    category: 'Anomalous Threat',
    def: '0x42C0f889...73aB — Obfuscated multi-hop relayer exhibiting peel-chain transaction topology.',
    fn: 'Splits deposits into uniform denomination outputs across 16 intermediary temporary wallets.',
    chain: ['Address: 0x42C0...', 'Risk: CRITICAL (0.94)', 'Loop: Anomalous (110ms)', 'Status: ALERT'],
    why: 'Strong heuristic correlation with sanctioned transaction laundering protocols and stolen liquidity routing.',
    watch: 'Critical Alert: Quarantine hold triggered; all onward transfers flagged across connected DEX routers.',
    extra: 'Directly linked to forensic ticket #TK-SEC-942. Automated blacklist propagation armed.'
  }
};

// -----------------------------------------------------------------------------
// 2. MAIN CONTROLLER & INITIALIZATION
// -----------------------------------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  initUniversalTooltips();
  initSmartDropdowns();
  initEntitySelection();
  initGlobalControls();
  initGodelSimulator();
  initClusterRadarCanvas();
});

// -----------------------------------------------------------------------------
// 3. UNIVERSAL HOVER-HELP TOOLTIP SYSTEM
// -----------------------------------------------------------------------------
let tooltipEl = null;

function initUniversalTooltips() {
  tooltipEl = document.createElement('div');
  tooltipEl.className = 'spectral-tooltip';
  tooltipEl.id = 'spectral-universal-tooltip';
  document.body.appendChild(tooltipEl);

  const targets = document.querySelectorAll('[data-tooltip-title]');
  targets.forEach(target => {
    target.addEventListener('mouseenter', (e) => {
      const title = target.getAttribute('data-tooltip-title');
      const desc = target.getAttribute('data-tooltip-desc');
      if (!title) return;

      tooltipEl.innerHTML = `
        <div class="tooltip-title">${escapeHtml(title)}</div>
        <div class="tooltip-desc">${escapeHtml(desc || '')}</div>
      `;
      tooltipEl.classList.add('visible');
      positionTooltip(e);
    });

    target.addEventListener('mousemove', (e) => {
      positionTooltip(e);
    });

    target.addEventListener('mouseleave', () => {
      tooltipEl.classList.remove('visible');
    });

    // Also trigger light preview in Insight Box on hover if configured
    target.addEventListener('mouseenter', () => {
      const insightKey = target.getAttribute('data-insight-key');
      if (insightKey && FORENSICS_DICTIONARY[insightKey]) {
        updateInsightBox(insightKey, false); // false = preview mode
      }
    });
  });
}

function positionTooltip(e) {
  if (!tooltipEl) return;
  const offset = 14;
  let left = e.pageX + offset;
  let top = e.pageY + offset;

  // Prevent viewport overflow
  const maxRight = window.innerWidth - 280;
  if (e.clientX > maxRight) {
    left = e.pageX - 270;
  }
  tooltipEl.style.left = `${left}px`;
  tooltipEl.style.top = `${top}px`;
}

// -----------------------------------------------------------------------------
// 4. CONTEXTUAL SMART DROPDOWNS (INLINE ACCORDION)
// -----------------------------------------------------------------------------
function initSmartDropdowns() {
  const toggles = document.querySelectorAll('.dropdown-toggle-btn');
  toggles.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const dropdown = btn.closest('.smart-dropdown');
      if (!dropdown) return;
      const isOpen = dropdown.classList.contains('open');

      // Close other dropdowns in the same accordion if single-expand preferred
      // document.querySelectorAll('.smart-dropdown').forEach(d => d.classList.remove('open'));

      if (isOpen) {
        dropdown.classList.remove('open');
      } else {
        dropdown.classList.add('open');
      }

      // Update insight box with dropdown context
      const key = dropdown.getAttribute('data-insight-key');
      if (key && FORENSICS_DICTIONARY[key]) {
        updateInsightBox(key, true);
      }
    });
  });

  // Parameter row click handlers
  document.querySelectorAll('.param-row').forEach(row => {
    row.addEventListener('click', () => {
      const key = row.getAttribute('data-insight-key');
      if (key && FORENSICS_DICTIONARY[key]) {
        updateInsightBox(key, true);
      }
    });
  });
}

// -----------------------------------------------------------------------------
// 5. LIVE ENTITY SELECTION & VISUAL CONNECTION LAYER
// -----------------------------------------------------------------------------
let activeEntityKey = 'entity-cluster-a';

function initEntitySelection() {
  const rows = document.querySelectorAll('.entity-row');
  rows.forEach(row => {
    row.addEventListener('click', () => {
      const key = row.getAttribute('data-entity-key');
      if (!key) return;

      // Update active styling
      rows.forEach(r => r.classList.remove('active-selection'));
      row.classList.add('active-selection');
      activeEntityKey = key;

      // Update unified insight box
      updateInsightBox(key, true);

      // Redraw connection canvas with active node focus
      drawClusterConnections();
    });

    // Hover also updates insight box
    row.addEventListener('mouseenter', () => {
      const key = row.getAttribute('data-entity-key');
      if (key) updateInsightBox(key, false);
    });
  });

  // Initial selection
  updateInsightBox(activeEntityKey, true);
}

// -----------------------------------------------------------------------------
// 6. UNIFIED DYNAMIC INSIGHT / EXPLANATION BOX UPDATER
// -----------------------------------------------------------------------------
function updateInsightBox(key, isCommitted = true) {
  const data = FORENSICS_DICTIONARY[key];
  if (!data) return;

  const titleEl = document.getElementById('insight-title');
  const catEl = document.getElementById('insight-category');
  const defEl = document.getElementById('insight-definition');
  const fnEl = document.getElementById('insight-function');
  const whyEl = document.getElementById('insight-why');
  const watchEl = document.getElementById('insight-watch');
  const extraEl = document.getElementById('insight-extra');
  const trailContainer = document.getElementById('insight-trail-chain');

  if (titleEl) titleEl.textContent = data.name;
  if (catEl) catEl.textContent = data.category;
  if (defEl) defEl.textContent = data.def;
  if (fnEl) fnEl.textContent = data.fn;
  if (whyEl) whyEl.textContent = data.why;
  if (watchEl) watchEl.textContent = data.watch;
  if (extraEl) extraEl.textContent = data.extra;

  // Build connection trail chips
  if (trailContainer && Array.isArray(data.chain)) {
    trailContainer.innerHTML = '';
    data.chain.forEach((nodeText, idx) => {
      const chip = document.createElement('span');
      chip.className = `trail-node ${idx === 0 ? 'active' : ''}`;
      chip.textContent = nodeText;
      trailContainer.appendChild(chip);

      if (idx < data.chain.length - 1) {
        const arrow = document.createElement('span');
        arrow.className = 'trail-arrow';
        arrow.textContent = '➔';
        trailContainer.appendChild(arrow);
      }
    });
  }

  // Visual pulse on box
  const box = document.getElementById('unified-insight-box');
  if (box && isCommitted) {
    box.style.borderColor = 'var(--cyan-primary)';
    setTimeout(() => {
      box.style.borderColor = 'var(--border-glow)';
    }, 400);
  }
}

// -----------------------------------------------------------------------------
// 7. GLOBAL CONTROLS: NETWORK REFRESH & FAST LOOP ACTION
// -----------------------------------------------------------------------------
function initGlobalControls() {
  const btnRefresh = document.getElementById('btn-global-refresh');
  const btnFastLoop = document.getElementById('btn-global-fast-loop');
  const pillLiaison = document.getElementById('pill-active-liaison');

  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      btnRefresh.classList.add('spinning');
      updateInsightBox('network-refresh', true);

      setTimeout(() => {
        btnRefresh.classList.remove('spinning');
        showToast('Network State Re-Synchronized (Cache Invalidated)');
        // Slightly fluctuate latency values to indicate live polling
        const latPill = document.getElementById('readout-latency-val');
        if (latPill) latPill.textContent = `${Math.floor(Math.random() * 20 + 35)} ms`;
      }, 750);
    });
  }

  if (btnFastLoop) {
    btnFastLoop.addEventListener('click', () => {
      const isFast = btnFastLoop.classList.toggle('active');
      const textEl = document.getElementById('fast-loop-text');
      if (textEl) {
        textEl.textContent = isFast ? 'FAST LOOP: ARMED (50ms)' : 'LOOP: DEEP AUDIT (1.2s)';
      }
      updateInsightBox('fast-loop-action', true);
      showToast(isFast ? 'Fast Loop Activated (50ms High-Throughput)' : 'Switched to Deep Audit Verification');
    });
  }

  if (pillLiaison) {
    pillLiaison.addEventListener('click', () => {
      updateInsightBox('active-liaison', true);
    });
  }
}

// -----------------------------------------------------------------------------
// 8. INTERACTIVE GÖDEL LOCKING RELATION SIMULATOR (Ω² = 4πGρ = -Λ)
// -----------------------------------------------------------------------------
function initGodelSimulator() {
  const sliderOmega = document.getElementById('godel-slider-omega');
  const sliderRho = document.getElementById('godel-slider-rho');
  const valOmega = document.getElementById('godel-val-omega');
  const valRho = document.getElementById('godel-val-rho');
  const valLambda = document.getElementById('godel-val-lambda');

  function calculateGodelLock() {
    if (!sliderOmega || !sliderRho) return;
    const omega = parseFloat(sliderOmega.value);
    const rho = parseFloat(sliderRho.value);

    // Physical Invariant: Ω² = 4πGρ = -Λ
    // In normalized natural units where 4πG = 1:
    const omegaSq = (omega * omega).toFixed(3);
    const matterDensity = (rho).toFixed(3);
    const negativeLambda = `-${(omega * omega).toFixed(3)}`;

    if (valOmega) valOmega.textContent = `${omega.toFixed(2)} rad/s (Ω² = ${omegaSq})`;
    if (valRho) valRho.textContent = `${matterDensity} g/cm³`;
    if (valLambda) valLambda.textContent = `Λ = ${negativeLambda} (Inward Vacuum Bound)`;
  }

  if (sliderOmega) sliderOmega.addEventListener('input', calculateGodelLock);
  if (sliderRho) sliderRho.addEventListener('input', calculateGodelLock);
  calculateGodelLock();
}

// -----------------------------------------------------------------------------
// 9. DYNAMIC CLUSTER CONNECTION CANVAS (RADAR VISUAL LAYER)
// -----------------------------------------------------------------------------
function initClusterRadarCanvas() {
  const canvas = document.getElementById('spectral-cluster-canvas');
  if (!canvas) return;

  window.addEventListener('resize', drawClusterConnections);
  drawClusterConnections();
}

function drawClusterConnections() {
  const canvas = document.getElementById('spectral-cluster-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const rect = canvas.getBoundingClientRect();

  canvas.width = rect.width;
  canvas.height = rect.height;

  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Background grid
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
  ctx.lineWidth = 1;
  const step = 30;
  for (let x = 0; x < w; x += step) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += step) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }

  // Nodes for 4 clusters
  const nodes = [
    { id: 'entity-cluster-a', x: w * 0.2, y: h * 0.35, label: 'Cluster A (Genesis)', color: '#34d399' },
    { id: 'entity-cluster-b', x: w * 0.45, y: h * 0.75, label: 'Cluster B (Arb Bot)', color: '#38bdf8' },
    { id: 'entity-cluster-c', x: w * 0.75, y: h * 0.3, label: 'Cluster C (Bridge)', color: '#fbbf24' },
    { id: 'entity-cluster-d', x: w * 0.85, y: h * 0.75, label: 'Cluster D (Mixer)', color: '#f87171' }
  ];

  // Draw connecting edges
  ctx.lineWidth = 1.5;
  const edges = [
    [0, 1, false],
    [0, 2, false],
    [1, 2, false],
    [2, 3, true] // anomalous bridge to mixer connection (dashed)
  ];

  edges.forEach(([from, to, isAnom]) => {
    ctx.beginPath();
    ctx.moveTo(nodes[from].x, nodes[from].y);
    ctx.lineTo(nodes[to].x, nodes[to].y);

    if (isAnom) {
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
      ctx.setLineDash([5, 5]);
    } else {
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.setLineDash([]);
    }
    ctx.stroke();
  });
  ctx.setLineDash([]);

  // Draw nodes
  nodes.forEach(node => {
    const isSelected = (node.id === activeEntityKey);

    // Outer aura
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(node.x, node.y, 14, 0, Math.PI * 2);
      ctx.fillStyle = node.color.replace(')', ', 0.25)').replace('rgb', 'rgba');
      ctx.fill();
    }

    // Core point
    ctx.beginPath();
    ctx.arc(node.x, node.y, isSelected ? 6 : 4, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    // Node label
    ctx.fillStyle = isSelected ? '#ffffff' : '#94a3b8';
    ctx.font = isSelected ? 'bold 10px JetBrains Mono' : '9px JetBrains Mono';
    ctx.fillText(node.label, node.x - 30, node.y - 10);
  });
}

// Utility Toast
function showToast(msg) {
  let toast = document.getElementById('spectral-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'spectral-toast';
    toast.style.cssText = `
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(3, 7, 18, 0.95);
      border: 1px solid var(--cyan-primary);
      color: #e0f2fe;
      padding: 10px 18px;
      border-radius: 8px;
      font-family: var(--font-mono);
      font-size: 0.78rem;
      box-shadow: 0 8px 30px rgba(0, 240, 255, 0.3);
      z-index: 9999;
      transition: opacity 0.3s ease;
      opacity: 0;
      pointer-events: none;
    `;
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  setTimeout(() => { toast.style.opacity = '0'; }, 2800);
}

function escapeHtml(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
