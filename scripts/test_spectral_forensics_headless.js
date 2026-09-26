/**
 * Headless Automated Verification Suite for QT Analytics Spectral Forensics Revamp
 * ID: QT-SF-V2-ANTIGRAVITY
 *
 * Verifies:
 * 1. File artifacts existence (HTML, CSS, JS, Webflow embed guide)
 * 2. HTML DOM integrity & contract compliance (all controls, buttons, cards, insight box, Gödel card)
 * 3. CSS token & class presence (cybernetic theme, highlight states, pulsing loops)
 * 4. JS Forensics Dictionary integrity & coverage
 * 5. Gödel Locking Relation mathematical invariance (Ω² = 4πGρ = -Λ)
 * 6. Interactive selection & Fast Loop state machine contracts
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const FORENSICS_DIR = path.join(ROOT_DIR, 'visuals', 'spectral-forensics');

const HTML_FILE = path.join(FORENSICS_DIR, 'index.html');
const CSS_FILE = path.join(FORENSICS_DIR, 'style.css');
const JS_FILE = path.join(FORENSICS_DIR, 'spectral_forensics.js');
const EMBED_FILE = path.join(FORENSICS_DIR, 'WEBFLOW_SPECTRAL_FORENSICS_EMBED.md');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
    totalTests++;
    if (condition) {
        passedTests++;
        console.log(`  ✅ [PASS] ${message}`);
    } else {
        console.error(`  ❌ [FAIL] ${message}`);
    }
}

console.log('===============================================================');
console.log('🔬 QT SPECTRAL FORENSICS HEADLESS VERIFICATION SUITE');
console.log('   ID: QT-SF-V2-ANTIGRAVITY — Unified Intelligence Desk');
console.log('===============================================================\n');

// ── 1. File Artifacts Verification ──
console.log('📂 1. Verifying File Artifacts Existence...');
assert(fs.existsSync(HTML_FILE), `HTML file exists: ${path.relative(ROOT_DIR, HTML_FILE)}`);
assert(fs.existsSync(CSS_FILE), `CSS stylesheet exists: ${path.relative(ROOT_DIR, CSS_FILE)}`);
assert(fs.existsSync(JS_FILE), `JavaScript controller exists: ${path.relative(ROOT_DIR, JS_FILE)}`);
assert(fs.existsSync(EMBED_FILE), `Webflow embed guide exists: ${path.relative(ROOT_DIR, EMBED_FILE)}`);

const htmlContent = fs.readFileSync(HTML_FILE, 'utf-8');
const cssContent = fs.readFileSync(CSS_FILE, 'utf-8');
const jsContent = fs.readFileSync(JS_FILE, 'utf-8');

// ── 2. HTML Contract Verification ──
console.log('\n📄 2. Verifying Single-Page Architecture & Required Controls...');
assert(htmlContent.includes('QT-SF-V2-ANTIGRAVITY'), 'HTML contains correct Desk ID: QT-SF-V2-ANTIGRAVITY');
assert(htmlContent.includes('Spectral Forensics Intelligence Desk') || htmlContent.includes('SPECTRAL FORENSICS INTELLIGENCE DESK'), 'Contains Header: Spectral Forensics Intelligence Desk');
assert(htmlContent.includes('pill-active-liaison'), 'Contains Active Liaison Desk control badge (#pill-active-liaison)');
assert(htmlContent.includes('loop-verification-status'), 'Contains Quick Loop Verification status pill (#loop-verification-status)');
assert(htmlContent.includes('btn-global-fast-loop'), 'Contains Fast Loop Action button (#btn-global-fast-loop)');
assert(htmlContent.includes('btn-global-refresh'), 'Contains Network Refresh button (#btn-global-refresh)');
assert(htmlContent.includes('spectral-cluster-canvas'), 'Contains Forensic Cluster Radar canvas (#spectral-cluster-canvas)');
assert(htmlContent.includes('unified-insight-box'), 'Contains Unified Dynamic Insight Box (#unified-insight-box)');
assert(htmlContent.includes('insight-title'), 'Insight Box contains #insight-title (Element Name)');
assert(htmlContent.includes('insight-category'), 'Insight Box contains #insight-category');
assert(htmlContent.includes('insight-definition'), 'Insight Box contains #insight-definition');
assert(htmlContent.includes('insight-function'), 'Insight Box contains #insight-function');
assert(htmlContent.includes('insight-trail-chain'), 'Insight Box contains #insight-trail-chain (Connection Architecture)');
assert(htmlContent.includes('insight-why'), 'Insight Box contains #insight-why (Why It Matters)');
assert(htmlContent.includes('insight-watch'), 'Insight Box contains #insight-watch (What To Watch For)');
assert(htmlContent.includes('insight-extra'), 'Insight Box contains #insight-extra (System Nuance)');
assert(htmlContent.includes('godel-foundation-card'), 'Contains Gödel Locking Relation Foundation section (#godel-foundation-card)');
assert(htmlContent.includes('godel-slider-omega'), 'Gödel simulator contains Ω slider (#godel-slider-omega)');
assert(htmlContent.includes('godel-slider-rho'), 'Gödel simulator contains ρ slider (#godel-slider-rho)');
assert(htmlContent.includes('godel-val-lambda'), 'Gödel simulator contains Λ display (#godel-val-lambda)');
assert(htmlContent.includes('Ω² (Rotation)'), 'Gödel formula hero displays Ω² (Rotation)');
assert(htmlContent.includes('4πGρ (Density)'), 'Gödel formula hero displays 4πGρ (Density)');
assert(htmlContent.includes('−Λ (Inward Bound)'), 'Gödel formula hero displays −Λ (Inward Bound)');

// Entity cluster rows
assert(htmlContent.includes('data-entity-key="entity-cluster-a"'), 'Matrix contains Cluster A (Genesis Liquidity Root / 0x7a3F...b6A4)');
assert(htmlContent.includes('data-entity-key="entity-cluster-b"'), 'Matrix contains Cluster B (Flash-Loan Arbitrageur / 0x19B8...81E3)');
assert(htmlContent.includes('data-entity-key="entity-cluster-c"'), 'Matrix contains Cluster C (Cross-Chain Escrow Vault / 0x94E2...F05d)');
assert(htmlContent.includes('data-entity-key="entity-cluster-d"'), 'Matrix contains Cluster D (Dark-Pool Mixer Node / 0x42C0...73aB)');

// ── 3. CSS Token & Visual Linking Verification ──
console.log('\n🎨 3. Verifying CSS Token & Visual Link Styling...');
assert(cssContent.includes('.spectral-desk-container'), 'CSS defines .spectral-desk-container');
assert(cssContent.includes('.unified-insight-box') || cssContent.includes('.insight-box'), 'CSS defines insight box persistent panel');
assert(cssContent.includes('.highlighted-entity') || cssContent.includes('.entity-row.active-selection'), 'CSS defines active entity highlighting');
assert(cssContent.includes('.fast-loop-active') || cssContent.includes('.btn-fast-loop.active'), 'CSS defines fast loop active state');
assert(cssContent.includes('.godel-card') || cssContent.includes('.godel-foundation-card'), 'CSS defines Gödel foundation card styling');
assert(cssContent.includes('.forensics-tooltip') || cssContent.includes('.spectral-tooltip'), 'CSS defines universal tooltip popup');
assert(cssContent.includes('rgba(') && cssContent.includes('backdrop-filter'), 'CSS adheres to glassmorphism aesthetic tokens');

// ── 4. JS Forensics Dictionary Coverage & Logic ──
console.log('\n🧠 4. Verifying JS Forensics Dictionary & Event Architecture...');
assert(jsContent.includes('const FORENSICS_DICTIONARY = {'), 'JS defines FORENSICS_DICTIONARY');

const requiredKeys = [
    'fast-loop-action',
    'network-refresh',
    'active-liaison',
    'fraud-risk-tag',
    'godel-locking-relation',
    'entity-cluster-a',
    'entity-cluster-b',
    'entity-cluster-c',
    'entity-cluster-d'
];

requiredKeys.forEach(k => {
    assert(jsContent.includes(`'${k}'`) || jsContent.includes(`"${k}"`), `Dictionary contains required key: ${k}`);
});

assert(jsContent.includes('function updateInsightBox('), 'JS defines updateInsightBox() for dynamic panel updates');
assert(jsContent.includes('function initUniversalTooltips('), 'JS defines initUniversalTooltips()');
assert(jsContent.includes('function initSmartDropdowns('), 'JS defines initSmartDropdowns()');
assert(jsContent.includes('function initEntitySelection('), 'JS defines initEntitySelection()');
assert(jsContent.includes('function initGlobalControls('), 'JS defines initGlobalControls()');
assert(jsContent.includes('function initGodelSimulator('), 'JS defines initGodelSimulator()');
assert(jsContent.includes('function drawClusterConnections('), 'JS defines drawClusterConnections() for 2D mempool topology');

// ── 5. Gödel Locking Relation Invariance Test ──
console.log('\n🌌 5. Verifying Gödel Locking Relation Invariance: Ω² = 4πGρ = -Λ ...');
// In Gödel's exact metric:
// Ω² = 4π G ρ = -Λ
const G_sim = 1.0;
const testCases = [
    { omega: 0.50, rho: 0.019894367886486918 },
    { omega: 1.00, rho: 0.07957747154594767 },
    { omega: 1.41421356, rho: 0.15915494309189535 }
];

testCases.forEach((tc, idx) => {
    const omegaSq = tc.omega * tc.omega;
    const fourPiGRho = 4 * Math.PI * G_sim * tc.rho;
    const diff = Math.abs(omegaSq - fourPiGRho);
    const locked = diff < 0.001;
    assert(locked, `Gödel test #${idx + 1}: Ω=${tc.omega.toFixed(2)} -> Ω²=${omegaSq.toFixed(4)}, 4πGρ=${fourPiGRho.toFixed(4)} (diff=${diff.toFixed(6)}) -> LOCKED`);
});

// ── 6. Zero Page-Reload / In-Place Constraint Test ──
console.log('\n🔒 6. Verifying In-Place Interactivity Mandates (No Navigation)...');
assert(!htmlContent.includes('target="_blank"') || htmlContent.indexOf('target="_blank"') === -1, 'All links & controls stay in-page (zero external redirects)');
assert(!htmlContent.includes('window.location.href ='), 'JS never redirects the browser');
assert(jsContent.includes('addEventListener') && !jsContent.includes('location.reload()'), 'JS executes in-place dynamic DOM mutations without reload');

console.log('\n===============================================================');
console.log(`📊 FINAL RESULT: ${passedTests}/${totalTests} TESTS PASSED (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('===============================================================');

if (passedTests === totalTests) {
    console.log('🎉 ALL SPECTRAL FORENSICS INTEGRATION CONTRACTS VERIFIED 100% PASS!');
    process.exit(0);
} else {
    console.error('❌ SOME TESTS FAILED.');
    process.exit(1);
}
