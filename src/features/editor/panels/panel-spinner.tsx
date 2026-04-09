import { Loader2 } from "lucide-react"

export function PanelSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="size-4 animate-spin text-muted-foreground" />
    </div>
  )
}
