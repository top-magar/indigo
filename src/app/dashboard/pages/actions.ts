"use server";

import { z } from "zod";
import { createLogger } from "@/lib/logger";
import { getAuthenticatedClient } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const log = createLogger("pages:cms");

export interface StorePage {
    slug: string;
    title: string;
    content: string;
    isPublished: boolean;
    updatedAt: string;
}

const DEFAULT_PAGES: StorePage[] = [
    { slug: "about", title: "About Us", content: "", isPublished: true, updatedAt: "" },
    { slug: "contact", title: "Contact", content: "", isPublished: true, updatedAt: "" },
    { slug: "faq", title: "FAQ", content: "", isPublished: true, updatedAt: "" },
    { slug: "terms", title: "Terms & Conditions", content: "", isPublished: false, updatedAt: "" },
    { slug: "privacy", title: "Privacy Policy", content: "", isPublished: false, updatedAt: "" },
    { slug: "shipping-policy", title: "Shipping Policy", content: "", isPublished: false, updatedAt: "" },
    { slug: "return-policy", title: "Return Policy", content: "", isPublished: false, updatedAt: "" },
];

async function getAuth() {
    const { user, supabase } = await getAuthenticatedClient();
    return { supabase, tenantId: user.tenantId };
}

export async function getStorePages(): Promise<StorePage[]> {
    const { supabase, tenantId } = await getAuth();

    const { data: tenant } = await supabase
        .from("tenants")
        .select("settings")
        .eq("id", tenantId)
        .single();

    const saved = ((tenant?.settings as Record<string, unknown>)?.pages as StorePage[]) ?? [];
    const savedMap = new Map(saved.map((p) => [p.slug, p]));

    // Merge defaults with saved
    return DEFAULT_PAGES.map((d) => savedMap.get(d.slug) ?? d);
}

const updatePageSchema = z.object({
    title: z.string().min(1).optional(),
    content: z.string().optional(),
    isPublished: z.boolean().optional(),
});

export async function updateStorePage(slug: string, input: { title?: string; content?: string; isPublished?: boolean }): Promise<{ success: boolean; error?: string }> {
    const validSlug = z.string().min(1).parse(slug);
    const data = updatePageSchema.parse(input);
    const { supabase, tenantId } = await getAuth();

    const { data: tenant } = await supabase.from("tenants").select("settings").eq("id", tenantId).single();
    const currentSettings = (tenant?.settings as Record<string, unknown>) ?? {};
    const pages = ((currentSettings.pages as StorePage[]) ?? []);

    const now = new Date().toISOString();
    const idx = pages.findIndex((p) => p.slug === validSlug);
    const defaultPage = DEFAULT_PAGES.find((d) => d.slug === validSlug);

    if (idx >= 0) {
        pages[idx] = { ...pages[idx], ...data, updatedAt: now };
    } else {
        pages.push({
            slug: validSlug,
            title: data.title ?? defaultPage?.title ?? validSlug,
            content: data.content ?? "",
            isPublished: data.isPublished ?? false,
            updatedAt: now,
        });
    }

    const { error } = await supabase
        .from("tenants")
        .update({ settings: { ...currentSettings, pages } })
        .eq("id", tenantId);

    if (error) {
        log.error("Failed to update page", { error: error.message, slug: validSlug });
        return { success: false, error: error.message };
    }

    revalidatePath("/dashboard/pages");
    return { success: true };
}
