/**
 * Next.js Proxy - Multi-tenant Domain Routing & Supabase Auth
 * 
 * Handles:
 * - Custom domain resolution → rewrites to /store/[slug]
 * - Subdomain-based tenant routing (e.g., acme.platform.com)
 * - Supabase Auth protection for dashboard/editor routes
 * - Locale detection from Accept-Language header
 * 
 * Auth Strategy: Supabase Auth (recommended for multi-tenant with RLS)
 * - Seamless RLS integration via auth.uid()
 * - Managed OAuth providers (Google, GitHub, etc.)
 * - Auto-scaling, no session management overhead
 * - Easy migration path if needed (export users via API)
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { isValidLocale, getLocaleFromHeaders, type Locale } from '@/shared/i18n/config'

// Platform domain from environment
const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN 
  || process.env.VERCEL_URL 
  || "localhost:3000"

// Reserved subdomains that should not be treated as tenant slugs
const RESERVED_SUBDOMAINS = new Set([
  "www",
  "api",
  "admin",
  "dashboard",
  "app",
  "mail",
  "smtp",
  "ftp",
  "cdn",
  "static",
  "assets",
  "docs",
  "help",
  "support",
  "status",
])

// Paths that should skip proxy processing entirely
const BYPASS_PATHS = [
  "/_next",
  "/api",
  "/favicon.ico",
  "/robots.txt",
  "/sitemap.xml",
  "/manifest.json",
  "/.well-known",
]

// Protected routes that require authentication
const PROTECTED_ROUTES = [
  "/dashboard",
  "/storefront", // Visual editor
]

// Auth routes - skip auth checks for these
const AUTH_ROUTES = ["/login", "/signup", "/register", "/forgot-password", "/verify", "/auth/callback", "/auth/onboarding"]

// Platform-only paths (not tenant routes)
const PLATFORM_PATHS = [
  "/dashboard",
  "/login",
  "/signup",
  "/register",
  "/storefront",
  "/settings",
  "/auth",
]

/**
 * Check if path should bypass proxy processing
 */
function shouldBypass(pathname: string): boolean {
  return BYPASS_PATHS.some(path => pathname.startsWith(path))
}

/**
 * Check if path is a platform-only route
 */
function isPlatformPath(pathname: string): boolean {
  return PLATFORM_PATHS.some(path => pathname.startsWith(path))
}

/**
 * Check if path requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route))
}

/**
 * Check if path is an auth route
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some(route => pathname === route || pathname.startsWith(route))
}

/**
 * Check if a hostname is a custom domain
 */
function isCustomDomain(hostname: string): boolean {
  const hostWithoutPort = hostname.split(":")[0].toLowerCase()
  const platformWithoutPort = PLATFORM_DOMAIN.split(":")[0].toLowerCase()
  
  if (hostWithoutPort === platformWithoutPort) return false
  if (hostWithoutPort.endsWith(`.${platformWithoutPort}`)) return false
  if (hostWithoutPort === "localhost" || hostWithoutPort === "127.0.0.1") return false
  
  return true
}

/**
 * Extract subdomain from hostname
 */
function extractSubdomain(hostname: string): string | null {
  const hostWithoutPort = hostname.split(":")[0].toLowerCase()
  const platformWithoutPort = PLATFORM_DOMAIN.split(":")[0].toLowerCase()
  
  if (hostWithoutPort.endsWith(`.${platformWithoutPort}`)) {
    const subdomain = hostWithoutPort.replace(`.${platformWithoutPort}`, "")
    if (RESERVED_SUBDOMAINS.has(subdomain)) return null
    return subdomain
  }
  
  return null
}

/**
 * Get locale from cookie or headers
 */
function getLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) return cookieLocale
  
  const acceptLanguage = request.headers.get('accept-language')
  return getLocaleFromHeaders(acceptLanguage)
}

/**
 * Domain cache to reduce DB lookups
 */
const domainCache = new Map<string, { slug: string; id: string; expires: number }>()
const CACHE_TTL = 60 * 1000 // 1 minute

async function resolveDomainToTenant(domain: string): Promise<{ slug: string; id: string } | null> {
  const cached = domainCache.get(domain)
  if (cached && cached.expires > Date.now()) {
    return { slug: cached.slug, id: cached.id }
  }
  
  try {
    const { resolveByDomain } = await import("@/infrastructure/tenant/resolver")
    const tenant = await resolveByDomain(domain)
    
    if (tenant) {
      domainCache.set(domain, {
        slug: tenant.slug,
        id: tenant.id,
        expires: Date.now() + CACHE_TTL,
      })
      return { slug: tenant.slug, id: tenant.id }
    }
    
    return null
  } catch (error) {
    console.error("[Proxy] Error resolving domain:", error)
    return null
  }
}

/**
 * Create Supabase client for auth checks in proxy
 */
function createSupabaseClient(request: NextRequest, response: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}

/**
 * Main proxy function
 */
export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const hostname = request.headers.get("host") || ""
  
  // Skip bypass paths
  if (shouldBypass(pathname)) {
    return NextResponse.next()
  }
  
  // Detect locale
  const locale = getLocale(request)
  
  // Create response for cookie handling
  let response = NextResponse.next({
    request,
  })
  
  // Handle auth for protected routes on platform domain
  if (!isCustomDomain(hostname) && !extractSubdomain(hostname)) {
    const authResponse = await handleAuth(request, response, locale)
    if (authResponse) return authResponse
    // Update response if auth modified cookies
    response = authResponse || response
  }
  
  // Handle custom domain requests
  if (isCustomDomain(hostname)) {
    return handleCustomDomain(request, hostname, locale)
  }
  
  // Handle subdomain-based tenant access
  const subdomain = extractSubdomain(hostname)
  if (subdomain && !isPlatformPath(pathname)) {
    return handleSubdomain(request, subdomain, locale)
  }
  
  // Platform domain - add locale header
  response.headers.set('x-locale', locale)
  
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
      sameSite: 'lax',
    })
  }
  
  return response
}

/**
 * Handle Supabase authentication for protected routes
 */
async function handleAuth(
  request: NextRequest, 
  response: NextResponse,
  locale: Locale
): Promise<NextResponse | null> {
  const { pathname } = request.nextUrl
  
  // Skip auth check for auth routes
  if (isAuthRoute(pathname)) {
    // But check if logged-in user is accessing login/signup - redirect to dashboard
    const supabase = createSupabaseClient(request, response)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user && (pathname === "/login" || pathname === "/signup")) {
      // Check if user has a profile with tenant
      const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single()
      
      if (userData?.tenant_id) {
        return NextResponse.redirect(new URL("/dashboard", request.url))
      } else {
        // User needs to complete onboarding
        return NextResponse.redirect(new URL("/auth/onboarding", request.url))
      }
    }
    return null
  }
  
  // Check protected routes with Supabase Auth
  if (isProtectedRoute(pathname)) {
    const supabase = createSupabaseClient(request, response)
    
    // getUser() validates the session server-side (more secure than getSession)
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Check if user has completed onboarding (has tenant_id)
    const { data: userData } = await supabase
      .from("users")
      .select("tenant_id")
      .eq("id", user.id)
      .single()
    
    if (!userData?.tenant_id) {
      // User needs to complete onboarding first
      return NextResponse.redirect(new URL("/auth/onboarding", request.url))
    }
    
    // Add user info to headers for downstream use
    response.headers.set("x-user-id", user.id)
    response.headers.set("x-user-email", user.email || "")
    response.headers.set("x-tenant-id", userData.tenant_id)
  }
  
  return null
}

/**
 * Handle requests from custom domains
 */
async function handleCustomDomain(
  request: NextRequest, 
  hostname: string,
  locale: Locale
): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl
  const domain = hostname.split(":")[0].toLowerCase()
  
  const tenant = await resolveDomainToTenant(domain)
  
  if (!tenant) {
    console.warn(`[Proxy] Unknown custom domain: ${domain}`)
    return NextResponse.redirect(new URL("/", `https://${PLATFORM_DOMAIN}`))
  }
  
  const url = request.nextUrl.clone()
  url.pathname = pathname === "/" ? `/store/${tenant.slug}` : `/store/${tenant.slug}${pathname}`
  url.search = search
  
  const response = NextResponse.rewrite(url)
  response.headers.set("x-tenant-id", tenant.id)
  response.headers.set("x-tenant-slug", tenant.slug)
  response.headers.set("x-custom-domain", domain)
  response.headers.set("x-locale", locale)
  
  return response
}

/**
 * Handle requests from subdomains
 */
async function handleSubdomain(
  request: NextRequest, 
  subdomain: string,
  locale: Locale
): Promise<NextResponse> {
  const { pathname, search } = request.nextUrl
  
  const url = request.nextUrl.clone()
  
  if (pathname === "/") {
    url.pathname = `/store/${subdomain}`
  } else if (!pathname.startsWith("/store/")) {
    url.pathname = `/store/${subdomain}${pathname}`
  }
  
  url.search = search
  
  const response = NextResponse.rewrite(url)
  response.headers.set("x-tenant-slug", subdomain)
  response.headers.set("x-subdomain", subdomain)
  response.headers.set("x-locale", locale)
  
  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
