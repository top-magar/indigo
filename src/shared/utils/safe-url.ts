/**
 * URL scheme validation.
 *
 * Used at every boundary where a merchant-authored URL leaves the editor:
 *   - publication validation (blocks unsafe links before they go live)
 *   - static HTML export (filters href/src before writing markup)
 *   - storefront renderer (defense-in-depth; React 19 already blocks `javascript:` hrefs)
 *   - plugin SDK (form action endpoints)
 *
 * Allowed: http, https, mailto, tel, relative paths (/, ./ ../), page-internal
 * anchors (#, #page:), and protocol-relative //host. Everything else is unsafe.
 */

/** Returns the value unchanged when safe, otherwise null. */
export function safeUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed === "" || trimmed === "#") return trimmed;

  // Relative paths and anchors are always safe.
  if (trimmed.startsWith("/") || trimmed.startsWith("./") || trimmed.startsWith("../") || trimmed.startsWith("#")) {
    return trimmed;
  }

  const match = /^([a-zA-Z][a-zA-Z0-9+.-]*):/.exec(trimmed);
  if (!match) {
    // No scheme: treat as a relative/plain reference (e.g. "contact").
    return trimmed;
  }

  const scheme = match[1].toLowerCase();
  if (scheme === "http" || scheme === "https") return trimmed;
  if (scheme === "mailto" || scheme === "tel") return trimmed;
  // Protocol-relative (//host/path) — parsed as empty scheme by the regex above, so handled by the no-scheme branch.
  return null;
}

/** Returns a sanitized value suitable for embedding in HTML/React, or a safe fallback. */
export function safeUrlOr(value: unknown, fallback: string): string {
  return safeUrl(value) ?? fallback;
}
