import { formatCurrency } from "@/shared/utils"
import type { Discount } from "../types"
import { DollarSign, Truck, Tag, Percent, type LucideIcon } from "lucide-react"

export function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US", {
        notation: value >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}

export function formatRelativeTime(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
}


export function getDiscountTypeIcon(type: Discount["type"]): LucideIcon {
    switch (type) {
        case "percentage": return Percent;
        case "fixed": return DollarSign;
        case "free_shipping": return Truck;
        case "buy_x_get_y": return Tag;
        default: return Tag;
    }
}

export function getDiscountValue(discount: Discount, currency: string) {
    switch (discount.type) {
        case "percentage": return `${discount.value}% off`;
        case "fixed": return `${formatCurrency(discount.value, currency)} off`;
        case "free_shipping": return "Free shipping";
        case "buy_x_get_y": return "BOGO";
        default: return `${discount.value}`;
    }
}

export function getDiscountStatus(discount: Discount): { label: string; variant: string } {
    const now = new Date();
    const expiresAt = discount.expires_at ? new Date(discount.expires_at) : null;
    const startsAt = discount.starts_at ? new Date(discount.starts_at) : null;

    if (!discount.is_active) return { label: "Inactive", variant: "inactive" };
    if (expiresAt && expiresAt < now) return { label: "Expired", variant: "expired" };
    if (startsAt && startsAt > now) return { label: "Scheduled", variant: "scheduled" };
    if (discount.max_uses && discount.used_count >= discount.max_uses) return { label: "Limit Reached", variant: "limit" };
    return { label: "Active", variant: "active" };
}

export function getStatusBadgeClass(variant: string) {
    switch (variant) {
        case "active": return "bg-success/10 text-success";
        case "scheduled": return "bg-warning/10 text-warning";
        case "expired": return "bg-destructive/10 text-destructive";
        case "inactive": return "bg-muted text-muted-foreground";
        case "limit": return "bg-muted text-muted-foreground";
        default: return "bg-muted text-muted-foreground";
    }
}

