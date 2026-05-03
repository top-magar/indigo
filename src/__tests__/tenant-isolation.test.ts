/**
 * Tenant Isolation Static Analysis Tests
 *
 * Verifies that all server actions and queries follow tenant isolation rules.
 * These are static analysis tests — they read source files and check patterns.
 */
import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "fs";
import { join } from "path";

function findFiles(dir: string, pattern: RegExp): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      if (statSync(full).isDirectory() && !entry.startsWith(".") && entry !== "node_modules") {
        results.push(...findFiles(full, pattern));
      } else if (pattern.test(entry)) {
        results.push(full);
      }
    }
  } catch { /* skip unreadable dirs */ }
  return results;
}

const SRC = join(process.cwd(), "src");

describe("Tenant Isolation — Server Actions", () => {
  const actionFiles = findFiles(join(SRC, "app/dashboard"), /actions\.ts$/);

  it("found action files to test", () => {
    expect(actionFiles.length).toBeGreaterThan(5);
  });

  for (const file of actionFiles) {
    const relative = file.replace(process.cwd() + "/", "");
    const content = readFileSync(file, "utf-8");

    it(`${relative} uses authenticated client`, () => {
      // Every action file must use getAuthenticatedClient or requireUser/requireTenantUser
      const hasAuth =
        content.includes("getAuthenticatedClient") ||
        content.includes("requireUser") ||
        content.includes("requireTenantUser") ||
        content.includes("getUser");
      expect(hasAuth).toBe(true);
    });

    it(`${relative} has 'use server' directive`, () => {
      expect(content.startsWith('"use server"') || content.startsWith("'use server'")).toBe(true);
    });
  }
});

describe("Tenant Isolation — No Raw Supabase Without Tenant Filter", () => {
  const tsFiles = findFiles(join(SRC, "app/dashboard"), /\.ts$/);

  for (const file of tsFiles) {
    const relative = file.replace(process.cwd() + "/", "");
    const content = readFileSync(file, "utf-8");

    // Check for .delete() without .eq("tenant_id") nearby
    if (content.includes(".delete()")) {
      it(`${relative} — .delete() has tenant_id filter`, () => {
        const lines = content.split("\n");
        for (let i = 0; i < lines.length; i++) {
          if (lines[i].includes(".delete()")) {
            // Check surrounding 10 lines for tenant_id filter
            const context = lines.slice(Math.max(0, i - 5), i + 10).join("\n");
            const hasTenantFilter =
              context.includes("tenant_id") ||
              context.includes("tenantId");
            // If no direct filter, check if the function fetches tenant context
            if (!hasTenantFilter) {
              // Find the enclosing function (look back for 'async function' or '=>')
              const funcContext = lines.slice(Math.max(0, i - 20), i + 10).join("\n");
              const hasTenantInScope = funcContext.includes("tenantId") || funcContext.includes("tenant_id");
              expect(hasTenantInScope).toBe(true);
            }
          }
        }
      });
    }
  }
});

describe("No Secrets in Source Code", () => {
  const allTsFiles = findFiles(SRC, /\.(ts|tsx)$/);

  it("no hardcoded API keys or secrets", () => {
    const secretPatterns = [
      /sk_live_[a-zA-Z0-9]{20,}/,  // Stripe live key
      /sk_test_[a-zA-Z0-9]{20,}/,  // Stripe test key
      /eyJhbGciOiJIUzI1NiIs/,       // JWT token prefix
      /SUPABASE_SERVICE_ROLE_KEY\s*=\s*["'][^"']+["']/,  // Hardcoded service role
    ];

    for (const file of allTsFiles.filter(f => !f.includes("__tests__"))) {
      const content = readFileSync(file, "utf-8");
      for (const pattern of secretPatterns) {
        const match = content.match(pattern);
        if (match) {
          const relative = file.replace(process.cwd() + "/", "");
          expect.fail(`Secret found in ${relative}: ${match[0].slice(0, 20)}...`);
        }
      }
    }
  });
});
