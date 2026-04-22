import { SectionTabs, ORDER_TABS } from "@/components/dashboard/section-tabs";

export default function OrdersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <SectionTabs tabs={ORDER_TABS} />
      {children}
    </div>
  );
}
