import { forwardRef, type ReactNode } from "react"

type Props = { children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Slot = forwardRef<HTMLDivElement, Props>(
  ({ children, ...props }, ref) => <div {...props} ref={ref} style={{ ...props.style, display: children ? "contents" : "block" }}>{children}</div>
)
Slot.displayName = "Slot"
