import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function Login() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Sign In</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium">Email</label><Input type="email" placeholder="you@example.com" /></div>
          <div><label className="text-sm font-medium">Password</label><Input type="password" placeholder="••••••••" /></div>
          <Button className="w-full">Sign In</Button>
          <div className="flex justify-between text-sm">
            <a href="#" className="text-primary hover:underline">Forgot password?</a>
            <a href="#" className="text-primary hover:underline">Create account</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Signup() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader><CardTitle>Create Account</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><label className="text-sm font-medium">Name</label><Input placeholder="Jane Doe" /></div>
          <div><label className="text-sm font-medium">Email</label><Input type="email" placeholder="you@example.com" /></div>
          <div><label className="text-sm font-medium">Password</label><Input type="password" placeholder="••••••••" /></div>
          <label className="flex items-center gap-2 text-sm"><Checkbox />I agree to the Terms of Service</label>
          <Button className="w-full">Create Account</Button>
          <p className="text-sm text-center">Already have an account? <a href="#" className="text-primary hover:underline">Sign in</a></p>
        </CardContent>
      </Card>
    </div>
  );
}

const meta: Meta = { title: "Pages/Store/Auth", parameters: { layout: "fullscreen" } };
export default meta;
type Story = StoryObj;
export const LoginForm: Story = { render: () => <Login /> };
export const SignupForm: Story = { render: () => <Signup /> };
