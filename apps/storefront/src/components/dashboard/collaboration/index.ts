/**
 * Collaboration Components
 * Real-time collaboration features for the dashboard
 */

// Presence Indicator
export {
  PresenceIndicator,
  PresenceAvatar,
  PresenceList,
  TypingIndicator,
} from "./presence-indicator";
export type {
  PresenceIndicatorProps,
  PresenceAvatarProps,
  PresenceListProps,
  TypingIndicatorProps,
} from "./presence-indicator";

// Live Cursors
export {
  LiveCursors,
  Cursor,
  LiveCursorsProvider,
  useCursorTracking,
} from "./live-cursors";
export type {
  LiveCursorsProps,
  CursorProps,
  LiveCursorsProviderProps,
  UseCursorTrackingOptions,
} from "./live-cursors";
