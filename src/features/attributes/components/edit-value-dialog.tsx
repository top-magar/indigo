"use client";

import { useState, useTransition, useEffect } from "react";
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
import { updateAttributeValue } from "@/app/dashboard/attributes/attribute-actions";
import type { Attribute, AttributeValue } from "@/app/dashboard/attributes/types";

interface EditValueDialogProps {
    attribute: Attribute;
    value: AttributeValue | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditValueDialog({ attribute, value, open, onOpenChange }: EditValueDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    
    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [swatchColor, setSwatchColor] = useState("#000000");
    const [swatchImage, setSwatchImage] = useState("");

    const isSwatch = attribute.inputType === "swatch";

    // Reset form when value changes
    useEffect(() => {
        if (value) {
            setName(value.name);
            setSlug(value.slug);
            setSwatchColor(value.swatchColor || "#000000");
            setSwatchImage(value.swatchImage || "");
        }
    }, [value]);

    const handleSubmit = () => {
        if (!value) return;
        if (!name.trim()) {
            toast.error("Please enter a name");
            return;
        }

        startTransition(async () => {
            const result = await updateAttributeValue(value.id, {
                name: name.trim(),
                slug: slug.trim(),
                swatchColor: isSwatch ? swatchColor : undefined,
                swatchImage: isSwatch ? swatchImage : undefined,
            });

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Value updated");
                onOpenChange(false);
                router.refresh();
            }
        });
    };

    if (!value) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Value</DialogTitle>
                    <DialogDescription>
                        Update the value for "{attribute.name}"
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    {/* Name */}
                    <div className="space-y-2">
                        <Label htmlFor="editValueName">Name *</Label>
                        <Input
                            id="editValueName"
                            value={name}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                            placeholder="Value name"
                        />
                    </div>

                    {/* Slug */}
                    <div className="space-y-2">
                        <Label htmlFor="editValueSlug">Slug</Label>
                        <Input
                            id="editValueSlug"
                            value={slug}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                            placeholder="value-slug"
                        />
                    </div>

                    {/* Swatch fields */}
                    {isSwatch && (
                        <>
                            <div className="space-y-2">
                                <Label htmlFor="editSwatchColor">Color</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="editSwatchColor"
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
                                <Label htmlFor="editSwatchImage">Image URL (optional)</Label>
                                <Input
                                    id="editSwatchImage"
                                    value={swatchImage}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSwatchImage(e.target.value)}
                                    placeholder="https://..."
                                />
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
