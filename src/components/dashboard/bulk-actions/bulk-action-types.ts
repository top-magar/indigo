/**
 * Bulk Action Types
 * Type definitions for bulk operations in the dashboard
 */

/**
 * Available bulk action types
 */
export enum BulkActionType {
  DELETE = "delete",
  EXPORT = "export",
  UPDATE_STATUS = "update_status",
  ASSIGN_CATEGORY = "assign_category",
  UPDATE_PRICE = "update_price",
  ARCHIVE = "archive",
  PRINT_LABELS = "print_labels",
  SEND_EMAIL = "send_email",
  ADD_TAG = "add_tag",
}

/**
 * Context types for different entity bulk actions
 */
export type BulkActionContext = "orders" | "products" | "customers";

/**
 * Configuration for a single bulk action
 */
export interface BulkActionConfig {
  /** Unique identifier for the action */
  type: BulkActionType;
  /** Display label */
  label: string;
  /** Optional icon name */
  icon?: string;
  /** Whether this is a destructive action */
  destructive?: boolean;
  /** Keyboard shortcut hint */
  shortcut?: string;
  /** Whether to show in dropdown vs primary actions */
  showInDropdown?: boolean;
  /** Minimum items required for this action */
  minItems?: number;
  /** Maximum items allowed for this action */
  maxItems?: number;
  /** Whether action requires confirmation */
  requiresConfirmation?: boolean;
  /** Custom confirmation message */
  confirmationMessage?: string;
  /** Whether action is currently disabled */
  disabled?: boolean;
  /** Reason for being disabled */
  disabledReason?: string;
}

/**
 * Result of a bulk operation
 */
export interface BulkActionResult {
  /** Whether the operation was successful */
  success: boolean;
  /** Number of items successfully processed */
  successCount: number;
  /** Number of items that failed */
  failedCount: number;
  /** Total items attempted */
  totalCount: number;
  /** Error messages for failed items */
  errors?: BulkActionError[];
  /** Optional message */
  message?: string;
}

/**
 * Error details for a failed bulk action item
 */
export interface BulkActionError {
  /** ID of the item that failed */
  itemId: string;
  /** Error message */
  message: string;
  /** Error code if available */
  code?: string;
}

/**
 * Progress state during bulk operation
 */
export interface BulkActionProgress {
  /** Current item being processed */
  current: number;
  /** Total items to process */
  total: number;
  /** Percentage complete (0-100) */
  percentage: number;
  /** Current status message */
  status: string;
  /** Whether operation is in progress */
  isProcessing: boolean;
  /** Whether operation is complete */
  isComplete: boolean;
  /** Whether operation was cancelled */
  isCancelled: boolean;
}

/**
 * Export format options
 */
export type ExportFormat = "csv" | "json" | "excel";

/**
 * Column configuration for export
 */
export interface ExportColumn {
  /** Column key/field name */
  key: string;
  /** Display label */
  label: string;
  /** Whether column is selected for export */
  selected: boolean;
  /** Whether column is required (cannot be deselected) */
  required?: boolean;
  /** Custom formatter function */
  formatter?: (value: unknown) => string;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Export format */
  format: ExportFormat;
  /** Columns to include */
  columns: ExportColumn[];
  /** Include headers in export */
  includeHeaders: boolean;
  /** Custom filename (without extension) */
  filename?: string;
  /** Date format for date fields */
  dateFormat?: string;
}

/**
 * Default actions for orders context
 */
export const ORDER_BULK_ACTIONS: BulkActionConfig[] = [
  {
    type: BulkActionType.UPDATE_STATUS,
    label: "Update Status",
    shortcut: "S",
    requiresConfirmation: true,
  },
  {
    type: BulkActionType.EXPORT,
    label: "Export",
    shortcut: "E",
  },
  {
    type: BulkActionType.PRINT_LABELS,
    label: "Print Labels",
    shortcut: "P",
    showInDropdown: true,
  },
  {
    type: BulkActionType.ARCHIVE,
    label: "Archive",
    shortcut: "A",
    showInDropdown: true,
    requiresConfirmation: true,
  },
];

/**
 * Default actions for products context
 */
export const PRODUCT_BULK_ACTIONS: BulkActionConfig[] = [
  {
    type: BulkActionType.UPDATE_STATUS,
    label: "Update Status",
    shortcut: "S",
    requiresConfirmation: true,
  },
  {
    type: BulkActionType.EXPORT,
    label: "Export",
    shortcut: "E",
  },
  {
    type: BulkActionType.ASSIGN_CATEGORY,
    label: "Assign Category",
    shortcut: "C",
    showInDropdown: true,
    requiresConfirmation: true,
  },
  {
    type: BulkActionType.UPDATE_PRICE,
    label: "Bulk Price Update",
    shortcut: "P",
    showInDropdown: true,
    requiresConfirmation: true,
  },
  {
    type: BulkActionType.DELETE,
    label: "Delete",
    shortcut: "D",
    destructive: true,
    showInDropdown: true,
    requiresConfirmation: true,
    confirmationMessage: "This action cannot be undone. The selected products will be permanently deleted.",
  },
];

/**
 * Default actions for customers context
 */
export const CUSTOMER_BULK_ACTIONS: BulkActionConfig[] = [
  {
    type: BulkActionType.EXPORT,
    label: "Export",
    shortcut: "E",
  },
  {
    type: BulkActionType.SEND_EMAIL,
    label: "Send Email",
    shortcut: "M",
    showInDropdown: true,
  },
  {
    type: BulkActionType.ADD_TAG,
    label: "Add Tag",
    shortcut: "T",
    showInDropdown: true,
    requiresConfirmation: true,
  },
];

/**
 * Get bulk actions for a specific context
 */
export function getBulkActionsForContext(context: BulkActionContext): BulkActionConfig[] {
  switch (context) {
    case "orders":
      return ORDER_BULK_ACTIONS;
    case "products":
      return PRODUCT_BULK_ACTIONS;
    case "customers":
      return CUSTOMER_BULK_ACTIONS;
    default:
      return [];
  }
}
