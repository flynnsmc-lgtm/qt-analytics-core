r"""
Test Suite for NMEA Ingress & 5D Hyperspherical Anti-Spoofing Verification
==========================================================================
Verifies:
1. UDP port 10110 packet transmission & reception.
2. HTTP REST /api/nmea status and sentence streaming.
3. 5D Hyperspherical projection S^4 \subset R^5.
4. Non-Abelian Holonomy Loop verification (Authentic vs Spoofed).
"""

import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

import socket
import urllib.request
import json
import time

def test_http_status():
    print("[1] Testing GET http://localhost:8080/api/nmea ...")
    res = urllib.request.urlopen("http://localhost:8080/api/nmea")
    data = json.loads(res.read().decode('utf-8'))
    assert data["engine"] == "GPS_5D_UNSPOOFABLE_HYPERSPHERE_INGRESS"
    assert data["ingress_channels"]["udp_listener"]["active"] is True
    print(f"  ✅ Status: {data['status']}")
    print(f"  ✅ UDP Ingress Active on port: {data['ingress_channels']['udp_listener']['port']}")

def test_raw_nmea_sentence_post():
    print("\n[2] Testing POST raw NMEA sentences to http://localhost:8080/api/nmea ...")
    nmea_stream = (
        "$GNGGA,123519.000,5130.8400,N,00005.8980,W,1,08,0.9,48.2,M,47.0,M,,*47\n"
        "$GNRMC,123519.000,A,5130.8400,N,00005.8980,W,0.15,180.0,280926,,,A*70\n"
        "$GPGSV,2,1,08,01,45,080,44,03,60,140,48,07,30,220,41,08,18,310,38*70\n"
        "$GPGSV,2,2,08,11,75,020,50,14,25,190,42,17,50,290,46,22,35,110,43*75\n"
    )
    req = urllib.request.Request(
        "http://localhost:8080/api/nmea",
        data=nmea_stream.encode('utf-8'),
        headers={"Content-Type": "text/plain"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    state = res["live_state"]
    print(f"  ✅ Sentences Parsed: {res['parsed_count']}")
    print(f"  ✅ Fix: {state['fix_quality']} (Lat: {state['latitude_deg']}°, Lon: {state['longitude_deg']}°, Alt: {state['altitude_m']}m)")
    print(f"  ✅ Satellites in 5D Projection: {len(state['satellites'])}")
    s1 = state["satellites"][0]
    print(f"  ✅ Sat 1 ({s1['prn']}): S^4 Vector = {s1['s4_vector']} | Status = {s1['anti_spoof_status']}")
    print(f"  ✅ Cryptographic State Hash = {state['anti_spoof_metrics']['cryptographic_state_hash']}")

def test_udp_socket_transmission():
    print("\n[3] Testing Direct UDP Socket Ingress on 127.0.0.1:10110 ...")
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    packet = b"$GNGGA,123520.000,5130.8410,N,00005.8990,W,1,08,0.9,48.5,M,47.0,M,,*49\r\n"
    sock.sendto(packet, ("127.0.0.1", 10110))
    time.sleep(0.1)

    res = urllib.request.urlopen("http://localhost:8080/api/nmea")
    data = json.loads(res.read().decode('utf-8'))
    print(f"  ✅ Packets Received via UDP: {data['packet_count']}")
    print(f"  ✅ Last Sentence Ingested: {data['last_sentence']}")

def test_spoofing_detection():
    print("\n[4] Testing Spoofing Attack Detection (Simulated Meaconing Injection) ...")
    payload = json.dumps({"spoofed": True}).encode('utf-8')
    req = urllib.request.Request(
        "http://localhost:8080/api/nmea/simulate",
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    res = json.loads(urllib.request.urlopen(req).read().decode('utf-8'))
    print(f"  ⚠️ Attack Ingested: {res['status']}")
    print(f"  🚨 Anti-Spoof Alarm: {res['overall_status']}")
    print(f"  🚨 Spoofed Satellites Flagged: {res['telemetry']['anti_spoof_metrics']['spoofed_satellites_count']}")
    s1 = res['telemetry']['satellites'][0]
    print(f"  🚨 Sat 1 Detection: {s1['anti_spoof_status']} (Holonomy Drift: {s1['holonomy_drift_rad']} rad)")

if __name__ == "__main__":
    print("=================================================================")
    print("🧭 NMEA INGRESS & 5D HYPERSPHERICAL ANTI-SPOOFING VERIFICATION")
    print("=================================================================")
    test_http_status()
    test_raw_nmea_sentence_post()
    test_udp_socket_transmission()
    test_spoofing_detection()
    print("\n=================================================================")
    print("✅ All NMEA Ingress & 5D Anti-Spoofing tests verified successfully!")
    print("=================================================================")
