"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, ShoppingCart, AlertCircle, Settings, AtSign, Mail, Loader2, CheckCircle, Moon } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateNotificationPreferences, updateQuietHours } from "./actions";
import type { NotificationCategory, NotificationChannel, NotificationFrequency, NotificationPreferenceInput, UserNotificationPreferences } from "@/features/notifications/repositories";

const CATEGORIES: { id: NotificationCategory; label: string; desc: string; icon: LucideIcon }[] = [
  { id: "orders", label: "Orders", desc: "New orders, updates, cancellations", icon: ShoppingCart },
  { id: "inventory", label: "Inventory", desc: "Low stock and restock alerts", icon: AlertCircle },
  { id: "system", label: "System", desc: "Platform updates and security", icon: Settings },
  { id: "mentions", label: "Mentions", desc: "Comments and task assignments", icon: AtSign },
];

const CHANNELS: { id: NotificationChannel; label: string; icon: LucideIcon }[] = [
  { id: "in_app", label: "In-App", icon: Bell },
  { id: "email", label: "Email", icon: Mail },
];

export function NotificationsSettingsClient({ initialPreferences, userRole }: {
  initialPreferences: UserNotificationPreferences; userRole: "owner" | "admin" | "staff";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const buildMap = useCallback(() => {
    const map: Record<string, boolean> = {};
    for (const p of initialPreferences.preferences) map[`${p.category}-${p.channel}`] = p.enabled;
    for (const c of CATEGORIES) for (const ch of CHANNELS) {
      const k = `${c.id}-${ch.id}`;
      if (!(k in map)) map[k] = true;
    }
    return map;
  }, [initialPreferences.preferences]);

  const [prefs, setPrefs] = useState(buildMap);
  const [quietHours, setQuietHours] = useState({
    enabled: initialPreferences.quietHours?.enabled ?? false,
    startTime: initialPreferences.quietHours?.startTime ?? "22:00",
    endTime: initialPreferences.quietHours?.endTime ?? "08:00",
    timezone: initialPreferences.quietHours?.timezone ?? "Asia/Kathmandu",
  });

  const toggle = (cat: NotificationCategory, ch: NotificationChannel) =>
    setPrefs(p => ({ ...p, [`${cat}-${ch}`]: !p[`${cat}-${ch}`] }));

  const handleSave = () => startTransition(async () => {
    const inputs: NotificationPreferenceInput[] = [];
    for (const c of CATEGORIES) for (const ch of CHANNELS) {
      inputs.push({ category: c.id, channel: ch.id, enabled: prefs[`${c.id}-${ch.id}`] ?? true, frequency: "realtime" as NotificationFrequency });
    }
    const [prefRes, quietRes] = await Promise.all([
      updateNotificationPreferences(inputs),
      updateQuietHours(quietHours),
    ]);
    const err = prefRes.error || quietRes.error;
    if (err) { toast.error(err); return; }
    toast.success("Notification preferences saved");
    router.refresh();
  });

  const enabledCount = Object.values(prefs).filter(Boolean).length;

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
          <p className="text-xs text-muted-foreground">{enabledCount} of {CATEGORIES.length * CHANNELS.length} notifications enabled</p>
        </div>
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
          {isPending ? "Saving…" : "Save"}
        </Button>
      </div>

      {/* Notification Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-medium flex-1">Channels</h2>
          {CHANNELS.map(ch => (
            <div key={ch.id} className="w-16 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                <ch.icon className="size-3" />
                {ch.label}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border divide-y">
          {CATEGORIES.map(cat => (
            <div key={cat.id} className="flex items-center gap-3 p-4">
              <cat.icon className="size-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{cat.label}</p>
                <p className="text-[11px] text-muted-foreground">{cat.desc}</p>
              </div>
              {CHANNELS.map(ch => (
                <div key={ch.id} className="w-16 flex justify-center shrink-0">
                  <Switch
                    checked={prefs[`${cat.id}-${ch.id}`] ?? true}
                    onCheckedChange={() => toggle(cat.id, ch.id)}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h2 className="text-sm font-medium mb-3">Quiet Hours</h2>
        <div className="rounded-lg border divide-y">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Moon className="size-4 text-muted-foreground" />
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Pause Notifications</p>
                <p className="text-[11px] text-muted-foreground">
                  {quietHours.enabled
                    ? `${quietHours.startTime} – ${quietHours.endTime} (${quietHours.timezone.split("/").pop()})`
                    : "Hold non-urgent notifications during specific hours"}
                </p>
              </div>
            </div>
            <Switch checked={quietHours.enabled} onCheckedChange={v => setQuietHours(p => ({ ...p, enabled: v }))} />
          </div>
          {quietHours.enabled && (
            <div className="p-4 flex items-center gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">From</Label>
                <Select value={quietHours.startTime} onValueChange={v => setQuietHours(p => ({ ...p, startTime: v }))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 24 }, (_, i) => { const h = `${String(i).padStart(2, "0")}:00`; return <SelectItem key={h} value={h}>{h}</SelectItem>; })}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">To</Label>
                <Select value={quietHours.endTime} onValueChange={v => setQuietHours(p => ({ ...p, endTime: v }))}>
                  <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                  <SelectContent>{Array.from({ length: 24 }, (_, i) => { const h = `${String(i).padStart(2, "0")}:00`; return <SelectItem key={h} value={h}>{h}</SelectItem>; })}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Timezone</Label>
                <Select value={quietHours.timezone} onValueChange={v => setQuietHours(p => ({ ...p, timezone: v }))}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {[["Asia/Kathmandu", "Kathmandu (NPT)"], ["Asia/Kolkata", "India (IST)"], ["UTC", "UTC"], ["America/New_York", "Eastern (ET)"], ["Europe/London", "London (GMT)"]].map(([v, l]) => (
                      <SelectItem key={v} value={v}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
