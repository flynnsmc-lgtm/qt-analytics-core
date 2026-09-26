/**
 * Headless Test Suite: Full-Page Redirects & Interactive CTAs on http://localhost:8080/landing
 */

const http = require('http');

function fetchUrl(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: Object.assign({ 'User-Agent': 'HeadlessTest/1.0' }, headers)
    };
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, headers: res.headers, body: data });
      });
    });
    req.on('error', (err) => reject(err));
    req.end();
  });
}

async function runTests() {
  console.log('🚀 [TEST RUNNER] Starting Landing Page Full-Page Redirects Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, testName, details = '') {
    total++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} -> ${details}`);
    }
  }

  try {
    // 1. Fetch Landing Page
    const landingRes = await fetchUrl('/landing', { 'Accept': 'text/html' });
    assert(landingRes.statusCode === 200, 'GET /landing returns HTTP 200');
    assert(landingRes.body.includes('QT Analytics'), 'Landing page contains QT Analytics title');

    // 2. Check Nav Actions & Links
    assert(landingRes.body.includes('href="/visual"'), 'Navbar contains 3D Visualizer redirect link (/visual)');
    assert(landingRes.body.includes('href="/fitz"') || landingRes.body.includes('href="/fitzcapp"'), 'Navbar contains Launch Platform redirect link (/fitz or /fitzcapp)');
    assert(landingRes.body.includes('href="/"'), 'Navbar contains Chi Core Platform link (/)');

    // 3. Check Hero Actions
    assert(landingRes.body.includes('id="btn-hero-explore"'), 'Hero contains explore capabilities anchor');
    assert(landingRes.body.includes('id="btn-hero-launch"'), 'Hero contains launch Chi Core button');
    assert(landingRes.body.includes('href="/"') && landingRes.body.includes('LAUNCH CHI CORE'), 'Hero launch button points to /');

    // 4. Check 6 Product Card Explore Full-Page Redirect Links
    assert(landingRes.body.includes('id="btn-explore-geosatnav"') && landingRes.body.includes('href="/visual"'),
      'Card 1 (GeoSatNav) has full-page redirect to /visual');

    assert(landingRes.body.includes('id="btn-explore-securecomms"') && landingRes.body.includes('href="/team/open/comms_networks"'),
      'Card 2 (Secure Comms) has full-page redirect to /team/open/comms_networks');

    assert(landingRes.body.includes('id="btn-explore-physicscore"') && landingRes.body.includes('href="/?stage=stage-equations"'),
      'Card 3 (Physics Core) has full-page redirect to /?stage=stage-equations');

    assert(landingRes.body.includes('id="btn-explore-analytics"') && (landingRes.body.includes('href="/fitz"') || landingRes.body.includes('href="/fitzcapp"')),
      'Card 4 (Analytics) has full-page redirect to /fitz or /fitzcapp');

    assert(landingRes.body.includes('id="btn-explore-energy"') && landingRes.body.includes('href="/research/sonoluminescence"'),
      'Card 5 (Energy Core) has full-page redirect to /research/sonoluminescence');

    assert(landingRes.body.includes('id="btn-explore-holographic"') && landingRes.body.includes('href="/visual"'),
      'Card 6 (Holographic) has full-page redirect to /visual');

    // 5. Check Secondary Quick Specs triggers exist without obstructing full-page buttons
    assert(landingRes.body.includes('class="btn-quick-specs"'), 'Quick Specs buttons present for inline modal preview');

    // 6. Check Tier Access CTAs (Arkham & Bounty)
    assert(landingRes.body.includes('id="btn-upgrade-arkham"') && landingRes.body.includes('href="/?stage=stage-observatory"'),
      'Arkham Pro Tier CTA redirects to /?stage=stage-observatory');

    assert(landingRes.body.includes('id="btn-unlock-bounty"') && landingRes.body.includes('href="/team/open/comms_networks"'),
      'Bounty Research Tier CTA redirects to /team/open/comms_networks');

    // 7. Check Section 4 Work With Us CTAs
    assert(landingRes.body.includes('id="btn-cta-get-started"') && (landingRes.body.includes('href="/fitz"') || landingRes.body.includes('href="/fitzcapp"')),
      'Section 4 Get Started CTA redirects to /fitz or /fitzcapp');

    assert(landingRes.body.includes('id="btn-cta-contact"') && landingRes.body.includes('href="/team/open/comms_networks"'),
      'Section 4 Contact/Vault CTA redirects to /team/open/comms_networks');

    assert(landingRes.body.includes('id="btn-cta-docs"') && landingRes.body.includes('The_21_Pillar_Unified_Master_Framework.pdf'),
      'Section 4 Documentation CTA redirects to Master Framework PDF');

    // 8. Check Modal Full-Page Redirect Actions
    assert(landingRes.body.includes('fullPageUrl: \'/visual\''), 'modalData contains fullPageUrl for geosatnav');
    assert(landingRes.body.includes('fullPageUrl: \'/team/open/comms_networks\''), 'modalData contains fullPageUrl for securecomms');
    assert(landingRes.body.includes('fullPageUrl: \'/?stage=stage-equations\''), 'modalData contains fullPageUrl for physics');
    assert(landingRes.body.includes("fullPageUrl: '/fitz'") || landingRes.body.includes("fullPageUrl: '/fitzcapp'"), 'modalData contains fullPageUrl for analytics');
    assert(landingRes.body.includes('fullPageUrl: \'/research/sonoluminescence\''), 'modalData contains fullPageUrl for energy');
    assert(landingRes.body.includes('fullPageUrl: \'/visual\''), 'modalData contains fullPageUrl for holographic');

    // 9. Verify Target Destination Endpoints Return HTTP 200
    console.log('\n📡 [VERIFYING TARGET ENDPOINTS]');
    const rootRes = await fetchUrl('/');
    assert(rootRes.statusCode === 200, 'GET / (Chi Core Engine) returns HTTP 200');

    const visualRes = await fetchUrl('/visual', { 'Accept': 'text/html' });
    assert(visualRes.statusCode === 200 && visualRes.body.includes('Hyperspheric Geometry Viewport'),
      'GET /visual (Holographic Viewport) returns HTTP 200 HTML');

    const fitzRes = await fetchUrl('/fitz', { 'Accept': 'text/html' });
    assert(fitzRes.statusCode === 200 && (fitzRes.body.includes('FITZ') || fitzRes.body.includes('FITZCAPP')),
      'GET /fitz (FITZ KSOM) returns HTTP 200 HTML');

    const fitzcappRes = await fetchUrl('/fitzcapp', { 'Accept': 'text/html' });
    assert(fitzcappRes.statusCode === 200 && (fitzcappRes.body.includes('FITZ') || fitzcappRes.body.includes('FITZCAPP')),
      'GET /fitzcapp (Fitzcapp KSOM alias) returns HTTP 200 HTML');

    const commsRes = await fetchUrl('/team/open/comms_networks', { 'Accept': 'text/html' });
    assert(commsRes.statusCode === 200 && commsRes.body.includes('Comms Networks'),
      'GET /team/open/comms_networks (Comms Vault) returns HTTP 200 HTML');

    const sonoRes = await fetchUrl('/research/sonoluminescence', { 'Accept': 'text/html' });
    assert(sonoRes.statusCode === 200 && sonoRes.body.includes('Sonoluminescence'),
      'GET /research/sonoluminescence (Sonoluminescence Brief) returns HTTP 200 HTML');

    const pdfRes = await fetchUrl('/downloads/The_21_Pillar_Unified_Master_Framework.pdf');
    assert(pdfRes.statusCode === 200 && pdfRes.headers['content-type'] === 'application/pdf',
      'GET Master Framework PDF returns HTTP 200 application/pdf');

  } catch (err) {
    console.error('Fatal test error:', err);
    assert(false, 'Test execution completed without crash', err.message);
  }

  console.log(`\n========================================`);
  console.log(`TEST RESULTS: ${passed} / ${total} PASSED (${Math.round((passed / total) * 100)}%)`);
  console.log(`========================================\n`);

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
