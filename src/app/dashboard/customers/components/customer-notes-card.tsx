"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    NoteIcon,
    Add01Icon,
    Delete02Icon,
    LockIcon,
} from "@hugeicons/core-free-icons";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
import { addCustomerNoteAction, deleteCustomerNote } from "../customer-actions";
import type { Customer, CustomerNote } from "../types";

interface CustomerNotesCardProps {
    customer: Customer;
}

export function CustomerNotesCard({ customer }: CustomerNotesCardProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState<CustomerNote | null>(null);
    const [newNote, setNewNote] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);

    const handleAddNote = () => {
        if (!newNote.trim()) return;

        startTransition(async () => {
            const result = await addCustomerNoteAction(customer.id, newNote.trim(), isPrivate);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Note added");
                setNewNote("");
                setIsPrivate(false);
                setAddDialogOpen(false);
                router.refresh();
            }
        });
    };

    const handleDeleteNote = () => {
        if (!noteToDelete) return;

        startTransition(async () => {
            const result = await deleteCustomerNote(customer.id, noteToDelete.id);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Note deleted");
                router.refresh();
            }
            setDeleteDialogOpen(false);
            setNoteToDelete(null);
        });
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                        <HugeiconsIcon icon={NoteIcon} className="w-4 h-4" />
                        Notes
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={() => setAddDialogOpen(true)}>
                        <HugeiconsIcon icon={Add01Icon} className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent>
                    {customer.notes.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                            No notes yet
                        </p>
                    ) : (
                        <div className="space-y-4">
                            {customer.notes.map((note) => (
                                <div key={note.id} className="group relative">
                                    <div className="flex items-start gap-2">
                                        {note.isPrivate && (
                                            <HugeiconsIcon 
                                                icon={LockIcon} 
                                                className="w-3 h-3 text-muted-foreground mt-1 shrink-0" 
                                            />
                                        )}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm">{note.text}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                                                </p>
                                                {note.createdBy && (
                                                    <>
                                                        <span className="text-xs text-muted-foreground">•</span>
                                                        <p className="text-xs text-muted-foreground">
                                                            {note.createdBy}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                                            onClick={() => {
                                                setNoteToDelete(note);
                                                setDeleteDialogOpen(true);
                                            }}
                                        >
                                            <HugeiconsIcon icon={Delete02Icon} className="w-3 h-3 text-muted-foreground" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Note Dialog */}
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Note</DialogTitle>
                        <DialogDescription>
                            Add a note about this customer
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <Textarea
                            value={newNote}
                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewNote(e.target.value)}
                            placeholder="Enter your note..."
                            rows={4}
                        />
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="private"
                                checked={isPrivate}
                                onCheckedChange={(checked: boolean | "indeterminate") => setIsPrivate(checked === true)}
                            />
                            <Label htmlFor="private" className="text-sm cursor-pointer">
                                Private note (only visible to staff)
                            </Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleAddNote} disabled={isPending || !newNote.trim()}>
                            {isPending ? "Adding..." : "Add Note"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Note Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Note</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this note? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteNote}
                            disabled={isPending}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isPending ? "Deleting..." : "Delete"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
