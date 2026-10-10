# Tactile UMI calibration and execution evidence

Checked against the collection and deployment source on 2026-10-10.

## Geometry and opening width

- UMI–Quest: 40 synchronized pose/image pairs, PARK hand–eye solver, fixed-board consistency validation. FR3 wrist-camera eye-in-hand calibration is a separate transform chain.
- UMI width: ArUco IDs 2/3, five caliper-measured contact gaps of 8.7, 20, 30, 40 and 63 mm. Piecewise-linear interpolation maps pixel distance to physical contact-surface gap.
- Robotiq: the deployment adapter can invert a separate physical-width/driver-position LUT and applies unit conversion and command limits. UMI marker-distance calibration and robot driver calibration are distinct mappings.
- Sources: `tactile-umi/docs/01_setup_and_calibration_zh.md`; `Clothumi/outputs/umi_gripper_lut_id2_id3.yaml`; `template/src/franka_pose_tcp_server_tcp_tool.py`, `RobotiqGripperAdapter`.

## Three timing paths

| Path | Verified value or method |
| --- | --- |
| Quest ↔ main RGB | Main camera trails Quest by 56.738 ms. Configuration offset is −56.738 ms because mapped time = arrival time − offset. |
| Tactile ↔ main RGB | Left custom GelSight offset 0 ms; right GelSight Mini lag 25 ms. Shared visual flicker and cross-correlation. |
| Policy inference → execution | Empirically selected action lookahead; user confirmed the second chunk row, zero-based index 1, after comparing indices in robot trials. No measured millisecond total was supplied. |

The user's final index clarification supersedes the earlier third-row description. The client supports selecting indices; its default does not prove the historical launch setting.

Sources: `tactile-umi/configs/latency/default.yaml`; `Clothumi/calibration/latency_calibration/delay_test_gelsight_usb_18p75fps_newroi/delay_result.json`; `tactile-umi/tools/franka_pose_tcp_client.py`; user's trial description and index clarification.

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
