"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { addAttributeValue } from "../attribute-actions";
import type { Attribute } from "../types";

interface AddValueDialogProps {
    attribute: Attribute;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddValueDialog({ attribute, open, onOpenChange }: AddValueDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [swatchColor, setSwatchColor] = useState("#000000");
    const [swatchImage, setSwatchImage] = useState("");

    const isSwatch = attribute.inputType === "swatch";

    const resetForm = () => {
        setName("");
        setSlug("");
        setSwatchColor("#000000");
        setSwatchImage("");
    };

    const handleSubmit = () => {
        if (!name.trim()) {
            toast.error("Please enter a name");
            return;
        }

        startTransition(async () => {
            const result = await addAttributeValue(attribute.id, {
                name: name.trim(),
                slug: slug.trim() || undefined,
                swatchColor: isSwatch && swatchColor ? swatchColor : undefined,
                swatchImage: isSwatch && swatchImage ? swatchImage : undefined,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Value added");
                resetForm();
                onOpenChange(false);
                router.refresh();
            }
        });
    };

    const generateSlug = () => {
        if (name && !slug) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
        }
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => {
            if (!isOpen) resetForm();
            onOpenChange(isOpen);
        }}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Value</DialogTitle>
                    <DialogDescription>
                        Add a new value for "{attribute.name}"
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="valueName">Name *</Label>
                        <Input
                            id="valueName"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            onBlur={generateSlug}
                            placeholder={isSwatch ? "e.g., Red, Blue, Green" : "e.g., Small, Medium, Large"}
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="valueSlug">Slug</Label>
                        <Input
                            id="valueSlug"
                            value={slug}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                            placeholder="auto-generated from name"
                        />
                    </div>

                    {/* Swatch fields */}
                    {isSwatch && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="swatchColor">Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="swatchColor"
                                        type="color"
                                        value={swatchColor}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSwatchColor(e.target.value)}
                                        className="w-16 h-10 p-1 cursor-pointer"
                                    />
                                    <Input
                                        value={swatchColor}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSwatchColor(e.target.value)}
                                        placeholder="#000000"
                                        className="flex-1"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="swatchImage">Image URL (optional)</Label>
                                <Input
                                    id="swatchImage"
                                    value={swatchImage}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSwatchImage(e.target.value)}
                                    placeholder="https://..."
                                />
                                <p className="text-xs text-muted-foreground">
                                    Use an image instead of a color (e.g., for patterns)
                                </p>
                            </div>

                            {/* Preview */}
                            <div className="space-y-2">
                                <Label>Preview</Label>
                                <div className="flex items-center gap-3">
                                    {swatchImage ? (
                                        <img
                                            src={swatchImage}
                                            alt="Swatch preview"
                                            className="w-12 h-12 rounded-md object-cover border"
                                        />
                                    ) : (
                                        <div
                                            className="w-12 h-12 rounded-md border"
                                            style={{ backgroundColor: swatchColor }}
                                        />
                                    )}
                                    <span className="text-sm">{name || "Value name"}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || !name.trim()}>
                        {isPending ? (
                            <>
                                <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                Adding...
                            </>
                        ) : (
                            "Add Value"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
