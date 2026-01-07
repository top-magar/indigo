"use client";

import { useState, useMemo, useCallback } from "react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download04Icon,
  File01Icon,
  FileAttachmentIcon,
  Table01Icon,
} from "@hugeicons/core-free-icons";
import {
  type ExportFormat,
  type ExportColumn,
  type ExportConfig,
} from "./bulk-action-types";

/** Format configuration with icons and labels */
const FORMAT_OPTIONS: {
  value: ExportFormat;
  label: string;
  description: string;
  icon: typeof File01Icon;
}[] = [
  {
    value: "csv",
    label: "CSV",
    description: "Comma-separated values, compatible with Excel",
    icon: Table01Icon,
  },
  {
    value: "json",
    label: "JSON",
    description: "JavaScript Object Notation, for developers",
    icon: FileAttachmentIcon,
  },
  {
    value: "excel",
    label: "Excel",
    description: "Microsoft Excel spreadsheet (.xlsx)",
    icon: File01Icon,
  },
];

interface BulkExportDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Callback when dialog open state changes */
  onOpenChange: (open: boolean) => void;
  /** Available columns for export */
  columns: ExportColumn[];
  /** Items to export (for preview) */
  items: Record<string, unknown>[];
  /** Callback to perform the export */
  onExport: (config: ExportConfig) => Promise<void>;
  /** Default filename (without extension) */
  defaultFilename?: string;
  /** Title for the dialog */
  title?: string;
  /** Description for the dialog */
  description?: string;
  /** Additional class names */
  className?: string;
}

/**
 * Export dialog for bulk exporting selected items
 * Supports format selection, column selection, and preview
 *
 * @example
 * ```tsx
 * <BulkExportDialog
 *   open={showExport}
 *   onOpenChange={setShowExport}
 *   columns={[
 *     { key: "id", label: "ID", selected: true, required: true },
 *     { key: "name", label: "Name", selected: true },
 *     { key: "price", label: "Price", selected: true },
 *   ]}
 *   items={selectedProducts}
 *   onExport={handleExport}
 *   defaultFilename="products-export"
 * />
 * ```
 */
export function BulkExportDialog({
  open,
  onOpenChange,
  columns: initialColumns,
  items,
  onExport,
  defaultFilename = "export",
  title = "Export Data",
  description = "Choose your export format and select the columns to include.",
  className,
}: BulkExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [columns, setColumns] = useState<ExportColumn[]>(initialColumns);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  // Count selected columns
  const selectedColumnCount = useMemo(
    () => columns.filter((c) => c.selected).length,
    [columns]
  );

  // Toggle column selection
  const toggleColumn = useCallback((key: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.key === key && !col.required
          ? { ...col, selected: !col.selected }
          : col
      )
    );
  }, []);

  // Select/deselect all columns
  const toggleAllColumns = useCallback((selected: boolean) => {
    setColumns((prev) =>
      prev.map((col) => (col.required ? col : { ...col, selected }))
    );
  }, []);

  // Generate preview data
  const previewData = useMemo(() => {
    const selectedCols = columns.filter((c) => c.selected);
    const previewItems = items.slice(0, 3);

    return previewItems.map((item) => {
      const row: Record<string, string> = {};
      selectedCols.forEach((col) => {
        const value = item[col.key];
        row[col.label] = col.formatter
          ? col.formatter(value)
          : String(value ?? "");
      });
      return row;
    });
  }, [columns, items]);

  // Handle export
  const handleExport = useCallback(async () => {
    setIsExporting(true);
    try {
      await onExport({
        format,
        columns: columns.filter((c) => c.selected),
        includeHeaders,
        filename: defaultFilename,
      });
      onOpenChange(false);
    } finally {
      setIsExporting(false);
    }
  }, [format, columns, includeHeaders, defaultFilename, onExport, onOpenChange]);

  const formatOption = FORMAT_OPTIONS.find((f) => f.value === format);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("sm:max-w-lg", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label>Export Format</Label>
            <Select
              value={format}
              onValueChange={(v) => setFormat(v as ExportFormat)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FORMAT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={option.icon} className="h-4 w-4" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formatOption && (
              <p className="text-xs text-muted-foreground">
                {formatOption.description}
              </p>
            )}
          </div>

          {/* Column Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Columns to Export</Label>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {selectedColumnCount} of {columns.length}
                </Badge>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => toggleAllColumns(true)}
                >
                  Select All
                </Button>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => toggleAllColumns(false)}
                >
                  Clear
                </Button>
              </div>
            </div>
            <ScrollArea className="h-[150px] rounded-md border p-3">
              <div className="grid grid-cols-2 gap-2">
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`col-${column.key}`}
                      checked={column.selected}
                      onCheckedChange={() => toggleColumn(column.key)}
                      disabled={column.required}
                    />
                    <Label
                      htmlFor={`col-${column.key}`}
                      className={cn(
                        "text-sm cursor-pointer",
                        column.required && "text-muted-foreground"
                      )}
                    >
                      {column.label}
                      {column.required && (
                        <span className="text-xs ml-1">(required)</span>
                      )}
                    </Label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Options */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-headers"
              checked={includeHeaders}
              onCheckedChange={(checked) =>
                setIncludeHeaders(checked as boolean)
              }
            />
            <Label htmlFor="include-headers" className="text-sm cursor-pointer">
              Include column headers
            </Label>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview ({items.length} items total)</Label>
            <div className="rounded-md border overflow-hidden">
              <ScrollArea className="h-[120px]">
                <table className="w-full text-xs">
                  {includeHeaders && (
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        {columns
                          .filter((c) => c.selected)
                          .map((col) => (
                            <th
                              key={col.key}
                              className="px-2 py-1.5 text-left font-medium"
                            >
                              {col.label}
                            </th>
                          ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {previewData.map((row, i) => (
                      <tr key={i} className="border-t">
                        {Object.values(row).map((value, j) => (
                          <td
                            key={j}
                            className="px-2 py-1.5 truncate max-w-[150px]"
                          >
                            {value}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {items.length > 3 && (
                      <tr className="border-t">
                        <td
                          colSpan={selectedColumnCount}
                          className="px-2 py-1.5 text-center text-muted-foreground"
                        >
                          ... and {items.length - 3} more items
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            <HugeiconsIcon icon={Download04Icon} className="h-4 w-4 mr-1.5" />
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

BulkExportDialog.displayName = "BulkExportDialog";
