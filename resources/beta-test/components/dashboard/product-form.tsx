"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Product, Category, ProductImage } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Upload, X } from "lucide-react"
import Image from "next/image"

interface ProductFormProps {
  tenantId: string
  categories: Pick<Category, "id" | "name">[]
  product?: Product
}

export function ProductForm({ tenantId, categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [name, setName] = useState(product?.name || "")
  const [slug, setSlug] = useState(product?.slug || "")
  const [description, setDescription] = useState(product?.description || "")
  const [categoryId, setCategoryId] = useState(product?.category_id || "0")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() || "")
  const [costPrice, setCostPrice] = useState(product?.cost_price?.toString() || "")
  const [sku, setSku] = useState(product?.sku || "")
  const [barcode, setBarcode] = useState(product?.barcode || "")
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || "0")
  const [trackQuantity, setTrackQuantity] = useState(product?.track_quantity ?? true)
  const [allowBackorder, setAllowBackorder] = useState(product?.allow_backorder ?? false)
  const [weight, setWeight] = useState(product?.weight?.toString() || "")
  const [status, setStatus] = useState<"draft" | "active" | "archived">(product?.status || "draft")
  const [images, setImages] = useState<ProductImage[]>(product?.images || [])

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!product) {
      setSlug(generateSlug(value))
    }
  }

  const handleImageUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return

      setIsUploading(true)

      try {
        const uploadPromises = Array.from(files).map(async (file) => {
          const formData = new FormData()
          formData.append("file", file)

          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!response.ok) throw new Error("Upload failed")

          const data = await response.json()
          return {
            url: data.url,
            alt: file.name,
            position: images.length,
          }
        })

        const newImages = await Promise.all(uploadPromises)
        setImages((prev) => [...prev, ...newImages])
        toast.success(`${newImages.length} image(s) uploaded`)
      } catch (error) {
        toast.error("Failed to upload image(s)")
      } finally {
        setIsUploading(false)
      }
    },
    [images.length],
  )

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const productData = {
        tenant_id: tenantId,
        name,
        slug,
        description: description || null,
        category_id: categoryId || null,
        price: Number.parseFloat(price) || 0,
        compare_at_price: compareAtPrice ? Number.parseFloat(compareAtPrice) : null,
        cost_price: costPrice ? Number.parseFloat(costPrice) : null,
        sku: sku || null,
        barcode: barcode || null,
        quantity: Number.parseInt(quantity) || 0,
        track_quantity: trackQuantity,
        allow_backorder: allowBackorder,
        weight: weight ? Number.parseFloat(weight) : null,
        status,
        images,
      }

      if (product) {
        const { error } = await supabase.from("products").update(productData).eq("id", product.id)

        if (error) throw error
        toast.success("Product updated")
      } else {
        const { error } = await supabase.from("products").insert(productData)

        if (error) throw error
        toast.success("Product created")
      }

      router.push("/dashboard/products")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Product name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL slug</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    placeholder="product-url-slug"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Images */}
          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                {images.map((image, index) => (
                  <div key={index} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                    <Image src={image.url || "/placeholder.svg"} alt={image.alt} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute right-2 top-2 rounded-full bg-background/80 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 transition-colors hover:bg-muted">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="text-center">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
                    </div>
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Upload images</p>
                    </div>
                  )}
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Pricing */}
          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="compare-price">Compare-at price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="compare-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cost-price">Cost per item</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="cost-price"
                      type="number"
                      step="0.01"
                      min="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory */}
          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Stock keeping unit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input
                    id="barcode"
                    value={barcode}
                    onChange={(e) => setBarcode(e.target.value)}
                    placeholder="UPC, EAN, etc."
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    disabled={!trackQuantity}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="track-quantity">Track quantity</Label>
                  <p className="text-sm text-muted-foreground">Keep track of inventory levels</p>
                </div>
                <Switch id="track-quantity" checked={trackQuantity} onCheckedChange={setTrackQuantity} />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="allow-backorder">Allow backorders</Label>
                  <p className="text-sm text-muted-foreground">Continue selling when out of stock</p>
                </div>
                <Switch id="allow-backorder" checked={allowBackorder} onCheckedChange={setAllowBackorder} />
              </div>
            </CardContent>
          </Card>

          {/* Shipping */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.01"
                    min="0"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={status} onValueChange={(value: "draft" | "active" | "archived") => setStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">Uncategorized</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? "Saving..." : product ? "Update product" : "Create product"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()} className="w-full">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
