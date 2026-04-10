"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/infrastructure/supabase/server"
import { requireUser } from "@/lib/auth"

export async function savePuckDraftAction(tenantId: string, puckJson: string, pageId?: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) throw new Error("Unauthorized: tenant mismatch")
  if (user.role === "viewer") return { success: false as const, error: "Insufficient permissions" }

  const supabase = await createClient()

  let query = supabase.from("store_layouts").select("id").eq("tenant_id", tenantId)
  query = pageId ? query.eq("id", pageId) : query.eq("is_homepage", true)
  const { data: existing } = await query.maybeSingle()

  const draftData = [{ _puck: true, json: puckJson }]

  if (existing) {
    const { error } = await supabase
      .from("store_layouts")
      .update({ draft_blocks: draftData, updated_at: new Date().toISOString() })
      .eq("id", existing.id)
    if (error) return { success: false as const, error: error.message }
  } else {
    const { error } = await supabase
      .from("store_layouts")
      .insert({
        tenant_id: tenantId,
        name: "Homepage",
        slug: "/",
        is_homepage: true,
        draft_blocks: draftData,
        status: "draft",
        blocks: [],
      })
    if (error) return { success: false as const, error: error.message }
  }

  revalidatePath("/store/[slug]", "page")
  return { success: true as const }
}
