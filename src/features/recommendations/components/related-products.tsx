'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  compareAtPrice?: string | null;
  images: string[];
  rating?: number | null;
}

interface RelatedProductsProps {
  title?: string;
  products: Product[];
  storeSlug: string;
  className?: string;
}

export function RelatedProducts({
  title = 'You May Also Like',
  products,
  storeSlug,
  className,
}: RelatedProductsProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className={className}>
      <h2 className="mb-6 text-xl font-semibold text-[var(--ds-gray-900)]">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/store/${storeSlug}/products/${product.slug}`}
            className="group"
          >
            <div className="space-y-3">
              <div className="relative aspect-square overflow-hidden rounded-lg bg-[var(--ds-gray-100)]">
                {product.images?.[0] ? (
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[var(--ds-gray-400)]">
                    No image
                  </div>
                )}
                {product.compareAtPrice && (
                  <span className="absolute left-2 top-2 rounded-sm bg-[var(--ds-red-600)] px-2 py-1 text-xs font-medium text-white">
                    Sale
                  </span>
                )}
              </div>
              <div className="space-y-1">
                <h3 className="line-clamp-2 text-sm font-medium text-[var(--ds-gray-900)] transition-colors group-hover:text-[var(--ds-gray-700)]">
                  {product.name}
                </h3>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[var(--ds-gray-900)]">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                  {product.compareAtPrice && (
                    <span className="text-sm text-[var(--ds-gray-500)] line-through">
                      ${parseFloat(product.compareAtPrice).toFixed(2)}
                    </span>
                  )}
                </div>
                {product.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-[var(--ds-amber-500)] text-[var(--ds-amber-500)]" />
                    <span className="text-sm text-[var(--ds-gray-600)]">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
