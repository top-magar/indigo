import type { MetadataRoute } from "next";
import { createClient } from "@/infrastructure/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indigo.com.np";

  // Get all active tenants with their slugs
  const { data: tenants } = await supabase
    .from("tenants")
    .select("slug, updated_at")
    .limit(1000);

  const storePages = (tenants || []).flatMap((t) => [
    { url: `${baseUrl}/store/${t.slug}`, lastModified: t.updated_at, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/store/${t.slug}/products`, lastModified: t.updated_at, changeFrequency: "daily" as const, priority: 0.7 },
  ]);

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...storePages,
  ];
}
