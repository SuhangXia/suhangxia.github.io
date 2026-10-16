# Tactile UMI browser replay

The original Rerun 0.31.4 SDK and recording are retained. No trajectory renderer,
model, source dataset, or `.rrd` contents were rewritten.

## Loading and graphics are separate requirements

- The previous page imported its SDK from esm.sh, which in turn downloaded the
  JavaScript/WASM runtime from outside the website. On this machine the page could
  remain at loading despite a working WebGL2 context.
- A separate browser error, `canvas.getContext() returned null`, means that the
  requested graphics context was unavailable, lost, or already claimed. Moving
  files to another server cannot enable a disabled browser graphics backend.
- The competition page also embeds Rerun. Its ability to run in a particular
  session does not eliminate the need for a functioning WebGL2 or WebGPU backend.

The website now serves the official runtime locally under `public/vendor/rerun/0.31.4/`.
It is downloaded only after the user explicitly opens the interactive replay.
The npm package entrypoint is bundled for plain browser ESM; see its NOTICE and
licenses. WASM and the recording retain their original SHA-256 checksums.

The wrapper probes WebGL2 and WebGPU independently, selects a working backend,
and retries another available backend using a fresh viewer/canvas after cleanup.
It waits for a real recording and timeline range rather than treating creation of
an empty canvas as success. No browser security flags are changed. If both APIs
are disabled, a single localized message explains recovery; it does not silently
replace the interactive viewer with a video.

## Acceptance

```sh
node --test scripts/test-tactile-replay.mjs
npm run build
npm run preview -- --host 127.0.0.1 --port 4323
PLAYWRIGHT_MODULE=/path/to/playwright/index.mjs node scripts/check-tactile-replay-browser.mjs
```

The browser test opens the project-page iframe at desktop/mobile sizes, blocks all
external requests, requires an actual 18.27-second recording, scrubs the original
time ruler, orbits the original 3D view, and checks a simulated missing-GPU session.
Set `REPLAY_HEADLESS=1` to additionally test a headless browser; this is distinct
from verifying hardware rendering in an ordinary graphical browser session.

On 2026-10-16, the native Chrome session used WebGL on NVIDIA; the headless probe
used WebGL through SwiftShader. Neither required unsafe fallback flags. This does
not prove graphics availability in every visitor's browser session.

Runtime file hosting is local/static in this change. No COS upload, bucket change,
commit, push, or deployment is performed.
