export default function EditorLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Full-page layout - no dashboard chrome
    return <>{children}</>;
}
