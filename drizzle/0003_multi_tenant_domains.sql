-- Migration: Multi-tenant domains support
-- Add slug, plan, settings, updated_at columns to tenants table
-- Create tenant_domains table for custom domain support

-- Add new columns to tenants table
ALTER TABLE "tenants" ADD COLUMN "slug" text UNIQUE;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "plan" text DEFAULT 'free' NOT NULL;
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "settings" jsonb DEFAULT '{}';
--> statement-breakpoint
ALTER TABLE "tenants" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;
--> statement-breakpoint

-- Create index for slug lookups
CREATE INDEX "tenants_slug_idx" ON "tenants" ("slug");
--> statement-breakpoint

-- Create tenant_domains table
CREATE TABLE "tenant_domains" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tenant_id" uuid NOT NULL,
	"domain" text NOT NULL UNIQUE,
	"verification_token" text NOT NULL,
	"verification_method" text DEFAULT 'cname' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"vercel_domain_id" text,
	"error_message" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"verified_at" timestamp
);
--> statement-breakpoint

-- Add foreign key constraint
ALTER TABLE "tenant_domains" ADD CONSTRAINT "tenant_domains_tenant_id_tenants_id_fk" FOREIGN KEY ("tenant_id") REFERENCES "public"."tenants"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
--> statement-breakpoint

-- Create indexes for domain lookups
CREATE INDEX "tenant_domains_domain_idx" ON "tenant_domains" ("domain");
--> statement-breakpoint
CREATE INDEX "tenant_domains_tenant_idx" ON "tenant_domains" ("tenant_id");
--> statement-breakpoint

-- Enable RLS on tenant_domains
ALTER TABLE "tenant_domains" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Create RLS policy for tenant isolation
CREATE POLICY "tenant_domains_isolation_policy" ON "tenant_domains" AS PERMISSIVE FOR ALL TO public USING (tenant_id = current_setting('app.current_tenant', true)::uuid);
