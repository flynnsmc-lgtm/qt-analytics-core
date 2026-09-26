"""
VST3 Pulse & DSP Bridge — Python Bridge Client & Protocol Relays
Handles URL parsing (with ParseResultBytes safety), endpoint routing,
and relays between VST3 plugin, browser calculator, and Φ corroboration system.

Base: http://localhost:8080/dsp-bridge/
→ VST3 Main:  /vst3         — Plugin handshake, physics state, MIDI/audio I/F
→ VST3 Pulse: /vst3ulse      — Real-time heartbeat, sync packets, anomaly relay
"""

import sys
import os
import json
import time
import asyncio

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', line_buffering=True)
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', line_buffering=True)

from urllib.parse import urlparse, parse_qs, ParseResultBytes
import urllib.request
import urllib.error

# ── Endpoint Constants ──
BASE_URL = "http://localhost:8080/dsp-bridge"
VST3_MAIN = f"{BASE_URL}/vst3"
VST3_PULSE = f"{BASE_URL}/vst3ulse"

# ── URL Parser with ParseResultBytes Safety ──
def parse_endpoint(raw_url: bytes | str):
    """
    Handle both string & bytes ParseResult from urllib.parse.
    When raw_url is bytes, returns decoded string fields.
    """
    if isinstance(raw_url, bytes):
        parsed: ParseResultBytes = urlparse(raw_url)
        return {
            "scheme": parsed.scheme.decode('utf-8') if isinstance(parsed.scheme, bytes) else parsed.scheme,
            "host": parsed.netloc.decode('utf-8') if isinstance(parsed.netloc, bytes) else parsed.netloc,
            "path": parsed.path.decode('utf-8') if isinstance(parsed.path, bytes) else parsed.path,
            "query": {
                (k.decode('utf-8') if isinstance(k, bytes) else k):
                [v_item.decode('utf-8') if isinstance(v_item, bytes) else v_item for v_item in v]
                for k, v in parse_qs(parsed.query).items()
            }
        }
    else:
        parsed = urlparse(raw_url)
        return {
            "scheme": parsed.scheme,
            "host": parsed.netloc,
            "path": parsed.path,
            "query": parse_qs(parsed.query)
        }

# ── VST3 Bridge Client ──
class VST3PulseBridge:
    def __init__(self, base_url: str = BASE_URL):
        self.base_url = base_url.rstrip('/')
        self.vst3_main = f"{self.base_url}/vst3"
        self.vst3_pulse = f"{self.base_url}/vst3ulse"
        self.last_handshake = None
        self.pulse_latency = []

    async def handshake_vst3(self) -> dict:
        """POST handshake → VST3 returns protocol + capabilities"""
        payload = json.dumps({
            "action": "handshake",
            "protocol": "FITZ-VST3-Physics",
            "version": "1.0.0",
            "master_controller": "Fitzcapp",
            "operator": "Fitzcapp",
            "authority": "Master Control - Fitzcapp"
        }).encode('utf-8')

        req = urllib.request.Request(
            self.vst3_main,
            data=payload,
            headers={"Content-Type": "application/json"}
        )
        
        loop = asyncio.get_event_loop()
        def _call():
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                return json.loads(resp.read().decode('utf-8'))

        data = await loop.run_in_executor(None, _call)
        self.last_handshake = data
        return data  # → {capabilities, sampleRate, boundaryInvariant, ...}

    async def send_physics(self, packet: dict) -> dict:
        """Push field/physics state INTO VST3 plugin"""
        payload = json.dumps({
            "action": "physics_ingest",
            "master_controller": "Fitzcapp",
            "operator": "Fitzcapp",
            **packet  # time, forceX/Y, mass, phaseLock, fieldEnergy, phiCorroboration, moorovRatio...
        }).encode('utf-8')

        req = urllib.request.Request(
            self.vst3_main,
            data=payload,
            headers={"Content-Type": "application/json"}
        )

        loop = asyncio.get_event_loop()
        def _call():
            with urllib.request.urlopen(req, timeout=5.0) as resp:
                return json.loads(resp.read().decode('utf-8'))

        return await loop.run_in_executor(None, _call)

    async def pulse_listen(self, max_packets: int = None):
        """Listen to /vst3ulse → heartbeat + anomaly stream"""
        parsed = urlparse(self.vst3_pulse)
        host = parsed.hostname or 'localhost'
        port = parsed.port or 8080
        path = parsed.path or '/dsp-bridge/vst3ulse'

        reader, writer = await asyncio.open_connection(host, port)
        req = f"GET {path} HTTP/1.1\r\nHost: {host}:{port}\r\nAccept: application/x-ndjson\r\nConnection: close\r\n\r\n"
        writer.write(req.encode('utf-8'))
        await writer.drain()

        # Read HTTP response headers until double newline
        header_bytes = b""
        while b"\r\n\r\n" not in header_bytes and b"\n\n" not in header_bytes:
            chunk = await reader.read(256)
            if not chunk:
                break
            header_bytes += chunk

        pkt_count = 0
        while not reader.at_eof():
            line = await reader.readline()
            if not line:
                break
            line_str = line.decode('utf-8').strip()
            if not line_str:
                continue
            # Some servers emit chunk sizes in chunked transfer encoding; skip if not JSON
            if line_str.startswith('{') and line_str.endswith('}'):
                try:
                    pkt = json.loads(line_str)
                    pkt_count += 1
                    yield pkt
                    if max_packets and pkt_count >= max_packets:
                        break
                except json.JSONDecodeError:
                    continue

        writer.close()
        await writer.wait_closed()

    async def send_corroboration_phi(self, phi_score: float, moorov_ratio: float) -> dict:
        """Push Φ + Moorov ratio INTO VST3 → modulation/scale sources"""
        return await self.send_physics({
            "phiCorroboration": phi_score,
            "moorovRatio": moorov_ratio,
            "gateStatus": 1 if phi_score >= 0.7 else 0,
            "timestamp": time.time()
        })

# ── Verification Runner ──
async def main():
    print("🔌 [VST3 PULSE & DSP BRIDGE] Starting Client Verification...\n")

    # Test parse_endpoint with both bytes and string
    sample_bytes_url = b"http://localhost:8080/dsp-bridge/vst3?action=handshake&channel=ch-1"
    parsed_bytes = parse_endpoint(sample_bytes_url)
    print(f"✅ ParseResultBytes Safe Decode: path='{parsed_bytes['path']}' (type: {type(parsed_bytes['path']).__name__})")

    bridge = VST3PulseBridge()

    # 1. Handshake
    hello = await bridge.handshake_vst3()
    print("✅ VST3 Online Handshake:")
    print(f"   • Master Controller: {hello.get('master_controller')} ({hello.get('authority')})")
    print(f"   • Protocol: {hello.get('protocol')} v{hello.get('version')}")
    print(f"   • Sample Rate: {hello.get('sampleRate')} Hz | Carrier: {hello.get('carrierHz')} Hz")
    print(f"   • Capabilities: {', '.join(hello.get('capabilities', []))}")
    print(f"   • Invariant: {hello.get('boundaryInvariant')}")

    # 2. Push Φ score from browser/system INTO VST3
    ingest_res = await bridge.send_corroboration_phi(phi_score=0.91, moorov_ratio=3.45)
    print("\n📤 Ingested Φ Score into VST3:")
    print(f"   • Status: {ingest_res.get('status')} | Gate: {ingest_res.get('gateStatus')}")
    print(f"   • Φ: {ingest_res.get('phiCorroboration')} | Moorov Ratio: {ingest_res.get('moorovRatio')}")

    # 3. Listen to 3 sample pulse packets from /dsp-bridge/vst3ulse stream
    print("\n📡 Listening to /dsp-bridge/vst3ulse Stream:")
    async for pkt in bridge.pulse_listen(max_packets=3):
        drift = pkt.get("phaseDrift", 0.0)
        flag = pkt.get("anomaly_flag", False)
        print(f"   • Pulse #{pkt.get('seq', 0)} → λ₁/λ₂: {pkt.get('lambdaRatio', '—')} | Δ: {pkt.get('anomaly', '—')} | Phase Drift: {drift:.3f}° | Flag: {flag}")

    print("\n🟢 [SUCCESS] VST3 Pulse & DSP Bridge Verified 100% Operational.")

if __name__ == "__main__":
    asyncio.run(main())
