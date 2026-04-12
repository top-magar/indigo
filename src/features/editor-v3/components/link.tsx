import { forwardRef, type ReactNode } from "react"

type Props = { href?: string; target?: string; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Link = forwardRef<HTMLAnchorElement, Props>(
  ({ href = "#", children, ...props }, ref) => <a {...props} ref={ref} href={href}>{children}</a>
)
Link.displayName = "Link"
