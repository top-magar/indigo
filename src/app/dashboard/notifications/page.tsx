import type { Metadata } from "next";
import { requireTenantUser } from "@/lib/auth";
import { NotificationsPageClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Notifications | Dashboard",
};

export default async function NotificationsPage() {
  await requireTenantUser();
  return <NotificationsPageClient />;
}
