import { NextRequest, NextResponse } from "next/server";
import { getDomainById, removeDomain, getDnsInstructions } from "@/lib/services/domain";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/dashboard/domains/[id]
 * Get a specific domain by ID
 * 
 * Requirements: 6.1
 */
export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    const domain = await getDomainById(id);

    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // Include DNS instructions
    const instructions = getDnsInstructions(
      domain.domain,
      domain.verificationToken,
      domain.verificationMethod as "cname" | "txt"
    );

    return NextResponse.json({
      domain,
      instructions,
    });
  } catch (error) {
    console.error("Failed to fetch domain:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch domain" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/dashboard/domains/[id]
 * Remove a domain (also removes from Vercel if applicable)
 * 
 * Requirements: 6.1, 8.3
 */
export async function DELETE(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Domain ID is required" },
        { status: 400 }
      );
    }

    await removeDomain(id);

    return NextResponse.json({ 
      success: true,
      message: "Domain removed successfully"
    });
  } catch (error) {
    console.error("Failed to remove domain:", error);

    if (error instanceof Error) {
      if (error.message === "Unauthorized") {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      if (error.message === "Domain not found") {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to remove domain" },
      { status: 500 }
    );
  }
}
