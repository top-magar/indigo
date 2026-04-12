import { forwardRef, type ReactNode } from "react"

type Props = { children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Text = forwardRef<HTMLSpanElement, Props>(
  ({ children, ...props }, ref) => <span {...props} ref={ref}>{children}</span>
)
Text.displayName = "Text"
