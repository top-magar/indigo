"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import type { Product, CartItem, Cart } from "@/lib/supabase/types"

interface CartContextType {
  cart: Cart
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
}

const CartContext = createContext<CartContextType | null>(null)

const CART_STORAGE_KEY = "indigo_cart"

export function CartProvider({ children, tenantSlug }: { children: ReactNode; tenantSlug: string }) {
  const [cart, setCart] = useState<Cart>({ items: [], subtotal: 0, total: 0 })
  const storageKey = `${CART_STORAGE_KEY}_${tenantSlug}`

  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey)
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch {
        localStorage.removeItem(storageKey)
      }
    }
  }, [storageKey])

  const saveCart = useCallback(
    (newCart: Cart) => {
      setCart(newCart)
      localStorage.setItem(storageKey, JSON.stringify(newCart))
    },
    [storageKey]
  )

  const calculateTotals = useCallback((items: CartItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + Number(item.product.price) * item.quantity, 0)
    return { items, subtotal, total: subtotal }
  }, [])

  const addToCart = useCallback(
    (product: Product, quantity = 1) => {
      const existingIndex = cart.items.findIndex((item) => item.product.id === product.id)

      let newItems: CartItem[]
      if (existingIndex >= 0) {
        newItems = cart.items.map((item, index) =>
          index === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
        )
      } else {
        newItems = [...cart.items, { product, quantity }]
      }

      saveCart(calculateTotals(newItems))
    },
    [cart.items, saveCart, calculateTotals]
  )

  const removeFromCart = useCallback(
    (productId: string) => {
      const newItems = cart.items.filter((item) => item.product.id !== productId)
      saveCart(calculateTotals(newItems))
    },
    [cart.items, saveCart, calculateTotals]
  )

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity <= 0) {
        removeFromCart(productId)
        return
      }

      const newItems = cart.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
      saveCart(calculateTotals(newItems))
    },
    [cart.items, saveCart, calculateTotals, removeFromCart]
  )

  const clearCart = useCallback(() => {
    saveCart({ items: [], subtotal: 0, total: 0 })
  }, [saveCart])

  const itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, itemCount }}>
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
