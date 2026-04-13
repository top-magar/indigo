import { forwardRef } from "react"

type Props = { style?: React.CSSProperties; className?: string }

export const Separator = forwardRef<HTMLHRElement, Props>(
  (props, ref) => <hr {...props} ref={ref} />
)
Separator.displayName = "Separator"
