"use client";

import Link from "next/link";
import { useState, useEffect, memo } from "react";
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
                item.badgeVariant === "warning" && "bg-warning/15 text-warning",
                item.badgeVariant === "success" && "bg-success/15 text-success",
                item.badgeVariant === "destructive" && "bg-destructive text-primary-foreground",
                !item.badgeVariant && "bg-muted text-muted-foreground"
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
                    ? "bg-success/15 hover:bg-success/20 text-success"
                    : "bg-muted text-muted-foreground"
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
                                "transition-colors duration-150 group/item h-8 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                                isActive && "bg-info/10 text-info font-medium",
                                isDisabled && "opacity-50 cursor-not-allowed"
                            )}
                            aria-current={isActive ? "page" : undefined}
                            aria-disabled={isDisabled}
                        >
                            {isDisabled ? (
                                <span className="flex items-center gap-2 w-full">
                                    <item.icon strokeWidth={1.5} className="size-4 shrink-0" />
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
                                        className={cn("size-4 shrink-0 transition-colors", isActive && "text-info")}
                                    />
                                    {!isCollapsed && <span className="truncate">{item.title}</span>}
                                    {!isCollapsed && badgeContent}
                                    {!isCollapsed && statusBadge}
                                    {item.external && !isCollapsed && (
                                        <ExternalLink className="size-3.5 ml-auto text-muted-foreground" />
                                    )}
                                </Link>
                            )}
                        </SidebarMenuButton>
                    </TooltipTrigger>
                    {isCollapsed && (
                        <TooltipContent side="right" sideOffset={12}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && (
                                    <Badge className={cn("text-xs py-0 px-2", item.badgeVariant === "warning" && "bg-warning/15 text-warning", item.badgeVariant === "destructive" && "bg-destructive text-primary-foreground")}>
                                        {item.badge}
                                    </Badge>
                                )}
                                {item.soon && <Badge variant="secondary" className="text-xs py-0 px-1 bg-muted text-muted-foreground">Soon…</Badge>}
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </SidebarMenuItem>
        );
    }

    // Collapsed mode: dropdown menu with grouping
    if (isCollapsed) {
        return (
            <SidebarMenuItem>
                <DropdownMenu>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton isActive={isActive} className={cn("transition-colors duration-150 h-8 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1", isActive && "bg-info/10 text-info font-medium")}>
                                    <item.icon strokeWidth={isActive ? 2 : 1.5} className={cn("size-4 shrink-0 transition-colors duration-150", isActive && "text-info")} />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={12}>
                            <div className="flex items-center gap-2">
                                {item.title}
                                {item.badge && <Badge className="bg-warning/15 text-warning text-[10px] py-0 px-1.5 tabular-nums">{item.badge}</Badge>}
                            </div>
                        </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent side="right" align="start" sideOffset={8} className="w-56 overscroll-contain">
                        <DropdownMenuLabel className="flex items-center gap-2">
                            {item.title}
                            {item.badge && <Badge className="bg-warning/15 text-warning text-xs py-0 px-2">{item.badge}</Badge>}
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {(() => {
                            const groups = new Map<string, typeof item.children>();
                            for (const child of item.children ?? []) {
                                const g = child.group || "default";
                                if (!groups.has(g)) groups.set(g, []);
                                groups.get(g)!.push(child);
                            }
                            const labels: Record<string, string> = { commerce: "Commerce", account: "Account" };
                            return Array.from(groups.entries()).map(([group, children], gi) => (
                                <div key={group}>
                                    {gi > 0 && labels[group] && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuLabel className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider py-1">{labels[group]}</DropdownMenuLabel>
                                        </>
                                    )}
                                    {children!.map((child) => {
                            const childActive = pathname === child.href.split("?")[0] || (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                            const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);
                            return (
                                <DropdownMenuItem key={child.id} asChild={!childDisabled} disabled={childDisabled} className={cn(childActive && "bg-muted font-medium")}>
                                    {childDisabled ? (
                                        <span className="flex items-center gap-2 w-full">
                                            {child.title}
                                            {child.soon && <Badge variant="secondary" className="text-xs py-0 px-1 h-5 ml-auto bg-muted text-muted-foreground">Soon…</Badge>}
                                        </span>
                                    ) : (
                                        <Link 
                                            href={child.href} 
                                            target={child.external ? "_blank" : undefined}
                                            rel={child.external ? "noopener noreferrer" : undefined}
                                            className="flex items-center gap-2 w-full"
                                        >
                                            {child.title}
                                            {child.badge && <Badge className="ml-auto text-xs py-0 px-2 h-5 bg-muted text-muted-foreground tabular-nums">{child.badge}</Badge>}
                                            {child.external && (
                                                <ExternalLink className="size-3.5 ml-auto text-muted-foreground" />
                                            )}
                                        </Link>
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                                </div>
                            ));
                        })()}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        );
    }

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="group/collapsible">
            <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton isActive={isActive} className={cn("transition-colors duration-150 h-8 active:scale-[0.98] motion-reduce:transform-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1", isActive && "bg-info/10 text-info font-medium")}>
                        <item.icon strokeWidth={isActive ? 2 : 1.5} className={cn("size-4 shrink-0 transition-colors duration-150", isActive && "text-info")} />
                        <span className="truncate">{item.title}</span>
                        {badgeContent}
                        <ChevronRight className={cn("size-4 ml-auto transition-transform duration-200", isOpen && "rotate-90")} />
                    </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up motion-reduce:transition-none">
                    <SidebarMenuSub>
                        {(() => {
                            const groups = new Map<string, typeof item.children>();
                            for (const child of item.children ?? []) {
                                const g = child.group || "default";
                                if (!groups.has(g)) groups.set(g, []);
                                groups.get(g)!.push(child);
                            }
                            const labels: Record<string, string> = { commerce: "Commerce", account: "Account" };
                            return Array.from(groups.entries()).map(([group, children], gi) => (
                                <div key={group}>
                                    {gi > 0 && labels[group] && (
                                        <div className="px-2 py-1 mt-1">
                                            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{labels[group]}</span>
                                        </div>
                                    )}
                                    {children!.map((child) => {
                            const childActive = pathname === child.href.split("?")[0] || (child.href !== "/dashboard/products" && pathname.startsWith(child.href.split("?")[0]));
                            const childDisabled = child.disabled || child.soon || !canAccessItem(child, userRole, planType);
                            return (
                                <SidebarMenuSubItem key={child.id}>
                                    <SidebarMenuSubButton asChild={!childDisabled} isActive={childActive} className={cn(childDisabled && "opacity-50 cursor-not-allowed pointer-events-none")}>
                                        {childDisabled ? (
                                            <span className="flex items-center gap-2">
                                                {child.title}
                                                {child.soon && <Badge variant="secondary" className="text-xs py-0 px-1 h-5 bg-muted text-muted-foreground">Soon…</Badge>}
                                            </span>
                                        ) : (
                                            <Link 
                                                href={child.href}
                                                target={child.external ? "_blank" : undefined}
                                                rel={child.external ? "noopener noreferrer" : undefined}
                                                className="flex items-center gap-2 w-full"
                                            >
                                                {child.title}
                                                {child.badge && <Badge className="ml-auto text-xs py-0 px-2 h-5 bg-muted text-muted-foreground tabular-nums">{child.badge}</Badge>}
                                                {child.external && (
                                                    <ExternalLink className="size-3.5 ml-auto text-muted-foreground" />
                                                )}
                                            </Link>
                                        )}
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            );
                        })}
                                </div>
                            ));
                        })()}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </SidebarMenuItem>
        </Collapsible>
    );
}

export default memo(NavItemComponent);
