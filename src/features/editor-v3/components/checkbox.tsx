import { forwardRef } from "react"

type Props = { name?: string; value?: string; checked?: boolean; style?: React.CSSProperties; className?: string }

export const Checkbox = forwardRef<HTMLInputElement, Props>(
  (props, ref) => <input {...props} ref={ref} type="checkbox" />
)
Checkbox.displayName = "Checkbox"
