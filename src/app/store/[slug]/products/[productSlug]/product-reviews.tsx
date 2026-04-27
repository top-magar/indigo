import { createClient } from "@/infrastructure/supabase/server";
import { Star } from "lucide-react";
import { cn } from "@/shared/utils";
import { ReviewForm } from "./review-form";

export async function ProductReviews({ productId, tenantId }: { productId: string; tenantId: string }) {
  const supabase = await createClient();
  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, customer_name, rating, title, content, created_at")
    .eq("product_id", productId)
    .eq("tenant_id", tenantId)
    .eq("is_approved", true)
    .order("created_at", { ascending: false })
    .limit(20);

  const list = reviews ?? [];
  const avg = list.length > 0 ? list.reduce((s, r) => s + r.rating, 0) / list.length : 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Customer Reviews</h2>
          {list.length > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={cn("size-4", avg >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20")} />)}</div>
              <span className="text-sm text-muted-foreground">{avg.toFixed(1)} ({list.length} {list.length === 1 ? "review" : "reviews"})</span>
            </div>
          )}
        </div>
      </div>

      {list.length === 0 && <p className="text-sm text-muted-foreground">No reviews yet. Be the first!</p>}

      {list.map((r) => (
        <div key={r.id} className="border-b pb-4">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex">{[1, 2, 3, 4, 5].map((s) => <Star key={s} className={cn("size-3.5", r.rating >= s ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20")} />)}</div>
            <span className="text-xs font-medium">{r.customer_name}</span>
            <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString()}</span>
          </div>
          {r.title && <p className="text-sm font-medium">{r.title}</p>}
          <p className="text-sm text-muted-foreground mt-0.5">{r.content}</p>
        </div>
      ))}

      <ReviewForm productId={productId} />
    </div>
  );
}
