"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { useUrlFilters } from "@/shared/hooks";
import { toast } from "sonner";
import {
    Plus,
    Search,
    RefreshCw,
    MoreHorizontal,
    Eye,
    Trash2,
    Filter,
    Type,
    Hash,
    ListChecks,
    ToggleRight,
    Palette,
    type LucideIcon,
} from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/shared/utils";
import { CreateAttributeDialog } from "@/features/attributes/components";
import { bulkDeleteAttributes } from "./attribute-actions";
import { INPUT_TYPE_CONFIG } from "./types";
import type { AttributeListItem, AttributeStats } from "./types";

interface AttributesClientProps {
    attributes: AttributeListItem[];
    stats: AttributeStats;
    filters: {
        search?: string;
        inputType?: string;
        sortBy?: string;
        sortOrder?: string;
    };
}

const inputTypeIcons: Record<string, LucideIcon> = {
    dropdown: ListChecks,
    multiselect: ListChecks,
    text: Type,
    rich_text: Type,
    numeric: Hash,
    boolean: ToggleRight,
    swatch: Palette,
    date: Type,
    datetime: Type,
    file: Type,
    reference: Type,
};

export function AttributesClient({
    attributes,
    stats,
    filters,
}: AttributesClientProps) {
    const router = useRouter();

    const {
        searchValue,
        setSearchValue,
        setFilter,
        isPending,
    } = useUrlFilters();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [createDialogOpen, setCreateDialogOpen] = useState(false);

    const toggleSelectAll = () => {
        if (selectedIds.size === attributes.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(attributes.map(a => a.id)));
        }
    };

    const toggleSelect = (id: string) => {
        const newSelected = new Set(selectedIds);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedIds(newSelected);
    };

    const handleBulkDelete = async () => {
        const ids = Array.from(selectedIds);
        const result = await bulkDeleteAttributes(ids);
        
        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success(`Deleted ${result.deleted} attribute(s)`);
            setSelectedIds(new Set());
            router.refresh();
        }
    };

    return (
        <>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Attributes</h1>
                        <p className="text-muted-foreground">
                            Define custom product attributes like Size, Color, Material
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => router.refresh()}
                            disabled={isPending}
                        >
                            <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
                        </Button>
                        <Button onClick={() => setCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Attribute
                        </Button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Total</p>
                                    <p className="text-2xl font-bold">{stats.total}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                    <Filter className="w-5 h-5 text-chart-1" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Dropdown</p>
                                    <p className="text-2xl font-bold">{stats.dropdown}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                    <ListChecks className="w-5 h-5 text-chart-2" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Swatch</p>
                                    <p className="text-2xl font-bold">{stats.swatch}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-5/10 flex items-center justify-center">
                                    <Palette className="w-5 h-5 text-chart-5" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Other</p>
                                    <p className="text-2xl font-bold">{stats.text + stats.numeric + stats.boolean + stats.other}</p>
                                </div>
                                <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                    <Type className="w-5 h-5 text-chart-4" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex flex-1 items-center gap-2">
                                <div className="relative flex-1 max-w-sm">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                                    />
                                    <Input
                                        placeholder="Search attributes..."
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <Select
                                    value={filters.inputType || "all"}
                                    onValueChange={(value) => setFilter("inputType", value === "all" ? undefined : value)}
                                >
                                    <SelectTrigger className="w-[160px]">
                                        <SelectValue placeholder="Input Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        <SelectItem value="dropdown">Dropdown</SelectItem>
                                        <SelectItem value="multiselect">Multiselect</SelectItem>
                                        <SelectItem value="text">Text</SelectItem>
                                        <SelectItem value="numeric">Numeric</SelectItem>
                                        <SelectItem value="boolean">Boolean</SelectItem>
                                        <SelectItem value="swatch">Swatch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {selectedIds.size > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                        {selectedIds.size} selected
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive"
                                        onClick={handleBulkDelete}
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </Button>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Table */}
                <Card>
                    <CardContent className="p-0">
                        {attributes.length === 0 ? (
                            <EmptyState
                                icon={Filter}
                                title="No attributes found"
                                description={filters.search || filters.inputType
                                    ? "Try adjusting your filters."
                                    : "Create your first attribute to define product properties."}
                                action={!filters.search && !filters.inputType ? {
                                    label: "Create Attribute",
                                    onClick: () => setCreateDialogOpen(true),
                                } : undefined}
                                size="lg"
                                className="py-16"
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent">
                                        <TableHead className="w-12">
                                            <Checkbox
                                                checked={selectedIds.size === attributes.length && attributes.length > 0}
                                                onCheckedChange={toggleSelectAll}
                                                aria-label="Select all"
                                            />
                                        </TableHead>
                                        <TableHead>Attribute</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead className="text-center">Values</TableHead>
                                        <TableHead className="hidden md:table-cell">Storefront</TableHead>
                                        <TableHead className="hidden lg:table-cell">Created</TableHead>
                                        <TableHead className="w-12"></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {attributes.map((attribute) => {
                                        const config = INPUT_TYPE_CONFIG[attribute.inputType];
                                        const Icon = inputTypeIcons[attribute.inputType] || Type;
                                        
                                        return (
                                            <TableRow
                                                key={attribute.id}
                                                className={cn(
                                                    "group cursor-pointer",
                                                    selectedIds.has(attribute.id) && "bg-muted/50"
                                                )}
                                                onClick={() => router.push(`/dashboard/attributes/${attribute.id}`)}
                                            >
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <Checkbox
                                                        checked={selectedIds.has(attribute.id)}
                                                        onCheckedChange={() => toggleSelect(attribute.id)}
                                                        aria-label={`Select ${attribute.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <p className="font-medium">{attribute.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {attribute.slug}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Icon className="w-4 h-4 text-muted-foreground" />
                                                        <span>{config.label}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    {config.hasValues ? (
                                                        <Badge variant="secondary">{attribute.valuesCount}</Badge>
                                                    ) : (
                                                        <span className="text-muted-foreground">-</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="hidden md:table-cell">
                                                    <div className="flex items-center gap-2">
                                                        {attribute.visibleInStorefront && (
                                                            <Badge variant="outline" className="text-xs">Visible</Badge>
                                                        )}
                                                        {attribute.filterableInStorefront && (
                                                            <Badge variant="outline" className="text-xs">Filterable</Badge>
                                                        )}
                                                        {!attribute.visibleInStorefront && !attribute.filterableInStorefront && (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="hidden lg:table-cell text-muted-foreground">
                                                    {format(new Date(attribute.createdAt), "MMM d, yyyy")}
                                                </TableCell>
                                                <TableCell onClick={(e) => e.stopPropagation()}>
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 opacity-0 group-hover:opacity-100"
                                                            >
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48">
                                                            <DropdownMenuItem asChild>
                                                                <Link href={`/dashboard/attributes/${attribute.id}`}>
                                                                    <Eye className="w-4 h-4 mr-2" />
                                                                    View Details
                                                                </Link>
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <CreateAttributeDialog
                open={createDialogOpen}
                onOpenChange={setCreateDialogOpen}
            />
        </>
    );
}
