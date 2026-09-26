/**
 * test_mqtt_security_headless.js
 * 
 * Comprehensive automated verification for:
 * 1. Security Agent Team Member (Agent Epsilon / MGR-SEC-05).
 * 2. Groundwork R&D and MQTT Security Expert module (mqtt_security_agent.js).
 * 3. Handshake and MQTT Byte Remittance (MQTT 5.0 AUTH packet 0xF0).
 * 4. Nonce interference and anti-replay sliding window.
 * 5. Canonical Key & Auth Tag Derivation (MessageDigest SHA-256 parity).
 * 6. User Reassurance Virtual Attack Simulator (6 vectors).
 * 7. UI Deck and Elements in index.html, style.css, and app.js.
 * 8. Zero-regression execution with existing platform suites.
 */

const fs = require('fs');
const path = require('path');
const { MqttSecurityAgent, CanonicalDigestDeriver, NonceInterferenceShield, MqttByteRemittanceCodec, DOMAIN_TAGS } = require('./mqtt_security_agent');

console.log('================================================================');
console.log('🛡️  HEADLESS VERIFICATION: MQTT SECURITY AGENT & GROUNDWORK R&D');
console.log('================================================================\n');

let passCount = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ [PASS] ${message}`);
    passCount++;
  } else {
    console.error(`  ✗ [FAIL] ${message}`);
  }
}

// -----------------------------------------------------------------------------
// 1. SPECIFICATION & KNOWLEDGE ITEM VERIFICATION
// -----------------------------------------------------------------------------
console.log('[SECTION 1] Knowledge Item & Specification Verification');
const specPath = path.join('C:', 'Users', '44790', '.gemini', 'antigravity-ide', 'knowledge', 'chi_key_team_desk_overdrive', 'artifacts', 'mqtt_security_groundwork_spec.md');
assert(fs.existsSync(specPath), 'Groundwork R&D Specification exists in knowledge base');
if (fs.existsSync(specPath)) {
  const specContent = fs.readFileSync(specPath, 'utf8');
  assert(specContent.includes('MGR-SEC-05'), 'Spec specifies Manager Key MGR-SEC-05');
  assert(specContent.includes('MessageDigest.getInstance(HASH_ALGORITHM).digest(data)'), 'Spec documents Java MessageDigest derivation formula');
  assert(specContent.includes('AUTH PACKET WIRE LAYOUT'), 'Spec documents MQTT 5.0 AUTH wire packet layout');
  assert(specContent.includes('Strict Avalanche Criterion'), 'Spec explains Nonce Interference Avalanche defense');
}

// -----------------------------------------------------------------------------
// 2. HTML STRUCTURE VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n[SECTION 2] UI Structure Verification in index.html');
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const expectedHtmlElements = [
  'id="mqtt-security-deck"',
  'id="mqtt-sec-status-badge"',
  'id="btn-refresh-wire-trace"',
  'id="wire-packet-type"',
  'id="wire-reason-code"',
  'id="mqtt-wire-hex-display"',
  'id="disp-role-tag"',
  'id="disp-session-id"',
  'id="disp-nonce-hex"',
  'id="disp-domain-tag"',
  'id="disp-auth-digest"',
  'id="btn-sim-golden"',
  'id="btn-sim-replay"',
  'id="btn-sim-bitflip"',
  'id="btn-sim-role-elevation"',
  'id="btn-sim-cross-domain"',
  'id="btn-sim-wire-truncate"',
  'id="attack-outcome-console"',
  'id="outcome-badge"',
  'id="outcome-title"',
  'id="outcome-explanation"',
  'id="avalanche-meter-row"',
  'id="avalanche-fill"',
  'id="avalanche-val"',
  'data-agent="agent_sec_mqtt"',
  'value="agent_sec_mqtt"',
  '🟢 8 AGENTS ACTIVE'
];

expectedHtmlElements.forEach(item => {
  assert(html.includes(item), `index.html contains ${item}`);
});

// -----------------------------------------------------------------------------
// 3. CSS STYLING VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n[SECTION 3] CSS Styling Verification in style.css');
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');

const expectedCssClasses = [
  '.mqtt-sec-deck',
  '.mqtt-sec-grid',
  '.mqtt-sec-card',
  '.byte-inspector-container',
  '.byte-hex-viewer',
  '.canonical-breakdown-box',
  '.attack-buttons-grid',
  '.btn-attack-sim',
  '.btn-attack-sim.btn-golden',
  '.btn-attack-sim.btn-danger',
  '.attack-outcome-console',
  '.avalanche-meter-row',
  '.sec-reassurance-matrix',
  '.reassurance-pillar-card'
];

expectedCssClasses.forEach(cls => {
  assert(css.includes(cls), `style.css contains class ${cls}`);
});

// -----------------------------------------------------------------------------
// 4. APP.JS LOGIC & MANAGER KEYS VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n[SECTION 4] Application Controller Verification in app.js');
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');

assert(js.includes('MGR-SEC-05'), 'app.js registers MGR-SEC-05 in managerKeys array');
assert(js.includes('Agent Epsilon (CipherShield)'), 'app.js identifies Agent Epsilon (CipherShield)');
assert(js.includes('agent_sec_mqtt'), 'app.js handles agent_sec_mqtt in direct dispatch');
assert(js.includes('initMqttSecurityDeck()'), 'app.js calls initMqttSecurityDeck() in initTeamDeskOverdrive');
assert(js.includes('function initMqttSecurityDeck()'), 'app.js defines initMqttSecurityDeck function');
assert(js.includes('sha256Sync'), 'app.js contains synchronous SHA-256 cryptographic engine');
assert(js.includes('buildCanonicalData'), 'app.js implements length-value prefix canonical framing');
assert(js.includes('buildMqttAuthWirePacket'), 'app.js implements MQTT 5.0 AUTH packet wire assembler');

// -----------------------------------------------------------------------------
// 5. CRYPTOGRAPHIC & WIRE REMITTANCE ENGINE TEST
// -----------------------------------------------------------------------------
console.log('\n[SECTION 5] Cryptographic Engine & Wire Remittance Invariants');
const agent = new MqttSecurityAgent('TEST-SHARED-SECRET-2026');

// 5.1 Parity Test
const testRole = 'ROLE_MGR_SEC_05';
const testSession = 'SESS-UNIT-TEST-01';
const testNonce = '0123456789abcdef0123456789abcdef';
const testSecret = 'TEST-SHARED-SECRET-2026';
const testDomain = DOMAIN_TAGS.BYTE_REMITTANCE;

const { hex: digestHex1 } = CanonicalDigestDeriver.deriveAuthDigest(testRole, testSession, testNonce, testSecret, testDomain);
const { hex: digestHex2 } = CanonicalDigestDeriver.deriveAuthDigest(testRole, testSession, testNonce, testSecret, testDomain);
assert(digestHex1 === digestHex2, 'Deterministic MessageDigest SHA-256 derivation verified');
assert(digestHex1.length === 64, 'Output is 256 bits (64 hex characters)');

// 5.2 Wire Codec Round-Trip Test
const remittance = {
  roleTag: testRole,
  sessionId: testSession,
  nonceHex: testNonce,
  authDigestHex: digestHex1,
  domainTag: testDomain
};

const wireBytes = MqttByteRemittanceCodec.assembleMqttAuthRemittancePacket(remittance, 0x18);
assert(wireBytes[0] === 0xF0, 'Wire packet byte 0 is 0xF0 (MQTT AUTH packet)');
const disassembled = MqttByteRemittanceCodec.disassembleMqttAuthRemittancePacket(wireBytes);
assert(disassembled.packetType === 'AUTH', 'Disassembler correctly identifies AUTH packet');
assert(disassembled.reasonCode === 0x18, 'Reason code 0x18 (Continue Authentication) verified');
assert(disassembled.remittance.role === testRole, 'Remittance payload extracted with matching role');
assert(disassembled.remittance.digest === digestHex1, 'Remittance payload extracted with matching digest');

// -----------------------------------------------------------------------------
// 6. ADVERSARIAL VIRTUAL TESTING SUITE (ALL 6 VECTORS)
// -----------------------------------------------------------------------------
console.log('\n[SECTION 6] Adversarial Attack Simulation & Reassurance Verification');
const suiteReport = agent.runVirtualTestingSuite();

suiteReport.results.forEach(r => {
  assert(r.passed, `Virtual Attack Test [${r.testId}]: ${r.name} -> ${r.actual}`);
});
assert(suiteReport.allPassed, 'All 6 adversarial attack simulations passed with zero security leakage');

// -----------------------------------------------------------------------------
// 7. REGRESSION TEST VERIFICATION
// -----------------------------------------------------------------------------
console.log('\n[SECTION 7] Platform Regression Suite Verification');
try {
  const { execSync } = require('child_process');
  console.log('  Running scripts/test_team_desk_headless.js regression test...');
  execSync('node scripts/test_team_desk_headless.js', { stdio: 'pipe' });
  assert(true, 'Regression test scripts/test_team_desk_headless.js passed with 0 errors');
} catch (e) {
  assert(false, `Regression test failed: ${e.message}`);
}

console.log(`\n================================================================`);
console.log(`📊 FINAL RESULT: ${passCount} / ${totalTests} TESTS PASSED (${((passCount / totalTests) * 100).toFixed(1)}%)`);
console.log(`================================================================`);

if (passCount !== totalTests) {
  process.exit(1);
} else {
  process.exit(0);
}
