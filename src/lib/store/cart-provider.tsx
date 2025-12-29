"use client"

import { createContext, useContext, useOptimistic, useTransition, type ReactNode } from "react"
import { addToCart, updateCartItem, removeFromCart, clearCart } from "@/lib/data/cart"
import type { Cart, CartItem } from "@/lib/data/cart"

interface CartContextType {
  cart: Cart | null
  tenantId: string
  isPending: boolean
  addItem: (
    productId: string,
    quantity: number,
    product: {
      name: string
      sku?: string
      image?: string
      price: number
      compareAtPrice?: number
      variantId?: string
    }
  ) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  clear: () => Promise<void>
  itemCount: number
}

// Export the context so EditorCartProvider can provide the same interface
export const CartContext = createContext<CartContextType | null>(null)

interface CartProviderProps {
  children: ReactNode
  tenantId: string
  initialCart: Cart | null
}

export function CartProvider({ children, tenantId, initialCart }: CartProviderProps) {
  const [isPending, startTransition] = useTransition()
  const [optimisticCart, setOptimisticCart] = useOptimistic(initialCart)

  const addItem = async (
    productId: string,
    quantity: number,
    product: {
      name: string
      sku?: string
      image?: string
      price: number
      compareAtPrice?: number
      variantId?: string
    }
  ) => {
    // Optimistic update
    startTransition(() => {
      if (optimisticCart) {
        const existingItem = optimisticCart.items.find(
          (item) => item.productId === productId && item.variantId === (product.variantId || null)
        )

        if (existingItem) {
          setOptimisticCart({
            ...optimisticCart,
            items: optimisticCart.items.map((item) =>
              item.id === existingItem.id
                ? { ...item, quantity: item.quantity + quantity, subtotal: (item.quantity + quantity) * item.unitPrice }
                : item
            ),
            subtotal: optimisticCart.subtotal + product.price * quantity,
            total: optimisticCart.total + product.price * quantity,
          })
        } else {
          const newItem: CartItem = {
            id: `temp-${Date.now()}`,
            productId,
            variantId: product.variantId || null,
            productName: product.name,
            productSku: product.sku || null,
            productImage: product.image || null,
            unitPrice: product.price,
            compareAtPrice: product.compareAtPrice || null,
            quantity,
            subtotal: product.price * quantity,
          }
          setOptimisticCart({
            ...optimisticCart,
            items: [...optimisticCart.items, newItem],
            subtotal: optimisticCart.subtotal + product.price * quantity,
            total: optimisticCart.total + product.price * quantity,
          })
        }
      }
    })

    // Server action
    await addToCart(tenantId, productId, quantity, {
      productName: product.name,
      productSku: product.sku,
      productImage: product.image,
      unitPrice: product.price,
      compareAtPrice: product.compareAtPrice,
      variantId: product.variantId,
    })
  }

  const updateItem = async (itemId: string, quantity: number) => {
    // Optimistic update
    startTransition(() => {
      if (optimisticCart) {
        if (quantity <= 0) {
          const item = optimisticCart.items.find((i) => i.id === itemId)
          if (item) {
            setOptimisticCart({
              ...optimisticCart,
              items: optimisticCart.items.filter((i) => i.id !== itemId),
              subtotal: optimisticCart.subtotal - item.subtotal,
              total: optimisticCart.total - item.subtotal,
            })
          }
        } else {
          setOptimisticCart({
            ...optimisticCart,
            items: optimisticCart.items.map((item) => {
              if (item.id === itemId) {
                const newSubtotal = item.unitPrice * quantity
                return { ...item, quantity, subtotal: newSubtotal }
              }
              return item
            }),
          })
        }
      }
    })

    // Server action
    await updateCartItem(tenantId, itemId, quantity)
  }

  const removeItem = async (itemId: string) => {
    await updateItem(itemId, 0)
  }

  const clear = async () => {
    // Optimistic update
    startTransition(() => {
      if (optimisticCart) {
        setOptimisticCart({
          ...optimisticCart,
          items: [],
          subtotal: 0,
          total: 0,
        })
      }
    })

    // Server action
    await clearCart(tenantId)
  }

  const itemCount = optimisticCart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0

  return (
    <CartContext.Provider
      value={{
        cart: optimisticCart,
        tenantId,
        isPending,
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

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
