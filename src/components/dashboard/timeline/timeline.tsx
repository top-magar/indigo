"use client";

import { useState, type ReactNode, type PropsWithChildren } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  MessageSquare,
  CheckCircle,
  Clock,
  User,
  Settings,
  Send,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/shared/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { groupEventsByDate, formatEventTime, type DateGroup } from "./utils";
import type { TimelineEventData, TimelineActor, DateGroupKey } from "./types";

// ============================================================================
// Timeline Container
// ============================================================================

interface TimelineProps extends PropsWithChildren {
  className?: string;
}

export function Timeline({ children, className }: TimelineProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
    </div>
  );
}

// ============================================================================
// Timeline Add Note
// ============================================================================

interface TimelineAddNoteProps {
  disabled?: boolean;
  message: string;
  placeholder?: string;
  buttonLabel?: ReactNode;
  label?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  reset: () => void;
}

export function TimelineAddNote({
  disabled,
  message,
  placeholder = "Leave your note here...",
  buttonLabel = "Send",
  label,
  onChange,
  onSubmit,
  reset,
}: TimelineAddNoteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const isMessageEmpty = message.trim().length === 0;
  const canSubmit = !disabled && !isMessageEmpty;

  const handleSubmit = () => {
    if (canSubmit) {
      reset();
      onSubmit();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="mb-6">
      <div className="relative">
        <Textarea
          disabled={disabled}
          placeholder={placeholder}
          onChange={onChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          value={message}
          name="message"
          rows={3}
          className="resize-none pr-20"
        />
        {isFocused && (
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">⌘</kbd>
            <span className="mx-0.5">+</span>
            <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px]">↵</kbd>
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2">
        <Button
          disabled={!canSubmit}
          onClick={handleSubmit}
          variant="secondary"
          size="sm"
          className="gap-2"
        >
          <Send className="w-4 h-4" />
          {buttonLabel}
        </Button>
      </div>
    </div>
  );
}

// ============================================================================
// Timeline Event
// ============================================================================

interface TimelineEventProps {
  title: ReactNode;
  date: Date | string;
  actor?: TimelineActor;
  icon?: LucideIcon;
  iconColor?: string;
  isLastInGroup?: boolean;
  children?: ReactNode;
}

export function TimelineEvent({
  title,
  date,
  actor,
  icon: Icon = Clock,
  iconColor = "text-muted-foreground",
  isLastInGroup = false,
  children,
}: TimelineEventProps) {
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline line */}
      {!isLastInGroup && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
      )}

      {/* Icon */}
      <div
        className={cn(
          "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border",
          iconColor
        )}
      >
        <Icon className="w-4 h-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{title}</p>
            {actor && (
              <p className="text-xs text-muted-foreground mt-0.5">
                by {actor.name}
              </p>
            )}
          </div>
          <time
            className="text-xs text-muted-foreground shrink-0"
            title={format(dateObj, "PPpp")}
          >
            {formatEventTime(date)}
          </time>
        </div>

        {children && (
          <div className="mt-2 text-sm text-muted-foreground">{children}</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Timeline Note
// ============================================================================

interface TimelineNoteProps {
  id: string;
  message: string;
  date: Date | string;
  actor?: TimelineActor;
  isLastInGroup?: boolean;
  onEdit?: (id: string, message: string) => Promise<void>;
  isEditing?: boolean;
}

export function TimelineNote({
  id,
  message,
  date,
  actor,
  isLastInGroup = false,
  onEdit,
  isEditing = false,
}: TimelineNoteProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editMessage, setEditMessage] = useState(message);
  const [isSaving, setIsSaving] = useState(false);
  const dateObj = typeof date === "string" ? parseISO(date) : date;

  const handleSave = async () => {
    if (!onEdit || editMessage.trim() === message) {
      setIsEditMode(false);
      return;
    }

    setIsSaving(true);
    try {
      await onEdit(id, editMessage);
      setIsEditMode(false);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditMessage(message);
    setIsEditMode(false);
  };

  return (
    <div className="relative flex gap-4 pb-6">
      {/* Timeline line */}
      {!isLastInGroup && (
        <div className="absolute left-[15px] top-8 bottom-0 w-px bg-border" />
      )}

      {/* Avatar */}
      <Avatar className="relative z-10 h-8 w-8 shrink-0">
        {actor?.avatar && <AvatarImage src={actor.avatar} alt={actor.name} />}
        <AvatarFallback className="text-xs">
          {actor?.name?.[0]?.toUpperCase() || "U"}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{actor?.name || "User"}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                Note
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <time
                className="text-xs text-muted-foreground"
                title={format(dateObj, "PPpp")}
              >
                {formatEventTime(date)}
              </time>
              {onEdit && !isEditMode && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setIsEditMode(true)}
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>

          {isEditMode ? (
            <div className="space-y-2">
              <Textarea
                value={editMessage}
                onChange={(e) => setEditMessage(e.target.value)}
                rows={3}
                className="resize-none"
                disabled={isSaving}
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving || editMessage.trim() === message}
                >
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Timeline Date Group Header
// ============================================================================

interface TimelineDateGroupProps {
  label: string;
}

export function TimelineDateGroup({ label }: TimelineDateGroupProps) {
  return (
    <div className="py-3">
      <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

// ============================================================================
// Grouped Timeline (convenience component)
// ============================================================================

interface GroupedTimelineProps<T extends TimelineEventData> {
  events: T[];
  renderEvent: (event: T, isLastInGroup: boolean) => ReactNode;
  addNote?: {
    message: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onSubmit: () => void;
    reset: () => void;
    disabled?: boolean;
  };
  emptyMessage?: string;
}

export function GroupedTimeline<T extends TimelineEventData>({
  events,
  renderEvent,
  addNote,
  emptyMessage = "No events yet",
}: GroupedTimelineProps<T>) {
  const groups = groupEventsByDate(events);

  return (
    <Timeline>
      {addNote && (
        <TimelineAddNote
          message={addNote.message}
          onChange={addNote.onChange}
          onSubmit={addNote.onSubmit}
          reset={addNote.reset}
          disabled={addNote.disabled}
        />
      )}

      {groups.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          {emptyMessage}
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.key}>
            {groups.length > 1 && <TimelineDateGroup label={group.label} />}
            {group.events.map((event, index) =>
              renderEvent(event, index === group.events.length - 1)
            )}
          </div>
        ))
      )}
    </Timeline>
  );
}

Timeline.displayName = "Timeline";
TimelineAddNote.displayName = "TimelineAddNote";
TimelineEvent.displayName = "TimelineEvent";
TimelineNote.displayName = "TimelineNote";
