const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');

for (let i = 1; i <= 7; i++) {
  if (!html.includes(`id="eq-card-${i}"`)) {
    throw new Error(`Missing eq-card-${i}`);
  }
  if (!html.includes(`id="eq-drawer-${i}"`)) {
    throw new Error(`Missing eq-drawer-${i}`);
  }
  if (!html.includes(`data-eq="${i}"`)) {
    throw new Error(`Missing data-eq="${i}"`);
  }
}

if (!html.includes('id="equation-modal-backdrop"')) {
  throw new Error('Missing equation-modal-backdrop');
}
if (!html.includes('id="btn-eq-expand-all"')) {
  throw new Error('Missing btn-eq-expand-all');
}
if (!html.includes('id="btn-eq-collapse-all"')) {
  throw new Error('Missing btn-eq-collapse-all');
}

console.log('VALIDATION SUCCESS: All 7 equation cards, expandable drawers, toolbar, and modal popup elements are 100% verified present.');
