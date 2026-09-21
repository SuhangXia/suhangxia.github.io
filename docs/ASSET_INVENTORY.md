# Legacy asset inventory

Source repository: `/home/suhang/projects/suhangxia.github.io`

Audit date: 2026-08-21. The source repository was inspected read-only. Dimensions were read with ImageMagick and FFprobe; file sizes are approximate. “Crop” describes likely editorial treatment, not a change made to the source file.

## Shortlist and selected media

| Legacy path | Type | Dimensions / duration | Size | Likely subject | Hero | Project section | Background | Crop / treatment |
|---|---:|---:|---:|---|---|---|---|---|
| `assets/img/Project2/LP_needle.jpg` | JPEG | 4032×3024 | 4.59 MB | Robot-guided puncture phantom experiment | **Yes** | **Yes** | Yes | Landscape crop; hold instrument and phantom in frame |
| `assets/img/Project2/LP_MITK.jpg` | JPEG | 4032×3024 | 5.26 MB | Medical imaging / planning interface | No | **Yes** | No | Landscape crop around display |
| `assets/img/Project2/LP_target.jpg` | JPEG | 4032×3024 | 1.93 MB | Instrument and physical target | Possible | **Yes** | Yes | Landscape crop around interaction point |
| `assets/img/Project2/NS_Robot.jpg` | JPEG | 4032×3024 | 5.56 MB | Surgical robot platform | Possible | **Yes** | Yes | Wide crop; retain robot and workstation |
| `assets/img/Project2/NS_Chain.jpg` | JPEG | 800×531 | 95.7 KB | Robot coordinate-chain diagram | No | **Yes** | No | Contain; do not crop labels |
| `assets/img/Project5/DeCo-MAE-teaser.png` | PNG | 2816×1536 | 4.49 MB | DeCo-MAE concept teaser | No | **Yes** | No | Contain on neutral field |
| `assets/img/Project5/architecture_new.png` | PNG | 2816×1536 | 4.87 MB | DeCo-MAE dual-head architecture | No | **Yes** | No | Contain; preserve diagram text |
| `assets/img/Project5/attention_map.png` | PNG | 1600×800 | 954 KB | Cross-modal attention visualisation | No | **Yes** | No | Wide contain crop |
| `assets/img/Project1/egoResult.png` | PNG | 1749×933 | 1.16 MB | Reconstructed scene and simulated UAV path | Possible | **Yes** | Possible | Wide contain crop |
| `assets/img/Project1/ROSFrame.png` | PNG | 1149×663 | 396 KB | ROS / PX4 platform architecture | No | **Yes** | No | Contain; do not crop labels |
| `assets/img/prof_pic.jpg` | JPEG | 806×1080 | 242 KB | Portrait of Suhang Xia | No | About | No | 3:4 portrait crop |
| `assets/img/posts/dental_tools.jpg` | JPEG | 4032×3024 | 537 KB | Surgical robot controls / tools | Possible | About | Possible | Wide detail crop |
| `assets/video/NS_Navi.mp4` | MP4 | 1280×720 · 24.77 s | 5.16 MB | Neurosurgical robot navigation | Possible | **Yes** | No | Native 16:9; metadata preload only |

All 13 assets above were selected. Twelve images are processed by Astro's responsive image pipeline; the MP4 is copied to `public/media/` for direct playback.

## Other reviewed candidates

| Legacy path | Type | Dimensions / duration | Size | Likely subject | Hero | Project section | Background | Crop / treatment |
|---|---:|---:|---:|---|---|---|---|---|
| `assets/video/MR_1.mp4` | MP4 | 1280×720 · 36.90 s | 7.08 MB | Mixed-reality surgical visualisation | Possible | Yes | No | 16:9; omitted to avoid multiple heavy videos |
| `assets/video/MR_2.mp4` | MP4 | 1280×720 · 68.47 s | 13.82 MB | Mixed-reality deployment | No | Yes | No | Long; omitted for first-load weight |
| `assets/video/NS_RenderingProbe.mp4` | MP4 | 1280×720 · 15.00 s | 3.17 MB | Probe rendering / navigation | No | Yes | No | 16:9; overlaps selected navigation video |
| `assets/video/RenderingRobotArm.mp4` | MP4 | 544×960 · 19.33 s | 6.03 MB | Portrait robot-arm rendering | No | Possible | No | Portrait; weak fit for full-width layouts |
| `assets/img/MR.gif` | GIF | 400×225 | 6.02 MB | Mixed-reality sequence | No | Possible | No | Low resolution and heavy; omit |
| `assets/img/NS.gif` | GIF | 400×225 | 6.09 MB | Neurosurgical robot sequence | No | Possible | No | Low resolution and heavy; omit |
| `assets/img/uav _ego.gif` | GIF | 800×450 | 679 KB | UAV EGO-Planner result | No | Possible | No | Irregular GIF frames; static result is clearer |
| `assets/img/Project1/ego-planner.png` | PNG | 1141×857 | 645 KB | EGO-Planner diagram | No | Yes | No | Contain; omitted from visual prototype |
| `assets/img/Project1/AStar.png` | PNG | 1209×755 | 322 KB | A* planning result | No | Yes | No | Contain; secondary technical figure |
| `assets/img/Project1/ComparePosition.png` | PNG | 1767×855 | 497 KB | Controller comparison plots | No | Yes | No | Contain; secondary technical figure |
| `assets/img/posts/foce_sensor_on_robot.jpg` | JPEG | 3024×4032 | 554 KB | Force sensor close-up | Possible | Possible | Possible | Portrait crop; context uncertain |
| `assets/img/posts/dental_robot.jpg` | JPEG | 3024×4032 | 624 KB | Surgical robot environment | Possible | Yes | Possible | Portrait crop |
| `assets/img/posts/work_env8.jpg` | JPEG | 1920×1080 | 722 KB | Engineering workspace | No | About | Possible | Wide crop; visually less distinctive |
| `assets/img/prof_pic_color.png` | PNG | 2880×3840 | 14.38 MB | Colour portrait | No | About | No | Strong portrait, but oversized duplicate |
| `assets/img/news/UCL2.JPG` | JPEG | 1440×1080 | 271 KB | UCL event photograph | No | About | No | Event-specific; not central to research narrative |
| `assets/video/pexels-engin-akyurt-6069112-960x540-30fps.mp4` | MP4 | 960×540 · 11.57 s | 1.54 MB | Stock-style visual | No | No | No | Explicitly excluded from the new site |
| `assets/video/tutorial_al_folio.mp4` | MP4 | 1352×720 · 139.60 s | 25.99 MB | Theme tutorial | No | No | No | Template asset; excluded |

## Audit findings

- The repository contains useful surgical robotics material, DeCo-MAE diagrams, UAV simulation figures, a portrait, and lab photographs.
- Within this legacy source, there is no locally verifiable Fabric-Omni, Gameleon, AdaPCC, GelSight, or cloth-manipulation media.
- Within this legacy source, the strongest image-led narrative is image-guided surgical robotics. The new site separately maps the VTLA thesis and its Fabric-Omni dataset to final thesis assets in `docs/ASSET_MAPPING.md`.
- The old `papers.bib` is still the al-folio Einstein demo bibliography. None of those entries should appear as Suhang Xia's publications.
- There is no verified CV PDF. The `assets/pdf/example_pdf.pdf` file is a template example, so the CV navigation item is intentionally hidden.
