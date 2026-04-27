/** Validate a redirect path is safe (relative, no protocol-relative, no control chars) */
export function safeRedirectPath(path: string | null | undefined, fallback: string): string {
  if (!path) return fallback;
  if (!/^\/[a-zA-Z0-9\-_./~?#&=%@+]+$/.test(path)) return fallback;
  if (path.startsWith("//")) return fallback;
  return path;
}
