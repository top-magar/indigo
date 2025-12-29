import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"

/**
 * Redirect to the full-screen storefront editor
 */
export default function StorefrontSettingsPage() {
  redirect("/storefront")
}
