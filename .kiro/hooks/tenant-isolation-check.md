---
description: Verify tenant isolation in server actions and API routes
trigger: onFileSave
match: "src/features/**/lib/*.ts,src/app/api/**/*.ts"
---

Scan the saved file for database queries (db.select, db.insert, db.update, db.delete). Verify each query includes a `tenantId` filter or ownership check through a parent chain. Flag any query that accesses data without tenant scoping.
