"use client";

import * as React from "react";
import { cn } from "@/shared/utils";
import { useRoomUsers } from "@/shared/hooks/use-websocket";
import type { UserPresence, CursorPosition } from "@/infrastructure/services/websocket-server";

// ============================================================================
// Types
// ============================================================================

export interface LiveCursorsProps {
  roomId: string;
  currentUserId?: string;
  containerRef?: React.RefObject<HTMLElement | null>;
  enabled?: boolean;
  className?: string;
  fadeOutDelay?: number;
  showLabels?: boolean;
  labelPosition?: "top" | "bottom" | "right";
}

export interface CursorProps {
  user: UserPresence;
  showLabel?: boolean;
  labelPosition?: "top" | "bottom" | "right";
  isStale?: boolean;
}

// ============================================================================
// Constants
// ============================================================================

const CURSOR_TRANSITION_DURATION = 100;
const STALE_THRESHOLD = 5000;

// ============================================================================
// Cursor SVG Component
// ============================================================================

function CursorSvg({ color }: { color: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-md"
    >
      <path
        d="M5.65376 12.4563L5.65376 12.4563L5.65314 12.4525C5.60874 12.1994 5.66517 11.9393 5.81131 11.7274C5.95744 11.5155 6.18152 11.3686 6.43576 11.3178L6.43576 11.3178L6.44007 11.3169L17.8792 8.84712L17.8792 8.84712L17.8827 8.84634C18.0761 8.80447 18.2779 8.82784 18.4567 8.91282C18.6355 8.9978 18.7808 9.13962 18.8702 9.31626C18.9596 9.4929 18.988 9.69434 18.9511 9.88929C18.9142 10.0842 18.8141 10.2617 18.6657 10.3943L18.6657 10.3943L18.6628 10.3969L10.0628 18.1969L10.0628 18.1969L10.0599 18.1995C9.87627 18.3647 9.63815 18.4572 9.39076 18.4599C9.14337 18.4626 8.90326 18.3753 8.71607 18.2143C8.52888 18.0533 8.40762 17.8302 8.37476 17.5859L8.37476 17.5859L8.37413 17.5813L5.65376 12.4563Z"
        fill={color}
        stroke="white"
        strokeWidth="1.5"
      />
    </svg>
  );
}

// ============================================================================
// Single Cursor Component
// ============================================================================

export function Cursor({
  user,
  showLabel = true,
  labelPosition = "bottom",
  isStale = false,
}: CursorProps) {
  const cursor = user.cursor;

  if (!cursor) return null;

  const labelPositionClasses = {
    top: "-top-6 left-4",
    bottom: "top-5 left-4",
    right: "top-0 left-6",
  };

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-50 transition-all",
        isStale && "opacity-40"
      )}
      style={{
        left: cursor.x,
        top: cursor.y,
        transitionDuration: `${CURSOR_TRANSITION_DURATION}ms`,
        transitionProperty: "left, top, opacity",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <CursorSvg color={user.userColor} />

      {showLabel && (
        <div
          className={cn(
            "absolute whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium text-white shadow-sm",
            labelPositionClasses[labelPosition]
          )}
          style={{ backgroundColor: user.userColor }}
        >
          {user.userName}
          {user.isTyping && (
            <span className="ml-1 inline-flex gap-0.5">
              <span className="h-1 w-1 rounded-full bg-white/70 animate-bounce [animation-delay:-0.3s]" />
              <span className="h-1 w-1 rounded-full bg-white/70 animate-bounce [animation-delay:-0.15s]" />
              <span className="h-1 w-1 rounded-full bg-white/70 animate-bounce" />
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// LiveCursors Component
// ============================================================================

export function LiveCursors({
  roomId,
  currentUserId,
  enabled = true,
  className,
  fadeOutDelay = 3000,
  showLabels = true,
  labelPosition = "bottom",
}: LiveCursorsProps) {
  const allUsers = useRoomUsers(roomId);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled]);

  const usersWithCursors = React.useMemo(() => {
    if (!enabled) return [];

    return allUsers.filter((user) => {
      if (user.userId === currentUserId) return false;
      if (!user.cursor) return false;
      return true;
    });
  }, [allUsers, currentUserId, enabled]);

  const isCursorStale = React.useCallback(
    (user: UserPresence) => {
      const lastSeen = new Date(user.lastSeen).getTime();
      return now - lastSeen > STALE_THRESHOLD;
    },
    [now]
  );

  const visibleCursors = React.useMemo(() => {
    return usersWithCursors.filter((user) => {
      const lastSeen = new Date(user.lastSeen).getTime();
      return now - lastSeen < fadeOutDelay + STALE_THRESHOLD;
    });
  }, [usersWithCursors, now, fadeOutDelay]);

  if (!enabled || visibleCursors.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      {visibleCursors.map((user) => (
        <Cursor
          key={user.userId}
          user={user}
          showLabel={showLabels}
          labelPosition={labelPosition}
          isStale={isCursorStale(user)}
        />
      ))}
    </div>
  );
}

// ============================================================================
// useCursorTracking Hook
// ============================================================================

export interface UseCursorTrackingOptions {
  roomId: string;
  enabled?: boolean;
  throttleMs?: number;
  containerRef?: React.RefObject<HTMLElement | null>;
  onCursorMove: (cursor: CursorPosition) => void;
}

export function useCursorTracking({
  roomId,
  enabled = true,
  throttleMs = 50,
  containerRef,
  onCursorMove,
}: UseCursorTrackingOptions) {
  const lastUpdateRef = React.useRef<number>(0);
  const rafRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    const handleMouseMove = (event: MouseEvent) => {
      const now = Date.now();
      if (now - lastUpdateRef.current < throttleMs) return;

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        let x = event.clientX;
        let y = event.clientY;

        if (containerRef?.current) {
          const rect = containerRef.current.getBoundingClientRect();
          x = event.clientX - rect.left;
          y = event.clientY - rect.top;
        }

        const cursor: CursorPosition = {
          x,
          y,
          scrollTop: window.scrollY,
          scrollLeft: window.scrollX,
        };

        const element = document.elementFromPoint(event.clientX, event.clientY);
        if (element?.id) {
          cursor.elementId = element.id;
        }

        onCursorMove(cursor);
        lastUpdateRef.current = now;
      });
    };

    const target = containerRef?.current || document;
    target.addEventListener("mousemove", handleMouseMove as EventListener);

    return () => {
      target.removeEventListener("mousemove", handleMouseMove as EventListener);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [enabled, throttleMs, containerRef, onCursorMove, roomId]);
}

// ============================================================================
// LiveCursorsProvider Component
// ============================================================================

export interface LiveCursorsProviderProps {
  children: React.ReactNode;
  roomId: string;
  currentUserId: string;
  enabled?: boolean;
  onCursorMove?: (cursor: CursorPosition) => void;
  className?: string;
}

export function LiveCursorsProvider({
  children,
  roomId,
  currentUserId,
  enabled = true,
  onCursorMove,
  className,
}: LiveCursorsProviderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useCursorTracking({
    roomId,
    enabled: enabled && !!onCursorMove,
    containerRef,
    onCursorMove: onCursorMove || (() => {}),
  });

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <LiveCursors
        roomId={roomId}
        currentUserId={currentUserId}
        containerRef={containerRef}
        enabled={enabled}
      />
      {children}
    </div>
  );
}

export default LiveCursors;
