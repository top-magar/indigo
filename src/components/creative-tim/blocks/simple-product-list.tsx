"use client"

import * as React from "react"
import { ArrowRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const PRODUCTS = [
  {
    id: 1,
    name: "Premium Suit",
    category: "Permanent Collection",
    price: "$1100",
    originalPrice: null,
    image: "https://v3.material-tailwind.com/coat-1.png",
    colors: [
      "bg-slate-950",
      "bg-white border border-slate-200",
      "bg-slate-200 border border-slate-200",
    ],
  },
  {
    id: 2,
    name: "Wool Suit",
    category: "Permanent Collection",
    price: "$1,300",
    originalPrice: "$2,300",
    image: "https://v3.material-tailwind.com/coat-2.png",
    colors: [
      "bg-slate-950",
      "bg-white border border-slate-200",
      "bg-slate-200 border border-slate-200",
    ],
  },
  {
    id: 3,
    name: "Cotton Suit",
    category: "Permanent Collection",
    price: "$790",
    originalPrice: null,
    image: "https://v3.material-tailwind.com/coat-3.png",
    colors: [
      "bg-slate-950",
      "bg-white border border-slate-200",
      "bg-slate-200 border border-slate-200",
    ],
  },
  {
    id: 4,
    name: "Linen Suit",
    category: "Sale",
    price: "$1,000",
    originalPrice: "$2,500",
    image: "https://v3.material-tailwind.com/coat-4.png",
    colors: [
      "bg-slate-950",
      "bg-white border border-slate-200",
      "bg-slate-200 border border-slate-200",
    ],
  },
]

export default function SimpleProductList() {
  const [selectedColors, setSelectedColors] = React.useState<
    Record<number, number>
  >({})

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 flex items-center justify-between gap-4">
          <h2 className="text-2xl font-bold md:text-3xl">Latest Products</h2>
          <Button variant="ghost" className="gap-2">
            See All
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map((product) => (
            <Card
              key={product.id}
              className="group overflow-hidden transition-all hover:shadow-lg"
            >
              <CardContent className="p-0">
                <div className="relative p-6">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="mx-auto h-64 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="space-y-4 p-6">
                  <div className="space-y-2">
                    {product.category === "Sale" ? (
                      <Badge variant="destructive" className="text-xs">
                        Sale
                      </Badge>
                    ) : (
                      <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                        {product.category}
                      </p>
                    )}
                    <h3 className="text-lg font-semibold">{product.name}</h3>
                  </div>

                  <div className="flex items-center justify-center gap-2">
                    {product.colors.map((colorClass, index) => (
                      <button
                        key={index}
                        onClick={() =>
                          setSelectedColors({
                            ...selectedColors,
                            [product.id]: index,
                          })
                        }
                        className={`h-6 w-6 cursor-pointer rounded-full transition-all hover:scale-110 ${colorClass} ${
                          selectedColors[product.id] === index
                            ? "ring-primary ring-2 ring-offset-2"
                            : ""
                        }`}
                        aria-label={`Select color ${index + 1}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 border-t pt-4">
                    {product.originalPrice && (
                      <p className="text-muted-foreground text-sm line-through">
                        {product.originalPrice}
                      </p>
                    )}
                    <p className="text-xl font-bold">{product.price}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
