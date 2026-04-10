import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const meta: Meta = { title: "Pages/Auth/Onboarding", parameters: { layout: "centered" } };
export default meta;

export const Step1StoreName: StoryObj = {
  render: () => (
    <Card className="w-[480px]">
      <CardHeader><CardTitle>Step 1 — Store details</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="store">Store name</Label>
          <Input id="store" placeholder="My Awesome Store" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Input id="category" placeholder="e.g. Fashion, Electronics" />
        </div>
        <Button className="w-full">Next</Button>
      </CardContent>
    </Card>
  ),
};

export const Step2Branding: StoryObj = {
  render: () => (
    <Card className="w-[480px]">
      <CardHeader><CardTitle>Step 2 — Branding</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex h-32 items-center justify-center rounded-md border border-dashed text-sm text-muted-foreground">Upload your logo</div>
        <div className="space-y-2"><Label htmlFor="desc">Description</Label><Input id="desc" placeholder="Tell customers about your store" /></div>
        <Button className="w-full">Next</Button>
      </CardContent>
    </Card>
  ),
};

export const Step3Plan: StoryObj = {
  render: () => (
    <Card className="w-[480px]">
      <CardHeader><CardTitle>Step 3 — Choose a plan</CardTitle></CardHeader>
      <CardContent className="grid grid-cols-3 gap-3">
        {(["Free", "Pro", "Enterprise"] as const).map((plan) => (
          <Card key={plan} className="cursor-pointer p-4 text-center hover:border-primary">
            <p className="font-semibold">{plan}</p>
            <p className="text-xs text-muted-foreground">{plan === "Free" ? "$0/mo" : plan === "Pro" ? "$29/mo" : "Custom"}</p>
          </Card>
        ))}
        <Button className="col-span-3 w-full">Get started</Button>
      </CardContent>
    </Card>
  ),
};
