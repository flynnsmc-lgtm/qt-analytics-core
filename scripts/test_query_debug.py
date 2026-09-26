import urllib.request, urllib.parse, xml.etree.ElementTree as ET

q1 = 'all:"graph neural network" AND all:"particle tracking"'
url = f"http://export.arxiv.org/api/query?search_query={urllib.parse.quote(q1)}&start=0&max_results=3"
print("URL:", url)
req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        xml = resp.read()
    root = ET.fromstring(xml)
    entries = root.findall('{http://www.w3.org/2005/Atom}entry')
    print("Entries count:", len(entries))
    for e in entries:
        print("  -", e.find('{http://www.w3.org/2005/Atom}title').text.strip()[:60])
except Exception as e:
    print("Error:", e)
