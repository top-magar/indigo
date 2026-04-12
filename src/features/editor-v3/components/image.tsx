import { forwardRef } from "react"

type Props = { src?: string; alt?: string; style?: React.CSSProperties; className?: string }

export const Image = forwardRef<HTMLImageElement, Props>(
  ({ src = "", alt = "", ...props }, ref) => <img {...props} ref={ref} src={src} alt={alt} />
)
Image.displayName = "Image"
