"use client"

import { Copy, Check } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"

export function CopyButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  return (
    <Button
      variant="outline"
      size="icon"
      className="size-8"
      onClick={() => {
        navigator.clipboard.writeText(url)
        toast.success("Link copied!")
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
    </Button>
  )
}
