# Tactile UMI calibration and execution evidence

Updated 2026-10-15 from read-only analysis of the supplied calibration and dataset records.

## Web figures and analysis contract

The page replaces the former Calibration Ledger with three adjacent figure/text modules:
spatial calibration and reuse, exUMI-inspired latency calibration, and causal observation
windows. The original architecture, tactile pretraining/adaptation, controlled trial
statistics, robot videos and on-demand Rerun replay remain in place.

The plots use Python/matplotlib, editable SVG and a separate readable mobile layout.
All forty calibration observations are included. The latency figure has a labelled
3–6 s detail plus the entire recorded signal; before/after retain identical axes,
camera-time interpolation and fixed full-record normalization. No values are inferred
from screenshot pixels. PNG QA previews and full per-episode statistics stay outside Git.

## Geometry and opening width

- UMI–Quest: 40 synchronized pose/image pairs, PARK hand–eye solver, fixed-board consistency validation. FR3 wrist-camera eye-in-hand calibration is a separate transform chain.
- Recomputed population translation SD: **1.671 / 3.088 / 1.909 mm**. The figure centers each axis on its median and shows every pose. This measures fixed-board reconstruction spread, not independent positioning accuracy.
- New deterministic hold-out check: fit 32 poses, hold out every fifth pose (8 total); median distance of held-out reconstructed board positions from the training-board median is **4.382 mm**. This is also an internal consistency check, not an externally measured tool error.
- The experimenter confirmed hardware changes between tasks and recalibration, followed by shared calibration for the unchanged 0619/0623 insertion setup. 77 aligned 0619 files embed the matrix; the other 145 episodes use the shared Zarr export matrix. YAML/JSON decimal serialization differs by less than 5×10⁻⁹; comparison uses absolute tolerance 10⁻⁷, not byte hashes. The inspected rigid rotation has determinant approximately +1 and an orthonormality residual below tolerance.
- Coordinate notation: A_T_B maps B coordinates to A. W_T_C = W_T_Q · Q_T_C; camera and TCP poses are distinct. The robot has its own base and flange/camera/TCP chain. Quest/Unity axis conversion is a change of basis, not a rigid hand–eye extrinsic.
- UMI width: ArUco IDs 2/3, five caliper-measured contact gaps of 8.7, 20, 30, 40 and 63 mm. Piecewise-linear interpolation maps pixel distance to physical contact-surface gap.
- Robotiq: the deployment adapter can invert a separate physical-width/driver-position LUT and applies unit conversion and command limits. UMI marker-distance calibration and robot driver calibration are distinct mappings.
- Sources: `tactile-umi/docs/01_setup_and_calibration_zh.md`; `Clothumi/outputs/umi_gripper_lut_id2_id3.yaml`; `template/src/franka_pose_tcp_server_tcp_tool.py`, `RobotiqGripperAdapter`.

## Three timing paths

| Path | Recorded value or method |
| --- | --- |
| Quest ↔ main RGB | Main camera trails Quest by 56.738 ms. Configuration offset is −56.738 ms because mapped time = arrival time − offset. |
| Tactile ↔ main RGB | Accepted relative offsets 0 / 25 ms; shared visual flicker and cross-correlation. Use session/slot metadata for assignment: the inspected H5 alignment records apply 25 ms to left_finger and 0 ms to right_finger. Sensor/device assignments changed during development, so a physical sensor name alone does not resolve a historical stream. |
| Policy inference → execution | Empirically selected action lookahead; user confirmed the second chunk row, zero-based index 1, after comparing indices in robot trials. No measured millisecond total was supplied. |

The user's final index clarification supersedes the earlier third-row description. The client supports selecting indices; its default does not prove the historical launch setting.

Sources: `tactile-umi/configs/latency/default.yaml`; `Clothumi/calibration/latency_calibration/delay_test_gelsight_usb_18p75fps_newroi/delay_result.json`; `tactile-umi/tools/franka_pose_tcp_client.py`; user's trial description and index clarification.

The Quest–camera implementation is adapted from **exUMI (Xu et al., CoRL 2025)**,
[§3.2 and Appendix A.2](https://arxiv.org/html/2509.14688v1#A1.SS2), with the
[formal paper record](https://proceedings.mlr.press/v305/xu25e.html) linked beside
the actual plot on the page. The recorded run has 437 camera detections and 1,814 Quest
samples. The local implementation adjusts the axis sign, interpolates Quest onto the
camera grid, uses Gaussian-smoothed velocity (sigma 1 sample), and searches normalized
MSE over a scalar offset. Recorded optimum: −56.738201732 ms. The before/after display
uses one shared Quest normalization; display MSE is 0.5228 / 0.4761, respectively.
These are curve agreement values, not a residual timing error in milliseconds.

## Read-only dataset results

All 223 raw H5 files were inspected for per-stream host timestamp order (78 from 0619,
145 from 0623). The existing aligned/exported corpus contains 222 episodes (77 / 145),
with **135,952 policy steps**. The analysis makes no new episode exclusions. No image or
video decoding is needed; it reads timestamp, index, pose and metadata arrays only.

| Quantity | RGB | Quest | Left tactile | Right tactile |
| --- | ---: | ---: | ---: | ---: |
| Median native host sampling interval (ms) | 32.397 | 13.824 | 35.916 | 53.389 |
| Repeated source references after alignment | 0 | 10 | 21,718 | 51,999 |
| Repeated references / aligned records | 0% | 0.0073% | 15.9487% | 38.1857% |

The denominator is 136,174 aligned records per stream, before removing one future-label
tail per episode. Duplicates are counted per episode as N − number of unique source
indices. Different episode clocks are never pooled into one timeline. This reuse can
be expected when a lower-rate stream is sampled on an RGB reference timeline.

- Raw host timestamps: no adjacent duplicates or backwards steps in the inspected streams.
- All selected source indices are in range; recomputed nearest selections, corrected times
  and stored indices agree exactly. No absolute mapped reference residual exceeds 100 ms.
- Six-record tactile windows: no out-of-episode indices, future mapped-time entries,
  index-rule, per-frame validity-mask or stored-age mismatches.
- Full windows: left 134,726; right 134,722. Episode-start partial windows: 1,226 / 1,230.
- Full windows containing a reused native source frame: left 67,071; right 134,719.
  Six records therefore do not necessarily represent six distinct captured images.
- Latest mapped-frame age: median 19.744 / 27.189 ms; p95 46.108 / 54.087 ms;
  maximum 90.172 / 178.216 ms (left/right). Right-side age exceeds 100 ms at 403 policy
  steps; per-episode half-open policy-step intervals are stored in the independent JSON.
  These remain recorded diagnostics; no source data or training results were changed.
- Stored action targets match next-frame absolute camera pose/gripper values exactly for
  all checkable within-episode pairs. `action_target_offset_steps=1`; the final target of
  each episode is not compared to the next episode. The dataset subsequently converts
  absolute targets to relative SE(3), independently of execution chunk index selection.

Camera host times are taken after camera read; Quest times are host packet receipts.
Mapped times subtract configured offsets. The records do not include completion times
for the entire preprocessing pipeline or a logged policy decision deadline. Consequently,
the website's availability view is **illustrative**: reference 0 ms, decision +80 ms,
matching tolerance ±60 ms; assumed RGB/Quest/left/right availability lags 55/10/35/90 ms.
The selector chooses the closest matching observation subject to availability. It does
not equate mapped timestamps with physical capture or prove online readiness. A state
received after the reference but before decision can support appropriate interpolation;
future action labels are supervision, not observation-input leakage.

## Reproduce

From the website repository, use the existing Clothumi environment. Prepending its
site-packages avoids an incomplete user-site OpenCV shadowing `calibrateHandEye`.
The existing project and original data are read-only inputs; choose a fresh output directory.

```bash
export PYTHONPATH=/home/suhang/anaconda3/envs/clothumi/lib/python3.10/site-packages
PY=/home/suhang/anaconda3/envs/clothumi/bin/python

$PY scripts/analyze-tactile-engineering.py \
  --clothumi-root /home/suhang/projects/Clothumi \
  --raw-root /home/suhang/datasets/clothumi \
  --zarr /home/suhang/projects/Clothumi/outputs/train_data/clothumi_0619_0623_camera_inverse_uniforce_tactile_clean_alltrain_dp.zarr \
  --hand-eye-dir /home/suhang/projects/ViTaMIn-B_code/hand_eye_charuco_11x8_measured_right_v3_robot_intrinsics_40 \
  --output /home/suhang/projects/Clothumi/outputs/website_engineering_20261015 \
  --public-json public/data/tactile-umi-engineering.json

$PY scripts/plot-tactile-engineering.py \
  --analysis /home/suhang/projects/Clothumi/outputs/website_engineering_20261015/analysis.json \
  --latency-dir /home/suhang/projects/Clothumi/calibration/latency_calibration/outputs_latency_calibration/quest_camera/live_20260430_163800 \
  --gripper-lut /home/suhang/projects/Clothumi/outputs/umi_gripper_lut_id2_id3.yaml \
  --clothumi-root /home/suhang/projects/Clothumi \
  --output src/assets/media/tactile-umi/engineering \
  --preview-output /home/suhang/projects/Clothumi/outputs/website_engineering_20261015/figure-previews

$PY scripts/test-tactile-engineering.py
node --experimental-strip-types --test scripts/test-tactile-timing.mjs
npm run check
npm run build
node scripts/check-tactile-engineering-ui.mjs
```

For the last command, set `PLAYWRIGHT_MODULE` to the installed Playwright entry module
when it is outside this repository, and optionally `TACTILE_UI_OUTPUT` to a separate
screenshot directory. The browser check covers 1440/1024/390 px, all switches, stable
figure-area heights, keyboard navigation, old anchors, video controls, no-JS, Chinese,
and no RRD/WASM request before replay interaction. Isolated section screenshots hide
the fixed site header/skip link only while capturing; whole-page screenshots retain them.

Figure-source preflight has no failing checks. Its submission-specific TIFF, 600-dpi
and journal-width warnings do not apply to the responsive web SVG deliverable; separate
300-dpi PNG and editable PDF previews are retained for local review.

`analysis.json` is the independent full per-episode analysis; the small public JSON only
contains aggregated results and the calibration plot values, with no original H5/Zarr
paths, images or video payloads. Synthetic test cases are in separate test files and are
never mixed into the real-data figures. The core analysis reuses existing H5/nearest-index,
causal-window and hand–eye parsers; it does not replace data collection or training code.

## Impedance control

The robot server imports Polymetis `RobotInterface`, starts an impedance controller and updates desired targets during policy execution. It supports joint and Cartesian impedance, with joint impedance the local default. The page and CV therefore state Polymetis impedance control without attributing an unverified historical controller mode or loop rate.

DROID also uses Polymetis, but the Tactile UMI camera-relative TCP bridge and Robotiq mapping are project-specific integrations.

Sources: `template/src/franka_pose_tcp_server_tcp_tool.py`; `droid/droid/franka/robot.py`; https://droid-dataset.github.io/droid/docs/software-setup

## Frequency and latency are separate quantities

- Local GPU detected: NVIDIA GeForce RTX 5070 Ti Laptop GPU, approximately 12 GB VRAM.
- Client loop default: maximum 30 Hz (`DEFAULT_RATE_HZ`), with synchronous acquisition, prediction, send and acknowledgement before sleep. A requested loop rate is not a measured throughput.
- Client DDIM default: 20 denoising steps (`--num-inference-steps`). Project training configuration: 16 inference steps. The client overrides the checkpoint setting at runtime.
- The user remembers approximately 20 Hz but cannot identify whether it was configured or timed. Do not publish 20 Hz, 50 ms total delay or a faster measured result as a project metric.
- The second future action's time target also depends on training sample spacing and future-label offset, not solely the control loop's nominal rate.
- Available inspected local DP weights belong to an earlier vision-only configuration; timing them would not establish throughput of the deployed UniForce-conditioned policy.

To establish throughput, time the actual checkpoint after warm-up with CUDA synchronization, report median/p95 for prediction and the complete acquisition-to-acknowledgement cycle, and record DDIM steps, precision, input shapes, tactile feature path and laptop power mode.
