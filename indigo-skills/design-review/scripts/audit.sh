#!/bin/bash
# Indigo Design System Audit Script
# Usage: bash audit.sh [path]
# Default: scans src/components/dashboard and src/app/dashboard

TARGET="${1:-src/components/dashboard src/app/dashboard src/components/store}"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'
ISSUES=0

echo "🔍 Indigo Design System Audit"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1. Hardcoded hex colors
COUNT=$(grep -rn 'bg-\[#\|text-\[#\|border-\[#' $TARGET --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo -e "${RED}✗ Hardcoded hex colors: $COUNT${NC}"
  grep -rn 'bg-\[#\|text-\[#\|border-\[#' $TARGET --include="*.tsx" 2>/dev/null | head -5
  ISSUES=$((ISSUES + COUNT))
else
  echo -e "${GREEN}✓ No hardcoded hex colors${NC}"
fi

# 2. Raw Tailwind colors
COUNT=$(grep -rn 'bg-gray-\|text-gray-\|border-gray-\|bg-red-\|bg-green-\|bg-blue-' $TARGET --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo -e "${RED}✗ Raw Tailwind colors: $COUNT${NC}"
  grep -rn 'bg-gray-\|text-gray-\|border-gray-' $TARGET --include="*.tsx" 2>/dev/null | head -5
  ISSUES=$((ISSUES + COUNT))
else
  echo -e "${GREEN}✓ No raw Tailwind colors${NC}"
fi

# 3. Explicit dark: overrides
COUNT=$(grep -rn 'dark:' $TARGET --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
if [ "$COUNT" -gt 2 ]; then
  echo -e "${YELLOW}⚠ Explicit dark: overrides: $COUNT (target: ≤2)${NC}"
  grep -rn 'dark:' $TARGET --include="*.tsx" 2>/dev/null | head -5
  ISSUES=$((ISSUES + COUNT))
else
  echo -e "${GREEN}✓ Minimal dark: overrides ($COUNT)${NC}"
fi

# 4. font-bold usage
COUNT=$(grep -rn 'font-bold' $TARGET --include="*.tsx" 2>/dev/null | grep -v 'font-semibold\|font-extrabold' | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo -e "${RED}✗ font-bold usage: $COUNT (use font-semibold)${NC}"
  ISSUES=$((ISSUES + COUNT))
else
  echo -e "${GREEN}✓ No font-bold (correct per Geist)${NC}"
fi

# 5. as any casts
COUNT=$(grep -rn 'as any' $TARGET --include="*.tsx" 2>/dev/null | grep -v 'eslint-disable' | wc -l | tr -d ' ')
if [ "$COUNT" -gt 0 ]; then
  echo -e "${YELLOW}⚠ Type-unsafe 'as any' casts: $COUNT${NC}"
  grep -rn 'as any' $TARGET --include="*.tsx" 2>/dev/null | grep -v 'eslint-disable' | head -5
  ISSUES=$((ISSUES + COUNT))
else
  echo -e "${GREEN}✓ No unguarded 'as any' casts${NC}"
fi

# 6. Missing loading.tsx
echo ""
echo "Loading state coverage:"
MISSING=0
for dir in src/app/dashboard/*/; do
  MODULE=$(basename "$dir")
  if [ -f "$dir/page.tsx" ] && [ ! -f "$dir/loading.tsx" ]; then
    echo -e "  ${RED}✗ $MODULE — missing loading.tsx${NC}"
    MISSING=$((MISSING + 1))
  fi
done
if [ "$MISSING" -eq 0 ]; then
  echo -e "  ${GREEN}✓ All pages have loading.tsx${NC}"
fi
ISSUES=$((ISSUES + MISSING))

# 7. Accessibility
echo ""
echo "Accessibility:"
ARIA=$(grep -rn 'aria-' $TARGET --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
MOTION=$(grep -rn 'motion-reduce\|prefers-reduced-motion' $TARGET --include="*.tsx" 2>/dev/null | wc -l | tr -d ' ')
echo -e "  aria attributes: $ARIA usages"
echo -e "  motion-reduce: $MOTION usages"

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ "$ISSUES" -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed${NC}"
else
  echo -e "${YELLOW}$ISSUES issue(s) found${NC}"
fi
