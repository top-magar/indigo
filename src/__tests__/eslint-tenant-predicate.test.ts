// @vitest-environment node
/**
 * Tests for the require-tenant-predicate ESLint rule.
 *
 * The rule derives its table list from src/db/schema at load time, so these
 * cases run against the real schema: `products` is tenant-scoped, `tenants` is
 * not.
 */
import { describe, it } from "vitest";
import { RuleTester } from "eslint";
import path from "node:path";
import { requireTenantPredicate } from "../../eslint-rules/require-tenant-predicate.mjs";

const options = [{ schemaDir: path.resolve(process.cwd(), "src/db/schema") }];

const ruleTester = new RuleTester({
  languageOptions: { ecmaVersion: 2022, sourceType: "module" },
});

describe("require-tenant-predicate", () => {
  it("accepts scoped writes and rejects unscoped ones", () => {
    ruleTester.run("require-tenant-predicate", requireTenantPredicate, {
      valid: [
        {
          name: "explicit tenant predicate",
          code: `db.update(products).set({ x: 1 }).where(and(eq(products.id, id), eq(products.tenantId, tenantId)));`,
          options,
        },
        {
          name: "predicate held in a variable",
          code: `const owned = and(eq(products.collectionId, cid), eq(products.tenantId, tenantId));
tx.update(products).set({ x: 1 }).where(owned);`,
          options,
        },
        {
          name: "predicate nested in a combinator alongside a variable",
          code: `const owned = eq(products.tenantId, tenantId);
tx.delete(products).where(and(eq(products.id, id), owned));`,
          options,
        },
        {
          name: "table without a tenant column",
          code: `db.update(tenants).set({ name }).where(eq(tenants.id, id));`,
          options,
        },
        {
          name: "sudoDb is the audited RLS-bypass client",
          code: `sudoDb.delete(products).where(eq(products.id, id));`,
          options,
        },
        {
          name: "unrelated update call",
          code: `cache.update(products).where(eq(products.id, id));`,
          options,
        },
      ],
      invalid: [
        {
          name: "missing predicate on update",
          code: `db.update(products).set({ x: 1 }).where(eq(products.id, id));`,
          options,
          errors: [{ messageId: "missingPredicate" }],
        },
        {
          name: "value identifier must not be mistaken for a predicate",
          code: `const order = await createOrder({ tenantId });
tx.delete(products).where(eq(products.id, order.id));`,
          options,
          errors: [{ messageId: "missingPredicate" }],
        },
        {
          name: "no where clause at all",
          code: `db.delete(products);`,
          options,
          errors: [{ messageId: "missingWhere" }],
        },
        {
          name: "tenant column mentioned only in set(), not where()",
          code: `db.update(products).set({ tenantId }).where(eq(products.id, id));`,
          options,
          errors: [{ messageId: "missingPredicate" }],
        },
      ],
    });
  });
});
