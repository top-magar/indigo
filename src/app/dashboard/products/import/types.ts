export interface ImportProduct {
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

export interface ImportResult {
    success: number;
    failed: number;
    errors: string[];
}
