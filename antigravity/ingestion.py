"""
Antigravity Ingestion Module: PDFClassifier and AcademiaPDFConnector
Manages local PDF corpus indexing, subject categorization, and connector integration.
"""

import os
import json

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")

class AcademiaPDFConnector:
    """
    Connector for local and remote Academia.edu PDF Bundles.
    """
    def __init__(self, uri="attached::local/academia-pdf-bundle", auth="antigravity-core-key", verify_source=True):
        self.uri = uri
        self.auth = auth
        self.verify_source = verify_source
        self.connected = True
        self.base_dir = DOWNLOADS_DIR

    def get_catalog_path(self):
        return os.path.join(self.base_dir, "pdf_subject_catalog.json")

class PDFClassifier:
    """
    PDF Subject Classifier and Ingestion Scanner.
    Loads and inspects document repositories and categorizes them by physical domain.
    """
    def __init__(self):
        self.scanner_name = None
        self.catalog_data = None

    def load_scanner(self, scanner_name="most_similar_papers_to_this_one"):
        self.scanner_name = scanner_name
        catalog_file = os.path.join(DOWNLOADS_DIR, "pdf_subject_catalog.json")
        if os.path.exists(catalog_file):
            with open(catalog_file, 'r', encoding='utf-8') as fp:
                self.catalog_data = json.load(fp)
        return self

    def scan_all(self, source):
        """
        Scan all indexed documents from connector source.
        Returns list of document specs with identified subjects and routing tags.
        """
        if not self.catalog_data:
            self.load_scanner()

        records = self.catalog_data.get('records', []) if self.catalog_data else []
        inventory = []

        for r in records:
            # Only route identified physics papers to active physics pipelines
            if r.get('is_physics', False):
                tags = []
                subj = r.get('identified_subject', '')
                if 'Neutrino' in subj or 'Liquid Argon' in subj:
                    tags.extend(['Neutrino', 'Liquid_Argon', 'Experimental_Physics'])
                elif 'Muon' in subj or 'Cooling' in subj:
                    tags.extend(['Muon', 'Beam_Dynamics', 'Cooling'])
                elif 'Cosmic' in subj:
                    tags.extend(['Cosmic_Ray', 'Muon', 'Atmospheric'])
                elif 'Deep Learning' in subj or 'Computational' in subj:
                    tags.extend(['Computational', 'Deep_Learning', 'Particle_Reconstruction'])
                elif 'Harmonic' in subj or 'Fourier' in subj:
                    tags.extend(['Harmonic_Analysis', 'Fourier_Multipliers', 'Operator_Semigroups', 'Differential_Geometry', 'Curvature'])

                spec = {
                    "filename": r.get('filename'),
                    "address": r.get('new_address'),
                    "original_address": r.get('original_address'),
                    "identified_subject": subj,
                    "tags": tags,
                    "is_physics": True,
                    "status": r.get('status')
                }
                inventory.append(spec)

        print(f"[PDFClassifier] Scanned {len(inventory)} physics documents ready for routing.")
        return inventory
