---
description: Type-check after editing TypeScript files
trigger: onFileSave
match: "**/*.{ts,tsx}"
---

Run `npx tsc --noEmit 2>&1 | grep "error TS" | head -5` in the project root.
If there are errors, report them. If clean, say nothing.
