"use client";

import * as React from "react";
import { useForm, FieldValues, DefaultValues, Path, UseFormReturn } from "react-hook-form";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { cn } from "@/shared/utils";

// Reusable form field components
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/ui/form";

interface FormInputProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  type?: "text" | "email" | "password" | "number" | "url";
  disabled?: boolean;
  className?: string;
}

export function FormInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  type = "text",
  disabled,
  className,
}: FormInputProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
              onChange={(e) => {
                const value = type === "number" ? parseFloat(e.target.value) || 0 : e.target.value;
                field.onChange(value);
              }}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface FormTextareaProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
}

export function FormTextarea<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder,
  description,
  rows = 4,
  maxLength,
  disabled,
  className,
}: FormTextareaProps<TFieldValues>) {
  const value = form.watch(name) as string;
  const charCount = value?.length || 0;

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <div className="flex items-center justify-between">
            <FormLabel>{label}</FormLabel>
            {maxLength && (
              <span
                className={cn(
                  "text-xs",
                  charCount > maxLength * 0.9 ? "text-chart-4" : "text-muted-foreground",
                  charCount >= maxLength && "text-destructive"
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              rows={rows}
              maxLength={maxLength}
              disabled={disabled}
              {...field}
              value={field.value ?? ""}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface FormSwitchProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FormSwitch<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  description,
  disabled,
  className,
}: FormSwitchProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            "flex items-center justify-between rounded-lg border p-4",
            className
          )}
        >
          <div className="space-y-0.5">
            <FormLabel className="text-base">{label}</FormLabel>
            {description && (
              <FormDescription>{description}</FormDescription>
            )}
          </div>
          <FormControl>
            <Switch
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
}

interface FormSelectProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  placeholder?: string;
  description?: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  className?: string;
}

export function FormSelect<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  placeholder = "Select...",
  description,
  options,
  disabled,
  className,
}: FormSelectProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

interface FormPriceInputProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>;
  label: string;
  currency?: string;
  description?: string;
  disabled?: boolean;
  className?: string;
}

export function FormPriceInput<TFieldValues extends FieldValues>({
  form,
  name,
  label,
  currency = "$",
  description,
  disabled,
  className,
}: FormPriceInputProps<TFieldValues>) {
  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                {currency}
              </span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                disabled={disabled}
                className="pl-7"
                {...field}
                value={field.value ?? ""}
                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
              />
            </div>
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
