"use client";

import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Store01Icon,
  SparklesIcon,
  ShoppingBag01Icon,
  ChartLineData01Icon,
  PaintBrushIcon,
  CreditCardIcon,
  ArrowRight01Icon,
  RocketIcon,
} from "@hugeicons/core-free-icons";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/shared/utils";

interface Feature {
  icon: typeof Store01Icon;
  title: string;
  description: string;
  color: string;
}

const DEFAULT_FEATURES: Feature[] = [
  {
    icon: ShoppingBag01Icon,
    title: "Product Management",
    description: "Add and organize your products with ease",
    color: "chart-1",
  },
  {
    icon: ChartLineData01Icon,
    title: "Analytics Dashboard",
    description: "Track sales, orders, and customer insights",
    color: "chart-2",
  },
  {
    icon: PaintBrushIcon,
    title: "Storefront Editor",
    description: "Customize your store's look and feel",
    color: "chart-5",
  },
  {
    icon: CreditCardIcon,
    title: "Payment Processing",
    description: "Accept payments securely online",
    color: "chart-4",
  },
];

interface WelcomeModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal state changes */
  onOpenChange: (open: boolean) => void;
  /** Store name to display */
  storeName: string;
  /** Optional merchant name for personalization */
  merchantName?: string;
  /** Custom features to display (defaults to standard features) */
  features?: Feature[];
  /** Callback when "Get Started" is clicked */
  onGetStarted?: () => void;
  /** Callback when "Skip Tour" is clicked */
  onSkipTour?: () => void;
  /** Whether to show the skip option */
  showSkip?: boolean;
}

export function WelcomeModal({
  open,
  onOpenChange,
  storeName,
  merchantName,
  features = DEFAULT_FEATURES,
  onGetStarted,
  onSkipTour,
  showSkip = true,
}: WelcomeModalProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 2;

  const handleGetStarted = () => {
    onOpenChange(false);
    onGetStarted?.();
  };

  const handleSkip = () => {
    onOpenChange(false);
    onSkipTour?.();
  };

  const handleNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleGetStarted();
    }
  };

  const handleBack = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-lg p-0 gap-0 overflow-hidden"
        showCloseButton={false}
      >
        <div className="relative min-h-[400px]">
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out p-6",
              currentSlide === 0
                ? "opacity-100 translate-x-0"
                : "opacity-0 -translate-x-full pointer-events-none"
            )}
          >
            <WelcomeSlide
              storeName={storeName}
              merchantName={merchantName}
            />
          </div>

          <div
            className={cn(
              "absolute inset-0 transition-all duration-300 ease-in-out p-6",
              currentSlide === 1
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-full pointer-events-none"
            )}
          >
            <FeaturesSlide features={features} />
          </div>
        </div>

        <div className="p-6 pt-0 border-t bg-muted/30">
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: totalSlides }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  currentSlide === i
                    ? "w-6 bg-primary"
                    : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between">
            <div>
              {currentSlide > 0 ? (
                <Button variant="ghost" onClick={handleBack}>
                  Back
                </Button>
              ) : showSkip ? (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip tour
                </Button>
              ) : (
                <div />
              )}
            </div>

            <Button onClick={handleNext}>
              {currentSlide === totalSlides - 1 ? (
                <>
                  Get Started
                  <HugeiconsIcon icon={RocketIcon} className="w-4 h-4 ml-2" />
                </>
              ) : (
                <>
                  Next
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function WelcomeSlide({
  storeName,
  merchantName,
}: {
  storeName: string;
  merchantName?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center h-full justify-center">
      <div className="relative mb-6">
        <div className="h-20 w-20 rounded-2xl bg-primary/10 flex items-center justify-center">
          <HugeiconsIcon icon={Store01Icon} className="w-10 h-10 text-primary" />
        </div>
        <div className="absolute -top-2 -right-2">
          <HugeiconsIcon
            icon={SparklesIcon}
            className="w-6 h-6 text-chart-1 animate-pulse"
          />
        </div>
        <div className="absolute -bottom-1 -left-2">
          <HugeiconsIcon
            icon={SparklesIcon}
            className="w-4 h-4 text-chart-2 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          />
        </div>
      </div>

      <DialogHeader className="text-center">
        <DialogTitle className="text-2xl">
          Welcome{merchantName ? `, ${merchantName}` : ""}! 👋
        </DialogTitle>
        <DialogDescription className="text-base mt-2">
          Your store <span className="font-semibold text-foreground">{storeName}</span> is ready to go.
          Let&apos;s take a quick tour to help you get started.
        </DialogDescription>
      </DialogHeader>

      <div className="mt-8 grid grid-cols-3 gap-4 w-full max-w-sm">
        <QuickStat label="Products" value="0" />
        <QuickStat label="Orders" value="0" />
        <QuickStat label="Revenue" value="$0" />
      </div>

      <p className="text-sm text-muted-foreground mt-6">
        Don&apos;t worry, we&apos;ll help you fill these in!
      </p>
    </div>
  );
}

function QuickStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-lg bg-muted/50 text-center">
      <p className="text-lg font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}

function FeaturesSlide({ features }: { features: Feature[] }) {
  return (
    <div className="h-full flex flex-col">
      <DialogHeader className="text-center mb-6">
        <DialogTitle className="text-xl">
          Everything you need to succeed
        </DialogTitle>
        <DialogDescription>
          Powerful tools to help you build and grow your online store
        </DialogDescription>
      </DialogHeader>

      <div className="grid grid-cols-2 gap-3 flex-1">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div
      className={cn(
        "p-4 rounded-xl border bg-card transition-all hover:shadow-md",
        "animate-in fade-in slide-in-from-bottom-2"
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div
        className="h-10 w-10 rounded-lg flex items-center justify-center mb-3"
        style={{
          backgroundColor: `hsl(var(--${feature.color}) / 0.1)`,
        }}
      >
        <HugeiconsIcon
          icon={feature.icon}
          className="w-5 h-5"
          style={{ color: `hsl(var(--${feature.color}))` }}
        />
      </div>
      <h4 className="font-medium text-sm mb-1">{feature.title}</h4>
      <p className="text-xs text-muted-foreground">{feature.description}</p>
    </div>
  );
}

interface QuickWelcomeProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeName: string;
  message?: string;
}

export function QuickWelcomeModal({
  open,
  onOpenChange,
  storeName,
  message = "Welcome back! Ready to continue building your store?",
}: QuickWelcomeProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <HugeiconsIcon icon={Store01Icon} className="w-6 h-6 text-primary" />
          </div>
          <DialogTitle>{storeName}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-center">
          <Button onClick={() => onOpenChange(false)}>
            Let&apos;s go
            <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4 ml-2" />
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
