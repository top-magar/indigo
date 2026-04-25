"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, ExternalLink, MoreHorizontal, Ban, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatCurrency } from "@/shared/utils";
import { toggleMerchantSuspension } from "./actions";

type Merchant = {
  id: string;
  name: string;
  slug: string;
  createdAt: string | null;
  orderCount: number;
  revenue: string;
  productCount: number;
  suspended?: boolean;
};

export default function MerchantsClient({ merchants, totalRevenue }: { merchants: Merchant[]; totalRevenue: string }) {
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();
  const filtered = merchants.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.slug.toLowerCase().includes(search.toLowerCase()));

  const handleToggleSuspend = (id: string, name: string, currentlySuspended: boolean) => {
    startTransition(async () => {
      const result = await toggleMerchantSuspension(id, !currentlySuspended);
      if (result.error) toast.error(result.error);
      else toast.success(`${name} ${currentlySuspended ? "reactivated" : "suspended"}`);
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Merchants</h1>
          <p className="text-xs text-muted-foreground">{merchants.length} store{merchants.length !== 1 ? "s" : ""} · {formatCurrency(Number(totalRevenue), "NPR")} total GMV</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input placeholder="Search merchants..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(m => (
            <div key={m.id} className="group relative rounded-lg border p-4 hover:shadow-sm transition-all hover:border-foreground/20">
              {/* Action menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreHorizontal className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/admin/merchants/${m.id}`}>View details</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/store/${m.slug}`} target="_blank">View store ↗</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleToggleSuspend(m.id, m.name, !!m.suspended)} className={m.suspended ? "text-success" : "text-destructive"}>
                    {m.suspended ? <><CheckCircle className="size-3.5" /> Reactivate</> : <><Ban className="size-3.5" /> Suspend</>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Link href={`/admin/merchants/${m.id}`} className="block">
                <div className="flex items-center gap-3 mb-3">
                  <div className="size-10 rounded-lg bg-muted flex items-center justify-center text-sm font-semibold text-muted-foreground shrink-0">
                    {m.name[0].toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{m.name}</p>
                      {m.suspended && <Badge variant="destructive" className="text-[9px] px-1.5 py-0">Suspended</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-1">
                      {m.slug}.indigo.store <ExternalLink className="size-2.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-3 border-t">
                  <div>
                    <p className="text-[10px] text-muted-foreground">Products</p>
                    <p className="text-sm font-semibold tabular-nums">{m.productCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Orders</p>
                    <p className="text-sm font-semibold tabular-nums">{m.orderCount}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">Revenue</p>
                    <p className="text-sm font-semibold tabular-nums">{formatCurrency(Number(m.revenue), "NPR")}</p>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
          <p className="text-xs text-muted-foreground">{search ? "No merchants match your search" : "No merchants yet"}</p>
        </div>
      )}
    </div>
  );
}
