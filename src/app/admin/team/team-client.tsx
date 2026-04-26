"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Mail, Clock, UserPlus, Shield, X } from "lucide-react";
import { toast } from "sonner";
import { invitePlatformMember, removePlatformMember, changeRole, cancelInvite } from "./actions";
import { ConfirmDialog } from "../_components/confirm-dialog";

type Member = { id: string; email: string; fullName: string | null; platformRole: string | null; createdAt: string | null };
type Invite = { id: string; email: string; platformRole: string; status: string; expiresAt: string; createdAt: string };

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Owner", admin: "Admin", support: "Support", finance: "Finance",
};
const ROLE_COLORS: Record<string, string> = {
  super_admin: "bg-foreground text-background", admin: "bg-accent-foreground/10 text-accent-foreground",
  support: "bg-success/10 text-success", finance: "bg-warning/10 text-warning",
};

export default function TeamClient({ members, invites, canManage, currentUserId }: {
  members: Member[]; invites: Invite[]; canManage: boolean; currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<string>("support");

  const handleInvite = () => {
    if (!email) return;
    startTransition(async () => {
      const result = await invitePlatformMember({ email, role: role as any });
      if (result.error) toast.error(result.error);
      else { toast.success(`Invite sent to ${email}`); setEmail(""); }
    });
  };

  const handleRemove = (id: string, name: string) => {
    startTransition(async () => {
      const result = await removePlatformMember(id);
      if (result.error) toast.error(result.error);
      else toast.success("Member removed");
    });
  };

  const handleChangeRole = (id: string, newRole: string) => {
    startTransition(async () => {
      const result = await changeRole(id, newRole as any);
      if (result.error) toast.error(result.error);
      else toast.success("Role updated");
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Platform Team</h1>
        <p className="text-xs text-muted-foreground">{members.length} member{members.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Invite form */}
      {canManage && (
        <div className="rounded-lg border p-4">
          <p className="text-sm font-medium mb-3">Invite Team Member</p>
          <div className="flex gap-2">
            <Input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="flex-1" type="email" />
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="support">Support</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={handleInvite} disabled={isPending || !email}>
              <UserPlus className="size-3.5" /> Invite
            </Button>
          </div>
        </div>
      )}

      {/* Members */}
      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <p className="text-sm font-medium">Members</p>
        </div>
        <div className="divide-y">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between p-3">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {(m.fullName?.[0] || m.email[0]).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{m.fullName || m.email.split("@")[0]}</p>
                    {m.id === currentUserId && <span className="text-[10px] text-muted-foreground">(you)</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={`text-[10px] ${ROLE_COLORS[m.platformRole ?? ""] ?? "bg-muted"}`}>
                  {ROLE_LABELS[m.platformRole ?? ""] ?? m.platformRole}
                </Badge>
                {canManage && m.platformRole !== "super_admin" && m.id !== currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon-sm"><MoreHorizontal className="size-3.5" /></Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {["admin", "support", "finance"].filter(r => r !== m.platformRole).map(r => (
                        <DropdownMenuItem key={r} onClick={() => handleChangeRole(m.id, r)}>
                          Change to {ROLE_LABELS[r]}
                        </DropdownMenuItem>
                      ))}
                      <ConfirmDialog
                        trigger={<DropdownMenuItem onSelect={e => e.preventDefault()} className="text-destructive">Remove</DropdownMenuItem>}
                        title={`Remove ${m.fullName || m.email.split("@")[0]}?`}
                        description="They will lose access to the admin panel immediately."
                        action="Remove member"
                        onConfirm={() => handleRemove(m.id, m.fullName || m.email)}
                      />
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending invites */}
      {canManage && invites.length > 0 && (
        <div className="rounded-lg border">
          <div className="p-4 border-b">
            <p className="text-sm font-medium">Pending Invites</p>
          </div>
          <div className="divide-y">
            {invites.map(inv => (
              <div key={inv.id} className="flex items-center justify-between p-3">
                <div className="flex items-center gap-3">
                  <div className="size-8 rounded-full border-2 border-dashed flex items-center justify-center">
                    <Mail className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm">{inv.email}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="size-2.5" /> Expires {new Date(inv.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`text-[10px] ${ROLE_COLORS[inv.platformRole] ?? "bg-muted"}`}>
                    {ROLE_LABELS[inv.platformRole] ?? inv.platformRole}
                  </Badge>
                  <Button variant="ghost" size="icon-sm" onClick={() => {
                    startTransition(async () => { await cancelInvite(inv.id); toast.success("Invite cancelled"); });
                  }}>
                    <X className="size-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role legend */}
      <div className="rounded-lg border p-4">
        <p className="text-sm font-medium mb-3">Role Permissions</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground">
          <p className="flex items-center gap-1"><Shield className="size-3" /><span className="font-semibold">Owner</span> — Full access, manage team</p>
          <p className="flex items-center gap-1"><Shield className="size-3" /><span className="font-semibold">Admin</span> — Merchants, billing, settings</p>
          <p className="flex items-center gap-1"><Shield className="size-3" /><span className="font-semibold">Support</span> — View merchants (read-only)</p>
          <p className="flex items-center gap-1"><Shield className="size-3" /><span className="font-semibold">Finance</span> — Billing and payments only</p>
        </div>
      </div>
    </div>
  );
}
