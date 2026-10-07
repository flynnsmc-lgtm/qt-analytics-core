import os
import sys
import re
import zlib

sys.stdout.reconfigure(encoding='utf-8')

def parse_cmap(cmap_bytes):
    mapping = {}
    # parse bfrange: <start> <end> <target_start>
    bfranges = re.findall(rb'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>', cmap_bytes)
    for start, end, target in bfranges:
        s_int = int(start, 16)
        e_int = int(end, 16)
        t_int = int(target, 16)
        for i in range(e_int - s_int + 1):
            mapping[s_int + i] = chr(t_int + i)
            
    # parse bfchar: <src> <dst>
    bfchars = re.findall(rb'<([0-9a-fA-F]+)>\s*<([0-9a-fA-F]+)>', cmap_bytes)
    for src, dst in bfchars:
        s_int = int(src, 16)
        d_int = int(dst, 16)
        mapping[s_int] = chr(d_int)
        
    return mapping

def read_pdf(pdf_path, max_pages=3):
    if not os.path.exists(pdf_path):
        return f"File not found: {pdf_path}"
    
    with open(pdf_path, 'rb') as f:
        data = f.read(2000000)
        
    streams = re.findall(rb'stream[\r\n]+(.*?)[\r\n]+endstream', data, re.DOTALL)
    
    # 1. find CMaps
    cmap = {}
    for s in streams:
        try:
            d = zlib.decompress(s)
            if b'beginbfchar' in d or b'beginbfrange' in d:
                c = parse_cmap(d)
                cmap.update(c)
        except:
            pass
            
    # 2. Extract text
    full_text = []
    for s in streams:
        try:
            d = zlib.decompress(s)
            if b'BT' in d and b'ET' in d:
                # Text stream!
                # parse TJ and Tj
                # look for hex strings <...> or regular strings (...)
                tokens = re.findall(rb'(\((?:[^()\\]|\\.)*\)|<[0-9a-fA-F]+>|\s+|\[.*?\]\s*TJ|[0-9.\-]+)', d, re.DOTALL)
                stream_text = []
                for t in tokens:
                    if t.startswith(b'(') and t.endswith(b')'):
                        raw = t[1:-1]
                        # decode using cmap or latin1
                        decoded = ''.join([cmap.get(b, chr(b)) for b in raw])
                        stream_text.append(decoded)
                    elif t.startswith(b'<') and t.endswith(b'>') and len(t) > 2:
                        hex_str = t[1:-1]
                        try:
                            # 2 or 4 hex chars
                            step = 4 if len(hex_str) % 4 == 0 else 2
                            chars = []
                            for i in range(0, len(hex_str), step):
                                code = int(hex_str[i:i+step], 16)
                                chars.append(cmap.get(code, '?'))
                            stream_text.append(''.join(chars))
                        except:
                            pass
                    elif b'TJ' in t:
                        # parse array in TJ
                        inner_tokens = re.findall(rb'(\((?:[^()\\]|\\.)*\)|<[0-9a-fA-F]+>)', t)
                        for it in inner_tokens:
                            if it.startswith(b'('):
                                raw = it[1:-1]
                                decoded = ''.join([cmap.get(b, chr(b)) for b in raw])
                                stream_text.append(decoded)
                            elif it.startswith(b'<'):
                                hex_str = it[1:-1]
                                step = 4 if len(hex_str) % 4 == 0 else 2
                                chars = []
                                for i in range(0, len(hex_str), step):
                                    code = int(hex_str[i:i+step], 16)
                                    chars.append(cmap.get(code, '?'))
                                stream_text.append(''.join(chars))
                if stream_text:
                    full_text.append(' '.join(stream_text))
        except:
            pass
            
    return '\n\n'.join(full_text)

if __name__ == '__main__':
    targets = [
        r'C:\Antigravity\GoldStandardLibrary\Academia Library Downloads\Academia.edu_Bundle_-_Emergent_Spacetime_Mass_Field_Modulation\Emergent_Spacetime_Mass_Field_Modulation.pdf',
        r'C:\Antigravity\GoldStandardLibrary\Academia Library Downloads\Academia.edu_Bundle_-_HARMONIC_RESONANCE_AND_TELLURIC_ELECTROM\HARMONIC_RESONANCE_AND_TELLURIC_ELECTROM.pdf',
        r'C:\Antigravity\GoldStandardLibrary\Academia Library Downloads\Academia.edu_Bundle_-_Field_First_Geometry_in_Fusion_Research_\papers_cited_by_this_one\2_Stellarator_Physics.pdf'
    ]
    for t in targets:
        print("="*70)
        print("FILE:", os.path.basename(t))
        print("="*70)
        text = read_pdf(t)
        print(text[:1200])
        print("\n")
