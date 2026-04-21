/* eslint-disable @next/next/no-page-custom-font */
export default function EditorV3Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" />
      <div className="overflow-hidden overscroll-none h-screen bg-white text-gray-900" data-theme="light" style={{ colorScheme: "light" }}>
        {children}
      </div>
    </>
  );
}
