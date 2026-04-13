import { forwardRef, type ReactNode } from "react"

type Props = { htmlFor?: string; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Label = forwardRef<HTMLLabelElement, Props>(
  ({ htmlFor, children, ...props }, ref) => <label {...props} ref={ref} htmlFor={htmlFor}>{children}</label>
)
Label.displayName = "Label"
