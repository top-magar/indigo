import { SettingsSidebar } from "./settings-sidebar";

interface SettingsLayoutProps {
  children: React.ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  return (
    <div className="flex gap-6">
      <SettingsSidebar />
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
