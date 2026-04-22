"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { updateOrderNotes, cancelOrder, updateOrderTags } from "../actions";
import { generateInvoice } from "../order-actions";

function TagsInput({ orderId, initialTags }: { orderId: string; initialTags: string[] }) {
  const [tags, setTags] = useState(initialTags);
  const [input, setInput] = useState("");
  const [saving, startSaving] = useTransition();

  const addTag = (tag: string) => {
    const t = tag.trim().toLowerCase();
    if (!t || tags.includes(t)) return;
    const next = [...tags, t];
    setTags(next);
    setInput("");
    startSaving(async () => { try { await updateOrderTags(orderId, next); } catch {} });
  };

  const removeTag = (tag: string) => {
    const next = tags.filter(t => t !== tag);
    setTags(next);
    startSaving(async () => { try { await updateOrderTags(orderId, next); } catch {} });
  };

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map(tag => (
            <Badge key={tag} variant="secondary" className="gap-1 text-xs">
              {tag}
              <button onClick={() => removeTag(tag)} className="ml-0.5 hover:text-destructive">×</button>
            </Badge>
          ))}
        </div>
      )}
      <div className="flex gap-1">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(input); } }}
          placeholder="Add tag…"
          className="flex-1 h-7 rounded-md border border-input bg-background px-2 text-xs outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Package,
  Truck,
  CreditCard,
  Clock,
  CheckCircle2,
  XCircle,
  Printer,
  Download,
  MessageSquare,
  Brain,
  AlertTriangle,
  Copy,
  ExternalLink,
  Loader2,
  ChevronRight,
  ChevronLeft,
  ShoppingBag,
  Receipt,
  History,
  StickyNote,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn, formatCurrency } from "@/shared/utils";
import { OrderStatusBadge, SentimentIndicator, AddressCard, AIInsightsCard, OrderTimeline } from "./_components/helpers";

// ============================================================================
// Types
// ============================================================================

interface OrderAddress {
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

interface OrderCustomer {
  id?: string | null;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  avatarUrl?: string | null;
  isGuest: boolean;
  totalOrders?: number;
  totalSpent?: number;
}

interface OrderLine {
  id: string;
  productName: string;
  productSku?: string | null;
  productImage?: string | null;
  quantity: number;
  quantityFulfilled: number;
  unitPrice: number;
  totalPrice: number;
}

interface OrderEvent {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  user?: string;
}

export interface AIAnalysis {
  sentiment?: {
    score: number;
    label: "positive" | "neutral" | "negative";
    confidence: number;
  };
  riskScore?: number;
  recommendations?: string[];
  suggestedActions?: {
    label: string;
    action: string;
    priority: "high" | "medium" | "low";
  }[];
  relatedProducts?: {
    id: string;
    name: string;
    image?: string;
    price: number;
  }[];
}

export interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  fulfillmentStatus: string;
  customer: OrderCustomer;
  shippingAddress?: OrderAddress;
  billingAddress?: OrderAddress;
  lines: OrderLine[];
  subtotal: number;
  discountTotal: number;
  shippingTotal: number;
  taxTotal: number;
  total: number;
  currency: string;
  customerNote?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
  events: OrderEvent[];
  tags?: string[];
  aiAnalysis?: AIAnalysis;
}

interface OrderDetailClientProps {
  order: Order;
  prevOrderId?: string;
  nextOrderId?: string;
}

// ============================================================================
// Status Configuration
// ============================================================================



// ============================================================================
// Helper Components
// ============================================================================

export function OrderDetailClient({ order, prevOrderId, nextOrderId }: OrderDetailClientProps) {
  const router = useRouter();
  return <OrderDetailView order={order} prevOrderId={prevOrderId} nextOrderId={nextOrderId} onBack={() => router.back()} />;
}

export function OrderDetailView({ order, prevOrderId, nextOrderId, onBack }: OrderDetailClientProps & { onBack?: () => void }) {
  const router = useRouter();
  const [internalNote, setInternalNote] = useState(order.internalNotes || "");
  const [isSaving, startSaving] = useTransition();
  const [cancelOpen, setCancelOpen] = useState(false);

  const handleSaveNote = () => {
    startSaving(async () => {
      const fd = new FormData();
      fd.set("orderId", order.id);
      fd.set("notes", internalNote);
      try {
        await updateOrderNotes(fd);
        toast.success("Note saved");
      } catch { toast.error("Failed to save note"); }
    });
  };

  const customerName = [order.customer.firstName, order.customer.lastName]
    .filter(Boolean)
    .join(" ") || "Guest";

  const customerInitials = customerName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(order.orderNumber);
    toast.success("Order number copied");
  };



  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
           
            className="gap-2"
            onClick={() => onBack?.()}
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="size-7" disabled={!prevOrderId} asChild={!!prevOrderId}>
              {prevOrderId ? <Link href={`/dashboard/orders/${prevOrderId}`}><ChevronLeft className="size-4" /></Link> : <ChevronLeft className="size-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="size-7" disabled={!nextOrderId} asChild={!!nextOrderId}>
              {nextOrderId ? <Link href={`/dashboard/orders/${nextOrderId}`}><ChevronRight className="size-4" /></Link> : <ChevronRight className="size-4" />}
            </Button>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold tracking-[-0.4px] text-foreground">
                Order #{order.orderNumber}
              </h1>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                     
                      className="h-7 w-7 p-0"
                      onClick={handleCopyOrderNumber}
                    >
                      <Copy className="size-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy order number</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">
              {format(new Date(order.createdAt), "MMMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2">
                Actions
                <ChevronRight className="size-4 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => window.print()}>
                <Printer className="size-4 mr-2" />
                Print invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                startSaving(async () => {
                  try {
                    const res = await generateInvoice(order.id);
                    if (res.success) toast.success("Invoice generated");
                    else toast.error(res.error || "Failed");
                  } catch { toast.error("Failed to generate invoice"); }
                });
              }}>
                <Download className="size-4 mr-2" />
                Generate invoice
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                if (order.customer.email) {
                  window.location.href = `mailto:${order.customer.email}?subject=Order ${order.orderNumber}`;
                }
              }}>
                <Mail className="size-4 mr-2" />
                Email customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}?action=fulfill`)}>
                <Truck className="size-4 mr-2" />
                Create fulfillment
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/dashboard/orders/${order.id}?action=refund`)}>
                <CreditCard className="size-4 mr-2" />
                Process refund
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setCancelOpen(true)}>
                <XCircle className="size-4 mr-2" />
                Cancel order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={cancelOpen} onOpenChange={setCancelOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel order {order.orderNumber}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will cancel the order and cannot be undone. Any pending payments will be voided.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep order</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    startSaving(async () => {
                      const fd = new FormData();
                      fd.set("orderId", order.id);
                      fd.set("reason", "Cancelled from order detail");
                      try {
                        await cancelOrder(fd);
                        toast.success("Order cancelled");
                        router.refresh();
                      } catch { toast.error("Failed to cancel order"); }
                    });
                  }}
                >
                  Cancel order
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        {/* Left Column - Order Details */}
        <div className="space-y-3">
          {/* AI Insights */}
          <AIInsightsCard analysis={order.aiAnalysis} />

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium text-foreground">
                    Order Items
                  </CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {order.lines.length} {order.lines.length === 1 ? "item" : "items"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.lines.map((line) => (
                  <div key={line.id} className="flex gap-4">
                    <div className="h-16 w-16 rounded-lg bg-muted overflow-hidden shrink-0">
                      {line.productImage ? (
                        <Image
                          src={line.productImage}
                          alt={line.productName}
                          width={64}
                          height={64}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center">
                          <Package className="size-5 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {line.productName}
                      </p>
                      {line.productSku && (
                        <p className="text-xs text-muted-foreground">
                          SKU: {line.productSku}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatCurrency(line.unitPrice, order.currency)} × {line.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        {formatCurrency(line.totalPrice, order.currency)}
                      </p>
                      {line.quantityFulfilled > 0 && (
                        <Badge variant="secondary" className="text-xs mt-1">
                          {line.quantityFulfilled}/{line.quantity} fulfilled
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground tabular-nums">
                    {formatCurrency(order.subtotal, order.currency)}
                  </span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount</span>
                    <span className="text-success tabular-nums">
                      -{formatCurrency(order.discountTotal, order.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground tabular-nums">
                    {order.shippingTotal > 0 
                      ? formatCurrency(order.shippingTotal, order.currency)
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground tabular-nums">
                    {formatCurrency(order.taxTotal, order.currency)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">Total</span>
                  <span className="font-semibold text-foreground tabular-nums">
                    {formatCurrency(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <OrderTimeline events={order.events} />
        </div>

        {/* Right Column - Customer & Sidebar */}
        <div className="space-y-3">
          {/* Customer Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-foreground">
                  Customer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {order.customer.avatarUrl && (
                    <AvatarImage src={order.customer.avatarUrl} alt={order.customer.firstName || "Customer"} />
                  )}
                  <AvatarFallback className="bg-muted text-muted-foreground">
                    {customerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {customerName}
                  </p>
                  {order.customer.isGuest && (
                    <Badge variant="secondary" className="text-xs mt-0.5">
                      Guest
                    </Badge>
                  )}
                </div>
                {order.customer.id && (
                  <Button variant="ghost" asChild>
                    <Link href={`/dashboard/customers/${order.customer.id}`}>
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                )}
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="size-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${order.customer.email}`}
                    className="text-muted-foreground hover:text-info transition-colors"
                  >
                    {order.customer.email}
                  </a>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="size-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {order.customer.phone}
                    </span>
                  </div>
                )}
              </div>

              {/* Customer Stats */}
              {order.customer.totalOrders && (
                <>
                  <Separator className="my-3" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="text-sm font-medium text-foreground tabular-nums">
                        {order.customer.totalOrders}
                      </p>
                    </div>
                    {order.customer.totalSpent && (
                      <div>
                        <p className="text-xs text-muted-foreground">Total Spent</p>
                        <p className="text-sm font-medium text-foreground tabular-nums">
                          {formatCurrency(order.customer.totalSpent, order.currency)}
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Addresses */}
          <AddressCard
            title="Shipping Address"
            address={order.shippingAddress}
            icon={Truck}
          />
          <AddressCard
            title="Billing Address"
            address={order.billingAddress}
            icon={Receipt}
          />

          {/* Customer Note */}
          {order.customerNote && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-medium text-foreground">
                    Customer Note
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {order.customerNote}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-foreground">Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <TagsInput orderId={order.id} initialTags={order.tags ?? []} />
            </CardContent>
          </Card>

          {/* Internal Notes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <StickyNote className="size-4 text-muted-foreground" />
                <CardTitle className="text-sm font-medium text-foreground">
                  Internal Notes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes about this order…"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <Button
                onClick={handleSaveNote}
                className="mt-2"
                disabled={internalNote === order.internalNotes || isSaving}
              >
                {isSaving ? "Saving…" : "Save Note"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
