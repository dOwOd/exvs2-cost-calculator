// @ts-check
import { readFileSync } from 'node:fs';
import { defineConfig } from 'astro/config';

import preact from '@astrojs/preact';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

// https://astro.build/config
export default defineConfig({
  site: 'https://dowo.dev',
  base: '/works/exvs2-cost-calculator/',
  output: 'static',
  integrations: [preact(), sitemap()],

  vite: {
    plugins: [tailwindcss()],
    define: {
      __APP_VERSION__: JSON.stringify(pkg.version),
    },
  },
});
