interface SpacerProps {
  height: number; mobileHeight: number
}

export function Spacer({ height = 64, mobileHeight = 32 }: SpacerProps) {
  return (
    <div
      className="border border-dashed border-transparent [.editor-canvas_&]:border-gray-300"
      style={{ height, ["--mobile-h" as string]: `${mobileHeight}px` }}
    />
  )
}
