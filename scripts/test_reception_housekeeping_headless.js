/**
 * scripts/test_reception_housekeeping_headless.js
 * ================================================================================
 * HEADLESS TEST SUITE: RECEPTION & HOUSEKEEPING CHECKLIST
 * Early Distribution Baseline Reset & Conformal Quaternion Vortex Grid
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { ReceptionHousekeepingEngine } = require('./reception_housekeeping_executor.js');

console.log('================================================================================');
console.log('🧪 TEST: RECEPTION & HOUSEKEEPING CHECKLIST HEADLESS SUITE');
console.log('================================================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${message}`);
    failCount++;
  }
}

const engine = new ReceptionHousekeepingEngine();

// 1. Phase 1: Safety & Lockdown
const backupPath = path.join(__dirname, 'reception_state_backup.json');
const p1 = engine.executePhase1SafetyLockdown(backupPath);
assert(fs.existsSync(backupPath), 'Phase 1: State backup reception_state_backup.json exists on disk');
const backupContent = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
assert(backupContent.lockdown_status.schumann_guard === 'PAUSED_FOR_CALIBRATION', 'Phase 1: Schumann Guard paused for calibration');
assert(backupContent.endpoints_verified.length === 4, 'Phase 1: 4 core API endpoints verified (/risk, /treasury, /mm, /physics)');
assert(backupContent.credentials_exposure_check === 'ZERO_EXPOSURE_CONFIRMED', 'Phase 1: Credentials exposure check verified');

// 2. Phase 2: Document & Agent Readiness
const p2 = engine.executePhase2ReadinessAudit();
assert(p2.documents_indexed.length === 4, 'Phase 2: 4 centralized docs indexed (Arkham, QT, Geometry, Math)');
assert(p2.agent_permissions.sandbox_rights === 'CONFIRMED_ALL_AGENTS', 'Phase 2: Sandbox rights confirmed for all agents');
assert(p2.agent_permissions.cache_protocol === 'O(1)_CABINET_INDEX_CACHE', 'Phase 2: O(1) Cabinet index cache protocol active');

// 3. Phase 3: Hypersphere & Vector Housekeeping Reset
const p3 = engine.executePhase3HousekeepingReset();
assert(Math.abs(p3.norm_reset.achieved - 100.00) < 1e-12, `Phase 3: Norm restored from 145.3 to exactly 100.00 (achieved = ${p3.norm_reset.achieved.toFixed(6)})`);
assert(p3.phase_slip_reset.achieved_rad < 0.08, `Phase 3: Phase slip corrected from 0.38 rad to < 0.08 rad (achieved = ${p3.phase_slip_reset.achieved_rad.toFixed(6)} rad)`);
assert(p3.coherence_reset.achieved >= 0.80, `Phase 3: Coherence restored to gamma >= 0.80 (achieved = ${p3.coherence_reset.achieved.toFixed(3)})`);
assert(p3.dual_anchors.schumann.includes('7.83 Hz'), 'Phase 3: Schumann anchor locked at 7.83 Hz');
assert(p3.dual_anchors.geomagnetic.includes('4817 nT (LOCKED)'), 'Phase 3: Geomagnetic anchor locked at 4817 nT');
assert(p3.pillars.pillar_01.status === 'CLEAR', 'Phase 3: Pillar #1 First-Principles Triangulation (ANOMALY -> CLEAR)');
assert(p3.pillars.pillar_02.status === 'CLEAR', 'Phase 3: Pillar #2 Signal-to-Noise Hyper-Filtration (ANOMALY -> CLEAR)');
assert(p3.diagnostics.all_green === true, 'Phase 3: Diagnostics (Entropy, Topology, Spectral, Spacing) all green');

// 4. Phase 4: Conformal Quaternion Vortex Grid
const p4 = engine.executePhase4ConformalVortexGrid();
assert(p4.identity_quaternion === '1.00 + 0.00i + 0.00j + 0.00k', `Phase 4: Conformal grid identity label certified: ${p4.identity_quaternion}`);
assert(p4.is_pure_identity === true, 'Phase 4: Pure identity quaternion q = (1, 0, 0, 0)');
assert(p4.poles_verified.length === 3, 'Phase 4: 3 key quaternion poles mapped (-1, -i, -j)');
assert(p4.identity_distortion < 1e-14, 'Phase 4: Zero metric distortion on identity manifold');

// 5. Phase 5: Re-arming Management Axis
const p5 = engine.executePhase5Rearm();
assert(p5.horizons.horizon_1h.status === 'ACTIVE', 'Phase 5: Horizon-1h Schumann Guard RE-ARMED (ACTIVE)');
assert(p5.horizons.horizon_24h.status === 'ARMED', 'Phase 5: Horizon-24h Bounty Sink RE-ARMED (ARMED)');
assert(p5.horizons.horizon_7d.status === 'ACTIVE', 'Phase 5: Horizon-7d Liquidity Re-center RE-ARMED (ACTIVE)');
assert(p5.horizons.horizon_30d.status === 'STANDBY', 'Phase 5: Horizon-30d Floor Defense RE-ARMED (STANDBY)');
assert(p5.digest_seal.includes('ALIGNED-SEALED'), 'Phase 5: Cryptographic digest seal verified');

// 6. Cross-Platform Regression Tests
try {
  const pyHousekeeping = execSync('python ' + path.join(__dirname, 'reception_housekeeping_executor.py'), { encoding: 'utf8' });
  assert(pyHousekeeping.includes('19 / 19 CHECKS PASSED (100.0%)'), 'Python reception_housekeeping_executor.py passes 19/19 checks');
} catch (err) {
  assert(false, 'Python housekeeping executor failed: ' + err.message);
}

try {
  const quatOutput = execSync('node ' + path.join(__dirname, 'test_quaternion_matrix_headless.js'), { encoding: 'utf8' });
  assert(quatOutput.includes('23 / 23 TESTS PASSED (100.0%)'), 'test_quaternion_matrix_headless.js regression passes');
} catch (err) {
  assert(false, 'test_quaternion_matrix_headless.js regression failed: ' + err.message);
}

try {
  const acropolisOutput = execSync('node ' + path.join(__dirname, 'test_acropolis_headless.js'), { encoding: 'utf8' });
  assert(acropolisOutput.includes('55 / 55 TESTS PASSED (100.0%)'), 'test_acropolis_headless.js regression passes');
} catch (err) {
  assert(false, 'test_acropolis_headless.js regression failed: ' + err.message);
}

console.log('\n================================================================================');
console.log(`📊 SUMMARY: ${passCount} / ${passCount + failCount} TESTS PASSED (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
console.log('================================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
