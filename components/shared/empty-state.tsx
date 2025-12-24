import { HugeiconsIcon } from "@hugeicons/react";
import type { IconSvgElement } from "@hugeicons/react";

interface EmptyStateProps {
    icon: IconSvgElement;
    title: string;
    description: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-2xl bg-muted/50 p-4">
                <HugeiconsIcon icon={icon} className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">{description}</p>
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
}
