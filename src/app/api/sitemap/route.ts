import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export const revalidate = 3600; // cache 1 hour

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://indigo.com.np";

  try {
    const supabase = await createClient();

    const [{ data: tenants }, { data: pages }] = await Promise.all([
      supabase.from("tenants").select("slug, updated_at").limit(1000),
      supabase
        .from("store_layouts")
        .select("slug, updated_at, is_homepage, tenants!inner(slug)")
        .not("blocks", "is", null)
        .eq("status", "published")
        .limit(5000),
    ]);

    const urls: string[] = [
      entry(baseUrl, new Date().toISOString(), "1.0"),
    ];

    for (const t of tenants ?? []) {
      urls.push(
        entry(`${baseUrl}/store/${t.slug}`, t.updated_at, "1.0"),
        entry(`${baseUrl}/store/${t.slug}/products`, t.updated_at, "0.7"),
      );
    }

    for (const p of pages ?? []) {
      if (p.is_homepage) continue;
      const tenantSlug = (p.tenants as unknown as { slug: string })?.slug;
      if (!tenantSlug || !p.slug) continue;
      const pageSlug = p.slug.startsWith("/") ? p.slug.slice(1) : p.slug;
      urls.push(entry(`${baseUrl}/store/${tenantSlug}/p/${pageSlug}`, p.updated_at, "0.8"));
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join("\n")}\n</urlset>`;

    return new NextResponse(xml, {
      headers: { "Content-Type": "application/xml", "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
    });
  } catch {
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entry(baseUrl, new Date().toISOString(), "1.0")}\n</urlset>`,
      { headers: { "Content-Type": "application/xml" } },
    );
  }
}

function entry(loc: string, lastmod: string, priority: string): string {
  return `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority></url>`;
}
