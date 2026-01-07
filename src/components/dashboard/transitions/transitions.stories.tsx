import type { Meta, StoryObj } from "@storybook/nextjs";
import { PageTransition } from "./page-transition";
import { StaggerChildren } from "./stagger-children";
import { FadeIn, FadeInOnScroll } from "./fade-in";

// ============================================================================
// Page Transition Stories
// ============================================================================

const PageTransitionMeta: Meta<typeof PageTransition> = {
  title: "Dashboard/Transitions/PageTransition",
  component: PageTransition,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    duration: {
      control: { type: "range", min: 50, max: 500, step: 10 },
      description: "Animation duration in milliseconds",
    },
    distance: {
      control: { type: "range", min: 0, max: 24, step: 2 },
      description: "Slide distance in pixels",
    },
    delay: {
      control: { type: "range", min: 0, max: 500, step: 50 },
      description: "Delay before animation starts",
    },
    disabled: {
      control: "boolean",
      description: "Disable animation entirely",
    },
  },
};

export default PageTransitionMeta;
type PageTransitionStory = StoryObj<typeof PageTransition>;

export const Default: PageTransitionStory = {
  render: (args) => (
    <PageTransition {...args}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Dashboard Page</h2>
        <p className="text-muted-foreground">
          This content fades in with a subtle slide up animation.
          The animation is fast (180ms) and non-distracting.
        </p>
      </div>
    </PageTransition>
  ),
};

export const CustomDuration: PageTransitionStory = {
  args: {
    duration: 300,
    distance: 12,
  },
  render: (args) => (
    <PageTransition {...args}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Slower Animation</h2>
        <p className="text-muted-foreground">
          This uses a 300ms duration with 12px slide distance.
        </p>
      </div>
    </PageTransition>
  ),
};

export const WithDelay: PageTransitionStory = {
  args: {
    delay: 200,
  },
  render: (args) => (
    <PageTransition {...args}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Delayed Animation</h2>
        <p className="text-muted-foreground">
          This animation starts after a 200ms delay.
        </p>
      </div>
    </PageTransition>
  ),
};

export const Disabled: PageTransitionStory = {
  args: {
    disabled: true,
  },
  render: (args) => (
    <PageTransition {...args}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">No Animation</h2>
        <p className="text-muted-foreground">
          Animation is disabled. Content appears immediately.
        </p>
      </div>
    </PageTransition>
  ),
};

// ============================================================================
// Stagger Children Stories
// ============================================================================

export const StaggerFade: StoryObj<typeof StaggerChildren> = {
  name: "Stagger - Fade",
  render: () => (
    <StaggerChildren variant="fade" staggerDelay={50}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-4 mb-2">
          <h3 className="font-medium">Card {i}</h3>
          <p className="text-sm text-muted-foreground">
            This card fades in with staggered timing.
          </p>
        </div>
      ))}
    </StaggerChildren>
  ),
};

export const StaggerSlideUp: StoryObj<typeof StaggerChildren> = {
  name: "Stagger - Slide Up",
  render: () => (
    <StaggerChildren variant="slide-up" staggerDelay={40}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-4 mb-2">
          <h3 className="font-medium">Card {i}</h3>
          <p className="text-sm text-muted-foreground">
            This card slides up with staggered timing.
          </p>
        </div>
      ))}
    </StaggerChildren>
  ),
};

export const StaggerScale: StoryObj<typeof StaggerChildren> = {
  name: "Stagger - Scale",
  render: () => (
    <StaggerChildren variant="scale" staggerDelay={60}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-4 mb-2">
          <h3 className="font-medium">Card {i}</h3>
          <p className="text-sm text-muted-foreground">
            This card scales in with staggered timing.
          </p>
        </div>
      ))}
    </StaggerChildren>
  ),
};

export const StaggerGrid: StoryObj<typeof StaggerChildren> = {
  name: "Stagger - Grid Layout",
  render: () => (
    <StaggerChildren
      variant="slide-up"
      staggerDelay={30}
      className="grid grid-cols-3 gap-4"
    >
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-4 aspect-square flex items-center justify-center">
          <span className="text-2xl font-bold text-muted-foreground">{i}</span>
        </div>
      ))}
    </StaggerChildren>
  ),
};

export const StaggerFastDelay: StoryObj<typeof StaggerChildren> = {
  name: "Stagger - Fast (30ms delay)",
  render: () => (
    <StaggerChildren variant="fade" staggerDelay={30} duration={100}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="rounded-lg border bg-card p-3 mb-1">
          <span className="text-sm">Item {i}</span>
        </div>
      ))}
    </StaggerChildren>
  ),
};

// ============================================================================
// Fade In Stories
// ============================================================================

export const FadeInSimple: StoryObj<typeof FadeIn> = {
  name: "FadeIn - Simple",
  render: () => (
    <FadeIn>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-2">Simple Fade</h2>
        <p className="text-muted-foreground">
          This content fades in without any movement.
        </p>
      </div>
    </FadeIn>
  ),
};

export const FadeInWithScale: StoryObj<typeof FadeIn> = {
  name: "FadeIn - With Scale",
  render: () => (
    <FadeIn withScale initialScale={0.95}>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-xl font-semibold mb-2">Fade with Scale</h2>
        <p className="text-muted-foreground">
          This content fades in with a subtle scale effect.
        </p>
      </div>
    </FadeIn>
  ),
};

export const FadeInDirections: StoryObj<typeof FadeIn> = {
  name: "FadeIn - Directions",
  render: () => (
    <div className="grid grid-cols-2 gap-4">
      <FadeIn direction="up" delay={0}>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">From Bottom</h3>
          <p className="text-sm text-muted-foreground">direction=&quot;up&quot;</p>
        </div>
      </FadeIn>
      <FadeIn direction="down" delay={100}>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">From Top</h3>
          <p className="text-sm text-muted-foreground">direction=&quot;down&quot;</p>
        </div>
      </FadeIn>
      <FadeIn direction="left" delay={200}>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">From Right</h3>
          <p className="text-sm text-muted-foreground">direction=&quot;left&quot;</p>
        </div>
      </FadeIn>
      <FadeIn direction="right" delay={300}>
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-medium">From Left</h3>
          <p className="text-sm text-muted-foreground">direction=&quot;right&quot;</p>
        </div>
      </FadeIn>
    </div>
  ),
};

export const FadeInOnScrollExample: StoryObj<typeof FadeInOnScroll> = {
  name: "FadeInOnScroll",
  render: () => (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-6">
        <p className="text-muted-foreground">
          Scroll down to see the animation trigger when elements enter the viewport.
        </p>
      </div>
      <div className="h-[300px]" />
      <FadeInOnScroll direction="up" threshold={0.2}>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Scroll Triggered</h2>
          <p className="text-muted-foreground">
            This content animates when it enters the viewport.
          </p>
        </div>
      </FadeInOnScroll>
      <div className="h-[200px]" />
      <FadeInOnScroll direction="up" threshold={0.2}>
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-xl font-semibold mb-2">Another Section</h2>
          <p className="text-muted-foreground">
            Each section animates independently as you scroll.
          </p>
        </div>
      </FadeInOnScroll>
    </div>
  ),
};

// ============================================================================
// Combined Examples
// ============================================================================

export const DashboardExample: StoryObj = {
  name: "Dashboard Page Example",
  render: () => (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back!</p>
        </div>

        <StaggerChildren variant="slide-up" staggerDelay={40} className="grid grid-cols-4 gap-4">
          {["Revenue", "Orders", "Customers", "Products"].map((stat) => (
            <div key={stat} className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">{stat}</p>
              <p className="text-2xl font-bold">$12,345</p>
            </div>
          ))}
        </StaggerChildren>

        <FadeIn delay={200}>
          <div className="rounded-lg border bg-card p-6">
            <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
            <StaggerChildren variant="fade" staggerDelay={30} initialDelay={100}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="py-2 border-b last:border-0">
                  <p className="text-sm">Activity item {i}</p>
                </div>
              ))}
            </StaggerChildren>
          </div>
        </FadeIn>
      </div>
    </PageTransition>
  ),
};

export const TableRowsExample: StoryObj = {
  name: "Table Rows Example",
  render: () => (
    <PageTransition>
      <div className="rounded-lg border">
        <div className="border-b bg-muted/50 px-4 py-3">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium">
            <span>Product</span>
            <span>Status</span>
            <span>Price</span>
            <span>Stock</span>
          </div>
        </div>
        <StaggerChildren variant="fade" staggerDelay={25}>
          {["Widget A", "Widget B", "Widget C", "Widget D", "Widget E"].map((product) => (
            <div key={product} className="border-b last:border-0 px-4 py-3">
              <div className="grid grid-cols-4 gap-4 text-sm">
                <span className="font-medium">{product}</span>
                <span className="text-green-600">Active</span>
                <span>$99.00</span>
                <span>150</span>
              </div>
            </div>
          ))}
        </StaggerChildren>
      </div>
    </PageTransition>
  ),
};
