"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format } from "date-fns"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  ArrowLeft01Icon,
  Add01Icon,
  Edit01Icon,
  Delete01Icon,
  MoreHorizontalIcon,
  UserMultipleIcon,
  PercentIcon,
  RefreshIcon,
} from "@hugeicons/core-free-icons"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EmptyState } from "@/components/ui/empty-state"
import { toast } from "sonner"
import { cn } from "@/shared/utils"
import { createCustomerGroup, updateCustomerGroup, deleteCustomerGroup } from "./actions"

interface CustomerGroup {
  id: string
  name: string
  description: string | null
  discount_percentage: number
  members_count: number
  created_at: string
}

interface CustomerGroupsClientProps {
  groups: CustomerGroup[]
  tenantId: string
}

export function CustomerGroupsClient({ groups: initialGroups, tenantId }: CustomerGroupsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [groups, setGroups] = useState(initialGroups)
  
  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<CustomerGroup | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    discountPercentage: "",
  })

  const resetForm = () => {
    setFormData({ name: "", description: "", discountPercentage: "" })
    setEditingGroup(null)
  }

  const openCreateDialog = () => {
    resetForm()
    setDialogOpen(true)
  }

  const openEditDialog = (group: CustomerGroup) => {
    setEditingGroup(group)
    setFormData({
      name: group.name,
      description: group.description || "",
      discountPercentage: group.discount_percentage?.toString() || "",
    })
    setDialogOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const data = new FormData()
    data.set("tenantId", tenantId)
    data.set("name", formData.name)
    data.set("description", formData.description)
    data.set("discountPercentage", formData.discountPercentage)

    startTransition(async () => {
      if (editingGroup) {
        data.set("groupId", editingGroup.id)
        const result = await updateCustomerGroup(data)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Group updated")
          setDialogOpen(false)
          router.refresh()
        }
      } else {
        const result = await createCustomerGroup(data)
        if (result.error) {
          toast.error(result.error)
        } else {
          toast.success("Group created")
          setDialogOpen(false)
          router.refresh()
        }
      }
    })
  }

  const handleDelete = async (groupId: string) => {
    startTransition(async () => {
      const result = await deleteCustomerGroup(groupId)
      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success("Group deleted")
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/customers">
              <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">Customer Groups</h1>
            <p className="text-sm text-muted-foreground">
              Segment customers and offer group discounts
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => router.refresh()}
            disabled={isPending}
          >
            <HugeiconsIcon icon={RefreshIcon} className={cn("h-4 w-4", isPending && "animate-spin")} />
          </Button>
          <Button onClick={openCreateDialog}>
            <HugeiconsIcon icon={Add01Icon} className="h-4 w-4 mr-2" />
            Create Group
          </Button>
        </div>
      </div>

      {/* Groups Grid */}
      {groups.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState
              icon={UserMultipleIcon}
              title="No customer groups"
              description="Create groups to segment customers and offer special discounts"
              action={{
                label: "Create Group",
                onClick: openCreateDialog,
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Card key={group.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                      <HugeiconsIcon icon={UserMultipleIcon} className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{group.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {group.members_count} member{group.members_count !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <HugeiconsIcon icon={MoreHorizontalIcon} className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEditDialog(group)}>
                        <HugeiconsIcon icon={Edit01Icon} className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => handleDelete(group.id)}
                      >
                        <HugeiconsIcon icon={Delete01Icon} className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {group.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {group.description}
                  </p>
                )}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={PercentIcon} className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {group.discount_percentage > 0 ? (
                        <Badge variant="secondary" className="bg-chart-2/10 text-chart-2">
                          {group.discount_percentage}% off
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">No discount</span>
                      )}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(group.created_at), "MMM d, yyyy")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingGroup ? "Edit Group" : "Create Customer Group"}</DialogTitle>
            <DialogDescription>
              {editingGroup
                ? "Update the group details"
                : "Create a new customer group for segmentation"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Group Name</Label>
              <Input
                id="name"
                placeholder="e.g., VIP Customers, Wholesale"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe this customer group..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Group Discount (%)</Label>
              <div className="relative">
                <Input
                  id="discount"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="0"
                  value={formData.discountPercentage}
                  onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
                  className="pr-8"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Members of this group will receive this discount on all orders
              </p>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : editingGroup ? "Save Changes" : "Create Group"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
