import type { Meta, StoryObj } from "@storybook/react";
import { EmptyState, NoResults, NoRecords } from "./empty-state";
import { FileText } from "lucide-react";

const meta: Meta<typeof EmptyState> = { component: EmptyState, title: "UI/EmptyState" };
export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: { title: "No items", description: "Get started by creating your first item." },
};
export const WithAction: Story = {
  args: {
    icon: FileText,
    title: "No documents",
    description: "Create a document to get started.",
    action: { label: "Create Document", onClick: () => {} },
  },
};
export const SearchNoResults: Story = {
  render: () => <NoResults onClear={() => {}} />,
};
export const Records: Story = {
  render: () => <NoRecords action={{ label: "Create Record", onClick: () => {} }} />,
};
