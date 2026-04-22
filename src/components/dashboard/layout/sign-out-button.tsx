"use client";

import { useState, useCallback, useMemo } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { LogOut, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function SignOutButton() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [open, setOpen] = useState(false);

    // Memoize Supabase client to avoid recreation on every render
    const supabase = useMemo(
        () =>
            createBrowserClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            ),
        []
    );

    const handleSignOut = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const { error: signOutError } = await supabase.auth.signOut();

            if (signOutError) {
                throw signOutError;
            }

            // Clear draft mode cookie
            document.cookie = "__prerender_bypass=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

            router.push("/login");
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to sign out");
            setIsLoading(false);
        }
    }, [supabase, router]);

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
                <motion.button
                    className="flex w-full items-center gap-2 text-destructive cursor-pointer transition-colors duration-150"
                    disabled={isLoading}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    transition={{ duration: 0.15 }}
                >
                    <motion.span
                        initial={false}
                        animate={{ rotate: isLoading ? 360 : 0 }}
                        transition={{ duration: 0.6, repeat: isLoading ? Infinity : 0, ease: "linear" }}
                    >
                        {isLoading ? (
                            <Loader2 className="size-4" />
                        ) : (
                            <LogOut className="size-4" />
                        )}
                    </motion.span>
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={isLoading ? "loading" : "idle"}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                        >
                            {isLoading ? "Signing out..." : "Sign Out"}
                        </motion.span>
                    </AnimatePresence>
                </motion.button>
            </AlertDialogTrigger>
            <AlertDialogContent asChild>
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.15 }}
                >
                    <AlertDialogHeader>
                        <AlertDialogTitle>Sign out?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You'll need to sign in again to access your dashboard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AnimatePresence>
                        {error && (
                            <motion.p
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="text-sm text-destructive"
                            >
                                {error}
                            </motion.p>
                        )}
                    </AnimatePresence>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                            <AlertDialogAction
                                onClick={handleSignOut}
                                disabled={isLoading}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive transition-colors duration-150"
                            >
                                <AnimatePresence mode="wait">
                                    {isLoading ? (
                                        <motion.span
                                            key="loading"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="flex items-center"
                                        >
                                            <Loader2 className="mr-2 size-4 animate-spin" />
                                            Signing out...
                                        </motion.span>
                                    ) : (
                                        <motion.span
                                            key="idle"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            Sign Out
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </AlertDialogAction>
                        </motion.div>
                    </AlertDialogFooter>
                </motion.div>
            </AlertDialogContent>
        </AlertDialog>
    );
}
