"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronsUpDown, User, Moon, Sun, Monitor, Bell, Shield, LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuSeparator,
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
const roleStyle: Record<UserRole, string> = {
    owner: "text-primary bg-primary/10",
    admin: "text-emerald-600 bg-emerald-500/10",
    staff: "text-muted-foreground bg-muted",
};
const avatarColors = ["bg-blue-600", "bg-emerald-600", "bg-violet-600", "bg-amber-600", "bg-rose-600"];

const themes = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
] as const;

export function UserMenu({ userEmail, userAvatarUrl, userFullName, userRole = "owner", isCollapsed, theme, setTheme }: UserMenuProps) {
    const name = userFullName || userEmail?.split("@")[0] || "User";
    const color = avatarColors[(userEmail?.charCodeAt(0) ?? 0) % avatarColors.length];

    const avatar = (
        <div className={cn("flex shrink-0 items-center justify-center rounded-full text-white font-medium text-xs size-8 overflow-hidden", color)}>
            {userAvatarUrl ? <Image src={userAvatarUrl} alt={name} fill className="object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
    );

    const trigger = (
        <button className={cn(
            "group flex items-center rounded-lg text-left transition-colors",
            isCollapsed ? "size-10 justify-center hover:bg-accent" : "w-full gap-2.5 px-2 py-1.5 hover:bg-accent"
        )} aria-label="User menu">
            {avatar}
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                            <p className="text-xs font-medium truncate leading-none">{name}</p>
                            <span className={cn("text-[10px] font-medium px-1 py-px rounded leading-none", roleStyle[userRole])}>
                                {roleLabel[userRole]}
                            </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate mt-0.5 leading-none">{userEmail}</p>
                    </div>
                    <ChevronsUpDown className="size-3 text-muted-foreground/50" />
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
                        <p className="text-xs font-medium">{name}</p>
                        <p className="text-[10px] text-muted-foreground">{userEmail}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="end" side={isCollapsed ? "right" : "top"} sideOffset={isCollapsed ? 12 : 4} className="w-56">
                {/* User info */}
                <div className="flex items-center gap-2.5 px-2 py-2">
                    {avatar}
                    <div className="min-w-0">
                        <p className="text-xs font-medium truncate">{name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                </div>
                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/settings/account"><User className="size-3.5 text-muted-foreground" /> Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/notifications"><Bell className="size-3.5 text-muted-foreground" /> Notifications</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="gap-2 text-xs">
                    <Link href="/dashboard/settings/team"><Shield className="size-3.5 text-muted-foreground" /> Team</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Theme switcher */}
                <div className="px-2 py-1.5">
                    <p className="text-[10px] text-muted-foreground/60 mb-1.5">Theme</p>
                    <div className="flex gap-0.5 rounded-lg border p-0.5">
                        {themes.map(({ value, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={cn(
                                    "flex-1 flex items-center justify-center h-7 rounded-md transition-all text-xs gap-1",
                                    theme === value
                                        ? "bg-accent text-accent-foreground shadow-sm"
                                        : "text-muted-foreground hover:text-foreground"
                                )}
                                aria-label={`${value} theme`}
                            >
                                <Icon className="size-3.5" />
                            </button>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="gap-2 text-xs text-destructive focus:text-destructive focus:bg-destructive/10">
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
