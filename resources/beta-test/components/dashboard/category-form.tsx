"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Category } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

interface CategoryFormProps {
  tenantId: string
  category?: Category
}

export function CategoryForm({ tenantId, category }: CategoryFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const [name, setName] = useState(category?.name || "")
  const [slug, setSlug] = useState(category?.slug || "")
  const [description, setDescription] = useState(category?.description || "")

  const generateSlug = (value: string) => {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
  }

  const handleNameChange = (value: string) => {
    setName(value)
    if (!category) {
      setSlug(generateSlug(value))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      if (category) {
        const { error } = await supabase
          .from("categories")
          .update({
            name,
            slug,
            description: description || null,
          })
          .eq("id", category.id)

        if (error) throw error
        toast.success("Category updated")
      } else {
        const { error } = await supabase.from("categories").insert({
          tenant_id: tenantId,
          name,
          slug,
          description: description || null,
        })

        if (error) throw error
        toast.success("Category created")
      }

      router.push("/dashboard/categories")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save category")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Category Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g., Electronics"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                value={slug}
                onChange={(e) => setSlug(generateSlug(e.target.value))}
                placeholder="e.g., electronics"
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
              placeholder="Optional description for this category"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : category ? "Update category" : "Create category"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
