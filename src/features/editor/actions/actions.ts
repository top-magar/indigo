'use server';
export async function saveDraftAction(_data: unknown) { return { success: true }; }
export async function saveThemeAction(_data: unknown) { return { success: true }; }
export async function saveAsTemplateAction(_data: unknown) { return { success: true }; }
export async function listTemplatesAction() { return []; }
export async function getTemplateAction(_id: string) { return null; }
export async function deleteTemplateAction(_id: string) { return { success: true }; }
