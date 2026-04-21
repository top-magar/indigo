import { Toaster } from "sonner";

export default function EditorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden overscroll-none h-screen" data-theme="light" style={{ colorScheme: "light" }}>
      {children}
      <Toaster position="bottom-right" richColors closeButton />
    </div>
  );
}
