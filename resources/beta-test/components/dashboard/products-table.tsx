"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Product, Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { MoreHorizontal, Pencil, Trash2, Package, ImageIcon } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import Image from "next/image"

interface ProductWithCategory extends Product {
  category: Category | null
}

interface ProductsTableProps {
  products: ProductWithCategory[]
}

const statusColors = {
  draft: "bg-muted text-muted-foreground",
  active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  archived: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)

    try {
      const supabase = createClient()
      const { error } = await supabase.from("products").delete().eq("id", deleteId)

      if (error) throw error

      toast.success("Product deleted")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete product")
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (products.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <Package className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No products yet</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">Add your first product to start selling.</p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/products/new">Add your first product</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16"></TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.images && product.images.length > 0 ? (
                      <div className="relative h-12 w-12 overflow-hidden rounded-lg border bg-muted">
                        <Image
                          src={product.images[0].url || "/placeholder.svg"}
                          alt={product.images[0].alt || product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg border bg-muted">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      {product.sku && <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{product.category?.name || "Uncategorized"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[product.status]}>
                      {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {product.track_quantity ? (
                      <span className={product.quantity <= 0 ? "text-destructive" : ""}>
                        {product.quantity} in stock
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Not tracked</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">${Number(product.price).toFixed(2)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDeleteId(product.id)} className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
