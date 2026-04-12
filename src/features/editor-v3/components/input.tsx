import { forwardRef } from "react"

type Props = { type?: string; placeholder?: string; name?: string; style?: React.CSSProperties; className?: string }

export const Input = forwardRef<HTMLInputElement, Props>(
  ({ type = "text", ...props }, ref) => <input {...props} ref={ref} type={type} />
)
Input.displayName = "Input"
