import { forwardRef, type ReactNode } from "react"

type Props = { type?: "button" | "submit" | "reset"; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Button = forwardRef<HTMLButtonElement, Props>(
  ({ children, ...props }, ref) => <button {...props} ref={ref}>{children}</button>
)
Button.displayName = "Button"
