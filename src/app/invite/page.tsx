import { db } from "@/infrastructure/db";
import { platformInvites } from "@/db/schema/platform-invites";
import { users } from "@/db/schema/users";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/infrastructure/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Accept Invite | Indigo Admin" };

export default async function InviteAcceptPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) return <ErrorState message="Invalid invite link" />;

  // Validate token
  const [invite] = await db.select()
    .from(platformInvites)
    .where(and(eq(platformInvites.token, token), eq(platformInvites.status, "pending")))
    .limit(1);

  if (!invite) return <ErrorState message="This invite has expired or already been used" />;
  if (new Date() > invite.expiresAt) return <ErrorState message="This invite has expired" />;

  // Check if user is logged in
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    // User is logged in — accept the invite
    const [existingUser] = await db.select({ id: users.id })
      .from(users).where(eq(users.id, user.id)).limit(1);

    if (existingUser) {
      await db.update(users)
        .set({ role: "platform_admin", platformRole: invite.platformRole, tenantId: null, updatedAt: new Date() })
        .where(eq(users.id, user.id));
    }

    await db.update(platformInvites)
      .set({ status: "accepted" })
      .where(eq(platformInvites.id, invite.id));

    redirect("/admin");
  }

  // Not logged in — show signup/login prompt
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-4 p-6">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-semibold tracking-tight">Join Indigo Platform Team</h1>
          <p className="text-sm text-muted-foreground">
            You&apos;ve been invited as <strong className="text-foreground">{invite.platformRole}</strong>
          </p>
          <p className="text-xs text-muted-foreground">{invite.email}</p>
        </div>
        <div className="space-y-2">
          <Link
            href={`/login?next=/invite?token=${token}`}
            className="flex items-center justify-center w-full rounded-md bg-foreground text-background px-4 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors"
          >
            Log in to accept
          </Link>
          <Link
            href={`/signup?next=/invite?token=${token}`}
            className="flex items-center justify-center w-full rounded-md border px-4 py-2.5 text-sm font-medium hover:bg-muted transition-colors"
          >
            Create an account
          </Link>
        </div>
        <p className="text-[10px] text-muted-foreground text-center">This invite expires {new Date(invite.expiresAt).toLocaleDateString()}</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href="/login" className="text-xs underline text-muted-foreground hover:text-foreground">Go to login</Link>
      </div>
    </div>
  );
}
