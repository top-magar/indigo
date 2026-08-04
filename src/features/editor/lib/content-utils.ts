/**
 * Shared parsing helpers for stringly-typed element content.
 *
 * Several element types (accordion, tabs, gallery, socialIcons, starRating)
 * store structured data inside `content: Record<string, string>` as JSON or
 * CSV payloads. These helpers are the single place that parses them, so the
 * canvas renderers, storefront renderer, and static export can never drift.
 */

export type AccordionItem = { title: string; body: string };

/** Parse the JSON payload used by accordion/tabs (`content.items`). Never throws. */
export function parseItems(value: string | undefined | null): AccordionItem[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is AccordionItem =>
        !!item && typeof item === "object" && typeof (item as AccordionItem).title === "string",
    );
  } catch {
    return [];
  }
}

/** Split a CSV payload (`content.images`, `content.platforms`). Never throws. */
export function parseCsv(value: string | undefined | null): string[] {
  if (!value) return [];
  return value
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

/** Parse a numeric field (e.g. star rating, map zoom). Never returns NaN. */
export function parseNumber(value: string | undefined | null, fallback = 0): number {
  if (!value) return fallback;
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : fallback;
}
