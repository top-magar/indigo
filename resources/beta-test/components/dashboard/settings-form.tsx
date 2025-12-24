"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tenant, User } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

interface SettingsFormProps {
  tenant: Tenant
  user: User
}

const currencies = [
  { value: "USD", label: "USD - US Dollar" },
  { value: "EUR", label: "EUR - Euro" },
  { value: "GBP", label: "GBP - British Pound" },
  { value: "CAD", label: "CAD - Canadian Dollar" },
  { value: "AUD", label: "AUD - Australian Dollar" },
]

export function SettingsForm({ tenant, user }: SettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Store settings
  const [storeName, setStoreName] = useState(tenant.name)
  const [storeDescription, setStoreDescription] = useState(tenant.description || "")
  const [currency, setCurrency] = useState(tenant.currency)
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color)

  // User settings
  const [fullName, setFullName] = useState(user.full_name || "")
  const [email, setEmail] = useState(user.email)

  const handleStoreUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("tenants")
        .update({
          name: storeName,
          description: storeDescription,
          currency,
          primary_color: primaryColor,
        })
        .eq("id", tenant.id)

      if (error) throw error

      toast.success("Store settings updated")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("users")
        .update({
          full_name: fullName,
        })
        .eq("id", user.id)

      if (error) throw error

      toast.success("Profile updated")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="store" className="space-y-6">
      <TabsList>
        <TabsTrigger value="store">Store</TabsTrigger>
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>

      <TabsContent value="store">
        <Card>
          <CardHeader>
            <CardTitle>Store Settings</CardTitle>
            <CardDescription>Configure your store details and preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStoreUpdate} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="store-name">Store name</Label>
                  <Input id="store-name" value={storeName} onChange={(e) => setStoreName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="store-slug">Store URL</Label>
                  <Input id="store-slug" value={`${tenant.slug}.storecraft.com`} disabled className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="store-description">Description</Label>
                <Textarea
                  id="store-description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="A brief description of your store"
                  rows={3}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primary-color">Brand color</Label>
                  <div className="flex gap-2">
                    <Input
                      id="primary-color"
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-10 w-14 cursor-pointer p-1"
                    />
                    <Input
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1"
                      placeholder="#000000"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full name</Label>
                  <Input id="full-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} disabled className="bg-muted" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <Input value={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled className="bg-muted" />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="billing">
        <Card>
          <CardHeader>
            <CardTitle>Billing & Payments</CardTitle>
            <CardDescription>Manage your subscription and payment settings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">Free Starter Plan</p>
                  </div>
                  <Button variant="outline">Upgrade</Button>
                </div>
              </div>

              <div className="rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Stripe Connect</h3>
                    <p className="text-sm text-muted-foreground">
                      {tenant.stripe_onboarding_complete
                        ? "Connected - Accepting payments"
                        : "Connect to start accepting payments"}
                    </p>
                  </div>
                  <Button variant={tenant.stripe_onboarding_complete ? "outline" : "default"}>
                    {tenant.stripe_onboarding_complete ? "Manage" : "Connect Stripe"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
