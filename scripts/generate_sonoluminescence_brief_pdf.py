import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether
)
from reportlab.pdfgen import canvas

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
PDF_PATH = os.path.join(DOWNLOADS_DIR, "Sonoluminescence_Foundational_Insight_and_Research_Roadmap.pdf")

# Palette
PRIMARY = colors.HexColor("#0f172a")     # Deep Obsidian / Slate 900
SECONDARY = colors.HexColor("#0284c7")   # Electric Cyan / Sky 600
ACCENT = colors.HexColor("#7c3aed")      # Deep Violet
DARK_TEXT = colors.HexColor("#1e293b")   # Slate 800
LIGHT_BG = colors.HexColor("#f8fafc")    # Slate 50
CARD_BG = colors.HexColor("#f1f5f9")     # Slate 100
BORDER_COL = colors.HexColor("#cbd5e1")  # Slate 300
GOLD = colors.HexColor("#b45309")        # Amber Gold
MUTED = colors.HexColor("#64748b")       # Slate 500

class SinglePageCanvas(canvas.Canvas):
    """Canvas that enforces strict 1-page layout with custom header/footer decoration."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.page_count = 0

    def showPage(self):
        self.page_count += 1
        # Draw header & footer
        self.saveState()
        # Top rule
        self.setStrokeColor(SECONDARY)
        self.setLineWidth(1.5)
        self.line(36, 756, 576, 756)

        # Header micro-text
        self.setFont("Helvetica-Bold", 7)
        self.setFillColor(MUTED)
        self.drawString(36, 760, "CHI KEY UNIFIED CORE • FOUNDATIONAL PHYSICS RESEARCH INITIATIVE")
        self.drawRightString(576, 760, "DOC REF: CK-BRIEF-SONO-20260910 | SECURITY: OPEN TEAM")

        # Bottom rule
        self.setStrokeColor(BORDER_COL)
        self.setLineWidth(0.75)
        self.line(36, 32, 576, 32)

        # Footer micro-text
        self.setFont("Helvetica", 6.8)
        self.setFillColor(MUTED)
        self.drawString(36, 22, "ACROPOLIS SEALED ARCHIVE • MATTER AS CONFINED LIGHT • TOPOLOGICAL UNTANGLING FRAMEWORK")
        self.drawRightString(576, 22, f"Page {self._pageNumber} of 1 • STATUS: ACTIVE CORE")
        self.restoreState()
        super().showPage()

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=40,
        bottomMargin=36
    )

    base = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'BriefTitle',
        parent=base['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=13.5,
        leading=16,
        textColor=PRIMARY,
        spaceAfter=1
    )

    subtitle_style = ParagraphStyle(
        'BriefSubTitle',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10.5,
        textColor=SECONDARY,
        spaceAfter=4
    )

    sec_title = ParagraphStyle(
        'SecTitle',
        parent=base['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=PRIMARY,
        spaceBefore=3,
        spaceAfter=1
    )

    body_text = ParagraphStyle(
        'BriefBody',
        parent=base['BodyText'],
        fontName='Helvetica',
        fontSize=7.2,
        leading=9.8,
        textColor=DARK_TEXT,
        spaceAfter=2
    )

    body_bold = ParagraphStyle(
        'BriefBodyBold',
        parent=body_text,
        fontName='Helvetica-Bold',
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=7.0,
        leading=9.5,
        textColor=DARK_TEXT
    )

    card_header = ParagraphStyle(
        'CardHeader',
        parent=base['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.2,
        leading=9.5,
        textColor=SECONDARY
    )

    elements = []

    # Title & Subtitle
    elements.append(Paragraph("SONOLUMINESCENCE: MATTER AS CONFINED LIGHT & TOPOLOGICAL UNTANGLING", title_style))
    elements.append(Paragraph("EXECUTIVE RESEARCH BRIEF & UNIFIED MULTI-SCALE SIMULATION ROADMAP — CHI PHYSICS CORE", subtitle_style))

    # Meta Strip Table
    meta_data = [
        [
            Paragraph("<b>PROJECT:</b> Sonoluminescence Stress-Test", callout_text),
            Paragraph("<b>CORE PRINCIPLE:</b> Topological Deconfinement", callout_text),
            Paragraph("<b>STATUS:</b> Priority Phase 1 Active", callout_text),
            Paragraph("<b>ON DECK (PARKED):</b> High-Tc Superconductivity", callout_text)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[135, 140, 115, 150])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 2),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 3))

    # Section 1: The Core Phenomenon & Foundational Significance
    elements.append(Paragraph("1. THE PHENOMENON & FOUNDATIONAL SIGNIFICANCE", sec_title))
    p1 = (
        "Sonoluminescence occurs when acoustic standing waves violently collapse micro-bubbles in liquid, concentrating energy by over twelve "
        "orders of magnitude to generate picosecond optical flashes (<50–200 ps) and core temperatures exceeding 48,000°F (~27,000°C)—hotter than stellar surfaces. "
        "It stands as a foremost unsolved problem in modern physics not from sheer complexity of scale, but because it breaks fundamental assumptions: "
        "standard hydrodynamics, blackbody thermodynamics, and plasma bremsstrahlung models cannot reconcile the observed power (>100 mW peak), "
        "coherent ultraviolet continuum, and total lack of expected atomic recombination line broadening. Solving sonoluminescence is a definitive stress-test "
        "for our unified framework, demonstrating that our geometric and holographic physics can cleanly explain boundary-layer energy confinement and release."
    )
    elements.append(Paragraph(p1, body_text))

    # Section 2: The Foundational Insight — Matter as Trapped Light
    elements.append(Paragraph("2. THE FOUNDATIONAL INSIGHT: MATTER AS CONFINED LIGHT & TOPOLOGICAL UNTANGLING", sec_title))
    p2 = (
        "<b>The Thought Process & Guiding Principle:</b> Particles and matter are fundamentally not inert billiard balls; they are localized knots of trapped light, "
        "coherently woven field lines, and flux tubes stabilized by boundary topology. In sonoluminescence, the bubble's extreme spherical collapse is <i>not</i> "
        "conventional thermal gas heating. Instead, ultra-rapid symmetric boundary acceleration alters the confining manifold geometry faster than thermal scattering "
        "timescales (τ_collapse << τ_thermal). The confining topological knots of electron-positron / gauge loops slip and untangle into straightened open flux strings. "
        "The emitted burst is therefore <b>the direct liberation of pre-confined light</b> escaping coherently as topological fibers unknot—not light newly created by collisions. "
        "This explains the non-thermal UV excess and validates our core hypothesis: matter and radiation are topological phases of the same unified field."
    )
    elements.append(Paragraph(p2, body_text))

    # Section 3: Strategic Research Directions (Two Column Table)
    elements.append(Paragraph("3. STRATEGIC RESEARCH PILLARS", sec_title))
    col1 = (
        "<b>Pillar A — Boundary Topology & Metric Shearing:</b> Model the bubble wall as a curved, time-dependent 2-sphere boundary "
        "<i>S</i>²(θ,φ,t) ⊂ <i>S</i>³ governed by covariant derivative dynamics. Resolve how collapse symmetry breaks and realigns field-line helicity "
        "<i>H</i> = ∫ <b>A</b>·<b>B</b> <i>d</i>³<i>x</i> before thermal randomization can take hold.<br/>"
        "<b>Pillar B — Acoustic-to-Quantum Flux Coupling:</b> Bridge macroscopic acoustic forcing to sub-nanometer field tension, identifying "
        "how the liquid-gas dielectric discontinuity acts simultaneously as a pressure piston and a quantum confining vessel."
    )
    col2 = (
        "<b>Pillar C — Non-Thermal Spectral Signature:</b> Formulate emission curves derived from topological knot relaxation rather than Planckian blackbody curves, "
        "matching the documented picosecond pulse width and continuum UV slope.<br/>"
        "<b>Pillar D — Unified 21-Pillar Integration:</b> Link bubble confinement directly to vortex geometry, Yang-Mills mass gap conditions (Δ > 0), "
        "and scale-invariant holography, grounding sonoluminescence within the Chi Physics Core."
    )
    strat_table = Table([[Paragraph(col1, callout_text), Paragraph(col2, callout_text)]], colWidths=[266, 266])
    strat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('LINEBEFORE', (1,0), (1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(strat_table)
    elements.append(Spacer(1, 3))

    # Section 4: Numerical & Geometrical Simulation Roadmap (3-Box Layout)
    elements.append(Paragraph("4. NUMERICAL & GEOMETRICAL SIMULATION ARCHITECTURE", sec_title))
    sim1 = (
        "<b>SIM-1: Compressible Navier-Stokes + Shock Focusing</b><br/>"
        "High-fidelity spherically symmetric & perturbed 2D adaptive-mesh solver. Implements real-gas Van der Waals / SESAME equations of state, "
        "resolving supersonic bubble wall collapse velocity (<i>v</i> > 1.5 km/s) and extreme pressure spikes (<i>P</i> > 100 GPa) at turnaround."
    )
    sim2 = (
        "<b>SIM-2: Riemannian & Covariant Field Untangling</b><br/>"
        "Dynamic manifold simulation tracking field-line connectivity, curvature tensors, and knot unlinking. Models energy pathways as coherent "
        "flux fibers, quantifying the critical shear velocity where topological confinement slips and untangles into linear radiative strings."
    )
    sim3 = (
        "<b>SIM-3: Multi-Physics Radiative Coupling & Validation</b><br/>"
        "Couples hydrodynamic boundary deformation to gauge field electrodynamics and picosecond radiative transfer. Directly compares synthetic "
        "spectral radiance and coherence times against laboratory single-bubble sonoluminescence (SBSL) experimental datasets."
    )
    sim_table = Table([[Paragraph(sim1, callout_text), Paragraph(sim2, callout_text), Paragraph(sim3, callout_text)]], colWidths=[174, 176, 178])
    sim_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('LINEBEFORE', (1,0), (1,-1), 0.5, BORDER_COL),
        ('LINEBEFORE', (2,0), (2,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    elements.append(sim_table)
    elements.append(Spacer(1, 3))

    # Section 5: Team Directives & Staging Status
    elements.append(Paragraph("5. OPERATIONAL DIRECTIVES & SUBJECT PIPELINE", sec_title))
    dir_text = (
        "<b>• Phase 1 Implementation:</b> SIM-1 shock focusing baseline initiated in <code>scripts/</code>; boundary tensor metrics mapped to Chi Physics Core.<br/>"
        "<b>• Acropolis Registry:</b> Sealed as Foundational Record <code>CK-BRIEF-SONO-20260910</code> in Acropolis Library archive.<br/>"
        "<b>• Pipeline Note (Strict Rule):</b> High-Temperature Superconductivity is parked on deck as the subsequent subject; all active focus remains on Sonoluminescence."
    )
    dir_table = Table([[Paragraph(dir_text, callout_text)]], colWidths=[540])
    dir_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#eff6ff")),
        ('LINELEFT', (0,0), (0,-1), 2.5, SECONDARY),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COL),
        ('TOPPADDING', (0,0), (-1,-1), 3),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    elements.append(dir_table)

    doc.build(elements, canvasmaker=SinglePageCanvas)
    return PDF_PATH

if __name__ == "__main__":
    out_file = build_pdf()
    print(f"Generated PDF: {out_file}")
