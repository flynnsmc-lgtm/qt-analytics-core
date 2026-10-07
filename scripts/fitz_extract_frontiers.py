import fitz
import os
import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

acad_dir = r'C:\Antigravity\GoldStandardLibrary\Academia Library Downloads'

targets = [
    ("Emergent_Spacetime", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Emergent_Spacetime_Mass_Field_Modulation\Emergent_Spacetime_Mass_Field_Modulation.pdf')),
    ("Harmonic_Telluric", os.path.join(acad_dir, r'Academia.edu_Bundle_-_HARMONIC_RESONANCE_AND_TELLURIC_ELECTROM\HARMONIC_RESONANCE_AND_TELLURIC_ELECTROM.pdf')),
    ("Stellarator_Fusion", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Field_First_Geometry_in_Fusion_Research_\papers_cited_by_this_one\2_Stellarator_Physics.pdf')),
    ("Off_Shell_Wilson_Loop", os.path.join(acad_dir, r'Academia.edu_Bundle_-_An_off_shell_Wilson_loop\An_off_shell_Wilson_loop.pdf')),
    ("Underdeterminacy_Maxwell", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Underdeterminacy_and_Redundance_in_Maxwe\Underdeterminacy_and_Redundance_in_Maxwe.pdf')),
    ("Quantum_Gauge_VSR", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Quantum_gauge_freedom_in_very_special_re\Quantum_gauge_freedom_in_very_special_re.pdf')),
    ("Metriplectic_Gravity", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Metriplectic_geometry_for_gravitational_\Metriplectic_geometry_for_gravitational.pdf')),
    ("Para_Complex_Geometry", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Para_complex_geometry_and_gravitational_\Para_complex_geometry_and_gravitational.pdf')),
    ("Kadanoff_Baym_Adaptive", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Adaptive_numerical_solution_of_Kadanoff_\Adaptive_numerical_solution_of_Kadanoff.pdf')),
    ("Kadanoff_Baym_GKBA", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Comparing_the_generalized_Kadanoff_Baym_\Comparing_the_generalized_Kadanoff_Baym.pdf')),
    ("ProtoDUNE_Results", os.path.join(acad_dir, r'Academia.edu_Bundle_-_First_results_on_ProtoDUNE_SP_liquid_arg\First_results_on_ProtoDUNE_SP_liquid_arg.pdf')),
    ("Muon_Cooling_Ring", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Ionization_cooling_ring_for_muons\Ionization_cooling_ring_for_muons.pdf')),
    ("Cosmic_Muons_Callan_Glashow", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Are_All_Cosmic_Ray_Muons_Really_Muons\Are_All_Cosmic_Ray_Muons_Really_Muons.pdf')),
    ("Gravitational_Flow", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Gravitational_Flow\Gravitational_Flow.pdf')),
    ("Aerodynamic_Holography", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Aerodynamic_Holography\Aerodynamic_Holography.pdf')),
    ("Vortex_Solitons", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Vortex_Solitons_in_Quasi_Phase_Matched_P\Vortex_Solitons_in_Quasi_Phase_Matched_P.pdf')),
    ("Biaxial_Crystals", os.path.join(acad_dir, r'Academia.edu_Bundle_-_Characterization_of_biaxial_crystals_for\Characterization_of_biaxial_crystals_for.pdf')),
    ("Baryon_Color_Dynamics", os.path.join(acad_dir, r'Baryon_Color_Dynamics_and_Flux_Fields.pdf')),
    ("Callan_Fermion_Zero_Modes", os.path.join(acad_dir, r'mixed foler for filing\Author_Papers_curtis_callan_Anomalies_and_fermion_zero_mod\Anomalies_and_fermion_zero_modes_on_str.pdf')),
    ("Sabra_Black_Holes", os.path.join(acad_dir, r'mixed foler for filing\Author_Papers_wafic_sabra_Black_holes_and_flop_transitio\Black_holes_and_flop_transitions_in_M_t.pdf')),
    ("Sayan_Kar_Extra_Dimensions", os.path.join(acad_dir, r'mixed foler for filing\Author_Papers_sayan_kar_Can_extra_dimensional_effects\Can_extra_dimensional_effects_substitute.pdf')),
    ("Latushkin_Spectral_Mapping", os.path.join(acad_dir, r'mixed foler for filing\Author_Papers_yuri_latushkin_A_spectral_mapping_theorem_and\A_spectral_mapping_theorem_and_an_examp.pdf'))
]

results = {}

for label, p in targets:
    if not os.path.exists(p):
        # search for close match
        parent = os.path.dirname(p)
        base = os.path.basename(p)
        found = None
        if os.path.exists(parent):
            for f in os.listdir(parent):
                if f.lower().startswith(base[:15].lower()):
                    found = os.path.join(parent, f)
                    break
        if not found:
            # recursive search in parent if exists
            if os.path.exists(parent):
                for r, ds, fs in os.walk(parent):
                    for f in fs:
                        if f.endswith('.pdf'):
                            found = os.path.join(r, f)
                            break
                    if found: break
        if found:
            p = found
        else:
            results[label] = {"error": f"Path not found: {p}"}
            continue

    try:
        doc = fitz.open(p)
        meta = doc.metadata
        first_pages_text = ""
        for i in range(min(3, len(doc))):
            first_pages_text += doc[i].get_text() + "\n--- PAGE BREAK ---\n"
        
        results[label] = {
            "path": p,
            "title": meta.get("title", ""),
            "author": meta.get("author", ""),
            "pages": len(doc),
            "text": first_pages_text[:3500]
        }
        doc.close()
    except Exception as e:
        results[label] = {"error": str(e)}

with open('fitz_extracted_key_papers.json', 'w', encoding='utf-8') as f:
    json.dump(results, f, indent=2)

print(f"Successfully processed {len(results)} frontier papers.")
for label, data in results.items():
    if "error" in data:
        print(f"[-] {label}: {data['error']}")
    else:
        first_line = data['text'].strip().split('\n')[0] if data['text'].strip() else "Empty text"
        print(f"[+] {label}: {data.get('title') or first_line[:60]} (Pages: {data['pages']})")
