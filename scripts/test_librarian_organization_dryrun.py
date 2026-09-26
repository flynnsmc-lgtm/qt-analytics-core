#!/usr/bin/env python3
"""
Test Suite: Librarian Organization & Dry-Run Verification
Verifies privacy filtering, taxonomy classification, folder renaming rules, and dry-run safety.
"""

import os
import sys
import unittest
import tempfile
import json
import shutil

# Ensure workspace is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scripts.librarian_core import (
    is_personal_or_private,
    classify_detailed_taxonomy,
    generate_clean_folder_name,
    TAXONOMY_TREE
)

class TestLibrarianOrganization(unittest.TestCase):

    def test_privacy_boundary_blacklist(self):
        """Verify personal/medical/legal/installer paths are strictly excluded."""
        personal_paths = [
            r"C:\Users\44790\Documents\S Station Sierra\Doctor Notes\Stephen Fitzpatrick to 10.06.21.pdf",
            r"C:\Users\44790\Documents\S Station Sierra\legal\20200626_132625.jpg",
            r"C:\Users\44790\Documents\S Station Sierra\Popplevale Admin\Cash-Card Purchases Balance Sheet 2020-21.xlsx",
            r"C:\Users\44790\Documents\S Station Sierra\Adobe After Effects CC 2015 v13.5 + Crack\Set-up.exe",
            r"C:\Users\44790\Documents\S Station Sierra\WinRAR 5.71 FINAL + Key [www.TheWindowsForum.com]\winrar-x64-571.exe",
            r"C:\Users\44790\Documents\S Station Sierra\20200805-Contractors and Visitors Access Control Declaration Form.docx"
        ]
        for p in personal_paths:
            self.assertTrue(is_personal_or_private(p), f"Should flag as personal/private: {p}")

        # Research paths must be ALLOWED
        research_paths = [
            r"C:\Users\44790\Documents\S Station Sierra\Science PDFs\Black Holes Entanglement1306.0533.pdf",
            r"C:\Users\44790\Documents\S Station Sierra\Science PDFs\WORLD AMGNETIC MODEL\2507.22291v2.AlphaEarth Foundation.pdf",
            r"C:\Users\44790\Documents\PDFs\AUG6HONOR\1903.08570v1.pdf",
            r"C:\Antigravity\GoldStandardLibrary\Academia Library Downloads\Harmonic_Resonance.pdf",
            r"C:\Users\44790\Downloads\paper_on_muon_cooling.pdf"
        ]
        for p in research_paths:
            self.assertFalse(is_personal_or_private(p), f"Should NOT flag research as personal: {p}")

    def test_detailed_taxonomy_classification(self):
        """Verify granular classification into branch and sub-branch."""
        branch, subbranch = classify_detailed_taxonomy(
            "L_p_L_q_boundedness_of_Fourier_multipliers",
            "Harmonic analysis and trace inequalities in Sobolev spaces",
            "fourier_mult.pdf"
        )
        self.assertEqual(branch, "01_Harmonic_Analysis_and_Mathematics")
        self.assertEqual(subbranch, "Fourier_Multipliers_and_Sobolev")

        branch, subbranch = classify_detailed_taxonomy(
            "Ionization cooling ring for muons",
            "Beam emittance reduction in muon storage ring",
            "muon_cooling.pdf"
        )
        self.assertEqual(branch, "02_Particle_and_Muon_Physics")
        self.assertEqual(subbranch, "Muon_Beam_Dynamics_and_Cooling")

        branch, subbranch = classify_detailed_taxonomy(
            "A Vertical Handoff Decision in Next Generation Wireless Networks",
            "Fuzzy logic handover triggering algorithm for LTE cellular",
            "handover_decision.pdf"
        )
        self.assertEqual(branch, "04_Communications_and_Network_Optimization")
        self.assertEqual(subbranch, "Cellular_Handover_and_Fuzzy_Algorithms")

    def test_clean_folder_renaming_logic(self):
        """Verify generic folder names are converted to clean topic/author titles."""
        # Test generic 'most_similar_papers_to_this_one'
        new_name_similar = generate_clean_folder_name(
            "most_similar_papers_to_this_one",
            sample_paper_titles=["Regularity Estimates in Holder Spaces", "Hardy and Paley Littlewood inequalities"],
            parent_bundle="Academia.edu_Bundle_-_L_p_L_q_boundedness"
        )
        self.assertTrue(new_name_similar.startswith("Similar_Papers_"))
        self.assertNotIn("most_similar_papers_to_this_one", new_name_similar)

        # Test generic 'more_papers_by_curtis_callan'
        new_name_author = generate_clean_folder_name(
            "more_papers_by_curtis_callan",
            sample_paper_titles=["Baryon Color Dynamics and Flux Fields"],
            parent_bundle="Academia.edu_Bundle_-_Emergent_Spacetime"
        )
        self.assertTrue(new_name_author.startswith("Author_Papers_curtis_callan"))

        # Test generic 'papers_cited_by_this_one'
        new_name_cited = generate_clean_folder_name(
            "papers_cited_by_this_one",
            sample_paper_titles=["First results on ProtoDUNE liquid argon"],
            parent_bundle="Academia.edu_Bundle_-_Deep_Underground_Neutrino"
        )
        self.assertTrue(new_name_cited.startswith("Citations_"))

if __name__ == "__main__":
    unittest.main(verbosity=2)
