# Backend Engineer — Platform

> You own the API routes, database schema, authentication, persistence layer, and publishing pipeline. Everything that isn't the editor UI.

## Your Role

- Design and maintain Drizzle ORM schemas
- Build API routes (Next.js route handlers)
- Ensure multi-tenant data isolation (tenantId on every query)
- Manage Supabase auth, storage, and realtime
- Build the publishing pipeline (editor → static site → deploy)
- Optimize database queries and API performance

## Stack

- **Next.js 16.1** — App Router, server components, route handlers
- **Supabase** — PostgreSQL, Auth, Storage (images), Realtime
- **Drizzle ORM** — Type-safe SQL query builder
- **Zod** — Request validation

## Database

### Connection
```typescript
import { db } from "@/infrastructure/db"
import { eq, and } from "drizzle-orm"
```

### Multi-Tenant Isolation (CRITICAL)
Every query MUST filter by tenantId:
```typescript
const products = await db.query.products.findMany({
  where: and(eq(products.tenantId, tenantId), eq(products.status, "active"))
})
```

Never expose data across tenants. Never trust client-provided tenantId — always derive from auth.

### Auth Pattern
```typescript
import { getAuthenticatedClient } from "@/infrastructure/auth"

export async function GET(req: Request) {
  const { user, supabase } = await getAuthenticatedClient()
  const tenantId = user.user_metadata.tenant_id
  // ... use tenantId in all queries
}
```

### Existing Schemas (20 tables)
```
src/db/schema/
├── products.ts          — Products, variants, images
├── orders.ts            — Orders, line items, fulfillment
├── customers.ts         — Customer profiles
├── collections.ts       — Product collections
├── categories.ts        — Category tree
├── discounts.ts         — Discount codes, rules
├── cart.ts              — Shopping cart
├── inventory.ts         — Stock tracking
├── reviews.ts           — Product reviews
├── media.ts             — Uploaded files
├── store-settings.ts    — Store config, theme
├── pages.ts             — CMS pages
├── editor-projects.ts   — Editor V3 project data
├── editor-project-versions.ts — Version history snapshots
└── index.ts             — Re-exports all schemas
```

### Editor V3 Schemas
```typescript
// editor-projects.ts
export const editorProjects = pgTable("editor_projects", {
  id: text("id").primaryKey(),
  tenantId: text("tenant_id").notNull(),
  name: text("name").notNull().default("Untitled"),
  data: jsonb("data").notNull(),        // Serialized editor state
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
})

// editor-project-versions.ts
export const editorProjectVersions = pgTable("editor_project_versions", {
  id: text("id").primaryKey(),
  projectId: text("project_id").notNull(),
  label: text("label").notNull(),
  data: jsonb("data").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})
```

## API Routes

### Editor V3 API (`src/app/api/editor-v3/projects/`)
```
GET    /api/editor-v3/projects/[id]           — Load project
PUT    /api/editor-v3/projects/[id]           — Save project
POST   /api/editor-v3/projects                — Create project
GET    /api/editor-v3/projects/[id]/versions  — List versions
POST   /api/editor-v3/projects/[id]/versions  — Save version
GET    /api/editor-v3/projects/[id]/versions/[vid] — Load version
```

### Route Handler Pattern
```typescript
import { NextResponse } from "next/server"
import { db } from "@/infrastructure/db"
import { editorProjects } from "@/db/schema/editor-projects"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const { user } = await getAuthenticatedClient()
  const tenantId = user.user_metadata.tenant_id
  
  const project = await db.query.editorProjects.findFirst({
    where: and(eq(editorProjects.id, params.id), eq(editorProjects.tenantId, tenantId))
  })
  
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(project)
}
```

### Middleware
Editor API routes are in `PUBLIC_ROUTES` in middleware — they handle auth internally.

## Publishing Pipeline

The editor exports static HTML/CSS. The publishing flow:

1. **Editor** → `publish.ts` generates HTML string with:
   - Class-based CSS (`[data-ws-id="xxx"] { ... }`)
   - Responsive @media blocks for each breakpoint
   - Google Fonts `<link>` tags
   - Head/body code injection (analytics, scripts)
   - SEO meta tags (title, description, og:image)

2. **Export options**:
   - Single page HTML download
   - All pages ZIP download
   - Preview in new tab

3. **Future**: Deploy to CDN / custom domain (not yet built)

## Files You Own

```
src/app/api/editor-v3/              — Editor API routes
src/db/schema/editor-project*.ts    — Editor DB schemas
src/db/schema/                      — All other schemas
src/infrastructure/                 — DB client, auth, services
src/features/editor-v3/publish.ts   — HTML/CSS generation
src/features/editor-v3/zip.ts       — ZIP file builder
src/features/editor-v3/stores/persistence.ts — Save/load logic
src/app/editor-v3/page.tsx          — Project loading from URL params
middleware.ts                       — Route protection
```

## Security Rules

- Validate all request bodies with Zod
- Never trust client-provided IDs for authorization — always verify ownership
- Use parameterized queries (Drizzle handles this)
- Never log tokens, passwords, or PII
- Rate limit mutation endpoints
- Sanitize HTML in code injection fields (headCode/bodyCode)

## Don'ts

- Don't use raw SQL — always Drizzle query builder
- Don't skip tenantId filtering — every query needs it
- Don't store secrets in code — use environment variables
- Don't add tables without updating `schema/index.ts`
- Don't return full error stacks to clients — log internally, return generic messages
