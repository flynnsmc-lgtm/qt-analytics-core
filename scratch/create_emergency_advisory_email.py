import os
import time
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

outbox_dir = os.path.join(os.path.dirname(__file__), "..", "agent_reports", "outbox")
os.makedirs(outbox_dir, exist_ok=True)

order_id = "QT-ADVISORY-PHP2SHELL-T-SHIELD"
from_addr = "stephen@qtanalytics.co.uk"
subject = "URGENT SECURITY ADVISORY: PHP2Shell (CVE-2026-109618) Zero-Downtime Defense & Free Open-Source Patch Toolkit"

text_body = """URGENT SECURITY ADVISORY: ZERO-DOWNTIME DEFENSE AGAINST PHP2SHELL (CVE-2026-109618 / 109619)
From: Stephen Fitzpatrick, Lead Investigator & Founder, QT Analytics (Edinburgh, Scotland)
Contact: 07538162246 (+44 7538 162246) | stephen@qtanalytics.co.uk | https://qtanalytics.co.uk

Dear IT Director, Managing Partner, & Infrastructure Lead,

I am writing with an immediate security briefing regarding the active global Remote Code Execution (RCE) vulnerability known as PHP2Shell (CVE-2026-109618 / CVE-2026-109619, CVSS 9.2).

Across the UK and Europe, public agencies, corporate websites, and municipal services are mistakenly taking critical web infrastructure completely offline out of panic. 

AT QT ANALYTICS, OUR CIVIC ETHOS IS SIMPLE: THIS IS NOT FOR RANSOM. EMERGENCY DEFENSE MUST BE ACCESSIBLE TO ALL.
You do NOT need to take your customer portals, payment gateways, or booking systems offline. Our intelligence desk has open-sourced an immediate, zero-downtime edge shield that neutralizes this attack vector in under 60 seconds without altering your application code.

----------------------------------------------------------------------
1. THE THREAT IN PLAIN ENGLISH (10-MINUTE DISCOVERY)
----------------------------------------------------------------------
PHP2Shell exploits an asynchronous temporal desynchronization inside PHP's legacy upload progress tracker (`session.upload_progress`). 

Think of your web server like a restaurant kitchen. The attacker doesn't try to kick in the front door or guess passwords. Instead, they hand your waiter a massive menu order, wait until the kitchen writes it on a scratch chalkboard, pause the communication for exactly one second, and then shout an impossible burst of new instructions. The kitchen gets confused, leaves stale memory on the counter, and mistakenly executes the attacker's script as if it were trusted system code.

Because this memory flaw triggers BEFORE your WordPress, Magento, Laravel, or custom business application even starts executing, typical application-level firewalls and login protections are bypassed completely.

----------------------------------------------------------------------
2. THE 60-SECOND ZERO-DOWNTIME FIX (100% FREE & OPEN SOURCE)
----------------------------------------------------------------------
Because the exploit relies entirely on PHP's optional upload progress tracking feature, dropping this parameter at your reverse proxy (or turning it off in php.ini) renders the exploit 100% inert with ZERO impact on legitimate file uploads.

We have published the complete, verified toolkit to GitHub under the permissive MIT Open License:

* Full GitHub Toolkit Directory:
  https://github.com/flynnsmc-lgtm/qt-analytics-core/tree/main/downloads/t_shield

* 1. The Crystal Sister (Nginx Edge Shield - Drops attack at the perimeter):
  https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/block_php2shell.conf
  SHA-256: ac9d45c5c6a26f34078726c890fa90b5541c85a5812b4774d446c604bee12ad2

* 2. Global php.ini Hardening Killswitch (Instantly disables vulnerable handler):
  https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/disable_upload_progress.ini
  SHA-256: c0aba8f5166540a0f3f6117fec2e5188c224e4fbbbfe8d0caaf54927402c5617

* 3. Linux / macOS Fleet Audit Scanner (Automated inspection script):
  https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/audit_server.sh
  SHA-256: 596b0c42425dbd284e874af880743ad6e729be9eacf1374241ffe518dc9ff614

* 4. Windows Server PowerShell Audit Scanner:
  https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/audit_server.ps1
  SHA-256: 501f69f19543a45826884274b3f8333fb92d3d5370fabb41faa3f07a6fd3eee9

* 5. Technical Documentation & Deployment Guide:
  https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/README.md

----------------------------------------------------------------------
3. FREE EMERGENCY TRIAGE VS. ONGOING 24/7 SURVEILLANCE
----------------------------------------------------------------------
- FREE EMERGENCY TOOLKIT: Download, audit, and deploy the scripts above immediately across your servers at zero cost.
- ASSISTED EMERGENCY TRIAGE (£49 - £499): If your internal team needs our forensic engineers to remotely audit your fleet, verify hash integrity, or harden EOL PHP 7.x/8.x legacy servers.
- 24/7 VELOCITY SENTRY & FRAUD INTERCEPT (£499 - £2,500/mo): Continuous sovereign monitoring of high-frequency attack vectors, automated mempool tracking, and UK CPR Part 25 asset freezing protection.

----------------------------------------------------------------------
4. EMERGENCY DESK ASSISTANCE & DIRECT CONTACT
----------------------------------------------------------------------
If your systems are exhibiting anomalous memory load, unusual upload traffic spikes, or if you require immediate technical confirmation:

Stephen Fitzpatrick
Lead Investigator & Founder, QT Analytics
Direct Mobile: 07538162246 (+44 7538 162246)
Email: stephen@qtanalytics.co.uk
Web: https://qtanalytics.co.uk
Emergency Observatory Portal: https://qtanalytics.co.uk/t_shield_emergency.html

Stay protected. Keep your infrastructure online.
"""

html_body = f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #050811; color: #f1f5f9; margin: 0; padding: 24px; }}
    .container {{ max-width: 720px; margin: 0 auto; background: #0b1120; border: 1px solid rgba(0, 242, 254, 0.3); border-radius: 12px; overflow: hidden; box-shadow: 0 12px 40px rgba(0,0,0,0.6); }}
    .header {{ background: linear-gradient(135deg, #0b1120 0%, #1e1b4b 50%, #0f172a 100%); padding: 30px 24px; border-bottom: 2px solid #00f2fe; }}
    .badge {{ display: inline-block; padding: 5px 12px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.4); letter-spacing: 0.05em; }}
    .title {{ font-size: 24px; font-weight: 800; color: #ffffff; margin-top: 12px; margin-bottom: 6px; letter-spacing: -0.02em; }}
    .subtitle {{ font-size: 13.5px; color: #94a3b8; line-height: 1.5; }}
    .content {{ padding: 28px 24px; font-size: 14.5px; line-height: 1.65; color: #cbd5e1; }}
    .callout-box {{ background: rgba(0, 242, 254, 0.06); border-left: 4px solid #00f2fe; padding: 18px; border-radius: 6px; margin: 20px 0; }}
    .callout-box strong {{ color: #38bdf8; }}
    .ethos-banner {{ background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.35); border-radius: 8px; padding: 16px; margin: 20px 0; text-align: center; color: #34d399; font-weight: 700; font-size: 14px; }}
    .card {{ background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(255, 255, 255, 0.09); border-radius: 8px; padding: 18px; margin-bottom: 14px; }}
    .card-title {{ font-size: 15px; font-weight: 700; color: #ffffff; display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }}
    .card-meta {{ font-size: 11px; font-family: monospace; color: #00f2fe; background: rgba(0, 242, 254, 0.1); padding: 2px 8px; border-radius: 4px; }}
    .card-desc {{ font-size: 13px; color: #94a3b8; margin-bottom: 8px; }}
    .btn {{ display: inline-block; padding: 8px 16px; border-radius: 6px; font-size: 12px; font-weight: 700; text-decoration: none; background: #0284c7; color: #fff; margin-top: 6px; }}
    .contact-box {{ background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(0, 242, 254, 0.25); border-radius: 8px; padding: 20px; margin-top: 26px; }}
    .footer {{ background: #060913; padding: 18px 24px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid rgba(255, 255, 255, 0.06); }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <span class="badge">🚨 CRITICAL SECURITY ADVISORY • CVSS 9.2</span>
      <div class="title">PHP2Shell Zero-Downtime Defense &amp; Free Mitigation Toolkit</div>
      <div class="subtitle">Direct Intelligence Briefing &bull; QT Analytics Desk &bull; Lead: Stephen Fitzpatrick (07538162246)</div>
    </div>
    
    <div class="content">
      <p style="margin-top:0;">
        Dear IT Director, Managing Partner, &amp; Technical Infrastructure Lead,
      </p>
      
      <p>
        An unauthenticated, pre-application Remote Code Execution vulnerability known as <strong>PHP2Shell</strong> (CVE-2026-109618 / 109619) is actively triggering emergency server outages worldwide. Multiple UK and European government portals have taken critical services completely offline in response.
      </p>

      <div class="ethos-banner">
        🛡️ "NOT FOR RANSOM" ETHOS: ZERO-DOWNTIME DEFENSE MUST BE PUBLIC &amp; FREE
      </div>

      <p>
        <strong>Do not take your websites or customer portals offline.</strong> The exploit can be neutralized surgically at your reverse proxy or PHP configuration in less than 60 seconds with zero downtime and without modifying your website application code.
      </p>

      <div class="callout-box">
        <strong>💡 The 10-Minute Executive Overview:</strong><br>
        The attack manipulates PHP's legacy upload progress tracker (<code style="color:#00f2fe;">session.upload_progress</code>) using a high-frequency packet pause that triggers uninitialized memory reuse. Because this happens <em>before</em> your WordPress or web application code runs, traditional application firewalls fail. By turning off this optional upload tracker, the attack vector is completely shut down.
      </div>

      <div style="font-weight: 700; color: #fff; font-size: 16px; margin: 24px 0 12px 0;">
        📦 Verified Open-Source Mitigation Files (Available on GitHub):
      </div>

      <div class="card" style="border-left: 4px solid #00f2fe;">
        <div class="card-title">
          <span>1. The Crystal Sister (Nginx Edge Shield)</span>
          <span class="card-meta">Edge Filter</span>
        </div>
        <div class="card-desc">Surgically inspects and drops the attack header at your Nginx reverse proxy before traffic reaches PHP. Zero dropped user sessions.</div>
        <a href="https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/block_php2shell.conf" class="btn" target="_blank">View on GitHub &rarr;</a>
      </div>

      <div class="card" style="border-left: 4px solid #10b981;">
        <div class="card-title">
          <span>2. Global php.ini Hardening Killswitch</span>
          <span class="card-meta">php.ini Snippet</span>
        </div>
        <div class="card-desc">Fleetwide configuration snippet disabling upload progress tracking permanently. Applied in 5 seconds via standard service reload.</div>
        <a href="https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/disable_upload_progress.ini" class="btn" style="background:#059669;" target="_blank">View on GitHub &rarr;</a>
      </div>

      <div class="card" style="border-left: 4px solid #f59e0b;">
        <div class="card-title">
          <span>3. Linux &amp; Windows Server Audit Scanners</span>
          <span class="card-meta">Bash &amp; PowerShell</span>
        </div>
        <div class="card-desc">Read-only diagnostic scripts that audit your PHP runtime, distinguish mod_php from FPM, and verify heap cleanliness.</div>
        <a href="https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/audit_server.sh" class="btn" style="background:#d97706;" target="_blank">View Linux Script &rarr;</a>
        <a href="https://github.com/flynnsmc-lgtm/qt-analytics-core/blob/main/downloads/t_shield/audit_server.ps1" class="btn" style="background:#d97706;" target="_blank">View Windows Script &rarr;</a>
      </div>

      <div class="card" style="border-left: 4px solid #a855f7;">
        <div class="card-title">
          <span>4. Full Open-Source Repository &amp; Verification Guide</span>
          <span class="card-meta">MIT License</span>
        </div>
        <div class="card-desc">Inspect SHA-256 hashes, verify source code line-by-line, and read deployment instructions.</div>
        <a href="https://github.com/flynnsmc-lgtm/qt-analytics-core/tree/main/downloads/t_shield" class="btn" style="background:#7c3aed;" target="_blank">Browse GitHub Repository &rarr;</a>
      </div>

      <div class="contact-box">
        <div style="font-weight: 700; color: #fff; font-size: 15px; margin-bottom: 8px;">
          📞 Direct Technical Assistance &amp; Emergency Escalation:
        </div>
        <div><strong>Stephen Fitzpatrick</strong> &bull; Lead Investigator &amp; Founder, QT Analytics</div>
        <div>Direct Line: <a href="tel:07538162246" style="color: #10b981; font-weight: 700; text-decoration: none;">07538162246 (+44 7538 162246)</a></div>
        <div>Email: <a href="mailto:stephen@qtanalytics.co.uk" style="color: #38bdf8; text-decoration: none;">stephen@qtanalytics.co.uk</a></div>
        <div>Web &amp; Incident Desk: <a href="https://qtanalytics.co.uk" target="_blank" style="color: #38bdf8;">https://qtanalytics.co.uk</a></div>
        <div style="margin-top: 10px; font-size: 12px; color: #94a3b8;">
          Emergency fixes are completely free to use. For ongoing 24/7 velocity sentry, anomalous flow interception, and legal CPR Part 25 freezing, retainers are available from £49/mo.
        </div>
      </div>
    </div>

    <div class="footer">
      QT Analytics Forensic Intelligence &bull; Edinburgh, Scotland &bull; Sovereign Cyber &amp; Blockchain Defense
    </div>
  </div>
</body>
</html>"""

msg = MIMEMultipart('alternative')
msg['Subject'] = subject
msg['From'] = from_addr
msg['To'] = "directors@client-advisory.co.uk"
msg['X-Incident-Order-ID'] = order_id
msg['Date'] = time.strftime("%a, %d %b %Y %H:%M:%S +0000", time.gmtime())

msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
msg.attach(MIMEText(html_body, 'html', 'utf-8'))

eml_path = os.path.join(outbox_dir, f"emergency_advisory_php2shell.eml")
html_path = os.path.join(outbox_dir, f"emergency_advisory_php2shell.html")

with open(eml_path, "wb") as f:
    f.write(msg.as_bytes())

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_body)

print(f"Advisory Email Generated Successfully:")
print(f"EML: {eml_path}")
print(f"HTML: {html_path}")
