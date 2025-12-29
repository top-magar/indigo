"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"
import { redirect } from "next/navigation"

export interface LoginState {
  error: string | null
}

/**
 * Server Action for handling login form submission
 * Uses useActionState pattern for proper error handling
 * 
 * @see https://nextjs.org/docs/app/guides/forms#validation-errors
 */
export async function login(
  prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" }
        default:
          return { error: "Something went wrong. Please try again." }
      }
    }
    // Re-throw non-auth errors
    throw error
  }

  // Redirect on success
  redirect("/dashboard")
}
