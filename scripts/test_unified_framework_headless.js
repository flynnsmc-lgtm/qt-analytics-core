/**
 * scripts/test_unified_framework_headless.js
 * Headless test runner for Chi Key Unified Framework (#CK-TX-1A084A450FF)
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('================================================================');
console.log('🧪 TEST: CHI KEY UNIFIED FRAMEWORK HEADLESS SUITE');
console.log('HASH: #CK-TX-1A084A450FF | 12 ENGINES + 21 PILLARS');
console.log('================================================================\n');

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

// 1. Verify index.html contains the Slow-Refraction button
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
assert(html.includes('id="btn-slow-refraction"'), 'HTML contains #btn-slow-refraction button');
assert(html.includes('Slow-Refraction (12E+9P)'), 'Button text displays 12 Engines + 9 Pillars');

// 2. Verify style.css contains .btn-emerald
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
assert(css.includes('.btn-emerald'), 'CSS contains .btn-emerald styling');

// 3. Verify app.js integrates the Unified Framework
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
assert(js.includes('btnSlowRefraction'), 'app.js references btnSlowRefraction');
assert(js.includes('#CK-TX-1A084A450FF'), 'app.js references spec hash #CK-TX-1A084A450FF');
assert(js.includes('Generative-2026-08-16-Slow-Refraction'), 'app.js references patch name Slow-Refraction');
assert(js.includes('12 Surface Engines + 9 Deep Math Pillars = 21 Pillars'), 'app.js references 12E + 9P = 21P split');
assert(js.includes('A1_scattering') && js.includes('A6_indexed_fields'), 'app.js incorporates Deep Math equations A1-A6');

// 4. Verify standalone verification script runs and outputs valid telemetry
try {
  const output = execSync('node ' + path.join(__dirname, 'verify_unified_framework.js'), { encoding: 'utf8' });
  assert(output.includes('SPEC HASH: #CK-TX-1A084A450FF'), 'Verification script verifies spec hash #CK-TX-1A084A450FF');
  assert(output.includes('FLOW-THROUGH-NODE WITH FEEDBACK DUALITY VERIFIED'), 'Constraint C1 (Flow Duality) verified');
  assert(output.includes('GOLDEN THROAT RATIO 10/27 <==> 432 HZ BASE HARMONIC LOCKED'), 'Constraint C2 (Throat Invariant) verified');
  assert(output.includes('N1 x N2 ≈ N3 VERIFIED • 12 ENGINES + 9 HIDDEN PILLARS = 21 PILLARS EXACT'), 'Constraint C3 (Tensor Gatekeeper) verified');
  assert(output.includes('GENERATIVE / SELF-ORGANIZING HOMOMORPHISM VERIFIED'), 'Constraint C4 (Self-Organization) verified');
  assert(output.includes('UNIFIED TENSOR-GATE VERIFIED TELEMETRY SNAPSHOT'), 'Telemetry snapshot successfully emitted');
  assert(output.includes('DIGEST SEAL: SHA256:'), 'Cryptographic SHA-256 seal present');
} catch (err) {
  assert(false, 'Verification script execution failed: ' + err.message);
}

// 5. Verify existing tests still pass (no regressions)
try {
  const teamDeskOutput = execSync('node ' + path.join(__dirname, 'test_team_desk_headless.js'), { encoding: 'utf8' });
  assert(teamDeskOutput.includes('VERIFICATION COMPLETED SUCCESSFULLY'), 'test_team_desk_headless.js regression test passes');
} catch (err) {
  assert(false, 'test_team_desk_headless.js regression: ' + err.message);
}

try {
  const scaleSimOutput = execSync('node ' + path.join(__dirname, 'run_scale_simulation.js'), { encoding: 'utf8' });
  assert(scaleSimOutput.includes('ALL 6 SCALES COHERENT & CONTINUOUS'), 'run_scale_simulation.js regression test passes');
} catch (err) {
  assert(false, 'run_scale_simulation.js regression: ' + err.message);
}

console.log('\n================================================================');
console.log(`📊 SUMMARY: ${passCount} / ${passCount + failCount} TESTS PASSED (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
}
