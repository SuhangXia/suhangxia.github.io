# Suhang Xia — personal research website

A production Astro website for [suhangxia.github.io](https://suhangxia.github.io). The design direction is **Scientific Editorial × Industrial Design**: large research-first typography, real robotics media, publication-like metadata, and a restrained scroll narrative.

The previous al-folio/Jekyll implementation remains recoverable from this repository's Git history. The current `master` branch contains the Astro source.

## Stack

- Astro static output
- TypeScript strictest mode
- GSAP and ScrollTrigger
- Modern CSS with design tokens
- Self-hosted variable Manrope and Newsreader fonts through npm
- Astro responsive image pipeline

## Run locally

```bash
npm install
npm run dev
```

Open the URL printed by Astro, normally `http://localhost:4321`.

Production verification:

```bash
npm run check
npm run build
npm run preview
```

## Pages

- `/` — complete visual prototype with Hero, thesis, sticky research story, featured work, outputs, and About preview
- `/research` — project overview and supporting media
- `/publications` — verified research outputs with type filters and a source caveat
- `/about` — biography, trajectory, contact links, and lab imagery
- `/404` — custom not-found page

## Structure

```text
src/
├── assets/media/        # Selected research and travel media, processed by Astro
├── components/          # Layout and narrative components
├── data/                # Replaceable site, project, and output content
├── layouts/             # Shared document shell
├── pages/               # Static routes
├── scripts/site.ts      # Header, GSAP, and ScrollTrigger behavior
└── styles/              # Tokens, global composition, motion fallbacks
public/media/            # Retained, browser-ready legacy demonstration MP4s
docs/                    # Asset audit, mapping, design rationale, screenshots
```

## Content changes

### Replace the Hero media

1. Add the image to `src/assets/media/`.
2. Change the `heroMedia` import/export in `src/data/projects.ts`.
3. Update the Hero alt text in `src/components/Hero.astro`.
4. Recheck desktop and mobile `object-position` rules in `src/styles/global.css`.

Use a real research image with clear ownership. The Astro image component generates responsive formats at build time.

### Edit projects

Project copy, media, themes, layouts, and evidence-backed links live in `src/data/projects.ts`. `ProjectFeature.astro` renders the shared content contract without forcing every project into the same visual card.

Tactile UMI is configured as the Home-page flagship project with a managed portable-collection preview. Its UniForce / vision-only comparison is grounded in the local manuscript, and its π0.5 route is kept separate from that comparison; both are documented in `docs/CLOTHUMI_EVIDENCE_NOTES.md`. The detail page also uses the English workflow, algorithm, collection, audit, and calibration assets from the Tactile UMI repository.

VTLA for Cloth Sorting is the newest thesis entry in the Research timeline. Fabric-Omni is presented inside it as the private dataset and TouchUntilCertain as the reliability-guided re-touch method. Its public-facing claim boundary is documented in `docs/VTLA_EVIDENCE_NOTES.md`; Tactile UMI remains the Home-page flagship project.

### Edit publications and outputs

Edit `src/data/publications.ts`. Every row must have verified title, authorship, context/status, year label, topics, and only links that exist. The old `_bibliography/papers.bib` contains theme demo data and must not be migrated as personal work.

A later production pass can replace the TypeScript file with an Astro content collection or a build-time BibTeX parser once a clean, author-verified bibliography is available.

### Edit travel photographs

The homepage travel journal is linked directly at `/#travels`. Photographs, captions, focal points, and portrait flags live in `src/data/journeys.ts`; `TravelGallery.astro` contains the responsive contact-sheet layout. Its desktop grid uses each photograph's `id`, so update the named grid areas when adding or removing entries. Phones show a single column with landscape and portrait proportions preserved.

Venice, Edinburgh, and Paris were copied from `/home/suhang/datasets2/video/旅行/威尼斯.jpg`, `爱丁堡.jpg`, and `巴黎.jpg`, respectively. The gallery produces responsive WebP images and loads larger images when opened. The viewer supports previous/next buttons, arrow keys, touch swipes, Escape, and focus restoration. With JavaScript disabled, each photograph links directly to its larger image. Entrance and hover motion respect reduced-motion preferences.

## Motion controls

GSAP timing and ScrollTrigger thresholds are in `src/scripts/site.ts`. Static reveal states and reduced-motion overrides are in `src/styles/motion.css`. To disable animation globally, remove the `initialiseMotion()` call; all content remains visible if the `has-js` reveal selectors are also removed or overridden.

Visitors using `prefers-reduced-motion: reduce` receive no GSAP scrub animation. The sticky story becomes a complete vertical document and all reveal-hidden content is made visible immediately.

## GitHub Pages

`astro.config.mjs` is configured with `site: 'https://suhangxia.github.io'` and root-path static output for this user-site repository. `.github/workflows/deploy.yml` automatically:

1. run `npm ci`;
2. run `npm run build`;
3. publish `dist/` to the existing `gh-pages` branch.

If the site is instead hosted under a project subpath, add the appropriate `base` option in `astro.config.mjs` and use Astro's base-aware URL handling before deployment.

Every push to `master` triggers a production deployment. The workflow can also be run manually from the Actions tab.

## Source assets and prototype status

Selected media was drawn from the retained project archive and the Tactile UMI repository. See `docs/ASSET_INVENTORY.md` for the audit and `docs/ASSET_MAPPING.md` for source-to-destination paths.

Public-facing claims retain the evidence boundaries documented alongside the project assets and manuscript notes.
