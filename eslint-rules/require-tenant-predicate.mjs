import fs from "node:fs";
import path from "node:path";

/**
 * require-tenant-predicate
 *
 * Flags Drizzle `update` / `delete` calls against tenant-scoped tables whose
 * `.where()` never mentions the tenant column.
 *
 * This is not style enforcement. Row Level Security does not filter the
 * Drizzle connection: policies resolve the tenant through
 * `get_tenant_id() -> auth.uid()`, which is always NULL on a postgres.js
 * connection, and the connection role bypasses RLS regardless (see the header
 * of supabase/migrations/20260409160000_unify_rls_policies.sql). Explicit
 * predicates in the WHERE clause are the only tenant isolation control the
 * application has, so a missing one is a cross-tenant write.
 *
 * The set of tenant-scoped tables is derived from src/db/schema at lint time,
 * so it stays correct as the schema changes.
 */

const WRITE_METHODS = new Set(["update", "delete"]);

// `sudoDb` is deliberately excluded: it is the documented RLS-bypassing client
// for platform-admin work, and its call sites are audited separately.
const DEFAULT_HANDLES = ["db", "tx", "trx"];

const DEFAULT_SCHEMA_DIR = "src/db/schema";
const DEFAULT_PREDICATE = "tenantId";

const schemaCache = new Map();

/**
 * Extract the argument text of a `pgTable(...)` call by walking the source and
 * balancing delimiters. A regex cannot do this reliably: declarations close
 * with `});`, `}, (table) => ({ ... }));` and other shapes.
 */
function extractCallBody(source, openParenIndex) {
  let depth = 0;
  let quote = null;

  for (let i = openParenIndex; i < source.length; i++) {
    const char = source[i];
    const prev = source[i - 1];

    if (quote) {
      if (char === quote && prev !== "\\") quote = null;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "/" && source[i + 1] === "/") {
      const newline = source.indexOf("\n", i);
      if (newline === -1) break;
      i = newline;
      continue;
    }

    if (char === "/" && source[i + 1] === "*") {
      const end = source.indexOf("*/", i + 2);
      if (end === -1) break;
      i = end + 1;
      continue;
    }

    if (char === "(" || char === "{" || char === "[") depth++;
    else if (char === ")" || char === "}" || char === "]") {
      depth--;
      if (depth === 0) return source.slice(openParenIndex + 1, i);
    }
  }

  return null;
}

function readTenantTables(schemaDir, predicate) {
  const cacheKey = `${schemaDir}::${predicate}`;
  if (schemaCache.has(cacheKey)) return schemaCache.get(cacheKey);

  const tables = new Set();
  let entries = [];
  try {
    entries = fs.readdirSync(schemaDir);
  } catch {
    // Schema directory not resolvable from this cwd — rule becomes a no-op
    // rather than failing the lint run.
    schemaCache.set(cacheKey, tables);
    return tables;
  }

  const declaration = /export const (\w+)\s*=\s*pgTable\s*\(/g;
  const hasPredicate = new RegExp(`\\b${predicate}\\b`);

  for (const entry of entries) {
    if (!entry.endsWith(".ts")) continue;
    let source;
    try {
      source = fs.readFileSync(path.join(schemaDir, entry), "utf8");
    } catch {
      continue;
    }
    let match;
    while ((match = declaration.exec(source)) !== null) {
      const body = extractCallBody(source, match.index + match[0].length - 1);
      if (body !== null && hasPredicate.test(body)) tables.add(match[1]);
    }
  }

  schemaCache.set(cacheKey, tables);
  return tables;
}

/** Collect the arguments of every `.where()` chained onto this call. */
function collectWhereArguments(node) {
  const args = [];
  let current = node;

  while (
    current.parent &&
    current.parent.type === "MemberExpression" &&
    current.parent.object === current
  ) {
    const member = current.parent;
    const call = member.parent;
    if (!call || call.type !== "CallExpression" || call.callee !== member) break;
    if (member.property.type === "Identifier" && member.property.name === "where") {
      args.push(...call.arguments);
    }
    current = call;
  }

  return args;
}


// Combinators whose arguments are themselves predicates worth descending into.
// Comparison helpers like eq/ne/inArray are deliberately excluded: an
// identifier inside `eq(orders.id, order.id)` is a value, not a predicate, and
// resolving it would mask a genuinely unscoped write.
const PREDICATE_COMBINATORS = new Set(["and", "or", "not"]);

export const requireTenantPredicate = {
  meta: {
    type: "problem",
    docs: {
      description:
        "Require a tenant predicate on Drizzle update/delete statements against tenant-scoped tables",
    },
    schema: [
      {
        type: "object",
        properties: {
          handles: { type: "array", items: { type: "string" } },
          schemaDir: { type: "string" },
          predicate: { type: "string" },
        },
        additionalProperties: false,
      },
    ],
    messages: {
      missingPredicate:
        "`{{handle}}.{{method}}({{table}})` has no `{{predicate}}` predicate in its where clause. RLS does not filter the Drizzle connection, so this can write across tenants.",
      missingWhere:
        "`{{handle}}.{{method}}({{table}})` has no where clause at all. This writes every row in a tenant-scoped table.",
    },
  },

  create(context) {
    const options = context.options[0] ?? {};
    const handles = new Set(options.handles ?? DEFAULT_HANDLES);
    const predicate = options.predicate ?? DEFAULT_PREDICATE;
    const cwd = typeof context.cwd === "string" ? context.cwd : process.cwd();
    const schemaDir = path.resolve(cwd, options.schemaDir ?? DEFAULT_SCHEMA_DIR);
    const tenantTables = readTenantTables(schemaDir, predicate);
    const sourceCode = context.sourceCode ?? context.getSourceCode();
    const hasPredicate = new RegExp(`\\b${predicate}\\b`);

    /**
     * An identifier can stand in for a prebuilt predicate, e.g.
     *   const owned = and(eq(pages.projectId, projectId), eq(pages.tenantId, tenantId));
     *   tx.update(pages).where(owned)
     * Resolve one level so those are not reported.
     */
    function resolvesToPredicate(identifier) {
      const scope = sourceCode.getScope
        ? sourceCode.getScope(identifier)
        : context.getScope();
      let variable = null;
      for (let current = scope; current && !variable; current = current.upper) {
        variable = current.variables.find((v) => v.name === identifier.name) ?? null;
      }
      if (!variable) return false;
      return variable.defs.some((def) => {
        const init = def.node?.type === "VariableDeclarator" ? def.node.init : null;
        return init ? hasPredicate.test(sourceCode.getText(init)) : false;
      });
    }

    function mentionsPredicate(argument) {
      if (!argument) return false;

      // A direct textual reference is the common case:
      //   .where(and(eq(t.id, id), eq(t.tenantId, tenantId)))
      if (hasPredicate.test(sourceCode.getText(argument))) return true;

      // A prebuilt predicate held in a variable:
      //   const owned = and(eq(pages.projectId, projectId), eq(pages.tenantId, tenantId));
      //   tx.update(pages).where(owned)
      if (argument.type === "Identifier") return resolvesToPredicate(argument);

      // Descend only through predicate combinators.
      if (
        argument.type === "CallExpression" &&
        argument.callee.type === "Identifier" &&
        PREDICATE_COMBINATORS.has(argument.callee.name)
      ) {
        return argument.arguments.some(mentionsPredicate);
      }

      return false;
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (callee.type !== "MemberExpression") return;
        if (callee.property.type !== "Identifier") return;
        if (!WRITE_METHODS.has(callee.property.name)) return;
        if (callee.object.type !== "Identifier") return;

        const handle = callee.object.name;
        if (!handles.has(handle)) return;

        const [tableArgument] = node.arguments;
        if (!tableArgument || tableArgument.type !== "Identifier") return;

        const table = tableArgument.name;
        if (!tenantTables.has(table)) return;

        const method = callee.property.name;
        const whereArguments = collectWhereArguments(node);

        if (whereArguments.length === 0) {
          context.report({
            node,
            messageId: "missingWhere",
            data: { handle, method, table },
          });
          return;
        }

        if (!whereArguments.some(mentionsPredicate)) {
          context.report({
            node,
            messageId: "missingPredicate",
            data: { handle, method, table, predicate },
          });
        }
      },
    };
  },
};

export default {
  rules: {
    "require-tenant-predicate": requireTenantPredicate,
  },
};
