import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface TableSkeletonProps {
  columns?: number
  rows?: number
  /** Show a checkbox column */
  hasCheckbox?: boolean
  /** Show an image column */
  hasImage?: boolean
}

export function TableSkeleton({ columns = 5, rows = 8, hasCheckbox = false, hasImage = false }: TableSkeletonProps) {
  const dataCols = columns - (hasCheckbox ? 1 : 0) - (hasImage ? 1 : 0)
  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          {hasCheckbox && <TableHead className="w-12"><Skeleton className="size-4" /></TableHead>}
          {hasImage && <TableHead className="w-14"><Skeleton className="h-3 w-8" /></TableHead>}
          {Array.from({ length: dataCols }).map((_, i) => (
            <TableHead key={i}><Skeleton className="h-3 w-16" /></TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, r) => (
          <TableRow key={r}>
            {hasCheckbox && <TableCell><Skeleton className="size-4" /></TableCell>}
            {hasImage && <TableCell><Skeleton className="size-9 rounded-md" /></TableCell>}
            {Array.from({ length: dataCols }).map((_, c) => (
              <TableCell key={c}>
                {c === 0 ? (
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ) : c === dataCols - 1 ? (
                  <Skeleton className="size-8 ml-auto" />
                ) : (
                  <Skeleton className="h-4 w-16" />
                )}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
