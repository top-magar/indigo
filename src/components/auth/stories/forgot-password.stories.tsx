import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const meta: Meta = { title: "Pages/Auth/ForgotPassword", parameters: { layout: "centered" } };
export default meta;

export const Default: StoryObj = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>Enter your email to receive a reset link.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@example.com" />
        </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button className="w-full">Send reset link</Button>
        <a href="#" className="text-sm text-muted-foreground hover:underline">Back to login</a>
      </CardFooter>
    </Card>
  ),
};

export const CheckYourEmail: StoryObj = {
  render: () => (
    <Card className="w-96 text-center">
      <CardHeader>
        <CardTitle>Check your email</CardTitle>
        <CardDescription>We sent a reset link to your inbox.</CardDescription>
      </CardHeader>
      <CardFooter className="justify-center">
        <a href="#" className="text-sm text-muted-foreground hover:underline">Back to login</a>
      </CardFooter>
    </Card>
  ),
};
