/**
 * mqtt_security_agent.js
 * 
 * Chi Key Unified Physics Platform — Groundwork R&D & MQTT Security Expert
 * Team Member: Agent Epsilon (CipherShield) | Manager Key: MGR-SEC-05
 * 
 * Core Capabilities:
 * 1. MQTT Wire Byte Remittance & Framing (MQTT 3.1.1 / 5.0 AUTH packet 0xF0).
 * 2. Nonce Interference & Anti-Replay Sliding Window Engine.
 * 3. Canonical Key & Auth Tag Derivation:
 *    roleTag + sessionId + nonce + sharedSecret + DOMAIN_TAG
 *    -> MessageDigest.getInstance(HASH_ALGORITHM).digest(data)
 * 4. Virtual Adversary Testing & Mathematical Reassurance Harness.
 */

const crypto = require('crypto');

// -----------------------------------------------------------------------------
// 1. CONSTANTS & DOMAIN SEPARATION TAGS
// -----------------------------------------------------------------------------
const DOMAIN_TAGS = {
  HANDSHAKE_INIT: 'CHI-PHYSICS-MQTT-HANDSHAKE-INIT-V1',
  HANDSHAKE_VERIFY: 'CHI-PHYSICS-MQTT-HANDSHAKE-VERIFY-V1',
  BYTE_REMITTANCE: 'CHI-PHYSICS-MQTT-BYTE-REMITTANCE-V1',
  TELEMETRY_STREAM: 'CHI-PHYSICS-MQTT-TELEMETRY-STREAM-V1',
  OVERDRIVE_COMMAND: 'CHI-PHYSICS-MQTT-OVERDRIVE-CMD-V1'
};

const DEFAULT_HASH_ALGORITHM = 'SHA-256'; // Java parity: MessageDigest.getInstance("SHA-256")

// -----------------------------------------------------------------------------
// 2. CANONICAL DIGEST DERIVER (MessageDigest Parity & Anti-Extension Framing)
// -----------------------------------------------------------------------------
class CanonicalDigestDeriver {
  /**
   * Derives cryptographic digest for authentication tag.
   * Matches formula:
   *   data = Canonical(roleTag + sessionId + nonce + sharedSecret + DOMAIN_TAG)
   *   return MessageDigest.getInstance(HASH_ALGORITHM).digest(data)
   * 
   * @param {string|Buffer} roleTag - Assigned capability/role (e.g., "ROLE_MGR_SEC_05")
   * @param {string|Buffer} sessionId - Unique transport session identifier
   * @param {string|Buffer} nonce - Fresh CSPRNG nonce (hex or raw bytes)
   * @param {string|Buffer} sharedSecret - Pre-shared key or ephemeral session secret
   * @param {string} domainTag - Protocol domain separator (from DOMAIN_TAGS)
   * @param {string} algorithm - Hash algorithm ("SHA-256", "SHA-384", "SHA-512")
   * @param {boolean} canonicalFraming - If true, uses length-prefixed encoding to prevent concatenation injection
   * @returns {{ digest: Buffer, hex: string, canonicalBytes: Buffer }}
   */
  static deriveAuthDigest(roleTag, sessionId, nonce, sharedSecret, domainTag, algorithm = DEFAULT_HASH_ALGORITHM, canonicalFraming = true) {
    const bRole = Buffer.isBuffer(roleTag) ? roleTag : Buffer.from(String(roleTag), 'utf8');
    const bSession = Buffer.isBuffer(sessionId) ? sessionId : Buffer.from(String(sessionId), 'utf8');
    const bNonce = Buffer.isBuffer(nonce) ? nonce : (typeof nonce === 'string' && /^[0-9a-fA-F]+$/.test(nonce) ? Buffer.from(nonce, 'hex') : Buffer.from(String(nonce), 'utf8'));
    const bSecret = Buffer.isBuffer(sharedSecret) ? sharedSecret : Buffer.from(String(sharedSecret), 'utf8');
    const bDomain = Buffer.isBuffer(domainTag) ? domainTag : Buffer.from(String(domainTag), 'utf8');

    let canonicalBytes;
    if (canonicalFraming) {
      // Length-Value Prefix Framing: [2-byte big endian len][value]
      // Mathematically eliminates collision: "ab" + "c" vs "a" + "bc"
      const chunks = [bRole, bSession, bNonce, bSecret, bDomain];
      const buffers = [];
      for (const chunk of chunks) {
        const lenBuf = Buffer.alloc(2);
        lenBuf.writeUInt16BE(chunk.length, 0);
        buffers.push(lenBuf, chunk);
      }
      canonicalBytes = Buffer.concat(buffers);
    } else {
      // Raw byte concatenation (legacy / basic form)
      canonicalBytes = Buffer.concat([bRole, bSession, bNonce, bSecret, bDomain]);
    }

    // Java equivalent: MessageDigest.getInstance(HASH_ALGORITHM).digest(data)
    const hash = crypto.createHash(algorithm.toLowerCase().replace('-', ''));
    hash.update(canonicalBytes);
    const digest = hash.digest();

    return {
      digest,
      hex: digest.toString('hex'),
      canonicalBytes
    };
  }

  /**
   * Constant-time comparison to prevent timing attacks.
   */
  static constantTimeEquals(bufA, bufB) {
    if (!Buffer.isBuffer(bufA) || !Buffer.isBuffer(bufB)) return false;
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  }
}

// -----------------------------------------------------------------------------
// 3. NONCE INTERFERENCE & REPLAY SHIELD
// -----------------------------------------------------------------------------
class NonceInterferenceShield {
  constructor(windowSize = 64, ttlMs = 300000) {
    this.windowSize = windowSize; // 64-packet sliding window bitmask
    this.ttlMs = ttlMs;           // 5-minute nonce freshness window
    this.seenNonces = new Map();  // nonceHex -> timestamp
    this.highestSeq = 0;
    this.replayWindowBitmask = BigInt(0);
    this.stats = {
      generated: 0,
      verified: 0,
      replaysBlocked: 0,
      tamperingDetected: 0,
      expiredDropped: 0
    };
  }

  /**
   * Generates a fresh cryptographically secure random nonce.
   * Entropy: 128 bits (16 bytes) or 256 bits (32 bytes).
   */
  generateNonce(byteLength = 16) {
    const nonceBuf = crypto.randomBytes(byteLength);
    this.stats.generated++;
    return nonceBuf;
  }

  /**
   * Verifies nonce freshness, checks against replay window, and registers nonce.
   */
  verifyAndRegister(nonceHex, seqNumber = null, timestamp = Date.now()) {
    const now = Date.now();

    // 1. Freshness / TTL check
    if (now - timestamp > this.ttlMs) {
      this.stats.expiredDropped++;
      return { valid: false, reason: 'NONCE_EXPIRED', ageMs: now - timestamp };
    }

    // 2. Exact nonce reuse / collision check
    if (this.seenNonces.has(nonceHex)) {
      this.stats.replaysBlocked++;
      return { valid: false, reason: 'REPLAY_DETECTED_NONCE_EXISTS', firstSeen: this.seenNonces.get(nonceHex) };
    }

    // 3. Sliding window sequence check (if sequence number provided)
    if (seqNumber !== null) {
      if (seqNumber > this.highestSeq) {
        const delta = seqNumber - this.highestSeq;
        if (delta < this.windowSize) {
          this.replayWindowBitmask = (this.replayWindowBitmask << BigInt(delta)) | BigInt(1);
        } else {
          this.replayWindowBitmask = BigInt(1);
        }
        this.highestSeq = seqNumber;
      } else {
        const delta = this.highestSeq - seqNumber;
        if (delta >= this.windowSize) {
          this.stats.replaysBlocked++;
          return { valid: false, reason: 'REPLAY_PACKET_TOO_OLD', delta };
        }
        const bit = BigInt(1) << BigInt(delta);
        if ((this.replayWindowBitmask & bit) !== BigInt(0)) {
          this.stats.replaysBlocked++;
          return { valid: false, reason: 'REPLAY_SEQUENCE_DUPLICATE', seqNumber };
        }
        this.replayWindowBitmask |= bit;
      }
    }

    // Register nonce
    this.seenNonces.set(nonceHex, timestamp);
    this.stats.verified++;

    // Periodic sweep of expired nonces
    if (this.seenNonces.size > 2000) {
      for (const [n, t] of this.seenNonces.entries()) {
        if (now - t > this.ttlMs) this.seenNonces.delete(n);
      }
    }

    return { valid: true, reason: 'NONCE_VERIFIED_FRESH' };
  }

  /**
   * Quantifies bit-level tampering between two nonces (Hamming distance & avalanche measure).
   */
  static analyzeBitDifference(nonceA, nonceB) {
    const bufA = Buffer.isBuffer(nonceA) ? nonceA : Buffer.from(nonceA, 'hex');
    const bufB = Buffer.isBuffer(nonceB) ? nonceB : Buffer.from(nonceB, 'hex');
    const len = Math.min(bufA.length, bufB.length);
    let flippedBits = 0;
    for (let i = 0; i < len; i++) {
      let xor = bufA[i] ^ bufB[i];
      while (xor > 0) {
        flippedBits += (xor & 1);
        xor >>= 1;
      }
    }
    const totalBits = len * 8;
    return {
      flippedBits,
      totalBits,
      percentage: ((flippedBits / totalBits) * 100).toFixed(2) + '%'
    };
  }
}

// -----------------------------------------------------------------------------
// 4. MQTT BYTE REMITTANCE CODEC (Fixed & Variable Headers + AUTH Packet 0xF0)
// -----------------------------------------------------------------------------
class MqttByteRemittanceCodec {
  /**
   * Encodes variable-length integer per MQTT 5.0 / 3.1.1 spec (section 1.5.5).
   */
  static encodeRemainingLength(length) {
    const bytes = [];
    let x = length;
    do {
      let encodedByte = x % 128;
      x = Math.floor(x / 128);
      if (x > 0) {
        encodedByte |= 128;
      }
      bytes.push(encodedByte);
    } while (x > 0);
    return Buffer.from(bytes);
  }

  /**
   * Decodes variable-length integer per MQTT spec.
   */
  static decodeRemainingLength(buffer, offset = 1) {
    let multiplier = 1;
    let value = 0;
    let bytesRead = 0;
    let digit;

    do {
      if (offset + bytesRead >= buffer.length) {
        throw new Error('MALFORMED_REMAINING_LENGTH_UNDERFLOW');
      }
      digit = buffer[offset + bytesRead];
      value += (digit & 127) * multiplier;
      multiplier *= 128;
      bytesRead++;
      if (multiplier > 128 * 128 * 128) {
        throw new Error('MALFORMED_REMAINING_LENGTH_OVERFLOW');
      }
    } while ((digit & 128) !== 0);

    return { value, bytesRead };
  }

  /**
   * Assembles an MQTT 5.0 AUTH packet (Control Packet Type 15 = 0xF0)
   * containing byte remittance authentication data.
   * 
   * Wire Layout:
   * [1 byte]  0xF0 (AUTH packet, flags = 0000)
   * [1-4 byte] Remaining Length
   * [1 byte]  Authenticate Reason Code (0x18 = Continue authentication, 0x00 = Success)
   * [VarInt]  Property Length
   * [Properties]:
   *   - 0x15 (Authentication Method): UTF-8 String "CHI-PHYSICS-SEC-V1"
   *   - 0x16 (Authentication Data): Binary Data (Remittance Payload)
   * 
   * @param {object} remittance - { roleTag, sessionId, nonceHex, authDigestHex, domainTag }
   * @param {number} reasonCode - 0x18 (Continue) or 0x00 (Success)
   * @returns {Buffer} Raw MQTT wire bytes
   */
  static assembleMqttAuthRemittancePacket(remittance, reasonCode = 0x18) {
    const authMethod = 'CHI-PHYSICS-SEC-V1';
    const bAuthMethod = Buffer.from(authMethod, 'utf8');

    // Pack remittance payload as binary authentication data
    // Remittance JSON string or canonical binary
    const remittanceJson = JSON.stringify({
      role: remittance.roleTag,
      sid: remittance.sessionId,
      nonce: remittance.nonceHex,
      digest: remittance.authDigestHex,
      domain: remittance.domainTag,
      ts: remittance.timestamp || Date.now()
    });
    const bAuthData = Buffer.from(remittanceJson, 'utf8');

    // Build Properties Buffer
    const propBuffers = [];
    // Property 0x15: Auth Method (2-byte string length + string)
    propBuffers.push(Buffer.from([0x15]));
    const lenMethod = Buffer.alloc(2);
    lenMethod.writeUInt16BE(bAuthMethod.length, 0);
    propBuffers.push(lenMethod, bAuthMethod);

    // Property 0x16: Auth Data (2-byte binary length + binary data)
    propBuffers.push(Buffer.from([0x16]));
    const lenData = Buffer.alloc(2);
    lenData.writeUInt16BE(bAuthData.length, 0);
    propBuffers.push(lenData, bAuthData);

    const propertiesBuf = Buffer.concat(propBuffers);
    const propLengthEncoded = this.encodeRemainingLength(propertiesBuf.length);

    // Variable Header
    const variableHeader = Buffer.concat([
      Buffer.from([reasonCode]),
      propLengthEncoded,
      propertiesBuf
    ]);

    // Fixed Header: 0xF0 + Remaining Length
    const remainingLengthEncoded = this.encodeRemainingLength(variableHeader.length);
    const fixedHeader = Buffer.concat([
      Buffer.from([0xF0]),
      remainingLengthEncoded
    ]);

    return Buffer.concat([fixedHeader, variableHeader]);
  }

  /**
   * Disassembles and parses an incoming MQTT AUTH packet byte remittance.
   */
  static disassembleMqttAuthRemittancePacket(wireBuffer) {
    if (!wireBuffer || wireBuffer.length < 2) {
      throw new Error('PACKET_TOO_SHORT');
    }
    const packetType = (wireBuffer[0] >> 4) & 0x0F;
    if (packetType !== 15) { // 15 = 0xF0 = AUTH
      throw new Error(`INVALID_PACKET_TYPE_EXPECTED_AUTH_GOT_${packetType}`);
    }

    const { value: remainingLength, bytesRead: remLenBytes } = this.decodeRemainingLength(wireBuffer, 1);
    const headerOffset = 1 + remLenBytes;

    if (wireBuffer.length < headerOffset + remainingLength) {
      throw new Error('CORRUPTED_WIRE_FRAME_TRUNCATED_PAYLOAD');
    }

    const reasonCode = wireBuffer[headerOffset];
    const { value: propLength, bytesRead: propLenBytes } = this.decodeRemainingLength(wireBuffer, headerOffset + 1);
    const propStart = headerOffset + 1 + propLenBytes;
    const propEnd = propStart + propLength;

    let authMethod = '';
    let authDataBuffer = null;

    let cursor = propStart;
    while (cursor < propEnd) {
      const propId = wireBuffer[cursor++];
      if (propId === 0x15) { // Auth Method
        const strLen = wireBuffer.readUInt16BE(cursor);
        cursor += 2;
        authMethod = wireBuffer.slice(cursor, cursor + strLen).toString('utf8');
        cursor += strLen;
      } else if (propId === 0x16) { // Auth Data
        const binLen = wireBuffer.readUInt16BE(cursor);
        cursor += 2;
        authDataBuffer = wireBuffer.slice(cursor, cursor + binLen);
        cursor += binLen;
      } else {
        // Unknown property
        break;
      }
    }

    let parsedPayload = null;
    if (authDataBuffer) {
      try {
        parsedPayload = JSON.parse(authDataBuffer.toString('utf8'));
      } catch (e) {
        throw new Error('INVALID_AUTH_DATA_SERIALIZATION');
      }
    }

    return {
      packetType: 'AUTH',
      reasonCode,
      reasonCodeDesc: reasonCode === 0x00 ? 'SUCCESS' : (reasonCode === 0x18 ? 'CONTINUE_AUTHENTICATION' : `CODE_0x${reasonCode.toString(16)}`),
      remainingLength,
      authMethod,
      authDataBuffer,
      remittance: parsedPayload
    };
  }
}

// -----------------------------------------------------------------------------
// 5. SECURITY AGENT VIRTUAL ATTACK SIMULATOR & REASSURANCE ENGINE
// -----------------------------------------------------------------------------
class MqttSecurityAgent {
  constructor(sharedSecret = 'CHI-SEC-SYM-KEY-8942-INVARIANT-994') {
    this.agentKey = 'MGR-SEC-05';
    this.agentName = 'Agent Epsilon (CipherShield)';
    this.title = 'Groundwork R&D & MQTT Security Expert';
    this.sharedSecret = sharedSecret;
    this.shield = new NonceInterferenceShield();
  }

  /**
   * Generates a fully formed, cryptographically signed MQTT byte remittance.
   */
  createRemittance(roleTag = 'ROLE_MGR_SEC_05', sessionId = 'SESS-202609-CHI-01', domainTag = DOMAIN_TAGS.BYTE_REMITTANCE) {
    const nonce = this.shield.generateNonce(16);
    const nonceHex = nonce.toString('hex');

    const { digest, hex: authDigestHex, canonicalBytes } = CanonicalDigestDeriver.deriveAuthDigest(
      roleTag,
      sessionId,
      nonceHex,
      this.sharedSecret,
      domainTag,
      DEFAULT_HASH_ALGORITHM,
      true
    );

    const remittance = {
      roleTag,
      sessionId,
      nonceHex,
      authDigestHex,
      domainTag,
      timestamp: Date.now()
    };

    const wireBytes = MqttByteRemittanceCodec.assembleMqttAuthRemittancePacket(remittance, 0x18);

    return {
      remittance,
      canonicalBytes,
      authDigestHex,
      wireBytes,
      wireHex: wireBytes.toString('hex')
    };
  }

  /**
   * Verifies an incoming wire buffer against all security invariant gates:
   * 1. Wire Framing integrity.
   * 2. Nonce interference & replay protection.
   * 3. Domain separation tag validation.
   * 4. Cryptographic digest verification (MessageDigest SHA-256).
   */
  verifyIncomingWireRemittance(wireBytes, expectedDomain = DOMAIN_TAGS.BYTE_REMITTANCE) {
    const auditLog = [];

    // Gate 1: Wire framing & disassembly
    let disassembled;
    try {
      disassembled = MqttByteRemittanceCodec.disassembleMqttAuthRemittancePacket(wireBytes);
      auditLog.push({ gate: 'GATE_1_WIRE_FRAMING', status: 'PASS', detail: `Valid MQTT AUTH packet (0xF0), RemainingLength=${disassembled.remainingLength}` });
    } catch (err) {
      return {
        verified: false,
        breachReason: `WIRE_CORRUPTION: ${err.message}`,
        auditLog,
        gateFailed: 1
      };
    }

    const { remittance } = disassembled;
    if (!remittance) {
      return { verified: false, breachReason: 'MISSING_REMITTANCE_DATA', auditLog, gateFailed: 1 };
    }

    // Gate 2: Domain Tag verification
    if (remittance.domain !== expectedDomain) {
      auditLog.push({ gate: 'GATE_2_DOMAIN_TAG', status: 'FAIL', detail: `Expected ${expectedDomain}, got ${remittance.domain}` });
      return {
        verified: false,
        breachReason: 'CROSS_DOMAIN_COLLISION_BLOCKED: Domain tag mismatch',
        auditLog,
        gateFailed: 2
      };
    }
    auditLog.push({ gate: 'GATE_2_DOMAIN_TAG', status: 'PASS', detail: `Domain tag confirmed: ${remittance.domain}` });

    // Gate 3: Nonce interference & anti-replay
    const nonceCheck = this.shield.verifyAndRegister(remittance.nonce, null, remittance.ts);
    if (!nonceCheck.valid) {
      auditLog.push({ gate: 'GATE_3_NONCE_SHIELD', status: 'FAIL', detail: `Nonce rejection: ${nonceCheck.reason}` });
      return {
        verified: false,
        breachReason: `NONCE_INTERFERENCE_OR_REPLAY: ${nonceCheck.reason}`,
        auditLog,
        gateFailed: 3
      };
    }
    auditLog.push({ gate: 'GATE_3_NONCE_SHIELD', status: 'PASS', detail: `Nonce freshness verified, replay window updated` });

    // Gate 4: Cryptographic Auth Tag verification (MessageDigest.getInstance("SHA-256").digest(data))
    const expected = CanonicalDigestDeriver.deriveAuthDigest(
      remittance.role,
      remittance.sid,
      remittance.nonce,
      this.sharedSecret,
      remittance.domain,
      DEFAULT_HASH_ALGORITHM,
      true
    );

    const receivedDigestBuf = Buffer.from(remittance.digest, 'hex');
    const isDigestValid = CanonicalDigestDeriver.constantTimeEquals(receivedDigestBuf, expected.digest);

    if (!isDigestValid) {
      auditLog.push({ gate: 'GATE_4_AUTH_DIGEST', status: 'FAIL', detail: `Digest mismatch: expected ${expected.hex.slice(0, 16)}..., received ${remittance.digest.slice(0, 16)}...` });
      return {
        verified: false,
        breachReason: 'CRYPTOGRAPHIC_TAG_MISMATCH: Payload or roleTag tampered on wire',
        auditLog,
        gateFailed: 4
      };
    }

    auditLog.push({ gate: 'GATE_4_AUTH_DIGEST', status: 'PASS', detail: `MessageDigest SHA-256 verified bit-for-bit (${expected.hex.slice(0, 16)}...)` });

    return {
      verified: true,
      remittance,
      auditLog,
      authDigestHex: expected.hex
    };
  }

  /**
   * Runs the 6-part Adversarial Virtual Testing Suite.
   * Used to reassure the user through empirical, mathematical simulation.
   */
  runVirtualTestingSuite() {
    const results = [];

    // Test 1: Golden Path Handshake
    const golden = this.createRemittance('ROLE_MGR_SEC_05', 'SESS-GOLDEN-01', DOMAIN_TAGS.BYTE_REMITTANCE);
    const res1 = this.verifyIncomingWireRemittance(golden.wireBytes, DOMAIN_TAGS.BYTE_REMITTANCE);
    results.push({
      testId: 'TEST_01_GOLDEN_PATH',
      name: 'Legitimate Handshake & Byte Remittance',
      expected: 'PASS',
      actual: res1.verified ? 'PASS' : 'FAIL',
      passed: res1.verified === true,
      explanation: 'Verifies exact MessageDigest SHA-256 derivation and MQTT 5.0 AUTH packet framing.'
    });

    // Test 2: Nonce Replay Attack
    // Replay the exact same packet with the identical nonce
    const res2 = this.verifyIncomingWireRemittance(golden.wireBytes, DOMAIN_TAGS.BYTE_REMITTANCE);
    results.push({
      testId: 'TEST_02_NONCE_REPLAY',
      name: 'Nonce Replay Attack Injection',
      expected: 'BLOCKED',
      actual: !res2.verified && res2.gateFailed === 3 ? 'BLOCKED' : 'FAILED',
      passed: !res2.verified && res2.gateFailed === 3,
      explanation: 'Attacker resubmits a previously captured valid packet. NonceInterferenceShield traps identical nonce and rejects.'
    });

    // Test 3: Nonce Tampering / Bit-Flip Interference
    const fresh = this.createRemittance('ROLE_MGR_SEC_05', 'SESS-TAMPER-01', DOMAIN_TAGS.BYTE_REMITTANCE);
    // Flip bit 0 in byte 2 of the nonce inside the remittance
    const tamperedRemittance = { ...fresh.remittance };
    const nonceChars = tamperedRemittance.nonceHex.split('');
    nonceChars[4] = nonceChars[4] === 'a' ? 'b' : 'a'; // 1-character hex tamper
    tamperedRemittance.nonceHex = nonceChars.join('');
    const tamperedWire = MqttByteRemittanceCodec.assembleMqttAuthRemittancePacket(tamperedRemittance, 0x18);

    const res3 = this.verifyIncomingWireRemittance(tamperedWire, DOMAIN_TAGS.BYTE_REMITTANCE);
    results.push({
      testId: 'TEST_03_NONCE_BIT_FLIP',
      name: 'Nonce Interference (Wire Bit-Flip)',
      expected: 'BLOCKED',
      actual: !res3.verified && res3.gateFailed === 4 ? 'BLOCKED' : 'FAILED',
      passed: !res3.verified && res3.gateFailed === 4,
      explanation: 'Attacker flips 1 bit in the wire nonce. SHA-256 avalanche effect flips ~50% of digest bits; tag verification fails.'
    });

    // Test 4: Role-Tag Elevation Forgery
    const unprivileged = this.createRemittance('ROLE_READONLY_OBSERVER', 'SESS-ELEV-01', DOMAIN_TAGS.BYTE_REMITTANCE);
    // Attacker alters role tag in packet to ADMIN_OVERDRIVE without knowing shared secret
    const elevatedRemittance = { ...unprivileged.remittance, roleTag: 'ROLE_ADMIN_OVERDRIVE' };
    const elevatedWire = MqttByteRemittanceCodec.assembleMqttAuthRemittancePacket(elevatedRemittance, 0x18);

    const res4 = this.verifyIncomingWireRemittance(elevatedWire, DOMAIN_TAGS.BYTE_REMITTANCE);
    results.push({
      testId: 'TEST_04_ROLE_ELEVATION',
      name: 'Role-Tag Elevation Attack',
      expected: 'BLOCKED',
      actual: !res4.verified && res4.gateFailed === 4 ? 'BLOCKED' : 'FAILED',
      passed: !res4.verified && res4.gateFailed === 4,
      explanation: 'Attacker attempts to elevate roleTag to ADMIN. Because roleTag is bound into the digest, forging it triggers tag mismatch.'
    });

    // Test 5: Cross-Domain Tag Hopping
    const crossDomain = this.createRemittance('ROLE_MGR_SEC_05', 'SESS-CROSS-01', DOMAIN_TAGS.BYTE_REMITTANCE);
    // Attempt to remit this packet on the OVERDRIVE_COMMAND domain
    const res5 = this.verifyIncomingWireRemittance(crossDomain.wireBytes, DOMAIN_TAGS.OVERDRIVE_COMMAND);
    results.push({
      testId: 'TEST_05_DOMAIN_HOPPING',
      name: 'Cross-Domain Collision Attack',
      expected: 'BLOCKED',
      actual: !res5.verified && res5.gateFailed === 2 ? 'BLOCKED' : 'FAILED',
      passed: !res5.verified && res5.gateFailed === 2,
      explanation: 'Attacker captures a valid handshake remittance and attempts to use it on an administrative control channel. Blocked by DOMAIN_TAG.'
    });

    // Test 6: Wire Truncation / Framing Fuzzing
    const validPacket = this.createRemittance('ROLE_MGR_SEC_05', 'SESS-FUZZ-01', DOMAIN_TAGS.BYTE_REMITTANCE);
    // Truncate last 12 bytes
    const truncatedWire = validPacket.wireBytes.slice(0, validPacket.wireBytes.length - 12);
    const res6 = this.verifyIncomingWireRemittance(truncatedWire, DOMAIN_TAGS.BYTE_REMITTANCE);
    results.push({
      testId: 'TEST_06_WIRE_TRUNCATION',
      name: 'Wire Truncation & Buffer Underflow Fuzzing',
      expected: 'BLOCKED',
      actual: !res6.verified && res6.gateFailed === 1 ? 'BLOCKED' : 'FAILED',
      passed: !res6.verified && res6.gateFailed === 1,
      explanation: 'Attacker intentionally truncates or corrupts packet boundaries. Codec safely traps buffer underflow without leaking memory.'
    });

    const passedCount = results.filter(r => r.passed).length;
    return {
      suite: 'MQTT_SECURITY_AGENT_VIRTUAL_TESTING_SUITE',
      agent: this.agentName,
      mgrKey: this.agentKey,
      total: results.length,
      passedCount,
      allPassed: passedCount === results.length,
      results
    };
  }
}

// -----------------------------------------------------------------------------
// 6. EXPORTS & CLI RUNNER
// -----------------------------------------------------------------------------
module.exports = {
  MqttSecurityAgent,
  CanonicalDigestDeriver,
  NonceInterferenceShield,
  MqttByteRemittanceCodec,
  DOMAIN_TAGS,
  DEFAULT_HASH_ALGORITHM
};

if (require.main === module) {
  console.log('================================================================');
  console.log('🛡️  MQTT SECURITY AGENT (AGENT EPSILON / MGR-SEC-05) VIRTUAL SUITE');
  console.log('================================================================\n');

  const agent = new MqttSecurityAgent();
  const report = agent.runVirtualTestingSuite();

  report.results.forEach((r, idx) => {
    const icon = r.passed ? '✓' : '✗';
    console.log(`[${icon}] ${r.testId}: ${r.name}`);
    console.log(`    Expected: ${r.expected} | Actual: ${r.actual}`);
    console.log(`    Proof: ${r.explanation}\n`);
  });

  console.log(`================================================================`);
  console.log(`📊 FINAL RESULT: ${report.passedCount} / ${report.total} VIRTUAL TESTS PASSED (${((report.passedCount/report.total)*100).toFixed(1)}%)`);
  console.log(`================================================================`);

  if (!report.allPassed) process.exit(1);
}
