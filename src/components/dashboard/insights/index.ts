/**
 * AI-Powered Insights Components
 * Barrel export for the insights module
 */

// Components
export { InsightCard, InsightCardCompact } from "./insight-card";
export type { InsightCardProps, InsightCardCompactProps } from "./insight-card";

export {
  InsightsPanel,
  InsightsPanelSkeleton,
  InsightsPanelEmpty,
  InsightsWidget,
} from "./insights-panel";
export type { InsightsPanelProps, InsightsWidgetProps } from "./insights-panel";

// Types
export {
  InsightType,
  INSIGHT_CONFIG,
  PRIORITY_CONFIG,
} from "./insight-types";
export type {
  Insight,
  InsightPriority,
  InsightAction,
  InsightMetric,
  InsightConfig,
  InsightsState,
  InsightsActions,
  InsightsStore,
} from "./insight-types";
