import { getCollection, type CollectionEntry } from 'astro:content';
import categoriesData from '../data/categories.json';
import tagsData from '../data/tags.json';
import commentsData from '../data/comments.json';
import sharp from 'sharp';

export const SITE = {
  name: 'Kidinjury Law Blog',
  tagline: 'Legal Help For Parents of Injured Children',
  url: 'https://kidinjurylaw.com',
  phoneDisplay: '678.358.2564',
  tel: 'tel:+16783582564',
  sms: 'sms:+16783582564',
  firmUrl: 'https://petepearsonlaw.com/',
  aboutUrl: 'https://petepearsonlaw.com/about/',
  avvo: 'https://www.avvo.com/attorneys/30012-ga-peter-pearson-531461.html',
  linkedin: 'https://www.linkedin.com/in/pete-pearson-52b21712/',
  perPage: 10, // matches the old WordPress pagination (/page/2/ … )
};

export const AUTHOR = {
  name: 'Pete Pearson',
  byline: 'Attorney Pete Pearson, JD',
  credentials: [
    'Georgia personal injury attorney since 1996',
    'JD, Emory University School of Law',
    'State Bar of Georgia',
  ],
  jsonLd: {
    '@type': 'Person',
    '@id': 'https://petepearsonlaw.com/about/#pete',
    name: 'Pete Pearson',
    alternateName: 'Peter Pearson',
    honorificSuffix: 'JD',
    jobTitle: 'Personal Injury Attorney',
    url: 'https://petepearsonlaw.com/about/',
    image: 'https://kidinjurylaw.com/assets/img/pete-pearson-headshot-320.jpg',
    alumniOf: [
      { '@type': 'CollegeOrUniversity', name: 'Emory University School of Law' },
      { '@type': 'CollegeOrUniversity', name: 'Gordon College' },
    ],
    memberOf: [{ '@type': 'Organization', name: 'State Bar of Georgia' }],
    knowsAbout: ['Personal injury law', 'Child injury claims', 'Georgia law'],
    sameAs: [
      'https://www.avvo.com/attorneys/30012-ga-peter-pearson-531461.html',
      'https://www.linkedin.com/in/pete-pearson-52b21712/',
      'https://petepearsonlaw.com/',
    ],
  },
};

export type Post = CollectionEntry<'posts'>;

export interface Enrichment {
  slug: string;
  description?: string;
  shortAnswer?: string;
  sections?: { heading: string; shortAnswer: string }[];
  faq?: { q: string; a: string }[];
}

const enrichmentFiles = import.meta.glob<Enrichment>('../data/enrichment/*.json', { eager: true, import: 'default' });
const enrichmentBySlug = new Map(
  Object.entries(enrichmentFiles).map(([file, data]) => [file.split('/').pop()!.replace(/\.json$/, ''), data]),
);
export const getEnrichment = (post: Post): Enrichment => enrichmentBySlug.get(post.id) ?? { slug: post.id };

export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('posts', (p) => !p.data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const categories: { slug: string; name: string; description: string }[] = categoriesData;
export const tags: { slug: string; name: string }[] = tagsData;
export const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name ?? slug;
export const tagName = (slug: string) => tags.find((t) => t.slug === slug)?.name ?? slug;

export interface Comment { id: number; postId: number; parent: number; author: string; date: string; html: string }
export const commentsFor = (post: Post): Comment[] =>
  (commentsData as Comment[]).filter((c) => post.data.wpId && c.postId === post.data.wpId);

const plain = (html: string) => html.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ');
export const wordCount = (post: Post) => plain(post.body ?? '').split(/\s+/).filter(Boolean).length;
export const readingMinutes = (post: Post) => Math.max(1, Math.round(wordCount(post) / 230));

export const formatDate = (d: Date) =>
  d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/New_York' });
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Description for <meta name="description">: the enrichment's, else the WordPress excerpt trimmed. */
export function describe(post: Post): string {
  const e = getEnrichment(post);
  if (e.description) return e.description;
  const ex = (post.data.excerpt ?? '').replace(/\s*\[…\]|\s*…$/, '');
  return ex.length > 155 ? ex.slice(0, 152).replace(/\s+\S*$/, '') + '…' : ex;
}

/** The later of published/modified (WordPress sometimes stores modified < date for old posts). */
export const lastModified = (post: Post) =>
  post.data.modified && post.data.modified > post.data.date ? post.data.modified : post.data.date;

/** Date-archive parts from a post path like /2011/11/09/slug/ */
export const pathParts = (post: Post) => {
  const [, y, m, d, slug] = post.data.path.split('/');
  return { y, m, d, slug };
};

export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Strip HTML for JSON-LD / feeds. */
export const toText = (html: string) =>
  html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&#8217;/g, '’').replace(/&#8220;|&#8221;/g, '"')
    .replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

/**
 * Accessibility fixes for migrated WordPress HTML (attributes only; visible text is untouched):
 * - an image with empty alt that has a caption (aria-describedby) gets the caption as its alt;
 * - a link whose only content is an image with empty alt gets an accessible name.
 * Also lazy-loads in-body images.
 */
export async function fixWordPressHtml(html: string, opts: { eagerFirstImage?: boolean } = {}): Promise<string> {
  let out = html.replace(/<img(?![^>]*\sloading=)/g, '<img loading="lazy" decoding="async"');
  // The first image on a page that opens with photos (About) is the largest paint: load it right away.
  if (opts.eagerFirstImage) out = out.replace(/<img[^>]*>/, (tag) => tag.replace(/\sloading="lazy"/, '').replace('<img', '<img fetchpriority="high"'));
  // Give local images missing width/height their real dimensions (prevents layout shift).
  const sizes = new Map<string, { width?: number; height?: number }>();
  for (const [, src] of out.matchAll(/<img[^>]*\ssrc="(\/(?:wp-content|assets)\/[^"]+)"[^>]*>/g)) {
    if (sizes.has(src)) continue;
    try { sizes.set(src, await sharp(`public${decodeURI(src)}`).metadata()); } catch { sizes.set(src, {}); }
  }
  out = out.replace(/<img([^>]*)>/g, (all, attrs) => {
    if (/\swidth="/.test(attrs) && /\sheight="/.test(attrs)) return all;
    const src = (attrs.match(/\ssrc="([^"]+)"/) || [])[1];
    const m = src && sizes.get(src);
    if (!m || !m.width || !m.height) return all;
    const clean = attrs.replace(/\s(?:width|height)="[^"]*"/g, '').replace(/\s*\/\s*$/, '');
    return `<img${clean} width="${m.width}" height="${m.height}">`;
  });
  // captions
  out = out.replace(/<img([^>]*?)aria-describedby="([^"]+)"([^>]*)>/g, (all, a, id, b) => {
    const cap = html.match(new RegExp(`id="${id}"[^>]*>([\\s\\S]*?)</`));
    const text = cap ? toText(cap[1]).replace(/"/g, '&quot;') : '';
    if (!text) return all;
    const attrs = (a + b).replace(/\salt="[^"]*"/, '').replace(/\s*\/\s*$/, '');
    return `<img${attrs} alt="${text}">`;
  });
  // embedded videos need a title for screen readers
  out = out.replace(/<iframe(?![^>]*\stitle=)/g, '<iframe title="Embedded video"');
  // image-only links with no text alternative
  out = out.replace(/<a([^>]*)>(\s*<img(?:(?!>)[\s\S])*?\salt=""[^>]*>\s*)<\/a>/g, (all, attrs, img) =>
    /aria-label=/.test(attrs) ? all : `<a${attrs} aria-label="Open full-size image">${img}</a>`);
  return out;
}
