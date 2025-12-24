"use client";

import { useNode } from "@craftjs/core";
import { cn } from "@/lib/utils";
import { AnnouncementBarSettings } from "../settings/AnnouncementBarSettings";

export interface AnnouncementBarProps {
    text?: string;
    linkText?: string;
    linkUrl?: string;
    backgroundColor?: string;
    textColor?: string;
    dismissible?: boolean;
    icon?: "rocket" | "sparkle" | "tag" | "megaphone" | "none";
}

const ICONS = {
    rocket: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
    ),
    sparkle: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
    tag: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
        </svg>
    ),
    megaphone: (
        <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 110-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 01-1.44-4.282m3.102.069a18.03 18.03 0 01-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 018.835 2.535M10.34 6.66a23.847 23.847 0 008.835-2.535m0 0A23.74 23.74 0 0018.795 3m.38 1.125a23.91 23.91 0 011.014 5.395m-1.014 8.855c-.118.38-.245.754-.38 1.125m.38-1.125a23.91 23.91 0 001.014-5.395m0-3.46c.495.413.811 1.035.811 1.73 0 .695-.316 1.317-.811 1.73m0-3.46a24.347 24.347 0 010 3.46" />
        </svg>
    ),
    none: null,
};

export function AnnouncementBar({
    text = "🎉 Free shipping on orders over $50!",
    linkText = "Shop now",
    linkUrl = "/products",
    backgroundColor = "#18181b",
    textColor = "#ffffff",
    dismissible = true,
    icon = "sparkle",
}: AnnouncementBarProps) {
    const { connectors: { connect, drag }, selected } = useNode((state) => ({
        selected: state.events.selected,
    }));

    return (
        <div
            ref={(ref) => { if (ref) connect(drag(ref)); }}
            className={cn(
                "px-4 py-3 md:py-2 relative",
                selected && "ring-2 ring-primary ring-offset-2"
            )}
            style={{ backgroundColor, color: textColor }}
        >
            <div className="flex gap-2 md:items-center">
                <div className="flex grow gap-3 md:items-center md:justify-center">
                    {icon !== "none" && (
                        <span className="shrink-0 opacity-80 max-md:mt-0.5">
                            {ICONS[icon]}
                        </span>
                    )}
                    <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
                        <p className="text-sm">{text}</p>
                        {linkText && (
                            <a
                                href={linkUrl}
                                className="group whitespace-nowrap font-medium text-sm inline-flex items-center gap-1 hover:underline"
                            >
                                {linkText}
                                <svg
                                    className="size-4 transition-transform group-hover:translate-x-0.5"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

AnnouncementBar.craft = {
    displayName: "Announcement Bar",
    props: {
        text: "🎉 Free shipping on orders over $50!",
        linkText: "Shop now",
        linkUrl: "/products",
        backgroundColor: "#18181b",
        textColor: "#ffffff",
        dismissible: true,
        icon: "sparkle",
    },
    related: {
        settings: AnnouncementBarSettings,
    },
};
