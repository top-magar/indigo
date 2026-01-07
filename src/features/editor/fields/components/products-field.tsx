"use client"

import { useState, useEffect, useCallback, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Search01Icon,
  ShoppingBag01Icon,
  Add01Icon,
  Cancel01Icon,
  Loading03Icon,
  CheckmarkCircle02Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"
import {
  getEditorProducts,
  getEditorProductsByIds,
  type EditorProduct,
} from "@/app/(editor)/storefront/data-actions"
import type { ProductsField as ProductsFieldConfig } from "../types"

interface ProductsFieldProps {
  config: ProductsFieldConfig
  value: string[]
  onChange: (value: string[]) => void
}

export function ProductsField({ config, value = [], onChange }: ProductsFieldProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const [products, setProducts] = useState<EditorProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<EditorProduct[]>([])
  const [tempSelection, setTempSelection] = useState<string[]>([])
  const [isPending, startTransition] = useTransition()
  const [isLoadingSelected, setIsLoadingSelected] = useState(false)

  // Fetch products when dialog opens
  useEffect(() => {
    if (open) {
      setTempSelection(value)
      startTransition(async () => {
        const data = await getEditorProducts()
        setProducts(data)
      })
    }
  }, [open, value])

  // Fetch selected products info on mount
  useEffect(() => {
    if (value.length > 0 && selectedProducts.length === 0) {
      setIsLoadingSelected(true)
      getEditorProductsByIds(value)
        .then((products) => setSelectedProducts(products))
        .finally(() => setIsLoadingSelected(false))
    }
  }, [value, selectedProducts.length])

  // Search products
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

  const handleToggle = (productId: string) => {
    const isSelected = tempSelection.includes(productId)
    if (isSelected) {
      setTempSelection(tempSelection.filter((id) => id !== productId))
    } else {
      if (config.maxItems && tempSelection.length >= config.maxItems) {
        return // Max items reached
      }
      setTempSelection([...tempSelection, productId])
    }
  }

  const handleConfirm = () => {
    onChange(tempSelection)
    // Update selected products display
    const newSelected = products.filter((p) => tempSelection.includes(p.id))
    const existingSelected = selectedProducts.filter((p) => tempSelection.includes(p.id))
    const combined = [...existingSelected]
    newSelected.forEach((p) => {
      if (!combined.find((e) => e.id === p.id)) {
        combined.push(p)
      }
    })
    setSelectedProducts(combined)
    setOpen(false)
  }

  const handleRemove = (productId: string) => {
    onChange(value.filter((id) => id !== productId))
    setSelectedProducts(selectedProducts.filter((p) => p.id !== productId))
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-sm">{config.label}</Label>
        {config.maxItems && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{config.maxItems}
          </span>
        )}
      </div>

      {isLoadingSelected ? (
        <div className="flex flex-wrap gap-2 p-2 rounded-lg border bg-muted/30">
          {[...Array(Math.min(value.length, 3))].map((_, i) => (
            <Skeleton key={i} className="h-6 w-20 rounded-full" />
          ))}
        </div>
      ) : selectedProducts.length > 0 ? (
        <div className="flex flex-wrap gap-2 p-2 rounded-lg border bg-muted/30">
          {selectedProducts.map((product) => (
            <Badge
              key={product.id}
              variant="secondary"
              className="gap-1.5 pr-1 pl-2"
            >
              {product.image && (
                <img
                  src={product.image}
                  alt=""
                  className="h-4 w-4 rounded object-cover -ml-1"
                />
              )}
              <span className="max-w-[100px] truncate">{product.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(product.id)}
                className="ml-0.5 hover:bg-muted rounded-full p-0.5"
              >
                <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className="w-full">
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
            {selectedProducts.length > 0 ? "Edit Selection" : "Add Products"}
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Products</DialogTitle>
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

            {tempSelection.length > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {tempSelection.length} selected
                  {config.maxItems && ` of ${config.maxItems} max`}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setTempSelection([])}
                >
                  Clear all
                </Button>
              </div>
            )}

            <ScrollArea className="h-[300px]">
              {isPending && products.length === 0 ? (
                <div className="space-y-2 p-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-2">
                      <Skeleton className="h-5 w-5 rounded" />
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
                </div>
              ) : (
                <div className="space-y-1 p-1">
                  {filteredProducts.map((product) => {
                    const isSelected = tempSelection.includes(product.id)
                    const isDisabled =
                      !isSelected &&
                      config.maxItems !== undefined &&
                      tempSelection.length >= config.maxItems

                    return (
                      <button
                        key={product.id}
                        type="button"
                        className={cn(
                          "w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left",
                          isSelected
                            ? "bg-primary/10 ring-1 ring-primary/20"
                            : isDisabled
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-muted"
                        )}
                        onClick={() => !isDisabled && handleToggle(product.id)}
                        disabled={isDisabled}
                      >
                        <Checkbox
                          checked={isSelected}
                          className="pointer-events-none"
                        />
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
                          <p className="font-medium text-sm truncate">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatPrice(product.price)}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirm}>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4 mr-2" />
              Confirm ({tempSelection.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {config.description && (
        <p className="text-xs text-muted-foreground">{config.description}</p>
      )}
    </div>
  )
}
