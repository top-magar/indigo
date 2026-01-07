"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { updateCustomerDetails } from "@/app/dashboard/customers/customer-actions";
import type { Customer } from "@/app/dashboard/customers/types";

interface EditCustomerDialogProps {
    customer: Customer;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditCustomerDialog({ customer, open, onOpenChange }: EditCustomerDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [firstName, setFirstName] = useState(customer.firstName || "");
    const [lastName, setLastName] = useState(customer.lastName || "");
    const [phone, setPhone] = useState(customer.phone || "");
    const [isActive, setIsActive] = useState(customer.isActive);
    const [acceptsMarketing, setAcceptsMarketing] = useState(customer.acceptsMarketing);

    // Reset form when customer changes or dialog opens
    useEffect(() => {
        if (open) {
            setFirstName(customer.firstName || "");
            setLastName(customer.lastName || "");
            setPhone(customer.phone || "");
            setIsActive(customer.isActive);
            setAcceptsMarketing(customer.acceptsMarketing);
        }
    }, [open, customer]);

    const handleSubmit = () => {
        startTransition(async () => {
            const result = await updateCustomerDetails(customer.id, {
                firstName: firstName || undefined,
                lastName: lastName || undefined,
                phone: phone || undefined,
                isActive,
                acceptsMarketing,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Customer updated");
                onOpenChange(false);
                router.refresh();
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                        Update customer information
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Email (read-only) */}
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            value={customer.email}
                            disabled
                            className="bg-muted"
                        />
                        <p className="text-xs text-muted-foreground">
                            Email cannot be changed
                        </p>
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

                    {/* Phone */}
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            value={phone}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value)}
                            placeholder="+1 (555) 000-0000"
                        />
                    </div>

                    {/* Account Status */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Account Active</Label>
                            <p className="text-sm text-muted-foreground">
                                Allow customer to log in
                            </p>
                        </div>
                        <Switch
                            checked={isActive}
                            onCheckedChange={setIsActive}
                        />
                    </div>

                    {/* Marketing */}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label>Marketing Emails</Label>
                            <p className="text-sm text-muted-foreground">
                                Receive promotional content
                            </p>
                        </div>
                        <Switch
                            checked={acceptsMarketing}
                            onCheckedChange={setAcceptsMarketing}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending}>
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
