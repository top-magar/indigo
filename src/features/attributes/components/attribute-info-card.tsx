"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PenLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateAttribute } from "@/app/dashboard/attributes/attribute-actions";
import { INPUT_TYPE_CONFIG, NUMERIC_UNITS } from "@/app/dashboard/attributes/types";
import type { Attribute } from "@/app/dashboard/attributes/types";

interface AttributeInfoCardProps {
    attribute: Attribute;
}

export function AttributeInfoCard({ attribute }: AttributeInfoCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(attribute.name);
    const [slug, setSlug] = useState(attribute.slug);

    const inputTypeConfig = INPUT_TYPE_CONFIG[attribute.inputType];
    const unitLabel = attribute.unit 
        ? NUMERIC_UNITS.find(u => u.value === attribute.unit)?.label 
        : null;

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateAttribute(attribute.id, { name, slug });
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Attribute updated");
                setIsEditing(false);
                router.refresh();
            }
        });
    };

    const handleCancel = () => {
        setName(attribute.name);
        setSlug(attribute.slug);
        setIsEditing(false);
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">General Information</CardTitle>
                {!isEditing && (
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                        <PenLine className="w-4 h-4" />
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {isEditing ? (
                    <>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                                placeholder="Attribute name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={slug}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSlug(e.target.value)}
                                placeholder="attribute-slug"
                            />
                            <p className="text-xs text-muted-foreground">
                                Used in URLs and API
                            </p>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={handleCancel}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleSave} disabled={isPending}>
                                {isPending ? "Saving..." : "Save"}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Name</p>
                                <p className="font-medium">{attribute.name}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Slug</p>
                                <code className="text-sm bg-muted px-1.5 py-0.5 rounded">
                                    {attribute.slug}
                                </code>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Input Type</p>
                                <p className="font-medium">{inputTypeConfig.label}</p>
                                <p className="text-xs text-muted-foreground">{inputTypeConfig.description}</p>
                            </div>
                            {attribute.inputType === "numeric" && unitLabel && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Unit</p>
                                    <p className="font-medium">{unitLabel}</p>
                                </div>
                            )}
                            {attribute.inputType === "reference" && attribute.entityType && (
                                <div>
                                    <p className="text-sm text-muted-foreground">Entity Type</p>
                                    <p className="font-medium capitalize">{attribute.entityType.replace("_", " ")}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">Values</p>
                            <p className="font-medium">
                                {inputTypeConfig.hasValues 
                                    ? `${attribute.values.length} value(s)` 
                                    : "N/A (free input)"
                                }
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}
