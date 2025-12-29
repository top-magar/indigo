"use client";

import { useCart } from "./cart-context";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Allow generic prop type for now
type Product = {
    id: string;
    name: string;
    price: number | string; // DB might return string
    description?: string | null;
};

export function ProductCard({ product }: { product: Product }) {
    const { addToCart } = useCart();

    // Convert price to number safely
    const price = typeof product.price === 'string' ? parseFloat(product.price) : product.price;

    return (
        <Card className="flex flex-col h-full">
            <div className="aspect-square bg-gray-100 relative">
                {/* Placeholder for image */}
                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    No Image
                </div>
            </div>
            <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-gray-500 line-clamp-2">{product.description}</p>
                <p className="mt-4 font-bold text-lg">${price.toFixed(2)}</p>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => addToCart({
                        id: product.id,
                        name: product.name,
                        price: price
                    })}
                >
                    Add to Cart
                </Button>
            </CardFooter>
        </Card>
    );
}
