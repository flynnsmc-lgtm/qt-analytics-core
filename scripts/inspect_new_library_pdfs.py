import os
import sys

# Ensure scripts dir is in path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "scripts"))
from read_pdf_perfect import read_pdf

sys.stdout.reconfigure(encoding='utf-8')

base = r"C:\Antigravity\GoldStandardLibrary"
folders = [
    r"oct26 2609x6 unnamed",
    r"more_papers_by_constantin_sandu",
    r"most_similar_papers_to_this_one"
]

standalone = [
    os.path.join(base, "Sonic_Boom_Mitigation_Through_Shock_Wave.pdf")
]

print("=== NEW PDF INVENTORY IN GOLD STANDARD LIBRARY ===", flush=True)

for sp in standalone:
    if os.path.exists(sp):
        print(f"\n[STANDALONE] {os.path.basename(sp)} ({os.path.getsize(sp):,} bytes)", flush=True)
        txt = read_pdf(sp)
        clean = " ".join(txt.split())
        print(f"  Snippet: {clean[:400]}", flush=True)

for fld in folders:
    target_dir = os.path.join(base, fld)
    print(f"\n================ {fld} ================", flush=True)
    if not os.path.exists(target_dir):
        print("Directory not found", flush=True)
        continue
    for fname in sorted(os.listdir(target_dir)):
        if fname.lower().endswith(".pdf"):
            fp = os.path.join(target_dir, fname)
            sz = os.path.getsize(fp)
            print(f"\n[FILE] {fname} ({sz:,} bytes)", flush=True)
            try:
                txt = read_pdf(fp)
                clean = " ".join(txt.split())
                if clean:
                    print(f"  Snippet: {clean[:400]}", flush=True)
                else:
                    print("  Snippet: (No text extracted via basic stream)", flush=True)
            except Exception as e:
                print(f"  Error reading: {e}", flush=True)
