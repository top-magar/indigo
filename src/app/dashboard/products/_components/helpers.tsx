import { Badge } from "@/components/ui/badge"

export function StockBadge({ quantity }: { quantity: number }) {
    if (quantity === 0) {
        return (
            <Badge className="bg-destructive/10 text-destructive border-0 gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                Out of Stock
            </Badge>
        );
    }
    if (quantity <= 10) {
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


