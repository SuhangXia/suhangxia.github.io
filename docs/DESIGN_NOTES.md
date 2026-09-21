# Design notes

## Concept: scientific editorial × industrial instrument

The site is designed as a research narrative rather than a résumé dashboard. Warm paper backgrounds support long-form reading; charcoal sections make the robotics media feel like instrument documentation; a single surgical red accent marks sequence, state, and source metadata. Borders are hairlines, corners remain nearly square, and there are no decorative shadows or floating card surfaces.

The strongest source material is surgical robotics, so the homepage starts with a close physical interaction between instrument, robot, and phantom. This gives the visual system a truthful subject and allows the site to move from identity → question → integrated system → related projects → outputs → person.

## Reference principles translated into the implementation

### Stanford REAL Lab

The implementation borrows the principle of scale and scroll-controlled media, not its assets or code. The Hero uses a name at display scale, a real full-height research image, and a long first viewport. The flagship story keeps media fixed while four concise stages change with the reader's scroll. Motion is limited to masked type, clip-path expansion, crossfade, and small scale changes.

### Danijar Hafner

The homepage states a research question before listing work. The Research Thesis introduces one problem—how perception becomes precise physical action—then names Perception, Touch, and Interaction as a compact conceptual index. Output rows use publication-like typography and provenance rather than promotional cards.

### Apple / Intuitive Surgical

Projects receive significant vertical space and a single dominant visual. Each block has one short question, one supporting paragraph, and only evidence-backed links. Alternating dark, paper, and image-led compositions create rhythm without using a reusable rounded-card grid.

## Why there are no conventional project cards

The source projects differ substantially: a physical surgical system, a video-understanding model, and a simulated UAV platform. Equal cards would flatten those differences and encourage metadata clutter. The page instead changes composition per project while preserving common type, spacing, rule, and link behavior.

## Motion system

The motion language has five primitives:

1. Hero text moves through line masks after page load.
2. The Hero image opens from a constrained crop, then expands to full frame as the reader leaves the first screen.
3. Supporting metadata fades early so the image becomes the visual bridge to the next section.
4. Section rules and copy reveal once with restrained vertical movement.
5. The desktop research story crossfades four media layers under a sticky frame; a thin progress line and two-digit counter expose state.

GSAP is used only where timing or ScrollTrigger coordination adds value. Header state and the accessible mobile menu use small native event handlers. There is no scroll-jacking, pointer-following effect, bounce, or continuous ambient animation.

## Responsive behavior

- At wide desktop sizes, the Hero uses a right-weighted crop and large editorial name; story media occupies the dominant left column.
- Near tablet sizes, type scales down, copy columns narrow, and project compositions retain their hierarchy.
- Below 900 px, the sticky story becomes a normal sequence: each stage includes its own image directly above its text.
- Below 768 px, the navigation becomes a full-height, keyboard-dismissible menu and all major layout grids collapse intentionally.
- At 390 px, Hero copy moves into the lower image field, section titles use viewport-clamped sizing, filters scroll horizontally, and output links remain tap-sized.

## Reduced motion

`prefers-reduced-motion: reduce` disables GSAP initialisation entirely. Hidden reveal states are reset in CSS, the Hero becomes a standard viewport instead of a long scrub region, and the story changes from sticky/crossfade behavior to a complete vertical sequence. No content depends on animation state.

## Content and asset limitations

- The legacy site says the current research interest is vision–tactile–language–action models and cloth sorting, but it contains no matching local project media. The prototype therefore states that interest in copy while using surgical robotics for the main evidence-led visual story.
- The legacy source repository contains no Fabric-Omni, Gameleon, AdaPCC, GelSight, or cloth-manipulation media. The VTLA thesis project is sourced separately from its final manuscript figures and hardware record; the other missing projects are still not invented.
- The source bibliography contains al-folio demo entries about Albert Einstein. The Publications page excludes them and lists only a linked DeCo-MAE report and the documented UAV dissertation.
- The DeCo-MAE page contains strong numerical claims; the prototype does not repeat those numbers outside the source-linked project context. They should be verified before launch.
- There is no genuine CV PDF in the legacy repository, so the CV item is hidden.

ClothUMI is the Home-page flagship project and the second, systems-focused entry in the Research timeline. Until original UMI collection and Franka rollout media is supplied, its project field uses a neutral acquisition-state composition rather than substituting repository debug imagery. The Research page exposes four planned evidence positions—Demonstrate, Align, Encode, and Compare—and a manuscript-grounded comparison block. The Diffusion Policy result is deliberately qualified as preliminary and not statistically significant; the π0.5 route is described separately without an inferred quantitative claim.

VTLA for Cloth Sorting is the newest thesis project in the Research timeline. Its page distinguishes the Fabric-Omni dataset, the TouchUntilCertain allocation method, and the guarded scripted robot integration, using figures exported from the final thesis. ClothUMI remains first on the Home page and is explicitly labelled the flagship system project, so chronology does not override project emphasis.

## Highest-priority future replacements

1. Replace or expand the Hero/story media with current KCL tactile or cloth-manipulation experiments, with precise captions and permissions.
2. Replace provisional biography and affiliation wording with an up-to-date author-approved version.
3. Add a verified publication export (BibTeX or structured metadata) and correct Paper / Project / Code / Video links.
