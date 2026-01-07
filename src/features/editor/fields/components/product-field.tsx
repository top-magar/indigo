"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ShoppingBag01Icon,
  Cancel01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import {
  getEditorProducts,
  getEditorProductById,
  type EditorProduct,
} from "@/app/(editor)/storefront/data-actions"
import type { ProductField as ProductFieldConfig } from "../types"

interface ProductFieldProps {
  config: ProductFieldConfig
  value: string
  onChange: (value: string) => void
}

export function ProductField({ config, value, onChange }: ProductFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<EditorProduct[]>([])
  const [selectedProduct, setSelectedProduct] = useState<EditorProduct | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isLoadingSelected, setIsLoadingSelected] = useState(false)

  // Fetch products when dialog opens
  useEffect(() => {
    if (open) {
      startTransition(async () => {
        const data = await getEditorProducts()
        setProducts(data)
      })
    }
  }, [open])

  // Fetch selected product info on mount
  useEffect(() => {
    if (value && !selectedProduct) {
      setIsLoadingSelected(true)
      getEditorProductById(value)
        .then((product) => {
          if (product) setSelectedProduct(product)
        })
        .finally(() => setIsLoadingSelected(false))
    }
  }, [value, selectedProduct])

  // Search products with debounce
  const handleSearch = useCallback((query: string) => {
    setSearch(query)
    startTransition(async () => {
      const data = await getEditorProducts(query || undefined)
      setProducts(data)
    })
  }, [])

  const filteredProducts = search
    ? products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    : products

  const handleSelect = (product: EditorProduct) => {
    onChange(product.id)
    setSelectedProduct(product)
    setOpen(false)
  }

  const handleClear = () => {
    onChange("")
    setSelectedProduct(null)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">{config.label}</Label>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start h-auto py-2 px-3"
            disabled={isLoadingSelected}
          >
            {isLoadingSelected ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ) : selectedProduct ? (
              <div className="flex items-center gap-3 w-full">
                {selectedProduct.image ? (
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="h-10 w-10 rounded object-cover shrink-0"
                  />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                    <HugeiconsIcon
                      icon={ShoppingBag01Icon}
                      className="h-5 w-5 text-muted-foreground"
                    />
                  </div>
                )}
                <div className="text-left flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{selectedProduct.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPrice(selectedProduct.price)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleClear()
                  }}
                >
                  <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-muted-foreground">
                <HugeiconsIcon icon={ShoppingBag01Icon} className="h-4 w-4" />
                <span>Select a product...</span>
              </div>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Product</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products..."
                className="pl-9"
              />
              {isPending && (
                <HugeiconsIcon
                  icon={Loading03Icon}
                  className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin"
                />
              )}
            </div>
            <ScrollArea className="h-[300px]">
              {isPending && products.length === 0 ? (
                <div className="space-y-2 p-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <HugeiconsIcon
                    icon={ShoppingBag01Icon}
                    className="h-10 w-10 text-muted-foreground/50 mb-2"
                  />
                  <p className="text-sm text-muted-foreground">
                    {search ? "No products found" : "No products available"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {search
                      ? "Try a different search term"
                      : "Add products in the dashboard first"}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      className={cn(
                        "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                        value === product.id
                          ? "bg-primary/10 ring-1 ring-primary/20"
                          : "hover:bg-muted"
                      )}
                      onClick={() => handleSelect(product)}
                    >
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-10 w-10 rounded object-cover shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center shrink-0">
                          <HugeiconsIcon
                            icon={ShoppingBag01Icon}
                            className="h-5 w-5 text-muted-foreground"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
