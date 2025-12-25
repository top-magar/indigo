import { redirect } from "next/navigation";

interface PageEditorProps {
    params: Promise<{ pageId: string }>;
}

// Redirect to the full-page editor route
export default async function PuckEditorPage({ params }: PageEditorProps) {
    const { pageId } = await params;
    redirect(`/puck/${pageId}`);
}
