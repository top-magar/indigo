import { SectionTabs, CUSTOMER_TABS } from "@/components/dashboard/section-tabs";

export default function CustomersLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <SectionTabs tabs={CUSTOMER_TABS} />
      {children}
    </div>
  );
}
