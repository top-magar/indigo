import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ProductNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <AlertCircle className="size-8 text-muted-foreground" />
      <h2 className="text-sm font-medium">Product not found</h2>
      <p className="text-xs text-muted-foreground">This product may have been deleted or doesn't exist.</p>
      <Button variant="outline" size="sm" asChild>
        <Link href="/dashboard/products">Back to Products</Link>
      </Button>
    </div>
  )
}
