import type { Meta, StoryObj } from "@storybook/nextjs";
import { useState, useEffect } from "react";
import {
  OfflineIndicator,
  OfflineIndicatorCompact,
  SyncStatus,
  OfflineBanner,
  OfflineBannerCompact,
  ReconnectedBanner,
  OfflineFallback,
  StaleDataWarning,
  CachedDataBadge,
} from "./index";
import { useSyncQueueStore } from "@/shared/hooks/use-sync-queue";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const meta: Meta = {
  title: "Dashboard/Offline Support",
  parameters: {
    layout: "centered",
  },
};

export default meta;


// Helper to add mock sync operations
function MockSyncControls() {
  const addOperation = useSyncQueueStore((s) => s.addOperation);
  const clearAll = useSyncQueueStore((s) => s.clearAll);
  const items = useSyncQueueStore((s) => s.items);

  const addMockOperation = () => {
    const types = ["create", "update", "delete"] as const;
    const entities = ["product", "order", "customer"] as const;
    const names = ["Blue T-Shirt", "Order #1234", "John Doe", "Red Sneakers", "Order #5678"];
    
    addOperation({
      type: types[Math.floor(Math.random() * types.length)],
      entityType: entities[Math.floor(Math.random() * entities.length)],
      entityId: `${Date.now()}`,
      entityName: names[Math.floor(Math.random() * names.length)],
      payload: { updated: true },
    });
  };

  return (
    <div className="flex items-center gap-2 mb-4">
      <Button size="sm" onClick={addMockOperation}>
        Add Mock Operation
      </Button>
      <Button size="sm" variant="outline" onClick={clearAll}>
        Clear All ({items.length})
      </Button>
    </div>
  );
}


// Offline Indicator Stories
export const OfflineIndicatorDefault: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <MockSyncControls />
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <span className="text-sm text-muted-foreground">Header indicator:</span>
        <OfflineIndicator />
      </div>
      <p className="text-xs text-muted-foreground">
        Click the indicator to see sync details. Add mock operations to see the badge.
      </p>
    </div>
  ),
};

export const OfflineIndicatorCompactStory: StoryObj = {
  name: "Offline Indicator (Compact)",
  render: () => (
    <div className="space-y-4">
      <MockSyncControls />
      <div className="flex items-center gap-4">
        <OfflineIndicatorCompact />
      </div>
    </div>
  ),
};


// Sync Status Stories
export const SyncStatusPanel: StoryObj = {
  render: () => (
    <div className="space-y-4">
      <MockSyncControls />
      <Card className="w-[340px]">
        <SyncStatus />
      </Card>
    </div>
  ),
};

// Offline Banner Stories
export const OfflineBannerDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl space-y-4">
      <MockSyncControls />
      <div className="border rounded-lg overflow-hidden">
        <OfflineBanner />
        <div className="p-8 text-center text-muted-foreground">
          Page content would appear here
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Note: Banner only shows when offline. In Storybook, it may not appear if you&apos;re online.
      </p>
    </div>
  ),
};

export const OfflineBannerCompactStory: StoryObj = {
  name: "Offline Banner (Compact)",
  render: () => (
    <div className="space-y-4">
      <OfflineBannerCompact />
    </div>
  ),
};


// Offline Fallback Stories
export const OfflineFallbackDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg border rounded-lg">
      <OfflineFallback
        title="You're offline"
        description="This page requires an internet connection to load fresh data."
        cachedAt={new Date(Date.now() - 1000 * 60 * 30)} // 30 minutes ago
      />
    </div>
  ),
};

export const OfflineFallbackCustom: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg border rounded-lg">
      <OfflineFallback
        title="Unable to load orders"
        description="We couldn't fetch the latest orders. You can view cached data or try again when online."
        cachedAt={new Date(Date.now() - 1000 * 60 * 60 * 2)} // 2 hours ago
        retryLabel="Refresh orders"
        onRetry={() => alert("Retrying...")}
      />
    </div>
  ),
};


// Stale Data Warning Stories
export const StaleDataWarningDefault: StoryObj = {
  render: () => (
    <div className="w-full max-w-lg space-y-4">
      <StaleDataWarning
        cachedAt={new Date(Date.now() - 1000 * 60 * 15)} // 15 minutes ago
        onRefresh={() => alert("Refreshing...")}
      />
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Products</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Product list would appear here...
          </p>
        </CardContent>
      </Card>
    </div>
  ),
};

// Cached Data Badge Stories
export const CachedDataBadgeDefault: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <CachedDataBadge />
      <CachedDataBadge cachedAt={new Date(Date.now() - 1000 * 60 * 5)} />
      <CachedDataBadge cachedAt={new Date(Date.now() - 1000 * 60 * 60 * 3)} />
    </div>
  ),
};


// Combined Demo
export const FullDemo: StoryObj = {
  render: () => (
    <div className="w-full max-w-2xl space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-lg font-semibold mb-2">Offline Support Demo</h2>
        <p className="text-sm text-muted-foreground">
          Components for handling offline state and sync operations
        </p>
      </div>

      <MockSyncControls />

      <div className="grid gap-6">
        {/* Header with indicator */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Header Indicator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <span className="text-sm font-medium">Dashboard Header</span>
              <div className="flex items-center gap-2">
                <OfflineIndicator />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Banners */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Status Banners</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="border rounded overflow-hidden">
              <div className="flex items-center justify-center gap-3 bg-destructive/10 px-4 py-2.5 border-b border-destructive/20">
                <span className="text-sm text-destructive">
                  Offline banner preview (simulated)
                </span>
              </div>
            </div>
            <div className="border rounded overflow-hidden">
              <div className="flex items-center justify-center gap-3 bg-success/10 px-4 py-2.5 border-b border-success/20">
                <span className="text-sm text-success">
                  Reconnected banner preview (simulated)
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data indicators */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Data Freshness Indicators</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <StaleDataWarning
              cachedAt={new Date(Date.now() - 1000 * 60 * 45)}
              onRefresh={() => {}}
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Badges:</span>
              <CachedDataBadge cachedAt={new Date(Date.now() - 1000 * 60 * 10)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  ),
};
