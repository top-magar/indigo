interface DividerProps {
  height: number; showLine: boolean; lineColor: string; lineWidth: number
}

export function Divider({ height, showLine, lineColor, lineWidth }: DividerProps) {
  return (
    <div style={{ height }} className="flex items-center justify-center">
      {showLine && <hr style={{ borderTop: `${lineWidth}px solid ${lineColor}`, width: "100%", margin: 0, border: "none", borderTopStyle: "solid", borderTopWidth: lineWidth, borderTopColor: lineColor }} />}
    </div>
  )
}
