import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { cn, formatCurrency } from "@/shared/utils"

export function StockLevelIndicator({ quantity, reorderPoint }: { quantity: number; reorderPoint: number }) {
    const percentage = reorderPoint > 0 ? Math.min(100, (quantity / (reorderPoint * 3)) * 100) : 100;
    
    let color = "bg-success";
    let status = "Healthy";
    
    if (quantity === 0) {
        color = "bg-destructive";
        status = "Out of Stock";
    } else if (quantity <= reorderPoint) {
        color = "bg-warning";
        status = "Low Stock";
    }

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="w-full max-w-[100px]">
                        <Progress value={percentage} className={cn("h-2", `[&>div]:${color}`)} />
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>{status}: {quantity} units</p>
                    {reorderPoint > 0 && <p className="text-xs text-muted-foreground">Reorder at: {reorderPoint}</p>}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

// Stock badge component
export function StockBadge({ quantity, reorderPoint = 10 }: { quantity: number; reorderPoint?: number }) {
    if (quantity === 0) {
        return (
            <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Out of Stock
            </Badge>
        );
    }
    if (quantity <= reorderPoint) {
        return (
            <Badge className="bg-warning/10 text-warning border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-warning" />
                Low ({quantity})
            </Badge>
        );
    }
    return (
        <Badge className="bg-success/10 text-success border-0 gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            In Stock ({quantity})
        </Badge>
    );
}


