"""
markdown_to_pdf.py
Converts the 5 Unified Chi Dynamics papers from Markdown to styled PDFs.
Uses ReportLab only — no external dependencies.
"""

import os
import re
import sys
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

# ── Colour Palette ─────────────────────────────────────────────────────────────
DARK_NAVY   = colors.HexColor("#0D1B2A")
ACCENT_GOLD = colors.HexColor("#C9A84C")
LIGHT_GREY  = colors.HexColor("#F5F5F5")
MID_GREY    = colors.HexColor("#888888")
WHITE       = colors.white
RULE_BLUE   = colors.HexColor("#1A3A5C")

# ── Page header/footer callback ────────────────────────────────────────────────
class PaperTemplate(SimpleDocTemplate):
    def __init__(self, filename, series_label="", **kw):
        super().__init__(filename, **kw)
        self.series_label = series_label

    def handle_pageBegin(self):
        super().handle_pageBegin()

    def afterPage(self):
        canvas = self.canv
        w, h = A4
        # Footer rule
        canvas.saveState()
        canvas.setStrokeColor(RULE_BLUE)
        canvas.setLineWidth(0.5)
        canvas.line(2*cm, 1.4*cm, w - 2*cm, 1.4*cm)
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(MID_GREY)
        canvas.drawString(2*cm, 1.0*cm, self.series_label)
        canvas.drawRightString(w - 2*cm, 1.0*cm, f"Page {canvas.getPageNumber()}")
        canvas.restoreState()


# ── Style sheet ────────────────────────────────────────────────────────────────
def make_styles():
    base = getSampleStyleSheet()

    styles = {}

    styles["title"] = ParagraphStyle(
        "title",
        fontName="Helvetica-Bold",
        fontSize=18,
        leading=24,
        textColor=WHITE,
        alignment=TA_CENTER,
        spaceAfter=4,
    )
    styles["subtitle"] = ParagraphStyle(
        "subtitle",
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=ACCENT_GOLD,
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    styles["meta"] = ParagraphStyle(
        "meta",
        fontName="Helvetica",
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#CCCCCC"),
        alignment=TA_CENTER,
        spaceAfter=2,
    )
    styles["abstract_heading"] = ParagraphStyle(
        "abstract_heading",
        fontName="Helvetica-Bold",
        fontSize=9,
        leading=13,
        textColor=ACCENT_GOLD,
        spaceAfter=3,
        spaceBefore=6,
    )
    styles["abstract"] = ParagraphStyle(
        "abstract",
        fontName="Helvetica-Oblique",
        fontSize=9,
        leading=14,
        textColor=DARK_NAVY,
        alignment=TA_JUSTIFY,
        leftIndent=10,
        rightIndent=10,
        spaceAfter=6,
    )
    styles["h1"] = ParagraphStyle(
        "h1",
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=RULE_BLUE,
        spaceBefore=14,
        spaceAfter=4,
        borderPadding=(0, 0, 3, 0),
    )
    styles["h2"] = ParagraphStyle(
        "h2",
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=15,
        textColor=DARK_NAVY,
        spaceBefore=10,
        spaceAfter=3,
    )
    styles["h3"] = ParagraphStyle(
        "h3",
        fontName="Helvetica-BoldOblique",
        fontSize=10,
        leading=14,
        textColor=RULE_BLUE,
        spaceBefore=7,
        spaceAfter=2,
    )
    styles["body"] = ParagraphStyle(
        "body",
        fontName="Helvetica",
        fontSize=9.5,
        leading=14.5,
        textColor=DARK_NAVY,
        alignment=TA_JUSTIFY,
        spaceAfter=5,
    )
    styles["theorem"] = ParagraphStyle(
        "theorem",
        fontName="Helvetica-Oblique",
        fontSize=9.5,
        leading=14,
        textColor=DARK_NAVY,
        alignment=TA_JUSTIFY,
        leftIndent=14,
        rightIndent=8,
        spaceAfter=4,
        spaceBefore=4,
        backColor=colors.HexColor("#EEF3F8"),
        borderPadding=6,
    )
    styles["equation"] = ParagraphStyle(
        "equation",
        fontName="Courier",
        fontSize=8.5,
        leading=13,
        textColor=colors.HexColor("#1A1A4A"),
        leftIndent=20,
        spaceAfter=5,
        spaceBefore=3,
    )
    styles["bullet"] = ParagraphStyle(
        "bullet",
        fontName="Helvetica",
        fontSize=9.5,
        leading=14,
        textColor=DARK_NAVY,
        leftIndent=16,
        bulletIndent=6,
        spaceAfter=2,
    )
    styles["quote"] = ParagraphStyle(
        "quote",
        fontName="Helvetica-Oblique",
        fontSize=9.5,
        leading=14,
        textColor=RULE_BLUE,
        leftIndent=16,
        rightIndent=8,
        spaceAfter=4,
        spaceBefore=4,
        borderPadding=5,
        backColor=colors.HexColor("#F0F4FA"),
    )
    styles["ref"] = ParagraphStyle(
        "ref",
        fontName="Helvetica",
        fontSize=8,
        leading=12,
        textColor=MID_GREY,
        leftIndent=16,
        firstLineIndent=-10,
        spaceAfter=2,
    )
    return styles


# ── Math: convert LaTeX inline/block to readable text ─────────────────────────
def clean_math(text):
    """Strip LaTeX delimiters and convert common symbols to Unicode/readable form."""
    replacements = [
        # Environments
        (r"\\begin\{equation\}.*?\\end\{equation\}", lambda m: _format_eq(m.group())),
        (r"\\begin\{align\}.*?\\end\{align\}", lambda m: _format_eq(m.group())),
        (r"\\\[.*?\\\]", lambda m: _format_eq(m.group())),
    ]
    # Block math first
    text = re.sub(r"\\begin\{(?:equation|align|aligned)\}(.*?)\\end\{(?:equation|align|aligned)\}",
                  lambda m: "\n[" + _latexmath(m.group(1).strip()) + "]\n",
                  text, flags=re.DOTALL)
    text = re.sub(r"\\\[(.*?)\\\]",
                  lambda m: "\n[" + _latexmath(m.group(1).strip()) + "]\n",
                  text, flags=re.DOTALL)
    # Inline math
    text = re.sub(r"\$\$(.*?)\$\$",
                  lambda m: " [" + _latexmath(m.group(1)) + "] ",
                  text, flags=re.DOTALL)
    text = re.sub(r"\$(.*?)\$",
                  lambda m: _latexmath(m.group(1)),
                  text)
    return text


def _format_eq(raw):
    inner = re.sub(r"\\(?:begin|end)\{[^}]+\}", "", raw)
    return "\n[" + _latexmath(inner.strip()) + "]\n"


def _latexmath(s):
    """Best-effort LaTeX → readable Unicode/ASCII."""
    s = s.replace("\n", " ").replace("\\\\", " | ")
    s = re.sub(r"\\label\{[^}]*\}", "", s)
    s = re.sub(r"\\(?:quad|qquad|,|;|!)", " ", s)
    s = re.sub(r"\\text\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\mathrm\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\mathbf\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\mathcal\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\mathbb\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\boldsymbol\{([^}]*)\}", r"\1", s)
    s = re.sub(r"\\overline\{([^}]*)\}", r"\1̄", s)
    s = re.sub(r"\\widetilde\{([^}]*)\}", r"\1̃", s)
    s = re.sub(r"\\hat\{([^}]*)\}", r"\1̂", s)
    s = re.sub(r"\\vec\{([^}]*)\}", r"\1⃗", s)
    s = re.sub(r"\\frac\{([^}]*)\}\{([^}]*)\}", r"(\1)/(\2)", s)
    s = re.sub(r"\\tfrac\{([^}]*)\}\{([^}]*)\}", r"(\1)/(\2)", s)
    s = re.sub(r"\\sqrt\{([^}]*)\}", r"√(\1)", s)
    s = re.sub(r"\^(\{[^}]*\}|[^\s{])", lambda m: "^" + m.group(1).strip("{}"), s)
    s = re.sub(r"_(\{[^}]*\}|[^\s{])", lambda m: "_" + m.group(1).strip("{}"), s)
    sym = {
        r"\partial": "∂", r"\nabla": "∇", r"\Delta": "Δ", r"\delta": "δ",
        r"\alpha": "α", r"\beta": "β", r"\gamma": "γ", r"\Gamma": "Γ",
        r"\epsilon": "ε", r"\varepsilon": "ε", r"\zeta": "ζ", r"\eta": "η",
        r"\theta": "θ", r"\Theta": "Θ", r"\kappa": "κ", r"\lambda": "λ",
        r"\Lambda": "Λ", r"\mu": "μ", r"\nu": "ν", r"\xi": "ξ", r"\Xi": "Ξ",
        r"\pi": "π", r"\Pi": "Π", r"\rho": "ρ", r"\sigma": "σ", r"\Sigma": "Σ",
        r"\tau": "τ", r"\phi": "φ", r"\Phi": "Φ", r"\chi": "χ", r"\psi": "ψ",
        r"\Psi": "Ψ", r"\omega": "ω", r"\Omega": "Ω",
        r"\infty": "∞", r"\in": "∈", r"\notin": "∉", r"\subset": "⊂",
        r"\subseteq": "⊆", r"\cup": "∪", r"\cap": "∩", r"\emptyset": "∅",
        r"\forall": "∀", r"\exists": "∃", r"\nexists": "∄",
        r"\leq": "≤", r"\geq": "≥", r"\neq": "≠", r"\approx": "≈",
        r"\equiv": "≡", r"\cong": "≅", r"\sim": "∼", r"\simeq": "≃",
        r"\ll": "≪", r"\gg": "≫", r"\to": "→", r"\rightarrow": "→",
        r"\leftarrow": "←", r"\Rightarrow": "⇒", r"\Leftrightarrow": "⟺",
        r"\iff": "⟺", r"\mapsto": "↦", r"\hookrightarrow": "↪",
        r"\times": "×", r"\cdot": "·", r"\otimes": "⊗", r"\oplus": "⊕",
        r"\wedge": "∧", r"\vee": "∨", r"\neg": "¬", r"\langle": "⟨",
        r"\rangle": "⟩", r"\|": "‖", r"\oint": "∮", r"\int": "∫",
        r"\sum": "Σ", r"\prod": "Π", r"\sqrt": "√", r"\pm": "±",
        r"\mp": "∓", r"\ge": "≥", r"\le": "≤", r"\ne": "≠",
        r"\mathbb{P}": "ℙ", r"\mathbb{R}": "ℝ", r"\mathbb{C}": "ℂ",
        r"\mathbb{N}": "ℕ", r"\mathbb{Z}": "ℤ", r"\mathbb{Q}": "ℚ",
        r"\sup": "sup", r"\inf": "inf", r"\lim": "lim", r"\max": "max",
        r"\min": "min", r"\log": "log", r"\exp": "exp", r"\det": "det",
        r"\ker": "ker", r"\dim": "dim", r"\deg": "deg",
        r"\left": "", r"\right": "", r"\big": "", r"\Big": "",
        r"\middle": "", r"\,": " ", r"\;": " ", r"\!": "",
    }
    for latex, uni in sym.items():
        s = s.replace(latex, uni)
    s = re.sub(r"\\[a-zA-Z]+", "", s)  # strip remaining unknown commands
    s = re.sub(r"[{}]", "", s)
    return s.strip()


# ── Markdown → flowables ───────────────────────────────────────────────────────
def md_to_flowables(md_text, styles, series_label):
    """Parse markdown into ReportLab flowables."""
    flowables = []
    lines = md_text.split("\n")
    i = 0
    in_abstract = False
    in_table = False
    table_rows = []
    header_done = False

    def flush_table():
        nonlocal table_rows, in_table
        if not table_rows:
            return
        col_count = max(len(r) for r in table_rows)
        # Pad rows
        padded = [r + [""] * (col_count - len(r)) for r in table_rows]
        col_w = [(A4[0] - 4*cm) / col_count] * col_count
        t = Table(
            [[Paragraph(cell, styles["body"]) for cell in row] for row in padded],
            colWidths=col_w,
            repeatRows=1,
        )
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), RULE_BLUE),
            ("TEXTCOLOR",  (0, 0), (-1, 0), WHITE),
            ("FONTNAME",   (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE",   (0, 0), (-1, -1), 8.5),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [LIGHT_GREY, WHITE]),
            ("GRID",       (0, 0), (-1, -1), 0.3, colors.HexColor("#CCCCCC")),
            ("TOPPADDING", (0, 0), (-1, -1), 4),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
            ("LEFTPADDING",  (0, 0), (-1, -1), 6),
            ("RIGHTPADDING", (0, 0), (-1, -1), 6),
            ("VALIGN",     (0, 0), (-1, -1), "MIDDLE"),
        ]))
        flowables.append(Spacer(1, 4))
        flowables.append(t)
        flowables.append(Spacer(1, 6))
        table_rows = []
        in_table = False

    def add_text(text, style_name="body"):
        cleaned = clean_math(text)
        # Bold/italic inline
        cleaned = re.sub(r"\*\*\*(.+?)\*\*\*", r"<b><i>\1</i></b>", cleaned)
        cleaned = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", cleaned)
        cleaned = re.sub(r"\*(.+?)\*", r"<i>\1</i>", cleaned)
        cleaned = re.sub(r"_(.+?)_", r"<i>\1</i>", cleaned)
        cleaned = re.sub(r"`(.+?)`", r"<font name='Courier'>\1</font>", cleaned)
        # Escape XML special chars (except our tags)
        cleaned = cleaned.replace("&", "&amp;")
        cleaned = cleaned.replace("<b>", "\x00b\x00").replace("</b>", "\x01b\x01")
        cleaned = cleaned.replace("<i>", "\x00i\x00").replace("</i>", "\x01i\x01")
        cleaned = cleaned.replace("<font", "\x00font").replace("</font>", "\x01font\x01")
        cleaned = cleaned.replace("<", "&lt;").replace(">", "&gt;")
        cleaned = cleaned.replace("\x00b\x00", "<b>").replace("\x01b\x01", "</b>")
        cleaned = cleaned.replace("\x00i\x00", "<i>").replace("\x01i\x01", "</i>")
        cleaned = cleaned.replace("\x00font", "<font").replace("\x01font\x01", "</font>")
        try:
            flowables.append(Paragraph(cleaned, styles[style_name]))
        except Exception:
            flowables.append(Paragraph(re.sub(r"<[^>]+>", "", cleaned), styles[style_name]))

    while i < len(lines):
        line = lines[i]
        raw = line.rstrip()

        # ── Skip the separator lines ──
        if re.match(r"^-{3,}$", raw):
            flush_table()
            flowables.append(HRFlowable(width="100%", thickness=0.5,
                                        color=RULE_BLUE, spaceAfter=4, spaceBefore=4))
            i += 1
            continue

        # ── Title block (first # heading) ──
        if raw.startswith("# ") and not header_done:
            flush_table()
            title_text = raw[2:].strip()
            # Draw coloured title banner
            banner_data = [[Paragraph(clean_math(title_text), styles["title"])]]
            banner = Table(banner_data, colWidths=[A4[0] - 4*cm])
            banner.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, -1), DARK_NAVY),
                ("TOPPADDING",    (0, 0), (-1, -1), 18),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 18),
                ("LEFTPADDING",   (0, 0), (-1, -1), 16),
                ("RIGHTPADDING",  (0, 0), (-1, -1), 16),
            ]))
            flowables.append(banner)
            flowables.append(Spacer(1, 6))
            header_done = True
            i += 1
            continue

        # ── Bold meta lines (Author, Affiliation, etc.) ──
        if raw.startswith("**") and not raw.startswith("**Abstract"):
            flush_table()
            add_text(raw, "subtitle")
            i += 1
            continue

        # ── H2 ──
        if raw.startswith("## "):
            flush_table()
            in_abstract = False
            add_text(raw[3:].strip(), "h1")
            flowables.append(HRFlowable(width="100%", thickness=1,
                                        color=ACCENT_GOLD, spaceAfter=3, spaceBefore=0))
            i += 1
            continue

        # ── H3 ──
        if raw.startswith("### "):
            flush_table()
            in_abstract = raw[4:].strip().lower() == "abstract"
            add_text(raw[4:].strip(), "h2" if not in_abstract else "abstract_heading")
            i += 1
            continue

        # ── H4 ──
        if raw.startswith("#### "):
            flush_table()
            add_text(raw[5:].strip(), "h3")
            i += 1
            continue

        # ── Table rows ──
        if raw.startswith("|"):
            cells = [c.strip() for c in raw.strip("|").split("|")]
            if re.match(r"^\s*[-:]+\s*$", cells[0]):
                i += 1
                continue  # separator row
            in_table = True
            table_rows.append(cells)
            i += 1
            continue
        else:
            if in_table:
                flush_table()

        # ── Blockquote ──
        if raw.startswith("> "):
            flush_table()
            add_text(raw[2:], "quote")
            i += 1
            continue

        # ── Block equations \begin{} … \end{} ──
        if re.match(r"\\begin\{(equation|align|aligned)\}", raw):
            block = []
            while i < len(lines):
                block.append(lines[i])
                if re.match(r"\\end\{(equation|align|aligned)\}", lines[i].strip()):
                    i += 1
                    break
                i += 1
            eq_text = _latexmath(" ".join(block))
            flowables.append(Paragraph(eq_text, styles["equation"]))
            continue

        # ── $$ block equations ──
        if raw.startswith("$$"):
            block = [raw[2:]]
            i += 1
            while i < len(lines) and not lines[i].strip().endswith("$$"):
                block.append(lines[i])
                i += 1
            if i < len(lines):
                block.append(lines[i].replace("$$", ""))
                i += 1
            eq_text = _latexmath(" ".join(block))
            flowables.append(Paragraph(eq_text, styles["equation"]))
            continue

        # ── Bullet ──
        if re.match(r"^[-*] ", raw):
            flush_table()
            add_text("• " + raw[2:], "bullet")
            i += 1
            continue

        # ── Numbered list ──
        if re.match(r"^\d+\. ", raw):
            flush_table()
            add_text(re.sub(r"^\d+\. ", "• ", raw), "bullet")
            i += 1
            continue

        # ── Definition / Theorem / Lemma ──
        if re.match(r"\*\*(Definition|Theorem|Lemma|Corollary|Remark|Proof|Proposition)", raw):
            flush_table()
            add_text(raw, "theorem")
            i += 1
            continue

        # ── Blank line ──
        if not raw.strip():
            flush_table()
            flowables.append(Spacer(1, 4))
            i += 1
            continue

        # ── Default body ──
        flush_table()
        style = "abstract" if in_abstract else "body"
        add_text(raw, style)
        i += 1

    flush_table()
    return flowables


# ── Main ──────────────────────────────────────────────────────────────────────
def convert_paper(md_path: Path, out_dir: Path):
    md_text = md_path.read_text(encoding="utf-8")

    # Extract series label from first line
    first_line = md_text.split("\n")[0].strip("# ").strip()
    series_match = re.search(r"Paper (\d) of 5", md_text[:800])
    paper_num = series_match.group(1) if series_match else "?"
    series_label = f"Unified Chi Dynamics — Paper {paper_num} of 5  |  Stephen Fitzpatrick / QT Analytics (Scotland)  |  October 2026"

    out_path = out_dir / (md_path.stem + ".pdf")
    doc = PaperTemplate(
        str(out_path),
        series_label=series_label,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2.2*cm,
        bottomMargin=2.2*cm,
    )

    styles = make_styles()
    story = md_to_flowables(md_text, styles, series_label)
    doc.build(story)
    print(f"  ✅  {out_path.name}  ({out_path.stat().st_size // 1024} KB)")
    return out_path


def main():
    repo_root = Path(__file__).parent.parent
    papers_dir = repo_root / "papers"
    pdf_dir = repo_root / "papers" / "pdf"
    pdf_dir.mkdir(exist_ok=True)

    md_files = sorted(papers_dir.glob("PAPER_*.md"))
    if not md_files:
        print("No PAPER_*.md files found in", papers_dir)
        sys.exit(1)

    print(f"\n📄 Converting {len(md_files)} papers to PDF → {pdf_dir}\n")
    for md in md_files:
        convert_paper(md, pdf_dir)

    print(f"\n🎉 All done! PDFs saved to:\n   {pdf_dir}\n")


if __name__ == "__main__":
    main()
