import json
import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

with open('bundle_analysis_cache.json', 'r', encoding='utf-8') as f:
    bundles = json.load(f)

keywords = [
    'kadanoff', 'wilson', 'gauge', 'maxwell', 'spacetime', 'fusion', 
    'gravitat', 'muon', 'dune', 'harmonic', 'holograph', 'vortex', 
    'dirac', 'flux', 'para_complex', 'metriplectic', 'wormhole', 
    'soliton', 'eigenmode', 'quantum', 'spectral', 'telluric',
    'fourier', 'inequalit', 'hyperbolic', 'semi_implicit', 'cooling',
    'callan', 'latushkin', 'sabra', 'kar', 'crystal', 'baryon', 'modulat'
]

physics_bundles = []
for b in bundles:
    text = (b['bundle'] + ' ' + b['lead_file'] + ' ' + b['title'] + ' ' + b['snippet']).lower()
    matches = [k for k in keywords if k in text]
    if matches:
        physics_bundles.append((b, matches))

print(f"Total Physics & Mathematical Frontiers identified: {len(physics_bundles)}")

# Group by major frontier
frontiers = {
    "1. Gauge Fields, Wilson Loops, Non-Equilibrium QFT & Mass Gap": [],
    "2. Emergent Spacetime, Gravitation, Wormholes & Geometric Flow": [],
    "3. Plasma, Fusion Geometry & Metriplectic Systems": [],
    "4. Particle Physics, Muons, Neutrinos (DUNE) & Cosmic Radiation": [],
    "5. Holography, Solitons, Vortex Optics & Harmonic Resonance": [],
    "6. Mathematical Physics, Spectral Semigroups, Dirac Operators & Fourier Multipliers": [],
    "7. Sensor Networks, Cybernetics, Verification & Quantum Information": []
}

for b, matches in physics_bundles:
    bname = b['bundle'].lower()
    txt = (bname + ' ' + b['lead_file'] + ' ' + b['snippet']).lower()
    
    if any(k in txt for k in ['wilson', 'kadanoff', 'gauge', 'maxwell', 'baryon']):
        frontiers["1. Gauge Fields, Wilson Loops, Non-Equilibrium QFT & Mass Gap"].append(b)
    elif any(k in txt for k in ['spacetime', 'wormhole', 'gravitat', 'para_complex', 'flow']):
        frontiers["2. Emergent Spacetime, Gravitation, Wormholes & Geometric Flow"].append(b)
    elif any(k in txt for k in ['fusion', 'metriplectic', 'flux']):
        frontiers["3. Plasma, Fusion Geometry & Metriplectic Systems"].append(b)
    elif any(k in txt for k in ['muon', 'dune', 'neutrino', 'cosmic', 'cooling']):
        frontiers["4. Particle Physics, Muons, Neutrinos (DUNE) & Cosmic Radiation"].append(b)
    elif any(k in txt for k in ['holograph', 'vortex', 'soliton', 'telluric', 'harmonic', 'crystal', 'optical']):
        frontiers["5. Holography, Solitons, Vortex Optics & Harmonic Resonance"].append(b)
    elif any(k in txt for k in ['dirac', 'eigenmode', 'fourier', 'hyperbolic', 'inequalit', 'semigroup', 'hardy']):
        frontiers["6. Mathematical Physics, Spectral Semigroups, Dirac Operators & Fourier Multipliers"].append(b)
    else:
        frontiers["7. Sensor Networks, Cybernetics, Verification & Quantum Information"].append(b)

for fname, blist in frontiers.items():
    print(f"\n========================================================")
    print(f"{fname} ({len(blist)} bundles)")
    print(f"========================================================")
    for b in blist:
        print(f"* Bundle: {b['bundle']}")
        print(f"  Lead: {b['lead_file']} | PDFs: {b['total_pdfs']}")
        if b['title']:
            print(f"  Title: {b['title']}")
        if b['author']:
            print(f"  Author: {b['author']}")
        if b['snippet']:
            clean_snip = ' '.join(b['snippet'].split())
            print(f"  Excerpt: {clean_snip[:220]}...")
        print()
