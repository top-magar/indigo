#!/bin/bash
# Indigo Health Check — run at session start
set -e
cd "$(dirname "$0")/.."

echo "🔍 Indigo Health Check"
echo "━━━━━━━━━━━━━━━━━━━━━"

# TypeScript
echo -n "TypeScript: "
errors=$(npx tsc --noEmit 2>&1 | grep 'error TS' | wc -l | tr -d ' ')
[ "$errors" = "0" ] && echo "✅ clean" || echo "❌ $errors errors"

# Mira compliance
echo -n "Mira (size=sm): "
sm=$(grep -rc 'size="sm"' src/ --include='*.tsx' 2>/dev/null | grep -v ':0\|editor-v2\|components/ui/' | awk -F: '{s+=$2}END{print s+0}')
[ "$sm" = "0" ] && echo "✅ clean" || echo "⚠️  $sm instances"

# Security: service_role leaks
echo -n "Security (service_role): "
leaks=$(grep -rn 'service_role' src/ --include='*.ts' --include='*.tsx' 2>/dev/null | grep -v 'node_modules\|\.env\|types\|supabase/admin' | wc -l | tr -d ' ')
[ "$leaks" = "0" ] && echo "✅ clean" || echo "🔴 $leaks leaks"

# Hardcoded heights
echo -n "Hardcoded h-10+ on controls: "
hc=$(grep -rn 'className.*h-1[0-9]' src/ --include='*.tsx' 2>/dev/null | grep -v 'editor-v2\|editor/\|components/ui/\|landing/\|skeleton\|chart\|avatar\|image\|mobile-nav\|widget-container' | grep -i 'button\|input\|select\|trigger' | wc -l | tr -d ' ')
[ "$hc" = "0" ] && echo "✅ clean" || echo "⚠️  $hc instances"

# Git status
echo -n "Git: "
dirty=$(git status --porcelain | wc -l | tr -d ' ')
[ "$dirty" = "0" ] && echo "✅ clean" || echo "📝 $dirty uncommitted files"

echo "━━━━━━━━━━━━━━━━━━━━━"
