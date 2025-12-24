"use client";

import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    ArrowLeft01Icon,
    ArrowRight01Icon,
    ArrowLeftDoubleIcon,
    ArrowRightDoubleIcon,
} from "@hugeicons/core-free-icons";

interface DataTablePaginationProps {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    selectedCount?: number;
}

export function DataTablePagination({
    pageIndex,
    pageSize,
    pageCount,
    totalItems,
    onPageChange,
    onPageSizeChange,
    selectedCount = 0,
}: DataTablePaginationProps) {
    const startItem = pageIndex * pageSize + 1;
    const endItem = Math.min((pageIndex + 1) * pageSize, totalItems);

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
                {selectedCount > 0 ? (
                    <span>{selectedCount} of {totalItems} row(s) selected</span>
                ) : (
                    <span>Showing {startItem}-{endItem} of {totalItems} items</span>
                )}
            </div>
            <div className="flex items-center gap-6 lg:gap-8">
                <div className="flex items-center gap-2">
                    <p className="text-sm font-medium hidden sm:block">Rows per page</p>
                    <Select
                        value={`${pageSize}`}
                        onValueChange={(value) => onPageSizeChange(Number(value))}
                    >
                        <SelectTrigger className="h-8 w-[70px]">
                            <SelectValue placeholder={pageSize} />
                        </SelectTrigger>
                        <SelectContent side="top">
                            {[10, 20, 30, 50, 100].map((size) => (
                                <SelectItem key={size} value={`${size}`}>
                                    {size}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-1">
                    <span className="text-sm font-medium hidden lg:block">
                        Page {pageIndex + 1} of {pageCount || 1}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(0)}
                        disabled={pageIndex === 0}
                    >
                        <HugeiconsIcon icon={ArrowLeftDoubleIcon} className="h-4 w-4" />
                        <span className="sr-only">First page</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(pageIndex - 1)}
                        disabled={pageIndex === 0}
                    >
                        <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
                        <span className="sr-only">Previous page</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(pageIndex + 1)}
                        disabled={pageIndex >= pageCount - 1}
                    >
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-4 w-4" />
                        <span className="sr-only">Next page</span>
                    </Button>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => onPageChange(pageCount - 1)}
                        disabled={pageIndex >= pageCount - 1}
                    >
                        <HugeiconsIcon icon={ArrowRightDoubleIcon} className="h-4 w-4" />
                        <span className="sr-only">Last page</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
