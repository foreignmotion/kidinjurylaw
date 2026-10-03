// Verifies Short Answers / FAQ answers stay in the post's own wording.
// Score = share of the summary's word trigrams that appear verbatim in the post. Flags anything under 0.6.
import { readFile, readdir } from 'node:fs/promises';

const ROOT = new URL('../', import.meta.url).pathname;
const norm = (s) => s
  .replace(/<[^>]+>/g, ' ')
  .replace(/&#8217;|&rsquo;|’|‘|&#8216;/g, "'").replace(/&#8220;|&#8221;|“|”|&quot;/g, '"')
  .replace(/&nbsp;|&#160;| /g, ' ').replace(/&#038;|&amp;/g, '&').replace(/&#8211;|&#8212;|–|—/g, ' - ')
  .replace(/&[a-z#0-9]+;/gi, ' ')
  .toLowerCase().replace(/[^a-z0-9$%.' -]+/g, ' ').replace(/[.]/g, ' ').replace(/\s+/g, ' ').trim();
const grams = (s) => { const w = norm(s).split(' ').filter(Boolean); const g = []; for (let i = 0; i + 2 < w.length; i++) g.push(w.slice(i, i + 3).join(' ')); return g; };

const issues = [];
let checked = 0, files = 0;
for (const f of (await readdir(`${ROOT}src/data/enrichment`)).filter((f) => f.endsWith('.json'))) {
  const slug = f.replace(/\.json$/, '');
  const e = JSON.parse(await readFile(`${ROOT}src/data/enrichment/${f}`, 'utf8'));
  let post;
  try { post = await readFile(`${ROOT}src/content/posts/${slug}.md`, 'utf8'); } catch { issues.push([slug, 'no matching post file', 0, '']); continue; }
  files++;
  const src = new Set(grams(post));
  const parts = [['shortAnswer', e.shortAnswer], ...(e.sections || []).map((s) => ['section', s.shortAnswer]), ...(e.faq || []).map((q) => ['faq', q.a])];
  for (const [kind, text] of parts) {
    if (!text) continue;
    checked++;
    const g = grams(text);
    const score = g.length ? g.filter((x) => src.has(x)).length / g.length : 1;
    if (score < 0.6) issues.push([slug, kind, score, text]);
  }
  if (e.description && e.description.length > 155) issues.push([slug, 'description > 155 chars', e.description.length, e.description]);
}
console.log(`check-enrichment: ${files} posts, ${checked} answers checked`);
for (const [slug, kind, score, text] of issues) console.log(`! ${slug} [${kind}] ${typeof score === 'number' ? score.toFixed(2) : score}\n    ${text}`);
if (!issues.length) console.log('✓ all answers are drawn from their posts (≥ 60% of trigrams verbatim)');
