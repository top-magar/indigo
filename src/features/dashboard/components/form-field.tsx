import { cn } from "@/shared/utils";

interface FormFieldProps {
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  horizontal?: boolean;
  children: React.ReactNode;
}

export function FormField({
  label,
  description,
  error,
  required,
  horizontal,
  children,
}: FormFieldProps) {
  return (
    <div className={cn(horizontal ? "flex items-start gap-4" : "space-y-1.5")}>
      <div className={cn(horizontal && "w-1/3 pt-2")}>
        <label className="text-xs font-medium">
          {label}
          {required && <span className="text-destructive"> *</span>}
        </label>
        {description && (
          <p className="text-[10px] text-muted-foreground">{description}</p>
        )}
      </div>
      <div className={cn(horizontal && "flex-1", "space-y-1")}>
        {children}
        {error && <p className="text-[10px] text-destructive">{error}</p>}
      </div>
    </div>
  );
}
