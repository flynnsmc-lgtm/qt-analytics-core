#!/usr/bin/env python3
"""
scripts/test_geodesic_projection.py
================================================================================
UNIT TESTS: Geodesic Projection Operator Π(x) on S^7_{r0}
================================================================================
"""

import math
import unittest
import numpy as np
from geodesic_projection_operator import (
    R0,
    geodesic_projection,
    embed_to_r8,
    project_to_s7,
    geodesic_distance,
    verify_on_surface,
    arkm_flow_projector
)


class TestGeodesicProjection(unittest.TestCase):

    def test_basic_projection_norm(self):
        """Verify projected vector norm is identically equal to r0."""
        v = [3.0, 4.0]
        proj = geodesic_projection(v, r0=1.0)
        self.assertTrue(np.isclose(np.linalg.norm(proj), 1.0, atol=1e-12))
        self.assertTrue(np.allclose(proj, [0.6, 0.8]))

    def test_custom_r0(self):
        """Verify custom reference radius scaling."""
        v = [1.0, 2.0, 2.0]
        proj = geodesic_projection(v, r0=5.0)
        self.assertTrue(np.isclose(np.linalg.norm(proj), 5.0, atol=1e-12))

    def test_user_transaction_vector(self):
        """Verify exact user test vector matches r0 norm."""
        raw_flow = [36572094.31, 183307453.18, 450659995.38, 3162903075.97]
        projected = geodesic_projection(raw_flow, r0=R0)
        self.assertTrue(np.isclose(np.linalg.norm(projected), R0, atol=1e-12))
        self.assertTrue(verify_on_surface(projected, r0=R0))

    def test_zero_vector_raises(self):
        """Zero vector must raise ValueError because no direction is defined."""
        with self.assertRaises(ValueError):
            geodesic_projection([0.0, 0.0, 0.0])

    def test_s7_embedding_and_projection(self):
        """Verify 4D vector embeds into ℝ^8 and projects cleanly onto S^7."""
        raw_4d = [10.0, 20.0, 30.0, 40.0]
        s7_proj = project_to_s7(raw_4d, r0=1.0)
        self.assertEqual(s7_proj.shape[0], 8)
        self.assertTrue(np.isclose(np.linalg.norm(s7_proj), 1.0, atol=1e-12))
        # Non-embedded components should be 0
        self.assertTrue(np.allclose(s7_proj[4:], 0.0))

    def test_geodesic_distance(self):
        """Verify intrinsic great-circle distance between orthogonal vectors is pi/2 * r0."""
        p1 = geodesic_projection([1.0, 0.0], r0=1.0)
        p2 = geodesic_projection([0.0, 1.0], r0=1.0)
        dist = geodesic_distance(p1, p2, r0=1.0)
        self.assertTrue(np.isclose(dist, math.pi / 2.0, atol=1e-12))

    def test_arkm_batch_processing(self):
        """Verify batch processing pipeline handles both valid and degenerate inputs."""
        flows = [
            [36572094.31, 183307453.18, 450659995.38, 3162903075.97],
            [1.0, 1.0],
            [0.0, 0.0]
        ]
        results = arkm_flow_projector(flows)
        self.assertEqual(len(results), 3)
        self.assertEqual(results[0]["status"], "VALID_INVARIANT")
        self.assertEqual(results[1]["status"], "VALID_INVARIANT")
        self.assertEqual(results[2]["status"], "DEGENERATE_ZERO_VECTOR")


if __name__ == "__main__":
    unittest.main()
