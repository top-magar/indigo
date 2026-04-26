export type PlatformRole = "super_admin" | "admin" | "support" | "finance";

export type Permission =
  | "view_overview"
  | "view_merchants"
  | "manage_merchants"
  | "delete_merchants"
  | "view_billing"
  | "manage_billing"
  | "view_settings"
  | "manage_settings"
  | "view_team"
  | "manage_team"
  | "export_data"
  | "view_audit";
