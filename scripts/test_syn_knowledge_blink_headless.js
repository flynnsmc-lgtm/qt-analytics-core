const http = require('http');

function fetchUrl(path, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path: path,
      method: options.method || 'GET',
      headers: options.headers || {}
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    req.on('error', reject);
    if (options.body) {
      req.write(options.body);
    }
    req.end();
  });
}

async function runAudit() {
  console.log('=== FITZCAPP & CHI CORE: SYN KNOWLEDGE & API BLINK AUDIT ===\n');
  let passCount = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  ✓ [PASS] ${message}`);
      passCount++;
    } else {
      console.error(`  ✗ [FAIL] ${message}`);
    }
  }

  // Test 1: Live Root Page & Beacon element
  try {
    const rootRes = await fetchUrl('/');
    assert(rootRes.statusCode === 200, 'Root live page http://localhost:8080/ returns 200 OK');
    assert(rootRes.body.includes('id="api-blink-beacon"'), 'Root page contains #api-blink-beacon in UI top-nav');
    assert(rootRes.body.includes('id="syn-knowledge-modal"'), 'Root page contains #syn-knowledge-modal in DOM');
  } catch (err) {
    assert(false, `Root page error: ${err.message}`);
  }

  // Test 2: Standardized VST3 Host Quadrants (100% on port 8080)
  const quadrants = [
    { name: 'Quadrant I (0°-90°)', path: '/dsp-bridge', expected: 'DSP Bridge Active' },
    { name: 'Quadrant II (90°-180°)', path: '/daw-session-main/ch-1', expected: 'DAW Session Main Channel 1' },
    { name: 'Quadrant III (180°-270° Fixed Port 8080)', path: '/api/v2/quantum', expected: 'Quantum Module Active' },
    { name: 'Quadrant IV (270°-360°)', path: '/cymatic-bus/port-432', expected: 'Cymatic Bus Port 432' },
  ];

  for (const q of quadrants) {
    try {
      const res = await fetchUrl(q.path);
      assert(res.statusCode === 200, `${q.name} endpoint ${q.path} returns 200 OK`);
      assert(res.body.includes(q.expected), `${q.name} response payload confirms correct quadrant routing`);
      const json = JSON.parse(res.body);
      assert(json.api_blink && (json.api_blink.heartbeat_state === 'PULSE' || json.api_blink.heartbeat_state === 'REST'), `${q.name} includes live api_blink heartbeat state`);
    } catch (err) {
      assert(false, `${q.name} error: ${err.message}`);
    }
  }

  // Test 3: API Blink telemetry in core endpoints
  const blinkEndpoints = [
    '/audi?format=json',
    '/api/vst3/presets',
    '/api/ksom/metrics'
  ];

  for (const ep of blinkEndpoints) {
    try {
      const res = await fetchUrl(ep);
      assert(res.statusCode === 200, `Endpoint ${ep} returns 200 OK`);
      const data = JSON.parse(res.body);
      assert(data.api_blink !== undefined, `Endpoint ${ep} contains api_blink payload`);
      assert(data.api_blink.frequency_hz === 2.0, `Endpoint ${ep} api_blink pulses at 2.0 Hz`);
      assert(typeof data.api_blink.beat_count === 'number', `Endpoint ${ep} api_blink tracks beat_count`);
    } catch (err) {
      assert(false, `Blink endpoint ${ep} failed: ${err.message}`);
    }
  }

  // Test 4: Synthetic Knowledge Gap Identifier API
  try {
    const synRes = await fetchUrl('/api/syn-knowledge/gaps');
    assert(synRes.statusCode === 200, 'Synthetic Knowledge Gap API /api/syn-knowledge/gaps returns 200 OK');
    const synData = JSON.parse(synRes.body);
    assert(synData.audit_status === 'VERIFIED_ZERO_GAP', 'Audit status is VERIFIED_ZERO_GAP');
    assert(synData.total_gaps_detected === 0, 'Total synthetic knowledge gaps detected is 0');
    assert(Array.isArray(synData.domains) && synData.domains.length === 5, 'All 5 synthetic knowledge domains verified');
    console.log('\n  Audit Summary of Domains:');
    synData.domains.forEach(d => {
      console.log(`    • ${d.name}: ${d.status} (${d.verification})`);
    });
  } catch (err) {
    assert(false, `Synthetic Knowledge Gap API failed: ${err.message}`);
  }

  // Test 5: FITZ (formerly Fitzcapp) Sub-App & Live Beacon
  try {
    const ptRes = await fetchUrl('/fitz');
    assert(ptRes.statusCode === 200, 'FITZ endpoint /fitz returns 200 OK');
    assert(ptRes.body.includes('id="fitz-blink-container"') || ptRes.body.includes('id="fitzcapp-blink-container"'), 'Page contains blink container');
    assert(ptRes.body.includes('id="fitz-blink-dot"') || ptRes.body.includes('id="fitzcapp-blink-dot"'), 'Page contains blink dot');
  } catch (err) {
    assert(false, `FITZ sub-app check failed: ${err.message}`);
  }

  console.log(`\n=== RESULTS: ${passCount} / ${totalTests} TESTS PASSED ===\n`);
  if (passCount === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAudit().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
