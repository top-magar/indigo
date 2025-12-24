"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    description?: string;
}

export function FormField({
    label,
    error,
    description,
    className,
    id,
    ...props
}: FormFieldProps) {
    const fieldId = id || props.name;

    return (
        <div className="grid gap-2">
            <Label htmlFor={fieldId}>{label}</Label>
            <Input
                id={fieldId}
                className={cn(error && "border-destructive", className)}
                aria-describedby={error ? `${fieldId}-error` : undefined}
                aria-invalid={!!error}
                {...props}
            />
            {description && !error && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
            {error && (
                <p id={`${fieldId}-error`} className="text-sm text-destructive">
                    {error}
                </p>
            )}
        </div>
    );
}
