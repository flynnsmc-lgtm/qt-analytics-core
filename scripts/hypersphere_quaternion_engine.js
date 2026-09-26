/**
 * scripts/hypersphere_quaternion_engine.js
 * ================================================================================
 * ANTIGRAVITY HYPERSPHERE QUATERNION & MATRIX MULTIPLICATION ENGINE (JS)
 * Phase 3 & Phase 4 Implementation: Non-Commutative SO(3) Stack & Schumann Lock
 * Hash: #CK-AG-HYPERSPHERE-PHASE3-4 | Norm Target: 100.0
 * ================================================================================
 */

class UnitQuaternion {
  constructor(w = 1.0, x = 0.0, y = 0.0, z = 0.0) {
    const mag = Math.sqrt(w * w + x * x + y * y + z * z);
    if (mag < 1e-15) {
      throw new Error("Zero quaternion cannot be normalized into unit sphere S³.");
    }
    this.w = w / mag;
    this.x = x / mag;
    this.y = y / mag;
    this.z = z / mag;
  }

  static fromAxisAngle(axis, angleRad) {
    const [ax, ay, az] = axis;
    const norm = Math.sqrt(ax * ax + ay * ay + az * az);
    if (norm < 1e-15) return new UnitQuaternion(1.0, 0.0, 0.0, 0.0);
    const half = angleRad * 0.5;
    const sinH = Math.sin(half);
    return new UnitQuaternion(
      Math.cos(half),
      (ax / norm) * sinH,
      (ay / norm) * sinH,
      (az / norm) * sinH
    );
  }

  // Hamilton product q1 ⊗ q2 (strictly non-commutative)
  multiply(other) {
    const w1 = this.w, x1 = this.x, y1 = this.y, z1 = this.z;
    const w2 = other.w, x2 = other.x, y2 = other.y, z2 = other.z;
    return new UnitQuaternion(
      w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
      w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
      w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
      w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
    );
  }

  // Quaternion conjugate q* = w - xi - yj - zk
  conjugate() {
    return new UnitQuaternion(this.w, -this.x, -this.y, -this.z);
  }

  // Convert to 3x3 orthogonal rotation matrix R ∈ SO(3)
  toRotationMatrix() {
    const w = this.w, x = this.x, y = this.y, z = this.z;
    return [
      [1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y - w * z),       2.0 * (x * z + w * y)],
      [2.0 * (x * y + w * z),       1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z - w * x)],
      [2.0 * (x * z - w * y),       2.0 * (y * z + w * x),       1.0 - 2.0 * (x * x + y * y)]
    ];
  }

  // Rotate vector v' = q ⊗ (0, v) ⊗ q* using Rodrigues formula (preserves norm ||v'|| = ||v||)
  rotateVector(v) {
    const [vx, vy, vz] = v;
    const qx = this.x, qy = this.y, qz = this.z, qw = this.w;

    // Cross product q_vec x v
    const cx = qy * vz - qz * vy;
    const cy = qz * vx - qx * vz;
    const cz = qx * vy - qy * vx;

    // 2 * cross
    const tx = 2.0 * cx;
    const ty = 2.0 * cy;
    const tz = 2.0 * cz;

    // cross(q_vec, t)
    const ccx = qy * tz - qz * ty;
    const ccy = qz * tx - qx * tz;
    const ccz = qx * ty - qy * tx;

    return [
      vx + qw * tx + ccx,
      vy + qw * ty + ccy,
      vz + qw * tz + ccz
    ];
  }

  toArray() {
    return [this.w, this.x, this.y, this.z];
  }
}

class HypersphereManifold {
  constructor(normTarget = 100.0) {
    this.normTarget = Number(normTarget);
    this.schumannHz = 7.830;
    this.carrierHz = 432.000;
    this.harmonicRatio = this.carrierHz / this.schumannHz; // ~55.1724
    this.phaseSlipThresholdRad = 0.002; // sub-Planckian fence δ = 0.002 fm

    this.horizons = {
      horizon_1h: { name: "Schumann Phase Slip Guard", status: "ACTIVE", toleranceRad: 0.002 },
      horizon_24h: { name: "Intel Bounty Sink", status: "ARMED", capacity: "UNLIMITED" },
      horizon_7d: { name: "Liquidity Re-center", status: "ACTIVE", range: [2.25, 2.88] },
      horizon_30d: { name: "Macro Floor Defense", status: "STANDBY", floorRatio: 10.0 / 27.0 }
    };
  }

  project3D(v) {
    const [x, y, z] = v;
    const norm = Math.sqrt(x * x + y * y + z * z);
    if (norm < 1e-15) return [this.normTarget, 0.0, 0.0];
    const s = this.normTarget / norm;
    return [x * s, y * s, z * s];
  }

  project4DQuaternion(q) {
    const arr = q.toArray();
    return arr.map(coord => coord * this.normTarget);
  }

  verifySchumannLock(carrierHz = 432.000, schumannHz = 7.830) {
    const ratio = carrierHz / schumannHz;
    const drift = Math.abs(ratio - this.harmonicRatio);
    const phaseSlip = (drift * 2.0 * Math.PI) % (2.0 * Math.PI);
    const isLocked = phaseSlip <= this.phaseSlipThresholdRad || Math.abs(phaseSlip - 2.0 * Math.PI) <= this.phaseSlipThresholdRad;

    return {
      schumannHz,
      carrierHz,
      harmonicRatio: ratio,
      expectedRatio: this.harmonicRatio,
      phaseSlipRad: phaseSlip,
      thresholdRad: this.phaseSlipThresholdRad,
      schumannLock: isLocked ? "LOCKED" : "SLIP_DETECTED",
      phaseGuard: "ACTIVE"
    };
  }
}

// Matrix helper functions
function multiplyMatrixVector(M, v) {
  return [
    M[0][0] * v[0] + M[0][1] * v[1] + M[0][2] * v[2],
    M[1][0] * v[0] + M[1][1] * v[1] + M[1][2] * v[2],
    M[2][0] * v[0] + M[2][1] * v[1] + M[2][2] * v[2]
  ];
}

function multiplyMatrices(A, B) {
  const result = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
  ];
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      for (let k = 0; k < 3; k++) {
        result[i][j] += A[i][k] * B[k][j];
      }
    }
  }
  return result;
}

function matrixDeterminant(M) {
  return M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
         M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
         M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);
}

function vectorNorm(v) {
  return Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    UnitQuaternion,
    HypersphereManifold,
    multiplyMatrixVector,
    multiplyMatrices,
    matrixDeterminant,
    vectorNorm
  };
}
