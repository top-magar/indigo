import { forwardRef, type ReactNode } from "react"

type Props = { children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Paragraph = forwardRef<HTMLParagraphElement, Props>(
  ({ children, ...props }, ref) => <p {...props} ref={ref}>{children}</p>
)
Paragraph.displayName = "Paragraph"
