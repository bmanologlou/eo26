import { defineConfig } from 'astro/config';

// Static site — Cloudflare Pages builds this on each push.
export default defineConfig({
  site: 'https://eo26.eoflux.com',
  output: 'static',
  build: {
    inlineStylesheets: 'auto',
  },
});
