"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function getAuthenticatedUser() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        redirect("/auth/login");
    }

    const { data: userData } = await supabase
        .from("users")
        .select("*, tenants(*)")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { supabase, user, userData, tenantId: userData.tenant_id, tenant: userData.tenants };
}

export interface CustomerWithStats {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    phone: string | null;
    accepts_marketing: boolean;
    metadata: Record<string, unknown>;
    created_at: string;
    updated_at: string;
    orders_count: number;
    total_spent: number;
    last_order_date: string | null;
    avg_order_value: number;
}

export interface CustomerStats {
    totalCustomers: number;
    newThisMonth: number;
    returningCustomers: number;
    subscribedCount: number;
    totalRevenue: number;
    avgCustomerValue: number;
}

// Get customers with order stats
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

    // Build base query for customers
    let query = supabase
        .from("customers")
        .select("*", { count: "exact" })
        .eq("tenant_id", tenantId);

    // Apply search filter
    if (filters.search) {
        query = query.or(
            `email.ilike.%${filters.search}%,first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`
        );
    }

    // Apply marketing filter
    if (filters.marketing === "subscribed") {
        query = query.eq("accepts_marketing", true);
    } else if (filters.marketing === "unsubscribed") {
        query = query.eq("accepts_marketing", false);
    }

    // Apply sorting
    const sortBy = filters.sortBy || "created_at";
    const sortOrder = filters.sortOrder === "asc" ? true : false;
    query = query.order(sortBy, { ascending: sortOrder });

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    const { data: customers, count, error } = await query;

    if (error) {
        console.error("Error fetching customers:", error);
        return { customers: [], stats: getEmptyStats(), totalCount: 0 };
    }

    // Get order stats for each customer
    const customerIds = customers?.map(c => c.id) || [];
    
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
    const customersWithStats: CustomerWithStats[] = (customers || []).map(customer => {
        const stats = customerStatsMap.get(customer.id) || { count: 0, total: 0, lastDate: null };
        return {
            ...customer,
            orders_count: stats.count,
            total_spent: stats.total,
            last_order_date: stats.lastDate,
            avg_order_value: stats.count > 0 ? stats.total / stats.count : 0,
        };
    });

    // Get overall stats
    const stats = await getCustomerStats(tenantId, supabase);

    return {
        customers: customersWithStats,
        stats,
        totalCount: count || 0,
    };
}

async function getCustomerStats(tenantId: string, supabase: Awaited<ReturnType<typeof createClient>>): Promise<CustomerStats> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all customers count
    const { count: totalCustomers } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId);

    // Get new customers this month
    const { count: newThisMonth } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .gte("created_at", thirtyDaysAgo.toISOString());

    // Get subscribed count
    const { count: subscribedCount } = await supabase
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("tenant_id", tenantId)
        .eq("accepts_marketing", true);

    // Get revenue stats from orders
    const { data: orderData } = await supabase
        .from("orders")
        .select("customer_id, total")
        .eq("tenant_id", tenantId)
        .eq("payment_status", "paid");

    const totalRevenue = orderData?.reduce((sum, o) => sum + o.total, 0) || 0;
    
    // Count returning customers (more than 1 order)
    const customerOrderCounts = new Map<string, number>();
    orderData?.forEach(order => {
        if (order.customer_id) {
            customerOrderCounts.set(order.customer_id, (customerOrderCounts.get(order.customer_id) || 0) + 1);
        }
    });
    const returningCustomers = Array.from(customerOrderCounts.values()).filter(count => count > 1).length;

    return {
        totalCustomers: totalCustomers || 0,
        newThisMonth: newThisMonth || 0,
        returningCustomers,
        subscribedCount: subscribedCount || 0,
        totalRevenue,
        avgCustomerValue: (totalCustomers || 0) > 0 ? totalRevenue / (totalCustomers || 1) : 0,
    };
}

function getEmptyStats(): CustomerStats {
    return {
        totalCustomers: 0,
        newThisMonth: 0,
        returningCustomers: 0,
        subscribedCount: 0,
        totalRevenue: 0,
        avgCustomerValue: 0,
    };
}


// Get single customer with full details
export async function getCustomerDetails(customerId: string) {
    const { supabase, tenantId, tenant } = await getAuthenticatedUser();

    // Get customer
    const { data: customer, error } = await supabase
        .from("customers")
        .select("*")
        .eq("id", customerId)
        .eq("tenant_id", tenantId)
        .single();

    if (error || !customer) {
        return null;
    }

    // Get customer orders
    const { data: orders } = await supabase
        .from("orders")
        .select("*, order_items:order_items(*)")
        .eq("customer_id", customerId)
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(10);

    // Get customer addresses
    const { data: addresses } = await supabase
        .from("addresses")
        .select("*")
        .eq("customer_id", customerId)
        .eq("tenant_id", tenantId);

    // Calculate stats
    const paidOrders = orders?.filter(o => o.payment_status === "paid") || [];
    const totalSpent = paidOrders.reduce((sum, o) => sum + o.total, 0);
    const avgOrderValue = paidOrders.length > 0 ? totalSpent / paidOrders.length : 0;

    return {
        customer,
        orders: orders || [],
        addresses: addresses || [],
        stats: {
            totalOrders: orders?.length || 0,
            totalSpent,
            avgOrderValue,
            lastOrderDate: orders?.[0]?.created_at || null,
        },
        currency: tenant?.currency || "USD",
    };
}

// Update customer
export async function updateCustomer(
    customerId: string,
    data: {
        first_name?: string;
        last_name?: string;
        phone?: string;
        accepts_marketing?: boolean;
        metadata?: Record<string, unknown>;
    }
): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const { error } = await supabase
            .from("customers")
            .update({
                ...data,
                updated_at: new Date().toISOString(),
            })
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to update customer: ${error.message}` };
        }

        revalidatePath("/dashboard/customers");
        revalidatePath(`/dashboard/customers/${customerId}`);
        return {};
    } catch (err) {
        console.error("Update customer error:", err);
        return { error: err instanceof Error ? err.message : "Failed to update customer" };
    }
}

// Delete customer
export async function deleteCustomer(customerId: string): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        // Check if customer has orders
        const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId);

        if (count && count > 0) {
            return { error: "Cannot delete customer with existing orders. Consider anonymizing instead." };
        }

        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to delete customer: ${error.message}` };
        }

        revalidatePath("/dashboard/customers");
        return {};
    } catch (err) {
        console.error("Delete customer error:", err);
        return { error: err instanceof Error ? err.message : "Failed to delete customer" };
    }
}

// Bulk update marketing status
export async function bulkUpdateMarketing(
    customerIds: string[],
    acceptsMarketing: boolean
): Promise<{ error?: string; updated?: number }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        const { error, count } = await supabase
            .from("customers")
            .update({
                accepts_marketing: acceptsMarketing,
                updated_at: new Date().toISOString(),
            })
            .in("id", customerIds)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to update customers: ${error.message}` };
        }

        revalidatePath("/dashboard/customers");
        return { updated: count || customerIds.length };
    } catch (err) {
        console.error("Bulk update marketing error:", err);
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
        console.error("Export customers error:", err);
        return { error: err instanceof Error ? err.message : "Failed to export customers" };
    }
}

// Add note to customer
export async function addCustomerNote(
    customerId: string,
    note: string
): Promise<{ error?: string }> {
    try {
        const { supabase, tenantId } = await getAuthenticatedUser();

        // Get current metadata
        const { data: customer } = await supabase
            .from("customers")
            .select("metadata")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        const metadata = (customer?.metadata as Record<string, unknown>) || {};
        const notes = (metadata.notes as Array<{ text: string; date: string }>) || [];
        
        notes.unshift({
            text: note,
            date: new Date().toISOString(),
        });

        const { error } = await supabase
            .from("customers")
            .update({
                metadata: { ...metadata, notes },
                updated_at: new Date().toISOString(),
            })
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { error: `Failed to add note: ${error.message}` };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        return {};
    } catch (err) {
        console.error("Add customer note error:", err);
        return { error: err instanceof Error ? err.message : "Failed to add note" };
    }
}
