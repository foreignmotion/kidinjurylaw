# Kidinjury Law Blog — kidinjurylaw.com

Static rebuild of Pete Pearson's blog (formerly WordPress.com), designed to match petepearsonlaw.com, with
**every old URL preserved** so existing search rankings carry over.

Built with [Astro](https://astro.build) and hosted on Cloudflare Workers (static assets).

## Commands

```bash
npm install
npm run dev               # local dev server at http://localhost:4321
npm run build             # build to dist/ + URL safety check (fails on any missing legacy URL or broken link)
npm run check:enrichment  # verify Short Answers / FAQ answers are drawn from each post's own wording
npm run images            # regenerate headshot/banner and recompress /wp-content/uploads
```

## How the content is organized

```
src/content/posts/<slug>.md      one file per post: YAML frontmatter + body
src/content/pages/about.md       the About page
src/data/enrichment/<slug>.json  per-post Short Answer, FAQ and meta description (see docs/enrichment-guidelines.md)
src/data/categories.json, tags.json, comments.json   taxonomy + archived reader comments (read-only)
public/wp-content/uploads/       the old site's images, at their original URLs
wordpress-export/                raw WordPress.com API export + Internet Archive URL list (reference / URL checks)
scripts/export-wordpress.mjs     the migration script (re-runnable; keeps hand-added frontmatter)
```

The 61 migrated posts keep their original HTML (`format: html`) so **the post text is exactly what was published**.
Rendering only adds attributes (heading ids, image sizes, alt text from captions, video titles) and strips
empty quote blocks left by the WordPress editor.

## Adding a new post

1. Create `src/content/posts/<slug>.md`:

   ```markdown
   ---
   title: "How Georgia's Statute of Limitations Applies to Minors"
   date: 2026-11-04T14:00:00Z
   path: /2026/11/04/georgia-statute-of-limitations-minors/
   categories: [child-injury-statutes-of-limitation]
   tags: [georgia-statute-of-limitations]
   ---
   Post body in Markdown…
   ```

   - `path` must be `/YYYY/MM/DD/<slug>/` (same permalink format as the old site). Never change a published path;
     if you must, add a 301 in `public/_redirects`.
   - `categories`/`tags` use slugs from `src/data/categories.json` / `tags.json` (add new ones there).
   - `draft: true` hides a post.
2. Add `src/data/enrichment/<slug>.json` with the Short Answer, FAQ and description, following
   `docs/enrichment-guidelines.md` (stay in the post's own wording). Run `npm run check:enrichment`.
3. `npm run build`, commit, push. Cloudflare rebuilds and deploys automatically.

## SEO preservation — what's in place

- **Identical URLs** for all posts (`/YYYY/MM/DD/slug/`), `/about/`, home pagination (`/page/2/`…, 10 per page),
  every category (`/category/…/`) and tag (`/tag/…/`), and date archives (`/2011/`, `/2011/11/`, `/2011/11/09/`).
- **Same titles** (post title + site name), canonical URLs, publish dates; meta descriptions drawn from each post.
- **Images at their original paths** (`/wp-content/uploads/…`), recompressed (46 MB → 4 MB).
- **`/feed/`** RSS at the same URL; **`/sitemap.xml`** at the same URL.
- **301 redirects** (`public/_redirects`) for WordPress-only URLs: `/amp/`, per-post and comment feeds, `/author/…`,
  alternate term slugs (`…-2`), and 6 posts' earlier dated URLs found in the Internet Archive.
- **Structured data:** BlogPosting (author Pete Pearson with credentials), FAQPage, BreadcrumbList, Blog.
- **Build-time guard:** `scripts/check-urls.mjs` fails the build if any URL the old site served is missing or any
  internal link is broken; it also checks the 520 URLs the Internet Archive captured.

## Deploying / cutover from WordPress.com

**Cloudflare project** (Workers & Pages → Create → Import a repository → `foreignmotion/kidinjurylaw`):
deploy command `npx wrangler deploy`. The build runs automatically as part of the deploy (`build.command` in
`wrangler.jsonc`), so the Build command field can be left empty. Check the
`*.workers.dev` preview before switching DNS.

**DNS switch** (the domain's DNS is currently hosted by WordPress.com; registrar is Wild West Domains, which
WordPress.com uses for domains bought through it, so the nameserver setting is likely under WordPress.com → Domains):

1. In Cloudflare, **Add a domain** → `kidinjurylaw.com`. Let it import the existing records. (There are no MX
   records, so email isn't affected.)
2. Change the domain's **nameservers** to the two Cloudflare gives you.
3. Once active: Worker → Settings → Domains & Routes → add custom domains `kidinjurylaw.com` and
   `www.kidinjurylaw.com`, then add a Redirect Rule **www → root** (301, preserve path and query string).
4. **Keep the WordPress.com site** (don't delete it) for at least a year: `wp.me` short links and
   `kidinjurylaw.wordpress.com` links resolve through it to the same paths, which the new site serves.
5. **Google Search Console:** verify the domain (DNS TXT record in Cloudflare), submit
   `https://kidinjurylaw.com/sitemap.xml`, and watch Pages → "Not found (404)" for a few weeks.

## Open items for Pete

- Review the Short Answers and FAQs (in `src/data/enrichment/`); they're built from his wording, but they now
  sit prominently at the top of each post.
- Several 2011–2012 posts state Georgia law as it was then (e.g. the childhood sexual abuse filing deadline,
  unborn-child claims, abortion parental-notification claims). Their Short Answers repeat the post as written.
- Five embedded YouTube videos no longer play (removed, private, or embedding disabled) — same on the old site:
  dog-bite posts (2011/11/08, 2020/09/08: `mrQ1KO4j2bc`), shoulder dystocia (`zCiLr9Ap_Io`),
  sepsis (`ELjThkDk6u4`), hypoxic brain injury (`Ab2E0TSKFoI`).
- Footer: office address + privacy policy link (same open item as petepearsonlaw.com).
