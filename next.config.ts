import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["pg"],

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
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
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
          // Enable XSS protection
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          // Referrer policy for privacy
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
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
