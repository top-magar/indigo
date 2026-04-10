import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { LoginForm } from "./login-form"

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

  return { title: tenant ? `Sign In | ${tenant.name}` : "Sign In" }
}

export default async function StoreLoginPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, slug")
    .eq("slug", slug)
    .single()

  if (!tenant) notFound()

  return <LoginForm slug={slug} storeName={tenant.name} />
}
