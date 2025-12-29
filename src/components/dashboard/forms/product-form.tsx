"use client"

import type React from "react"
import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Product, Category, ProductImage } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon, Cancel01Icon, Image01Icon, AlertCircleIcon, Add01Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"
import { useCharacterLimit } from "@/hooks/use-character-limit"
import { useFileUpload } from "@/hooks/use-file-upload"
import { cn } from "@/lib/utils"

interface ProductFormProps {
  tenantId: string
  categories: Pick<Category, "id" | "name">[]
  product?: Product
}

export function ProductForm({ tenantId, categories, product }: ProductFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState(product?.name || "")
  const [slug, setSlug] = useState(product?.slug || "")
  const [categoryId, setCategoryId] = useState(product?.category_id || "")
  const [price, setPrice] = useState(product?.price?.toString() || "")
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compare_at_price?.toString() || "")
  const [costPrice, setCostPrice] = useState(product?.cost_price?.toString() || "")
  const [sku, setSku] = useState(product?.sku || "")

  // Character limit for description
  const descriptionLimit = useCharacterLimit({
    maxLength: 500,
    initialValue: product?.description || "",
  })

  // File upload hook for images
  const maxSizeMB = 5
  const maxSize = maxSizeMB * 1024 * 1024
  const maxFiles = 6

  const initialFiles = product?.images?.map((img, index) => ({
    id: `image-${index}-${Date.now()}`,
    name: img.alt || `image-${index}.jpg`,
    size: 0,
    type: "image/jpeg",
    url: img.url,
    preview: img.url,
  })) || []

  const [
    { files, isDragging, error: uploadError },
    {
      removeFile,
      openFileDialog,
      getInputProps,
      getRootProps,
    },
  ] = useFileUpload({
    accept: "image/png,image/jpeg,image/jpg,image/gif,image/webp",
    initialFiles,
    maxFiles,
    maxSize,
    onUpload: async (filesToUpload) => {
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) throw new Error("Upload failed")

        const data = await response.json()
        return {
          id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          url: data.url,
          preview: data.url,
        }
      })

      const uploaded = await Promise.all(uploadPromises)
      toast.success(`${uploaded.length} image(s) uploaded`)
      return uploaded
    },
    onError: (error) => toast.error(error),
  })
  const [barcode, setBarcode] = useState(product?.barcode || "")
  const [quantity, setQuantity] = useState(product?.quantity?.toString() || "0")
  const [trackQuantity, setTrackQuantity] = useState(product?.track_quantity ?? true)
  const [allowBackorder, setAllowBackorder] = useState(product?.allow_backorder ?? false)
  const [weight, setWeight] = useState(product?.weight?.toString() || "")
  const [status, setStatus] = useState<"draft" | "active" | "archived">(product?.status || "draft")
  const [hasVariants, setHasVariants] = useState(false)

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

  // Convert files to ProductImage format for submission
  const getImagesForSubmission = useCallback((): ProductImage[] => {
    return files.map((file, index) => ({
      url: file.url || file.preview || "",
      alt: file.name.replace(/\.[^/.]+$/, ""),
      position: index,
    }))
  }, [files])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const productData = {
        tenant_id: tenantId,
        name,
        slug,
        description: descriptionLimit.value || null,
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
        images: getImagesForSubmission(),
        has_variants: hasVariants,
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="description">Description</Label>
                  <span className={cn(
                    "text-xs",
                    descriptionLimit.isNearLimit ? "text-chart-4" : "text-muted-foreground",
                    descriptionLimit.isAtLimit && "text-destructive"
                  )}>
                    {descriptionLimit.characterCount}/{descriptionLimit.maxLength}
                  </span>
                </div>
                <Textarea
                  id="description"
                  value={descriptionLimit.value}
                  onChange={descriptionLimit.handleChange}
                  placeholder="Product description"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Images</CardTitle>
              <CardDescription>
                Add up to {maxFiles} images. PNG, JPG, GIF or WebP (max. {maxSizeMB}MB each)
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Drop area */}
              <div
                {...getRootProps()}
                className={cn(
                  "relative flex min-h-52 flex-col items-center overflow-hidden rounded-xl border border-input border-dashed p-4 transition-colors",
                  "has-[input:focus]:border-ring has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50",
                  isDragging && "bg-accent/50 border-primary",
                  files.length > 0 ? "justify-start" : "justify-center"
                )}
              >
                <input
                  {...getInputProps()}
                  aria-label="Upload product images"
                  className="sr-only"
                />
                {files.length > 0 ? (
                  <div className="flex w-full flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="truncate font-medium text-sm">
                        Uploaded Images ({files.length}/{maxFiles})
                      </h3>
                      <Button
                        type="button"
                        disabled={files.length >= maxFiles}
                        onClick={openFileDialog}
                        size="sm"
                        variant="outline"
                      >
                        <HugeiconsIcon icon={Add01Icon} className="-ms-0.5 size-3.5 opacity-60" />
                        Add more
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                      {files.map((file) => (
                        <div
                          className="relative aspect-square rounded-lg bg-muted overflow-hidden group"
                          key={file.id}
                        >
                          <Image
                            alt={file.name}
                            src={file.preview || file.url || "/placeholder.svg"}
                            fill
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            aria-label="Remove image"
                            className="-top-2 -right-2 absolute size-6 rounded-full border-2 border-background shadow-none focus-visible:border-background opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFile(file.id)}
                            size="icon"
                            variant="destructive"
                          >
                            <HugeiconsIcon icon={Cancel01Icon} className="size-3.5" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
                    <div
                      aria-hidden="true"
                      className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
                    >
                      <HugeiconsIcon icon={Image01Icon} className="size-4 opacity-60" />
                    </div>
                    <p className="mb-1.5 font-medium text-sm">Drop your images here</p>
                    <p className="text-muted-foreground text-xs">
                      PNG, JPG, GIF or WebP (max. {maxSizeMB}MB)
                    </p>
                    <Button type="button" className="mt-4" onClick={openFileDialog} variant="outline">
                      <HugeiconsIcon icon={Upload01Icon} className="-ms-1 opacity-60" />
                      Select images
                    </Button>
                  </div>
                )}
              </div>

              {uploadError && (
                <div
                  className="flex items-center gap-1 text-destructive text-xs mt-2"
                  role="alert"
                >
                  <HugeiconsIcon icon={AlertCircleIcon} className="size-3 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader>
              <CardTitle>Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" value={sku} onChange={(e) => setSku(e.target.value)} placeholder="Stock keeping unit" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode</Label>
                  <Input id="barcode" value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="UPC, EAN, etc." />
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

          {/* Variants Toggle - Only show for new products or products with variants */}
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Add options like size or color to create product variants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <Label htmlFor="has-variants">This product has variants</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable to add options like size, color, or material
                  </p>
                </div>
                <Switch
                  id="has-variants"
                  checked={hasVariants}
                  onCheckedChange={setHasVariants}
                  disabled={!!product?.id}
                />
              </div>
              {hasVariants && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p>
                    Variant management is available after creating the product.
                    Save this product first, then edit it to add variants.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

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
                    <SelectItem value="">Uncategorized</SelectItem>
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
