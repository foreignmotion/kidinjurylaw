# CLAUDE.md — kidinjurylaw.com (Kidinjury Law Blog)

Rules for anyone (including Claude) editing **kidinjurylaw.com**, Pete Pearson's blog for parents of injured
children. Read before editing. Its sister site is **petepearsonlaw.com**, repo `foreignmotion/petepearsonlaw`,
usually cloned next to this one (`../petepearsonlaw`).

## Deploy model — every edit goes live immediately

- **`main` is the live site.** Cloudflare rebuilds and redeploys kidinjurylaw.com on every push to `main`
  (a minute or two; the deploy runs `npm run build` itself — see `wrangler.jsonc`).
- **Edits are made directly on `main` and pushed right away. No branches, no pull requests, no preview step.**
  This is the owner's standing instruction for both Pete Pearson sites, from any computer. Do not ask "should I
  publish?" after a requested change — finishing the change *includes* publishing it (use `/publish`).
- The same sites are edited from **several computers**. To keep them from overwriting each other:
  - Every Claude session starts with an automatic `git pull` (SessionStart hook → `scripts/sync-on-start.sh`).
    Read its `[kidinjurylaw sync]` line and tell the user if it pulled changes or reported a problem.
  - Always `git pull --rebase` immediately before pushing (the `/publish` procedure does this).
  - **Never force-push** and never `git reset --hard` to a remote — that can erase another computer's edits.
    (Both are blocked in `.claude/settings.json`.)
  - Never end a session with unpushed or uncommitted work; it isn't live and the other computers can't see it.
- If a pull or rebase hits a **conflict** (two computers edited the same lines), stop, show the user both versions
  in plain language, and ask which to keep. Don't guess.
- **`npm run build` must pass before every push.** It fails if any URL from the old WordPress site goes missing or
  an internal link breaks — that guard is what protects the blog's search rankings. Never push a failing build.

## Procedures

- **`/publish`** — sync, build/check, commit, push, confirm on the live site. Use after every change.
- **`/setup-computer`** — check/fix this computer's setup (Git, GitHub sign-in, Node, both repos cloned).
- New computer from scratch: see `SETUP-NEW-COMPUTER.md` (the user pastes one sentence into Claude).
- Writing a new post: see "Adding a new post" in `README.md`.

## What this repo is

Astro static site; `npm run build` → `dist/` (never edit `dist/`). Preview: `npm run dev` → http://localhost:4321.

```
src/content/posts/<slug>.md      one file per post (migrated posts keep their original WordPress HTML)
src/content/pages/about.md       About page (/about/)
src/data/enrichment/<slug>.json  per-post Article Summary, FAQ, meta description
src/layouts/Base.astro           header, footer, closing CTA (shared design with petepearsonlaw.com)
src/components/PostView.astro    post page template
public/                          static files, incl. /wp-content/uploads images at their old URLs
public/_redirects                301s for old WordPress URLs
```

## Site rules (SEO-critical)

- **Never change a published post's `path`, slug or date folder.** URLs must stay exactly as on the old site. If a
  URL truly must change, add a 301 in `public/_redirects` in the same commit.
- **Never change the text of Pete's posts** unless he/the user explicitly asks for that specific change.
- **Article Summaries and FAQs** (`src/data/enrichment/`) must be built from the post's own wording — follow
  `docs/enrichment-guidelines.md` and run `npm run check:enrichment`.
- Keep image files under `public/wp-content/uploads/` even if a post stops using them (old image URLs still get
  traffic).
- **Shared with petepearsonlaw.com:** header, footer, closing call-to-action band and base CSS are duplicated in
  `../petepearsonlaw` (`public/index.html`, `public/about/index.html`, `public/assets/css/site.css`). When you
  change one of those here, make the same change there and publish both, unless the user says it's for one site.
- Keep the footer's "No fee until you win" disclaimer (Georgia attorney-advertising rules).
