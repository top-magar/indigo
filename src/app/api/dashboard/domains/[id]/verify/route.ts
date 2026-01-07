import { NextRequest, NextResponse } from "next/server";
import { verifyDomain, refreshDomainStatus, getDomainById } from "@/infrastructure/services/domain";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/dashboard/domains/[id]/verify
 * Trigger DNS verification for a domain
 * If domain is already verified, refreshes status from Vercel
 * 
 * Requirements: 6.3, 6.6, 8.1, 8.2, 8.5
 */
export async function POST(
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

    // First check if domain exists and belongs to tenant
    const domain = await getDomainById(id);
    
    if (!domain) {
      return NextResponse.json(
        { error: "Domain not found" },
        { status: 404 }
      );
    }

    // If domain is already verified, refresh status from Vercel
    // This allows checking if SSL has been provisioned
    let result;
    if (domain.status === "verified" || domain.status === "active") {
      result = await refreshDomainStatus(id);
    } else {
      // Perform full verification (DNS + Vercel API)
      result = await verifyDomain(id);
    }

    if (result.success) {
      // Fetch updated domain record
      const updatedDomain = await getDomainById(id);
      
      return NextResponse.json({
        success: true,
        domain: updatedDomain,
        message: updatedDomain?.status === "active" 
          ? "Domain is active and SSL is ready"
          : "Domain verified successfully. SSL certificate is being provisioned.",
      });
    }

    // Return verification failure with details
    return NextResponse.json({
      success: false,
      error: result.error,
      errorCode: result.errorCode,
      dnsRecords: result.dnsRecords,
    }, { status: 400 });
  } catch (error) {
    console.error("Failed to verify domain:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to verify domain" },
      { status: 500 }
    );
  }
}
