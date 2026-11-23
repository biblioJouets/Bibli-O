#!/usr/bin/env bash
set +e
cd /c/Users/Lucas/Documents/dev/bibliojouets-next/bibliojouets || exit 1
echo "PWD=$(pwd)"
git rev-parse --abbrev-ref HEAD
git rev-parse --verify --quiet origin/main
echo "FETCH_START"
git fetch origin main --quiet
echo "FETCH_EXIT=$?"
if git rev-parse --verify --quiet origin/main >/dev/null; then
  echo "BASE_REFRESH: fresh"
else
  echo "BASE_REFRESH: stale missing"
fi
DIFF_BASE=$(git merge-base origin/main HEAD 2>/dev/null)
echo "DIFF_BASE=${DIFF_BASE:-MISSING}"
if [ -n "$DIFF_BASE" ]; then
  echo "=== STAT ==="
  git diff "$DIFF_BASE" --stat
  echo "=== NUM ==="
  git diff "$DIFF_BASE" --numstat | awk '{n+=$1+$2} END {print "DIFF_LINES:" n+0}'
  echo "=== NAME STATUS ==="
  git diff --name-status "$DIFF_BASE"
  echo "=== LOG ==="
  git log origin/main..HEAD --oneline
fi
echo "=== UNTRACKED SOURCE ==="
git ls-files --others --exclude-standard
echo "=== CONTRIBUTOR ==="
~/.cursor/skills/gstack/bin/gstack-contributor-mode detect
echo "DONE"
