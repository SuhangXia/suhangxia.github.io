# VTLA for Cloth Sorting — website evidence notes

This note records the source and claim boundary for the public-facing thesis project. `VTLA for Cloth Sorting` is the project title, `Fabric-Omni` is its private research dataset, and `TouchUntilCertain` is its reliability-guided re-touch method.

## Sources inspected

- Final thesis PDF and LaTeX source: `/home/suhang/datasets2/msc_thesis/6a6e8425c6e3d7666b78def6`
- Dataset framing and contributor record: slide 2 of `/home/suhang/datasets2/video/individual_meeting.pptx`
- Implementation repository: `/home/suhang/projects/fabric-omni`
- Private session store: `/home/suhang/datasets/octopi_fabric_v2_latest_sessions`
- Catalogue-page archive: `/home/suhang/projects/test_code/2/octopi-1.5/label_pages`

The thesis is the authority for methods, metrics, limitations, and system boundaries. The meeting slide is used only to clarify the dataset framing and acquisition responsibilities.

## Public visual samples

The website includes RGB and force-aligned GelSight examples for F007, F044, F095, and F137. The tactile stills were extracted from each fabric's front-side `session_001` near the maximum recorded normal force: F007 at 10.990 s, F044 at 10.742 s, F095 at 25.471 s, and F137 at 30.329 s. The original MP4 and CSV files remain unchanged. Full source pages for F007 and F137 show catalogue provenance. These selected images are illustrative records, not a downloadable dataset subset.

## Claims used on the website

- Fabric-Omni contains 200 fabrics, 400 side-specific sessions, and 12,170 valid presses with two-sided RGB, GelSight sequences, and approximately 500 Hz ATI force records.
- Physical and catalogue-derived labels retain explicit provenance; catalogue metadata are not presented as independently measured laboratory targets.
- The probabilistic single-touch system predicts thickness and GSM and returns predictive scales from a frozen 17×384 tactile-token interface.
- TouchUntilCertain combines predictive scale, deterministic/probabilistic disagreement, and contact novelty to allocate one target-free, distinct same-side re-touch under a fixed sensing budget.
- On Development-170, thickness MAE changes from 0.1043 mm at one touch to 0.0935 mm at 1.5 average touches. The 10.4% gain has a paired 95% interval excluding zero and captures 78.8% of the fixed two-touch point gain.
- The GSM point result is favourable, but its paired interval crosses zero and is not described as a reliable improvement.
- Six robot episodes are qualitative integration demonstrations. TouchUntilCertain owns only STOP/RETOUCH, guarded Qwen owns only Yes/No/Abstain, and a deterministic registered executor owns motion.

## Claims intentionally excluded

- Fabric-Omni is not described as the overall project or as a public population-scale textile dataset.
- No end-to-end VTLA/VLA, learned robot-control, semantic-accuracy, robot-success-rate, or calibrated online re-touch-frequency claim is made.
- The exploratory π0.5-compatible checkpoint is not presented as a deployed inference or rollout result.
- Repeated presses are not counted as independent evidence, and the offline second press is not described as a learned or metrically controlled contact-location policy.
