"use client";

import Link from "next/link";
import { ChevronDown, User, Moon, Sun } from "lucide-react";
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
    owner: "bg-[var(--ds-blue-100)] text-[var(--ds-blue-800)]",
    admin: "bg-[var(--ds-green-100)] text-[var(--ds-green-800)]",
    staff: "bg-[var(--ds-gray-200)] text-[var(--ds-gray-700)]",
};

const avatarColors = [
    "bg-[var(--ds-blue-700)]",
    "bg-[var(--ds-green-700)]",
    "bg-[var(--ds-purple-700)]",
    "bg-[var(--ds-amber-700)]",
    "bg-[var(--ds-pink-700)]",
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
                "group flex items-center rounded-lg text-left border border-transparent",
                "transition-all duration-200 ease-out motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1",
                isCollapsed 
                    ? "h-10 w-10 justify-center p-0 hover:bg-[var(--ds-gray-100)]" 
                    : "w-full gap-3 p-2 hover:bg-[var(--ds-gray-100)] hover:border-[var(--ds-gray-200)] active:scale-[0.99]"
            )}
            aria-label="User menu"
        >
            <div className={cn(
                "relative flex shrink-0 items-center justify-center rounded-full text-white font-medium shadow-sm overflow-hidden",
                "transition-transform duration-150 active:scale-[0.98] motion-reduce:transform-none",
                avatarColor,
                isCollapsed ? "h-10 w-10 sm:h-8 sm:w-8 text-xs" : "h-10 w-10 text-sm"
            )}>
                {userAvatarUrl ? (
                    <img src={userAvatarUrl} alt={displayName} className="h-full w-full object-cover" />
                ) : (
                    initial
                )}
            </div>
            {!isCollapsed && (
                <div className="flex-1 min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-[var(--ds-gray-900)] truncate">{displayName}</p>
                        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-sm shrink-0", roleColors[userRole])}>
                            {roleLabels[userRole]}
                        </span>
                    </div>
                    <p className="text-xs text-[var(--ds-gray-600)] truncate">{userEmail}</p>
                </div>
            )}
            {!isCollapsed && (
                <ChevronDown className="h-4 w-4 shrink-0 text-[var(--ds-gray-500)] group-hover:text-[var(--ds-gray-700)] transition-colors duration-150" />
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
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-[var(--ds-gray-900)]">{displayName}</span>
                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-sm", roleColors[userRole])}>
                                    {roleLabels[userRole]}
                                </span>
                            </div>
                            <span className="text-xs text-[var(--ds-gray-600)]">{userEmail}</span>
                        </div>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-60 p-2 rounded-lg overscroll-contain">
                {/* Profile Header */}
                <div className="p-3 mb-2 rounded-md bg-[var(--ds-gray-100)]">
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-white font-semibold shadow-sm overflow-hidden",
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
                                <p className="text-sm font-semibold text-[var(--ds-gray-900)] truncate">{displayName}</p>
                                <span className={cn("text-xs font-medium px-2 py-0.5 rounded-sm", roleColors[userRole])}>
                                    {roleLabels[userRole]}
                                </span>
                            </div>
                            <p className="text-xs text-[var(--ds-gray-600)] truncate">{userEmail}</p>
                        </div>
                    </div>
                </div>

                <DropdownMenuItem asChild className="rounded-md px-3 h-10 cursor-pointer">
                    <Link href="/dashboard/settings/account">
                        <User className="h-4 w-4 text-[var(--ds-gray-600)] mr-3" />
                        <span className="text-[var(--ds-gray-800)]">Account Settings</span>
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-2" />

                {/* Theme Switcher */}
                <div className="px-3 py-2">
                    <div className="flex items-center gap-2" role="radiogroup" aria-label="Theme selection">
                        <button
                            onClick={() => setTheme("light")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs transition-colors duration-150",
                                "active:scale-[0.98] motion-reduce:transform-none",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]",
                                theme === "light"
                                    ? "bg-[var(--ds-gray-1000)] text-white"
                                    : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)]"
                            )}
                            role="radio"
                            aria-checked={theme === "light"}
                        >
                            <Sun className="h-4 w-4" />
                            Light
                        </button>
                        <button
                            onClick={() => setTheme("dark")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs transition-colors duration-150",
                                "active:scale-[0.98] motion-reduce:transform-none",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]",
                                theme === "dark"
                                    ? "bg-[var(--ds-gray-1000)] text-white"
                                    : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)]"
                            )}
                            role="radio"
                            aria-checked={theme === "dark"}
                        >
                            <Moon className="h-4 w-4" />
                            Dark
                        </button>
                        <button
                            onClick={() => setTheme("system")}
                            className={cn(
                                "flex-1 flex items-center justify-center gap-2 py-2 px-2 rounded-md text-xs transition-colors duration-150",
                                "active:scale-[0.98] motion-reduce:transform-none",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)]",
                                theme === "system"
                                    ? "bg-[var(--ds-gray-1000)] text-white"
                                    : "bg-[var(--ds-gray-100)] text-[var(--ds-gray-700)] hover:bg-[var(--ds-gray-200)]"
                            )}
                            role="radio"
                            aria-checked={theme === "system"}
                        >
                            Auto
                        </button>
                    </div>
                </div>

                <DropdownMenuSeparator className="my-2" />

                <DropdownMenuItem asChild className="rounded-md px-3 h-10 text-[var(--ds-red-700)] focus:text-[var(--ds-red-700)] focus:bg-[var(--ds-red-100)] cursor-pointer">
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
