import { db } from "@/infrastructure/db";
import { sql } from "drizzle-orm";

interface AdminAuditInput {
  actorId: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId?: string;
  targetName?: string;
  metadata?: Record<string, unknown>;
}

/** Fire-and-forget admin audit log. Uses raw insert to bypass tenant_id NOT NULL. */
export function logAdminAction(input: AdminAuditInput) {
  db.execute(sql`
    INSERT INTO audit_logs (tenant_id, user_id, action, entity_type, entity_id, new_values, metadata)
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      ${input.actorId},
      ${input.action},
      ${input.targetType},
      ${input.targetId ?? null},
      ${JSON.stringify({ targetName: input.targetName, ...input.metadata })}::jsonb,
      ${JSON.stringify({ actorEmail: input.actorEmail, source: "admin" })}::jsonb
    )
  `).catch(() => {});
}
