import { forwardRef, type ReactNode } from "react"

type Props = { padding?: "none" | "small" | "medium" | "large"; children?: ReactNode; style?: React.CSSProperties }

const paddings = { none: 0, small: 40, medium: 80, large: 120 }

export const Section = forwardRef<HTMLElement, Props>(
  ({ padding = "medium", children, style, ...props }, ref) => (
    <section {...props} ref={ref} style={{ paddingTop: paddings[padding], paddingBottom: paddings[padding], ...style }}>
      {children}
    </section>
  )
)
Section.displayName = "Section"
