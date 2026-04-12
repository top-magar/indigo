export default function EditorV3Layout({ children }: { children: React.ReactNode }) {
  return <div className="overflow-hidden overscroll-none h-screen bg-white text-gray-900" data-theme="light" style={{ colorScheme: "light" }}>{children}</div>
}
