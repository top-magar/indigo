#!/bin/bash
OUTPUT="/Users/topmagar/Desktop/landing_page_full_code.md"

echo "# Indigo Landing Page - Full Source Code" > "$OUTPUT"
echo "This document contains the complete source code for the entire Indigo landing page architecture." >> "$OUTPUT"
echo "" >> "$OUTPUT"

files=(
  "src/app/page.tsx"
  "src/app/landing.css"
  "src/components/landing/landing-page.tsx"
  "src/components/landing/header.tsx"
  "src/components/landing/mega-menu.tsx"
  "src/components/landing/mobile-menu.tsx"
  "src/components/landing/hero.tsx"
  "src/components/landing/section-heading.tsx"
  "src/components/landing/frame.tsx"
  "src/components/landing/logo-marquee.tsx"
  "src/components/landing/hatch-divider.tsx"
  "src/components/landing/metrics.tsx"
  "src/components/landing/features.tsx"
  "src/components/landing/integrations.tsx"
  "src/components/landing/use-cases.tsx"
  "src/components/landing/differentiators.tsx"
  "src/components/landing/comparison.tsx"
  "src/components/landing/pricing.tsx"
  "src/components/landing/testimonials.tsx"
  "src/components/landing/blog.tsx"
  "src/components/landing/faq.tsx"
  "src/components/landing/final-cta.tsx"
  "src/components/landing/footer.tsx"
  "src/components/ui/kinetic-grid.tsx"
  "src/data/landing/navigation.ts"
  "src/data/landing/hero.ts"
  "src/data/landing/section-data.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "## \`$file\`" >> "$OUTPUT"
    echo "" >> "$OUTPUT"
    
    # Determine language for markdown block
    lang="tsx"
    if [[ "$file" == *".css" ]]; then lang="css"; fi
    if [[ "$file" == *".ts" && "$file" != *".tsx" ]]; then lang="typescript"; fi
    
    echo '```'"$lang" >> "$OUTPUT"
    cat "$file" >> "$OUTPUT"
    echo '```' >> "$OUTPUT"
    echo "" >> "$OUTPUT"
  fi
done

echo "Document generated at $OUTPUT"
