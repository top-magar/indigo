"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { puckConfig } from "@/lib/puck/config";
import { savePuckPage } from "@/app/dashboard/puck-editor/actions";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";

interface PuckEditorClientProps {
    pageId: string;
    pageTitle: string;
    initialData: Data | null;
}

export function PuckEditorClient({ pageId, pageTitle, initialData }: PuckEditorClientProps) {
    const router = useRouter();

    const handlePublish = useCallback(async (data: Data) => {
        const result = await savePuckPage(pageId, data);
        
        if (result.success) {
            toast.success("Page saved successfully");
            router.refresh();
        } else {
            toast.error(result.error || "Failed to save page");
        }
    }, [pageId, router]);

    return (
        <Puck
            config={puckConfig}
            data={initialData || { content: [], root: { props: {} } }}
            onPublish={handlePublish}
            overrides={{
                headerActions: ({ children }) => (
                    <>
                        <Link
                            href="/dashboard/puck-editor"
                            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-2"
                        >
                            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                            Back to Dashboard
                        </Link>
                        {children}
                    </>
                ),
            }}
        />
    );
}
