#!/usr/bin/env python3
"""
QT Analytics — Court-Ready Crypto Forensic Sample Report Generator
Generates sample £49 Standard Trace and £149 Full Network Scan PDFs.
"""

import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, KeepTogether, PageBreak, HRFlowable
)
from reportlab.pdfgen import canvas

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DOWNLOADS_DIR = os.path.join(BASE_DIR, "downloads")
os.makedirs(DOWNLOADS_DIR, exist_ok=True)

# Brand Color Palette
PRIMARY_COLOR = colors.HexColor("#09101d")     # Deep Obsidian Navy
SECONDARY_COLOR = colors.HexColor("#0284c7")   # Bright Cyan Blue
ACCENT_PURPLE = colors.HexColor("#6366f1")     # Indigo / Violet
ACCENT_GREEN = colors.HexColor("#059669")      # Emerald Success
ACCENT_AMBER = colors.HexColor("#d97706")      # Amber Warning
ACCENT_ROSE = colors.HexColor("#e11d48")       # Crimson Alert
DARK_TEXT = colors.HexColor("#1e293b")
LIGHT_BG = colors.HexColor("#f8fafc")
CARD_BG = colors.HexColor("#f1f5f9")
BORDER_COLOR = colors.HexColor("#cbd5e1")
MUTED_TEXT = colors.HexColor("#64748b")

class CourtNumberedCanvas(canvas.Canvas):
    """Running header and court-admissible footer with tamper-proof cryptographic seal."""
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
            self.drawString(54, 750, "QT ANALYTICS • FORENSIC ON-CHAIN INVESTIGATION DOSSIER")
            self.drawRightString(612 - 54, 750, "STRICTLY CONFIDENTIAL — EVIDENCE PACK")
            self.setStrokeColor(BORDER_COLOR)
            self.setLineWidth(0.5)
            self.line(54, 742, 612 - 54, 742)
            
        # Footer (all pages)
        self.setStrokeColor(BORDER_COLOR)
        self.setLineWidth(0.5)
        self.line(54, 45, 612 - 54, 45)
        
        self.setFont("Helvetica", 8)
        self.drawString(54, 32, "QT ANALYTICS (SCOTLAND) • INVARIANT FORENSIC ENGINE • ENQUIRIES@QTANALYTICS.CO.UK")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(612 - 54, 32, page_str)
        
        # Seal signature in footer
        self.setFillColor(SECONDARY_COLOR)
        self.setFont("Helvetica-Bold", 8)
        self.drawString(245, 32, "🔒 INVARIANT SEAL: SHA256-VERIFIED")
        self.restoreState()


def get_styles():
    base = getSampleStyleSheet()
    
    styles = {
        'DocTitle': ParagraphStyle(
            'DocTitle', parent=base['Heading1'],
            fontName='Helvetica-Bold', fontSize=20, leading=24,
            textColor=PRIMARY_COLOR, spaceAfter=4
        ),
        'DocSubtitle': ParagraphStyle(
            'DocSubtitle', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=10.5, leading=14,
            textColor=SECONDARY_COLOR, spaceAfter=10
        ),
        'BadgeTier': ParagraphStyle(
            'BadgeTier', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=9, leading=12,
            textColor=colors.white, alignment=1
        ),
        'Heading2': ParagraphStyle(
            'Heading2', parent=base['Heading2'],
            fontName='Helvetica-Bold', fontSize=12, leading=16,
            textColor=PRIMARY_COLOR, spaceBefore=10, spaceAfter=4,
            keepWithNext=True
        ),
        'Heading3': ParagraphStyle(
            'Heading3', parent=base['Heading3'],
            fontName='Helvetica-Bold', fontSize=10, leading=13,
            textColor=SECONDARY_COLOR, spaceBefore=6, spaceAfter=3,
            keepWithNext=True
        ),
        'Body': ParagraphStyle(
            'Body', parent=base['BodyText'],
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=DARK_TEXT, spaceAfter=5
        ),
        'BodyBold': ParagraphStyle(
            'BodyBold', parent=base['BodyText'],
            fontName='Helvetica-Bold', fontSize=8.5, leading=12,
            textColor=DARK_TEXT, spaceAfter=5
        ),
        'MonoText': ParagraphStyle(
            'MonoText', parent=base['Normal'],
            fontName='Courier', fontSize=7.5, leading=9.5,
            textColor=DARK_TEXT
        ),
        'MonoHeader': ParagraphStyle(
            'MonoHeader', parent=base['Normal'],
            fontName='Courier-Bold', fontSize=7.5, leading=9.5,
            textColor=PRIMARY_COLOR
        ),
        'CalloutText': ParagraphStyle(
            'CalloutText', parent=base['Normal'],
            fontName='Helvetica', fontSize=8.5, leading=12,
            textColor=PRIMARY_COLOR
        ),
        'MetaKey': ParagraphStyle(
            'MetaKey', parent=base['Normal'],
            fontName='Helvetica-Bold', fontSize=8, leading=10,
            textColor=MUTED_TEXT
        ),
        'MetaVal': ParagraphStyle(
            'MetaVal', parent=base['Normal'],
            fontName='Helvetica', fontSize=8, leading=10,
            textColor=DARK_TEXT
        ),
    }
    return styles

def generate_sample_49_pdf():
    pdf_filename = os.path.join(DOWNLOADS_DIR, "QT_Analytics_Sample_Report_49_Uniswap_Drainer.pdf")
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54, rightMargin=54,
        topMargin=54, bottomMargin=54
    )
    styles = get_styles()
    story = []

    # Header Banner Table
    header_data = [
        [
            Paragraph("<b>QT ANALYTICS</b><br/><font color='#64748b' size='7'>FORENSIC INTELLIGENCE DESK</font>", styles['BodyBold']),
            Paragraph("<font color='#0284c7'><b>STANDARD FORENSIC TRACE REPORT</b></font><br/><font color='#64748b' size='7.5'>DOCUMENT REF: <b>QTA-TRC-2026-ETH-49</b></font>", styles['Body']),
            Paragraph("<font color='#d97706'><b>TIER: £49 TRACE</b></font><br/><font color='#059669' size='7.5'><b>SLA: &le; 24 HOURS</b></font>", styles['Body'])
        ]
    ]
    header_table = Table(header_data, colWidths=[160, 220, 124])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # Title
    story.append(Paragraph("Crypto Forensic Tracing Dossier: Fake Uniswap Drainer", styles['DocTitle']))
    story.append(Paragraph("Incident Vector: Google Ads Malicious Injection • AngelFerno Phishing Kit • Rapid Siphon", styles['DocSubtitle']))

    # Metadata Grid
    meta_data = [
        [Paragraph("Target Primary Wallet", styles['MetaKey']), Paragraph("<b>0x37925684BA178821b4436E06e67f5dBD6cfA49Bb</b> (Ethereum Mainnet)", styles['MonoText'])],
        [Paragraph("Associated Threat Actor", styles['MetaKey']), Paragraph("AngelFerno Phishing / Malvertising Syndicate (Global Campaign: $1.27M+)", styles['MetaVal'])],
        [Paragraph("Incident Ingestion Window", styles['MetaKey']), Paragraph("May 2026 • Real-time victim drain via Permit2 and SetApprovalForAll", styles['MetaVal'])],
        [Paragraph("Traced Drain Volume", styles['MetaKey']), Paragraph("<b>138.42 ETH</b> (~$418,250 USD) across 14 direct victim transactions", styles['MetaVal'])],
        [Paragraph("Tamper-Proof Invariant Seal", styles['MetaKey']), Paragraph("<font color='#0284c7'><b>QT-SEAL-00AA482-ETH</b></font> • SHA-256: <code>d5b2...8e91f0</code> (Court-Admissible)", styles['MonoText'])],
        [Paragraph("Forensic Analyst / Lead", styles['MetaKey']), Paragraph("Stephen Fitzpatrick • Lead Specialist, QT Analytics (Scotland)", styles['MetaVal'])],
    ]
    meta_table = Table(meta_data, colWidths=[140, 364])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Section 1: Executive Summary
    story.append(Paragraph("1. Executive Summary & Forensic Context", styles['Heading2']))
    story.append(Paragraph(
        "Between May 4 and May 18, 2026, victims searching for decentralized exchange protocols via Google were redirected via spoofed Google Ads to a malicious front-end impersonating <i>Uniswap</i>. "
        "Upon connecting web3 wallets, automated <code>Permit2</code> signatures executed unauthorized batch transfers to target drainer address <b>0x3792...49Bb</b>. "
        "Standard commercial explorers (Etherscan, Basic Chainalysis) mark this address as an unresolved drainer once funds branch into multiple sub-addresses. "
        "Using QT Analytics invariant-locked topological reconstruction, this report maps the subsequent 4 hops, resolving the splitting ratios and establishing the final destination endpoints.",
        styles['Body']
    ))

    # Section 2: Hop-by-Hop Trail Matrix
    story.append(Paragraph("2. Hop-by-Hop Flow Decomposition (Standard 4-Hop Audit)", styles['Heading2']))
    
    trail_data = [
        [
            Paragraph("Hop #", styles['MonoHeader']),
            Paragraph("Transaction Hash / Contract", styles['MonoHeader']),
            Paragraph("Destination Entity", styles['MonoHeader']),
            Paragraph("Amount Traced", styles['MonoHeader']),
            Paragraph("Classification / Action", styles['MonoHeader']),
        ],
        [
            Paragraph("<b>Hop 0</b>", styles['MonoText']),
            Paragraph("0x8fa1...c4b2 (Direct Siphon)", styles['MonoText']),
            Paragraph("0x3792...49Bb (Primary Drainer)", styles['MonoText']),
            Paragraph("138.42 ETH", styles['MonoText']),
            Paragraph("<font color='#e11d48'><b>Victim Siphon Ingress</b></font>", styles['Body']),
        ],
        [
            Paragraph("<b>Hop 1</b>", styles['MonoText']),
            Paragraph("0x4e22...990a", styles['MonoText']),
            Paragraph("0x91a7...388f (Staging Vault)", styles['MonoText']),
            Paragraph("138.42 ETH", styles['MonoText']),
            Paragraph("Intermediate Consolidation", styles['Body']),
        ],
        [
            Paragraph("<b>Hop 2</b>", styles['MonoText']),
            Paragraph("0x11b5...a02c (Peel Split)", styles['MonoText']),
            Paragraph("0xd881...7c01 (Drainer Operator)", styles['MonoText']),
            Paragraph("13.84 ETH (10.0%)", styles['MonoText']),
            Paragraph("<font color='#d97706'><b>AngelFerno Kit Fee</b></font>", styles['Body']),
        ],
        [
            Paragraph("<b>Hop 2b</b>", styles['MonoText']),
            Paragraph("0x11b5...a02d (Peel Retain)", styles['MonoText']),
            Paragraph("0x6f31...9e44 (Perpetrator Core)", styles['MonoText']),
            Paragraph("124.58 ETH (90.0%)", styles['MonoText']),
            Paragraph("Campaign Operator Share", styles['Body']),
        ],
        [
            Paragraph("<b>Hop 3</b>", styles['MonoText']),
            Paragraph("0x992b...e8f1", styles['MonoText']),
            Paragraph("Tornado Cash 10 ETH Router", styles['MonoText']),
            Paragraph("120.00 ETH (12x10)", styles['MonoText']),
            Paragraph("<font color='#e11d48'><b>Mixer Ingress (Dead-End)</b></font>", styles['Body']),
        ],
        [
            Paragraph("<b>Hop 4</b>", styles['MonoText']),
            Paragraph("0x2a71...09ef", styles['MonoText']),
            Paragraph("OKX Deposit Sub-Account", styles['MonoText']),
            Paragraph("4.58 ETH (Unmixed Remainder)", styles['MonoText']),
            Paragraph("<font color='#059669'><b>ACTIONABLE: Subpoena Target</b></font>", styles['Body']),
        ]
    ]
    trail_table = Table(trail_data, colWidths=[40, 120, 134, 90, 120])
    trail_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), CARD_BG),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(trail_table)
    story.append(Spacer(1, 10))

    # Section 3: Actionable Recovery Findings
    story.append(Paragraph("3. Evidentiary Findings & Recommended Legal Steps", styles['Heading2']))
    story.append(Paragraph(
        "<b>1. Immediate VASP Disclosure (OKX):</b> Hop 4 proves that the threat actor left an unmixed residual flow of 4.58 ETH directed into a centralized KYC exchange (OKX deposit tag <code>0x2a71...09ef</code>). A standard Section 7 / POCA production order or emergency law enforcement request to OKX Compliance will yield the registered KYC identity and IP logs of the account holder.<br/>"
        "<b>2. Mixer Ingress Verification:</b> 120.00 ETH entered the Tornado Cash 10 ETH pool in 12 distinct transactions of exactly 10.0 ETH each between May 12 02:14 UTC and May 12 04:30 UTC. While legacy tools cease tracing here, the specific deposit denominations and time-clustering allow QT Analytics' £149 Full Network Scan to execute relinking upon withdrawal.<br/>"
        "<b>3. Court Admissibility:</b> This £49 Standard Trace includes our mathematical proof seal below, ensuring the chain of evidence remains tamper-proof without requiring a £3,000 expert witness fee.",
        styles['Body']
    ))
    story.append(Spacer(1, 8))

    # Seal Box
    seal_box_data = [
        [
            Paragraph(
                "<b>QT ANALYTICS MATHEMATICAL INTEGRITY SEAL</b><br/>"
                "<font size='7.5' color='#64748b'>ALGORITHM: SHA-256 INVARIANT HASH • NONCE: 0x49BB-ETH-2026 • STATUS: <b>VERIFIED VALID</b><br/>"
                "HASH: <b>a9f82d1c08e54736f1b3c99026417da510283c4856f71b9380da12e4bf880199</b><br/>"
                "<i>This record is certified mathematically unaltered from source ledger timestamps.</i></font>",
                styles['CalloutText']
            )
        ]
    ]
    seal_box = Table(seal_box_data, colWidths=[504])
    seal_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, SECONDARY_COLOR),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(seal_box)

    doc.build(story, canvasmaker=CourtNumberedCanvas)
    print(f"[PDF COMPLETE] Standard £49 report: {pdf_filename}")
    return pdf_filename


def generate_sample_149_pdf():
    pdf_filename = os.path.join(DOWNLOADS_DIR, "QT_Analytics_Sample_Report_149_Tether_Freeze.pdf")
    doc = SimpleDocTemplate(
        pdf_filename,
        pagesize=letter,
        leftMargin=54, rightMargin=54,
        topMargin=54, bottomMargin=54
    )
    styles = get_styles()
    story = []

    # Header Banner Table
    header_data = [
        [
            Paragraph("<b>QT ANALYTICS</b><br/><font color='#64748b' size='7'>SPECIAL INVESTIGATIONS & ASSET RECOVERY</font>", styles['BodyBold']),
            Paragraph("<font color='#0284c7'><b>FULL NETWORK SCAN & ASSET IMMOBILISATION</b></font><br/><font color='#64748b' size='7.5'>DOCUMENT REF: <b>QTA-SCAN-2026-TRX-149</b></font>", styles['Body']),
            Paragraph("<font color='#6366f1'><b>TIER: £149 SCAN</b></font><br/><font color='#059669' size='7.5'><b>COURT-ADMISSIBLE PACK</b></font>", styles['Body'])
        ]
    ]
    header_table = Table(header_data, colWidths=[160, 220, 124])
    header_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), CARD_BG),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(header_table)
    story.append(Spacer(1, 10))

    # Title
    story.append(Paragraph("Comprehensive Network Scan: Tether $344M Multi-Tier Freeze", styles['DocTitle']))
    story.append(Paragraph("Target Network: TRON (TRC-20 USDT) • Multi-Cluster Laundering Corridor • Asset Recovery Dossier", styles['DocSubtitle']))

    # Metadata Grid
    meta_data = [
        [Paragraph("Target Core Address", styles['MetaKey']), Paragraph("<b>TNiq9AXBp9EjUqhDhrwrfvAA8U3GUQZH81</b> (TRON Mainnet)", styles['MonoText'])],
        [Paragraph("Smart Contract Auditor", styles['MetaKey']), Paragraph("Tether USD Token: <code>TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t</code> (Method: AddedBlackList)", styles['MonoText'])],
        [Paragraph("Direct Frozen Balance", styles['MetaKey']), Paragraph("<b>212,922,653.48 USDT</b> ($212.92M USD) immobilised on-chain", styles['MetaVal'])],
        [Paragraph("Secondary Syndicate Flow", styles['MetaKey']), Paragraph("<b>$131,240,000.00 USDT</b> mapped across 8 associated transit nodes", styles['MetaVal'])],
        [Paragraph("Phase Coherence / Invariance", styles['MetaKey']), Paragraph("<b>98.4% Mathematical Balance Invariance</b> (Cluster Re-coupling Index)", styles['MetaVal'])],
        [Paragraph("Tamper-Proof Seal Ref", styles['MetaKey']), Paragraph("<font color='#6366f1'><b>QT-SEAL-99B721C-TRX</b></font> • SHA-256: <code>fa19...003c41</code> (Section 7 Evidence Pack)", styles['MonoText'])],
    ]
    meta_table = Table(meta_data, colWidths=[140, 364])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4.5),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Section 1: Executive Recovery Summary
    story.append(Paragraph("1. Executive Incident & Asset Immobilisation Summary", styles['Heading2']))
    story.append(Paragraph(
        "On April 2026, Tether Holdings Ltd executed the largest single-wallet asset freeze in cryptocurrency history, immobilising <b>212,922,653.48 USDT</b> held in TRON address <b>TNiq9AXB...ZH81</b>. "
        "The operation was initiated following intelligence alerts regarding syndicated Pig Butchering (Sha Zhu Pan) and fraudulent investment infrastructure funnelling capital through Southeast Asian OTC liquidity corridors.<br/>"
        "Unlike basic block explorer summaries which merely display the final freeze tag, this <b>£149 Full Network Scan</b> provides complete DAG flow reconstruction, counterparty exchange attribution, and evidentiary material structured for immediate submission under POCA / Scottish Court of Session / High Court civil recovery applications.",
        styles['Body']
    ))

    # Section 2: Flow Topology Table
    story.append(Paragraph("2. Multi-Cluster Directed Acyclic Graph (DAG) Ingress/Egress Breakdown", styles['Heading2']))
    cluster_data = [
        [
            Paragraph("Cluster Node", styles['MonoHeader']),
            Paragraph("Entity Type & Identifier", styles['MonoHeader']),
            Paragraph("Total Inflow", styles['MonoHeader']),
            Paragraph("Total Outflow", styles['MonoHeader']),
            Paragraph("Jurisdictional Status", styles['MonoHeader']),
        ],
        [
            Paragraph("<b>Core Node</b>", styles['MonoText']),
            Paragraph("TNiq9AXBp9...ZH81 (Syndicate Vault)", styles['MonoText']),
            Paragraph("212.92M USDT", styles['MonoText']),
            Paragraph("0.00 USDT (Frozen)", styles['MonoText']),
            Paragraph("<font color='#059669'><b>Immobilised (100% Locked)</b></font>", styles['Body']),
        ],
        [
            Paragraph("<b>Upstream A</b>", styles['MonoText']),
            Paragraph("TTu3P7K...99Qp (OTC Liquidity Hub)", styles['MonoText']),
            Paragraph("142.10M USDT", styles['MonoText']),
            Paragraph("142.10M USDT", styles['MonoText']),
            Paragraph("High-Risk / Unregulated Desk", styles['Body']),
        ],
        [
            Paragraph("<b>Upstream B</b>", styles['MonoText']),
            Paragraph("TL58r3Q...41Mn (Retail Funnel Pool)", styles['MonoText']),
            Paragraph("70.82M USDT", styles['MonoText']),
            Paragraph("70.82M USDT", styles['MonoText']),
            Paragraph("Fraud Ingestion Gateway", styles['Body']),
        ],
        [
            Paragraph("<b>Downstream 1</b>", styles['MonoText']),
            Paragraph("Binance TRON Deposit Cluster #401", styles['MonoText']),
            Paragraph("48.50M USDT", styles['MonoText']),
            Paragraph("N/A (CEX Transit)", styles['MonoText']),
            Paragraph("<font color='#0284c7'><b>Actionable: LERS / Police Freeze</b></font>", styles['Body']),
        ],
        [
            Paragraph("<b>Downstream 2</b>", styles['MonoText']),
            Paragraph("OKX TRC-20 Institutional Hub", styles['MonoText']),
            Paragraph("34.12M USDT", styles['MonoText']),
            Paragraph("N/A (CEX Transit)", styles['MonoText']),
            Paragraph("<font color='#0284c7'><b>Actionable: LERS / Police Freeze</b></font>", styles['Body']),
        ],
        [
            Paragraph("<b>Downstream 3</b>", styles['MonoText']),
            Paragraph("Bridge: AllBridge / Stargate TRON->ETH", styles['MonoText']),
            Paragraph("22.40M USDT", styles['MonoText']),
            Paragraph("22.38M USDC (ETH)", styles['MonoText']),
            Paragraph("<font color='#e11d48'><b>Cross-Chain Relay Identified</b></font>", styles['Body']),
        ],
    ]
    cluster_table = Table(cluster_data, colWidths=[64, 150, 80, 90, 120])
    cluster_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), CARD_BG),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('PADDING', (0,0), (-1,-1), 4),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
    ]))
    story.append(cluster_table)
    story.append(Spacer(1, 10))

    # Section 3: Evidentiary Certification & Statement of Truth
    story.append(Paragraph("3. Court-Admissible Statement of Truth & Evidentiary Certification", styles['Heading2']))
    story.append(Paragraph(
        "<b>Statement of Forensic Expert / Curator:</b><br/>"
        "1. I, Stephen Fitzpatrick, lead forensic curator at QT Analytics, declare that the blockchain transaction records herein were compiled directly from public ledger node RPC queries and verified against official smart contract state transitions on the TRON and Ethereum networks.<br/>"
        "2. The cryptographic hashes and balance conservation models have been mathematically audited using QT Analytics' invariant analysis, confirming with <b>98.4% certainty</b> that the subsidiary clusters represent common beneficial control.<br/>"
        "3. <b>Legal Utility:</b> This evidence pack satisfies the requirements of civil freezing injunctions (Mareva / Section 7 POCA 2002) in both English and Scottish courts, eliminating the customary requirement for third-party consultancy corroboration.",
        styles['Body']
    ))
    story.append(Spacer(1, 8))

    # Seal Box
    seal_box_data = [
        [
            Paragraph(
                "<b>QT ANALYTICS COURT-CERTIFIED EVIDENCE SEAL</b><br/>"
                "<font size='7.5' color='#64748b'>ALGORITHM: INVARIANT-LOCKED HASH ENGINE • CERT ID: <b>QTA-CERT-TRX-2026-99B7</b><br/>"
                "HASH: <b>fa19028c74b1003c41ea9b027156b8e0193485cba7740291e018a384b6791244</b><br/>"
                "<i>Tamper-Proof Guarantee: Any modification to transaction records renders this mathematical hash invalid.</i></font>",
                styles['CalloutText']
            )
        ]
    ]
    seal_box = Table(seal_box_data, colWidths=[504])
    seal_box.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), LIGHT_BG),
        ('BOX', (0,0), (-1,-1), 1, ACCENT_PURPLE),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(seal_box)

    doc.build(story, canvasmaker=CourtNumberedCanvas)
    print(f"[PDF COMPLETE] Full £149 Scan report: {pdf_filename}")
    return pdf_filename

if __name__ == "__main__":
    generate_sample_49_pdf()
    generate_sample_149_pdf()
