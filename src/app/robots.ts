import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indigo.com.np";

  return {
    rules: [
      { userAgent: "*", allow: "/store/", disallow: ["/dashboard/", "/api/", "/auth/", "/(editor)/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
