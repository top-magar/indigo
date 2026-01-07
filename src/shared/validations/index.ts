import { z } from "zod";

// ============================================================================
// COMMON SCHEMAS
// Error messages follow the pattern: "What's wrong + How to fix it"
// ============================================================================

export const uuidSchema = z.string().regex(
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  "Invalid ID format"
);

export const emailSchema = z
  .string()
  .min(1, "Email address is required — please enter your email")
  .email("Invalid email format — please enter a valid email like name@example.com");

export const passwordSchema = z
  .string()
  .min(8, "Password is too short — use at least 8 characters")
  .regex(/[A-Z]/, "Password needs an uppercase letter — add at least one capital letter (A-Z)")
  .regex(/[a-z]/, "Password needs a lowercase letter — add at least one lowercase letter (a-z)")
  .regex(/[0-9]/, "Password needs a number — add at least one digit (0-9)");

export const slugSchema = z
  .string()
  .min(1, "URL slug is required — this will be used in the product URL")
  .max(100, "URL slug is too long — keep it under 100 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Invalid URL slug format — use only lowercase letters, numbers, and hyphens (e.g., 'my-product-name')"
  );

export const priceSchema = z
  .number()
  .min(0, "Price cannot be negative — enter 0 or a positive amount")
  .max(999999.99, "Price exceeds maximum — enter a value under $1,000,000")
  .or(z.string().transform((val) => parseFloat(val) || 0));

export const quantitySchema = z
  .number()
  .int("Quantity must be a whole number — decimals are not allowed")
  .min(0, "Quantity cannot be negative — enter 0 or a positive number")
  .max(999999, "Quantity exceeds maximum — enter a value under 1,000,000")
  .or(z.string().transform((val) => parseInt(val, 10) || 0));

// ============================================================================
// AUTH SCHEMAS
// ============================================================================

export const loginSchema = z.object({
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  storeName: z.string().min(2, "Store name must be at least 2 characters").max(100),
  email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// ============================================================================
// PRODUCT SCHEMAS
// ============================================================================

// Product Image Schema (detailed version)
export const productImageSchema = z.object({
  url: z.string().url("Invalid image URL"),
  alt: z.string().max(200).default(""),
  position: z.number().int().min(0).default(0),
});

// Product Variant Schema
export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required").max(100),
  sku: z.string().max(100).optional(),
  price: z.coerce.number().min(0, "Price must be positive").optional(),
  compareAtPrice: z.coerce.number().min(0).optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  weight: z.coerce.number().min(0).optional(),
  options: z.record(z.string(), z.string()).optional(),
});

// Product SEO Schema
export const productSeoSchema = z.object({
  metaTitle: z.string().max(60, "Meta title should be under 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description should be under 160 characters").optional(),
  urlHandle: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "URL handle must be lowercase with hyphens only")
    .max(200)
    .optional(),
});

// Basic product schema for forms
export const productSchema = z.object({
  name: z
    .string()
    .min(1, "Product name is required — enter a name for your product")
    .max(200, "Product name is too long — keep it under 200 characters for better display"),
  slug: slugSchema,
  description: z
    .string()
    .max(2000, "Description is too long — keep it under 2,000 characters")
    .optional()
    .nullable(),
  price: priceSchema,
  compare_at_price: priceSchema.optional().nullable(),
  cost_price: priceSchema.optional().nullable(),
  sku: z
    .string()
    .max(100, "SKU is too long — keep it under 100 characters")
    .optional()
    .nullable(),
  barcode: z
    .string()
    .max(100, "Barcode is too long — keep it under 100 characters")
    .optional()
    .nullable(),
  quantity: quantitySchema,
  track_quantity: z.boolean().default(true),
  allow_backorder: z.boolean().default(false),
  weight: z
    .number()
    .min(0, "Weight cannot be negative — enter 0 or a positive value")
    .optional()
    .nullable(),
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  category_id: z
    .string()
    .uuid("Invalid category — please select a valid category from the list")
    .optional()
    .nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url("Invalid image URL — please provide a valid URL starting with http:// or https://"),
        alt: z.string().optional(),
        position: z.number().optional(),
      })
    )
    .optional()
    .default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;

// Full Product Schema for creation/update (comprehensive version)
export const createProductSchema = z.object({
  name: z.string().min(1, "Product name is required").max(200, "Name too long"),
  slug: z.string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens")
    .max(200)
    .optional(),
  description: z.string().max(5000, "Description too long").optional(),
  categoryId: z.string().optional(),
  brand: z.string().max(100).optional(),
  tags: z.array(z.string().max(50)).max(20, "Maximum 20 tags allowed").optional(),

  // Pricing
  price: z.coerce.number().min(0, "Price must be positive"),
  compareAtPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),

  // Inventory
  sku: z.string().max(100).optional(),
  barcode: z.string().max(100).optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  trackQuantity: z.boolean().default(true),
  allowBackorder: z.boolean().default(false),
  lowStockThreshold: z.coerce.number().int().min(0).default(5),

  // Shipping
  weight: z.coerce.number().min(0).optional(),
  weightUnit: z.enum(["g", "kg", "lb", "oz"]).default("g"),
  dimensions: z.object({
    length: z.coerce.number().min(0).optional(),
    width: z.coerce.number().min(0).optional(),
    height: z.coerce.number().min(0).optional(),
  }).optional(),
  requiresShipping: z.boolean().default(true),

  // Media
  images: z.array(productImageSchema).max(10, "Maximum 10 images allowed").optional(),

  // Variants
  hasVariants: z.boolean().default(false),
  variants: z.array(productVariantSchema).max(100, "Maximum 100 variants").optional(),

  // SEO
  seo: productSeoSchema.optional(),

  // Status & Visibility
  status: z.enum(["draft", "active", "archived"]).default("draft"),
  publishAt: z.string().datetime().optional(),
});

// Simplified schema for basic product creation
export const simpleProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  price: z.coerce.number().min(0, "Price must be positive"),
  description: z.string().max(2000).optional(),
  quantity: z.coerce.number().int().min(0).default(0),
  sku: z.string().max(100).optional(),
});

export const updateStockSchema = z.object({
  variantId: uuidSchema,
  action: z.enum(["add", "remove", "set"]),
  adjustment: z.coerce.number().int().min(0),
});

export const deleteProductSchema = z.object({
  productId: uuidSchema,
});

// Product type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductSeo = z.infer<typeof productSeoSchema>;

// ============================================================================
// ORDER SCHEMAS
// ============================================================================

export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
]);

export const updateOrderStatusSchema = z.object({
  orderId: uuidSchema,
  status: orderStatusSchema,
  note: z.string().max(500).optional(),
});

export const updateOrderNotesSchema = z.object({
  orderId: uuidSchema,
  notes: z.string().max(2000),
});

// ============================================================================
// CATEGORY SCHEMAS
// ============================================================================

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Category name is required — enter a name for this category")
    .max(100, "Category name is too long — keep it under 100 characters"),
  slug: slugSchema,
  description: z
    .string()
    .max(500, "Description is too long — keep it under 500 characters")
    .optional()
    .nullable(),
  parent_id: z
    .string()
    .uuid("Invalid parent category — please select a valid category")
    .optional()
    .nullable(),
  image_url: z
    .string()
    .url("Invalid image URL — please provide a valid URL starting with http:// or https://")
    .optional()
    .nullable(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

// ============================================================================
// COLLECTION SCHEMAS
// ============================================================================

export const collectionSchema = z.object({
  name: z
    .string()
    .min(1, "Collection name is required — enter a name for this collection")
    .max(100, "Collection name is too long — keep it under 100 characters"),
  slug: slugSchema,
  description: z
    .string()
    .max(500, "Description is too long — keep it under 500 characters")
    .optional()
    .nullable(),
  image_url: z
    .string()
    .url("Invalid image URL — please provide a valid URL starting with http:// or https://")
    .optional()
    .nullable(),
  is_active: z.boolean().default(true),
});

export type CollectionFormData = z.infer<typeof collectionSchema>;

// ============================================================================
// CUSTOMER SCHEMAS
// ============================================================================

export const customerSchema = z.object({
  email: emailSchema,
  first_name: z
    .string()
    .min(1, "First name is required — enter the customer's first name")
    .max(100, "First name is too long — keep it under 100 characters"),
  last_name: z
    .string()
    .min(1, "Last name is required — enter the customer's last name")
    .max(100, "Last name is too long — keep it under 100 characters"),
  phone: z
    .string()
    .max(20, "Phone number is too long — enter a valid phone number")
    .optional()
    .nullable(),
  notes: z
    .string()
    .max(1000, "Notes are too long — keep them under 1,000 characters")
    .optional()
    .nullable(),
});

export type CustomerFormData = z.infer<typeof customerSchema>;

// ============================================================================
// DISCOUNT SCHEMAS
// ============================================================================

export const discountSchema = z.object({
  code: z
    .string()
    .min(1, "Discount code is required — enter a code customers will use at checkout")
    .max(50, "Discount code is too long — keep it under 50 characters for easy entry")
    .regex(
      /^[A-Z0-9_-]+$/i,
      "Invalid discount code format — use only letters, numbers, hyphens, and underscores (e.g., 'SUMMER-SALE-20')"
    ),
  type: z.enum(["percentage", "fixed_amount", "free_shipping"]),
  value: z
    .number()
    .min(0, "Discount value cannot be negative — enter 0 or a positive amount"),
  min_purchase_amount: z
    .number()
    .min(0, "Minimum purchase cannot be negative — enter 0 or a positive amount")
    .optional()
    .nullable(),
  max_uses: z
    .number()
    .int("Maximum uses must be a whole number")
    .min(1, "Maximum uses must be at least 1 — enter how many times this code can be used")
    .optional()
    .nullable(),
  max_uses_per_customer: z
    .number()
    .int("Uses per customer must be a whole number")
    .min(1, "Uses per customer must be at least 1")
    .optional()
    .nullable(),
  starts_at: z.date().optional().nullable(),
  ends_at: z.date().optional().nullable(),
  is_active: z.boolean().default(true),
});

export type DiscountFormData = z.infer<typeof discountSchema>;

// ============================================================================
// STORE SETTINGS SCHEMAS
// ============================================================================

export const storeSettingsSchema = z.object({
  name: z
    .string()
    .min(1, "Store name is required — enter a name for your store")
    .max(100, "Store name is too long — keep it under 100 characters"),
  description: z
    .string()
    .max(500, "Store description is too long — keep it under 500 characters")
    .optional()
    .nullable(),
  currency: z
    .string()
    .length(3, "Currency must be a 3-letter code — use standard codes like USD, EUR, or GBP"),
  timezone: z.string().optional(),
  logo_url: z
    .string()
    .url("Invalid logo URL — please provide a valid URL starting with http:// or https://")
    .optional()
    .nullable(),
  favicon_url: z
    .string()
    .url("Invalid favicon URL — please provide a valid URL starting with http:// or https://")
    .optional()
    .nullable(),
  contact_email: emailSchema.optional().nullable(),
  support_email: emailSchema.optional().nullable(),
  address: z
    .object({
      line1: z.string().max(200, "Address line 1 is too long — keep it under 200 characters").optional(),
      line2: z.string().max(200, "Address line 2 is too long — keep it under 200 characters").optional(),
      city: z.string().max(100, "City name is too long — keep it under 100 characters").optional(),
      state: z.string().max(100, "State/province is too long — keep it under 100 characters").optional(),
      postal_code: z.string().max(20, "Postal code is too long — keep it under 20 characters").optional(),
      country: z.string().max(100, "Country name is too long — keep it under 100 characters").optional(),
    })
    .optional()
    .nullable(),
});

export type StoreSettingsFormData = z.infer<typeof storeSettingsSchema>;

// ============================================================================
// SHIPPING ZONE SCHEMAS
// ============================================================================

export const shippingZoneSchema = z.object({
  name: z
    .string()
    .min(1, "Zone name is required — enter a name like 'Domestic' or 'International'")
    .max(100, "Zone name is too long — keep it under 100 characters"),
  countries: z
    .array(z.string())
    .min(1, "At least one country is required — select the countries this zone covers"),
  rates: z.array(
    z.object({
      name: z
        .string()
        .min(1, "Rate name is required — enter a name like 'Standard' or 'Express'"),
      type: z.enum(["flat", "weight_based", "price_based", "free"]),
      price: z
        .number()
        .min(0, "Shipping price cannot be negative — enter 0 for free shipping"),
      min_weight: z
        .number()
        .min(0, "Minimum weight cannot be negative")
        .optional(),
      max_weight: z
        .number()
        .min(0, "Maximum weight cannot be negative")
        .optional(),
      min_price: z
        .number()
        .min(0, "Minimum price cannot be negative")
        .optional(),
      max_price: z
        .number()
        .min(0, "Maximum price cannot be negative")
        .optional(),
    })
  ),
});

export type ShippingZoneFormData = z.infer<typeof shippingZoneSchema>;

// ============================================================================
// RETURN REQUEST SCHEMAS
// ============================================================================

export const returnRequestSchema = z.object({
  order_id: z
    .string()
    .uuid("Invalid order ID — please select a valid order"),
  items: z
    .array(
      z.object({
        order_item_id: z
          .string()
          .uuid("Invalid item ID"),
        quantity: z
          .number()
          .int("Quantity must be a whole number")
          .min(1, "Quantity must be at least 1 — enter how many items to return"),
        reason: z
          .string()
          .min(1, "Return reason is required — explain why the item is being returned"),
      })
    )
    .min(1, "At least one item is required — select the items you want to return"),
  notes: z
    .string()
    .max(1000, "Notes are too long — keep them under 1,000 characters")
    .optional(),
});

export type ReturnRequestFormData = z.infer<typeof returnRequestSchema>;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

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

// Helper to parse FormData with a schema
export function parseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): z.infer<T> {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });
  return schema.parse(data);
}

// Helper for safe parsing with error messages
export function safeParseFormData<T extends z.ZodType>(
  schema: T,
  formData: FormData
): { success: true; data: z.infer<T> } | { success: false; error: string } {
  const data: Record<string, unknown> = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }

  // Zod v4 uses issues instead of errors
  const firstIssue = result.error.issues?.[0];
  return {
    success: false,
    error: firstIssue?.message || "Validation failed"
  };
}
