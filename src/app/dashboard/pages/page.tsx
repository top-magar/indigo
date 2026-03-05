import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/auth";
import { getStorePages } from "./actions";
import { PagesClient } from "./pages-client";

export const metadata: Metadata = {
    title: "Pages | Dashboard",
    description: "Manage your store's static pages.",
};

export default async function PagesPage() {
    const { user } = await getAuthenticatedClient();
    if (!user) redirect("/login");

    const pages = await getStorePages();

    return <PagesClient initialPages={pages} />;
}
