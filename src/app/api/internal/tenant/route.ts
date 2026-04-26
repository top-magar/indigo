/**
 * Internal Tenant Resolution API
 * 
 * This API route is used by the middleware to resolve tenants.
 * It runs in Node.js runtime and can access the database.
 * 
 * This is an internal API and should not be exposed publicly.
 * The middleware uses this to resolve tenants by slug or domain.
 */

import { NextRequest, NextResponse } from "next/server";
import { resolveBySlug, resolveByDomain } from "@/infrastructure/tenant/resolver";
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
const log = createLogger("api:internal-tenant");

// Internal secret to prevent unauthorized access
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

export const GET = withRateLimit("dashboard", async function GET(request: Request) {
  const req = request as NextRequest;
  if (!INTERNAL_SECRET) return NextResponse.json({ error: "Not configured" }, { status: 500 });
  // Verify internal request
  const authHeader = req.headers.get("x-internal-secret");
  if (authHeader !== INTERNAL_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const slug = searchParams.get("slug");
  const domain = searchParams.get("domain");

  try {
    let tenant = null;

    if (slug) {
      tenant = await resolveBySlug(slug);
    } else if (domain) {
      tenant = await resolveByDomain(domain);
    } else {
      return NextResponse.json({ error: "Missing slug or domain parameter" }, { status: 400 });
    }

    if (!tenant) {
      return NextResponse.json({ tenant: null }, { status: 200 });
    }

    return NextResponse.json({ tenant }, { status: 200 });
  } catch (error) {
    log.error("Tenant resolution error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
})
