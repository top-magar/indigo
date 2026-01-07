import type { Meta, StoryObj } from "@storybook/nextjs";
import {
  StatusBadge,
  OrderStatusBadge,
  ProductStatusBadge,
  PaymentStatusBadge,
  FulfillmentStatusBadge,
} from "./status-badge";

const meta: Meta<typeof StatusBadge> = {
  title: "Dashboard/StatusBadge",
  component: StatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const OrderStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <OrderStatusBadge status="pending" />
      <OrderStatusBadge status="confirmed" />
      <OrderStatusBadge status="processing" />
      <OrderStatusBadge status="shipped" />
      <OrderStatusBadge status="delivered" />
      <OrderStatusBadge status="cancelled" />
      <OrderStatusBadge status="refunded" />
    </div>
  ),
};

export const ProductStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ProductStatusBadge status="draft" />
      <ProductStatusBadge status="active" />
      <ProductStatusBadge status="archived" />
    </div>
  ),
};

export const PaymentStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <PaymentStatusBadge status="pending" />
      <PaymentStatusBadge status="paid" />
      <PaymentStatusBadge status="partially_refunded" />
      <PaymentStatusBadge status="refunded" />
      <PaymentStatusBadge status="failed" />
    </div>
  ),
};

export const FulfillmentStatuses: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <FulfillmentStatusBadge status="unfulfilled" />
      <FulfillmentStatusBadge status="partially_fulfilled" />
      <FulfillmentStatusBadge status="fulfilled" />
      <FulfillmentStatusBadge status="returned" />
    </div>
  ),
};

export const WithoutIcons: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <OrderStatusBadge status="pending" showIcon={false} />
      <OrderStatusBadge status="shipped" showIcon={false} />
      <OrderStatusBadge status="delivered" showIcon={false} />
    </div>
  ),
};
