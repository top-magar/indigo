import { redirect } from "next/navigation";
import { getPlatformUser } from "./_lib/permissions";
import { AdminSidebar } from "./admin-sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getPlatformUser();

  return (
    <div className="flex h-screen bg-background">
      <AdminSidebar user={{ fullName: user.fullName, email: user.email }} permissions={user.permissions} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6">{children}</div>
      </main>
    </div>
  );
}
