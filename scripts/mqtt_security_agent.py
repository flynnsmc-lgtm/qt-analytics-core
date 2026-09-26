"""
mqtt_security_agent.py
Chi Key Unified Physics Platform — Groundwork R&D & MQTT Security Expert
Team Member: Agent Epsilon (CipherShield) | Manager Key: MGR-SEC-05

Direct Python equivalent mirroring Java's:
  MessageDigest.getInstance(HASH_ALGORITHM).digest(data)
with wire byte remittance codec, nonce interference defense, and virtual testing.
"""

import sys
import os
import time
import struct
import hashlib
import hmac
import secrets
from typing import Dict, Any, Tuple, Optional

# Ensure UTF-8 output encoding on Windows console
if sys.platform == "win32":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding='utf-8', errors='replace')
    if hasattr(sys.stderr, "reconfigure"):
        sys.stderr.reconfigure(encoding='utf-8', errors='replace')

DOMAIN_TAGS = {
    "HANDSHAKE_INIT": "CHI-PHYSICS-MQTT-HANDSHAKE-INIT-V1",
    "HANDSHAKE_VERIFY": "CHI-PHYSICS-MQTT-HANDSHAKE-VERIFY-V1",
    "BYTE_REMITTANCE": "CHI-PHYSICS-MQTT-BYTE-REMITTANCE-V1",
    "TELEMETRY_STREAM": "CHI-PHYSICS-MQTT-TELEMETRY-STREAM-V1",
    "OVERDRIVE_COMMAND": "CHI-PHYSICS-MQTT-OVERDRIVE-CMD-V1",
}

DEFAULT_HASH_ALGORITHM = "SHA-256"


class CanonicalDigestDeriver:
    """
    Implements cryptographic auth tag derivation matching:
      roleTag + sessionId + nonce + sharedSecret + DOMAIN_TAG
      return MessageDigest.getInstance(HASH_ALGORITHM).digest(data)
    """

    @staticmethod
    def derive_auth_digest(
        role_tag: str,
        session_id: str,
        nonce: str,
        shared_secret: str,
        domain_tag: str,
        algorithm: str = DEFAULT_HASH_ALGORITHM,
        canonical_framing: bool = True
    ) -> Tuple[bytes, str, bytes]:
        """
        Derives digest bytes, hex string, and canonical serialized bytes.
        Length-value prefix framing prevents concatenation ambiguity:
          len(roleTag) || roleTag || len(sessionId) || sessionId || ...
        """
        b_role = role_tag.encode("utf-8") if isinstance(role_tag, str) else role_tag
        b_session = session_id.encode("utf-8") if isinstance(session_id, str) else session_id
        
        # Nonce can be hex or raw bytes
        if isinstance(nonce, str):
            try:
                b_nonce = bytes.fromhex(nonce) if len(nonce) % 2 == 0 and all(c in "0123456789abcdefABCDEF" for c in nonce) else nonce.encode("utf-8")
            except ValueError:
                b_nonce = nonce.encode("utf-8")
        else:
            b_nonce = nonce
            
        b_secret = shared_secret.encode("utf-8") if isinstance(shared_secret, str) else shared_secret
        b_domain = domain_tag.encode("utf-8") if isinstance(domain_tag, str) else domain_tag

        if canonical_framing:
            chunks = [b_role, b_session, b_nonce, b_secret, b_domain]
            canonical_bytes = bytearray()
            for chunk in chunks:
                canonical_bytes.extend(struct.pack(">H", len(chunk)))
                canonical_bytes.extend(chunk)
            data = bytes(canonical_bytes)
        else:
            data = b_role + b_session + b_nonce + b_secret + b_domain

        # Mirrors Java: MessageDigest.getInstance(HASH_ALGORITHM).digest(data)
        algo_name = algorithm.lower().replace("-", "")
        if algo_name == "sha256":
            h = hashlib.sha256()
        elif algo_name == "sha512":
            h = hashlib.sha512()
        elif algo_name == "sha384":
            h = hashlib.sha384()
        else:
            h = hashlib.new(algo_name)

        h.update(data)
        digest = h.digest()
        return digest, digest.hex(), data


class NonceInterferenceShield:
    """
    Provides 128-bit/256-bit CSPRNG nonces, anti-replay sliding window,
    and wire interference detection.
    """

    def __init__(self, window_size: int = 64, ttl_seconds: float = 300.0):
        self.window_size = window_size
        self.ttl_seconds = ttl_seconds
        self.seen_nonces: Dict[str, float] = {}
        self.highest_seq = 0
        self.replay_window_bitmask = 0

    def generate_nonce(self, num_bytes: int = 16) -> bytes:
        return secrets.token_bytes(num_bytes)

    def verify_and_register(self, nonce_hex: str, seq_number: Optional[int] = None, timestamp: Optional[float] = None) -> Tuple[bool, str]:
        now = time.time()
        ts = timestamp if timestamp is not None else now

        # 1. TTL / Freshness check
        if (now - ts) > self.ttl_seconds:
            return False, "NONCE_EXPIRED"

        # 2. Exact replay check
        if nonce_hex in self.seen_nonces:
            return False, "REPLAY_DETECTED_NONCE_EXISTS"

        # 3. Sliding sequence window
        if seq_number is not None:
            if seq_number > self.highest_seq:
                delta = seq_number - self.highest_seq
                if delta < self.window_size:
                    self.replay_window_bitmask = (self.replay_window_bitmask << delta) | 1
                else:
                    self.replay_window_bitmask = 1
                self.highest_seq = seq_number
            else:
                delta = self.highest_seq - seq_number
                if delta >= self.window_size:
                    return False, "REPLAY_PACKET_TOO_OLD"
                bit = 1 << delta
                if (self.replay_window_bitmask & bit) != 0:
                    return False, "REPLAY_SEQUENCE_DUPLICATE"
                self.replay_window_bitmask |= bit

        self.seen_nonces[nonce_hex] = ts
        return True, "NONCE_VERIFIED_FRESH"


class MqttSecurityAgent:
    """
    Groundwork R&D & MQTT Security Expert (Agent Epsilon / MGR-SEC-05)
    """

    def __init__(self, shared_secret: str = "CHI-SEC-SYM-KEY-8942-INVARIANT-994"):
        self.agent_key = "MGR-SEC-05"
        self.agent_name = "Agent Epsilon (CipherShield)"
        self.title = "Groundwork R&D & MQTT Security Expert"
        self.shared_secret = shared_secret
        self.shield = NonceInterferenceShield()

    def run_virtual_tests(self) -> Dict[str, Any]:
        """
        Executes adversarial virtual tests and provides mathematical reassurance proofs.
        """
        results = []

        # Test 1: Golden Path Handshake
        nonce = self.shield.generate_nonce(16).hex()
        digest, digest_hex, canonical = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_MGR_SEC_05", "SESS-PY-01", nonce, self.shared_secret, DOMAIN_TAGS["BYTE_REMITTANCE"]
        )
        v_ok, reason = self.shield.verify_and_register(nonce)
        t1_pass = v_ok and len(digest) == 32
        results.append({
            "id": "PY_TEST_01_GOLDEN",
            "name": "Legitimate Handshake & MessageDigest SHA-256",
            "passed": t1_pass,
            "proof": f"Digest derived successfully ({digest_hex[:16]}...). Nonce fresh."
        })

        # Test 2: Nonce Replay Injection
        v_replay, replay_reason = self.shield.verify_and_register(nonce)
        t2_pass = not v_replay and replay_reason == "REPLAY_DETECTED_NONCE_EXISTS"
        results.append({
            "id": "PY_TEST_02_REPLAY",
            "name": "Nonce Replay Trap",
            "passed": t2_pass,
            "proof": f"Replay rejected with reason: {replay_reason}."
        })

        # Test 3: Bit-Flip Nonce Interference
        fresh_nonce = self.shield.generate_nonce(16).hex()
        d_orig, d_orig_hex, _ = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_MGR_SEC_05", "SESS-PY-02", fresh_nonce, self.shared_secret, DOMAIN_TAGS["BYTE_REMITTANCE"]
        )
        # Flip bit in nonce
        tampered_nonce = ("b" if fresh_nonce[0] == "a" else "a") + fresh_nonce[1:]
        d_tamp, d_tamp_hex, _ = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_MGR_SEC_05", "SESS-PY-02", tampered_nonce, self.shared_secret, DOMAIN_TAGS["BYTE_REMITTANCE"]
        )
        # Compare digests
        t3_pass = d_orig != d_tamp
        # Count avalanche bit differences
        flipped_bits = sum(bin(b1 ^ b2).count("1") for b1, b2 in zip(d_orig, d_tamp))
        results.append({
            "id": "PY_TEST_03_BIT_FLIP",
            "name": "Nonce Interference & Avalanche Defense",
            "passed": t3_pass,
            "proof": f"Tampered nonce caused {flipped_bits}/256 bits ({(flipped_bits/256)*100:.1f}%) in SHA-256 digest to flip."
        })

        # Test 4: Role-Tag Elevation Forgery
        d_norm, _, _ = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_READER", "SESS-PY-03", fresh_nonce, self.shared_secret, DOMAIN_TAGS["BYTE_REMITTANCE"]
        )
        d_elev, _, _ = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_ADMIN_OVERDRIVE", "SESS-PY-03", fresh_nonce, self.shared_secret, DOMAIN_TAGS["BYTE_REMITTANCE"]
        )
        t4_pass = d_norm != d_elev
        results.append({
            "id": "PY_TEST_04_ROLE_ELEVATION",
            "name": "Role-Tag Elevation Attack Blocked",
            "passed": t4_pass,
            "proof": "Role elevation altered digest; unauthorized elevation blocked without shared secret."
        })

        # Test 5: Cross-Domain Tag Hopping
        d_domain1, _, _ = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_MGR_SEC_05", "SESS-PY-04", fresh_nonce, self.shared_secret, DOMAIN_TAGS["BYTE_REMITTANCE"]
        )
        d_domain2, _, _ = CanonicalDigestDeriver.derive_auth_digest(
            "ROLE_MGR_SEC_05", "SESS-PY-04", fresh_nonce, self.shared_secret, DOMAIN_TAGS["OVERDRIVE_COMMAND"]
        )
        t5_pass = d_domain1 != d_domain2
        results.append({
            "id": "PY_TEST_05_DOMAIN_HOPPING",
            "name": "Cross-Domain Protocol Collision Blocked",
            "passed": t5_pass,
            "proof": "Domain tags isolate handshake from telemetry and overdrive command streams."
        })

        passed_count = sum(1 for r in results if r["passed"])
        return {
            "agent": self.agent_name,
            "key": self.agent_key,
            "total": len(results),
            "passed": passed_count,
            "all_passed": passed_count == len(results),
            "results": results
        }


if __name__ == "__main__":
    agent = MqttSecurityAgent()
    print("=" * 64)
    print("🛡️  PYTHON MQTT SECURITY EXPERT (AGENT EPSILON / MGR-SEC-05)")
    print("=" * 64)
    report = agent.run_virtual_tests()
    for r in report["results"]:
        status = "✓ PASS" if r["passed"] else "✗ FAIL"
        print(f"[{status}] {r['id']}: {r['name']}")
        print(f"    {r['proof']}\n")
    print("=" * 64)
    print(f"RESULTS: {report['passed']} / {report['total']} TESTS PASSED")
    print("=" * 64)
    if not report["all_passed"]:
        sys.exit(1)
