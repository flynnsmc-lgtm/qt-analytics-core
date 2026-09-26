/**
 * Headless Test Suite for FITZ — Foundation (KSOM Engine & Routing)
 * Unified under FITZ branding and Fitzcapp Master Controller
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('🧪 TEST: FITZ FOUNDATION & ROUTING HEADLESS SUITE');
  console.log('================================================================\n');

  // 1. Verify Files Exist in fitz/
  const htmlPath = path.join(__dirname, '..', 'fitz', 'index.html');
  const cssPath = path.join(__dirname, '..', 'fitz', 'styles.css');
  const jsPath = path.join(__dirname, '..', 'fitz', 'app.js');

  assert(fs.existsSync(htmlPath), 'fitz/index.html exists');
  assert(fs.existsSync(cssPath), 'fitz/styles.css exists');
  assert(fs.existsSync(jsPath), 'fitz/app.js exists');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');

  // 2. HTML Structure & Selectors
  assert(html.includes('FITZ — Foundation'), 'HTML title is FITZ — Foundation');
  assert(html.includes('KSOM FOUNDATION'), 'HTML brand includes KSOM FOUNDATION');
  assert(html.includes('id="fitz-blink-container"'), 'HTML has id="fitz-blink-container"');
  assert(html.includes('id="fitz-blink-dot"'), 'HTML has id="fitz-blink-dot"');

  const expectedElements = [
    'id="app"',
    'id="navbar"',
    'class="nav-brand"',
    'href="#dashboard"',
    'href="#instrument"',
    'href="#settings"',
    'id="content"',
    'id="page-dashboard"',
    'id="page-instrument"',
    'id="page-settings"',
    'id="topology-select"',
    'id="init-select"',
    'id="neighborhood-select"',
    'id="metric-select"',
    'id="instrument-readouts"',
    'id="val-qerr"',
    'id="val-topo"',
    'id="val-nodes"',
    'id="val-status"',
    'id="route-select"',
    'id="security-select"'
  ];

  expectedElements.forEach(el => {
    assert(html.includes(el), `HTML contains expected element: ${el}`);
  });

  // 3. CSS Classes & Design Tokens
  const expectedCss = [
    '--bg:',
    '--panel:',
    '--accent:',
    '--accent-soft:',
    '--text:',
    '--muted:',
    '--border:',
    '#navbar',
    '.nav-brand',
    '.nav-links',
    '.nav-link',
    '.page',
    '.page.active',
    '.panel',
    '.dropdown',
    '.meter'
  ];

  expectedCss.forEach(c => {
    assert(css.includes(c), `CSS contains expected rule: ${c}`);
  });

  // 4. JS Syntax & Functionality
  try {
    new Function(js);
    assert(true, 'fitz/app.js syntax parses without error');
  } catch (e) {
    assert(false, `fitz/app.js syntax error: ${e.message}`);
  }

  assert(js.includes('function showPage('), 'fitz/app.js defines showPage()');
  assert(js.includes('function routeFromHash('), 'fitz/app.js defines routeFromHash()');
  assert(js.includes('function updateInstrument('), 'fitz/app.js defines updateInstrument()');
  assert(js.includes('function renderInstrument('), 'fitz/app.js defines renderInstrument()');
  assert(js.includes('syncParamWithBackend('), 'fitz/app.js connects dropdowns to backend sync');

  console.log('\n================================================================');
  console.log(`SUMMARY: ${passed} passed, ${failed} failed.`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
