import type { LucideIcon } from "lucide-react";

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    position: number;
    isUploading?: boolean;
}

export interface ProductVariant {
    id: string;
    name: string;
    sku: string;
    price: string;
    compareAtPrice: string;
    quantity: string;
    weight: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface Collection {
    id: string;
    name: string;
    slug: string;
}

export interface ProductFormData {
    name: string;
    slug: string;
    description: string;
    categoryId: string;
    collectionIds: string[];
    brand: string;
    tags: string[];
    price: string;
    compareAtPrice: string;
    costPrice: string;
    sku: string;
    barcode: string;
    quantity: string;
    trackQuantity: boolean;
    allowBackorder: boolean;
    lowStockThreshold: string;
    weight: string;
    weightUnit: string;
    length: string;
    width: string;
    height: string;
    requiresShipping: boolean;
    images: ProductImage[];
    hasVariants: boolean;
    variants: ProductVariant[];
    metaTitle: string;
    metaDescription: string;
    status: "draft" | "active" | "archived";
    publishNow: boolean;
    publishDate: Date | undefined;
    publishTime: string;
}

export interface ProductFormErrors {
    [key: string]: string;
}

export interface SectionState {
    basic: boolean;
    media: boolean;
    pricing: boolean;
    shipping: boolean;
    variants: boolean;
    seo: boolean;
}

export const AUTOSAVE_KEY = "product_draft_autosave";
export const AUTOSAVE_INTERVAL = 30000;

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

export function generateId(): string {
    return Math.random().toString(36).substring(2, 15);
}

export const initialFormData: ProductFormData = {
    name: "",
    slug: "",
    description: "",
    categoryId: "",
    collectionIds: [],
    brand: "",
    tags: [],
    price: "",
    compareAtPrice: "",
    costPrice: "",
    sku: "",
    barcode: "",
    quantity: "0",
    trackQuantity: true,
    allowBackorder: false,
    lowStockThreshold: "5",
    weight: "",
    weightUnit: "g",
    length: "",
    width: "",
    height: "",
    requiresShipping: true,
    images: [],
    hasVariants: false,
    variants: [{ id: generateId(), name: "Default", sku: "", price: "", compareAtPrice: "", quantity: "0", weight: "" }],
    metaTitle: "",
    metaDescription: "",
    status: "draft",
    publishNow: true,
    publishDate: undefined,
    publishTime: "09:00",
};

export interface CollapsibleSectionProps {
    title: string;
    icon: LucideIcon;
    description?: string;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: React.ReactNode;
    iconColor?: "primary" | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "muted";
}
