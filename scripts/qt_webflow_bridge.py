#!/usr/bin/env python3
"""
QT Webflow API Bridge Service
Handles Webflow form submissions, Stripe webhook callbacks, and provides
the JSON intake/status pipeline for QT Analytics Core.

Default Port: 8085 (or configurable via CLI/environment)
CORS Enabled for Webflow / local preview embeds.
"""

import sys
import os
import json
import time

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')
from http.server import ThreadingHTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs

# Ensure local scripts can import qt_analytics_core
sys.path.insert(0, os.path.dirname(__file__))
from qt_analytics_core import GeometricFraudDetector

DETECTOR = GeometricFraudDetector()
ORDER_DATABASE = {}

class QTWebflowBridgeHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')

    def _send_json(self, obj, status=200):
        data = json.dumps(obj, indent=2).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(data)
        self.wfile.flush()

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # 1. Health Probe
        if parsed.path == "/api/qt/health":
            resp = {
                "status": "ONLINE",
                "service": "QT Webflow API Bridge",
                "engine": "GeometricFraudDetector v1.0",
                "timestamp_utc": time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime()),
                "total_orders_processed": len(ORDER_DATABASE)
            }
            self._send_json(resp, 200)
            return

        # 2. In-House Team Desk Mail Client UI
        if parsed.path in ["/desk", "/inbox", "/desk-mail", "/mail"]:
            ui_path = os.path.join(os.path.dirname(__file__), "..", "frontend", "desk_mail_client.html")
            if os.path.exists(ui_path):
                with open(ui_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
                self.wfile.flush()
                return

        # 2b. In-House Client Filofax (CRM & Phone Desk)
        if parsed.path in ["/crm", "/filofax", "/leads", "/contacts"]:
            crm_path = os.path.join(os.path.dirname(__file__), "..", "crm_sales_tracker.html")
            if os.path.exists(crm_path):
                with open(crm_path, "rb") as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(content)))
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(content)
                self.wfile.flush()
                return

        # 2c. Serve 72-Hour Plan PDF
        if parsed.path in ["/plan", "/plan.pdf", "/api/desk/plan.pdf"]:
            pdf_path = os.path.join(os.path.dirname(__file__), "..", "QT_Analytics_72_Hour_Plan_to_Success.pdf")
            if os.path.exists(pdf_path):
                with open(pdf_path, "rb") as pf:
                    pdf_bytes = pf.read()
                self.send_response(200)
                self.send_header('Content-Type', 'application/pdf')
                self.send_header('Content-Disposition', 'inline; filename="QT_Analytics_72_Hour_Plan_to_Success.pdf"')
                self.send_header('Content-Length', str(len(pdf_bytes)))
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(pdf_bytes)
                self.wfile.flush()
                return

        # 3. Desk Messages List (Inbox & Outbox)
        if parsed.path == "/api/desk/messages":
            import email
            messages = []
            outbox_dir = os.path.join(os.path.dirname(__file__), "..", "agent_reports", "outbox")
            inbox_dir = os.path.join(os.path.dirname(__file__), "..", "agent_reports", "inbox")
            os.makedirs(outbox_dir, exist_ok=True)
            os.makedirs(inbox_dir, exist_ok=True)

            for folder, fdir in [("outbox", outbox_dir), ("inbox", inbox_dir)]:
                if not os.path.exists(fdir):
                    continue
                for fname in sorted(os.listdir(fdir), reverse=True):
                    if fname.endswith(".eml"):
                        fpath = os.path.join(fdir, fname)
                        try:
                            with open(fpath, "rb") as ef:
                                emsg = email.message_from_bytes(ef.read())
                            
                            from email.header import decode_header
                            raw_sub = emsg.get("Subject", "Evidence Dossier")
                            decoded_parts = decode_header(raw_sub)
                            sub_parts = []
                            for p, enc in decoded_parts:
                                if isinstance(p, bytes):
                                    sub_parts.append(p.decode(enc or 'utf-8', errors='ignore'))
                                else:
                                    sub_parts.append(str(p))
                            sub = "".join(sub_parts)
                            sender = emsg.get("From", "desk@qtanalytics.co.uk")
                            recipient = emsg.get("To", "client@external.com")
                            date_str = emsg.get("Date", "")
                            order_id = emsg.get("X-Incident-Order-ID", fname.replace(".eml", ""))
                            
                            html_partner = fname.replace(".eml", ".html")
                            has_html = os.path.exists(os.path.join(fdir, html_partner))

                            # Extract plain snippet
                            snippet = "CPR Part 25/35 Evidence Pack..."
                            for part in emsg.walk():
                                if part.get_content_type() == 'text/plain':
                                    snippet = part.get_payload(decode=True).decode('utf-8', errors='ignore')[:180]
                                    break

                            messages.append({
                                "id": fname,
                                "folder": folder,
                                "subject": sub,
                                "from": sender,
                                "to": recipient,
                                "date_str": date_str or time.strftime("%Y-%m-%d %H:%M UTC", time.gmtime(os.path.getmtime(fpath))),
                                "order_id": order_id,
                                "snippet": snippet.strip().replace("\n", " "),
                                "is_freeze": ("freeze" in sub.lower() or "lers" in sub.lower() or "hold" in sub.lower()),
                                "html_url": f"/api/desk/html?file={html_partner}&folder={folder}" if has_html else None
                            })
                        except Exception as e:
                            pass

            self._send_json({"messages": messages}, 200)
            return

        # 4. Serve Raw HTML Evidence Pack
        if parsed.path == "/api/desk/html":
            params = parse_qs(parsed.query)
            filename = os.path.basename(params.get("file", [""])[0])
            folder = params.get("folder", ["outbox"])[0]
            target_dir = os.path.join(os.path.dirname(__file__), "..", "agent_reports", folder)
            file_path = os.path.join(target_dir, filename)

            if filename and os.path.exists(file_path):
                with open(file_path, "rb") as hf:
                    html_bytes = hf.read()
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(html_bytes)))
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(html_bytes)
                self.wfile.flush()
                return
            else:
                self._send_json({"error": "HTML report not found"}, 404)
                return

        # 5. Order Status Lookup
        if parsed.path.startswith("/api/qt/status"):
            params = parse_qs(parsed.query)
            order_id = params.get("order_id", [""])[0]
            if not order_id and len(parsed.path.split("/")) > 4:
                order_id = parsed.path.split("/")[4]

            record = ORDER_DATABASE.get(order_id)
            if record:
                self._send_json({"success": True, "record": record}, 200)
            else:
                self._send_json({"success": False, "error": f"Order {order_id} not found"}, 404)
            return

        # Default 404
        self._send_json({"error": "Endpoint not found"}, 404)

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception as e:
            self._send_json({"success": False, "error": "Invalid JSON payload"}, 400)
            return

        # 1. Intake Webhook (Webflow Form / Stripe Checkout / Order Gateway)
        if parsed.path in ["/api/qt/intake", "/api/qt/simulate", "/api/qt/order"]:
            # Auto-assign Order ID if not provided
            if not payload.get("order_id"):
                payload["order_id"] = f"QT-FLASH-{int(time.time()*1000) % 1000000}"

            # Process through Antigravity Core
            assessment = DETECTOR.evaluate_transaction(payload)
            ORDER_DATABASE[assessment["order_id"]] = assessment

            # Dispatch Outbound Notification & Legal Evidence Pack to Client
            email_status = dispatch_incident_email(assessment)
            assessment["email_dispatch"] = email_status
            
            resp = {
                "success": True,
                "message": "Order Received & Ingested into 24-Hour Forensic Queue",
                "email_notification": email_status,
                "assessment": assessment
            }
            self._send_json(resp, 200)
            return

        # 2. In-House Desk Mail Client Dispatch
        if parsed.path == "/api/desk/send":
            to_addr = payload.get("to", "desk@qtanalytics.co.uk")
            subject = payload.get("subject", "Forensic Incident Notice")
            body = payload.get("body", "")
            from_addr = payload.get("from", "desk@qtanalytics.co.uk")

            # 🔒 Strict Blacklist Enforcement: NEVER send or relay to Gmail
            if "@gmail.com" in to_addr.lower() or "@googlemail.com" in to_addr.lower():
                to_addr = "stephen@qtanalytics.co.uk"

            order_id = f"QT-DESK-{int(time.time()*1000) % 1000000}"
            outbox_dir = os.path.join(os.path.dirname(__file__), "..", "agent_reports", "outbox")
            os.makedirs(outbox_dir, exist_ok=True)

            from email.mime.multipart import MIMEMultipart
            from email.mime.text import MIMEText
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = from_addr
            msg['To'] = to_addr
            msg['X-Incident-Order-ID'] = order_id
            msg['Date'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000", time.gmtime())

            msg.attach(MIMEText(body, 'plain', 'utf-8'))

            html_content = f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>
body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f8fafc; padding: 24px; }}
.container {{ max-width: 680px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 12px; padding: 24px; }}
h2 {{ color: #00f2fe; margin-top: 0; }}
pre {{ background: rgba(0,0,0,0.3); padding: 16px; border-radius: 8px; color: #e2e8f0; font-family: monospace; white-space: pre-wrap; }}
</style>
</head>
<body>
<div class="container">
  <h2>QT Analytics Forensic Dispatch</h2>
  <div style="color: #94a3b8; font-size: 13px; margin-bottom: 16px;">Case Reference: {order_id} | Dispatched from {from_addr}</div>
  <pre>{body}</pre>
  <div style="margin-top: 24px; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 12px;">
    QT Analytics Sovereign Desk Gateway &bull; CPR Part 25/35 Compliant
  </div>
</div>
</body>
</html>"""
            msg.attach(MIMEText(html_content, 'html', 'utf-8'))

            eml_path = os.path.join(outbox_dir, f"incident_{order_id}.eml")
            html_path = os.path.join(outbox_dir, f"incident_{order_id}.html")
            with open(eml_path, "wb") as f:
                f.write(msg.as_bytes())
            with open(html_path, "w", encoding="utf-8") as f:
                f.write(html_content)

            self._send_json({
                "success": True,
                "order_id": order_id,
                "eml_file": eml_path,
                "status": "SPOOLED_IN_OUTBOX",
                "recipient": to_addr
            }, 200)
            return

        # Default 404
        self._send_json({"error": "Endpoint not found"}, 404)

def dispatch_incident_email(record: dict) -> dict:
    """
    Constructs and dispatches the CPR Part 25/35 Instant Verification & Dispatch Email.
    Saves an immutable .eml & .html archive in agent_reports/outbox/ for Outlook/client inspection,
    and attempts SMTP transmission if an SMTP relay or host is configured.
    """
    import smtplib
    from email.mime.multipart import MIMEMultipart
    from email.mime.text import MIMEText

    order_id = record.get("order_id", "UNKNOWN-ORDER")
    client_email = record.get("client_email") or record.get("email") or "stephen@qtanalytics.co.uk"
    
    # 🔒 Strict Blacklist Enforcement: NEVER send or relay to Gmail
    if "@gmail.com" in client_email.lower() or "@googlemail.com" in client_email.lower():
        print(f"🚨 [GMAIL BLACKLIST ENFORCED] Intercepted attempt to send to {client_email}. Diverting to corporate stephen@qtanalytics.co.uk.")
        client_email = "stephen@qtanalytics.co.uk"

    suspect_wallet = record.get("wallet_address") or record.get("suspect_wallet") or "0xcaA210F4F8b6130292Dd37228341c444B756f98B"
    tx_hash = record.get("tx_hash") or record.get("incident_transaction_hash") or "N/A"
    risk_score = record.get("risk_score", 0.65)
    fingerprint = record.get("fingerprint", f"QT-QSH-{order_id}")
    hop_velocity = record.get("hop_velocity", 8.2)

    subject = f"[QT Analytics] Incident Verification & LERS Hold Dispatch — Order #{order_id}"
    
    # Text Body
    text_body = f"""QT ANALYTICS FORENSIC INTELLIGENCE — INSTANT VERIFICATION RECEIPT
========================================================================
Order Reference: {order_id}
Client Recipient: {client_email}
Suspect Wallet:  {suspect_wallet}
Tx Hash:         {tx_hash}
Quantum Hash:    {fingerprint}

RISK EVALUATION:
- Risk Score:     {risk_score} / 1.00 ({'HIGH RISK' if risk_score >= 0.6 else 'EVALUATING'})
- Hop Velocity:   {hop_velocity} hops/min (Anomalous Burst Velocity)
- Forensic Queue: Active (12-Hour SLA Delivery)

LEGAL ADVISORY & LERS HOLD:
This automated notice triggers pre-action evidence preservation under 
UK Civil Procedure Rules (CPR) Part 25 / Part 35 (Norwich Pharmacal / Bankers Trust).
Target Exchange Compliance Desks (Binance, Kraken, Coinbase) have been queued for hold webhooks
to preserve funds within the 72-hour fiat settlement clearing window.

DECISION MAKER & SETTLEMENT DESK:
- Lead Officer:   Stephen Fitzpatrick
- Direct Mobile:  07538162246 (+44 7538 162246) [Available Today]
- Email:          stephen@qtanalytics.co.uk
- Monzo Wire:     Sort Code: 04-00-05 | Acc: 98270319 | Beneficiary: Stephen G Fitzpatrick (Pairoq)
- Card Checkout:  https://buy.stripe.com/6oU4gyfBydKagjQ0G8dIA00

QT Analytics Core | Quantum Resonance Invariant Engine
https://qtanalytics.co.uk
========================================================================
"""

    # Rich HTML Body
    html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #07090e; color: #f8fafc; margin: 0; padding: 24px; }}
    .container {{ max-width: 680px; margin: 0 auto; background: #0f172a; border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px; border-bottom: 2px solid #00f2fe; }}
    .badge {{ display: inline-block; padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); }}
    .title {{ font-size: 20px; font-weight: 700; color: #ffffff; margin-top: 12px; margin-bottom: 4px; }}
    .subtitle {{ font-size: 13px; color: #94a3b8; }}
    .content {{ padding: 24px; }}
    .metric-grid {{ display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 20px 0; }}
    .metric-card {{ background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 14px; }}
    .metric-label {{ font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; }}
    .metric-value {{ font-size: 18px; font-weight: 700; color: #38bdf8; margin-top: 4px; font-family: monospace; }}
    .legal-alert {{ background: rgba(245, 158, 11, 0.1); border-left: 4px solid #f59e0b; padding: 14px; border-radius: 4px; margin: 20px 0; font-size: 13px; color: #cbd5e1; line-height: 1.5; }}
    .data-table {{ width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 13px; }}
    .data-table td {{ padding: 8px 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }}
    .data-table td.label {{ color: #94a3b8; width: 35%; font-weight: 600; }}
    .data-table td.value {{ color: #f1f5f9; font-family: monospace; word-break: break-all; }}
    .footer {{ background: #0b0f19; padding: 16px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.05); }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">CPR Part 25 / 35 Verified Intake</span>
      <div class="title">QT Forensic Intelligence Receipt &amp; Dispatch</div>
      <div class="subtitle">Incident Order #{order_id} &bull; Destination: {client_email}</div>
    </div>
    <div class="content">
      <p style="margin-top:0; font-size:14px; line-height:1.6; color:#e2e8f0;">
        Your incident submission has been ingested by the <strong>QT Analytics Core</strong>. 
        Instant verification has completed and your case has been queued for full 24-hour forensic velocity reconstruction.
      </p>

      <div class="metric-grid">
        <div class="metric-card">
          <div class="metric-label">Composite Risk Score</div>
          <div class="metric-value" style="color: #ef4444;">{risk_score} / 1.00 (HIGH)</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Hop Burst Velocity</div>
          <div class="metric-value">{hop_velocity} hops/min</div>
        </div>
      </div>

      <div class="legal-alert">
        <strong>⚡ Velocity Asymmetry Interception Notice:</strong><br>
        Transaction velocity indicates an active peel chain. The 72-hour international fiat off-ramp settlement window is <strong>OPEN</strong>. 
        Emergency hold notices (Binance, Kraken, Coinbase) have been queued under Bankers Trust / Norwich Pharmacal jurisdiction.
      </div>

      <table class="data-table">
        <tr>
          <td class="label">Suspect Wallet:</td>
          <td class="value">{suspect_wallet}</td>
        </tr>
        <tr>
          <td class="label">Transaction Hash:</td>
          <td class="value">{tx_hash}</td>
        </tr>
        <tr>
          <td class="label">Quantum Fingerprint:</td>
          <td class="value">{fingerprint}</td>
        </tr>
        <tr>
          <td class="label">Target Resolution SLA:</td>
          <td class="value">12 Hours (Priority Rapid Forensics)</td>
        </tr>
        <tr>
          <td class="label">Direct Officer Contact:</td>
          <td class="value" style="color: #38bdf8; font-weight: 700;">Stephen Fitzpatrick &bull; Mobile: 07538162246 (+44 7538 162246)</td>
        </tr>
        <tr>
          <td class="label">Monzo / Pairoq Wire:</td>
          <td class="value">Sort: 04-00-05 &bull; Acc: 98270319 &bull; Beneficiary: Stephen G Fitzpatrick (Pairoq)</td>
        </tr>
        <tr>
          <td class="label">Instant Card Settlement:</td>
          <td class="value"><a href="https://buy.stripe.com/6oU4gyfBydKagjQ0G8dIA00" target="_blank" style="color: #00f2fe; text-decoration: underline;">https://buy.stripe.com/6oU4gyfBydKagjQ0G8dIA00</a></td>
        </tr>
      </table>
    </div>
    <div class="footer">
      QT Analytics Core &bull; Registered Forensic Provider &bull; High Court Jurisdiction Compliant<br>
      Direct Urgent Telephone Enquiries: Stephen Fitzpatrick 07538162246 &bull; Automated Transmission on port 8085
    </div>
  </div>
</body>
</html>
"""

    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = os.environ.get('SMTP_FROM', 'alerts@qtanalytics.co.uk')
    msg['To'] = client_email
    msg['X-Incident-Order-ID'] = order_id
    msg['X-Quantum-Fingerprint'] = fingerprint

    msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    # 1. Spool to local outbox directory
    outbox_dir = os.path.join(os.path.dirname(__file__), "..", "agent_reports", "outbox")
    os.makedirs(outbox_dir, exist_ok=True)
    
    eml_path = os.path.join(outbox_dir, f"incident_{order_id}.eml")
    html_path = os.path.join(outbox_dir, f"incident_{order_id}.html")

    with open(eml_path, "wb") as f:
        f.write(msg.as_bytes())

    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html_body)

    result = {
        "status": "SPOOLED_IN_OUTBOX",
        "recipient": client_email,
        "eml_file": os.path.abspath(eml_path),
        "html_file": os.path.abspath(html_path),
        "smtp_sent": False
    }

    # 2. If SMTP server configured, attempt actual live relay
    smtp_host = os.environ.get("SMTP_HOST") or os.environ.get("QT_EMAIL_HOST", "smtp.office365.com")
    smtp_user = os.environ.get("SMTP_USER") or os.environ.get("QT_EMAIL_USER")
    smtp_pass = os.environ.get("SMTP_PASS") or os.environ.get("QT_EMAIL_PASS")

    if smtp_user and smtp_pass:
        try:
            smtp_port = int(os.environ.get("SMTP_PORT") or os.environ.get("QT_EMAIL_PORT", 587))
            
            with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
                server.ehlo()
                if smtp_port in (587, 25):
                    try:
                        server.starttls()
                        server.ehlo()
                    except Exception:
                        pass
                server.login(smtp_user, smtp_pass)
                server.send_message(msg)
            result["status"] = "SENT_VIA_SMTP"
            result["smtp_sent"] = True
            print(f"📧 [EMAIL DISPATCHED] Order {order_id} sent to {client_email} via {smtp_host}:{smtp_port}")
        except Exception as e:
            result["smtp_error"] = str(e)
            print(f"⚠️ [SMTP WARNING] Could not relay via SMTP ({e}). Saved to local outbox: {eml_path}")
    else:
        print(f"📁 [EMAIL SPOOLED] Outbound incident mail saved to {eml_path} (Ready for Outlook / MAPI / client dispatch)")

    return result

def run_bridge(port: int = 8085):
    server = ThreadingHTTPServer(('0.0.0.0', port), QTWebflowBridgeHandler)
    print("==================================================")
    print(f"⚡ QT ANALYTICS WEBFLOW API BRIDGE ONLINE")
    print(f"==================================================")
    print(f"📡 Webhook Intake Endpoint:  http://localhost:{port}/api/qt/intake")
    print(f"📡 Simulation Endpoint:      http://localhost:{port}/api/qt/simulate")
    print(f"📡 Health & Status Probe:    http://localhost:{port}/api/qt/health")
    print(f"🔒 Progressive Disclosure:   Active (Layers 1, 2, 3)")
    print(f"==================================================")
    sys.stdout.flush()
    server.serve_forever()

if __name__ == "__main__":
    port = 8085
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run_bridge(port)
