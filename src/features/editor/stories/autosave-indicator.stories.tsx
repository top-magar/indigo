import type { Meta, StoryObj } from "@storybook/react"
import { AutosaveIndicator } from "../components/autosave-indicator"

const meta: Meta<typeof AutosaveIndicator> = {
  component: AutosaveIndicator,
  title: "Editor/AutosaveIndicator",
}
export default meta
type Story = StoryObj<typeof AutosaveIndicator>

export const Saved: Story = { args: { lastSaved: new Date(), saving: false, dirty: false } }
export const Saving: Story = { args: { lastSaved: null, saving: true, dirty: false } }
export const Dirty: Story = { args: { lastSaved: new Date(Date.now() - 60000), saving: false, dirty: true } }
