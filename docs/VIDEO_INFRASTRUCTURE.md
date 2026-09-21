# Research video infrastructure

This website remains a static Astro site on GitHub Pages. Tencent Cloud COS supplies only browser-playable research media; there is no backend, VOD, CDN, database, custom domain, or browser-side cloud credential.

## COS target and access model

- Provider: Tencent Cloud Object Storage (COS)
- Bucket: `suhangxia-media-1255615484`
- Region: `ap-hongkong`
- Bucket ACL: private
- Website media ACL: explicitly `public-read` on individual files uploaded by `scripts/video/`

The scripts deliberately never change the bucket ACL. Public objects live below `public/`; private material remains below `private/` and is not listed by the website tools.

```text
public/
  videos/
    hero/
    previews/
    demos/
  posters/
private/
```

## Local setup

The runtime uses npm and the official `cos-nodejs-sdk-v5` package. Install after network access is available:

```bash
cd /home/suhang/projects/suhangxia-site-v2
npm install
```

Keep credentials in `.env.local` only. It is ignored by Git and should remain mode `600` on Linux.

```bash
cp .env.example .env.local
chmod 600 .env.local
```

Fill the two credential variables locally, then keep the bucket and region values from `.env.example`. Never put credentials in Astro source, browser code, docs, issues, commits, or a deployment secret intended for a static page.

## CORS and connectivity

```bash
npm run video:check
npm run video:cors
npm run video:check
```

`video:cors` reads the existing CORS configuration first. It adds a rule only when needed, preserving existing explicit rules. The managed rule permits `GET` and `HEAD` from:

- `https://suhangxia.github.io`
- `http://localhost:4321`
- `http://127.0.0.1:4321`

It intentionally refuses to silently preserve or merge a wildcard-origin rule; review any such pre-existing rule in COS before continuing. The CORS rule permits media reading, not public writes.

`video:check` authenticates with the local CAM sub-user, performs a bucket `HEAD`, lists at most five keys under `public/`, and reads the CORS rule. It does not list other buckets or account resources.

## Processing, upload, and verification

Source footage is never overwritten. Processing writes only to ignored `.video-work/`, produces H.264 MP4 with faststart, stays within 1920×1080 and 30 fps, and creates a WebP poster. Add `--preview` to also create a muted 10-second preview; `--preview-start` selects its source timestamp.

```bash
npm run video:process -- /path/to/source.mp4 --id clothumi-umi-demo --preview --preview-start 0
```

Upload accepts only an MP4 located under `.video-work/`; this prevents an accidental raw-footage upload. A matching poster is automatically picked up when it follows the generated `<id>.poster.webp` name.

```bash
npm run video:upload -- .video-work/clothumi-umi-demo.web.mp4 \
  --id clothumi-umi-demo \
  --project clothumi \
  --title "ClothUMI portable UMI demonstration" \
  --preview .video-work/clothumi-umi-demo.preview.mp4
```

Add `--preview-key-suffix name` when a reviewed preview needs a new cache-safe derivative key while the full demo keeps its existing ID. To update only the poster and short preview of an already managed public video, use the dedicated dry-run-first workflow:

```bash
npm run video:preview:update -- /path/to/source.mp4 \
  --id managed-video-id \
  --preview-start 200 \
  --variant midpoint

npm run video:preview:update -- /path/to/source.mp4 \
  --id managed-video-id \
  --preview-start 200 \
  --variant midpoint \
  --confirm
```

This command creates only a muted ten-second H.264 preview and WebP poster. It refuses unknown managed records and existing unowned object keys, leaves the full demo object untouched, uploads the two new derivatives with object-level `public-read`, updates the existing metadata record, and verifies public delivery.

The uploader rejects an existing COS key unless it is already recorded as script-managed metadata and `--replace` is explicitly supplied. It uploads the video/poster/optional preview with object-level `public-read` ACL and then writes one record to `src/data/videos.ts`.

```bash
npm run video:list
npm run video:verify -- clothumi-umi-demo
```

Verification is unauthenticated and only reads a small byte range. It checks HTTPS `HEAD`, a `Range: bytes=0-1023` request, H.264 MP4 content type, explicit CORS response headers, and that the CORS preflight does not permit cross-origin `PUT`. COS writes and deletes still require CAM authentication; the static site never has those credentials.

### One safe test upload

The current repository contains a small legacy surgical-navigation MP4. Once the SDK is installed and connectivity works, use this exact one-video test sequence:

```bash
npm run video:process -- public/media/neurosurgical-navigation.mp4 --id surgical-navigation-test
npm run video:upload -- .video-work/surgical-navigation-test.web.mp4 \
  --id surgical-navigation-test \
  --project neurosurgical-robot \
  --title "Neurosurgical robot navigation demonstration"
npm run video:verify -- surgical-navigation-test
```

Do not batch-upload the ClothUMI, UniForce, Diffusion Policy, π0.5, or VTLA thesis media library. Process and review each clip first.

### Prepared research-demo release

The four reviewed source files in `/home/suhang/datasets2/video` have a fixed, auditable release manifest: two ClothUMI recordings, one VTLA for Cloth Sorting integration recording, and RoboCup UR5e. Inspect the exact local operations first:

```bash
npm run video:publish:prepared
```

Then explicitly process, publish, verify, and build exactly those four demos:

```bash
npm run video:publish:prepared -- --confirm
```

The release manifest uses 10-second muted previews beginning at 0 seconds for ClothUMI and VTLA for Cloth Sorting, and 200 seconds for RoboCup so its preview records active mid-run sorting rather than the setup screen. RoboCup uses the `midpoint` derivative suffix so the full demo is not replaced and an old cached preview is not reused. The manifest does not include the existing surgical-navigation test object or any other local media.

## Metadata and site integration

`src/data/videos.ts` is the source of truth. Each record holds the COS URL, optional preview/poster URLs, duration, project association, status, and the exact generated object keys. Components receive a record instead of a hard-coded COS URL.

- `public`: eligible for production pages.
- `draft`: retained locally but not shown.
- `hidden`: removed from production pages without changing COS objects.
- `archived`: COS derivatives were removed; the record remains as an audit trail.

The reusable `ResearchVideo.astro` component lazy-loads media near the viewport. Short previews use muted, looping, inline autoplay. Full demos retain native controls and never autoplay. On leaving the viewport, autoplay previews pause so they do not keep consuming bandwidth.

Hide a video without deleting its COS media:

```bash
npm run video:hide -- clothumi-umi-demo
```

Permanently remove only a known managed video and its recorded poster/preview derivatives:

```bash
npm run video:remove -- clothumi-umi-demo --confirm clothumi-umi-demo
```

The removal command prints the exact keys and makes no COS call without the matching confirmation. It never deletes by a prefix and never deletes a bucket.

## Credential rotation and future delivery

If a credential is suspected to have been exposed, rotate or disable it in Tencent CAM, replace only the local `.env.local` values, and rerun `npm run video:check`. Keep CAM access scoped to this bucket and the required object/CORS actions. The site has no secret to redeploy.

Later, `media.suhangxia.com` can be added by pointing the domain at COS and updating the `src`/`poster`/`previewSrc` values in this same metadata file; components do not need a redesign. A CDN can later use the same public object paths and metadata contract—only the URL host changes. Do not enable either until a deliberate domain/CDN configuration review.
