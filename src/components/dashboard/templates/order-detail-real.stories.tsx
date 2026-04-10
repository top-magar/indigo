import type { Meta, StoryObj } from "@storybook/react";
import { OrderDetailView, type Order } from "@/app/dashboard/orders/[id]/order-detail-client";

const mockOrder: Order = {
  id: "ord-1",
  orderNumber: "ORD-1042",
  status: "processing",
  paymentStatus: "paid",
  fulfillmentStatus: "unfulfilled",
  customer: {
    id: "cust-1",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Smith",
    phone: "+1 555-0123",
    avatarUrl: null,
    isGuest: false,
    totalOrders: 8,
    totalSpent: 1240,
  },
  shippingAddress: { addressLine1: "123 Main St", city: "Portland", state: "OR", postalCode: "97201", country: "US" },
  billingAddress: { addressLine1: "123 Main St", city: "Portland", state: "OR", postalCode: "97201", country: "US" },
  lines: [
    { id: "li-1", productName: "Classic T-Shirt (Black, L)", productSku: "TSH-BLK-L", productImage: null, quantity: 2, quantityFulfilled: 0, unitPrice: 29.99, totalPrice: 59.98 },
    { id: "li-2", productName: "Denim Jacket", productSku: "JKT-DNM-M", productImage: null, quantity: 1, quantityFulfilled: 0, unitPrice: 89.99, totalPrice: 89.99 },
  ],
  subtotal: 149.97,
  discountTotal: 15,
  shippingTotal: 5.99,
  taxTotal: 12.15,
  total: 153.11,
  currency: "USD",
  customerNote: "Please gift wrap if possible",
  internalNotes: "",
  createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  updatedAt: new Date().toISOString(),
  events: [
    { id: "ev-1", type: "created", message: "Order placed", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
    { id: "ev-2", type: "payment", message: "Payment captured via Stripe", createdAt: new Date(Date.now() - 86400000 * 2 + 60000).toISOString() },
    { id: "ev-3", type: "status", message: "Status changed to processing", createdAt: new Date(Date.now() - 86400000).toISOString(), user: "Admin" },
  ],
};

const meta: Meta<typeof OrderDetailView> = {
  component: OrderDetailView,
  title: "Pages/Dashboard/Order Detail (Real)",
  parameters: { layout: "padded" },
};
export default meta;
type Story = StoryObj<typeof OrderDetailView>;

export const Default: Story = { args: { order: mockOrder } };
export const GuestOrder: Story = { args: { order: { ...mockOrder, customer: { ...mockOrder.customer, id: null, isGuest: true, firstName: null, lastName: null, totalOrders: undefined, totalSpent: undefined } } } };
export const Delivered: Story = { args: { order: { ...mockOrder, status: "delivered", fulfillmentStatus: "fulfilled" } } };
export const Cancelled: Story = { args: { order: { ...mockOrder, status: "cancelled" } } };
