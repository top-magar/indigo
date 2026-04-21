---
description: Remind to create migration when schema files change
trigger: onFileSave
match: "src/db/schema/*.ts"
---

A database schema file was modified. Check if a corresponding SQL migration exists in `supabase/migrations/`. If not, remind the user to create one and run `npx supabase db push`.
