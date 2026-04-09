import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/infrastructure/supabase/server";
import { createLogger } from "@/lib/logger";
import { withRateLimit } from "@/infrastructure/middleware/rate-limit";
const log = createLogger("api:contact");

const contactSchema = z.object({
  name: z.string().max(200).optional(),
  email: z.string().email(),
  message: z.string().min(1).max(5000),
  tenantId: z.string().uuid().optional(),
});

export const POST = withRateLimit("storefront", async function POST(request: Request) {
  try {
    const raw = await request.json();
    const data = contactSchema.parse(raw);

    const supabase = await createClient();

    const { error } = await supabase
      .from("contact_submissions")
      .insert({
        name: data.name || null,
        email: data.email,
        message: data.message,
        tenant_id: data.tenantId || null,
        submitted_at: new Date().toISOString(),
      });

    if (error) {
      log.error("Contact form error:", error);
      return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }

    return NextResponse.json({ message: "Message sent successfully" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
    }
    log.error("Contact API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
});
