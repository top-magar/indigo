/**
 * Next.js Proxy
 * 
 * Handles:
 * - Locale detection from Accept-Language header
 * - Authentication redirects (via NextAuth)
 * - Multi-tenant domain routing (future)
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/proxy
 */
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { isValidLocale, getLocaleFromHeaders, type Locale } from '@/lib/i18n/config'

/**
 * Paths that should skip locale processing
 */
const PUBLIC_FILE = /\.(.*)$/
const EXCLUDED_PATHS = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
]

/**
 * Check if path should be excluded from locale processing
 */
function shouldExclude(pathname: string): boolean {
  return (
    PUBLIC_FILE.test(pathname) ||
    EXCLUDED_PATHS.some(path => pathname.startsWith(path))
  )
}

/**
 * Get locale from cookie or headers
 */
function getLocale(request: NextRequest): Locale {
  // Check cookie first (user preference)
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && isValidLocale(cookieLocale)) {
    return cookieLocale
  }
  
  // Fall back to Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  return getLocaleFromHeaders(acceptLanguage)
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip excluded paths
  if (shouldExclude(pathname)) {
    return NextResponse.next()
  }
  
  // Detect locale
  const locale = getLocale(request)
  
  // Add locale to response headers for server components to access
  const response = NextResponse.next()
  response.headers.set('x-locale', locale)
  
  // Set locale cookie if not already set (for persistence)
  if (!request.cookies.has('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      sameSite: 'lax',
    })
  }
  
  return response
}

export const config = {
  // Match all paths except static files and API routes
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
