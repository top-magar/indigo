"use client"

import { track } from "@vercel/analytics"
import type { EditorAnalyticsEvent } from "./contracts"

export function trackEditorEvent(event: EditorAnalyticsEvent) {
  const { name, ...properties } = event
  track(name, properties)
}
