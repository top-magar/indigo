#!/usr/bin/env npx tsx
/**
 * Import Migration Script
 * 
 * This script helps migrate imports from the old structure to the new
 * Feature-First Hybrid structure.
 * 
 * Usage:
 *   npx tsx scripts/migrate-imports.ts --dry-run    # Preview changes
 *   npx tsx scripts/migrate-imports.ts              # Apply changes
 *   npx tsx scripts/migrate-imports.ts --phase 1    # Run specific phase
 * 
 * Phases:
 *   1. Infrastructure layer (db, supabase, auth, services)
 *   2. Feature repositories (products, orders, customers, etc.)
 *   3. Shared code (hooks, components, utils)
 *   4. Full migration (all phases)
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, extname } from "path";

const DRY_RUN = process.argv.includes("--dry-run");
const PHASE = process.argv.includes("--phase") 
  ? parseInt(process.argv[process.argv.indexOf("--phase") + 1]) 
  : 4;

// Import mappings by phase
const PHASE_1_MAPPINGS: [RegExp, string][] = [
  // Infrastructure - Database
  [/from ["']@\/lib\/db["']/g, 'from "@/infrastructure/db"'],
  [/from ["']@\/lib\/db\/query-utils["']/g, 'from "@/infrastructure/db/query-utils"'],
  
  // Infrastructure - Supabase
  [/from ["']@\/lib\/supabase\/client["']/g, 'from "@/infrastructure/supabase/client"'],
  [/from ["']@\/lib\/supabase\/server["']/g, 'from "@/infrastructure/supabase/server"'],
  [/from ["']@\/lib\/supabase["']/g, 'from "@/infrastructure/supabase"'],
  
  // Infrastructure - Auth
  [/from ["']@\/lib\/auth["']/g, 'from "@/infrastructure/auth"'],
  [/from ["']@\/lib\/auth\/websocket-auth["']/g, 'from "@/infrastructure/auth/websocket-auth"'],
  
  // Infrastructure - Services
  [/from ["']@\/lib\/services\/cache["']/g, 'from "@/infrastructure/services/cache"'],
  [/from ["']@\/lib\/services\/event-bus["']/g, 'from "@/infrastructure/services/event-bus"'],
  [/from ["']@\/lib\/services\/rate-limiter["']/g, 'from "@/infrastructure/services/rate-limiter"'],
  [/from ["']@\/lib\/services\/audit-logger["']/g, 'from "@/infrastructure/services/audit-logger"'],
  [/from ["']@\/lib\/services\/websocket-server["']/g, 'from "@/infrastructure/services/websocket-server"'],
  [/from ["']@\/lib\/services\/notification-emitter["']/g, 'from "@/infrastructure/services/notification-emitter"'],
  [/from ["']@\/lib\/services\/notification-delivery["']/g, 'from "@/infrastructure/services/notification-delivery"'],
  [/from ["']@\/lib\/services["']/g, 'from "@/infrastructure/services"'],
  
  // Infrastructure - Middleware
  [/from ["']@\/lib\/middleware\/rate-limit["']/g, 'from "@/infrastructure/middleware/rate-limit"'],
  
  // Infrastructure - Tenant
  [/from ["']@\/lib\/tenant\/resolver["']/g, 'from "@/infrastructure/tenant/resolver"'],
  [/from ["']@\/lib\/tenant["']/g, 'from "@/infrastructure/tenant"'],
  
  // Infrastructure - Cache
  [/from ["']@\/lib\/cache["']/g, 'from "@/infrastructure/cache"'],
  [/from ["']@\/lib\/cache\/invalidation["']/g, 'from "@/infrastructure/cache/invalidation"'],
  [/from ["']@\/lib\/cache\/widget-cache["']/g, 'from "@/infrastructure/cache/widget-cache"'],
  
  // Infrastructure - Feature Flags
  [/from ["']@\/lib\/feature-flags["']/g, 'from "@/infrastructure/feature-flags"'],
  
  // Infrastructure - Workflows
  [/from ["']@\/lib\/workflows["']/g, 'from "@/infrastructure/workflows"'],
  
  // Infrastructure - Inngest
  [/from ["']@\/lib\/inngest["']/g, 'from "@/infrastructure/inngest"'],
];

const PHASE_2_MAPPINGS: [RegExp, string][] = [
  // Feature - Products
  [/from ["']@\/lib\/repositories\/products["']/g, 'from "@/features/products/repositories"'],
  
  // Feature - Orders
  [/from ["']@\/lib\/repositories\/orders["']/g, 'from "@/features/orders/repositories"'],
  
  // Feature - Customers
  [/from ["']@\/lib\/repositories\/customers["']/g, 'from "@/features/customers/repositories"'],
  
  // Feature - Inventory
  [/from ["']@\/lib\/repositories\/inventory["']/g, 'from "@/features/inventory/repositories"'],
  
  // Feature - Categories
  [/from ["']@\/lib\/repositories\/categories["']/g, 'from "@/features/categories/repositories"'],
  
  // Feature - Collections
  [/from ["']@\/lib\/repositories\/collections["']/g, 'from "@/features/collections/repositories"'],
  
  // Feature - Attributes
  [/from ["']@\/lib\/repositories\/attributes["']/g, 'from "@/features/attributes/repositories"'],
  
  // Feature - Analytics
  [/from ["']@\/lib\/repositories\/analytics["']/g, 'from "@/features/analytics/repositories"'],
  
  // Feature - Notifications
  [/from ["']@\/lib\/repositories\/notification-preferences["']/g, 'from "@/features/notifications/repositories"'],
  
  // Feature - Discounts
  [/from ["']@\/lib\/discounts["']/g, 'from "@/features/discounts"'],
  
  // Feature - Editor
  [/from ["']@\/lib\/editor["']/g, 'from "@/features/editor"'],
];

const PHASE_3_MAPPINGS: [RegExp, string][] = [
  // Shared - Hooks
  [/from ["']@\/hooks["']/g, 'from "@/shared/hooks"'],
  [/from ["']@\/hooks\/([^"']+)["']/g, 'from "@/shared/hooks/$1"'],
  
  // Shared - Validations
  [/from ["']@\/lib\/validations["']/g, 'from "@/shared/validations"'],
  
  // Shared - Utils
  [/from ["']@\/lib\/utils["']/g, 'from "@/shared/utils"'],
  
  // Shared - Types
  [/from ["']@\/lib\/types["']/g, 'from "@/shared/types"'],
  
  // Shared - Currency
  [/from ["']@\/lib\/currency["']/g, 'from "@/shared/currency"'],
  
  // Shared - i18n
  [/from ["']@\/lib\/i18n["']/g, 'from "@/shared/i18n"'],
  
  // Shared - SEO
  [/from ["']@\/lib\/seo["']/g, 'from "@/shared/seo"'],
  
  // Shared - Offline
  [/from ["']@\/lib\/offline["']/g, 'from "@/shared/offline"'],
];

function getMappings(): [RegExp, string][] {
  switch (PHASE) {
    case 1:
      return PHASE_1_MAPPINGS;
    case 2:
      return PHASE_2_MAPPINGS;
    case 3:
      return PHASE_3_MAPPINGS;
    case 4:
    default:
      return [...PHASE_1_MAPPINGS, ...PHASE_2_MAPPINGS, ...PHASE_3_MAPPINGS];
  }
}

function getAllFiles(dir: string, files: string[] = []): string[] {
  const entries = readdirSync(dir);
  
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, .next, and other non-source directories
      if (!["node_modules", ".next", ".git", "resources", "drizzle"].includes(entry)) {
        getAllFiles(fullPath, files);
      }
    } else if ([".ts", ".tsx", ".js", ".jsx"].includes(extname(entry))) {
      files.push(fullPath);
    }
  }
  
  return files;
}

function migrateFile(filePath: string, mappings: [RegExp, string][]): { changed: boolean; changes: string[] } {
  const content = readFileSync(filePath, "utf-8");
  let newContent = content;
  const changes: string[] = [];
  
  for (const [pattern, replacement] of mappings) {
    const matches = content.match(pattern);
    if (matches) {
      newContent = newContent.replace(pattern, replacement);
      changes.push(`  ${pattern.source} → ${replacement}`);
    }
  }
  
  const changed = content !== newContent;
  
  if (changed && !DRY_RUN) {
    writeFileSync(filePath, newContent, "utf-8");
  }
  
  return { changed, changes };
}

function main() {
  console.log(`\n🔄 Import Migration Script`);
  console.log(`   Phase: ${PHASE}`);
  console.log(`   Mode: ${DRY_RUN ? "DRY RUN (no changes)" : "APPLY CHANGES"}\n`);
  
  const mappings = getMappings();
  const files = getAllFiles("src");
  
  let totalChanged = 0;
  let totalChanges = 0;
  
  for (const file of files) {
    const { changed, changes } = migrateFile(file, mappings);
    
    if (changed) {
      totalChanged++;
      totalChanges += changes.length;
      console.log(`📝 ${file}`);
      for (const change of changes) {
        console.log(change);
      }
    }
  }
  
  console.log(`\n✅ Summary:`);
  console.log(`   Files ${DRY_RUN ? "would be " : ""}modified: ${totalChanged}`);
  console.log(`   Import ${DRY_RUN ? "would be " : ""}changes: ${totalChanges}`);
  
  if (DRY_RUN && totalChanged > 0) {
    console.log(`\n💡 Run without --dry-run to apply changes`);
  }
}

main();
