import { forwardRef } from "react"

type Props = { placeholder?: string; name?: string; rows?: number; style?: React.CSSProperties; className?: string }

export const Textarea = forwardRef<HTMLTextAreaElement, Props>(
  ({ rows = 4, ...props }, ref) => <textarea {...props} ref={ref} rows={rows} />
)
Textarea.displayName = "Textarea"
