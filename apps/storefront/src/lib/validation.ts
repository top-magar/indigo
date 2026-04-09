import { z } from "zod";

/**
 * Parse and validate FormData against a Zod schema.
 * Extracts all fields from FormData into a plain object, then validates.
 *
 * @throws Error with user-friendly message if validation fails
 */
export function parseFormData<T extends z.ZodType>(
  formData: FormData,
  schema: T
): z.infer<T> {
  const raw: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    raw[key] = value;
  });
  const result = schema.safeParse(raw);
  if (!result.success) {
    const msg = result.error.issues.map((i) => i.message).join(", ");
    throw new Error(msg);
  }
  return result.data;
}

// ── Reusable field schemas ──

export const idField = z.string().uuid("Invalid ID");
export const nameField = z.string().min(1, "Name is required").max(255);
export const emailField = z.string().email("Invalid email");
export const slugField = z.string().regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes").optional();
export const priceField = z.coerce.number().min(0, "Price must be non-negative");
export const quantityField = z.coerce.number().int().min(0, "Quantity must be non-negative");
export const optionalString = z.string().optional().default("");
export const optionalId = z.string().uuid().optional().or(z.literal("")).transform((v) => v || undefined);
