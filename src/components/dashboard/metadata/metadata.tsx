"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Add01Icon,
  Delete01Icon,
  LockIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";

export interface MetadataItem {
  key: string;
  value: string;
}

interface MetadataCardProps {
  /** Metadata items */
  data: MetadataItem[];
  /** Whether this is private metadata */
  isPrivate?: boolean;
  /** Whether the metadata is read-only */
  readonly?: boolean;
  /** Callback when metadata changes */
  onChange?: (data: MetadataItem[]) => void;
  /** Custom title */
  title?: string;
  /** Custom description */
  description?: string;
}

/**
 * Card for displaying and editing metadata key-value pairs
 * Inspired by Saleor's Metadata component
 */
export function MetadataCard({
  data,
  isPrivate = false,
  readonly = false,
  onChange,
  title,
  description,
}: MetadataCardProps) {
  const defaultTitle = isPrivate ? "Private Metadata" : "Metadata";
  const defaultDescription = isPrivate
    ? "Private metadata is only visible to staff users and apps"
    : "Metadata can be used to store additional information";

  const handleAdd = () => {
    onChange?.([...data, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newData = data.filter((_, i) => i !== index);
    onChange?.(newData);
  };

  const handleChange = (
    index: number,
    field: "key" | "value",
    value: string
  ) => {
    const newData = data.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    );
    onChange?.(newData);
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="metadata" className="border rounded-lg">
        <AccordionTrigger className="px-4 hover:no-underline">
          <div className="flex items-center gap-2">
            {isPrivate && (
              <HugeiconsIcon icon={LockIcon} className="w-4 h-4 text-muted-foreground" />
            )}
            <span className="font-medium">{title || defaultTitle}</span>
            {data.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {data.length}
              </Badge>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="px-4 pb-4">
          <p className="text-sm text-muted-foreground mb-4">
            {description || defaultDescription}
          </p>

          {data.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p className="text-sm">No metadata entries</p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="grid grid-cols-[1fr_1fr_40px] gap-2 text-xs font-medium text-muted-foreground px-1">
                <span>Key</span>
                <span>Value</span>
                <span></span>
              </div>

              {/* Rows */}
              {data.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[1fr_1fr_40px] gap-2 items-center"
                >
                  <Input
                    value={item.key}
                    onChange={(e) => handleChange(index, "key", e.target.value)}
                    placeholder="Key"
                    disabled={readonly}
                    className="h-9 text-sm"
                  />
                  <Input
                    value={item.value}
                    onChange={(e) => handleChange(index, "value", e.target.value)}
                    placeholder="Value"
                    disabled={readonly}
                    className="h-9 text-sm"
                  />
                  {!readonly && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleRemove(index)}
                    >
                      <HugeiconsIcon icon={Delete01Icon} className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!readonly && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={handleAdd}
            >
              <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
              Add Entry
            </Button>
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

interface MetadataProps {
  /** Public metadata */
  metadata: MetadataItem[];
  /** Private metadata (optional) */
  privateMetadata?: MetadataItem[];
  /** Whether to hide private metadata section */
  hidePrivateMetadata?: boolean;
  /** Whether metadata is read-only */
  readonly?: boolean;
  /** Whether metadata is loading */
  isLoading?: boolean;
  /** Callback when public metadata changes */
  onMetadataChange?: (data: MetadataItem[]) => void;
  /** Callback when private metadata changes */
  onPrivateMetadataChange?: (data: MetadataItem[]) => void;
  /** Additional class names */
  className?: string;
}

/**
 * Combined metadata component with public and private sections
 * Inspired by Saleor's Metadata pattern
 * 
 * @example
 * ```tsx
 * const [metadata, setMetadata] = useState<MetadataItem[]>([]);
 * const [privateMetadata, setPrivateMetadata] = useState<MetadataItem[]>([]);
 * 
 * return (
 *   <Metadata
 *     metadata={metadata}
 *     privateMetadata={privateMetadata}
 *     onMetadataChange={setMetadata}
 *     onPrivateMetadataChange={setPrivateMetadata}
 *   />
 * );
 * ```
 */
export function Metadata({
  metadata,
  privateMetadata,
  hidePrivateMetadata = false,
  readonly = false,
  isLoading = false,
  onMetadataChange,
  onPrivateMetadataChange,
  className,
}: MetadataProps) {
  if (isLoading) {
    return (
      <div className={cn("space-y-4", className)}>
        <MetadataLoadingCard />
        {!hidePrivateMetadata && <MetadataLoadingCard isPrivate />}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <MetadataCard
        data={metadata}
        isPrivate={false}
        readonly={readonly}
        onChange={onMetadataChange}
      />
      {!hidePrivateMetadata && privateMetadata && (
        <MetadataCard
          data={privateMetadata}
          isPrivate={true}
          readonly={readonly}
          onChange={onPrivateMetadataChange}
        />
      )}
    </div>
  );
}

/**
 * Loading skeleton for metadata card
 */
function MetadataLoadingCard({ isPrivate = false }: { isPrivate?: boolean }) {
  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        {isPrivate && (
          <div className="w-4 h-4 bg-muted rounded animate-pulse" />
        )}
        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
      </div>
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="grid grid-cols-[1fr_1fr_40px] gap-2">
            <div className="h-9 bg-muted rounded animate-pulse" />
            <div className="h-9 bg-muted rounded animate-pulse" />
            <div className="h-9 w-9 bg-muted rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

Metadata.displayName = "Metadata";
MetadataCard.displayName = "MetadataCard";
