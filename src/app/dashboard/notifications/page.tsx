import type { Metadata } from "next";
import { requireUser } from "@/lib/auth";
import { NotificationsPageClient } from "./notifications-client";

export const metadata: Metadata = {
  title: "Notifications | Dashboard",
};

export default async function NotificationsPage() {
  await requireUser();
  return <NotificationsPageClient />;
}
