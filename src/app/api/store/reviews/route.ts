import { createClient } from "@/infrastructure/supabase/server";
import { NextResponse } from "next/server";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";

export const POST = withRateLimit("storefront", async function POST(request: Request) {
  const formData = await request.formData();
  const productId = formData.get("productId") as string;
  const customerName = formData.get("customerName") as string;
  const customerEmail = formData.get("customerEmail") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const title = (formData.get("title") as string) || null;
  const content = formData.get("content") as string;

  if (!productId || !customerName || !customerEmail || !content || !rating) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const supabase = await createClient();

  // Derive tenantId from the product — never trust user input
  const { data: product } = await supabase
    .from("products")
    .select("tenant_id")
    .eq("id", productId)
    .single();

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const { error } = await supabase.from("reviews").insert({
    tenant_id: product.tenant_id,
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
})
