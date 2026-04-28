import { getAuthenticatedClient } from "@/lib/auth";

// ─── Auth ────────────────────────────────────────────────

export async function auth() {
  const { user, supabase } = await getAuthenticatedClient();
  return { supabase, tenantId: user.tenantId, userId: user.id };
}
