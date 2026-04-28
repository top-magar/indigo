"use server";

import { createLogger } from "@/lib/logger";
const log = createLogger("customers-customer-actions");

import { validateId } from "@/shared/utils/validate-id";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { db } from "@/infrastructure/db";
import { customers, addresses } from "@/db/schema/customers";
import { orders } from "@/db/schema/orders";
import { tenants } from "@/db/schema/tenants";
import { eq, and, desc, count } from "drizzle-orm";
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
    const { user } = await getAuthenticatedClient();
    const [tenant] = await db
        .select({ currency: tenants.currency })
        .from(tenants)
        .where(eq(tenants.id, user.tenantId))
        .limit(1);
    return { tenantId: user.tenantId, userId: user.id, userName: user.fullName, currency: tenant?.currency || "USD" };
}

// ============================================================================
// CUSTOMER DETAIL QUERY
// ============================================================================

export async function getCustomerDetail(customerId: string): Promise<{ 
    success: boolean; 
    data?: Customer; 
    error?: string 
}> {
    const { tenantId, currency } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        // Fetch customer
        const [customer] = await db
            .select()
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
            .limit(1);

        if (!customer) {
            return { success: false, error: "Customer not found" };
        }

        // Fetch addresses
        const addressRows = await db
            .select()
            .from(addresses)
            .where(and(eq(addresses.customerId, customerId), eq(addresses.tenantId, tenantId)))
            .orderBy(desc(addresses.isDefault));

        // Fetch recent orders (with item counts via subquery)
        const orderRows = await db
            .select()
            .from(orders)
            .where(and(eq(orders.customerId, customerId), eq(orders.tenantId, tenantId)))
            .orderBy(desc(orders.createdAt))
            .limit(10);

        // Calculate stats from paid orders
        const paidOrders = await db
            .select({ total: orders.total, createdAt: orders.createdAt })
            .from(orders)
            .where(and(
                eq(orders.customerId, customerId),
                eq(orders.tenantId, tenantId),
                eq(orders.paymentStatus, "paid"),
            ));

        const totalSpent = paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
        const orderDates = paidOrders.map(o => o.createdAt.toISOString()).sort();

        // Transform addresses
        const transformedAddresses: CustomerAddress[] = addressRows.map(addr => ({
            id: addr.id,
            customerId: addr.customerId,
            type: (addr.type || "shipping") as "shipping" | "billing",
            firstName: addr.firstName,
            lastName: addr.lastName,
            company: addr.company,
            addressLine1: addr.addressLine1,
            addressLine2: addr.addressLine2,
            city: addr.city,
            state: addr.state,
            postalCode: addr.postalCode,
            country: addr.country,
            countryCode: addr.countryCode || addr.country,
            phone: addr.phone,
            isDefault: addr.isDefault ?? false,
            createdAt: addr.createdAt.toISOString(),
            updatedAt: addr.updatedAt.toISOString(),
        }));

        // Get default addresses
        const defaultBilling = transformedAddresses.find(a => a.type === "billing" && a.isDefault) || 
                              transformedAddresses.find(a => a.type === "billing") || null;
        const defaultShipping = transformedAddresses.find(a => a.type === "shipping" && a.isDefault) || 
                               transformedAddresses.find(a => a.type === "shipping") || null;

        // Transform orders
        const recentOrders: CustomerOrderSummary[] = orderRows.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            paymentStatus: order.paymentStatus || "pending",
            total: Number(order.total),
            currency: order.currency || currency,
            itemsCount: order.itemsCount || 0,
            createdAt: order.createdAt.toISOString(),
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
            tenantId: customer.tenantId,
            email: customer.email,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            isActive: customer.isActive ?? true,
            acceptsMarketing: customer.acceptsMarketing ?? false,
            dateJoined: customer.createdAt.toISOString(),
            lastLogin: customer.lastLogin?.toISOString() || null,
            updatedAt: customer.updatedAt.toISOString(),
            note: (metadata.note as string) || null,
            notes,
            tags: (metadata.tags as string[]) || [],
            metadata: metadata,
            privateMetadata: (customer.privateMetadata as Record<string, unknown>) || {},
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
        log.error("Failed to fetch customer:", error);
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
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        // Get current customer data
        const [current] = await db
            .select({ metadata: customers.metadata })
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
            .limit(1);

        const currentMetadata = (current?.metadata as Record<string, unknown>) || {};
        
        const updateData: Record<string, unknown> = {
            updatedAt: new Date(),
        };

        if (input.firstName !== undefined) updateData.firstName = input.firstName;
        if (input.lastName !== undefined) updateData.lastName = input.lastName;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.isActive !== undefined) updateData.isActive = input.isActive;
        if (input.acceptsMarketing !== undefined) updateData.acceptsMarketing = input.acceptsMarketing;
        if (input.note !== undefined) {
            updateData.metadata = { ...currentMetadata, note: input.note };
        }
        if (input.metadata !== undefined) {
            updateData.metadata = { ...currentMetadata, ...input.metadata };
        }

        await db
            .update(customers)
            .set(updateData)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${customerId}`);
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        log.error("Failed to update customer:", error);
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
    const { tenantId, userName } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        const [customer] = await db
            .select({ metadata: customers.metadata })
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
            .limit(1);

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

        await db
            .update(customers)
            .set({
                metadata: { ...metadata, notes },
                updatedAt: new Date(),
            })
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to add note:", error);
        return { success: false, error: "Failed to add note" };
    }
}

export async function deleteCustomerNote(
    customerId: string,
    noteId: string
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        const [customer] = await db
            .select({ metadata: customers.metadata })
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
            .limit(1);

        if (!customer) {
            return { success: false, error: "Customer not found" };
        }

        const metadata = (customer.metadata as Record<string, unknown>) || {};
        const notes = (metadata.notes as CustomerNote[]) || [];
        const filteredNotes = notes.filter(n => n.id !== noteId);

        await db
            .update(customers)
            .set({
                metadata: { ...metadata, notes: filteredNotes },
                updatedAt: new Date(),
            })
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to delete note:", error);
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
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        // If setting as default, unset other defaults of same type
        if (input.isDefault) {
            await db
                .update(addresses)
                .set({ isDefault: false })
                .where(and(
                    eq(addresses.customerId, customerId),
                    eq(addresses.tenantId, tenantId),
                    eq(addresses.type, input.type),
                ));
        }

        const [address] = await db
            .insert(addresses)
            .values({
                tenantId,
                customerId,
                type: input.type,
                firstName: input.firstName || null,
                lastName: input.lastName || null,
                company: input.company || null,
                addressLine1: input.addressLine1,
                addressLine2: input.addressLine2 || null,
                city: input.city,
                state: input.state || null,
                postalCode: input.postalCode || null,
                country: input.country,
                countryCode: input.countryCode || input.country,
                phone: input.phone || null,
                isDefault: input.isDefault ?? false,
            })
            .returning();

        if (!address) {
            return { success: false, error: "Failed to add address" };
        }

        revalidatePath(`/dashboard/customers/${customerId}`);
        return { 
            success: true, 
            data: {
                id: address.id,
                customerId: address.customerId,
                type: (address.type || "shipping") as "shipping" | "billing",
                firstName: address.firstName,
                lastName: address.lastName,
                company: address.company,
                addressLine1: address.addressLine1,
                addressLine2: address.addressLine2,
                city: address.city,
                state: address.state,
                postalCode: address.postalCode,
                country: address.country,
                countryCode: address.countryCode || address.country,
                phone: address.phone,
                isDefault: address.isDefault ?? false,
                createdAt: address.createdAt.toISOString(),
                updatedAt: address.updatedAt.toISOString(),
            }
        };
    } catch (error) {
        log.error("Failed to add address:", error);
        return { success: false, error: "Failed to add address" };
    }
}

export async function updateCustomerAddress(
    addressId: string,
    input: Partial<AddressInput>
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(addressId, "Address ID");
        // Get address to find customer_id
        const [existingAddress] = await db
            .select({ customerId: addresses.customerId, type: addresses.type })
            .from(addresses)
            .where(and(eq(addresses.id, addressId), eq(addresses.tenantId, tenantId)))
            .limit(1);

        if (!existingAddress) {
            return { success: false, error: "Address not found" };
        }

        // If setting as default, unset other defaults of same type
        if (input.isDefault) {
            await db
                .update(addresses)
                .set({ isDefault: false })
                .where(and(
                    eq(addresses.customerId, existingAddress.customerId),
                    eq(addresses.tenantId, tenantId),
                    eq(addresses.type, input.type || existingAddress.type || "shipping"),
                ));
        }

        const updateData: Record<string, unknown> = { updatedAt: new Date() };
        if (input.type !== undefined) updateData.type = input.type;
        if (input.firstName !== undefined) updateData.firstName = input.firstName;
        if (input.lastName !== undefined) updateData.lastName = input.lastName;
        if (input.company !== undefined) updateData.company = input.company;
        if (input.addressLine1 !== undefined) updateData.addressLine1 = input.addressLine1;
        if (input.addressLine2 !== undefined) updateData.addressLine2 = input.addressLine2;
        if (input.city !== undefined) updateData.city = input.city;
        if (input.state !== undefined) updateData.state = input.state;
        if (input.postalCode !== undefined) updateData.postalCode = input.postalCode;
        if (input.country !== undefined) updateData.country = input.country;
        if (input.countryCode !== undefined) updateData.countryCode = input.countryCode;
        if (input.phone !== undefined) updateData.phone = input.phone;
        if (input.isDefault !== undefined) updateData.isDefault = input.isDefault;

        await db
            .update(addresses)
            .set(updateData)
            .where(and(eq(addresses.id, addressId), eq(addresses.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${existingAddress.customerId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to update address:", error);
        return { success: false, error: "Failed to update address" };
    }
}

export async function deleteCustomerAddress(
    addressId: string
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(addressId, "Address ID");
        const [address] = await db
            .select({ customerId: addresses.customerId })
            .from(addresses)
            .where(and(eq(addresses.id, addressId), eq(addresses.tenantId, tenantId)))
            .limit(1);

        if (!address) {
            return { success: false, error: "Address not found" };
        }

        await db
            .delete(addresses)
            .where(and(eq(addresses.id, addressId), eq(addresses.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${address.customerId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to delete address:", error);
        return { success: false, error: "Failed to delete address" };
    }
}

export async function setDefaultAddress(
    addressId: string,
    type: "shipping" | "billing"
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(addressId, "Address ID");
        const [address] = await db
            .select({ customerId: addresses.customerId })
            .from(addresses)
            .where(and(eq(addresses.id, addressId), eq(addresses.tenantId, tenantId)))
            .limit(1);

        if (!address) {
            return { success: false, error: "Address not found" };
        }

        // Unset all defaults of this type for this customer
        await db
            .update(addresses)
            .set({ isDefault: false })
            .where(and(
                eq(addresses.customerId, address.customerId),
                eq(addresses.tenantId, tenantId),
                eq(addresses.type, type),
            ));

        // Set this address as default
        await db
            .update(addresses)
            .set({ isDefault: true, type, updatedAt: new Date() })
            .where(and(eq(addresses.id, addressId), eq(addresses.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${address.customerId}`);
        return { success: true };
    } catch (error) {
        log.error("Failed to set default address:", error);
        return { success: false, error: "Failed to set default address" };
    }
}

// ============================================================================
// CUSTOMER TIMELINE
// ============================================================================

export async function getCustomerTimeline(
    customerId: string
): Promise<{ success: boolean; data?: TimelineEvent[]; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        const events: TimelineEvent[] = [];

        // Get customer creation date
        const [customer] = await db
            .select({ createdAt: customers.createdAt, metadata: customers.metadata })
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
            .limit(1);

        if (customer) {
            events.push({
                id: `created-${customerId}`,
                type: "customer_created",
                message: "Customer account created",
                date: customer.createdAt.toISOString(),
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
        const orderRows = await db
            .select({
                id: orders.id,
                orderNumber: orders.orderNumber,
                status: orders.status,
                createdAt: orders.createdAt,
                total: orders.total,
                currency: orders.currency,
            })
            .from(orders)
            .where(and(eq(orders.customerId, customerId), eq(orders.tenantId, tenantId)))
            .orderBy(desc(orders.createdAt));

        orderRows.forEach(order => {
            events.push({
                id: `order-${order.id}`,
                type: "order_placed",
                message: `Placed order #${order.orderNumber}`,
                date: order.createdAt.toISOString(),
                metadata: { orderId: order.id, total: Number(order.total), currency: order.currency },
            });
        });

        // Sort by date descending
        events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        return { success: true, data: events };
    } catch (error) {
        log.error("Failed to get timeline:", error);
        return { success: false, error: "Failed to get timeline" };
    }
}

// ============================================================================
// DELETE CUSTOMER
// ============================================================================

export async function deleteCustomerAction(
    customerId: string
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        // Check if customer has orders
        const [orderCount] = await db
            .select({ value: count() })
            .from(orders)
            .where(and(eq(orders.customerId, customerId), eq(orders.tenantId, tenantId)));

        if (orderCount && orderCount.value > 0) {
            return { 
                success: false, 
                error: "Cannot delete customer with existing orders. Consider deactivating instead." 
            };
        }

        // Delete addresses first
        await db
            .delete(addresses)
            .where(and(eq(addresses.customerId, customerId), eq(addresses.tenantId, tenantId)));

        // Delete customer
        await db
            .delete(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)));

        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        log.error("Failed to delete customer:", error);
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
    const { tenantId } = await getAuthenticatedTenant();

    try {
        validateId(customerId, "Customer ID");
        await db
            .update(customers)
            .set({ isActive, updatedAt: new Date() })
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)));

        revalidatePath(`/dashboard/customers/${customerId}`);
        revalidatePath("/dashboard/customers");
        return { success: true };
    } catch (error) {
        log.error("Failed to toggle status:", error);
        return { success: false, error: "Failed to update customer status" };
    }
}

export async function updateCustomerTags(
    customerId: string,
    tags: string[]
): Promise<{ success: boolean; error?: string }> {
    const { tenantId } = await getAuthenticatedTenant();
    try {
        validateId(customerId, "Customer ID");
        const [customer] = await db
            .select({ metadata: customers.metadata })
            .from(customers)
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)))
            .limit(1);

        if (!customer) return { success: false, error: "Customer not found" };

        const metadata = (customer.metadata as Record<string, unknown>) ?? {};
        await db
            .update(customers)
            .set({ metadata: { ...metadata, tags } })
            .where(and(eq(customers.id, customerId), eq(customers.tenantId, tenantId)));

        return { success: true };
    } catch (error) {
        log.error("Failed to update tags:", error);
        return { success: false, error: "Failed to update tags" };
    }
}
