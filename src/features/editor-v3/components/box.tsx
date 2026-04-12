import { forwardRef, createElement, type ReactNode } from "react"

type Props = { tag?: string; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Box = forwardRef<HTMLDivElement, Props>(
  ({ tag = "div", children, ...props }, ref) => createElement(tag, { ...props, ref }, children)
)
Box.displayName = "Box"
