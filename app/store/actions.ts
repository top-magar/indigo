"use server";

import { publicStorefrontAction } from "@/lib/public-actions";
import { orders } from "@/db/schema";
import { revalidatePath } from "next/cache";

type CheckoutItem = {
    id: string; // Product ID
    quantity: number;
    price: number;
};

export async function checkoutAction(tenantId: string, items: CheckoutItem[]) {
    if (!items.length) {
        return { success: false, message: "Cart is empty" };
    }

    try {
        await publicStorefrontAction(tenantId, async (tx) => {
            // 1. Calculate Total
            const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

            // 2. Create Order with tenantId
            const [order] = await tx.insert(orders).values({
                tenantId,
                status: 'pending',
                totalAmount: totalAmount,
                customerEmail: 'guest@example.com', // Placeholder for guest checkout
            }).returning();

            // Note: Order items require valid variantIds from product_variants table.
            // For a complete implementation, you would:
            // 1. Fetch variants for each product
            // 2. Insert order items with proper variantId references
            // This is simplified for the prototype.

            return order;
        });

        revalidatePath(`/store/${tenantId}`);
        return { success: true, message: "Order placed successfully!" };
    } catch (e) {
        console.error("Checkout Failed", e);
        return { success: false, message: "Failed to place order" };
    }
}
