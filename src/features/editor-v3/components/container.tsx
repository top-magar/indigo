import { forwardRef, type ReactNode } from "react"

type Props = { maxWidth?: string; children?: ReactNode; style?: React.CSSProperties }

export const Container = forwardRef<HTMLDivElement, Props>(
  ({ maxWidth = "1280px", children, style, ...props }, ref) => (
    <div {...props} ref={ref} style={{ maxWidth, marginLeft: "auto", marginRight: "auto", paddingLeft: "24px", paddingRight: "24px", width: "100%", ...style }}>
      {children}
    </div>
  )
)
Container.displayName = "Container"
