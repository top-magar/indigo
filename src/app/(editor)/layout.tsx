import { requireUser } from "@/lib/auth"

/**
 * Editor Layout - Full screen without dashboard chrome
 * Used for immersive editing experiences like the storefront editor
 */
export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireUser()

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  )
}
