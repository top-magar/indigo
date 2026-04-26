/**
 * Sanitize search input for PostgREST .or() filter interpolation.
 * Strips characters that could inject PostgREST operators.
 */
export function sanitizeSearch(input: string): string {
  // Remove PostgREST operators and special chars: . , ( ) % * 
  // Keep alphanumeric, spaces, hyphens, @, and common punctuation
  return input.replace(/[.,()*%\\]/g, "").trim().slice(0, 200);
}
