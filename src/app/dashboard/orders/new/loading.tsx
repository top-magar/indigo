import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

export default function NewOrderLoading() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-7 w-40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="space-y-3">
          <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /><Skeleton className="h-4 w-24" /><Skeleton className="h-9 w-full" /></CardContent></Card>
          <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-32" /><Skeleton className="h-20 w-full" /></CardContent></Card>
        </div>
        <div className="space-y-3">
          <Card><CardContent className="p-4 space-y-3"><Skeleton className="h-4 w-20" /><Skeleton className="h-8 w-full" /></CardContent></Card>
        </div>
      </div>
    </div>
  )
}
