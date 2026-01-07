"use client"

import { type ReactNode } from "react"
import { CartContext } from "./cart-provider"
import type { Cart } from "@/features/store/data/cart"

/**
 * EditorCartProvider - A mock cart provider for the visual editor.
 * 
 * This provider is used in the visual editor's inline preview to provide
 * a static cart context without requiring actual cart functionality.
 * It prevents the "useCart must be used within a CartProvider" error
 * when rendering header components in the editor.
 */

interface EditorCartProviderProps {
  children: ReactNode
  itemCount?: number
}

/**
 * EditorCartProvider provides a mock cart context for the visual editor.
 * Cart operations are no-ops since the editor is for preview purposes only.
 * Uses the same CartContext as the real CartProvider so useCart() works.
 */
export function EditorCartProvider({ children, itemCount = 0 }: EditorCartProviderProps) {
  // Mock cart with no items (or specified item count for display)
  const mockCart: Cart = {
    id: "editor-mock-cart",
    tenantId: "editor",
    customerId: null,
    email: null,
    items: [],
    subtotal: 0,
    discountTotal: 0,
    shippingTotal: 0,
    taxTotal: 0,
    total: 0,
    currency: "USD",
    shippingAddress: null,
    billingAddress: null,
    status: "active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // No-op functions for cart operations in editor mode
  const addItem = async () => {
    // No-op in editor mode
  }

  const updateItem = async () => {
    // No-op in editor mode
  }

  const removeItem = async () => {
    // No-op in editor mode
  }

  const clear = async () => {
    // No-op in editor mode
  }

  return (
    <CartContext.Provider
      value={{
        cart: mockCart,
        tenantId: "editor",
        isPending: false,
        addItem,
        updateItem,
        removeItem,
        clear,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}
