'use client';

import React from "react";
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Wallet,
  Smartphone,
  Globe,
  Zap,
  Truck,
  BarChart3,
  ShieldCheck
} from "lucide-react";

export const Features = () => {
  return (
    <section id="features" className="py-24 bg-background relative overflow-hidden scroll-mt-28">
      {/* Background Gradients */}
      <div className="absolute inset-0 h-full w-full bg-background bg-dot-pattern dark:bg-dot-pattern-dark opacity-[0.2] pointer-events-none" />
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute right-0 bottom-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
            Powering Nepal's <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Digital Economy</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            We've built Pasaal with the specific needs of Nepali businesses in mind. Local payments, local logistics, world-class technology.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={item.className}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon: Icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ElementType;
}) => {
  return (
    <div
      className={cn(
        "row-span-1 rounded-3xl group/bento hover:shadow-2xl hover:shadow-primary/5 transition duration-300 shadow-sm p-6 bg-card border border-border justify-between flex flex-col space-y-4",
        className
      )}
    >
      <div className="flex-1 w-full min-h-[10rem] rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 overflow-hidden relative group-hover/bento:border-primary/20 transition-colors">
        {header}
      </div>
      <div className="group-hover/bento:translate-x-2 transition duration-200">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
            {Icon && <Icon className="h-5 w-5" />}
        </div>
        <div className="font-bold text-foreground mb-2 text-lg">
          {title}
        </div>
        <div className="font-normal text-muted-foreground text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};

// --- Custom Visual Components (Skeletons) ---

const SkeletonDashboard = () => (
  <div className="absolute inset-0 p-4 flex flex-col gap-3">
    <div className="h-full w-full bg-background rounded-lg shadow-sm border border-border/50 p-3 overflow-hidden">
        <div className="flex items-center gap-2 mb-3 border-b border-border/50 pb-2">
            <div className="w-2 h-2 rounded-full bg-red-400"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
        </div>
        <div className="space-y-2">
            <div className="h-4 w-2/3 bg-muted rounded animate-pulse"></div>
            <div className="h-20 w-full bg-muted/50 rounded flex items-end justify-between p-2 gap-1">
                <div className="w-full bg-primary/20 h-[40%] rounded-sm"></div>
                <div className="w-full bg-primary/40 h-[70%] rounded-sm"></div>
                <div className="w-full bg-primary/60 h-[50%] rounded-sm"></div>
                <div className="w-full bg-primary h-[80%] rounded-sm"></div>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="h-8 bg-muted/50 rounded"></div>
                <div className="h-8 bg-muted/50 rounded"></div>
            </div>
        </div>
    </div>
    {/* Floating Elements */}
    <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-gradient-to-br from-primary to-blue-600 rounded-full blur-2xl opacity-20"></div>
  </div>
);

const SkeletonPayments = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="relative w-full h-full p-6 flex flex-col items-center justify-center gap-4">
        {/* eSewa Style Card */}
        <div className="absolute top-4 right-8 bg-green-600 w-32 h-20 rounded-lg shadow-lg rotate-6 border border-green-500/50 flex flex-col p-2 z-10 transition-transform group-hover/bento:rotate-12 group-hover/bento:scale-105">
            <div className="w-8 h-8 rounded-full bg-white/20 mb-auto"></div>
            <div className="w-16 h-2 bg-white/20 rounded-full"></div>
        </div>
        {/* Khalti Style Card */}
        <div className="absolute top-8 left-8 bg-purple-700 w-32 h-20 rounded-lg shadow-lg -rotate-6 border border-purple-600/50 flex flex-col p-2 transition-transform group-hover/bento:-rotate-12 group-hover/bento:scale-105">
            <div className="w-8 h-8 rounded-full bg-white/20 mb-auto"></div>
            <div className="w-16 h-2 bg-white/20 rounded-full"></div>
        </div>
    </div>
  </div>
);

const SkeletonLogistics = () => (
  <div className="absolute inset-0 overflow-hidden">
     <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px] dark:opacity-20 opacity-50"></div>
     <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full flex items-center justify-center">
         <div className="relative w-48 h-2 bg-muted rounded-full overflow-hidden">
             <div className="absolute top-0 left-0 h-full w-1/3 bg-primary animate-[shimmer_2s_infinite]"></div>
         </div>
         <div className="absolute left-10 top-1/2 -translate-y-1/2 p-2 bg-background rounded-full border border-border shadow-sm">
             <div className="w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
         </div>
         <div className="absolute right-10 top-1/2 -translate-y-1/2 p-2 bg-background rounded-full border border-border shadow-sm">
             <div className="w-3 h-3 bg-green-500 rounded-full"></div>
         </div>
     </div>
  </div>
);

const SkeletonMobile = () => (
  <div className="absolute inset-0 flex items-end justify-center pt-6 px-6 pb-0">
    <div className="w-32 h-full bg-background border-t-4 border-x-4 border-gray-800 dark:border-gray-700 rounded-t-2xl relative shadow-xl top-2 group-hover/bento:-translate-y-2 transition-transform">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-4 bg-gray-800 dark:bg-gray-700 rounded-b-lg"></div>
        <div className="p-3 mt-4 space-y-2">
            <div className="w-full h-20 bg-muted rounded-lg"></div>
            <div className="w-full h-8 bg-muted/50 rounded-lg"></div>
            <div className="w-full h-8 bg-muted/50 rounded-lg"></div>
        </div>
    </div>
    <div className="absolute right-8 top-12 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-border animate-bounce">
        <span className="text-xs font-bold text-green-500">+12 Orders</span>
    </div>
  </div>
);

const SkeletonGlobal = () => (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-blue-50/50 to-transparent dark:from-blue-900/10">
        <div className="w-32 h-32 rounded-full border border-dashed border-primary/30 flex items-center justify-center relative animate-[spin_10s_linear_infinite]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 w-3 h-3 bg-purple-500 rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
            <div className="absolute left-0 top-1/2 -translate-x-2 -translate-y-1/2 w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
            <div className="w-20 h-20 rounded-full bg-primary/5 border border-primary/20 backdrop-blur-sm"></div>
        </div>
        <Globe className="absolute w-8 h-8 text-primary" />
    </div>
);

const items = [
  {
    title: "Command Center",
    description: "Drag-and-drop widgets to track sales, inventory, and staff performance in real-time.",
    header: <SkeletonDashboard />,
    icon: LayoutDashboard,
    className: "md:col-span-2",
  },
  {
    title: "Instant Payments",
    description: "Direct integration with eSewa, Khalti, and FonePay. No coding required.",
    header: <SkeletonPayments />,
    icon: Wallet,
    className: "md:col-span-1",
  },
  {
    title: "Smart Logistics",
    description: "Automate delivery requests with Pathao and generate shipping labels instantly.",
    header: <SkeletonLogistics />,
    icon: Truck,
    className: "md:col-span-1",
  },
  {
    title: "Mobile First Store",
    description: "Your shop looks perfect on every device. Manage orders from your phone.",
    header: <SkeletonMobile />,
    icon: Smartphone,
    className: "md:col-span-1",
  },
  {
    title: "Global Reach",
    description: "Accept international cards and expand your Pasaal beyond borders.",
    header: <SkeletonGlobal />,
    icon: Globe,
    className: "md:col-span-1",
  },
];
