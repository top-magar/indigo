import { X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function ActiveFilters({
  filters,
  onClear,
  onClearAll,
}: {
  filters: { key: string; label: string; value: string }[]
  onClear: (key: string) => void
  onClearAll: () => void
}) {
  if (filters.length === 0) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-muted-foreground">Active filters:</span>
      {filters.map((filter) => (
        <Badge
          key={filter.key}
          variant="secondary"
          className="gap-1 bg-muted text-muted-foreground hover:bg-muted cursor-pointer transition-colors"
          onClick={() => onClear(filter.key)}
        >
          <span className="text-muted-foreground">{filter.label}:</span>
          {filter.value}
          <X className="h-3 w-3 ml-0.5" />
        </Badge>
      ))}
      <Button
        variant="ghost"
       
        onClick={onClearAll}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        Clear all
      </Button>
    </div>
  )
}
