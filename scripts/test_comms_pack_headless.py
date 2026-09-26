#!/usr/bin/env python3
"""
test_comms_pack_headless.py
Verifies the Comms Networks Research Pack:
- Endpoint: http://localhost:8080/team/open/comms_networks
- Folder: downloads/Comms_Networks_Research_24_Papers/
- Standardized File Naming: Topic_Subject_Details.pdf
- Team Sharing Directive & Fast Onboarding Permissions
- Acropolis Catalog Sync
"""

import os
import sys
import json
import urllib.request

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)

COMMS_DIR = os.path.join(BASE_DIR, "downloads", "Comms_Networks_Research_24_Papers")
ENDPOINT_COMMS = "http://localhost:8080/team/open/comms_networks"
ENDPOINT_AUDI = "http://localhost:8080/audi"

def run_checks():
    print("=" * 60)
    print("🚀 VERIFYING COMMS RESEARCH PACK (24 PAPERS)")
    print("=" * 60)
    
    passed = 0
    total = 0

    def check(desc: str, condition: bool, details: str = ""):
        nonlocal passed, total
        total += 1
        if condition:
            passed += 1
            print(f"  ✅ [{total:02d}] {desc}")
            if details:
                print(f"       -> {details}")
        else:
            print(f"  ❌ [{total:02d}] {desc}")
            if details:
                print(f"       -> FAIL: {details}")

    # 1. Directory exists
    check("Target Directory Exists", os.path.isdir(COMMS_DIR), COMMS_DIR)

    # 2. README manifest exists and has sharing permissions
    readme_path = os.path.join(COMMS_DIR, "README.md")
    readme_exists = os.path.isfile(readme_path)
    check("README.md Manifest Exists", readme_exists, readme_path)
    
    if readme_exists:
        with open(readme_path, "r", encoding="utf-8") as f:
            readme_text = f.read()
        check("README Inscribes Free Team Sharing Directive", 
              "authorized to share these papers freely" in readme_text.lower(),
              "Unrestricted sharing directive present")
        check("README Specifies Naming Standard Topic_Subject_Details.pdf",
              "Topic_Subject_Details.pdf" in readme_text,
              "Naming convention documented")

    # 3. Check 24 standardized PDF files on disk
    pdf_files = [f for f in os.listdir(COMMS_DIR) if f.endswith(".pdf")]
    check("Paper Count on Disk is exactly 24", len(pdf_files) == 24, f"Found {len(pdf_files)} PDFs")
    
    valid_sizes = True
    for f in pdf_files:
        f_size = os.path.getsize(os.path.join(COMMS_DIR, f))
        if f_size == 0:
            valid_sizes = False
            break
    check("All 24 Papers Have Non-Zero Byte Sizes", valid_sizes, "All files non-empty")

    # 4. Check API Endpoint
    try:
        req = urllib.request.Request(ENDPOINT_COMMS, headers={"User-Agent": "curl/7.68.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode('utf-8'))
        
        check("Endpoint /team/open/comms_networks Returns HTTP 200", True, f"HTTP {resp.status}")
        check("Endpoint Returns Correct Folder Name", 
              data.get("folder_name") == "Comms_Networks_Research_24_Papers", 
              data.get("folder_name"))
        check("Endpoint Reports Count == 24", data.get("count") == 24, f"Count: {data.get('count')}")
        check("Endpoint Ownership Documents Comms Lead Agent", 
              data.get("ownership", {}).get("lead") == "Comms Lead Agent", 
              str(data.get("ownership")))
        check("Endpoint Ownership Documents Sanctuary VI", 
              data.get("ownership", {}).get("support") == "Sanctuary VI", 
              str(data.get("ownership")))
        check("Endpoint Sharing Permissions Fully Allowed", 
              data.get("sharing_permissions", {}).get("rule") == "FULLY_ALLOWED", 
              str(data.get("sharing_permissions")))
        check("Endpoint Onboarding Ready Flag is True", 
              data.get("sharing_permissions", {}).get("onboarding_ready") is True, 
              "onboarding_ready: True")
        check("Endpoint Documents Match Files on Disk", 
              set(data.get("documents", [])) == set(pdf_files), 
              f"{len(data.get('documents', []))} documents listed in API")
        check("Endpoint Has Gold Standard Doc ID COMMS-GOLD-STD-20260910",
              data.get("doc_id") == "COMMS-GOLD-STD-20260910",
              data.get("doc_id"))
        check("Endpoint Pinned Gold Standard Sealed",
              data.get("gold_standard_reference") == "PINNED_GOLD_STANDARD_SEALED",
              data.get("gold_standard_reference"))
        check("Endpoint Oversight Documents Reception Desk",
              data.get("ownership", {}).get("oversight") == "Reception Desk",
              str(data.get("ownership")))
    except Exception as e:
        check("Endpoint /team/open/comms_networks Accessible", False, str(e))

    # 5. Check Acropolis Catalog Integration (/knowledge/research/active)
    cat_path = os.path.join(BASE_DIR, "downloads", "pdf_subject_catalog.json")
    if os.path.isfile(cat_path):
        with open(cat_path, "r", encoding="utf-8") as f:
            cat = json.load(f)
        check("Acropolis Catalog has comms_pack_metadata", "comms_pack_metadata" in cat, "Metadata key present")
        check("Catalog Reflects Free Sharing Directive", 
              cat.get("comms_pack_metadata", {}).get("sharing_directive") == "FULLY_ALLOWED_FREE_SHARING_TEAM", 
              "Sharing directive in catalog")
        check("Catalog Pins Gold Standard Reference",
              "gold_standard_reference" in cat,
              "gold_standard_reference section present")
        gold_ref = cat.get("gold_standard_reference", {})
        check("Catalog Gold Standard Doc ID is COMMS-GOLD-STD-20260910",
              gold_ref.get("doc_id") == "COMMS-GOLD-STD-20260910",
              gold_ref.get("doc_id"))
        check("Catalog Master SHA-256 Seal Present",
              bool(gold_ref.get("master_sha256_seal")),
              gold_ref.get("master_sha256_seal"))

    # 6. Check Immutable Record COMMS_GOLD_STD_20260910.json
    record_path = os.path.join(BASE_DIR, "downloads", "COMMS_GOLD_STD_20260910.json")
    check("Immutable Record COMMS_GOLD_STD_20260910.json Exists", os.path.isfile(record_path), record_path)
    if os.path.isfile(record_path):
        with open(record_path, "r", encoding="utf-8") as f:
            rec = json.load(f)
        check("Record Doc ID is COMMS-GOLD-STD-20260910", rec.get("doc_id") == "COMMS-GOLD-STD-20260910", rec.get("doc_id"))
        check("Record Documents Count is 24", rec.get("documents_count") == 24, str(rec.get("documents_count")))
        check("Record Collaboration Policy is Unrestricted Sharing", "UNRESTRICTED_TEAM_SHARING" in rec.get("core_specification", {}).get("collaboration_policy", ""), "Collaboration policy verified")

    # 7. Check AcropolisLibrary Core sealing capability
    try:
        from antigravity.core import AcropolisLibrary
        vault = AcropolisLibrary(vault="Gold_Standard_Vault")
        sealed_rec = vault.seal_gold_standard_reference("COMMS-GOLD-STD-20260910", {"test": "valid"})
        check("AcropolisLibrary Vault Successfully Seals Gold Standard", sealed_rec.get("status") == "ACROPOLIS_GOLD_STANDARD_SEALED", sealed_rec.get("sha256_seal"))
    except Exception as e:
        check("AcropolisLibrary Vault Sealing Error", False, str(e))

    print("\n" + "=" * 60)
    print(f"📊 SUMMARY: {passed} / {total} Checks Passed ({passed / total * 100:.1f}%)")
    print("=" * 60)

    if passed == total:
        print("🎉 ALL COMMS RESEARCH PACK CHECKS PASSED PERFECTLY!")
        return 0
    else:
        print("⚠️ Some checks failed. Please review output above.")
        return 1

if __name__ == "__main__":
    sys.exit(run_checks())
