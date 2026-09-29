import os
import re
import zlib

def extract_pdf_lead(path):
    with open(path, 'rb') as f:
        data = f.read(500000)
    
    # Try finding decompressed text streams
    streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', data, re.DOTALL)
    lead_text = ""
    for s in streams[:10]:
        try:
            decomp = zlib.decompress(s)
            tjs = re.findall(rb'\((.*?)\)\s*Tj', decomp)
            if tjs:
                extracted = " ".join([t.decode('latin1', 'ignore') for t in tjs if len(t) > 2])
                lead_text += " " + extracted
        except Exception:
            pass
    
    # Find metadata
    titles = re.findall(rb'/Title\s*\((.*?)\)', data)
    authors = re.findall(rb'/Author\s*\((.*?)\)', data)
    
    title_str = titles[0].decode('latin1', 'ignore') if titles else "Unknown"
    author_str = authors[0].decode('latin1', 'ignore') if authors else "Unknown"
    
    return title_str, author_str, lead_text[:400].strip()

base = r'C:\Users\44790\Documents\AGENTIC\New folder'
bundles = [
    'Academia.edu_Bundle_-_Adaptive_numerical_solution_of_Kadanoff_',
    'Academia.edu_Bundle_-_An_off_shell_Wilson_loop',
    'Academia.edu_Bundle_-_Comparing_the_generalized_Kadanoff_Baym_',
    'Academia.edu_Bundle_-_Quantum_gauge_freedom_in_very_special_re',
    'Academia.edu_Bundle_-_Underdeterminacy_and_Redundance_in_Maxwe'
]

print("="*70)
print("AUDITING THE 5 NEWLY UPDATED LIBRARY BUNDLES")
print("="*70)

for b in bundles:
    bpath = os.path.join(base, b)
    if not os.path.exists(bpath):
        print(f"Directory not found: {bpath}")
        continue
    
    pdfs = [os.path.join(r, f) for r, d, fs in os.walk(bpath) for f in fs if f.endswith('.pdf')]
    lead_pdf = [f for f in os.listdir(bpath) if f.endswith('.pdf')]
    lead_name = lead_pdf[0] if lead_pdf else "None"
    lead_path = os.path.join(bpath, lead_name) if lead_pdf else None
    
    print(f"\n[BUNDLE] {b}")
    print(f"   Total PDFs: {len(pdfs)}")
    print(f"   Lead Paper: {lead_name}")
    
    if lead_path and os.path.exists(lead_path):
        t, a, txt = extract_pdf_lead(lead_path)
        print(f"   Title: {t}")
        print(f"   Author: {a}")
        if txt:
            print(f"   Preview: {txt[:250]}...")
