"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DollarCircleIcon,
  Loading01Icon,
  CheckmarkCircle02Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/shared/utils";
import { Price } from "@/components/ui/price";
import {
  currencyOptions,
  type CurrencyCode,
  formatPrice,
  getCurrencySymbol,
  getDecimalPlaces,
} from "@/shared/currency";
import { updateCurrencySettings } from "./actions";
import type { Tenant } from "@/infrastructure/supabase/types";

interface CurrencySettingsClientProps {
  tenant: Tenant;
  userRole: "owner" | "admin" | "staff";
}

// Sample prices for preview
const samplePrices = [
  { label: "Small item", amount: 9.99 },
  { label: "Medium item", amount: 149.5 },
  { label: "Large item", amount: 1299.0 },
  { label: "Premium item", amount: 24999.99 },
];

export function CurrencySettingsClient({
  tenant,
  userRole,
}: CurrencySettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Currency settings state
  const [currency, setCurrency] = useState(tenant.currency || "NPR");
  const [displayCurrency, setDisplayCurrency] = useState(
    (tenant as any).display_currency || tenant.currency || "NPR"
  );
  const [priceIncludesTax, setPriceIncludesTax] = useState(
    (tenant as any).price_includes_tax ?? false
  );

  const canEdit = userRole === "owner" || userRole === "admin";

  const handleSave = async () => {
    startTransition(async () => {
      const result = await updateCurrencySettings({
        currency,
        displayCurrency,
        priceIncludesTax,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Currency settings saved");
        router.refresh();
      }
    });
  };

  const hasChanges =
    currency !== tenant.currency ||
    displayCurrency !== ((tenant as any).display_currency || tenant.currency) ||
    priceIncludesTax !== ((tenant as any).price_includes_tax ?? false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Currency Settings</h1>
        <p className="text-muted-foreground">
          Configure how prices are displayed in your store
        </p>
      </div>

      {/* Info Alert */}
      <Alert>
        <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
        <AlertTitle>About Currency Settings</AlertTitle>
        <AlertDescription>
          Prices are stored in your base currency. The display currency setting
          only affects how prices are shown to customers. Currency conversion is
          for display purposes only.
        </AlertDescription>
      </Alert>

      {/* Base Currency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={DollarCircleIcon} className="w-5 h-5" />
            Base Currency
          </CardTitle>
          <CardDescription>
            The primary currency for your store. All prices are stored in this
            currency.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="currency">Store Currency</Label>
              <Select
                value={currency}
                onValueChange={setCurrency}
                disabled={!canEdit}
              >
                <SelectTrigger id="currency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono w-8">{c.symbol}</span>
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                This is the currency used for all product prices and orders
              </p>
            </div>

            <div className="space-y-2">
              <Label>Currency Details</Label>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Symbol</span>
                  <span className="font-mono font-medium">
                    {getCurrencySymbol(currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Decimal Places</span>
                  <span className="font-mono font-medium">
                    {getDecimalPlaces(currency)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Code</span>
                  <span className="font-mono font-medium">{currency}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Display Settings</CardTitle>
          <CardDescription>
            Configure how prices appear to your customers
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="displayCurrency">Display Currency</Label>
              <Select
                value={displayCurrency}
                onValueChange={setDisplayCurrency}
                disabled={!canEdit}
              >
                <SelectTrigger id="displayCurrency">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      <span className="flex items-center gap-2">
                        <span className="font-mono w-8">{c.symbol}</span>
                        {c.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Currency shown to customers (conversion is display-only)
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="priceIncludesTax">Prices Include Tax</Label>
              <p className="text-sm text-muted-foreground">
                Display prices with tax included
              </p>
            </div>
            <Switch
              id="priceIncludesTax"
              checked={priceIncludesTax}
              onCheckedChange={setPriceIncludesTax}
              disabled={!canEdit}
            />
          </div>
        </CardContent>
      </Card>

      {/* Price Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Price Preview</CardTitle>
          <CardDescription>
            See how prices will appear with your current settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border bg-muted/30 p-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {samplePrices.map((item) => (
                <div
                  key={item.label}
                  className="rounded-lg border bg-background p-4 space-y-2"
                >
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <Price
                    amount={item.amount}
                    currency={displayCurrency}
                    size="lg"
                  />
                  {priceIncludesTax && (
                    <p className="text-xs text-muted-foreground">
                      (incl. tax)
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Comparison if display currency differs */}
            {displayCurrency !== currency && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  Base currency comparison:
                </p>
                <div className="flex flex-wrap gap-4">
                  {samplePrices.map((item) => (
                    <div key={item.label} className="text-sm">
                      <span className="text-muted-foreground">
                        {item.label}:{" "}
                      </span>
                      <span className="font-mono">
                        {formatPrice(item.amount, currency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {canEdit && (
        <div className="flex justify-end gap-4">
          <Button
            variant="outline"
            onClick={() => {
              setCurrency(tenant.currency || "NPR");
              setDisplayCurrency(
                (tenant as any).display_currency || tenant.currency || "NPR"
              );
              setPriceIncludesTax((tenant as any).price_includes_tax ?? false);
            }}
            disabled={isPending || !hasChanges}
          >
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isPending || !hasChanges}>
            {isPending ? (
              <>
                <HugeiconsIcon
                  icon={Loading01Icon}
                  className="w-4 h-4 mr-2 animate-spin"
                />
                Saving...
              </>
            ) : (
              <>
                <HugeiconsIcon
                  icon={CheckmarkCircle02Icon}
                  className="w-4 h-4 mr-2"
                />
                Save Changes
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
