import { headers } from "next/headers";

/**
 * Get tenant ID from request headers (set by middleware).
 */
export async function getTenantIdFromHeaders(): Promise<string | null> {
  const h = await headers();
  return h.get("x-tenant-id") || null;
}
