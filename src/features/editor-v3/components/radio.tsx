import { forwardRef } from "react"

type Props = { name?: string; value?: string; checked?: boolean; style?: React.CSSProperties; className?: string }

export const Radio = forwardRef<HTMLInputElement, Props>(
  (props, ref) => <input {...props} ref={ref} type="radio" />
)
Radio.displayName = "Radio"
