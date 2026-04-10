import { useState } from "react"
import type { Meta, StoryObj } from "@storybook/react"
import { PaddingControl } from "../controls/padding-control"

const meta: Meta<typeof PaddingControl> = {
  component: PaddingControl,
  title: "Editor/PaddingControl",
  decorators: [(Story) => <div style={{ maxWidth: 260, padding: 16 }}><Story /></div>],
}
export default meta
type Story = StoryObj<typeof PaddingControl>

export const TwoSides: Story = {
  render: () => {
    const [top, setTop] = useState(24)
    const [bottom, setBottom] = useState(24)
    return <PaddingControl top={top} bottom={bottom} onTop={setTop} onBottom={setBottom} />
  },
}

export const FourSides: Story = {
  render: () => {
    const [t, setT] = useState(16)
    const [b, setB] = useState(16)
    const [l, setL] = useState(24)
    const [r, setR] = useState(24)
    return <PaddingControl top={t} bottom={b} left={l} right={r} onTop={setT} onBottom={setB} onLeft={setL} onRight={setR} />
  },
}
