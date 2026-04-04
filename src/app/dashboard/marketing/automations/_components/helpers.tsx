import type { Automation } from "../../types"
import { CheckCircle, Mail, RefreshCw, Sparkles, ShoppingCart, Percent, Send, type LucideIcon } from "lucide-react"

export function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US", {
        notation: value >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}


export function getAutomationTypeIcon(type: Automation["type"]): LucideIcon {
    switch (type) {
        case "welcome": return Sparkles;
        case "abandoned_cart": return ShoppingCart;
        case "post_purchase": return CheckCircle;
        case "win_back": return RefreshCw;
        case "birthday": return Percent;
        default: return Mail;
    }
}

export function getAutomationTypeLabel(type: Automation["type"]) {
    const labels: Record<Automation["type"], string> = {
        welcome: "Welcome Series",
        abandoned_cart: "Abandoned Cart",
        post_purchase: "Post-Purchase",
        win_back: "Win-Back",
        birthday: "Birthday",
    };
    return labels[type];
}

export function getAutomationTypeColor(type: Automation["type"]) {
    switch (type) {
        case "welcome": return { bg: "bg-success/10", text: "text-success", border: "border-success/20" };
        case "abandoned_cart": return { bg: "bg-warning/10", text: "text-warning", border: "border-warning/20" };
        case "post_purchase": return { bg: "bg-primary/10", text: "text-primary", border: "border-primary/20" };
        case "win_back": return { bg: "bg-ds-teal-700/10", text: "text-ds-teal-700", border: "border-chart-3/20" };
        case "birthday": return { bg: "bg-info/10", text: "text-info", border: "border-info/20" };
        default: return { bg: "bg-muted", text: "text-muted-foreground", border: "border-border" };
    }
}

export function getTriggerDescription(type: Automation["type"], delayHours: number) {
    const delayText = delayHours === 0 
        ? "immediately" 
        : delayHours < 24 
            ? `after ${delayHours} hour${delayHours !== 1 ? "s" : ""}`
            : `after ${Math.floor(delayHours / 24)} day${Math.floor(delayHours / 24) !== 1 ? "s" : ""}`;

    switch (type) {
        case "welcome": return `Sends ${delayText} when a customer subscribes`;
        case "abandoned_cart": return `Sends ${delayText} when cart is abandoned`;
        case "post_purchase": return `Sends ${delayText} after purchase`;
        case "win_back": return `Sends ${delayText} of inactivity`;
        case "birthday": return `Sends on customer's birthday`;
        default: return `Triggers ${delayText}`;
    }
}

// Predefined automation templates
export const automationTemplates = [
    {
        type: "welcome" as const,
        name: "Welcome Series",
        description: "Greet new subscribers with a series of onboarding emails introducing your brand and products",
        defaultDelay: 0,
        emailCount: 3,
        avgConversion: "12-15%",
    },
    {
        type: "abandoned_cart" as const,
        name: "Abandoned Cart Recovery",
        description: "Remind customers about items left in their cart with personalized product recommendations",
        defaultDelay: 1,
        emailCount: 3,
        avgConversion: "15-20%",
    },
    {
        type: "post_purchase" as const,
        name: "Post-Purchase Follow-up",
        description: "Thank customers, request reviews, and suggest complementary products after purchase",
        defaultDelay: 24,
        emailCount: 2,
        avgConversion: "8-12%",
    },
    {
        type: "win_back" as const,
        name: "Win-Back Campaign",
        description: "Re-engage customers who haven't purchased recently with special offers and incentives",
        defaultDelay: 1440,
        emailCount: 3,
        avgConversion: "5-8%",
    },
    {
        type: "birthday" as const,
        name: "Birthday Rewards",
        description: "Send special birthday offers and discounts to make customers feel valued",
        defaultDelay: 0,
        emailCount: 1,
        avgConversion: "10-15%",
    },
];

