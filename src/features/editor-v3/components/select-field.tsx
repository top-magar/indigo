import { forwardRef, type ReactNode } from "react"

type Props = { name?: string; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const SelectField = forwardRef<HTMLSelectElement, Props>(
  ({ children, ...props }, ref) => <select {...props} ref={ref}>{children}</select>
)
SelectField.displayName = "SelectField"
