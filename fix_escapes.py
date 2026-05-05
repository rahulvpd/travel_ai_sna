import os

def fix_file(filepath, replacements):
    with open(filepath, 'r', encoding='utf-8') as f:
        text = f.read()
    
    for old, new in replacements:
        text = text.replace(old, new)
        
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(text)

fix_file('src/data/chennaiMegaNodes.js', [("\\'", "'")])
fix_file('src/services/chennaiSNAMega.js', [("\\`", "`")])
fix_file('src/components/chennai/ChennaiSNAMegaSection.jsx', [("\\`", "`"), ("\\$", "$")])
print("Files fixed")
