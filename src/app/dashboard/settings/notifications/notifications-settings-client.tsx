"use client";
import { useSaveShortcut } from "@/hooks/use-save-shortcut";
import { useUnsavedChanges, useFormDirty } from "@/hooks/use-unsaved-changes";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Bell, ShoppingCart, AlertCircle, Settings, AtSign, Mail, Loader2, CheckCircle, Moon, Smartphone, Volume2, VolumeX } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateNotificationPreferences, updateQuietHours } from "./actions";
import type { NotificationCategory, NotificationChannel, NotificationFrequency, NotificationPreferenceInput, UserNotificationPreferences } from "@/features/notifications/repositories";

const CATEGORIES: { id: NotificationCategory; label: string; desc: string; icon: LucideIcon; color: string }[] = [
  { id: "orders", label: "Orders", desc: "New orders, status updates, cancellations", icon: ShoppingCart, color: "text-blue-500" },
  { id: "inventory", label: "Inventory", desc: "Low stock alerts and restock reminders", icon: AlertCircle, color: "text-amber-500" },
  { id: "system", label: "System", desc: "Platform updates, security, and maintenance", icon: Settings, color: "text-muted-foreground" },
  { id: "mentions", label: "Mentions", desc: "When someone mentions you or assigns a task", icon: AtSign, color: "text-violet-500" },
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

  const toggleAll = (enabled: boolean) => {
    const map: Record<string, boolean> = {};
    for (const c of CATEGORIES) for (const ch of CHANNELS) map[`${c.id}-${ch.id}`] = enabled;
    setPrefs(map);
  };

  const { isDirty: prefsDirty } = useFormDirty(prefs, buildMap());
  const { isDirty: quietDirty } = useFormDirty(quietHours, {
    enabled: initialPreferences.quietHours?.enabled ?? false,
    startTime: initialPreferences.quietHours?.startTime ?? "22:00",
    endTime: initialPreferences.quietHours?.endTime ?? "08:00",
    timezone: initialPreferences.quietHours?.timezone ?? "Asia/Kathmandu",
  });
  const isDirty = prefsDirty || quietDirty;
  useUnsavedChanges(isDirty);

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
  const totalCount = CATEGORIES.length * CHANNELS.length;
  const allEnabled = enabledCount === totalCount;
  const noneEnabled = enabledCount === 0;

  useSaveShortcut(handleSave);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Notifications</h1>
          <p className="text-xs text-muted-foreground">
            {enabledCount} of {totalCount} enabled
            {quietHours.enabled && <> · Quiet hours active</>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDirty && <span className="text-[10px] text-muted-foreground">Unsaved changes</span>}
          <Button onClick={handleSave} disabled={isPending || !isDirty} size="sm">
            {isPending ? <Loader2 className="size-3.5 animate-spin" /> : <CheckCircle className="size-3.5" />}
            {isPending ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => toggleAll(true)} disabled={allEnabled} className="text-xs">
          <Volume2 className="size-3.5" /> Enable All
        </Button>
        <Button variant="outline" size="sm" onClick={() => toggleAll(false)} disabled={noneEnabled} className="text-xs">
          <VolumeX className="size-3.5" /> Mute All
        </Button>
      </div>

      {/* Notification Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-sm font-medium flex-1">Channels</h2>
          {CHANNELS.map(ch => (
            <div key={ch.id} className="w-16 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-muted-foreground">
                <ch.icon className="size-3.5" />
                {ch.label}
              </div>
            </div>
          ))}
        </div>
        <div className="rounded-lg border divide-y">
          {CATEGORIES.map(cat => {
            const catEnabled = CHANNELS.some(ch => prefs[`${cat.id}-${ch.id}`]);
            return (
              <div key={cat.id} className="flex items-center gap-3 p-4">
                <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                  <cat.icon className={`size-4 ${cat.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{cat.label}</p>
                    {!catEnabled && <span className="text-[10px] text-muted-foreground/50">Muted</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">{cat.desc}</p>
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
            );
          })}
        </div>
      </div>

      {/* Quiet Hours */}
      <div>
        <h2 className="text-sm font-medium mb-3">Quiet Hours</h2>
        <div className="rounded-lg border divide-y">
          <div className="p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Moon className="size-4 text-muted-foreground" />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-medium">Pause Notifications</p>
                <p className="text-xs text-muted-foreground">
                  {quietHours.enabled
                    ? `${quietHours.startTime} – ${quietHours.endTime} (${quietHours.timezone.split("/").pop()})`
                    : "Hold non-urgent notifications during specific hours"}
                </p>
              </div>
            </div>
            <Switch checked={quietHours.enabled} onCheckedChange={v => setQuietHours(p => ({ ...p, enabled: v }))} />
          </div>
          {quietHours.enabled && (
            <div className="p-4 flex flex-wrap items-center gap-3">
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

      {/* Mobile Push (future) */}
      <div>
        <h2 className="text-sm font-medium mb-3">Mobile</h2>
        <div className="rounded-lg border p-4 flex items-center gap-3">
          <div className="size-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <Smartphone className="size-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium">Push Notifications</p>
            <p className="text-xs text-muted-foreground">Get notified on your phone when orders come in</p>
          </div>
          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">Coming soon</span>
        </div>
      </div>
    </div>
  );
}
