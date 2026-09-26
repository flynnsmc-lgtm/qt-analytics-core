"""
Antigravity Hypersphere Visual UI Server
Serves the 3D/4D visual interface on port 8082 (or specified port).
Connected to Hypersphere audio/state backend at http://localhost:8080/audi
"""

import sys
import os
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
UI_DIR = os.path.join(BASE_DIR, "visuals", "hypersphere-ui")

class VisualUIHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=UI_DIR, **kwargs)

    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        super().end_headers()

def run_visual_server(port=8082):
    if not os.path.exists(UI_DIR):
        print(f"❌ Error: UI directory does not exist at {UI_DIR}")
        sys.exit(1)

    server = ThreadingHTTPServer(('0.0.0.0', port), VisualUIHandler)
    print(f"==============================================")
    print(f"🎨 HYPERSPHERE VISUAL UI SERVER ONLINE")
    print(f"==============================================")
    print(f"🌐 Visual UI URL: http://localhost:{port}")
    print(f"🔗 Telemetry Backend: http://localhost:8080/audi")
    print(f"📁 Serving Directory: {UI_DIR}")
    print(f"==============================================")
    sys.stdout.flush()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n[VISUAL UI SERVER] Stopping server.")
        server.server_close()

if __name__ == "__main__":
    port = 8082
    if len(sys.argv) > 1:
        for arg in sys.argv[1:]:
            if arg.startswith('--port='):
                port = int(arg.split('=')[1])
            elif arg.isdigit():
                port = int(arg)
    run_visual_server(port)
