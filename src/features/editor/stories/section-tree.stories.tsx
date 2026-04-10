import type { Meta, StoryObj } from "@storybook/react"
import { withCraftEditorOnly } from "./craft-decorator"
import { SectionTree } from "../panels/section-tree"

const meta: Meta = {
  title: "Editor/SectionTree",
  decorators: [withCraftEditorOnly],
}
export default meta

export const Default: StoryObj = {
  render: () => (
    <div className="w-64 h-[500px] border border-border rounded-md overflow-hidden">
      <SectionTree />
    </div>
  ),
}
