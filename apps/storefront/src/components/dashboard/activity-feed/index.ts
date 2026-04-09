/**
 * Activity Feed Components
 * Real-time activity stream with @mentions support
 */

// Main components
export { ActivityFeed, ActivityFeedSkeleton, ActivityFeedError, ActivityFeedEmpty } from "./activity-feed";
export type { ActivityFeedProps } from "./activity-feed";

export { ActivityItem, getActivityConfig, activityConfig } from "./activity-item";
export type { ActivityItemProps } from "./activity-item";

export { ActivityFilters, CATEGORY_OPTIONS, hasActiveFilters } from "./activity-filters";
export type { ActivityFiltersProps } from "./activity-filters";

// Types
export {
  ActivityType,
  type Activity,
  type ActivityActor,
  type ActivityTarget,
  type ActivityMention,
  type ActivityFilter,
  type ActivityCategory,
  type ActivityDateGroup,
  type GroupedActivities,
  type TeamMember,
  type ActivityTypeConfig,
  type ActivityFeedState,
  type ActivityFeedActions,
  type ActivityFeedStore,
  type UseActivityFeedReturn,
} from "./activity-types";
