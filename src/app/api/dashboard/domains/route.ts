import { NextRequest, NextResponse } from "next/server";
import { addDomain, getDomains, getDnsInstructions } from "@/infrastructure/services/domain";
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
const log = createLogger("api:dashboard-domains");

/**
 * GET /api/dashboard/domains
 * List all domains for the current tenant
 * 
 * Requirements: 6.1
 */
export const GET = withRateLimit("dashboard", async function GET() {
  try {
    const domains = await getDomains();
    return NextResponse.json({ domains });
  } catch (error) {
    log.error("Failed to fetch domains:", error);
    
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch domains" },
      { status: 500 }
    );
  }
})

/**
 * POST /api/dashboard/domains
 * Add a new custom domain for the current tenant
 * 
 * Requirements: 6.1
 */
export const POST = withRateLimit("dashboard", async function POST(request: Request) {
  try {
    const body = await request.json();
    const { domain } = body;

    if (!domain || typeof domain !== "string") {
      return NextResponse.json(
        { error: "Domain is required" },
        { status: 400 }
      );
    }

    const record = await addDomain(domain);
    
    // Include DNS instructions in response
    const instructions = getDnsInstructions(
      record.domain,
      record.verificationToken,
      record.verificationMethod as "cname" | "txt"
    );

    return NextResponse.json({
      domain: record,
      instructions,
    }, { status: 201 });
  } catch (error) {
    log.error("Failed to add domain:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (error.message === "Domain is already registered") {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      if (error.message === "Invalid domain format") {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to add domain" },
      { status: 500 }
    );
  }
})
