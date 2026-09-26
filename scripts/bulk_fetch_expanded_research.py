"""
bulk_fetch_expanded_research.py
Robust Bulk Research Fetcher for:
1. Computational Particle Physics & Deep Learning (Current: 9 -> Target: 60-75 papers)
2. Muon Beam Dynamics & Ionization Cooling (Current: 11 -> Target: 60-75 papers)
Maximum limit: 80 per subject.

Features:
- Line-buffered immediate logging
- Saves catalog incrementally after each batch
- arXiv polite rate limiting (3s)
- Automatic SHA-256 calculation
- Standardized Topic_Subject_Details.pdf naming
"""

import os
import sys
import time
import json
import re
import hashlib
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

# Enable unbuffered line-buffered UTF-8 output
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace', line_buffering=True)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
DL_DIR = os.path.join(DOWNLOADS_DIR, "Computational_Particle_Physics_and_Deep_Learning")
MUON_DIR = os.path.join(DOWNLOADS_DIR, "Muon_Beam_Dynamics_and_Ionization_Cooling")
CATALOG_PATH = os.path.join(DOWNLOADS_DIR, "pdf_subject_catalog.json")

USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 (arXiv-Polite-Research-Client)"

def sanitize_title_to_filename(prefix, title, max_len=60):
    clean = re.sub(r'[\$\{\}\\\/\:\*\?\"\<\>\|\,\;\.\'\`\(\)\[\]\-\+\=]', ' ', title)
    words = [w.capitalize() for w in clean.split() if len(w) > 1 and w.lower() not in [
        'a', 'an', 'the', 'in', 'on', 'at', 'of', 'for', 'to', 'with', 'by', 'and', 'or', 'from', 'using'
    ]]
    details = "_".join(words[:5])
    if not details:
        details = "Investigation"
    filename = f"{prefix}_{details}.pdf"
    return filename

def query_arxiv(search_query, max_results=20):
    encoded_q = urllib.parse.quote(search_query)
    url = f"http://export.arxiv.org/api/query?search_query={encoded_q}&start=0&max_results={max_results}&sortBy=relevance&sortOrder=descending"
    req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = resp.read()
        root = ET.fromstring(data)
        results = []
        for entry in root.findall("{http://www.w3.org/2005/Atom}entry"):
            raw_id = entry.find("{http://www.w3.org/2005/Atom}id").text.strip()
            arxiv_id = raw_id.split("/abs/")[-1]
            title = entry.find("{http://www.w3.org/2005/Atom}title").text.strip().replace("\n", " ")
            title = re.sub(r'\s+', ' ', title)
            summary = entry.find("{http://www.w3.org/2005/Atom}summary").text.strip().replace("\n", " ")
            published = entry.find("{http://www.w3.org/2005/Atom}published").text[:10]
            authors = [a.find("{http://www.w3.org/2005/Atom}name").text for a in entry.findall("{http://www.w3.org/2005/Atom}author")]
            
            pdf_url = f"https://arxiv.org/pdf/{arxiv_id}.pdf"
            results.append({
                "arxiv_id": arxiv_id,
                "title": title,
                "summary": summary[:300] + "...",
                "published": published,
                "authors": authors[:4],
                "pdf_url": pdf_url
            })
        return results
    except Exception as e:
        print(f"  ⚠️ Error querying arXiv: {e}", flush=True)
        return []

def download_and_verify_pdf(url, dest_path, retries=2):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT})
            with urllib.request.urlopen(req, timeout=25) as resp:
                content = resp.read()
            if content.startswith(b"%PDF-") and len(content) > 5000:
                with open(dest_path, "wb") as f:
                    f.write(content)
                sha = hashlib.sha256(content).hexdigest()
                return len(content), sha
            else:
                print(f"    ⚠️ Invalid PDF content from {url} (size={len(content)})", flush=True)
        except Exception as e:
            if attempt < retries - 1:
                time.sleep(2)
            else:
                print(f"    ❌ Download error: {e}", flush=True)
    return 0, None

def save_catalog_progress(catalog):
    with open(CATALOG_PATH, "w", encoding="utf-8") as f:
        json.dump(catalog, f, indent=2)

def run_fetch(target_total_per_subject=65):
    print("=" * 70, flush=True)
    print("🚀 EXPANDED RESEARCH ACQUISITION PIPELINE (MAX 80/SUBJECT)", flush=True)
    print(f"🎯 Target Total per Subject: {target_total_per_subject} papers", flush=True)
    print("=" * 70, flush=True)

    with open(CATALOG_PATH, "r", encoding="utf-8") as f:
        catalog = json.load(f)

    existing_files_dl = set(os.listdir(DL_DIR))
    existing_files_muon = set(os.listdir(MUON_DIR))
    existing_records = catalog.get("records", [])

    print(f"📊 Baseline Status:", flush=True)
    print(f"   • Computational Particle Physics & DL: {len(existing_files_dl)} existing papers", flush=True)
    print(f"   • Muon Beam Dynamics & Cooling: {len(existing_files_muon)} existing papers", flush=True)

    # 1. PARTICLE DEEP LEARNING QUERIES
    dl_queries = [
        'all:"graph neural network" AND all:"particle tracking"',
        'all:"machine learning" AND all:"calorimeter simulation" AND cat:hep-ex',
        'all:"deep learning" AND all:"jet tagging" AND cat:hep-ph',
        'all:"FPGA" AND all:"deep learning" AND all:"particle physics"',
        'all:"normalizing flows" AND all:"lattice QCD"',
        'all:"neural network" AND all:"neutrino event reconstruction"',
        'all:"diffusion model" AND all:"calorimeter"',
        'all:"transformer" AND all:"particle physics" AND all:"reconstruction"'
    ]

    # 2. MUON BEAM DYNAMICS & COOLING QUERIES
    muon_queries = [
        'all:"muon ionization cooling"',
        'all:"MICE" AND all:"ionization cooling"',
        'all:"muon collider" AND all:"cooling channel"',
        'all:"emittance exchange" AND all:"muon"',
        'all:"RF cavity" AND all:"magnetic field" AND all:"muon"',
        'all:"helical cooling channel" AND all:"muon"',
        'all:"wedge absorber" AND all:"muon cooling"',
        'all:"high brightness muon beam" AND all:"collider"',
        'all:"muon beam dynamics" AND all:"cooling"',
        'all:"superconducting solenoid" AND all:"muon cooling"'
    ]

    newly_acquired = []

    # --- DOMAIN 1: PARTICLE DEEP LEARNING ---
    print("\n------------------------------------------------------------", flush=True)
    print("🧠 1. Fetching Particle Deep Learning & Computing Papers...", flush=True)
    print("------------------------------------------------------------", flush=True)

    dl_candidates = {}
    for q in dl_queries:
        print(f"  🔍 Querying: {q}", flush=True)
        res = query_arxiv(q, max_results=15)
        for r in res:
            if r["arxiv_id"] not in dl_candidates:
                dl_candidates[r["arxiv_id"]] = r
        time.sleep(3)

    print(f"  ✨ Found {len(dl_candidates)} unique candidate papers for Particle DL.", flush=True)

    dl_current_count = len(os.listdir(DL_DIR))
    dl_downloaded = 0
    for aid, meta in dl_candidates.items():
        if dl_current_count >= target_total_per_subject or dl_current_count >= 80:
            print(f"  🛑 Reached target volume ({dl_current_count} papers) for Particle DL.", flush=True)
            break
        target_name = sanitize_title_to_filename("ParticleDL", meta["title"])
        dest_path = os.path.join(DL_DIR, target_name)
        if os.path.exists(dest_path):
            continue

        print(f"  📥 [DL #{dl_current_count+1}] Downloading: {target_name} ({meta['arxiv_id']})...", flush=True)
        size, sha = download_and_verify_pdf(meta["pdf_url"], dest_path)
        if size > 0:
            dl_downloaded += 1
            dl_current_count += 1
            rec = {
                "filename": target_name,
                "arxiv_id": aid,
                "title": meta["title"],
                "authors": meta["authors"],
                "published": meta["published"],
                "original_address": meta["pdf_url"],
                "new_address": dest_path,
                "identified_subject": "Computational Particle Physics & Deep Learning",
                "is_physics": True,
                "size_bytes": size,
                "sha256": sha,
                "status": "EXPANDED_RESEARCH_ACQUIRED",
                "tags": ["domain:particle_dl_computing", "type:research_paper", "source:arxiv_open_access"]
            }
            newly_acquired.append(rec)
            existing_records.append(rec)
            catalog["subject_breakdown"]["Computational Particle Physics & Deep Learning"] = dl_current_count
            catalog["total_scanned"] = len(existing_records)
            catalog["records"] = existing_records
            save_catalog_progress(catalog)
            print(f"     ✅ Saved ({size:,} bytes | SHA: {sha[:12]}...). Total DL: {dl_current_count}", flush=True)
            time.sleep(3)

    # --- DOMAIN 2: MUON BEAM DYNAMICS & COOLING ---
    print("\n------------------------------------------------------------", flush=True)
    print("⚛️ 2. Fetching Muon Beam Dynamics & Ionization Cooling Papers...", flush=True)
    print("------------------------------------------------------------", flush=True)

    muon_candidates = {}
    for q in muon_queries:
        print(f"  🔍 Querying: {q}", flush=True)
        res = query_arxiv(q, max_results=15)
        for r in res:
            if r["arxiv_id"] not in muon_candidates:
                muon_candidates[r["arxiv_id"]] = r
        time.sleep(3)

    print(f"  ✨ Found {len(muon_candidates)} unique candidate papers for Muon Cooling.", flush=True)

    muon_current_count = len(os.listdir(MUON_DIR))
    muon_downloaded = 0
    for aid, meta in muon_candidates.items():
        if muon_current_count >= target_total_per_subject or muon_current_count >= 80:
            print(f"  🛑 Reached target volume ({muon_current_count} papers) for Muon Cooling.", flush=True)
            break
        target_name = sanitize_title_to_filename("MuonCooling", meta["title"])
        dest_path = os.path.join(MUON_DIR, target_name)
        if os.path.exists(dest_path):
            continue

        print(f"  📥 [Muon #{muon_current_count+1}] Downloading: {target_name} ({meta['arxiv_id']})...", flush=True)
        size, sha = download_and_verify_pdf(meta["pdf_url"], dest_path)
        if size > 0:
            muon_downloaded += 1
            muon_current_count += 1
            rec = {
                "filename": target_name,
                "arxiv_id": aid,
                "title": meta["title"],
                "authors": meta["authors"],
                "published": meta["published"],
                "original_address": meta["pdf_url"],
                "new_address": dest_path,
                "identified_subject": "Muon Beam Dynamics & Ionization Cooling",
                "is_physics": True,
                "size_bytes": size,
                "sha256": sha,
                "status": "EXPANDED_RESEARCH_ACQUIRED",
                "tags": ["domain:muon_beam_cooling", "type:research_paper", "source:arxiv_open_access"]
            }
            newly_acquired.append(rec)
            existing_records.append(rec)
            catalog["subject_breakdown"]["Muon Beam Dynamics & Ionization Cooling"] = muon_current_count
            catalog["total_scanned"] = len(existing_records)
            catalog["records"] = existing_records
            save_catalog_progress(catalog)
            print(f"     ✅ Saved ({size:,} bytes | SHA: {sha[:12]}...). Total Muon: {muon_current_count}", flush=True)
            time.sleep(3)

    # Final metadata inscription
    catalog["expanded_collections_metadata"] = {
        "status": "EXPANDED_RESEARCH_RESOLUTE",
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "particle_dl_total": len(os.listdir(DL_DIR)),
        "muon_cooling_total": len(os.listdir(MUON_DIR)),
        "newly_acquired_session": len(newly_acquired),
        "naming_standard": "Topic_Subject_Details.pdf",
        "sources": ["arXiv.org open-access preprint archive (hep-ex, hep-ph, physics.acc-ph)"],
        "max_per_subject_limit": 80,
        "hardware_materials_analysis": {
            "fpga_realtime_inference": "Xilinx UltraScale+ & AMD Versal ACAP hardware for microsecond L1 trigger GNN inference",
            "superconducting_magnets": "High-temperature superconductor (HTS ReBCO) solenoids targeting 20-30 Tesla for final transverse cooling",
            "rf_breakdown_mitigation": "Gas-filled cavities (high-pressure hydrogen) and beryllium windows to suppress vacuum breakdown in high magnetic fields",
            "cooling_absorbers": "Cryogenic Liquid Hydrogen (LH2) and Lithium Hydride (LiH) absorbers for minimum multiple scattering"
        }
    }
    save_catalog_progress(catalog)

    print("\n" + "=" * 70, flush=True)
    print("🎉 BULK RESEARCH EXPANSION COMPLETE!", flush=True)
    print(f"   • Particle DL Papers: {len(os.listdir(DL_DIR))} total (+{dl_downloaded} new)", flush=True)
    print(f"   • Muon Cooling Papers: {len(os.listdir(MUON_DIR))} total (+{muon_downloaded} new)", flush=True)
    print(f"   • Total New Acquired: {len(newly_acquired)} full PDFs", flush=True)
    print(f"   • Catalog Updated: {CATALOG_PATH}", flush=True)
    print("=" * 70, flush=True)

if __name__ == "__main__":
    target = 65
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        target = int(sys.argv[1])
    run_fetch(target_total_per_subject=target)
