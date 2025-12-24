"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { useCallback, useState, useTransition } from "react"

interface FilterOption {
  value: string
  label: string
}

interface SearchFilterProps {
  searchPlaceholder?: string
  filterOptions?: FilterOption[]
  filterKey?: string
  filterLabel?: string
}

export function SearchFilter({
  searchPlaceholder = "Search...",
  filterOptions,
  filterKey = "status",
  filterLabel = "Status",
}: SearchFilterProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const [search, setSearch] = useState(searchParams.get("q") || "")
  const currentFilter = searchParams.get(filterKey) || "all"

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const newParams = new URLSearchParams(searchParams.toString())
      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "" || value === "all") {
          newParams.delete(key)
        } else {
          newParams.set(key, value)
        }
      })
      return newParams.toString()
    },
    [searchParams]
  )

  const handleSearch = (value: string) => {
    setSearch(value)
    startTransition(() => {
      const queryString = createQueryString({ q: value || null })
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`)
    })
  }

  const handleFilter = (value: string) => {
    startTransition(() => {
      const queryString = createQueryString({ [filterKey]: value === "all" ? null : value })
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`)
    })
  }

  const clearFilters = () => {
    setSearch("")
    startTransition(() => {
      router.push(pathname)
    })
  }

  const hasFilters = search || currentFilter !== "all"

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-9"
        />
      </div>
      {filterOptions && (
        <Select value={currentFilter} onValueChange={handleFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder={filterLabel} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All {filterLabel}</SelectItem>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters} disabled={isPending}>
          <HugeiconsIcon icon={Cancel01Icon} className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
