import { createClient } from "@/infrastructure/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { HugeiconsIcon } from "@hugeicons/react"
import { Mail01Icon, UserIcon, Calendar03Icon } from "@hugeicons/core-free-icons"

export default async function AccountProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch tenant
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", slug)
    .single()

  if (tenantError || !tenant) {
    notFound()
  }

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/store/${slug}`)
  }

  // Fetch customer data if exists
  const { data: customer } = await supabase
    .from("customers")
    .select("*")
    .eq("tenant_id", tenant.id)
    .eq("email", user.email)
    .single()

  const displayName = customer?.first_name
    ? `${customer.first_name} ${customer.last_name || ""}`.trim()
    : user.user_metadata?.full_name || user.email?.split("@")[0] || "User"

  const createdAt = new Date(user.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information
        </p>
      </div>

      {/* Profile Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your personal details and account settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and basic info */}
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <HugeiconsIcon icon={UserIcon} className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{displayName}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Mail01Icon} className="h-4 w-4" />
                {user.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HugeiconsIcon icon={Calendar03Icon} className="h-4 w-4" />
                Member since {createdAt}
              </div>
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Contact Information</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  defaultValue={customer?.first_name || ""}
                  placeholder="Enter your first name"
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  defaultValue={customer?.last_name || ""}
                  placeholder="Enter your last name"
                  disabled
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                defaultValue={user.email || ""}
                disabled
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                defaultValue={customer?.phone || ""}
                placeholder="Enter your phone number"
                disabled
              />
            </div>
          </div>

          <Separator />

          {/* Shipping Address */}
          {customer?.default_address && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Default Shipping Address</h4>
              <div className="rounded-lg border bg-muted/50 p-4">
                <AddressDisplay address={customer.default_address} />
              </div>
            </div>
          )}

          {!customer?.default_address && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Default Shipping Address</h4>
              <p className="text-sm text-muted-foreground">
                No default address saved. Your address will be saved when you place your first order.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Account Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">
                Sign out of your account on this device
              </p>
            </div>
            <form action={`/api/auth/signout?redirect=/store/${slug}`} method="POST">
              <Button variant="outline" type="submit">
                Sign Out
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface AddressData {
  address?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

function AddressDisplay({ address }: { address: AddressData }) {
  const parts = [
    address.address,
    address.city,
    address.state,
    address.postal_code,
    address.country,
  ].filter(Boolean)

  if (parts.length === 0) {
    return <p className="text-sm text-muted-foreground">No address on file</p>
  }

  return (
    <p className="text-sm">
      {address.address && <span className="block">{address.address}</span>}
      {(address.city || address.state || address.postal_code) && (
        <span className="block">
          {[address.city, address.state, address.postal_code].filter(Boolean).join(", ")}
        </span>
      )}
      {address.country && <span className="block">{address.country}</span>}
    </p>
  )
}
