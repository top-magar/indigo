"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateAttribute } from "../attribute-actions";
import type { Attribute } from "../types";

interface AttributePropertiesCardProps {
    attribute: Attribute;
}

export function AttributePropertiesCard({ attribute }: AttributePropertiesCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const handleToggle = (field: string, value: boolean) => {
        startTransition(async () => {
            const result = await updateAttribute(attribute.id, { [field]: value });
            if (result.error) {
                toast.error(result.error);
            } else {
                router.refresh();
            }
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Value Required</Label>
                        <p className="text-xs text-muted-foreground">
                            Products must have a value for this attribute
                        </p>
                    </div>
                    <Switch
                        checked={attribute.valueRequired}
                        onCheckedChange={(checked) => handleToggle("valueRequired", checked)}
                        disabled={isPending}
                    />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Visible in Storefront</Label>
                        <p className="text-xs text-muted-foreground">
                            Show this attribute on product pages
                        </p>
                    </div>
                    <Switch
                        checked={attribute.visibleInStorefront}
                        onCheckedChange={(checked) => handleToggle("visibleInStorefront", checked)}
                        disabled={isPending}
                    />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Filterable in Storefront</Label>
                        <p className="text-xs text-muted-foreground">
                            Allow customers to filter products by this attribute
                        </p>
                    </div>
                    <Switch
                        checked={attribute.filterableInStorefront}
                        onCheckedChange={(checked) => handleToggle("filterableInStorefront", checked)}
                        disabled={isPending}
                    />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label>Filterable in Dashboard</Label>
                        <p className="text-xs text-muted-foreground">
                            Allow filtering products in the dashboard
                        </p>
                    </div>
                    <Switch
                        checked={attribute.filterableInDashboard}
                        onCheckedChange={(checked) => handleToggle("filterableInDashboard", checked)}
                        disabled={isPending}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
