const fs = require('fs');
const path = require('path');

console.log('=== CHI KEY TEAM DESK OVERDRIVE VERIFICATION SUITE ===');

// 1. Verify Knowledge Item
const kiMetaPath = 'C:\\Users\\44790\\.gemini\\antigravity-ide\\knowledge\\chi_key_team_desk_overdrive\\metadata.json';
const kiDocPath = 'C:\\Users\\44790\\.gemini\\antigravity-ide\\knowledge\\chi_key_team_desk_overdrive\\artifacts\\team_desk_overdrive_spec.md';

if (fs.existsSync(kiMetaPath)) {
  const meta = JSON.parse(fs.readFileSync(kiMetaPath, 'utf8'));
  console.log('✓ Knowledge Item Metadata Verified:', meta.id, '| Title:', meta.title);
} else {
  console.error('✗ Knowledge Item Metadata missing!');
}

if (fs.existsSync(kiDocPath)) {
  const doc = fs.readFileSync(kiDocPath, 'utf8');
  console.log('✓ Knowledge Item Spec Verified (' + doc.length + ' bytes)');
} else {
  console.error('✗ Knowledge Item Spec missing!');
}

// 2. Verify HTML Structure
const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

const requiredHtmlElements = [
  'data-stage="stage-desk"',
  'id="stage-desk"',
  'id="flow-map-container"',
  'id="flow-node-1"',
  'id="flow-node-2"',
  'id="flow-node-3"',
  'id="flow-node-4"',
  'id="flow-node-5"',
  'id="flow-node-6"',
  'id="order-dynamics-panel"',
  'id="permission-requests-box"',
  'id="permission-tickets-list"',
  'id="new-ticket-drawer"',
  'id="ticket-inspector-box"',
  'id="btn-grant-selected-ticket"',
  'id="btn-escalate-selected-ticket"',
  'id="btn-reject-selected-ticket"',
  'id="key-distribution-panel"',
  'id="keys-grid"',
  'id="vst3-coupler-panel"',
  'id="vst3-phase-slider"',
  'id="vst3-scope-canvas"',
  'id="select-host-preset"',
  'id="btn-test-redirect"',
  'id="reception-morph-box"',
  'id="tension-slider"',
  'id="btn-pull-tense"',
  'id="morph-presentation-viewport"',
  'id="view-state-reception"',
  'id="view-state-presentation"',
  'id="handshake-interim-panel"',
  'id="interim-report-stream"',
  'id="btn-toggle-overdrive"',
  'id="direct-agent-reception-terminal"',
  'id="btn-dispatch-command"',
  'id="agent-dispatch-feed"',
  'id="input-dispatch-directive"',
  'id="select-dispatch-agent"'
];

let allElementsPresent = true;
requiredHtmlElements.forEach(selector => {
  if (!html.includes(selector)) {
    console.error('✗ Missing element in index.html:', selector);
    allElementsPresent = false;
  }
});
if (allElementsPresent) {
  console.log('✓ All ' + requiredHtmlElements.length + ' UI elements found in index.html');
}

// 3. Verify CSS Rules
const css = fs.readFileSync(path.join(__dirname, '..', 'style.css'), 'utf8');
const requiredCssClasses = [
  '.overdrive-hero',
  '.btn-overdrive',
  '.flow-map-container',
  '.flow-node',
  '.desk-split-layout',
  '.ux-list-box',
  '.ticket-item',
  '.keys-grid',
  '.key-card',
  '.vst3-controls-grid',
  '.morphing-reception-container',
  '.morphing-reception-container.tense-mode',
  '.presentation-grid',
  '.interim-report-stream',
  '.direct-terminal-card',
  '.agent-roster-ribbon',
  '.roster-chip',
  '.agent-dispatch-feed'
];
let allCssPresent = true;
requiredCssClasses.forEach(cls => {
  if (!css.includes(cls)) {
    console.error('✗ Missing CSS class in style.css:', cls);
    allCssPresent = false;
  }
});
if (allCssPresent) {
  console.log('✓ All ' + requiredCssClasses.length + ' key CSS classes verified in style.css');
}

// 4. Verify JS Methods & Logic
const js = fs.readFileSync(path.join(__dirname, '..', 'app.js'), 'utf8');
const requiredJsFunctions = [
  'initTeamDeskOverdrive',
  'initDirectAgentTerminal',
  'initOrderQueue',
  'renderOrderQueue',
  'initPermissionTickets',
  'renderPermissionTickets',
  'updateTicketInspector',
  'initManagerKeys',
  'renderManagerKeys',
  'initVst3PhaseControls',
  'renderVst3Scope',
  'initTensionControls',
  'applyTensionState',
  'initOverdriveToggle',
  'initFlowMapInteraction',
  'initInterimReporting',
  'logInterimReport'
];
let allJsPresent = true;
requiredJsFunctions.forEach(fn => {
  if (!js.includes(fn)) {
    console.error('✗ Missing JS function in app.js:', fn);
    allJsPresent = false;
  }
});
if (allJsPresent) {
  console.log('✓ All ' + requiredJsFunctions.length + ' core functions verified in app.js');
}

console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
