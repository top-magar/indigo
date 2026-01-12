"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect, useRef } from "react"
import { Store, Eye, EyeOff, X } from "lucide-react"
import { signupAction, signInWithGoogle } from "./actions"
import { cn } from "@/shared/utils"

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return { score, label: "Weak", color: "bg-[var(--ds-red-600)]" }
  if (score <= 2) return { score, label: "Fair", color: "bg-[var(--ds-amber-600)]" }
  if (score <= 3) return { score, label: "Good", color: "bg-[var(--ds-green-600)]" }
  return { score, label: "Strong", color: "bg-[var(--ds-green-700)]" }
}


export default function SignupPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [storeName, setStoreName] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const storeNameRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    storeNameRef.current?.focus()
  }, [])

  const passwordStrength = getPasswordStrength(password)

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true)
    setError(null)
    try {
      const result = await signInWithGoogle()
      if (result?.error) {
        setError(result.error)
      }
    } catch {
      setError("Failed to sign in with Google")
    } finally {
      setIsGoogleLoading(false)
    }
  }

  const validateEmail = () => {
    if (!email) {
      setEmailError("Email is required")
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email")
    } else {
      setEmailError(null)
    }
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (storeName.length < 3) {
      setError("Store name must be at least 3 characters")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      setIsLoading(false)
      return
    }

    try {
      const formData = new FormData()
      formData.append("email", email)
      formData.append("password", password)
      formData.append("confirmPassword", password)
      formData.append("storeName", storeName)

      const result = await signupAction(null, formData)

      if (result.error) {
        setError(result.error)
      } else {
        router.push("/verify")
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }


  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-[var(--ds-background-200)] p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--ds-gray-1000)]">
              <Store className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-[var(--ds-gray-1000)]">Indigo</span>
          </div>
          <Card className="border-[var(--ds-gray-200)]">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-semibold text-[var(--ds-gray-1000)]">Create your store</CardTitle>
              <CardDescription className="text-[var(--ds-gray-600)]">Start selling online in minutes</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp}>
                <div className="flex flex-col gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-[var(--ds-gray-300)]"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading || isLoading}
                  >
                    {isGoogleLoading ? "Connecting..." : (
                      <>
                        <GoogleIcon className="w-4 h-4 mr-2" />
                        Continue with Google
                      </>
                    )}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[var(--ds-gray-200)]" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-[var(--ds-gray-500)]">Or continue with email</span>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="store-name" className="text-[var(--ds-gray-800)]">Store name</Label>
                    <Input
                      ref={storeNameRef}
                      id="store-name"
                      type="text"
                      placeholder="My Awesome Store"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      autoComplete="organization"
                      className="border-[var(--ds-gray-300)]"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-[var(--ds-gray-800)]">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (emailError) setEmailError(null)
                      }}
                      onBlur={validateEmail}
                      className={cn(
                        "border-[var(--ds-gray-300)]",
                        emailError && "border-[var(--ds-red-600)]"
                      )}
                      autoComplete="email"
                    />
                    {emailError && (
                      <p className="text-xs text-[var(--ds-red-700)] flex items-center gap-1">
                        <X className="w-3 h-3" />
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password" className="text-[var(--ds-gray-800)]">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pr-10 border-[var(--ds-gray-300)]"
                        autoComplete="new-password"
                        placeholder="At least 6 characters"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ds-gray-500)] hover:text-[var(--ds-gray-800)] transition-colors"
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    
                    {password && (
                      <div className="space-y-1.5">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((level) => (
                            <div
                              key={level}
                              className={cn(
                                "h-1 flex-1 rounded-full transition-colors",
                                passwordStrength.score >= level ? passwordStrength.color : "bg-[var(--ds-gray-200)]"
                              )}
                            />
                          ))}
                        </div>
                        <p className={cn(
                          "text-xs",
                          passwordStrength.score <= 1 ? "text-[var(--ds-red-700)]" : 
                          passwordStrength.score <= 2 ? "text-[var(--ds-amber-700)]" : "text-[var(--ds-green-700)]"
                        )}>
                          {passwordStrength.label} password
                        </p>
                      </div>
                    )}

                    {password && password.length < 6 && (
                      <div className="text-xs text-[var(--ds-gray-600)] flex items-center gap-1.5">
                        <X className="w-3 h-3 text-[var(--ds-gray-500)]" />
                        <span>At least 6 characters</span>
                      </div>
                    )}
                  </div>

                  {error && (
                    <p className="text-sm text-[var(--ds-red-700)] flex items-center gap-1.5">
                      <X className="w-4 h-4 shrink-0" />
                      {error}
                    </p>
                  )}

                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Creating your store..." : "Create your store"}
                  </Button>
                </div>

                <p className="mt-4 text-center text-xs text-[var(--ds-gray-600)]">
                  By creating a store, you agree to our{" "}
                  <Link href="/terms" className="underline underline-offset-4 hover:text-[var(--ds-gray-900)]">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="underline underline-offset-4 hover:text-[var(--ds-gray-900)]">
                    Privacy Policy
                  </Link>
                </p>

                <div className="mt-4 text-center text-sm text-[var(--ds-gray-600)]">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[var(--ds-gray-900)] underline-offset-4 hover:underline">
                    Sign in
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
