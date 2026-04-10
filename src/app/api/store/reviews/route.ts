import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const formData = await request.formData();
  const tenantId = formData.get("tenantId") as string;
  const productId = formData.get("productId") as string;
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const title = (formData.get("title") as string) || null;
  const content = formData.get("content") as string;

  if (!tenantId || !productId || !customerName || !customerEmail || !content || !rating) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    tenant_id: tenantId,
    product_id: productId,
    customer_name: customerName,
    customer_email: customerEmail,
    rating,
    title,
    content,
    is_approved: false,
    is_verified: false,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
