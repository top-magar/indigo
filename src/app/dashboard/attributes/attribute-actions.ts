"use server";

import { sanitizeSearch } from "@/shared/utils/sanitize";
import { validateId } from "@/shared/utils/validate-id";
import { createLogger } from "@/lib/logger";
const log = createLogger("attributes-attribute-actions");

import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/db";
import { attributes, attributeValues } from "@/db/schema/attributes";
import { eq, and, desc, asc, ilike, or, inArray, gt, ne, count, sql } from "drizzle-orm";
import type {
    Attribute,
    AttributeValue,
    AttributeListItem,
    AttributeStats,
    CreateAttributeInput,
    UpdateAttributeInput,
    AttributeValueInput,
    AttributeFilters,
} from "./types";

// ============================================================================
// AUTH HELPER
// ============================================================================

async function getAuthenticatedTenant() {
    const { user } = await getAuthenticatedClient();
    return { tenantId: user.tenantId, userId: user.id, userName: user.fullName };
}

// ============================================================================
// SLUG HELPER
// ============================================================================

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

// ============================================================================
// LIST ATTRIBUTES
// ============================================================================

export async function getAttributes(
    filters: AttributeFilters = {}
): Promise<{ attributes: AttributeListItem[]; stats: AttributeStats; total: number }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        const conditions = [eq(attributes.tenantId, tenantId)];

        // Apply search filter
        if (filters.search) {
            const search = `%${sanitizeSearch(filters.search)}%`;
            conditions.push(or(ilike(attributes.name, search), ilike(attributes.slug, search))!);
        }

        // Apply input type filter
        if (filters.inputType && filters.inputType !== "all") {
            conditions.push(eq(attributes.inputType, filters.inputType));
        }

        // Apply filterable filter
        if (filters.filterableInStorefront !== undefined) {
            conditions.push(eq(attributes.filterableInStorefront, filters.filterableInStorefront));
        }

        // Get count
        const [totalResult] = await db
            .select({ value: count() })
            .from(attributes)
            .where(and(...conditions));

        // Apply sorting
        const sortBy = filters.sortBy || "created_at";
        const sortOrder = filters.sortOrder === "asc";
        const orderCol = sortBy === "name" ? attributes.name : attributes.createdAt;
        const orderFn = sortOrder ? asc(orderCol) : desc(orderCol);

        const rows = await db
            .select()
            .from(attributes)
            .where(and(...conditions))
            .orderBy(orderFn);

        // Get value counts for each attribute
        const attributeIds = rows.map(a => a.id);
        let valueCountMap = new Map<string, number>();
        if (attributeIds.length > 0) {
            const valueCounts = await db
                .select({ attributeId: attributeValues.attributeId, cnt: count() })
                .from(attributeValues)
                .where(inArray(attributeValues.attributeId, attributeIds))
                .groupBy(attributeValues.attributeId);
            valueCounts.forEach(v => valueCountMap.set(v.attributeId, v.cnt));
        }

        // Transform to list items
        const attributeList: AttributeListItem[] = rows.map(attr => ({
            id: attr.id,
            name: attr.name,
            slug: attr.slug,
            inputType: attr.inputType,
            valueRequired: attr.valueRequired ?? false,
            visibleInStorefront: attr.visibleInStorefront ?? true,
            filterableInStorefront: attr.filterableInStorefront ?? false,
            valuesCount: valueCountMap.get(attr.id) || 0,
            usedInProductTypes: attr.usedInProductTypes || 0,
            createdAt: attr.createdAt.toISOString(),
        }));

        // Calculate stats
        const stats = calculateStats(rows.map(r => ({ input_type: r.inputType })));

        return { attributes: attributeList, stats, total: totalResult?.value || 0 };
    } catch (error) {
        log.error("Failed to fetch attributes:", error);
        return { attributes: [], stats: getEmptyStats(), total: 0 };
    }
}

function calculateStats(attributes: { input_type: string }[]): AttributeStats {
    const stats: AttributeStats = {
        total: attributes.length,
        dropdown: 0,
        multiselect: 0,
        text: 0,
        numeric: 0,
        boolean: 0,
        swatch: 0,
        other: 0,
    };

    attributes.forEach(attr => {
        switch (attr.input_type) {
            case "dropdown": stats.dropdown++; break;
            case "multiselect": stats.multiselect++; break;
            case "text": case "rich_text": stats.text++; break;
            case "numeric": stats.numeric++; break;
            case "boolean": stats.boolean++; break;
            case "swatch": stats.swatch++; break;
            default: stats.other++;
        }
    });

    return stats;
}

function getEmptyStats(): AttributeStats {
    return { total: 0, dropdown: 0, multiselect: 0, text: 0, numeric: 0, boolean: 0, swatch: 0, other: 0 };
}

// ============================================================================
// GET ATTRIBUTE DETAIL
// ============================================================================

export async function getAttributeDetail(attributeId: string): Promise<{
    success: boolean;
    data?: Attribute;
    error?: string;
}> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(attributeId, "Attribute ID");
        // Fetch attribute
        const [attribute] = await db
            .select()
            .from(attributes)
            .where(and(eq(attributes.id, attributeId), eq(attributes.tenantId, tenantId)))
            .limit(1);

        if (!attribute) {
            return { success: false, error: "Attribute not found" };
        }

        // Fetch values
        const values = await db
            .select()
            .from(attributeValues)
            .where(eq(attributeValues.attributeId, attributeId))
            .orderBy(asc(attributeValues.sortOrder));

        // Transform to Attribute type
        const attributeData: Attribute = {
            id: attribute.id,
            tenantId: attribute.tenantId,
            name: attribute.name,
            slug: attribute.slug,
            inputType: attribute.inputType,
            entityType: attribute.entityType as Attribute["entityType"],
            unit: attribute.unit as Attribute["unit"],
            valueRequired: attribute.valueRequired ?? false,
            visibleInStorefront: attribute.visibleInStorefront ?? true,
            filterableInStorefront: attribute.filterableInStorefront ?? false,
            filterableInDashboard: attribute.filterableInDashboard ?? true,
            usedInProductTypes: attribute.usedInProductTypes || 0,
            values: values.map(v => ({
                id: v.id,
                attributeId: v.attributeId,
                name: v.name,
                slug: v.slug,
                value: v.value ?? undefined,
                richText: v.richText ?? undefined,
                fileUrl: v.fileUrl ?? undefined,
                swatchColor: v.swatchColor ?? undefined,
                swatchImage: v.swatchImage ?? undefined,
                sortOrder: v.sortOrder ?? 0,
                createdAt: v.createdAt.toISOString(),
            })),
            metadata: (attribute.metadata as Record<string, unknown>) ?? undefined,
            createdAt: attribute.createdAt.toISOString(),
            updatedAt: attribute.updatedAt.toISOString(),
        };

        return { success: true, data: attributeData };
    } catch (error) {
        log.error("Failed to fetch attribute:", error);
        return { success: false, error: "Failed to fetch attribute" };
    }
}

// ============================================================================
// CREATE ATTRIBUTE
// ============================================================================

export async function createAttribute(input: CreateAttributeInput): Promise<{
    success: boolean;
    data?: Attribute;
    error?: string;
}> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        const slug = input.slug || generateSlug(input.name);

        // Check for duplicate slug
        const [existing] = await db
            .select({ id: attributes.id })
            .from(attributes)
            .where(and(eq(attributes.tenantId, tenantId), eq(attributes.slug, slug)))
            .limit(1);

        if (existing) {
            return { success: false, error: "An attribute with this slug already exists" };
        }

        // Create attribute
        const [attribute] = await db
            .insert(attributes)
            .values({
                tenantId,
                name: input.name,
                slug,
                inputType: input.inputType,
                entityType: input.entityType || null,
                unit: input.unit || null,
                valueRequired: input.valueRequired ?? false,
                visibleInStorefront: input.visibleInStorefront ?? true,
                filterableInStorefront: input.filterableInStorefront ?? false,
                filterableInDashboard: input.filterableInDashboard ?? true,
            })
            .returning();

        if (!attribute) {
            return { success: false, error: "Failed to create attribute" };
        }

        // Create values if provided
        if (input.values && input.values.length > 0) {
            const valuesToInsert = input.values.map((v, index) => ({
                tenantId,
                attributeId: attribute.id,
                name: v.name,
                slug: v.slug || generateSlug(v.name),
                value: v.value || null,
                richText: v.richText || null,
                fileUrl: v.fileUrl || null,
                swatchColor: v.swatchColor || null,
                swatchImage: v.swatchImage || null,
                sortOrder: index,
            }));

            await db.insert(attributeValues).values(valuesToInsert);
        }

        revalidatePath("/dashboard/attributes");
        
        // Fetch and return the complete attribute
        return getAttributeDetail(attribute.id);
    } catch (error) {
        log.error("Failed to create attribute:", error);
        return { success: false, error: "Failed to create attribute" };
    }
}

// ============================================================================
// UPDATE ATTRIBUTE
// ============================================================================

export async function updateAttribute(
    attributeId: string,
    input: UpdateAttributeInput
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.slug !== undefined) {
            // Check for duplicate slug
            const [existing] = await db
                .select({ id: attributes.id })
                .from(attributes)
                .where(and(
                    eq(attributes.tenantId, tenantId),
                    eq(attributes.slug, input.slug),
                    ne(attributes.id, attributeId),
                ))
                .limit(1);

            if (existing) {
                return { success: false, error: "An attribute with this slug already exists" };
            }
            updateData.slug = input.slug;
        }
        if (input.valueRequired !== undefined) updateData.valueRequired = input.valueRequired;
        if (input.visibleInStorefront !== undefined) updateData.visibleInStorefront = input.visibleInStorefront;
        if (input.filterableInStorefront !== undefined) updateData.filterableInStorefront = input.filterableInStorefront;
        if (input.filterableInDashboard !== undefined) updateData.filterableInDashboard = input.filterableInDashboard;
        if (input.unit !== undefined) updateData.unit = input.unit;

        await db
            .update(attributes)
            .set(updateData)
            .where(and(eq(attributes.id, attributeId), eq(attributes.tenantId, tenantId)));

        revalidatePath("/dashboard/attributes");
        revalidatePath(`/dashboard/attributes/${attributeId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update attribute:", error);
        return { success: false, error: "Failed to update attribute" };
    }
}

// ============================================================================
// DELETE ATTRIBUTE
// ============================================================================

export async function deleteAttribute(attributeId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(attributeId, "Attribute ID");
        // Check if attribute is used in product types
        const [attribute] = await db
            .select({ usedInProductTypes: attributes.usedInProductTypes })
            .from(attributes)
            .where(and(eq(attributes.id, attributeId), eq(attributes.tenantId, tenantId)))
            .limit(1);

        if (attribute && (attribute.usedInProductTypes || 0) > 0) {
            return { 
                success: false, 
                error: "Cannot delete attribute that is assigned to product types. Remove it from product types first." 
            };
        }

        // Delete values first
        await db
            .delete(attributeValues)
            .where(and(eq(attributeValues.attributeId, attributeId), eq(attributeValues.tenantId, tenantId)));

        // Delete attribute
        await db
            .delete(attributes)
            .where(and(eq(attributes.id, attributeId), eq(attributes.tenantId, tenantId)));

        revalidatePath("/dashboard/attributes");
        return { success: true };
    } catch (error) {
        log.error("Failed to delete attribute:", error);
        return { success: false, error: "Failed to delete attribute" };
    }
}

// ============================================================================
// ATTRIBUTE VALUE ACTIONS
// ============================================================================

export async function addAttributeValue(
    attributeId: string,
    input: AttributeValueInput
): Promise<{ success: boolean; data?: AttributeValue; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        // Get current max sort order
        const [maxOrder] = await db
            .select({ sortOrder: attributeValues.sortOrder })
            .from(attributeValues)
            .where(eq(attributeValues.attributeId, attributeId))
            .orderBy(desc(attributeValues.sortOrder))
            .limit(1);

        const sortOrder = ((maxOrder?.sortOrder) ?? -1) + 1;
        const slug = input.slug || generateSlug(input.name);

        const [value] = await db
            .insert(attributeValues)
            .values({
                tenantId,
                attributeId,
                name: input.name,
                slug,
                value: input.value || null,
                richText: input.richText || null,
                fileUrl: input.fileUrl || null,
                swatchColor: input.swatchColor || null,
                swatchImage: input.swatchImage || null,
                sortOrder,
            })
            .returning();

        if (!value) {
            return { success: false, error: "Failed to add value" };
        }

        revalidatePath(`/dashboard/attributes/${attributeId}`);
        return {
            success: true,
            data: {
                id: value.id,
                attributeId: value.attributeId,
                name: value.name,
                slug: value.slug,
                value: value.value ?? undefined,
                richText: value.richText ?? undefined,
                fileUrl: value.fileUrl ?? undefined,
                swatchColor: value.swatchColor ?? undefined,
                swatchImage: value.swatchImage ?? undefined,
                sortOrder: value.sortOrder ?? 0,
                createdAt: value.createdAt.toISOString(),
            },
        };
    } catch (error) {
        log.error("Failed to add value:", error);
        return { success: false, error: "Failed to add value" };
    }
}

export async function updateAttributeValue(
    valueId: string,
    input: Partial<AttributeValueInput>
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.slug !== undefined) updateData.slug = input.slug;
        if (input.value !== undefined) updateData.value = input.value;
        if (input.richText !== undefined) updateData.richText = input.richText;
        if (input.fileUrl !== undefined) updateData.fileUrl = input.fileUrl;
        if (input.swatchColor !== undefined) updateData.swatchColor = input.swatchColor;
        if (input.swatchImage !== undefined) updateData.swatchImage = input.swatchImage;

        const [value] = await db
            .update(attributeValues)
            .set(updateData)
            .where(and(eq(attributeValues.id, valueId), eq(attributeValues.tenantId, tenantId)))
            .returning({ attributeId: attributeValues.attributeId });

        if (!value) {
            return { success: false, error: "Failed to update value" };
        }

        revalidatePath(`/dashboard/attributes/${value.attributeId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update value:", error);
        return { success: false, error: "Failed to update value" };
    }
}

export async function deleteAttributeValue(valueId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(valueId, "Value ID");
        const [value] = await db
            .select({ attributeId: attributeValues.attributeId })
            .from(attributeValues)
            .where(and(eq(attributeValues.id, valueId), eq(attributeValues.tenantId, tenantId)))
            .limit(1);

        if (!value) {
            return { success: false, error: "Value not found" };
        }

        await db
            .delete(attributeValues)
            .where(and(eq(attributeValues.id, valueId), eq(attributeValues.tenantId, tenantId)));

        revalidatePath(`/dashboard/attributes/${value.attributeId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to delete value:", error);
        return { success: false, error: "Failed to delete value" };
    }
}

export async function reorderAttributeValues(
    attributeId: string,
    valueIds: string[]
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        // Update sort order for each value
        const updates = valueIds.map((id, index) =>
            db
                .update(attributeValues)
                .set({ sortOrder: index })
                .where(and(eq(attributeValues.id, id), eq(attributeValues.tenantId, tenantId)))
        );

        await Promise.all(updates);

        revalidatePath(`/dashboard/attributes/${attributeId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to reorder values:", error);
        return { success: false, error: "Failed to reorder values" };
    }
}

// ============================================================================
// BULK ACTIONS
// ============================================================================

export async function bulkDeleteAttributes(attributeIds: string[]): Promise<{
    success: boolean;
    deleted: number;
    error?: string;
}> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        // Check if any attributes are used in product types
        const usedAttributes = await db
            .select({ id: attributes.id, name: attributes.name, usedInProductTypes: attributes.usedInProductTypes })
            .from(attributes)
            .where(and(
                inArray(attributes.id, attributeIds),
                eq(attributes.tenantId, tenantId),
                gt(attributes.usedInProductTypes, 0),
            ));

        if (usedAttributes.length > 0) {
            const names = usedAttributes.map(a => a.name).join(", ");
            return {
                success: false,
                deleted: 0,
                error: `Cannot delete attributes that are assigned to product types: ${names}`,
            };
        }

        // Delete values first
        await db
            .delete(attributeValues)
            .where(and(inArray(attributeValues.attributeId, attributeIds), eq(attributeValues.tenantId, tenantId)));

        // Delete attributes
        await db
            .delete(attributes)
            .where(and(inArray(attributes.id, attributeIds), eq(attributes.tenantId, tenantId)));

        revalidatePath("/dashboard/attributes");
        return { success: true, deleted: attributeIds.length };
    } catch (error) {
        log.error("Failed to bulk delete:", error);
        return { success: false, deleted: 0, error: "Failed to delete attributes" };
    }
}
