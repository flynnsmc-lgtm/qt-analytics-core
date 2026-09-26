/**
 * scripts/test_integrated_workflow_headless.js
 * Comprehensive Headless Automated Test Suite for Integrated Workflow:
 * Antigravity Agents + Core Framework Tools
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('================================================================================');
console.log('🧪 TEST: INTEGRATED WORKFLOW (AGENTS + CORE FRAMEWORK TOOLS) HEADLESS SUITE');
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

// 1. Verify HTML Structure in index.html
const htmlPath = path.join(__dirname, '..', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredHtmlElements = [
  'data-stage="stage-observatory"',
  'id="stage-observatory"',
  'id="reception-sop-bar"',
  'id="btn-quick-run-pipeline"',
  'id="btn-view-sop-rubric"',
  'id="agent-bookmarks-toolbar"',
  'id="btn-unhide-bookmarks"',
  'id="btn-export-bookmarks-json"',
  'id="btn-export-bookmarks-html"',
  'id="btn-sync-bookmarks-acropolis"',
  'id="bookmarks-folders-chips"',
  'id="bookmarks-grid"',
  'id="agent-workflow-console"',
  'id="btn-run-agent-workflow"',
  'id="btn-reset-workflow"',
  'id="workflow-stepper"',
  'id="wf-step-1"',
  'id="wf-step-2"',
  'id="wf-step-3"',
  'id="wf-step-4"',
  'id="wf-step-5"',
  'id="workflow-ledger-stream"',
  'id="arkham-explorer-card"',
  'id="arkham-endpoint-select"',
  'id="arkham-auth-pill"',
  'id="physics-checks-grid"',
  'id="chk-1"',
  'id="chk-2"',
  'id="chk-3"',
  'id="chk-4"',
  'id="chk-5"',
  'id="chk-6"',
  'id="chk-7"',
  'id="chk-8"',
  'id="btn-run-arkham-query"',
  'id="arkham-response-viewer"',
  'id="arkham-tracer-card"',
  'id="tracer-mempool-ticker"',
  'id="arkham-tracer-canvas"',
  'id="tracer-corridor-status"',
  'id="tracer-anomaly-badge"',
  'id="model-observatory-panel"',
  'id="observatory-score-readout"',
  'id="observatory-gate-badge"',
  'id="bar-consistency"',
  'id="bar-math-rigor"',
  'id="bar-pillar-comp"',
  'id="bar-latency"',
  'id="bar-hallucination"',
  'id="observatory-agent-target"',
  'id="btn-evaluate-observatory"',
  'id="btn-export-eval-report"'
];

requiredHtmlElements.forEach(el => {
  assert(html.includes(el), `HTML contains element: ${el}`);
});

// 2. Verify CSS Classes in style.css
const cssPath = path.join(__dirname, '..', 'style.css');
const css = fs.readFileSync(cssPath, 'utf8');

const requiredCssClasses = [
  '.reception-sop-bar',
  '.sop-badge',
  '.sop-title',
  '.agent-bookmarks-toolbar',
  '.folder-chip',
  '.bookmarks-grid',
  '.bookmark-card',
  '.observatory-hero',
  '.agent-workflow-card',
  '.workflow-stepper-grid',
  '.step-node',
  '.workflow-terminal-box',
  '.observatory-tools-grid',
  '.observatory-tool-card',
  '.physics-checks-container',
  '.physics-checks-grid',
  '.check-chip',
  '.tracer-ticker-bar',
  '.tracer-canvas-box',
  '.tracer-corridor-bar',
  '.model-observatory-card',
  '.rubrics-grid',
  '.rubric-card'
];

requiredCssClasses.forEach(cls => {
  assert(css.includes(cls), `CSS contains class: ${cls}`);
});

// 3. Verify JavaScript Logic in app.js
const jsPath = path.join(__dirname, '..', 'app.js');
const js = fs.readFileSync(jsPath, 'utf8');

assert(js.includes('initModelObservatoryAndArkham();'), 'app.js calls initModelObservatoryAndArkham() in DOMContentLoaded');
assert(js.includes('function initModelObservatoryAndArkham()'), 'app.js defines initModelObservatoryAndArkham function');
assert(js.includes('BOOKMARKS_DATA'), 'app.js defines BOOKMARKS_DATA collection');
assert(js.includes('bookmarks_20260910.json'), 'app.js supports JSON bookmark export');
assert(js.includes('bookmarks_20260910.html'), 'app.js supports HTML Netscape bookmark export');
assert(js.includes('/physics/spectral'), 'app.js handles /physics/spectral endpoint');
assert(js.includes('/entity/whales'), 'app.js handles /entity/whales endpoint');
assert(js.includes('/flow/transfers'), 'app.js handles /flow/transfers endpoint');
assert(js.includes('arkham-tracer-canvas'), 'app.js initializes tracer canvas animation');
assert(js.includes('executeStandardWorkflow'), 'app.js implements 5-step repeatable workflow sequence');
assert(js.includes('note-16'), 'app.js registers Note #16 in Acropolis index notes');

// 4. Verify Node.js Engine Execution
const { run8CheckPhysicsPipeline, evaluateModelObservatory, executeWorkflow, BOOKMARKS } = require('./integrated_workflow_engine.js');
assert(BOOKMARKS.length === 10, 'Node engine: exactly 10 authorized bookmarks');
const pChecks = run8CheckPhysicsPipeline();
assert(pChecks.passed === 8, 'Node engine: 8-check physics pipeline passed (8/8)');
const obsScore = evaluateModelObservatory('alpha');
assert(obsScore.quality_gate_passed === true, 'Node engine: Model Observatory quality gate passed');
assert(obsScore.weighted_score >= 85.0, 'Node engine: weighted score >= 85.0 threshold');
const wf = executeWorkflow();
assert(wf.step_1_source.status === 'PASSED', 'Node engine: Step 1 SOURCE passed');
assert(wf.step_2_ingest.status === 'PASSED', 'Node engine: Step 2 INGEST passed');
assert(wf.step_3_analyze.status === 'PASSED', 'Node engine: Step 3 ANALYZE passed');
assert(wf.step_4_store.status === 'PASSED', 'Node engine: Step 4 STORE passed');
assert(wf.step_5_report.status === 'PASSED', 'Node engine: Step 5 REPORT passed');

// 5. Verify Python Engine Execution
try {
  const pyOutput = execSync('python scripts/integrated_workflow_engine.py', { cwd: path.join(__dirname, '..') }).toString();
  assert(pyOutput.includes('ALL INTEGRATED WORKFLOW ENGINE CHECKS PASSED'), 'Python integrated_workflow_engine.py passed 100%');
} catch (err) {
  assert(false, `Python engine failed: ${err.message}`);
}

// 6. Regression Testing
try {
  const recOutput = execSync('node scripts/test_reception_housekeeping_headless.js', { cwd: path.join(__dirname, '..') }).toString();
  assert(recOutput.includes('27 / 27 TESTS PASSED'), 'test_reception_housekeeping_headless.js regression passed');
} catch (err) {
  assert(false, `Reception housekeeping regression failed: ${err.message}`);
}

try {
  const acropOutput = execSync('node scripts/test_acropolis_headless.js', { cwd: path.join(__dirname, '..') }).toString();
  assert(acropOutput.includes('55 / 55 TESTS PASSED'), 'test_acropolis_headless.js regression passed');
} catch (err) {
  assert(false, `Acropolis library regression failed: ${err.message}`);
}

try {
  const deskOutput = execSync('node scripts/test_team_desk_headless.js', { cwd: path.join(__dirname, '..') }).toString();
  assert(deskOutput.includes('VERIFICATION COMPLETED SUCCESSFULLY'), 'test_team_desk_headless.js regression passed');
} catch (err) {
  assert(false, `Team desk regression failed: ${err.message}`);
}

console.log('\n================================================================================');
console.log(`📊 SUMMARY: ${passCount} / ${passCount + failCount} TESTS PASSED (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
console.log('================================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
