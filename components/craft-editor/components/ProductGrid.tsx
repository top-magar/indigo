"use client";

import { useNode, useEditor } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProductGridProps } from "@/lib/craft-editor/types";
import { ProductGridSettings } from "../settings";

interface Product {
    id: string;
    name: string;
    price: number;
    images?: Array<{ url: string }>;
}

const COLUMNS_MAP = {
    2: "grid-cols-2",
    3: "grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
};

export function ProductGrid({
    heading = "Featured Products",
    subheading = "Check out our latest collection",
    columns = 4,
    limit = 8,
    showPrice = true,
    showAddToCart = true,
    cardStyle = "default",
    products = [],
}: ProductGridProps & { products?: Product[] }) {
    const { connectors: { connect, drag }, selected, hovered } = useNode((state) => ({
        selected: state.events.selected,
        hovered: state.events.hovered,
    }));
    const { enabled } = useEditor((state) => ({ enabled: state.options.enabled }));

    const displayProducts = products.slice(0, limit);

    return (
        <section
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "py-12 px-6 transition-all w-full",
                enabled && selected && "ring-2 ring-primary ring-inset",
                enabled && hovered && !selected && "ring-2 ring-primary/40 ring-inset",
                enabled && "cursor-move"
            )}
        >
            <div className="max-w-7xl mx-auto">
                {(heading || subheading) && (
                    <div className="mb-8 text-center">
                        {heading && <h2 className="text-2xl font-bold">{heading}</h2>}
                        {subheading && <p className="mt-2 text-muted-foreground">{subheading}</p>}
                    </div>
                )}

                <div className={cn("grid gap-6", COLUMNS_MAP[columns])}>
                    {displayProducts.length > 0 ? (
                        displayProducts.map((product) => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                showPrice={showPrice}
                                showAddToCart={showAddToCart}
                                cardStyle={cardStyle}
                                enabled={enabled}
                            />
                        ))
                    ) : (
                        // Placeholder products for editor preview
                        Array.from({ length: limit }).map((_, i) => (
                            <PlaceholderCard
                                key={i}
                                showPrice={showPrice}
                                showAddToCart={showAddToCart}
                            />
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}

function ProductCard({
    product,
    showPrice,
    showAddToCart,
    cardStyle,
    enabled,
}: {
    product: Product;
    showPrice: boolean;
    showAddToCart: boolean;
    cardStyle: string;
    enabled: boolean;
}) {
    return (
        <div className={cn(
            "group",
            cardStyle === "minimal" && "text-center",
            cardStyle === "overlay" && "relative overflow-hidden rounded-xl"
        )}>
            <div className={cn(
                "aspect-square overflow-hidden bg-muted",
                cardStyle !== "overlay" && "rounded-xl"
            )}>
                {product.images?.[0]?.url ? (
                    <img
                        src={product.images[0].url}
                        alt={product.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No image
                    </div>
                )}
            </div>
            <div className={cn(
                "mt-4",
                cardStyle === "overlay" && "absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent text-white"
            )}>
                <h3 className="font-medium">{product.name}</h3>
                {showPrice && (
                    <p className={cn(
                        "text-sm mt-1",
                        cardStyle === "overlay" ? "text-white/80" : "text-muted-foreground"
                    )}>
                        ${product.price.toFixed(2)}
                    </p>
                )}
                {showAddToCart && cardStyle !== "overlay" && (
                    <Button
                        size="sm"
                        variant="outline"
                        className="mt-3 w-full"
                        onClick={(e) => enabled && e.preventDefault()}
                    >
                        Add to Cart
                    </Button>
                )}
            </div>
        </div>
    );
}

function PlaceholderCard({
    showPrice,
    showAddToCart,
}: {
    showPrice: boolean;
    showAddToCart: boolean;
}) {
    return (
        <div className="group">
            <div className="aspect-square rounded-xl bg-muted animate-pulse" />
            <div className="mt-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                {showPrice && <div className="h-3 w-1/2 rounded bg-muted" />}
                {showAddToCart && <div className="h-9 w-full rounded bg-muted mt-3" />}
            </div>
        </div>
    );
}

ProductGrid.craft = {
    displayName: "Product Grid",
    props: {
        heading: "Featured Products",
        subheading: "Check out our latest collection",
        source: "featured",
        columns: 4,
        limit: 8,
        showPrice: true,
        showAddToCart: true,
        showQuickView: false,
        cardStyle: "default",
    },
    rules: {
        canDrag: () => true,
    },
    related: {
        settings: ProductGridSettings,
    },
};
