import os, re, zlib

def get_text_from_pdf(path, max_pages=2):
    with open(path, 'rb') as f:
        data = f.read(1500000)
    streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', data, re.DOTALL)
    full_text = []
    for s in streams:
        try:
            decomp = zlib.decompress(s)
            # Find Tj and TJ operators
            tjs = re.findall(rb'\((.*?)\)\s*Tj', decomp)
            tjs_array = re.findall(rb'\[(.*?)\]\s*TJ', decomp, re.DOTALL)
            for t in tjs:
                clean = t.decode('latin1', 'ignore').strip()
                if len(clean) > 1:
                    full_text.append(clean)
            for arr in tjs_array:
                parts = re.findall(rb'\((.*?)\)', arr)
                for p in parts:
                    clean = p.decode('latin1', 'ignore').strip()
                    if len(clean) > 1:
                        full_text.append(clean)
            if len(full_text) > 400:
                break
        except Exception:
            pass
    return " ".join(full_text[:300])

base = r'C:\Users\44790\Documents\AGENTIC\New folder'
papers = [
    ("Bundle 1: Adaptive Kadanoff", os.path.join(base, 'Academia.edu_Bundle_-_Adaptive_numerical_solution_of_Kadanoff_', 'Adaptive_numerical_solution_of_Kadanoff.pdf')),
    ("Bundle 2: Off-shell Wilson Loop", os.path.join(base, 'Academia.edu_Bundle_-_An_off_shell_Wilson_loop', 'An_off_shell_Wilson_loop.pdf')),
    ("Bundle 3: GKBA vs Exact", os.path.join(base, 'Academia.edu_Bundle_-_Comparing_the_generalized_Kadanoff_Baym_', 'Comparing_the_generalized_Kadanoff_Baym.pdf')),
    ("Bundle 4: Quantum Gauge Freedom", os.path.join(base, 'Academia.edu_Bundle_-_Quantum_gauge_freedom_in_very_special_re', 'Quantum_gauge_freedom_in_very_special_re.pdf')),
    ("Bundle 5: Underdeterminacy in Maxwell", os.path.join(base, 'Academia.edu_Bundle_-_Underdeterminacy_and_Redundance_in_Maxwe', 'Underdeterminacy_and_Redundance_in_Maxwe.pdf')),
]

for label, p in papers:
    print("="*60)
    print(label)
    print("Path:", p)
    txt = get_text_from_pdf(p)
    safe_txt = txt[:500].encode('ascii', 'replace').decode('ascii')
    print("Text Extract:\n", safe_txt)
