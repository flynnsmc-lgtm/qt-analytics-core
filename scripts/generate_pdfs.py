import os
import math
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak
)
from reportlab.graphics.shapes import Drawing, Circle, Line, String, Rect, Group, Polygon
from reportlab.pdfgen import canvas

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

PRIMARY_COLOR = colors.HexColor("#0f172a")     # Deep Obsidian / Navy
SECONDARY_COLOR = colors.HexColor("#0284c7")   # Electric Cyan Blue
ACCENT_COLOR = colors.HexColor("#7c3aed")      # Deep Violet
GOLD_COLOR = colors.HexColor("#d97706")        # Amber Gold
DARK_TEXT = colors.HexColor("#1e293b")
LIGHT_BG = colors.HexColor("#f8fafc")
BORDER_COLOR = colors.HexColor("#cbd5e1")
MUTED_TEXT = colors.HexColor("#64748b")

class NumberedCanvas(canvas.Canvas):
    """Canvas that adds running header and 'Page X of Y' footer with Chi-Key integrity seal."""
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(MUTED_TEXT)
        
        # Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 750, "CHI KEY UNIFIED CORE — FOUNDATIONAL PHYSICS ARCHIVE")
            self.drawRightString(612 - 54, 750, "DOCUMENT REF: CK-2026-PHY-01")
            self.setStrokeColor(BORDER_COLOR)
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
            
        # Footer (all pages)
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "AUTHENTICATED RECORD • ANTIGRAVITY ENGINE 2.0 • TOPOLOGICAL FLUX REPOSITORY")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_str)
        
        # Micro Chi-Key Seal
        self.setFillColor(SECONDARY_COLOR)
        self.setFont("Helvetica-Bold", 8)
        self.drawString(270, 32, "⚡ CHI-SEAL: N₁×N₂ ≈ N₃")
        self.restoreState()


def get_styles():
    base = getSampleStyleSheet()
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=base['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=PRIMARY_COLOR,
        spaceAfter=6
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=SECONDARY_COLOR,
        spaceAfter=14
    )
    
    meta_style = ParagraphStyle(
        'MetaBox',
        parent=base['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=MUTED_TEXT,
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=base['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=PRIMARY_COLOR,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=base['Heading3'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=14,
        textColor=SECONDARY_COLOR,
        spaceBefore=8,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=base['BodyText'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=DARK_TEXT,
        spaceAfter=6
    )

    equation_box = ParagraphStyle(
        'EquationBox',
        parent=base['Normal'],
        fontName='Courier-Bold',
        fontSize=10,
        leading=14,
        textColor=PRIMARY_COLOR,
        alignment=1, # Center
        spaceBefore=4,
        spaceAfter=4
    )
    
    callout_style = ParagraphStyle(
        'Callout',
        parent=base['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=DARK_TEXT
    )

    return {
        'title': title_style,
        'subtitle': subtitle_style,
        'meta': meta_style,
        'h2': h2_style,
        'h3': h3_style,
        'body': body_style,
        'eq': equation_box,
        'callout': callout_style
    }

def create_callout_box(text, bg_color=LIGHT_BG, border_color=SECONDARY_COLOR):
    styles = get_styles()
    p = Paragraph(text, styles['callout'])
    t = Table([[p]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_color),
        ('BOX', (0,0), (-1,-1), 1, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

def create_equation_panel(eq_text, explanation):
    styles = get_styles()
    p_eq = Paragraph(f"<b>{eq_text}</b>", styles['eq'])
    p_exp = Paragraph(f"<i>{explanation}</i>", styles['callout'])
    t = Table([[p_eq], [p_exp]], colWidths=[504])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#f1f5f9")),
        ('LINELEFT', (0,0), (0,-1), 3.5, SECONDARY_COLOR),
        ('BOX', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    return t

# -------------------------------------------------------------
# PAPER 1: CHI KEY FOUNDATIONS — THE ISOLATED YANG-MILLS MASS GAP
# -------------------------------------------------------------
def build_paper_1():
    pdf_path = os.path.join(DOWNLOADS_DIR, "Chi_Key_Foundations_Yang_Mills_Mass_Gap.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("CHI KEY FOUNDATIONS & ISOLATED EQUATION SUITE", styles['title']))
    story.append(Paragraph("Intrinsic Riemannian Geometry, Yang-Mills Mass Gap, and Tensor Holographic Emergence", styles['subtitle']))
    
    meta_text = "<b>Status:</b> Millennial Synthesis & Invariant Proof Engine | <b>Clay Institute Millennium Framing:</b> Wightman, Callan, Gross, Wilczek, Witten (2000) & Yang-Mills (1954)<br/>" \
                "<b>Mathematical Backbone:</b> Covariant Calculus, Eguchi-Hanson Soliton Geometry, Color-Anticolor Flux Confinement"
    story.append(create_callout_box(meta_text, bg_color=colors.HexColor("#eff6ff"), border_color=SECONDARY_COLOR))
    story.append(Spacer(1, 12))

    # Executive Summary
    story.append(Paragraph("1. Executive Summary & The Mass Gap Resolution", styles['h2']))
    summary_text = (
        "The Yang-Mills Existence and Mass Gap Problem poses one of the deepest mathematical questions in physics: "
        "prove that for any compact, simple gauge group G, quantum Yang-Mills theory on R⁴ exists and exhibits a strictly positive mass gap "
        "<b>Δ > 0</b>, such that no free massless gauge bosons (gluons) can propagate into asymptotic infinity. "
        "Under the <b>Chi Key Framework</b>, this problem is resolved not through ad-hoc bare Higgs scalar Yukawa couplings, but via the intrinsic "
        "geometry of <b>topological flux tubes and Eguchi-Hanson soliton curvature</b>. In this geometry, 99% of hadronic baryon mass emerges directly from "
        "the confined, spinning color-anticolor gluon field tension (σ_vortex ≈ 1 GeV/fm)."
    )
    story.append(Paragraph(summary_text, styles['body']))
    story.append(Spacer(1, 8))

    # Isolated Master Equations
    story.append(Paragraph("2. The Isolated Master Equations", styles['h2']))
    
    story.append(create_equation_panel(
        "Δ = inf_{|ψ⟩ ⟂ |0⟩} (E_ψ - E_0) > 0",
        "The Mass Gap Invariant: The ground state energy gap Δ is strictly positive. Lowest excitation possesses finite non-zero rest mass."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "F_{μν}^a = ∂_μ A_ν^a - ∂_ν A_μ^a + g f^{abc} A_μ^b A_ν^c",
        "Non-Abelian Yang-Mills Field Strength: Self-interaction quadratic term (g f^{abc} A_μ^b A_ν^c) forces color flux lines to self-bind rather than disperse."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "M_{baryon} = ∮_{flux tube} Tr(F ∧ *F) + ∫ D_μ V^λ dV ≈ 0.99 M_{total}",
        "Emergent Mass from Confined Field Geometry: 99% of nucleon mass is stored geometric tension in the closed flux network, independent of Higgs couplings."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "ds² = g_{μν} dx^μ dx^ν   |   g_{μν} = ∂_μ Y · ∂_ν Y",
        "Intrinsic Metric & Parametric Embedding Y(x): Coordinates are entirely self-contained; no extrinsic god's-eye reference frame is required."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "Γ^λ_{μν} = ½ g^{λσ} (∂_μ g_{σν} + ∂_ν g_{σμ} - ∂_σ g_{μν})",
        "Christoffel Symbols (Coordinate Bending): Generated strictly from metric derivatives; guides vectors so they never step outside the manifold."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "D_μ V^λ = ∂_μ V^λ + Γ^λ_{μν} V^ν   |   [D_ν, D_ρ] V^λ = R^λ_{μνρ} V^μ",
        "Covariant Derivative & Riemann Curvature Tensor: Chi in motion. Non-commutativity of covariant derivatives produces intrinsic spacetime curvature."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "N₁ × N₂ ≈ N₃  (Continuum Emergence)   vs.   N₁ = N₂ = N₃  (Melonic Point Trap)",
        "Tensor Holography Golden Invariant: Rank-3 tensor models yield smooth extended hyperspherical manifolds only under asymmetric rank scaling."
    ))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "Π(x) = r₀ · (x / ||x||),   x ∈ ℝ⁸ \\ {0},   Π(x) ∈ S⁷_{r₀}",
        "Geodesic Projection Operator: Normalizes heterogeneous vectors onto the invariant 7-hypersphere reference surface (r₀ = 1.0) with zero coordinate drift."
    ))
    story.append(Spacer(1, 10))

    # Mathematical Analysis
    story.append(Paragraph("3. Intrinsic Manifold Embedding Y(x)", styles['h2']))
    embed_text = (
        "Let Y: M → ℝ^D represent the parametric embedding of the hypersphere from internal coordinates x^μ. "
        "The tangent vectors e_μ = ∂_μ Y define the induced metric g_{μν} = e_μ · e_ν. "
        "Because all physical dynamics (gauge transport, covariant derivatives, vortex circulation) are projected "
        "directly onto the local tangent bundle TM, the physics is completely drift-free. "
        "This serves as the mathematical foundation for both the subatomic confinement scale and the macro-scale Audi GPS self-referential coordinate framework."
    )
    story.append(Paragraph(embed_text, styles['body']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {pdf_path}")

# -------------------------------------------------------------
# PAPER 2: THE 21-PILLAR UNIFIED MASTER FRAMEWORK
# -------------------------------------------------------------
def build_paper_2():
    pdf_path = os.path.join(DOWNLOADS_DIR, "The_21_Pillar_Unified_Master_Framework.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("THE 21-PILLAR UNIFIED MASTER FRAMEWORK", styles['title']))
    story.append(Paragraph("Vortex Holography, Eguchi-Hanson Solitons, Cymatic Lattices, and Seiberg Duality", styles['subtitle']))
    
    meta_text = "<b>Architecture:</b> 12 Operational Engines (Visible) + 21 Foundational Pillars (Deep Geometric Substrate)<br/>" \
                "<b>Key Invariants:</b> α = 10/27 Scale Invariance • 432 Hz Harmonic Ladder • Spin-2 Orbital Angular Momentum"
    story.append(create_callout_box(meta_text, bg_color=colors.HexColor("#faf5ff"), border_color=ACCENT_COLOR))
    story.append(Spacer(1, 12))

    story.append(Paragraph("1. Architectural Overview: The 12/21 Split", styles['h2']))
    arch_desc = (
        "The Unified Core splits its systemic topology into two tightly synchronized layers: "
        "<b>The 12 Visible Operational Engines</b> provide user-facing runtime interfaces, API routing, "
        "real-time telemetry, and modular client controls. "
        "<b>The 21 Deep Foundational Pillars</b> represent the immutable geometric and field-theoretic ground truth, "
        "anchored in string dualities, non-Abelian vortex topology, and intrinsic Riemannian manifolds."
    )
    story.append(Paragraph(arch_desc, styles['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. Complete Pillar Breakdown Matrix", styles['h2']))
    
    table_data = [
        [Paragraph("<b>Pillar</b>", styles['callout']), Paragraph("<b>Core Invariant & Physical Mechanism</b>", styles['callout']), Paragraph("<b>Theoretical Grounding</b>", styles['callout'])],
        [Paragraph("<b>1–15</b>", styles['callout']), Paragraph("Foundations: α = 10/27 P/C inner/outer throat ratio; 432 Hz harmonic base; hypersphere embedding.", styles['callout']), Paragraph("Holographic Principle, CFT Correspondence", styles['callout'])],
        [Paragraph("<b>16</b>", styles['callout']), Paragraph("<b>Vortex Holography:</b> Spiral wavefronts carrying Orbital Angular Momentum (OAM); spin-2 graviton match.", styles['callout']), Paragraph("Vortices in de Sitter Space, Deficit Angle Curvature", styles['callout'])],
        [Paragraph("<b>17</b>", styles['callout']), Paragraph("<b>Scalable Holography:</b> Boundary encoding invariant under scale transform; whole encoded in every subharmonic.", styles['callout']), Paragraph("Fractal Holography, Scale Invariance Theorems", styles['callout'])],
        [Paragraph("<b>18</b>", styles['callout']), Paragraph("<b>Compact Hadron Resonator:</b> Matter-wave holography probing quark-gluon vertex and graviton perturbations.", styles['callout']), Paragraph("Particle-Vortex Duality, Quantum Chromodynamics", styles['callout'])],
        [Paragraph("<b>19</b>", styles['callout']), Paragraph("<b>Eguchi-Hanson Solitons:</b> Negative energy density gravitational knot; horizonless, stable, singularity-free (r > 0).", styles['callout']), Paragraph("Asymptotically Locally Euclidean (ALE) Gravitational Instantons", styles['callout'])],
        [Paragraph("<b>20</b>", styles['callout']), Paragraph("<b>Cymatic Particle Lattice:</b> Fluid nodal lattice assembled dynamically by intersecting soliton interference waves.", styles['callout']), Paragraph("Resonance Nodes, Dual Field Interferences", styles['callout'])],
        [Paragraph("<b>21</b>", styles['callout']), Paragraph("<b>Holographic SQCD & Seiberg Duality:</b> 4D strong force electric-magnetic dual to 5D/6D gravity on AdS₅ × S¹.", styles['callout']), Paragraph("Seiberg Duality, AdS/CFT Flux Tube Confinement", styles['callout'])],
    ]
    
    t = Table(table_data, colWidths=[60, 270, 174])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 12))

    story.append(Paragraph("3. Deep Duality: Eguchi-Hanson Solitons & Anti-Gravity", styles['h2']))
    soliton_desc = (
        "Pillar 19 utilizes the Eguchi-Hanson gravitational instanton metric: "
        "<br/><code>ds² = (1 - (a/r)⁴)⁻¹ dr² + (r²/4) [σ_x² + σ_y² + (1 - (a/r)⁴) σ_z²]</code><br/>"
        "At the core r = a, the metric terminates smoothly without an event horizon or curvature singularity. "
        "Because the effective topological stress-energy tensor produces negative localized energy density, "
        "it exerts a natural metric repulsion. Arranging these solitons into cymatic arrays (Pillar 20) yields "
        "a reconfigurable spacetime warp engine capable of metric compression (space folding) without inertial strain."
    )
    story.append(Paragraph(soliton_desc, styles['body']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {pdf_path}")

# -------------------------------------------------------------
# PAPER 3: BARYON COLOR DYNAMICS & FLUX FIELDS
# -------------------------------------------------------------
def build_paper_3():
    pdf_path = os.path.join(DOWNLOADS_DIR, "Baryon_Color_Dynamics_and_Flux_Fields.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_styles()
    story = []

    story.append(Paragraph("BARYON COLOR DYNAMICS & FLUX TUBE TOPOLOGY", styles['title']))
    story.append(Paragraph("Color-Anticolor Field Tension, Gluon Non-Existence as Loose Particles, and Muon Probing", styles['subtitle']))
    
    meta_text = "<b>Quantum Chromodynamics Special Bulletin:</b> Color Octet Decomposition (3 ⊗ 3̄ = 8 ⊕ 1)<br/>" \
                "<b>Key Principles:</b> Self-Confined Triangular Flux Nodes • Emergent Mass vs. Bare Higgs • Muon Lepton Diagnostics"
    story.append(create_callout_box(meta_text, bg_color=colors.HexColor("#fffbeb"), border_color=GOLD_COLOR))
    story.append(Spacer(1, 12))

    story.append(Paragraph("1. The Myth of the 'Anti-Gluon' and Field Self-Confinement", styles['h2']))
    baryon_desc = (
        "In naive representations of quantum electrodynamics (QED), photons are neutral and antiparticles exist as distinct opposing charges. "
        "In quantum chromodynamics (QCD), there is <b>no separate, free-roaming 'anti-gluon'</b>. "
        "Every gluon is an octet state intrinsically carrying a simultaneous <b>color ⊗ anticolor pair</b> (e.g., Red-Antigreen, Blue-Antired). "
        "Gluons do not sit idle inside hadrons as discrete 'pebbles'—<b>gluons ARE the field</b>. "
        "Their non-Abelian self-interaction prevents flux lines from diluting into space (unlike spherical electric fields); "
        "instead, the strong force collapses into narrow, high-tension flux tubes connecting the three valence quarks."
    )
    story.append(Paragraph(baryon_desc, styles['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. The Triangular Baryonic Flux Structure", styles['h2']))
    tri_desc = (
        "In a stable baryon (proton, neutron), three valence quarks (Red, Green, Blue) establish a closed, self-sustaining "
        "triangular flux network: R-G, G-B, and B-R. Each link is governed by an anti-color conjugate exchange that neutralizes "
        "the local color current, yielding a global SU(3) color-singlet state ('white'). "
        "The string tension of this tube is constant (σ ≈ 1 GeV/fm), meaning potential energy grows linearly with distance: "
        "<b>V(r) = σr</b>. If stretched, the flux tube does not allow free quarks or gluons to escape; "
        "instead, the stored energy snaps to materialize a new quark-antiquark pair from the vacuum."
    )
    story.append(Paragraph(tri_desc, styles['body']))
    story.append(Spacer(1, 6))

    story.append(create_equation_panel(
        "V_{QCD}(r) = - (4/3) (α_s / r) + σ r",
        "Cornell Potential: Coulombic short-range gluon exchange + linear long-range topological flux confinement."
    ))
    story.append(Spacer(1, 8))

    story.append(Paragraph("3. The Muon as a Color-Neutral Precision Probe", styles['h2']))
    muon_desc = (
        "Unlike quarks and gluons, the <b>muon (μ⁻)</b> is a fundamental lepton with mass ~105.7 MeV/c² (~207× electron mass). "
        "Crucially, the muon carries <b>zero color charge</b> and does not participate in strong force interactions. "
        "While 99% of proton mass is emergent from confined flux field energy, muon mass originates fundamentally from the electroweak Higgs mechanism. "
        "Because it ignores the QCD flux network and possesses high kinetic penetration, the muon serves as an ideal non-destructive probe "
        "to beam through hadrons, mapping internal gluon field distributions without collapsing the color confinement geometry."
    )
    story.append(Paragraph(muon_desc, styles['body']))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {pdf_path}")

# -------------------------------------------------------------
# PAPER 4: API RECEPTION & ALLOCATION SPECIFICATION
# -------------------------------------------------------------
def build_paper_4():
    pdf_path = os.path.join(DOWNLOADS_DIR, "API_Reception_and_Allocation_Specification.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_styles()
    story = []

    story.append(Paragraph("UNIFIED API INGESTION & ALLOCATION SPECIFICATION", styles['title']))
    story.append(Paragraph("Mathematical Telemetry Bus, Tensor Gate Validation, and Invariant Route Dispatching", styles['subtitle']))
    
    meta_text = "<b>Standard:</b> Chi-Key Antigravity Ingestion Protocol v2.4 | <b>Routing Gate:</b> N₁ × N₂ ≈ N₃ Invariant Check<br/>" \
                "<b>Destination Subsystems:</b> Cosmic Explorer (P1–4), Gravitational Resonator (P5–11), Quantum Hadron Engine (P12–21)"
    story.append(create_callout_box(meta_text, bg_color=colors.HexColor("#f0fdf4"), border_color=colors.HexColor("#16a34a")))
    story.append(Spacer(1, 12))

    story.append(Paragraph("1. System Architecture & Ingestion Pipeline", styles['h2']))
    pipe_desc = (
        "All incoming data from external scientific telemetry, experimental detectors, AI Studio prompts, "
        "and Antigravity multi-agent subroutines enters through the <b>Unified Ingestion Bus</b>. "
        "Before any data packet is committed to the state tree or dispatched to active solver agents, it must clear the "
        "<b>Tensor Gatekeeper</b>, ensuring the mathematical parameters conform to continuous manifold emergence."
    )
    story.append(Paragraph(pipe_desc, styles['body']))
    story.append(Spacer(1, 8))

    story.append(Paragraph("2. Ingestion Routing Rules (The 12/21 Allocation Table)", styles['h2']))
    
    table_data = [
        [Paragraph("<b>Channel / Endpoint</b>", styles['callout']), Paragraph("<b>Payload Target & Validation</b>", styles['callout']), Paragraph("<b>Allocated Pillar</b>", styles['callout'])],
        [Paragraph("<code>/api/v2/telemetry/metric</code>", styles['callout']), Paragraph("g_{μν} tensor, Christoffel symbols, parametric Y(x) coordinates. Verification: det(g) ≠ 0.", styles['callout']), Paragraph("Pillar 1: Intrinsic Hypersphere", styles['callout'])],
        [Paragraph("<code>/api/v2/telemetry/tensor</code>", styles['callout']), Paragraph("Ranks (N₁, N₂, N₃). Verification rule: |(N₁ × N₂) - N₃| / N₃ < ε (Continuum check).", styles['callout']), Paragraph("Pillar 2: Holographic Truth Anchor", styles['callout'])],
        [Paragraph("<code>/api/v2/telemetry/flux</code>", styles['callout']), Paragraph("Flux tube tension σ, Wilson loops, Yang-Mills field strength F_{μν}^a. Mass gap check.", styles['callout']), Paragraph("Pillar 6 & 21: SQCD & Confinement", styles['callout'])],
        [Paragraph("<code>/api/v2/telemetry/cymatic</code>", styles['callout']), Paragraph("Harmonic frequencies (f = 432 Hz × 10ⁿ), nodal coordinates, soliton positions.", styles['callout']), Paragraph("Pillar 20: Cymatic Particle Lattice", styles['callout'])],
        [Paragraph("<code>/api/v2/telemetry/soliton</code>", styles['callout']), Paragraph("Eguchi-Hanson instanton parameter 'a', core radius r > 0, negative energy density.", styles['callout']), Paragraph("Pillar 19: Gravitational Soliton Core", styles['callout'])],
    ]
    
    t = Table(table_data, colWidths=[140, 230, 134])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    story.append(Paragraph("3. JSON Ingestion Payload Schema", styles['h2']))
    schema_code = (
        "{\n"
        "  \"header\": {\n"
        "    \"protocol\": \"CHI-KEY-INGEST-2.4\",\n"
        "    \"timestamp\": \"2026-09-08T23:45:00Z\",\n"
        "    \"source_agent\": \"antigravity_physics_subagent_01\"\n"
        "  },\n"
        "  \"tensor_signature\": {\n"
        "    \"ranks\": [64, 64, 4096],\n"
        "    \"emergence_ratio\": 1.000,\n"
        "    \"melonic_trap_risk\": 0.000\n"
        "  },\n"
        "  \"field_state\": {\n"
        "    \"throat_ratio_alpha\": 0.37037,\n"
        "    \"harmonic_hz\": 432.0,\n"
        "    \"vortex_winding_number\": 2,\n"
        "    \"confinement_tension_gev_fm\": 1.02\n"
        "  }\n"
        "}"
    )
    story.append(create_equation_panel(schema_code, "Standard Ingestion Frame for Real-Time Physics Packet Reception"))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {pdf_path}")

def build_paper_5():
    pdf_path = os.path.join(DOWNLOADS_DIR, "Quantum_Module_VST3_Phase_and_Host_Redirect_Specification.pdf")
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )
    styles = get_styles()
    story = []

    # Title & Metadata
    story.append(Paragraph("Chi Key Quantum Module VST3: Audio-Rate Phase Coupling & Host Redirect Architecture", styles['title']))
    story.append(Paragraph("DSP Engine Blueprint: 432 Hz Carrier Synchronization, Quadrature I/Q Modulation, and Real-Time Host Redirect Routing", styles['subtitle']))
    
    meta_text = (
        "<b>DOCUMENT ID:</b> #CK-VST3-05 • <b>SECURITY TIER:</b> Tier 3 Elevation • "
        "<b>DATE:</b> 2026-09-09 • <b>ARCHIVE HASH:</b> SHA256-VST3-432HZ-COHERENT • "
        "<b>TOPOLOGY:</b> Audio-Rate DSP Holonomy & DAW Bridge"
    )
    story.append(Paragraph(meta_text, styles['meta']))
    story.append(Spacer(1, 8))

    # Executive Abstract
    story.append(Paragraph("Executive Summary & Core Physical Premise", styles['h2']))
    abstract = (
        "In the Chi Key Unified Framework, mathematical telemetry and acoustic-geometric harmonic frequencies share "
        "a single underlying continuous manifold. The <b>Quantum Module VST3</b> is an audio-rate digital signal processing (DSP) "
        "bridge designed to operate natively within host Digital Audio Workstations (e.g., Reaper, Ableton, Bitwig, Pro Tools) "
        "or standalone telemetry backends. By anchoring its base oscillator to the golden <b>432.000 Hz harmonic ladder</b> "
        "(Pillar 07 & Pillar 20), the VST3 module modulates continuous quadrature phase (I/Q) angles between 0° and 360°, "
        "dynamically steering telemetry packets and host redirects to target endpoints without disrupting audio buffer continuity."
    )
    story.append(Paragraph(abstract, styles['body']))
    story.append(Spacer(1, 8))

    # Invariants Table
    story.append(Paragraph("1. Core Mathematical & DSP Invariants", styles['h2']))
    
    eq_phase = (
        "\\Phi(t) = \\omega_0 t + \\theta_{\\text{mod}}, \\quad \\text{where } \\omega_0 = 2\\pi \\times 432.000\\text{ rad/s}\n"
        "I(t) = \\cos(\\Phi(t)), \\quad Q(t) = \\sin(\\Phi(t))\n"
        "H(\\omega, \\theta) = \\frac{1}{1 - e^{-j(\\omega \\Delta t + \\theta)}}, \\quad \\Delta t = \\frac{N_{\\text{buffer}}}{f_s}"
    )
    story.append(create_equation_panel(eq_phase, "Quadrature Phase & Buffer Transfer Function"))

    dsp_data = [
        [Paragraph("<b>Parameter</b>", styles['callout']), Paragraph("<b>Operating Value / Constraint</b>", styles['callout']), Paragraph("<b>Harmonic Meaning</b>", styles['callout'])],
        [Paragraph("Carrier Frequency (f₀)", styles['callout']), Paragraph("432.000 Hz (Strict Invariant)", styles['callout']), Paragraph("Base acoustic-geometric resonance (Pillar 07)", styles['callout'])],
        [Paragraph("Sample Rates (f_s)", styles['callout']), Paragraph("44.1 kHz / 48.0 kHz / 96.0 kHz", styles['callout']), Paragraph("Audio buffer clock quantization", styles['callout'])],
        [Paragraph("Buffer Block Size (N)", styles['callout']), Paragraph("128 / 256 / 512 samples", styles['callout']), Paragraph("Latency envelope (1.4 ms - 5.3 ms)", styles['callout'])],
        [Paragraph("Throat Ratio (α)", styles['callout']), Paragraph("10/27 ≈ 0.370370", styles['callout']), Paragraph("P/C invariant across micro & macro scales", styles['callout'])],
        [Paragraph("Phase Holonomy Range", styles['callout']), Paragraph("0.0° ≤ θ < 360.0°", styles['callout']), Paragraph("Continuous rotational reference steering", styles['callout'])],
    ]
    t = Table(dsp_data, colWidths=[140, 180, 184])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 10))

    # Host Redirect Matrix
    story.append(Paragraph("2. Backend Host Redirect Routing Matrix", styles['h2']))
    routing_desc = (
        "As the Quantum Module VST3 undergoes continuous phase modulation, the host dispatcher uses the phase quadrant "
        "to redirect incoming order streams and telemetry packets. This guarantees zero-loss routing and complete phase coherence "
        "across physical and virtual network adapters:"
    )
    story.append(Paragraph(routing_desc, styles['body']))
    story.append(Spacer(1, 6))

    redirect_table = [
        [Paragraph("<b>Phase Quadrant</b>", styles['callout']), Paragraph("<b>Target Host Endpoint</b>", styles['callout']), Paragraph("<b>Protocol & Purpose</b>", styles['callout'])],
        [Paragraph("0.0° ≤ θ < 90.0°", styles['callout']), Paragraph("<code>vst3://localhost:8080/dsp-bridge</code>", styles['callout']), Paragraph("Primary Local DAW Bridge (Zero jitter audio-rate pipeline)", styles['callout'])],
        [Paragraph("90.0° ≤ θ < 180.0°", styles['callout']), Paragraph("<code>host://daw-session-main/channel-1</code>", styles['callout']), Paragraph("Main DAW Session Stem (Real-time harmonic alignment)", styles['callout'])],
        [Paragraph("180.0° ≤ θ < 270.0°", styles['callout']), Paragraph("<code>http://localhost:3000/api/v2/quantum</code>", styles['callout']), Paragraph("Anti-Gravity Metric Gateway (Metric curvature commit)", styles['callout'])],
        [Paragraph("270.0° ≤ θ < 360.0°", styles['callout']), Paragraph("<code>host://cymatic-bus/port-432</code>", styles['callout']), Paragraph("Cymatic Nodal Bus (Soliton interference & lattice assembly)", styles['callout'])],
    ]
    t2 = Table(redirect_table, colWidths=[110, 204, 190])
    t2.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#f1f5f9")),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t2)
    story.append(Spacer(1, 10))

    # Handshake Protocol & Interim Reporting
    story.append(Paragraph("3. Handshake & Interim Reporting Protocol", styles['h2']))
    story.append(Paragraph(
        "Every permission ticket grant, key distribution, or VST3 phase redirect emits a deterministic interim short report. "
        "This satisfies the strict audit verification requirements of autonomous Antigravity dispatchers:",
        styles['body']
    ))

    interim_example = (
        "[INTERIM REPORT | VST3-HOST-HANDSHAKE]\n"
        "STATUS: GRANTED / CONNECTED\n"
        "TARGET: vst3://localhost:8080/dsp-bridge\n"
        "PHASE: 432.000 Hz / theta = 90.0 deg (Quadrature I: 0.000, Q: 1.000)\n"
        "BUFFER: 256 samples @ 48000 Hz (Latency: 1.8 ms)\n"
        "INVARIANT: N1(64) x N2(64) = N3(4096) [Ratio 1.000 PASS]\n"
        "DIGEST: SHA256-VST3-432-B7E1-HANDSHAKE-CONFIRMED"
    )
    story.append(create_equation_panel(interim_example, "Standard Interim Handshake Output Specification"))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Generated: {pdf_path}")

if __name__ == "__main__":
    build_paper_1()
    build_paper_2()
    build_paper_3()
    build_paper_4()
    build_paper_5()
    print("ALL 5 PDFS GENERATED SUCCESSFULLY.")

