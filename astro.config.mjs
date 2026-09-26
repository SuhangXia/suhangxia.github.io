import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// These files are 404 or static HTML redirects, not canonical content pages.
const excludeFromSitemap = new Set([
  '/404.html',
  '/research/clothumi/',
  '/research/fabric-omni/',
  '/research/surgical-robot-systems/',
  '/zh/research/clothumi/',
  '/zh/research/fabric-omni/',
  '/zh/research/surgical-robot-systems/',
]);

export default defineConfig({
  site: 'https://suhangxia.github.io',
  output: 'static',
  integrations: [sitemap({ filter: (page) => !excludeFromSitemap.has(new URL(page).pathname) })],
  redirects: {
    '/research/fabric-omni/': '/research/touch-until-certain/',
    '/research/surgical-robot-systems/': '/research/percutaneous-puncture-surgical-robot/',
    '/zh/research/fabric-omni/': '/zh/research/touch-until-certain/',
    '/zh/research/surgical-robot-systems/': '/zh/research/percutaneous-puncture-surgical-robot/',
  },
  build: {
    assets: '_assets',
  },
});
