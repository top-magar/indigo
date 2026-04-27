"use client";

import { useState, useTransition } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/shared/utils";

interface ReviewFormProps {
  productId: string;
}

export function ReviewForm({ productId }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  if (submitted) {
    return (
      <div className="rounded-lg border p-6 text-center">
        <p className="text-sm font-medium">Thank you for your review!</p>
        <p className="text-xs text-muted-foreground mt-1">It will appear after moderation.</p>
      </div>
    );
  }

  return (
    <form
      className="rounded-lg border p-6 space-y-4"
      action={(formData: FormData) => {
        if (rating === 0) { setError("Please select a rating"); return; }
        formData.append("rating", String(rating));
        formData.append("productId", productId);
        startTransition(async () => {
          const res = await fetch("/api/store/reviews", { method: "POST", body: formData });
          if (res.ok) setSubmitted(true);
          else setError("Failed to submit. Please try again.");
        });
      }}
    >
      <h3 className="text-sm font-semibold">Write a Review</h3>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => { setRating(star); setError(""); }}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className="p-0.5"
          >
            <Star className={cn("size-5", (hover || rating) >= star ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input name="customerName" placeholder="Your name" required className="text-sm" />
        <Input name="customerEmail" type="email" placeholder="Email" required className="text-sm" />
      </div>
      <Input name="title" placeholder="Review title (optional)" className="text-sm" />
      <Textarea name="content" placeholder="Your review..." required rows={3} className="text-sm" />
      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? "Submitting..." : "Submit Review"}
      </Button>
    </form>
  );
}
