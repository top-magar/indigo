import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { ColorPickerPopover } from "../controls/color-picker"

const meta: Meta<typeof ColorPickerPopover> = {
  component: ColorPickerPopover,
  title: "Editor/ColorPicker",
  decorators: [(Story) => <div style={{ position: "relative", padding: 20 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof ColorPickerPopover>

export const Default: Story = {
  render: () => {
    const [color, setColor] = useState("#3b82f6")
    return <ColorPickerPopover value={color} onChange={setColor} onClose={() => {}} />
  },
}

export const DarkColor: Story = {
  render: () => {
    const [color, setColor] = useState("#1e1e1e")
    return <ColorPickerPopover value={color} onChange={setColor} onClose={() => {}} />
  },
}
