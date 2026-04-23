// Stub — dashboard layouts not yet implemented
const DEFAULT_LAYOUT = { widgets: [], columns: 3, rowHeight: 100, gap: 16 };

export const dashboardLayoutsRepository = {
  async saveLayoutPreferences(..._args: unknown[]) { return null; },
  async getDefaultForUser(..._args: unknown[]) { return DEFAULT_LAYOUT; },
  async getByUserId(..._args: unknown[]) { return null; },
  async upsert(..._args: unknown[]) { return null; },
};
