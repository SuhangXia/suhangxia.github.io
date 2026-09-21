import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://suhangxia.github.io',
  output: 'static',
  redirects: {
    '/research/fabric-omni/': '/research/touch-until-certain/',
    '/research/surgical-robot-systems/': '/research/percutaneous-puncture-surgical-robot/',
  },
  build: {
    assets: '_assets',
  },
});
