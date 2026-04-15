import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback", "/api/health", "/api/revalidate", "/api/inngest"];
const STORE_PREFIX = "/store/";
const API_STORE_PREFIX = "/api/store/";

/** Routes that require owner or admin role */
const ADMIN_ROUTES = ["/dashboard/settings"];

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://*.amazonaws.com",
  "connect-src 'self' https://*.supabase.co https://esewa.com.np https://khalti.com https://api.pathao.com wss://*.supabase.co",
  "frame-src 'self' https://js.stripe.com https://esewa.com.np https://khalti.com",
].join("; ");

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // CI-1: editor-v3 routes REMOVED from public skip list — require auth
  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    pathname.startsWith(STORE_PREFIX) ||
    pathname.startsWith(API_STORE_PREFIX) ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/newsletter") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/_next/");

  // Create Supabase client that can refresh the session
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Redirect unauthenticated users away from dashboard/editor
  if (!isPublic && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // CI-5: RBAC enforcement — gate routes by role
  if (user) {
    const role = (user.user_metadata?.role as string | undefined) ?? "owner"; // Default: account creator is owner

    // Admin-only routes require owner or admin role
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== "owner" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
  }

  // Redirect authenticated users away from auth pages
  if (user && (pathname === "/login" || pathname === "/signup")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  // CI-7: CSP header for XSS protection on payment pages
  response.headers.set("Content-Security-Policy", CSP_HEADER);

  return response;
}

export const config = {
  matcher: ["/((?!monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
