"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface VoucherCodesManualDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (code: string) => void;
}

export function VoucherCodesManualDialog({
    open,
    onOpenChange,
    onSubmit,
}: VoucherCodesManualDialogProps) {
    const [code, setCode] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (code.trim()) {
            onSubmit(code.trim().toUpperCase());
            setCode("");
        }
    };

    const handleClose = () => {
        onOpenChange(false);
        setCode("");
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Add Voucher Code</DialogTitle>
                    <DialogDescription>
                        Enter a custom voucher code manually
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="code">Voucher Code</Label>
                        <Input
                            id="code"
                            placeholder="SUMMER2024"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="font-mono uppercase"
                            required
                        />
                        <p className="text-sm text-muted-foreground">
                            Customers will enter this code at checkout
                        </p>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={handleClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={!code.trim()}>
                            Add Code
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
