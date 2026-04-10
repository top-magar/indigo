import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

const meta: Meta = { title: "UI/Dialog/Interaction Tests" };
export default meta;

export const OpenAndClose: StoryObj = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild><Button>Open Dialog</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Make changes to your profile here.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div><Label htmlFor="name">Name</Label><Input id="name" defaultValue="John" /></div>
          <div><Label htmlFor="email">Email</Label><Input id="email" defaultValue="john@example.com" /></div>
        </div>
        <DialogFooter><Button type="submit">Save changes</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Click trigger to open
    await userEvent.click(canvas.getByRole("button", { name: "Open Dialog" }));
    // Verify dialog opened
    const dialog = within(document.body);
    await expect(dialog.getByText("Edit Profile")).toBeVisible();
    // Type in the name field
    const nameInput = dialog.getByLabelText("Name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Jane Doe");
    await expect(nameInput).toHaveValue("Jane Doe");
  },
};
