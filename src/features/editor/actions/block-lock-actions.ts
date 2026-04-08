"use server"

import { createClient } from "@/infrastructure/supabase/server"
import { requireUser } from "@/lib/auth"

const LOCK_TTL_SECONDS = 60

export async function acquireBlockLock(tenantId: string, layoutId: string, blockId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { acquired: false, holder: null }
  const supabase = await createClient()
  const now = new Date()
  const expiresAt = new Date(now.getTime() + LOCK_TTL_SECONDS * 1000).toISOString()

  // Delete expired locks first
  await supabase.from("block_locks").delete().lt("expires_at", now.toISOString())

  // Check existing lock
  const { data: existing } = await supabase
    .from("block_locks")
    .select("user_id, username")
    .eq("layout_id", layoutId)
    .eq("block_id", blockId)
    .gt("expires_at", now.toISOString())
    .maybeSingle()

  if (existing && existing.user_id !== user.id) {
    return { acquired: false, holder: existing.username ?? "Another user" }
  }

  // Upsert lock
  await supabase.from("block_locks").upsert({
    tenant_id: tenantId,
    layout_id: layoutId,
    block_id: blockId,
    user_id: user.id,
    username: user.fullName ?? user.email,
    expires_at: expiresAt,
  }, { onConflict: "layout_id,block_id" })

  return { acquired: true, holder: null }
}

export async function releaseBlockLock(tenantId: string, layoutId: string, blockId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return
  const supabase = await createClient()
  await supabase.from("block_locks").delete()
    .eq("layout_id", layoutId)
    .eq("block_id", blockId)
    .eq("user_id", user.id)
}

export async function renewBlockLock(tenantId: string, layoutId: string, blockId: string) {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return
  const supabase = await createClient()
  const expiresAt = new Date(Date.now() + LOCK_TTL_SECONDS * 1000).toISOString()
  await supabase.from("block_locks").update({ expires_at: expiresAt })
    .eq("layout_id", layoutId)
    .eq("block_id", blockId)
    .eq("user_id", user.id)
}
