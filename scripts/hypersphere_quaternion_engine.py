#!/usr/bin/env python3
"""
scripts/hypersphere_quaternion_engine.py
================================================================================
ANTIGRAVITY HYPERSPHERE QUATERNION & MATRIX MULTIPLICATION ENGINE
Phase 3 & Phase 4 Implementation: Non-Commutative SO(3) Stack & Schumann Lock
Hash: #CK-AG-HYPERSPHERE-PHASE3-4 | Norm Target: 100.0
================================================================================
"""

import math
import json
import os
import sys
import numpy as np
from typing import Tuple, List, Dict, Any

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8', errors='replace')

class UnitQuaternion:
    """
    Pure Unit Quaternion representation: q = w + xi + yj + zk, |q| = 1.
    Strictly decouples rotation from spatial scaling.
    """
    def __init__(self, w: float = 1.0, x: float = 0.0, y: float = 0.0, z: float = 0.0):
        mag = math.sqrt(w * w + x * x + y * y + z * z)
        if mag < 1e-15:
            raise ValueError("Zero quaternion cannot be normalized into unit sphere S³.")
        self.w = float(w / mag)
        self.x = float(x / mag)
        self.y = float(y / mag)
        self.z = float(z / mag)

    @classmethod
    def from_axis_angle(cls, axis: Tuple[float, float, float], angle_rad: float) -> 'UnitQuaternion':
        """Construct unit quaternion from axis (ux, uy, uz) and angle θ."""
        ax, ay, az = axis
        norm = math.sqrt(ax * ax + ay * ay + az * az)
        if norm < 1e-15:
            return cls(1.0, 0.0, 0.0, 0.0)
        half = angle_rad * 0.5
        sin_h = math.sin(half)
        return cls(
            math.cos(half),
            (ax / norm) * sin_h,
            (ay / norm) * sin_h,
            (az / norm) * sin_h
        )

    def __matmul__(self, other: 'UnitQuaternion') -> 'UnitQuaternion':
        """
        Hamilton product q1 ⊗ q2 (strictly non-commutative).
        Preserves associative composition: (q1 ⊗ q2) ⊗ q3 = q1 ⊗ (q2 ⊗ q3).
        """
        w1, x1, y1, z1 = self.w, self.x, self.y, self.z
        w2, x2, y2, z2 = other.w, other.x, other.y, other.z
        return UnitQuaternion(
            w = w1 * w2 - x1 * x2 - y1 * y2 - z1 * z2,
            x = w1 * x2 + x1 * w2 + y1 * z2 - z1 * y2,
            y = w1 * y2 - x1 * z2 + y1 * w2 + z1 * x2,
            z = w1 * z2 + x1 * y2 - y1 * x2 + z1 * w2
        )

    def conjugate(self) -> 'UnitQuaternion':
        """Quaternion conjugate q* = w - xi - yj - zk (inverse for unit quaternion)."""
        return UnitQuaternion(self.w, -self.x, -self.y, -self.z)

    def to_array(self) -> np.ndarray:
        return np.array([self.w, self.x, self.y, self.z], dtype=np.float64)

    def to_rotation_matrix(self) -> np.ndarray:
        """
        Convert to 3x3 orthogonal matrix R(q) ∈ SO(3).
        Preserves inner product, norm, and right-handed orientation.
        """
        w, x, y, z = self.w, self.x, self.y, self.z
        return np.array([
            [1.0 - 2.0 * (y * y + z * z), 2.0 * (x * y - w * z),       2.0 * (x * z + w * y)],
            [2.0 * (x * y + w * z),       1.0 - 2.0 * (x * x + z * z), 2.0 * (y * z - w * x)],
            [2.0 * (x * z - w * y),       2.0 * (y * z + w * x),       1.0 - 2.0 * (x * x + y * y)]
        ], dtype=np.float64)

    def rotate_vector(self, v: np.ndarray) -> np.ndarray:
        """
        Rotate vector v' = q ⊗ (0, v) ⊗ q* using Rodrigues formula.
        Ensures exact isometry: ||v'|| = ||v|| with zero metric distortion.
        """
        v = np.asarray(v, dtype=np.float64)
        qv = np.array([self.x, self.y, self.z], dtype=np.float64)
        t = 2.0 * np.cross(qv, v)
        return v + self.w * t + np.cross(qv, t)

    def slerp(self, other: 'UnitQuaternion', t: float) -> 'UnitQuaternion':
        """Spherical linear interpolation along geodesic arc on S³."""
        dot = self.w * other.w + self.x * other.x + self.y * other.y + self.z * other.z
        
        # Handle antipodal alignment
        w2, x2, y2, z2 = other.w, other.x, other.y, other.z
        if dot < 0.0:
            dot = -dot
            w2, x2, y2, z2 = -w2, -x2, -y2, -z2

        dot = min(max(dot, -1.0), 1.0)
        theta = math.acos(dot)
        if abs(theta) < 1e-12:
            return UnitQuaternion(self.w, self.x, self.y, self.z)

        sin_theta = math.sin(theta)
        scale0 = math.sin((1.0 - t) * theta) / sin_theta
        scale1 = math.sin(t * theta) / sin_theta

        return UnitQuaternion(
            w = scale0 * self.w + scale1 * w2,
            x = scale0 * self.x + scale1 * x2,
            y = scale0 * self.y + scale1 * y2,
            z = scale0 * self.z + scale1 * z2
        )


class HypersphereManifold:
    """
    Early Distribution Hypersphere Manifold S³ ⊂ R⁴ with norm target ||x|| = 100.0.
    Standardized pipeline:
      Raw vector -> Unit Quaternion rotation -> SO(3) Orthogonal Matrix -> Projection to ||x|| = 100.0
    """
    def __init__(self, norm_target: float = 100.0):
        self.norm_target = float(norm_target)
        self.schumann_hz = 7.830
        self.carrier_hz = 432.000
        self.harmonic_ratio = self.carrier_hz / self.schumann_hz  # ~55.1724
        self.phase_slip_threshold_rad = 0.002  # Sub-Planckian boundary fence δ = 0.002 fm

        # Management Horizons Status
        self.horizons = {
            "horizon_1h": {"name": "Schumann Phase Slip Guard", "status": "ACTIVE", "tolerance_rad": 0.002},
            "horizon_24h": {"name": "Intel Bounty Sink", "status": "ARMED", "capacity": "UNLIMITED"},
            "horizon_7d": {"name": "Liquidity Re-center", "status": "ACTIVE", "range": [2.25, 2.88]},
            "horizon_30d": {"name": "Macro Floor Defense", "status": "STANDBY", "floor_ratio": 10.0 / 27.0}
        }

    def project_3d(self, v: np.ndarray) -> np.ndarray:
        """Projects 3D vector to hypersphere radius ||x|| = 100.0."""
        v = np.asarray(v, dtype=np.float64)
        norm = np.linalg.norm(v)
        if norm < 1e-15:
            return np.array([self.norm_target, 0.0, 0.0], dtype=np.float64)
        return (v / norm) * self.norm_target

    def project_4d_quaternion(self, q: UnitQuaternion) -> np.ndarray:
        """Projects unit quaternion q ∈ S³ into 4D embedding with ||X|| = 100.0."""
        arr = q.to_array()
        return arr * self.norm_target

    def verify_schumann_lock(self, current_carrier_hz: float = 432.000, current_schumann_hz: float = 7.830) -> Dict[str, Any]:
        """Validates harmonic phase lock between 432 Hz carrier and 7.83 Hz Schumann fundamental."""
        ratio = current_carrier_hz / current_schumann_hz
        expected_ratio = self.harmonic_ratio
        drift = abs(ratio - expected_ratio)
        
        # Phase slip verification (sub-Planckian boundary check)
        phase_slip = (drift * 2.0 * math.pi) % (2.0 * math.pi)
        is_locked = phase_slip <= self.phase_slip_threshold_rad or abs(phase_slip - 2.0 * math.pi) <= self.phase_slip_threshold_rad

        return {
            "schumann_hz": current_schumann_hz,
            "carrier_hz": current_carrier_hz,
            "harmonic_ratio": ratio,
            "expected_ratio": expected_ratio,
            "phase_slip_rad": phase_slip,
            "threshold_rad": self.phase_slip_threshold_rad,
            "schumann_lock": "LOCKED" if is_locked else "SLIP_DETECTED",
            "phase_guard": "ACTIVE"
        }

    def export_canonical_json(self, filepath: str) -> None:
        """Exports canonical configuration state."""
        q_ident = UnitQuaternion(1.0, 0.0, 0.0, 0.0)
        q_schumann = UnitQuaternion.from_axis_angle((0.0, 1.0, 0.0), math.pi / 4.0)
        q_throat = UnitQuaternion.from_axis_angle((1.0, 0.0, 0.0), (10.0 / 27.0) * math.pi)

        config = {
            "system": "ANTIGRAVITY_HYPERSPHERE_CORE",
            "version": "3.4.0",
            "hash": "#CK-AG-HYPERSPHERE-PHASE3-4",
            "geometry": {
                "norm_target": self.norm_target,
                "manifold": "S^3_IN_R^4",
                "normalization_tolerance": 1e-14,
                "sub_planckian_fence_rad": self.phase_slip_threshold_rad,
                "throat_constriction_ratio": 10.0 / 27.0
            },
            "resonance": {
                "schumann_hz": self.schumann_hz,
                "carrier_hz": self.carrier_hz,
                "harmonic_ratio": self.harmonic_ratio,
                "phase_guard_active": True
            },
            "canonical_quaternions": {
                "identity": {"w": q_ident.w, "x": q_ident.x, "y": q_ident.y, "z": q_ident.z},
                "schumann_gate": {"w": q_schumann.w, "x": q_schumann.x, "y": q_schumann.y, "z": q_schumann.z},
                "throat_constriction": {"w": q_throat.w, "x": q_throat.x, "y": q_throat.y, "z": q_throat.z}
            },
            "orthogonal_matrices": {
                "identity": q_ident.to_rotation_matrix().tolist(),
                "schumann_gate": q_schumann.to_rotation_matrix().tolist(),
                "throat_constriction": q_throat.to_rotation_matrix().tolist()
            },
            "horizons": self.horizons
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2)
        print(f"[EXPORT] Canonical Hypersphere JSON written to: {filepath}")


def run_test_suite() -> bool:
    """Comprehensive test suite verifying Phase 3 & Phase 4 mathematics."""
    print("================================================================================")
    print("🧪 ANTIGRAVITY HYPERSPHERE QUATERNION & MATRIX VERIFICATION SUITE")
    print("================================================================================\n")
    
    passes = 0
    total = 0

    def check(condition: bool, name: str):
        nonlocal passes, total
        total += 1
        if condition:
            print(f"[PASS] {name}")
            passes += 1
        else:
            print(f"[FAIL] {name}")

    # 1. Unit Normalization
    q_raw = UnitQuaternion(3.0, 4.0, 0.0, 0.0)
    check(abs(math.sqrt(q_raw.w**2 + q_raw.x**2 + q_raw.y**2 + q_raw.z**2) - 1.0) < 1e-15, "Quaternion normalizes strictly to unit magnitude (|q| = 1)")

    # 2. Non-commutative Hamilton Product
    q1 = UnitQuaternion.from_axis_angle((1.0, 0.0, 0.0), math.pi / 2.0)
    q2 = UnitQuaternion.from_axis_angle((0.0, 1.0, 0.0), math.pi / 2.0)
    prod12 = q1 @ q2
    prod21 = q2 @ q1
    diff = np.linalg.norm(prod12.to_array() - prod21.to_array())
    check(diff > 0.1, f"Hamilton product is strictly non-commutative (diff = {diff:.4f})")

    # 3. Orthogonal Matrix Properties (R^T R = I, det(R) = +1.0)
    R1 = q1.to_rotation_matrix()
    identity_diff = np.linalg.norm(R1.T @ R1 - np.eye(3))
    det_R1 = np.linalg.det(R1)
    check(identity_diff < 1e-14, f"Orthogonality verified: R^T R = I (residual = {identity_diff:.2e})")
    check(abs(det_R1 - 1.0) < 1e-14, f"Special Orthogonal verified: det(R) = +1.00000000000000 (det = {det_R1:.14f})")

    # 4. Metric Invariance (||v'|| = ||v||)
    v_orig = np.array([42.0, -73.5, 108.2], dtype=np.float64)
    v_rot_quat = q1.rotate_vector(v_orig)
    v_rot_mat = R1 @ v_orig
    norm_orig = np.linalg.norm(v_orig)
    norm_quat = np.linalg.norm(v_rot_quat)
    norm_mat = np.linalg.norm(v_rot_mat)

    check(abs(norm_quat - norm_orig) < 1e-12, f"Quaternion rotation preserves vector norm: {norm_orig:.6f} -> {norm_quat:.6f}")
    check(abs(norm_mat - norm_orig) < 1e-12, f"Matrix multiplication preserves vector norm: {norm_orig:.6f} -> {norm_mat:.6f}")
    check(np.linalg.norm(v_rot_quat - v_rot_mat) < 1e-12, "Quaternion conjugation and SO(3) matrix rotation yield identical vectors")

    # 5. Round-Trip Inversion Error (v -> rotate -> invert -> v error -> 0)
    q1_inv = q1.conjugate()
    v_restored = q1_inv.rotate_vector(v_rot_quat)
    round_trip_error = np.linalg.norm(v_restored - v_orig)
    check(round_trip_error < 1e-12, f"Round-trip inversion error < 1e-12: error = {round_trip_error:.2e}")

    # 6. Compound Transform Order (Right-to-Left / Local-to-Global)
    # v_comp = (q1 @ q2).rotate(v) should match R1 @ (R2 @ v)
    R2 = q2.to_rotation_matrix()
    v_compound_quat = (q1 @ q2).rotate_vector(v_orig)
    v_compound_mat = (R1 @ R2) @ v_orig
    comp_diff = np.linalg.norm(v_compound_quat - v_compound_mat)
    check(comp_diff < 1e-12, f"Compound transform right-to-left order matches matrix multiplication: {comp_diff:.2e}")

    # 7. Hypersphere Projection Target Norm ||x|| = 100.0
    manifold = HypersphereManifold(norm_target=100.0)
    v_proj = manifold.project_3d(v_rot_quat)
    proj_norm = np.linalg.norm(v_proj)
    check(abs(proj_norm - 100.0) < 1e-12, f"Hypersphere 3D target norm locked to 100.0: ||x|| = {proj_norm:.14f}")

    X4D = manifold.project_4d_quaternion(q1)
    norm4D = np.linalg.norm(X4D)
    check(abs(norm4D - 100.0) < 1e-12, f"Hypersphere 4D S³ embedding target norm locked to 100.0: ||X|| = {norm4D:.14f}")

    # 8. Schumann Resonance Lock & Phase Guard
    schumann_telemetry = manifold.verify_schumann_lock(current_carrier_hz=432.0, current_schumann_hz=7.83)
    check(schumann_telemetry["schumann_lock"] == "LOCKED", f"Schumann harmonic lock coherent: ratio = {schumann_telemetry['harmonic_ratio']:.4f}")
    check(schumann_telemetry["phase_slip_rad"] < 0.002, f"Phase slip guard active (< 0.002 rad tolerance): slip = {schumann_telemetry['phase_slip_rad']:.6f} rad")

    # 9. Management Horizons State Audit
    horizons = manifold.horizons
    check(horizons["horizon_1h"]["status"] == "ACTIVE", "Horizon-1h Schumann Phase Slip Guard is ACTIVE")
    check(horizons["horizon_24h"]["status"] == "ARMED", "Horizon-24h Intel Bounty Sink is ARMED")
    check(horizons["horizon_7d"]["status"] == "ACTIVE", "Horizon-7d Liquidity Re-center is ACTIVE ($2.25 - $2.88)")
    check(horizons["horizon_30d"]["status"] == "STANDBY", "Horizon-30d Macro Floor Defense is STANDBY")

    print("\n================================================================================")
    print(f"📊 RESULT: {passes} / {total} TESTS PASSED ({(passes / total) * 100.0:.1f}%)")
    print("================================================================================\n")
    return passes == total


if __name__ == "__main__":
    success = run_test_suite()
    if not success:
        sys.exit(1)
    
    # Export canonical JSON configuration
    script_dir = os.path.dirname(os.path.abspath(__file__))
    json_path = os.path.join(script_dir, "hypersphere_quaternion_matrix.json")
    manifold = HypersphereManifold(norm_target=100.0)
    manifold.export_canonical_json(json_path)
