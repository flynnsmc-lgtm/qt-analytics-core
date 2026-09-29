import os
import re
import zlib

path = r'C:\Antigravity\GoldStandardLibrary\Academia Library Downloads\Academia.edu_Bundle_-_Entanglement_entropy_and_Wilson_loop\Entanglement_entropy_and_Wilson_loop.pdf'

if not os.path.exists(path):
    print("File not found:", path)
    exit(1)

with open(path, 'rb') as f:
    data = f.read()

streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', data, re.DOTALL)
print(f"Total streams in PDF: {len(streams)}")

full_text = []
for s in streams:
    try:
        decomp = zlib.decompress(s)
        # Match text inside parentheses followed by Tj or inside array followed by TJ
        tjs = re.findall(rb'\(([^\(\)]{1,120})\)\s*Tj', decomp)
        tjs_array = re.findall(rb'\[(.*?)\]\s*TJ', decomp, re.DOTALL)
        for t in tjs:
            clean = t.decode('latin1', 'ignore').strip()
            if clean:
                full_text.append(clean)
        for arr in tjs_array:
            parts = re.findall(rb'\((.*?)\)', arr)
            for p in parts:
                clean = p.decode('latin1', 'ignore').strip()
                if clean:
                    full_text.append(clean)
    except Exception:
        pass

corpus = " ".join(full_text)
print(f"Total extracted words/tokens: {len(full_text)}")

keywords = [
    "Wilson loop",
    "entanglement entropy",
    "minimal surface",
    "phase transition",
    "confinement",
    "Stueckelberg",
    "Stückelberg",
    "AdS",
    "Ryu-Takayanagi",
    "string tension"
]

print("="*70)
print("ANALYZING CAI ET AL. (2012) — ENTANGLEMENT ENTROPY & WILSON LOOP")
print("="*70)

for kw in keywords:
    matches = [m.start() for m in re.finditer(re.escape(kw), corpus, re.IGNORECASE)]
    print(f"\nKeyword: '{kw}' — {len(matches)} occurrences")
    for idx in matches[:2]:
        start = max(0, idx - 40)
        end = min(len(corpus), idx + 200)
        snippet = corpus[start:end].encode('ascii', 'replace').decode('ascii')
        print(f"  [Context]: ... {snippet} ...")
