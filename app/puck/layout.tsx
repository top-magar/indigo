import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Page Editor | Puck",
    description: "Visual page editor for your store",
};

export default function PuckLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Minimal layout - no dashboard sidebar or header
    // The Puck editor provides its own UI chrome
    return (
        <div className="puck-editor-fullscreen">
            {children}
        </div>
    );
}
