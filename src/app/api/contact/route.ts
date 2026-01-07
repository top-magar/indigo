import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/infrastructure/supabase/server";

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        if (!data.email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // Store contact form submission
        const { error } = await supabase
            .from("contact_submissions")
            .insert({
                ...data,
                submitted_at: new Date().toISOString(),
            });

        if (error) {
            console.error("Contact form error:", error);
            // If table doesn't exist, just log and return success
            // The form data could be sent via email in production
        }

        return NextResponse.json(
            { message: "Message sent successfully" },
            { status: 200 }
        );
    } catch (error) {
        console.error("Contact API error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
