"use client";

import { useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  ShoppingCart01Icon,
  Alert02Icon,
  Settings02Icon,
  AtIcon,
  Mail01Icon,
  SmartPhone01Icon,
  Loading01Icon,
  CheckmarkCircle02Icon,
  Moon02Icon,
  RefreshIcon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateNotificationPreferences,
  updateQuietHours,
  resetNotificationPreferences,
} from "./actions";
import type {
  NotificationCategory,
  NotificationChannel,
  NotificationFrequency,
  NotificationPreferenceInput,
  UserNotificationPreferences,
} from "@/features/notifications/repositories";

// Category configuration
const CATEGORIES: {
  id: NotificationCategory;
  label: string;
  description: string;
  icon: typeof ShoppingCart01Icon;
}[] = [
  {
    id: "orders",
    label: "Orders",
    description: "New orders, order updates, cancellations, and refunds",
    icon: ShoppingCart01Icon,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Low stock alerts, restock notifications, and inventory updates",
    icon: Alert02Icon,
  },
  {
    id: "system",
    label: "System",
    description: "Platform updates, maintenance notices, and security alerts",
    icon: Settings02Icon,
  },
  {
    id: "mentions",
    label: "Mentions",
    description: "Team mentions, comments, and task assignments",
    icon: AtIcon,
  },
];

// Channel configuration
const CHANNELS: {
  id: NotificationChannel;
  label: string;
  icon: typeof Notification01Icon;
  available: boolean;
}[] = [
  { id: "in_app", label: "In-App", icon: Notification01Icon, available: true },
  { id: "email", label: "Email", icon: Mail01Icon, available: true },
  { id: "push", label: "Push", icon: SmartPhone01Icon, available: false },
];

// Frequency options
const FREQUENCIES: { value: NotificationFrequency; label: string }[] = [
  { value: "realtime", label: "Real-time" },
  { value: "daily", label: "Daily digest" },
  { value: "weekly", label: "Weekly digest" },
];

// Timezone options (common ones)
const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Asia/Kathmandu", label: "Kathmandu (NPT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST)" },
];

interface NotificationsSettingsClientProps {
  initialPreferences: UserNotificationPreferences;
  userRole: "owner" | "admin" | "staff";
}

export function NotificationsSettingsClient({ 
  initialPreferences, 
  userRole 
}: NotificationsSettingsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResetting, setIsResetting] = useState(false);

  // Build preference map from initial data
  const buildPreferenceMap = useCallback(() => {
    const map: Record<string, { enabled: boolean; frequency: NotificationFrequency }> = {};
    
    for (const pref of initialPreferences.preferences) {
      const key = `${pref.category}-${pref.channel}`;
      map[key] = {
        enabled: pref.enabled,
        frequency: (pref.frequency as NotificationFrequency) || "realtime",
      };
    }
    
    // Fill in defaults for any missing combinations
    for (const category of CATEGORIES) {
      for (const channel of CHANNELS) {
        const key = `${category.id}-${channel.id}`;
        if (!map[key]) {
          map[key] = {
            enabled: channel.id !== "push",
            frequency: "realtime",
          };
        }
      }
    }
    
    return map;
  }, [initialPreferences.preferences]);

  const [preferences, setPreferences] = useState(buildPreferenceMap);
  
  // Quiet hours state
  const [quietHours, setQuietHours] = useState({
    enabled: initialPreferences.quietHours?.enabled ?? false,
    startTime: initialPreferences.quietHours?.startTime ?? "22:00",
    endTime: initialPreferences.quietHours?.endTime ?? "08:00",
    timezone: initialPreferences.quietHours?.timezone ?? "UTC",
  });

  const getPreference = (category: NotificationCategory, channel: NotificationChannel) => {
    const key = `${category}-${channel}`;
    return preferences[key] || { enabled: false, frequency: "realtime" as NotificationFrequency };
  };

  const updatePreference = (
    category: NotificationCategory,
    channel: NotificationChannel,
    updates: Partial<{ enabled: boolean; frequency: NotificationFrequency }>
  ) => {
    const key = `${category}-${channel}`;
    setPreferences(prev => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }));
  };

  const handleSave = async () => {
    // Build preference inputs from state
    const preferenceInputs: NotificationPreferenceInput[] = [];
    
    for (const category of CATEGORIES) {
      for (const channel of CHANNELS) {
        if (!channel.available) continue;
        
        const pref = getPreference(category.id, channel.id);
        preferenceInputs.push({
          category: category.id,
          channel: channel.id,
          enabled: pref.enabled,
          frequency: pref.frequency,
        });
      }
    }

    startTransition(async () => {
      // Save preferences
      const prefResult = await updateNotificationPreferences(preferenceInputs);
      if (prefResult.error) {
        toast.error(prefResult.error);
        return;
      }

      // Save quiet hours
      const quietResult = await updateQuietHours(quietHours);
      if (quietResult.error) {
        toast.error(quietResult.error);
        return;
      }

      toast.success("Notification preferences saved");
      router.refresh();
    });
  };

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const result = await resetNotificationPreferences();
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Preferences reset to defaults");
        router.refresh();
      }
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notification Preferences</h1>
          <p className="text-muted-foreground">
            Customize how and when you receive notifications
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          disabled={isResetting || isPending}
        >
          {isResetting ? (
            <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <HugeiconsIcon icon={RefreshIcon} className="w-4 h-4 mr-2" />
          )}
          Reset to Defaults
        </Button>
      </div>

      {/* Info Alert */}
      <Alert>
        <HugeiconsIcon icon={InformationCircleIcon} className="h-4 w-4" />
        <AlertTitle>About Notification Preferences</AlertTitle>
        <AlertDescription>
          Configure which notifications you receive and how they&apos;re delivered. 
          In-app notifications appear in the notification center, while email notifications 
          are sent to your registered email address.
        </AlertDescription>
      </Alert>

      {/* Category Cards */}
      {CATEGORIES.map((category) => (
        <Card key={category.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HugeiconsIcon icon={category.icon} className="w-5 h-5" />
              {category.label}
            </CardTitle>
            <CardDescription>{category.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {CHANNELS.map((channel, channelIndex) => {
                const pref = getPreference(category.id, channel.id);
                
                return (
                  <div key={channel.id}>
                    {channelIndex > 0 && <Separator className="my-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HugeiconsIcon 
                          icon={channel.icon} 
                          className={`w-5 h-5 ${!channel.available ? "text-muted-foreground" : ""}`} 
                        />
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <Label className={!channel.available ? "text-muted-foreground" : ""}>
                              {channel.label}
                            </Label>
                            {!channel.available && (
                              <Badge variant="secondary" className="text-xs">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                          {pref.enabled && channel.available && (
                            <div className="flex items-center gap-2">
                              <Select
                                value={pref.frequency}
                                onValueChange={(value: NotificationFrequency) => 
                                  updatePreference(category.id, channel.id, { frequency: value })
                                }
                                disabled={!channel.available}
                              >
                                <SelectTrigger className="h-7 w-[140px] text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {FREQUENCIES.map((freq) => (
                                    <SelectItem key={freq.value} value={freq.value}>
                                      {freq.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </div>
                      <Switch
                        checked={pref.enabled}
                        onCheckedChange={(checked) => 
                          updatePreference(category.id, channel.id, { enabled: checked })
                        }
                        disabled={!channel.available}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HugeiconsIcon icon={Moon02Icon} className="w-5 h-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Pause non-urgent notifications during specific hours
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Quiet Hours</Label>
              <p className="text-sm text-muted-foreground">
                Hold notifications during your quiet hours
              </p>
            </div>
            <Switch
              checked={quietHours.enabled}
              onCheckedChange={(checked) => 
                setQuietHours(prev => ({ ...prev, enabled: checked }))
              }
            />
          </div>

          {quietHours.enabled && (
            <>
              <Separator />
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Select
                    value={quietHours.startTime}
                    onValueChange={(value) => 
                      setQuietHours(prev => ({ ...prev, startTime: value }))
                    }
                  >
                    <SelectTrigger id="startTime">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Select
                    value={quietHours.endTime}
                    onValueChange={(value) => 
                      setQuietHours(prev => ({ ...prev, endTime: value }))
                    }
                  >
                    <SelectTrigger id="endTime">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => {
                        const hour = i.toString().padStart(2, "0");
                        return (
                          <SelectItem key={hour} value={`${hour}:00`}>
                            {`${hour}:00`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={quietHours.timezone}
                    onValueChange={(value) => 
                      setQuietHours(prev => ({ ...prev, timezone: value }))
                    }
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Notifications will be held from {quietHours.startTime} to {quietHours.endTime} ({quietHours.timezone})
              </p>
            </>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <>
              <HugeiconsIcon icon={Loading01Icon} className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4 mr-2" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
