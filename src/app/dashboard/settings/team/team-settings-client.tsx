"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserMultipleIcon,
    Add01Icon,
    MoreHorizontalIcon,
    Delete02Icon,
    UserIcon,
    Mail01Icon,
    Loading01Icon,
    Crown02Icon,
    SecurityCheckIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/shared/utils";
import { inviteTeamMember, updateTeamMemberRole, removeTeamMember } from "../actions";

interface TeamMember {
    id: string;
    email: string;
    full_name: string | null;
    avatar_url: string | null;
    role: "owner" | "admin" | "staff";
    created_at: string;
}

interface TeamSettingsClientProps {
    currentUserId: string;
    currentUserRole: "owner" | "admin" | "staff";
    teamMembers: TeamMember[];
}

const roleConfig = {
    owner: { 
        label: "Owner", 
        color: "bg-chart-1/10 text-chart-1 border-chart-1/20",
        icon: Crown02Icon,
        description: "Full access to all settings and billing"
    },
    admin: { 
        label: "Admin", 
        color: "bg-chart-2/10 text-chart-2 border-chart-2/20",
        icon: SecurityCheckIcon,
        description: "Can manage products, orders, and team"
    },
    staff: { 
        label: "Staff", 
        color: "bg-muted text-muted-foreground border-border",
        icon: UserIcon,
        description: "Can view and manage orders"
    },
};

export function TeamSettingsClient({ currentUserId, currentUserRole, teamMembers }: TeamSettingsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
    const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);

    // Invite form state
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"admin" | "staff">("staff");

    const isOwner = currentUserRole === "owner";
    const canManageTeam = isOwner;

    const handleInvite = async () => {
        if (!inviteEmail.trim()) {
            toast.error("Please enter an email address");
            return;
        }

        const formData = new FormData();
        formData.set("email", inviteEmail);
        formData.set("role", inviteRole);

        startTransition(async () => {
            const result = await inviteTeamMember(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Invitation sent successfully");
                setInviteDialogOpen(false);
                setInviteEmail("");
                setInviteRole("staff");
            }
        });
    };

    const handleRoleChange = async (memberId: string, newRole: "admin" | "staff") => {
        startTransition(async () => {
            const result = await updateTeamMemberRole(memberId, newRole);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Role updated");
                router.refresh();
            }
        });
    };

    const handleRemove = async () => {
        if (!memberToRemove) return;

        startTransition(async () => {
            const result = await removeTeamMember(memberToRemove.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Team member removed");
                setRemoveDialogOpen(false);
                setMemberToRemove(null);
                router.refresh();
            }
        });
    };

    const getInitials = (name: string | null, email: string) => {
        if (name) {
            return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
        }
        return email.slice(0, 2).toUpperCase();
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Team</h1>
                    <p className="text-muted-foreground">
                        Manage your team members and their permissions
                    </p>
                </div>
                {canManageTeam && (
                    <Button onClick={() => setInviteDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4 mr-2" />
                        Invite Member
                    </Button>
                )}
            </div>

            {/* Team Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-chart-1/10 flex items-center justify-center">
                                <HugeiconsIcon icon={UserMultipleIcon} className="w-5 h-5 text-chart-1" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{teamMembers.length}</p>
                                <p className="text-xs text-muted-foreground">Total Members</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-chart-2/10 flex items-center justify-center">
                                <HugeiconsIcon icon={SecurityCheckIcon} className="w-5 h-5 text-chart-2" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === "admin").length}</p>
                                <p className="text-xs text-muted-foreground">Admins</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                                <HugeiconsIcon icon={UserIcon} className="w-5 h-5 text-chart-4" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold">{teamMembers.filter(m => m.role === "staff").length}</p>
                                <p className="text-xs text-muted-foreground">Staff</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Team Members List */}
            <Card>
                <CardHeader>
                    <CardTitle>Team Members</CardTitle>
                    <CardDescription>People who have access to your store</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {teamMembers.map((member) => {
                            const role = roleConfig[member.role];
                            const isCurrentUser = member.id === currentUserId;
                            const canModify = canManageTeam && !isCurrentUser && member.role !== "owner";

                            return (
                                <div key={member.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-12 w-12">
                                            <AvatarImage src={member.avatar_url || undefined} />
                                            <AvatarFallback className="bg-muted">
                                                {getInitials(member.full_name, member.email)}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-medium">
                                                    {member.full_name || member.email.split("@")[0]}
                                                </p>
                                                {isCurrentUser && (
                                                    <Badge variant="outline" className="text-xs">You</Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-muted-foreground">{member.email}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Joined {format(new Date(member.created_at), "MMM d, yyyy")}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={cn("border gap-1", role.color)}>
                                            <HugeiconsIcon icon={role.icon} className="w-3 h-3" />
                                            {role.label}
                                        </Badge>
                                        {canModify && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "admin")}>
                                                        <HugeiconsIcon icon={SecurityCheckIcon} className="w-4 h-4 mr-2" />
                                                        Make Admin
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleRoleChange(member.id, "staff")}>
                                                        <HugeiconsIcon icon={UserIcon} className="w-4 h-4 mr-2" />
                                                        Make Staff
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setMemberToRemove(member);
                                                            setRemoveDialogOpen(true);
                                                        }}
                                                    >
                                                        <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4 mr-2" />
                                                        Remove
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            {/* Role Permissions */}
            <Card>
                <CardHeader>
                    <CardTitle>Role Permissions</CardTitle>
                    <CardDescription>What each role can do in your store</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                        {Object.entries(roleConfig).map(([key, config]) => (
                            <div key={key} className="p-4 rounded-lg border">
                                <div className="flex items-center gap-2 mb-2">
                                    <HugeiconsIcon icon={config.icon} className="w-5 h-5" />
                                    <span className="font-medium">{config.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{config.description}</p>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            {/* Invite Dialog */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Invite Team Member</DialogTitle>
                        <DialogDescription>
                            Send an invitation to join your store team
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="inviteEmail">Email Address</Label>
                            <Input
                                id="inviteEmail"
                                type="email"
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="colleague@example.com"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Role</Label>
                            <Select value={inviteRole} onValueChange={(v: "admin" | "staff") => setInviteRole(v)}>
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="admin">
                                        <div className="flex items-center gap-2">
                                            <HugeiconsIcon icon={SecurityCheckIcon} className="w-4 h-4" />
                                            Admin
                                        </div>
                                    </SelectItem>
                                    <SelectItem value="staff">
                                        <div className="flex items-center gap-2">
                                            <HugeiconsIcon icon={UserIcon} className="w-4 h-4" />
                                            Staff
                                        </div>
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {inviteRole === "admin" 
                                    ? "Admins can manage products, orders, and team members"
                                    : "Staff can view and manage orders only"
                                }
                            </p>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleInvite} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <HugeiconsIcon icon={Mail01Icon} className="w-4 h-4 mr-2" />
                                    Send Invitation
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Remove Confirmation */}
            <AlertDialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {memberToRemove && (
                                <>
                                    This will remove <span className="font-medium">{memberToRemove.full_name || memberToRemove.email}</span> from your team. 
                                    They will no longer have access to your store.
                                </>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleRemove}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Remove
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}