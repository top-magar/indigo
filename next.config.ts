import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],

  // ==========================================================================
  // NEXT.JS 16 FEATURES
  // ==========================================================================
  // Enable Cache Components for explicit, opt-in caching with "use cache" directive
  cacheComponents: true,

  // Turbopack is now the default bundler in Next.js 16
  // Filesystem caching is still in beta - enable when stable
  // turbopack: {
  //   unstable_fileSystemCache: true,
  // },

  // ==========================================================================
  // MULTI-TENANT IMAGE CONFIGURATION
  // ==========================================================================
  // Configure remote patterns for tenant-uploaded images and assets
  // Add additional patterns as needed for CDN or storage providers
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Allow images from any subdomain of the platform domain
      // This enables tenant-specific image hosting
      {
        protocol: "https",
        hostname: `**.${process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || "localhost"}`,
      },
      // Vercel Blob Storage (if used for tenant assets)
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
      // Common image CDNs - add more as needed
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
      },
    ],
  },

  // ==========================================================================
  // MULTI-TENANT ASYNC HEADERS
  // ==========================================================================
  // Security headers for multi-tenant environment
  async headers() {
    // Content Security Policy
    // Note: Using 'unsafe-inline' for styles due to CSS-in-JS and Tailwind
    // For stricter CSP with nonces, implement in middleware for dynamic pages
    const cspHeader = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' blob: data: https: *.public.blob.vercel-storage.com images.unsplash.com",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.stripe.com https://*.vercel-insights.com",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "frame-ancestors 'self'",
      "form-action 'self'",
      "base-uri 'self'",
      "object-src 'none'",
      "upgrade-insecure-requests",
    ].join("; ")

    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: cspHeader,
          },
          // Prevent clickjacking attacks
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          // Prevent MIME type sniffing
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          // Enable XSS protection (legacy, but still useful)
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy for privacy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          // Permissions Policy (formerly Feature-Policy)
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          // Strict Transport Security (HSTS)
          // Only enable in production with HTTPS
          ...(process.env.NODE_ENV === "production"
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=31536000; includeSubDomains",
                },
              ]
            : []),
        ],
      },
    ];
  },

  // Production logging
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  // Optimize heavy client packages
  experimental: {
    optimizePackageImports: [
      "recharts",
      "@hugeicons/react",
      "@hugeicons/core-free-icons",
      "framer-motion",
      "gsap",
      "date-fns",
      "lucide-react",
      "@tabler/icons-react",
    ],
  },
};

export default nextConfig;
