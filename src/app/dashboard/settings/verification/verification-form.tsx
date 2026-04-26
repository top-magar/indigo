"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { submitVerification } from "./actions";

type Existing = {
  fullName: string; phone: string; businessType: string;
  businessAddress: string; panNumber: string; registrationNumber: string | null;
};

export default function VerificationForm({ existing }: { existing?: Existing }) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = await submitVerification(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Verification submitted! We'll review within 1-2 business days.");
    });
  };

  return (
    <form action={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <p className="text-sm font-medium">Verification Details</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs">Full Legal Name *</Label>
          <Input id="fullName" name="fullName" defaultValue={existing?.fullName} required placeholder="As on citizenship/PAN" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">Phone Number *</Label>
          <Input id="phone" name="phone" defaultValue={existing?.phone} required placeholder="98XXXXXXXX" type="tel" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="businessType" className="text-xs">Business Type *</Label>
          <Select name="businessType" defaultValue={existing?.businessType || "individual"}>
            <SelectTrigger id="businessType"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual (Sole Proprietor)</SelectItem>
              <SelectItem value="company">Company (Pvt. Ltd / Partnership)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="panNumber" className="text-xs">PAN Number *</Label>
          <Input id="panNumber" name="panNumber" defaultValue={existing?.panNumber} required placeholder="PAN number" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="businessAddress" className="text-xs">Business Address *</Label>
        <Input id="businessAddress" name="businessAddress" defaultValue={existing?.businessAddress} required placeholder="Ward, Municipality, District" />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="registrationNumber" className="text-xs">Company Registration Number (if company)</Label>
        <Input id="registrationNumber" name="registrationNumber" defaultValue={existing?.registrationNumber ?? ""} placeholder="Optional for individuals" />
      </div>

      <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3">
        By submitting, you confirm this information is accurate. Your PAN number is stored securely and only visible to platform administrators. Required under Nepal E-Commerce Act 2081.
      </div>

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Submitting..." : existing ? "Resubmit Verification" : "Submit for Verification"}
      </Button>
    </form>
  );
}
