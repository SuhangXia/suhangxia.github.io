import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdir, readFile, stat, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, 'dist');
const route = '/research/tactile-umi/';
const output = process.env.TACTILE_UI_OUTPUT || await mkdtemp(join(tmpdir(), 'tactile-engineering-ui-'));
await mkdir(output, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.gif': 'image/gif', '.json': 'application/json', '.mp4': 'video/mp4' };
const server = createServer(async (request, response) => {
  try {
    let file = resolve(build, `.${decodeURIComponent(new URL(request.url, 'http://localhost').pathname)}`);
    if (!file.startsWith(build + sep)) throw new Error('Outside build');
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
    const content = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    response.end(content);
  } catch { response.writeHead(404); response.end('Not found'); }
});
let browser;
const results = [];
const isolatedScreenshotStyle = '.site-header, .skip-link { visibility: hidden !important; }';
try {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', accept); });
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  const heavyRequests = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => { if (/\.rrd(?:\?|$)|\.wasm(?:\?|$)/.test(request.url())) heavyRequests.push(request.url()); });
  const captureIsolated = async (element, filename) => {
    const viewport = page.viewportSize();
    const bounds = await element.boundingBox();
    // Keep the entire isolated subject inside the capture viewport, including link text.
    await page.setViewportSize({ width: viewport.width, height: Math.max(viewport.height, Math.ceil(bounds.height) + 160) });
    await element.scrollIntoViewIfNeeded();
    await element.screenshot({ path: join(output, filename), style: isolatedScreenshotStyle });
    await page.setViewportSize(viewport);
  };
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('.engineering-row').count(), 3);
    assert.equal(await page.locator('[data-audit-frame]').getAttribute('src'), null);
    assert.equal(heavyRequests.length, 0, 'Replay assets must not load before interaction');
    const words = await page.locator('.tactile-engineering').evaluate((el) => el.innerText.trim().split(/\s+/).length);
    assert(words <= 450, `Default engineering section has ${words} words`);
    for (const rowId of ['hand-eye-calibration', 'quest-camera-latency', 'latency-compensation']) {
      const row = page.locator(`#${rowId}`);
      await row.scrollIntoViewIfNeeded();
      await row.locator('img').evaluateAll((images) => Promise.all(images.filter((im) => im.closest('[hidden]') === null).map((im) => im.decode())));
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}`);
      const figure = await row.locator('.engineering-visual').boundingBox();
      const copy = await row.locator('.engineering-copy').boundingBox();
      assert(figure && copy);
      if (width === 390 || rowId === 'hand-eye-calibration') assert(figure.y + figure.height <= copy.y + 1, 'Mobile/full-width figure must precede copy');
      else assert(Math.abs(figure.y + figure.height/2 - copy.y - copy.height/2) < 4, 'Desktop figure/text must be adjacent and centered');
      if (rowId === 'hand-eye-calibration') {
        assert(await row.locator('.hand-eye-image-link img').evaluate((img) => img.naturalWidth > 0 && Math.abs(img.naturalWidth / img.naturalHeight - 16 / 9) < .01), 'Original diagram must retain its full 16:9 aspect ratio');
        assert(await row.locator('.hand-eye-image-link').getAttribute('href'), 'Full-resolution original must remain accessible');
      }
      await captureIsolated(row, `${rowId}-${width}.png`);
    }
    for (const group of await page.locator('[data-engineering-switch]').all()) {
      const initialHeight = (await group.boundingBox()).height;
      const naturalMobileHeight = width === 390 && await group.evaluate((el) => !!el.closest('.engineering-row--spatial'));
      for (const tab of await group.locator('[role=tab]').all()) {
        await tab.click();
        assert.equal(await tab.getAttribute('aria-selected'), 'true');
        const id = await tab.getAttribute('aria-controls');
        const panel = page.locator(`#${id}`);
        assert(await panel.isVisible());
        await panel.locator('img').evaluateAll((images) => Promise.all(images.map((im) => im.decode())));
        assert.equal(await group.locator('[role=tabpanel]:visible').count(), 1);
        if (!naturalMobileHeight) assert(Math.abs((await group.boundingBox()).height - initialHeight) < 2, 'Switches must not change figure-area height');
        assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
      }
    }
    await page.goto(base + route, { waitUntil: 'domcontentloaded' });
    await captureIsolated(page.locator('.tactile-engineering'), `engineering-${width}.png`);
    if (width !== 1024) {
      await page.locator('img').evaluateAll(async (images) => {
        for (const im of images) im.loading = 'eager';
        await Promise.race([Promise.all(images.map((im) => im.decode().catch(() => {}))), new Promise((accept) => setTimeout(accept, 5000))]);
      });
      await page.screenshot({ path: join(output, `full-page-${width}.png`), fullPage: true });
    }
    results.push({ width, words, responsive: true, switches: true });
    console.log(`PASS ${width}px · ${words} visible words · three rows and all switches`);
  }
  await page.goto(base + route + '#gripper-width-mapping', { waitUntil: 'domcontentloaded' });
  assert(await page.locator('#gripper-width-mapping').isVisible());
  await page.locator('#spatial-tab-gripper').focus();
  await page.keyboard.press('ArrowLeft');
  assert.equal(await page.locator('#spatial-tab-validation').getAttribute('aria-selected'), 'true');
  await page.goto(base + route + '#impedance-execution', { waitUntil: 'domcontentloaded' });
  assert(await page.locator('#engineering-methods').evaluate((el) => el.open));
  await page.goto(base + route, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('video[controls]').count(), 3);
  assert(await page.locator('.trial-summary__table').innerText().then((s) => s.includes('10 / 34') && s.includes('14 / 34')));
  assert.equal(await page.locator('.trial-summary__table tbody tr').count(), 2);
  assert(await page.locator('.trial-summary').evaluate((el) => {
    const video = el.closest('.project-demos')?.querySelector('video');
    return video && Boolean(video.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_FOLLOWING);
  }), 'Compact comparison must follow the result video');
  assert.equal(await page.locator('.trial-summary__details').evaluate((el) => el.open), false);
  assert.equal(await page.locator('.tactile-training__stages article').count(), 2);
  assert((await page.locator('#quest-camera-latency .method-credit a').getAttribute('href')).includes('xu25e.html'));
  await page.locator('[data-audit-video-open]').click();
  assert(await page.locator('[data-audit-fallback]').evaluate((el) => el.open));
  await page.goto(base + '/zh' + route, { waitUntil: 'domcontentloaded' });
  assert.equal(await page.locator('#tactile-calibration-title').innerText(), '空间标定与时间对齐');
  await page.locator('#latency-tab-before').click();
  assert(await page.locator('#latency-before').isVisible());
  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const fallback = await noJs.newPage();
  await fallback.goto(base + route, { waitUntil: 'domcontentloaded' });
  assert(await fallback.locator('#spatial-chain').isVisible());
  assert(await fallback.locator('#latency-after').isVisible());
  assert(await fallback.locator('#timing-available').isVisible());
  await fallback.locator('#engineering-methods > summary').click();
  assert(await fallback.locator('#engineering-methods').evaluate((el) => el.open));
  assert.deepEqual(errors, []);
  await writeFile(join(output, 'acceptance.json'), JSON.stringify({ results, errors, defaultReplayRequests: heavyRequests, oldAnchors: true, noJs: true, nativeControls: true, chinese: true }, null, 2));
  console.log(`PASS keyboard, old anchors, native video controls, lazy replay, Chinese, no-JS. Screenshots: ${output}`);
} finally {
  await browser?.close();
  if (server.listening) await new Promise((accept) => server.close(accept));
}
