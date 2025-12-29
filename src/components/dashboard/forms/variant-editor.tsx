"use client"

import { useState, useTransition } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Delete01Icon,
  Edit01Icon,
  MoreHorizontalIcon,
  Loading01Icon,
  Tag01Icon,
  Package01Icon,
} from "@hugeicons/core-free-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Option {
  id?: string
  name: string
  values: string[]
}

interface Variant {
  id?: string
  title: string
  sku: string
  price: number
  quantity: number
  options: Record<string, string>
}

interface VariantEditorProps {
  productId?: string
  tenantId: string
  initialOptions?: Option[]
  initialVariants?: Variant[]
  basePrice: number
  onOptionsChange?: (options: Option[]) => void
  onVariantsChange?: (variants: Variant[]) => void
}

export function VariantEditor({
  productId,
  tenantId,
  initialOptions = [],
  initialVariants = [],
  basePrice,
  onOptionsChange,
  onVariantsChange,
}: VariantEditorProps) {
  const [isPending, startTransition] = useTransition()
  const [options, setOptions] = useState<Option[]>(initialOptions)
  const [variants, setVariants] = useState<Variant[]>(initialVariants)
  
  // Dialog states
  const [optionDialogOpen, setOptionDialogOpen] = useState(false)
  const [editingOption, setEditingOption] = useState<Option | null>(null)
  const [variantDialogOpen, setVariantDialogOpen] = useState(false)
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null)

  // Option form state
  const [optionName, setOptionName] = useState("")
  const [optionValues, setOptionValues] = useState("")

  // Variant form state
  const [variantSku, setVariantSku] = useState("")
  const [variantPrice, setVariantPrice] = useState("")
  const [variantQuantity, setVariantQuantity] = useState("")
  const [variantOptions, setVariantOptions] = useState<Record<string, string>>({})

  // Generate all variant combinations from options
  const generateVariants = () => {
    if (options.length === 0) return

    const cartesian = <T,>(...arrays: T[][]): T[][] => {
      return arrays.reduce<T[][]>(
        (acc, arr) => acc.flatMap(x => arr.map(y => [...x, y])),
        [[]]
      )
    }

    const optionArrays = options.map(opt => 
      opt.values.map(val => ({ name: opt.name, value: val }))
    )

    const combinations = cartesian(...optionArrays)

    const newVariants: Variant[] = combinations.map((combo, index) => {
      const title = combo.map(c => c.value).join(" / ")
      const optionsMap = combo.reduce((acc, c) => {
        acc[c.name] = c.value
        return acc
      }, {} as Record<string, string>)

      // Check if variant already exists
      const existing = variants.find(v => v.title === title)
      if (existing) return existing

      return {
        title,
        sku: "",
        price: basePrice,
        quantity: 0,
        options: optionsMap,
      }
    })

    setVariants(newVariants)
    onVariantsChange?.(newVariants)
    toast.success(`Generated ${newVariants.length} variants`)
  }

  // Handle option save
  const handleSaveOption = () => {
    if (!optionName.trim()) {
      toast.error("Option name is required")
      return
    }

    const values = optionValues
      .split(",")
      .map(v => v.trim())
      .filter(Boolean)

    if (values.length === 0) {
      toast.error("At least one value is required")
      return
    }

    const newOption: Option = {
      id: editingOption?.id,
      name: optionName.trim(),
      values,
    }

    let newOptions: Option[]
    if (editingOption) {
      newOptions = options.map(o => 
        o.name === editingOption.name ? newOption : o
      )
    } else {
      if (options.some(o => o.name.toLowerCase() === newOption.name.toLowerCase())) {
        toast.error("Option with this name already exists")
        return
      }
      newOptions = [...options, newOption]
    }

    setOptions(newOptions)
    onOptionsChange?.(newOptions)
    setOptionDialogOpen(false)
    resetOptionForm()
    toast.success(editingOption ? "Option updated" : "Option added")
  }

  // Handle option delete
  const handleDeleteOption = (optionName: string) => {
    const newOptions = options.filter(o => o.name !== optionName)
    setOptions(newOptions)
    onOptionsChange?.(newOptions)
    
    // Clear variants that use this option
    if (variants.length > 0) {
      setVariants([])
      onVariantsChange?.([])
    }
    
    toast.success("Option deleted")
  }

  // Handle variant save
  const handleSaveVariant = () => {
    const newVariant: Variant = {
      id: editingVariant?.id,
      title: Object.values(variantOptions).join(" / "),
      sku: variantSku,
      price: parseFloat(variantPrice) || basePrice,
      quantity: parseInt(variantQuantity) || 0,
      options: variantOptions,
    }

    let newVariants: Variant[]
    if (editingVariant) {
      newVariants = variants.map(v => 
        v.title === editingVariant.title ? newVariant : v
      )
    } else {
      newVariants = [...variants, newVariant]
    }

    setVariants(newVariants)
    onVariantsChange?.(newVariants)
    setVariantDialogOpen(false)
    resetVariantForm()
    toast.success(editingVariant ? "Variant updated" : "Variant added")
  }

  // Handle variant delete
  const handleDeleteVariant = (variantTitle: string) => {
    const newVariants = variants.filter(v => v.title !== variantTitle)
    setVariants(newVariants)
    onVariantsChange?.(newVariants)
    toast.success("Variant deleted")
  }

  // Reset forms
  const resetOptionForm = () => {
    setOptionName("")
    setOptionValues("")
    setEditingOption(null)
  }

  const resetVariantForm = () => {
    setVariantSku("")
    setVariantPrice("")
    setVariantQuantity("")
    setVariantOptions({})
    setEditingVariant(null)
  }

  // Open edit dialogs
  const openEditOption = (option: Option) => {
    setEditingOption(option)
    setOptionName(option.name)
    setOptionValues(option.values.join(", "))
    setOptionDialogOpen(true)
  }

  const openEditVariant = (variant: Variant) => {
    setEditingVariant(variant)
    setVariantSku(variant.sku)
    setVariantPrice(variant.price.toString())
    setVariantQuantity(variant.quantity.toString())
    setVariantOptions(variant.options)
    setVariantDialogOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Options Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Product Options</CardTitle>
            <CardDescription>
              Define options like Size, Color, or Material
            </CardDescription>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              resetOptionForm()
              setOptionDialogOpen(true)
            }}
          >
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        </CardHeader>
        <CardContent>
          {options.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50 mb-4">
                <HugeiconsIcon icon={Tag01Icon} className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                No options defined. Add options to create product variants.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {options.map((option) => (
                <div
                  key={option.name}
                  className="flex items-center justify-between p-3 rounded-lg border bg-card"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{option.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {option.values.map((value) => (
                        <Badge key={value} variant="secondary" className="text-xs">
                          {value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditOption(option)}>
                        <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDeleteOption(option.name)}
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}

              {options.length > 0 && (
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={generateVariants}
                >
                  Generate Variants
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants Section */}
      {variants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Variants ({variants.length})</CardTitle>
            <CardDescription>
              Manage pricing and inventory for each variant
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Variant</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {variants.map((variant) => (
                  <TableRow key={variant.title}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                          <HugeiconsIcon icon={Package01Icon} className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <span className="font-medium">{variant.title}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {variant.sku || "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ${variant.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {variant.quantity}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditVariant(variant)}>
                            <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteVariant(variant.title)}
                          >
                            <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Option Dialog */}
      <Dialog open={optionDialogOpen} onOpenChange={setOptionDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingOption ? "Edit Option" : "Add Option"}</DialogTitle>
            <DialogDescription>
              Define an option like Size or Color with its possible values
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="option-name">Option Name</Label>
              <Input
                id="option-name"
                placeholder="e.g., Size, Color, Material"
                value={optionName}
                onChange={(e) => setOptionName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="option-values">Values (comma-separated)</Label>
              <Input
                id="option-values"
                placeholder="e.g., Small, Medium, Large"
                value={optionValues}
                onChange={(e) => setOptionValues(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter values separated by commas
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveOption}>
              {editingOption ? "Save Changes" : "Add Option"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variant Dialog */}
      <Dialog open={variantDialogOpen} onOpenChange={setVariantDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Variant</DialogTitle>
            <DialogDescription>
              Update pricing and inventory for this variant
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingVariant && (
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-sm font-medium">{editingVariant.title}</p>
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="variant-sku">SKU</Label>
              <Input
                id="variant-sku"
                placeholder="Stock keeping unit"
                value={variantSku}
                onChange={(e) => setVariantSku(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant-price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="variant-price"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-7"
                    placeholder="0.00"
                    value={variantPrice}
                    onChange={(e) => setVariantPrice(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-quantity">Quantity</Label>
                <Input
                  id="variant-quantity"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={variantQuantity}
                  onChange={(e) => setVariantQuantity(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVariantDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
