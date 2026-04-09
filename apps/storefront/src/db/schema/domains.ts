import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { tenants } from "./tenants";

export const tenantDomains = pgTable("tenant_domains", {
  id: uuid("id").defaultRandom().primaryKey(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }).notNull(),
  domain: text("domain").notNull().unique(),
  verificationToken: text("verification_token").notNull(),
  verificationMethod: text("verification_method").default("cname").notNull(),
  status: text("status").default("pending").notNull(), // pending, verified, active, failed
  vercelDomainId: text("vercel_domain_id"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  verifiedAt: timestamp("verified_at"),
}, (table) => ({
  domainIdx: index("tenant_domains_domain_idx").on(table.domain),
  tenantIdx: index("tenant_domains_tenant_idx").on(table.tenantId),
}));

export type TenantDomain = typeof tenantDomains.$inferSelect;
export type NewTenantDomain = typeof tenantDomains.$inferInsert;
