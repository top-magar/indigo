import type { Campaign } from "../../types"
import { formatCurrency } from "@/shared/utils"

export function formatNumber(value: number) {
    return new Intl.NumberFormat("en-US", {
        notation: value >= 10000 ? "compact" : "standard",
        maximumFractionDigits: 1,
    }).format(value);
}

export function formatDate(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

export function formatDateTime(dateString: string | null) {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}

export function getStatusBadgeClass(status: Campaign["status"]) {
    switch (status) {
        case "sent": return "bg-success/10 text-success";
        case "scheduled": return "bg-warning/10 text-warning";
        case "sending": return "bg-primary/10 text-primary";
        case "draft": return "bg-muted text-muted-foreground";
        case "paused": return "bg-warning/10 text-warning";
        case "failed": return "bg-destructive/10 text-destructive";
        default: return "bg-muted text-muted-foreground";
    }
}

export function getStatusLabel(status: Campaign["status"]) {
    const labels: Record<Campaign["status"], string> = {
        draft: "Draft",
        scheduled: "Scheduled",
        sending: "Sending",
        sent: "Sent",
        paused: "Paused",
        failed: "Failed",
    };
    return labels[status];
}

// Export campaigns to CSV
export function exportToCSV(campaigns: Campaign[], currency: string) {
    const headers = ["Name", "Subject", "Status", "Segment", "Recipients", "Delivered", "Opened", "Clicked", "Revenue", "Sent At"];
    const rows = campaigns.map(c => [
        c.name,
        c.subject || "",
        getStatusLabel(c.status),
        c.segment_name || "",
        c.recipients_count.toString(),
        c.delivered_count.toString(),
        c.opened_count.toString(),
        c.clicked_count.toString(),
        formatCurrency(c.revenue_generated, currency),
        c.sent_at ? new Date(c.sent_at).toISOString().split("T")[0] : "",
    ]);
    
    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `campaigns-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

