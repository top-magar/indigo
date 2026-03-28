import { requireUser } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  if (!user.tenantId) redirect("/dashboard")
  return <>{children}</>
}
