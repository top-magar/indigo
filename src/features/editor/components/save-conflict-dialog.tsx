"use client"

import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogAction, AlertDialogCancel } from "@/components/ui/alert-dialog"
import { useSaveStore } from "../stores/save-store"

export function SaveConflictDialog() {
  const error = useSaveStore((s) => s.error)
  const open = error === "conflict"

  return (
    <AlertDialog open={open}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Save conflict</AlertDialogTitle>
          <AlertDialogDescription>
            This page was edited in another tab or by another user. Your changes haven't been saved.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => window.location.reload()}>Reload page</AlertDialogCancel>
          <AlertDialogAction onClick={() => { useSaveStore.getState().forceNextSave(); useSaveStore.getState().save() }}>
            Overwrite
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
