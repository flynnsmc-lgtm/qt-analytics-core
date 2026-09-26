import os
import shutil
import json

BASE_DOWNLOADS = r'c:\Users\44790\.gemini\antigravity-ide\scratch\chi-physics-core\downloads'

catalog = {
    'total_scanned': 0,
    'physics_addresses_replaced': 0,
    'non_physics_addresses_preserved': 0,
    'subject_breakdown': {},
    'records': []
}

# 1. Academia bundle most_similar_papers_to_this_one
academia_ms = os.path.join(BASE_DOWNLOADS, 'Academia.edu_Bundle_-__L_p_L_q_boundedness_of_Fourier_multipli', 'most_similar_papers_to_this_one')
academia_target = os.path.join(BASE_DOWNLOADS, 'Academia.edu_Bundle_-__L_p_L_q_boundedness_of_Fourier_multipli', 'Harmonic_Analysis_and_Fourier_Multipliers')

if os.path.exists(academia_ms):
    ac_files = os.listdir(academia_ms)
    print(f'[ACADEMIA BUNDLE] Found {len(ac_files)} files in {academia_ms}')
    os.rename(academia_ms, academia_target)
    print(f'[ACADEMIA BUNDLE] Successfully renamed directory to: {academia_target}')
    catalog['subject_breakdown']['Harmonic Analysis & Fourier Multipliers (Academia Bundle)'] = len(ac_files)
    for f in sorted(ac_files):
        catalog['total_scanned'] += 1
        catalog['physics_addresses_replaced'] += 1
        catalog['records'].append({
            'filename': f,
            'original_address': os.path.join(academia_ms, f),
            'new_address': os.path.join(academia_target, f),
            'identified_subject': 'Harmonic Analysis & Fourier Multipliers',
            'is_physics': True,
            'status': 'REPLACED_WITH_PHYSICS_SUBJECT'
        })
elif os.path.exists(academia_target):
    print(f'[ACADEMIA BUNDLE] Target directory already exists at: {academia_target}')
    ac_files = os.listdir(academia_target)
    catalog['subject_breakdown']['Harmonic Analysis & Fourier Multipliers (Academia Bundle)'] = len(ac_files)
    for f in sorted(ac_files):
        catalog['total_scanned'] += 1
        catalog['physics_addresses_replaced'] += 1
        catalog['records'].append({
            'filename': f,
            'original_address': os.path.join(academia_ms, f),
            'new_address': os.path.join(academia_target, f),
            'identified_subject': 'Harmonic Analysis & Fourier Multipliers',
            'is_physics': True,
            'status': 'REPLACED_WITH_PHYSICS_SUBJECT'
        })

# 2. Main most_similar_papers_to_this_one
main_ms = os.path.join(BASE_DOWNLOADS, 'most_similar_papers_to_this_one')

non_phys_files = set([
    'ACO_ESSVHOA_Ant_Colony_Optimization_base.pdf',
    'A_Fuzzy_Based_Handover_Decision_Scheme_f.pdf',
    'A_Host_Mobility_Support_with_Adaptive_Ne.pdf',
    'A_New_Method_for_Minimizing_the_Unnecess.pdf',
    'A_New_Method_to_Improve_Frequent_Handove.pdf',
    'A_Speed_Aware_Handover_System_for_Wirele.pdf',
    'A_Vertical_Handoff_Decision_in_Next_Gene.pdf',
    'An_adaptive_fuzzy_handover_triggering_ap.pdf',
    'Ant_colony_prediction_by_using_sectorize.pdf',
    'Comparison_between_hybridized_algorithm.pdf',
    'Handoff_scheme_for_terrestrial_mobile_an.pdf',
    'Handoffs_Decision_Optimization_of_Mobile.pdf',
    'Improvement_of_Handover_Performance_Base.pdf',
    'Intelligent_Metaheuristic_based_Handover.pdf',
    'Modified_Handover_Decision_Algorithm_in.pdf',
    'Neural_Network_Based_Handoff_Status_in_C.pdf',
    'Neural_Network_Handoff_Algorithm_in_a_Jo.pdf',
    'Neural_Network_in_Intelligent_Handoff_fo.pdf',
    'Speed_and_Direction_Based_Fuzzy_Handover.pdf',
    'Support_Vector_Regressive_Dragonfly_Opti.pdf',
    'Vertical_Handoff_In_Cellular_Netowrks_us.pdf',
    'Vertical_Handoff_algorithms_using_Neural.pdf',
    'Vertical_Handover_Decision_Algorithm_Usi.pdf',
    'Vertical_Handover_Decision_Management_on.pdf'
])

if os.path.exists(main_ms):
    files = sorted(os.listdir(main_ms))
    print(f'[MAIN PAPERS] Scanning {len(files)} files in {main_ms}')
    
    subject_dirs = {
        'Neutrino_Physics_and_Liquid_Argon_Detectors': os.path.join(BASE_DOWNLOADS, 'Neutrino_Physics_and_Liquid_Argon_Detectors'),
        'Muon_Beam_Dynamics_and_Ionization_Cooling': os.path.join(BASE_DOWNLOADS, 'Muon_Beam_Dynamics_and_Ionization_Cooling'),
        'Cosmic_Ray_Physics_and_Atmospheric_Muons': os.path.join(BASE_DOWNLOADS, 'Cosmic_Ray_Physics_and_Atmospheric_Muons'),
        'Computational_Particle_Physics_and_Deep_Learning': os.path.join(BASE_DOWNLOADS, 'Computational_Particle_Physics_and_Deep_Learning'),
        'Harmonic_Analysis_and_Operator_Semigroups': os.path.join(BASE_DOWNLOADS, 'Harmonic_Analysis_and_Operator_Semigroups')
    }
    
    for sdir in subject_dirs.values():
        os.makedirs(sdir, exist_ok=True)
        
    for f in files:
        orig_addr = os.path.join(main_ms, f)
        catalog['total_scanned'] += 1
        
        if f in non_phys_files:
            catalog['non_physics_addresses_preserved'] += 1
            catalog['records'].append({
                'filename': f,
                'original_address': orig_addr,
                'new_address': orig_addr,
                'identified_subject': 'Non-Physics: Cellular & Wireless Handover Optimization (Tran Minh Quang)',
                'is_physics': False,
                'status': 'PRESERVED_ORIGINAL_NON_PHYSICS'
            })
            continue
            
        fl = f.lower()
        if any(k in fl for k in ['neutrino', 'liquid_argon', 'icarus', 'dune', 'protodune', 'lanndd', 'laguna', 'supernova']):
            subj_key = 'Neutrino_Physics_and_Liquid_Argon_Detectors'
            subj_label = 'Neutrino Physics & Liquid Argon Detectors'
        elif any(k in fl for k in ['cooling', 'muon_collider', 'rfofo', 'beam_cooling', 'storage_rings_neutrino']):
            subj_key = 'Muon_Beam_Dynamics_and_Ionization_Cooling'
            subj_label = 'Muon Beam Dynamics & Ionization Cooling'
        elif any(k in fl for k in ['cosmic', 'nusex', 'icecube', 'atmospheric_muon', 'pion_and_neutron', 'air_shower', 'primary_cosmic', 'ten_years_of_cosmic']):
            subj_key = 'Cosmic_Ray_Physics_and_Atmospheric_Muons'
            subj_label = 'Cosmic Ray Physics & Atmospheric Muons'
        elif any(k in fl for k in ['convolutional', 'deep_learning', 'cnn', 'deepcr', 'reconstruct']):
            subj_key = 'Computational_Particle_Physics_and_Deep_Learning'
            subj_label = 'Computational Particle Physics & Deep Learning'
        else:
            subj_key = 'Harmonic_Analysis_and_Operator_Semigroups'
            subj_label = 'Harmonic Analysis & Operator Semigroups'
            
        target_path = os.path.join(subject_dirs[subj_key], f)
        shutil.move(orig_addr, target_path)
        
        catalog['physics_addresses_replaced'] += 1
        catalog['subject_breakdown'][subj_label] = catalog['subject_breakdown'].get(subj_label, 0) + 1
        catalog['records'].append({
            'filename': f,
            'original_address': orig_addr,
            'new_address': target_path,
            'identified_subject': subj_label,
            'is_physics': True,
            'status': 'REPLACED_WITH_PHYSICS_SUBJECT'
        })
        
    print(f'[MAIN PAPERS] Physics papers migrated into subject directories.')
    remaining = os.listdir(main_ms)
    print(f'[MAIN PAPERS] Retained in most_similar_papers_to_this_one: {len(remaining)} non-physics documents.')
    catalog['subject_breakdown']['Non-Physics Wireless Cellular Handover (Preserved in most_similar_papers_to_this_one)'] = len(remaining)

# Write output catalog
catalog_path = os.path.join(BASE_DOWNLOADS, 'pdf_subject_catalog.json')
with open(catalog_path, 'w', encoding='utf-8') as fp:
    json.dump(catalog, fp, indent=2)

print(f'[SUCCESS] Master Catalog written to: {catalog_path}')
print(f'Total Scanned: {catalog["total_scanned"]}')
print(f'Physics Addresses Replaced: {catalog["physics_addresses_replaced"]}')
print(f'Non-Physics Preserved: {catalog["non_physics_addresses_preserved"]}')
print('\nSubject Breakdown:')
for s, c in catalog['subject_breakdown'].items():
    print(f'  - {s}: {c} papers')
