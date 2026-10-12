#!/usr/bin/env bash
# Runs when Claude Code starts in this repo (SessionStart hook in .claude/settings.json).
# Pulls the latest edits made from any other computer so work always starts from what's live.
# Output is shown to Claude as session context; it never blocks the session.
export GIT_TERMINAL_PROMPT=0
root="$(git rev-parse --show-toplevel 2>/dev/null)" || exit 0
cd "$root" || exit 0
site="$(basename "$root")"

before="$(git rev-parse HEAD 2>/dev/null)"
if out="$(git pull --rebase --autostash 2>&1)"; then
  after="$(git rev-parse HEAD)"
  if [ "$before" != "$after" ]; then
    n="$(git rev-list --count "$before..$after" 2>/dev/null)"
    echo "[$site sync] Pulled $n new change(s) from GitHub (made on another computer). Working copy is now up to date with the live site."
  else
    echo "[$site sync] Already up to date with GitHub."
  fi
else
  git rebase --abort >/dev/null 2>&1
  echo "[$site sync] WARNING: could not sync with GitHub automatically. Tell the user before editing, then run /setup-computer or resolve it. git said:"
  echo "$out" | tail -5
fi

ahead="$(git rev-list --count '@{u}..HEAD' 2>/dev/null)"
dirty="$(git status --porcelain 2>/dev/null | wc -l | tr -d ' ')"
[ "${ahead:-0}" -gt 0 ] && echo "[$site sync] NOTE: $ahead local commit(s) are not on GitHub yet, so they are NOT live. Offer to publish them (/publish)."
[ "${dirty:-0}" -gt 0 ] && echo "[$site sync] NOTE: $dirty uncommitted file change(s) on this computer are NOT live. Ask the user whether to publish or discard them."
exit 0
