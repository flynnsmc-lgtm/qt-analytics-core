const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('=== QT ANALYTICS LANDING PAGE HEADLESS VERIFICATION SUITE ===');

let passCount = 0;
let failCount = 0;

function check(label, condition, detail = '') {
  if (condition) {
    console.log(`  ✅ [PASS] ${label}${detail ? ' -> ' + detail : ''}`);
    passCount++;
  } else {
    console.error(`  ❌ [FAIL] ${label}${detail ? ' -> ' + detail : ''}`);
    failCount++;
  }
}

// 1. Check Files on Disk
const landingDir = path.join(__dirname, '..', 'visuals', 'landing');
const indexPath = path.join(landingDir, 'index.html');
const cssPath = path.join(landingDir, 'style.css');
const radarPath = path.join(landingDir, 'radar.js');
const assetsDir = path.join(__dirname, '..', 'assets', 'images', 'webflow');

check('Landing page index.html exists', fs.existsSync(indexPath));
check('Landing page style.css exists', fs.existsSync(cssPath));
check('Landing page radar.js exists', fs.existsSync(radarPath));
check('Assets directory exists', fs.existsSync(assetsDir));

const html = fs.readFileSync(indexPath, 'utf8');

// 2. Check 4 Core Sections
check('Section 1 (Hero) present', html.includes('id="hero"'));
check('Section 2 (Capabilities/Products) present', html.includes('id="capabilities"'));
check('Section 3 (Offerings & Paywalls) present', html.includes('id="offerings"'));
check('Section 4 (Final CTA / Work With Us) present', html.includes('id="contact"'));

// 3. Hero Requirements
check('Radar motion canvas element present', html.includes('<canvas id="radar-canvas"></canvas>'));
check('Exact headline present', html.includes('QT Analytics — Precision • Geospatial • Connected'));
check('Hero primary CTA [EXPLORE CAPABILITIES] present', html.includes('EXPLORE CAPABILITIES'));

// 4. Products / Solutions (Big Buttons) — 6 total
check('Product: GeoSatNav Systems present', html.includes('GeoSatNav Systems'));
check('Product: Secure Comms & Networks present', html.includes('Secure Comms & Networks'));
check('Product: Physics & Hypersphere Core present', html.includes('Physics & Hypersphere Core'));
check('Product: Analytics & Intelligence present', html.includes('Analytics & Intelligence'));
check('Product: Energy & Dynamic Confinement present', html.includes('Energy') && html.includes('Confinement'));
check('Product: Holographic Systems & Visualization present', html.includes('Holographic Systems'));
check('6-block grid: accent-energy class present', html.includes('accent-energy'));
check('6-block grid: accent-holo class present', html.includes('accent-holo'));

// 5. Paywall Framework (Arkham & Bounty)
check('Paywall: ARKHAM present', html.includes('ARKHAM'));
check('Arkham Free Tier (Public Explorer) present', html.includes('Public Explorer'));
check('Arkham Pro Tier (Verified Pro) present', html.includes('Arkham Pro'));
check('Paywall: BOUNTY present', html.includes('BOUNTY'));
check('Bounty Free Tier (Research Preview) present', html.includes('Research Preview'));
check('Bounty Subscriber Tier present', html.includes('Research Subscriber'));

// 6. Final CTAs & Buttons
check('CTA Button: Get Started present', html.includes('Get Started'));
check('CTA Button: Contact Us present', html.includes('Contact Us'));
check('CTA Button: Documentation present', html.includes('Documentation'));

// 7. Strict Negative Constraint: ZERO military or maritime words on public landing page
const militaryMatch = html.match(/military/i);
const maritimeMatch = html.match(/maritime/i);
check('Strict Negative Rule: Zero military occurrences', militaryMatch === null, militaryMatch ? `Found: ${militaryMatch[0]}` : 'Clean');
check('Strict Negative Rule: Zero maritime occurrences', maritimeMatch === null, maritimeMatch ? `Found: ${maritimeMatch[0]}` : 'Clean');

// 8. Brand Assets Verification
const requiredAssets = [
  'logo-main-light.svg',
  'icon-geosatnav.svg',
  'icon-securecomms.svg',
  'icon-physics-core.svg',
  'icon-analytics.svg',
  'icon-energy.svg',
  'icon-holographic.svg'
];
requiredAssets.forEach(asset => {
  check(`Asset exists: ${asset}`, fs.existsSync(path.join(assetsDir, asset)));
});

// 9. HTTP Staging Endpoint Check
http.get('http://localhost:8080/landing', res => {
  check('Staging Endpoint /landing returns HTTP 200', res.statusCode === 200, `Status: ${res.statusCode}`);
  check('Staging Endpoint returns text/html', (res.headers['content-type'] || '').includes('text/html'));

  let body = '';
  res.on('data', chunk => { body += chunk; });
  res.on('end', () => {
    check('Staging body length > 10000 bytes', body.length > 10000, `Size: ${body.length} bytes`);
    console.log(`\n============================================================`);
    console.log(`📊 SUMMARY: ${passCount} / ${passCount + failCount} Checks Passed (${((passCount / (passCount + failCount)) * 100).toFixed(1)}%)`);
    console.log(`============================================================`);
    if (failCount > 0) {
      process.exit(1);
    } else {
      console.log('🎉 ALL QT ANALYTICS LANDING PAGE CHECKS PASSED PERFECTLY!\n');
      process.exit(0);
    }
  });
}).on('error', err => {
  check('Staging Endpoint reachable', false, err.message);
  process.exit(1);
});
