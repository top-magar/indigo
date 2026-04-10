import { requireUser } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ConfirmDialogProvider } from "@/hooks/use-confirm-dialog"

export default async function EditorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await requireUser()
  if (!user.tenantId) redirect("/dashboard")
  return <ConfirmDialogProvider><div className="overflow-hidden overscroll-none h-screen">{children}</div></ConfirmDialogProvider>
}
