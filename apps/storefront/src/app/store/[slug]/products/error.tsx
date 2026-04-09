"use client"
export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground text-sm">{error.message || "An unexpected error occurred"}</p>
      <button onClick={reset} className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm">Try again</button>
    </div>
  )
}
