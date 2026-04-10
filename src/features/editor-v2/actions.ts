"use server"

import type { Section } from "./store"

export async function saveSectionsAction(
  tenantId: string,
  pageId: string,
  sections: Section[],
): Promise<void> {
  // TODO: persist sections to database
  console.log("Saving sections", { tenantId, pageId, count: sections.length })
}
