"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { format, formatDistanceToNow } from "date-fns";
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { cn, formatCurrency } from "@/shared/utils";

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

interface AIAnalysis {
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

interface Order {
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
  aiAnalysis?: AIAnalysis;
}

interface OrderDetailClientProps {
  order: Order;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<string, { 
  label: string; 
  className: string; 
  icon: React.ComponentType<{ className?: string }>;
}> = {
  pending: { 
    label: "Pending", 
    className: "bg-warning/10 text-warning border-warning/20",
    icon: Clock,
  },
  confirmed: { 
    label: "Confirmed", 
    className: "bg-info/10 text-info border-info/20",
    icon: CheckCircle2,
  },
  processing: { 
    label: "Processing", 
    className: "bg-ds-blue-700/10 text-ds-blue-700 border-ds-blue-700/20",
    icon: Package,
  },
  shipped: { 
    label: "Shipped", 
    className: "bg-ds-teal-700/10 text-ds-teal-700 border-ds-teal-700/20",
    icon: Truck,
  },
  delivered: { 
    label: "Delivered", 
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  completed: { 
    label: "Completed", 
    className: "bg-success/10 text-success border-success/20",
    icon: CheckCircle2,
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-destructive/10 text-destructive border-destructive/20",
    icon: XCircle,
  },
};

// ============================================================================
// Helper Components
// ============================================================================

function OrderStatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  
  return (
    <Badge 
      className={cn("gap-1.5 text-sm font-medium border px-3 py-1", config.className)}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}

function SentimentIndicator({ sentiment }: { sentiment: AIAnalysis["sentiment"] }) {
  if (!sentiment) return null;

  const colorMap = {
    positive: "text-success",
    neutral: "text-muted-foreground",
    negative: "text-destructive",
  };

  const bgMap = {
    positive: "bg-success/10",
    neutral: "bg-muted",
    negative: "bg-destructive/10",
  };

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
            bgMap[sentiment.label],
            colorMap[sentiment.label]
          )}>
            <Brain className="h-3 w-3" />
            {sentiment.label.charAt(0).toUpperCase() + sentiment.label.slice(1)}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI Sentiment Analysis</p>
          <p className="text-xs text-muted-foreground">
            Confidence: {Math.round(sentiment.confidence * 100)}%
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function AddressCard({ 
  title, 
  address, 
  icon: Icon 
}: { 
  title: string; 
  address?: OrderAddress; 
  icon: React.ComponentType<{ className?: string }>;
}) {
  if (!address) return null;

  const fullName = [address.firstName, address.lastName].filter(Boolean).join(" ");

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        {fullName && <p className="font-medium">{fullName}</p>}
        {address.company && <p>{address.company}</p>}
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="flex items-center gap-1 mt-2 text-muted-foreground">
            <Phone className="h-3 w-3" />
            {address.phone}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function AIInsightsCard({ analysis }: { analysis?: AIAnalysis }) {
  const [isGenerating, setIsGenerating] = useState(false);

  if (!analysis) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted">
                <Brain className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">AI Insights</p>
                <p className="text-xs text-muted-foreground">Powered by Indigo AI</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={() => setIsGenerating(true)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Brain className="h-4 w-4" />
              )}
              Generate Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border bg-muted">
            <Brain className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-foreground">
              AI Insights
            </CardTitle>
            <CardDescription className="text-xs">
              Powered by Indigo AI
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Sentiment & Risk */}
        <div className="flex items-center gap-3">
          {analysis.sentiment && (
            <SentimentIndicator sentiment={analysis.sentiment} />
          )}
          {analysis.riskScore !== undefined && (
            <div className={cn(
              "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium",
              analysis.riskScore > 0.7 
                ? "bg-destructive/10 text-destructive"
                : analysis.riskScore > 0.4
                ? "bg-warning/10 text-warning"
                : "bg-success/10 text-success"
            )}>
              <AlertTriangle className="h-3 w-3" />
              Risk: {analysis.riskScore > 0.7 ? "High" : analysis.riskScore > 0.4 ? "Medium" : "Low"}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ChevronRight className="h-4 w-4 text-info shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Actions */}
        {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Suggested Actions
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.suggestedActions.map((action, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={action.priority === "high" ? "default" : "outline"}
                  className="text-xs"
                >
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function OrderTimeline({ events }: { events: OrderEvent[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium text-foreground">
            Activity Timeline
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground/50" />
                </div>
                {index < events.length - 1 && (
                  <div className="w-px flex-1 bg-muted my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-foreground">{event.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                  {event.user && ` • ${event.user}`}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function OrderDetailClient({ order }: OrderDetailClientProps) {
  const router = useRouter();
  const [internalNote, setInternalNote] = useState(order.internalNotes || "");

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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
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
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={handleCopyOrderNumber}
                    >
                      <Copy className="h-3.5 w-3.5" />
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
              <Button variant="outline" size="sm" className="gap-2">
                Actions
                <ChevronRight className="h-4 w-4 rotate-90" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem>
                <Printer className="h-4 w-4 mr-2" />
                Print invoice
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Mail className="h-4 w-4 mr-2" />
                Email customer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Truck className="h-4 w-4 mr-2" />
                Create fulfillment
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="h-4 w-4 mr-2" />
                Process refund
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* AI Insights */}
          <AIInsightsCard analysis={order.aiAnalysis} />

          {/* Order Items */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-muted-foreground" />
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
                          <Package className="h-6 w-6 text-muted-foreground" />
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
        <div className="space-y-4">
          {/* Customer Card */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
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
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/customers/${order.customer.id}`}>
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                )}
              </div>

              <Separator className="my-3" />

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`mailto:${order.customer.email}`}
                    className="text-muted-foreground hover:text-info transition-colors"
                  >
                    {order.customer.email}
                  </a>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
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
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
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

          {/* Internal Notes */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
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
                size="sm"
                className="mt-2"
                disabled={internalNote === order.internalNotes}
              >
                Save Note
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}