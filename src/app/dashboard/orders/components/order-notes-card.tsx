"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { NoteIcon, SentIcon } from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import type { Order } from "../types";
import { addOrderNote } from "../order-actions";

interface OrderNotesCardProps {
    order: Order;
}

export function OrderNotesCard({ order }: OrderNotesCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [note, setNote] = useState("");

    const handleSubmit = () => {
        if (!note.trim()) return;

        startTransition(async () => {
            const result = await addOrderNote({
                orderId: order.id,
                message: note.trim(),
                isPublic: false,
            });

            if (result.success) {
                toast.success("Note added");
                setNote("");
                router.refresh();
            } else {
                toast.error(result.error || "Failed to add note");
            }
        });
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <HugeiconsIcon icon={NoteIcon} className="h-5 w-5" />
                    Notes
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Internal Notes */}
                {order.internalNotes && (
                    <div className="p-3 rounded-lg bg-muted/50">
                        <p className="text-xs font-medium text-muted-foreground mb-1">Internal Notes</p>
                        <p className="text-sm whitespace-pre-wrap">{order.internalNotes}</p>
                    </div>
                )}

                {/* Add Note */}
                <div className="space-y-2">
                    <Textarea
                        placeholder="Add a note about this order..."
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        rows={3}
                        className="resize-none"
                    />
                    <Button
                        size="sm"
                        onClick={handleSubmit}
                        disabled={isPending || !note.trim()}
                        className="w-full"
                    >
                        <HugeiconsIcon icon={SentIcon} className="h-4 w-4 mr-1" />
                        {isPending ? "Adding..." : "Add Note"}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
