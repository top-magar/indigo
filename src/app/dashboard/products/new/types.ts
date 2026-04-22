import type { LucideIcon } from "lucide-react";

export interface ProductImage {
    id: string;
    url: string;
    alt: string;
    position: number;
    isUploading?: boolean;
}

/** A product option like "Color" or "Size" */
export interface ProductOption {
    id: string;
    title: string;
    values: string[];
}

/** A variant auto-generated from option combinations */
export interface ProductVariant {
    id: string;
    title: string;
    options: Record<string, string>;
    sku: string;
    price: string;
    compareAtPrice: string;
    costPrice: string;
    quantity: string;
    manageInventory: boolean;
    allowBackorder: boolean;
    enabled: boolean; // can uncheck to skip creating this variant
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
    // Step 1: Details
    name: string;
    subtitle: string;
    slug: string;
    description: string;
    images: ProductImage[];
    hasVariants: boolean;
    options: ProductOption[];
    // Step 2: Organize
    categoryId: string;
    collectionIds: string[];
    brand: string;
    tags: string[];
    discountable: boolean;
    requiresShipping: boolean;
    weight: string;
    weightUnit: string;
    metaTitle: string;
    metaDescription: string;
    // Step 3: Variants (bulk editor)
    variants: ProductVariant[];
    // Sidebar
    status: "draft" | "active" | "archived";
    publishNow: boolean;
    publishDate: Date | undefined;
    publishTime: string;
}

export interface ProductFormErrors {
    [key: string]: string;
}

export type WizardStep = 0 | 1 | 2;

export const STEP_LABELS = ["Details", "Organize", "Pricing"] as const;

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

/** Generate all variant combinations from options */
export function generateVariantsFromOptions(options: ProductOption[]): ProductVariant[] {
    const activeOptions = options.filter(o => o.title && o.values.length > 0);
    if (activeOptions.length === 0) {
        return [createDefaultVariant("Default")];
    }

    const combinations = cartesian(activeOptions.map(o => o.values));
    return combinations.map(combo => {
        const optionMap: Record<string, string> = {};
        activeOptions.forEach((opt, i) => {
            optionMap[opt.title] = combo[i];
        });
        const title = combo.join(" / ");
        return createDefaultVariant(title, optionMap);
    });
}

function createDefaultVariant(title: string, options: Record<string, string> = {}): ProductVariant {
    return {
        id: generateId(),
        title,
        options,
        sku: "",
        price: "",
        compareAtPrice: "",
        costPrice: "",
        quantity: "0",
        manageInventory: true,
        allowBackorder: false,
        enabled: true,
    };
}

function cartesian(arrays: string[][]): string[][] {
    if (arrays.length === 0) return [[]];
    return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap(a => curr.map(v => [...a, v])),
        [[]]
    );
}

export const initialFormData: ProductFormData = {
    name: "",
    subtitle: "",
    slug: "",
    description: "",
    images: [],
    hasVariants: false,
    options: [],
    categoryId: "",
    collectionIds: [],
    brand: "",
    tags: [],
    discountable: true,
    requiresShipping: true,
    weight: "",
    weightUnit: "g",
    metaTitle: "",
    metaDescription: "",
    variants: [createDefaultVariant("Default")],
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
    iconColor?: "primary" | "info" | "success" | "teal" | "warning" | "purple" | "muted";
}
