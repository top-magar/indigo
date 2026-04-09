export interface TimelineActor {
  id?: string;
  name: string;
  email?: string;
  avatar?: string;
  type: "user" | "system" | "app";
}

export interface TimelineEventData {
  id: string;
  type: string;
  message?: string;
  date: Date | string;
  actor?: TimelineActor;
  metadata?: Record<string, unknown>;
}

export type DateGroupKey = 
  | "TODAY" 
  | "YESTERDAY" 
  | "LAST_7_DAYS" 
  | "LAST_30_DAYS" 
  | "OLDER";
