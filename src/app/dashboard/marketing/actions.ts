"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:marketing");

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { db } from "@/infrastructure/db";
import { products } from "@/db/schema/products";
import { collections, collectionProducts } from "@/db/schema/collections";
import { categories } from "@/db/schema/products";
import { discounts, discountUsages } from "@/db/schema/discounts";
import { campaigns, customerSegments } from "@/db/schema/campaigns";
import { customers } from "@/db/schema/customers";
import { eq, and, asc, desc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import type {
    Discount,
    DiscountUsage,
    Campaign,
    Automation,
    CustomerSegment,
    MarketingActivity,
    MarketingStats,
    MarketingData,
    ProductOption,
    CollectionOption,
    CategoryOption,
    CreateDiscountInput,
    CreateCampaignInput,
    CampaignStatus,
} from "./types";

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

async function getTenantId(): Promise<string | null> {
    const { user } = await getAuthenticatedClient();
    return user.tenantId;
}

// ============================================================================
// PRODUCTS & COLLECTIONS FOR DISCOUNT TARGETING
// ============================================================================

export async function getProductsForDiscount(): Promise<{ products: ProductOption[]; error?: string }> {
    const tenantId = await getTenantId();
    if (!tenantId) return { products: [], error: "Unauthorized" };

    try {
        const data = await db.select({
            id: products.id, name: products.name, sku: products.sku,
            price: products.price, images: products.images,
        }).from(products)
            .where(and(eq(products.tenantId, tenantId), eq(products.status, "active")))
            .orderBy(asc(products.name));

        const result: ProductOption[] = data.map(p => ({
            id: p.id, name: p.name, sku: p.sku,
            price: parseFloat(p.price || "0"),
            image_url: (p.images as { url: string }[] | null)?.[0]?.url || null,
        }));

        return { products: result };
    } catch (error) {
        log.error("Error fetching products:", error);
        return { products: [], error: "Failed to fetch products" };
    }
}

export async function getCollectionsForDiscount(): Promise<{ collections: CollectionOption[]; error?: string }> {
    const tenantId = await getTenantId();
    if (!tenantId) return { collections: [], error: "Unauthorized" };

    try {
        const data = await db.select({
            id: collections.id, name: collections.name, slug: collections.slug,
            productCount: count(collectionProducts.id),
        }).from(collections)
            .leftJoin(collectionProducts, eq(collections.id, collectionProducts.collectionId))
            .where(and(eq(collections.tenantId, tenantId), eq(collections.isActive, true)))
            .groupBy(collections.id)
            .orderBy(asc(collections.name));

        const result: CollectionOption[] = data.map(c => ({
            id: c.id, name: c.name, slug: c.slug, product_count: c.productCount,
        }));

        return { collections: result };
    } catch (error) {
        log.error("Error fetching collections:", error);
        return { collections: [], error: error instanceof Error ? error.message : "Failed" };
    }
}

export async function getCategoriesForDiscount(): Promise<{ categories: CategoryOption[]; error?: string }> {
    const tenantId = await getTenantId();
    if (!tenantId) return { categories: [], error: "Unauthorized" };

    try {
        const data = await db.select({
            id: categories.id, name: categories.name, parentId: categories.parentId,
            productCount: count(products.id),
        }).from(categories)
            .leftJoin(products, eq(categories.id, products.categoryId))
            .where(eq(categories.tenantId, tenantId))
            .groupBy(categories.id)
            .orderBy(asc(categories.name));

        const categoryMap = new Map<string, string>();
        data.forEach(c => categoryMap.set(c.id, c.name));

        const result: CategoryOption[] = data.map(c => ({
            id: c.id, name: c.name,
            parent_name: c.parentId ? categoryMap.get(c.parentId) || null : null,
            product_count: c.productCount,
        }));

        return { categories: result };
    } catch (error) {
        log.error("Error fetching categories:", error);
        return { categories: [], error: error instanceof Error ? error.message : "Failed" };
    }
}

// ============================================================================
// DISCOUNT CRUD (used by marketing overview discount dialog)
// ============================================================================

const createDiscountSchema = z.object({
    code: z.string().min(3).max(20),
    name: z.string().max(100).optional(),
    description: z.string().max(500).optional(),
    type: z.enum(["percentage", "fixed", "free_shipping"]),
    value: z.number().min(0),
    scope: z.string().optional(),
    min_order_amount: z.number().min(0).optional(),
    min_quantity: z.number().int().min(0).optional(),
    max_uses: z.number().int().min(0).optional(),
    max_uses_per_customer: z.number().int().min(0).optional(),
    starts_at: z.string().optional(),
    expires_at: z.string().optional(),
    combines_with_other_discounts: z.boolean().optional(),
    first_time_purchase_only: z.boolean().optional(),
    applicable_product_ids: z.array(z.string().uuid()).optional(),
    applicable_collection_ids: z.array(z.string().uuid()).optional(),
});

export async function createDiscount(input: CreateDiscountInput): Promise<{ success: boolean; error?: string; discount?: Discount }> {
    const validated = createDiscountSchema.parse(input);
    const supabase = await createClient();
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    const { getTenantPlanLimits } = await import("@/lib/plan-limits");
    const limits = await getTenantPlanLimits(tenantId);
    if (limits.planName === "Free") return { success: false, error: "Discounts require a paid plan. Upgrade to Growth." };

    const code = validated.code.toUpperCase().trim();
    if (!/^[A-Z0-9_-]{3,20}$/.test(code)) {
        return { success: false, error: "Code must be 3-20 characters, uppercase letters, numbers, hyphens, and underscores only" };
    }

    // TODO: migrate discounts insert/update when column mapping is confirmed (discounts schema uses different column names: usageLimit vs max_uses, etc.)
    const { data: existing } = await supabase.from("discounts").select("id").eq("tenant_id", tenantId).eq("code", code).single();
    if (existing) return { success: false, error: "A discount with this code already exists" };

    if (validated.type === "percentage" && (validated.value < 0 || validated.value > 100)) {
        return { success: false, error: "Percentage must be between 0 and 100" };
    }

    const { data, error } = await supabase.from("discounts").insert({
        tenant_id: tenantId, code, name: validated.name || code, description: validated.description,
        type: validated.type, value: validated.type === "free_shipping" ? 0 : validated.value,
        scope: validated.scope || "all", min_order_amount: validated.min_order_amount,
        min_quantity: validated.min_quantity, max_uses: validated.max_uses,
        max_uses_per_customer: validated.max_uses_per_customer,
        starts_at: validated.starts_at, expires_at: validated.expires_at,
        combines_with_other_discounts: validated.combines_with_other_discounts || false,
        first_time_purchase_only: validated.first_time_purchase_only || false,
        applicable_product_ids: validated.applicable_product_ids,
        applicable_collection_ids: validated.applicable_collection_ids,
    }).select().single();

    if (error) { log.error("Error creating discount:", error); return { success: false, error: error.message }; }
    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    return { success: true, discount: data };
}

export async function updateDiscount(id: string, input: Partial<CreateDiscountInput>): Promise<{ success: boolean; error?: string; discount?: Discount }> {
    const validId = z.string().uuid().parse(id);
    const supabase = await createClient();
    const tenantId = await getTenantId();
    if (!tenantId) return { success: false, error: "Unauthorized" };

    if (input.code) {
        const code = input.code.toUpperCase().trim();
        if (!/^[A-Z0-9_-]{3,20}$/.test(code)) return { success: false, error: "Invalid code format" };
        const { data: existing } = await supabase.from("discounts").select("id").eq("tenant_id", tenantId).eq("code", code).neq("id", validId).single();
        if (existing) return { success: false, error: "A discount with this code already exists" };
        input.code = code;
    }

    // TODO: migrate discounts update when column mapping is confirmed
    const updateData: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(input)) {
        if (val !== undefined) updateData[key] = val;
    }

    const { data, error } = await supabase.from("discounts").update(updateData).eq("id", validId).eq("tenant_id", tenantId).select().single();
    if (error) { log.error("Error updating discount:", error); return { success: false, error: error.message }; }
    revalidatePath("/dashboard/marketing");
    revalidatePath("/dashboard/marketing/discounts");
    return { success: true, discount: data };
}

// ============================================================================
// DISCOUNT ACTIONS (re-exported from discounts module for shared use)
// ============================================================================

import {
    deleteDiscount as _deleteDiscount,
    toggleDiscountStatus as _toggleDiscountStatus,
    recordDiscountUsage as _recordDiscountUsage,
} from "./discounts/actions";

export async function deleteDiscount(id: string) {
    const validId = z.string().uuid().parse(id);
    return _deleteDiscount(validId);
}

export async function toggleDiscountStatus(id: string, isActive: boolean) {
    const validId = z.string().uuid().parse(id);
    const validIsActive = z.boolean().parse(isActive);
    return _toggleDiscountStatus(validId, validIsActive);
}

export async function recordDiscountUsage(
    discountId: string,
    orderId: string,
    discountAmount: number,
    voucherCodeId?: string,
    customerId?: string
) {
    const validDiscountId = z.string().uuid().parse(discountId);
    const validOrderId = z.string().uuid().parse(orderId);
    const validAmount = z.number().min(0).parse(discountAmount);
    return _recordDiscountUsage(validDiscountId, validOrderId, validAmount, voucherCodeId, customerId);
}

// ============================================================================
// MARKETING DATA (Overview page)
// ============================================================================

export async function getMarketingData(): Promise<MarketingData> {
    const tenantId = await getTenantId();

    const emptyStats: MarketingStats = {
        totalDiscounts: 0, activeDiscounts: 0, totalRedemptions: 0,
        discountRevenue: 0, avgDiscountValue: 0, totalCampaigns: 0,
        activeCampaigns: 0, totalEmailsSent: 0, avgOpenRate: 0,
        avgClickRate: 0, campaignRevenue: 0, totalAutomations: 0,
        activeAutomations: 0, automationRevenue: 0, totalSubscribers: 0,
        subscriberGrowth: 0,
    };

    if (!tenantId) {
        return { discounts: [], campaigns: [], automations: [], segments: [], stats: emptyStats, recentActivity: [] };
    }

    // Fetch real discounts from database
    const discountsData = await db.select().from(discounts)
        .where(eq(discounts.tenantId, tenantId))
        .orderBy(desc(discounts.createdAt));

    // Fetch real campaigns from database
    const campaignsData = await db.select().from(campaigns)
        .where(eq(campaigns.tenantId, tenantId))
        .orderBy(desc(campaigns.createdAt));

    // Fetch segments
    const segmentsData = await db.select().from(customerSegments)
        .where(and(eq(customerSegments.tenantId, tenantId), eq(customerSegments.isActive, true)));

    // Get subscriber count
    const [subscriberRow] = await db.select({ value: count() }).from(customers)
        .where(and(eq(customers.tenantId, tenantId), eq(customers.acceptsMarketing, true)));
    const subscriberCount = subscriberRow?.value || 0;

    // Fetch discount usage stats
    const usageStats = await db.select({ discountAmount: discountUsages.discountAmount })
        .from(discountUsages)
        .where(eq(discountUsages.tenantId, tenantId));

    const totalRedemptions = discountsData.reduce((sum, d) => sum + d.usedCount, 0);
    const discountRevenue = usageStats.reduce((sum, u) => sum + Number(u.discountAmount), 0);
    const activeDiscountsCount = discountsData.filter(d => {
        if (!d.isActive) return false;
        const now = new Date();
        if (d.endsAt && new Date(d.endsAt) < now) return false;
        if (d.startsAt && new Date(d.startsAt) > now) return false;
        if (d.usageLimit && d.usedCount >= d.usageLimit) return false;
        return true;
    }).length;

    // Default segments
    const defaultSegments: CustomerSegment[] = [
        { id: "all", name: "All Customers", description: "All subscribed customers", customer_count: subscriberCount, conditions: {}, created_at: new Date().toISOString() },
        { id: "new", name: "New Customers", description: "Customers from the last 30 days", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
        { id: "returning", name: "Returning Customers", description: "Customers with 2+ orders", customer_count: 0, conditions: {}, created_at: new Date().toISOString() },
    ];

    const mockAutomations: Automation[] = [];

    // Build recent activity from discount usages
    const supabase = await createClient();
    const { data: recentUsages } = await supabase
        .from("discount_usages")
        .select(`id, discount_amount, used_at, discounts (code, name)`)
        .eq("tenant_id", tenantId)
        .order("used_at", { ascending: false })
        .limit(5);

    const recentActivity: MarketingActivity[] = (recentUsages || []).map((usage: Record<string, unknown>) => ({
        id: usage.id as string,
        type: "discount_used" as const,
        title: `${(usage.discounts as Record<string, string> | null)?.code || "Discount"} used`,
        description: `Saved ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(usage.discount_amount as number || 0)}`,
        timestamp: usage.used_at as string,
    }));

    // Add recent campaign sends to activity
    const recentCampaigns = campaignsData
        .filter(c => c.sentAt)
        .slice(0, 3)
        .map(c => ({
            id: c.id,
            type: "campaign_sent" as const,
            title: `"${c.name}" sent`,
            description: `Delivered to ${c.deliveredCount.toLocaleString()} recipients`,
            timestamp: c.sentAt!.toISOString(),
        }));

    recentActivity.push(...recentCampaigns);
    recentActivity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const stats: MarketingStats = {
        totalDiscounts: discountsData.length,
        activeDiscounts: activeDiscountsCount,
        totalRedemptions,
        discountRevenue,
        avgDiscountValue: totalRedemptions > 0 ? discountRevenue / totalRedemptions : 0,
        totalCampaigns: campaignsData.length,
        activeCampaigns: campaignsData.filter(c => c.status === "scheduled" || c.status === "sending").length,
        totalEmailsSent: campaignsData.reduce((sum, c) => sum + c.deliveredCount, 0),
        avgOpenRate: calculateAvgOpenRate(campaignsData),
        avgClickRate: calculateAvgClickRate(campaignsData),
        campaignRevenue: campaignsData.reduce((sum, c) => sum + Number(c.revenueGenerated), 0),
        totalAutomations: mockAutomations.length,
        activeAutomations: 0,
        automationRevenue: 0,
        totalSubscribers: subscriberCount,
        subscriberGrowth: 0,
    };

    return {
        discounts: discountsData as unknown as Discount[],
        campaigns: campaignsData as unknown as Campaign[],
        automations: mockAutomations,
        segments: segmentsData.length > 0 ? segmentsData as unknown as CustomerSegment[] : defaultSegments,
        stats,
        recentActivity,
    };
}

function calculateAvgOpenRate(campaignsArr: typeof campaigns.$inferSelect[]): number {
    const sentCampaigns = campaignsArr.filter(c => c.status === "sent" && c.deliveredCount > 0);
    if (sentCampaigns.length === 0) return 0;
    const totalRate = sentCampaigns.reduce((sum, c) => sum + (c.openedCount / c.deliveredCount * 100), 0);
    return totalRate / sentCampaigns.length;
}

function calculateAvgClickRate(campaignsArr: typeof campaigns.$inferSelect[]): number {
    const sentCampaigns = campaignsArr.filter(c => c.status === "sent" && c.deliveredCount > 0);
    if (sentCampaigns.length === 0) return 0;
    const totalRate = sentCampaigns.reduce((sum, c) => sum + (c.clickedCount / c.deliveredCount * 100), 0);
    return totalRate / sentCampaigns.length;
}

// ============================================================================

// Campaign actions — async wrappers (Next.js 16 disallows re-exports from "use server" files)
export async function getCampaigns() {
    const m = await import("./campaign-actions")
    return m.getCampaigns()
}
export async function getCampaign(id: string) {
    const m = await import("./campaign-actions")
    return m.getCampaign(id)
}
export async function createCampaign(input: CreateCampaignInput) {
    const m = await import("./campaign-actions")
    return m.createCampaign(input)
}
export async function updateCampaign(id: string, input: Partial<CreateCampaignInput> & { status?: CampaignStatus }) {
    const m = await import("./campaign-actions")
    return m.updateCampaign(id, input)
}
export async function deleteCampaign(id: string) {
    const validId = z.string().uuid().parse(id)
    const m = await import("./campaign-actions")
    return m.deleteCampaign(validId)
}
export async function pauseCampaign(id: string) {
    const validId = z.string().uuid().parse(id)
    const m = await import("./campaign-actions")
    return m.pauseCampaign(validId)
}
export async function scheduleCampaign(id: string, scheduledAt: string) {
    const validId = z.string().uuid().parse(id)
    const validScheduledAt = z.string().min(1).parse(scheduledAt)
    const m = await import("./campaign-actions")
    return m.scheduleCampaign(validId, validScheduledAt)
}
export async function sendCampaign(id: string) {
    const validId = z.string().uuid().parse(id)
    const m = await import("./campaign-actions")
    return m.sendCampaign(validId)
}
export async function duplicateCampaign(id: string) {
    const validId = z.string().uuid().parse(id)
    const m = await import("./campaign-actions")
    return m.duplicateCampaign(validId)
}
export async function getSegments() {
    const m = await import("./campaign-actions")
    return m.getSegments()
}
export async function toggleAutomation(id: string, isActive: boolean) {
    const m = await import("./campaign-actions")
    return m.toggleAutomation(id, isActive)
}
