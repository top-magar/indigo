import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VouchersClient } from "./vouchers/vouchers-client";
import { SalesClient } from "./sales/sales-client";
import { getDiscounts } from "./actions";

interface DiscountsPageProps {
    searchParams: Promise<{ tab?: string }>;
}

export default async function DiscountsPage({ searchParams }: DiscountsPageProps) {
    const params = await searchParams;
    const tab = params.tab || "vouchers";

    // Fetch both vouchers and sales data upfront
    const [vouchersResult, salesResult] = await Promise.all([
        getDiscounts({ kind: "voucher" }),
        getDiscounts({ kind: "sale" }),
    ]);

    const vouchers = vouchersResult.success ? vouchersResult.data || [] : [];
    const sales = salesResult.success ? salesResult.data || [] : [];

    return (
        <div className="flex-1 space-y-4 p-6">
            <div>
                <h1 className="text-2xl font-semibold">Discounts</h1>
                <p className="text-muted-foreground text-sm">
                    Manage sales and voucher codes for your store
                </p>
            </div>

            <Tabs defaultValue={tab}>
                <TabsList>
                    <TabsTrigger value="vouchers">Vouchers</TabsTrigger>
                    <TabsTrigger value="sales">Sales</TabsTrigger>
                </TabsList>
                <TabsContent value="vouchers" className="mt-4">
                    <VouchersClient initialVouchers={vouchers} />
                </TabsContent>
                <TabsContent value="sales" className="mt-4">
                    <SalesClient initialSales={sales} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
