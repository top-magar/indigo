"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Tenant } from "@/lib/supabase/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { Upload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import Image from "next/image"

interface StoreSettingsFormProps {
  tenant: Tenant
}

const currencies = [
  { value: "USD", label: "US Dollar (USD)" },
  { value: "EUR", label: "Euro (EUR)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "AUD", label: "Australian Dollar (AUD)" },
  { value: "JPY", label: "Japanese Yen (JPY)" },
]

export function StoreSettingsForm({ tenant }: StoreSettingsFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const [name, setName] = useState(tenant.name)
  const [description, setDescription] = useState(tenant.description || "")
  const [logoUrl, setLogoUrl] = useState(tenant.logo_url || "")
  const [primaryColor, setPrimaryColor] = useState(tenant.primary_color)
  const [secondaryColor, setSecondaryColor] = useState(tenant.secondary_color)
  const [currency, setCurrency] = useState(tenant.currency)

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) throw new Error("Upload failed")

      const data = await response.json()
      setLogoUrl(data.url)
      toast.success("Logo uploaded")
    } catch {
      toast.error("Failed to upload logo")
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error } = await supabase
        .from("tenants")
        .update({
          name,
          description: description || null,
          logo_url: logoUrl || null,
          primary_color: primaryColor,
          secondary_color: secondaryColor,
          currency,
        })
        .eq("id", tenant.id)

      if (error) throw error

      toast.success("Settings saved")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save settings")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Store Information</CardTitle>
          <CardDescription>Basic information about your store</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Store Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Store"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell customers about your store..."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label>Store URL</Label>
            <div className="flex items-center gap-2 rounded-md border bg-muted/50 px-3 py-2">
              <span className="text-sm text-muted-foreground">/store/</span>
              <span className="text-sm font-medium">{tenant.slug}</span>
            </div>
            <p className="text-xs text-muted-foreground">Store URL cannot be changed</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding</CardTitle>
          <CardDescription>Customize your store appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <div className="flex items-center gap-4">
              {logoUrl ? (
                <div className="relative h-20 w-20 overflow-hidden rounded-lg border bg-muted">
                  <Image src={logoUrl} alt="Store logo" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => setLogoUrl("")}
                    className="absolute right-1 top-1 rounded-full bg-background/80 p-1"
                  >
                    <HugeiconsIcon icon={Cancel01Icon} className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed bg-muted/50 transition-colors hover:bg-muted">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  ) : (
                    <HugeiconsIcon icon={Upload01Icon} className="h-5 w-5 text-muted-foreground" />
                  )}
                </label>
              )}
              <div className="text-sm text-muted-foreground">
                <p>Upload a logo for your store</p>
                <p>Recommended: 200x200px</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="primary-color">Primary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  id="primary-color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="secondary-color">Secondary Color</Label>
              <div className="flex gap-2">
                <Input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="h-10 w-14 cursor-pointer p-1"
                />
                <Input
                  id="secondary-color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regional Settings</CardTitle>
          <CardDescription>Currency and localization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="w-full md:w-64">
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
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </form>
  )
}
