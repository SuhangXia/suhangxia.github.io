#!/usr/bin/env python3
"""Web figure contract: real system geometry/clock consistency, not absolute accuracy.

Evidence: all 40 board observations; recorded latency CSVs; complete exported corpus.
Archetype: quantitative secondary views beside a responsive coordinate-chain diagram.
Backend: Python/matplotlib. Export: editable SVG + PNG preview; separate mobile layout.
Data policy: all observations retained; latency main view has a labelled detail interval
and a full-record overview. Before/after use identical axes and normalization.
"""
from __future__ import annotations
import argparse
from io import StringIO
import json
from pathlib import Path
import sys

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import yaml

INK = '#25332e'
GREEN = '#476b5a'
CLAY = '#b54b32'
MUTED = '#686c66'
LINE = '#dcded7'


def save(fig, name, out, preview):
    svg = StringIO()
    fig.savefig(svg, format='svg', facecolor='white')
    (out / f'{name}.svg').write_text('\n'.join(line.rstrip() for line in svg.getvalue().splitlines()) + '\n')
    fig.savefig(preview / f'{name}.pdf', facecolor='white')
    fig.savefig(preview / f'{name}.png', dpi=300, facecolor='white')
    plt.close(fig)


def style(ax):
    ax.spines[['top', 'right']].set_visible(False)
    ax.spines[['left', 'bottom']].set_color(LINE)
    ax.tick_params(colors=MUTED, length=3)
    ax.grid(axis='y', color=LINE, lw=.6, alpha=.7)
    ax.set_axisbelow(True)


def main():
    p = argparse.ArgumentParser(description=__doc__)
    p.add_argument('--analysis', type=Path, required=True)
    p.add_argument('--latency-dir', type=Path, required=True)
    p.add_argument('--gripper-lut', type=Path, required=True)
    p.add_argument('--clothumi-root', type=Path, required=True)
    p.add_argument('--output', type=Path, required=True)
    p.add_argument('--preview-output', type=Path, required=True)
    args = p.parse_args()
    args.output.mkdir(parents=True, exist_ok=True)
    args.preview_output.mkdir(parents=True, exist_ok=True)
    sys.path.insert(0, str(args.clothumi_root))
    from clothumi.calibration.quest_camera_latency import _alignment_feature, _normalize
    plt.rcParams.update({'font.family': 'sans-serif', 'font.sans-serif': ['DejaVu Sans'],
                         'svg.fonttype': 'none', 'pdf.fonttype': 42, 'font.size': 11,
                         'text.color': INK, 'axes.labelcolor': MUTED, 'axes.labelsize': 10,
                         'xtick.labelsize': 10, 'ytick.labelsize': 10, 'axes.titlesize': 12})
    report = json.loads(args.analysis.read_text())
    calibration = report['calibration']
    latency = json.loads((args.latency_dir / 'latency_report.json').read_text())
    offset = float(latency['mse_alignment']['best_offset_sec'])
    camera = np.genfromtxt(args.latency_dir / 'aruco_detections.csv', delimiter=',', names=True)
    quest = np.genfromtxt(args.latency_dir / 'quest_trajectory.csv', delimiter=',', names=True)
    camera_t = camera['timestamp_sec']
    camera_v = camera['axis_value']
    quest_t = quest['timestamp_sec']
    quest_v = float(latency['config']['quest_sign']) * quest[latency['config']['quest_axis']]
    origin = min(camera_t[0], quest_t[0])
    # A shared camera-time grid and shared normalization keep the toggle honest.
    overlap = ((camera_t + min(0, offset)) >= quest_t[0]) & ((camera_t + max(0, offset)) <= quest_t[-1])
    t = camera_t[overlap]
    cam = _alignment_feature(t, camera_v[overlap], mode='velocity', smooth_sigma_samples=1)
    before = _alignment_feature(t, np.interp(t, quest_t, quest_v), mode='velocity', smooth_sigma_samples=1)
    after = _alignment_feature(t, np.interp(t + offset, quest_t, quest_v), mode='velocity', smooth_sigma_samples=1)
    # Scaling each curve once across the full recording, identically in both views.
    cam = _normalize(cam)
    q_center, q_scale = np.mean(before), np.std(before)
    before, after = (before - q_center) / q_scale, (after - q_center) / q_scale
    elapsed = t - origin
    ymin = min(np.min(cam), np.min(before), np.min(after)) - .15
    ymax = max(np.max(cam), np.max(before), np.max(after)) + .15
    # Zoom into the first second of the previously displayed 3–6 s sweep.
    # This is a labelled local example, not a new fit or a full-record result.
    detail = (3., 4.)
    detail_mask = (elapsed >= detail[0]) & (elapsed <= detail[1])
    detail_values = np.concatenate([v[detail_mask] for v in [cam, before, after]])
    detail_pad = .12 * np.ptp(detail_values)
    detail_ylim = (float(detail_values.min() - detail_pad), float(detail_values.max() + detail_pad))
    residual_limit = float(max(np.max(np.abs((cam-v)[detail_mask])) for v in [before, after]) * 1.12)
    lut = yaml.safe_load(args.gripper_lut.read_text())

    for mobile in [False, True]:
        suffix = '-mobile' if mobile else ''
        width = 4.25 if mobile else 7.5
        # The forty points are measurements from the same board reconstruction.
        fig, ax = plt.subplots(figsize=(width, 3.75), layout='constrained')
        points = np.asarray(calibration['centered_points_mm'])
        for i, (axis, color) in enumerate(zip(['x', 'y', 'z'], [GREEN, CLAY, MUTED])):
            ax.plot(np.arange(1, len(points) + 1), points[:, i], 'o-', ms=3, lw=.7, color=color,
                    label=f'{axis}: SD {calibration["std_xyz_mm"][i]:.2f} mm')
        ax.axhline(0, color=LINE, lw=.8)
        ax.set(xlabel='Calibration pose (all 40)', ylabel='Board position − median (mm)', xlim=(0, 41))
        style(ax)
        ax.legend(loc='upper center', ncols=1 if mobile else 3, frameon=False, fontsize=9)
        save(fig, f'board-consistency{suffix}', args.output, args.preview_output)

        for mode, values, title in [('before', before, 'Before alignment'), ('after', after, 'After alignment')]:
            fig, (ax, residual, overview) = plt.subplots(3, 1, figsize=(width, 5), height_ratios=[2.5, 1.15, .65], layout='constrained')
            for target in [ax, overview]:
                target.plot(elapsed, cam, color=GREEN, lw=1.7, label='Camera · ArUco')
                target.plot(elapsed, values, color=CLAY, lw=1.35, linestyle=(0, (4, 2)), label='Quest · motion')
                style(target)
            ax.set(xlim=detail, ylim=detail_ylim, ylabel='Velocity (normalized)')
            ax.set_title('Same sweep · 3–4 s detail', loc='left', fontsize=11, pad=30)
            ax.legend(loc='lower left', bbox_to_anchor=(0, 1.01), ncols=1 if mobile else 2, frameon=False, fontsize=9, borderaxespad=0)
            ax.tick_params(labelbottom=False)
            difference = cam - values
            residual.fill_between(elapsed, 0, difference, color=CLAY, alpha=.15)
            residual.plot(elapsed, difference, color=CLAY, lw=1.2)
            residual.axhline(0, color=GREEN, lw=1)
            style(residual)
            residual.set(xlim=detail, ylim=(-residual_limit, residual_limit), ylabel='Difference', xlabel='Time in recording (s)')
            local_mse = float(np.mean(difference[detail_mask] ** 2))
            residual.text(.98, .94, f'Detail MSE {local_mse:.3f}', transform=residual.transAxes,
                          ha='right', va='top', fontsize=9, color=INK,
                          bbox={'facecolor': 'white', 'edgecolor': 'none', 'alpha': .85, 'pad': 1})
            overview.axvspan(*detail, color=GREEN, alpha=.2)
            overview.set(xlim=(0, float(elapsed[-1])), ylim=(ymin, ymax), xlabel='Time in full recording (s)', yticks=[])
            overview.spines['left'].set_visible(False)
            save(fig, f'latency-{mode}{suffix}', args.output, args.preview_output)

        fig, ax = plt.subplots(figsize=(width, 3.75), layout='constrained')
        x = [row['aruco_distance_px'] for row in lut['points']]
        y = [row['width_mm'] for row in lut['points']]
        ax.plot(x, y, color=GREEN, marker='o', lw=1.8, ms=6)
        for xx, yy in zip(x, y):
            ax.annotate(f'{yy:g}', (xx, yy), xytext=(0, 9), textcoords='offset points', ha='center', color=INK, fontsize=10)
        ax.set(xlabel='UMI marker separation (px)', ylabel='Physical contact gap (mm)', ylim=(0, 73), xlim=(245, 435))
        style(ax)
        save(fig, f'gripper-lut{suffix}', args.output, args.preview_output)

        fig, ax = plt.subplots(figsize=(width, 3.75), layout='constrained')
        streams = report['summary']['streams']
        names = ['RGB', 'Quest', 'Left tactile', 'Right tactile']
        values = [100 * streams[s]['source_reuse_fraction'] for s in ['rgb', 'quest', 'left', 'right']]
        bars = ax.barh(names[::-1], values[::-1], color=[CLAY, GREEN, '#a8b4a8', '#cbd0c7'], height=.44)
        for bar, value in zip(bars, values[::-1]):
            ax.text(value + 1, bar.get_y() + bar.get_height()/2, f'{value:.1f}%', va='center', fontsize=12, color=INK)
        ax.set(xlabel='Repeated source references\n(% of aligned records)' if mobile else 'Repeated source references after alignment (%)', xlim=(0, 49))
        ax.grid(axis='y', visible=False)
        ax.grid(axis='x', color=LINE, lw=.6)
        style(ax)
        ax.grid(axis='y', visible=False)
        save(fig, f'source-reuse{suffix}', args.output, args.preview_output)

    provenance = {'camera_detections': len(camera), 'quest_samples': len(quest), 'display_samples': len(t),
                  'estimated_offset_ms': offset * 1000, 'shown_detail_seconds': list(detail),
                  'detail_selection': 'First second of the previously displayed 3–6 s sweep; a local illustration, not the global fit metric.',
                  'detail_mse_before': float(np.mean((cam[detail_mask]-before[detail_mask])**2)),
                  'detail_mse_after': float(np.mean((cam[detail_mask]-after[detail_mask])**2)),
                  'detail_shared_ylim': list(detail_ylim), 'residual_shared_ylim': [-residual_limit, residual_limit],
                  'normalization': 'Full-record z-score, Quest center/scale held fixed between before/after.',
                  'position_to_signal': 'Camera-time interpolation, Gaussian sigma=1 sample, velocity gradient.',
                  'display_mse_before': float(np.mean((cam-before)**2)), 'display_mse_after': float(np.mean((cam-after)**2)),
                  'source_data_exclusions': 'None; full overview retained; common interpolation overlap used.'}
    (args.output / 'figure-provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
    print(json.dumps(provenance, indent=2))


if __name__ == '__main__':
    main()
