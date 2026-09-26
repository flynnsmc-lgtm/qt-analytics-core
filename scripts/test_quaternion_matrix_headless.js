/**
 * scripts/test_quaternion_matrix_headless.js
 * ================================================================================
 * HEADLESS TEST SUITE: HYPERSPHERE QUATERNION & MATRIX MULTIPLICATION REWORK
 * Phase 3 & Phase 4 Verification: SO(3) Orthogonal Stack & Operations Horizons
 * ================================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const {
  UnitQuaternion,
  HypersphereManifold,
  multiplyMatrixVector,
  multiplyMatrices,
  matrixDeterminant,
  vectorNorm
} = require('./hypersphere_quaternion_engine.js');

console.log('================================================================================');
console.log('🧪 TEST: HYPERSPHERE QUATERNION & MATRIX REWORK HEADLESS SUITE');
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

// 1. Unit Quaternion Normalization
const qRaw = new UnitQuaternion(3.0, 4.0, 0.0, 0.0);
const magQ = Math.sqrt(qRaw.w ** 2 + qRaw.x ** 2 + qRaw.y ** 2 + qRaw.z ** 2);
assert(Math.abs(magQ - 1.0) < 1e-15, 'Quaternion normalizes strictly to unit magnitude (|q| = 1.0)');

// 2. Non-Commutative Hamilton Product
const q1 = UnitQuaternion.fromAxisAngle([1.0, 0.0, 0.0], Math.PI / 2.0);
const q2 = UnitQuaternion.fromAxisAngle([0.0, 1.0, 0.0], Math.PI / 2.0);
const prod12 = q1.multiply(q2);
const prod21 = q2.multiply(q1);
const arr12 = prod12.toArray();
const arr21 = prod21.toArray();
const diff12 = Math.sqrt(arr12.reduce((acc, val, i) => acc + (val - arr21[i]) ** 2, 0));
assert(diff12 > 0.1, `Hamilton product is non-commutative (composition difference = ${diff12.toFixed(4)})`);

// 3. Orthogonal Matrix Properties (R^T R = I, det(R) = +1.0)
const R1 = q1.toRotationMatrix();
const detR1 = matrixDeterminant(R1);
assert(Math.abs(detR1 - 1.0) < 1e-12, `Special Orthogonal certified: det(R) = +1.000000 (det = ${detR1.toFixed(12)})`);

// Test R^T R = I
let orthResidual = 0;
for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    let dot = 0;
    for (let k = 0; k < 3; k++) {
      dot += R1[k][i] * R1[k][j]; // R^T[i][k] * R[k][j]
    }
    const expected = (i === j) ? 1.0 : 0.0;
    orthResidual += Math.abs(dot - expected);
  }
}
assert(orthResidual < 1e-12, `Orthogonality certified: R^T R = I (residual = ${orthResidual.toExponential(2)})`);

// 4. Metric Invariance (||v'|| = ||v||)
const vOrig = [42.0, -73.5, 108.2];
const normOrig = vectorNorm(vOrig);
const vRotQuat = q1.rotateVector(vOrig);
const normQuat = vectorNorm(vRotQuat);
const vRotMat = multiplyMatrixVector(R1, vOrig);
const normMat = vectorNorm(vRotMat);

assert(Math.abs(normQuat - normOrig) < 1e-12, `Quaternion rotation preserves vector norm: ${normOrig.toFixed(6)} -> ${normQuat.toFixed(6)}`);
assert(Math.abs(normMat - normOrig) < 1e-12, `SO(3) matrix multiplication preserves vector norm: ${normOrig.toFixed(6)} -> ${normMat.toFixed(6)}`);

const quatMatDiff = vectorNorm([
  vRotQuat[0] - vRotMat[0],
  vRotQuat[1] - vRotMat[1],
  vRotQuat[2] - vRotMat[2]
]);
assert(quatMatDiff < 1e-12, `Quaternion conjugation and SO(3) matrix multiplication yield identical vectors (diff = ${quatMatDiff.toExponential(2)})`);

// 5. Round-Trip Inversion Error (v -> rotate -> invert -> v error -> 0)
const q1Inv = q1.conjugate();
const vRestored = q1Inv.rotateVector(vRotQuat);
const roundTripError = vectorNorm([
  vRestored[0] - vOrig[0],
  vRestored[1] - vOrig[1],
  vRestored[2] - vOrig[2]
]);
assert(roundTripError < 1e-12, `Round-trip inversion error < 1e-12: error = ${roundTripError.toExponential(2)}`);

// 6. Compound Transform Order (Right-to-Left / Local-to-Global)
const R2 = q2.toRotationMatrix();
const vCompoundQuat = q1.multiply(q2).rotateVector(vOrig);
const R_compound = multiplyMatrices(R1, R2);
const vCompoundMat = multiplyMatrixVector(R_compound, vOrig);
const compDiff = vectorNorm([
  vCompoundQuat[0] - vCompoundMat[0],
  vCompoundQuat[1] - vCompoundMat[1],
  vCompoundQuat[2] - vCompoundMat[2]
]);
assert(compDiff < 1e-12, `Compound transform right-to-left order matches matrix multiplication stack (diff = ${compDiff.toExponential(2)})`);

// 7. Hypersphere Projection Target Norm ||x|| = 100.0
const manifold = new HypersphereManifold(100.0);
const vProj = manifold.project3D(vRotQuat);
const projNorm = vectorNorm(vProj);
assert(Math.abs(projNorm - 100.0) < 1e-12, `Hypersphere 3D target norm locked to 100.0: ||x|| = ${projNorm.toFixed(12)}`);

const X4D = manifold.project4DQuaternion(q1);
const norm4D = Math.sqrt(X4D.reduce((acc, c) => acc + c * c, 0));
assert(Math.abs(norm4D - 100.0) < 1e-12, `Hypersphere 4D S³ embedding target norm locked to 100.0: ||X|| = ${norm4D.toFixed(12)}`);

// 8. Schumann Resonance Lock & Phase Guard
const schumannTelemetry = manifold.verifySchumannLock(432.0, 7.83);
assert(schumannTelemetry.schumannLock === 'LOCKED', `Schumann lock coherent at 432 Hz carrier (ratio = ${schumannTelemetry.harmonicRatio.toFixed(4)})`);
assert(schumannTelemetry.phaseSlipRad < 0.002, `Phase slip guard active (< 0.002 rad fence threshold, slip = ${schumannTelemetry.phaseSlipRad.toFixed(6)} rad)`);

// 9. Management Horizons Audit
const horizons = manifold.horizons;
assert(horizons.horizon_1h.status === 'ACTIVE', 'Horizon-1h Schumann Phase Slip Guard is ACTIVE');
assert(horizons.horizon_24h.status === 'ARMED', 'Horizon-24h Intel Bounty Sink is ARMED');
assert(horizons.horizon_7d.status === 'ACTIVE', 'Horizon-7d Liquidity Re-center is ACTIVE ($2.25 - $2.88)');
assert(horizons.horizon_30d.status === 'STANDBY', 'Horizon-30d Macro Floor Defense is STANDBY');

// 10. Canonical JSON Verification
const jsonPath = path.join(__dirname, 'hypersphere_quaternion_matrix.json');
assert(fs.existsSync(jsonPath), 'Canonical JSON hypersphere_quaternion_matrix.json exists');
const jsonConfig = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
assert(jsonConfig.geometry.norm_target === 100.0, 'Canonical JSON specifies norm_target = 100.0');
assert(jsonConfig.resonance.schumann_hz === 7.83, 'Canonical JSON specifies schumann_hz = 7.83');

// 11. Python Engine Direct Verification
try {
  const pyOutput = execSync('python ' + path.join(__dirname, 'hypersphere_quaternion_engine.py'), { encoding: 'utf8' });
  assert(pyOutput.includes('17 / 17 TESTS PASSED (100.0%)'), 'Python hypersphere_quaternion_engine.py passes 17/17 tests');
} catch (err) {
  assert(false, 'Python engine execution failed: ' + err.message);
}

// 12. Regression Test Verification across existing suites
try {
  const acropolisOutput = execSync('node ' + path.join(__dirname, 'test_acropolis_headless.js'), { encoding: 'utf8' });
  assert(acropolisOutput.includes('55 / 55 TESTS PASSED (100.0%)'), 'test_acropolis_headless.js passes with 100%');
} catch (err) {
  assert(false, 'test_acropolis_headless.js regression failed: ' + err.message);
}

try {
  const molecularOutput = execSync('node ' + path.join(__dirname, 'test_molecular_midi_headless.js'), { encoding: 'utf8' });
  assert(molecularOutput.includes('100 / 100 TESTS PASSED (100.0%)'), 'test_molecular_midi_headless.js passes with 100%');
} catch (err) {
  assert(false, 'test_molecular_midi_headless.js regression failed: ' + err.message);
}

console.log('\n================================================================================');
console.log(`📊 SUMMARY: ${passCount} / ${passCount + failCount} TESTS PASSED (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
console.log('================================================================================\n');

if (failCount > 0) {
  process.exit(1);
}
