// === ROUTING SYSTEM ===
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
}

// Handle hash changes & initial route
function routeFromHash() {
  const hash = window.location.hash.slice(1) || 'dashboard';
  showPage(hash);
}
window.addEventListener('hashchange', routeFromHash);
window.addEventListener('load', routeFromHash);

// Nav clicks → update hash
navLinks.forEach(link => {
  if (!link.classList.contains('nav-link-external')) {
    link.addEventListener('click', e => {
      e.preventDefault();
      window.location.hash = link.getAttribute('href');
    });
  }
});

// === BACKEND SYNC HELPER ===
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
    // If backend endpoint is unavailable or running local file mode, fail gracefully
    console.debug('[Backend Sync Notice] Running offline / local mode:', err.message);
  }
}

// === DROPDOWN HANDLERS ===
// Topology selector
document.getElementById('topology-select')?.addEventListener('change', e => {
  console.log('[Topology]', e.target.value);
  updateInstrument('topology', e.target.value);
  syncParamWithBackend('topology', e.target.value);
});

// Init mode selector
document.getElementById('init-select')?.addEventListener('change', e => {
  console.log('[Init Mode]', e.target.value);
  updateInstrument('initMode', e.target.value);
  syncParamWithBackend('initMode', e.target.value);
});

// Neighborhood selector
document.getElementById('neighborhood-select')?.addEventListener('change', e => {
  console.log('[Neighborhood]', e.target.value);
  updateInstrument('neighborhood', e.target.value);
  syncParamWithBackend('neighborhood', e.target.value);
});

// Metric display selector
document.getElementById('metric-select')?.addEventListener('change', e => {
  console.log('[Metric View]', e.target.value);
  syncParamWithBackend('metricView', e.target.value);
});

// Route / API selector
document.getElementById('route-select')?.addEventListener('change', e => {
  console.log('[Route/Source]', e.target.value);
  instrumentState.routeSource = e.target.value;
  syncParamWithBackend('routeSource', e.target.value);
  if (e.target.value === 'api' || e.target.value === 'stream') {
    instrumentState.status = `Connecting to ${e.target.value}...`;
    renderInstrument();
  }
});

// Security mode selector
document.getElementById('security-select')?.addEventListener('change', e => {
  console.log('[Security]', e.target.value);
  syncParamWithBackend('securityMode', e.target.value);
});

// === INSTRUMENT / LIVE READOUTS ===
const instrumentState = {
  topology: 'ksom',
  initMode: 'random',
  neighborhood: 'bubble',
  routeSource: 'local',
  qError: 0.014,
  topoError: 0.124,
  nodes: 1510,
  status: 'Ready'
};

function updateInstrument(key, value) {
  instrumentState[key] = value;
  instrumentState.status = `Loaded: ${value}`;
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

// === API BLINK & METRICS ENGINE (2.0 Hz Pulse) ===
const blinkDot = document.getElementById('fitzcapp-blink-dot');
const blinkLatency = document.getElementById('fitzcapp-blink-latency');
const blinkLabel = document.getElementById('fitzcapp-blink-label');

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
    // Local fallback animation
    if (blinkDot) {
      blinkDot.classList.toggle('blink-flash');
      setTimeout(() => blinkDot.classList.remove('blink-flash'), 120);
    }
    if (blinkLatency) {
      blinkLatency.textContent = 'local';
    }
  }

  // Local fallback simulation if offline
  if (instrumentState.routeSource === 'local') {
    instrumentState.qError = 0.010 + Math.random() * 0.008;
    instrumentState.topoError = 0.120 + Math.random() * 0.015;
    renderInstrument();
  }
}

// 2.0 Hz Heartbeat = 500ms
setInterval(triggerApiBlink, 500);

// Initial render & first pulse
renderInstrument();
triggerApiBlink();

