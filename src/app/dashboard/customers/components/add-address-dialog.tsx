"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { addCustomerAddress, updateCustomerAddress } from "../customer-actions";
import type { CustomerAddress, AddressInput } from "../types";

interface AddAddressDialogProps {
    customerId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    editAddress?: CustomerAddress | null;
}

const COUNTRIES = [
    { code: "US", name: "United States" },
    { code: "CA", name: "Canada" },
    { code: "GB", name: "United Kingdom" },
    { code: "AU", name: "Australia" },
    { code: "DE", name: "Germany" },
    { code: "FR", name: "France" },
    { code: "IN", name: "India" },
    { code: "JP", name: "Japan" },
    { code: "BR", name: "Brazil" },
    { code: "MX", name: "Mexico" },
];

export function AddAddressDialog({ 
    customerId, 
    open, 
    onOpenChange,
    editAddress 
}: AddAddressDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [type, setType] = useState<"shipping" | "billing">(editAddress?.type || "shipping");
    const [firstName, setFirstName] = useState(editAddress?.firstName || "");
    const [lastName, setLastName] = useState(editAddress?.lastName || "");
    const [company, setCompany] = useState(editAddress?.company || "");
    const [addressLine1, setAddressLine1] = useState(editAddress?.addressLine1 || "");
    const [addressLine2, setAddressLine2] = useState(editAddress?.addressLine2 || "");
    const [city, setCity] = useState(editAddress?.city || "");
    const [state, setState] = useState(editAddress?.state || "");
    const [postalCode, setPostalCode] = useState(editAddress?.postalCode || "");
    const [country, setCountry] = useState(editAddress?.country || "");
    const [countryCode, setCountryCode] = useState(editAddress?.countryCode || "");
    const [phone, setPhone] = useState(editAddress?.phone || "");
    const [isDefault, setIsDefault] = useState(editAddress?.isDefault || false);

    const resetForm = () => {
        setType("shipping");
        setFirstName("");
        setLastName("");
        setCompany("");
        setAddressLine1("");
        setAddressLine2("");
        setCity("");
        setState("");
        setPostalCode("");
        setCountry("");
        setCountryCode("");
        setPhone("");
        setIsDefault(false);
    };

    const handleSubmit = () => {
        if (!addressLine1 || !city || !country) {
            toast.error("Please fill in required fields");
            return;
        }

        const input: AddressInput = {
            type,
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            company: company || undefined,
            addressLine1,
            addressLine2: addressLine2 || undefined,
            city,
            state: state || undefined,
            postalCode: postalCode || undefined,
            country,
            countryCode: countryCode || country,
            phone: phone || undefined,
            isDefault,
        };

        startTransition(async () => {
            const result = editAddress
                ? await updateCustomerAddress(editAddress.id, input)
                : await addCustomerAddress(customerId, input);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success(editAddress ? "Address updated" : "Address added");
                resetForm();
                onOpenChange(false);
                router.refresh();
            }
        });
    };

    const handleCountryChange = (code: string) => {
        const selectedCountry = COUNTRIES.find(c => c.code === code);
        if (selectedCountry) {
            setCountryCode(code);
            setCountry(selectedCountry.name);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen: boolean) => {
            if (!isOpen) resetForm();
            onOpenChange(isOpen);
        }}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle>{editAddress ? "Edit Address" : "Add Address"}</DialogTitle>
                    <DialogDescription>
                        {editAddress ? "Update the address details" : "Add a new address for this customer"}
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
                    {/* Address Type */}
                    <div className="space-y-2">
                        <Label>Address Type</Label>
                        <Select value={type} onValueChange={(v: string) => setType(v as "shipping" | "billing")}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shipping">Shipping</SelectItem>
                                <SelectItem value="billing">Billing</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Name */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                value={firstName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFirstName(e.target.value)}
                                placeholder="John"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                value={lastName}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLastName(e.target.value)}
                                placeholder="Doe"
                            />
                        </div>
                    </div>

                    {/* Company */}
                    <div className="space-y-2">
                        <Label htmlFor="company">Company (optional)</Label>
                        <Input
                            id="company"
                            value={company}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCompany(e.target.value)}
                            placeholder="Company name"
                        />
                    </div>

                    {/* Address Lines */}
                    <div className="space-y-2">
                        <Label htmlFor="addressLine1">Address Line 1 *</Label>
                        <Input
                            id="addressLine1"
                            value={addressLine1}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressLine1(e.target.value)}
                            placeholder="123 Main St"
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="addressLine2">Address Line 2 (optional)</Label>
                        <Input
                            id="addressLine2"
                            value={addressLine2}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddressLine2(e.target.value)}
                            placeholder="Apt, suite, unit, etc."
                        />
                    </div>

                    {/* City, State, Postal */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="city">City *</Label>
                            <Input
                                id="city"
                                value={city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCity(e.target.value)}
                                placeholder="City"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="state">State/Province</Label>
                            <Input
                                id="state"
                                value={state}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setState(e.target.value)}
                                placeholder="State"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="postalCode">Postal Code</Label>
                            <Input
                                id="postalCode"
                                value={postalCode}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPostalCode(e.target.value)}
                                placeholder="12345"
                            />
                        </div>
                    </div>

                    {/* Country */}
                    <div className="space-y-2">
                        <Label>Country *</Label>
                        <Select value={countryCode} onValueChange={handleCountryChange}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                                {COUNTRIES.map((c) => (
                                    <SelectItem key={c.code} value={c.code}>
                                        {c.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    {/* Default */}
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="isDefault"
                            checked={isDefault}
                            onCheckedChange={(checked: boolean | "indeterminate") => setIsDefault(checked === true)}
                        />
                        <Label htmlFor="isDefault" className="text-sm cursor-pointer">
                            Set as default {type} address
                        </Label>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? "Saving..." : editAddress ? "Update" : "Add Address"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
