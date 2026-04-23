"use client"

import type React from "react"
import { createClient } from "@/infrastructure/supabase/client"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, Suspense } from "react"
import { Store, Eye, EyeOff, Loader2 } from "lucide-react"
import { signInWithGoogle } from "./actions"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function SignupForm() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const router = useRouter()

  const [success, setSuccess] = useState(false)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const result = await signInWithGoogle()
      if (result?.error) setError(result.error)
    } catch { setError("Failed to sign up with Google") }
    finally { setIsGoogleLoading(false) }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password.length < 8) { setError("Password must be at least 8 characters"); return }
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error
      
      // If session exists, user is auto-confirmed → go to onboarding
      if (data.session) {
        window.location.href = "/auth/onboarding"
      } else {
        // Email confirmation required
        setSuccess(true)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally { setIsLoading(false) }
  }

  return (
    <div className="w-full max-w-[340px]">
      {/* Mobile logo */}
      <div className="flex items-center gap-2.5 mb-12 lg:hidden">
        <div className="flex size-8 items-center justify-center rounded-md bg-foreground">
          <Store className="size-4 text-background" />
        </div>
        <span className="text-sm font-semibold tracking-tight">Indigo</span>
      </div>

      {success ? (
        <div className="space-y-4 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted mx-auto">
            <svg className="size-6 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Check your email</h1>
          <p className="text-sm text-muted-foreground">
            We sent a confirmation link to <span className="font-medium text-foreground">{email}</span>. Click it to activate your account.
          </p>
          <Link href="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors inline-block mt-2">
            Back to sign in
          </Link>
        </div>
      ) : (
      <>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Start selling online in minutes
        </p>
      </div>

      {/* Google */}
      <Button
        type="button"
        variant="outline"
        className="w-full h-10 mb-6"
        onClick={handleGoogleSignIn}
        disabled={isGoogleLoading || isLoading}
      >
        {isGoogleLoading ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon className="size-4" />}
        Continue with Google
      </Button>

      {/* Divider */}
      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-[11px] uppercase">
          <span className="bg-background px-2 text-muted-foreground/50">or</span>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-medium">Full name</label>
          <input
            id="name"
            type="text"
            placeholder="Your name"
            required
            value={fullName}
            onChange={(e) => { setFullName(e.target.value); setError(null) }}
            autoFocus
            autoComplete="name"
            className="w-full h-10 px-3 rounded-lg border border-input bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-xs font-medium">Email</label>
          <input
            id="email"
            type="email"
            placeholder="you@example.com"
            required
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null) }}
            autoComplete="email"
            className="w-full h-10 px-3 rounded-lg border border-input bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors"
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-xs font-medium">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="8+ characters"
              required
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(null) }}
              autoComplete="new-password"
              className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-ring transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </div>

        {error && <p className="text-xs text-destructive">{error}</p>}

        <Button type="submit" className="w-full h-10" disabled={isLoading}>
          {isLoading ? <><Loader2 className="size-3.5 animate-spin" /> Creating account...</> : "Create account"}
        </Button>
      </form>

      <p className="text-center text-xs text-muted-foreground mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-foreground font-medium hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>

      <p className="text-[11px] text-muted-foreground/40 text-center mt-6 leading-relaxed">
        By creating an account you agree to our Terms and Privacy Policy.
      </p>
      </>
      )}
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center"><Loader2 className="size-5 animate-spin text-muted-foreground" /></div>}>
      <SignupForm />
    </Suspense>
  )
}
