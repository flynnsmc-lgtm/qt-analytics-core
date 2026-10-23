#!/usr/bin/env python3
"""
Live Localhost Server for QT Analytics & Chi Core
Serves the complete web portal, ARKM intelligence showcase, and report repository on http://localhost:3000
"""

import sys
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))

class LivePortalHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        clean_path = self.path.split('?')[0].rstrip('/')
        if clean_path in ('', '/'):
            self.path = '/visuals/qt_whiteout_portal.html'
        elif clean_path in ('/emergency', '/shield', '/t-shield', '/t_shield', '/php', '/php2shell'):
            self.path = '/t_shield_emergency.html'
        elif clean_path in ('/qt', '/qtanalytics', '/qt-analytics'):
            self.path = '/qt_analytics.html'
        elif clean_path in ('/crm', '/tracker', '/sales'):
            self.path = '/crm_sales_tracker.html'
        super().do_GET()

    def do_POST(self):
        if self.path.startswith('/api/qt/'):
            import json
            try:
                from qt_analytics_core import GeometricFraudDetector
                detector = GeometricFraudDetector()
                length = int(self.headers.get('Content-Length', 0))
                data = self.rfile.read(length)
                payload = json.loads(data.decode('utf-8')) if data else {}
                assessment = detector.evaluate_transaction(payload)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                resp = {
                    "success": True,
                    "message": "Order Ingested into 24-Hour Forensic Queue via Portal Port 3000",
                    "assessment": assessment
                }
                self.wfile.write(json.dumps(resp, indent=2).encode('utf-8'))
                return
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
                return
        super().do_POST()

def run(port=3000):
    server = ThreadingHTTPServer(('0.0.0.0', port), LivePortalHandler)
    print("==================================================")
    print(f"🚀 QT ANALYTICS & CHI CORE LIVE SERVER ONLINE")
    print(f"==================================================")
    print(f"🌐 Visuals Command Center:   http://localhost:{port}/visuals/")
    print(f"🌐 Primary Localhost Portal: http://localhost:{port}/qt_analytics.html")
    print(f"🌐 Physics Core & PDF Vault: http://localhost:{port}/index.html")
    print(f"🌐 FITZ KSOM Foundation:    http://localhost:{port}/fitz/index.html")
    print(f"📁 Serving Directory:         {BASE_DIR}")
    print("==================================================")
    sys.stdout.flush()
    server.serve_forever()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 3000))
    if len(sys.argv) > 1 and sys.argv[1].isdigit():
        port = int(sys.argv[1])
    run(port)
