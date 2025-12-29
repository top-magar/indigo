"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type CartItem = {
    id: string; // Product ID (for now we assume 1 variant or just storing product info)
    variantId?: string; // Optional if we get fancy
    name: string;
    price: number;
    quantity: number;
};

type CartContextType = {
    items: CartItem[];
    addToCart: (item: Omit<CartItem, "quantity">) => void;
    removeFromCart: (id: string) => void;
    clearCart: () => void;
    cartTotal: number;
    itemCount: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);

    // Determine initial state if needed (e.g. from local storage) - skipping for simplicity/hydration safety
    // or useEffect to load from localStorage
    useEffect(() => {
        const stored = localStorage.getItem("indigo_cart");
        if (stored) {
            try {
                setItems(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("indigo_cart", JSON.stringify(items));
    }, [items]);

    const addToCart = (newItem: Omit<CartItem, "quantity">) => {
        setItems((prev) => {
            const existing = prev.find((i) => i.id === newItem.id);
            if (existing) {
                return prev.map((i) =>
                    i.id === newItem.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [...prev, { ...newItem, quantity: 1 }];
        });
    };

    const removeFromCart = (id: string) => {
        setItems((prev) => prev.filter((i) => i.id !== id));
    };

    const clearCart = () => setItems([]);

    const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{ items, addToCart, removeFromCart, clearCart, cartTotal, itemCount }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
