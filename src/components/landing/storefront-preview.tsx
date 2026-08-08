"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Package, Smartphone, Monitor, Tablet, Settings2 } from "lucide-react";
import { cn } from "@/shared/utils";

type Notification = {
  id: string;
  title: string;
  amount: string;
  method: string;
  status: string;
  icon: React.ReactNode;
};

const NOTIFICATIONS: Notification[] = [
  { id: "1", title: "New order #IND-1284", amount: "NPR 3,250", method: "Paid via eSewa", status: "Ready to fulfill", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
  { id: "2", title: "Inventory alert", amount: "Himalayan Roast", method: "Only 12 remaining", status: "Reorder soon", icon: <Package className="w-4 h-4 text-amber-400" /> },
  { id: "3", title: "New order #IND-1285", amount: "NPR 12,400", method: "Paid via Khalti", status: "Ready to fulfill", icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" /> },
];

export function StorefrontPreview() {
  const [activeNotif, setActiveNotif] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveNotif((prev) => (prev + 1) % NOTIFICATIONS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative w-full overflow-hidden bg-[var(--lv2-surface-1)] rounded-xl border border-[var(--lv2-border)] shadow-2xl flex flex-col font-sans text-sm" style={{ height: 480 }}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--lv2-border)] bg-[var(--lv2-surface-2)]">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--lv2-border-strong)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--lv2-border-strong)]" />
            <div className="w-2.5 h-2.5 rounded-full bg-[var(--lv2-border-strong)]" />
          </div>
          <span className="text-[var(--lv2-faint)] text-xs font-mono ml-2">editor.indigo.com/storefront</span>
        </div>
        <div className="flex items-center gap-1 bg-[var(--lv2-line-soft)] rounded-md p-1 border border-[var(--lv2-border)]">
          <button className="p-1.5 rounded bg-[var(--lv2-border-strong)] text-[var(--lv2-fg)] shadow-sm" aria-label="Desktop"><Monitor className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded text-[var(--lv2-faint)] hover:text-[var(--lv2-fg)] transition-colors" aria-label="Tablet"><Tablet className="w-3.5 h-3.5" /></button>
          <button className="p-1.5 rounded text-[var(--lv2-faint)] hover:text-[var(--lv2-fg)] transition-colors" aria-label="Mobile"><Smartphone className="w-3.5 h-3.5" /></button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[var(--lv2-faint)] text-xs">Autosaved</span>
          <button className="bg-[var(--lv2-accent)] text-[var(--lv2-accent-ink)] text-xs font-medium px-3 py-1.5 rounded-md hover:bg-[var(--lv2-accent-hover)] transition-colors">Publish</button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* Left Sidebar - Layers/Sections */}
        <div className="w-64 border-r border-[var(--lv2-border)] bg-[var(--lv2-surface-2)] flex flex-col">
          <div className="p-3 border-b border-[var(--lv2-border)] text-xs font-medium text-[var(--lv2-muted)] uppercase tracking-wider flex items-center justify-between">
            <span>Sections</span>
            <Settings2 className="w-3.5 h-3.5 text-[var(--lv2-muted)]" />
          </div>
          <div className="flex-1 p-2 space-y-1 overflow-y-auto">
            {["Header", "Hero Image", "Featured Products", "Collection Grid", "Testimonials", "Footer"].map((item, i) => (
              <div key={item} className={cn("px-3 py-2 rounded-md text-xs cursor-default flex items-center gap-2", i === 2 ? "bg-[var(--lv2-accent-soft)] text-[var(--lv2-highlight)] font-medium" : "text-[var(--lv2-muted)] hover:bg-[var(--lv2-line-soft)]")}>
                <div className={cn("w-1.5 h-1.5 rounded-full", i === 2 ? "bg-[var(--lv2-highlight)]" : "bg-[var(--lv2-border-strong)]")} />
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 bg-[var(--lv2-bg)] relative overflow-hidden flex flex-col items-center p-6">
          <div className="w-full max-w-2xl bg-white rounded-t-md shadow-2xl flex-1 border-t border-x border-[var(--lv2-border)] overflow-hidden flex flex-col relative">
            {/* Mock Storefront */}
            <div className="p-4 border-b border-black/5 flex justify-between items-center text-black">
              <div className="font-bold tracking-tight">KATHMANDU APPAREL</div>
              <div className="flex gap-4 text-xs font-medium text-black/60">
                <span>Shop</span>
                <span>Collections</span>
                <span>About</span>
              </div>
            </div>
            
            <div className="flex-1 bg-zinc-50 p-6 flex flex-col gap-6">
              <div className="w-full h-32 bg-zinc-200 rounded-md animate-pulse" />
              <div className="flex justify-between items-center">
                <h2 className="text-black font-bold">Featured</h2>
                <span className="text-xs text-black/50">View all</span>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex flex-col gap-2">
                    <div className="w-full aspect-[4/5] bg-zinc-200 rounded-sm" />
                    <div className="w-2/3 h-3 bg-zinc-200 rounded-full" />
                    <div className="w-1/3 h-3 bg-zinc-300 rounded-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Selection Overlay */}
            <div className="absolute top-[208px] left-6 right-6 h-[220px] border-2 border-[var(--lv2-accent)] rounded-md pointer-events-none">
              <div className="absolute -top-3 -right-3 bg-[var(--lv2-accent)] text-white text-[10px] font-mono px-1.5 py-0.5 rounded shadow-sm">Product Grid</div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-64 border-l border-[var(--lv2-border)] bg-[var(--lv2-surface-2)] flex flex-col">
          <div className="p-3 border-b border-[var(--lv2-border)] text-xs font-medium text-[var(--lv2-muted)] uppercase tracking-wider">
            Properties
          </div>
          <div className="p-4 flex flex-col gap-5 text-xs text-[var(--lv2-muted)]">
            <div className="flex flex-col gap-2">
              <label>Data Source</label>
              <div className="bg-[var(--lv2-surface-3)] border border-[var(--lv2-border)] rounded p-2 flex justify-between items-center cursor-default">
                <span>Summer Collection</span>
                <span className="text-[var(--lv2-faint)]">▼</span>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label>Layout</label>
              <div className="grid grid-cols-3 gap-1">
                <div className="bg-[var(--lv2-surface-3)] border border-[var(--lv2-border)] rounded h-8 flex items-center justify-center">2</div>
                <div className="bg-[var(--lv2-accent-soft)] border border-[var(--lv2-accent)] text-[var(--lv2-highlight)] rounded h-8 flex items-center justify-center">3</div>
                <div className="bg-[var(--lv2-surface-3)] border border-[var(--lv2-border)] rounded h-8 flex items-center justify-center">4</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <label>Image Aspect Ratio</label>
              <div className="bg-[var(--lv2-surface-3)] border border-[var(--lv2-border)] rounded p-2 flex justify-between items-center cursor-default">
                <span>Portrait (4:5)</span>
                <span className="text-[var(--lv2-faint)]">▼</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Commerce Signals */}
      <div className="absolute bottom-6 right-[270px] flex flex-col gap-2 z-10 w-64 pointer-events-none">
        <AnimatePresence mode="popLayout">
          <motion.div
            key={activeNotif}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[var(--lv2-panel)] border border-[var(--lv2-border)] rounded-lg p-3 shadow-2xl flex flex-col gap-1.5 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--lv2-line-soft)] to-transparent opacity-50" />
            <div className="flex items-center gap-2 relative z-10">
              {NOTIFICATIONS[activeNotif].icon}
              <span className="font-semibold text-[var(--lv2-fg)] text-xs">{NOTIFICATIONS[activeNotif].title}</span>
            </div>
            <div className="flex justify-between items-end relative z-10 mt-1">
              <div className="flex flex-col">
                <span className="text-[var(--lv2-faint)] text-[10px] font-mono">{NOTIFICATIONS[activeNotif].method}</span>
                <span className="text-[var(--lv2-muted)] text-xs">{NOTIFICATIONS[activeNotif].status}</span>
              </div>
              <span className="text-[var(--lv2-fg)] font-mono font-medium text-sm">{NOTIFICATIONS[activeNotif].amount}</span>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
