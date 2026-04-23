// Stub — notification delivery not yet implemented
export async function deliverNotification(..._args: unknown[]) {
  return { delivered: false, results: [] as { success: boolean; channel: string; error?: string; notificationId?: string }[], skippedChannels: [] as string[] };
}
