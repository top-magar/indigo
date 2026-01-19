"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Package, ArrowRight } from "lucide-react";
import { formatCurrency } from "@/shared/utils";
import Link from "next/link";
import Image from "next/image";

export interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  images?: string[];
}

interface LowStockProductsProps {
  products: LowStockProduct[];
  currency: string;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="h-12 w-12 rounded-2xl bg-[var(--ds-chart-2)]/10 flex items-center justify-center mb-3">
        <Package className="w-6 h-6 text-[var(--ds-chart-2)]" />
      </div>
      <p className="text-sm text-[var(--ds-gray-800)] font-medium">All stocked up!</p>
      <p className="text-xs text-[var(--ds-gray-600)] mt-1">
        No products are running low on inventory
      </p>
    </div>
  );
}

export function LowStockProducts({ products, currency }: LowStockProductsProps) {
  if (products.length === 0) {
    return null; // Don't show the card at all if no low stock products
  }

  return (
    <Card className="border-[var(--ds-chart-4)]/30 bg-[var(--ds-chart-4)]/5">
      <CardHeader className="py-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[var(--ds-chart-4)]" />
          <CardTitle className="text-sm font-semibold text-[var(--ds-chart-4)]">
            Low Stock Alert
          </CardTitle>
          <Badge
            variant="secondary"
            className="ml-auto bg-[var(--ds-chart-4)]/10 text-[var(--ds-chart-4)] border-0 text-xs"
          >
            {products.length} {products.length === 1 ? "item" : "items"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {products.slice(0, 5).map((product) => (
            <Link
              key={product.id}
              href={`/dashboard/products/${product.id}`}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-white/50 transition-colors group"
            >
              {/* Product Image */}
              <div className="h-12 w-12 rounded-lg bg-[var(--ds-gray-100)] overflow-hidden shrink-0 border border-[var(--ds-gray-200)]">
                {product.images && product.images.length > 0 ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-5 h-5 text-[var(--ds-gray-400)]" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--ds-gray-900)] truncate group-hover:text-[var(--ds-brand-600)] transition-colors">
                  {product.name}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-[var(--ds-gray-600)]">
                    {formatCurrency(product.price, currency)}
                  </p>
                  <span className="text-xs text-[var(--ds-gray-400)]">•</span>
                  <Badge
                    variant="secondary"
                    className="bg-[var(--ds-chart-4)]/10 text-[var(--ds-chart-4)] border-0 text-[10px] px-1.5 py-0"
                  >
                    {product.quantity} left
                  </Badge>
                </div>
              </div>

              {/* Arrow Icon */}
              <ArrowRight className="w-4 h-4 text-[var(--ds-gray-400)] group-hover:text-[var(--ds-brand-600)] transition-colors shrink-0" />
            </Link>
          ))}
        </div>

        {products.length > 5 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 border-[var(--ds-chart-4)]/30 hover:bg-white/50"
            asChild
          >
            <Link href="/dashboard/products?filter=low-stock">
              View all {products.length} low stock items
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}

        {products.length <= 5 && (
          <Button
            variant="outline"
            size="sm"
            className="w-full mt-3 border-[var(--ds-chart-4)]/30 hover:bg-white/50"
            asChild
          >
            <Link href="/dashboard/products?filter=low-stock">
              Manage Inventory
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
