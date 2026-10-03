// Post-build SEO safety net. Fails the build if:
//  1. any URL the old WordPress site served is missing from dist/ (and isn't covered by a redirect), or
//  2. any internal link/image in the built pages points at something that doesn't exist.
import { readFile, readdir, access } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = new URL('../', import.meta.url).pathname;
const DIST = join(ROOT, 'dist');
const exists = (p) => access(p).then(() => true, () => false);
const resolves = async (urlPath) => {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  if (clean.endsWith('/')) return exists(join(DIST, clean, 'index.html'));
  return (await exists(join(DIST, clean))) || exists(join(DIST, clean, 'index.html'));
};

const redirects = (await readFile(join(ROOT, 'public/_redirects'), 'utf8'))
  .split('\n').filter((l) => l.trim() && !l.startsWith('#'))
  .map((l) => l.trim().split(/\s+/)[0])
  .map((from) => new RegExp('^' + from.replace(/:[a-z]+/g, '[^/]+').replace(/\*/g, '.*') + '$'));
const redirected = (p) => redirects.some((r) => r.test(p));

// 1. Legacy URLs, rebuilt from the WordPress export.
const posts = JSON.parse(await readFile(join(ROOT, 'wordpress-export/posts.json'), 'utf8'));
const pages = JSON.parse(await readFile(join(ROOT, 'wordpress-export/pages.json'), 'utf8'));
const cats = JSON.parse(await readFile(join(ROOT, 'wordpress-export/categories.json'), 'utf8'));
const tags = JSON.parse(await readFile(join(ROOT, 'wordpress-export/tags.json'), 'utf8'));
const legacy = new Set(['/', '/feed/', '/sitemap.xml', '/robots.txt', '/comments/feed/', '/news-sitemap.xml', '/author/kidinjurylaw/']);
for (let n = 2; n <= Math.ceil(posts.length / 10); n++) legacy.add(`/page/${n}/`);
for (const p of [...posts, ...pages]) legacy.add(new URL(p.link).pathname);
for (const p of posts) {
  const [, y, m, d] = new URL(p.link).pathname.split('/');
  legacy.add(`/${y}/`); legacy.add(`/${y}/${m}/`); legacy.add(`/${y}/${m}/${d}/`);
  legacy.add(new URL(p.link).pathname + 'feed/');
  legacy.add(new URL(p.link).pathname + 'amp/');
}
for (const c of cats) legacy.add(`/category/${c.slug}/`);
for (const t of tags) legacy.add(`/tag/${t.slug}/`);
// Every URL the Internet Archive captured on the old site (wordpress-export/archived-urls.json),
// minus WordPress internals; reported separately because some are long-gone pages, not regressions.
const archived = JSON.parse(await readFile(join(ROOT, 'wordpress-export/archived-urls.json'), 'utf8'));

const archivedMissing = [];
const wpInternals = /^\/wp-content\/(?!uploads\/)/; // WordPress plugin/theme/script files, never pages
for (const u of archived) if (!wpInternals.test(u) && !legacy.has(u) && !(await resolves(u)) && !redirected(u)) archivedMissing.push(u);
const missing = [];
for (const u of legacy) if (!(await resolves(u)) && !redirected(u)) missing.push(u);

// 2. Internal links in built HTML.
async function* walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* walk(p); else if (p.endsWith('.html')) yield p;
  }
}
const broken = new Map();
let files = 0;
for await (const file of walk(DIST)) {
  files++;
  const html = await readFile(file, 'utf8');
  if (html.startsWith('<?xml')) continue; // the RSS feed lives in feed/index.html
  for (const [, url] of html.matchAll(/(?:href|src)="(\/(?!\/)[^"]*)"/g)) {
    if (!(await resolves(url)) && !redirected(url.split(/[?#]/)[0])) {
      if (!broken.has(url)) broken.set(url, file.replace(DIST, ''));
    }
  }
}

console.log(`check-urls: ${legacy.size} legacy URLs, ${files} built pages scanned`);
if (missing.length) console.error(`✘ ${missing.length} legacy URL(s) missing:\n  ${missing.join('\n  ')}`);
if (broken.size) console.error(`✘ ${broken.size} broken internal link(s):\n  ${[...broken].map(([u, f]) => `${u}  (in ${f})`).join('\n  ')}`);
if (archivedMissing.length) console.warn(`! ${archivedMissing.length} archived URL(s) not served or redirected (review; not a build failure):\n  ${archivedMissing.join('\n  ')}`);
if (missing.length || broken.size) process.exit(1);
console.log('✓ every legacy URL is served or redirected; no broken internal links');
