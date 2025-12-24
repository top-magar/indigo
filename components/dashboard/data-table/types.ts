export interface DataTableFilterOption {
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
    count?: number;
}

export interface DataTableSearchableColumn {
    id: string;
    title: string;
}

export interface DataTableFilterableColumn {
    id: string;
    title: string;
    options: DataTableFilterOption[];
}
