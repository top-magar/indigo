import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./card";

const meta: Meta<typeof Card> = { component: Card, title: "UI/Card" };
export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle className="text-sm">Card Title</CardTitle>
        <CardDescription className="text-xs">Card description</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground">Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};
