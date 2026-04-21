'use client';

import dynamic from "next/dynamic";
import type { EditorProps } from "@/features/editor/core/types";

const Editor = dynamic(() => import("@/features/editor/editor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-screen text-sm text-gray-400">
      Loading editor...
    </div>
  ),
});

export default function EditorClient(props: EditorProps) {
  return <Editor key={`${props.pageId}-${props.activePageId}`} {...props} />;
}
