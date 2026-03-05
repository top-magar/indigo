export interface StockAdjustment {
    productId: string;
    type: "add" | "remove" | "set" | "transfer";
    quantity: number;
    reason: string;
    notes?: string;
    reference?: string;
}

export interface InventoryProduct {
    id: string;
    name: string;
    slug: string;
    sku: string | null;
    barcode: string | null;
    quantity: number;
    track_quantity: boolean;
    allow_backorder: boolean;
    price: number;
    cost_price: number | null;
    status: "draft" | "active" | "archived";
    images: { url: string; alt: string }[];
    category_id: string | null;
    category_name: string | null;
    reorder_point: number;
    reorder_quantity: number;
    last_restock_date: string | null;
    updated_at: string;
}

export interface StockMovement {
    id: string;
    product_id: string;
    product_name: string;
    type: "add" | "remove" | "set" | "sale" | "return" | "adjustment" | "transfer";
    quantity_before: number;
    quantity_change: number;
    quantity_after: number;
    reason: string;
    notes: string | null;
    reference: string | null;
    created_by: string | null;
    created_at: string;
}
