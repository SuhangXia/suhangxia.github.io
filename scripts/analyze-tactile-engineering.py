#!/usr/bin/env python3
"""Read-only timing/calibration analysis. Never decodes or rewrites source media."""
from __future__ import annotations

import argparse
from collections import defaultdict
import hashlib
import json
from pathlib import Path
import sys

import h5py
import numpy as np
import yaml
import zarr


STREAMS = {
    'rgb': 'observation/wrist_rgb/right',
    'quest': 'observation/quest_pose/right',
    'left': 'observation/tactile_image/right/left_finger',
    'right': 'observation/tactile_image/right/right_finger',
}


def describe(values):
    a = np.asarray(values, dtype=float).reshape(-1)
    a = a[np.isfinite(a)]
    if not a.size:
        return {'count': 0}
    return {'count': int(a.size), 'min': float(a.min()), 'p05': float(np.quantile(a, .05)),
            'median': float(np.median(a)), 'p95': float(np.quantile(a, .95)), 'max': float(a.max())}


def timestamp_stats(timestamps):
    a = np.asarray(timestamps, dtype=np.int64)
    d = np.diff(a)
    return {'samples': int(a.size), 'null': int(np.sum(a == -1)),
            'adjacent_duplicates': int(np.sum(d == 0)), 'backwards': int(np.sum(d < 0)),
            'interval_ms': describe(d[d > 0] / 1e6)}


def true_intervals(mask):
    """Half-open local policy-step intervals for diagnostics in the private report."""
    edges = np.diff(np.r_[False, np.asarray(mask, dtype=bool), False].astype(np.int8))
    return np.column_stack([np.flatnonzero(edges == 1), np.flatnonzero(edges == -1)]).tolist()


def inspect_windows(indices, mask, timestamps, policy, start, stop, source_indices=None):
    """Separate record boundaries, mapped-time ordering and distinct native sources."""
    idx = np.asarray(indices, dtype=np.int64)
    valid = np.asarray(mask, dtype=bool)
    bounds = valid & ((idx < start) | (idx >= stop))
    safe = np.clip(idx, 0, max(len(timestamps) - 1, 0))
    selected = timestamps[safe]
    future = valid & (selected > np.asarray(policy)[:, None])
    age = np.asarray(policy) - selected[:, -1]
    full = valid.all(axis=1)
    duplicate_records = full & np.any(np.diff(selected, axis=1) == 0, axis=1)
    result = {'out_of_episode_entries': int(bounds.sum()), 'future_mapped_entries': int(future.sum()),
              'full_windows': int(full.sum()), 'padded_windows': int((~full).sum()),
              'duplicate_timestamp_windows': int(duplicate_records.sum()),
              'latest_age_over_100ms_count': int(np.sum(valid[:, -1] & (age > 100e6))),
              'latest_age_ms': describe(age[valid[:, -1]] / 1e6)}
    if source_indices is not None:
        local = np.clip(idx - start, 0, len(source_indices) - 1)
        native = np.asarray(source_indices)[local]
        result['repeated_native_source_windows'] = int((full & np.any(np.diff(native, axis=1) == 0, axis=1)).sum())
    return result


def select_available_sample(observation_times, available_times, reference, deadline, tolerance):
    """Closest physical-time sample subject to availability and a stated tolerance."""
    observation_times = np.asarray(observation_times)
    available_times = np.asarray(available_times)
    eligible = (available_times <= deadline) & (np.abs(observation_times - reference) <= tolerance)
    candidates = np.flatnonzero(eligible)
    if not candidates.size:
        return -1
    return int(candidates[np.argmin(np.abs(observation_times[candidates] - reference))])


def read_text(group, key):
    value = group[key][()]
    return value.decode() if isinstance(value, bytes) else str(value)


def matrix_checks(matrix):
    t = np.asarray(matrix, dtype=float)
    r = t[:3, :3]
    return {'det_R': float(np.linalg.det(r)), 'orthogonality_max_abs': float(np.max(np.abs(r.T @ r - np.eye(3)))),
            'homogeneous_row_max_abs': float(np.max(np.abs(t[3] - [0, 0, 0, 1])))}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--clothumi-root', type=Path, required=True)
    parser.add_argument('--raw-root', type=Path, required=True)
    parser.add_argument('--zarr', type=Path, required=True)
    parser.add_argument('--hand-eye-dir', type=Path, required=True)
    parser.add_argument('--output', type=Path, required=True)
    parser.add_argument('--public-json', type=Path)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    if any(args.output.resolve() == p.resolve() for p in [args.raw_root, args.zarr, args.clothumi_root]):
        raise ValueError('Analysis output must be a separate directory.')
    sys.path.insert(0, str(args.clothumi_root))
    from clothumi.calibration.quest_camera_hand_eye import load_hand_eye_samples, fixed_target_errors, solve_hand_eye
    from clothumi.time_sync.alignment import _vectorized_nearest_indices
    from clothumi.utils.uniforce_tactile import build_causal_tactile_windows

    calibration_result = json.loads((args.hand_eye_dir / 'hand_eye_result.json').read_text())
    samples, _ = load_hand_eye_samples(args.hand_eye_dir)
    transform = np.asarray(calibration_result['T_CameraToQuestHand'])
    fixed = fixed_target_errors(samples, transform)
    points = np.stack([(s.world_t_quest_hand @ transform @ s.camera_t_target)[:3, 3] for s in samples])
    center = np.median(points, axis=0)
    # A deterministic held-out consistency check; all forty original observations remain included.
    train = [s for i, s in enumerate(samples) if i % 5 != 4]
    held = [s for i, s in enumerate(samples) if i % 5 == 4]
    held_solution = solve_hand_eye(train, method='park', reject_outliers=False)
    train_points = np.stack([(s.world_t_quest_hand @ held_solution.quest_hand_t_camera @ s.camera_t_target)[:3, 3] for s in train])
    held_points = np.stack([(s.world_t_quest_hand @ held_solution.quest_hand_t_camera @ s.camera_t_target)[:3, 3] for s in held])
    calibration = {'sample_count': len(samples), 'method': 'PARK',
                   'std_xyz_mm': (np.std(points, axis=0) * 1000).tolist(),
                   'centered_points_mm': ((points - center) * 1000).tolist(),
                   'translation_error_mm': (fixed['translation_error_m'] * 1000).tolist(),
                   'rotation_error_deg': fixed['rotation_error_deg'].tolist(),
                   'matrix': transform.tolist(), 'matrix_checks': matrix_checks(transform),
                   'held_out': {'fit_count': len(train), 'held_out_count': len(held),
                                'distance_to_training_board_center_mm': describe(np.linalg.norm(held_points - np.median(train_points, axis=0), axis=1) * 1000)},
                   'meaning': 'Fixed-board reconstruction consistency; not absolute positioning accuracy.'}

    raw_records = []
    for day in ['0619', '0623']:
        for path in sorted((args.raw_root / day).glob('*.h5')):
            with h5py.File(path, 'r') as h:
                row = {'day': day, 'episode': path.stem, 'streams': {}}
                for name, group_path in STREAMS.items():
                    if group_path not in h:
                        row['streams'][name] = {'missing': True}
                        continue
                    group = h[group_path]
                    a = group['host_arrival_monotonic_ns'][:]
                    stats = timestamp_stats(a)
                    stats['coverage_from_rgb_start_ms'] = [float((a[0] - h[STREAMS['rgb']]['host_arrival_monotonic_ns'][0]) / 1e6), float((a[-1] - h[STREAMS['rgb']]['host_arrival_monotonic_ns'][0]) / 1e6)] if a.size else []
                    stats['applied_latency_ms'] = float(group.attrs.get('applied_latency_ms', 0))
                    row['streams'][name] = stats
                raw_records.append(row)
    print(f'Read {len(raw_records)} raw episodes (metadata/timestamps only).', flush=True)

    z = zarr.open_group(str(args.zarr), mode='r')
    source_paths = [Path(p) for p in json.loads(z.attrs['original_source_h5_paths_json'])]
    episode_ends = np.asarray(z['meta/episode_ends'][:])
    policy = np.asarray(z['data/policy_timestamp_ns'][:]).reshape(-1)
    tactile_ts = {s: np.asarray(z[f'tactile/{s}_timestamp_ns'][:]) for s in ['left', 'right']}
    tactile_ends = {s: np.asarray(z[f'tactile/{s}_episode_ends'][:]) for s in ['left', 'right']}
    window_indices = {s: np.asarray(z[f'data/uniforce_{s}_tactile_window_indices'][:]) for s in ['left', 'right']}
    window_masks = {s: np.asarray(z[f'data/uniforce_{s}_tactile_window_valid'][:]) for s in ['left', 'right']}
    latest_ages = {s: np.asarray(z[f'data/uniforce_{s}_tactile_latest_age_ns'][:]).reshape(-1) for s in ['left', 'right']}
    rows = []
    durations = defaultdict(list)
    geometry_fingerprints = defaultdict(set)
    action_mismatch = 0
    maximum_action_error = 0.0
    for episode_i, (path, stop) in enumerate(zip(source_paths, episode_ends)):
        start = int(episode_ends[episode_i - 1]) if episode_i else 0
        stop = int(stop)
        p = policy[start:stop]
        day = '0619' if '0619' in str(path.parent) else '0623'
        row = {'day': day, 'episode': path.stem, 'policy_steps': stop - start,
               'policy_clock': timestamp_stats(p), 'streams': {}, 'windows': {}}
        with h5py.File(path, 'r') as aligned:
            raw_path = Path(str(aligned.attrs['source_h5_path']))
            with h5py.File(raw_path, 'r') as raw:
                for name, gp in STREAMS.items():
                    g = aligned[gp]
                    source = np.asarray(g['source_index'][:], dtype=np.int64)
                    ref = np.asarray(g['reference_timestamp_ns'][:], dtype=np.int64)
                    corrected = np.asarray(g['corrected_timestamp_ns'][:], dtype=np.int64)
                    native = raw[gp]['host_arrival_monotonic_ns'][:]
                    outside = (source < 0) | (source >= native.size)
                    delta = corrected - ref
                    repeats = int(source.size - np.unique(source).size)
                    source_monotonic = np.diff(source)
                    dt = np.diff(native)
                    durations[name].extend((dt[dt > 0] / 1e6).tolist())
                    expect = native - int(round(float(g.attrs.get('applied_latency_ms', 0)) * 1e6))
                    nearest = _vectorized_nearest_indices(expect, ref) if np.all(np.diff(expect) >= 0) else None
                    row['streams'][name] = {
                        'native_samples': int(native.size), 'aligned_samples': int(ref.size),
                        'source_references_reused': repeats, 'source_reuse_fraction': repeats / max(1, source.size),
                        'source_index_out_of_range': int(outside.sum()), 'source_index_backwards': int((source_monotonic < 0).sum()),
                        'nearest_selection_mismatches': int(np.sum(nearest != source)) if nearest is not None else None,
                        'corrected_timestamp_mismatches': int(np.sum(expect[source] != corrected)) if not outside.any() else None,
                        'selected_after_reference_count': int((delta > 0).sum()),
                        'native_arrival_after_reference_count': int(np.sum(native[source] > ref)) if not outside.any() else None,
                        'abs_mapped_residual_ms': describe(np.abs(delta) / 1e6),
                        'mapped_residual_over_100ms_count': int(np.sum(np.abs(delta) > 100e6)),
                        'aligned_mapped_timestamp_stats': timestamp_stats(corrected),
                    }
                metadata = aligned['metadata']
                embedded = 'tcp_calibration_config_yaml' in metadata
                cfg = yaml.safe_load(read_text(metadata, 'tcp_calibration_config_yaml')) if embedded else {}
                m = np.asarray(cfg['t_quest2camera']) if embedded else np.asarray(json.loads(z.attrs['t_quest2camera_json']))
                # YAML and JSON retained slightly different decimal precision.
                equivalent = np.allclose(m, transform, atol=1e-7, rtol=0)
                fingerprint = 'shared_with_40_pose_solution' if equivalent else hashlib.sha256(np.round(m, 8).tobytes()).hexdigest()
                geometry_fingerprints[day].add(fingerprint)
                row['geometry'] = {'matrix_checks': matrix_checks(m), 'matrix_max_abs_difference_from_hand_eye': float(np.max(np.abs(m - transform))),
                                   'matrix_source': 'embedded_aligned_h5' if embedded else 'shared_zarr_export_configuration'}
                for side in ['left', 'right']:
                    lo = int(tactile_ends[side][episode_i - 1]) if episode_i else 0
                    hi = int(tactile_ends[side][episode_i])
                    gp = STREAMS[side]
                    native_source = aligned[gp]['source_index'][:]
                    part = window_indices[side][start:stop]
                    mask = window_masks[side][start:stop]
                    r = inspect_windows(part, mask, tactile_ts[side], p, lo, hi, native_source)
                    rebuilt = build_causal_tactile_windows(policy_timestamps_ns=p, tactile_timestamps_ns=tactile_ts[side][lo:hi], window_length=6, index_offset=lo)
                    r['index_rule_mismatches'] = int(np.sum(np.any(part != rebuilt.indices, axis=1)))
                    r['mask_rule_mismatches'] = int(np.sum(np.any(mask != rebuilt.valid_mask, axis=1)))
                    r['stored_age_mismatches'] = int(np.sum(latest_ages[side][start:stop] != rebuilt.latest_age_ns))
                    r['recorded_valid_windows'] = int(np.sum(z[f'data/uniforce_{side}_valid_tactile_window'][start:stop]))
                    r['latest_age_over_100ms_intervals'] = true_intervals(mask[:, -1] & (latest_ages[side][start:stop] > 100e6))
                    row['windows'][side] = r
                # Action labels are absolute next-frame camera targets; conversion is in the dataset.
                if stop - start > 1:
                    obs = np.concatenate([z['data/robot0_eef_pos'][start + 1:stop], z['data/robot0_eef_rot_axis_angle'][start + 1:stop], z['data/robot0_gripper_width'][start + 1:stop]], axis=1)
                    labels = np.asarray(z['data/action'][start:stop - 1])
                    errors = np.max(np.abs(obs - labels), axis=1)
                    action_mismatch += int(np.sum(errors > 1e-5))
                    maximum_action_error = max(maximum_action_error, float(errors.max()))
        rows.append(row)
        if (episode_i + 1) % 50 == 0:
            print(f'Checked {episode_i + 1}/{len(source_paths)} exported episodes.', flush=True)

    stream_summary = {}
    for name in STREAMS:
        total = sum(r['streams'][name]['aligned_samples'] for r in rows)
        stream_summary[name] = {'native_interval_ms': describe(durations[name]),
                                'aligned_samples': total,
                                'source_references_reused': sum(r['streams'][name]['source_references_reused'] for r in rows),
                                'source_reuse_fraction': sum(r['streams'][name]['source_references_reused'] for r in rows) / total,
                                'mapped_residual_over_100ms_count': sum(r['streams'][name]['mapped_residual_over_100ms_count'] for r in rows)}
    window_summary = {}
    for side in ['left', 'right']:
        summable = [k for k, v in rows[0]['windows'][side].items() if isinstance(v, (int, float))]
        window_summary[side] = {k: sum(r['windows'][side][k] for r in rows) for k in summable}
        valid = window_masks[side][:, -1]
        window_summary[side]['latest_age_ms'] = describe(latest_ages[side][valid] / 1e6)

    summary = {'analysis_date': '2026-10-15', 'raw_episode_count': len(raw_records),
               'raw_by_day': {d: sum(r['day'] == d for r in raw_records) for d in ['0619', '0623']},
               'episode_count': len(rows), 'policy_steps': int(episode_ends[-1]),
               'exported_by_day': {d: sum(r['day'] == d for r in rows) for d in ['0619', '0623']},
               'raw_backwards': sum(s.get('backwards', 0) for r in raw_records for s in r['streams'].values()),
               'raw_adjacent_duplicates': sum(s.get('adjacent_duplicates', 0) for r in raw_records for s in r['streams'].values()),
               'streams': stream_summary, 'windows': window_summary,
               'shared_quest_camera_matrix_count': len(set.union(*geometry_fingerprints.values())),
               'matrix_count_by_day': {d: len(v) for d, v in geometry_fingerprints.items()},
               'embedded_geometry_episode_count': sum(r['geometry']['matrix_source'] == 'embedded_aligned_h5' for r in rows),
               'matrix_comparison_absolute_tolerance': 1e-7,
               'action_target_offset_steps': int(z.attrs['action_target_offset_steps']),
               'action_label_mismatches': action_mismatch, 'action_label_max_abs_error': maximum_action_error,
               'timing_semantics': 'Host read/receive times and latency-mapped times; complete policy-ready/decision timestamps were not logged.'}
    for name in ['source_index_out_of_range', 'corrected_timestamp_mismatches', 'nearest_selection_mismatches']:
        summary[name] = sum((r['streams'][s][name] or 0) for r in rows for s in STREAMS)
    report = {'summary': summary, 'calibration': calibration, 'raw_episodes': raw_records, 'exported_episodes': rows}
    (args.output / 'analysis.json').write_text(json.dumps(report, indent=2, allow_nan=False), encoding='utf-8')
    if args.public_json:
        args.public_json.parent.mkdir(parents=True, exist_ok=True)
        compact = {'summary': summary, 'calibration': calibration}
        args.public_json.write_text(json.dumps(compact, indent=2, allow_nan=False) + '\n', encoding='utf-8')
    print(json.dumps(summary, indent=2, allow_nan=False))


if __name__ == '__main__':
    main()
