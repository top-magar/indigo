"use client";

import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import {
  User,
  Mail,
  Smartphone,
  MapPin,
  Package,
  Clock,
  Printer,
  Truck,
  CreditCard,
  Undo2,
  ImageIcon,
  CheckCircle,
  X,
  ShoppingCart,
  FileText,
  StickyNote,
  type LucideIcon,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn, formatCurrency } from "@/shared/utils";
import {
  OrderStatusBadge,
  PaymentStatusBadge,
  FulfillmentStatusBadge,
} from "@/components/dashboard/status-badge";


// ============================================================================
// Types
// ============================================================================

export interface OrderAddress {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface OrderCustomer {
  id?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isGuest: boolean;
}

export interface OrderLine {
  id: string;
  productName: string;
  productSku?: string | null;
  productImage?: string | null;
  quantity: number;
  quantityFulfilled: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderEventType =
  | "order_created"
  | "order_confirmed"
  | "order_cancelled"
  | "order_updated"
  | "payment_authorized"
  | "payment_captured"
  | "payment_refunded"
  | "payment_voided"
  | "payment_failed"
  | "fulfillment_created"
  | "fulfillment_approved"
  | "fulfillment_shipped"
  | "fulfillment_delivered"
  | "fulfillment_cancelled"
  | "tracking_updated"
  | "invoice_generated"
  | "invoice_sent"
  | "note_added"
  | "email_sent"
  | "status_changed";

export interface OrderEvent {
  id: string;
  type: OrderEventType;
  message: string;
  userName?: string | null;
  createdAt: string;
}

export interface OrderDetailPanelOrder {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  customer: OrderCustomer;
  shippingAddress?: OrderAddress | null;
  subtotal: number;
  shippingTotal: number;
  taxTotal: number;
  discountTotal: number;
  total: number;
  currency: string;
  discountCode?: string | null;
  shippingMethod?: string | null;
  lines: OrderLine[];
  events: OrderEvent[];
  createdAt: string;
}

export interface OrderDetailPanelProps {
  order: OrderDetailPanelOrder | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateStatus?: (orderId: string) => void;
  onAddTracking?: (orderId: string) => void;
  onPrint?: (orderId: string) => void;
  onRefund?: (orderId: string) => void;
}


// ============================================================================
// Event Configuration
// ============================================================================

const eventConfig: Record<
  OrderEventType,
  { icon: LucideIcon; color: string; bgColor: string }
> = {
  order_created: { icon: CheckCircle, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  order_confirmed: { icon: CheckCircle, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  order_cancelled: { icon: X, color: "text-destructive", bgColor: "bg-destructive/10" },
  order_updated: { icon: Clock, color: "text-chart-4", bgColor: "bg-chart-4/10" },
  payment_authorized: { icon: CreditCard, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  payment_captured: { icon: CreditCard, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  payment_refunded: { icon: CreditCard, color: "text-chart-5", bgColor: "bg-chart-5/10" },
  payment_voided: { icon: CreditCard, color: "text-muted-foreground", bgColor: "bg-muted" },
  payment_failed: { icon: CreditCard, color: "text-destructive", bgColor: "bg-destructive/10" },
  fulfillment_created: { icon: Package, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  fulfillment_approved: { icon: CheckCircle, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  fulfillment_shipped: { icon: Truck, color: "text-chart-5", bgColor: "bg-chart-5/10" },
  fulfillment_delivered: { icon: CheckCircle, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  fulfillment_cancelled: { icon: X, color: "text-destructive", bgColor: "bg-destructive/10" },
  tracking_updated: { icon: Truck, color: "text-chart-5", bgColor: "bg-chart-5/10" },
  invoice_generated: { icon: FileText, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  invoice_sent: { icon: Mail, color: "text-chart-2", bgColor: "bg-chart-2/10" },
  note_added: { icon: StickyNote, color: "text-muted-foreground", bgColor: "bg-muted" },
  email_sent: { icon: Mail, color: "text-chart-1", bgColor: "bg-chart-1/10" },
  status_changed: { icon: Clock, color: "text-chart-4", bgColor: "bg-chart-4/10" },
};

// ============================================================================
// Helper Functions
// ============================================================================

function formatAddress(address: OrderAddress | null | undefined): string[] {
  if (!address) return [];

  const lines: string[] = [];

  if (address.firstName || address.lastName) {
    lines.push([address.firstName, address.lastName].filter(Boolean).join(" "));
  }
  if (address.company) lines.push(address.company);
  if (address.addressLine1) lines.push(address.addressLine1);
  if (address.addressLine2) lines.push(address.addressLine2);

  const cityLine = [address.city, address.state, address.postalCode]
    .filter(Boolean)
    .join(", ");
  if (cityLine) lines.push(cityLine);

  if (address.country) lines.push(address.country);

  return lines;
}


// ============================================================================
// Main Component
// ============================================================================

export function OrderDetailPanel({
  order,
  open,
  onOpenChange,
  onUpdateStatus,
  onAddTracking,
  onPrint,
  onRefund,
}: OrderDetailPanelProps) {
  if (!order) return null;

  const customerName =
    [order.customer.firstName, order.customer.lastName].filter(Boolean).join(" ") ||
    "Guest";
  const shippingLines = formatAddress(order.shippingAddress);

  // Combine events with order creation and sort
  const allEvents: OrderEvent[] = [
    ...order.events,
    {
      id: "created",
      type: "order_created" as const,
      message: "Order placed",
      createdAt: order.createdAt,
    },
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-[388px] lg:max-w-[480px] flex flex-col p-0"
        showCloseButton={true}
      >
        {/* Header */}
        <SheetHeader className="px-[26px] pt-[26px] pb-[13px] border-b shrink-0">
          <div className="flex items-start justify-between pr-8">
            <div>
              <SheetTitle className="text-lg font-semibold">
                Order #{order.orderNumber}
              </SheetTitle>
              <SheetDescription className="mt-1">
                {format(new Date(order.createdAt), "PPP 'at' p")}
              </SheetDescription>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <OrderStatusBadge status={order.status} />
            <PaymentStatusBadge status={order.paymentStatus} />
            <FulfillmentStatusBadge status={order.fulfillmentStatus} />
          </div>
        </SheetHeader>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="px-[26px] py-[13px] space-y-[26px]">
            {/* Customer Info Section */}
            <section>
              <h3 className="text-sm font-medium flex items-center gap-[8px] mb-[13px]">
                <User className="h-4 w-4 text-muted-foreground" />
                Customer
              </h3>
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-primary">
                      {customerName[0]?.toUpperCase() || "G"}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{customerName}</p>
                      {order.customer.isGuest && (
                        <Badge variant="secondary" className="text-[10px]">
                          Guest
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                {order.customer.email && (
                  <a
                    href={`mailto:${order.customer.email}`}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    <Mail className="h-3 w-3" />
                    {order.customer.email}
                  </a>
                )}
                {order.customer.phone && (
                  <a
                    href={`tel:${order.customer.phone}`}
                    className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1.5"
                  >
                    <Smartphone className="h-3 w-3" />
                    {order.customer.phone}
                  </a>
                )}
              </div>
            </section>

            <Separator />

            {/* Shipping Address Section */}
            <section>
              <h3 className="text-sm font-medium flex items-center gap-[8px] mb-[13px]">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping Address
              </h3>
              {shippingLines.length > 0 ? (
                <div className="text-sm text-muted-foreground space-y-0.5">
                  {shippingLines.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  {order.shippingAddress?.phone && (
                    <p className="pt-1">{order.shippingAddress.phone}</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No shipping address</p>
              )}
            </section>

            <Separator />

            {/* Order Items Section */}
            <section>
              <h3 className="text-sm font-medium flex items-center gap-[8px] mb-[13px]">
                <Package className="h-4 w-4 text-muted-foreground" />
                Items
                <Badge variant="secondary" className="text-[10px]">
                  {order.lines.length}
                </Badge>
              </h3>
              <div className="space-y-3">
                {order.lines.map((line) => (
                  <OrderLineItem key={line.id} line={line} currency={order.currency} />
                ))}
              </div>
            </section>

            <Separator />

            {/* Order Totals Section */}
            <section>
              <h3 className="text-sm font-medium flex items-center gap-[8px] mb-[13px]">
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                Order Summary
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                {order.shippingTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Shipping{" "}
                      {order.shippingMethod && (
                        <span className="text-xs">({order.shippingMethod})</span>
                      )}
                    </span>
                    <span>{formatCurrency(order.shippingTotal, order.currency)}</span>
                  </div>
                )}
                {order.taxTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax</span>
                    <span>{formatCurrency(order.taxTotal, order.currency)}</span>
                  </div>
                )}
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm text-chart-2">
                    <span>
                      Discount{" "}
                      {order.discountCode && (
                        <span className="text-xs">({order.discountCode})</span>
                      )}
                    </span>
                    <span>-{formatCurrency(order.discountTotal, order.currency)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="font-semibold">Total</span>
                  <span className="text-lg font-semibold">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </section>

            <Separator />

            {/* Activity Timeline Section */}
            <section>
              <h3 className="text-sm font-medium flex items-center gap-[8px] mb-[13px]">
                <Clock className="h-4 w-4 text-muted-foreground" />
                Activity
              </h3>
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />

                <div className="space-y-3">
                  {allEvents.slice(0, 5).map((event) => (
                    <TimelineEventItem key={event.id} event={event} />
                  ))}
                  {allEvents.length > 5 && (
                    <p className="text-xs text-muted-foreground pl-9">
                      +{allEvents.length - 5} more events
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        {/* Footer with Actions */}
        <SheetFooter className="px-[26px] py-[13px] border-t shrink-0">
          <div className="flex flex-wrap gap-2 w-full">
            {onUpdateStatus && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateStatus(order.id)}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-1.5" />
                Update Status
              </Button>
            )}
            {onAddTracking && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddTracking(order.id)}
                className="flex-1"
              >
                <Truck className="h-4 w-4 mr-1.5" />
                Add Tracking
              </Button>
            )}
            {onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(order.id)}
              >
                <Printer className="h-4 w-4" />
              </Button>
            )}
            {onRefund && order.paymentStatus === "paid" && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRefund(order.id)}
                className="text-destructive hover:text-destructive"
              >
                <Undo2 className="h-4 w-4 mr-1.5" />
                Refund
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}


// ============================================================================
// Sub-components
// ============================================================================

function OrderLineItem({
  line,
  currency,
}: {
  line: OrderLine;
  currency: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden shrink-0">
        {line.productImage ? (
          <Image
            src={line.productImage}
            alt={line.productName}
            width={48}
            height={48}
            className="object-cover"
          />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{line.productName}</p>
        {line.productSku && (
          <p className="text-xs text-muted-foreground font-mono">SKU: {line.productSku}</p>
        )}
        <p className="text-xs text-muted-foreground">
          {line.quantity} × {formatCurrency(line.unitPrice, currency)}
        </p>
      </div>
      <div className="text-sm font-medium shrink-0">
        {formatCurrency(line.totalPrice, currency)}
      </div>
    </div>
  );
}

function TimelineEventItem({ event }: { event: OrderEvent }) {
  const config = eventConfig[event.type] || eventConfig.order_updated;
  const EventIcon = config.icon;

  return (
    <div className="relative flex gap-3 pl-0">
      <div
        className={cn(
          "relative z-10 h-6 w-6 rounded-full flex items-center justify-center shrink-0",
          config.bgColor
        )}
      >
        <EventIcon className={cn("h-3 w-3", config.color)} />
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-xs font-medium">{event.message}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
          </span>
          {event.userName && (
            <>
              <span className="text-[10px] text-muted-foreground">•</span>
              <span className="text-[10px] text-muted-foreground">{event.userName}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

OrderDetailPanel.displayName = "OrderDetailPanel";
