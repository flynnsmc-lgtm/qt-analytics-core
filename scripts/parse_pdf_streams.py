import os
import re
import zlib

dir_path = "downloads/Comms_Networks_Research_24_Papers"
files = sorted([f for f in os.listdir(dir_path) if f.endswith(".pdf")])

def extract_pdf_text(path):
    with open(path, "rb") as fp:
        content = fp.read()

    # Find stream objects
    stream_matches = re.finditer(rb'stream[\r\n]+(.*?)[\r\n]+endstream', content, re.DOTALL)
    full_text = []

    for sm in stream_matches:
        stream_bytes = sm.group(1)
        try:
            decompressed = zlib.decompress(stream_bytes)
        except Exception:
            try:
                decompressed = zlib.decompress(stream_bytes, -zlib.MAX_WBITS)
            except Exception:
                continue
        
        # Look for text strings in parentheses: (Text) Tj or [(Text)...] TJ
        # 1. Match (string) Tj or ' or "
        single_strings = re.findall(rb'\(((?:[^()\\]|\\.)*)\)\s*(?:Tj|\'|\")', decompressed)
        for s in single_strings:
            decoded = s.decode('latin1', errors='ignore').replace('\\(', '(').replace('\\)', ')')
            if len(decoded.strip()) > 1:
                full_text.append(decoded.strip())

        # 2. Match [(...)] TJ arrays
        tj_arrays = re.findall(rb'\[(.*?)\]\s*TJ', decompressed, re.DOTALL)
        for arr in tj_arrays:
            parts = re.findall(rb'\(((?:[^()\\]|\\.)*)\)', arr)
            combined = "".join([p.decode('latin1', errors='ignore').replace('\\(', '(').replace('\\)', '') for p in parts])
            if len(combined.strip()) > 1:
                full_text.append(combined.strip())

    return " ".join(full_text)

results = []
for idx, f in enumerate(files, 1):
    path = os.path.join(dir_path, f)
    text = extract_pdf_text(path)
    # clean multiple spaces
    text = re.sub(r'\s+', ' ', text)
    # find abstract or title snippet
    sample = text[:350]
    results.append({
        "id": f"{idx:02d}",
        "filename": f,
        "size": os.path.getsize(path),
        "text_len": len(text),
        "sample": sample
    })
    print(f"[{idx:02d}] {f} -> Extracted {len(text):,} chars")
    if len(text) > 0:
        print(f"     Preview: {sample[:160]}...")
    print()
