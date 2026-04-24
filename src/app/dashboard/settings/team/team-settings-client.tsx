"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, MoreHorizontal, Trash2, User, Mail, Loader2, ShieldCheck, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { cn } from "@/shared/utils";
import { inviteTeamMember, updateTeamMemberRole, removeTeamMember } from "./actions";

interface TeamMember {
  id: string; email: string; full_name: string | null;
  avatar_url: string | null; role: "owner" | "admin" | "staff"; created_at: string;
}

const ROLE_STYLE: Record<string, string> = {
  owner: "bg-foreground/10 text-foreground",
  admin: "bg-success/10 text-success",
  staff: "bg-muted text-muted-foreground",
};

const ROLE_ICON: Record<string, typeof Crown> = { owner: Crown, admin: ShieldCheck, staff: User };

function getInitials(name: string | null, email: string) {
  if (name) return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  return email.slice(0, 2).toUpperCase();
}

export function TeamSettingsClient({ currentUserId, currentUserRole, teamMembers }: {
  currentUserId: string; currentUserRole: "owner" | "admin" | "staff"; teamMembers: TeamMember[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");

  const isOwner = currentUserRole === "owner";

  const handleInvite = () => startTransition(async () => {
    if (!inviteEmail.trim()) { toast.error("Enter an email"); return; }
    const fd = new FormData();
    fd.set("email", inviteEmail);
    fd.set("role", inviteRole);
    const result = await inviteTeamMember(fd);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Invitation sent");
    setInviteOpen(false);
    setInviteEmail("");
    setInviteRole("staff");
  });

  const handleRoleChange = (memberId: string, newRole: "admin" | "staff") => startTransition(async () => {
    const result = await updateTeamMemberRole(memberId, newRole);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Role updated");
    router.refresh();
  });

  const handleRemove = () => startTransition(async () => {
    if (!memberToRemove) return;
    const result = await removeTeamMember(memberToRemove.id);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Member removed");
    setRemoveOpen(false);
    setMemberToRemove(null);
    router.refresh();
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Team</h1>
          <p className="text-xs text-muted-foreground">
            {teamMembers.length} member{teamMembers.length !== 1 ? "s" : ""} · {teamMembers.filter(m => m.role === "admin").length} admin{teamMembers.filter(m => m.role === "admin").length !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && (
          <Button onClick={() => setInviteOpen(true)} size="sm">
            <Plus className="size-3.5" />
            Invite
          </Button>
        )}
      </div>

      {/* Members */}
      <div className="rounded-lg border divide-y">
        {teamMembers.map(member => {
          const isMe = member.id === currentUserId;
          const canModify = isOwner && !isMe && member.role !== "owner";
          const Icon = ROLE_ICON[member.role];

          return (
            <div key={member.id} className="p-4 flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-xs bg-muted">{getInitials(member.full_name, member.email)}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium truncate">{member.full_name || member.email.split("@")[0]}</p>
                  {isMe && <Badge className="text-[10px] px-1.5 py-0 bg-muted text-muted-foreground">You</Badge>}
                </div>
                <p className="text-xs text-muted-foreground truncate">{member.email} · Joined {format(new Date(member.created_at), "MMM yyyy")}</p>
              </div>
              <Badge className={cn("text-[10px] px-1.5 py-0 gap-1 capitalize", ROLE_STYLE[member.role])}>
                <Icon className="size-3.5" />
                {member.role}
              </Badge>
              {canModify && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="size-8"><MoreHorizontal className="size-3.5" /></Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")} className="text-xs gap-2">
                      <ShieldCheck className="size-3.5" /> Make Admin
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "staff")} className="text-xs gap-2">
                      <User className="size-3.5" /> Make Staff
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => { setMemberToRemove(member); setRemoveOpen(true); }} className="text-xs gap-2 text-destructive focus:text-destructive">
                      <Trash2 className="size-3.5" /> Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          );
        })}
      </div>

      {/* Roles reference */}
      <div className="flex gap-4 text-[10px] text-muted-foreground">
        <span><Crown className="size-3 inline mr-0.5" /> Owner — full access</span>
        <span><ShieldCheck className="size-3 inline mr-0.5" /> Admin — manage store</span>
        <span><User className="size-3 inline mr-0.5" /> Staff — manage orders</span>
      </div>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>They&apos;ll receive an email to join your store.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Email Address</Label>
              <Input type="email" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} placeholder="colleague@example.com" autoFocus />
              {inviteEmail && !inviteEmail.includes("@") && (
                <p className="text-[10px] text-destructive">Enter a valid email address</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  { value: "admin" as const, icon: ShieldCheck, label: "Admin", desc: "Manage products, orders, customers, and settings" },
                  { value: "staff" as const, icon: User, label: "Staff", desc: "View dashboard, manage orders and customers" },
                ] as const).map(role => (
                  <button
                    key={role.value}
                    type="button"
                    onClick={() => setInviteRole(role.value)}
                    className={cn(
                      "flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors",
                      inviteRole === role.value ? "border-foreground bg-accent" : "hover:bg-accent/50"
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      <role.icon className="size-3.5" />
                      <span className="text-sm font-medium">{role.label}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-tight">{role.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteOpen(false)} size="sm">Cancel</Button>
            <Button onClick={handleInvite} disabled={isPending || !inviteEmail.includes("@")} size="sm">
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Mail className="size-3.5" />}
              {isPending ? "Sending…" : "Send Invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Dialog */}
      <AlertDialog open={removeOpen} onOpenChange={setRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              {memberToRemove && <>Remove <strong>{memberToRemove.full_name || memberToRemove.email}</strong>? They&apos;ll lose access to your store.</>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
