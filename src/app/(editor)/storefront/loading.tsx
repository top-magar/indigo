import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"

export default function StorefrontEditorLoading() {
  return (
    <div className="flex h-screen flex-col bg-muted/30">
      {/* Header - matches visual-editor h-12 header */}
      <header className="flex h-12 shrink-0 items-center border-b bg-background">
        {/* Left section - Back button */}
        <div className="flex items-center gap-1 px-2 border-r h-full">
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>

        {/* Store name & status */}
        <div className="flex items-center gap-3 px-4 h-full border-r">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        {/* Center - Undo/Redo */}
        <div className="flex items-center h-full border-r px-2">
          <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
            <Skeleton className="h-7 w-7 rounded-md" />
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section - Actions */}
        <div className="flex items-center gap-2 px-3">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
          <Separator orientation="vertical" className="h-6 mx-1" />
          <Skeleton className="h-8 w-[80px] rounded-md" />
          <Skeleton className="h-8 w-[90px] rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </header>

      {/* Main Content - 3-column grid layout */}
      <div className="flex-1 grid grid-cols-[260px_1fr_300px] min-h-0 overflow-hidden">
        
        {/* Left Panel - Layers */}
        <aside className="border-r bg-background flex flex-col min-h-0 overflow-hidden">
          {/* Panel header */}
          <div className="shrink-0 flex items-center justify-between h-10 px-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-4" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>

          {/* Block list */}
          <div className="flex-1 p-2 space-y-1.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 rounded-lg" />
            ))}
          </div>

          {/* Panel footer */}
          <div className="shrink-0 h-7 px-3 border-t bg-muted/30 flex items-center">
            <Skeleton className="h-3 w-20" />
          </div>
        </aside>

        {/* Center - Preview */}
        <main className="min-h-0 min-w-0 overflow-hidden flex flex-col">
          {/* Preview toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b bg-muted/30 px-3 py-1.5">
            <div className="flex items-center gap-2">
              {/* Viewport switcher */}
              <div className="flex items-center rounded-md border bg-background p-0.5">
                <Skeleton className="h-7 w-7 rounded-sm" />
                <Skeleton className="h-7 w-7 rounded-sm" />
                <Skeleton className="h-7 w-7 rounded-sm" />
              </div>
              {/* Mode toggle */}
              <div className="flex items-center rounded-md border bg-muted/40 p-0.5">
                <Skeleton className="h-7 w-14 rounded-md" />
                <Skeleton className="h-7 w-14 rounded-md" />
              </div>
              {/* Mode indicator */}
              <div className="flex items-center gap-1">
                <Skeleton className="h-1.5 w-1.5 rounded-full" />
                <Skeleton className="h-3 w-8" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>

          {/* Preview container with dotted background */}
          <div 
            className="flex-1 flex items-start justify-center p-8 overflow-auto"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.15) 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          >
            {/* Desktop preview frame */}
            <div className="w-[1440px] origin-top" style={{ transform: 'scale(0.55)' }}>
              <div className="overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b bg-muted/50 px-4 py-2.5">
                  <div className="flex gap-1.5">
                    <div className="h-3 w-3 rounded-full bg-red-500/80" />
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                    <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <Skeleton className="h-8 w-80 rounded-lg" />
                  </div>
                  <div className="w-[52px]" />
                </div>
                {/* Content skeleton */}
                <div className="bg-background min-h-[860px] space-y-0">
                  {/* Header block */}
                  <Skeleton className="h-16 w-full rounded-none" />
                  {/* Hero block */}
                  <Skeleton className="h-[400px] w-full rounded-none" />
                  {/* Product grid */}
                  <div className="p-8 space-y-4">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <div className="grid grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-3">
                          <Skeleton className="aspect-square w-full rounded-lg" />
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Footer */}
                  <Skeleton className="h-32 w-full rounded-none mt-8" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Settings */}
        <aside className="border-l bg-background flex flex-col min-h-0 overflow-hidden">
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </aside>
      </div>
    </div>
  )
}
