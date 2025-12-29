import { redirect } from "next/navigation"

/**
 * Redirect to the full-screen storefront editor
 */
export default function StorefrontSettingsPage() {
  redirect("/storefront")
}
