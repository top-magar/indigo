import type { Meta, StoryObj } from "@storybook/react";
import { within, userEvent, expect } from "@storybook/test";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const meta: Meta = { title: "Pages/Auth/Login", parameters: { layout: "centered" } };
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Log in to your dashboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
        <a href="#" className="text-sm text-muted-foreground hover:underline">Forgot password?</a>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Log in</Button>
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account? <a href="#" className="underline">Sign up</a>
        </p>
      </CardFooter>
    </Card>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const email = canvas.getByLabelText("Email");
    const password = canvas.getByLabelText("Password");
    await userEvent.type(email, "user@example.com");
    await userEvent.type(password, "secret123");
    await expect(email).toHaveValue("user@example.com");
    await expect(password).toHaveValue("secret123");
  },
};
