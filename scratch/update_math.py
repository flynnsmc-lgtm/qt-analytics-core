import re
with open('papers/PAPER_5_PvsNP_GEOMETRIC_COMPLEXITY_MANIFOLD.md', 'r', encoding='utf-8') as f:
    text = f.read()

text = re.sub(r'\$\$(.*?)\$\$', r'\[\1\]', text, flags=re.DOTALL)
text = re.sub(r'(?<!\$)\$(?!\$)(.*?)(?<!\$)\$(?!\$)', r'\(\1\)', text)

with open('papers/PAPER_5_PvsNP_GEOMETRIC_COMPLEXITY_MANIFOLD.md', 'w', encoding='utf-8') as f:
    f.write(text)
