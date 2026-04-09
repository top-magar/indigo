"use client";

import { useCallback, useMemo } from "react";

/**
 * Export format types
 */
export type ExportFormat = "csv" | "json" | "excel";

/**
 * Column configuration for export
 */
export interface ExportColumnConfig {
  /** Column key/field name */
  key: string;
  /** Display label for header */
  label: string;
  /** Custom formatter function */
  formatter?: (value: unknown) => string;
  /** Whether to include this column by default */
  defaultIncluded?: boolean;
}

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Columns to include */
  columns: ExportColumnConfig[];
  /** Include headers in export */
  includeHeaders?: boolean;
  /** Custom filename (without extension) */
  filename?: string;
  /** Date format for date fields */
  dateFormat?: string;
}

/**
 * Return type for useBulkExport hook
 */
export interface UseBulkExportReturn {
  /** Export data to CSV format */
  exportToCsv: (data: Record<string, unknown>[], options?: Partial<ExportOptions>) => void;
  /** Export data to JSON format */
  exportToJson: (data: Record<string, unknown>[], options?: Partial<ExportOptions>) => void;
  /** Export data to Excel format (XLSX) */
  exportToExcel: (data: Record<string, unknown>[], options?: Partial<ExportOptions>) => void;
  /** Generic export function that handles all formats */
  exportData: (data: Record<string, unknown>[], options: ExportOptions) => void;
  /** Download a file with given content */
  downloadFile: (content: string | Blob, filename: string, mimeType: string) => void;
}

/**
 * Default date formatter
 */
function formatDate(value: unknown, format?: string): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(String(value));
  if (isNaN(date.getTime())) return String(value);
  
  // Simple ISO format by default
  if (!format || format === "iso") {
    return date.toISOString().split("T")[0];
  }
  
  // Locale format
  if (format === "locale") {
    return date.toLocaleDateString();
  }
  
  return date.toISOString();
}

/**
 * Default value formatter
 */
function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return formatDate(value);
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/**
 * Escape CSV value (handle commas, quotes, newlines)
 */
function escapeCsvValue(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Hook for bulk exporting data to various formats
 * 
 * @param defaultColumns - Default column configuration
 * @returns Export functions and utilities
 * 
 * @example
 * ```tsx
 * const { exportToCsv, exportToJson, exportData } = useBulkExport([
 *   { key: "id", label: "ID" },
 *   { key: "name", label: "Name" },
 *   { key: "price", label: "Price", formatter: (v) => `$${v}` },
 * ]);
 * 
 * // Export selected items
 * exportToCsv(selectedItems, { filename: "products" });
 * 
 * // Or use generic export
 * exportData(selectedItems, {
 *   format: "json",
 *   columns: [...],
 *   filename: "export",
 * });
 * ```
 */
export function useBulkExport(
  defaultColumns: ExportColumnConfig[] = []
): UseBulkExportReturn {
  /**
   * Download a file with given content
   */
  const downloadFile = useCallback(
    (content: string | Blob, filename: string, mimeType: string) => {
      const blob =
        content instanceof Blob
          ? content
          : new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    []
  );

  /**
   * Convert data to CSV format
   */
  const convertToCsv = useCallback(
    (
      data: Record<string, unknown>[],
      columns: ExportColumnConfig[],
      includeHeaders: boolean
    ): string => {
      const rows: string[] = [];

      // Add headers
      if (includeHeaders) {
        const headerRow = columns.map((col) => escapeCsvValue(col.label)).join(",");
        rows.push(headerRow);
      }

      // Add data rows
      data.forEach((item) => {
        const row = columns
          .map((col) => {
            const value = item[col.key];
            const formatted = col.formatter
              ? col.formatter(value)
              : formatValue(value);
            return escapeCsvValue(formatted);
          })
          .join(",");
        rows.push(row);
      });

      return rows.join("\n");
    },
    []
  );

  /**
   * Convert data to JSON format
   */
  const convertToJson = useCallback(
    (
      data: Record<string, unknown>[],
      columns: ExportColumnConfig[]
    ): string => {
      const exportData = data.map((item) => {
        const row: Record<string, unknown> = {};
        columns.forEach((col) => {
          const value = item[col.key];
          row[col.key] = col.formatter ? col.formatter(value) : value;
        });
        return row;
      });

      return JSON.stringify(exportData, null, 2);
    },
    []
  );

  /**
   * Escape XML special characters
   */
  const escapeXml = useCallback((value: string): string => {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }, []);

  /**
   * Convert data to Excel-compatible XML format
   * Note: For full XLSX support, consider using a library like xlsx
   */
  const convertToExcel = useCallback(
    (
      data: Record<string, unknown>[],
      columns: ExportColumnConfig[],
      includeHeaders: boolean
    ): string => {
      // Simple XML spreadsheet format (compatible with Excel)
      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<?mso-application progid="Excel.Sheet"?>\n';
      xml +=
        '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ';
      xml += 'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
      xml += "<Worksheet ss:Name=\"Sheet1\">\n<Table>\n";

      // Add headers
      if (includeHeaders) {
        xml += "<Row>\n";
        columns.forEach((col) => {
          xml += `<Cell><Data ss:Type="String">${escapeXml(col.label)}</Data></Cell>\n`;
        });
        xml += "</Row>\n";
      }

      // Add data rows
      data.forEach((item) => {
        xml += "<Row>\n";
        columns.forEach((col) => {
          const value = item[col.key];
          const formatted = col.formatter
            ? col.formatter(value)
            : formatValue(value);
          const type = typeof value === "number" ? "Number" : "String";
          xml += `<Cell><Data ss:Type="${type}">${escapeXml(formatted)}</Data></Cell>\n`;
        });
        xml += "</Row>\n";
      });

      xml += "</Table>\n</Worksheet>\n</Workbook>";
      return xml;
    },
    [escapeXml]
  );

  /**
   * Export data to CSV
   */
  const exportToCsv = useCallback(
    (data: Record<string, unknown>[], options?: Partial<ExportOptions>) => {
      const columns = options?.columns ?? defaultColumns;
      const includeHeaders = options?.includeHeaders ?? true;
      const filename = options?.filename ?? "export";

      const csv = convertToCsv(data, columns, includeHeaders);
      downloadFile(csv, `${filename}.csv`, "text/csv;charset=utf-8");
    },
    [defaultColumns, convertToCsv, downloadFile]
  );

  /**
   * Export data to JSON
   */
  const exportToJson = useCallback(
    (data: Record<string, unknown>[], options?: Partial<ExportOptions>) => {
      const columns = options?.columns ?? defaultColumns;
      const filename = options?.filename ?? "export";

      const json = convertToJson(data, columns);
      downloadFile(json, `${filename}.json`, "application/json");
    },
    [defaultColumns, convertToJson, downloadFile]
  );

  /**
   * Export data to Excel
   */
  const exportToExcel = useCallback(
    (data: Record<string, unknown>[], options?: Partial<ExportOptions>) => {
      const columns = options?.columns ?? defaultColumns;
      const includeHeaders = options?.includeHeaders ?? true;
      const filename = options?.filename ?? "export";

      const excel = convertToExcel(data, columns, includeHeaders);
      downloadFile(
        excel,
        `${filename}.xls`,
        "application/vnd.ms-excel"
      );
    },
    [defaultColumns, convertToExcel, downloadFile]
  );

  /**
   * Generic export function
   */
  const exportData = useCallback(
    (data: Record<string, unknown>[], options: ExportOptions) => {
      switch (options.format) {
        case "csv":
          exportToCsv(data, options);
          break;
        case "json":
          exportToJson(data, options);
          break;
        case "excel":
          exportToExcel(data, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }
    },
    [exportToCsv, exportToJson, exportToExcel]
  );

  return useMemo(
    () => ({
      exportToCsv,
      exportToJson,
      exportToExcel,
      exportData,
      downloadFile,
    }),
    [exportToCsv, exportToJson, exportToExcel, exportData, downloadFile]
  );
}

export type { ExportColumnConfig as BulkExportColumn };
