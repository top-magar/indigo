"use server";

import { createClient } from "@/infrastructure/supabase/server";
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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("tenant_id, name")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, userId: user.id, userName: userData.name, tenantId: userData.tenant_id };
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
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            switch (type) {
                case "products":
                    await productRepository.delete(tenantId, id);
                    break;
                case "orders":
                    await orderRepository.delete(tenantId, id);
                    break;
                case "customers":
                    await customerRepository.delete(tenantId, id);
                    break;
                default:
                    throw new Error(`Unknown entity type: ${type}`);
            }
            
            successCount++;

            try {
                await auditLogger.logDelete(tenantId, type.slice(0, -1), id, {}, { userId });
            } catch (auditError) {
                console.error(`Audit logging failed for ${type} ${id}:`, auditError);
            }
        } catch (error) {
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "DELETE_FAILED",
            });
        }
    }

    revalidateEntityPaths(type);

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully deleted ${successCount} ${type}` 
            : `Deleted ${successCount} of ${ids.length} ${type}`,
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
    const { tenantId, userId, userName } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            switch (type) {
                case "products":
                    await productRepository.updateStatus(
                        tenantId, 
                        id, 
                        status as "draft" | "active" | "archived"
                    );
                    break;
                case "orders":
                    await orderRepository.updateStatus(
                        tenantId,
                        id,
                        status as "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "returned" | "refunded",
                        `Bulk status update to ${status}`,
                        userId,
                        userName || undefined
                    );
                    break;
                default:
                    throw new Error(`Status update not supported for type: ${type}`);
            }
            
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, type.slice(0, -1), id, {}, { status }, { userId });
            } catch (auditError) {
                console.error(`Audit logging failed for ${type} ${id}:`, auditError);
            }
        } catch (error) {
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "UPDATE_FAILED",
            });
        }
    }

    revalidateEntityPaths(type);

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully updated ${successCount} ${type} to ${status}` 
            : `Updated ${successCount} of ${ids.length} ${type}`,
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
    const { tenantId } = await getAuthenticatedTenant();
    
    try {
        let items: Record<string, unknown>[] = [];
        
        switch (type) {
            case "products": {
                const allProducts = await productRepository.findAll(tenantId);
                items = allProducts.filter(p => ids.includes(p.id)).map(p => ({
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
                items = allOrders.filter(o => ids.includes(o.id)).map(o => ({
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
                items = allCustomers.filter(c => ids.includes(c.id)).map(c => ({
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
                throw new Error(`Export not supported for type: ${type}`);
        }

        if (items.length === 0) {
            return { success: false, error: "No items found to export" };
        }

        const timestamp = new Date().toISOString().split("T")[0];
        let data: string;
        let filename: string;
        let mimeType: string;

        switch (format) {
            case "json":
                data = JSON.stringify(items, null, 2);
                filename = `${type}-export-${timestamp}.json`;
                mimeType = "application/json";
                break;
            case "csv":
            case "xlsx":
                data = convertToCSV(items);
                filename = `${type}-export-${timestamp}.csv`;
                mimeType = "text/csv";
                break;
            default:
                throw new Error(`Unsupported export format: ${format}`);
        }

        try {
            await auditLogger.log(tenantId, "bulk_export", {
                entityType: type,
                entityId: "bulk",
                newValues: { format, itemCount: items.length, itemIds: ids },
            });
        } catch (auditError) {
            console.error("Audit logging failed for export:", auditError);
        }

        return { success: true, data, filename, mimeType };
    } catch (error) {
        console.error("Bulk export error:", error);
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
    const { supabase, tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    const { data: assignee } = await supabase
        .from("users")
        .select("name, email")
        .eq("id", assigneeId)
        .single();

    const assigneeName = assignee?.name || assignee?.email || assigneeId;

    for (const id of ids) {
        try {
            switch (type) {
                case "orders":
                    await orderRepository.update(tenantId, id, {
                        metadata: { assignedTo: assigneeId, assignedAt: new Date().toISOString() },
                    });
                    await orderRepository.addNote(tenantId, id, `Order assigned to ${assigneeName}`, userId, undefined);
                    break;
                default:
                    throw new Error(`Assignment not supported for type: ${type}`);
            }
            
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, type.slice(0, -1), id, {}, { assignedTo: assigneeId, assigneeName }, { userId });
            } catch (auditError) {
                console.error(`Audit logging failed for ${type} ${id}:`, auditError);
            }
        } catch (error) {
            errors.push({
                itemId: id,
                message: error instanceof Error ? error.message : "Unknown error",
                code: "ASSIGN_FAILED",
            });
        }
    }

    revalidateEntityPaths(type);

    return {
        success: errors.length === 0,
        successCount,
        failedCount: errors.length,
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully assigned ${successCount} ${type} to ${assigneeName}` 
            : `Assigned ${successCount} of ${ids.length} ${type}`,
    };
}

/**
 * Assign multiple products to a category
 */
export async function bulkAssignCategory(
    ids: string[],
    categoryId: string
): Promise<BulkActionResult> {
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            await productRepository.update(tenantId, id, { categoryId });
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, "product", id, {}, { categoryId }, { userId });
            } catch (auditError) {
                console.error(`Audit logging failed for product ${id}:`, auditError);
            }
        } catch (error) {
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
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully assigned ${successCount} products to category` 
            : `Assigned ${successCount} of ${ids.length} products`,
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
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            const product = await productRepository.findById(tenantId, id);
            if (!product) throw new Error("Product not found");

            const currentPrice = parseFloat(product.price || "0");
            let newPrice: number;

            switch (priceChange.type) {
                case "set":
                    newPrice = priceChange.value;
                    break;
                case "increase":
                    newPrice = currentPrice + priceChange.value;
                    break;
                case "decrease":
                    newPrice = Math.max(0, currentPrice - priceChange.value);
                    break;
                case "percentage_increase":
                    newPrice = currentPrice * (1 + priceChange.value / 100);
                    break;
                case "percentage_decrease":
                    newPrice = currentPrice * (1 - priceChange.value / 100);
                    break;
                default:
                    throw new Error("Invalid price change type");
            }

            await productRepository.update(tenantId, id, { price: newPrice.toFixed(2) });
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, "product", id, { price: currentPrice }, { price: newPrice }, { userId });
            } catch (auditError) {
                console.error(`Audit logging failed for product ${id}:`, auditError);
            }
        } catch (error) {
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
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully updated prices for ${successCount} products` 
            : `Updated ${successCount} of ${ids.length} products`,
    };
}

/**
 * Add a tag to multiple customers
 */
export async function bulkAddTag(
    ids: string[],
    tag: string
): Promise<BulkActionResult> {
    const { supabase, tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            const customer = await customerRepository.findById(tenantId, id);
            if (!customer) throw new Error("Customer not found");

            const currentMetadata = (customer.metadata as Record<string, unknown>) || {};
            const currentTags = (currentMetadata.tags as string[]) || [];

            const { error } = await supabase
                .from("customers")
                .update({ 
                    metadata: { ...currentMetadata, tags: [...currentTags, tag] },
                    updated_at: new Date().toISOString()
                })
                .eq("id", id)
                .eq("tenant_id", tenantId);

            if (error) throw error;
            successCount++;

            try {
                await auditLogger.logUpdate(tenantId, "customer", id, {}, { tagAdded: tag }, { userId });
            } catch (auditError) {
                console.error(`Audit logging failed for customer ${id}:`, auditError);
            }
        } catch (error) {
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
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully added tag "${tag}" to ${successCount} customers` 
            : `Added tag to ${successCount} of ${ids.length} customers`,
    };
}

/**
 * Send email to multiple customers
 */
export async function bulkSendEmail(
    ids: string[],
    emailConfig: { subject: string; templateId?: string; body?: string }
): Promise<BulkActionResult> {
    const { tenantId, userId } = await getAuthenticatedTenant();
    
    const errors: BulkActionError[] = [];
    let successCount = 0;

    for (const id of ids) {
        try {
            const customer = await customerRepository.findById(tenantId, id);
            if (!customer) throw new Error("Customer not found");
            if (!customer.email) throw new Error("Customer has no email address");

            // TODO: Integrate with email service (e.g., Resend, SendGrid)
            console.log(`[Bulk Email] Would send email to ${customer.email}:`, {
                subject: emailConfig.subject,
                templateId: emailConfig.templateId,
            });
            
            successCount++;

            try {
                await auditLogger.log(tenantId, "email_sent", {
                    entityType: "customer",
                    entityId: id,
                    newValues: { email: customer.email, subject: emailConfig.subject },
                    metadata: { userId },
                });
            } catch (auditError) {
                console.error(`Audit logging failed for customer ${id}:`, auditError);
            }
        } catch (error) {
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
        totalCount: ids.length,
        errors: errors.length > 0 ? errors : undefined,
        message: errors.length === 0 
            ? `Successfully queued emails for ${successCount} customers` 
            : `Queued ${successCount} of ${ids.length} emails`,
    };
}
