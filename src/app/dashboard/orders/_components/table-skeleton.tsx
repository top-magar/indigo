import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

export function OrdersTableSkeleton({ rows = 10 }: { rows?: number }) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent border-b">
            <TableHead className="w-12"><Skeleton className="h-4 w-4" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-20" /></TableHead>
            <TableHead><Skeleton className="h-3 w-12" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead><Skeleton className="h-3 w-16" /></TableHead>
            <TableHead className="text-right"><Skeleton className="h-3 w-12 ml-auto" /></TableHead>
            <TableHead className="w-24" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRow key={i} className="border-b">
              <TableCell className="w-12"><Skeleton className="h-4 w-4" /></TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20 mb-1" />
                <Skeleton className="h-3 w-16" />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              </TableCell>
              <TableCell><Skeleton className="h-4 w-16" /></TableCell>
              <TableCell><Skeleton className="h-5 w-20 rounded-full" /></TableCell>
              <TableCell><Skeleton className="h-5 w-14 rounded-full" /></TableCell>
              <TableCell className="text-right"><Skeleton className="h-4 w-16 ml-auto" /></TableCell>
              <TableCell>
                <div className="flex justify-end gap-1">
                  <Skeleton className="h-8 w-8" />
                  <Skeleton className="h-8 w-8" />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
