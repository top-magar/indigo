import type { ReactNode } from "react";

interface Stat {
  label: string;
  value: string | number;
  change?: string;
  icon?: ReactNode;
}

interface StatBarProps {
  stats: Stat[];
}

export function StatBar({ stats }: StatBarProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="rounded-lg border p-3 space-y-1">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            {s.icon}
          </div>
          <p className="text-xl font-semibold tabular-nums">{s.value}</p>
          {s.change && <p className="text-xs text-muted-foreground">{s.change}</p>}
        </div>
      ))}
    </div>
  );
}
