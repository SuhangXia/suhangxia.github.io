# Asset source mapping

Every published media asset has an explicit project-owned or legacy source. No stock or generated research imagery is used.

| New path | Legacy read-only source | Used in | Treatment |
|---|---|---|---|
| `src/assets/media/hero-surgical-robot.jpg` | `assets/img/Project2/LP_needle.jpg` | Home Hero; scroll story | Responsive AVIF/WebP generation; CSS object crop and slow scale |
| `src/assets/media/surgical-imaging.jpg` | `assets/img/Project2/LP_MITK.jpg` | Scroll story | Responsive image; editorial crop |
| `src/assets/media/surgical-target.jpg` | `assets/img/Project2/LP_target.jpg` | Scroll story | Responsive image; editorial crop |
| `src/assets/media/robot-platform.jpg` | `assets/img/Project2/NS_Robot.jpg` | Scroll story; Research | Responsive image; wide crop |
| `src/assets/media/robot-chain.jpg` | `assets/img/Project2/NS_Chain.jpg` | Research evidence | Responsive image; contained to preserve labels |
| `src/assets/media/deco-teaser.png` | `assets/img/Project5/DeCo-MAE-teaser.png` | Home; Research | Responsive image; contained on paper background |
| `src/assets/media/deco-architecture.png` | `assets/img/Project5/architecture_new.png` | Research evidence | Responsive image; contained to preserve architecture labels |
| `src/assets/media/deco-attention.png` | `assets/img/Project5/attention_map.png` | Research evidence | Responsive image; contained |
| `src/assets/media/uav-simulation.png` | `assets/img/Project1/egoResult.png` | Home; Research | Responsive image; contained |
| `src/assets/media/uav-system.png` | `assets/img/Project1/ROSFrame.png` | Research evidence | Responsive image; contained to preserve labels |
| `src/assets/media/portrait.jpg` | `assets/img/prof_pic.jpg` | Home About preview; About | Responsive portrait; restrained desaturation |
| `src/assets/media/lab-controls.jpg` | `assets/img/posts/dental_tools.jpg` | About | Responsive image; wide detail crop |
| `public/media/neurosurgical-navigation.mp4` | `assets/video/NS_Navi.mp4` | Research | Direct MP4, controls enabled, muted/inline, metadata preload |
| `src/assets/media/vtla-fabric-omni-dataset.png` | MSc thesis `figures/dataset/fabric_omni_acquisition_examples.png` | VTLA research evidence | Final dataset figure; responsive AVIF generation |
| `src/assets/media/vtla-single-touch-architecture.png` | MSc thesis `figures/method/p0_single_touch_architecture.png` | VTLA research evidence | Final probabilistic single-touch architecture |
| `src/assets/media/vtla-touch-until-certain.png` | MSc thesis `figures/method/touch_until_certain_method.png` | Home fallback; VTLA research evidence | Final TouchUntilCertain method figure |
| `src/assets/media/vtla-budget-comparison.png` | MSc thesis `figures/results/budget_05_policy_comparison.png` | VTLA research evidence | Final primary-budget policy comparison |
| `src/assets/media/vtla-robot-workcell.jpg` | MSc thesis `figures/hardware/real_robot_workcell.jpg` | VTLA research evidence | Real qualitative integration workcell |
| `src/assets/media/vtla-end-effector.jpg` | MSc thesis `figures/hardware/custom_end_effector_closeup.jpg` | VTLA research evidence | Custom GelSight–ATI end-effector photograph |
| `src/assets/media/vtla-samples/f007-front.jpg`, `f044-front.jpg`, `f095-front.jpg`, `f137-front.jpg` | Private Fabric-Omni `F*/fabric_rgb/front.jpg` records | VTLA visual sample grid | Exact copies; responsive AVIF generation and CSS crop only |
| `src/assets/media/vtla-samples/*-touch-peak.jpg` | Matching Fabric-Omni front-side `session_001/gelsight.mp4` | VTLA visual sample grid | One frame extracted near the session's maximum recorded normal force; source video unchanged |
| `src/assets/media/vtla-samples/f007-label-page.jpg`, `f137-label-page.jpg` | Catalogue archive `label_pages/page_007.jpg`, `page_137.jpg` | VTLA provenance spread | Exact copies; responsive AVIF generation |

Legacy source root: `/home/suhang/projects/suhangxia.github.io`

The copied filenames are deliberately semantic so future content replacement does not leak old Jekyll naming conventions into components. Image imports live in `src/data/projects.ts`; replacing a project asset generally requires changing one import rather than editing presentation components.

## ClothUMI

ClothUMI is currently represented by intentionally empty media fields. No image, video, training plot, or debug frame was copied from `/home/suhang/projects/Clothumi`. Its website-native comparison block is sourced from the local manuscript rather than a raster asset. Required original captures and planned page positions are documented in `docs/CLOTHUMI_MEDIA_PLAN.md`; the manuscript evidence boundary is recorded in `docs/CLOTHUMI_EVIDENCE_NOTES.md`.

## VTLA for Cloth Sorting

The project page uses final figures exported from the MSc thesis plus a small, explicitly sourced visual sample from the private collection. Fabric-Omni is presented as the dataset, TouchUntilCertain as the allocation method, and the workcell imagery as qualitative integration evidence. The website retains the thesis limitations alongside the reported Development-170 metrics and does not provide data files or download links.

## ICRA submission status

- `src/assets/brand/icra-white.svg`: complete white primary mark extracted as vector paths from page 5 of the [official ICRA brand guidelines](https://2026.ieee-icra.org/wp-content/uploads/2024/11/23-TA-11-019-FExD-ICRA-Brand-Guidelines-1-RGB.pdf), linked by the [ICRA 2027 brand page](https://2027.ieee-icra.org/about/brand-identity-and-guidelines/). The black demonstration background is excluded; the original proportions, subtitle and trademark are retained. The year is independent HTML text, not an alteration of the mark.
- `src/assets/brand/ras-white.png`: transparent white [RAS mark supplied by the ICRA 2027 website](https://2027.ieee-icra.org/wp-content/uploads/sites/4/2024/04/ras-white-logo.png), retained alongside the primary mark. Both marks are served locally, with surrounding whitespace.
- `src/data/site.ts` holds the conference, year, submission status and public copy. The card represents a co-authored submission under review, not acceptance, publication or conference endorsement. No manuscript details or author ranking are disclosed.
