"use client";

import Link from "next/link";
import { ChevronDown, User, Moon, Sun, Monitor, Bell, Shield, HelpCircle, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
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

const roleLabel: Record<UserRole, string> = { owner: "Owner", admin: "Admin", staff: "Staff" };
const roleStyle: Record<UserRole, string> = { owner: "text-blue-500 bg-blue-500/10", admin: "text-emerald-500 bg-emerald-500/10", staff: "text-muted-foreground bg-muted" };
const avatarColors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600"];

const themes = [
    { value: "light", icon: Sun },
    { value: "dark", icon: Moon },
    { value: "system", icon: Monitor },
] as const;

function Avatar({ name, url, color }: { name: string; url?: string | null; color: string }) {
    return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-full text-white font-medium text-xs size-8 overflow-hidden", color)}>
            {url ? <img src={url} alt={name} className="size-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
    );
}

export function UserMenu({ userEmail, userAvatarUrl, userFullName, userRole = "owner", isCollapsed, theme, setTheme }: UserMenuProps) {
    const name = userFullName || userEmail?.split("@")[0] || "User";
    const color = avatarColors[(userEmail?.charCodeAt(0) ?? 0) % avatarColors.length];

    const trigger = (
        <button
            className={cn(
                "group flex items-center rounded-lg text-left transition-colors",
                isCollapsed ? "size-10 justify-center hover:bg-muted" : "w-full gap-3 p-2 hover:bg-muted"
            )}
            aria-label="User menu"
        >
            <Avatar name={name} url={userAvatarUrl} color={color} />
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold truncate">{name}</p>
                            <span className={cn("text-[10px] font-medium px-1 py-px rounded", roleStyle[userRole])}>{roleLabel[userRole]}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <ChevronDown className="size-3 text-muted-foreground" />
                </>
            )}
        </button>
    );

    return (
        <DropdownMenu>
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild><DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger></TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                        <p className="font-medium text-xs">{name}</p>
                        <p className="text-[10px] text-muted-foreground">{userEmail}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-52">
                {/* Header */}
                <div className="px-2 py-1.5">
                    <p className="text-xs font-medium truncate">{name}</p>
                    <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings/account"><User className="size-4 text-muted-foreground" />Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings/notifications"><Bell className="size-4 text-muted-foreground" />Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs cursor-pointer">
                    <Link href="/dashboard/settings/team"><Shield className="size-4 text-muted-foreground" />Team</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Theme */}
                <DropdownMenuLabel className="text-[10px] text-muted-foreground font-normal">Appearance</DropdownMenuLabel>
                <div className="px-1 pb-1">
                    <div className="flex gap-0.5 rounded-md border p-0.5" role="radiogroup" aria-label="Theme">
                        {themes.map(({ value, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={cn(
                                    "flex-1 flex items-center justify-center h-6 rounded transition-colors text-xs gap-1",
                                    theme === value ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                                role="radio"
                                aria-checked={theme === value}
                            >
                                <Icon className="size-3.5" />
                            </button>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
