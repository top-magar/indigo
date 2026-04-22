import { formatCurrency } from "@/shared/utils";

interface HeroSectionProps {
  userName: string;
  todayRevenue: number;
  todayOrders: number;
  currency: string;
  storeSlug: string;
  greeting: string;
  setupProgress: number;
}

export function HeroSection({ userName, greeting, todayRevenue, todayOrders, currency }: HeroSectionProps) {
  return (
    <div className="rounded-lg border p-6">
      <h1 className="text-lg font-semibold tracking-tight">{greeting}, {userName}</h1>
      <p className="text-sm text-muted-foreground mt-1">
        Today: {formatCurrency(todayRevenue, currency)} revenue · {todayOrders} orders
      </p>
    </div>
  );
}
