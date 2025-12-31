"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type {
    Customer,
    CustomerAddress,
    CustomerNote,
    CustomerOrderSummary,
    CustomerStats,
    CustomerListItem,
    CustomerListStats,
    UpdateCustomerInput,
    AddressInput,
    TimelineEvent,
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
        .select("tenant_id, full_name, tenants(*)")
        .eq("id", user.id)
        .single();

    if (!userData?.tenant_id) {
        redirect("/auth/login");
    }

    return { 
        supabase, 
        tenantId: userData.tenant_id, 
        userId: user.id, 
        userName: userData.full_name,
        currency: (userData.tenants as { currency?: string } | null)?.currency || "USD"
    };
}

// ============================================================================
// CUSTOMER DETAIL QUERY
// ============================================================================

export async function getCustomerDetail(customerId: string): Promise<{ 
    success: boolean; 
    data?: Customer; 
    error?: string 
}> {
    const { supabase, tenantId, currency } = await getAuthenticatedTenant();

    try {
        // Fetch customer
        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        if (customerError || !customer) {
            return { success: false, error: "Customer not found" };
        }

        // Fetch addresses
        const { data: addresses } = await supabase
            .from("addresses")
            .select("*")
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId)
            .order("is_default", { ascending: false });

        // Fetch recent orders
        const { data: orders } = await supabase
            .from("orders")
            .select(`
                id,
                order_number,
                status,
                payment_status,
                total,
                currency,
                created_at,
                order_items (id)
            `)
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false })
            .limit(10);

        // Calculate stats
        const { data: allOrders } = await supabase
            .from("orders")
            .select("total, created_at, payment_status")
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId)
            .eq("payment_status", "paid");

        const paidOrders = allOrders || [];
        const totalSpent = paidOrders.reduce((sum: number, o: { total?: number }) => sum + (o.total || 0), 0);
        const orderDates = paidOrders.map((o: { created_at: string }) => o.created_at).sort();

        // Transform addresses
        const transformedAddresses: CustomerAddress[] = (addresses || []).map(addr => ({
            id: addr.id,
            customerId: addr.customer_id,
            type: addr.type,
            firstName: addr.first_name,
            lastName: addr.last_name,
            company: addr.company,
            addressLine1: addr.address_line1,
            addressLine2: addr.address_line2,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postal_code,
            country: addr.country,
            countryCode: addr.country_code || addr.country,
            phone: addr.phone,
            isDefault: addr.is_default,
            createdAt: addr.created_at,
            updatedAt: addr.updated_at,
        }));

        // Get default addresses
        const defaultBilling = transformedAddresses.find(a => a.type === "billing" && a.isDefault) || 
                              transformedAddresses.find(a => a.type === "billing") || null;
        const defaultShipping = transformedAddresses.find(a => a.type === "shipping" && a.isDefault) || 
                               transformedAddresses.find(a => a.type === "shipping") || null;

        // Transform orders
        const recentOrders: CustomerOrderSummary[] = (orders || []).map(order => ({
            id: order.id,
            orderNumber: order.order_number,
            status: order.status,
            paymentStatus: order.payment_status,
            total: order.total,
            currency: order.currency || currency,
            itemsCount: Array.isArray(order.order_items) ? order.order_items.length : 0,
            createdAt: order.created_at,
        }));

        // Parse metadata
        const metadata = (customer.metadata as Record<string, unknown>) || {};
        const notes: CustomerNote[] = ((metadata.notes as CustomerNote[]) || []).map((note, idx) => ({
            id: note.id || `note-${idx}`,
            text: note.text,
            createdAt: note.createdAt || (note as unknown as { date?: string }).date || new Date().toISOString(),
            createdBy: note.createdBy,
            isPrivate: note.isPrivate ?? false,
        }));

        // Build customer object
        const customerData: Customer = {
            id: customer.id,
            tenantId: customer.tenant_id,
            email: customer.email,
            firstName: customer.first_name,
            lastName: customer.last_name,
            phone: customer.phone,
            isActive: customer.is_active ?? true,
            acceptsMarketing: customer.accepts_marketing ?? false,
            dateJoined: customer.created_at,
            lastLogin: customer.last_login || null,
            updatedAt: customer.updated_at,
            note: (metadata.note as string) || null,
            notes,
            metadata: metadata,
            privateMetadata: (customer.private_metadata as Record<string, unknown>) || {},
            defaultBillingAddress: defaultBilling,
            defaultShippingAddress: defaultShipping,
            addresses: transformedAddresses,
            stats: {
                totalOrders: paidOrders.length,
                totalSpent,
                avgOrderValue: paidOrders.length > 0 ? totalSpent / paidOrders.length : 0,
                lastOrderDate: orderDates.length > 0 ? orderDates[orderDates.length - 1] : null,
                firstOrderDate: orderDates.length > 0 ? orderDates[0] : null,
                returningCustomer: paidOrders.length > 1,
            },
            recentOrders,
        };

        return { success: true, data: customerData };
    } catch (error) {
        console.error("Failed to fetch customer:", error);
        return { success: false, error: "Failed to fetch customer" };
    }
}

// ============================================================================
// UPDATE CUSTOMER
// ============================================================================

export async function updateCustomerDetails(
    customerId: string,
    input: UpdateCustomerInput
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId, userName } = await getAuthenticatedTenant();

    try {
        // Get current customer data
        const { data: current } = await supabase
            .from("customers")
            .select("metadata")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        const currentMetadata = (current?.metadata as Record<string, unknown>) || {};
        
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        };

        if (input.firstName !== undefined) updateData.first_name = input.firstName;
        if (input.lastName !== undefined) updateData.last_name = input.lastName;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.isActive !== undefined) updateData.is_active = input.isActive;
        if (input.acceptsMarketing !== undefined) updateData.accepts_marketing = input.acceptsMarketing;
        if (input.note !== undefined) {
            updateData.metadata = { ...currentMetadata, note: input.note };
        }
        if (input.metadata !== undefined) {
            updateData.metadata = { ...currentMetadata, ...input.metadata };
        }

        const { error } = await supabase
            .from("customers")
            .update(updateData)
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update customer" };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        console.error("Failed to update customer:", error);
        return { success: false, error: "Failed to update customer" };
    }
}

// ============================================================================
// CUSTOMER NOTES
// ============================================================================

export async function addCustomerNoteAction(
    customerId: string,
    text: string,
    isPrivate: boolean = false
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId, userName } = await getAuthenticatedTenant();

    try {
        const { data: customer } = await supabase
            .from("customers")
            .select("metadata")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        if (!customer) {
            return { success: false, error: "Customer not found" };
        }

        const metadata = (customer.metadata as Record<string, unknown>) || {};
        const notes = (metadata.notes as CustomerNote[]) || [];

        const newNote: CustomerNote = {
            id: `note-${Date.now()}`,
            text,
            createdAt: new Date().toISOString(),
            createdBy: userName || undefined,
            isPrivate,
        };

        notes.unshift(newNote);

        const { error } = await supabase
            .from("customers")
            .update({
                metadata: { ...metadata, notes },
                updated_at: new Date().toISOString(),
            })
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to add note" };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to add note:", error);
        return { success: false, error: "Failed to add note" };
    }
}

export async function deleteCustomerNote(
    customerId: string,
    noteId: string
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { data: customer } = await supabase
            .from("customers")
            .select("metadata")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        if (!customer) {
            return { success: false, error: "Customer not found" };
        }

        const metadata = (customer.metadata as Record<string, unknown>) || {};
        const notes = (metadata.notes as CustomerNote[]) || [];
        const filteredNotes = notes.filter(n => n.id !== noteId);

        const { error } = await supabase
            .from("customers")
            .update({
                metadata: { ...metadata, notes: filteredNotes },
                updated_at: new Date().toISOString(),
            })
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete note" };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete note:", error);
        return { success: false, error: "Failed to delete note" };
    }
}

// ============================================================================
// ADDRESS MANAGEMENT
// ============================================================================

export async function addCustomerAddress(
    customerId: string,
    input: AddressInput
): Promise<{ success: boolean; data?: CustomerAddress; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // If setting as default, unset other defaults of same type
        if (input.isDefault) {
            await supabase
                .from("addresses")
                .update({ is_default: false })
                .eq("customer_id", customerId)
                .eq("tenant_id", tenantId)
                .eq("type", input.type);
        }

        const { data: address, error } = await supabase
            .from("addresses")
            .insert({
                tenant_id: tenantId,
                customer_id: customerId,
                type: input.type,
                first_name: input.firstName || null,
                last_name: input.lastName || null,
                company: input.company || null,
                address_line1: input.addressLine1,
                address_line2: input.addressLine2 || null,
                city: input.city,
                state: input.state || null,
                postal_code: input.postalCode || null,
                country: input.country,
                country_code: input.countryCode || input.country,
                phone: input.phone || null,
                is_default: input.isDefault ?? false,
            })
            .select()
            .single();

        if (error || !address) {
            return { success: false, error: "Failed to add address" };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { 
            success: true, 
            data: {
                id: address.id,
                customerId: address.customer_id,
                type: address.type,
                firstName: address.first_name,
                lastName: address.last_name,
                company: address.company,
                addressLine1: address.address_line1,
                addressLine2: address.address_line2,
                city: address.city,
                state: address.state,
                postalCode: address.postal_code,
                country: address.country,
                countryCode: address.country_code,
                phone: address.phone,
                isDefault: address.is_default,
                createdAt: address.created_at,
                updatedAt: address.updated_at,
            }
        };
    } catch (error) {
        console.error("Failed to add address:", error);
        return { success: false, error: "Failed to add address" };
    }
}

export async function updateCustomerAddress(
    addressId: string,
    input: Partial<AddressInput>
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Get address to find customer_id
        const { data: existingAddress } = await supabase
            .from("addresses")
            .select("customer_id, type")
            .eq("id", addressId)
            .eq("tenant_id", tenantId)
            .single();

        if (!existingAddress) {
            return { success: false, error: "Address not found" };
        }

        // If setting as default, unset other defaults of same type
        if (input.isDefault) {
            await supabase
                .from("addresses")
                .update({ is_default: false })
                .eq("customer_id", existingAddress.customer_id)
                .eq("tenant_id", tenantId)
                .eq("type", input.type || existingAddress.type)
                .neq("id", addressId);
        }

        const updateData: Record<string, unknown> = { updated_at: new Date().toISOString() };
        if (input.type !== undefined) updateData.type = input.type;
        if (input.firstName !== undefined) updateData.first_name = input.firstName;
        if (input.lastName !== undefined) updateData.last_name = input.lastName;
        if (input.company !== undefined) updateData.company = input.company;
        if (input.addressLine1 !== undefined) updateData.address_line1 = input.addressLine1;
        if (input.addressLine2 !== undefined) updateData.address_line2 = input.addressLine2;
        if (input.city !== undefined) updateData.city = input.city;
        if (input.state !== undefined) updateData.state = input.state;
        if (input.postalCode !== undefined) updateData.postal_code = input.postalCode;
        if (input.country !== undefined) updateData.country = input.country;
        if (input.countryCode !== undefined) updateData.country_code = input.countryCode;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.isDefault !== undefined) updateData.is_default = input.isDefault;

        const { error } = await supabase
            .from("addresses")
            .update(updateData)
            .eq("id", addressId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update address" };
        }

        revalidatePath(`/dashboard/customers/${existingAddress.customer_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to update address:", error);
        return { success: false, error: "Failed to update address" };
    }
}

export async function deleteCustomerAddress(
    addressId: string
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { data: address } = await supabase
            .from("addresses")
            .select("customer_id")
            .eq("id", addressId)
            .eq("tenant_id", tenantId)
            .single();

        if (!address) {
            return { success: false, error: "Address not found" };
        }

        const { error } = await supabase
            .from("addresses")
            .delete()
            .eq("id", addressId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete address" };
        }

        revalidatePath(`/dashboard/customers/${address.customer_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to delete address:", error);
        return { success: false, error: "Failed to delete address" };
    }
}

export async function setDefaultAddress(
    addressId: string,
    type: "shipping" | "billing"
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { data: address } = await supabase
            .from("addresses")
            .select("customer_id")
            .eq("id", addressId)
            .eq("tenant_id", tenantId)
            .single();

        if (!address) {
            return { success: false, error: "Address not found" };
        }

        // Unset all defaults of this type for this customer
        await supabase
            .from("addresses")
            .update({ is_default: false })
            .eq("customer_id", address.customer_id)
            .eq("tenant_id", tenantId)
            .eq("type", type);

        // Set this address as default
        const { error } = await supabase
            .from("addresses")
            .update({ is_default: true, type, updated_at: new Date().toISOString() })
            .eq("id", addressId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to set default address" };
        }

        revalidatePath(`/dashboard/customers/${address.customer_id}`);
        return { success: true };
    } catch (error) {
        console.error("Failed to set default address:", error);
        return { success: false, error: "Failed to set default address" };
    }
}

// ============================================================================
// CUSTOMER TIMELINE
// ============================================================================

export async function getCustomerTimeline(
    customerId: string
): Promise<{ success: boolean; data?: TimelineEvent[]; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const events: TimelineEvent[] = [];

        // Get customer creation date
        const { data: customer } = await supabase
            .from("customers")
            .select("created_at, metadata")
            .eq("id", customerId)
            .eq("tenant_id", tenantId)
            .single();

        if (customer) {
            events.push({
                id: `created-${customerId}`,
                type: "customer_created",
                message: "Customer account created",
                date: customer.created_at,
            });

            // Add notes as events
            const metadata = (customer.metadata as Record<string, unknown>) || {};
            const notes = (metadata.notes as CustomerNote[]) || [];
            notes.forEach(note => {
                events.push({
                    id: note.id,
                    type: "note_added",
                    message: note.text,
                    date: note.createdAt,
                    user: note.createdBy,
                });
            });
        }

        // Get orders
        const { data: orders } = await supabase
            .from("orders")
            .select("id, order_number, status, created_at, total, currency")
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId)
            .order("created_at", { ascending: false });

        orders?.forEach(order => {
            events.push({
                id: `order-${order.id}`,
                type: "order_placed",
                message: `Placed order #${order.order_number}`,
                date: order.created_at,
                metadata: { orderId: order.id, total: order.total, currency: order.currency },
            });
        });

        // Sort by date descending
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { success: true, data: events };
    } catch (error) {
        console.error("Failed to get timeline:", error);
        return { success: false, error: "Failed to get timeline" };
    }
}

// ============================================================================
// DELETE CUSTOMER
// ============================================================================

export async function deleteCustomerAction(
    customerId: string
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        // Check if customer has orders
        const { count } = await supabase
            .from("orders")
            .select("*", { count: "exact", head: true })
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId);

        if (count && count > 0) {
            return { 
                success: false, 
                error: "Cannot delete customer with existing orders. Consider deactivating instead." 
            };
        }

        // Delete addresses first
        await supabase
            .from("addresses")
            .delete()
            .eq("customer_id", customerId)
            .eq("tenant_id", tenantId);

        // Delete customer
        const { error } = await supabase
            .from("customers")
            .delete()
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to delete customer" };
        }

        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete customer:", error);
        return { success: false, error: "Failed to delete customer" };
    }
}

// ============================================================================
// TOGGLE CUSTOMER STATUS
// ============================================================================

export async function toggleCustomerStatus(
    customerId: string,
    isActive: boolean
): Promise<{ success: boolean; error?: string }> {
    const { supabase, tenantId } = await getAuthenticatedTenant();

    try {
        const { error } = await supabase
            .from("customers")
            .update({ 
                is_active: isActive, 
                updated_at: new Date().toISOString() 
            })
            .eq("id", customerId)
            .eq("tenant_id", tenantId);

        if (error) {
            return { success: false, error: "Failed to update customer status" };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        console.error("Failed to toggle status:", error);
        return { success: false, error: "Failed to update customer status" };
    }
}
