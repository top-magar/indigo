"use server"

import { requireUser } from "@/lib/auth"

/**
 * Upload an image through the media API with optimization hints.
 * The actual optimization (WebP, srcset) happens at the CDN/storage layer.
 * This action returns the optimized URL pattern for the editor to use.
 */
export async function uploadOptimizedImage(
  tenantId: string,
  formData: FormData,
): Promise<{ success: true; url: string; srcset: string } | { success: false; error: string }> {
  const user = await requireUser()
  if (user.tenantId !== tenantId) return { success: false, error: "Unauthorized" }

  // Forward to the media upload API
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL ?? ""}/api/media/upload`, {
    method: "POST",
    body: formData,
    headers: { cookie: `sb-access-token=${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: "Upload failed" }))
    return { success: false, error: body.error ?? "Upload failed" }
  }

  const data = await res.json()
  const url: string = data.url ?? data.blob?.url ?? ""

  if (!url) return { success: false, error: "No URL returned" }

  // Generate srcset hints — actual resizing depends on CDN (Vercel Image Optimization, Cloudflare, etc.)
  const srcset = [640, 1024, 1920]
    .map((w) => `${url}?w=${w}&q=80 ${w}w`)
    .join(", ")

  return { success: true, url, srcset }
}
