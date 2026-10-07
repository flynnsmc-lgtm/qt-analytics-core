import os
import zlib
import re
import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

acad_dir = r'C:\Antigravity\GoldStandardLibrary\Academia Library Downloads'

papers_to_inspect = [
    ('An_off_shell_Wilson_loop', r'Academia.edu_Bundle_-_An_off_shell_Wilson_loop\An_off_shell_Wilson_loop.pdf'),
    ('Emergent_Spacetime_Mass_Field_Modulation', r'Academia.edu_Bundle_-_Emergent_Spacetime_Mass_Field_Modulation\Emergent_Spacetime_Mass_Field_Modulation.pdf'),
    ('Metriplectic_geometry', r'Academia.edu_Bundle_-_Metriplectic_geometry_for_gravitational_\Metriplectic_geometry_for_gravitational.pdf'),
    ('Para_complex_geometry', r'Academia.edu_Bundle_-_Para_complex_geometry_and_gravitational_\Para_complex_geometry_and_gravitational.pdf'),
    ('Quantum_gauge_freedom', r'Academia.edu_Bundle_-_Quantum_gauge_freedom_in_very_special_re\Quantum_gauge_freedom_in_very_special_re.pdf'),
    ('Underdeterminacy_in_Maxwell', r'Academia.edu_Bundle_-_Underdeterminacy_and_Redundance_in_Maxwe\Underdeterminacy_and_Redundance_in_Maxwe.pdf'),
    ('Kadanoff_Baym_Adaptive', r'Academia.edu_Bundle_-_Adaptive_numerical_solution_of_Kadanoff_\Adaptive_numerical_solution_of_Kadanoff.pdf'),
    ('Entanglement_entropy_Wilson_loop', r'Academia.edu_Bundle_-_Entanglement_entropy_and_Wilson_loop\Entanglement_entropy_and_Wilson_loop.pdf'),
    ('Harmonic_Resonance_Telluric', r'Academia.edu_Bundle_-_HARMONIC_RESONANCE_AND_TELLURIC_ELECTROM\HARMONIC_RESONANCE_AND_TELLURIC_ELECTROM.pdf'),
    ('Wormhole_from_gravitational_collapse', r'Academia.edu_Bundle_-_Wormhole_geometry_from_gravitatio\Wormhole_geometry_from_gravitational_col.pdf'),
    ('Are_All_Muons_Really_Muons', r'Academia.edu_Bundle_-_Are_All_Cosmic_Ray_Muons_Really_Muons\Are_All_Cosmic_Ray_Muons_Really_Muons.pdf'),
    ('Ionization_cooling_ring', r'Academia.edu_Bundle_-_Ionization_cooling_ring_for_muons\Ionization_cooling_ring_for_muons.pdf'),
    ('Aerodynamic_Holography', r'Academia.edu_Bundle_-_Aerodynamic_Holography\Aerodynamic_Holography.pdf'),
    ('Vortex_Holography', r'Academia.edu_Bundle_-_Vortex_holography\Vortex_holography.pdf'),
    ('Dirac_eigenmodes', r'Academia.edu_Bundle_-_On_eigenmode_approximation_for_Di\On_eigenmode_approximation_for_Dirac_equ.pdf'),
    ('Fourier_multipliers', r'Academia.edu_Bundle_-__L_p_L_q_boundedness_of_Fourier_m\L_p_L_q_boundedness_of_Fourier_multipli.pdf')
]

# Also check Field First Geometry
ff_dir = os.path.join(acad_dir, 'Academia.edu_Bundle_-_Field_First_Geometry_in_Fusion_Research_')
if os.path.exists(ff_dir):
    ff_pdfs = [f for f in os.listdir(ff_dir) if f.endswith('.pdf')]
    print("Field first PDFs:", ff_pdfs)

def extract_full_first_pages(pdf_path):
    if not os.path.exists(pdf_path):
        return f"File not found: {pdf_path}"
    
    with open(pdf_path, 'rb') as f:
        data = f.read(1500000)
        
    streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', data, re.DOTALL)
    text_pieces = []
    for s in streams:
        try:
            decomp = zlib.decompress(s)
            # Find Tj and TJ
            tjs = re.findall(rb'\((.*?)\)\s*Tj', decomp)
            for t in tjs:
                decoded = t.decode('latin1', 'ignore')
                if len(decoded.strip()) > 1:
                    text_pieces.append(decoded)
            tjs_arr = re.findall(rb'\[(.*?)\]\s*TJ', decomp, re.DOTALL)
            for arr in tjs_arr:
                inner = re.findall(rb'\((.*?)\)', arr)
                decoded = ''.join([i.decode('latin1', 'ignore') for i in inner])
                if len(decoded.strip()) > 1:
                    text_pieces.append(decoded)
        except:
            pass
        if len(' '.join(text_pieces)) > 3000:
            break
            
    return ' '.join(text_pieces)[:2500]

print("="*80)
print("EXTRACTING CORE CONTENT FROM LEAD PAPERS")
print("="*80)

detailed_reports = {}
for key, rel in papers_to_inspect:
    full_path = os.path.join(acad_dir, rel)
    content = extract_full_first_pages(full_path)
    clean_content = ' '.join(content.split())
    detailed_reports[key] = clean_content
    print(f"\n>>> [{key}]")
    print(clean_content[:600] + "...\n")

with open('key_papers_extracted.json', 'w', encoding='utf-8') as f:
    json.dump(detailed_reports, f, indent=2)
