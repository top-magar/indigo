//
// Attribute Types - Saleor-level attribute management types
//

// ============================================================================
// ATTRIBUTE INPUT TYPES
// ============================================================================

export type AttributeInputType =
    | "dropdown"        // Single selection from predefined values
    | "multiselect"     // Multiple selections from predefined values
    | "text"            // Plain text input
    | "rich_text"       // Rich text editor (HTML)
    | "numeric"         // Number with optional unit
    | "boolean"         // True/False checkbox
    | "date"            // Date picker
    | "datetime"        // Date and time picker
    | "file"            // File upload
    | "swatch"          // Color/image swatch
    | "reference";      // Reference to other entities

// ============================================================================
// ATTRIBUTE ENTITY TYPES (for reference attributes)
// ============================================================================

export type AttributeEntityType =
    | "product"
    | "product_variant"
    | "category"
    | "collection"
    | "page";

// ============================================================================
// NUMERIC UNITS
// ============================================================================

export type NumericUnit =
    // Weight
    | "g" | "kg" | "lb" | "oz"
    // Length
    | "cm" | "m" | "in" | "ft"
    // Volume
    | "ml" | "l" | "fl_oz" | "gal"
    // Area
    | "sq_cm" | "sq_m" | "sq_in" | "sq_ft"
    // Custom
    | "pcs" | "units" | "%";

export const NUMERIC_UNITS: { value: NumericUnit; label: string; category: string }[] = [
    // Weight
    { value: "g", label: "Grams (g)", category: "Weight" },
    { value: "kg", label: "Kilograms (kg)", category: "Weight" },
    { value: "lb", label: "Pounds (lb)", category: "Weight" },
    { value: "oz", label: "Ounces (oz)", category: "Weight" },
    // Length
    { value: "cm", label: "Centimeters (cm)", category: "Length" },
    { value: "m", label: "Meters (m)", category: "Length" },
    { value: "in", label: "Inches (in)", category: "Length" },
    { value: "ft", label: "Feet (ft)", category: "Length" },
    // Volume
    { value: "ml", label: "Milliliters (ml)", category: "Volume" },
    { value: "l", label: "Liters (l)", category: "Volume" },
    { value: "fl_oz", label: "Fluid Ounces (fl oz)", category: "Volume" },
    { value: "gal", label: "Gallons (gal)", category: "Volume" },
    // Other
    { value: "pcs", label: "Pieces", category: "Other" },
    { value: "units", label: "Units", category: "Other" },
    { value: "%", label: "Percentage (%)", category: "Other" },
];

// ============================================================================
// ATTRIBUTE VALUE TYPES
// ============================================================================

export interface AttributeValue {
    id: string;
    attributeId: string;
    name: string;
    slug: string;
    value?: string;           // For text values
    richText?: string;        // For rich text
    fileUrl?: string;         // For file uploads
    swatchColor?: string;     // For color swatches (hex)
    swatchImage?: string;     // For image swatches (url)
    sortOrder: number;
    createdAt: string;
}

export interface AttributeValueInput {
    name: string;
    slug?: string;
    value?: string;
    richText?: string;
    fileUrl?: string;
    swatchColor?: string;
    swatchImage?: string;
}

// ============================================================================
// MAIN ATTRIBUTE TYPE
// ============================================================================

export interface Attribute {
    id: string;
    tenantId: string;
    
    // Basic Info
    name: string;
    slug: string;
    
    // Configuration
    inputType: AttributeInputType;
    entityType?: AttributeEntityType | null;  // For reference type
    unit?: NumericUnit | null;                // For numeric type
    
    // Settings
    valueRequired: boolean;
    visibleInStorefront: boolean;
    filterableInStorefront: boolean;
    filterableInDashboard: boolean;
    
    // Usage
    usedInProductTypes: number;
    
    // Values (for dropdown, multiselect, swatch)
    values: AttributeValue[];
    
    // Metadata
    metadata?: Record<string, unknown>;
    
    // Timestamps
    createdAt: string;
    updatedAt: string;
}

// ============================================================================
// LIST ITEM TYPE
// ============================================================================

export interface AttributeListItem {
    id: string;
    name: string;
    slug: string;
    inputType: AttributeInputType;
    valueRequired: boolean;
    visibleInStorefront: boolean;
    filterableInStorefront: boolean;
    valuesCount: number;
    usedInProductTypes: number;
    createdAt: string;
}

// ============================================================================
// FORM INPUT TYPES
// ============================================================================

export interface CreateAttributeInput {
    name: string;
    slug?: string;
    inputType: AttributeInputType;
    entityType?: AttributeEntityType;
    unit?: NumericUnit;
    valueRequired?: boolean;
    visibleInStorefront?: boolean;
    filterableInStorefront?: boolean;
    filterableInDashboard?: boolean;
    values?: AttributeValueInput[];
}

export interface UpdateAttributeInput {
    name?: string;
    slug?: string;
    valueRequired?: boolean;
    visibleInStorefront?: boolean;
    filterableInStorefront?: boolean;
    filterableInDashboard?: boolean;
    unit?: NumericUnit;
}

// ============================================================================
// FILTER TYPES
// ============================================================================

export interface AttributeFilters {
    search?: string;
    inputType?: AttributeInputType | "all";
    filterableInStorefront?: boolean;
    sortBy?: "name" | "created_at" | "input_type";
    sortOrder?: "asc" | "desc";
}

// ============================================================================
// PRODUCT ATTRIBUTE ASSIGNMENT
// ============================================================================

export interface ProductAttributeValue {
    attributeId: string;
    attributeName: string;
    attributeSlug: string;
    inputType: AttributeInputType;
    values: {
        id?: string;
        name: string;
        value?: string;
        richText?: string;
        fileUrl?: string;
        swatchColor?: string;
        swatchImage?: string;
        numericValue?: number;
        booleanValue?: boolean;
        dateValue?: string;
        referenceId?: string;
    }[];
}

// ============================================================================
// STATS TYPES
// ============================================================================

export interface AttributeStats {
    total: number;
    dropdown: number;
    multiselect: number;
    text: number;
    numeric: number;
    boolean: number;
    swatch: number;
    other: number;
}

// ============================================================================
// INPUT TYPE CONFIG
// ============================================================================

export const INPUT_TYPE_CONFIG: Record<AttributeInputType, {
    label: string;
    description: string;
    hasValues: boolean;
    icon: string;
}> = {
    dropdown: {
        label: "Dropdown",
        description: "Single selection from predefined values",
        hasValues: true,
        icon: "ChevronDown",
    },
    multiselect: {
        label: "Multiple Select",
        description: "Multiple selections from predefined values",
        hasValues: true,
        icon: "CheckSquare",
    },
    text: {
        label: "Text",
        description: "Plain text input",
        hasValues: false,
        icon: "Type",
    },
    rich_text: {
        label: "Rich Text",
        description: "Rich text editor with formatting",
        hasValues: false,
        icon: "FileText",
    },
    numeric: {
        label: "Numeric",
        description: "Number with optional unit",
        hasValues: false,
        icon: "Hash",
    },
    boolean: {
        label: "Boolean",
        description: "Yes/No checkbox",
        hasValues: false,
        icon: "ToggleLeft",
    },
    date: {
        label: "Date",
        description: "Date picker",
        hasValues: false,
        icon: "Calendar",
    },
    datetime: {
        label: "Date & Time",
        description: "Date and time picker",
        hasValues: false,
        icon: "Clock",
    },
    file: {
        label: "File",
        description: "File upload",
        hasValues: false,
        icon: "Upload",
    },
    swatch: {
        label: "Swatch",
        description: "Color or image swatch",
        hasValues: true,
        icon: "Palette",
    },
    reference: {
        label: "Reference",
        description: "Link to other entities",
        hasValues: false,
        icon: "Link",
    },
};
