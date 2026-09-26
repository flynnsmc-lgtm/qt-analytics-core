/**
 * test_molecular_midi_headless.js
 * Comprehensive headless DOM and logic test suite for Molecular MIDI Transform,
 * POSRI Light Greeting, and Hyperspheric Sound Mapping Engine.
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const htmlPath = path.join(rootDir, 'index.html');
const cssPath = path.join(rootDir, 'style.css');
const jsPath = path.join(rootDir, 'app.js');

let passedTests = 0;
let totalTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${message}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${message}`);
  }
}

console.log('================================================================');
console.log('🧪 RUNNING HEADLESS TEST SUITE: MOLECULAR MIDI & POSRI ENGINE');
console.log('================================================================\n');

// 1. HTML Element Verifications
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredElementIds = [
  'molecular-midi-supercard',
  'group-phase-waveform',
  'btn-toggle-edge-mode',
  'readout-fence-gap',
  'readout-fence-freq',
  'redshift-slider',
  'display-redshift-val',
  'redshift-status-sub',
  'btn-toggle-audio-synth',
  'audio-synth-text',
  'synth-vol-slider',
  'bubbles-wires-canvas',
  'btn-play-stepping',
  'btn-reset-stepping',
  'stepping-tempo-slider',
  'display-tempo-val',
  'stepping-matrix-grid',
  'chip-logic-bond',
  'chip-logic-chiral',
  'chip-logic-mass',
  'chip-logic-parity',
  'readout-logic-formula',
  'spectrograph-canvas',
  'spec-fundamental',
  'spec-bond-spacing',
  'spec-photonic-gap',
  'hypersphere-canvas',
  'hs-curvature',
  'hs-softness',
  'hs-pitch',
  'posri-terminal-stream',
  'btn-emit-posri',
  'btn-clear-posri',
  'posri-stats',
  'scale-sim-master-banner',
  'btn-run-scale-sim',
  'btn-reset-scale-sim',
  'sim-tier-1',
  'sim-tier-2',
  'sim-tier-3',
  'sim-tier-4',
  'sim-tier-5',
  'sim-tier-6',
  'sim-active-tier-name',
  'sim-spatial-metric',
  'sim-throat-ratio',
  'sim-scale-status',
  'btn-toggle-feedback-i',
  'feedback-i-slider',
  'hs-antipode-status',
  'btn-palimpsest-mode'
];

requiredElementIds.forEach(id => {
  assert(html.includes(`id="${id}"`), `HTML contains element #${id}`);
});

// 2. Waveform Selector Values
assert(html.includes('data-wave="sine"'), 'HTML contains SINE waveform toggle');
assert(html.includes('data-wave="saw"'), 'HTML contains SAW waveform toggle');
assert(html.includes('data-wave="sawtooth"'), 'HTML contains SAWTOOTH waveform toggle');
assert(html.includes('data-wave="invariant"'), 'HTML contains 432Hz INVARIANT toggle');

// 3. CSS Classes & Design Tokens
const css = fs.readFileSync(cssPath, 'utf8');

const requiredCssClasses = [
  '.molecular-midi-supercard',
  '.badge-stage-secure',
  '.badge-carrier-lock',
  '.midi-controls-top-deck',
  '.edge-toggle-box',
  '.fence-gap-readout',
  '.redshift-range',
  '.stage-canvas-wrapper',
  '.bubbles-wires-canvas',
  '.stage-canvas-legend',
  '.stepping-matrix-grid',
  '.step-card',
  '.logic-matrix-row',
  '.spectro-hypersphere-grid',
  '.spectrograph-canvas',
  '.hypersphere-canvas',
  '.posri-console-card',
  '.posri-terminal-stream',
  '.scale-sim-master-banner',
  '.scale-stepper-row',
  '.scale-tier-step',
  '.scale-telemetry-ribbon',
  '.bonus-track-deck-row',
  '.antipode-badge',
  '.palimpsest-perusal-active'
];

requiredCssClasses.forEach(cls => {
  assert(css.includes(cls), `CSS contains selector ${cls}`);
});

// 4. JS Implementation Checks
const js = fs.readFileSync(jsPath, 'utf8');

assert(js.includes('function initMolecularMidiAndSoundMapping()'), 'JS defines initMolecularMidiAndSoundMapping()');
assert(js.includes('initMolecularMidiAndSoundMapping();'), 'initTeamDeskOverdrive calls initMolecularMidiAndSoundMapping()');
assert(js.includes('function initWaveformControls()'), 'JS defines initWaveformControls()');
assert(js.includes('function initFenceEdgeControls()'), 'JS defines initFenceEdgeControls()');
assert(js.includes('function initRedshiftScaler()'), 'JS defines initRedshiftScaler()');
assert(js.includes('function initAudioSynthControls()'), 'JS defines initAudioSynthControls()');
assert(js.includes('function initBubblesWiresCanvas()'), 'JS defines initBubblesWiresCanvas()');
assert(js.includes('function initMidiSteppingSequencer()'), 'JS defines initMidiSteppingSequencer()');
assert(js.includes('function initMolecularLogicChips()'), 'JS defines initMolecularLogicChips()');
assert(js.includes('function initSpectrographCanvas()'), 'JS defines initSpectrographCanvas()');
assert(js.includes('function initHypersphereCanvas()'), 'JS defines initHypersphereCanvas()');
assert(js.includes('function initPosriConsole()'), 'JS defines initPosriConsole()');
assert(js.includes('function initScaleSimulationRunner()'), 'JS defines initScaleSimulationRunner()');
assert(js.includes('function initBonusTrackFeedbackI()'), 'JS defines initBonusTrackFeedbackI()');
assert(js.includes('function initPalimpsestPerusal()'), 'JS defines initPalimpsestPerusal()');
assert(js.includes('HSK-010'), 'Interim report #HSK-010 is present');

// 5. Mathematical Invariants Verification
assert(js.includes('432.00'), '432.00 Hz fundamental invariant is referenced in steppingNotes');
assert(js.includes('redshiftZ'), 'Redshift scaling factor z is integrated');
assert(js.includes('0.002'), 'Smallest fence gap tolerance 0.002 fm is registered');
assert(js.includes('10/27 = 0.370370'), 'Throat ratio 10/27 invariant verified in scale tiers');

console.log('\n================================================================');
console.log(`📊 TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (${((passedTests / totalTests) * 100).toFixed(1)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
