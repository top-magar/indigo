import { createClient } from "@/infrastructure/supabase/server"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  UserIcon,
  ShoppingBag01Icon,
  ArrowLeft01Icon,
} from "@hugeicons/core-free-icons"
import { cn } from "@/shared/utils"

interface AccountLayoutProps {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}

const accountNavItems = [
  {
    href: "",
    label: "Profile",
    icon: UserIcon,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: ShoppingBag01Icon,
  },
]

export default async function AccountLayout({
  children,
  params,
}: AccountLayoutProps) {
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

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/store/${slug}`)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href={`/store/${slug}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                Back to Store
              </Link>
            </div>
            <h1 className="text-lg font-semibold">{tenant.name}</h1>
            <div className="w-24" /> {/* Spacer for centering */}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Sidebar Navigation */}
          <aside className="space-y-1">
            <h2 className="mb-4 text-lg font-semibold">My Account</h2>
            <nav className="space-y-1">
              {accountNavItems.map((item) => (
                <AccountNavLink
                  key={item.href}
                  href={`/store/${slug}/account${item.href}`}
                  icon={item.icon}
                >
                  {item.label}
                </AccountNavLink>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  )
}

function AccountNavLink({
  href,
  icon: Icon,
  children,
}: {
  href: string
  icon: typeof UserIcon
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <HugeiconsIcon icon={Icon} className="h-4 w-4" />
      {children}
    </Link>
  )
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name")
    .eq("slug", slug)
    .single()

  if (!tenant) {
    return { title: "Account" }
  }

  return {
    title: `My Account | ${tenant.name}`,
    description: `Manage your account at ${tenant.name}`,
  }
}
