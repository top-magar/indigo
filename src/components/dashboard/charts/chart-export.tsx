"use client";

import { useState, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Download04Icon,
  Image01Icon,
  FileAttachmentIcon,
  File01Icon,
  Copy01Icon,
  Tick02Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ExportFormat, type ChartDataPoint } from "./chart-types";

// ============================================================================
// Props
// ============================================================================

interface ChartExportProps {
  /** Reference to the chart container element */
  chartRef: React.RefObject<HTMLDivElement | null>;
  /** Chart data for CSV/JSON export */
  data: ChartDataPoint[];
  /** Default filename */
  defaultFilename?: string;
  /** Chart title for export */
  title?: string;
  /** Trigger element (defaults to button) */
  trigger?: React.ReactNode;
  /** Additional class names */
  className?: string;
}

// ============================================================================
// Export Functions
// ============================================================================

async function exportChartAsImage(
  chartRef: React.RefObject<HTMLDivElement | null>,
  format: "png" | "svg",
  filename: string,
  backgroundColor: string = "#ffffff"
): Promise<boolean> {
  if (!chartRef.current) {
    throw new Error("Chart element not found");
  }

  if (format === "png") {
    // Dynamic import for html2canvas - will be installed as a dependency
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2canvas = (await import("html2canvas" as any)).default as (
      element: HTMLElement,
      options?: {
        backgroundColor?: string;
        scale?: number;
        useCORS?: boolean;
        logging?: boolean;
      }
    ) => Promise<HTMLCanvasElement>;
    
    const canvas = await html2canvas(chartRef.current, {
      backgroundColor,
      scale: 2,
      useCORS: true,
      logging: false,
    });

    const dataUrl = canvas.toDataURL("image/png", 1.0);
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${filename}.png`;
    link.click();
    return true;
  }

  if (format === "svg") {
    const svgElement = chartRef.current.querySelector("svg");
    if (!svgElement) {
      throw new Error("SVG element not found in chart");
    }

    // Clone the SVG to avoid modifying the original
    const clonedSvg = svgElement.cloneNode(true) as SVGElement;
    
    // Add background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "100%");
    rect.setAttribute("height", "100%");
    rect.setAttribute("fill", backgroundColor);
    clonedSvg.insertBefore(rect, clonedSvg.firstChild);

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clonedSvg);
    const blob = new Blob([svgString], { type: "image/svg+xml" });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.svg`;
    link.click();
    URL.revokeObjectURL(url);
    return true;
  }

  return false;
}

function exportDataAsCSV(data: ChartDataPoint[], filename: string): boolean {
  const headers = ["x", "y", "label", "comparisonValue"];
  const rows = data.map((point) => [
    String(point.x),
    String(point.y),
    point.label || "",
    point.comparisonValue !== undefined ? String(point.comparisonValue) : "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

function exportDataAsJSON(data: ChartDataPoint[], filename: string): boolean {
  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  link.click();
  URL.revokeObjectURL(url);
  return true;
}

async function copyToClipboard(data: ChartDataPoint[]): Promise<boolean> {
  const text = data
    .map((point) => `${point.x}\t${point.y}${point.label ? `\t${point.label}` : ""}`)
    .join("\n");

  await navigator.clipboard.writeText(text);
  return true;
}

// ============================================================================
// Component
// ============================================================================

export function ChartExport({
  chartRef,
  data,
  defaultFilename = "chart",
  title,
  trigger,
  className,
}: ChartExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showFilenameDialog, setShowFilenameDialog] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<ExportFormat | null>(null);
  const [filename, setFilename] = useState(defaultFilename);
  const [copied, setCopied] = useState(false);

  // Handle export with filename dialog
  const handleExport = useCallback(
    async (format: ExportFormat, customFilename?: string) => {
      const exportFilename = customFilename || filename;
      setIsExporting(true);

      try {
        let success = false;

        switch (format) {
          case ExportFormat.PNG:
            success = await exportChartAsImage(chartRef, "png", exportFilename);
            break;
          case ExportFormat.SVG:
            success = await exportChartAsImage(chartRef, "svg", exportFilename);
            break;
          case ExportFormat.CSV:
            success = exportDataAsCSV(data, exportFilename);
            break;
          case ExportFormat.JSON:
            success = exportDataAsJSON(data, exportFilename);
            break;
        }

        if (success) {
          toast.success("Export successful", {
            description: `Chart exported as ${format.toUpperCase()}`,
          });
        }
      } catch (error) {
        toast.error("Export failed", {
          description: error instanceof Error ? error.message : "Unknown error",
        });
      } finally {
        setIsExporting(false);
        setShowFilenameDialog(false);
        setPendingFormat(null);
      }
    },
    [chartRef, data, filename]
  );

  // Quick export (without filename dialog)
  const handleQuickExport = useCallback(
    (format: ExportFormat) => {
      handleExport(format, defaultFilename);
    },
    [handleExport, defaultFilename]
  );

  // Export with custom filename
  const handleExportWithFilename = useCallback((format: ExportFormat) => {
    setPendingFormat(format);
    setFilename(defaultFilename);
    setShowFilenameDialog(true);
  }, [defaultFilename]);

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(data);
      setCopied(true);
      toast.success("Copied to clipboard", {
        description: "Chart data copied as tab-separated values",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Copy failed", {
        description: "Could not copy to clipboard",
      });
    }
  }, [data]);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || (
            <Button variant="outline" size="sm" className={className} disabled={isExporting}>
              {isExporting ? (
                <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 animate-spin" />
              ) : (
                <HugeiconsIcon icon={Download04Icon} className="w-4 h-4" />
              )}
              <span className="ml-1.5 hidden sm:inline">Export</span>
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Export Chart</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleQuickExport(ExportFormat.PNG)}>
            <HugeiconsIcon icon={Image01Icon} className="w-4 h-4 mr-2" />
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport(ExportFormat.SVG)}>
            <HugeiconsIcon icon={FileAttachmentIcon} className="w-4 h-4 mr-2" />
            Export as SVG
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Export Data</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => handleQuickExport(ExportFormat.CSV)}>
            <HugeiconsIcon icon={File01Icon} className="w-4 h-4 mr-2" />
            Export as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleQuickExport(ExportFormat.JSON)}>
            <HugeiconsIcon icon={FileAttachmentIcon} className="w-4 h-4 mr-2" />
            Export as JSON
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleCopy}>
            <HugeiconsIcon
              icon={copied ? Tick02Icon : Copy01Icon}
              className="w-4 h-4 mr-2"
            />
            {copied ? "Copied!" : "Copy to clipboard"}
          </DropdownMenuItem>

          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleExportWithFilename(ExportFormat.PNG)}>
            <HugeiconsIcon icon={Download04Icon} className="w-4 h-4 mr-2" />
            Export with custom name...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Custom Filename Dialog */}
      <Dialog open={showFilenameDialog} onOpenChange={setShowFilenameDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Export {title || "Chart"}</DialogTitle>
            <DialogDescription>
              Choose a filename for your export
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="filename">Filename</Label>
              <Input
                id="filename"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="Enter filename"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              File will be saved as: {filename}.{pendingFormat?.toLowerCase()}
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowFilenameDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => pendingFormat && handleExport(pendingFormat)}
              disabled={!filename.trim() || isExporting}
            >
              {isExporting ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : (
                "Export"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Export utility functions for external use
export {
  exportChartAsImage,
  exportDataAsCSV,
  exportDataAsJSON,
  copyToClipboard,
};
