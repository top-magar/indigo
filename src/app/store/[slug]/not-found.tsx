import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Store } from "lucide-react";

export default function StoreNotFound() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <Store className="h-8 w-8 text-muted-foreground" />
                </div>
                <h1 className="mb-2 text-4xl font-bold text-foreground">404</h1>
                <h2 className="mb-2 text-xl font-semibold text-foreground">
                    Store not found
                </h2>
                <p className="mb-6 text-muted-foreground">
                    The store you&apos;re looking for doesn&apos;t exist or may have been removed.
                </p>
                <Button asChild className="gap-2">
                    <Link href="/">
                        <Home className="h-4 w-4" />
                        Back to home
                    </Link>
                </Button>
            </div>
        </div>
    );
}
