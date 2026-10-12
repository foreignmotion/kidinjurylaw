---
name: publish
description: Publish changes to the live Pete Pearson website (petepearsonlaw.com or kidinjurylaw.com) — sync with GitHub, run the site's checks, commit, push to main, and confirm the change is live. Use after every requested edit (edits always go live immediately; no branches or pull requests), or when the user says publish / push / make it live / deploy / save my changes.
---

# Publish to the live site

These sites have **no review step**: pushing to `main` is publishing, and the owner wants every edit live
immediately, from whichever computer it was made on. Your job is to do that safely without overwriting edits
made on another computer.

Work out which site you're in from the repo folder name (`git rev-parse --show-toplevel`):

| Repo | Live URL | Check before pushing |
|---|---|---|
| `petepearsonlaw` | https://petepearsonlaw.com | none required (static HTML); preview if the change is visual |
| `kidinjurylaw` | https://kidinjurylaw.com | `npm run build` must pass (URL/SEO guard); `npm run check:enrichment` if `src/data/enrichment/` changed |

## Steps

1. **Be on `main`.** `git branch --show-current`. If it's not `main`, tell the user and switch
   (`git switch main`) — never publish from another branch.
2. **See what's changing.** `git status --short` and `git diff --stat`. If there's nothing uncommitted and
   nothing ahead of `origin/main` (`git rev-list --count @{u}..HEAD`), say "nothing to publish" and stop.
   Make sure every changed file is something the user asked for; don't sweep in stray files.
3. **Shared parts?** If the change touched the header, footer, closing call-to-action band or shared CSS, check
   the sister repo (`../petepearsonlaw` or `../kidinjurylaw`) got the same edit (see CLAUDE.md), unless the user
   said it's for one site only. Publish the sister repo too, with these same steps.
4. **Run the site's checks** (table above). If a check fails, fix it or tell the user — never push a failing build.
5. **Commit** with a short plain-English message describing the change for a non-technical reader
   (e.g. "Homepage: add Pete's direct line under the closing headline"). `git add -A` then `git commit`.
6. **Sync before pushing:** `git pull --rebase`. This brings in anything pushed from another computer since the
   session started.
   - **Conflict?** Stop. `git status` shows the files. Explain both versions to the user in plain language and
     ask which to keep; resolve, `git add`, `git rebase --continue`. If unsure, `git rebase --abort` and ask.
   - If the pull brought in new commits on `kidinjurylaw`, re-run `npm run build` before pushing.
7. **Push:** `git push`. If it's rejected because GitHub moved on in the meantime, repeat step 6 and push again
   (up to 3 tries). **Never** use `--force`.
8. **Confirm it's live.** Cloudflare deploys in about 1–2 minutes. Pick a distinctive piece of the new content
   and poll the live page until it appears (every ~20 s, up to ~4 minutes), bypassing caches:
   `curl -s "https://<site>/<path>?v=$(date +%s)" | grep -c "<distinctive text>"`.
   If it doesn't appear in time, say it's pushed and Cloudflare is still deploying (or the domain isn't pointed
   at Cloudflare yet), and give the user the commit link so they can check later.
9. **Report** in two or three lines: what changed, the live URL to look at, and the commit link
   (`https://github.com/foreignmotion/<repo>/commit/<sha>`).
