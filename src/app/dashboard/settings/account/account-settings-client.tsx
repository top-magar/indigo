"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { Upload, X, Loader2, Mail, Lock, CheckCircle, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/shared/utils";
import { updateUserProfile, updateUserEmail, updateUserPassword } from "./actions";

interface Props {
  user: {
    id: string; email: string; fullName: string | null;
    avatarUrl: string | null; role: "owner" | "admin" | "staff"; createdAt: string;
  };
}

const ROLE_STYLE: Record<string, string> = {
  owner: "bg-foreground/10 text-foreground",
  admin: "bg-success/10 text-success",
  staff: "bg-muted text-muted-foreground",
};

export function AccountSettingsClient({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [fullName, setFullName] = useState(user.fullName || "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [emailDialog, setEmailDialog] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [pwDialog, setPwDialog] = useState(false);
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");
      setAvatarUrl((await res.json()).url);
      toast.success("Avatar uploaded");
    } catch { toast.error("Failed to upload avatar"); }
    finally { setIsUploading(false); }
  };

  const handleSaveProfile = () => startTransition(async () => {
    const fd = new FormData();
    fd.set("fullName", fullName);
    fd.set("avatarUrl", avatarUrl);
    const result = await updateUserProfile(fd);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Profile updated");
    router.refresh();
  });

  const handleUpdateEmail = () => startTransition(async () => {
    if (!newEmail.trim()) { toast.error("Enter a new email"); return; }
    const fd = new FormData();
    fd.set("email", newEmail);
    const result = await updateUserEmail(fd);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Verification email sent");
    setEmailDialog(false);
    setNewEmail("");
  });

  const handleUpdatePassword = () => startTransition(async () => {
    if (newPw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    if (newPw !== confirmPw) { toast.error("Passwords do not match"); return; }
    const fd = new FormData();
    fd.set("newPassword", newPw);
    fd.set("confirmPassword", confirmPw);
    const result = await updateUserPassword(fd);
    if (result.error) { toast.error(result.error); return; }
    toast.success("Password updated");
    setPwDialog(false);
    setNewPw("");
    setConfirmPw("");
  });

  const hasProfileChanges = fullName !== (user.fullName || "") || avatarUrl !== (user.avatarUrl || "");

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Account</h1>
          <p className="text-xs text-muted-foreground">Your profile and security settings</p>
        </div>
        <Button onClick={handleSaveProfile} disabled={isPending || !hasProfileChanges} size="sm">
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Profile */}
      <div>
        <h2 className="text-sm font-medium mb-3">Profile</h2>
        <div className="rounded-lg border">
          <div className="p-4">
            <div className="flex gap-4">
              {/* Avatar */}
              <div className="shrink-0">
                {avatarUrl ? (
                  <div className="relative size-16 overflow-hidden rounded-full border group">
                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                    <button onClick={() => setAvatarUrl("")} className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="size-4 text-white" />
                    </button>
                  </div>
                ) : (
                  <label className="flex size-16 cursor-pointer items-center justify-center rounded-full border-2 border-dashed hover:border-foreground/20 hover:bg-muted/80 transition-colors">
                    <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" disabled={isUploading} />
                    {isUploading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : <Upload className="size-4 text-muted-foreground" />}
                  </label>
                )}
              </div>
              {/* Info */}
              <div className="flex-1 space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name</Label>
                  <Input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge className={cn("text-[10px] px-1.5 py-0 capitalize", ROLE_STYLE[user.role])}>{user.role}</Badge>
                  <span>Member since {format(new Date(user.createdAt), "MMM yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security */}
      <div>
        <h2 className="text-sm font-medium mb-3">Security</h2>
        <div className="rounded-lg border divide-y">
          {/* Email */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Mail className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setEmailDialog(true)}>Change</Button>
          </div>

          {/* Password */}
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                <Lock className="size-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">Password</p>
                <p className="text-xs text-muted-foreground">••••••••</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPwDialog(true)}>Change</Button>
          </div>
        </div>
      </div>

      {/* Danger */}
      <div>
        <h2 className="text-sm font-medium mb-3">Danger Zone</h2>
        <div className="rounded-lg border border-destructive/20">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <p className="text-sm font-medium">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently delete your account and all data</p>
            </div>
            <Button variant="destructive" size="sm" className="h-8 text-xs" disabled>Delete</Button>
          </div>
        </div>
      </div>

      {/* Email Dialog */}
      <AlertDialog open={emailDialog} onOpenChange={setEmailDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Email</AlertDialogTitle>
            <AlertDialogDescription>We&apos;ll send a verification link to your new email.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-1.5 py-2">
            <Label className="text-xs">New Email</Label>
            <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@email.com" />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdateEmail} disabled={isPending}>
              {isPending ? "Sending…" : "Send Verification"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Password Dialog */}
      <AlertDialog open={pwDialog} onOpenChange={setPwDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change Password</AlertDialogTitle>
            <AlertDialogDescription>Must be at least 8 characters.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs">New Password</Label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" className="pr-9" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPw ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Confirm Password</Label>
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleUpdatePassword} disabled={isPending}>
              {isPending ? "Updating…" : "Update Password"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
