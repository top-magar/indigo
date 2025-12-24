"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import type { Order, Customer, OrderItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { MoreHorizontal, Eye, ShoppingCart } from "lucide-react"
import { toast } from "sonner"

interface OrderWithDetails extends Order {
  items: OrderItem[]
  customer: Customer | null
}

interface OrdersTableProps {
  orders: OrderWithDetails[]
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  processing: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  shipped: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
}

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  paid: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  partially_refunded: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  refunded: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
}

export function OrdersTable({ orders }: OrdersTableProps) {
  const router = useRouter()
  const [selectedOrder, setSelectedOrder] = useState<OrderWithDetails | null>(null)

  const updateOrderStatus = async (orderId: string, status: Order["status"]) => {
    try {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)

      if (error) throw error

      toast.success("Order status updated")
      router.refresh()
    } catch (error) {
      toast.error("Failed to update order")
    }
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
            <ShoppingCart className="h-7 w-7 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No orders yet</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Orders will appear here when customers make purchases.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.order_number}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customer_name || "Guest"}</p>
                      <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={statusColors[order.status]}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={paymentStatusColors[order.payment_status]}>
                      {order.payment_status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">${Number(order.total).toFixed(2)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setSelectedOrder(order)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "confirmed")}>
                          Mark as Confirmed
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "processing")}>
                          Mark as Processing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "shipped")}>
                          Mark as Shipped
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateOrderStatus(order.id, "delivered")}>
                          Mark as Delivered
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Order Details Sheet */}
      <Sheet open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Order {selectedOrder?.order_number}</SheetTitle>
          </SheetHeader>

          {selectedOrder && (
            <div className="mt-6 space-y-6">
              <div>
                <h3 className="font-medium">Status</h3>
                <div className="mt-2 flex gap-2">
                  <Badge variant="secondary" className={statusColors[selectedOrder.status]}>
                    {selectedOrder.status}
                  </Badge>
                  <Badge variant="secondary" className={paymentStatusColors[selectedOrder.payment_status]}>
                    {selectedOrder.payment_status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Customer</h3>
                <p className="mt-1">{selectedOrder.customer_name || "Guest"}</p>
                <p className="text-sm text-muted-foreground">{selectedOrder.customer_email}</p>
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Shipping Address</h3>
                {selectedOrder.shipping_address ? (
                  <div className="mt-1 text-sm text-muted-foreground">
                    <p>
                      {selectedOrder.shipping_address.first_name} {selectedOrder.shipping_address.last_name}
                    </p>
                    <p>{selectedOrder.shipping_address.address_line1}</p>
                    <p>
                      {selectedOrder.shipping_address.city}, {selectedOrder.shipping_address.state}{" "}
                      {selectedOrder.shipping_address.postal_code}
                    </p>
                    <p>{selectedOrder.shipping_address.country}</p>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No shipping address</p>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium">Items</h3>
                <div className="mt-2 space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div>
                        <p>{item.product_name}</p>
                        <p className="text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                      <p className="font-medium">${Number(item.total_price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>${Number(selectedOrder.subtotal).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span>${Number(selectedOrder.shipping_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span>${Number(selectedOrder.tax_total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>${Number(selectedOrder.total).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
