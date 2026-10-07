import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('bundle_analysis_cache.json', 'r', encoding='utf-8') as f:
    bundles = json.load(f)

for b in bundles:
    bname = b['bundle'].lower()
    txt = (bname + ' ' + b['lead_file'] + ' ' + b['snippet']).lower()
    if any(k in txt for k in ['wilson', 'kadanoff', 'gauge', 'maxwell', 'baryon', 'special_re']):
        print(f"* {b['bundle']}")
        print(f"   Lead File: {b['lead_file']}")
        print(f"   PDFs: {b['total_pdfs']}")
        clean_snip = ' '.join(b['snippet'].split())
        print(f"   Snippet: {clean_snip[:250]}...")
        print()
