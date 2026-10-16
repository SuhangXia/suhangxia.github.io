import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4323';
const output = process.env.WORKFLOW_UI_OUTPUT || '/tmp/tactile-workflow-qa';
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true, args: ['--no-sandbox'] });
const results = [];
try {
  const page = await browser.newPage({ reducedMotion: 'reduce' });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const assets = new Set();
  for (const locale of ['en', 'zh']) for (const width of [1440, 1024, 768, 390, 320]) {
    await page.setViewportSize({ width, height: 1200 });
    await page.goto(`${base}/${locale === 'zh' ? 'zh/' : ''}research/tactile-umi/`, { waitUntil: 'domcontentloaded' });
    const figure = page.locator('.architecture-figure--workflow');
    const image = figure.locator('img');
    await image.scrollIntoViewIfNeeded();
    await image.evaluate((el) => el.decode());
    const source = await image.evaluate((el) => el.currentSrc);
    assert.equal(source.includes('mobile'), width <= 1023, 'Use the readable vertical variant on narrow screens');
    assert.equal(source.includes('-zh'), locale === 'zh');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Page overflow: ${locale} ${width}`);
    assets.add(source);
    const box = await image.boundingBox();
    assert(box);
    if (width === 320) assert(box.width / 440 * 20 >= 12, 'Mobile body text must remain at least 12 CSS px');
    if ([1440, 390].includes(width)) {
      await page.setViewportSize({ width, height: Math.ceil((await figure.boundingBox()).height) + 160 });
      await figure.screenshot({ path: join(output, `workflow-${locale}-${width}.png`), style: '.site-header, .skip-link {visibility:hidden!important}' });
    }
    results.push({ locale, width, diagramWidth: box.width, mobile: source.includes('mobile') });
  }
  for (const url of assets) {
    await page.goto(url);
    const audit = await page.evaluate(async () => {
      await document.fonts.ready;
      const boxes = [...document.querySelectorAll('text')].map((el) => ({ text: el.textContent, box: el.getBoundingClientRect() }));
      const intersections = [];
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        if (Math.min(a.box.right, b.box.right) - Math.max(a.box.left, b.box.left) > 1
          && Math.min(a.box.bottom, b.box.bottom) - Math.max(a.box.top, b.box.top) > 1) intersections.push([a.text, b.text]);
      }
      const outside = [...document.querySelectorAll('[data-node]')].flatMap((group) => {
        const rect = group.querySelector('rect').getBoundingClientRect();
        return [...group.querySelectorAll('text')].filter((el) => {
          const box = el.getBoundingClientRect();
          return box.left < rect.left + 8 || box.right > rect.right - 8 || box.top < rect.top + 5 || box.bottom > rect.bottom - 5;
        }).map((el) => el.textContent);
      });
      return { intersections, outside, numbers: [...document.querySelectorAll('.number')].map((el) => el.textContent), nodes: document.querySelectorAll('[data-node]').length };
    });
    assert.deepEqual(audit.intersections, [], `Overlapping labels in ${url}`);
    assert.deepEqual(audit.outside, [], `Text exceeds a node boundary in ${url}`);
    assert.deepEqual(audit.numbers, ['01', '02', '03']);
    assert.equal(audit.nodes, 14);
    console.log(`PASS ${new URL(url).pathname}: no overlapping or overflowing labels; 14 nodes`);
  }
  assert.deepEqual(errors, []);
  await writeFile(join(output, 'acceptance.json'), JSON.stringify({ results, assetVariants: assets.size, errors }, null, 2));
  console.log(`PASS English/Chinese, five viewport widths, source selection and full-resolution links. Screenshots: ${output}`);
} finally { await browser.close(); }
