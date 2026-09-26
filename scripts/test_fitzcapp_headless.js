/**
 * Headless Test Suite for Fitzcapp — Foundation (KSOM Engine & Routing)
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
  console.log('🧪 TEST: FITZCAPP FOUNDATION & ROUTING HEADLESS SUITE');
  console.log('================================================================\n');

  // 1. Verify Files Exist
  const htmlPath = path.join(__dirname, '..', 'fitzcapp', 'index.html');
  const cssPath = path.join(__dirname, '..', 'fitzcapp', 'styles.css');
  const jsPath = path.join(__dirname, '..', 'fitzcapp', 'app.js');

  assert(fs.existsSync(htmlPath), 'fitzcapp/index.html exists');
  assert(fs.existsSync(cssPath), 'fitzcapp/styles.css exists');
  assert(fs.existsSync(jsPath), 'fitzcapp/app.js exists');

  const html = fs.readFileSync(htmlPath, 'utf8');
  const css = fs.readFileSync(cssPath, 'utf8');
  const js = fs.readFileSync(jsPath, 'utf8');

  // 2. HTML Structure & Selectors
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
    assert(true, 'app.js syntax parses without error');
  } catch (e) {
    assert(false, `app.js syntax error: ${e.message}`);
  }

  assert(js.includes('function showPage('), 'app.js defines showPage()');
  assert(js.includes('function routeFromHash('), 'app.js defines routeFromHash()');
  assert(js.includes('function updateInstrument('), 'app.js defines updateInstrument()');
  assert(js.includes('function renderInstrument('), 'app.js defines renderInstrument()');
  assert(js.includes('syncParamWithBackend('), 'app.js connects dropdowns to /api/set-param');

  // 5. Server Endpoints Verification
  await new Promise((resolve) => {
    http.get('http://127.0.0.1:8080/fitzcapp', (res) => {
      assert(res.statusCode === 200, 'HTTP 200 on http://localhost:8080/fitzcapp');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        assert(data.includes('FITZCAPP'), 'Served HTML contains FITZCAPP brand');
        resolve();
      });
    }).on('error', (err) => {
      assert(false, `Server error on /fitzcapp: ${err.message}`);
      resolve();
    });
  });

  // Test POST /api/set-param
  await new Promise((resolve) => {
    const postPayload = JSON.stringify({ key: 'neighborhood', value: 'gaussian' });
    const req = http.request('http://127.0.0.1:8080/api/set-param', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postPayload)
      }
    }, (res) => {
      assert(res.statusCode === 200, 'HTTP 200 on POST /api/set-param');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const json = JSON.parse(data);
        assert(json.status === 'OK', 'POST response status is OK');
        assert(json.current_state.neighborhood === 'gaussian', 'Backend updated neighborhood to gaussian');
        resolve();
      });
    });
    req.on('error', (err) => {
      assert(false, `POST /api/set-param error: ${err.message}`);
      resolve();
    });
    req.write(postPayload);
    req.end();
  });

  // Test GET /api/ksom/metrics
  await new Promise((resolve) => {
    http.get('http://127.0.0.1:8080/api/ksom/metrics', (res) => {
      assert(res.statusCode === 200, 'HTTP 200 on GET /api/ksom/metrics');
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const metrics = JSON.parse(data);
        assert(metrics.nodes === 1510, 'Metrics nodes count is 1510');
        assert(typeof metrics.quantizationError === 'number', 'quantizationError is numeric');
        assert(typeof metrics.topographicError === 'number', 'topographicError is numeric');
        resolve();
      });
    }).on('error', (err) => {
      assert(false, `GET /api/ksom/metrics error: ${err.message}`);
      resolve();
    });
  });

  console.log('\n================================================================');
  console.log(`📊 SUMMARY: ${passed} / ${passed + failed} TESTS PASSED (${((passed / (passed + failed)) * 100).toFixed(1)}%)`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
