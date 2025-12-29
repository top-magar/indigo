/**
 * Multi-Tenant Middleware
 * 
 * Edge middleware that handles:
 * 1. Tenant resolution via subdomain or custom domain
 * 2. Request routing to appropriate handlers
 * 3. Security (header injection prevention, host validation)
 * 4. NextAuth integration for protected routes
 * 
 * Note: Tenant resolution is done via internal API route to avoid
 * Edge Runtime compatibility issues with the database driver.
 * 
 * Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 3.2, 3.3, 3.5, 7.3
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Import hostname utilities
import {
  extractSubdomain,
  isPlatformHost,
  isValidHostname,
  getPlatformDomain,
  isCustomDomain,
} from "@/lib/tenant/hostname";

// Create Edge-compatible auth instance using only the config (no database providers)
const { auth } = NextAuth(authConfig);

// Internal secret for tenant resolution API
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET || "internal-tenant-resolution";

// Tenant headers that we set (and must strip from incoming requests)
const TENANT_HEADERS = ["x-tenant-id", "x-tenant-slug", "x-tenant-name"];

// Paths that should bypass tenant resolution entirely
const BYPASS_PATHS = [
  "/_next",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
];

// Paths that need auth handling on platform host
const AUTH_PROTECTED_PATHS = ["/dashboard"];

// Tenant info type
interface TenantInfo {
  id: string;
  slug: string;
  name: string;
  plan: string;
}

/**
 * Resolve tenant via internal API route
 * This avoids Edge Runtime compatibility issues with the database driver
 */
async function resolveTenant(
  request: NextRequest,
  params: { slug?: string; domain?: string }
): Promise<TenantInfo | null> {
  try {
    const url = new URL("/api/internal/tenant", request.nextUrl.origin);
    if (params.slug) {
      url.searchParams.set("slug", params.slug);
    } else if (params.domain) {
      url.searchParams.set("domain", params.domain);
    }

    const response = await fetch(url.toString(), {
      headers: {
        "x-internal-secret": INTERNAL_SECRET,
      },
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    return data.tenant || null;
  } catch (error) {
    console.error("Tenant resolution error:", error);
    return null;
  }
}

/**
 * Check if a path should bypass tenant resolution
 */
function shouldBypassTenantResolution(pathname: string): boolean {
  return BYPASS_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Check if a path requires authentication
 */
function requiresAuth(pathname: string): boolean {
  return AUTH_PROTECTED_PATHS.some(path => pathname.startsWith(path));
}

/**
 * Strip tenant headers from incoming request to prevent injection
 * Requirements: 7.3
 */
function stripTenantHeaders(request: NextRequest): Headers {
  const headers = new Headers(request.headers);
  for (const header of TENANT_HEADERS) {
    headers.delete(header);
  }
  return headers;
}

/**
 * Create a 404 response for unknown tenants
 */
function createNotFoundResponse(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = "/not-found";
  return NextResponse.rewrite(url);
}

/**
 * Create a 400 response for invalid requests
 */
function createBadRequestResponse(): NextResponse {
  return new NextResponse("Bad Request", { status: 400 });
}

/**
 * Handle subdomain tenant requests
 * Requirements: 1.1, 1.2, 1.3, 3.2, 3.3
 */
async function handleSubdomainRequest(
  request: NextRequest,
  subdomain: string
): Promise<NextResponse> {
  // Strip any incoming tenant headers for security
  const cleanHeaders = stripTenantHeaders(request);
  
  // Resolve tenant by slug via internal API
  const tenant = await resolveTenant(request, { slug: subdomain });
  
  if (!tenant) {
    // Tenant not found - return 404
    return createNotFoundResponse(request);
  }
  
  // Set tenant context headers
  cleanHeaders.set("x-tenant-id", tenant.id);
  cleanHeaders.set("x-tenant-slug", tenant.slug);
  cleanHeaders.set("x-tenant-name", tenant.name);
  
  // Rewrite to /store/[domain] route
  const url = request.nextUrl.clone();
  url.pathname = `/store/${tenant.slug}${request.nextUrl.pathname}`;
  
  return NextResponse.rewrite(url, {
    request: {
      headers: cleanHeaders,
    },
  });
}

/**
 * Handle custom domain tenant requests
 * Requirements: 2.1, 2.2, 2.3, 3.2, 3.3
 */
async function handleCustomDomainRequest(
  request: NextRequest,
  hostname: string
): Promise<NextResponse> {
  // Strip any incoming tenant headers for security
  const cleanHeaders = stripTenantHeaders(request);
  
  // Remove port from hostname for domain lookup
  const domain = hostname.split(":")[0].toLowerCase();
  
  // Resolve tenant by custom domain via internal API
  const tenant = await resolveTenant(request, { domain });
  
  if (!tenant) {
    // Domain not found or not verified - return 404
    return createNotFoundResponse(request);
  }
  
  // Set tenant context headers
  cleanHeaders.set("x-tenant-id", tenant.id);
  cleanHeaders.set("x-tenant-slug", tenant.slug);
  cleanHeaders.set("x-tenant-name", tenant.name);
  
  // Rewrite to /store/[domain] route
  const url = request.nextUrl.clone();
  url.pathname = `/store/${tenant.slug}${request.nextUrl.pathname}`;
  
  return NextResponse.rewrite(url, {
    request: {
      headers: cleanHeaders,
    },
  });
}

/**
 * Main middleware function wrapped with NextAuth
 */
export default auth(async function middleware(request: NextRequest) {
  const hostname = request.headers.get("host") || "";
  const pathname = request.nextUrl.pathname;
  
  // 1. Validate hostname to prevent host header injection
  // Requirements: 7.1
  if (!isValidHostname(hostname)) {
    return createBadRequestResponse();
  }
  
  // 2. Check if path should bypass tenant resolution
  if (shouldBypassTenantResolution(pathname)) {
    return NextResponse.next({
      request: {
        headers: stripTenantHeaders(request),
      },
    });
  }
  
  // 3. Check if this is a platform host (marketing, dashboard, auth)
  // Requirements: 3.4
  if (isPlatformHost(hostname)) {
    // For platform host, handle auth for protected routes
    // The auth wrapper handles session checking
    const session = (request as any).auth;
    
    if (requiresAuth(pathname)) {
      if (!session?.user) {
        // Redirect to login
        const url = request.nextUrl.clone();
        url.pathname = "/login";
        url.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(url);
      }
    }
    
    // If logged in and on login page, redirect to dashboard
    if (pathname === "/login" && session?.user) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    
    // Pass through with clean headers
    return NextResponse.next({
      request: {
        headers: stripTenantHeaders(request),
      },
    });
  }
  
  const platformDomain = getPlatformDomain();
  
  // 4. Check for subdomain
  // Requirements: 1.1, 1.2, 3.2
  const subdomain = extractSubdomain(hostname, platformDomain);
  if (subdomain) {
    return handleSubdomainRequest(request, subdomain);
  }
  
  // 5. Check for custom domain
  // Requirements: 2.1, 2.2, 3.2
  if (isCustomDomain(hostname, platformDomain)) {
    return handleCustomDomainRequest(request, hostname);
  }
  
  // 6. Unknown host - return 404
  // Requirements: 1.3, 2.3
  return createNotFoundResponse(request);
});

/**
 * Middleware configuration
 * Match all paths except static files and internal API
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     * - api/internal (internal API routes used by middleware)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/internal|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
