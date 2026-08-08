#!/bin/bash
OUTPUT="/Users/topmagar/Desktop/landing_page_full_code.md"

echo "# Indigo Landing Page - Full Source Code" > "$OUTPUT"
echo "This document contains the complete source code for the entire Indigo landing page architecture." >> "$OUTPUT"
echo "" >> "$OUTPUT"

# Use find to get everything dynamically
files=(
  "src/app/page.tsx"
  "src/app/landing.css"
  "src/components/ui/kinetic-grid.tsx"
)

# Add all files in src/components/landing and src/data/landing
while IFS= read -r file; do
  files+=("$file")
done < <(find src/components/landing src/data/landing -type f | sort)

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
