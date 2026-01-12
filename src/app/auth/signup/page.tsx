import { redirect } from "next/navigation"

/**
 * Redirect from old /auth/signup to new /signup route
 */
export default function AuthSignupRedirect() {
  redirect("/signup")
}
