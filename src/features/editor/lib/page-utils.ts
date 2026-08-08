import { db } from "@/infrastructure/db";
import { editorPages } from "@/db/schema/editor-pages";
import { eq, and } from "drizzle-orm";

/**
 * `editor_pages` carries unique(project_id, slug), so deriving a slug straight
 * from the page name fails with a 23505 the moment two pages share a name.
 * Resolve a free slug up front by suffixing -2, -3, ...
 */
export async function uniquePageSlug(
  projectId: string,
  tenantId: string,
  base: string,
  excludeId?: string,
): Promise<string> {
  const desired = base || `page-${Date.now().toString(36)}`;
  const rows = await db
    .select({ id: editorPages.id, slug: editorPages.slug })
    .from(editorPages)
    .where(and(eq(editorPages.projectId, projectId), eq(editorPages.tenantId, tenantId)));

  const taken = new Set(rows.filter((row) => row.id !== excludeId).map((row) => row.slug));
  if (!taken.has(desired)) return desired;

  for (let suffix = 2; suffix < 1000; suffix += 1) {
    const candidate = `${desired}-${suffix}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${desired}-${Date.now().toString(36)}`;
}

/**
 * Postgres unique_violation. Still reachable as a race between the slug lookup
 * and the write, so callers degrade to a readable message instead of throwing
 * an unhandled rejection back through the server action.
 */
export function isUniqueViolation(error: unknown): boolean {
  const code = (error as { code?: string })?.code
    ?? ((error as { cause?: { code?: string } })?.cause)?.code;
  return code === "23505";
}
