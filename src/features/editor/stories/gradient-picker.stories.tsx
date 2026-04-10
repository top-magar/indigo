import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { GradientPicker } from "../controls/gradient-picker"

const meta: Meta<typeof GradientPicker> = {
  component: GradientPicker,
  title: "Editor/GradientPicker",
  decorators: [(Story) => <div style={{ maxWidth: 280, padding: 16 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof GradientPicker>

export const Solid: Story = {
  render: () => {
    const [value, setValue] = useState("#3b82f6")
    return <GradientPicker label="Background" value={value} onChange={setValue} />
  },
}

export const LinearGradient: Story = {
  render: () => {
    const [value, setValue] = useState("linear-gradient(135deg, #667eea, #764ba2)")
    return <GradientPicker label="Overlay" value={value} onChange={setValue} />
  },
}
