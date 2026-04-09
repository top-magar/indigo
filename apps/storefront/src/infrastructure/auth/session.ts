/**
 * @deprecated Use @/lib/auth instead.
 * - getSession() → getUser() from @/lib/auth
 * - requireAuth() → requireUser() from @/lib/auth
 * - requireTenant() → requireUser() from @/lib/auth (tenantId is always present)
 */
import "server-only"
export { getUser as getSession, requireUser as requireAuth, requireUser as requireTenant } from "@/lib/auth"
export type { AuthUser as UserSession } from "@/lib/auth"
