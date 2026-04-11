import type { MetadataRoute } from "next";
import { createClient } from "@/infrastructure/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indigo.com.np";

  try {
    const supabase = await createClient();

    const { data: tenants } = await supabase
      .from("tenants")
      .select("slug, updated_at")
      .limit(1000);

    if (!tenants?.length) return [{ url: baseUrl, lastModified: new Date(), priority: 1 }];

    const { data: pages } = await supabase
      .from("store_layouts")
      .select("tenant_id, slug, updated_at, is_homepage, tenants!inner(slug)")
      .not("blocks", "is", null)
      .eq("status", "published")
      .limit(5000);

    const tenantMap = new Map(tenants.map((t) => [t.slug, t.updated_at]));

    const entries: MetadataRoute.Sitemap = [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ];

    for (const t of tenants) {
      entries.push(
        { url: `${baseUrl}/store/${t.slug}`, lastModified: t.updated_at, changeFrequency: "daily", priority: 1.0 },
        { url: `${baseUrl}/store/${t.slug}/products`, lastModified: t.updated_at, changeFrequency: "daily", priority: 0.7 },
      );
    }

    for (const p of pages ?? []) {
      if (p.is_homepage) continue;
      const tenantSlug = (p.tenants as unknown as { slug: string })?.slug;
      if (!tenantSlug || !p.slug) continue;
      const pageSlug = p.slug.startsWith("/") ? p.slug.slice(1) : p.slug;
      entries.push({
        url: `${baseUrl}/store/${tenantSlug}/p/${pageSlug}`,
        lastModified: p.updated_at,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }

    return entries;
  } catch {
    return [{ url: baseUrl, lastModified: new Date(), priority: 1 }];
  }
}
