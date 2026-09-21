# Puncture robot evidence

## Scope and provenance

Implemented from the approved project plan and Suhang Xia's first-hand method clarification.
The original decks remain private and unchanged under `/home/suhang/datasets2/video/`.
Only the 17 approved raster images are extracted, byte-for-byte, by
`python3 scripts/extract-puncture-evidence.py`. Existing assets with different bytes are
never replaced by that script. No embedded videos, full decks, unmasked certificate,
or complete private inspection report are added to the public build.

### Exact slide assets

| Deck / slide | Embedded asset | Website asset in `src/assets/media/percutaneous/evidence/` |
| --- | --- | --- |
| Lancet product presentation / 33 | image69.png | leica-tracker-p33.png (video poster) |
| 33 | image70.png | robot-workspace-p33.png |
| 33 | image71.png | robot-requirements-p33.png |
| 34 | image72.png | fixture-cad-p34.png |
| 34 | image73.png | fixture-workbench-p34.png |
| 34 | image74.png | system-requirements-p34.png |
| 34 | image75.png | broadcast-poster-p34.png (video poster; replaces duplicate broadcast image) |
| About Me / 10 | image34.jpeg | geometric-measurement-p10.jpg |
| 11 | image35.PNG | tool-calibration-p11.png |
| 12 | image38.jpeg, image39.jpeg | animal-ct-p12-a.jpg, animal-ct-p12-b.jpg |
| 13 | image40.png | animal-results-p13.png |
| 15 | image46.png | patent-CN120876553A.png |
| 15 | image47.png | patent-CN120070523A.png |
| 15 | image48.png | patent-CN120501514A.png |
| 15 | image49.png | patent-CN120053072A.png |
| 15 | image50.png | patent-CN120859655A.png |

The repeated slide logo is represented by the existing Lancet branding, not an evidence item.
About Me slide 13's image41.png is an old acceptance notice and is deliberately not extracted.
The existing privacy-masked NMPA certificate retains the `nmpa-registration` anchor.

## Confirmed method

- Independent contribution: robot calibration, fixture and TCP calibration, system-accuracy
  measurement algorithms, Leica laser-tracker inspection and report production.
- Leadership: design and direction of the animal study; leading the team in collaboration
  with Silver Snake Clinical Center in Guangzhou.
- CMM fixture geometry: assembled pillar-socket centres A–F and six separate divots a–f.
- CT: metal spheres in the sockets; recover sphere centres and directly select the six divots.
  The CT-side divot coordinates are not inferred from CMM-to-sphere registration.
- NDI probe pivot calibration precedes sampling. Six corresponding divots give landmark
  registration; 20 additional fixture-surface points give ICP refinement against CT.
- Tool geometry: CMM coordinates of three socket centres and adjacent conical-divot apices.
  Probing the apices registers this geometry to the tracked tool marker. Hand–eye calibration
  is a separate prerequisite for robot motion.
- A selected sphere centre defines the TCP origin; a second defines the axis. Only the
  origin and direction must align, not both sphere centres. Two points alone do not establish
  a unique full 6-DoF pose. Do not add unconfirmed roll selection or hand–eye solver details.
- Independent check: Leica SMR measures assembled pillar centres; preserve that reference,
  keep the fixture base fixed and remove pillars; command the robot; measure tool centres.
  Compare in the same valid Leica coordinate system. NDI estimates are not measurement truth.
- Point-to-point: actual TCP origin to reference target origin.
- Point-to-line: **actual TCP origin to planned reference line**, not the reverse.
- Angular error: consistent origin-to-second-point directions, reported in degrees.

## Results and claim boundaries

P33–34 are requirements: robot accuracy ≤0.5 mm, repeatability ≤0.2 mm;
system point-to-point and point-to-line ≤1.0 mm; line angle ≤1.0°.
No Leica measured values, standard identifiers, sample counts, passing statistics,
or report download are invented.

P13 is an animal-study report excerpt approved by Suhang for public presentation:

| Measure | Robot assistance | Conventional CT guidance |
| --- | --- | --- |
| Mean error | 0.54 mm | 4.63 mm |
| Standard deviation | 1.109 mm | 6.529 mm |
| First-attempt success | 27/30 (90%) | 16/30 (53.3%) |
| Total attempts | 34 | 52 |
| Mean attempts per target | 1.13 | 1.73 |

These fractions describe target evaluations, not 30 animals or participants.
Do not infer statistical significance, randomisation, independence of samples, animal
counts, ethics identifiers, human clinical performance, or unpublished error definitions.
The NMPA product milestone is distinct from both bench requirements and animal results.

## Patent records

Five A-kind front pages list the user as an inventor. The first three displayed entries
(CN120501514A, CN120053072A, CN120859655A) list 夏苏杭 first. CN120070523A lists him second;
CN120876553A lists him third. Original inventor names and order and applicant
浙江柳叶刀机器人有限公司 are transcribed in `src/data/patents.ts`.

The About section is titled Patent Applications, with historical Application publication
labels. It does not assert current pending/granted status, personal ownership of the
company's applications, or implementation in a particular product. English titles are
descriptive translations. No Publications or Research outputs navigation is restored.

## Interface and validation

- Original source images open in an accessible native dialog, with Escape/Close and focus
  restoration. Modified-click and no-JavaScript cases keep a full-image link.
- Responsive WebP versions preserve the full image, auto-orient via Astro, and cap display
  variants at 1920 px. The full-resolution original remains available on explicit opening.
- The workflow uses responsive native text, CSS lanes, and an inline SVG merging connector,
  not a rasterised flowchart or client-side Mermaid dependency. On narrow screens each
  branch becomes a full-width readable section and the independent reference remains explicit.
- Certificate and engineering galleries use unique heading IDs. One retained robot-arm
  rendering keeps its native video controls; the two mixed-reality videos are intentionally
  not included on the website. Project URLs, homepage selected-project order, and home-return
  logic are unchanged.

Checks: `npm run check`, `npm run build`, `python3 scripts/check-puncture-evidence.py`.
Browser acceptance can be run with `node scripts/check-puncture-ui.mjs`; supply a local
Playwright package via `PLAYWRIGHT_MODULE` if it is not already resolvable. The script serves
the existing static build on an ephemeral loopback port and writes screenshots only under
a new temporary directory. It does not install dependencies or alter website data.

Validation in the implementation sandbox: Astro check/build and the static regression
checks passed. Real-browser QA could not execute: loopback listening failed with
`listen EPERM`, and Chrome launch independently failed at Crashpad `setsockopt` with
`Operation not permitted`. Desktop/mobile screenshots and interactive browser assertions
are therefore not claimed as passed; the UI check remains available for a local run.
