// /sitemap.xml — same URL as the old site's. Lists the home page, About, every post, and topic pages that have posts.
// Tag pages and date archives are left out (thin duplicates of the post list).
import { getCollection } from 'astro:content';
import { getPosts, categories, lastModified, SITE } from '../lib/site';

export async function GET() {
  const posts = await getPosts();
  const pages = await getCollection('pages');
  const url = (p: string, lastmod?: Date) =>
    `<url><loc>${new URL(p, SITE.url).href}</loc>${lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : ''}</url>`;
  const newest = posts[0] ? lastModified(posts[0]) : undefined;
  const body = [
    url('/', newest),
    ...pages.map((p) => url(p.data.path, p.data.modified ?? p.data.date)),
    ...posts.map((p) => url(p.data.path, lastModified(p))),
    ...categories
      .filter((c) => c.slug !== 'uncategorized' && posts.some((p) => p.data.categories.includes(c.slug)))
      .map((c) => url(`/category/${c.slug}/`)),
  ].join('\n');
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
