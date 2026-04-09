export const revalidate = 3600;
import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { StorefrontLite } from "@/features/store/storefront-lite"

/**
 * Renders custom Craft.js pages created in the editor.
 * URL pattern: /store/{storeSlug}/p/{pageSlug}
 * e.g. /store/my-shop/p/about, /store/my-shop/p/shipping-policy
 */
export default async function CustomStorePage({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>
}) {
  const { slug, pageSlug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  const { data: layout } = await supabase
    .from("store_layouts")
    .select("blocks, theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("slug", `/${pageSlug}`)
    .eq("status", "published")
    .maybeSingle()

  if (!layout) notFound()

  let craftJson: string | null = null
  const source = layout.blocks
  if (Array.isArray(source) && source.length > 0 && (source[0] as any)?._craftjs) {
    craftJson = (source[0] as any).json
  }

  if (!craftJson) notFound()

  return <StorefrontLite craftJson={craftJson} />
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; pageSlug: string }>
}) {
  const { slug, pageSlug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name")
    .eq("slug", slug)
    .single()

  if (!tenant) return { title: "Page Not Found" }

  const { data: layout } = await supabase
    .from("store_layouts")
    .select("name, theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("slug", `/${pageSlug}`)
    .maybeSingle()

  if (!layout) return { title: "Page Not Found" }

  const seo = (layout.theme_overrides as any)?.seo as { title?: string; description?: string; ogImage?: string } | undefined

  return {
    title: seo?.title || `${layout.name} — ${tenant.name}`,
    description: seo?.description || undefined,
    openGraph: seo?.ogImage ? { images: [{ url: seo.ogImage }] } : undefined,
  }
}
