"use client";

import { useState } from "react";
import { createClient } from "@/infrastructure/supabase/client";
import { LogOut, Loader2 } from "lucide-react";

export function SignOutButton() {
    const [isLoading, setIsLoading] = useState(false);

    const handleSignOut = async () => {
        setIsLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="flex w-full items-center gap-2 text-destructive text-sm cursor-pointer"
        >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />}
            {isLoading ? "Signing out..." : "Sign out"}
        </button>
    );
}
