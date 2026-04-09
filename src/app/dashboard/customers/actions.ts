"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("actions:customers");

import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { getAuthenticatedClient } from "@/lib/auth";
import { customerRepository } from "@/features/customers/repositories";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auditLogger } from "@/infrastructure/services/audit-logger";

async function getAuthenticatedUser() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, user, tenantId: user.tenantId, tenant: null as any };
}

import type { CustomerWithStats, CustomerListStats as CustomerStats } from "./types";

export async function getCustomersWithStats(
    page: number = 1,
    pageSize: number = 20,
    filters: {
        search?: string;
        status?: string;
        marketing?: string;
        sortBy?: string;
        sortOrder?: string;
    } = {}
): Promise<{
    customers: CustomerWithStats[];
    stats: CustomerStats;
    totalCount: number;
}> {
    const { supabase, tenantId } = await getAuthenticatedUser();

    const offset = (page - 1) * pageSize;

    // Use repository methods based on filters
    let customersData;
    
    if (filters.search) {
        // Use search method when search filter is provided
        customersData = await customerRepository.search(tenantId, filters.search, {
            limit: pageSize,
            offset,
        });
    } else {
        // Use findAll for regular listing
        customersData = await customerRepository.findAll(tenantId, {
            limit: pageSize,
            offset,
        });
    }

    // Apply marketing filter (repository doesn't have this built-in, so filter in memory)
    if (filters.marketing === "subscribed") {
        customersData = customersData.filter(c => c.acceptsMarketing === true);
    } else if (filters.marketing === "unsubscribed") {
        customersData = customersData.filter(c => c.acceptsMarketing === false);
    }

    // Get order stats for each customer using Supabase (repository doesn't have bulk order stats)
    const customerIds = customersData.map(c => c.id);
    
    const { data: orderStats } = await supabase
        .from("orders")
        .select("customer_id, total, created_at")
        .eq("tenant_id", tenantId)
        .in("customer_id", customerIds.length > 0 ? customerIds : ["none"])
        .eq("payment_status", "paid");

    // Calculate stats per customer
    const customerStatsMap = new Map<string, { count: number; total: number; lastDate: string | null }>();
    
    orderStats?.forEach(order => {
        if (!order.customer_id) return;
        const existing = customerStatsMap.get(order.customer_id) || { count: 0, total: 0, lastDate: null };
        existing.count += 1;
        existing.total += order.total;
        if (!existing.lastDate || order.created_at > existing.lastDate) {
            existing.lastDate = order.created_at;
        }
        customerStatsMap.set(order.customer_id, existing);
    });

    // Merge customer data with stats
    const customersWithStats: CustomerWithStats[] = customersData.map(customer => {
        const stats = customerStatsMap.get(customer.id) || { count: 0, total: 0, lastDate: null };
        return {
            id: customer.id,
            email: customer.email,
            first_name: customer.firstName,
            last_name: customer.lastName,
            phone: customer.phone,
            accepts_marketing: customer.acceptsMarketing ?? false,
            metadata: (customer.metadata as Record<string, unknown>) || {},
            created_at: customer.createdAt.toISOString(),
            updated_at: customer.updatedAt.toISOString(),
            orders_count: stats.count,
            total_spent: stats.total,
            last_order_date: stats.lastDate,
            avg_order_value: stats.count > 0 ? stats.total / stats.count : 0,
        };
    });

    // Get overall stats using repository
    const repoStats = await customerRepository.getStats(tenantId);
    
    const stats: CustomerStats = {
        totalCustomers: repoStats.total,
        newThisMonth: repoStats.newThisMonth,
        returningCustomers: repoStats.returning,
        subscribedCount: repoStats.subscribed,
        totalRevenue: repoStats.totalRevenue,
        avgCustomerValue: repoStats.avgValue,
    };

    return {
        customers: customersWithStats,
        stats,
        totalCount: repoStats.total,
    };
}



// Get single customer with full details
export async function deleteCustomer(customerId: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId, user } = await getAuthenticatedUser();

        // Check if customer has orders
        const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId);

        if (count && count > 0) {
            return { error: "Cannot delete customer with existing orders. Consider anonymizing instead." };
        }

        // Fetch old values for audit log before deletion
        const { data: oldCustomer } = await supabase
            .from("customers")
            .select("email, first_name, last_name")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        // Use repository to delete customer
        await customerRepository.delete(tenantId, customerId);

        // Audit log - non-blocking
        try {
            await auditLogger.logDelete(tenantId, "customer", customerId, {
                email: oldCustomer?.email,
                firstName: oldCustomer?.first_name,
                lastName: oldCustomer?.last_name,
            }, { userId: user.id });
        } catch (auditError) {
            log.error("Audit logging failed:", auditError);
        }

        revalidatePath("/dashboard/customers");
        return {};
    } catch (err) {
        log.error("Delete customer error:", err);
        return { error: err instanceof Error ? err.message : "Failed to delete customer" };
    }
}

// Bulk update marketing status
export async function bulkUpdateMarketing(
    customerIds: string[],
    acceptsMarketing: boolean
): Promise<{ error?: string; updated?: number }> {
    try {
        const { tenantId } = await getAuthenticatedUser();

        // Use repository to update each customer's marketing preference
        let updatedCount = 0;
        for (const customerId of customerIds) {
            const result = await customerRepository.updateMarketingPreference(
                tenantId,
                customerId,
                acceptsMarketing
            );
            if (result) {
                updatedCount++;
            }
        }

        revalidatePath("/dashboard/customers");
        return { updated: updatedCount };
    } catch (err) {
        log.error("Bulk update marketing error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update customers" };
    }
}

// Export customers to CSV
export async function exportCustomers(filters: {
    search?: string;
    marketing?: string;
} = {}): Promise<{ csv?: string; error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        let query = supabase
            .from("customers")
            .select("*")
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false });

        if (filters.search) {
            query = query.or(
                `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%`
            );
        }

        if (filters.marketing === "subscribed") {
            query = query.eq("accepts_marketing", true);
        } else if (filters.marketing === "unsubscribed") {
            query = query.eq("accepts_marketing", false);
        }

        const { data: customers, error } = await query;

        if (error) {
            return { error: `Failed to export customers: ${error.message}` };
        }

        // Get order stats
        const customerIds = customers?.map(c => c.id) || [];
        const { data: orderStats } = await supabase
            .from("orders")
            .select("customer_id, total")
            .eq("tenant_id", tenantId)
            .in("customer_id", customerIds.length > 0 ? customerIds : ["none"])
            .eq("payment_status", "paid");

        const customerStatsMap = new Map<string, { count: number; total: number }>();
        orderStats?.forEach(order => {
            if (!order.customer_id) return;
            const existing = customerStatsMap.get(order.customer_id) || { count: 0, total: 0 };
            existing.count += 1;
            existing.total += order.total;
            customerStatsMap.set(order.customer_id, existing);
        });

        // Generate CSV
        const headers = ["Email", "First Name", "Last Name", "Phone", "Marketing", "Orders", "Total Spent", "Created"];
        const rows = (customers || []).map(c => {
            const stats = customerStatsMap.get(c.id) || { count: 0, total: 0 };
            return [
                c.email,
                c.first_name || "",
                c.last_name || "",
                c.phone || "",
                c.accepts_marketing ? "Yes" : "No",
                stats.count.toString(),
                stats.total.toFixed(2),
                new Date(c.created_at).toISOString().split("T")[0],
            ];
        });

        const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");

        return { csv };
    } catch (err) {
        log.error("Export customers error:", err);
        return { error: err instanceof Error ? err.message : "Failed to export customers" };
    }
}

// Add note to customer
