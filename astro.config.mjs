import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://suhangxia.github.io',
  output: 'static',
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
