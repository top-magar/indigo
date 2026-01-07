import "server-only";
import { carts, cartItems } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { withTenant } from "@/infrastructure/db";

/**
 * Cart item type
 */
export interface CartItemData {
  id: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSku: string | null;
  productImage: string | null;
  unitPrice: string;
  compareAtPrice: string | null;
  quantity: number;
}

/**
 * Cart with items
 */
export interface CartWithItems {
  id: string;
  tenantId: string;
  customerId: string | null;
  email: string | null;
  customerName: string | null;
  customerPhone: string | null;
  status: "active" | "completed" | "abandoned";
  currency: string;
  subtotal: string;
  discountTotal: string | null;
  shippingTotal: string | null;
  taxTotal: string | null;
  total: string;
  shippingAddress: string | null;
  shippingCity: string | null;
  shippingArea: string | null;
  shippingPostalCode: string | null;
  shippingCountry: string | null;
  billingAddress: string | null;
  discountId: string | null;
  voucherCodeId: string | null;
  voucherCode: string | null;
  items: CartItemData[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Cart create input
 */
export interface CartCreateInput {
  currency?: string;
  customerId?: string;
  email?: string;
}

/**
 * Cart item create input
 */
export interface CartItemCreateInput {
  productId: string;
  variantId?: string | null;
  productName: string;
  productSku?: string | null;
  productImage?: string | null;
  unitPrice: string;
  compareAtPrice?: string | null;
  quantity: number;
}

/**
 * Cart update input
 */
export interface CartUpdateInput {
  email?: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingArea?: string;
  shippingPostalCode?: string;
  shippingCountry?: string;
  billingAddress?: string;
  status?: "active" | "completed" | "abandoned";
}

/**
 * Cart Repository
 * 
 * Provides data access methods for carts with tenant isolation.
 * All methods use withTenant() wrapper to ensure RLS context is set.
 * 
 * @see IMPLEMENTATION-PLAN.md Section 4.1
 */
export class CartRepository {
  /**
   * Find cart by ID with items
   */
  async findById(tenantId: string, cartId: string): Promise<CartWithItems | null> {
    return withTenant(tenantId, async (tx) => {
      const [cart] = await tx
        .select()
        .from(carts)
        .where(eq(carts.id, cartId))
        .limit(1);

      if (!cart) {
        return null;
      }

      const items = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId))
        .orderBy(cartItems.createdAt);

      return {
        ...cart,
        status: cart.status as "active" | "completed" | "abandoned",
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          unitPrice: item.unitPrice,
          compareAtPrice: item.compareAtPrice,
          quantity: item.quantity,
        })),
      };
    });
  }

  /**
   * Find active cart by ID
   */
  async findActiveById(tenantId: string, cartId: string): Promise<CartWithItems | null> {
    return withTenant(tenantId, async (tx) => {
      const [cart] = await tx
        .select()
        .from(carts)
        .where(and(eq(carts.id, cartId), eq(carts.status, "active")))
        .limit(1);

      if (!cart) {
        return null;
      }

      const items = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId))
        .orderBy(cartItems.createdAt);

      return {
        ...cart,
        status: cart.status as "active" | "completed" | "abandoned",
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          unitPrice: item.unitPrice,
          compareAtPrice: item.compareAtPrice,
          quantity: item.quantity,
        })),
      };
    });
  }

  /**
   * Create a new cart
   */
  async create(tenantId: string, data?: CartCreateInput): Promise<CartWithItems> {
    return withTenant(tenantId, async (tx) => {
      const [cart] = await tx
        .insert(carts)
        .values({
          tenantId,
          currency: data?.currency || "USD",
          customerId: data?.customerId,
          email: data?.email,
          status: "active",
        })
        .returning();

      return {
        ...cart,
        status: cart.status as "active" | "completed" | "abandoned",
        items: [],
      };
    });
  }

  /**
   * Update cart
   */
  async update(tenantId: string, cartId: string, data: CartUpdateInput): Promise<CartWithItems | null> {
    return withTenant(tenantId, async (tx) => {
      const [cart] = await tx
        .update(carts)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cartId))
        .returning();

      if (!cart) {
        return null;
      }

      const items = await tx
        .select()
        .from(cartItems)
        .where(eq(cartItems.cartId, cartId))
        .orderBy(cartItems.createdAt);

      return {
        ...cart,
        status: cart.status as "active" | "completed" | "abandoned",
        items: items.map((item) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          productSku: item.productSku,
          productImage: item.productImage,
          unitPrice: item.unitPrice,
          compareAtPrice: item.compareAtPrice,
          quantity: item.quantity,
        })),
      };
    });
  }

  /**
   * Add item to cart
   */
  async addItem(tenantId: string, cartId: string, data: CartItemCreateInput): Promise<CartItemData> {
    return withTenant(tenantId, async (tx) => {
      // Check if item already exists
      const whereCondition = data.variantId
        ? and(
            eq(cartItems.cartId, cartId),
            eq(cartItems.productId, data.productId),
            eq(cartItems.variantId, data.variantId)
          )
        : and(
            eq(cartItems.cartId, cartId),
            eq(cartItems.productId, data.productId),
            sql`${cartItems.variantId} IS NULL`
          );

      const [existing] = await tx
        .select()
        .from(cartItems)
        .where(whereCondition)
        .limit(1);

      if (existing) {
        // Update quantity
        const [updated] = await tx
          .update(cartItems)
          .set({
            quantity: existing.quantity + data.quantity,
            updatedAt: new Date(),
          })
          .where(eq(cartItems.id, existing.id))
          .returning();

        return {
          id: updated.id,
          productId: updated.productId,
          variantId: updated.variantId,
          productName: updated.productName,
          productSku: updated.productSku,
          productImage: updated.productImage,
          unitPrice: updated.unitPrice,
          compareAtPrice: updated.compareAtPrice,
          quantity: updated.quantity,
        };
      }

      // Insert new item
      const [item] = await tx
        .insert(cartItems)
        .values({
          cartId,
          productId: data.productId,
          variantId: data.variantId || null,
          productName: data.productName,
          productSku: data.productSku || null,
          productImage: data.productImage || null,
          unitPrice: data.unitPrice,
          compareAtPrice: data.compareAtPrice || null,
          quantity: data.quantity,
        })
        .returning();

      // Recalculate cart totals
      await this.recalculateTotals(tx, cartId);

      return {
        id: item.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        productSku: item.productSku,
        productImage: item.productImage,
        unitPrice: item.unitPrice,
        compareAtPrice: item.compareAtPrice,
        quantity: item.quantity,
      };
    });
  }

  /**
   * Update cart item quantity
   */
  async updateItemQuantity(
    tenantId: string,
    cartId: string,
    itemId: string,
    quantity: number
  ): Promise<CartItemData | null> {
    return withTenant(tenantId, async (tx) => {
      // Verify item belongs to cart
      const [existing] = await tx
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
        .limit(1);

      if (!existing) {
        return null;
      }

      if (quantity <= 0) {
        // Delete item
        await tx.delete(cartItems).where(eq(cartItems.id, itemId));
        await this.recalculateTotals(tx, cartId);
        return null;
      }

      const [updated] = await tx
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, itemId))
        .returning();

      await this.recalculateTotals(tx, cartId);

      return {
        id: updated.id,
        productId: updated.productId,
        variantId: updated.variantId,
        productName: updated.productName,
        productSku: updated.productSku,
        productImage: updated.productImage,
        unitPrice: updated.unitPrice,
        compareAtPrice: updated.compareAtPrice,
        quantity: updated.quantity,
      };
    });
  }

  /**
   * Remove item from cart
   */
  async removeItem(tenantId: string, cartId: string, itemId: string): Promise<boolean> {
    return withTenant(tenantId, async (tx) => {
      // Verify item belongs to cart
      const [existing] = await tx
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.id, itemId), eq(cartItems.cartId, cartId)))
        .limit(1);

      if (!existing) {
        return false;
      }

      await tx.delete(cartItems).where(eq(cartItems.id, itemId));
      await this.recalculateTotals(tx, cartId);

      return true;
    });
  }

  /**
   * Clear all items from cart
   */
  async clearItems(tenantId: string, cartId: string): Promise<void> {
    return withTenant(tenantId, async (tx) => {
      await tx.delete(cartItems).where(eq(cartItems.cartId, cartId));
      await tx
        .update(carts)
        .set({
          subtotal: "0",
          total: "0",
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cartId));
    });
  }

  /**
   * Mark cart as completed
   */
  async complete(tenantId: string, cartId: string): Promise<void> {
    return withTenant(tenantId, async (tx) => {
      await tx
        .update(carts)
        .set({
          status: "completed",
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cartId));
    });
  }

  /**
   * Apply discount to cart
   */
  async applyDiscount(
    tenantId: string,
    cartId: string,
    discountId: string,
    voucherCodeId: string,
    voucherCode: string,
    discountAmount: number
  ): Promise<void> {
    return withTenant(tenantId, async (tx) => {
      await tx
        .update(carts)
        .set({
          discountId,
          voucherCodeId,
          voucherCode,
          discountTotal: String(discountAmount),
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cartId));

      await this.recalculateTotals(tx, cartId);
    });
  }

  /**
   * Remove discount from cart
   */
  async removeDiscount(tenantId: string, cartId: string): Promise<void> {
    return withTenant(tenantId, async (tx) => {
      await tx
        .update(carts)
        .set({
          discountId: null,
          voucherCodeId: null,
          voucherCode: null,
          discountTotal: "0",
          updatedAt: new Date(),
        })
        .where(eq(carts.id, cartId));

      await this.recalculateTotals(tx, cartId);
    });
  }

  /**
   * Recalculate cart totals (internal helper)
   */
  private async recalculateTotals(tx: any, cartId: string): Promise<void> {
    // Get cart discount info
    const [cart] = await tx
      .select({
        discountTotal: carts.discountTotal,
        shippingTotal: carts.shippingTotal,
        taxTotal: carts.taxTotal,
      })
      .from(carts)
      .where(eq(carts.id, cartId))
      .limit(1);

    // Get all items
    const items = await tx
      .select({
        unitPrice: cartItems.unitPrice,
        quantity: cartItems.quantity,
      })
      .from(cartItems)
      .where(eq(cartItems.cartId, cartId));

    const subtotal = items.reduce(
      (sum: number, item: { unitPrice: string; quantity: number }) =>
        sum + Number(item.unitPrice) * item.quantity,
      0
    );

    const discountTotal = Number(cart?.discountTotal || 0);
    const shippingTotal = Number(cart?.shippingTotal || 0);
    const taxTotal = Number(cart?.taxTotal || 0);
    const total = subtotal - discountTotal + shippingTotal + taxTotal;

    await tx
      .update(carts)
      .set({
        subtotal: String(subtotal),
        total: String(Math.max(0, total)),
        updatedAt: new Date(),
      })
      .where(eq(carts.id, cartId));
  }
}

// Singleton instance
export const cartRepository = new CartRepository();
