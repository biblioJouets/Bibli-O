#!/usr/bin/env bash
set +e
cd /c/Users/Lucas/Documents/dev/bibliojouets-next/bibliojouets || exit 1
GSTACK_BIN="$HOME/.cursor/skills/gstack/bin"
echo "ADV_START"
"$GSTACK_BIN/gstack-review-log" --start adversarial-review
echo "ADV_START_DONE"
B="$HOME/.cursor/skills/gstack/browse/dist/browse"
if [ -x "$B" ]; then
  echo "BROWSE_BIN=yes"
else
  echo "NEEDS_SETUP"
fi
echo "RESOLVE_START"
node -e 'try { console.log(require.resolve("@next/third-parties/google")); } catch (e) { console.log("RESOLVE_FAIL:" + e.code); process.exit(1); }'
echo "RESOLVE_EXIT=$?"
echo "PORT_SCAN"
for p in 3000 4000 8080; do
  if curl -sI --max-time 3 "http://localhost:$p" >/dev/null 2>&1; then
    echo "Found app on :$p"
  fi
done
echo "PRE_DONE"
