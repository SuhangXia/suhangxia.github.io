# Rerun Web Viewer 0.31.4

Upstream: https://github.com/rerun-io/rerun/tree/0.31.4/rerun_js/web-viewer

Package: `@rerun-io/web-viewer@0.31.4` from the npm registry.

The original SDK's `index.js` is compiled as a browser ESM bundle using esbuild
(`--bundle --format=esm --target=es2022 --sourcemap --legal-comments=inline`).
This resolves the package's extensionless module import for plain static hosting.
No changes are made to the renderer, visualization logic, or WebAssembly binary.

Original package file SHA-256 checksums:

- index.js: `7f852cb05d6b68f2b2e6a70c6b50f140f75e89a5199fb2973cb0cb89c43e8556`
- re_viewer.js: `0ac462e5563efedb30962011e65566bfb718e8eaf39760417de848e178b5d687`
- re_viewer_bg.wasm: `7abf0c250792285b217d9862a2d86b981bea94adf4c482cdd9c6e6e548be05f4`

Copyright Rerun contributors. Distributed under the included MIT / Apache-2.0 licenses.
