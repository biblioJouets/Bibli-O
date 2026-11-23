#!/usr/bin/env bash
set +e
cd /c/Users/Lucas/Documents/dev/bibliojouets-next/bibliojouets || exit 1
GSTACK_BIN="$HOME/.cursor/skills/gstack/bin"
echo "=== REVIEW LOG START ==="
"$GSTACK_BIN/gstack-review-log" --start review
echo "=== TODOS ==="
if [ -f TODOS.md ]; then echo "TODOS_EXISTS"; else echo "TODOS: none"; fi
echo "=== PLAN DISCOVERY ==="
BRANCH=$(git branch --show-current 2>/dev/null | tr '/' '-' | tr -cd 'a-zA-Z0-9._-')
echo "BRANCH_SLUG=$BRANCH"
_REPOTOP=$(git rev-parse --show-toplevel)
_BASE=$(git merge-base origin/main HEAD 2>/dev/null)
{ [ -n "$_BASE" ] && git -C "$_REPOTOP" diff --name-only --diff-filter=AM "$_BASE" -- 'docs/designs/*.md'
  [ -n "$BRANCH" ] && git -C "$_REPOTOP" grep -l -F -e "$BRANCH" -- 'docs/designs/*.md'
} 2>/dev/null | sort -u | sed "s|^|PLAN_CANDIDATE: $_REPOTOP/|"
GSTACK_STATE_ROOT=$("$GSTACK_BIN/gstack-paths" --get GSTACK_STATE_ROOT)
echo "STATE_ROOT=$GSTACK_STATE_ROOT"
_PLAN_SLUG=$("$GSTACK_BIN/gstack-slug" 2>/dev/null | sed -n 's/^SLUG=//p')
_PLAN_SLUG="${_PLAN_SLUG:-$(basename "$PWD" | tr -cd 'a-zA-Z0-9._-')}"
echo "PLAN_SLUG=$_PLAN_SLUG"
for PLAN_DIR in "$GSTACK_STATE_ROOT/projects/$_PLAN_SLUG" "$HOME/.claude/plans" "$HOME/.codex/plans" ".gstack/plans"; do
  [ -d "$PLAN_DIR" ] && [ -n "$BRANCH" ] || continue
  grep -l -F -e "$BRANCH" "$PLAN_DIR"/*.md 2>/dev/null | sed 's|^|PLAN_CANDIDATE: |'
done
echo "=== REVIEW BOTS ==="
"$GSTACK_BIN/gstack-review-bots" fetch
echo "=== GATE ==="
if GATE_OUT=$("$GSTACK_BIN/gstack-gate-diff" main 2>&1); then
  printf '%s\n' "$GATE_OUT"
else
  GATE_EXIT=$?
  printf '%s\n' "$GATE_OUT"
  echo "Gate integrity: UNAVAILABLE — helper exit $GATE_EXIT"
fi
echo "=== BANNED ==="
"$GSTACK_BIN/gstack-banned-terms" check --base main
echo "=== APPROVAL ==="
"$GSTACK_BIN/gstack-approval-classes" check --base main
echo "=== SCOPE ==="
_SM=$("$GSTACK_BIN/gstack-state-matrix" detect --base main) || _SM=SCOPE_STATE_MACHINE=unknown
echo "$_SM"
"$GSTACK_BIN/gstack-diff-scope" main
echo "=== SPECIALIST STATS ==="
"$GSTACK_BIN/gstack-specialist-stats"
echo "=== VERSION QUEUE ==="
BRANCH_VERSION=$(git show HEAD:VERSION 2>/dev/null | tr -d '\r\n[:space:]')
echo "BRANCH_VERSION=${BRANCH_VERSION:-none}"
echo "=== CODEX MODE ==="
_CODEX_CFG=$("$GSTACK_BIN/gstack-config" get --stored codex_reviews 2>/dev/null)
echo "CODEX_CFG=$_CODEX_CFG"
command -v codex >/dev/null 2>&1 && echo "CODEX_BIN=yes" || echo "CODEX_BIN=no"
echo "=== LEARNINGS ==="
"$GSTACK_BIN/gstack-learnings-search" --limit 10
echo "=== ASIDE ==="
command -v aside >/dev/null 2>&1 && echo "ASIDE_BIN=yes" || echo "NEEDS_ASIDE: windows"
echo "=== SLOP ==="
bun run slop:diff origin/main 2>/dev/null || echo "SLOP: unavailable"
echo "SCANS_DONE"
