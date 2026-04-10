import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

const meta: Meta = {
  title: "Pages/Settings Form",
  parameters: { layout: "padded" },
};
export default meta;

export const Default: StoryObj = {
  render: () => (
    <div className="max-w-3xl space-y-3">
      <div>
        <h1 className="text-sm font-semibold">Store Settings</h1>
        <p className="text-xs text-muted-foreground">Manage your store configuration</p>
      </div>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">General</CardTitle>
          <CardDescription className="text-xs">Basic store information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div><Label htmlFor="storeName" className="text-xs">Store Name</Label><Input id="storeName" defaultValue="My Store" /></div>
          <div><Label htmlFor="storeEmail" className="text-xs">Contact Email</Label><Input id="storeEmail" type="email" defaultValue="hello@mystore.com" /></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <div><Label className="text-xs">Order notifications</Label><p className="text-[10px] text-muted-foreground">Get notified for new orders</p></div>
            <Switch id="orderNotif" defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div><Label className="text-xs">Low stock alerts</Label><p className="text-[10px] text-muted-foreground">Alert when stock is below threshold</p></div>
            <Switch id="stockNotif" />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end gap-2">
        <Button variant="outline" size="sm">Cancel</Button>
        <Button size="sm">Save Changes</Button>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Edit store name
    const nameInput = canvas.getByLabelText("Store Name");
    await userEvent.clear(nameInput);
    await userEvent.type(nameInput, "Indigo Store");
    await expect(nameInput).toHaveValue("Indigo Store");
    // Toggle notification
    const stockSwitch = canvas.getByRole("switch", { name: /low stock/i });
    await userEvent.click(stockSwitch);
    await expect(stockSwitch).toBeChecked();
  },
};
