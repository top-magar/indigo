import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  OrderDetailPanel,
  type OrderDetailPanelOrder,
} from "./order-detail-panel";

const meta: Meta<typeof OrderDetailPanel> = {
  title: "Dashboard/Orders/OrderDetailPanel",
  component: OrderDetailPanel,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    open: { control: "boolean" },
    onOpenChange: { action: "onOpenChange" },
    onUpdateStatus: { action: "onUpdateStatus" },
    onAddTracking: { action: "onAddTracking" },
    onPrint: { action: "onPrint" },
    onRefund: { action: "onRefund" },
  },
};

export default meta;
type Story = StoryObj<typeof OrderDetailPanel>;

// ============================================================================
// Mock Data
// ============================================================================

const mockOrder: OrderDetailPanelOrder = {
  id: "ord_123456",
  orderNumber: "1001",
  status: "processing",
  paymentStatus: "paid",
  fulfillmentStatus: "unfulfilled",
  customer: {
    id: "cust_789",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    phone: "+1 (555) 123-4567",
    isGuest: false,
  },
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    addressLine1: "123 Main Street",
    addressLine2: "Apt 4B",
    city: "New York",
    state: "NY",
    postalCode: "10001",
    country: "United States",
    phone: "+1 (555) 123-4567",
  },
  subtotal: 149.97,
  shippingTotal: 9.99,
  taxTotal: 12.75,
  discountTotal: 15.0,
  total: 157.71,
  currency: "USD",
  discountCode: "SAVE10",
  shippingMethod: "Standard",
  lines: [
    {
      id: "line_1",
      productName: "Premium Wireless Headphones",
      productSku: "WH-1000XM5",
      productImage: "https://picsum.photos/seed/headphones/200",
      quantity: 1,
      quantityFulfilled: 0,
      unitPrice: 99.99,
      totalPrice: 99.99,
    },
    {
      id: "line_2",
      productName: "USB-C Charging Cable (2-Pack)",
      productSku: "USB-C-2PK",
      productImage: "https://picsum.photos/seed/cable/200",
      quantity: 2,
      quantityFulfilled: 0,
      unitPrice: 14.99,
      totalPrice: 29.98,
    },
    {
      id: "line_3",
      productName: "Laptop Stand - Aluminum",
      productSku: "LS-ALU-001",
      productImage: null,
      quantity: 1,
      quantityFulfilled: 0,
      unitPrice: 19.99,
      totalPrice: 19.99,
    },
  ],
  events: [
    {
      id: "evt_3",
      type: "payment_captured",
      message: "Payment of $157.71 captured",
      userName: "System",
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: "evt_2",
      type: "order_confirmed",
      message: "Order confirmed",
      userName: "System",
      createdAt: new Date(Date.now() - 3700000).toISOString(),
    },
  ],
  createdAt: new Date(Date.now() - 3800000).toISOString(),
};

const guestOrder: OrderDetailPanelOrder = {
  ...mockOrder,
  id: "ord_guest_456",
  orderNumber: "1002",
  customer: {
    id: null,
    email: "guest@example.com",
    firstName: null,
    lastName: null,
    phone: null,
    isGuest: true,
  },
};

const shippedOrder: OrderDetailPanelOrder = {
  ...mockOrder,
  id: "ord_shipped_789",
  orderNumber: "1003",
  status: "shipped",
  fulfillmentStatus: "fulfilled",
  lines: mockOrder.lines.map((line) => ({
    ...line,
    quantityFulfilled: line.quantity,
  })),
  events: [
    {
      id: "evt_ship_1",
      type: "fulfillment_shipped",
      message: "Package shipped via FedEx",
      userName: "Warehouse Team",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: "evt_ship_2",
      type: "tracking_updated",
      message: "Tracking number: 1Z999AA10123456784",
      userName: "System",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    ...mockOrder.events,
  ],
};

const cancelledOrder: OrderDetailPanelOrder = {
  ...mockOrder,
  id: "ord_cancelled_101",
  orderNumber: "1004",
  status: "cancelled",
  paymentStatus: "refunded",
  fulfillmentStatus: "unfulfilled",
  events: [
    {
      id: "evt_cancel_1",
      type: "order_cancelled",
      message: "Order cancelled by customer",
      userName: "John Doe",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: "evt_cancel_2",
      type: "payment_refunded",
      message: "Full refund of $157.71 processed",
      userName: "System",
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    ...mockOrder.events,
  ],
};

// ============================================================================
// Stories
// ============================================================================

export const Default: Story = {
  args: {
    order: mockOrder,
    open: true,
  },
};

export const Interactive: Story = {
  render: function InteractiveStory() {
    const [open, setOpen] = useState(false);

    return (
      <div className="p-8">
        <Button onClick={() => setOpen(true)}>View Order Details</Button>
        <OrderDetailPanel
          order={mockOrder}
          open={open}
          onOpenChange={setOpen}
          onUpdateStatus={(id) => console.log("Update status:", id)}
          onAddTracking={(id) => console.log("Add tracking:", id)}
          onPrint={(id) => console.log("Print:", id)}
          onRefund={(id) => console.log("Refund:", id)}
        />
      </div>
    );
  },
};

export const GuestOrder: Story = {
  args: {
    order: guestOrder,
    open: true,
  },
};

export const ShippedOrder: Story = {
  args: {
    order: shippedOrder,
    open: true,
  },
};

export const CancelledOrder: Story = {
  args: {
    order: cancelledOrder,
    open: true,
  },
};

export const WithManyItems: Story = {
  args: {
    order: {
      ...mockOrder,
      lines: [
        ...mockOrder.lines,
        {
          id: "line_4",
          productName: "Wireless Mouse - Ergonomic Design",
          productSku: "WM-ERG-001",
          productImage: "https://picsum.photos/seed/mouse/200",
          quantity: 1,
          quantityFulfilled: 0,
          unitPrice: 49.99,
          totalPrice: 49.99,
        },
        {
          id: "line_5",
          productName: "Mechanical Keyboard - RGB Backlit",
          productSku: "KB-RGB-001",
          productImage: "https://picsum.photos/seed/keyboard/200",
          quantity: 1,
          quantityFulfilled: 0,
          unitPrice: 129.99,
          totalPrice: 129.99,
        },
        {
          id: "line_6",
          productName: "Monitor Stand with USB Hub",
          productSku: "MS-USB-001",
          productImage: null,
          quantity: 1,
          quantityFulfilled: 0,
          unitPrice: 79.99,
          totalPrice: 79.99,
        },
      ],
      subtotal: 429.93,
      taxTotal: 36.54,
      total: 461.46,
    },
    open: true,
  },
};

export const WithManyEvents: Story = {
  args: {
    order: {
      ...mockOrder,
      events: [
        {
          id: "evt_many_1",
          type: "note_added",
          message: "Customer called about delivery time",
          userName: "Support Agent",
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          id: "evt_many_2",
          type: "email_sent",
          message: "Shipping confirmation email sent",
          userName: "System",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "evt_many_3",
          type: "fulfillment_created",
          message: "Fulfillment created for 3 items",
          userName: "Warehouse",
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: "evt_many_4",
          type: "payment_captured",
          message: "Payment of $157.71 captured",
          userName: "System",
          createdAt: new Date(Date.now() - 10800000).toISOString(),
        },
        {
          id: "evt_many_5",
          type: "payment_authorized",
          message: "Payment authorized",
          userName: "System",
          createdAt: new Date(Date.now() - 14400000).toISOString(),
        },
        {
          id: "evt_many_6",
          type: "order_confirmed",
          message: "Order confirmed",
          userName: "System",
          createdAt: new Date(Date.now() - 18000000).toISOString(),
        },
      ],
    },
    open: true,
  },
};

export const NoShippingAddress: Story = {
  args: {
    order: {
      ...mockOrder,
      shippingAddress: null,
    },
    open: true,
  },
};

export const FreeShipping: Story = {
  args: {
    order: {
      ...mockOrder,
      shippingTotal: 0,
      shippingMethod: "Free Shipping",
      total: 147.72,
    },
    open: true,
  },
};

export const NoDiscount: Story = {
  args: {
    order: {
      ...mockOrder,
      discountTotal: 0,
      discountCode: null,
      total: 172.71,
    },
    open: true,
  },
};

export const WithoutActions: Story = {
  args: {
    order: mockOrder,
    open: true,
    onUpdateStatus: undefined,
    onAddTracking: undefined,
    onPrint: undefined,
    onRefund: undefined,
  },
};
