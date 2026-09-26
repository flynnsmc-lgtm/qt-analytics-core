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

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        
        # 1. Health Probe
        if parsed.path == "/api/qt/health":
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            resp = {
                "status": "ONLINE",
                "service": "QT Webflow API Bridge",
                "engine": "GeometricFraudDetector v1.0",
                "timestamp_utc": time.strftime("%Y-%m-%d %H:%M:%SZ", time.gmtime()),
                "total_orders_processed": len(ORDER_DATABASE)
            }
            self.wfile.write(json.dumps(resp).encode('utf-8'))
            return

        # 2. Order Status Lookup
        if parsed.path.startswith("/api/qt/status"):
            params = parse_qs(parsed.query)
            order_id = params.get("order_id", [""])[0]
            if not order_id and len(parsed.path.split("/")) > 4:
                order_id = parsed.path.split("/")[4]

            record = ORDER_DATABASE.get(order_id)
            if record:
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": True, "record": record}).encode('utf-8'))
            else:
                self.send_response(404)
                self.send_header('Content-Type', 'application/json')
                self._send_cors_headers()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": f"Order {order_id} not found"}).encode('utf-8'))
            return

        # Default 404
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

    def do_POST(self):
        parsed = urlparse(self.path)
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)

        try:
            payload = json.loads(post_data.decode('utf-8')) if post_data else {}
        except Exception as e:
            self.send_response(400)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps({"success": False, "error": "Invalid JSON payload"}).encode('utf-8'))
            return

        # 1. Intake Webhook (Webflow Form / Stripe Checkout)
        if parsed.path in ["/api/qt/intake", "/api/qt/simulate"]:
            # Auto-assign Order ID if not provided
            if not payload.get("order_id"):
                payload["order_id"] = f"QT-FLASH-{int(time.time()*1000) % 1000000}"

            # Process through Antigravity Core
            assessment = DETECTOR.evaluate_transaction(payload)
            ORDER_DATABASE[assessment["order_id"]] = assessment

            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors_headers()
            self.end_headers()
            
            resp = {
                "success": True,
                "message": "Order Received & Ingested into 24-Hour Forensic Queue",
                "assessment": assessment
            }
            self.wfile.write(json.dumps(resp, indent=2).encode('utf-8'))
            return

        # Default 404
        self.send_response(404)
        self.send_header('Content-Type', 'application/json')
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(json.dumps({"error": "Endpoint not found"}).encode('utf-8'))

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
