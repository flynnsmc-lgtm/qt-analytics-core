/**
 * test_hardened_pillars.js
 * Comprehensive automated verification for:
 * 1. Hardened Pillars of Truth (Fox >= 2, Moorov > 3.0, Howden Identity Match)
 * 2. Pure Mathematical Invariant formulation (Scottish law isolated)
 * 3. One-Way Isolating Channel (Read-only for law, upward write blocked with 403 Breach Alert)
 * 4. Holography Engine Wavelength Compression (Curvature kappa = k^2, ratio lambda1/lambda2 invariant)
 * 5. QT Model Observatory Telemetry Stream & Breach Logger
 * 6. Master Controller: Fitzcapp
 */

const http = require('http');

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const opts = { ...options };
    opts.headers = opts.headers ? { ...opts.headers } : {};
    let body = null;
    if (postData) {
      body = typeof postData === 'string' ? postData : JSON.stringify(postData);
      opts.headers['Content-Length'] = Buffer.byteLength(body);
      if (!opts.headers['Content-Type']) {
        opts.headers['Content-Type'] = 'application/json';
      }
    }
    const req = http.request(opts, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(body);
    }
    req.end();
  });
}

let passedAssertions = 0;
let totalAssertions = 0;

function assert(condition, message) {
  totalAssertions++;
  if (condition) {
    passedAssertions++;
    console.log(`  ✅ [PASS] ${message}`);
  } else {
    console.error(`  ❌ [FAIL] ${message}`);
  }
}

async function runTests() {
  console.log("================================================================================");
  console.log("🔒 PILLARS OF TRUTH — ZERO-CONFIG HARDENED TEST SUITE");
  console.log("   Protocol: FITZ-VST3-Physics/1.0.0-HARDENED");
  console.log("   Authority: Master Control - Fitzcapp");
  console.log("================================================================================\n");

  try {
    // ── TEST 1: Moorov Diagnostic Endpoint ──
    console.log("📡 [TEST 1] GET /api/moorov/diagnostic — Locked Strict Invariant");
    const moorovRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/moorov/diagnostic',
      method: 'GET'
    });
    assert(moorovRes.status === 200, "Moorov diagnostic returns HTTP 200");
    assert(moorovRes.data.master_control === "Fitzcapp", "Master Control bound to Fitzcapp");
    assert(moorovRes.data.invariants.MOOROV_RATIO_THRESHOLD === 3.0, "Moorov ratio constant strictly 3.0");
    assert(moorovRes.data.invariants.MOOROV_OPERATOR === ">", "Moorov operator strictly '>' (not >=)");
    assert(moorovRes.data.invariants.FOX_MIN_INDEPENDENT_VECTORS === 2, "Fox minimum vectors locked at 2");
    assert(moorovRes.data.invariants.HOWDEN_IDENTITY_REQUIRES_EXACT_MATCH === true, "Howden identity requires exact match");

    // ── TEST 2: QT Model Observatory Telemetry Stream ──
    console.log("\n🔭 [TEST 2] GET /api/qt-observatory/telemetry — Telemetry Broadcast");
    const obsRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/qt-observatory/telemetry',
      method: 'GET'
    });
    assert(obsRes.status === 200, "QT Observatory returns HTTP 200");
    assert(obsRes.data.observatory === "QT_MODEL_OBSERVATORY", "Observatory target is QT_MODEL_OBSERVATORY");
    assert(obsRes.data.protocol.includes("VST3-Physics") || obsRes.data.protocol.includes("FITZ"), "Protocol is FITZ/Fitzcapp VST3 Physics");
    assert(obsRes.data.enforcement === "ZERO-CONFIG", "Enforcement is ZERO-CONFIG");
    assert(obsRes.data.telemetry_stream.lambda_ratio !== undefined, "Telemetry stream contains lambda_ratio");
    assert(obsRes.data.telemetry_stream.phi_score !== undefined, "Telemetry stream contains phi_score");
    assert(obsRes.data.telemetry_stream.channel_integrity !== undefined, "Telemetry stream contains channel_integrity");

    // ── TEST 3: One-Way Isolating Channel — Read-Only Invariant Projection ──
    console.log("\n🔌 [TEST 3] GET /api/isolating-channel — Read-Only Invariant Projection");
    const chanRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/isolating-channel',
      method: 'GET'
    });
    assert(chanRes.status === 200, "Isolating channel returns HTTP 200");
    assert(chanRes.data.isolation_channel === "ONE_WAY_READ_ONLY", "Channel mode is ONE_WAY_READ_ONLY");
    assert(chanRes.data.direction === "PILLARS → LAW ONLY", "Channel direction is strictly PILLARS → LAW ONLY");
    assert(chanRes.data.upward_writes_allowed === false, "Upward writes strictly disallowed");
    assert(chanRes.data.hardened_invariants.moorov_ratio_threshold === 3.0, "Hardened Moorov threshold projected as 3.0");

    // ── TEST 4: One-Way Isolating Channel — Valid Evidence Evaluation ──
    console.log("\n⚖️ [TEST 4] POST /api/isolating-channel — Valid Corroboration Evidence");
    const validEval = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/isolating-channel',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      vectors: 3,
      lambda1: 3.45,
      lambda2: 1.0,
      identity_match: true,
      T: 1.0,
      delta: 0.05
    });
    assert(validEval.status === 200, "Evidence evaluation returns HTTP 200");
    assert(validEval.data.evaluation.fox_pillar.passed === true, "Fox pillar passed (3 >= 2)");
    assert(validEval.data.evaluation.moorov_pillar.passed === true, "Moorov pillar passed (3.45 > 3.0)");
    assert(validEval.data.evaluation.howden_pillar.passed === true, "Howden pillar passed (exact identity)");
    assert(validEval.data.evaluation.gate_open === true, "Gate open (all 3 passed)");
    assert(validEval.data.evaluation.phi_corroboration >= 0.7, `Φ corroboration is ${validEval.data.evaluation.phi_corroboration} (>= 0.7)`);
    assert(validEval.data.evaluation.corroboration_confirmed === true, "Corroboration confirmed");

    // ── TEST 5: One-Way Isolating Channel — Failing Gate Logic ──
    console.log("\n🚪 [TEST 5] POST /api/isolating-channel — Gate Logic (Any zero -> Φ = 0)");
    const failEval = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/isolating-channel',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      vectors: 1, // Fails Fox (1 < 2)
      lambda1: 3.45,
      lambda2: 1.0,
      identity_match: true
    });
    assert(failEval.status === 200, "Failing evidence returns HTTP 200");
    assert(failEval.data.evaluation.fox_pillar.passed === false, "Fox pillar failed (1 < 2)");
    assert(failEval.data.evaluation.gate_open === false, "Gate closed (1 of 3 failed)");
    assert(failEval.data.evaluation.phi_corroboration === 0.0, "Φ strictly collapses to 0.0");
    assert(failEval.data.evaluation.corroboration_confirmed === false, "Corroboration not confirmed");

    // ── TEST 6: One-Way Isolating Channel — Breach Attempt Blocked (HTTP 403) ──
    console.log("\n🚨 [TEST 6] POST /api/isolating-channel — Upward Write Breach Attempt Interception");
    const breachAttempt = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/isolating-channel',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      moorov_threshold: 2.9, // Attempted alteration of Moorov constant!
      alter_constant: true
    });
    assert(breachAttempt.status === 403, "Breach attempt returns HTTP 403 Forbidden");
    assert(breachAttempt.data.status === "BLOCKED_BREACH_ALERT", "Status is BLOCKED_BREACH_ALERT");
    assert(breachAttempt.data.action_taken === "PROTOCOL_LOCKDOWN", "Action taken is PROTOCOL_LOCKDOWN");
    assert(breachAttempt.data.alert_routed_to === "QT_MODEL_OBSERVATORY", "Alert routed directly to QT_MODEL_OBSERVATORY");

    // Verify breach was recorded in Observatory
    const obsPostBreach = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/qt-observatory/telemetry',
      method: 'GET'
    });
    assert(obsPostBreach.data.telemetry_stream.breach_events_count >= 1, "Breach recorded in QT Observatory telemetry stream");

    // ── TEST 7: Holography Engine Wavelength Compression ──
    console.log("\n🌌 [TEST 7] POST /api/holography/compress — Curvature Without Ratio Change");
    const holoRes = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/api/holography/compress',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      k: 2.5
    });
    assert(holoRes.status === 200, "Holography compression returns HTTP 200");
    assert(holoRes.data.status === "COMPRESSION_APPLIED", "Compression applied");
    assert(holoRes.data.compression_factor_k === 2.5, "Compression factor k = 2.5");
    assert(holoRes.data.spacetime_curvature_metric === 6.25, "Spacetime curvature metric kappa = k^2 = 6.25");
    assert(holoRes.data.ratio_invariant_preserved === true, "Ratio invariant preserved under curvature");
    assert(holoRes.data.truth_statement === "You may bend the space. You may NOT bend the truth.", "Truth statement verified");

    // ── TEST 8: VST3 Bridge Handshake — Hardened Protocol ──
    console.log("\n🎛️ [TEST 8] POST /dsp-bridge/vst3 — Handshake Protocol Verification");
    const v3Handshake = await makeRequest({
      hostname: 'localhost',
      port: 8080,
      path: '/dsp-bridge/vst3',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      action: "handshake"
    });
    assert(v3Handshake.status === 200, "VST3 Handshake returns HTTP 200");
    assert(v3Handshake.data.protocol.includes("VST3-Physics") || v3Handshake.data.protocol.includes("FITZ"), "Protocol is FITZ/Fitzcapp VST3 Physics");
    assert(v3Handshake.data.enforcement === "ZERO-CONFIG", "Enforcement is ZERO-CONFIG");
    assert(v3Handshake.data.master_controller === "Fitzcapp", "Master Controller is Fitzcapp");

    console.log("\n================================================================================");
    console.log(`🏁 SUMMARY: ${passedAssertions} / ${totalAssertions} assertions passed (${((passedAssertions/totalAssertions)*100).toFixed(1)}%)`);
    if (passedAssertions === totalAssertions) {
      console.log("🔒 ALL PILLARS OF TRUTH & HARDENED DIRECTIVES 100% VERIFIED!");
    } else {
      console.log("⚠️ SOME ASSERTIONS FAILED.");
      process.exit(1);
    }
    console.log("================================================================================");
  } catch (err) {
    console.error("Test runner error:", err);
    process.exit(1);
  }
}

runTests();
