import urllib.request, hashlib

url = "https://arxiv.org/pdf/2305.10601.pdf"
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
print("Starting download from:", url)
with urllib.request.urlopen(req, timeout=15) as resp:
    content = resp.read()
print(f"Downloaded {len(content):,} bytes. Header: {content[:8]}")
sha = hashlib.sha256(content).hexdigest()
print("SHA-256:", sha)
