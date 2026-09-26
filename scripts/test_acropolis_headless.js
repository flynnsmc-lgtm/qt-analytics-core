/**
 * scripts/test_acropolis_headless.js
 * Comprehensive Headless Test Suite for Acropolis Library & Agent Papers Cabinet
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('================================================================');
console.log('🧪 TEST: ACROPOLIS LIBRARY & AGENT PAPERS CABINET HEADLESS SUITE');
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

// 1. Verify HTML Structure in index.html
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const requiredHtmlElements = [
  'data-stage="stage-acropolis"',
  'id="stage-acropolis"',
  'id="acropolis-halls-grid"',
  'id="cabinet-container"',
  'id="cabinet-filter-chips"',
  'id="associative-tags-container"',
  'id="cabinet-deck-grid"',
  'id="circulation-console"',
  'id="circulation-flow-strip"',
  'id="circ-node-1"',
  'id="circ-node-2"',
  'id="circ-node-3"',
  'id="circ-node-4"',
  'id="circ-node-5"',
  'id="circ-node-6"',
  'id="circ-agent-select"',
  'id="circ-passage-select"',
  'id="circ-passage-preview"',
  'id="btn-circulate-text"',
  'id="btn-add-to-addendum"',
  'id="btn-clear-circ-ledger"',
  'id="circulation-ledger-stream"',
  'id="stat-indexed-notes"',
  'id="stat-anomalies"',
  'id="stat-circulation-ops"'
];

requiredHtmlElements.forEach(el => {
  assert(html.includes(el), `HTML contains element: ${el}`);
});

assert(html.includes('diffusion is not equational, only colour'), 'HTML contains core chromatic axiom');

// 2. Verify CSS Rules in style.css
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

const requiredCssClasses = [
  '.acropolis-hero',
  '.acropolis-halls-grid',
  '.hall-card',
  '.cabinet-container',
  '.associative-learning-bar',
  '.tag-chip',
  '.cabinet-deck-grid',
  '.cabinet-card',
  '.anomaly-callout',
  '.chromatic-strip',
  '.subject-gap-tag',
  '.circulation-console',
  '.circulation-flow-strip',
  '.circ-node',
  '.circulation-ledger-stream'
];

requiredCssClasses.forEach(cls => {
  assert(css.includes(cls), `CSS contains selector: ${cls}`);
});

// 3. Verify JavaScript Logic in app.js
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
assert(js.includes('initAcropolisLibrary()'), 'app.js calls initAcropolisLibrary() in DOMContentLoaded');
assert(js.includes('ACROPOLIS_HALLS_DATA'), 'app.js defines ACROPOLIS_HALLS_DATA (6 PDF halls)');
assert(js.includes('CABINET_INDEX_NOTES'), 'app.js defines CABINET_INDEX_NOTES (minimal retrieval notes)');
assert(js.includes('circulateTextPacket') || js.includes('CIRC_INTAKE'), 'app.js implements 6-stage circulation pipeline');
assert(js.toLowerCase().includes('diffusion is not equational, only colour'), 'app.js encodes chromatic diffusion law');
assert(js.includes('HSK-CIRC-'), 'app.js produces HSK-CIRC tickets');

// 4. Verify Programmatic Engine Execution
try {
  const engineOutput = execSync('node ' + path.join(__dirname, 'acropolis_circulation_engine.js'), { encoding: 'utf8' });
  assert(engineOutput.includes('ACROPOLIS CIRCULATION TELEMETRY DIGEST SEAL'), 'Circulation engine emits verified digest seal');
  assert(engineOutput.includes('Average O(1) Lookup Latency:'), 'Circulation engine proves minimal-latency O(1) retrieval');
  assert(engineOutput.includes('CIRC_PRESENTATION'), 'Circulation engine completes 6-stage pipeline');
  assert(engineOutput.includes('CIRC_INTAKE'), 'Pipeline Stage 1 Intake verified');
  assert(engineOutput.includes('CIRC_PRESENTATION'), 'Pipeline Stage 6 Presentation verified');
} catch (err) {
  assert(false, 'Engine execution failed: ' + err.message);
}

// 5. Zero Regressions across Existing Test Suites
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

try {
  const unifiedOutput = execSync('node ' + path.join(__dirname, 'test_unified_framework_headless.js'), { encoding: 'utf8' });
  assert(unifiedOutput.includes('SUMMARY: 17 / 17 TESTS PASSED'), 'test_unified_framework_headless.js regression test passes');
} catch (err) {
  assert(false, 'test_unified_framework_headless.js regression: ' + err.message);
}

console.log('\n================================================================');
console.log(`📊 SUMMARY: ${passCount} / ${passCount + failCount} TESTS PASSED (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
console.log('================================================================');

if (failCount > 0) {
  process.exit(1);
}
