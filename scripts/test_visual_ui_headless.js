/**
 * test_visual_ui_headless.js
 * Headless verification for Hypersphere Visual UI on ports 8080 and 8082.
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const uiDir = path.resolve(__dirname, '..', 'visuals', 'hypersphere-ui');
let passed = 0;
let total = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passed++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('🧪 RUNNING HEADLESS TEST SUITE: HYPERSPHERE VISUAL UI (8080/8082)');
console.log('================================================================\n');

// 1. Check UI files on disk
const htmlPath = path.join(uiDir, 'index.html');
const cssPath = path.join(uiDir, 'style.css');
const jsMathPath = path.join(uiDir, 'hypersphere.js');
const jsRenderPath = path.join(uiDir, 'renderer.js');
const originalConfigPath = path.join(uiDir, 'view_original.json');

assert(fs.existsSync(htmlPath), 'index.html exists in visuals/hypersphere-ui');
assert(fs.existsSync(cssPath), 'style.css exists in visuals/hypersphere-ui');
assert(fs.existsSync(jsMathPath), 'hypersphere.js exists in visuals/hypersphere-ui');
assert(fs.existsSync(jsRenderPath), 'renderer.js exists in visuals/hypersphere-ui');
assert(fs.existsSync(originalConfigPath), 'view_original.json exists to preserve canonical baseline');

// 1b. Verify view_original.json content
const origJson = JSON.parse(fs.readFileSync(originalConfigPath, 'utf8'));
assert(origJson.view_name === 'original', 'view_original.json specifies view_name original');
assert(origJson.invariants.norm === 100.0, 'view_original.json specifies norm 100.0');
assert(origJson.invariants.continuous_manifold === true, 'view_original.json specifies continuous_manifold');

// 2. Validate HTML Content & Context Switcher Toolbar
const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.includes('HYPERSPHERE VISUAL CORE'), 'HTML contains branding title');
assert(html.includes('id="hypersphere-canvas"'), 'HTML contains #hypersphere-canvas');
assert(html.includes('id="carrier-wave-canvas"'), 'HTML contains #carrier-wave-canvas');
assert(html.includes('id="btn-toggle-mode"'), 'HTML contains #btn-toggle-mode');
assert(html.includes('id="btn-toggle-audio"'), 'HTML contains #btn-toggle-audio');
assert(html.includes('id="btn-toggle-json"'), 'HTML contains #btn-toggle-json');
assert(html.includes('id="raw-json-card"'), 'HTML contains #raw-json-card');
assert(html.includes('id="hud-status-dot"'), 'HTML contains #hud-status-dot');
assert(html.includes('id="tel-norm"'), 'HTML contains #tel-norm');
assert(html.includes('id="context-switcher-buttons"'), 'HTML contains #context-switcher-buttons');
assert(html.includes('id="select-hypersphere-context"'), 'HTML contains #select-hypersphere-context');
assert(html.includes('data-context="original"'), 'HTML contains Original context button');
assert(html.includes('data-context="physics"'), 'HTML contains Physics context button');
assert(html.includes('data-context="comms"'), 'HTML contains Comms context button');
assert(html.includes('data-context="knowledge"'), 'HTML contains Knowledge context button');
assert(html.includes('data-context="quiz"'), 'HTML contains Quiz context button');
assert(html.includes('id="active-context-banner"'), 'HTML contains #active-context-banner');
assert(html.includes('id="context-canvas-overlay"'), 'HTML contains #context-canvas-overlay');
assert(html.includes('id="contextSelector"'), 'HTML contains #contextSelector dropdown');
assert(html.includes('id="viewStatus"'), 'HTML contains #viewStatus indicator');
assert(html.includes('id="contextStatus"'), 'HTML contains #contextStatus indicator');
assert(html.includes('class="ui-panel context-switcher"'), 'HTML contains .ui-panel and .context-switcher classes');
assert(html.includes('const HypersphereContext'), 'HTML defines HypersphereContext controller');
assert(html.includes('window.__hypersphereRenderer'), 'HTML bridges to window.__hypersphereRenderer');

// 2b. Validate CSS Panel & Cross-Browser Fixes
const css = fs.readFileSync(cssPath, 'utf8');
assert(css.includes('.ui-panel'), 'style.css defines .ui-panel');
assert(css.includes('background-clip: padding-box'), 'style.css has standard background-clip: padding-box');
assert(css.includes('-webkit-background-clip: padding-box'), 'style.css has vendor -webkit-background-clip: padding-box');
assert(css.includes('.context-switcher'), 'style.css defines .context-switcher');

// 3. Validate Mathematics & Context Engine
const jsMath = fs.readFileSync(jsMathPath, 'utf8');
assert(jsMath.includes('class UnitQuaternion'), 'hypersphere.js defines UnitQuaternion');
assert(jsMath.includes('class HypersphereManifold'), 'hypersphere.js defines HypersphereManifold');
assert(jsMath.includes('class HypersphereTelemetryClient'), 'hypersphere.js defines HypersphereTelemetryClient');
assert(jsMath.includes('const HypersphereViews'), 'hypersphere.js defines HypersphereViews');
assert(jsMath.includes('switchTo(name)'), 'HypersphereViews provides switchTo(name)');
assert(jsMath.includes('original:'), 'HypersphereViews defines original context');
assert(jsMath.includes('physics:'), 'HypersphereViews defines physics context');
assert(jsMath.includes('comms:'), 'HypersphereViews defines comms context');
assert(jsMath.includes('knowledge:'), 'HypersphereViews defines knowledge context');
assert(jsMath.includes('quiz:'), 'HypersphereViews defines quiz context');

// 4. Validate Multi-Context Renderer Engine
const jsRender = fs.readFileSync(jsRenderPath, 'utf8');
assert(jsRender.includes('renderHopfFibration'), 'renderer.js implements renderHopfFibration');
assert(jsRender.includes('renderConformalVortex'), 'renderer.js implements renderConformalVortex');
assert(jsRender.includes('renderFlowParticles'), 'renderer.js implements renderFlowParticles');
assert(jsRender.includes('renderPhysicsOverlay'), 'renderer.js implements renderPhysicsOverlay');
assert(jsRender.includes('renderCommsOverlay'), 'renderer.js implements renderCommsOverlay');
assert(jsRender.includes('renderKnowledgeOverlay'), 'renderer.js implements renderKnowledgeOverlay');
assert(jsRender.includes('renderQuizOverlay'), 'renderer.js implements renderQuizOverlay');
assert(jsRender.includes('applyContext'), 'renderer.js implements applyContext');
assert(jsRender.includes('initAudio'), 'renderer.js implements Web Audio synthesizer');
assert(jsRender.includes('432.0'), 'renderer.js configures 432 Hz carrier frequency');
assert(jsRender.includes('7.83'), 'renderer.js configures 7.83 Hz Schumann resonance LFO');

// 5. HTTP Endpoint Probes
function fetchEndpoint(url, headers = {}) {
  return new Promise((resolve, reject) => {
    http.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

(async () => {
  try {
    // Probe 1: Port 8080 API returns JSON for machine client
    const res8080Json = await fetchEndpoint('http://localhost:8080/audi?format=json', { 'User-Agent': 'curl/8.0' });
    assert(res8080Json.status === 200, 'http://localhost:8080/audi?format=json returns HTTP 200');
    const jsonBody = JSON.parse(res8080Json.body);
    assert(jsonBody.status === 'LOCKED', 'Core status is LOCKED');
    assert(jsonBody.norm === 100.0, 'Core norm is 100.0');
    assert(jsonBody.anchor_freq === '432.000 Hz', 'Anchor frequency is 432.000 Hz');

    // Probe 2: Port 8080 Visual UI endpoint
    const res8080Visual = await fetchEndpoint('http://localhost:8080/visual/hypersphere', { 'User-Agent': 'Mozilla/5.0' });
    assert(res8080Visual.status === 200, 'http://localhost:8080/visual/hypersphere returns HTTP 200');
    assert(res8080Visual.body.includes('HYPERSPHERE VISUAL CORE'), 'Visual UI rendered on port 8080');

    // Probe 3: Port 8080 Content Negotiation at /audi for browser
    const res8080AudiBrowser = await fetchEndpoint('http://localhost:8080/audi', {
      'Accept': 'text/html,application/xhtml+xml',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0'
    });
    assert(res8080AudiBrowser.status === 200, 'http://localhost:8080/audi for browser returns HTTP 200');
    assert(res8080AudiBrowser.body.includes('HYPERSPHERE VISUAL CORE'), 'Browser navigating to /audi receives Visual UI');

    // Probe 4: Dedicated Port 8082 Visual Server
    const res8082 = await fetchEndpoint('http://localhost:8082/');
    assert(res8082.status === 200, 'http://localhost:8082 returns HTTP 200');
    assert(res8082.body.includes('HYPERSPHERE VISUAL CORE'), 'Dedicated port 8082 serves Visual UI');

    // Probe 5: Port 8080 /api/set-view context switching
    const resSetView = await fetchEndpoint('http://127.0.0.1:8080/api/set-view?context=quiz');
    assert(resSetView.status === 200, 'http://localhost:8080/api/set-view?context=quiz returns HTTP 200');
    const setViewJson = JSON.parse(resSetView.body);
    assert(setViewJson.active_context === 'quiz', 'Backend /api/set-view successfully switched active_context to quiz');

    // Reset back to original
    const resResetView = await fetchEndpoint('http://127.0.0.1:8080/api/set-view?context=original');
    assert(resResetView.status === 200, 'Reset /api/set-view?context=original returns HTTP 200');
    const resetJson = JSON.parse(resResetView.body);
    assert(resetJson.active_context === 'original', 'Backend /api/set-view reset to original');

    console.log('\n================================================================');
    console.log(`📊 TEST SUMMARY: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(1)}%)`);
    console.log('================================================================\n');

    if (passed === total) process.exit(0);
    else process.exit(1);
  } catch (e) {
    console.error('Probe failed:', e);
    process.exit(1);
  }
})();
