"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Search, ExternalLink, MoreHorizontal, Ban, CheckCircle, Trash2, Download, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/shared/utils";
import { toggleMerchantSuspension, deleteMerchant, restoreMerchant } from "./actions";
import { ConfirmDialog } from "../_components/confirm-dialog";

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

export default function MerchantsClient({ merchants, totalRevenue, deletedMerchants }: { merchants: Merchant[]; totalRevenue: string; deletedMerchants: { id: string; name: string; slug: string; deletedAt: string }[] }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const filtered = merchants.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.slug.toLowerCase().includes(search.toLowerCase()));
  const perPage = 12;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice(page * perPage, (page + 1) * perPage);

  const handleToggleSuspend = (id: string, name: string, currentlySuspended: boolean) => {
    startTransition(async () => {
      const result = await toggleMerchantSuspension(id, !currentlySuspended);
      if (result.error) toast.error(result.error);
      else { toast.success(`${name} ${currentlySuspended ? "reactivated" : "suspended"}`); router.refresh(); }
    });
  };

  const handleDelete = (id: string, name: string) => {
    startTransition(async () => {
      const result = await deleteMerchant(id);
      if (result.error) toast.error(result.error);
      else { toast.success(`${name} deleted`); router.refresh(); }
    });
  };

  const handleRestore = (id: string, name: string) => {
    startTransition(async () => {
      const result = await restoreMerchant(id);
      if (result.error) toast.error(result.error);
      else { toast.success(`${name} restored`); router.refresh(); }
    });
  };

  const exportCSV = () => {
    const header = "Name,Slug,Products,Orders,Revenue,Suspended,Created\n";
    const rows = filtered.map(m =>
      `"${m.name}","${m.slug}",${m.productCount},${m.orderCount},${m.revenue},${!!m.suspended},${m.createdAt ?? ""}`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "merchants.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Merchants</h1>
          <p className="text-xs text-muted-foreground">{merchants.length} store{merchants.length !== 1 ? "s" : ""} · {formatCurrency(Number(totalRevenue), "NPR")} total GMV</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCSV}>
          <Download className="size-3.5" /> Export CSV
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
        <Input placeholder="Search merchants..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9" />
      </div>

      {filtered.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {paginated.map(m => (
            <div key={m.id} className="group relative rounded-lg border p-4 hover:border-foreground/20 transition-colors">
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
                  <DropdownMenuSeparator />
                  <ConfirmDialog
                    trigger={<DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive"><Trash2 className="size-3.5" /> Delete</DropdownMenuItem>}
                    title={`Delete ${m.name}?`}
                    description="This will permanently delete the merchant and all their data including products, orders, and customers. This cannot be undone."
                    action="Delete merchant"
                    onConfirm={() => handleDelete(m.id, m.name)}
                  />
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
                      {m.suspended && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Suspended</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
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

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            {page * perPage + 1}–{Math.min((page + 1) * perPage, filtered.length)} of {filtered.length}
          </p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {deletedMerchants.length > 0 && (
        <div className="rounded-lg border border-dashed p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2">Recently Deleted (restorable for 30 days)</p>
          <div className="space-y-2">
            {deletedMerchants.map(d => (
              <div key={d.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground line-through">{d.name}</p>
                  <p className="text-[10px] text-muted-foreground">Deleted {new Date(d.deletedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleRestore(d.id, d.name)} disabled={isPending}>
                  <RotateCcw className="size-3.5" /> Restore
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
