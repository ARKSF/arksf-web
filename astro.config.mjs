// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://arksf.cz',
  build: { format: 'file' },
  scopedStyleStrategy: 'where',
  vite: { cacheDir: '.astro/vite' },
});
