"use server";

import { createClient } from "@/infrastructure/supabase/server";
import { revalidatePath } from "next/cache";

// ============================================================================
// TYPES
// ============================================================================

export type DiscountType = "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
export type DiscountScope = "all" | "products" | "collections" | "customers";

export interface Discount {
    id: string;
    tenant_id: string;
    code: string;
    name: string;
    description: string | null;
    type: DiscountType;
    value: number;
    scope: DiscountScope;
    min_order_amount: number | null;
    min_quantity: number | null;
    max_uses: number | null;
    max_uses_per_customer: number | null;
    used_count: number;
    starts_at: string | null;
    expires_at: string | null;
    is_active: boolean;
    combines_with_other_discounts: boolean;
    first_time_purchase_only: boolean;
    applicable_product_ids: string[] | null;
    applicable_collection_ids: string[] | null;
    applicable_customer_ids: string[] | null;
    excluded_product_ids: string[] | null;
    metadata: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

export interface DiscountUsage {
    id: string;
    tenant_id: string;
    discount_id: string;
    customer_id: string | null;
    order_id: string | null;
    discount_amount: number;
    used_at: string;
}

// Campaign types (for future implementation)
export type CampaignType = "email" | "sms" | "push";
export type CampaignStatus = "draft" | "scheduled" | "sending" | "sent" | "paused" | "failed";
export type AutomationType = "welcome" | "abandoned_cart" | "post_purchase" | "win_back" | "birthday";

export interface Campaign {
    id: string;
    name: string;
    type: CampaignType;
    status: CampaignStatus;
    subject: string | null;
    preview_text: string | null;
    from_name: string | null;
    from_email: string | null;
    reply_to: string | null;
    content: string | null;
    content_json: Record<string, unknown> | null;
    template_id: string | null;
    segment_id: string | null;
    segment_name: string | null;
    scheduled_at: string | null;
    sent_at: string | null;
    recipients_count: number;
    delivered_count: number;
    opened_count: number;
    clicked_count: number;
    bounced_count: number;
    unsubscribed_count: number;
    revenue_generated: number;
    created_at: string;
    updated_at: string;
}

export interface Automation {
    id: string;
    name: string;
    type: AutomationType;
    description: string;
    is_active: boolean;
    trigger_delay_hours: number;
    emails_sent: number;
    conversion_rate: number;
    revenue_generated: number;
    created_at: string;
    updated_at: string;
}

export interface CustomerSegment {
    id: string;
    name: string;
    description: string;
    customer_count: number;
    conditions: Record<string, unknown>;
    created_at: string;
}

export interface MarketingActivity {
    id: string;
    type: "discount_used" | "campaign_sent" | "subscriber_added" | "automation_triggered";
    title: string;
    description: string;
    timestamp: string;
    metadata?: Record<string, unknown>;
}

export interface MarketingStats {
    totalDiscounts: number;
    activeDiscounts: number;
    totalRedemptions: number;
    discountRevenue: number;
    avgDiscountValue: number;
    totalCampaigns: number;
    activeCampaigns: number;
    totalEmailsSent: number;
    avgOpenRate: number;
    avgClickRate: number;
    campaignRevenue: number;
    totalAutomations: number;
    activeAutomations: number;
    automationRevenue: number;
    totalSubscribers: number;
    subscriberGrowth: number;
}

export interface MarketingData {
    discounts: Discount[];
    campaigns: Campaign[];
    automations: Automation[];
    segments: CustomerSegment[];
    stats: MarketingStats;
    recentActivity: MarketingActivity[];
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getTenantId(): Promise<string | null> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id")
        .eq("id", user.id)
        .single();

    return userData?.tenant_id || null;
}

// ============================================================================
// PRODUCTS & COLLECTIONS FOR DISCOUNT TARGETING
// ============================================================================

export interface ProductOption {
    id: string;
    name: string;
    sku: string | null;
    price: number;
    image_url: string | null;
}

export interface CollectionOption {
    id: string;
    name: string;
    slug: string;
    product_count: number;
}

export interface CategoryOption {
    id: string;
    name: string;
    parent_name: string | null;
    product_count: number;
}

export async function getProductsForDiscount(): Promise<{ products: ProductOption[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { products: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("products")
        .select("id, name, sku, price, images")
        .eq("tenant_id", tenantId)
        .eq("status", "active")
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching products:", error);
        return { products: [], error: error.message };
    }

    const products: ProductOption[] = (data || []).map((p: { id: string; name: string; sku: string | null; price: number; images: { url: string }[] | null }) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        price: p.price,
        image_url: p.images?.[0]?.url || null,
    }));

    return { products };
}

export async function getCollectionsForDiscount(): Promise<{ collections: CollectionOption[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { collections: [], error: "Unauthorized" };
    }

    // Get collections with product count
    const { data, error } = await supabase
        .from("collections")
        .select(`
            id,
            name,
            slug,
            collection_products(count)
        `)
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching collections:", error);
        return { collections: [], error: error.message };
    }

    const collections: CollectionOption[] = (data || []).map((c: { id: string; name: string; slug: string; collection_products: { count: number }[] }) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        product_count: c.collection_products?.[0]?.count || 0,
    }));

    return { collections };
}

export async function getCategoriesForDiscount(): Promise<{ categories: CategoryOption[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { categories: [], error: "Unauthorized" };
    }

    // Get categories with product count and parent info
    const { data, error } = await supabase
        .from("categories")
        .select(`
            id,
            name,
            parent_id,
            products(count)
        `)
        .eq("tenant_id", tenantId)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching categories:", error);
        return { categories: [], error: error.message };
    }

    // Build a map for parent names
    const categoryMap = new Map<string, string>();
    (data || []).forEach((c: { id: string; name: string }) => {
        categoryMap.set(c.id, c.name);
    });

    const categories: CategoryOption[] = (data || []).map((c: { id: string; name: string; parent_id: string | null; products: { count: number }[] }) => ({
        id: c.id,
        name: c.name,
        parent_name: c.parent_id ? categoryMap.get(c.parent_id) || null : null,
        product_count: c.products?.[0]?.count || 0,
    }));

    return { categories };
}

// ============================================================================
// DISCOUNT DATA FETCHING
// ============================================================================

export async function getDiscounts(): Promise<{ discounts: Discount[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { discounts: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching discounts:", error);
        return { discounts: [], error: error.message };
    }

    return { discounts: data || [] };
}

export async function getDiscount(id: string): Promise<{ discount: Discount | null; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { discount: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        console.error("Error fetching discount:", error);
        return { discount: null, error: error.message };
    }

    return { discount: data };
}

export async function getDiscountByCode(code: string): Promise<{ discount: Discount | null; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { discount: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("discounts")
        .select("*")
        .eq("code", code.toUpperCase())
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        return { discount: null, error: error.code === "PGRST116" ? "Discount not found" : error.message };
    }

    return { discount: data };
}

// ============================================================================
// DISCOUNT CRUD OPERATIONS
// ============================================================================

export interface CreateDiscountInput {
    code: string;
    name: string;
    description?: string;
    type: DiscountType;
    value: number;
    scope?: DiscountScope;
    min_order_amount?: number;
    min_quantity?: number;
    max_uses?: number;
    max_uses_per_customer?: number;
    starts_at?: string;
    expires_at?: string;
    combines_with_other_discounts?: boolean;
    first_time_purchase_only?: boolean;
    applicable_product_ids?: string[];
    applicable_collection_ids?: string[];
}

export async function createDiscount(input: CreateDiscountInput): Promise<{ success: boolean; error?: string; discount?: Discount }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Validate code format
    const code = input.code.toUpperCase().trim();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
        return { success: false, error: "Code must be 3-20 characters, uppercase letters, numbers, hyphens, and underscores only" };
    }

    // Check if code already exists
    const { data: existing } = await supabase
        .from("discounts")
        .select("id")
        .eq("tenant_id", tenantId)
        .eq("code", code)
        .single();

    if (existing) {
        return { success: false, error: "A discount with this code already exists" };
    }

    // Validate value based on type
    if (input.type === "percentage" && (input.value < 0 || input.value > 100)) {
        return { success: false, error: "Percentage must be between 0 and 100" };
    }

    if (input.type !== "free_shipping" && input.value <= 0) {
        return { success: false, error: "Discount value must be greater than 0" };
    }

    const { data, error } = await supabase
        .from("discounts")
        .insert({
            tenant_id: tenantId,
            code,
            name: input.name || code,
            description: input.description,
            type: input.type,
            value: input.type === "free_shipping" ? 0 : input.value,
            scope: input.scope || "all",
            min_order_amount: input.min_order_amount,
            min_quantity: input.min_quantity,
            max_uses: input.max_uses,
            max_uses_per_customer: input.max_uses_per_customer,
            starts_at: input.starts_at,
            expires_at: input.expires_at,
            combines_with_other_discounts: input.combines_with_other_discounts || false,
            first_time_purchase_only: input.first_time_purchase_only || false,
            applicable_product_ids: input.applicable_product_ids,
            applicable_collection_ids: input.applicable_collection_ids,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating discount:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true, discount: data };
}

export async function updateDiscount(id: string, input: Partial<CreateDiscountInput>): Promise<{ success: boolean; error?: string; discount?: Discount }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // If updating code, validate and check uniqueness
    if (input.code) {
        const code = input.code.toUpperCase().trim();
        if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
            return { success: false, error: "Code must be 3-20 characters, uppercase letters, numbers, hyphens, and underscores only" };
        }

        const { data: existing } = await supabase
            .from("discounts")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("code", code)
            .neq("id", id)
            .single();

        if (existing) {
            return { success: false, error: "A discount with this code already exists" };
        }
        input.code = code;
    }

    // Validate value if provided
    if (input.value !== undefined) {
        if (input.type === "percentage" && (input.value < 0 || input.value > 100)) {
            return { success: false, error: "Percentage must be between 0 and 100" };
        }
    }

    const updateData: Record<string, unknown> = {};
    if (input.code) updateData.code = input.code;
    if (input.name) updateData.name = input.name;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.type) updateData.type = input.type;
    if (input.value !== undefined) updateData.value = input.value;
    if (input.scope) updateData.scope = input.scope;
    if (input.min_order_amount !== undefined) updateData.min_order_amount = input.min_order_amount;
    if (input.min_quantity !== undefined) updateData.min_quantity = input.min_quantity;
    if (input.max_uses !== undefined) updateData.max_uses = input.max_uses;
    if (input.max_uses_per_customer !== undefined) updateData.max_uses_per_customer = input.max_uses_per_customer;
    if (input.starts_at !== undefined) updateData.starts_at = input.starts_at;
    if (input.expires_at !== undefined) updateData.expires_at = input.expires_at;
    if (input.combines_with_other_discounts !== undefined) updateData.combines_with_other_discounts = input.combines_with_other_discounts;
    if (input.first_time_purchase_only !== undefined) updateData.first_time_purchase_only = input.first_time_purchase_only;
    if (input.applicable_product_ids !== undefined) updateData.applicable_product_ids = input.applicable_product_ids;
    if (input.applicable_collection_ids !== undefined) updateData.applicable_collection_ids = input.applicable_collection_ids;

    const { data, error } = await supabase
        .from("discounts")
        .update(updateData)
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();

    if (error) {
        console.error("Error updating discount:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true, discount: data };
}

export async function deleteDiscount(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("discounts")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error deleting discount:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true };
}

export async function toggleDiscountStatus(id: string, isActive: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("discounts")
        .update({ is_active: isActive })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error toggling discount status:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true };
}

export async function duplicateDiscount(id: string): Promise<{ success: boolean; error?: string; discount?: Discount }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Get the original discount
    const { data: original, error: fetchError } = await supabase
        .from("discounts")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (fetchError || !original) {
        return { success: false, error: "Discount not found" };
    }

    // Generate a unique code
    let newCode = `${original.code}_COPY`;
    let counter = 1;
    while (true) {
        const { data: existing } = await supabase
            .from("discounts")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("code", newCode)
            .single();
        
        if (!existing) break;
        newCode = `${original.code}_COPY${counter}`;
        counter++;
        if (counter > 100) {
            return { success: false, error: "Could not generate unique code" };
        }
    }

    // Create the duplicate
    const { data, error } = await supabase
        .from("discounts")
        .insert({
            tenant_id: tenantId,
            code: newCode,
            name: `${original.name} (Copy)`,
            description: original.description,
            type: original.type,
            value: original.value,
            scope: original.scope,
            min_order_amount: original.min_order_amount,
            min_quantity: original.min_quantity,
            max_uses: original.max_uses,
            max_uses_per_customer: original.max_uses_per_customer,
            starts_at: null, // Reset dates for the copy
            expires_at: null,
            is_active: false, // Start as inactive
            combines_with_other_discounts: original.combines_with_other_discounts,
            first_time_purchase_only: original.first_time_purchase_only,
            applicable_product_ids: original.applicable_product_ids,
            applicable_collection_ids: original.applicable_collection_ids,
        })
        .select()
        .single();

    if (error) {
        console.error("Error duplicating discount:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true, discount: data };
}

// Bulk operations
export async function bulkDeleteDiscounts(ids: string[]): Promise<{ success: boolean; error?: string; deletedCount: number }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized", deletedCount: 0 };
    }

    const { error, count } = await supabase
        .from("discounts")
        .delete()
        .in("id", ids)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error bulk deleting discounts:", error);
        return { success: false, error: error.message, deletedCount: 0 };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true, deletedCount: count || ids.length };
}

export async function bulkToggleDiscounts(ids: string[], isActive: boolean): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { error } = await supabase
        .from("discounts")
        .update({ is_active: isActive })
        .in("id", ids)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error bulk toggling discounts:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    
    return { success: true };
}

// ============================================================================
// DISCOUNT VALIDATION (for checkout)
// ============================================================================

export interface ValidateDiscountResult {
    valid: boolean;
    error?: string;
    discount?: Discount;
    discountAmount?: number;
}

export async function validateDiscount(
    code: string, 
    orderTotal: number, 
    itemCount: number,
    customerId?: string
): Promise<ValidateDiscountResult> {
    const { discount, error } = await getDiscountByCode(code);
    
    if (error || !discount) {
        return { valid: false, error: "Invalid discount code" };
    }

    const now = new Date();

    // Check if active
    if (!discount.is_active) {
        return { valid: false, error: "This discount code is no longer active" };
    }

    // Check start date
    if (discount.starts_at && new Date(discount.starts_at) > now) {
        return { valid: false, error: "This discount code is not yet active" };
    }

    // Check expiry
    if (discount.expires_at && new Date(discount.expires_at) < now) {
        return { valid: false, error: "This discount code has expired" };
    }

    // Check usage limit
    if (discount.max_uses && discount.used_count >= discount.max_uses) {
        return { valid: false, error: "This discount code has reached its usage limit" };
    }

    // Check minimum order amount
    if (discount.min_order_amount && orderTotal < discount.min_order_amount) {
        return { 
            valid: false, 
            error: `Minimum order amount of ${discount.min_order_amount} required` 
        };
    }

    // Check minimum quantity
    if (discount.min_quantity && itemCount < discount.min_quantity) {
        return { 
            valid: false, 
            error: `Minimum ${discount.min_quantity} items required` 
        };
    }

    // Check per-customer limit if customer is logged in
    if (customerId && discount.max_uses_per_customer) {
        const supabase = await createClient();
        const { count } = await supabase
            .from("discount_usages")
            .select("*", { count: "exact", head: true })
            .eq("discount_id", discount.id)
            .eq("customer_id", customerId);

        if (count && count >= discount.max_uses_per_customer) {
            return { valid: false, error: "You have already used this discount code" };
        }
    }

    // Calculate discount amount
    let discountAmount = 0;
    switch (discount.type) {
        case "percentage":
            discountAmount = (orderTotal * discount.value) / 100;
            break;
        case "fixed":
            discountAmount = Math.min(discount.value, orderTotal);
            break;
        case "free_shipping":
            // Shipping discount handled separately
            discountAmount = 0;
            break;
        case "buy_x_get_y":
            // Complex calculation based on cart items
            discountAmount = 0;
            break;
    }

    return { 
        valid: true, 
        discount, 
        discountAmount 
    };
}

// Record discount usage after successful order
export async function recordDiscountUsage(
    discountId: string,
    orderId: string,
    discountAmount: number,
    customerId?: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Insert usage record
    const { error: usageError } = await supabase
        .from("discount_usages")
        .insert({
            tenant_id: tenantId,
            discount_id: discountId,
            order_id: orderId,
            customer_id: customerId,
            discount_amount: discountAmount,
        });

    if (usageError) {
        console.error("Error recording discount usage:", usageError);
        return { success: false, error: usageError.message };
    }

    // Increment used_count
    const { error: updateError } = await supabase.rpc("increment_discount_usage", {
        discount_id: discountId,
    });

    if (updateError) {
        // Fallback to manual increment
        const { data: discount } = await supabase
            .from("discounts")
            .select("used_count")
            .eq("id", discountId)
            .single();

        if (discount) {
            await supabase
                .from("discounts")
                .update({ used_count: discount.used_count + 1 })
                .eq("id", discountId);
        }
    }

    return { success: true };
}

// ============================================================================
// MARKETING DATA (Overview page)
// ============================================================================

export async function getMarketingData(): Promise<MarketingData> {
    const supabase = await createClient();
    const tenantId = await getTenantId();

    if (!tenantId) {
        return {
            discounts: [],
            campaigns: [],
            automations: [],
            segments: [],
            stats: {
                totalDiscounts: 0,
                activeDiscounts: 0,
                totalRedemptions: 0,
                discountRevenue: 0,
                avgDiscountValue: 0,
                totalCampaigns: 0,
                activeCampaigns: 0,
                totalEmailsSent: 0,
                avgOpenRate: 0,
                avgClickRate: 0,
                campaignRevenue: 0,
                totalAutomations: 0,
                activeAutomations: 0,
                automationRevenue: 0,
                totalSubscribers: 0,
                subscriberGrowth: 0,
            },
            recentActivity: [],
        };
    }

    // Fetch real discounts from database
    const { data: discounts } = await supabase
        .from("discounts")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    // Fetch real campaigns from database
    const { data: campaignsData } = await supabase
        .from("campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    // Fetch segments
    const { data: segmentsData } = await supabase
        .from("customer_segments")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true);

    // Get subscriber count
    const { count: subscriberCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("accepts_marketing", true);

    // Fetch discount usage stats
    const { data: usageStats } = await supabase
        .from("discount_usages")
        .select("discount_amount")
        .eq("tenant_id", tenantId);

    const totalRedemptions = discounts?.reduce((sum, d) => sum + d.used_count, 0) || 0;
    const discountRevenue = usageStats?.reduce((sum, u) => sum + Number(u.discount_amount), 0) || 0;
    const activeDiscounts = discounts?.filter(d => {
        if (!d.is_active) return false;
        const now = new Date();
        if (d.expires_at && new Date(d.expires_at) < now) return false;
        if (d.starts_at && new Date(d.starts_at) > now) return false;
        if (d.max_uses && d.used_count >= d.max_uses) return false;
        return true;
    }).length || 0;

    // Default segments
    const defaultSegments: CustomerSegment[] = [
        { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: subscriberCount || 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
    ];

    // Mock automations (to be implemented later)
    const mockAutomations: Automation[] = [];

    // Build recent activity from discount usages and campaign sends
    const { data: recentUsages } = await supabase
        .from("discount_usages")
        .select(`
            id,
            discount_amount,
            used_at,
            discounts (code, name)
        `)
        .eq("tenant_id", tenantId)
        .order("used_at", { ascending: false })
        .limit(5);

    const recentActivity: MarketingActivity[] = (recentUsages || []).map((usage: any) => ({
        id: usage.id,
        type: "discount_used" as const,
        title: `${usage.discounts?.code || "Discount"} used`,
        description: `Saved ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(usage.discount_amount)}`,
        timestamp: usage.used_at,
    }));

    // Add recent campaign sends to activity
    const recentCampaigns = (campaignsData || [])
        .filter(c => c.sent_at)
        .slice(0, 3)
        .map(c => ({
            id: c.id,
            type: "campaign_sent" as const,
            title: `"${c.name}" sent`,
            description: `Delivered to ${c.delivered_count.toLocaleString()} recipients`,
            timestamp: c.sent_at!,
        }));

    recentActivity.push(...recentCampaigns);
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());


    const stats: MarketingStats = {
        totalDiscounts: discounts?.length || 0,
        activeDiscounts,
        totalRedemptions,
        discountRevenue,
        avgDiscountValue: totalRedemptions > 0 ? discountRevenue / totalRedemptions : 0,
        totalCampaigns: campaignsData?.length || 0,
        activeCampaigns: campaignsData?.filter(c => c.status === "scheduled" || c.status === "sending").length || 0,
        totalEmailsSent: campaignsData?.reduce((sum, c) => sum + c.delivered_count, 0) || 0,
        avgOpenRate: calculateAvgOpenRate(campaignsData || []),
        avgClickRate: calculateAvgClickRate(campaignsData || []),
        campaignRevenue: campaignsData?.reduce((sum, c) => sum + Number(c.revenue_generated), 0) || 0,
        totalAutomations: mockAutomations.length,
        activeAutomations: 0,
        automationRevenue: 0,
        totalSubscribers: subscriberCount || 0,
        subscriberGrowth: 0,
    };

    return {
        discounts: discounts || [],
        campaigns: campaignsData || [],
        automations: mockAutomations,
        segments: segmentsData || defaultSegments,
        stats,
        recentActivity,
    };
}

function calculateAvgOpenRate(campaigns: Campaign[]): number {
    const sentCampaigns = campaigns.filter(c => c.status === "sent" && c.delivered_count > 0);
    if (sentCampaigns.length === 0) return 0;
    const totalRate = sentCampaigns.reduce((sum, c) => sum + (c.opened_count / c.delivered_count * 100), 0);
    return totalRate / sentCampaigns.length;
}

function calculateAvgClickRate(campaigns: Campaign[]): number {
    const sentCampaigns = campaigns.filter(c => c.status === "sent" && c.delivered_count > 0);
    if (sentCampaigns.length === 0) return 0;
    const totalRate = sentCampaigns.reduce((sum, c) => sum + (c.clicked_count / c.delivered_count * 100), 0);
    return totalRate / sentCampaigns.length;
}

// ============================================================================
// CAMPAIGN CRUD OPERATIONS
// ============================================================================

export interface CreateCampaignInput {
    name: string;
    type?: CampaignType;
    subject?: string;
    preview_text?: string;
    from_name?: string;
    from_email?: string;
    reply_to?: string;
    content?: string;
    content_json?: Record<string, unknown>;
    segment_id?: string;
    segment_name?: string;
    scheduled_at?: string;
}

export async function getCampaigns(): Promise<{ campaigns: Campaign[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { campaigns: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Error fetching campaigns:", error);
        return { campaigns: [], error: error.message };
    }

    return { campaigns: data || [] };
}

export async function getCampaign(id: string): Promise<{ campaign: Campaign | null; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { campaign: null, error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (error) {
        console.error("Error fetching campaign:", error);
        return { campaign: null, error: error.message };
    }

    return { campaign: data };
}

export async function createCampaign(input: CreateCampaignInput): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    if (!input.name?.trim()) {
        return { success: false, error: "Campaign name is required" };
    }

    // Get tenant info for default from email
    const { data: tenant } = await supabase
        .from("tenants")
        .select("name, email")
        .eq("id", tenantId)
        .single();

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            tenant_id: tenantId,
            name: input.name.trim(),
            type: input.type || "email",
            status: "draft",
            subject: input.subject,
            preview_text: input.preview_text,
            from_name: input.from_name || tenant?.name || "Store",
            from_email: input.from_email || tenant?.email,
            reply_to: input.reply_to,
            content: input.content,
            content_json: input.content_json,
            segment_id: input.segment_id || "all",
            segment_name: input.segment_name || "All Customers",
            scheduled_at: input.scheduled_at,
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true, campaign: data };
}

export async function updateCampaign(id: string, input: Partial<CreateCampaignInput> & { status?: CampaignStatus }): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Check if campaign exists and is editable
    const { data: existing } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!existing) {
        return { success: false, error: "Campaign not found" };
    }

    if (existing.status === "sent" || existing.status === "sending") {
        return { success: false, error: "Cannot edit a campaign that has been sent or is sending" };
    }

    const updateData: Record<string, unknown> = {};
    if (input.name !== undefined) updateData.name = input.name;
    if (input.type !== undefined) updateData.type = input.type;
    if (input.status !== undefined) updateData.status = input.status;
    if (input.subject !== undefined) updateData.subject = input.subject;
    if (input.preview_text !== undefined) updateData.preview_text = input.preview_text;
    if (input.from_name !== undefined) updateData.from_name = input.from_name;
    if (input.from_email !== undefined) updateData.from_email = input.from_email;
    if (input.reply_to !== undefined) updateData.reply_to = input.reply_to;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.content_json !== undefined) updateData.content_json = input.content_json;
    if (input.segment_id !== undefined) updateData.segment_id = input.segment_id;
    if (input.segment_name !== undefined) updateData.segment_name = input.segment_name;
    if (input.scheduled_at !== undefined) updateData.scheduled_at = input.scheduled_at;

    const { data, error } = await supabase
        .from("campaigns")
        .update(updateData)
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .select()
        .single();

    if (error) {
        console.error("Error updating campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true, campaign: data };
}

export async function deleteCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Check if campaign can be deleted
    const { data: existing } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!existing) {
        return { success: false, error: "Campaign not found" };
    }

    if (existing.status === "sending") {
        return { success: false, error: "Cannot delete a campaign that is currently sending" };
    }

    // Delete recipients first
    await supabase
        .from("campaign_recipients")
        .delete()
        .eq("campaign_id", id);

    // Delete campaign
    const { error } = await supabase
        .from("campaigns")
        .delete()
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error deleting campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function pauseCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { data: existing } = await supabase
        .from("campaigns")
        .select("status")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!existing) {
        return { success: false, error: "Campaign not found" };
    }

    if (existing.status !== "scheduled" && existing.status !== "sending") {
        return { success: false, error: "Can only pause scheduled or sending campaigns" };
    }

    const { error } = await supabase
        .from("campaigns")
        .update({ status: "paused" })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error pausing campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function scheduleCampaign(id: string, scheduledAt: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Validate campaign is ready to schedule
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!campaign) {
        return { success: false, error: "Campaign not found" };
    }

    if (!campaign.subject) {
        return { success: false, error: "Campaign must have a subject line" };
    }

    if (!campaign.content) {
        return { success: false, error: "Campaign must have content" };
    }

    // Get recipient count
    const recipientCount = await getSegmentRecipientCount(campaign.segment_id || "all");

    const { error } = await supabase
        .from("campaigns")
        .update({ 
            status: "scheduled",
            scheduled_at: scheduledAt,
            recipients_count: recipientCount,
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error scheduling campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function sendCampaign(id: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    // Validate campaign is ready to send
    const { data: campaign } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!campaign) {
        return { success: false, error: "Campaign not found" };
    }

    if (campaign.status === "sent" || campaign.status === "sending") {
        return { success: false, error: "Campaign has already been sent" };
    }

    if (!campaign.subject) {
        return { success: false, error: "Campaign must have a subject line" };
    }

    if (!campaign.content) {
        return { success: false, error: "Campaign must have content" };
    }

    // Get recipient count
    const recipientCount = await getSegmentRecipientCount(campaign.segment_id || "all");

    if (recipientCount === 0) {
        return { success: false, error: "No recipients found for this segment" };
    }

    // Update status to sending (in production, this would trigger actual email sending)
    const { error } = await supabase
        .from("campaigns")
        .update({ 
            status: "sent", // In production: "sending", then update to "sent" after completion
            sent_at: new Date().toISOString(),
            recipients_count: recipientCount,
            delivered_count: recipientCount, // Simulated - in production this would be tracked
        })
        .eq("id", id)
        .eq("tenant_id", tenantId);

    if (error) {
        console.error("Error sending campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true };
}

export async function duplicateCampaign(id: string): Promise<{ success: boolean; error?: string; campaign?: Campaign }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { success: false, error: "Unauthorized" };
    }

    const { data: original } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", id)
        .eq("tenant_id", tenantId)
        .single();

    if (!original) {
        return { success: false, error: "Campaign not found" };
    }

    const { data, error } = await supabase
        .from("campaigns")
        .insert({
            tenant_id: tenantId,
            name: `${original.name} (Copy)`,
            type: original.type,
            status: "draft",
            subject: original.subject,
            preview_text: original.preview_text,
            from_name: original.from_name,
            from_email: original.from_email,
            reply_to: original.reply_to,
            content: original.content,
            content_json: original.content_json,
            segment_id: original.segment_id,
            segment_name: original.segment_name,
        })
        .select()
        .single();

    if (error) {
        console.error("Error duplicating campaign:", error);
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/campaigns");
    
    return { success: true, campaign: data };
}

// ============================================================================
// SEGMENT OPERATIONS
// ============================================================================

export async function getSegments(): Promise<{ segments: CustomerSegment[]; error?: string }> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) {
        return { segments: [], error: "Unauthorized" };
    }

    const { data, error } = await supabase
        .from("customer_segments")
        .select("*")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("name", { ascending: true });

    if (error) {
        console.error("Error fetching segments:", error);
        // Return default segments if table doesn't exist yet
        return { 
            segments: [
                { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
                { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
                { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
                { id: "vip", name: "VIP Customers", description: "Top 10% by spending", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
            ]
        };
    }

    // Add default segments if none exist
    const defaultSegments: CustomerSegment[] = [
        { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "vip", name: "VIP Customers", description: "Top 10% by spending", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
    ];

    return { segments: [...defaultSegments, ...(data || [])] };
}

async function getSegmentRecipientCount(segmentId: string): Promise<number> {
    const supabase = await createClient();
    const tenantId = await getTenantId();
    
    if (!tenantId) return 0;

    let query = supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("accepts_marketing", true);

    // Apply segment filters
    switch (segmentId) {
        case "new":
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            query = query.gte("created_at", thirtyDaysAgo.toISOString());
            break;
        case "returning":
            // This would need a join with orders - simplified for now
            break;
        case "vip":
            // This would need aggregation - simplified for now
            break;
    }

    const { count } = await query;
    return count || 0;
}

// ============================================================================
// AUTOMATION ACTIONS (Placeholder for future implementation)
// ============================================================================

export async function toggleAutomation(_id: string, _isActive: boolean): Promise<{ success: boolean; error?: string }> {
    return { success: true };
}