import { HugeiconsIcon } from "@hugeicons/react";
import { Mail01Icon } from "@hugeicons/core-free-icons";

export const metadata = {
    title: "Campaigns | Dashboard",
    description: "Manage your marketing campaigns",
};

export default function CampaignsPage() {
    return (
        <div className="flex-1 p-6">
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <HugeiconsIcon icon={Mail01Icon} className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Marketing Campaigns</h3>
                <p className="text-muted-foreground max-w-sm">
                    Create email and SMS campaigns to engage your customers. Coming soon!
                </p>
            </div>
        </div>
    );
}
