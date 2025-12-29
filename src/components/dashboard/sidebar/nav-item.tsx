"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, LinkSquare01Icon } from "@hugeicons/core-free-icons";
import {
    SidebarMenuItem,
    SidebarMenuButton,
    SidebarMenuBadge,
    SidebarMenuSub,
    SidebarMenuSubItem,
    SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { canAccessItem } from "./navigation";
import type { NavItem, UserRole, PlanType } from "./types";

interface NavItemComponentProps {
    item: NavItem;
    isActive: boolean;
    isCollapsed: boolean;
    userRole: UserRole;
    planType: PlanType;
    pathname: string;
}

export function NavItemComponent({
    item,
    isActive,
    isCollapsed,
    userRole,
    planType,
    pathname,
}: NavItemComponentProps) {
    const [isOpen, setIsOpen] = useState(false);
    const hasChildren = item.children && item.children.length > 0;
    const canAccess = canAccessItem(item, userRole, planType);
    const isDisabled = item.disabled || item.soon || !canAccess;

    useEffect(() => {
        if (hasChildren && item.children?.some(child => pathname.startsWith(child.href.split("?")[0]))) {
            setIsOpen(true);
        }
    }, [pathname, hasChildren, item.children]);

    const badgeContent = item.badge && (
        <SidebarMenuBadge
            className={cn(
                "text-[10px] min-w-5 h-5",
                item.badgeVariant === "warning" && "bg-chart-4 text-primary-foreground",
                item.badgeVariant === "success" && "bg-chart-2 text-primary-foreground",
                item.badgeVariant === "destructive" && "bg-destructive text-destructive-foreground",
                !item.badgeVariant && "bg-muted text-muted-foreground"
            )}
        >
            {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
        </SidebarMenuBadge>
    );

    const statusBadge = (item.soon || item.isNew) && !isCollapsed && (
        <Badge
            className={cn(
                "ml-auto text-[9px] py-0 px-1.5 h-4",
                item.isNew
                    ? "bg-chart-2 hover:bg-chart-2/90 text-primary-foreground"
                    : "bg-muted text-muted-foreground"
            )}
        >
            {item.isNew ? "NEW" : "Soon"}
        </Badge>
    );

    // Simple item without children
    if (!hasChildren) {
        return (
            <SidebarMenuItem>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <SidebarMenuButton
                            asChild={!isDisabled}
                            isActive={isActive}
                            disabled={isDisabled}
                            className={cn(
                                "transition-all group/item",
                                isActive && "bg-primary/10 text-primary font-medium",
                                isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                            aria-current={isActive ? "page" : undefined}
                            aria-disabled={isDisabled}
                        >
                            {isDisabled ? (
                                <span className="flex items-center gap-2 w-full">
                                    <HugeiconsIcon icon={item.icon} strokeWidth={1.5} className="w-5 h-5 shrink-0" />
                                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                                    {!isCollapsed && statusBadge}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                    className="flex items-center gap-2 w-full"
                                >
                                    <HugeiconsIcon
                                        icon={item.icon}
                                        strokeWidth={isActive ? 2 : 1.5}
                                        className={cn("w-5 h-5 shrink-0 transition-colors", isActive && "text-primary")}
                                    />
                                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                                    {!isCollapsed && badgeContent}
                                    {!isCollapsed && statusBadge}
                                    {item.external && !isCollapsed && (
                                        <HugeiconsIcon icon={LinkSquare01Icon} className="w-3 h-3 ml-auto text-muted-foreground" />
                                    )}
                                </Link>
                            )}
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && (
                                    <Badge className={cn("text-[10px] py-0 px-1.5", item.badgeVariant === "warning" && "bg-chart-4", item.badgeVariant === "destructive" && "bg-destructive")}>
                                        {item.badge}
                                    </Badge>
                                )}
                                {item.soon && <Badge variant="secondary" className="text-[9px] py-0 px-1">Soon</Badge>}
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    // Collapsed mode: dropdown menu
    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton isActive={isActive} className={cn("transition-all", isActive && "bg-primary/10 text-primary font-medium")}>
                                    <HugeiconsIcon icon={item.icon} strokeWidth={isActive ? 2 : 1.5} className={cn("w-5 h-5 shrink-0 transition-colors", isActive && "text-primary")} />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && <Badge className="bg-chart-4 text-[10px] py-0 px-1.5">{item.badge}</Badge>}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-48">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            {item.title}
                            {item.badge && <Badge className="bg-chart-4 text-[10px] py-0 px-1.5">{item.badge}</Badge>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {item.children?.map((child) => {
                            const childActive = pathname === child.href.split("?")[0] || (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                            const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);
                            return (
                                <DropdownMenuItem key={child.id} asChild={!childDisabled} disabled={childDisabled} className={cn(childActive && "bg-accent font-medium")}>
                                    {childDisabled ? (
                                        <span className="flex items-center gap-2 w-full">
                                            {child.title}
                                            {child.soon && <Badge variant="secondary" className="text-[9px] py-0 px-1 h-4 ml-auto">Soon</Badge>}
                                        </span>
                                    ) : (
                                        <Link 
                                            href={child.href} 
                                            target={child.external ? "_blank" : undefined}
                                            rel={child.external ? "noopener noreferrer" : undefined}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            {child.title}
                                            {child.badge && <Badge className="ml-auto text-[9px] py-0 px-1.5 h-4">{child.badge}</Badge>}
                                            {child.external && (
                                                <HugeiconsIcon icon={LinkSquare01Icon} className="w-3 h-3 ml-auto text-muted-foreground" />
                                            )}
                                        </Link>
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    // Expanded mode: collapsible submenu
    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isActive} className={cn("transition-all", isActive && "bg-primary/10 text-primary font-medium")}>
                        <HugeiconsIcon icon={item.icon} strokeWidth={isActive ? 2 : 1.5} className={cn("w-5 h-5 shrink-0 transition-colors", isActive && "text-primary")} />
                        <span className="truncate">{item.title}</span>
                        {badgeContent}
                        <HugeiconsIcon icon={ArrowRight01Icon} className={cn("w-4 h-4 ml-auto transition-transform duration-200", isOpen && "rotate-90")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                        {item.children?.map((child) => {
                            const childActive = pathname === child.href.split("?")[0] || (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                            const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);
                            return (
                                <SidebarMenuSubItem key={child.id}>
                                    <SidebarMenuSubButton asChild={!childDisabled} isActive={childActive} className={cn(childDisabled && "opacity-50 cursor-not-allowed pointer-events-none")}>
                                        {childDisabled ? (
                                            <span className="flex items-center gap-2">
                                                {child.title}
                                                {child.soon && <Badge variant="secondary" className="text-[9px] py-0 px-1 h-4">Soon</Badge>}
                                            </span>
                                        ) : (
                                            <Link 
                                                href={child.href}
                                                target={child.external ? "_blank" : undefined}
                                                rel={child.external ? "noopener noreferrer" : undefined}
                                                className="flex items-center gap-2 w-full"
                                            >
                                                {child.title}
                                                {child.badge && <Badge className="ml-auto text-[9px] py-0 px-1.5 h-4">{child.badge}</Badge>}
                                                {child.external && (
                                                    <HugeiconsIcon icon={LinkSquare01Icon} className="w-3 h-3 ml-auto text-muted-foreground" />
                                                )}
                                            </Link>
                                        )}
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            );
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
