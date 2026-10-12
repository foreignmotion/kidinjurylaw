# Set up a computer to edit the Pete Pearson websites

This guide gets any Mac or Windows computer ready to edit **petepearsonlaw.com** and **kidinjurylaw.com** with
Claude. Once it's done, anything you ask Claude to change on either site goes **live within a couple of minutes**,
and every computer stays in sync automatically.

## Start here (the only thing you do by hand)

1. Install the **Claude desktop app** from <https://claude.ai/download> and sign in.
2. Open the **Code** tab, start a new session (any folder is fine), and paste this:

   > Set up this computer so I can edit the Pete Pearson websites. Follow the guide at
   > https://raw.githubusercontent.com/foreignmotion/petepearsonlaw/main/SETUP-NEW-COMPUTER.md

Claude takes it from there and tells you when it needs you to click or type something.

---

## Instructions for Claude

You are setting up this computer for a non-technical user. Go **one step at a time**, explain each step in a
sentence, run the checks yourself, and only ask the user to act when something needs their password, a browser
sign-in, or a choice. Skip steps whose check already passes. Keep a short checklist and show it at the end.

Facts you need:

- Repos (public on GitHub, owner **foreignmotion**): `foreignmotion/petepearsonlaw` and `foreignmotion/kidinjurylaw`.
- Both are cloned **side by side in the same parent folder** (default: the user's `Documents` folder), so each
  site can reach the other at `../petepearsonlaw` / `../kidinjurylaw`.
- Publishing = pushing to `main`. Pushing needs a GitHub account with **write access** to both repos.
- Hosting is Cloudflare, connected to GitHub. Nothing to set up on Cloudflare per computer.

### Step 1 — Which computer is this?

Detect the OS (`uname -s`; on Windows use PowerShell/Git Bash). Use the matching commands below.

### Step 2 — Install the tools: Git, GitHub CLI (`gh`), Node.js 20+

Check: `git --version`, `gh --version`, `node --version` (need v20 or newer).

**Mac**

- Git missing → run `xcode-select --install`; a system dialog appears — ask the user to click **Install** and
  wait for it to finish.
- Homebrew (`brew --version`) missing → it needs the user's password, so ask them to open the **Terminal** app,
  paste the install command from <https://brew.sh>, press Return, and follow its prompts (including the
  "Next steps" lines it prints to add brew to the PATH). Then continue.
- `brew install gh node` (installs whichever are missing; `brew upgrade node` if Node is older than v20).

**Windows**

- `winget install --id Git.Git -e`, `winget install --id GitHub.cli -e`, `winget install --id OpenJS.NodeJS.LTS -e`
  (only the missing ones). Accept the prompts.
- After installing, the user must **quit and reopen the Claude app** so the new tools are found; tell them, and
  tell them to paste the same starter sentence again — you'll resume where the checks show you left off.

Re-run the checks before moving on.

### Step 3 — Sign in to GitHub

Check: `gh auth status` shows a logged-in account.

If not signed in, the sign-in is interactive, so ask the user to run this in a terminal window (Mac: Terminal app;
Windows: "Git Bash" or PowerShell) and follow the prompts (it opens the browser and shows a one-time code):

```
gh auth login --hostname github.com --git-protocol https --web
```

Then run `gh auth setup-git` yourself (lets `git push` use that sign-in).

Check write access to both repos:

```
gh api repos/foreignmotion/petepearsonlaw --jq .permissions.push
gh api repos/foreignmotion/kidinjurylaw --jq .permissions.push
```

Both must print `true`. If not, the signed-in account isn't allowed to publish. Either sign in as the
**foreignmotion** account, or have the owner invite this person's GitHub account as a collaborator (from a
computer signed in as foreignmotion: `gh api -X PUT repos/foreignmotion/<repo>/collaborators/<username>` for each
repo; the invitee accepts the email/GitHub invite). Re-check.

### Step 4 — Git name and email

Check `git config --global user.name` and `git config --global user.email`. If either is empty, ask the user
what name and email should appear on their edits, then set them with `git config --global`.

### Step 5 — Get both websites onto this computer

Ask where to keep them (default `~/Documents`, i.e. the Documents folder; on Windows `%USERPROFILE%\Documents`).
In that folder:

- If `petepearsonlaw` / `kidinjurylaw` already exist and are clones of these repos → `git pull` in each.
- Otherwise: `gh repo clone foreignmotion/petepearsonlaw` and `gh repo clone foreignmotion/kidinjurylaw`.

Then install dependencies: `npm install` in **each** repo.

### Step 6 — Verify

Run all of these and report results in a checklist:

1. `kidinjurylaw`: `npm run build` ends with "✓ every legacy URL is served or redirected".
2. Both repos: `git status` is clean and on `main`; `git push --dry-run` succeeds (proves publish access
   without changing anything).
3. Both repos: `bash scripts/sync-on-start.sh` prints "Already up to date with GitHub."

### Step 7 — Show the user how to work from now on

Tell them, briefly:

- **To edit a site:** in the Claude app's Code tab, start a new session and choose the site's folder
  (`petepearsonlaw` or `kidinjurylaw`). Claude automatically pulls the latest edits from the other computers
  first. Then just ask for the change in plain English.
- **Edits go live automatically:** Claude publishes each change as soon as it's done (`/publish`), and confirms
  when it's live (about 1–2 minutes). There's no separate approval step.
- **Changes that affect both sites** (header, footer, the closing "Get All Your Legal Questions Answered" band):
  Claude makes them on both; it may ask permission to open the other site's folder.
- **Re-check this computer anytime:** ask Claude to "check my setup" (`/setup-computer`).
- **Two computers at once is fine.** If both change the same sentence at the same moment, Claude will show both
  versions and ask which to keep.
