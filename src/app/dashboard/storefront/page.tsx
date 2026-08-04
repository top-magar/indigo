import { requireTenantUser } from "@/lib/auth";
import { ensureTenantSite } from "@/features/editor/lib/site";
import { db } from "@/infrastructure/db";
import { editorProjects } from "@/db/schema/editor-projects";
import { eq } from "drizzle-orm";
import { ThemeSettings } from "./theme-settings";

export default async function ThemeSettingsPage() {
  await requireTenantUser();
  const projectId = await ensureTenantSite();

  if (!projectId) return <div className="p-6 text-sm text-muted-foreground">Something went wrong.</div>;

  const [project] = await db.select({ themeConfig: editorProjects.themeConfig })
    .from(editorProjects)
    .where(eq(editorProjects.id, projectId))
    .limit(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Theme Settings</h1>
          <p className="text-xs text-muted-foreground">Manage your global storefront design</p>
        </div>
      </div>

      <ThemeSettings projectId={projectId} initialTheme={project?.themeConfig as any} />
    </div>
  );
}
