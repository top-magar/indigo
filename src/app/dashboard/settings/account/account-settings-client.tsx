"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserIcon,
    Upload01Icon,
    Cancel01Icon,
    Loading01Icon,
    Mail01Icon,
    LockIcon,
    SecurityCheckIcon,
    CheckmarkCircle02Icon,
    Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/shared/utils";
import { updateUserProfile, updateUserEmail, updateUserPassword } from "../actions";

interface AccountSettingsClientProps {
    user: {
        id: string;
        email: string;
        fullName: string | null;
        avatarUrl: string | null;
        role: "owner" | "admin" | "staff";
        createdAt: string;
    };
}

const roleLabels = {
    owner: { label: "Owner", color: "bg-chart-1/10 text-chart-1" },
    admin: { label: "Admin", color: "bg-chart-2/10 text-chart-2" },
    staff: { label: "Staff", color: "bg-muted text-muted-foreground" },
};

export function AccountSettingsClient({ user }: AccountSettingsClientProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);

    // Profile state
    const [fullName, setFullName] = useState(user.fullName || "");
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");

    // Email state
    const [newEmail, setNewEmail] = useState("");
    const [emailDialogOpen, setEmailDialogOpen] = useState(false);

    // Password state
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Upload failed");

            const data = await response.json();
            setAvatarUrl(data.url);
            toast.success("Avatar uploaded");
        } catch {
            toast.error("Failed to upload avatar");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSaveProfile = async () => {
        const formData = new FormData();
        formData.set("fullName", fullName);
        formData.set("avatarUrl", avatarUrl);

        startTransition(async () => {
            const result = await updateUserProfile(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Profile updated");
                router.refresh();
            }
        });
    };

    const handleUpdateEmail = async () => {
        if (!newEmail.trim()) {
            toast.error("Please enter a new email");
            return;
        }

        const formData = new FormData();
        formData.set("email", newEmail);

        startTransition(async () => {
            const result = await updateUserEmail(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Verification email sent to your new address");
                setEmailDialogOpen(false);
                setNewEmail("");
            }
        });
    };

    const handleUpdatePassword = async () => {
        if (newPassword.length < 8) {
            toast.error("Password must be at least 8 characters");
            return;
        }

        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        const formData = new FormData();
        formData.set("newPassword", newPassword);
        formData.set("confirmPassword", confirmPassword);

        startTransition(async () => {
            const result = await updateUserPassword(formData);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Password updated successfully");
                setPasswordDialogOpen(false);
                setNewPassword("");
                setConfirmPassword("");
            }
        });
    };

    const role = roleLabels[user.role];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                <p className="text-muted-foreground">
                    Manage your profile and security settings
                </p>
            </div>

            {/* Profile Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={UserIcon} className="w-5 h-5" />
                        Profile
                    </CardTitle>
                    <CardDescription>Your personal information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Avatar */}
                    <div className="flex items-start gap-6">
                        <div className="relative">
                            {avatarUrl ? (
                                <div className="relative h-24 w-24 overflow-hidden rounded-full border-4 border-background shadow-lg group">
                                    <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setAvatarUrl("")}
                                        className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <HugeiconsIcon icon={Cancel01Icon} className="h-6 w-6 text-white" />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-full border-4 border-dashed bg-muted/50 transition-colors hover:bg-muted">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                        className="hidden"
                                        disabled={isUploading}
                                    />
                                    {isUploading ? (
                                        <HugeiconsIcon icon={Loading01Icon} className="h-8 w-8 animate-spin text-muted-foreground" />
                                    ) : (
                                        <HugeiconsIcon icon={Upload01Icon} className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </label>
                            )}
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-semibold">{fullName || "No name set"}</h3>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            <Badge className={cn("border-0 mt-2", role.color)}>
                                {role.label}
                            </Badge>
                        </div>
                    </div>

                    <Separator />

                    {/* Name */}
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Enter your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Member Since</Label>
                            <div className="flex items-center gap-2 h-10 px-3 rounded-md border bg-muted/50">
                                <HugeiconsIcon icon={Calendar01Icon} className="w-4 h-4 text-muted-foreground" />
                                <span className="text-sm">
                                    {format(new Date(user.createdAt), "MMMM d, yyyy")}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button onClick={handleSaveProfile} disabled={isPending}>
                            {isPending ? (
                                <>
                                    <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
                                    Save Profile
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <HugeiconsIcon icon={SecurityCheckIcon} className="w-5 h-5" />
                        Security
                    </CardTitle>
                    <CardDescription>Manage your email and password</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Email */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <HugeiconsIcon icon={Mail01Icon} className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">Email Address</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>
                        <AlertDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">Change</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Change Email Address</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Enter your new email address. We&apos;ll send a verification link to confirm.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="py-4">
                                    <Label htmlFor="newEmail">New Email</Label>
                                    <Input
                                        id="newEmail"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="new@email.com"
                                        className="mt-2"
                                    />
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUpdateEmail} disabled={isPending}>
                                        {isPending ? "Sending..." : "Send Verification"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>

                    {/* Password */}
                    <div className="flex items-center justify-between p-4 rounded-lg border">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <HugeiconsIcon icon={LockIcon} className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                                <p className="font-medium">Password</p>
                                <p className="text-sm text-muted-foreground">••••••••••••</p>
                            </div>
                        </div>
                        <AlertDialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="outline" size="sm">Change</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Change Password</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Enter a new password. Make sure it&apos;s at least 8 characters.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="newPassword">New Password</Label>
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleUpdatePassword} disabled={isPending}>
                                        {isPending ? "Updating..." : "Update Password"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </CardContent>
            </Card>

            {/* Danger Zone */}
            <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible actions for your account</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                        <div>
                            <p className="font-medium">Delete Account</p>
                            <p className="text-sm text-muted-foreground">
                                Permanently delete your account and all associated data
                            </p>
                        </div>
                        <Button variant="destructive" size="sm" disabled>
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}