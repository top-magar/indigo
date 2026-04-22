import { SectionTabs, PRODUCT_TABS } from "@/components/dashboard/section-tabs";

export default function AttributesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <SectionTabs tabs={PRODUCT_TABS} />
      {children}
    </div>
  );
}
