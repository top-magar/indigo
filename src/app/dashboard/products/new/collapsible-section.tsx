"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { CollapsibleSectionProps } from "./types";

export function CollapsibleSection({
    title,
    icon: Icon,
    description,
    isOpen,
    onToggle,
    children,
    badge,
    iconColor: _iconColor = "muted",
}: CollapsibleSectionProps) {
    return (
        <Collapsible open={isOpen} onOpenChange={onToggle}>
            <Card>
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                                    {description && (
                                        <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {badge}
                                {isOpen ? (
                                    <ChevronUp className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                ) : (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <CardContent className="pt-0">{children}</CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}
