import type { Meta, StoryObj } from "@storybook/react"
import { withCraftEditorOnly } from "./craft-decorator"
import { FloatingToolbar } from "../canvas/floating-toolbar"

const meta: Meta = {
  title: "Editor/FloatingToolbar",
  decorators: [withCraftEditorOnly],
}
export default meta

/** Toolbar is hidden until a node is selected in the Craft.js editor. */
export const Default: StoryObj = {
  render: () => (
    <div className="relative h-64 w-full border border-dashed border-border rounded-md">
      <p className="p-4 text-sm text-muted-foreground">
        Select a node in the Craft.js editor to see the toolbar.
      </p>
      <FloatingToolbar />
    </div>
  ),
}
