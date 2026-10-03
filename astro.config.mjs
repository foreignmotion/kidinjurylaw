import { defineConfig } from 'astro/config';

// URLs must match the old WordPress.com site exactly: trailing slashes, /YYYY/MM/DD/slug/ posts.
export default defineConfig({
  site: 'https://kidinjurylaw.com',
  trailingSlash: 'always',
  build: { format: 'directory' },
  compressHTML: true,
});
