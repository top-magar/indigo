import { forwardRef, type ReactNode } from "react"

type Props = { action?: string; method?: string; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Form = forwardRef<HTMLFormElement, Props>(
  ({ children, ...props }, ref) => (
    <form {...props} ref={ref} onSubmit={(e) => e.preventDefault()}>{children}</form>
  )
)
Form.displayName = "Form"
