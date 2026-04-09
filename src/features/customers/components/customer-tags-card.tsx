"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Tag, Plus, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Customer } from "@/app/dashboard/customers/types";
import { updateCustomerTags } from "@/app/dashboard/customers/customer-actions";

interface Props {
    customer: Customer;
}

const SUGGESTED_TAGS = ["VIP", "Wholesale", "Returning", "High Value", "At Risk", "New"];

export function CustomerTagsCard({ customer }: Props) {
    const [tags, setTags] = useState<string[]>(customer.tags);
    const [input, setInput] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [isPending, startTransition] = useTransition();

    function save(newTags: string[]) {
        setTags(newTags);
        startTransition(async () => {
            const result = await updateCustomerTags(customer.id, newTags);
            if (!result.success) toast.error(result.error ?? "Failed to save tags");
        });
    }

    function addTag(tag: string) {
        const t = tag.trim();
        if (!t || tags.includes(t)) return;
        save([...tags, t]);
        setInput("");
        setShowInput(false);
    }

    function removeTag(tag: string) {
        save(tags.filter((t) => t !== tag));
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="size-4" /> Tags
                </CardTitle>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowInput(true)}>
                    <Plus className="size-4" />
                </Button>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                            {tag}
                            <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive" disabled={isPending}>
                                <X className="size-3.5" />
                            </button>
                        </Badge>
                    ))}
                    {tags.length === 0 && !showInput && (
                        <p className="text-xs text-muted-foreground">No tags yet</p>
                    )}
                </div>
                {showInput && (
                    <div className="mt-3 space-y-2">
                        <div className="flex gap-2">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addTag(input)}
                                placeholder="Add tag…"
                                className="h-8 text-sm"
                                autoFocus
                            />
                            <Button variant="outline" onClick={() => { setShowInput(false); setInput(""); }}>
                                Cancel
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-1">
                            {SUGGESTED_TAGS.filter((s) => !tags.includes(s)).map((s) => (
                                <button key={s} onClick={() => addTag(s)} className="text-xs px-2 py-0.5 rounded-full border hover:bg-accent transition-colors">
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
