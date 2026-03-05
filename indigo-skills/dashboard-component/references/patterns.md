# Component Patterns

## Data Table Page
```tsx
// page.tsx — Server component
import { Suspense } from "react";
export default async function Page({ searchParams }) {
  // Auth check → redirect if no user
  // Fetch data via repository or server action
  // Pass to client component
  return <ClientComponent data={data} filters={params} />;
}

// loading.tsx — Skeleton
export default function Loading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-40" />
      </div>
      <Skeleton className="h-96" />
    </div>
  );
}
```

## Server Action Pattern
```tsx
"use server";
export async function createItem(formData: FormData) {
  // Validate with Zod
  // Perform mutation
  // Return typed result
  return { success: true, data: item };
  // Or: return { success: false, error: "message" };
}
```

## Status Badge
```tsx
<Badge className="bg-success/10 text-success">Active</Badge>
<Badge className="bg-destructive/10 text-destructive">Failed</Badge>
<Badge className="bg-warning/10 text-warning">Pending</Badge>
```

## Empty State
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-10 w-10 text-muted-foreground/50 mb-3" />
  <h3 className="text-sm font-medium text-foreground">No items yet</h3>
  <p className="text-sm text-muted-foreground mt-1">Get started by creating your first item.</p>
  <Button className="mt-4" size="sm">Create Item</Button>
</div>
```

## Card Layout
```tsx
<Card className="rounded-lg border">
  <CardHeader className="pb-3">
    <CardTitle className="text-sm font-medium">Title</CardTitle>
    <CardDescription className="text-xs text-muted-foreground">Description</CardDescription>
  </CardHeader>
  <CardContent className="space-y-3">
    {/* Content */}
  </CardContent>
</Card>
```

## Loading Button
```tsx
<Button disabled={isPending}>
  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
  {isPending ? "Saving…" : "Save"}
</Button>
```

## Stat Card
```tsx
<Card>
  <CardContent className="p-4">
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-xs text-muted-foreground font-medium">Label</span>
    </div>
    <p className="text-2xl font-semibold tabular-nums mt-1">{value}</p>
    <p className="text-xs text-muted-foreground mt-0.5">+12% from last month</p>
  </CardContent>
</Card>
```

## Keyboard Shortcut
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen(true);
    }
  };
  document.addEventListener("keydown", handler);
  return () => document.removeEventListener("keydown", handler);
}, []);
```
