"use client"

import { useContext, useTransition } from "react"
import { CartContext } from "@/features/store/cart-provider"

interface AddToCartButtonProps {
  productId: string
  productName: string
  price: number
  image?: string
  text?: string
  className?: string
  style?: React.CSSProperties
}

export function AddToCartButton({
  productId, productName, price, image,
  text = "Add to Cart", className, style,
}: AddToCartButtonProps) {
  const cart = useContext(CartContext)
  const [pending, startTransition] = useTransition()

  if (!cart) {
    // Outside CartProvider (e.g., in editor) — render inert button
    return <button className={className} style={style} onClick={(e) => e.preventDefault()}>{text}</button>
  }

  const handleClick = () => {
    startTransition(async () => {
      await cart.addItem(productId, 1, { name: productName, price, image })
    })
  }

  return (
    <button className={className} style={style} onClick={handleClick} disabled={pending}>
      {pending ? "Adding…" : text}
    </button>
  )
}
