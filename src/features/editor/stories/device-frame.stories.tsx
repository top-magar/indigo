import type { Meta, StoryObj } from "@storybook/react"
import { DeviceFrame } from "../canvas/device-frame"

const meta: Meta<typeof DeviceFrame> = {
  component: DeviceFrame,
  title: "Editor/DeviceFrame",
}
export default meta
type Story = StoryObj<typeof DeviceFrame>

const placeholder = <div style={{ width: 375, height: 600, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#64748b" }}>Page content</div>

export const Mobile: Story = { args: { viewport: "mobile", zoom: 1, children: placeholder } }
export const Tablet: Story = { args: { viewport: "tablet", zoom: 1, children: <div style={{ width: 768, height: 500, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#64748b" }}>Tablet content</div> } }
export const Desktop: Story = { args: { viewport: "desktop", zoom: 1, children: <div style={{ width: 1280, height: 500, background: "#f1f5f9", display: "grid", placeItems: "center", color: "#64748b" }}>Desktop content</div> } }
