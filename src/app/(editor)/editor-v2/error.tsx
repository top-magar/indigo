"use client"

export default function EditorV2Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-center">
        <p className="text-sm text-destructive">{error.message || "Something went wrong"}</p>
        <button onClick={reset} className="text-sm underline text-muted-foreground">Try again</button>
      </div>
    </div>
  )
}
