import Link from "next/link";

export default function AdminNotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-4xl font-semibold tabular-nums">404</p>
      <p className="text-sm text-muted-foreground">Page not found</p>
      <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground underline">Back to overview</Link>
    </div>
  );
}
