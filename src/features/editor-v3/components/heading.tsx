import { forwardRef, createElement, type ReactNode } from "react"

type Props = { level?: 1 | 2 | 3 | 4 | 5 | 6; children?: ReactNode; style?: React.CSSProperties; className?: string }

export const Heading = forwardRef<HTMLHeadingElement, Props>(
  ({ level = 2, children, ...props }, ref) => createElement(`h${level}`, { ...props, ref }, children)
)
Heading.displayName = "Heading"
