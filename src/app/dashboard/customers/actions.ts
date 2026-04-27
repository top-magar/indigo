"use server";

import { sanitizeSearch } from "@/shared/utils/sanitize";
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

    // Single Supabase query with all filters + sort + exact count
    let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId)
        .order(filters.sortBy || "created_at", { ascending: filters.sortOrder === "asc" })
        .range(offset, offset + pageSize - 1);

    if (filters.search) {
        query = query.or(`email.ilike.%${sanitizeSearch(filters.search)}%,first_name.ilike.%${sanitizeSearch(filters.search)}%,last_name.ilike.%${sanitizeSearch(filters.search)}%,phone.ilike.%${sanitizeSearch(filters.search)}%`);
    }
    if (filters.marketing === "subscribed") query = query.eq("accepts_marketing", true);
    else if (filters.marketing === "unsubscribed") query = query.eq("accepts_marketing", false);
    if (filters.status && filters.status !== "all") query = query.eq("status", filters.status);

    const { data: customersData, count } = await query;

    // Get order stats for fetched customers
    const customerIds = (customersData || []).map((c: Record<string, unknown>) => c.id as string);
    const { data: orderStats } = await supabase
        .from("orders")
        .select("customer_id, total, created_at")
        .eq("tenant_id", tenantId)
        .in("customer_id", customerIds.length > 0 ? customerIds : ["none"])
        .eq("payment_status", "paid");

    const statsMap = new Map<string, { count: number; total: number; lastDate: string | null }>();
    orderStats?.forEach(o => {
        if (!o.customer_id) return;
        const e = statsMap.get(o.customer_id) || { count: 0, total: 0, lastDate: null };
        e.count += 1;
        e.total += parseFloat(o.total || "0");
        if (!e.lastDate || o.created_at > e.lastDate) e.lastDate = o.created_at;
        statsMap.set(o.customer_id, e);
    });

    const customersWithStats: CustomerWithStats[] = (customersData || []).map((c: Record<string, unknown>) => {
        const s = statsMap.get(c.id as string) || { count: 0, total: 0, lastDate: null };
        return {
            id: c.id as string,
            email: c.email as string,
            first_name: c.first_name as string | null,
            last_name: c.last_name as string | null,
            phone: c.phone as string | null,
            accepts_marketing: (c.accepts_marketing as boolean) ?? false,
            metadata: (c.metadata as Record<string, unknown>) || {},
            created_at: c.created_at as string,
            updated_at: c.updated_at as string,
            orders_count: s.count,
            total_spent: s.total,
            last_order_date: s.lastDate,
            avg_order_value: s.count > 0 ? s.total / s.count : 0,
        };
    });

    // Get overall stats
    const repoStats = await customerRepository.getStats(tenantId);
    const stats: CustomerStats = {
        totalCustomers: repoStats.total,
        newThisMonth: repoStats.newThisMonth,
        returningCustomers: repoStats.returning,
        subscribedCount: repoStats.subscribed,
        totalRevenue: repoStats.totalRevenue,
        avgCustomerValue: repoStats.avgValue,
    };

    return { customers: customersWithStats, stats, totalCount: count ?? 0 };
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
            const s = filters.search.replace(/[%_'"\\,().!|&:*]/g, '');
            if (s) query = query.or(
                `email.ilike.%${s}%,first_name.ilike.%${s}%,last_name.ilike.%${s}%`
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

export async function createCustomer(formData: FormData): Promise<{ id?: string; error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const email = formData.get("email") as string;
        const firstName = formData.get("firstName") as string;
        const lastName = formData.get("lastName") as string;
        const phone = formData.get("phone") as string;

        if (!email) return { error: "Email is required" };

        // Check for duplicate
        const { data: existing } = await supabase
            .from("customers")
            .select("id")
            .eq("tenant_id", tenantId)
            .eq("email", email.toLowerCase())
            .single();

        if (existing) return { error: "A customer with this email already exists" };

        const { data, error } = await supabase
            .from("customers")
            .insert({
                tenant_id: tenantId,
                email: email.toLowerCase(),
                first_name: firstName || null,
                last_name: lastName || null,
                phone: phone || null,
                status: "active",
                accepts_marketing: false,
            })
            .select("id")
            .single();

        if (error) return { error: error.message };

        revalidatePath("/dashboard/customers");
        return { id: data.id };
    } catch {
        return { error: "Failed to create customer" };
    }
}
