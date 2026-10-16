import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4323';
const output = process.env.REPLAY_UI_OUTPUT || '/tmp/tactile-replay-acceptance';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: process.env.REPLAY_HEADLESS === '1', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
const results = [];
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 920 } });
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on('request', (r) => requests.push(r.url()));
  page.on('pageerror', (e) => errors.push(e.message));
  // A successful replay must work even when external services are inaccessible.
  await context.route('**/*', (route) => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  for (const [width, height] of [[1440, 920], [390, 844]]) {
    await page.setViewportSize({ width, height });
    await page.goto(`${base}/research/tactile-umi/`, { waitUntil: 'domcontentloaded' });
    const iframe = page.locator('[data-audit-frame]');
    assert.equal(await iframe.getAttribute('src'), null, 'Heavy replay is opt-in');
    await page.locator('[data-audit-open]').click();
    const frame = await (await iframe.elementHandle()).contentFrame();
    await frame.waitForFunction(() => ['ready', 'failed', 'graphics-unavailable'].includes(window.tactileReplay?.state), {}, { timeout: 90000 });
    await frame.waitForFunction(() => window.tactileReplay?.state !== 'ready' || window.tactileReplay.timeRange?.max > 18e9, {}, { timeout: 30000 });
    const state = await frame.evaluate(() => window.tactileReplay);
    assert.equal(state.state, 'ready', JSON.stringify(state));
    assert.equal(await frame.locator('canvas').count(), 1);
    assert(await frame.locator('#status').isHidden());
    assert(state.timeRange.max > 18e9 && state.timeRange.max < 19e9);
    const canvas = frame.locator('canvas');
    const before = await frame.evaluate(() => window.tactileReplay.currentTime);
    const box = await canvas.boundingBox();
    assert(box);
    // Scrub on the original Rerun time ruler; no custom playback implementation.
    await page.mouse.click(box.x + box.width * .78, box.y + box.height - 15);
    await page.waitForTimeout(700);
    const after = await frame.evaluate(() => window.tactileReplay.currentTime);
    assert(Math.abs(after - before) > 1e8, 'Original timeline must respond to scrubbing');
    // Orbit the original 3D viewport and retain a screenshot for visual inspection.
    await page.mouse.move(box.x + box.width * .25, box.y + box.height * .3);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width * .35, box.y + box.height * .4, { steps: 10 });
    await page.mouse.up();
    await iframe.screenshot({ path: join(output, `embedded-${width}.png`), style: '.site-header, .skip-link { visibility: hidden !important; }' });
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    results.push({ width, backend: state.backend, durationSeconds: state.timeRange.max / 1e9, timeBefore: before, timeAfter: after });
    console.log(`PASS embedded ${width}px, ${state.backend}, actual recording and timeline interaction`);
  }
  assert.equal(errors.length, 0, errors.join('\n'));
  assert(!requests.some((u) => /esm\.sh|app\.rerun\.io/.test(u)), 'Viewer must not depend on external module/WASM hosts');

  const noGpu = await context.newPage();
  const heavy = [];
  noGpu.on('request', (r) => { if (/\.wasm|\.rrd|\/vendor\//.test(r.url())) heavy.push(r.url()); });
  await noGpu.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (name, ...args) {
      return ['webgl', 'webgl2', 'experimental-webgl'].includes(name) ? null : original.call(this, name, ...args);
    };
    Object.defineProperty(navigator, 'gpu', { value: undefined });
  });
  await noGpu.goto(`${base}/media/tactile-umi/viewer.html?lang=zh`);
  await noGpu.waitForFunction(() => window.tactileReplay?.state === 'graphics-unavailable');
  assert.equal(await noGpu.locator('html').getAttribute('lang'), 'zh-CN');
  assert.equal(await noGpu.locator('#status h1').count(), 1);
  assert.equal(heavy.length, 0, 'No unsupported graphics startup or heavy downloads');
  assert.equal(await noGpu.locator('video').count(), 0, 'Never automatically switch to a video');
  await noGpu.screenshot({ path: join(output, 'no-gpu-guidance.png') });
  results.push({ missingGraphics: 'clear single localized error; no heavy downloads, no forced video' });
  await writeFile(join(output, 'acceptance.json'), JSON.stringify(results, null, 2));
  console.log('PASS no-GPU handling, no third-party viewer requests, no replacement renderer');
} finally { await browser.close(); }
