import { forwardRef } from "react"

type Props = { src?: string; poster?: string; autoplay?: boolean; loop?: boolean; muted?: boolean; controls?: boolean; style?: React.CSSProperties; className?: string }

export const Video = forwardRef<HTMLVideoElement, Props>(
  ({ controls = true, ...props }, ref) => <video {...props} ref={ref} controls={controls} />
)
Video.displayName = "Video"
