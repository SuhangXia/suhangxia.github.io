/** Optional real-browser acceptance check. Uses an existing Playwright install only. */
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, readFile, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, 'dist');
const route = '/research/percutaneous-puncture-surgical-robot/';
const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.jpg': 'image/jpeg', '.avif': 'image/avif', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };
let browser;
let server;

try {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
  await stat(join(build, route, 'index.html'));
  server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      let file = resolve(build, `.${pathname}`);
      if (!file.startsWith(build + sep) && file !== build) throw new Error('Outside build');
      if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
      const bytes = await readFile(file);
      const contentType = mime[extname(file)] || 'application/octet-stream';
      const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
      if (range) {
        const start = Number(range[1]);
        const end = Math.min(range[2] ? Number(range[2]) : bytes.length - 1, bytes.length - 1);
        if (start > end) { response.writeHead(416); response.end(); return; }
        response.writeHead(206, { 'Content-Type': contentType, 'Accept-Ranges': 'bytes', 'Content-Range': `bytes ${start}-${end}/${bytes.length}`, 'Content-Length': end - start + 1 });
        response.end(bytes.subarray(start, end + 1));
      } else {
        response.writeHead(200, { 'Content-Type': contentType, 'Content-Length': bytes.length, 'Accept-Ranges': 'bytes' });
        response.end(bytes);
      }
    } catch {
      response.writeHead(404);
      response.end('Not found');
    }
  });
  await new Promise((accept, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', accept); });
  const base = `http://127.0.0.1:${server.address().port}`;
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox', '--disable-dev-shm-usage'], ignoreDefaultArgs: ['--disable-back-forward-cache'] });
  const screenshots = await mkdtemp(join(tmpdir(), 'puncture-ui-'));
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  const pageErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));

  for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + route);
    await page.evaluate(() => document.fonts.ready);
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Horizontal overflow at ${width}px`);
    const columns = await page.locator('.workflow-lanes').evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    assert.equal(columns, width >= 1100 ? 3 : 1, `Workflow layout at ${width}px`);
    assert.equal(await page.locator('video[controls]').count(), 1);
    assert.equal(await page.locator('video').evaluateAll((videos) => videos.every((video) => !video.autoplay)), true);
    for (const [name, selector] of [['workflow', '.puncture-workflow'], ['results', '.puncture-results-table'], ['team', 'figure:has(img[alt*="following the animal-study"])']]) {
      const element = page.locator(selector);
      await element.scrollIntoViewIfNeeded();
      await element.locator('img').evaluateAll((images) => Promise.all(images.map((image) => image.decode().catch(() => {}))));
      await element.screenshot({ path: join(screenshots, `${name}-${width}.png`) });
    }
    console.log(`PASS responsive workflow, table, team image and video controls: ${width}px`);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + route);
  const imageLink = page.locator('a[data-lightbox-src]').first();
  await imageLink.click();
  assert(await page.locator('#evidence-lightbox').evaluate((dialog) => dialog.open));
  await page.keyboard.press('Escape');
  assert(await imageLink.evaluate((link) => document.activeElement === link));
  assert.equal(await page.locator('#evidence-lightbox').evaluate((dialog) => dialog.open), false);
  console.log('PASS image dialog: opens, Escape closes, focus restored');

  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(base + '/about/#patent-applications');
    assert.equal(await page.locator('.patent-entry').count(), 5);
    assert.equal(await page.locator('.patent-entry--first').count(), 3);
    const details = page.locator('.patent-entry details').first();
    await details.locator('summary').click();
    assert(await details.evaluate((element) => element.open));
    await details.locator('img').evaluate((image) => image.decode());
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
    await details.screenshot({ path: join(screenshots, `patent-${width}.png`) });
    console.log(`PASS patent listing and expanded source page: ${width}px`);
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base + '/');
  const projectLink = page.locator('#percutaneous-puncture-surgical-robot .project-feature__title-link');
  await projectLink.scrollIntoViewIfNeeded();
  const homeScroll = await page.evaluate(() => scrollY);
  await projectLink.click();
  await page.waitForURL(base + route);
  await page.locator('[data-return-home]').click();
  await page.waitForURL(base + '/');
  await page.waitForFunction((position) => Math.abs(scrollY - position) < 16, homeScroll);
  assert.deepEqual(pageErrors, []);
  console.log('PASS return-home position restoration and no browser JS errors');

  const noJs = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 900 } });
  const fallback = await noJs.newPage();
  await fallback.goto(base + '/about/#patent-applications');
  await fallback.locator('.patent-entry summary').first().click();
  assert(await fallback.locator('.patent-entry details').first().evaluate((element) => element.open));
  assert((await fallback.locator('.patent-entry a[data-lightbox-src]').first().getAttribute('href')).startsWith('/'));
  console.log('PASS no-JavaScript native disclosure and original-image link');
  console.log(`Screenshots: ${screenshots}`);
} catch (error) {
  console.error(`FAIL UI check: ${error.message}`);
  process.exitCode = 1;
} finally {
  await browser?.close();
  if (server?.listening) await new Promise((accept) => server.close(accept));
}
