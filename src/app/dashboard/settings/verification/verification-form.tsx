"use client";

import { useState, useTransition } from "react";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (formData: FormData) => {
    setErrors({});

    // Client-side validation for inline errors
    const fieldErrors: Record<string, string> = {};
    const fullName = formData.get("fullName") as string;
    const phone = formData.get("phone") as string;
    const businessAddress = formData.get("businessAddress") as string;
    const panNumber = formData.get("panNumber") as string;

    if (!fullName || fullName.length < 2) fieldErrors.fullName = "Name must be at least 2 characters";
    if (!phone || !/^(98|97|96)\d{8}$/.test(phone)) fieldErrors.phone = "Enter a valid Nepal number (98XXXXXXXX)";
    if (!businessAddress || businessAddress.length < 5) fieldErrors.businessAddress = "Address must be at least 5 characters";
    if (!panNumber || !/^\d{9}$/.test(panNumber)) fieldErrors.panNumber = "PAN must be exactly 9 digits";

    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      return;
    }

    startTransition(async () => {
      const result = await submitVerification(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Verification submitted! We'll review within 1-2 business days.");
    });
  };

  const fieldError = (name: string) => errors[name] ? (
    <p className="text-xs text-destructive mt-1" role="alert">{errors[name]}</p>
  ) : null;

  return (
    <form action={handleSubmit} className="rounded-lg border p-4 space-y-4">
      <p className="text-sm font-medium">Verification Details</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="fullName" className="text-xs">Full Legal Name <span className="text-destructive">*</span></Label>
          <Input id="fullName" name="fullName" defaultValue={existing?.fullName} required placeholder="As on citizenship/PAN" aria-invalid={!!errors.fullName} />
          {fieldError("fullName")}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-xs">Phone Number <span className="text-destructive">*</span></Label>
          <Input id="phone" name="phone" defaultValue={existing?.phone} required placeholder="98XXXXXXXX" type="tel" aria-invalid={!!errors.phone} />
          {fieldError("phone")}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="businessType" className="text-xs">Business Type <span className="text-destructive">*</span></Label>
          <Select name="businessType" defaultValue={existing?.businessType || "individual"}>
            <SelectTrigger id="businessType"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="individual">Individual (Sole Proprietor)</SelectItem>
              <SelectItem value="company">Company (Pvt. Ltd / Partnership)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="panNumber" className="text-xs">PAN Number <span className="text-destructive">*</span></Label>
          <Input id="panNumber" name="panNumber" defaultValue={existing?.panNumber} required placeholder="9 digit PAN number" aria-invalid={!!errors.panNumber} />
          {fieldError("panNumber")}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="businessAddress" className="text-xs">Business Address <span className="text-destructive">*</span></Label>
        <Input id="businessAddress" name="businessAddress" defaultValue={existing?.businessAddress} required placeholder="Ward, Municipality, District" aria-invalid={!!errors.businessAddress} />
        {fieldError("businessAddress")}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="registrationNumber" className="text-xs">Company Registration Number</Label>
        <Input id="registrationNumber" name="registrationNumber" defaultValue={existing?.registrationNumber ?? ""} placeholder="Optional for individuals" />
      </div>

      <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-3" id="consent-text">
        By submitting, you confirm this information is accurate. Your PAN number is stored securely and only visible to platform administrators. Required under Nepal E-Commerce Act 2081.
      </p>

      <Button type="submit" size="sm" disabled={isPending} aria-describedby="consent-text">
        {isPending ? "Submitting..." : existing ? "Resubmit Verification" : "Submit for Verification"}
      </Button>
    </form>
  );
}
