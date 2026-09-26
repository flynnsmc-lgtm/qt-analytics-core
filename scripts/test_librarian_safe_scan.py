#!/usr/bin/env python3
"""
Test Suite: Librarian Agent Safe Scan & Verification
Verifies read-only integrity, deduplication accuracy, domain taxonomy, and search performance.
"""

import os
import sys
import unittest
import tempfile
import json
from datetime import datetime

# Adjust path to import librarian_core
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from scripts.librarian_core import (
    LibrarianAgent,
    compute_sha256,
    classify_domain,
    DOMAIN_KEYWORDS
)

class TestLibrarianCore(unittest.TestCase):

    def setUp(self):
        # Create a isolated temporary test directory structure mimicking the library
        self.test_dir = tempfile.TemporaryDirectory()
        self.lib_root = os.path.join(self.test_dir.name, "TestGoldStandardLibrary")
        self.inbox = os.path.join(self.lib_root, "Inbox_DropZone")
        self.archive = os.path.join(self.lib_root, "Lithotheca_Archive")
        self.journal = os.path.join(self.lib_root, "Agent_Journal_Workspace")
        os.makedirs(self.inbox, exist_ok=True)
        os.makedirs(self.archive, exist_ok=True)
        os.makedirs(self.journal, exist_ok=True)

        # Create sample dummy documents
        self.doc1_content = b"%PDF-1.4 Harmonic Resonance and Telluric Electromagnetism Invariant Field Study"
        self.doc1_path = os.path.join(self.inbox, "harmonic_resonance_01.pdf")
        with open(self.doc1_path, "wb") as f:
            f.write(self.doc1_content)

        # Create an exact duplicate of doc1 in archive
        self.doc1_duplicate_path = os.path.join(self.archive, "harmonic_resonance_duplicate.pdf")
        with open(self.doc1_duplicate_path, "wb") as f:
            f.write(self.doc1_content)

        # Create a different document for muon physics
        self.doc2_content = b"%PDF-1.4 Ionization Cooling Ring For Muons and Beam Emittance"
        self.doc2_path = os.path.join(self.inbox, "muon_cooling_test.pdf")
        with open(self.doc2_path, "wb") as f:
            f.write(self.doc2_content)

    def tearDown(self):
        self.test_dir.cleanup()

    def test_sha256_hash_identity(self):
        """Verify identical content produces identical hashes."""
        h1 = compute_sha256(self.doc1_path)
        h2 = compute_sha256(self.doc1_duplicate_path)
        h3 = compute_sha256(self.doc2_path)
        
        self.assertEqual(h1, h2, "Identical content must produce identical hash")
        self.assertNotEqual(h1, h3, "Different content must produce different hash")

    def test_domain_classification(self):
        """Verify domain taxonomy classifier assigns correct subjects."""
        domain1 = classify_domain("Harmonic Fourier Multipliers", "Study of Semigroup and Hardy spaces", "paper1.pdf")
        self.assertEqual(domain1, "01_Harmonic_Analysis_and_Mathematics")

        domain2 = classify_domain("Ionization Cooling Ring for Muons", "Beam emittance reduction in muon collider", "paper2.pdf")
        self.assertEqual(domain2, "02_Particle_and_Muon_Physics")

        domain3 = classify_domain("Vertical Handoff Decision in Wireless Networks", "LTE fuzzy handover algorithm", "handover.pdf")
        self.assertEqual(domain3, "04_Communications_and_Network_Optimization")

    def test_safe_scan_non_destructive(self):
        """Verify scan indexes documents, detects duplicates, and NEVER alters files."""
        agent = LibrarianAgent(primary_root=self.lib_root, secondary_sources=[])
        
        # Record pre-scan modification times
        mtime_before = os.path.getmtime(self.doc1_path)
        
        summary = agent.scan_ecosystem()
        
        # Verify scan counts
        self.assertEqual(summary["total_scanned_files"], 3)
        self.assertEqual(summary["unique_content_hashes"], 2)
        self.assertEqual(summary["duplicate_content_clusters"], 1)
        self.assertEqual(summary["total_duplicate_files"], 1)

        # Verify file on disk is completely untouched
        mtime_after = os.path.getmtime(self.doc1_path)
        self.assertEqual(mtime_before, mtime_after, "File modification time must remain unchanged")
        self.assertTrue(os.path.exists(self.doc1_path), "File must not be deleted or moved during scan")

    def test_search_functionality(self):
        """Verify search query matching."""
        agent = LibrarianAgent(primary_root=self.lib_root, secondary_sources=[])
        agent.scan_ecosystem()
        
        results = agent.search("Harmonic")
        self.assertTrue(len(results) >= 1)
        self.assertIn("harmonic", results[0]["title"].lower())

        results_muon = agent.search("Muon")
        self.assertTrue(len(results_muon) >= 1)
        self.assertIn("muon", results_muon[0]["title"].lower())

if __name__ == "__main__":
    unittest.main(verbosity=2)
