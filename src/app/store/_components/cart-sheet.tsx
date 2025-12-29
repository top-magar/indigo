"use client";

import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import { ShoppingBasket01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";
import { checkoutAction } from "../actions";
import { toast } from "sonner"; // Assuming sonner is installed/configured or just alert
// We need a server action to checkout or we call an API.
// Since this is a client component, we can call a Server Action directly if we import it?
// But publicStorefrontAction is a wrapper. We need a specific checkout action.
// Let's create `app/store/actions.ts` later. For now I'll stub the checkout.

export function CartSheet({ tenantId }: { tenantId: string }) {
    const { items, removeFromCart, cartTotal, clearCart } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const handleCheckout = async () => {
        setIsCheckingOut(true);
        try {
            // Basic cart mapping
            const payload = items.map(i => ({
                id: i.id,
                quantity: i.quantity,
                price: i.price
            }));

            const result = await checkoutAction(tenantId, payload);
            if (result.success) {
                clearCart();
                setIsOpen(false);
                alert(result.message); // or toast
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error(error);
            alert("An error occurred");
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                    <HugeiconsIcon icon={ShoppingBasket01Icon} strokeWidth={2} />
                    {items.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                            {items.length}
                        </span>
                    )}
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Your Cart</SheetTitle>
                    <SheetDescription>
                        Review your items before checkout.
                    </SheetDescription>
                </SheetHeader>
                <div className="mt-8 space-y-4">
                    {items.length === 0 ? (
                        <p className="text-center text-gray-500">Your cart is empty.</p>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <p className="font-medium">{item.name}</p>
                                    <p className="text-sm text-gray-500">Qty: {item.quantity} x ${item.price.toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        Remove
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                {items.length > 0 && (
                    <SheetFooter className="mt-8 pt-4 border-t">
                        <div className="w-full space-y-4">
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>${cartTotal.toFixed(2)}</span>
                            </div>
                            <Button
                                className="w-full bg-indigo-600 hover:bg-indigo-700"
                                onClick={handleCheckout}
                                disabled={isCheckingOut}
                            >
                                {isCheckingOut ? "Processing..." : "Checkout"}
                            </Button>
                        </div>
                    </SheetFooter>
                )}
            </SheetContent>
        </Sheet>
    );
}
