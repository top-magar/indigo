import { NextResponse } from "next/server"
import { db } from "@/infrastructure/db"
import { tenants } from "@/db/schema/tenants"
import { eq } from "drizzle-orm"
import { withRateLimit } from "@/infrastructure/middleware/rate-limit"

const MAX_FIELDS = 20
const MAX_FIELD_LENGTH = 2000

function sanitizeFields(fields: unknown): Record<string, string> | null {
  if (typeof fields !== "object" || fields === null || Array.isArray(fields)) return null
  const entries = Object.entries(fields as Record<string, unknown>)
  if (entries.length === 0 || entries.length > MAX_FIELDS) return null
  const clean: Record<string, string> = {}
  for (const [key, val] of entries) {
    if (typeof key !== "string" || key.length > 100) return null
    clean[key] = String(val ?? "").slice(0, MAX_FIELD_LENGTH)
  }
  return clean
}

export const POST = withRateLimit("storefront", async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { tenantId, sectionId, fields } = body as {
    tenantId?: string; sectionId?: string; fields?: unknown
  }

  if (!tenantId || typeof tenantId !== "string") {
    return NextResponse.json({ error: "Missing tenantId" }, { status: 400 })
  }

  const cleanFields = sanitizeFields(fields)
  if (!cleanFields) {
    return NextResponse.json({ error: "Invalid fields" }, { status: 400 })
  }

  // Verify tenant exists
  const [tenant] = await db.select({ id: tenants.id })
    .from(tenants).where(eq(tenants.id, tenantId)).limit(1)
  if (!tenant) {
    return NextResponse.json({ error: "Invalid tenant" }, { status: 404 })
  }

  // Log submission (form_submissions table doesn't exist yet)
  console.log("[form-submit]", { tenantId, sectionId, fields: cleanFields })

  return NextResponse.json({ success: true })
})
