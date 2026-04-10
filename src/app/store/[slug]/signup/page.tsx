import { createClient } from "@/infrastructure/supabase/server"
import { notFound } from "next/navigation"
import { SignupForm } from "./signup-form"

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

  return { title: tenant ? `Sign Up | ${tenant.name}` : "Sign Up" }
}

export default async function StoreSignupPage({
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

  return <SignupForm slug={slug} storeName={tenant.name} tenantId={tenant.id} />
}
