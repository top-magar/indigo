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
    className: "bg-[var(--ds-amber-100)] text-[var(--ds-amber-800)] border-[var(--ds-amber-200)]",
    icon: Clock,
  },
  confirmed: { 
    label: "Confirmed", 
    className: "bg-[var(--ds-blue-100)] text-[var(--ds-blue-800)] border-[var(--ds-blue-200)]",
    icon: CheckCircle2,
  },
  processing: { 
    label: "Processing", 
    className: "bg-[var(--ds-purple-100)] text-[var(--ds-purple-800)] border-[var(--ds-purple-200)]",
    icon: Package,
  },
  shipped: { 
    label: "Shipped", 
    className: "bg-[var(--ds-cyan-100)] text-[var(--ds-cyan-800)] border-[var(--ds-cyan-200)]",
    icon: Truck,
  },
  delivered: { 
    label: "Delivered", 
    className: "bg-[var(--ds-green-100)] text-[var(--ds-green-800)] border-[var(--ds-green-200)]",
    icon: CheckCircle2,
  },
  completed: { 
    label: "Completed", 
    className: "bg-[var(--ds-green-100)] text-[var(--ds-green-800)] border-[var(--ds-green-200)]",
    icon: CheckCircle2,
  },
  cancelled: { 
    label: "Cancelled", 
    className: "bg-[var(--ds-red-100)] text-[var(--ds-red-800)] border-[var(--ds-red-200)]",
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
      variant="secondary" 
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
    positive: "text-[var(--ds-green-600)]",
    neutral: "text-[var(--ds-gray-600)]",
    negative: "text-[var(--ds-red-600)]",
  };

  const bgMap = {
    positive: "bg-[var(--ds-green-100)]",
    neutral: "bg-[var(--ds-gray-100)]",
    negative: "bg-[var(--ds-red-100)]",
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
          <p className="text-xs text-[var(--ds-gray-500)]">
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
    <Card className="border-[var(--ds-gray-200)]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-[var(--ds-gray-600)]" />
          <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-[var(--ds-gray-700)] space-y-1">
        {fullName && <p className="font-medium">{fullName}</p>}
        {address.company && <p>{address.company}</p>}
        <p>{address.addressLine1}</p>
        {address.addressLine2 && <p>{address.addressLine2}</p>}
        <p>
          {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
        </p>
        <p>{address.country}</p>
        {address.phone && (
          <p className="flex items-center gap-1 mt-2 text-[var(--ds-gray-600)]">
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
      <Card className="border-[var(--ds-gray-200)]">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-gray-200)] bg-[var(--ds-gray-100)]">
                <Brain className="h-4 w-4 text-[var(--ds-gray-700)]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--ds-gray-900)]">AI Insights</p>
                <p className="text-xs text-[var(--ds-gray-600)]">Powered by Indigo AI</p>
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
    <Card className="border-[var(--ds-gray-200)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--ds-gray-200)] bg-[var(--ds-gray-100)]">
            <Brain className="h-4 w-4 text-[var(--ds-gray-700)]" />
          </div>
          <div>
            <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
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
                ? "bg-[var(--ds-red-100)] text-[var(--ds-red-700)]"
                : analysis.riskScore > 0.4
                ? "bg-[var(--ds-amber-100)] text-[var(--ds-amber-700)]"
                : "bg-[var(--ds-green-100)] text-[var(--ds-green-700)]"
            )}>
              <AlertTriangle className="h-3 w-3" />
              Risk: {analysis.riskScore > 0.7 ? "High" : analysis.riskScore > 0.4 ? "Medium" : "Low"}
            </div>
          )}
        </div>

        {/* Recommendations */}
        {analysis.recommendations && analysis.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--ds-gray-600)] uppercase tracking-wider">
              Recommendations
            </p>
            <ul className="space-y-1.5">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-[var(--ds-gray-700)]">
                  <ChevronRight className="h-4 w-4 text-[var(--ds-blue-600)] shrink-0 mt-0.5" />
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Actions */}
        {analysis.suggestedActions && analysis.suggestedActions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-[var(--ds-gray-600)] uppercase tracking-wider">
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
    <Card className="border-[var(--ds-gray-200)]">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-[var(--ds-gray-600)]" />
          <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
            Activity Timeline
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, index) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--ds-gray-100)]">
                  <div className="h-2 w-2 rounded-full bg-[var(--ds-gray-400)]" />
                </div>
                {index < events.length - 1 && (
                  <div className="w-px flex-1 bg-[var(--ds-gray-200)] my-1" />
                )}
              </div>
              <div className="flex-1 pb-4">
                <p className="text-sm text-[var(--ds-gray-800)]">{event.message}</p>
                <p className="text-xs text-[var(--ds-gray-500)] mt-0.5">
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
    <div className="space-y-6">
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
              <h1 className="text-xl font-semibold text-[var(--ds-gray-1000)]">
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
            <p className="text-sm text-[var(--ds-gray-600)] mt-0.5">
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
              <DropdownMenuItem className="text-[var(--ds-red-700)]">
                <XCircle className="h-4 w-4 mr-2" />
                Cancel order
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Order Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* AI Insights */}
          <AIInsightsCard analysis={order.aiAnalysis} />

          {/* Order Items */}
          <Card className="border-[var(--ds-gray-200)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4 text-[var(--ds-gray-600)]" />
                  <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
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
                    <div className="h-16 w-16 rounded-lg bg-[var(--ds-gray-100)] overflow-hidden shrink-0">
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
                          <Package className="h-6 w-6 text-[var(--ds-gray-400)]" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--ds-gray-900)] truncate">
                        {line.productName}
                      </p>
                      {line.productSku && (
                        <p className="text-xs text-[var(--ds-gray-500)]">
                          SKU: {line.productSku}
                        </p>
                      )}
                      <p className="text-sm text-[var(--ds-gray-600)] mt-1">
                        {formatCurrency(line.unitPrice, order.currency)} × {line.quantity}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-[var(--ds-gray-900)] tabular-nums">
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
                  <span className="text-[var(--ds-gray-600)]">Subtotal</span>
                  <span className="text-[var(--ds-gray-800)] tabular-nums">
                    {formatCurrency(order.subtotal, order.currency)}
                  </span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--ds-gray-600)]">Discount</span>
                    <span className="text-[var(--ds-green-700)] tabular-nums">
                      -{formatCurrency(order.discountTotal, order.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ds-gray-600)]">Shipping</span>
                  <span className="text-[var(--ds-gray-800)] tabular-nums">
                    {order.shippingTotal > 0 
                      ? formatCurrency(order.shippingTotal, order.currency)
                      : "Free"}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--ds-gray-600)]">Tax</span>
                  <span className="text-[var(--ds-gray-800)] tabular-nums">
                    {formatCurrency(order.taxTotal, order.currency)}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between">
                  <span className="font-medium text-[var(--ds-gray-900)]">Total</span>
                  <span className="font-semibold text-[var(--ds-gray-1000)] tabular-nums">
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
        <div className="space-y-6">
          {/* Customer Card */}
          <Card className="border-[var(--ds-gray-200)]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-[var(--ds-gray-600)]" />
                <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
                  Customer
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  {order.customer.avatarUrl && (
                    <AvatarImage src={order.customer.avatarUrl} />
                  )}
                  <AvatarFallback className="bg-[var(--ds-gray-200)] text-[var(--ds-gray-700)]">
                    {customerInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[var(--ds-gray-900)]">
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
                  <Mail className="h-4 w-4 text-[var(--ds-gray-500)]" />
                  <a 
                    href={`mailto:${order.customer.email}`}
                    className="text-[var(--ds-gray-700)] hover:text-[var(--ds-blue-700)] transition-colors"
                  >
                    {order.customer.email}
                  </a>
                </div>
                {order.customer.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-[var(--ds-gray-500)]" />
                    <span className="text-[var(--ds-gray-700)]">
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
                      <p className="text-xs text-[var(--ds-gray-500)]">Total Orders</p>
                      <p className="text-sm font-medium text-[var(--ds-gray-900)] tabular-nums">
                        {order.customer.totalOrders}
                      </p>
                    </div>
                    {order.customer.totalSpent && (
                      <div>
                        <p className="text-xs text-[var(--ds-gray-500)]">Total Spent</p>
                        <p className="text-sm font-medium text-[var(--ds-gray-900)] tabular-nums">
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
            <Card className="border-[var(--ds-gray-200)]">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[var(--ds-gray-600)]" />
                  <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
                    Customer Note
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[var(--ds-gray-700)] whitespace-pre-wrap">
                  {order.customerNote}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Internal Notes */}
          <Card className="border-[var(--ds-gray-200)]">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <StickyNote className="h-4 w-4 text-[var(--ds-gray-600)]" />
                <CardTitle className="text-sm font-medium text-[var(--ds-gray-900)]">
                  Internal Notes
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Add internal notes about this order…"
                value={internalNote}
                onChange={(e) => setInternalNote(e.target.value)}
                className="min-h-[80px] text-sm border-[var(--ds-gray-300)]"
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