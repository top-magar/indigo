import { useState, useMemo } from "react"
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react"
import { cn } from "@/shared/utils"

interface SortableHeaderProps {
  label: string
  column: string
  currentSort: string | null
  currentDir: "asc" | "desc"
  onSort: (column: string) => void
  className?: string
}

export function SortableHeader({ label, column, currentSort, currentDir, onSort, className }: SortableHeaderProps) {
  const active = currentSort === column
  return (
    <button
      type="button"
      onClick={() => onSort(column)}
      className={cn("flex items-center gap-1 hover:text-foreground transition-colors", className)}
    >
      {label}
      {active ? (
        currentDir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />
      ) : (
        <ArrowUpDown className="size-3 opacity-40" />
      )}
    </button>
  )
}

/** Client-side sort hook. Toggle asc/desc on same column, reset to asc on new column. */
export function useClientSort<T>(data: T[], defaultColumn?: string) {
  const [sort, setSort] = useState<string | null>(defaultColumn ?? null)
  const [dir, setDir] = useState<"asc" | "desc">("asc")

  const handleSort = (column: string) => {
    if (sort === column) {
      setDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSort(column)
      setDir("asc")
    }
  }

  const sorted = useMemo(() => {
    if (!sort) return data
    return [...data].sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sort]
      const bVal = (b as Record<string, unknown>)[sort]
      if (aVal == null && bVal == null) return 0
      if (aVal == null) return 1
      if (bVal == null) return -1
      if (typeof aVal === "number" && typeof bVal === "number") {
        return dir === "asc" ? aVal - bVal : bVal - aVal
      }
      const aStr = String(aVal).toLowerCase()
      const bStr = String(bVal).toLowerCase()
      return dir === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [data, sort, dir])

  return { sorted, sort, dir, handleSort }
}
