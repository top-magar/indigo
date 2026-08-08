import { cn } from "@/shared/utils";

type Status =
  | "active" | "published" | "paid"
  | "draft" | "pending"
  | "archived" | "cancelled"
  | "error" | "failed";

const colorMap: Record<Status, string> = {
  active: "bg-success",
  published: "bg-success",
  paid: "bg-success",
  draft: "bg-muted-foreground",
  pending: "bg-muted-foreground",
  archived: "bg-warning",
  cancelled: "bg-warning",
  error: "bg-destructive",
  failed: "bg-destructive",
};

interface StatusDotProps {
  status: Status;
  pulse?: boolean;
  label?: string;
}

export function StatusDot({ status, pulse, label }: StatusDotProps) {
  const color = colorMap[status];

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={cn("size-1.5 rounded-full", color, pulse && "animate-pulse")}
      />
      {label && <span className="text-xs">{label}</span>}
    </span>
  );
}
