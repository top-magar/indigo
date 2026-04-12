import { forwardRef, type ReactNode } from "react"

type Props = { ordered?: boolean; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const List = forwardRef<HTMLUListElement, Props>(
  ({ ordered, children, ...props }, ref) => ordered
    ? <ol {...props} ref={ref as React.Ref<HTMLOListElement>}>{children}</ol>
    : <ul {...props} ref={ref}>{children}</ul>
)
List.displayName = "List"
