import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthenticatedClient } from "@/lib/auth";
import { getGiftCards } from "./actions";
import { GiftCardsClient } from "./gift-cards-client";

export const metadata: Metadata = {
    title: "Gift Cards | Dashboard",
    description: "Manage gift cards and balances.",
};

export default async function GiftCardsPage() {
    const { user } = await getAuthenticatedClient();
    if (!user) redirect("/login");

    const { cards, stats } = await getGiftCards();

    return <GiftCardsClient initialCards={cards} initialStats={stats} currency="NPR" />;
}
