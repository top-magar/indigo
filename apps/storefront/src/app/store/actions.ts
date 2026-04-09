"use server";

import { z } from "zod";
import { publicStorefrontAction } from "@/lib/public-actions";
import { orders } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { createLogger } from "@/lib/logger";
const log = createLogger("store:actions");

type CheckoutItem = {
    id: string; // Product ID
    quantity: number;
    price: number;
};

const checkoutItemSchema = z.object({
    id: z.string().min(1),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative(),
});

const checkoutSchema = z.object({
    tenantId: z.string().uuid(),
    items: z.array(checkoutItemSchema).min(1),
});

export async function checkoutAction(tenantId: string, items: CheckoutItem[]) {
    const data = checkoutSchema.parse({ tenantId, items });

    try {
        await publicStorefrontAction(data.tenantId, async (tx) => {
            // 1. Calculate Total
            const totalAmount = data.items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2);

            // 2. Create Order with tenantId
            const [order] = await tx.insert(orders).values({
                tenantId: data.tenantId,
                orderNumber: `ORD-${Date.now().toString(36).toUpperCase()}`,
                status: 'pending',
                total: totalAmount,
                customerEmail: 'guest@example.com', // Placeholder for guest checkout
            }).returning();

            // Note: Order items require valid variantIds from product_variants table.
            // For a complete implementation, you would:
            // 1. Fetch variants for each product
            // 2. Insert order items with proper variantId references
            // This is simplified for the prototype.

            return order;
        });

        revalidatePath(`/store/${data.tenantId}`);
        return { success: true, message: "Order placed successfully!" };
    } catch (e) {
        log.error("Checkout Failed", e);
        return { success: false, message: "Failed to place order" };
    }
}
