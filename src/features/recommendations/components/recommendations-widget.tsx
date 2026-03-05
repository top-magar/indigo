'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Star, TrendingUp } from 'lucide-react';
import { cn } from '@/shared/utils';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice?: string | null;
  images: string[];
  rating?: number | null;
}

interface RecommendationsWidgetProps {
  title?: string;
  products: Product[];
  storeSlug: string;
  isLoading?: boolean;
  className?: string;
}

export function RecommendationsWidget({
  title = 'Recommended for You',
  products,
  storeSlug,
  isLoading = false,
  className,
}: RecommendationsWidgetProps) {
  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg text-foreground">
          <TrendingUp className="h-5 w-5 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/store/${storeSlug}/products/${product.slug}`}
              className="group"
            >
              <div className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  {product.images?.[0] ? (
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground/30">
                      No image
                    </div>
                  )}
                  {product.compareAtPrice && (
                    <span className="absolute left-2 top-2 rounded-sm bg-destructive px-1.5 py-0.5 text-xs font-medium text-white">
                      Sale
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  <h3 className="line-clamp-2 text-sm font-medium text-foreground group-hover:text-muted-foreground">
                    {product.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xs text-muted-foreground/50 line-through">
                        ${parseFloat(product.compareAtPrice).toFixed(2)}
                      </span>
                    )}
                  </div>
                  {product.rating && (
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-muted-foreground">
                        {product.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
