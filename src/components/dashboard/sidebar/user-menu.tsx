"use client";

import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowDown01Icon,
    UserIcon,
    Moon02Icon,
    Sun01Icon,
} from "@hugeicons/core-free-icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/shared/utils";
import { SignOutButton } from "../layout/sign-out-button";
import type { UserRole } from "./types";

interface UserMenuProps {
    userEmail: string | null | undefined;
    userAvatarUrl?: string | null;
    userFullName?: string | null;
    userRole?: UserRole;
    isCollapsed: boolean;
    theme?: string;
    setTheme: (theme: string) => void;
}

const roleLabels: Record<UserRole, string> = {
    owner: "Owner",
    admin: "Admin",
    staff: "Staff",
};

const roleColors: Record<UserRole, string> = {
    owner: "bg-chart-1/15 text-chart-1",
    admin: "bg-chart-2/15 text-chart-2",
    staff: "bg-muted text-muted-foreground",
};

const avatarColors = [
    "from-chart-1 to-chart-1/70",
    "from-chart-2 to-chart-2/70",
    "from-chart-3 to-chart-3/70",
    "from-chart-4 to-chart-4/70",
    "from-chart-5 to-chart-5/70",
];

export function UserMenu({
    userEmail,
    userAvatarUrl,
    userFullName,
    userRole = "owner",
    isCollapsed,
    theme,
    setTheme,
}: UserMenuProps) {
    const displayName = userFullName || userEmail?.split("@")[0] || "User";
    const initial = (userFullName?.charAt(0) || userEmail?.charAt(0) || "U").toUpperCase();
    const colorIndex = userEmail ? userEmail.charCodeAt(0) % avatarColors.length : 0;
    const avatarColor = avatarColors[colorIndex];

    const triggerButton = (
        <button
            className={cn(
                "group flex w-full items-center gap-3 rounded-xl p-2 transition-all text-left border border-transparent",
                !isCollapsed && "hover:bg-accent/60 hover:border-border/50",
                isCollapsed && "justify-center p-1.5 rounded-lg hover:bg-accent/60"
            )}
            aria-label="User menu"
        >
            <div className={cn(
                "relative flex shrink-0 items-center justify-center rounded-full bg-linear-to-br text-primary-foreground font-medium shadow-lg transition-all overflow-hidden",
                avatarColor,
                isCollapsed ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
            )}>
                {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                    initial
                )}
            </div>
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold truncate">{displayName}</p>
                            <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", roleColors[userRole])}>
                                {roleLabels[userRole]}
                            </span>
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <div className="p-1.5 rounded-md group-hover:bg-muted transition-colors">
                        <HugeiconsIcon icon={ArrowDown01Icon} className="w-4 h-4 text-muted-foreground" />
                    </div>
                </>
            )}
        </button>
    );

    return (
        <DropdownMenu>
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                        <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{displayName}</span>
                                <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", roleColors[userRole])}>
                                    {roleLabels[userRole]}
                                </span>
                            </div>
                            <span className="text-xs text-muted-foreground">{userEmail}</span>
                        </div>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-[240px] p-1.5 rounded-xl">
                {/* Profile Header */}
                <div className="p-3 mb-1 mx-0.5 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full bg-linear-to-br text-primary-foreground font-bold shadow-md overflow-hidden",
                            avatarColor
                        )}>
                            {userAvatarUrl ? (
                                <img src={userAvatarUrl} alt={displayName} className="h-full w-full object-cover" />
                            ) : (
                                initial
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold truncate">{displayName}</p>
                                <span className={cn("text-[9px] font-medium px-1.5 py-0.5 rounded", roleColors[userRole])}>
                                    {roleLabels[userRole]}
                                </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>

                <DropdownMenuItem asChild className="rounded-lg mx-0.5 px-2.5 h-9 cursor-pointer">
                    <Link href="/dashboard/settings/account">
                        <HugeiconsIcon icon={UserIcon} className="w-4 h-4 text-muted-foreground mr-2.5" />
                        Account Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                {/* Theme Switcher */}
                <div className="mx-0.5 px-2.5 py-2">
                    <div className="flex items-center gap-1.5" role="radiogroup" aria-label="Theme selection">
                        <button
                            onClick={() => setTheme("light")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all",
                                theme === "light" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                            )}
                            role="radio"
                            aria-checked={theme === "light"}
                        >
                            <HugeiconsIcon icon={Sun01Icon} className="w-3.5 h-3.5" />
                            Light
                        </button>
                        <button
                            onClick={() => setTheme("dark")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all",
                                theme === "dark" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                            )}
                            role="radio"
                            aria-checked={theme === "dark"}
                        >
                            <HugeiconsIcon icon={Moon02Icon} className="w-3.5 h-3.5" />
                            Dark
                        </button>
                        <button
                            onClick={() => setTheme("system")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs transition-all",
                                theme === "system" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                            )}
                            role="radio"
                            aria-checked={theme === "system"}
                        >
                            Auto
                        </button>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-1.5 mx-0.5" />

                <DropdownMenuItem asChild className="rounded-lg mx-0.5 px-2.5 h-9 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
