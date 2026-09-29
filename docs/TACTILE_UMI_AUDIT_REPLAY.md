# Tactile UMI public audit replay

The Tactile UMI detail page embeds one read-only Rerun recording. It is an illustrative data-inspection sample, not an online connection to the private Audit application.

- Source: local `0623/traj_000001.h5` collection episode (not copied into this repository).
- Exported asset: `public/media/tactile-umi/audit-episode-000001.rrd`.
- Rerun Python SDK / web viewer: `0.31.4`; the versions must remain compatible.
- Export options: right hand, Quest TCP source, camera pose frame, stride 4, base 30 FPS, JPEG quality 55, images included. The recording contains 138 sampled frames across approximately 18 seconds.
- Preview: `public/media/tactile-umi/audit-episode-000001-preview.png`, captured from the local Rerun viewer.
- The archived audit used `relative_action_audit` with IK checks disabled and collision checks skipped. Do not describe this recording as proof of IK feasibility, robot execution, or task success.
- The public `.rrd` contains only this selected trajectory's viewer streams: wrist RGB, two tactile streams, camera trajectory, and gripper width. It is intentionally loaded only after visitor interaction.

The static viewer page imports the pinned web viewer from `esm.sh` on demand; if that service is unavailable, the poster remains visible until visitors open the replay and the viewer displays an error. The original H5 dataset and audit outputs remain outside this repository.
