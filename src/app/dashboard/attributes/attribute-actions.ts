"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, full_name")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, tenantId: userData.tenant_id, userId: user.id, userName: userData.full_name };
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        let query = supabase
            .from("attributes")
            .select("*", { count: "exact" })
            .eq("tenant_id", tenantId);

        // Apply search filter
        if (filters.search) {
            query = query.or(`name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
        }

        // Apply input type filter
        if (filters.inputType && filters.inputType !== "all") {
            query = query.eq("input_type", filters.inputType);
        }

        // Apply filterable filter
        if (filters.filterableInStorefront !== undefined) {
            query = query.eq("filterable_in_storefront", filters.filterableInStorefront);
        }

        // Apply sorting
        const sortBy = filters.sortBy || "created_at";
        const sortOrder = filters.sortOrder === "asc";
        query = query.order(sortBy, { ascending: sortOrder });

        const { data: attributes, count, error } = await query;

        if (error) {
            console.error("Error fetching attributes:", error);
            return { attributes: [], stats: getEmptyStats(), total: 0 };
        }

        // Get value counts for each attribute
        const attributeIds = attributes?.map(a => a.id) || [];
        const { data: valueCounts } = await supabase
            .from("attribute_values")
            .select("attribute_id")
            .in("attribute_id", attributeIds.length > 0 ? attributeIds : ["none"]);

        const valueCountMap = new Map<string, number>();
        valueCounts?.forEach(v => {
            valueCountMap.set(v.attribute_id, (valueCountMap.get(v.attribute_id) || 0) + 1);
        });

        // Transform to list items
        const attributeList: AttributeListItem[] = (attributes || []).map(attr => ({
            id: attr.id,
            name: attr.name,
            slug: attr.slug,
            inputType: attr.input_type,
            valueRequired: attr.value_required,
            visibleInStorefront: attr.visible_in_storefront,
            filterableInStorefront: attr.filterable_in_storefront,
            valuesCount: valueCountMap.get(attr.id) || 0,
            usedInProductTypes: attr.used_in_product_types || 0,
            createdAt: attr.created_at,
        }));

        // Calculate stats
        const stats = calculateStats(attributes || []);

        return { attributes: attributeList, stats, total: count || 0 };
    } catch (error) {
        console.error("Failed to fetch attributes:", error);
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Fetch attribute
        const { data: attribute, error: attrError } = await supabase
            .from("attributes")
            .select("*")
            .eq("id", attributeId)
            .eq("tenant_id", tenantId)
            .single();

        if (attrError || !attribute) {
            return { success: false, error: "Attribute not found" };
        }

        // Fetch values
        const { data: values } = await supabase
            .from("attribute_values")
            .select("*")
            .eq("attribute_id", attributeId)
            .order("sort_order", { ascending: true });

        // Transform to Attribute type
        const attributeData: Attribute = {
            id: attribute.id,
            tenantId: attribute.tenant_id,
            name: attribute.name,
            slug: attribute.slug,
            inputType: attribute.input_type,
            entityType: attribute.entity_type,
            unit: attribute.unit,
            valueRequired: attribute.value_required,
            visibleInStorefront: attribute.visible_in_storefront,
            filterableInStorefront: attribute.filterable_in_storefront,
            filterableInDashboard: attribute.filterable_in_dashboard,
            usedInProductTypes: attribute.used_in_product_types || 0,
            values: (values || []).map(v => ({
                id: v.id,
                attributeId: v.attribute_id,
                name: v.name,
                slug: v.slug,
                value: v.value,
                richText: v.rich_text,
                fileUrl: v.file_url,
                swatchColor: v.swatch_color,
                swatchImage: v.swatch_image,
                sortOrder: v.sort_order,
                createdAt: v.created_at,
            })),
            metadata: attribute.metadata,
            createdAt: attribute.created_at,
            updatedAt: attribute.updated_at,
        };

        return { success: true, data: attributeData };
    } catch (error) {
        console.error("Failed to fetch attribute:", error);
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const slug = input.slug || generateSlug(input.name);

        // Check for duplicate slug
        const { data: existing } = await supabase
            .from("attributes")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("slug", slug)
            .single();

        if (existing) {
            return { success: false, error: "An attribute with this slug already exists" };
        }

        // Create attribute
        const { data: attribute, error: createError } = await supabase
            .from("attributes")
            .insert({
                tenant_id: tenantId,
                name: input.name,
                slug,
                input_type: input.inputType,
                entity_type: input.entityType || null,
                unit: input.unit || null,
                value_required: input.valueRequired ?? false,
                visible_in_storefront: input.visibleInStorefront ?? true,
                filterable_in_storefront: input.filterableInStorefront ?? false,
                filterable_in_dashboard: input.filterableInDashboard ?? true,
            })
            .select()
            .single();

        if (createError || !attribute) {
            return { success: false, error: "Failed to create attribute" };
        }

        // Create values if provided
        if (input.values && input.values.length > 0) {
            const valuesToInsert = input.values.map((v, index) => ({
                tenant_id: tenantId,
                attribute_id: attribute.id,
                name: v.name,
                slug: v.slug || generateSlug(v.name),
                value: v.value || null,
                rich_text: v.richText || null,
                file_url: v.fileUrl || null,
                swatch_color: v.swatchColor || null,
                swatch_image: v.swatchImage || null,
                sort_order: index,
            }));

            await supabase.from("attribute_values").insert(valuesToInsert);
        }

        revalidatePath("/dashboard/attributes");
        
        // Fetch and return the complete attribute
        return getAttributeDetail(attribute.id);
    } catch (error) {
        console.error("Failed to create attribute:", error);
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (input.name !== undefined) updateData.name = input.name;
        if (input.slug !== undefined) {
            // Check for duplicate slug
            const { data: existing } = await supabase
                .from("attributes")
                .select("id")
                .eq("tenant_id", tenantId)
                .eq("slug", input.slug)
                .neq("id", attributeId)
                .single();

            if (existing) {
                return { success: false, error: "An attribute with this slug already exists" };
            }
            updateData.slug = input.slug;
        }
        if (input.valueRequired !== undefined) updateData.value_required = input.valueRequired;
        if (input.visibleInStorefront !== undefined) updateData.visible_in_storefront = input.visibleInStorefront;
        if (input.filterableInStorefront !== undefined) updateData.filterable_in_storefront = input.filterableInStorefront;
        if (input.filterableInDashboard !== undefined) updateData.filterable_in_dashboard = input.filterableInDashboard;
        if (input.unit !== undefined) updateData.unit = input.unit;

        const { error } = await supabase
            .from("attributes")
            .update(updateData)
            .eq("id", attributeId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update attribute" };
        }

        revalidatePath("/dashboard/attributes");
        revalidatePath(`/dashboard/attributes/${attributeId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update attribute:", error);
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Check if attribute is used in product types
        const { data: attribute } = await supabase
            .from("attributes")
            .select("used_in_product_types")
            .eq("id", attributeId)
            .eq("tenant_id", tenantId)
            .single();

        if (attribute?.used_in_product_types > 0) {
            return { 
                success: false, 
                error: "Cannot delete attribute that is assigned to product types. Remove it from product types first." 
            };
        }

        // Delete values first
        await supabase
            .from("attribute_values")
            .delete()
            .eq("attribute_id", attributeId);

        // Delete attribute
        const { error } = await supabase
            .from("attributes")
            .delete()
            .eq("id", attributeId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete attribute" };
        }

        revalidatePath("/dashboard/attributes");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete attribute:", error);
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get current max sort order
        const { data: maxOrder } = await supabase
            .from("attribute_values")
            .select("sort_order")
            .eq("attribute_id", attributeId)
            .order("sort_order", { ascending: false })
            .limit(1)
            .single();

        const sortOrder = (maxOrder?.sort_order ?? -1) + 1;
        const slug = input.slug || generateSlug(input.name);

        const { data: value, error } = await supabase
            .from("attribute_values")
            .insert({
                tenant_id: tenantId,
                attribute_id: attributeId,
                name: input.name,
                slug,
                value: input.value || null,
                rich_text: input.richText || null,
                file_url: input.fileUrl || null,
                swatch_color: input.swatchColor || null,
                swatch_image: input.swatchImage || null,
                sort_order: sortOrder,
            })
            .select()
            .single();

        if (error || !value) {
            return { success: false, error: "Failed to add value" };
        }

        revalidatePath(`/dashboard/attributes/${attributeId}`);
        return {
            success: true,
            data: {
                id: value.id,
                attributeId: value.attribute_id,
                name: value.name,
                slug: value.slug,
                value: value.value,
                richText: value.rich_text,
                fileUrl: value.file_url,
                swatchColor: value.swatch_color,
                swatchImage: value.swatch_image,
                sortOrder: value.sort_order,
                createdAt: value.created_at,
            },
        };
    } catch (error) {
        console.error("Failed to add value:", error);
        return { success: false, error: "Failed to add value" };
    }
}

export async function updateAttributeValue(
    valueId: string,
    input: Partial<AttributeValueInput>
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const updateData: Record<string, unknown> = {};
        if (input.name !== undefined) updateData.name = input.name;
        if (input.slug !== undefined) updateData.slug = input.slug;
        if (input.value !== undefined) updateData.value = input.value;
        if (input.richText !== undefined) updateData.rich_text = input.richText;
        if (input.fileUrl !== undefined) updateData.file_url = input.fileUrl;
        if (input.swatchColor !== undefined) updateData.swatch_color = input.swatchColor;
        if (input.swatchImage !== undefined) updateData.swatch_image = input.swatchImage;

        const { data: value, error } = await supabase
            .from("attribute_values")
            .update(updateData)
            .eq("id", valueId)
            .eq("tenant_id", tenantId)
            .select("attribute_id")
            .single();

        if (error || !value) {
            return { success: false, error: "Failed to update value" };
        }

        revalidatePath(`/dashboard/attributes/${value.attribute_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update value:", error);
        return { success: false, error: "Failed to update value" };
    }
}

export async function deleteAttributeValue(valueId: string): Promise<{
    success: boolean;
    error?: string;
}> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { data: value, error: fetchError } = await supabase
            .from("attribute_values")
            .select("attribute_id")
            .eq("id", valueId)
            .eq("tenant_id", tenantId)
            .single();

        if (fetchError || !value) {
            return { success: false, error: "Value not found" };
        }

        const { error } = await supabase
            .from("attribute_values")
            .delete()
            .eq("id", valueId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete value" };
        }

        revalidatePath(`/dashboard/attributes/${value.attribute_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete value:", error);
        return { success: false, error: "Failed to delete value" };
    }
}

export async function reorderAttributeValues(
    attributeId: string,
    valueIds: string[]
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Update sort order for each value
        const updates = valueIds.map((id, index) =>
            supabase
                .from("attribute_values")
                .update({ sort_order: index })
                .eq("id", id)
                .eq("tenant_id", tenantId)
        );

        await Promise.all(updates);

        revalidatePath(`/dashboard/attributes/${attributeId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to reorder values:", error);
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
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Check if any attributes are used in product types
        const { data: usedAttributes } = await supabase
            .from("attributes")
            .select("id, name, used_in_product_types")
            .in("id", attributeIds)
            .eq("tenant_id", tenantId)
            .gt("used_in_product_types", 0);

        if (usedAttributes && usedAttributes.length > 0) {
            const names = usedAttributes.map(a => a.name).join(", ");
            return {
                success: false,
                deleted: 0,
                error: `Cannot delete attributes that are assigned to product types: ${names}`,
            };
        }

        // Delete values first
        await supabase
            .from("attribute_values")
            .delete()
            .in("attribute_id", attributeIds);

        // Delete attributes
        const { error, count } = await supabase
            .from("attributes")
            .delete()
            .in("id", attributeIds)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, deleted: 0, error: "Failed to delete attributes" };
        }

        revalidatePath("/dashboard/attributes");
        return { success: true, deleted: count || attributeIds.length };
    } catch (error) {
        console.error("Failed to bulk delete:", error);
        return { success: false, deleted: 0, error: "Failed to delete attributes" };
    }
}
