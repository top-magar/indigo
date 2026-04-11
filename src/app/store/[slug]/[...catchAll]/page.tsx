import { createClient } from "@/infrastructure/supabase/server"
import { redirect, notFound } from "next/navigation"

export default async function CatchAllPage({
  params,
}: {
  params: Promise<{ slug: string; catchAll: string[] }>
}) {
  const { slug, catchAll } = await params
  const path = "/" + catchAll.join("/")
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  const { data: layout } = await supabase
    .from("store_layouts")
    .select("theme_overrides")
    .eq("tenant_id", tenant.id)
    .eq("is_homepage", true)
    .maybeSingle()

  const redirects = (layout?.theme_overrides as Record<string, unknown>)
    ?.redirects as string | undefined

  if (redirects) {
    for (const line of redirects.split("\n")) {
      const parts = line.split("->").map((s) => s.trim())
      if (parts[0] === path && parts[1]) {
        redirect(`/store/${slug}${parts[1]}`)
      }
    }
  }

  notFound()
}
