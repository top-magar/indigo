"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ChevronRight, ExternalLink } from "lucide-react";
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
import { cn } from "@/shared/utils";
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
                "text-xs min-w-5 h-5",
                item.badgeVariant === "warning" && "bg-[var(--ds-amber-600)] text-white",
                item.badgeVariant === "success" && "bg-[var(--ds-green-600)] text-white",
                item.badgeVariant === "destructive" && "bg-[var(--ds-red-600)] text-white",
                !item.badgeVariant && "bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]"
            )}
        >
            {typeof item.badge === "number" && item.badge > 99 ? "99+" : item.badge}
        </SidebarMenuBadge>
    );

    const statusBadge = (item.soon || item.isNew) && !isCollapsed && (
        <Badge
            className={cn(
                "ml-auto text-xs py-0 px-2 h-5",
                item.isNew
                    ? "bg-[var(--ds-green-600)] hover:bg-[var(--ds-green-700)] text-white"
                    : "bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]"
            )}
        >
            {item.isNew ? "NEW" : "Soon…"}
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
                                "transition-colors duration-150 group/item h-11 sm:h-10 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1",
                                isActive && "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)] font-medium",
                                isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                            aria-current={isActive ? "page" : undefined}
                            aria-disabled={isDisabled}
                        >
                            {isDisabled ? (
                                <span className="flex items-center gap-2 w-full">
                                    <item.icon strokeWidth={1.5} className="h-4 w-4 shrink-0" />
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
                                    <item.icon
                                        strokeWidth={isActive ? 2 : 1.5}
                                        className={cn("h-4 w-4 shrink-0 transition-colors", isActive && "text-[var(--ds-blue-700)]")}
                                    />
                                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                                    {!isCollapsed && badgeContent}
                                    {!isCollapsed && statusBadge}
                                    {item.external && !isCollapsed && (
                                        <ExternalLink className="w-3 h-3 ml-auto text-[var(--ds-gray-600)]" />
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
                                    <Badge className={cn("text-xs py-0 px-2", item.badgeVariant === "warning" && "bg-[var(--ds-amber-600)] text-white", item.badgeVariant === "destructive" && "bg-[var(--ds-red-600)] text-white")}>
                                        {item.badge}
                                    </Badge>
                                )}
                                {item.soon && <Badge variant="secondary" className="text-xs py-0 px-1 bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]">Soon…</Badge>}
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    // Collapsed mode: dropdown menu with grouping
    if (isCollapsed) {
        const groupedChildrenCollapsed = item.children?.reduce((acc, child) => {
            const group = child.group || "default";
            if (!acc[group]) acc[group] = [];
            acc[group].push(child);
            return acc;
        }, {} as Record<string, typeof item.children>);

        const groupLabelsCollapsed: Record<string, string> = {
            store: "Store",
            commerce: "Commerce",
            team: "Team & Account",
            advanced: "Advanced",
        };

        const groupOrderCollapsed = ["store", "commerce", "team", "advanced", "default"];

        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton isActive={isActive} className={cn("transition-colors duration-150 h-11 sm:h-10 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1", isActive && "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)] font-medium")}>
                                    <item.icon strokeWidth={isActive ? 2 : 1.5} className={cn("h-4 w-4 shrink-0 transition-colors duration-150", isActive && "text-[var(--ds-blue-700)]")} />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={10}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && <Badge className="bg-[var(--ds-amber-600)] text-white text-[10px] py-0 px-1.5">{item.badge}</Badge>}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56 overscroll-contain">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            {item.title}
                            {item.badge && <Badge className="bg-[var(--ds-amber-600)] text-white text-xs py-0 px-2">{item.badge}</Badge>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {groupOrderCollapsed.map((groupKey, groupIndex) => {
                            const children = groupedChildrenCollapsed?.[groupKey];
                            if (!children || children.length === 0) return null;
                            
                            const showLabel = groupKey !== "default" && groupKey !== "store" && Object.keys(groupedChildrenCollapsed || {}).length > 1;
                            const showSeparator = groupIndex > 0 && showLabel;
                            
                            return (
                                <div key={groupKey}>
                                    {showSeparator && <DropdownMenuSeparator />}
                                    {showLabel && (
                                        <DropdownMenuLabel className="text-xs text-[var(--ds-gray-600)] font-medium py-1">
                                            {groupLabelsCollapsed[groupKey] || groupKey}
                                        </DropdownMenuLabel>
                                    )}
                                    {children.map((child) => {
                                        const childActive = pathname === child.href.split("?")[0] || (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                                        const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);
                                        return (
                                            <DropdownMenuItem key={child.id} asChild={!childDisabled} disabled={childDisabled} className={cn(childActive && "bg-[var(--ds-gray-100)] font-medium")}>
                                                {childDisabled ? (
                                                    <span className="flex items-center gap-2 w-full">
                                                        {child.title}
                                                        {child.soon && <Badge variant="secondary" className="text-xs py-0 px-1 h-5 ml-auto bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]">Soon…</Badge>}
                                                    </span>
                                                ) : (
                                                    <Link 
                                                        href={child.href} 
                                                        target={child.external ? "_blank" : undefined}
                                                        rel={child.external ? "noopener noreferrer" : undefined}
                                                        className="flex items-center gap-2 w-full"
                                                    >
                                                        {child.title}
                                                        {child.badge && <Badge className="ml-auto text-xs py-0 px-2 h-5 bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]">{child.badge}</Badge>}
                                                        {child.external && (
                                                            <ExternalLink className="w-3 h-3 ml-auto text-[var(--ds-gray-600)]" />
                                                        )}
                                                    </Link>
                                                )}
                                            </DropdownMenuItem>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    // Expanded mode: collapsible submenu with optional grouping
    const groupedChildren = item.children?.reduce((acc, child) => {
        const group = child.group || "default";
        if (!acc[group]) acc[group] = [];
        acc[group].push(child);
        return acc;
    }, {} as Record<string, typeof item.children>);

    const groupLabels: Record<string, string> = {
        store: "Store",
        commerce: "Commerce",
        team: "Team & Account",
        advanced: "Advanced",
    };

    const groupOrder = ["store", "commerce", "team", "advanced", "default"];

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isActive} className={cn("transition-colors duration-150 h-11 sm:h-10 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-[var(--ds-blue-600)] focus-visible:ring-offset-1", isActive && "bg-[var(--ds-blue-100)] text-[var(--ds-blue-700)] font-medium")}>
                        <item.icon strokeWidth={isActive ? 2 : 1.5} className={cn("h-4 w-4 shrink-0 transition-colors duration-150", isActive && "text-[var(--ds-blue-700)]")} />
                        <span className="truncate">{item.title}</span>
                        {badgeContent}
                        <ChevronRight className={cn("w-4 h-4 ml-auto transition-transform duration-200", isOpen && "rotate-90")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up motion-reduce:transition-none">
                    <SidebarMenuSub>
                        {groupOrder.map((groupKey) => {
                            const children = groupedChildren?.[groupKey];
                            if (!children || children.length === 0) return null;
                            
                            const showLabel = groupKey !== "default" && groupKey !== "store" && Object.keys(groupedChildren || {}).length > 1;
                            
                            return (
                                <div key={groupKey}>
                                    {showLabel && (
                                        <div className="px-2 py-1 mt-1">
                                            <span className="text-xs font-medium text-[var(--ds-gray-600)] uppercase tracking-wider">
                                                {groupLabels[groupKey] || groupKey}
                                            </span>
                                        </div>
                                    )}
                                    {children.map((child) => {
                                        const childActive = pathname === child.href.split("?")[0] || (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                                        const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);
                                        return (
                                            <SidebarMenuSubItem key={child.id}>
                                                <SidebarMenuSubButton asChild={!childDisabled} isActive={childActive} className={cn(childDisabled && "opacity-50 cursor-not-allowed pointer-events-none")}>
                                                    {childDisabled ? (
                                                        <span className="flex items-center gap-2">
                                                            {child.title}
                                                            {child.soon && <Badge variant="secondary" className="text-xs py-0 px-1 h-5 bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]">Soon…</Badge>}
                                                        </span>
                                                    ) : (
                                                        <Link 
                                                            href={child.href}
                                                            target={child.external ? "_blank" : undefined}
                                                            rel={child.external ? "noopener noreferrer" : undefined}
                                                            className="flex items-center gap-2 w-full"
                                                        >
                                                            {child.title}
                                                            {child.badge && <Badge className="ml-auto text-xs py-0 px-2 h-5 bg-[var(--ds-gray-200)] text-[var(--ds-gray-600)]">{child.badge}</Badge>}
                                                            {child.external && (
                                                                <ExternalLink className="w-3 h-3 ml-auto text-[var(--ds-gray-600)]" />
                                                            )}
                                                        </Link>
                                                    )}
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}
