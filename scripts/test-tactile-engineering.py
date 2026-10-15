#!/usr/bin/env python3
"""Synthetic edge cases; no experiment data or historical result is changed."""
import importlib.util
from pathlib import Path
import unittest
import sys

sys.dont_write_bytecode = True

import numpy as np

spec = importlib.util.spec_from_file_location('engineering_analysis', Path(__file__).with_name('analyze-tactile-engineering.py'))
analysis = importlib.util.module_from_spec(spec)
spec.loader.exec_module(analysis)


class SyntheticTimingTests(unittest.TestCase):
    def test_duplicate_and_backward_timestamps_are_distinct(self):
        result = analysis.timestamp_stats([100, 100, 90, 120])
        self.assertEqual(result['adjacent_duplicates'], 1)
        self.assertEqual(result['backwards'], 1)

    def test_gap_reuses_old_source_without_making_it_fresh(self):
        result = analysis.inspect_windows(np.array([[0, 1]]), np.array([[True, True]]),
                                           np.array([0, 10_000_000]), np.array([220_000_000]), 0, 2)
        self.assertEqual(result['latest_age_over_100ms_count'], 1)
        self.assertAlmostEqual(result['latest_age_ms']['max'], 210)

    def test_cross_episode_window_is_detected(self):
        result = analysis.inspect_windows(np.array([[1, 2]]), np.array([[True, True]]),
                                           np.array([0, 10, 20, 30]), np.array([30]), 2, 4)
        self.assertEqual(result['out_of_episode_entries'], 1)

    def test_future_mapped_frame_is_detected(self):
        result = analysis.inspect_windows(np.array([[0, 1]]), np.array([[True, True]]),
                                           np.array([5, 15]), np.array([10]), 0, 2)
        self.assertEqual(result['future_mapped_entries'], 1)

    def test_multiple_records_can_refer_to_same_native_frame(self):
        result = analysis.inspect_windows(np.array([[0, 1, 2]]), np.ones((1, 3), dtype=bool),
                                           np.array([10, 10, 20]), np.array([20]), 0, 3, [4, 4, 5])
        self.assertEqual(result['repeated_native_source_windows'], 1)

    def test_late_observation_is_excluded_but_post_reference_state_is_allowed(self):
        select = analysis.select_available_sample
        self.assertEqual(select([-45, 5], [45, 95], 0, 80, 60), 0)
        self.assertEqual(select([-30, 10, 50], [-20, 20, 60], 0, 80, 60), 1)
        self.assertEqual(select([-200, 5], [-100, 95], 0, 80, 60), -1)


if __name__ == '__main__':
    unittest.main(verbosity=2)
