"use client"

import { useEffect, useState, useCallback, useTransition } from "react"
import { useParams, useSearchParams, useRouter } from "next/navigation"
import { createClient } from "@/infrastructure/supabase/client"
import { ProductCard } from "@/components/store/product-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Skeleton } from "@/components/ui/skeleton"
import { NoResults } from "@/components/ui/empty-state"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Search, Filter, X, ArrowDownAZ } from "lucide-react"
import type { Product, Category } from "@/infrastructure/supabase/types"

type SortOption = "newest" | "oldest" | "price-asc" | "price-desc" | "name-asc" | "name-desc"

interface SearchFilters {
  query: string
  categoryId: string | null
  minPrice: number
  maxPrice: number
  sort: SortOption
}

function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Skeleton className="aspect-square w-full" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  )
}

export default function SearchPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const router = useRouter()
  const slug = params.slug as string

  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [maxProductPrice, setMaxProductPrice] = useState(1000)
  const [showFilters, setShowFilters] = useState(false)

  // Initialize filters from URL
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get("q") || "",
    categoryId: searchParams.get("category") || null,
    minPrice: Number(searchParams.get("minPrice")) || 0,
    maxPrice: Number(searchParams.get("maxPrice")) || 0,
    sort: (searchParams.get("sort") as SortOption) || "newest",
  })

  // Fetch tenant and categories on mount
  useEffect(() => {
    async function fetchInitialData() {
      const supabase = createClient()

      // Fetch tenant
      const { data: tenant } = await supabase
        .from("tenants")
        .select("id")
        .eq("slug", slug)
        .single()

      if (!tenant) return

      setTenantId(tenant.id)

      // Fetch categories for filter
      const { data: cats } = await supabase
        .from("categories")
        .select("*")
        .eq("tenant_id", tenant.id)
        .order("name")

      setCategories(cats || [])

      // Get max price for slider
      const { data: priceData } = await supabase
        .from("products")
        .select("price")
        .eq("tenant_id", tenant.id)
        .eq("status", "active")
        .order("price", { ascending: false })
        .limit(1)
        .single()

      if (priceData) {
        const maxPrice = Math.ceil(Number(priceData.price) / 100) * 100
        setMaxProductPrice(maxPrice)
        if (filters.maxPrice === 0) {
          setFilters((prev) => ({ ...prev, maxPrice }))
        }
      }
    }

    fetchInitialData()
  }, [slug])

  // Search products when filters change
  const searchProducts = useCallback(async () => {
    if (!tenantId) return

    setIsLoading(true)
    const supabase = createClient()

    let query = supabase
      .from("products")
      .select("*, category:categories(id, name, slug)")
      .eq("tenant_id", tenantId)
      .eq("status", "active")

    // Apply search query
    if (filters.query.trim()) {
      query = query.or(
        `name.ilike.%${filters.query}%,description.ilike.%${filters.query}%`
      )
    }

    // Apply category filter
    if (filters.categoryId) {
      query = query.eq("category_id", filters.categoryId)
    }

    // Apply price range
    if (filters.minPrice > 0) {
      query = query.gte("price", filters.minPrice)
    }
    if (filters.maxPrice > 0 && filters.maxPrice < maxProductPrice) {
      query = query.lte("price", filters.maxPrice)
    }

    // Apply sorting
    switch (filters.sort) {
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "price-asc":
        query = query.order("price", { ascending: true })
        break
      case "price-desc":
        query = query.order("price", { ascending: false })
        break
      case "name-asc":
        query = query.order("name", { ascending: true })
        break
      case "name-desc":
        query = query.order("name", { ascending: false })
        break
    }

    const { data } = await query

    setProducts(data || [])
    setIsLoading(false)
  }, [tenantId, filters, maxProductPrice])

  // Trigger search when filters or tenantId changes
  useEffect(() => {
    if (tenantId) {
      searchProducts()
    }
  }, [tenantId, searchProducts])

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: SearchFilters) => {
      startTransition(() => {
        const params = new URLSearchParams()
        if (newFilters.query) params.set("q", newFilters.query)
        if (newFilters.categoryId) params.set("category", newFilters.categoryId)
        if (newFilters.minPrice > 0) params.set("minPrice", String(newFilters.minPrice))
        if (newFilters.maxPrice > 0 && newFilters.maxPrice < maxProductPrice) {
          params.set("maxPrice", String(newFilters.maxPrice))
        }
        if (newFilters.sort !== "newest") params.set("sort", newFilters.sort)

        const queryString = params.toString()
        router.push(`/store/${slug}/search${queryString ? `?${queryString}` : ""}`, {
          scroll: false,
        })
      })
    },
    [router, slug, maxProductPrice]
  )

  const handleFilterChange = (updates: Partial<SearchFilters>) => {
    const newFilters = { ...filters, ...updates }
    setFilters(newFilters)
    updateURL(newFilters)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updateURL(filters)
  }

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      query: "",
      categoryId: null,
      minPrice: 0,
      maxPrice: maxProductPrice,
      sort: "newest",
    }
    setFilters(defaultFilters)
    router.push(`/store/${slug}/search`)
  }

  const hasActiveFilters =
    filters.query ||
    filters.categoryId ||
    filters.minPrice > 0 ||
    (filters.maxPrice > 0 && filters.maxPrice < maxProductPrice) ||
    filters.sort !== "newest"

  return (
    <div className="py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Search Products</h1>
            {filters.query && (
              <p className="mt-1 text-muted-foreground">
                {isLoading ? "Searching..." : `${products.length} results for "${filters.query}"`}
              </p>
            )}
          </div>

          {/* Mobile filter toggle */}
          <Button
            variant="outline"
            className="sm:hidden"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-4">
          {/* Filters Sidebar */}
          <aside
            className={`space-y-6 ${showFilters ? "block" : "hidden"} lg:block`}
          >
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit}>
              <Label htmlFor="search" className="text-sm font-medium">
                Search
              </Label>
              <div className="relative mt-2">
                <Search
                  className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  id="search"
                  type="search"
                  placeholder="Search products..."
                  value={filters.query}
                  onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                  className="pl-9"
                />
              </div>
            </form>

            {/* Category Filter */}
            <div>
              <Label className="text-sm font-medium">Category</Label>
              <Select
                value={filters.categoryId || "all"}
                onValueChange={(value) =>
                  handleFilterChange({ categoryId: value === "all" ? null : value })
                }
              >
                <SelectTrigger className="mt-2 w-full">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range */}
            <div>
              <Label className="text-sm font-medium">Price Range</Label>
              <div className="mt-4 px-2">
                <Slider
                  value={[filters.minPrice, filters.maxPrice || maxProductPrice]}
                  min={0}
                  max={maxProductPrice}
                  step={10}
                  onValueChange={([min, max]) =>
                    setFilters({ ...filters, minPrice: min, maxPrice: max })
                  }
                  onValueCommit={([min, max]) =>
                    handleFilterChange({ minPrice: min, maxPrice: max })
                  }
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>${filters.minPrice}</span>
                <span>${filters.maxPrice || maxProductPrice}</span>
              </div>
            </div>

            {/* Sort */}
            <div>
              <Label className="text-sm font-medium">Sort By</Label>
              <Select
                value={filters.sort}
                onValueChange={(value) => handleFilterChange({ sort: value as SortOption })}
              >
                <SelectTrigger className="mt-2 w-full">
                  <ArrowDownAZ className="mr-2 h-4 w-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-asc">Price: Low to High</SelectItem>
                  <SelectItem value="price-desc">Price: High to Low</SelectItem>
                  <SelectItem value="name-asc">Name: A to Z</SelectItem>
                  <SelectItem value="name-desc">Name: Z to A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters */}
            {hasActiveFilters && (
              <Button variant="outline" className="w-full" onClick={clearFilters}>
                <X className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </aside>

          {/* Product Grid */}
          <div className="lg:col-span-3">
            {isLoading ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} storeSlug={slug} />
                ))}
              </div>
            ) : (
              <NoResults
                title="No products found"
                message={
                  filters.query
                    ? `No products match "${filters.query}". Try adjusting your search or filters.`
                    : "Try adjusting your filters to find what you're looking for."
                }
                onClear={hasActiveFilters ? clearFilters : undefined}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
