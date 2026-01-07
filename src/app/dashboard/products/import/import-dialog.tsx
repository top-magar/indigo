"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    Upload01Icon,
    Download01Icon,
    CheckmarkCircle02Icon,
    Alert02Icon,
    Cancel01Icon,
    FileEditIcon,
    ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/shared/utils";
import { toast } from "sonner";
import { importProducts } from "./actions";

// Import result type
interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}

// Import product type
interface ImportProductData {
    name: string;
    sku?: string;
    price: string;
    compareAtPrice?: string;
    quantity: number;
    status: "draft" | "active" | "archived";
    category?: string;
    description?: string;
    images: string[];
}

interface ImportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: { id: string; name: string }[];
}

interface ParsedProduct {
    name: string;
    sku: string;
    price: string;
    compareAtPrice: string;
    quantity: string;
    status: string;
    category: string;
    description: string;
    images: string;
    valid: boolean;
    errors: string[];
}

type ImportStep = "upload" | "preview" | "importing" | "complete";

export function ImportDialog({ open, onOpenChange, categories }: ImportDialogProps) {
    const router = useRouter();
    const [step, setStep] = useState<ImportStep>("upload");
    const [file, setFile] = useState<File | null>(null);
    const [parsedProducts, setParsedProducts] = useState<ParsedProduct[]>([]);
    const [importProgress, setImportProgress] = useState(0);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const resetState = () => {
        setStep("upload");
        setFile(null);
        setParsedProducts([]);
        setImportProgress(0);
        setImportResult(null);
    };

    const handleClose = () => {
        resetState();
        onOpenChange(false);
    };

    // Download CSV template
    const downloadTemplate = () => {
        const headers = ["name", "sku", "price", "compare_at_price", "quantity", "status", "category", "description", "images"];
        const example = [
            "Example Product",
            "SKU-001",
            "1999",
            "2499",
            "100",
            "active",
            categories[0]?.name || "Uncategorized",
            "Product description here",
            "https://example.com/image1.jpg,https://example.com/image2.jpg"
        ];
        
        const csvContent = [headers.join(","), example.join(",")].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "product-import-template.csv";
        a.click();
        URL.revokeObjectURL(url);
    };

    // Parse CSV file
    const parseCSV = useCallback((content: string): ParsedProduct[] => {
        const lines = content.split("\n").filter(line => line.trim());
        if (lines.length < 2) return [];

        const headers = lines[0].split(",").map(h => h.trim().toLowerCase().replace(/"/g, ""));
        const products: ParsedProduct[] = [];

        for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            const product: ParsedProduct = {
                name: getValue(headers, values, "name"),
                sku: getValue(headers, values, "sku"),
                price: getValue(headers, values, "price"),
                compareAtPrice: getValue(headers, values, "compare_at_price"),
                quantity: getValue(headers, values, "quantity"),
                status: getValue(headers, values, "status") || "draft",
                category: getValue(headers, values, "category"),
                description: getValue(headers, values, "description"),
                images: getValue(headers, values, "images"),
                valid: true,
                errors: [],
            };

            // Validate
            if (!product.name) {
                product.valid = false;
                product.errors.push("Name is required");
            }
            if (!product.price || isNaN(Number(product.price))) {
                product.valid = false;
                product.errors.push("Valid price is required");
            }
            if (product.quantity && isNaN(Number(product.quantity))) {
                product.valid = false;
                product.errors.push("Quantity must be a number");
            }
            if (product.status && !["draft", "active", "archived"].includes(product.status)) {
                product.valid = false;
                product.errors.push("Status must be draft, active, or archived");
            }

            products.push(product);
        }

        return products;
    }, []);

    // Handle file selection
    const handleFileSelect = useCallback((selectedFile: File) => {
        if (!selectedFile.name.endsWith(".csv")) {
            toast.error("Please select a CSV file");
            return;
        }

        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            const products = parseCSV(content);
            setParsedProducts(products);
            setStep("preview");
        };
        reader.readAsText(selectedFile);
    }, [parseCSV]);

    // Handle drag and drop
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile) handleFileSelect(droppedFile);
    }, [handleFileSelect]);

    // Handle import
    const handleImport = async () => {
        const validProducts = parsedProducts.filter(p => p.valid);
        if (validProducts.length === 0) {
            toast.error("No valid products to import");
            return;
        }

        setStep("importing");
        setImportProgress(0);

        try {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setImportProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            const result = await importProducts(validProducts.map(p => ({
                name: p.name,
                sku: p.sku || undefined,
                price: p.price,
                compareAtPrice: p.compareAtPrice || undefined,
                quantity: p.quantity ? parseInt(p.quantity) : 0,
                status: p.status as "draft" | "active" | "archived",
                category: p.category || undefined,
                description: p.description || undefined,
                images: p.images ? p.images.split(",").map(url => url.trim()) : [],
            })));

            clearInterval(progressInterval);
            setImportProgress(100);
            setImportResult(result);
            setStep("complete");
            
            if (result.success > 0) {
                router.refresh();
            }
        } catch (error) {
            toast.error("Import failed");
            setStep("preview");
        }
    };

    const validCount = parsedProducts.filter(p => p.valid).length;
    const invalidCount = parsedProducts.filter(p => !p.valid).length;

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Import Products</DialogTitle>
                    <DialogDescription>
                        {step === "upload" && "Upload a CSV file to bulk import products"}
                        {step === "preview" && "Review products before importing"}
                        {step === "importing" && "Importing products..."}
                        {step === "complete" && "Import complete"}
                    </DialogDescription>
                </DialogHeader>

                {/* Upload Step */}
                {step === "upload" && (
                    <div className="space-y-4">
                        <label
                            className={cn(
                                "relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer block",
                                isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                            )}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                        >
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center">
                                    <HugeiconsIcon icon={Upload01Icon} className="w-6 h-6 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">Drop your CSV file here</p>
                                    <p className="text-sm text-muted-foreground">or click to browse</p>
                                </div>
                            </div>
                            <input
                                type="file"
                                accept=".csv"
                                className="sr-only"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                            />
                        </label>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                            <div className="flex items-center gap-3">
                                <HugeiconsIcon icon={FileEditIcon} className="w-5 h-5 text-muted-foreground" />
                                <div>
                                    <p className="text-sm font-medium">Need a template?</p>
                                    <p className="text-xs text-muted-foreground">Download our CSV template with example data</p>
                                </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={downloadTemplate}>
                                <HugeiconsIcon icon={Download01Icon} className="w-4 h-4 mr-2" />
                                Download
                            </Button>
                        </div>
                    </div>
                )}

                {/* Preview Step */}
                {step === "preview" && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Badge variant="secondary" className="bg-chart-2/10 text-chart-2 border-0">
                                {validCount} valid
                            </Badge>
                            {invalidCount > 0 && (
                                <Badge variant="secondary" className="bg-destructive/10 text-destructive border-0">
                                    {invalidCount} with errors
                                </Badge>
                            )}
                        </div>

                        <ScrollArea className="h-[300px] rounded-lg border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-8"></TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>SKU</TableHead>
                                        <TableHead>Price</TableHead>
                                        <TableHead>Qty</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {parsedProducts.map((product, index) => (
                                        <TableRow key={index} className={cn(!product.valid && "bg-destructive/5")}>
                                            <TableCell>
                                                {product.valid ? (
                                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 text-chart-2" />
                                                ) : (
                                                    <HugeiconsIcon icon={Alert02Icon} className="w-4 h-4 text-destructive" />
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div>
                                                    <span className="font-medium">{product.name || "-"}</span>
                                                    {!product.valid && (
                                                        <p className="text-xs text-destructive">{product.errors.join(", ")}</p>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{product.sku || "-"}</TableCell>
                                            <TableCell>{product.price || "-"}</TableCell>
                                            <TableCell>{product.quantity || "0"}</TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className="text-xs">
                                                    {product.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>

                        <div className="flex items-center justify-between pt-4">
                            <Button variant="outline" onClick={resetState}>
                                <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4 mr-2" />
                                Cancel
                            </Button>
                            <Button onClick={handleImport} disabled={validCount === 0}>
                                Import {validCount} products
                                <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Importing Step */}
                {step === "importing" && (
                    <div className="py-8 space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                <HugeiconsIcon icon={Upload01Icon} className="w-6 h-6 text-primary animate-pulse" />
                            </div>
                            <p className="font-medium">Importing products...</p>
                        </div>
                        <Progress value={importProgress} className="h-2" />
                        <p className="text-center text-sm text-muted-foreground">
                            {importProgress}% complete
                        </p>
                    </div>
                )}

                {/* Complete Step */}
                {step === "complete" && importResult && (
                    <div className="py-8 space-y-4">
                        <div className="flex flex-col items-center gap-4">
                            <div className={cn(
                                "h-12 w-12 rounded-xl flex items-center justify-center",
                                importResult.success > 0 ? "bg-chart-2/10" : "bg-destructive/10"
                            )}>
                                <HugeiconsIcon 
                                    icon={importResult.success > 0 ? CheckmarkCircle02Icon : Alert02Icon} 
                                    className={cn("w-6 h-6", importResult.success > 0 ? "text-chart-2" : "text-destructive")} 
                                />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">
                                    {importResult.success > 0 
                                        ? `Successfully imported ${importResult.success} products`
                                        : "Import failed"}
                                </p>
                                {importResult.failed > 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        {importResult.failed} products failed to import
                                    </p>
                                )}
                            </div>
                        </div>

                        {importResult.errors.length > 0 && (
                            <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                                <p className="text-sm font-medium text-destructive mb-2">Errors:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    {importResult.errors.slice(0, 5).map((error: string, i: number) => (
                                        <li key={i}>• {error}</li>
                                    ))}
                                    {importResult.errors.length > 5 && (
                                        <li>...and {importResult.errors.length - 5} more</li>
                                    )}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-center pt-4">
                            <Button onClick={handleClose}>
                                Done
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}

// Helper functions
function parseCSVLine(line: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function getValue(headers: string[], values: string[], key: string): string {
    const index = headers.indexOf(key);
    return index >= 0 ? values[index]?.replace(/^"|"$/g, "") || "" : "";
}
