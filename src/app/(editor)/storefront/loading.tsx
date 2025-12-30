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
          <Skeleton className="h-5 w-16 rounded-full" />
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
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </header>

      {/* Main Content - 3-column grid layout (matches visual-editor) */}
      <div className="flex-1 grid grid-cols-[240px_1fr_280px] min-h-0 overflow-hidden">
        
        {/* Left Panel - Layers */}
        <aside className="border-r bg-background flex flex-col min-h-0 overflow-hidden">
          {/* Panel header */}
          <div className="shrink-0 flex items-center justify-between h-10 px-3 border-b bg-muted/30">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-7 w-7 rounded-md" />
          </div>

          {/* Block list */}
          <div className="flex-1 p-2 space-y-1">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-4 rounded" />
              </div>
            ))}
          </div>

          {/* Panel footer */}
          <div className="shrink-0 h-8 px-3 border-t bg-muted/30 flex items-center">
            <Skeleton className="h-3 w-16" />
          </div>
        </aside>

        {/* Center - Preview */}
        <main className="min-h-0 min-w-0 overflow-hidden flex flex-col bg-muted/20">
          {/* Preview toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-3 py-1.5">
            <div className="flex items-center gap-3">
              {/* Viewport switcher */}
              <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
                <Skeleton className="h-7 w-7 rounded-md" />
              </div>
              {/* Mode toggle */}
              <div className="flex items-center rounded-lg border bg-muted/50 p-0.5">
                <Skeleton className="h-7 w-12 rounded-md" />
                <Skeleton className="h-7 w-14 rounded-md" />
              </div>
            </div>
            {/* Zoom controls */}
            <div className="flex items-center gap-1">
              <Skeleton className="h-7 w-7 rounded-md" />
              <Skeleton className="h-5 w-12 rounded" />
              <Skeleton className="h-7 w-7 rounded-md" />
            </div>
          </div>

          {/* Preview container with dotted background */}
          <div 
            className="flex-1 flex items-start justify-center p-6 overflow-auto"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--muted-foreground) / 0.12) 1px, transparent 0)`,
              backgroundSize: '20px 20px',
            }}
          >
            {/* Desktop preview frame */}
            <div className="w-[1280px] origin-top animate-pulse" style={{ transform: 'scale(0.6)' }}>
              <div className="overflow-hidden rounded-xl border border-border/50 bg-background shadow-xl">
                {/* Browser chrome */}
                <div className="flex items-center gap-3 border-b bg-muted/40 px-4 py-2">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                    <div className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                  </div>
                  <div className="flex-1 flex items-center justify-center">
                    <Skeleton className="h-7 w-72 rounded-lg" />
                  </div>
                  <div className="w-12" />
                </div>
                {/* Content skeleton */}
                <div className="bg-background min-h-[800px]">
                  {/* Header block */}
                  <div className="h-14 border-b bg-muted/20 flex items-center justify-between px-6">
                    <Skeleton className="h-6 w-24" />
                    <div className="flex gap-4">
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  {/* Hero block */}
                  <div className="h-[360px] bg-gradient-to-br from-muted/40 to-muted/20 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <Skeleton className="h-10 w-80 mx-auto" />
                      <Skeleton className="h-5 w-64 mx-auto" />
                      <Skeleton className="h-10 w-32 mx-auto rounded-full" />
                    </div>
                  </div>
                  {/* Product grid */}
                  <div className="p-8 space-y-6">
                    <Skeleton className="h-7 w-40 mx-auto" />
                    <div className="grid grid-cols-4 gap-5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="space-y-2">
                          <Skeleton className="aspect-square w-full rounded-lg" />
                          <Skeleton className="h-4 w-4/5" />
                          <Skeleton className="h-4 w-1/3" />
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Footer */}
                  <div className="h-28 border-t bg-muted/20 mt-4" />
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Right Panel - Settings */}
        <aside className="border-l bg-background flex flex-col min-h-0 overflow-hidden">
          {/* Empty state */}
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="rounded-full bg-muted/50 p-4 mb-4">
              <Skeleton className="h-8 w-8 rounded" />
            </div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-3 w-40" />
          </div>
        </aside>
      </div>
    </div>
  )
}
