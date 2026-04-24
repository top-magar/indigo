#!/bin/bash
# Auto-commit hook for Kiro agents
# Runs on agent stop — commits any staged/modified files with a conventional commit message
cd /Users/topmagar/Desktop/indigo

# Check for type errors first
ERRORS=$(npx tsc --noEmit 2>&1 | grep 'error TS' | wc -l | tr -d ' ')
if [ "$ERRORS" -gt 0 ]; then
  echo "⚠️  $ERRORS type error(s) — skipping auto-commit"
  npx tsc --noEmit 2>&1 | grep 'error TS' | head -5
  exit 0
fi

# Check if there are changes to commit
if git diff --quiet && git diff --cached --quiet; then
  echo "✓ No changes to commit"
  exit 0
fi

# Show what changed
CHANGED=$(git diff --name-only | wc -l | tr -d ' ')
STAGED=$(git diff --cached --name-only | wc -l | tr -d ' ')
echo "📦 $CHANGED modified, $STAGED staged files"
git diff --name-only | head -10

# Stage all changes and commit
git add -A
git commit -m "wip: auto-commit from agent session" --no-verify 2>/dev/null || true
echo "✓ Auto-committed"
