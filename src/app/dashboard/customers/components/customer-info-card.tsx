"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Mail01Icon,
    SmartPhone01Icon,
    Calendar03Icon,
    Clock01Icon,
    CheckmarkCircle02Icon,
    Cancel01Icon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { updateCustomerDetails } from "../customer-actions";
import type { Customer } from "../types";

interface CustomerInfoCardProps {
    customer: Customer;
}

export function CustomerInfoCard({ customer }: CustomerInfoCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isActive, setIsActive] = useState(customer.isActive);
    const [acceptsMarketing, setAcceptsMarketing] = useState(customer.acceptsMarketing);
    const [note, setNote] = useState(customer.note || "");
    const [isEditingNote, setIsEditingNote] = useState(false);

    const handleStatusChange = (checked: boolean) => {
        setIsActive(checked);
        startTransition(async () => {
            const result = await updateCustomerDetails(customer.id, { isActive: checked });
            if (result.error) {
                toast.error(result.error);
                setIsActive(!checked);
            } else {
                toast.success(checked ? "Customer activated" : "Customer deactivated");
                router.refresh();
            }
        });
    };

    const handleMarketingChange = (checked: boolean) => {
        setAcceptsMarketing(checked);
        startTransition(async () => {
            const result = await updateCustomerDetails(customer.id, { acceptsMarketing: checked });
            if (result.error) {
                toast.error(result.error);
                setAcceptsMarketing(!checked);
            } else {
                toast.success(checked ? "Subscribed to marketing" : "Unsubscribed from marketing");
                router.refresh();
            }
        });
    };

    const handleSaveNote = () => {
        startTransition(async () => {
            const result = await updateCustomerDetails(customer.id, { note });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Note saved");
                setIsEditingNote(false);
                router.refresh();
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>{customer.email}</span>
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Active member since {format(new Date(customer.dateJoined), "MMM yyyy")}
                </p>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Account Status */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <HugeiconsIcon 
                            icon={isActive ? CheckmarkCircle02Icon : Cancel01Icon} 
                            className={cn("w-4 h-4", isActive ? "text-chart-2" : "text-muted-foreground")} 
                        />
                        <span className="text-sm">User account active</span>
                    </div>
                    <Switch
                        checked={isActive}
                        onCheckedChange={handleStatusChange}
                        disabled={isPending}
                    />
                </div>

                <Separator />

                {/* Contact Info */}
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 text-muted-foreground" />
                        <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                            {customer.email}
                        </a>
                    </div>
                    {customer.phone && (
                        <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={SmartPhone01Icon} className="w-4 h-4 text-muted-foreground" />
                            <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                                {customer.phone}
                            </a>
                        </div>
                    )}
                    <div className="flex items-center gap-3">
                        <HugeiconsIcon icon={Calendar03Icon} className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                            Joined {format(new Date(customer.dateJoined), "PPP")}
                        </span>
                    </div>
                    {customer.lastLogin && (
                        <div className="flex items-center gap-3">
                            <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Last login {format(new Date(customer.lastLogin), "PPP")}
                            </span>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Marketing */}
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm">Marketing emails</Label>
                        <p className="text-xs text-muted-foreground">
                            Receive promotional content
                        </p>
                    </div>
                    <Badge
                        variant="secondary"
                        className={cn(
                            "border-0 cursor-pointer",
                            acceptsMarketing
                                ? "bg-chart-2/10 text-chart-2"
                                : "bg-muted text-muted-foreground"
                        )}
                        onClick={() => handleMarketingChange(!acceptsMarketing)}
                    >
                        {acceptsMarketing ? "Subscribed" : "Not subscribed"}
                    </Badge>
                </div>

                <Separator />

                {/* Note */}
                <div className="space-y-2">
                    <Label className="text-sm">Note</Label>
                    {isEditingNote ? (
                        <div className="space-y-2">
                            <Textarea
                                value={note}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNote(e.target.value)}
                                placeholder="Add a note about this customer..."
                                rows={3}
                            />
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setNote(customer.note || "");
                                        setIsEditingNote(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button size="sm" onClick={handleSaveNote} disabled={isPending}>
                                    {isPending ? "Saving..." : "Save"}
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div
                            className="text-sm text-muted-foreground p-3 rounded-lg border border-dashed cursor-pointer hover:bg-muted/50 transition-colors min-h-[60px]"
                            onClick={() => setIsEditingNote(true)}
                            onKeyDown={(e: React.KeyboardEvent) => e.key === "Enter" && setIsEditingNote(true)}
                            role="button"
                            tabIndex={0}
                        >
                            {note || "Click to add a note..."}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
