import type { Meta, StoryObj } from "@storybook/react"
import { ZoomControl } from "../components/zoom-control"

const meta: Meta<typeof ZoomControl> = {
  component: ZoomControl,
  title: "Editor/ZoomControl",
}
export default meta
type Story = StoryObj<typeof ZoomControl>

export const Default: Story = { args: { zoom: 1, onZoomChange: () => {} } }
export const ZoomedIn: Story = { args: { zoom: 1.5, onZoomChange: () => {} } }
