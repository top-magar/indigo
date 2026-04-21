"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePage } from "./actions";

export function DeletePageButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        if (!confirm("Delete this page?")) return;
        await deletePage(id);
        router.refresh();
      }}
      className="inline-flex items-center rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
    >
      <Trash2 size={12} />
    </button>
  );
}
