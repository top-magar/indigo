import { ShieldAlert } from "lucide-react";

export default function SuspendedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-3 max-w-sm px-4">
        <ShieldAlert className="size-10 text-destructive mx-auto" />
        <h1 className="text-lg font-semibold tracking-tight">Account Suspended</h1>
        <p className="text-sm text-muted-foreground">
          Your store has been suspended by the platform administrator. 
          Please contact support to resolve this issue.
        </p>
        <p className="text-xs text-muted-foreground">support@indigo.store</p>
      </div>
    </div>
  );
}
