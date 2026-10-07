import re
text = "S<super>5</super>(r<sub>0</sub> = 1/2)"
placeholders = {}
def protect(m):
    key = f"\x00{len(placeholders)}\x00"
    placeholders[key] = m.group(0)
    return key

text = re.sub(r"</?(?:b|i|font|u|sub|super)[^>]*>", protect, text)
print(repr(text))
for k, v in placeholders.items():
    print(repr(k), "=>", repr(v))
    text = text.replace(k, v)
print(repr(text))
