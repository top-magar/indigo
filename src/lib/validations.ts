import { z } from "zod";

// Common schemas
export const uuidSchema = z.string().regex(
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    "Invalid ID format"
);

// Order schemas
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

// Product Image Schema
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

// Full Product Schema for creation/update
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

// Type exports
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type ProductImage = z.infer<typeof productImageSchema>;
export type ProductVariant = z.infer<typeof productVariantSchema>;
export type ProductSeo = z.infer<typeof productSeoSchema>;

// Auth schemas
export const loginSchema = z.object({
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
    password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
    storeName: z.string().min(2, "Store name must be at least 2 characters").max(100),
    email: z.string().regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});

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
