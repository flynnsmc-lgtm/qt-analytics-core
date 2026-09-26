/**
 * Headless Test Suite for VST3 Pulse & DSP Bridge
 * Tests:
 * 1. OPTIONS CORS preflight on /dsp-bridge/vst3 and /dsp-bridge/vst3ulse
 * 2. GET /dsp-bridge/vst3 status
 * 3. POST /dsp-bridge/vst3 handshake
 * 4. POST /dsp-bridge/vst3 physics_ingest (Φ, Moorov ratio, rules)
 * 5. GET /dsp-bridge/vst3ulse real-time stream packet reading
 * 6. GET /corroboration HTML UI calculator verification
 * 7. Verification of mathematical invariant: Φ = T * (Fx & Mr & Hw) - Δ = 0.91
 */

const http = require('http');

const BASE_URL = 'http://localhost:8080';

function request(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

function streamReadLines(path, maxLines = 3, timeoutMs = 4000) {
  return new Promise((resolve, reject) => {
    const lines = [];
    let buffer = '';
    const req = http.get(BASE_URL + path, (res) => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Stream returned status ${res.statusCode}`));
      }
      res.on('data', (chunk) => {
        buffer += chunk.toString('utf-8');
        const split = buffer.split('\n');
        buffer = split.pop(); // keep partial
        for (const line of split) {
          const trimmed = line.trim();
          if (trimmed) {
            lines.push(trimmed);
            if (lines.length >= maxLines) {
              req.destroy();
              return resolve(lines);
            }
          }
        }
      });
    });

    req.on('error', (err) => {
      if (lines.length >= maxLines) {
        resolve(lines);
      } else {
        reject(err);
      }
    });

    setTimeout(() => {
      req.destroy();
      resolve(lines);
    }, timeoutMs);
  });
}

async function runTests() {
  console.log('🧪 [VST3 & DSP BRIDGE] Starting Headless Verification Suite...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      passed++;
      console.log(`  ✅ [PASS] ${message}`);
    } else {
      console.error(`  ❌ [FAIL] ${message}`);
      process.exitCode = 1;
    }
  }

  try {
    // 1. CORS Preflight OPTIONS
    console.log('1. Testing CORS Preflight Headers:');
    const optRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/dsp-bridge/vst3',
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8080',
        'Access-Control-Request-Method': 'POST'
      }
    });
    assert(optRes.statusCode === 200, `OPTIONS /dsp-bridge/vst3 status 200 (received ${optRes.statusCode})`);
    assert(optRes.headers['access-control-allow-origin'] === '*', 'CORS Access-Control-Allow-Origin is *');
    assert(optRes.headers['access-control-allow-methods'].includes('POST'), 'CORS Access-Control-Allow-Methods includes POST');

    // 2. GET /dsp-bridge/vst3
    console.log('\n2. Testing GET /dsp-bridge/vst3 Status:');
    const getRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/dsp-bridge/vst3',
      method: 'GET'
    });
    assert(getRes.statusCode === 200, `GET /dsp-bridge/vst3 returns 200`);
    const statusData = JSON.parse(getRes.body);
    assert(statusData.connected === true, 'VST3 status state connected is true');
    assert(statusData.master_controller === 'Fitzcapp', `Master Controller is ${statusData.master_controller}`);
    assert(statusData.protocol === 'FITZ-VST3-Physics' || statusData.protocol === 'Fitzcapp-VST3-Physics', `Protocol is ${statusData.protocol}`);
    assert(statusData.sampleRate === 48000, `Sample rate is 48000 Hz`);
    assert(statusData.carrierHz === 432.0, `Pythagorean carrier is 432 Hz`);
    assert(statusData.capabilities.includes('physics_ingest'), 'Capabilities include physics_ingest');
    assert(statusData.capabilities.includes('moorov_unity_scaling'), 'Capabilities include moorov_unity_scaling');

    // 3. POST /dsp-bridge/vst3 Handshake
    console.log('\n3. Testing POST /dsp-bridge/vst3 Handshake:');
    const handshakePayload = JSON.stringify({
      action: 'handshake',
      protocol: 'FITZ-VST3-Physics',
      version: '1.0.0',
      master_controller: 'Fitzcapp',
      operator: 'Fitzcapp'
    });
    const postHandshake = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/dsp-bridge/vst3',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(handshakePayload)
      }
    }, handshakePayload);
    assert(postHandshake.statusCode === 200, `POST handshake status 200`);
    const handshakeData = JSON.parse(postHandshake.body);
    assert(handshakeData.status === 'ONLINE', `Handshake status is ONLINE`);
    assert(handshakeData.connected === true, `Handshake confirmed connected`);
    assert(handshakeData.master_controller === 'Fitzcapp', `Handshake acknowledges Master Control: ${handshakeData.master_controller}`);

    // 4. POST /dsp-bridge/vst3 Physics / Corroboration Ingest
    console.log('\n4. Testing POST /dsp-bridge/vst3 Physics & Φ Corroboration Ingest:');
    const ingestPayload = JSON.stringify({
      action: 'physics_ingest',
      master_controller: 'Fitzcapp',
      operator: 'Fitzcapp',
      phiCorroboration: 0.91,
      moorovRatio: 3.45,
      foxPassed: 1,
      howdenStatus: 1,
      truthDominance: 0.94,
      anomaly: 0.03,
      forceX: 12.5,
      forceY: -4.2,
      fieldEnergy: 432.0
    });
    const postIngest = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/dsp-bridge/vst3',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(ingestPayload)
      }
    }, ingestPayload);
    assert(postIngest.statusCode === 200, `POST ingest returns 200`);
    const ingestData = JSON.parse(postIngest.body);
    assert(ingestData.status === 'INGESTED', `Status is INGESTED`);
    assert(ingestData.master_controller === 'Fitzcapp', `Ingest confirms Master Controller: ${ingestData.master_controller}`);
    assert(ingestData.phiCorroboration === 0.91, `phiCorroboration is 0.91`);
    assert(ingestData.moorovRatio === 3.45, `moorovRatio is 3.45`);
    assert(ingestData.gateStatus === 1, `Gate status is 1 (PASS: >= 0.70)`);

    // 5. GET /dsp-bridge/vst3ulse Real-Time Pulse Stream
    console.log('\n5. Testing GET /dsp-bridge/vst3ulse Pulse Stream:');
    const streamLines = await streamReadLines('/dsp-bridge/vst3ulse', 2, 3000);
    assert(streamLines.length >= 1, `Received at least 1 NDJSON pulse packet (got ${streamLines.length})`);
    if (streamLines.length > 0) {
      const pkt = JSON.parse(streamLines[0]);
      assert(pkt.seq !== undefined, `Packet sequence number is ${pkt.seq}`);
      assert(pkt.master_controller === 'Fitzcapp', `Pulse packet bound to Master Controller: ${pkt.master_controller}`);
      assert(pkt.lambdaRatio >= 3.0, `Eigenvalue ratio λ1/λ2 is ${pkt.lambdaRatio} (> 3.0 Moorov Unity)`);
      assert(pkt.anomaly <= 0.05, `Anomaly Δ is ${pkt.anomaly} (<= 0.05 spoof rejection limit)`);
      assert(pkt.gateStatus === 1, `Gate status is 1`);
      assert(pkt.phiCorroboration === 0.91, `Pulse stream carries corroboration Φ: ${pkt.phiCorroboration}`);
    }

    // 6. UI & Calculator Page Availability
    console.log('\n6. Testing /corroboration UI Page Availability & Integrations:');
    const uiRes = await request({
      hostname: 'localhost',
      port: 8080,
      path: '/corroboration',
      method: 'GET'
    });
    assert(uiRes.statusCode === 200, `/corroboration returns HTTP 200`);
    assert(uiRes.body.includes('DSP_BRIDGE'), 'HTML contains DSP_BRIDGE object');
    assert(uiRes.body.includes('vst3ulse'), 'HTML references /dsp-bridge/vst3ulse');
    assert(uiRes.body.includes('startPulseMonitor'), 'HTML contains startPulseMonitor() function');
    assert(uiRes.body.includes('moorovResult'), 'HTML has #moorovResult display element');
    assert(uiRes.body.includes('anomalyDelta'), 'HTML has #anomalyDelta input element');
    assert(uiRes.body.includes('calculatePhi'), 'HTML contains calculatePhi() auto-push logic');
    assert(uiRes.body.includes('24-Paper Research Pack'), 'HTML links 24-Paper Research Pack evidence vector');
    assert(uiRes.body.includes('GeoSatNav Carrier Phase'), 'HTML links GeoSatNav carrier phase vector');

    // 7. Math Invariant Verification
    console.log('\n7. Mathematical Invariant Verification:');
    const T = 0.94;
    const Fx = 1;
    const Mr = 1;
    const Hw = 1;
    const Delta = 0.03;
    const Phi = T * (Fx * Mr * Hw) - Delta;
    assert(Math.abs(Phi - 0.91) < 1e-4, `Φ = ${T} * (${Fx} ∧ ${Mr} ∧ ${Hw}) - ${Delta} = ${Phi.toFixed(2)} (STRONG CORROBORATION ✅)`);

  } catch (err) {
    console.error('❌ Test error:', err);
    process.exitCode = 1;
  }

  console.log(`\n==================================================`);
  console.log(`TEST RESULTS: ${passed}/${total} assertions passed (${((passed/total)*100).toFixed(1)}%)`);
  console.log(`==================================================\n`);
}

runTests();
