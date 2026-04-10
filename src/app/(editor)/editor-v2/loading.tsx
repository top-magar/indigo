export default function EditorV2Loading() {
  return (
    <div className="flex h-screen items-center justify-center text-muted-foreground">
      <div className="flex flex-col items-center gap-2">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-current border-t-transparent" />
        <p className="text-sm">Loading editor…</p>
      </div>
    </div>
  )
}
