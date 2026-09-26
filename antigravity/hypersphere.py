"""
Antigravity Hypersphere Module: AudiClient
Provides asynchronous and synchronous client interface to localhost:8080/audi
telemetry, frequency anchors, and view context manipulation.
"""

import json
import urllib.request
import urllib.parse
import asyncio

class AudiClient:
    """
    Hypersphere Audi Client:
    Communicates with the live Hypersphere Audio/Sync daemon on port 8080.
    """
    def __init__(self, endpoint="http://localhost:8080/audi", timeout=5.0):
        # Normalize localhost to 127.0.0.1 on Windows to bypass IPv6 connection fallback delay
        if "localhost" in endpoint:
            endpoint = endpoint.replace("localhost", "127.0.0.1")
        self.endpoint = endpoint
        self.timeout = timeout

    async def ping(self):
        """
        Asynchronously queries the hypersphere endpoint for state.
        Returns state dictionary with status, norm, anchor_freq, etc.
        """
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self.ping_sync)

    def ping_sync(self):
        """
        Synchronously queries the hypersphere endpoint for state.
        Forces JSON format to ensure machine-readable telemetry.
        """
        url = self.endpoint
        if "?" in url:
            url += "&format=json"
        else:
            url += "?format=json"

        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Antigravity-QuasiAgent/1.0 (QuizAgentCompatible)",
                "Accept": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = resp.read().decode("utf-8")
                return json.loads(data)
        except Exception as e:
            return {
                "status": "OFFLINE",
                "error": str(e),
                "norm": 0.0,
                "phase": 0.0,
                "anchor_freq": "0.000 Hz"
            }

    async def set_view(self, context):
        """Set visual context on the server asynchronously."""
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, self.set_view_sync, context)

    def set_view_sync(self, context):
        """Set visual context on the server synchronously."""
        parsed = urllib.parse.urlparse(self.endpoint)
        base = f"{parsed.scheme}://{parsed.netloc}"
        url = f"{base}/api/set-view?context={urllib.parse.quote(str(context))}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "Antigravity-QuasiAgent/1.0",
                "Accept": "application/json"
            }
        )
        try:
            with urllib.request.urlopen(req, timeout=self.timeout) as resp:
                data = resp.read().decode("utf-8")
                return json.loads(data)
        except Exception as e:
            return {"status": "ERROR", "error": str(e), "context": context}
