"use client";

import Link from "next/link";
import { ChevronDown, User, Moon, Sun, Monitor } from "lucide-react";
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

const roleLabels: Record<UserRole, string> = { owner: "Owner", admin: "Admin", staff: "Staff" };
const roleColors: Record<UserRole, string> = { owner: "bg-info/10 text-info", admin: "bg-success/10 text-success", staff: "bg-muted text-muted-foreground" };
const avatarColors = ["bg-info", "bg-success", "bg-ds-teal-700", "bg-warning", "bg-ds-purple-700"];

const themeOptions = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "Auto", icon: Monitor },
] as const;

function UserAvatar({ name, avatarUrl, color }: { name: string; avatarUrl?: string | null; color: string }) {
    return (
        <div className={cn("flex shrink-0 items-center justify-center rounded-full text-primary-foreground font-medium text-xs h-8 w-8 shadow-sm overflow-hidden", color)}>
            {avatarUrl ? <img src={avatarUrl} alt={name} className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
        </div>
    );
}

export function UserMenu({ userEmail, userAvatarUrl, userFullName, userRole = "owner", isCollapsed, theme, setTheme }: UserMenuProps) {
    const displayName = userFullName || userEmail?.split("@")[0] || "User";
    const colorIndex = userEmail ? userEmail.charCodeAt(0) % avatarColors.length : 0;
    const avatarColor = avatarColors[colorIndex];

    const trigger = (
        <button
            className={cn(
                "group flex items-center rounded-lg text-left border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                isCollapsed ? "h-10 w-10 justify-center p-0 hover:bg-muted" : "w-full gap-3 p-2 hover:bg-muted hover:border-border active:scale-[0.99]"
            )}
            aria-label="User menu"
        >
            <UserAvatar name={displayName} avatarUrl={userAvatarUrl} color={avatarColor} />
            {!isCollapsed && (
                <>
                    <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-center gap-2">
                            <p className="text-xs font-semibold tracking-[-0.28px] text-foreground truncate">{displayName}</p>
                            <span className={cn("text-[10px] font-medium px-1.5 py-0.5 rounded-sm shrink-0", roleColors[userRole])}>{roleLabels[userRole]}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate">{userEmail}</p>
                    </div>
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                </>
            )}
        </button>
    );

    return (
        <DropdownMenu>
            {isCollapsed ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                        <p className="font-medium">{displayName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                    </TooltipContent>
                </Tooltip>
            ) : (
                <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
            )}
            <DropdownMenuContent align="end" side="right" sideOffset={12} className="w-56 overscroll-contain">
                <DropdownMenuItem asChild className="h-8 cursor-pointer">
                    <Link href="/dashboard/settings/account">
                        <User className="size-3.5 text-muted-foreground mr-2" />
                        Account Settings
                    </Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Theme Switcher */}
                <div className="p-1">
                    <div className="flex items-center gap-1" role="radiogroup" aria-label="Theme">
                        {themeOptions.map(({ value, label, icon: Icon }) => (
                            <button
                                key={value}
                                onClick={() => setTheme(value)}
                                className={cn(
                                    "flex-1 flex items-center justify-center gap-1.5 h-7 rounded-md text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                    theme === value ? "bg-foreground text-primary-foreground" : "text-muted-foreground hover:bg-muted"
                                )}
                                role="radio"
                                aria-checked={theme === value}
                            >
                                <Icon className="size-3.5" />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="h-8 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                    <SignOutButton />
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
