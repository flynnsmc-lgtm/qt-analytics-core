"""
markdown_to_pdf.py  v4 — Pure Unicode Text Edition
All equations rendered as crisp, scalable Unicode text using Cambria font.
No images. No blur. No pixelation.
"""

import os
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    HRFlowable, KeepTogether, Paragraph, SimpleDocTemplate, Spacer,
    Table, TableStyle, PageBreak
)

# ── Register Cambria (Unicode math serif font) ────────────────────────────────
FONT_DIR = r"C:\Windows\Fonts"

def _reg(name, path):
    try:
        pdfmetrics.registerFont(TTFont(name, path))
        return True
    except Exception:
        return False

_reg("Cambria",       os.path.join(FONT_DIR, "cambria.ttc"))
_reg("Cambria-Bold",  os.path.join(FONT_DIR, "cambriab.ttf"))
_reg("Calibri",       os.path.join(FONT_DIR, "calibri.ttf"))

MATH_FONT   = "Cambria"
BODY_FONT   = "Calibri"
BOLD_FONT   = "Cambria-Bold"
FALLBACK    = "Helvetica"

# ── Colours ───────────────────────────────────────────────────────────────────
DARK_NAVY   = colors.HexColor("#0D1B2A")
ACCENT_GOLD = colors.HexColor("#C9A84C")
LIGHT_GREY  = colors.HexColor("#F5F5F5")
MID_GREY    = colors.HexColor("#888888")
WHITE       = colors.white
RULE_BLUE   = colors.HexColor("#1A3A5C")
EQ_BG       = colors.HexColor("#EEF3FA")

PAGE_W, PAGE_H = A4
MARGIN      = 2 * cm
CONTENT_W   = PAGE_W - 2 * MARGIN


# ── Page template with footer ─────────────────────────────────────────────────
class PaperDoc(SimpleDocTemplate):
    def __init__(self, filename, series_label="", **kw):
        super().__init__(filename, **kw)
        self.series_label = series_label

    def afterPage(self):
        c = self.canv
        w, _ = A4
        c.saveState()
        c.setStrokeColor(RULE_BLUE)
        c.setLineWidth(0.5)
        c.line(MARGIN, 1.4 * cm, w - MARGIN, 1.4 * cm)
        c.setFont("Helvetica", 7)
        c.setFillColor(MID_GREY)
        c.drawString(MARGIN, 0.9 * cm, self.series_label)
        c.drawRightString(w - MARGIN, 0.9 * cm, f"Page {c.getPageNumber()}")
        c.restoreState()


# ── Styles ────────────────────────────────────────────────────────────────────
def make_styles():
    s = {}
    bf = BODY_FONT if BODY_FONT else FALLBACK
    mf = MATH_FONT if MATH_FONT else FALLBACK

    s["title"] = ParagraphStyle("title",
        fontName="Helvetica-Bold", fontSize=17, leading=22,
        textColor=WHITE, alignment=TA_CENTER)
    s["subtitle"] = ParagraphStyle("subtitle",
        fontName="Helvetica", fontSize=10, leading=14,
        textColor=ACCENT_GOLD, alignment=TA_CENTER, spaceAfter=2)
    s["abstract_heading"] = ParagraphStyle("abstract_heading",
        fontName="Helvetica-Bold", fontSize=9.5,
        textColor=ACCENT_GOLD, spaceAfter=3, spaceBefore=6)
    s["abstract"] = ParagraphStyle("abstract",
        fontName=mf, fontSize=9.5, leading=15,
        textColor=DARK_NAVY, alignment=TA_JUSTIFY,
        leftIndent=10, rightIndent=10, spaceAfter=6)
    s["h1"] = ParagraphStyle("h1",
        fontName="Helvetica-Bold", fontSize=13, leading=17,
        textColor=RULE_BLUE, spaceBefore=14, spaceAfter=4,
        keepWithNext=1)
    s["h2"] = ParagraphStyle("h2",
        fontName="Helvetica-Bold", fontSize=11, leading=15,
        textColor=DARK_NAVY, spaceBefore=10, spaceAfter=3,
        keepWithNext=1)
    s["h3"] = ParagraphStyle("h3",
        fontName="Helvetica-BoldOblique", fontSize=10, leading=14,
        textColor=RULE_BLUE, spaceBefore=7, spaceAfter=2,
        keepWithNext=1)
    s["body"] = ParagraphStyle("body",
        fontName=mf, fontSize=10, leading=15,
        textColor=DARK_NAVY, alignment=TA_JUSTIFY, spaceAfter=5)
    s["eq_display"] = ParagraphStyle("eq_display",
        fontName=mf, fontSize=11, leading=18,
        textColor=DARK_NAVY, alignment=TA_CENTER,
        spaceBefore=8, spaceAfter=8,
        backColor=EQ_BG,
        leftIndent=12, rightIndent=12,
        borderPadding=(6, 10, 6, 10))
    s["theorem"] = ParagraphStyle("theorem",
        fontName=mf, fontSize=10, leading=15,
        textColor=DARK_NAVY, alignment=TA_JUSTIFY,
        leftIndent=14, rightIndent=8,
        spaceAfter=5, spaceBefore=5,
        backColor=colors.HexColor("#EEF3F8"),
        borderPadding=6)
    s["bullet"] = ParagraphStyle("bullet",
        fontName=mf, fontSize=10, leading=14.5,
        textColor=DARK_NAVY, leftIndent=16, spaceAfter=2)
    s["quote"] = ParagraphStyle("quote",
        fontName=mf, fontSize=10, leading=14.5,
        textColor=RULE_BLUE, leftIndent=16, rightIndent=8,
        spaceAfter=4, spaceBefore=4,
        backColor=colors.HexColor("#F0F4FA"), borderPadding=5)
    s["ref"] = ParagraphStyle("ref",
        fontName="Helvetica", fontSize=8, leading=12,
        textColor=MID_GREY, leftIndent=16, firstLineIndent=-10, spaceAfter=2)
    return s


# ── LaTeX → Unicode converter ─────────────────────────────────────────────────
#
# Superscript Unicode map (digits + common letters)
_SUP = str.maketrans(
    "0123456789abcdefghijklmnoprstuvwxyz+-=()nN",
    "⁰¹²³⁴⁵⁶⁷⁸⁹ᵃᵇᶜᵈᵉᶠᵍʰⁱʲᵏˡᵐⁿᵒᵖʳˢᵗᵘᵛʷˣʸᶻ⁺⁻⁼⁽⁾ⁿᴺ"
)
_SUB = str.maketrans(
    "0123456789aehijklmnoprstuvx",
    "₀₁₂₃₄₅₆₇₈₉ₐₑₕᵢⱼₖₗₘₙₒₚᵣₛₜᵤᵥₓ"
)

def _to_sup(s: str) -> str:
    """Convert a short string to Unicode superscript, fallback to ^(s)."""
    try:
        result = s.translate(_SUP)
        if all(ord(c) > 127 or c in " .,/·" for c in result):
            return result
    except Exception:
        pass
    return f"^{{{s}}}" if len(s) > 1 else f"^{s}"

def _to_sub(s: str) -> str:
    """Convert a short string to Unicode subscript, fallback to _(s)."""
    try:
        result = s.translate(_SUB)
        if all(ord(c) > 127 or c in " .,/·" for c in result):
            return result
    except Exception:
        pass
    return f"_{{{s}}}" if len(s) > 1 else f"_{s}"


# Symbol table: LaTeX → Unicode
_SYMBOLS = [
    # Greek uppercase
    (r"\Alpha","Α"),(r"\Beta","Β"),(r"\Gamma","Γ"),(r"\Delta","Δ"),
    (r"\Epsilon","Ε"),(r"\Zeta","Ζ"),(r"\Eta","Η"),(r"\Theta","Θ"),
    (r"\Iota","Ι"),(r"\Kappa","Κ"),(r"\Lambda","Λ"),(r"\Mu","Μ"),
    (r"\Nu","Ν"),(r"\Xi","Ξ"),(r"\Pi","Π"),(r"\Rho","Ρ"),
    (r"\Sigma","Σ"),(r"\Tau","Τ"),(r"\Upsilon","Υ"),(r"\Phi","Φ"),
    (r"\Chi","Χ"),(r"\Psi","Ψ"),(r"\Omega","Ω"),
    # Greek lowercase
    (r"\alpha","α"),(r"\beta","β"),(r"\gamma","γ"),(r"\delta","δ"),
    (r"\epsilon","ε"),(r"\varepsilon","ε"),(r"\zeta","ζ"),(r"\eta","η"),
    (r"\theta","θ"),(r"\vartheta","ϑ"),(r"\iota","ι"),(r"\kappa","κ"),
    (r"\lambda","λ"),(r"\mu","μ"),(r"\nu","ν"),(r"\xi","ξ"),
    (r"\pi","π"),(r"\varpi","ϖ"),(r"\rho","ρ"),(r"\varrho","ϱ"),
    (r"\sigma","σ"),(r"\varsigma","ς"),(r"\tau","τ"),(r"\upsilon","υ"),
    (r"\phi","φ"),(r"\varphi","φ"),(r"\chi","χ"),(r"\psi","ψ"),(r"\omega","ω"),
    # Blackboard bold
    (r"\mathbb{R}","ℝ"),(r"\mathbb{C}","ℂ"),(r"\mathbb{N}","ℕ"),
    (r"\mathbb{Z}","ℤ"),(r"\mathbb{Q}","ℚ"),(r"\mathbb{P}","ℙ"),
    # Relations
    (r"\leq","≤"),(r"\geq","≥"),(r"\neq","≠"),(r"\approx","≈"),
    (r"\equiv","≡"),(r"\cong","≅"),(r"\sim","∼"),(r"\simeq","≃"),
    (r"\ll","≪"),(r"\gg","≫"),(r"\le","≤"),(r"\ge","≥"),(r"\ne","≠"),
    (r"\neqq","≠"),(r"\in","∈"),(r"\notin","∉"),(r"\subset","⊂"),
    (r"\subseteq","⊆"),(r"\cup","∪"),(r"\cap","∩"),(r"\emptyset","∅"),
    (r"\forall","∀"),(r"\exists","∃"),(r"\nexists","∄"),
    (r"\propto","∝"),(r"\perp","⊥"),(r"\parallel","∥"),
    # Arrows
    (r"\Rightarrow","⇒"),(r"\Leftarrow","⇐"),(r"\Leftrightarrow","⟺"),
    (r"\rightarrow","→"),(r"\leftarrow","←"),(r"\leftrightarrow","↔"),
    (r"\implies","⇒"),(r"\iff","⟺"),(r"\mapsto","↦"),
    (r"\hookrightarrow","↪"),(r"\Longrightarrow","⟹"),
    (r"\Longleftrightarrow","⟺"),(r"\longrightarrow","→"),
    (r"\to","→"),(r"\gets","←"),
    (r"\uparrow","↑"),(r"\downarrow","↓"),
    # Operators
    (r"\times","×"),(r"\cdot","·"),(r"\otimes","⊗"),(r"\oplus","⊕"),
    (r"\wedge","∧"),(r"\vee","∨"),(r"\neg","¬"),(r"\pm","±"),(r"\mp","∓"),
    (r"\circ","∘"),(r"\bullet","•"),
    # Brackets & delimiters
    (r"\langle","⟨"),(r"\rangle","⟩"),
    (r"\lfloor","⌊"),(r"\rfloor","⌋"),
    (r"\lceil","⌈"),(r"\rceil","⌉"),
    # Large operators
    (r"\sum","Σ"),(r"\prod","Π"),(r"\int","∫"),(r"\oint","∮"),
    (r"\iint","∬"),(r"\iiint","∭"),
    (r"\bigoplus","⊕"),(r"\bigotimes","⊗"),(r"\bigcup","⋃"),(r"\bigcap","⋂"),
    # Misc
    (r"\infty","∞"),(r"\partial","∂"),(r"\nabla","∇"),(r"\hbar","ℏ"),
    (r"\ell","ℓ"),(r"\wp","℘"),(r"\Re","Re"),(r"\Im","Im"),
    (r"\aleph","ℵ"),(r"\dagger","†"),(r"\ddagger","‡"),
    (r"\star","⋆"),(r"\ast","∗"),(r"\square","□"),(r"\Box","□"),
    (r"\triangle","△"),(r"\Diamond","◇"),
    (r"\therefore","∴"),(r"\because","∵"),
    (r"\ldots","…"),(r"\cdots","⋯"),(r"\vdots","⋮"),(r"\ddots","⋱"),
    # Special fractions
    (r"\tfrac{1}{2}","½"),(r"\frac{1}{2}","½"),
    (r"\tfrac{1}{3}","⅓"),(r"\frac{1}{3}","⅓"),
    (r"\tfrac{2}{3}","⅔"),(r"\frac{2}{3}","⅔"),
    (r"\tfrac{1}{4}","¼"),(r"\frac{1}{4}","¼"),
    (r"\tfrac{3}{4}","¾"),(r"\frac{3}{4}","¾"),
]


def latex_to_unicode(src: str, display: bool = False) -> str:
    """
    Convert LaTeX math source to clean Unicode text.
    Handles fractions, sub/superscripts, Greek, operators, and common structures.
    """
    s = src.strip()

    # ── Strip display delimiters ──
    for d in [r"\[", r"\]", "$$", "$"]:
        s = s.replace(d, "")

    # ── Strip structural LaTeX commands ──
    s = re.sub(r"\\(?:begin|end)\{[^}]+\}", "", s)
    s = re.sub(r"\\label\{[^}]*\}", "", s)
    s = re.sub(r"\\tag\{[^}]*\}", "", s)
    s = re.sub(r"\\(?:notag|nonumber|qed|quad|qquad)", " ", s)
    s = re.sub(r"\\(?:displaystyle|textstyle|scriptstyle)", "", s)
    s = re.sub(r"\\(?:left|right|middle|big[lr]?|Big[lr]?|bigg[lr]?|Bigg[lr]?)", "", s)

    # ── Multi-line align: replace \\ with newline marker, & with space ──
    s = re.sub(r"\\\\", "\n  ", s)
    s = s.replace("&", " ")

    # ── Known special fractions (do before general \frac) ──
    for latex, uni in _SYMBOLS:
        if latex.startswith(r"\frac") or latex.startswith(r"\tfrac"):
            s = s.replace(latex, uni)

    # ── General \frac{num}{den} ──
    def _frac(m):
        n, d = m.group(1).strip(), m.group(2).strip()
        # Clean sub-expressions
        n = latex_to_unicode(n).strip()
        d = latex_to_unicode(d).strip()
        if len(n) == 1 and len(d) == 1:
            return f"{n}/{d}"
        return f"({n})/({d})"

    s = re.sub(r"\\(?:t?frac|dfrac)\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}",
               _frac, s)

    # ── \sqrt{expr} ──
    s = re.sub(r"\\sqrt\{([^}]*)\}", r"√(\1)", s)
    s = re.sub(r"\\sqrt\[([^]]*)\]\{([^}]*)\}", r"(\2)^(1/\1)", s)

    # ── Font/style commands: strip the wrapper, keep content ──
    for cmd in ["mathrm","mathbf","mathcal","mathbb","mathit","mathsf","mathtt",
                "boldsymbol","text","textit","textbf","operatorname","hat","vec",
                "tilde","overline","underline","widetilde","widehat","bar","dot",
                "ddot","check","acute","grave","breve"]:
        s = re.sub(rf"\\{cmd}\{{([^{{}}]*)\}}", r"\1", s)

    # ── Subscripts: _{...} or _x ──
    def _sub(m):
        inner = m.group(1) if m.group(1) is not None else m.group(2)
        inner = latex_to_unicode(inner).strip()
        return f"<sub>{inner}</sub>"

    s = re.sub(r"_\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|_([^\s{\\])", _sub, s)

    # ── Superscripts: ^{...} or ^x ──
    def _sup(m):
        inner = m.group(1) if m.group(1) is not None else m.group(2)
        inner = latex_to_unicode(inner).strip()
        return f"<super>{inner}</super>"

    s = re.sub(r"\^\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}|\^([^\s{\\])", _sup, s)

    # ── \pmod{n} ──
    s = re.sub(r"\\pmod\{([^}]*)\}", r" (mod \1)", s)
    s = re.sub(r"\\bmod", "mod", s)

    # ── \xrightarrow{text} ──
    s = re.sub(r"\\x(?:right|left)arrow\{[^}]*\}", "→", s)

    # ── Operator names ──
    for op in ["sup","inf","lim","max","min","det","ker","dim","deg",
               "log","exp","sin","cos","tan","sinh","cosh","tanh",
               "gcd","lcm","grad","div","curl","tr","rank","span"]:
        s = re.sub(rf"\\{op}(?=[^a-zA-Z]|$)", op, s)

    # ── Apply symbol table (after structural processing) ──
    for latex, uni in _SYMBOLS:
        if not latex.startswith(r"\frac") and not latex.startswith(r"\tfrac"):
            s = s.replace(latex, uni)

    # ── Escaped braces/brackets ──
    s = s.replace(r"\{", "(").replace(r"\}", ")")
    s = s.replace(r"\|", "‖").replace(r"\,", " ").replace(r"\;", " ")
    s = s.replace(r"\!", "").replace(r"\:", " ")

    # ── Remove remaining unknown LaTeX commands ──
    s = re.sub(r"\\[a-zA-Z]+\*?", "", s)

    # ── Clean up braces and extra whitespace ──
    s = re.sub(r"[{}]", "", s)
    s = re.sub(r" {2,}", " ", s)
    s = s.strip()

    return s


# ── Inline paragraph text handler ────────────────────────────────────────────
def _inline(text: str, in_abstract: bool = False) -> str:
    """
    Process a line of markdown body text:
    - Convert inline $...$ and \(...\) math to Unicode
    - Apply bold/italic markup
    - Escape XML
    """
    # Convert inline math $...$ → Unicode
    def _math_replace(m):
        return latex_to_unicode(m.group(1))

    text = re.sub(r"\\\[(.*?)\\\]", lambda m: latex_to_unicode(m.group(1)), text, flags=re.DOTALL)
    text = re.sub(r"\$\$(.+?)\$\$", lambda m: latex_to_unicode(m.group(1)), text, flags=re.DOTALL)
    text = re.sub(r"\\\((.*?)\\\)", _math_replace, text)
    text = re.sub(r"\$(.+?)\$", _math_replace, text)

    # Markdown formatting → ReportLab XML tags
    text = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", text)
    text = re.sub(r"\*\*(.+?)\*\*",     r"<b>\1</b>",         text)
    text = re.sub(r"\*(.+?)\*",         r"<i>\1</i>",         text)
    text = re.sub(r"(?<![*_])_(.+?)_(?![*_])", r"<i>\1</i>",  text)
    text = re.sub(r"`(.+?)`",           r"<font name='Courier' size='9'>\1</font>", text)

    # Protect our tags, then escape, then restore
    placeholders: dict[str, str] = {}
    def protect(m):
        key = f"\x00_PH_{len(placeholders)}_\x00"
        placeholders[key] = m.group(0)
        return key
    text = re.sub(r"</?(?:b|i|font|u|sub|super)[^>]*>", protect, text)
    text = text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    for k, v in placeholders.items():
        text = text.replace(k, v)

    return text


# ── Markdown → flowables ──────────────────────────────────────────────────────
def md_to_flowables(md_text: str, styles: dict) -> list:
    flowables = []
    md_text = md_text.replace("\r\n", "\n").replace("\r", "\n")
    lines = md_text.split("\n")
    i = 0
    in_abstract = False
    in_table = False
    table_rows: list = []
    header_done = False

    def flush_table():
        nonlocal table_rows, in_table
        if not table_rows:
            in_table = False
            return
        col_count = max(len(r) for r in table_rows)
        padded = [r + [""] * (col_count - len(r)) for r in table_rows]
        col_w = [CONTENT_W / col_count] * col_count
        tbl = Table(
            [[Paragraph(_inline(c), styles["body"]) for c in row] for row in padded],
            colWidths=col_w, repeatRows=1)
        tbl.setStyle(TableStyle([
            ("BACKGROUND",    (0,0),(-1,0), RULE_BLUE),
            ("TEXTCOLOR",     (0,0),(-1,0), WHITE),
            ("FONTNAME",      (0,0),(-1,0), "Helvetica-Bold"),
            ("FONTSIZE",      (0,0),(-1,-1), 8.5),
            ("ROWBACKGROUNDS",(0,1),(-1,-1), [LIGHT_GREY, WHITE]),
            ("GRID",          (0,0),(-1,-1), 0.3, colors.HexColor("#CCCCCC")),
            ("TOPPADDING",    (0,0),(-1,-1), 4),
            ("BOTTOMPADDING", (0,0),(-1,-1), 4),
            ("LEFTPADDING",   (0,0),(-1,-1), 6),
            ("RIGHTPADDING",  (0,0),(-1,-1), 6),
            ("VALIGN",        (0,0),(-1,-1), "MIDDLE"),
        ]))
        flowables.append(Spacer(1, 5))
        flowables.append(tbl)
        flowables.append(Spacer(1, 7))
        table_rows.clear()
        in_table = False

    def add_para(text: str, style_key: str):
        cleaned = _inline(text, in_abstract)
        try:
            flowables.append(Paragraph(cleaned, styles[style_key]))
        except Exception:
            plain = re.sub(r"<[^>]+>", "", cleaned)
            try:
                flowables.append(Paragraph(plain, styles[style_key]))
            except Exception:
                pass  # skip truly broken lines

    def add_equation(raw_latex: str):
        """Convert LaTeX block to Unicode and add as a styled, centred paragraph, kept together."""
        parts = [p.strip() for p in raw_latex.split("\n") if p.strip()]
        converted_lines = []
        for part in parts:
            uni = latex_to_unicode(part, display=True)
            if uni:
                converted_lines.append(uni)

        if not converted_lines:
            return

        eq_html = "<br/>".join(converted_lines)
        eq_html = eq_html.replace("&", "&amp;").replace("<br/>", "\x00br\x00")
        eq_html = eq_html.replace("<", "&lt;").replace(">", "&gt;")
        eq_html = eq_html.replace("\x00br\x00", "<br/>")

        spacer_before = Spacer(1, 6)
        spacer_after  = Spacer(1, 6)
        try:
            para = Paragraph(eq_html, styles["eq_display"])
        except Exception:
            plain = eq_html.replace("<br/>", " | ").replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">")
            try:
                para = Paragraph(plain, styles["eq_display"])
            except Exception:
                return
        # KeepTogether ensures the equation block never straddles a page break
        flowables.append(KeepTogether([spacer_before, para, spacer_after]))

    # ─── Line-by-line parsing ───────────────────────────────────────────────
    while i < len(lines):
        raw = lines[i]
        line = raw.rstrip()

        # HR
        if re.match(r"^-{3,}$", line):
            flush_table()
            flowables.append(HRFlowable(width="100%", thickness=0.5,
                                        color=RULE_BLUE, spaceAfter=4, spaceBefore=4))
            i += 1
            continue

        # PageBreak
        if line.strip() == "\\pagebreak":
            flush_table()
            flowables.append(PageBreak())
            i += 1
            continue

        # H1 title banner
        if line.startswith("# ") and not header_done:
            flush_table()
            title_text = _inline(line[2:].strip())
            banner = Table([[Paragraph(title_text, styles["title"])]], colWidths=[CONTENT_W])
            banner.setStyle(TableStyle([
                ("BACKGROUND",    (0,0),(-1,-1), DARK_NAVY),
                ("TOPPADDING",    (0,0),(-1,-1), 18),
                ("BOTTOMPADDING", (0,0),(-1,-1), 18),
                ("LEFTPADDING",   (0,0),(-1,-1), 14),
                ("RIGHTPADDING",  (0,0),(-1,-1), 14),
            ]))
            flowables.append(banner)
            flowables.append(Spacer(1, 8))
            header_done = True
            i += 1
            continue

        # Bold meta (Author, Affiliation etc.)
        if line.startswith("**") and ": " in line and not line.startswith("**Abstract"):
            flush_table()
            add_para(line, "subtitle")
            i += 1
            continue

        # H2
        if line.startswith("## "):
            flush_table(); in_abstract = False
            heading = Paragraph(_inline(line[3:].strip()), styles["h1"])
            rule = HRFlowable(width="100%", thickness=0.8,
                              color=ACCENT_GOLD, spaceAfter=3)
            # Keep heading + rule together so neither orphans at page bottom
            flowables.append(KeepTogether([heading, rule]))
            i += 1
            continue

        # H3
        if line.startswith("### "):
            flush_table()
            label = line[4:].strip()
            in_abstract = label.lower() == "abstract"
            add_para(label, "h2" if not in_abstract else "abstract_heading")
            i += 1
            continue

        # H4
        if line.startswith("#### "):
            flush_table()
            add_para(line[5:].strip(), "h3")
            i += 1
            continue

        # Table row
        if line.startswith("|"):
            if re.match(r"^[| :-]+$", line):
                i += 1; continue
            in_table = True
            table_rows.append([c.strip() for c in line.strip("|").split("|")])
            i += 1
            continue
        else:
            if in_table:
                flush_table()

        # Blockquote
        if line.startswith("> "):
            flush_table()
            add_para(line[2:], "quote")
            i += 1
            continue

        # \begin{equation|align|aligned} ... \end{...}
        if re.match(r"\s*\\begin\{(?:equation|align|aligned)\}", line):
            flush_table()
            block = []
            while i < len(lines):
                block.append(lines[i])
                if re.search(r"\\end\{(?:equation|align|aligned)\}", lines[i]):
                    i += 1; break
                i += 1
            src = re.sub(r"\\(?:begin|end)\{[^}]+\}", "", "\n".join(block))
            add_equation(src)
            continue

        # $$ ... $$ (single-line or multi-line)
        if line.strip().startswith("$$"):
            flush_table()
            stripped = line.strip()
            # Single-line: $$...$$
            if stripped.endswith("$$") and len(stripped) > 4:
                add_equation(stripped[2:-2])
                i += 1
                continue
            # Multi-line block
            inner = stripped[2:]
            block = [inner] if inner.replace("$","").strip() else []
            i += 1
            while i < len(lines):
                l2 = lines[i].strip()
                if l2 == "$$" or l2.endswith("$$"):
                    block.append(l2.rstrip("$").rstrip())
                    i += 1; break
                block.append(lines[i])
                i += 1
            add_equation("\n".join(block))
            continue

        # \[ ... \]
        if line.strip().startswith("\\["):
            flush_table()
            inner = line.strip()[2:]
            block = [inner]
            i += 1
            while i < len(lines):
                l2 = lines[i].strip()
                if l2.endswith("\\]"):
                    block.append(l2[:-2])
                    i += 1; break
                block.append(lines[i])
                i += 1
            add_equation("\n".join(block))
            continue

        # Bullet / numbered list
        if re.match(r"^[-*] ", line):
            flush_table()
            add_para("• " + line[2:], "bullet")
            i += 1
            continue
        if re.match(r"^\d+\. ", line):
            flush_table()
            add_para("• " + re.sub(r"^\d+\. ", "", line), "bullet")
            i += 1
            continue

        # Theorem / Definition / Lemma etc.
        if re.match(r"\*\*(?:Definition|Theorem|Lemma|Corollary|Remark|Proof|Proposition|Prediction)", line):
            flush_table()
            add_para(line, "theorem")
            i += 1
            continue

        # Blank line
        if not line.strip():
            flush_table()
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        # Body / abstract
        flush_table()
        add_para(line, "abstract" if in_abstract else "body")
        i += 1

    flush_table()
    return flowables


# ── Converter ─────────────────────────────────────────────────────────────────
def convert_paper(md_path: Path, out_dir: Path):
    md_text = md_path.read_text(encoding="utf-8-sig")
    series_match = re.search(r"Paper (\d) of 6", md_text[:800])
    paper_num = series_match.group(1) if series_match else "?"
    series_label = (f"Unified Chi Dynamics  |  Paper {paper_num} of 6  |  "
                    f"Stephen Fitzpatrick / QT Analytics (Scotland)  |  October 2026")

    out_path = out_dir / (md_path.stem + ".pdf")
    doc = PaperDoc(str(out_path), series_label=series_label,
                   pagesize=A4,
                   leftMargin=MARGIN, rightMargin=MARGIN,
                   topMargin=2.2*cm, bottomMargin=2.2*cm)
    styles = make_styles()
    story = md_to_flowables(md_text, styles)
    doc.build(story)
    kb = out_path.stat().st_size // 1024
    print(f"  OK  {out_path.name}  ({kb} KB)")


def main():
    repo_root = Path(__file__).parent.parent
    papers_dir = repo_root / "papers"
    pdf_dir = papers_dir / "pdf"
    pdf_dir.mkdir(exist_ok=True)

    md_files = sorted(papers_dir.glob("PAPER_*.md"))
    if not md_files:
        print("No PAPER_*.md files found in", papers_dir)
        sys.exit(1)

    print(f"\nConverting {len(md_files)} papers — pure Unicode text equations\n")
    for md in md_files:
        print(f"  -> {md.name}")
        try:
            convert_paper(md, pdf_dir)
        except Exception as e:
            print(f"  ERROR: {e}")

    print(f"\nDone. PDFs in:\n   {pdf_dir}\n")


if __name__ == "__main__":
    main()
