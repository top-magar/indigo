"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { Logout01Icon } from "@hugeicons/core-free-icons";

export function SignOutButton() {
    const router = useRouter();
    
    const handleSignOut = async () => {
        const supabase = createBrowserClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 text-destructive cursor-pointer"
        >
            <HugeiconsIcon icon={Logout01Icon} className="w-4 h-4" />
            Sign Out
        </button>
    );
}
