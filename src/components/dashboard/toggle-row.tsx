import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  badge?: string;
  disabled?: boolean;
}

export function ToggleRow({ label, description, checked, onChange, badge, disabled }: ToggleRowProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium">{label}</p>
          {badge && <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">{badge}</Badge>}
        </div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  );
}
