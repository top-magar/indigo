'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Star, CheckCircle, MoreVertical, ThumbsDown, Trash2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { EmptyState } from '@/components/ui/empty-state';
import { useConfirmDelete } from '@/hooks/use-confirm-dialog';
import { BulkActionsBar } from '@/components/dashboard/bulk-actions-bar/bulk-actions-bar';
import { DataTablePagination } from '@/components/dashboard/data-table/pagination';
import { formatRelativeTime } from '@/shared/utils';
import type { SentimentStats, ReviewWithProduct } from '@/features/reviews/repositories/reviews';
import { approveReview, rejectReview, deleteReview, bulkApproveReviews, reanalyzeReview } from './actions';

interface ReviewsClientProps {
  initialReviews: ReviewWithProduct[];
  initialStats: SentimentStats | null;
}

const sentimentColor: Record<string, string> = {
  POSITIVE: 'text-success bg-success/10',
  NEGATIVE: 'text-destructive bg-destructive/10',
  NEUTRAL: 'text-muted-foreground bg-muted',
  MIXED: 'text-warning bg-warning/10',
};

function sentimentLabel(s: string | null) {
  const v = s || 'NEUTRAL';
  return v.charAt(0) + v.slice(1).toLowerCase();
}

function Stars({ rating, size = 'size-3.5' }: { rating: number; size?: string }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star key={i} className={`${size} ${i < rating ? 'fill-warning text-warning' : 'text-border'}`} />
      ))}
    </div>
  );
}

export function ReviewsClient({ initialReviews, initialStats }: ReviewsClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const confirmDelete = useConfirmDelete();

  const stats = initialStats || { total: 0, averageRating: 0, positive: 0, negative: 0, neutral: 0, mixed: 0, percentPositive: 0, percentNegative: 0, percentNeutral: 0, percentMixed: 0 };
  const reviews = initialReviews;
  const pendingCount = reviews.filter((r) => !r.isApproved).length;

  const toggle = (id: string) => setSelectedIds((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id); else next.add(id);
    return next;
  });

  const act = (fn: () => Promise<{ success: boolean; error?: string }>, msg: string) => {
    startTransition(async () => {
      const r = await fn();
      if (r.success) { toast.success(msg); router.refresh(); } else toast.error(r.error || 'Action failed');
    });
  };

  const handleDelete = async (id: string) => {
    const review = reviews.find((r) => r.id === id);
    if (!(await confirmDelete(review?.customerName || 'this review', 'review'))) return;
    act(() => deleteReview(id), 'Review deleted');
  };

  const handleBulkApprove = () => {
    const ids = reviews.filter((r) => !r.isApproved).map((r) => r.id);
    if (ids.length) act(() => bulkApproveReviews(ids), `${ids.length} reviews approved`);
  };

  const handleBulkApproveSelected = () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    startTransition(async () => {
      const r = await bulkApproveReviews(ids);
      if (r.success) { toast.success(`${ids.length} reviews approved`); setSelectedIds(new Set()); router.refresh(); }
      else toast.error(r.error || 'Failed to approve');
    });
  };

  const handleBulkDeleteSelected = async () => {
    const ids = Array.from(selectedIds);
    if (!ids.length) return;
    if (!(await confirmDelete(`${ids.length} reviews`, 'review'))) return;
    startTransition(async () => {
      const results = await Promise.all(ids.map((id) => deleteReview(id)));
      const failed = results.filter((r) => !r.success).length;
      toast[failed === 0 ? 'success' : 'error'](failed === 0 ? `${ids.length} reviews deleted` : `${failed} of ${ids.length} deletions failed`);
      setSelectedIds(new Set());
      router.refresh();
    });
  };

  const filtered = reviews.filter((review) => {
    if (sentimentFilter !== 'all' && review.sentiment !== sentimentFilter) return false;
    if (statusFilter === 'pending' && review.isApproved) return false;
    if (statusFilter === 'approved' && !review.isApproved) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return review.customerName.toLowerCase().includes(q) || review.content.toLowerCase().includes(q) || review.title?.toLowerCase().includes(q);
    }
    return true;
  });

  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize);
  const setF = <T,>(setter: (v: T) => void) => (v: T) => { setter(v); setPageIndex(0); };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Reviews</h1>
          <p className="text-xs text-muted-foreground">{stats.averageRating.toFixed(1)} avg · {stats.total} reviews · {pendingCount} pending</p>
        </div>
        {pendingCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleBulkApprove} disabled={isPending}>
            <CheckCircle className="size-3.5 text-success" /> Approve All Pending ({pendingCount})
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search reviews..." value={searchQuery} onChange={(e) => setF(setSearchQuery)(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setF(setStatusFilter)}>
          <SelectTrigger className="w-full sm:w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
          </SelectContent>
        </Select>
        <Select value={sentimentFilter} onValueChange={setF(setSentimentFilter)}>
          <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sentiment</SelectItem>
            <SelectItem value="POSITIVE">Positive</SelectItem>
            <SelectItem value="NEGATIVE">Negative</SelectItem>
            <SelectItem value="NEUTRAL">Neutral</SelectItem>
            <SelectItem value="MIXED">Mixed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {paginated.length === 0 ? (
        <EmptyState icon={Star} title="No reviews found" description="Reviews will appear here when customers leave feedback" className="py-16" />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Checkbox checked={selectedIds.size === paginated.length && paginated.length > 0} onCheckedChange={() => selectedIds.size === paginated.length ? setSelectedIds(new Set()) : setSelectedIds(new Set(paginated.map((r) => r.id)))} aria-label="Select all" /></TableHead>
                  <TableHead>Review</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Sentiment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginated.map((review) => (
                  <TableRow key={review.id} data-state={selectedIds.has(review.id) ? 'selected' : undefined}>
                    <TableCell><Checkbox checked={selectedIds.has(review.id)} onCheckedChange={() => toggle(review.id)} aria-label={`Select review by ${review.customerName}`} /></TableCell>
                    <TableCell>
                      <div className="font-medium">{review.customerName}</div>
                      <div className="text-muted-foreground truncate max-w-[300px]">&ldquo;{review.content.slice(0, 80)}{review.content.length > 80 ? '...' : ''}&rdquo;</div>
                    </TableCell>
                    <TableCell>
                      {review.productName ? (
                        <Link href={`/dashboard/products/${review.productId}`} className="text-sm text-primary hover:underline">{review.productName}</Link>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell><Stars rating={review.rating} /></TableCell>
                    <TableCell><Badge variant="secondary" className={sentimentColor[review.sentiment || 'NEUTRAL']}>{sentimentLabel(review.sentiment)}</Badge></TableCell>
                    <TableCell><Badge variant={review.isApproved ? 'secondary' : 'outline'}>{review.isApproved ? 'Approved' : 'Pending'}</Badge></TableCell>
                    <TableCell className="text-muted-foreground">{formatRelativeTime(review.createdAt)}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm" aria-label="Review actions"><MoreVertical className="size-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => act(() => approveReview(review.id), 'Review approved')}><CheckCircle className="size-4 text-success" /> Approve</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => act(() => rejectReview(review.id), 'Review rejected')}><ThumbsDown className="size-4 text-destructive" /> Reject</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => act(() => reanalyzeReview(review.id), 'Review re-analyzed')}><RotateCcw className="size-4" /> Re-analyze</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleDelete(review.id)}><Trash2 className="size-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-2">
            {paginated.map((review) => (
              <div key={review.id} className="rounded-lg border p-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{review.customerName}</span>
                  <Stars rating={review.rating} size="size-3" />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">&ldquo;{review.content}&rdquo;</p>
                {review.productName && (
                  <Link href={`/dashboard/products/${review.productId}`} className="text-xs text-primary hover:underline">{review.productName}</Link>
                )}
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <Badge variant="secondary" className={`text-[11px] ${sentimentColor[review.sentiment || 'NEUTRAL']}`}>{sentimentLabel(review.sentiment)}</Badge>
                  <span>·</span>
                  <span>{review.isApproved ? 'Approved' : 'Pending'}</span>
                  <span>·</span>
                  <span>{formatRelativeTime(review.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <BulkActionsBar selectedCount={selectedIds.size} onClear={() => setSelectedIds(new Set())} itemLabel="review">
          <Button variant="outline" size="sm" onClick={handleBulkApproveSelected} disabled={isPending}><CheckCircle className="size-3.5 text-success" /> Approve</Button>
          <Button variant="destructive" size="sm" onClick={handleBulkDeleteSelected} disabled={isPending}><Trash2 className="size-3.5" /> Delete</Button>
        </BulkActionsBar>
      )}

      {/* Pagination */}
      {filtered.length > 0 && (
        <DataTablePagination pageIndex={pageIndex} pageSize={pageSize} pageCount={pageCount} totalItems={filtered.length} onPageChange={setPageIndex} onPageSizeChange={(size) => { setPageSize(size); setPageIndex(0); }} selectedCount={selectedIds.size} />
      )}
    </div>
  );
}
