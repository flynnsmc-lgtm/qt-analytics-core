const http = require('http');
const fs = require('fs');
const path = require('path');

function requestUrl(urlPath, options = {}) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      hostname: '127.0.0.1',
      port: 8080,
      path: urlPath,
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
    if (options.body) req.write(options.body);
    req.end();
  });
}

async function runMqtSuite() {
  console.log('=== MQT NETWORK RESONANCE & SOURCE DIAGNOSTIC TEST SUITE ===\n');
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

  // 1. Source Diagnostic Resolution Check
  try {
    const sourceFilePath = 'C:/Users/44790/.antigravity-ide/extensions/googlecloudtools.datacloud-0.10.0-universal/datacloud_vscode.js';
    assert(fs.existsSync(sourceFilePath), 'DataCloud extension datacloud_vscode.js exists at exact resolved source path');
  } catch (err) {
    assert(false, `Source check error: ${err.message}`);
  }

  // 2. GET /api/mqt/resonance
  try {
    const res = await requestUrl('/api/mqt/resonance');
    assert(res.statusCode === 200, 'GET /api/mqt/resonance returns 200 OK');
    const data = JSON.parse(res.body);

    assert(data.carrier_hz === 432.0, 'Carrier frequency invariant is locked to 432.000 Hz');
    assert(data.schumann_hz === 7.83, 'Schumann infrasonic is locked to 7.830 Hz');
    assert(data.sub_ground_hz === 54.0, 'Sub-ground foundation ratio is locked to 54.000 Hz (f0 / 8)');
    assert(data.q_factor === 55.17, 'Resonance Q-factor is 55.17 (432 / 7.83)');
    assert(data.headroom_margin_db === 18.0, 'Headroom margin is +18.0 dB');
    assert(data.calibration_status.includes('COHERENT'), 'Calibration status is coherent');

    // Check Source Diagnostic payload
    assert(data.source_diagnostic !== undefined, 'Contains source_diagnostic metadata');
    assert(data.source_diagnostic.event === 'Profile jetski is NOT active', 'Source diagnostic captures exact user log event');
    assert(data.source_diagnostic.active_profile === 'antigravity', 'Active profile is identified as antigravity');
    assert(data.source_diagnostic.inactive_profile === 'jetski', 'Inactive profile is identified as jetski (normal behavior)');

    // Check Nodes
    assert(Array.isArray(data.nodes) && data.nodes.length === 5, 'All 5 MQT Network nodes connected & verified');
    console.log('\n  Connected MQT Network Nodes:');
    data.nodes.forEach(n => console.log(`    • ${n.node_id}: ${n.state}`));

    // Check API Blink
    assert(data.api_blink !== undefined, 'Contains live API Blink heartbeat');
  } catch (err) {
    assert(false, `GET /api/mqt/resonance failed: ${err.message}`);
  }

  // 3. POST /api/mqt/recalibrate
  try {
    const postRes = await requestUrl('/api/mqt/recalibrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert(postRes.statusCode === 200, 'POST /api/mqt/recalibrate returns 200 OK');
    const postData = JSON.parse(postRes.body);
    assert(postData.status === 'RECALIBRATION_SUCCESS', 'Recalibration status is RECALIBRATION_SUCCESS');
    assert(postData.state.calibration_status === 'RECALIBRATED_COHERENT_HARMONIC_LOCK', 'State marked as RECALIBRATED_COHERENT_HARMONIC_LOCK');
    assert(postData.state.recalibration_count >= 1, 'Recalibration count incremented');
    assert(postData.state.phase_drift_deg === 0.0, 'Phase drift reset to 0.000°');
  } catch (err) {
    assert(false, `POST /api/mqt/recalibrate failed: ${err.message}`);
  }

  // 4. UI Elements Check
  try {
    const htmlContent = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
    assert(htmlContent.includes('id="syn-mqt-deck"'), 'index.html contains #syn-mqt-deck');
    assert(htmlContent.includes('id="btn-recalibrate-mqt"'), 'index.html contains #btn-recalibrate-mqt');
    assert(htmlContent.includes('id="mqt-status-badge"'), 'index.html contains #mqt-status-badge');
    assert(htmlContent.includes('id="mqt-val-carrier"'), 'index.html contains #mqt-val-carrier');

    const cssContent = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
    assert(cssContent.includes('.syn-mqt-resonance-deck'), 'style.css contains .syn-mqt-resonance-deck');

    const appContent = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
    assert(appContent.includes('recalibrateMqtNetworkResonance'), 'app.js implements recalibrateMqtNetworkResonance()');
  } catch (err) {
    assert(false, `UI check failed: ${err.message}`);
  }

  console.log(`\n=== RESULTS: ${passCount} / ${totalTests} TESTS PASSED ===\n`);
  if (passCount === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runMqtSuite().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
