import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import tenantPredicate from "./eslint-rules/require-tenant-predicate.mjs";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "**/._*",
    ".agents/**",
    ".agent/**",
    ".kiro/skills/**",
    "resources/**",
    "design-system/**",
    "skills/**",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "prefer-const": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
    },
  },
  {
    // Tenant isolation. RLS does not filter the Drizzle connection, so an
    // explicit tenant predicate on every write is the only control there is.
    // Starts as "warn" while the existing findings are worked through — flip
    // to "error" once the backlog is clear so regressions fail CI.
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: { tenant: tenantPredicate },
    rules: {
      "tenant/require-tenant-predicate": "warn",
    },
  },
]);

export default eslintConfig;
