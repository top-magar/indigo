import type { Meta, StoryObj } from "@storybook/nextjs";
import { Price, PriceRange, FreePrice, SmartPrice } from "./price";

const meta: Meta<typeof Price> = {
  title: "UI/Price",
  component: Price,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    amount: {
      control: "number",
      description: "Price amount",
    },
    currency: {
      control: "select",
      options: ["USD", "EUR", "GBP", "JPY", "CNY", "INR", "NPR", "AUD", "CAD", "BRL"],
      description: "Currency code",
    },
    size: {
      control: "select",
      options: ["xs", "sm", "default", "lg", "xl"],
      description: "Size variant",
    },
    showSymbol: {
      control: "boolean",
      description: "Show currency symbol",
    },
    compact: {
      control: "boolean",
      description: "Use compact notation for large numbers",
    },
  },
};

export default meta;
type Story = StoryObj<typeof Price>;

// Basic Price
export const Default: Story = {
  args: {
    amount: 99.99,
    currency: "USD",
  },
};

// Different Currencies
export const Currencies: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">USD:</span>
        <Price amount={1234.56} currency="USD" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">EUR:</span>
        <Price amount={1234.56} currency="EUR" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">GBP:</span>
        <Price amount={1234.56} currency="GBP" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">JPY:</span>
        <Price amount={1234} currency="JPY" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">INR:</span>
        <Price amount={1234.56} currency="INR" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">NPR:</span>
        <Price amount={1234.56} currency="NPR" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">BRL:</span>
        <Price amount={1234.56} currency="BRL" />
      </div>
    </div>
  ),
};

// Size Variants
export const Sizes: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">xs:</span>
        <Price amount={99.99} currency="USD" size="xs" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">sm:</span>
        <Price amount={99.99} currency="USD" size="sm" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">default:</span>
        <Price amount={99.99} currency="USD" size="default" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">lg:</span>
        <Price amount={99.99} currency="USD" size="lg" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">xl:</span>
        <Price amount={99.99} currency="USD" size="xl" />
      </div>
    </div>
  ),
};

// With Discount
export const WithDiscount: Story = {
  args: {
    amount: 79.99,
    originalAmount: 99.99,
    currency: "USD",
  },
};

// With Discount Badge
export const WithDiscountBadge: Story = {
  args: {
    amount: 79.99,
    originalAmount: 99.99,
    currency: "USD",
    showDiscountBadge: true,
  },
};

// Compact Notation
export const CompactNotation: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">1,500:</span>
        <Price amount={1500} currency="USD" compact />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">15,000:</span>
        <Price amount={15000} currency="USD" compact />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">150,000:</span>
        <Price amount={150000} currency="USD" compact />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">1,500,000:</span>
        <Price amount={1500000} currency="USD" compact />
      </div>
    </div>
  ),
};

// Without Symbol
export const WithoutSymbol: Story = {
  args: {
    amount: 99.99,
    currency: "USD",
    showSymbol: false,
  },
};

// With Currency Code
export const WithCurrencyCode: Story = {
  args: {
    amount: 99.99,
    currency: "USD",
    showCode: true,
  },
};

// Price Range
export const Range: StoryObj<typeof PriceRange> = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Different:</span>
        <PriceRange min={10} max={50} currency="USD" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Same:</span>
        <PriceRange min={25} max={25} currency="USD" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Large:</span>
        <PriceRange min={100} max={500} currency="EUR" size="lg" />
      </div>
    </div>
  ),
};

// Free Price
export const Free: StoryObj<typeof FreePrice> = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">Default:</span>
        <FreePrice />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">Custom:</span>
        <FreePrice text="No charge" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-20 text-sm text-muted-foreground">Large:</span>
        <FreePrice size="xl" />
      </div>
    </div>
  ),
};

// Smart Price (handles zero)
export const Smart: StoryObj<typeof SmartPrice> = {
  render: () => (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">With price:</span>
        <SmartPrice amount={99.99} currency="USD" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Zero price:</span>
        <SmartPrice amount={0} currency="USD" />
      </div>
      <div className="flex items-center gap-4">
        <span className="w-32 text-sm text-muted-foreground">Custom free:</span>
        <SmartPrice amount={0} currency="USD" freeText="Complimentary" />
      </div>
    </div>
  ),
};

// Product Card Example
export const ProductCardExample: Story = {
  render: () => (
    <div className="w-64 rounded-lg border bg-card p-4 shadow-sm">
      <div className="aspect-square rounded-md bg-muted mb-4" />
      <h3 className="font-medium">Premium Headphones</h3>
      <p className="text-sm text-muted-foreground mb-2">Wireless, Noise-canceling</p>
      <Price
        amount={249.99}
        originalAmount={299.99}
        currency="USD"
        showDiscountBadge
        size="lg"
      />
    </div>
  ),
};
