import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback", "/invite", "/api/health", "/api/revalidate", "/api/inngest"];
const STORE_PREFIX = "/store/";
const API_STORE_PREFIX = "/api/store/";

/** Routes that require owner or admin role */
const ADMIN_ROUTES = ["/dashboard/settings"];

/** Routes that require platform_admin role */
const PLATFORM_ADMIN_ROUTES = ["/admin"];

const CSP_HEADER = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://js.stripe.com https://www.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://*.supabase.co https://esewa.com.np https://khalti.com https://api.pathao.com wss://*.supabase.co",
  "frame-src 'self' https://js.stripe.com https://esewa.com.np https://khalti.com",
].join("; ");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host")?.split(":")[0] || "";
  const platformDomain = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost";

  // Custom domain routing — resolve to store page
  if (hostname !== platformDomain && hostname !== "localhost" && !hostname.endsWith(`.${platformDomain}`)) {
    const storeUrl = request.nextUrl.clone();
    // Rewrite custom domain requests to /store/_custom?domain=xxx&path=yyy
    storeUrl.pathname = `/store/_custom`;
    storeUrl.searchParams.set("domain", hostname);
    storeUrl.searchParams.set("path", pathname === "/" ? "" : pathname);
    return NextResponse.rewrite(storeUrl);
  }

  // CI-1: editor-v3 routes REMOVED from public skip list — require auth
  const isPublic =
    PUBLIC_ROUTES.some((r) => pathname === r) ||
    pathname.startsWith(STORE_PREFIX) ||
    pathname.startsWith(API_STORE_PREFIX) ||
    pathname.startsWith("/p/") ||
    pathname.startsWith("/api/public/") ||
    pathname.startsWith("/api/contact") ||
    pathname.startsWith("/api/newsletter") ||
    pathname.startsWith("/api/checkout") ||
    pathname.startsWith("/_next/") ||
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml";

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
    // Read role from DB (not user_metadata which is client-writable)
    const { data: dbUser } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();
    const role = dbUser?.role ?? "owner";

    // Admin-only routes require owner or admin role
    if (ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== "owner" && role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Platform admin routes require platform_admin role
    if (PLATFORM_ADMIN_ROUTES.some((r) => pathname.startsWith(r))) {
      if (role !== "platform_admin") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }

    // Redirect authenticated users away from auth pages (role-based routing)
    if (pathname === "/login" || pathname === "/signup") {
      const destination = role === "platform_admin" ? "/admin" : "/dashboard";
      return NextResponse.redirect(new URL(destination, request.url));
    }
  }

  // Security headers
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Stricter CSP for published editor pages — no JS execution allowed
  if (pathname.startsWith("/p/")) {
    response.headers.set("Content-Security-Policy", "default-src 'self'; script-src 'none'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob: https:; frame-ancestors 'self'");
    response.headers.set("X-Frame-Options", "SAMEORIGIN");
  } else {
    response.headers.set("Content-Security-Policy", CSP_HEADER);
  }

  return response;
}

export const config = {
  matcher: ["/((?!monitoring|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
