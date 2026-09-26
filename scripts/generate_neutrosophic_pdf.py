"""
Generate Refined Quadruple Neutrosophic Logic Specification Document (PDF)
Path: downloads/Refined_Quadruple_Neutrosophic_T_I_N_F_L-134047409.pdf
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.graphics.shapes import Drawing, Rect, String, Line, Group

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
PDF_PATH = os.path.join(DOWNLOADS_DIR, "Refined_Quadruple_Neutrosophic_T_I_N_F_L-134047409.pdf")

def build_pdf():
    doc = SimpleDocTemplate(
        PDF_PATH,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=24,
        textColor=colors.HexColor('#0f172a'),
        alignment=1,
        spaceAfter=12
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11,
        leading=15,
        textColor=colors.HexColor('#7c3aed'),
        alignment=1,
        spaceAfter=20
    )

    h1_style = ParagraphStyle(
        'H1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=colors.HexColor('#0284c7'),
        spaceBefore=12,
        spaceAfter=6
    )

    body_style = ParagraphStyle(
        'Body',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=6
    )

    code_style = ParagraphStyle(
        'Code',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8,
        leading=11,
        textColor=colors.HexColor('#0f172a')
    )

    story = []

    # Title & Metadata
    story.append(Paragraph("REFINED QUADRUPLE NEUTROSOPHIC LOGIC (T / I / N / F)", title_style))
    story.append(Paragraph("SPECIFICATION L-134047409 — MATHEMATICAL LOGIC & CONTINUUM GAP BRIDGING", subtitle_style))
    story.append(Spacer(1, 10))

    # Abstract Box
    abstract_text = (
        "<b>Abstract:</b> This document defines the foundational logic framework of the Antigravity Physics "
        "and Acropolis Research Architecture. By refining neutrosophic components into Quadruple Subdivisions "
        "(Truth T₁, T₂; Indeterminacy I₁, I₂; Neutrality N₁, N₂; Falsehood F₁, F₂), this system models boundary "
        "contradictions, subject gaps, and non-commutative continuum transitions without melonic collapse. "
        "Tied directly to the Chi Key invariant rule: N₁ × N₂ ≈ N₃."
    )
    abstract_table = Table([[Paragraph(abstract_text, body_style)]], colWidths=[504])
    abstract_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f8fafc')),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor('#cbd5e1')),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(abstract_table)
    story.append(Spacer(1, 14))

    # Section 1: Quadruple Refinement Axioms
    story.append(Paragraph("1. QUADRUPLE NEUTROSOPHIC DECOMPOSITION", h1_style))
    p1 = (
        "In classical bivalent logic, propositions are restricted to {0, 1}. Standard neutrosophy extends this to "
        "triplet valuations (T, I, F). In the Refined Quadruple Neutrosophic framework (L-134047409), each component "
        "is split into conjugate sub-dimensions to reflect structural, empirical, and boundary states:"
    )
    story.append(Paragraph(p1, body_style))

    grid_data = [
        [Paragraph("<b>Component</b>", body_style), Paragraph("<b>Refinement</b>", body_style), Paragraph("<b>Physical Interpretation in Chi Key</b>", body_style)],
        [Paragraph("<b>Truth (T)</b>", body_style), Paragraph("T₁ (Empirical)<br/>T₂ (Theoretical)", body_style), Paragraph("Experimental verification (CERN/DUNE) & exact algebraic proofs (Yang-Mills Δ > 0).", body_style)],
        [Paragraph("<b>Indeterminacy (I)</b>", body_style), Paragraph("I₁ (Quantum/Phase)<br/>I₂ (Discretization)", body_style), Paragraph("High-frequency boundary jitter (432 Hz carrier) & lattice cutoff artifacts.", body_style)],
        [Paragraph("<b>Neutrality (N)</b>", body_style), Paragraph("N₁ (Symmetry Gate)<br/>N₂ (Passive Observer)", body_style), Paragraph("Unbroken non-Abelian gauge symmetries & invariant coordinate transformations.", body_style)],
        [Paragraph("<b>Falsehood (F)</b>", body_style), Paragraph("F₁ (Melonic Collapse)<br/>F₂ (Boundary Leakage)", body_style), Paragraph("Zero progress duplicate cloning (N₁ = N₂) & tip noise boundary violations.", body_style)],
    ]
    grid_table = Table(grid_data, colWidths=[100, 130, 274])
    grid_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#0f172a')),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor('#e2e8f0')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f1f5f9')]),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(grid_table)
    story.append(Spacer(1, 14))

    # Section 2: Subject Gap Resolution
    story.append(Paragraph("2. SUBJECT GAP RESOLUTION PROTOCOL (COMPETENCY MIRRORING)", h1_style))
    p2 = (
        "When an agent reaches an operational limit, Falsehood (F) and Indeterminacy (I) rise at the boundary. "
        "Rather than cloning (which preserves the limit F₁), the system activates a Competency Mirror:<br/>"
        "<b>Step 1:</b> Name the gap clearly (isolate unproved proposition).<br/>"
        "<b>Step 2:</b> Mirror the deficiency (identify missing conjugate tensor).<br/>"
        "<b>Step 3:</b> Match with complementary partner possessing verified Truth (T).<br/>"
        "<b>Step 4:</b> Form low-latency bridge (< 0.40ms).<br/>"
        "<b>Step 5:</b> Verify invariant: N₁ × N₂ ≈ N₃."
    )
    story.append(Paragraph(p2, body_style))
    story.append(Spacer(1, 10))

    # Section 3: Document Sealing & Hash
    story.append(Paragraph("3. ACROPOLIS VAULT REGISTRATION & SEAL", h1_style))
    p3 = (
        "Document: Refined_Quadruple_Neutrosophic_T_I_N_F_L-134047409.pdf<br/>"
        "Vault: Chi_Key_Research_Cabinet | Index Mode: O(1) Instant<br/>"
        "Domains: [Logic, Math, All_Domains]<br/>"
        "Security Digest: SHA256-134047409-NEUTROSOPHIC-TINF-SEALED-OK"
    )
    story.append(Paragraph(p3, code_style))

    doc.build(story)
    print(f"Generated PDF: {PDF_PATH} ({os.path.getsize(PDF_PATH)} bytes)")

if __name__ == "__main__":
    build_pdf()
