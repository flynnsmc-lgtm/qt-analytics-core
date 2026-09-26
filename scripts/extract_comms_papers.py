import os
import re

dir_path = "downloads/Comms_Networks_Research_24_Papers"
files = sorted([f for f in os.listdir(dir_path) if f.endswith(".pdf")])

print(f"Analyzing {len(files)} Comms Research Papers...\n")

for i, f in enumerate(files, 1):
    path = os.path.join(dir_path, f)
    with open(path, "rb") as fp:
        raw = fp.read()
    
    # Extract metadata / title / abstract chunks
    chunks = re.findall(rb'[A-Za-z0-9 ,.;:()/\'"-]{6,}', raw)
    text_chunks = [c.decode("latin1", errors="ignore").strip() for c in chunks]
    meaningful = [c for c in text_chunks if len(c) > 25 and not c.startswith("endobj") and not c.startswith("Filter")]
    
    print(f"=== [{i:02d}] {f} ===")
    print(f"File Size: {len(raw):,} bytes")
    # Show first few meaningful strings
    for m in meaningful[:4]:
        print(f"  * {m[:140]}")
    print()
