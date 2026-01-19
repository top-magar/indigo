import { Metadata } from "next";
import { AIServicesSettingsClient } from "./ai-services-settings-client";

export const metadata: Metadata = {
  title: "AI Services | Settings",
  description: "Configure Indigo AI services for your store",
};

export default function AIServicesSettingsPage() {
  return <AIServicesSettingsClient />;
}
