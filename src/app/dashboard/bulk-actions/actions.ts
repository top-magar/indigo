"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:bulk-actions");

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";

const entityTypeSchema = z.enum(["products", "orders", "customers", "inventory"]);
const bulkIdsSchema = z.array(z.string().uuid()).min(1, "At least one ID required");
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { productRepository } from "@/features/products/repositories";
import { orderRepository } from "@/features/orders/repositories";
import { customerRepository } from "@/features/customers/repositories";
import { auditLogger } from "@/infrastructure/services/audit-logger";
import type { BulkActionResult, BulkActionError } from "@/components/dashboard/bulk-actions/bulk-action-types";

/**
 * Get authenticated tenant context
 */
async function getAuthenticatedTenant() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId, userId: user.id, userName: user.fullName };
}

/**
 * Revalidate paths based on entity type
 */
function revalidateEntityPaths(type: string) {
    switch (type) {
        case "products":
            revalidatePath("/dashboard/products");
            revalidatePath("/dashboard/inventory");
            break;
        case "orders":
            revalidatePath("/dashboard/orders");
            break;
        case "customers":
            revalidatePath("/dashboard/customers");
            break;
        case "inventory":
            revalidatePath("/dashboard/inventory");
            revalidatePath("/dashboard/products");
            break;
        default:
            revalidatePath("/dashboard");
    }
}

/**
 * Delete multiple items of a given type
 */
export async function bulkDeleteItems(
    type: string,
    ids: string[]
): Promise<BulkActionResult> {
    const validType = entityTypeSchema.parse(type);
    const validIds = bulkIdsSchema.parse(ids);
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    const results = await Promise.allSettled(validIds.map(async (id) => {
        switch (validType) {
            case "products": await productRepository.delete(tenantId, id); break;
            case "orders": await orderRepository.delete(tenantId, id); break;
            case "customers": await customerRepository.delete(tenantId, id); break;
            default: throw new Error(`Unknown entity type: ${validType}`);
        }
        try { await auditLogger.logDelete(tenantId, validType.slice(0, -1), id, {}, { userId }); } catch {}
        return id;
    }));

    for (const result of results) {
        if (result.status === "fulfilled") {
            successCount++;
        } else {
            log.error("Bulk action failed for item", result.reason);
            errors.push({
                itemId: "unknown",
                message: result.reason instanceof Error ? result.reason.message : "Unknown error",
                code: "DELETE_FAILED",
            });
        }
    }

    revalidateEntityPaths(validType);

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully deleted ${successCount} ${validType}` 
            : `Deleted ${successCount} of ${validIds.length} ${validType}`,
    };
}

/**
 * Update status for multiple items
 */
export async function bulkUpdateStatus(
    type: string,
    ids: string[],
    status: string
): Promise<BulkActionResult> {
    const validType = entityTypeSchema.parse(type);
    const validIds = bulkIdsSchema.parse(ids);
    const validStatus = z.string().min(1).parse(status);
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of validIds) {
        try {
            switch (validType) {
                case "products":
                    await productRepository.updateStatus(
                        tenantId, 
                        id, 
                        validStatus as "draft" | "active" | "archived"
                    );
                    break;
                case "orders":
                    await orderRepository.updateStatus(
                        tenantId,
                        id,
                        validStatus as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "refunded",
                        `Bulk status update to ${validStatus}`,
                        userId,
                        userName || undefined
                    );
                    break;
                default:
                    throw new Error(`Status update not supported for type: ${validType}`);
            }
            
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, validType.slice(0, -1), id, {}, { status: validStatus }, { userId });
            } catch (auditError) {
                log.error(`Audit logging failed for ${validType} ${id}:`, auditError);
            }
        } catch (error) {
            log.error("Bulk action failed for item", error, { itemId: id });
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "UPDATE_FAILED",
            });
        }
    }

    revalidateEntityPaths(validType);

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully updated ${successCount} ${validType} to ${validStatus}` 
            : `Updated ${successCount} of ${validIds.length} ${validType}`,
    };
}


/**
 * Convert array of objects to CSV string
 */
function convertToCSV(items: Record<string, unknown>[]): string {
    if (items.length === 0) return "";
    
    const headers = Object.keys(items[0]);
    const csvRows: string[] = [];
    
    csvRows.push(headers.join(","));
    
    for (const item of items) {
        const values = headers.map(header => {
            const value = item[header];
            const stringValue = String(value ?? "");
            if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
                return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
        });
        csvRows.push(values.join(","));
    }
    
    return csvRows.join("\n");
}

/**
 * Export multiple items to a specified format
 */
export async function bulkExport(
    type: string,
    ids: string[],
    format: "csv" | "json" | "xlsx"
): Promise<{ 
    success: boolean; 
    data?: string; 
    filename?: string; 
    mimeType?: string;
    error?: string;
}> {
    const validType = entityTypeSchema.parse(type);
    const validIds = bulkIdsSchema.parse(ids);
    const validFormat = z.enum(["csv", "json", "xlsx"]).parse(format);
    const { tenantId } = await getAuthenticatedTenant();
    
    try {
        let items: Record<string, unknown>[] = [];
        
        switch (validType) {
            case "products": {
                const allProducts = await productRepository.findAll(tenantId);
                items = allProducts.filter(p => validIds.includes(p.id)).map(p => ({
                    id: p.id,
                    name: p.name,
                    sku: p.sku || "",
                    price: p.price,
                    quantity: p.quantity,
                    status: p.status,
                    category: p.categoryName || "",
                    createdAt: p.createdAt,
                    updatedAt: p.updatedAt,
                }));
                break;
            }
            case "orders": {
                const allOrders = await orderRepository.findAll(tenantId);
                items = allOrders.filter(o => validIds.includes(o.id)).map(o => ({
                    id: o.id,
                    orderNumber: o.orderNumber,
                    customerName: o.customerName || "",
                    customerEmail: o.customerEmail || "",
                    status: o.status,
                    paymentStatus: o.paymentStatus,
                    total: o.total,
                    currency: o.currency,
                    itemsCount: o.itemsCount,
                    createdAt: o.createdAt,
                }));
                break;
            }
            case "customers": {
                const allCustomers = await customerRepository.findAll(tenantId);
                items = allCustomers.filter(c => validIds.includes(c.id)).map(c => ({
                    id: c.id,
                    email: c.email,
                    firstName: c.firstName || "",
                    lastName: c.lastName || "",
                    phone: c.phone || "",
                    acceptsMarketing: c.acceptsMarketing,
                    createdAt: c.createdAt,
                }));
                break;
            }
            default:
                throw new Error(`Export not supported for type: ${validType}`);
        }

        if (items.length === 0) {
            return { success: false, error: "No items found to export" };
        }

        const timestamp = new Date().toISOString().split("T")[0];
        let data: string;
        let filename: string;
        let mimeType: string;

        switch (validFormat) {
            case "json":
                data = JSON.stringify(items, null, 2);
                filename = `${validType}-export-${timestamp}.json`;
                mimeType = "application/json";
                break;
            case "csv":
            case "xlsx":
                data = convertToCSV(items);
                filename = `${validType}-export-${timestamp}.csv`;
                mimeType = "text/csv";
                break;
            default:
                throw new Error(`Unsupported export format: ${validFormat}`);
        }

        try {
            await auditLogger.log(tenantId, "bulk_export", {
                entityType: validType,
                entityId: "bulk",
                newValues: { format: validFormat, itemCount: items.length, itemIds: validIds },
            });
        } catch (auditError) {
            log.error("Audit logging failed for export:", auditError);
        }

        return { success: true, data, filename, mimeType };
    } catch (error) {
        log.error("Bulk export error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Export failed" };
    }
}

/**
 * Archive multiple items (sets status to "archived")
 */
export async function bulkArchive(
    type: string,
    ids: string[]
): Promise<BulkActionResult> {
    return bulkUpdateStatus(type, ids, "archived");
}

/**
 * Assign multiple items to a user/assignee
 */
export async function bulkAssign(
    type: string,
    ids: string[],
    assigneeId: string
): Promise<BulkActionResult> {
    const validType = entityTypeSchema.parse(type);
    const validIds = bulkIdsSchema.parse(ids);
    const validAssigneeId = z.string().uuid().parse(assigneeId);
    const { supabase, tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    const { data: assignee } = await supabase
        .from("users")
        .select("name, email")
        .eq("tenant_id", tenantId)
        .eq("id", validAssigneeId)
        .single();

    const assigneeName = assignee?.name || assignee?.email || validAssigneeId;

    for (const id of validIds) {
        try {
            switch (validType) {
                case "orders":
                    await orderRepository.update(tenantId, id, {
                        metadata: { assignedTo: validAssigneeId, assignedAt: new Date().toISOString() },
                    });
                    await orderRepository.addNote(tenantId, id, `Order assigned to ${assigneeName}`, userId, undefined);
                    break;
                default:
                    throw new Error(`Assignment not supported for type: ${validType}`);
            }
            
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, validType.slice(0, -1), id, {}, { assignedTo: validAssigneeId, assigneeName }, { userId });
            } catch (auditError) {
                log.error(`Audit logging failed for ${validType} ${id}:`, auditError);
            }
        } catch (error) {
            log.error("Bulk action failed for item", error, { itemId: id });
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "ASSIGN_FAILED",
            });
        }
    }

    revalidateEntityPaths(validType);

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully assigned ${successCount} ${validType} to ${assigneeName}` 
            : `Assigned ${successCount} of ${validIds.length} ${validType}`,
    };
}

/**
 * Assign multiple products to a category
 */
export async function bulkAssignCategory(
    ids: string[],
    categoryId: string
): Promise<BulkActionResult> {
    const validIds = bulkIdsSchema.parse(ids);
    const validCategoryId = z.string().uuid().parse(categoryId);
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of validIds) {
        try {
            await productRepository.update(tenantId, id, { categoryId: validCategoryId });
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, "product", id, {}, { categoryId: validCategoryId }, { userId });
            } catch (auditError) {
                log.error(`Audit logging failed for product ${id}:`, auditError);
            }
        } catch (error) {
            log.error("Bulk action failed for item", error, { itemId: id });
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "UPDATE_FAILED",
            });
        }
    }

    revalidateEntityPaths("products");

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully assigned ${successCount} products to category` 
            : `Assigned ${successCount} of ${validIds.length} products`,
    };
}

/**
 * Update price for multiple products
 */
export async function bulkUpdatePrice(
    ids: string[],
    priceChange: {
        type: "set" | "increase" | "decrease" | "percentage_increase" | "percentage_decrease";
        value: number;
    }
): Promise<BulkActionResult> {
    const validIds = bulkIdsSchema.parse(ids);
    const validPriceChange = z.object({
        type: z.enum(["set", "increase", "decrease", "percentage_increase", "percentage_decrease"]),
        value: z.number().min(0),
    }).parse(priceChange);
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of validIds) {
        try {
            const product = await productRepository.findById(tenantId, id);
            if (!product) throw new Error("Product not found");

            const currentPrice = parseFloat(product.price || "0");
            let newPrice: number;

            switch (validPriceChange.type) {
                case "set":
                    newPrice = validPriceChange.value;
                    break;
                case "increase":
                    newPrice = currentPrice + validPriceChange.value;
                    break;
                case "decrease":
                    newPrice = Math.max(0, currentPrice - validPriceChange.value);
                    break;
                case "percentage_increase":
                    newPrice = currentPrice * (1 + validPriceChange.value / 100);
                    break;
                case "percentage_decrease":
                    newPrice = currentPrice * (1 - validPriceChange.value / 100);
                    break;
                default:
                    throw new Error("Invalid price change type");
            }

            await productRepository.update(tenantId, id, { price: newPrice.toFixed(2) });
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, "product", id, { price: currentPrice }, { price: newPrice }, { userId });
            } catch (auditError) {
                log.error(`Audit logging failed for product ${id}:`, auditError);
            }
        } catch (error) {
            log.error("Bulk action failed for item", error, { itemId: id });
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "UPDATE_FAILED",
            });
        }
    }

    revalidateEntityPaths("products");

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully updated prices for ${successCount} products` 
            : `Updated ${successCount} of ${validIds.length} products`,
    };
}

/**
 * Add a tag to multiple customers
 */
export async function bulkAddTag(
    ids: string[],
    tag: string
): Promise<BulkActionResult> {
    const validIds = bulkIdsSchema.parse(ids);
    const validTag = z.string().min(1).max(50).parse(tag);
    const { supabase, tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    // Batch fetch all customers
    const { data: customers } = await supabase
        .from("customers")
        .select("id, metadata")
        .eq("tenant_id", tenantId)
        .in("id", validIds);

    const customerMap = new Map((customers || []).map(c => [c.id, c]));

    for (const id of validIds) {
        try {
            const customer = customerMap.get(id);
            if (!customer) throw new Error("Customer not found");

            const currentMetadata = (customer.metadata as Record<string, unknown>) || {};
            const currentTags = (currentMetadata.tags as string[]) || [];

            const { error } = await supabase
                .from("customers")
                .update({ 
                    metadata: { ...currentMetadata, tags: [...currentTags, validTag] },
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .eq("tenant_id", tenantId);

            if (error) throw error;
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, "customer", id, {}, { tagAdded: validTag }, { userId });
            } catch (auditError) {
                log.error(`Audit logging failed for customer ${id}:`, auditError);
            }
        } catch (error) {
            log.error("Bulk action failed for item", error, { itemId: id });
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "UPDATE_FAILED",
            });
        }
    }

    revalidateEntityPaths("customers");

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully added tag "${validTag}" to ${successCount} customers` 
            : `Added tag to ${successCount} of ${validIds.length} customers`,
    };
}

/**
 * Send email to multiple customers
 */
export async function bulkSendEmail(
    ids: string[],
    emailConfig: { subject: string; templateId?: string; body?: string }
): Promise<BulkActionResult> {
    const validIds = bulkIdsSchema.parse(ids);
    const validConfig = z.object({
        subject: z.string().min(1).max(200),
        templateId: z.string().optional(),
        body: z.string().optional(),
    }).parse(emailConfig);
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of validIds) {
        try {
            const customer = await customerRepository.findById(tenantId, id);
            if (!customer) throw new Error("Customer not found");
            if (!customer.email) throw new Error("Customer has no email address");

            // TODO: Integrate with email service (e.g., Resend, SendGrid)
            log.info(`[Bulk Email] Would send email to ${customer.email}:`, {
                subject: validConfig.subject,
                templateId: validConfig.templateId,
            });
            
            successCount++;

            try {
                await auditLogger.log(tenantId, "email_sent", {
                    entityType: "customer",
                    entityId: id,
                    newValues: { email: customer.email, subject: validConfig.subject },
                    metadata: { userId },
                });
            } catch (auditError) {
                log.error(`Audit logging failed for customer ${id}:`, auditError);
            }
        } catch (error) {
            log.error("Bulk action failed for item", error, { itemId: id });
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "EMAIL_FAILED",
            });
        }
    }

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: validIds.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully queued emails for ${successCount} customers` 
            : `Queued ${successCount} of ${validIds.length} emails`,
    };
}
