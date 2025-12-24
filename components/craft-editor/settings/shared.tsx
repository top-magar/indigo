"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { SpacingProps } from "@/lib/craft-editor/types";

interface SettingRowProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export function SettingRow({ label, children, className }: SettingRowProps) {
    return (
        <div className={cn("space-y-2", className)}>
            <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
            {children}
        </div>
    );
}

interface SettingGroupProps {
    title: string;
    children: React.ReactNode;
}

export function SettingGroup({ title, children }: SettingGroupProps) {
    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold">{title}</h4>
            <div className="space-y-4">{children}</div>
        </div>
    );
}

interface TextInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function TextInput({ value, onChange, placeholder }: TextInputProps) {
    return (
        <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-8 text-sm"
        />
    );
}

interface NumberInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
}

export function NumberInput({ value, onChange, min = 0, max = 1000, step = 1 }: NumberInputProps) {
    return (
        <Input
            type="number"
            value={value}
            onChange={(e) => onChange(Number(e.target.value))}
            min={min}
            max={max}
            step={step}
            className="h-8 text-sm"
        />
    );
}

interface SliderInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    showValue?: boolean;
}

export function SliderInput({ value, onChange, min = 0, max = 100, step = 1, showValue = true }: SliderInputProps) {
    return (
        <div className="flex items-center gap-3">
            <Slider
                value={[value]}
                onValueChange={([v]) => onChange(v)}
                min={min}
                max={max}
                step={step}
                className="flex-1"
            />
            {showValue && (
                <span className="text-xs text-muted-foreground w-8 text-right">{value}</span>
            )}
        </div>
    );
}

interface SelectInputProps {
    value: string;
    onChange: (value: string) => void;
    options: Array<{ value: string; label: string }>;
}

export function SelectInput({ value, onChange, options }: SelectInputProps) {
    return (
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="h-8 text-sm">
                <SelectValue />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}

interface SwitchInputProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    label?: string;
}

export function SwitchInput({ checked, onChange, label }: SwitchInputProps) {
    return (
        <div className="flex items-center justify-between">
            {label && <span className="text-sm">{label}</span>}
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

interface ColorInputProps {
    value: string;
    onChange: (value: string) => void;
}

export function ColorInput({ value, onChange }: ColorInputProps) {
    return (
        <div className="flex items-center gap-2">
            <input
                type="color"
                value={value || "#000000"}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
            />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="#000000"
                className="h-8 text-sm flex-1"
            />
        </div>
    );
}

interface SpacingInputProps {
    value: SpacingProps;
    onChange: (value: SpacingProps) => void;
    linked?: boolean;
}

export function SpacingInput({ value, onChange }: SpacingInputProps) {
    const handleChange = (side: keyof SpacingProps, newValue: number) => {
        onChange({ ...value, [side]: newValue });
    };

    return (
        <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Top</Label>
                <Input
                    type="number"
                    value={value.top}
                    onChange={(e) => handleChange("top", Number(e.target.value))}
                    className="h-7 text-xs"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Right</Label>
                <Input
                    type="number"
                    value={value.right}
                    onChange={(e) => handleChange("right", Number(e.target.value))}
                    className="h-7 text-xs"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Bottom</Label>
                <Input
                    type="number"
                    value={value.bottom}
                    onChange={(e) => handleChange("bottom", Number(e.target.value))}
                    className="h-7 text-xs"
                />
            </div>
            <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">Left</Label>
                <Input
                    type="number"
                    value={value.left}
                    onChange={(e) => handleChange("left", Number(e.target.value))}
                    className="h-7 text-xs"
                />
            </div>
        </div>
    );
}


// Additional shared components for template settings

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}

export function SettingsSection({ title, children }: SettingsSectionProps) {
    return (
        <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
            </h4>
            <div className="space-y-3">{children}</div>
        </div>
    );
}

interface ColorPickerProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
    return (
        <div className="space-y-1.5">
            <Label className="text-xs">{label}</Label>
            <div className="flex items-center gap-2">
                <input
                    type="color"
                    value={value || "#000000"}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-8 h-8 rounded border cursor-pointer shrink-0"
                />
                <Input
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="#000000"
                    className="h-8 text-sm flex-1"
                />
            </div>
        </div>
    );
}
