# 🛡️ Operation Fire Pole: The Heroic Ts (PHP2Shell Emergency Shield)
### Free Open-Source Mitigation Toolkit for CVE-2026-109618 & CVE-2026-109619
**Published by**: QT Analytics Sentry Guild ([qtanalytics.co.uk](https://qtanalytics.co.uk))  
**License**: MIT (Free Public & Commercial Use • Not For Ransom)  
**Target Vulnerability**: PHP2Shell (Unauthenticated Remote Code Execution in RFC1867 upload stream handler)  
**Protection Objective**: Zero Downtime • Neutralize Exploit Vector at Edge / INI Layer

---

## 📦 Verified Artifact Manifest & SHA-256 Checksums

To ensure absolute trust and transparency, verify the cryptographic integrity of these files before running:

| Filename | Purpose | SHA-256 Checksum |
| :--- | :--- | :--- |
| `block_php2shell.conf` | Nginx reverse-proxy 60s edge filter rule | `ac9d45c5c6a26f34078726c890fa90b5541c85a5812b4774d446c604bee12ad2` |
| `disable_upload_progress.ini` | Global `php.ini` memory buffer killswitch | `c0aba8f5166540a0f3f6117fec2e5188c224e4fbbbfe8d0caaf54927402c5617` |
| `audit_server.sh` | Linux/macOS 3-second rapid vulnerability scanner | `596b0c42425dbd284e874af880743ad6e729be9eacf1374241ffe518dc9ff614` |
| `audit_server.ps1` | Windows Server / IIS rapid vulnerability scanner | `501f69f19543a45826884274b3f8333fb92d3d5370fabb41faa3f07a6fd3eee9` |

---

## ⚡ Quick Deployment Guide

### 1. Nginx Reverse-Proxy (Edge Shield - Zero Downtime)
Copy `block_php2shell.conf` to `/etc/nginx/conf.d/` or inside your `server { ... }` block:
```bash
sudo cp block_php2shell.conf /etc/nginx/conf.d/
sudo nginx -t && sudo systemctl reload nginx
```
*Effect*: Kicks out any attacker sending malformed upload progress tags with a `403 Forbidden` before PHP ever allocates memory. Real uploads continue normally.

### 2. php.ini Global Killswitch
Copy `disable_upload_progress.ini` to your PHP FPM `conf.d` directory:
```bash
sudo cp disable_upload_progress.ini /etc/php/8.x/fpm/conf.d/99-shield.ini
sudo systemctl reload php8.x-fpm
```
*Effect*: Disables the unmaintained `session.upload_progress` tracking buffer in memory across all worker processes.

### 3. Rapid Server Audit
Run directly from terminal to verify exposure:
```bash
# Linux / macOS:
bash audit_server.sh

# Windows PowerShell:
powershell -ExecutionPolicy Bypass -File audit_server.ps1
```

---

## 🤝 The Heroic T Ethos
In emergencies, predatory security vendors price-gouge and advise businesses to shut down. The **Heroic Ts** of QT Analytics provide the extinguisher for free. 

For continuous multi-agent perimeter sentry and 24/7 velocity monitoring, visit:  
👉 **[https://qtanalytics.co.uk](https://qtanalytics.co.uk)** • Contact: `emergency@qtanalytics.co.uk`
