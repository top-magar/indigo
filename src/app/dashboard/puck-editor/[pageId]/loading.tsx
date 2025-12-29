import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-background">
            <div className="flex flex-col items-center gap-4">
                <HugeiconsIcon 
                    icon={Loading03Icon} 
                    className="h-8 w-8 animate-spin text-muted-foreground" 
                />
                <p className="text-sm text-muted-foreground">Loading editor...</p>
            </div>
        </div>
    );
}
