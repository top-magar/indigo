import { z } from "zod";

// Common field schemas
export const emailSchema = z.string().email("Please enter a valid email address");

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number");

export const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens only");

export const priceSchema = z
  .number()
  .min(0, "Price must be positive")
  .or(z.string().transform((val) => parseFloat(val) || 0));

export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number")
  .min(0, "Quantity cannot be negative")
  .or(z.string().transform((val) => parseInt(val, 10) || 0));

// Product schemas
export const productSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name is too long"),
  slug: slugSchema,
  description: z.string().max(2000, "Description is too long").optional().nullable(),
  price: priceSchema,
  compare_at_price: priceSchema.optional().nullable(),
  cost_price: priceSchema.optional().nullable(),
  sku: z.string().max(100, "SKU is too long").optional().nullable(),
  barcode: z.string().max(100, "Barcode is too long").optional().nullable(),
  quantity: quantitySchema,
  track_quantity: z.boolean().default(true),
  allow_backorder: z.boolean().default(false),
  weight: z.number().min(0).optional().nullable(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  category_id: z.string().uuid().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url(),
        alt: z.string().optional(),
        position: z.number().optional(),
      })
    )
    .optional()
    .default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Category schemas
export const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(100, "Name is too long"),
  slug: slugSchema,
  description: z.string().max(500, "Description is too long").optional().nullable(),
  parent_id: z.string().uuid().optional().nullable(),
  image_url: z.string().url("Invalid image URL").optional().nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// Collection schemas
export const collectionSchema = z.object({
  name: z.string().min(1, "Collection name is required").max(100, "Name is too long"),
  slug: slugSchema,
  description: z.string().max(500, "Description is too long").optional().nullable(),
  image_url: z.string().url("Invalid image URL").optional().nullable(),
  is_active: z.boolean().default(true),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;

// Customer schemas
export const customerSchema = z.object({
  email: emailSchema,
  first_name: z.string().min(1, "First name is required").max(100),
  last_name: z.string().min(1, "Last name is required").max(100),
  phone: z.string().max(20).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// Discount schemas
export const discountSchema = z.object({
  code: z
    .string()
    .min(1, "Discount code is required")
    .max(50, "Code is too long")
    .regex(/^[A-Z0-9_-]+$/i, "Code can only contain letters, numbers, hyphens, and underscores"),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z.number().min(0, "Value must be positive"),
  min_purchase_amount: z.number().min(0).optional().nullable(),
  max_uses: z.number().int().min(1).optional().nullable(),
  max_uses_per_customer: z.number().int().min(1).optional().nullable(),
  starts_at: z.date().optional().nullable(),
  ends_at: z.date().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type DiscountFormData = z.infer<typeof discountSchema>;

// Store settings schemas
export const storeSettingsSchema = z.object({
  name: z.string().min(1, "Store name is required").max(100),
  description: z.string().max(500).optional().nullable(),
  currency: z.string().length(3, "Currency must be a 3-letter code"),
  timezone: z.string().optional(),
  logo_url: z.string().url("Invalid logo URL").optional().nullable(),
  favicon_url: z.string().url("Invalid favicon URL").optional().nullable(),
  contact_email: emailSchema.optional().nullable(),
  support_email: emailSchema.optional().nullable(),
  address: z
    .object({
      line1: z.string().optional(),
      line2: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postal_code: z.string().optional(),
      country: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

// Shipping zone schemas
export const shippingZoneSchema = z.object({
  name: z.string().min(1, "Zone name is required").max(100),
  countries: z.array(z.string()).min(1, "Select at least one country"),
  rates: z.array(
    z.object({
      name: z.string().min(1, "Rate name is required"),
      type: z.enum(["flat", "weight_based", "price_based", "free"]),
      price: z.number().min(0),
      min_weight: z.number().min(0).optional(),
      max_weight: z.number().min(0).optional(),
      min_price: z.number().min(0).optional(),
      max_price: z.number().min(0).optional(),
    })
  ),
});

export type ShippingZoneFormData = z.infer<typeof shippingZoneSchema>;

// Return request schemas
export const returnRequestSchema = z.object({
  order_id: z.string().uuid("Invalid order ID"),
  items: z
    .array(
      z.object({
        order_item_id: z.string().uuid(),
        quantity: z.number().int().min(1),
        reason: z.string().min(1, "Reason is required"),
      })
    )
    .min(1, "Select at least one item to return"),
  notes: z.string().max(1000).optional(),
});

export type ReturnRequestFormData = z.infer<typeof returnRequestSchema>;

// Helper to generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Helper to format validation errors for toast
export function formatZodErrors(error: z.ZodError<unknown>): string {
  return error.issues.map((issue) => issue.message).join(", ");
}
