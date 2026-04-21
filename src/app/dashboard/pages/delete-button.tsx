"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deletePage } from "./actions";
import { useConfirmDelete } from "@/hooks/use-confirm-dialog";

export function DeletePageButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const confirmDelete = useConfirmDelete();
  return (
    <button
      onClick={async () => {
        if (!(await confirmDelete(name, "page"))) return;
        await deletePage(id);
        router.refresh();
      }}
      className="inline-flex items-center rounded-md px-2 py-1 text-xs text-destructive hover:bg-destructive/10 transition-colors"
    >
      <Trash2 size={12} />
    </button>
  );
}
