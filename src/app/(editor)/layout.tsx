import { createClient } from "@/infrastructure/supabase/server"
import { redirect } from "next/navigation"

/**
 * Editor Layout - Full screen without dashboard chrome
 * Used for immersive editing experiences like the storefront editor
 */
export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="h-screen w-screen overflow-hidden bg-background">
      {children}
    </div>
  )
}
